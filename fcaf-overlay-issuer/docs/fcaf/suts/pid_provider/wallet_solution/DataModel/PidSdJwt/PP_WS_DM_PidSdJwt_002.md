# PP_WS_DM_PidSdJwt_002

## Objective

Verify that the PID in SD-JWT VC format carries every mandatory attribute and metadata of the PID Rulebook section 5.2, with the claim names and encodings of its tables.

## References

- [ARF] Annex 2, PID_17, PID_18, ISSU_14
- [ARF] Annex 3.01 (PID Rulebook), section 5.2

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

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format, it passes every check of the reference validator, and `family_name`, `given_name`, `birthdate`, `place_of_birth`, `nationalities`, `issuing_authority` and `issuing_country` are present, and every claim of the Rulebook has its JSON type: strings, `birthdate` and the dates as `full-date` strings, `place_of_birth` and `address` as objects, `nationalities` as a non-empty array of ISO 3166-1 alpha-2 codes, `age_equal_or_over` as an object of booleans, `sex`, `age_in_years` and `age_birth_year` as unsigned integers (`pid-attributes`).

## Comments

The named check runs in this test case only; the other checks of the reference validator run as in `PP_WS_IA_MainInteraction_001` and must pass too.

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`).
