// The named faults of issue 25 (issuer harness design section 6.2): the point `dpop` (DPoP proofs and the access token
// they bind, `PP_WS_SM_TokenBinding`, and the refresh grant of `PP_WS_IA_Reissuance`), the batch faults of the point
// `proof` (`PP_WS_IA_Batch`), the point `encoding` (`PP_WS_SH_Encoding`), and the encryption, deferred and
// notification faults of the point `credential-request` (`PP_WS_SH_Encryption`, `PP_WS_IA_Deferred`,
// `PP_WS_IA_Notification`). Each one is applied after a valid build of the request and must fail exactly its `target`
// check of the reference validator (`validateSessionRequest`, packages/validator/src/issuer-session.ts) and no other
// (section 7, level 1). The implementations are in packages/issuer-wallet/src/session-faults.ts.
//
// Kept apart from `ISSUER_FAULTS` (./faults.ts) and the faults of the other issuer areas, so each area's catalogue
// stays a file of its own.
import type { IssuerRequestCheck } from './checks';

/**
 * The checks of the reference validator over what the Conformance Wallet sends after the token response, in the order
 * it evaluates them:
 *
 * - `dpop-proof`: a `DPoP` header with one well-formed DPoP proof (RFC 9449 section 4.2): `typ` `dpop+jwt`, an
 *   asymmetric `alg`, a public `jwk`, a valid signature, `htm` and `htu` of the request, `iat` within the window, a
 *   `jti` not used before, `ath` of the access token it presents, and the server's `nonce` where the server sent one.
 * - `dpop-binding`: the access token is presented with the scheme `DPoP`, and the proof's key is the key the token is
 *   bound to (RFC 9449 sections 6 and 7.1); for the refresh grant, the key the refresh token is bound to (section 5).
 * - `proof-batch`: the proofs of the credential request are at most `batch_size` and each is signed by a key of its own
 *   (OpenID4VCI 1.0 section 8.2; ISSU_35).
 * - `request-encoding`: the request body is what its `Content-Type` says, parses, stays within 1 MB and nests JSON at
 *   most 32 levels deep.
 * - `response-encryption`: `credential_response_encryption` names an `enc` (and `alg` of its `jwk`) the Credential
 *   Issuer advertises, and its `jwk` is a public key on its curve (OpenID4VCI 1.0 section 8.2).
 * - `notification-request`: a `notification_id` the credential response issued and one of the three events
 *   (OpenID4VCI 1.0 section 11.1).
 * - `deferred-request`: a `transaction_id` the credential response to this access token issued and not yet redeemed
 *   (section 9.1).
 * - `access-token-validity`: the access token is presented before its `expires_in` has passed (RFC 6750 section 3.1).
 */
export const SESSION_CHECKS = [
  'dpop-proof',
  'dpop-binding',
  'proof-batch',
  'request-encoding',
  'response-encryption',
  'notification-request',
  'deferred-request',
  'access-token-validity',
] as const;

export type SessionCheck = (typeof SESSION_CHECKS)[number];

/** Where a session fault is applied. */
export type SessionFaultPoint = 'dpop' | 'proof' | 'encoding' | 'credential-request';

/** The request of the step the fault changes. */
export type SessionFaultTarget = 'credential' | 'token' | 'refresh' | 'notification' | 'deferred';

export interface SessionFaultInfo {
  point: SessionFaultPoint;
  /** The request the fault changes. */
  request: SessionFaultTarget;
  /** The check it must fail; a check of `ISSUER_REQUEST_CHECKS` where the fault breaks a proof. */
  target: SessionCheck | IssuerRequestCheck;
  /** The difference from the valid request, as the FCAF scenario words it (after "except that"). */
  text: string;
  /** The catalogue objectives (`issuer-test-catalogue.md` section 5.1) whose stimulus the fault is. */
  testCases: string[];
  /** The fault applies only where the Provider sends `DPoP-Nonce` (ICS-13.dpop_nonce). */
  requiresDpopNonce?: true;
  /** The client waits this long after the token response before it sends the faulty request: `expires_in` plus the given seconds. */
  waitsAfterExpiry?: number;
  /** The fault needs the session of an earlier step of the test case (another Wallet Unit's access token). */
  needsOtherSession?: true;
}

const TB = 'PP_WS_SM_TokenBinding';
const BATCH = 'PP_WS_IA_Batch';
const RE = 'PP_WS_IA_Reissuance';
const ENC = 'PP_WS_SH_Encoding';
const CRYPT = 'PP_WS_SH_Encryption';
const DEF = 'PP_WS_IA_Deferred';
const NOT = 'PP_WS_IA_Notification';

const dpop = (target: SessionCheck, text: string, ...testCases: string[]): SessionFaultInfo => ({ point: 'dpop', request: 'credential', target, text, testCases });

export const SESSION_FAULTS = {
  // DPoP at the credential endpoint, the resource the access token is for (RFC 9449 section 7).
  'dpop.missing': dpop('dpop-proof', 'its credential request presents the access token with the scheme `DPoP` but carries no `DPoP` header', `${TB}_002_UF`),
  'dpop.bearer': dpop('dpop-binding', 'its credential request presents the DPoP-bound access token with the scheme `Bearer` (`Authorization: Bearer …`), with its valid DPoP proof', `${TB}_002_UF`),
  'dpop.other-key': dpop(
    'dpop-binding',
    'the DPoP proof of its credential request is signed with a newly generated P-256 key, carried in its `jwk` header, instead of the key the access token is bound to',
    `${TB}_003_UF`,
  ),
  'dpop.htm-wrong': dpop('dpop-proof', 'the `htm` claim of the DPoP proof of its credential request is `GET`', `${TB}_004_UF`),
  'dpop.htu-wrong': dpop('dpop-proof', 'the `htu` claim of the DPoP proof of its credential request is the credential endpoint URL with the path segment `/other` appended', `${TB}_004_UF`),
  'dpop.ath-missing': dpop('dpop-proof', 'the DPoP proof of its credential request carries no `ath` claim', `${TB}_004_UF`),
  'dpop.ath-wrong': dpop('dpop-proof', 'the `ath` claim of the DPoP proof of its credential request is the hash of another value than the access token', `${TB}_004_UF`),
  'dpop.iat-stale': dpop('dpop-proof', 'the `iat` claim of the DPoP proof of its credential request is the current time minus `T_proof` minus `T_skew` minus one hour', `${TB}_004_UF`),
  'dpop.nonce-omitted': {
    point: 'dpop',
    request: 'token',
    target: 'dpop-proof',
    text: 'the DPoP proof of its token request carries no `nonce` claim, and the Conformance Wallet does not retry with the `DPoP-Nonce` before the first answer',
    testCases: [`${TB}_006_UF`],
    requiresDpopNonce: true,
  },
  'dpop.refresh-other-key': {
    point: 'dpop',
    request: 'refresh',
    target: 'dpop-binding',
    text: 'the DPoP proof of its refresh token request is signed with a newly generated P-256 key, carried in its `jwk` header, instead of the DPoP key the refresh token is bound to',
    testCases: [`${RE}_002_UF`],
  },
  'access-token.expired': {
    point: 'credential-request',
    request: 'credential',
    target: 'access-token-validity',
    text: 'its credential request is sent one hour after the `expires_in` of the access token has passed',
    testCases: [`${TB}_007_UF`],
    waitsAfterExpiry: 3600,
  },

  // Batch issuance: the proofs of one credential request (OpenID4VCI 1.0 section 8.2).
  'batch.over-size': {
    point: 'proof',
    request: 'credential',
    target: 'proof-batch',
    text: 'its credential request carries `batch_size` + 1 key proofs, each signed by another key of one KA that attests `batch_size` + 1 keys',
    testCases: [`${BATCH}_003_UF`],
  },
  'batch.one-bad-proof': {
    point: 'proof',
    request: 'credential',
    target: 'proof-signature',
    text: 'one bit of the signature value of the second of its `batch_size` key proofs is flipped',
    testCases: [`${BATCH}_004_UF`],
  },
  'batch.same-key-twice': {
    point: 'proof',
    request: 'credential',
    target: 'proof-batch',
    text: 'the first two of its `batch_size` key proofs are signed by the same attested key',
    testCases: [`${BATCH}_005_UF`],
  },

  // Encoding at the token and credential endpoints (RFC 8725; OWASP API4).
  'encoding.truncated-json': {
    point: 'encoding',
    request: 'credential',
    target: 'request-encoding',
    text: 'the body of its credential request is its JSON truncated after half of its characters',
    testCases: [`${ENC}_001_UF`],
  },
  'encoding.text-plain': {
    point: 'encoding',
    request: 'credential',
    target: 'request-encoding',
    text: 'its credential request is sent with `Content-Type: text/plain`',
    testCases: [`${ENC}_001_UF`],
  },
  'encoding.token-text-plain': {
    point: 'encoding',
    request: 'token',
    target: 'request-encoding',
    text: 'its token request is sent with `Content-Type: text/plain`',
    testCases: [`${ENC}_001_UF`],
  },
  'encoding.two-part-jwt': {
    point: 'encoding',
    request: 'token',
    target: 'wia-format',
    text: 'the WIA in the `OAuth-Client-Attestation` header of its token request is a JWT of two parts, header and payload, without the signature part and its separator',
    testCases: [`${ENC}_001_UF`],
  },
  'encoding.dpop-two-part-jwt': {
    point: 'encoding',
    request: 'token',
    target: 'dpop-proof',
    text: 'the DPoP proof of its token request is a JWT of two parts, header and payload, without the signature part and its separator',
    testCases: [`${ENC}_001_UF`],
  },
  'encoding.oversized': {
    point: 'encoding',
    request: 'credential',
    target: 'request-encoding',
    text: 'its credential request additionally carries a member `padding` whose value is a string of 10 MiB',
    testCases: [`${ENC}_002_UF`],
  },
  'encoding.deep-nesting': {
    point: 'encoding',
    request: 'credential',
    target: 'request-encoding',
    text: 'its credential request additionally carries a member `nested` whose value is an array nested 10 000 levels deep',
    testCases: [`${ENC}_002_UF`],
  },

  // Credential response encryption (OpenID4VCI 1.0 sections 8.2, 10).
  'encryption.alg-unsupported': {
    point: 'credential-request',
    request: 'credential',
    target: 'response-encryption',
    text: 'the `jwk` of its `credential_response_encryption` is an RSA key with `alg` `RSA-OAEP-256`, which the Credential Issuer does not advertise',
    testCases: [`${CRYPT}_002_UF`],
  },
  'encryption.enc-unsupported': {
    point: 'credential-request',
    request: 'credential',
    target: 'response-encryption',
    text: 'the `enc` of its `credential_response_encryption` is `A128CBC-HS256`, which the Credential Issuer does not advertise',
    testCases: [`${CRYPT}_002_UF`],
  },
  'encryption.off-curve-jwk': {
    point: 'credential-request',
    request: 'credential',
    target: 'response-encryption',
    text: 'the `jwk` of its `credential_response_encryption` holds coordinates that are not a point on P-256',
    testCases: [`${CRYPT}_003_UF`],
  },

  // Notification endpoint (OpenID4VCI 1.0 section 11).
  'notification.id-unknown': {
    point: 'credential-request',
    request: 'notification',
    target: 'notification-request',
    text: 'the `notification_id` of its notification request is a random value the credential response did not issue',
    testCases: [`${NOT}_002_UF`],
  },
  'notification.event-unknown': {
    point: 'credential-request',
    request: 'notification',
    target: 'notification-request',
    text: 'the `event` of its notification request is `foo`',
    testCases: [`${NOT}_002_UF`],
  },

  // Deferred credential endpoint (OpenID4VCI 1.0 section 9).
  'deferred.transaction-id-unknown': {
    point: 'credential-request',
    request: 'deferred',
    target: 'deferred-request',
    text: 'the `transaction_id` of its deferred credential request is a random value the credential response did not issue',
    testCases: [`${DEF}_002_UF`],
  },
  'deferred.access-token-foreign': {
    point: 'credential-request',
    request: 'deferred',
    target: 'deferred-request',
    text: 'its deferred credential request presents, with a DPoP proof of its key, the access token of the session of another Wallet Unit, not the one the `transaction_id` was issued to',
    testCases: [`${DEF}_003_UF`],
    needsOtherSession: true,
  },
} as const satisfies Record<string, SessionFaultInfo>;

/** `IssuanceAction.batchSize` for "as many proofs as the `batch_size` the ICS declares" (ICS-08.batch_size). */
export const ICS_BATCH_SIZE = 0;

export type SessionFaultId = keyof typeof SESSION_FAULTS;

export const SESSION_FAULT_IDS = Object.keys(SESSION_FAULTS) as SessionFaultId[];

export function isSessionFault(id: string): id is SessionFaultId {
  return id in SESSION_FAULTS;
}

export function sessionFaultInfo(id: SessionFaultId): SessionFaultInfo {
  const info = SESSION_FAULTS[id] as SessionFaultInfo | undefined;
  if (!info) throw new Error(`unknown session fault ${id}`);
  return info;
}
