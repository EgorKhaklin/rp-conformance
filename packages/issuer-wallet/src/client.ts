// The issuance client (issuer harness design section 5.1), valid path of the pre-authorized code flow: offer by value
// or by reference, Credential Issuer and Authorization Server metadata (`SCN-M`), token request with client attestation
// and DPoP, nonce, credential request with an `openid4vci-proof+jwt` carrying the KA (`SCN-I`). The libraries parse and
// validate offer and metadata; every message the client sends to the token, nonce and credential endpoints is built
// by a function of its own (`jwts.ts`, `requests.ts`) and passes the hooks before it is signed or sent.
import { createHash, randomBytes } from 'node:crypto';
import { type CallbackContext, setGlobalConfig } from '@openid4vc/oauth2';
import { type CredentialOfferObject, determineAuthorizationServerForCredentialOffer, type IssuerMetadataResult, Openid4vciClient } from '@openid4vc/openid4vci';
import { type EcKeyPair, generateEcKeyPair } from '@rp-conformance/forge';
import { type JwtParts, keySigner, signJwt, type TestWalletProvider, type WalletUnitId, wiaPopParts } from '@rp-conformance/wallet-provider';
import { type HttpExchange, type HttpRequestMessage, type HttpResponseRecord, type IssuanceStep, jsonOf, oauthErrorOf, recordingFetch, type RequestHook, send } from './http';
import { dpopProofParts, keyProofParts } from './jwts';
import { credentialRequest, nonceRequest, PRE_AUTHORIZED_CODE_GRANT, signedMetadataRequest, tokenRequest } from './requests';

/** The JWTs the client signs, by fault point (issuer harness design section 6.2). */
export type JwtPoint = 'wia-pop' | 'dpop' | 'proof';

/** Changes header and payload of a JWT after its valid build and before it is signed. */
export type JwtHook = (point: JwtPoint, parts: JwtParts, context: { step: IssuanceStep }) => JwtParts | Promise<JwtParts>;

/** The seams of the fault layer (issue 18): a hook may return its input unchanged, a changed copy, or a replacement. */
export interface MessageHooks {
  jwt?: JwtHook;
  request?: RequestHook;
}

/** A KA and the private keys of its `attested_keys`, in the same order. */
export interface KeyAttestationWithKeys {
  jwt: string;
  keys: EcKeyPair[];
}

/** What the client needs of a Wallet Unit: its `client_id`, the WIA's `cnf` key, and fresh WIAs and KAs. */
export interface WalletUnitBinding {
  id: string;
  clientId: string;
  /** The WIA's `cnf` key, which signs the PoP. */
  instanceKey: EcKeyPair;
  wia(): Promise<string>;
  keyAttestation(): Promise<KeyAttestationWithKeys>;
}

/** A Wallet Unit of the Test Wallet Provider: a fresh WIA and a fresh KA (with fresh attested keys) per issuance. */
export function walletUnitOf(twp: TestWalletProvider, id: WalletUnitId): WalletUnitBinding {
  const unit = twp.units[id];
  return {
    id,
    clientId: unit.clientId,
    instanceKey: unit.instanceKey,
    wia: () => twp.wia(id),
    keyAttestation: () => twp.keyAttestation(id),
  };
}

/** The offer as the client received it and as it resolved. */
export interface OfferEvidence {
  /** What the client was given: a `openid-credential-offer://` URI or a bare `credential_offer_uri`. */
  input: string;
  byReference: boolean;
  credentialOfferUri?: string;
  offer: CredentialOfferObject;
}

export interface MetadataEvidence {
  result: IssuerMetadataResult;
  /** The answer to `Accept: application/jwt` at the Credential Issuer metadata URL. */
  signed?: HttpResponseRecord;
}

export interface TokenResult {
  accessToken: string;
  tokenType: string;
  response: Record<string, unknown>;
}

/** A credential as received, with the proof key it is bound to and the KA that attests that key. */
export interface IssuedCredential {
  credentialConfigurationId: string;
  format: string;
  credential: string;
  proofKey: EcKeyPair;
  keyAttestation: string;
}

/** Everything one run of `SCN-I` saw and sent. */
export interface IssuanceEvidence {
  walletUnit: string;
  exchanges: HttpExchange[];
  offer?: OfferEvidence;
  metadata?: MetadataEvidence;
  authorizationServer?: string;
  token?: TokenResult;
  cNonce?: string;
  credentials: IssuedCredential[];
  /** Set when the flow stopped before a credential arrived. */
  error?: string;
}

export interface IssuanceClientOptions {
  /** Accept `http` URLs (local runs against EUDIPLO). */
  allowInsecureUrls?: boolean;
  hooks?: MessageHooks;
}

export interface IssueOptions {
  /** The offer: `openid-credential-offer://?credential_offer=…` (by value) or `…?credential_offer_uri=…` (by reference). */
  offer: string;
  txCode?: string;
  /** Default the first of the offer's `credential_configuration_ids`. */
  credentialConfigurationId?: string;
  /** Also fetch the metadata with `Accept: application/jwt` (default true). */
  signedMetadata?: boolean;
}

const OFFER_SCHEME = 'openid-credential-offer://';

const hash: CallbackContext['hash'] = (data, alg) => createHash(alg.replace('-', '').toLowerCase()).update(data).digest();

const notUsed = () => {
  throw new Error('not used by the issuance client');
};

/** An error of the flow, with the exchange that caused it. */
export class IssuanceError extends Error {
  constructor(
    message: string,
    readonly exchange?: HttpExchange,
  ) {
    super(message);
  }
}

/** The URL of the Credential Issuer metadata (OpenID4VCI 1.0 section 12.2.2): well-known segment before the path. */
export function credentialIssuerMetadataUrl(credentialIssuer: string): string {
  const url = new URL(credentialIssuer);
  const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
  return `${url.origin}/.well-known/openid-credential-issuer${path}`;
}

/**
 * The client of one Wallet Unit. It holds the unit's DPoP key for all its issuances (design section 5.1: one DPoP key
 * per Wallet Unit) and the last `DPoP-Nonce` of each server.
 */
export class IssuanceClient {
  private readonly dpopNonces = new Map<string, string>();

  private constructor(
    readonly unit: WalletUnitBinding,
    readonly dpopKey: EcKeyPair,
    private readonly options: IssuanceClientOptions,
  ) {}

  static async create(unit: WalletUnitBinding, options: IssuanceClientOptions = {}): Promise<IssuanceClient> {
    if (options.allowInsecureUrls) setGlobalConfig({ allowInsecureUrls: true });
    return new IssuanceClient(unit, await generateEcKeyPair(), options);
  }

  /** Runs `SCN-I` without mutation: offer, metadata, token, nonce, credential. Never throws; errors land in the evidence. */
  async issue(options: IssueOptions): Promise<IssuanceEvidence> {
    const evidence: IssuanceEvidence = { walletUnit: this.unit.id, exchanges: [], credentials: [] };
    try {
      const offer = await this.resolveOffer(options.offer, evidence);
      const metadata = await this.fetchMetadata(offer.offer.credential_issuer, evidence, { signed: options.signedMetadata ?? true });
      const token = await this.requestToken(offer.offer, metadata.result, evidence, options.txCode);
      const cNonce = await this.requestNonce(metadata.result, evidence);
      const configurationId = options.credentialConfigurationId ?? offer.offer.credential_configuration_ids[0];
      await this.requestCredential(metadata.result, token, configurationId, cNonce, evidence);
    } catch (error) {
      evidence.error = (error as Error).message;
    }
    return evidence;
  }

  private libraryClient(step: () => IssuanceStep, evidence: IssuanceEvidence): Openid4vciClient {
    return new Openid4vciClient({
      callbacks: {
        hash,
        fetch: recordingFetch(step, evidence.exchanges, this.options.hooks?.request),
        generateRandom: (length) => randomBytes(length),
        signJwt: notUsed,
        decryptJwe: notUsed,
        clientAuthentication: notUsed,
      },
    });
  }

  /** Resolves the offer by value or by reference (`SCN-I`), recording the fetch of `credential_offer_uri`. */
  async resolveOffer(input: string, evidence: IssuanceEvidence): Promise<OfferEvidence> {
    const normalised = input.startsWith('http') ? `${OFFER_SCHEME}?credential_offer_uri=${encodeURIComponent(input)}` : input;
    const params = new URL(normalised.replace(/^[^:]+:\/\/[^?]*/, 'https://offer.invalid/')).searchParams;
    const credentialOfferUri = params.get('credential_offer_uri') ?? undefined;
    const offer = await this.libraryClient(() => 'offer', evidence).resolveCredentialOffer(normalised);
    evidence.offer = { input, byReference: credentialOfferUri !== undefined, ...(credentialOfferUri ? { credentialOfferUri } : {}), offer };
    return evidence.offer;
  }

  /**
   * Fetches the Credential Issuer metadata as JSON and the metadata of its Authorization Servers (`SCN-M`) through the
   * library, then the Credential Issuer metadata again with `Accept: application/jwt`.
   */
  async fetchMetadata(credentialIssuer: string, evidence: IssuanceEvidence, options: { signed?: boolean } = {}): Promise<MetadataEvidence> {
    const result = await this.libraryClient(() => 'metadata', evidence).resolveIssuerMetadata(credentialIssuer);
    evidence.metadata = { result };
    if (options.signed !== false) {
      const request = await this.hooked('metadata-jwt', signedMetadataRequest(credentialIssuerMetadataUrl(credentialIssuer)));
      evidence.metadata.signed = await send('metadata-jwt', request, evidence.exchanges);
    }
    return evidence.metadata;
  }

  /** Token request with `pre-authorized_code` and `tx_code`, WIA, PoP and DPoP; one retry on `use_dpop_nonce`. */
  async requestToken(offer: CredentialOfferObject, metadata: IssuerMetadataResult, evidence: IssuanceEvidence, txCode?: string): Promise<TokenResult> {
    const grant = offer.grants?.[PRE_AUTHORIZED_CODE_GRANT];
    if (!grant) throw new IssuanceError('the offer has no pre-authorized code grant');
    const issuer = determineAuthorizationServerForCredentialOffer({
      issuerMetadata: metadata,
      grantAuthorizationServer: grant.authorization_server,
    });
    const as = metadata.authorizationServers.find((server) => server.issuer === issuer);
    if (!as?.token_endpoint) throw new IssuanceError(`authorization server ${issuer} has no token_endpoint`);
    evidence.authorizationServer = issuer;
    const wia = await this.unit.wia();

    const build = async () =>
      tokenRequest({
        tokenEndpoint: as.token_endpoint!,
        preAuthorizedCode: grant['pre-authorized_code'],
        ...(txCode !== undefined ? { txCode } : {}),
        clientId: this.unit.clientId,
        clientAttestation: wia,
        clientAttestationPop: await this.pop(issuer),
        dpop: await this.dpop('token', 'POST', as.token_endpoint!),
      });
    const response = await this.sendWithDpopRetry('token', build, evidence);
    const body = jsonOf(response);
    if (response.status !== 200 || typeof body?.access_token !== 'string') {
      throw new IssuanceError(`token request: HTTP ${response.status} ${response.body}`, evidence.exchanges.at(-1));
    }
    evidence.token = { accessToken: body.access_token, tokenType: typeof body.token_type === 'string' ? body.token_type : 'Bearer', response: body };
    return evidence.token;
  }

  /** Fetches a `c_nonce` from the nonce endpoint. */
  async requestNonce(metadata: IssuerMetadataResult, evidence: IssuanceEvidence): Promise<string> {
    const endpoint = metadata.credentialIssuer.nonce_endpoint;
    if (!endpoint) throw new IssuanceError('the Credential Issuer metadata has no nonce_endpoint');
    const response = await send('nonce', await this.hooked('nonce', nonceRequest(endpoint)), evidence.exchanges);
    this.rememberDpopNonce(endpoint, response);
    const cNonce = jsonOf(response)?.c_nonce;
    if (response.status !== 200 || typeof cNonce !== 'string') throw new IssuanceError(`nonce request: HTTP ${response.status} ${response.body}`, evidence.exchanges.at(-1));
    evidence.cNonce = cNonce;
    return cNonce;
  }

  /**
   * Credential request by `credential_configuration_id`, with one `openid4vci-proof+jwt` signed by the first attested
   * key of a fresh KA and carrying that KA in `key_attestation`; DPoP with `ath`, one retry on `use_dpop_nonce`.
   */
  async requestCredential(
    metadata: IssuerMetadataResult,
    token: TokenResult,
    credentialConfigurationId: string,
    cNonce: string,
    evidence: IssuanceEvidence,
  ): Promise<IssuedCredential[]> {
    const configuration = metadata.credentialIssuer.credential_configurations_supported[credentialConfigurationId];
    if (!configuration) throw new IssuanceError(`the metadata has no credential configuration ${credentialConfigurationId}`);
    if (configuration.format !== 'dc+sd-jwt') throw new IssuanceError(`format ${configuration.format}: the client requests SD-JWT VC (dc+sd-jwt) only`);
    const endpoint = metadata.credentialIssuer.credential_endpoint;
    const ka = await this.unit.keyAttestation();
    const proofKey = ka.keys[0];
    const proof = await this.sign(
      'proof',
      'credential',
      keyProofParts({ key: proofKey, audience: metadata.credentialIssuer.credential_issuer, nonce: cNonce, keyAttestation: ka.jwt, clientId: this.unit.clientId }),
      proofKey,
    );

    const build = async () =>
      credentialRequest({
        credentialEndpoint: endpoint,
        accessToken: token.accessToken,
        tokenType: token.tokenType,
        dpop: await this.dpop('credential', 'POST', endpoint, token.accessToken),
        credentialConfigurationId,
        proofs: [proof],
      });
    const response = await this.sendWithDpopRetry('credential', build, evidence);
    const body = jsonOf(response);
    const credentials = body?.credentials;
    if (response.status !== 200 || !Array.isArray(credentials)) {
      throw new IssuanceError(`credential request: HTTP ${response.status} ${response.body}`, evidence.exchanges.at(-1));
    }
    const issued = credentials.map((entry) => {
      const credential = (entry as { credential?: unknown }).credential;
      if (typeof credential !== 'string') throw new IssuanceError('a credentials entry carries no SD-JWT VC string', evidence.exchanges.at(-1));
      return { credentialConfigurationId, format: configuration.format, credential, proofKey, keyAttestation: ka.jwt };
    });
    evidence.credentials.push(...issued);
    return issued;
  }

  /** The PoP of the unit's WIA for an Authorization Server: `iss` the `client_id`, `aud` its issuer, fresh `jti`. */
  private pop(audience: string) {
    return this.sign('wia-pop', 'token', wiaPopParts({ signer: keySigner(this.unit.instanceKey), clientId: this.unit.clientId, audience }), this.unit.instanceKey);
  }

  /** A DPoP proof with the unit's DPoP key, carrying the last `DPoP-Nonce` of the server, if any. */
  private dpop(step: IssuanceStep, method: string, url: string, accessToken?: string) {
    const nonce = this.dpopNonces.get(new URL(url).origin);
    return this.sign(
      'dpop',
      step,
      dpopProofParts({ key: this.dpopKey, method, url, ...(accessToken !== undefined ? { accessToken } : {}), ...(nonce !== undefined ? { nonce } : {}) }),
      this.dpopKey,
    );
  }

  private async sign(point: JwtPoint, step: IssuanceStep, parts: JwtParts, key: EcKeyPair): Promise<string> {
    const final = this.options.hooks?.jwt ? await this.options.hooks.jwt(point, parts, { step }) : parts;
    return signJwt(final, keySigner(key));
  }

  private async hooked(step: IssuanceStep, request: HttpRequestMessage): Promise<HttpRequestMessage> {
    return this.options.hooks?.request ? this.options.hooks.request(step, request) : request;
  }

  private rememberDpopNonce(url: string, response: HttpResponseRecord) {
    const nonce = response.headers['dpop-nonce'];
    if (nonce) this.dpopNonces.set(new URL(url).origin, nonce);
  }

  /**
   * Sends a request built by `build`; when the server answers `use_dpop_nonce` with a `DPoP-Nonce` (RFC 9449 sections
   * 8 and 9), rebuilds it once (fresh DPoP proof with the nonce, fresh PoP) and sends it again.
   */
  private async sendWithDpopRetry(step: IssuanceStep, build: () => Promise<HttpRequestMessage>, evidence: IssuanceEvidence): Promise<HttpResponseRecord> {
    const first = await this.hooked(step, await build());
    const response = await send(step, first, evidence.exchanges);
    this.rememberDpopNonce(first.url, response);
    if ((response.status === 400 || response.status === 401) && oauthErrorOf(response) === 'use_dpop_nonce' && response.headers['dpop-nonce']) {
      const retry = await this.hooked(step, await build());
      const second = await send(step, retry, evidence.exchanges, 2);
      this.rememberDpopNonce(retry.url, second);
      return second;
    }
    return response;
  }
}
