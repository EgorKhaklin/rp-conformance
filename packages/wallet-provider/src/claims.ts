// Every name the Test Wallet Provider takes from TS3 and the specifications it builds on, in one module (issuer harness
// design section 9: TS3 claim names still change). Builders and, later, checks and faults use these constants only.

/** The TS3 text the names follow: the ARF standards repository at the date of the issuer catalogue's sources. */
export const TS3_SOURCE = {
  document: 'eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications: docs/technical-specifications/ts3-wallet-unit-attestation.md',
  commit: '5924eb77ab4495d4dc0a874e54ac3e5de1fbd5b1',
  version: '1.5.2',
  /** The ARF date of the issuer catalogue (its "Sources" row); the commit is the last change to TS3 on or before it. */
  pinnedAt: '2026-10-02',
} as const;

/** HTTP headers that carry the WIA and its proof of possession (OAuth 2.0 Attestation-Based Client Authentication). */
export const CLIENT_ATTESTATION_HEADER = 'OAuth-Client-Attestation';
export const CLIENT_ATTESTATION_POP_HEADER = 'OAuth-Client-Attestation-PoP';

/** JOSE `typ` values. */
export const TYP = {
  /** The WIA (Attestation-Based Client Authentication; OpenID4VCI 1.0 Appendix E; TS3 section 2.2.1). */
  wia: 'oauth-client-attestation+jwt',
  /** Its proof of possession (Attestation-Based Client Authentication). */
  wiaPop: 'oauth-client-attestation-pop+jwt',
  /**
   * The KA (OpenID4VCI 1.0 Appendix D.1). TS3's non-normative example writes `keyattestation+jwt`; TS3 section 2.2.2
   * makes the KA a `key_attestation` of Appendix D, so the normative value of OpenID4VCI is used.
   */
  keyAttestation: 'key-attestation+jwt',
} as const;

/** Claims of the WIA: Attestation-Based Client Authentication, OpenID4VCI 1.0 Appendix E, and TS3 section 2.3.1. */
export const WIA_CLAIMS = {
  issuer: 'iss',
  /** The `client_id` of the Wallet Instance. */
  subject: 'sub',
  issuedAt: 'iat',
  notBefore: 'nbf',
  expiresAt: 'exp',
  confirmation: 'cnf',
  walletName: 'wallet_name',
  walletVersion: 'wallet_version',
  walletLink: 'wallet_link',
  certificationInformation: 'wallet_solution_certification_information',
  /** `{ status, exp }`: the Wallet Instance's status reference and the end of its revocation maintenance period. */
  clientStatus: 'client_status',
} as const;

/** Claims of the WIA's proof of possession (Attestation-Based Client Authentication). */
export const POP_CLAIMS = {
  issuer: 'iss',
  audience: 'aud',
  jwtId: 'jti',
  issuedAt: 'iat',
  expiresAt: 'exp',
  nonce: 'nonce',
} as const;

/** Claims of the KA: OpenID4VCI 1.0 Appendix D.1, and TS3 section 2.3.2. */
export const KA_CLAIMS = {
  issuer: 'iss',
  issuedAt: 'iat',
  expiresAt: 'exp',
  attestedKeys: 'attested_keys',
  keyStorage: 'key_storage',
  userAuthentication: 'user_authentication',
  certification: 'certification',
  /** The `c_nonce`, when the KA is sent as an `attestation` proof (OpenID4VCI Appendix F.3; TS3 section 2.3.2). */
  nonce: 'nonce',
  /** `{ status, exp }`: the WSCD's status reference and the end of its revocation maintenance period. */
  keyStorageStatus: 'key_storage_status',
} as const;

/** Members of `client_status` and `key_storage_status` (TS3 section 2.4.1). */
export const STATUS_OBJECT = { status: 'status', maintenanceExpiry: 'exp' } as const;

/** Attack potential resistance values of `key_storage` and `user_authentication` (OpenID4VCI 1.0 Appendix D.2). */
export const ISO_18045 = {
  high: 'iso_18045_high',
  moderate: 'iso_18045_moderate',
  enhancedBasic: 'iso_18045_enhanced-basic',
  basic: 'iso_18045_basic',
} as const;

export type Iso18045Level = (typeof ISO_18045)[keyof typeof ISO_18045];

/** The algorithms TS3 section 2.6 allows for WIAs, KAs, their proofs of possession and their status lists. */
export const TS3_ALGORITHMS = ['ES256', 'ES384', 'ES512'] as const;

/** A Token Status List reference, as `status` carries it (OpenID4VCI Appendices D.1 and E; Token Status List). */
export interface StatusReference {
  idx: number;
  uri: string;
}

/** The `status` member of `client_status` or `key_storage_status`. */
export const statusClaim = (reference: StatusReference) => ({ status_list: { idx: reference.idx, uri: reference.uri } });
