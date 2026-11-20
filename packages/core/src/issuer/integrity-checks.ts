// Issue 26: the named checks of the reference validator over what a Provider signs and publishes, beyond the credential
// checks of `ISS` (issuer catalogue section 5.1.3 `SM_IssuerIntegrity`, `SM_Unlinkability`, section 5.3 `PP_Inf`). An
// `inspect` step names the checks its `CONF` requires; each runs over the credentials of earlier steps (`OBS-CRED`), the
// metadata of the issuance, or the requests the Provider sent to the harness (`OBS-NET`).

/** `PP_WS_SM_IssuerIntegrity`: what the Provider signs, credential by credential. */
export const ISSUER_INTEGRITY_CHECKS = [
  // `_001`: the SD-JWT VC header carries `typ` `dc+sd-jwt`.
  'sd-jwt-typ',
  // `_001`, `_002`: the signature algorithm is one the ECCG agreed (ES256, ES384, ES512 with the key on its curve).
  'signer-algorithm',
  // `_001`, `_002`: `x5c` or `x5chain` carries the leaf and its intermediates in order, without the trust anchor.
  'signer-chain',
  // `_002`: the MSO's `digestAlgorithm` is `SHA-256`, and every value digest matches (with `disclosures`).
  'mdoc-digest-algorithm',
  // `_003`: the signing certificate follows the ETSI TS 119 412-6 profile the Test Registrar enrolled.
  'signer-profile',
  // `_004`: the credential signer is not the access certificate, and the access certificate's key signs no credential.
  'signer-not-access',
  // `_005`: every PID claim is individually selectively disclosable; `_sd_alg` is `sha-256`.
  'selective-disclosure',
  // `_006`: salts at least 128 bits and unique per disclosure; mdoc `random` at least 16 bytes per element.
  'salt-entropy',
  // `_007`: the signature algorithm is one the credential configuration advertises.
  'algorithm-advertised',
] as const;

/** `PP_WS_SM_Unlinkability`: properties over several credentials, and what one credential must not contain. */
export const UNLINKABILITY_CHECKS = [
  // `_001`: across the credentials compared, no value of its kind repeats.
  'unique-salts',
  'unique-digests',
  'unique-status-index',
  'unique-device-key',
  'unique-signature',
  // `_002`: status indices are not assigned in a monotonic or arithmetic order.
  'status-index-order',
  // `_003`: credentials of batches issued in the same window carry the same timestamps at the declared precision.
  'batch-timestamps',
  // `_004`: the credentials of one batch are not on adjacent status indices.
  'batch-spread',
  // `_005`: the credential carries no identifier of the Wallet Instance, its WIA or its KA.
  'no-wallet-identifier',
] as const;

/** `PP_Inf_SM_TrustMechanisms_007` and `_008`: the Provider's signers under its anchors, and its outbound requests. */
export const TRUST_INFRASTRUCTURE_CHECKS = [
  // `_007`: the credential chains to the issuance anchor of the Provider's entity (the `issuer-trust` of `ISS`).
  'anchor-issuance',
  // `_007`: the status list chains to its revocation anchor (or the issuance anchor where the list carries it twice).
  'anchor-revocation',
  // `_007`: the access certificate the Provider presents chains to `AC-A` on `TL-AC`.
  'anchor-access',
  // `_008`: every request the Provider sent to `TL-WP` or the Test Status Provider carries nothing about the User or the
  // transaction: a GET of the published URL, no query, no body, no cookie, no `Authorization`.
  'outbound-privacy',
] as const;

export type IssuerIntegrityCheck = (typeof ISSUER_INTEGRITY_CHECKS)[number];
export type UnlinkabilityCheck = (typeof UNLINKABILITY_CHECKS)[number];
export type TrustInfrastructureCheck = (typeof TRUST_INFRASTRUCTURE_CHECKS)[number];
export type IssuerInspectionCheck = IssuerIntegrityCheck | UnlinkabilityCheck | TrustInfrastructureCheck;

/** Every check an `inspect` step can name. */
export const ISSUER_INSPECTION_CHECKS: readonly IssuerInspectionCheck[] = [...ISSUER_INTEGRITY_CHECKS, ...UNLINKABILITY_CHECKS, ...TRUST_INFRASTRUCTURE_CHECKS];
