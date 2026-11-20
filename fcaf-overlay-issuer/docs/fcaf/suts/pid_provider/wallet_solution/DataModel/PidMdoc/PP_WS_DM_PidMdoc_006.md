# PP_WS_DM_PidMdoc_006

## Objective

Verify that the values in the mdoc and in the SD-JWT VC of the same issuance are the same.

## References

- [ARF] Annex 2, ISSU_12, PID_02

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+MD+PA`: The adapter creates one credential offer for `SUBJ-1` and the PID configurations in SD-JWT VC and mdoc format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation and requests both credentials with the one access token.
    - `SD+MD+AC`: The adapter creates one credential offer for `SUBJ-1` and the PID configurations in SD-JWT VC and mdoc format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation and requests both credentials with the one access token.

## Expected results

1. The Provider issues the credential (HTTP 200), it passes every check of the reference validator, and every attribute of the Rulebook present in one format is present in the other with the same value, under the name the Rulebook gives it there (for example `birthdate` and `birth_date`, `age_equal_or_over.18` and `age_over_18`; the portrait only for presence) (`pid-formats`).

## Comments

Execute this test case once for each grant the Provider declares in its ICS (ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+MD+PA` (`P-PID`, `P-SD`, `P-MD`, `P-PA`), `SD+MD+AC` (`P-PID`, `P-SD`, `P-MD`, `P-AC`).
