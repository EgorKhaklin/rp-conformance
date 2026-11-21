# AP_WS_SM_ClientAttestation_006_UF

## Objective

- `SD+PA+Q`: Record how the QEAA Provider treats a WIA signed under `WP-A`'s KA CA, an anchor `TL-WP` publishes for another service of the same Wallet Provider, at the token endpoint in the pre-authorized code flow.
- `SD+PA+PB`: Record how the PuB-EAA Provider treats a WIA signed under `WP-A`'s KA CA, an anchor `TL-WP` publishes for another service of the same Wallet Provider, at the token endpoint in the pre-authorized code flow.
- `SD+PA+E`: Record how the non-qualified EAA Provider treats a WIA signed under `WP-A`'s KA CA, an anchor `TL-WP` publishes for another service of the same Wallet Provider, at the token endpoint in the pre-authorized code flow.

## References

- [ARF] Annex 2, ISSU_28, ISSU_30a
- [TS3] sections 2.2.1.2 and 3.2
- [ETSI TS 119 602]

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- Attestation-Based Client Authentication

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and its WIA is signed by a certificate under `WP-A`'s KA CA, the anchor `TL-WP` lists for `WP-A`'s key attestations (ServiceName `WP-A WSCD`), not for its Wallet Solution.

## Expected results

1. Whether the Provider rejects the WIA or issues the attestation is recorded; HTTP 5xx fails. Both conform: TS3 section 2.2.1.2 requires a chain to "a trust anchor found on the Trusted List for Wallet Providers", which the KA CA of `WP-A` is.

## Comments

Informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): TS3 sections 2.2.1.2 and 2.2.2.2 and ARF ISSU_28 and ISSU_30a bind the trust anchors to the Wallet Provider, not to one of its services; the mapping of TS3 section 3.2 is informative, and maps no KA field at all. Rejecting such a WIA is a stricter local policy.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
