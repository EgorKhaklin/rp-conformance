# PP_WS_SM_Validity_004

## Objective

- `SD+PA`, `SD+AC`: Verify that the validity period of the PID in SD-JWT VC format matches what the ICS declares for the configuration.
- `MD+PA`, `MD+AC`: Verify that the validity period of the PID in mdoc format matches what the ICS declares for the configuration.

## References

- [ARF] Annex 2, ISSU_38

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The ICS declares the validity period of the PID configuration (`ICS-05.validity_period`) and its timestamp precision (`ICS-16.timestamp_precision`).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.

## Expected results

1. Per variant:
    - `SD+PA`, `SD+AC`: The Provider issues the credential (HTTP 200) in SD-JWT VC format, it passes every check of the reference validator, and the validity period (`exp` minus `nbf`, or `iat`) equals the declared one within twice the declared timestamp precision, since the issuance time may be rounded down and the expiry up (`validity-declared`).
    - `MD+PA`, `MD+AC`: The Provider issues the credential (HTTP 200) in mdoc format, it passes every check of the reference validator, and the validity period (`validUntil` minus `validFrom`) equals the declared one within twice the declared timestamp precision, since the issuance time may be rounded down and the expiry up (`validity-declared`).

## Comments

The named check runs in this test case only; the other checks of the reference validator run as in `PP_WS_IA_MainInteraction_001` and must pass too.

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
