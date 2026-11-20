import { randomInt } from 'node:crypto';
import {
  AuthorizationEndpointError,
  type CreatedOffer,
  type CreateOfferRequest,
  type EnrolledCertificate,
  type EnrolmentRequest,
  type IssuerAdapter,
  type IssuerTestEnvironment,
  type TestSubject,
} from '@rp-conformance/core';
import { icsList, icsNumber } from './ics';
import { PID_FIELDS, PID_SUBJECTS } from './subjects';

export { durationSeconds, ICS_PATH, icsList, icsNumber, icsProblems, loadIssuerIcs } from './ics';
export { REFERENCE_ENV_PATH, REFERENCE_EUDIPLO, type ReferenceEudiplo } from './reference';
export { PID_FIELDS, PID_SUBJECTS } from './subjects';

/** The ID of the PID credential configuration in SD-JWT VC format, as the Credential Issuer metadata names it. */
export const PID_SD_JWT_CONFIGURATION = 'pid-sd-jwt-vc';
/** `vct` of the PID in SD-JWT VC format (PID Rulebook). */
export const PID_VCT = 'urn:eudi:pid:1';
/**
 * A second configuration in SD-JWT VC of another credential type (`ICS-02.second`), so that a pre-authorized code of an
 * offer for it can be tried against the PID's configuration (`PP_WS_IA_PreAuthorized_004_UF`).
 */
export const SECOND_SD_JWT_CONFIGURATION = 'test-attestation-sd-jwt-vc';
export const SECOND_VCT = 'urn:rp-conformance:test-attestation:1';
/** The built-in authorization server of the tenant: the only one that redeems pre-authorized codes. */
const BUILT_IN_AS = 'issuer-built-in';

/** Shortest status list token lifetime EUDIPLO accepts (`ttl`, `GET/PUT /api/status-list-config`, minimum 60). */
export const STATUS_LIST_TTL_SECONDS = 60;
/** Lifetime of the PID; more than 24 hours, so it is not short-lived (`P-SHORT` No). */
const PID_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

export interface IssuerEudiploAdapterOptions {
  /**
   * Base URL of EUDIPLO as the harness reaches it; default `EUDIPLO_URL`, or `http://127.0.0.1:<EUDIPLO_PORT>` (port 3000
   * by default). Not `localhost`: Docker publishes EUDIPLO on 127.0.0.1 only, and `localhost` may resolve to `::1` first.
   */
  baseUrl?: string;
  /** Root client of EUDIPLO (`AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET`). */
  clientId?: string;
  clientSecret?: string;
  /** Host under which EUDIPLO reaches the harness services; default `HARNESS_HOST`, or `host.docker.internal` (Compose). */
  harnessHost?: string;
}

/**
 * What the reference image has beyond the release 9.1.0, and the adapter uses where the instance under test accepts it,
 * so the same adapter still configures 9.1.0 (without them).
 */
export interface EudiploCapabilities {
  /** `GET /api/key-chain/{id}/csr` (EUDIPLO/eudiplo#1397): enrolment by CSR instead of key import. */
  csr: boolean;
  /** `walletAttestationStatusCheckMode` (EUDIPLO/eudiplo#1340, #1468): `strict` for WIAs and KAs. */
  statusCheckMode: boolean;
  /** `revokeWithWalletUnit` (EUDIPLO/eudiplo#1468): the PID is revoked with its wallet unit (revocation chaining). */
  revokeWithWalletUnit: boolean;
}

/** One entry of `GET /api/session/{id}/credential-status`. */
export interface CredentialStatusEntry {
  credentialConfigurationId: string;
  statusListId: string;
  index: number;
  status: number;
  bits: number;
}

const STATUS_VALUE = { valid: 0, revoked: 1, suspended: 2 } as const;

/** A failed call to EUDIPLO, with the HTTP status and the body it answered. */
export class EudiploError extends Error {
  constructor(
    readonly method: string,
    readonly path: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`EUDIPLO ${method} ${path}: HTTP ${status} ${body}`);
  }

  /** EUDIPLO's schema validation rejected a field it does not know (an older release). */
  get unrecognizedKey(): boolean {
    return this.status === 400 && this.body.includes('unrecognized_keys');
  }
}

/** The key chains of the tenant, by usage. */
interface KeyChains {
  attestation: string;
  statusList?: string;
  access: string;
}

/** Tenant IDs are lowercase letters, digits, '-' and '_', at most 63 characters. */
const tenantIdOf = (namespace: string) => namespace.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 63);

/**
 * Adapter for EUDIPLO as the reference PID Provider (issuer harness design sections 5.4 and 5.5). One tenant per
 * namespace, as the RP adapter does:
 *
 * - `enrol` returns CSRs where the instance offers `GET /api/key-chain/{id}/csr`; EUDIPLO 9.1.0 does not, so it returns
 *   `undefined` and `setUp` imports the keys the Test Registrar generated (`POST /api/key-chain/import`).
 * - `setUp` creates the tenant, its key chains (credential signer, status list signer, access certificate), the status
 *   list settings, the PID configuration in SD-JWT VC and the issuance configuration: wallet attestation required, the
 *   harness's `TL-WP` as the only wallet provider list, key attestations with the ICS levels, DPoP.
 * - `createOffer` seeds the subject with the offer (`credentialClaims` `inline`), pre-authorized code with or without
 *   `tx_code`, or authorization code. EUDIPLO offers by reference only; for an offer by value the adapter resolves the
 *   reference itself.
 * - `authenticateSubject` opens the authorization request at the built-in authorization server, which has no login, and
 *   returns its redirect to the wallet.
 * - `setStatus` calls `POST /api/session/revoke` and confirms with `GET /api/session/{id}/credential-status`.
 * - `refreshTrust` clears EUDIPLO's trust list cache.
 */
export class IssuerEudiploAdapter implements IssuerAdapter {
  readonly name = 'issuer-eudiplo';
  readonly baseUrl: string;
  readonly harnessHost: string;
  private rootToken?: string;
  private token?: string;
  private tenantId?: string;
  private keyChains?: KeyChains;
  private version?: { version?: string; revision?: string };
  private method?: 'csr' | 'generated';
  private capabilities: EudiploCapabilities = { csr: false, statusCheckMode: false, revokeWithWalletUnit: false };

  constructor(private readonly options: IssuerEudiploAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.EUDIPLO_URL ?? `http://127.0.0.1:${process.env.EUDIPLO_PORT ?? 3000}`).replace(/\/$/, '');
    this.harnessHost = options.harnessHost ?? process.env.HARNESS_HOST ?? 'host.docker.internal';
  }

  /** The tenant's Credential Issuer identifier, `{PUBLIC_URL}/issuers/{tenant}`, as the harness reaches it. */
  get credentialIssuer(): string {
    return `${this.baseUrl}/issuers/${this.requireTenant()}`;
  }

  get tenant(): string | undefined {
    return this.tenantId;
  }

  private requireTenant(): string {
    if (!this.tenantId) throw new Error('the EUDIPLO issuer adapter is not set up');
    return this.tenantId;
  }

  private async call<T>(method: string, path: string, body?: unknown, token = this.token): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    if (!response.ok) throw new EudiploError(method, path, response.status, text);
    return (text ? JSON.parse(text) : undefined) as T;
  }

  private async getToken(clientId: string, clientSecret: string): Promise<string> {
    const { access_token } = await this.call<{ access_token: string }>(
      'POST',
      '/api/oauth2/token',
      { grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret },
      undefined,
    );
    return access_token;
  }

  /** Logs in as the root client, reads the version and detects the capabilities beyond 9.1.0. */
  private async connect(): Promise<string> {
    if (this.rootToken) return this.rootToken;
    this.rootToken = await this.getToken(
      this.options.clientId ?? process.env.EUDIPLO_CLIENT_ID ?? 'rp-conformance',
      this.options.clientSecret ?? process.env.EUDIPLO_CLIENT_SECRET ?? 'rp-conformance-secret',
    );
    this.version = await this.call<{ version?: string; revision?: string }>('GET', '/api/version', undefined, this.rootToken).catch(() => ({}));
    // A route EUDIPLO lacks answers 404 "Cannot GET ..." before any guard; a route it has answers 401 without a token.
    const probe = await fetch(`${this.baseUrl}/api/key-chain/00000000-0000-0000-0000-000000000000/csr`);
    const probeBody = await probe.text();
    this.capabilities.csr = !(probe.status === 404 && probeBody.includes('Cannot GET'));
    return this.rootToken;
  }

  /** Creates the tenant of the namespace, replacing one left from an earlier run, and logs in as its client. */
  private async createTenant(namespace: string): Promise<void> {
    const rootToken = await this.connect();
    const id = tenantIdOf(namespace);
    const body = {
      id,
      name: `Issuer conformance ${namespace}`,
      description: 'Created by the issuer conformance harness',
      roles: ['issuance:manage', 'issuance:offer'],
    };
    let tenant: { client: { clientId: string; clientSecret: string } };
    try {
      tenant = await this.call('POST', '/api/tenant', body, rootToken);
    } catch (error) {
      if (!(error instanceof EudiploError) || error.status !== 409) throw error;
      await this.call('DELETE', `/api/tenant/${id}`, undefined, rootToken);
      tenant = await this.call('POST', '/api/tenant', body, rootToken);
    }
    this.tenantId = id;
    this.token = await this.getToken(tenant.client.clientId, tenant.client.clientSecret);
  }

  /**
   * CSRs for the credential signer, the status list signer and the access certificate, where EUDIPLO can create them
   * (after 9.1.0): the tenant and three standalone key chains are created here, and `setUp` stores the certificates the
   * Registrar issued. EUDIPLO 9.1.0 has no CSR endpoint: `undefined`, and the Registrar generates the keys.
   */
  async enrol(namespace?: string): Promise<EnrolmentRequest | undefined> {
    await this.connect();
    if (!this.capabilities.csr) {
      this.method = 'generated';
      return undefined;
    }
    if (!namespace) throw new Error('EUDIPLO creates the keys of a CSR in a tenant: enrol needs the namespace setUp will get');
    await this.createTenant(namespace);
    const create = async (usageType: string, description: string) =>
      (await this.call<{ id: string }>('POST', '/api/key-chain', { usageType, type: 'standalone', description })).id;
    const csrOf = async (id: string) => (await this.call<{ csr: string }>('GET', `/api/key-chain/${id}/csr`)).csr;
    this.keyChains = {
      attestation: await create('attestation', 'PID signer, certified by the Test Registrar under PP-T'),
      statusList: await create('statusList', 'Status list signer, certified by the Test Registrar under PP-T'),
      access: await create('access', 'Access certificate from AC-A'),
    };
    this.method = 'csr';
    return {
      credentialSigning: [await csrOf(this.keyChains.attestation)],
      statusListSigning: await csrOf(this.keyChains.statusList as string),
      access: await csrOf(this.keyChains.access),
    };
  }

  /** Stores a certificate the Registrar issued for a CSR, or imports a key the Registrar generated with its certificate. */
  private async keyChain(usageType: string, certificate: EnrolledCertificate, description: string, csrKeyChain?: string): Promise<string> {
    if (csrKeyChain) {
      await this.call('PUT', `/api/key-chain/${csrKeyChain}`, { activeCertificate: certificate.chainPem.join('\n') });
      return csrKeyChain;
    }
    if (!certificate.privateKeyPem) throw new Error(`the Registrar issued the ${usageType} certificate without its key, but EUDIPLO needs it`);
    const { id } = await this.call<{ id: string }>('POST', '/api/key-chain/import', {
      usageType,
      description,
      keyPem: certificate.privateKeyPem,
      crt: certificate.chainPem,
    });
    return id;
  }

  async setUp(env: IssuerTestEnvironment, namespace: string): Promise<void> {
    if (this.method === 'csr') {
      if (this.tenantId !== tenantIdOf(namespace)) throw new Error(`enrolled in tenant ${this.tenantId}, set up for ${namespace}`);
    } else {
      await this.createTenant(namespace);
      this.method = 'generated';
    }
    const [signer] = env.credentialSigningCertificates;
    if (!signer) throw new Error('no credential signing certificate from the Test Registrar');
    const enrolled = this.keyChains;
    const attestation = await this.keyChain('attestation', signer, 'PID signer under PP-T, from the Test Registrar', enrolled?.attestation);
    const statusList = env.statusListSigningCertificate
      ? await this.keyChain('statusList', env.statusListSigningCertificate, 'Status list signer under PP-T, from the Test Registrar', enrolled?.statusList)
      : undefined;
    const access = await this.keyChain('access', env.accessCertificate, 'Access certificate from AC-A, from the Test Registrar', enrolled?.access);
    this.keyChains = { attestation, statusList, access };

    // Status lists: 2 bits per entry (suspension), at least 10 000 entries (ICS-16, decision 4), the shortest token
    // lifetime EUDIPLO accepts, re-signed on every change. Without a status list key chain EUDIPLO signs with the
    // attestation key, as the ICS then declares.
    await this.call('PUT', '/api/status-list-config', {
      capacity: icsNumber(env.ics, 'ICS-16.min_entries', 10_000),
      bits: 2,
      ttl: STATUS_LIST_TTL_SECONDS,
      immediateUpdate: true,
      enableAggregation: true,
    });

    const keyAttestationsRequired = {
      key_storage: icsList(env.ics, 'ICS-04.key_storage', ['iso_18045_high']),
      user_authentication: icsList(env.ics, 'ICS-04.user_authentication', ['iso_18045_high']),
    };
    // Revocation chaining (WURevocation_18): EUDIPLO follows the status of the key attestation (the wallet unit
    // attestation) and revokes the PID with it. 9.1.0 does not know the field.
    const droppedFromPid = await this.postWithoutUnknownKeys('/api/issuer/credentials', {
      id: PID_SD_JWT_CONFIGURATION,
      description: 'PID in SD-JWT VC format (PID Rulebook), default_configuration_PP_1',
      config: {
        format: 'dc+sd-jwt',
        display: [{ name: 'PID', locale: 'en-US', description: 'Person identification data of the conformance test subject' }],
        keyAttestationsRequired,
      },
      vct: PID_VCT,
      keyBinding: true,
      statusManagement: true,
      keyChainId: attestation,
      lifeTime: PID_LIFETIME_SECONDS,
      fields: PID_FIELDS,
      revokeWithWalletUnit: true,
    });
    this.capabilities.revokeWithWalletUnit = !droppedFromPid.includes('revokeWithWalletUnit');
    // ICS-02.second: the same key binding, status and key attestation requirements, two claims of the subject.
    await this.call('POST', '/api/issuer/credentials', {
      id: SECOND_SD_JWT_CONFIGURATION,
      description: 'Test attestation in SD-JWT VC format, a second credential type of the Provider (ICS-02.second)',
      config: {
        format: 'dc+sd-jwt',
        display: [{ name: 'Test attestation', locale: 'en-US', description: 'Second credential type of the conformance test' }],
        keyAttestationsRequired,
      },
      vct: SECOND_VCT,
      keyBinding: true,
      statusManagement: true,
      keyChainId: attestation,
      lifeTime: PID_LIFETIME_SECONDS,
      fields: PID_FIELDS.filter((field) => SECOND_CLAIMS.includes(field.path[0] as string)),
    });

    const tlWp = env.trustLists.find((list) => list.id === 'TL-WP');
    if (!tlWp) throw new Error('TL-WP is not published');
    const walletProviderTrustLists = [{ url: tlWp.url, verifierX509Der: derOf(tlWp.schemeOperatorCertificatePem) }];
    const issuance = {
      display: [{ name: 'EUDIPLO PID Provider under conformance test', locale: 'en-US' }],
      authorizationServers: [{ type: 'built-in', id: BUILT_IN_AS, walletAttestationRequired: true }],
      walletAttestationRequired: true,
      walletProviderTrustLists,
      batchSize: icsNumber(env.ics, 'ICS-08.batch_size', 1),
      dPopRequired: true,
      notificationEndpointEnabled: true,
      // 9.1.0 imports the Registrar's certificate with `mode` `import` (its default `generate` asks a registrar);
      // later releases have no `mode` and publish `jwt` as given.
      registrationCertificate: { enabled: true, mode: 'import', jwt: env.registrationCertificate },
      // A PID Provider rejects a WIA or KA whose status it cannot obtain (catalogue decision 2): `strict`, for WIAs at
      // the authorization server (inherited) and KAs at the credential endpoint. 9.1.0 has no such setting and accepts
      // them (best effort).
      walletAttestationStatusCheckMode: 'strict',
    };
    const dropped = await this.postWithoutUnknownKeys('/api/issuer/config', issuance);
    this.capabilities.statusCheckMode = !dropped.includes('walletAttestationStatusCheckMode');
  }

  /**
   * POSTs a configuration that names fields of several EUDIPLO releases: where the instance's schema validation
   * rejects a field it does not know (`unrecognized_keys`), the field is left out and the call repeated. Any other
   * rejection fails. Returns the dotted paths of the fields left out.
   */
  private async postWithoutUnknownKeys(path: string, body: Record<string, unknown>): Promise<string[]> {
    const dropped: string[] = [];
    for (;;) {
      try {
        await this.call('POST', path, body);
        return dropped;
      } catch (error) {
        if (!(error instanceof EudiploError) || !error.unrecognizedKey) throw error;
        const { errors = [] } = JSON.parse(error.body) as { errors?: { path: (string | number)[]; message: string; code: string }[] };
        const unknown = errors.filter((e) => e.code === 'unrecognized_keys');
        let removed = false;
        for (const { path: at, message } of unknown) {
          let target = body as Record<string, unknown>;
          for (const segment of at) target = target?.[segment] as Record<string, unknown>;
          for (const [, key] of message.matchAll(/"([^"]+)"/g)) {
            if (target && key in target) {
              delete target[key];
              dropped.push([...at, key].join('.'));
              removed = true;
            }
          }
        }
        if (!removed) throw error;
      }
    }
  }

  /**
   * A credential offer for the subject, with the subject's claims inline: pre-authorized code grant (with or without
   * `tx_code`), or authorization code grant with `issuer_state`, both at the built-in authorization server. EUDIPLO
   * always answers with an offer by reference (`credential_offer_uri`, resolvable once); for `byReference: false` the
   * adapter resolves it and hands out the offer by value (`credential_offer`).
   */
  async createOffer(req: CreateOfferRequest): Promise<CreatedOffer> {
    const unknown = req.configurations.filter((id) => id !== PID_SD_JWT_CONFIGURATION && id !== SECOND_SD_JWT_CONFIGURATION);
    if (unknown.length) throw new Error(`the adapter configures no credential configuration ${unknown.join(', ')}`);
    const preAuthorized = req.grant === 'pre-authorized_code';
    const txCode = preAuthorized && req.txCode ? String(randomInt(0, 1_000_000)).padStart(6, '0') : undefined;
    const offer = await this.call<{ uri: string; session: string }>('POST', '/api/issuer/offer', {
      response_type: 'uri',
      flow: preAuthorized ? 'pre_authorized_code' : 'authorization_code',
      authorization_server: BUILT_IN_AS,
      credentialConfigurationIds: req.configurations,
      credentialClaims: Object.fromEntries(req.configurations.map((id) => [id, { type: 'inline', claims: claimsOf(req.subject, id) }])),
      ...(txCode ? { tx_code: txCode, tx_code_description: 'Transaction code of the conformance test' } : {}),
      reference: `${req.subject}`,
    });
    const uri = req.byReference ? offer.uri : await this.byValue(offer.uri);
    return { offer: uri, sessionId: offer.session, ...(txCode ? { txCode } : {}) };
  }

  /**
   * The subject's authentication at the built-in authorization server (ICS-03.subject_authentication): it has no login
   * or consent step, the subject is the one whose claims the offer carries (bound by `issuer_state`), so the hook only
   * opens the authorization request and returns where EUDIPLO redirects to: the wallet's `redirect_uri` with `code`,
   * `state` and `iss`, or with `error`. An answer that is not a redirect (EUDIPLO answers a request without a pushed
   * `request_uri` with HTTP 409) is thrown as `AuthorizationEndpointError`.
   */
  async authenticateSubject(authorizationRequestUrl: string, _subject: TestSubject): Promise<string> {
    const response = await fetch(authorizationRequestUrl, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) return new URL(location, authorizationRequestUrl).toString();
    throw new AuthorizationEndpointError(response.status, await response.text(), Object.fromEntries(response.headers.entries()));
  }

  /** Resolves an offer by reference and returns it by value, with the same scheme. */
  private async byValue(uri: string): Promise<string> {
    const [scheme] = uri.split('?');
    const reference = new URLSearchParams(uri.slice(uri.indexOf('?') + 1)).get('credential_offer_uri');
    if (!reference) throw new Error(`EUDIPLO's offer has no credential_offer_uri: ${uri}`);
    const response = await fetch(reference);
    if (!response.ok) throw new Error(`EUDIPLO GET ${reference}: HTTP ${response.status} ${await response.text()}`);
    const offer = await response.json();
    return `${scheme}?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;
  }

  /** The issuance configuration and the PID configuration as EUDIPLO stored them, to check what `setUp` configured. */
  async configuration(): Promise<{ issuance: Record<string, unknown>; pid: Record<string, unknown> }> {
    return {
      issuance: await this.call<Record<string, unknown>>('GET', '/api/issuer/config'),
      pid: await this.call<Record<string, unknown>>('GET', `/api/issuer/credentials/${PID_SD_JWT_CONFIGURATION}`),
    };
  }

  /** The tenant's status list settings (`GET /api/status-list-config`). */
  async statusListSettings(): Promise<Record<string, unknown>> {
    return this.call<Record<string, unknown>>('GET', '/api/status-list-config');
  }

  /** The status of every credential the session issued that carries a status entry. */
  async credentialStatus(sessionId: string): Promise<CredentialStatusEntry[]> {
    return this.call<CredentialStatusEntry[]>('GET', `/api/session/${sessionId}/credential-status`);
  }

  /**
   * Revokes, suspends or reinstates every credential the session issued (`POST /api/session/revoke`), and resolves once
   * `GET /api/session/{id}/credential-status` reports the new status for each. EUDIPLO answers 409 for a session that
   * has issued no credential with a status entry yet, and for any change of a revoked credential.
   */
  async setStatus(sessionId: string, status: 'revoked' | 'suspended' | 'valid'): Promise<{ at: string }> {
    const value = STATUS_VALUE[status];
    await this.call('POST', '/api/session/revoke', { sessionId, status: value });
    const at = new Date().toISOString();
    const entries = await this.credentialStatus(sessionId);
    if (!entries.length) throw new Error(`EUDIPLO reports no credential with a status entry for session ${sessionId}`);
    const wrong = entries.filter((entry) => entry.status !== value);
    if (wrong.length) throw new Error(`EUDIPLO reports status ${wrong.map((e) => e.status).join(', ')} instead of ${value} for session ${sessionId}`);
    return { at };
  }

  /** Clears EUDIPLO's trust list cache, so the next wallet or key attestation makes it fetch `TL-WP` again. */
  async refreshTrust(): Promise<void> {
    await this.call('DELETE', '/api/cache/trust-list');
  }

  async describe(): Promise<Record<string, string>> {
    return {
      url: this.baseUrl,
      ...(this.version?.version ? { version: this.version.version } : {}),
      ...(this.version?.revision ? { revision: this.version.revision } : {}),
      ...(this.tenantId ? { tenant: this.tenantId } : {}),
      ...(this.method ? { enrolment: this.method === 'csr' ? 'CSR (GET /api/key-chain/{id}/csr)' : 'keys generated by the Registrar, imported (POST /api/key-chain/import)' } : {}),
      walletAttestationStatusCheckMode: this.capabilities.statusCheckMode ? 'strict' : 'not configurable (best effort)',
      revokeWithWalletUnit: this.capabilities.revokeWithWalletUnit ? 'on' : 'not configurable',
    };
  }

  /** Deletes the tenant with its configurations, key chains and sessions. */
  async tearDown(): Promise<void> {
    if (this.tenantId && this.rootToken) await this.call('DELETE', `/api/tenant/${this.tenantId}`, undefined, this.rootToken);
    this.tenantId = undefined;
    this.token = undefined;
    this.keyChains = undefined;
    this.method = undefined;
  }
}

/** The claims of the second configuration (ICS-02.second), taken from the subject's PID values. */
const SECOND_CLAIMS = ['family_name', 'given_name'];

/** The subject's claims for a configuration. */
function claimsOf(subject: TestSubject, configuration: string): Record<string, unknown> {
  const pid = PID_SUBJECTS[subject];
  return configuration === SECOND_SD_JWT_CONFIGURATION ? Object.fromEntries(SECOND_CLAIMS.map((name) => [name, pid[name]])) : pid;
}

const derOf = (pem: string) => pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, '');

export function createAdapter(): IssuerAdapter {
  return new IssuerEudiploAdapter();
}
