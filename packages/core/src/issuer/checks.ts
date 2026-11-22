// The issuer request checks of the reference validator (issuer harness design section 7, level 1): one named check per
// property of what the Conformance Wallet sends a PID or Attestation Provider at the fault points `wia`, `wia-pop`,
// `ka` and `proof` (section 6.2). Every issuer request fault names the one check it must fail.

/**
 * In the order the reference validator evaluates them. A check that needs the result of another one is skipped when that
 * one did not pass: the status of a WIA or KA is fetched only after its signature and trust passed (Token Status List
 * section 6.2; catalogue `PP_WS_SH_Encoding_004`), the PoP is verified with the key of a well-formed WIA, and a proof
 * key is compared with `attested_keys` only when both are well-formed.
 */
export const ISSUER_REQUEST_CHECKS = [
  // WIA (`OAuth-Client-Attestation`; Attestation-Based Client Authentication; OpenID4VCI 1.0 Appendix E; TS3 2.2.1)
  'wia-format',
  'wia-signature',
  'wia-trust',
  'wia-validity',
  'wia-client-id',
  'wia-status',
  // Its proof of possession (`OAuth-Client-Attestation-PoP`)
  'wia-pop',
  // KA (OpenID4VCI 1.0 Appendix D; TS3 2.2.2), as the `key_attestation` header of the proof carries it
  'ka-format',
  'ka-signature',
  'ka-trust',
  'ka-validity',
  'ka-levels',
  'ka-nonce',
  'ka-status',
  // Key proof of proof type `jwt` (OpenID4VCI 1.0 Appendix F.1)
  'proof-format',
  'proof-key',
  'proof-signature',
  'proof-claims',
  'proof-nonce',
  'proof-key-attested',
] as const;

export type IssuerRequestCheck = (typeof ISSUER_REQUEST_CHECKS)[number];

/**
 * Checks of an issued credential against the WIA and KA it was issued for (`PP_WS_SM_ClientAttestation_015`,
 * `PP_WS_SM_KeyAttestation_011`): its `exp` is no later than the end of their revocation maintenance period (ISSU_12c,
 * WUA_30). Run where a `CONF` expectation names them.
 */
export const ISSUER_ATTESTATION_CHECKS = ['maintenance-period'] as const;

export type IssuerAttestationCheck = (typeof ISSUER_ATTESTATION_CHECKS)[number];
