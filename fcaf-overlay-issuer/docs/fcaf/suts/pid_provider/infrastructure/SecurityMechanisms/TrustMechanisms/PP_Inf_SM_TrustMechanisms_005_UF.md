# PP_Inf_SM_TrustMechanisms_005_UF

## Objective

- `SD+PA`, `SD+AC`: Verify that a `TL-WP` older than the one in use (rollback) is not used: a version with a lower sequence number in which `WP-W` is granted gives `CW-W` of `WP-W` no SD-JWT VC PID.
- `MD+PA`, `MD+AC`: Verify that a `TL-WP` older than the one in use (rollback) is not used: a version with a lower sequence number in which `WP-W` is granted gives `CW-W` of `WP-W` no mdoc PID.

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).
6. Wallet Unit `CW-W` of the withdrawn `WP-W` (issuer harness design section 5.2).
7. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (`WP-W`'s issuance service is withdrawn on the current `TL-WP`).
2. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`: `WP-W` granted (its issuance service listed again); its `LoTESequenceNumber` is one lower than that of the version the Relying Party retrieved before, and its `ListIssueDateTime` one day earlier. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
3. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, pre-authorized code flow; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, authorization code flow with PAR and PKCE; `CW-W` runs `SCN-I` without mutation (the rolled back version that grants `WP-W` must not be used).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
2. The version, its sequence number and the refresh are recorded.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
