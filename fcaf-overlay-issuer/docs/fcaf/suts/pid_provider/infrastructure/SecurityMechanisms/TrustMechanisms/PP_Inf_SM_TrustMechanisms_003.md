# PP_Inf_SM_TrustMechanisms_003

## Objective

- `SD+PA`, `SD+AC`: Verify that a Wallet Provider added to `TL-WP` is accepted after the refresh: `CW-C` of `WP-C` gets the SD-JWT VC PID.
- `MD+PA`, `MD+AC`: Verify that a Wallet Provider added to `TL-WP` is accepted after the refresh: `CW-C` of `WP-C` gets the mdoc PID.

## References

- [ARF] Annex 2, ISSU_28
- [ARF] Annex 2, WPNot_04

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
6. Wallet Unit `CW-C` of `WP-C`, a Wallet Provider the default `TL-WP` does not list (issuer harness design section 5.2).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, pre-authorized code flow; `CW-C` runs `SCN-I` without mutation (`WP-C` is not on the default `TL-WP` yet).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE; `CW-C` runs `SCN-I` without mutation (`WP-C` is not on the default `TL-WP` yet).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, pre-authorized code flow; `CW-C` runs `SCN-I` without mutation (`WP-C` is not on the default `TL-WP` yet).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format, authorization code flow with PAR and PKCE; `CW-C` runs `SCN-I` without mutation (`WP-C` is not on the default `TL-WP` yet).
2. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`, sealed by its scheme operator: `WP-C` added as a granted Wallet Provider. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
3. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-C` runs `SCN-I` without mutation (`WP-C` is now on `TL-WP`).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-C` runs `SCN-I` without mutation (`WP-C` is now on `TL-WP`).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-C` runs `SCN-I` without mutation (`WP-C` is now on `TL-WP`).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, authorization code flow with PAR and PKCE. `CW-C` runs `SCN-I` without mutation (`WP-C` is now on `TL-WP`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
2. The version, its sequence number and the refresh are recorded.
3. Per variant:
    - `SD+PA`, `SD+AC`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`, `MD+AC`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
