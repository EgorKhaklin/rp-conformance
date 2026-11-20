# PP_Inf_SM_TrustMechanisms_006_UF

## Objective

- `SD+PA`, `SD+AC`: Verify that a `TL-WP` past its `NextUpdate`, with no newer list, is handled as the Provider declares its grace period (ICS-15): beyond it the list is not used and `CW-1` gets no SD-JWT VC PID; within it, it does.
- `MD+PA`, `MD+AC`: Verify that a `TL-WP` past its `NextUpdate`, with no newer list, is handled as the Provider declares its grace period (ICS-15): beyond it the list is not used and `CW-1` gets no mdoc PID; within it, it does.

## References

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
- ETSI TS 119 602 LoTE
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`: the default entities; its `NextUpdate` lies the grace period `G` plus one hour in the past, and its `ListIssueDateTime` one month before that. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
2. Per variant:
    - `SD+PA`, `SD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` without mutation.
    - `MD+PA`, `MD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format; `CW-1` runs `SCN-I` without mutation.

## Expected results

1. The version, its sequence number and the refresh are recorded.
2. As the grace period after `NextUpdate` the Provider declares (ICS-15) gives: `NextUpdate` lies the grace period plus one hour in the past, so the list is not used, the Wallet Provider is not trusted, and the Provider rejects (`REJ`); a list still within the grace period would give `ISS`.

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
