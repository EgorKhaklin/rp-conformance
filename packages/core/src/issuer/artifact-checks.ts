// The named checks of the reference validator over what a PID Provider or Attestation Provider publishes and hands out
// (issuer harness design sections 2 and 6.3, `OBS-META` and the captured offer), and over the credential request the
// Conformance Wallet sends (point `credential-request`, section 6.2). A `CONF` test case names the checks it requires;
// a credential request fault names the one check it fails (section 7, level 1).

/** Checks of `SCN-M` (issuer catalogue `PP_WS_MS_Metadata`): Credential Issuer metadata, signed, and AS metadata. */
export const METADATA_CHECKS = [
  'metadata-location',
  'metadata-signed',
  'metadata-signed-equal',
  'metadata-registration-certificate',
  'metadata-registration-entitlement',
  'metadata-pid-configurations',
  'metadata-algorithms',
  'metadata-key-attestation',
  'metadata-reuse-policy',
  'metadata-nonce-endpoint',
  'metadata-authorization-server',
  'metadata-display',
  'metadata-no-server-retrieval',
  // Issue 27 (AP_WS_MS_Metadata_100 to _103): the configurations of an Attestation Provider.
  'metadata-no-key-binding',
  'metadata-key-attestation-levels',
  'metadata-disclosure-policy',
  'metadata-attestation-formats',
] as const;

/** Checks of a captured credential offer (issuer catalogue `PP_WS_MS_Offer`). */
export const OFFER_CHECKS = [
  'offer-issuer',
  'offer-configurations',
  'offer-reference-fetch',
  'offer-reference-equal',
  'offer-pre-authorized-code',
  'offer-issuer-state',
] as const;

/**
 * Checks of a credential request the Conformance Wallet sends (OpenID4VCI 1.0 section 8.2), for the self-validation of
 * the `credential-request` faults: exactly one of `credential_identifier` and `credential_configuration_id`; a
 * configuration the metadata offers; one the access token covers; an identifier the token response issued.
 */
export const CREDENTIAL_REQUEST_CHECKS = [
  'credential-request-identifier',
  'credential-request-configuration',
  'credential-request-authorized',
  'credential-request-credential-identifier',
] as const;

export type MetadataCheck = (typeof METADATA_CHECKS)[number];
export type OfferCheck = (typeof OFFER_CHECKS)[number];
export type CredentialRequestCheck = (typeof CREDENTIAL_REQUEST_CHECKS)[number];
export type IssuerArtifactCheck = MetadataCheck | OfferCheck | CredentialRequestCheck;
