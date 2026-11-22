# PP_WS_SM_KeyAttestation_004_UF

## Objective

Verify that the PID Provider rejects a KA signed under an anchor that `TL-WP` does not publish at the credential endpoint in the pre-authorized code flow: `CA-X`, `PP-A`, the withdrawn `WP-W`; and record how it treats a KA under `WP-A`'s WIA CA.

## References

- [ARF] Annex 2, ISSU_21, ISSU_28, ISSU_30
- [TS3] section 2.2.2.2
- [ETSI TS 119 602]

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA is signed by a certificate issued by `CA-X`, which no list of the suite contains.
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA is signed by a certificate under `PP-A`'s issuance CA in `TL-PID`.
3. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA is signed by a certificate under the issuance anchor of the withdrawn Wallet Provider `WP-W`.
4. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and its KA is signed by a certificate under `WP-A`'s WIA CA, the anchor `TL-WP` lists for `WP-A`'s Wallet Solution (ServiceName `WP-A Wallet`), not for its key attestations.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
4. Whether the Provider rejects the KA or issues the PID is recorded; HTTP 5xx fails. Both conform: TS3 section 2.2.2.2 requires a chain to "a trust anchor found on the Trusted List for Wallet Providers", which the WIA CA of `WP-A` is.

## Comments

Stimulus (d) is informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): TS3 and ARF ISSU_28 and ISSU_30 bind the anchors to the Wallet Provider, not to one of its services, and TS3 section 3.2, which is informative, maps no KA field to a service.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
