# AP_Inf_SM_TrustMechanisms_005_UF

## Objective

- `SD+PA+Q`, `SD+AC+Q`, `SD+PA+PB`, `SD+AC+PB`, `SD+PA+E`, `SD+AC+E`: Verify that a `TL-WP` older than the one in use (rollback) is not used: a version with a lower sequence number in which `WP-W` is granted gives `CW-W` of `WP-W` no SD-JWT VC attestation.
- `MD+PA+Q`, `MD+AC+Q`, `MD+PA+PB`, `MD+AC+PB`, `MD+PA+E`, `MD+AC+E`: Verify that a `TL-WP` older than the one in use (rollback) is not used: a version with a lower sequence number in which `WP-W` is granted gives `CW-W` of `WP-W` no mdoc attestation.

## References

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
- ETSI TS 119 602 LoTE
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).
6. Wallet Unit `CW-W` of the withdrawn `WP-W` (issuer harness design section 5.2).
7. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in SD-JWT VC format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in mdoc format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `MD+AC+Q`, `MD+AC+PB`, `MD+AC+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in mdoc format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
2. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`: `WP-W` granted (its issuance service listed again); its `LoTESequenceNumber` is one lower than that of the version the Relying Party retrieved before, and its `ListIssueDateTime` one day earlier. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
3. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in SD-JWT VC format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in mdoc format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `MD+AC+Q`, `MD+AC+PB`, `MD+AC+E`: The adapter creates a credential offer for `SUBJ-1`, attestation configuration in mdoc format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
2. The version, its sequence number and the refresh are recorded.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `MD+AC+Q` (`P-Q`, `P-MD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `MD+AC+PB` (`P-PB`, `P-MD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`), `MD+AC+E` (`P-E`, `P-MD`, `P-AC`).
