// The reference validator on the issuer side (`OBS-CRED`, issuer harness design sections 4 and 6.3): every credential a
// Provider under test issues runs through the credential checks a Relying Party performs, with the suite's trust
// configuration, except that there is no presentation. `key-binding` and `kb-freshness` check a KB-JWT, which an issued
// credential does not carry; `holder-binding` takes their place: the credential is bound (`cnf.jwk`) to a key the
// Conformance Wallet proved possession of and that the Wallet Unit's key attestation attests. `trusted-authorities`
// checks a query, of which there is none.
import { type CheckId, STATUS_LIST_CHECKS } from '@rp-conformance/core';
import { base64url, verifyEs256 } from '@rp-conformance/forge';
import { CheckRecorder, type ValidationMode, type ValidationResult } from './checks';
import { describeKey, processDisclosures } from './disclosures';
import { decodeSegment, evaluateStatusList, type FetchedStatusList, fail, isUri, leafJwk } from './status-list';
import type { MatchedIssuer, TrustRule, TrustStore } from './trust';

/** The checks of an issued SD-JWT VC, in the order the reference validator runs them. */
export const ISSUED_CREDENTIAL_CHECKS = ['format', 'issuer-trust', 'issuer-signature', 'disclosures', 'validity', 'holder-binding', 'status-reference'] as const satisfies CheckId[];

/** Every check of an issued SD-JWT VC and its Status List Token. */
export const ISSUED_SD_JWT_VC_CHECKS: CheckId[] = [...ISSUED_CREDENTIAL_CHECKS, ...STATUS_LIST_CHECKS];

export interface IssuedSdJwtVcValidation extends ValidationResult {
  /** Issuer-signed claims with the disclosed values, when the disclosures check passed. */
  claims?: Record<string, unknown>;
  /** The trusted entity the issuer matched. */
  issuer?: string;
  statusListFetched: boolean;
}

export interface IssuedSdJwtVcValidationOptions {
  trust: TrustStore;
  /** The root of trust of the Provider's category (`TRUST_RULES`), for a PID Provider `PP-T` on `TL-PID`. */
  trustRule: TrustRule;
  /**
   * The entity the Provider was enrolled as (`PP-T`, `QP-T`, `PB-T`, `EP-T`): a chain to another entity of the same list
   * fails `issuer-trust`, since the Provider under test signs with its enrolled keys only.
   */
  issuerEntity?: string;
  /** The `vct` of the credential configuration the Conformance Wallet requested. */
  expectedVct: string[];
  /** The public keys of the proofs the Conformance Wallet sent in the credential request. */
  proofKeys: JsonWebKey[];
  /** The key attestations the proofs carried; their `attested_keys` must contain the bound key. */
  keyAttestations: string[];
  /** Clock tolerance of the validator, seconds. */
  skewSeconds: number;
  /** A PID needs a status reference unless its validity period is at most 24 hours (VCR_01, VCR_01b). */
  requireStatus: boolean;
  /** Maximum decompressed size of a status list, bytes. */
  maxStatusListBytes: number;
  fetchStatusList: (uri: string) => Promise<FetchedStatusList>;
  /** Default `all`: every check whose prerequisites passed is evaluated, so the report shows each of them. */
  mode?: ValidationMode;
  now?: Date;
}

const DAY = 24 * 60 * 60;

/** Two public JWKs name the same EC key. */
export const sameEcKey = (a: JsonWebKey | undefined, b: JsonWebKey | undefined) =>
  Boolean(a && b && a.kty === 'EC' && b.kty === 'EC' && a.crv === b.crv && a.x === b.x && a.y === b.y);

/**
 * `holder-binding`: the credential's `cnf.jwk` is a P-256 key, equal to the key of one of the proofs the Conformance
 * Wallet sent, and listed in the `attested_keys` of one of the key attestations those proofs carried. Returns the
 * detail on success, throws (`fail`) otherwise. The KAs are only decoded here; their signature and trust are the
 * request checks of the issuer side, not checks of what the Provider issued.
 */
export function checkHolderBinding(payload: Record<string, unknown>, proofKeys: JsonWebKey[], keyAttestations: string[]): string {
  const jwk = (payload.cnf as { jwk?: JsonWebKey } | undefined)?.jwk;
  if (!jwk) return fail('the credential has no cnf.jwk, so it is bound to no key');
  if (jwk.kty !== 'EC' || jwk.crv !== 'P-256') fail(`cnf.jwk is not a P-256 key (${String(jwk.kty)} ${String(jwk.crv)})`);
  const proof = proofKeys.findIndex((key) => sameEcKey(key, jwk));
  if (proof < 0) fail(`cnf.jwk is none of the ${proofKeys.length} proof key(s) of the credential request`);
  for (const [index, ka] of keyAttestations.entries()) {
    const attested = decodeSegment(ka.split('.')[1], 'the key attestation payload').attested_keys;
    if (Array.isArray(attested) && attested.some((key) => sameEcKey(key as JsonWebKey, jwk))) {
      return `cnf.jwk is the key of proof ${proof + 1} and attested_keys entry of key attestation ${index + 1}`;
    }
  }
  return fail('cnf.jwk is a proof key, but no key attestation of the request lists it in attested_keys');
}

/**
 * The reference validator for an SD-JWT VC as a Provider issued it (SD-JWT VC, RFC 9901, Token Status List): the same
 * checks and order as `validateSdJwtVcPresentation`, with `holder-binding` instead of `key-binding` and `kb-freshness`.
 * Trust follows `trustRule`: for a PID Provider the issuer's chain ends in the PID/Issuance anchor of `PP-T` on
 * `TL-PID`, the Status List Token's chain in the PID/Revocation anchor of the same entity.
 */
export async function validateIssuedSdJwtVc(credential: string, options: IssuedSdJwtVcValidationOptions): Promise<IssuedSdJwtVcValidation> {
  const recorder = new CheckRecorder(options.mode ?? 'all');
  const now = options.now ?? new Date();
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const skew = options.skewSeconds;
  const parts = credential.split('~');
  const issuerJwt = parts[0] ?? '';

  let header: Record<string, unknown> = {};
  let payload: Record<string, unknown> = {};
  let x5c: string[] = [];
  let issuer: MatchedIssuer | undefined;
  let claims: Record<string, unknown> | undefined;
  let reference: { idx: number; uri: string } | undefined;
  let statusListFetched = false;

  const result = await recorder.collect(async () => {
    await recorder.run('format', [], () => {
      if (parts.length < 2) fail('not an SD-JWT: no ~ separator');
      // An issued SD-JWT ends with `~`: no KB-JWT (RFC 9901 section 4).
      if (parts[parts.length - 1] !== '') fail('the issued SD-JWT carries a KB-JWT or does not end with ~');
      header = decodeSegment(issuerJwt.split('.')[0], 'the issuer-signed JWT header');
      payload = decodeSegment(issuerJwt.split('.')[1], 'the issuer-signed JWT payload');
      if (header.typ !== 'dc+sd-jwt') fail(`typ is ${String(header.typ)}, expected dc+sd-jwt`);
      if (!Array.isArray(header.x5c) || header.x5c.length === 0 || header.x5c.some((c) => typeof c !== 'string')) fail('x5c is missing');
      x5c = header.x5c as string[];
      if (!options.expectedVct.includes(String(payload.vct))) fail(`vct ${String(payload.vct)} is not the requested ${options.expectedVct.join(', ')}`);
    });

    await recorder.run('issuer-trust', ['format'], async () => {
      const match = await options.trust.match(options.trustRule, x5c, now);
      if (!match.ok) fail(match.reason);
      if (match.ok && options.issuerEntity && match.entity.name !== options.issuerEntity) {
        fail(`the chain ends in an anchor of ${match.entity.name} (${match.list.id}), not of the enrolled ${options.issuerEntity}`);
      }
      if (match.ok) {
        issuer = { name: match.entity.name, statusAnchors: options.trustRule.statusAnchors(match.entity, match.service) };
        return `${match.entity.name} under ${match.anchor.subject.commonName} (${match.list.id})`;
      }
    });

    await recorder.run('issuer-signature', ['format'], async () => {
      const key = describeKey(x5c[0]);
      if (key !== 'P-256') fail(`the signing certificate holds a key ${key}, not on P-256`);
      if (header.alg !== 'ES256') fail(`alg ${String(header.alg)} is not supported`);
      const [h, p, s] = issuerJwt.split('.');
      if (!(await verifyEs256(leafJwk(x5c) as JsonWebKey, `${h}.${p}`, base64url.decode(s ?? '')))) fail('the issuer signature does not verify');
    });

    await recorder.run('disclosures', ['format'], () => {
      const { claims: disclosed, count } = processDisclosures(payload, parts.slice(1, -1));
      claims = disclosed;
      return `${count} disclosures`;
    });

    await recorder.run('validity', ['format'], () => {
      if (typeof payload.exp === 'number' && nowSeconds > payload.exp + skew) fail(`expired: exp ${payload.exp}, now ${nowSeconds}, skew ${skew}`);
      if (typeof payload.nbf === 'number' && nowSeconds < payload.nbf - skew) fail(`not yet valid: nbf ${payload.nbf}, now ${nowSeconds}, skew ${skew}`);
      if (typeof payload.iat === 'number' && payload.iat > nowSeconds + skew) return `iat ${payload.iat} lies in the future (informative)`;
    });

    await recorder.run('holder-binding', ['format'], () => checkHolderBinding(payload, options.proofKeys, options.keyAttestations));

    await recorder.run('status-reference', ['format'], () => {
      const status = payload.status as { status_list?: Record<string, unknown> } | undefined;
      if (status === undefined) {
        const start = typeof payload.nbf === 'number' ? payload.nbf : payload.iat;
        const period = typeof payload.exp === 'number' && typeof start === 'number' ? payload.exp - start : Number.POSITIVE_INFINITY;
        if (!options.requireStatus) return 'no status reference (accepted by policy)';
        if (period <= DAY) return `no status reference; validity period ${period} s is at most 24 hours`;
        fail(`no status reference, and the validity period (${Number.isFinite(period) ? `${period} s` : 'unbounded'}) exceeds 24 hours`);
      }
      const list = status?.status_list;
      if (!list || typeof list !== 'object') fail('status has no status_list');
      if (!Number.isInteger(list?.idx) || (list?.idx as number) < 0) fail(`idx ${JSON.stringify(list?.idx)} is not a non-negative integer`);
      if (!isUri(list?.uri)) fail(`uri ${JSON.stringify(list?.uri)} is not a URI`);
      reference = { idx: list?.idx as number, uri: list?.uri as string };
    });

    await evaluateStatusList(recorder, {
      format: 'jwt',
      reference,
      issuer,
      fetchStatusList: options.fetchStatusList,
      maxStatusListBytes: options.maxStatusListBytes,
      skewSeconds: skew,
      now,
      onFetched: () => {
        statusListFetched = true;
      },
    });
  });
  return { ...result, claims: result.failures.includes('disclosures') ? undefined : claims, issuer: issuer?.name, statusListFetched };
}
