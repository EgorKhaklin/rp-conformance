# PP_WS_DM_Portrait_001

## Objective

- `SD+PA`, `SD+AC`: Verify that, when the User opts out of the portrait, the PID in SD-JWT VC format carries the portrait as an empty string.
- `MD+PA`, `MD+AC`: Verify that, when the User opts out of the portrait, the PID in mdoc format carries the portrait as an empty `bstr`.

## References

- [ARF] Annex 2, PID_03

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
5. The Provider offers the portrait opt-out, and the adapter can make `SUBJ-1` opt out (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1`, who opted out of the portrait, and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1`, who opted out of the portrait, and the PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1`, who opted out of the portrait, and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1`, who opted out of the portrait, and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.

## Expected results

1. Per variant:
    - `SD+PA`, `SD+AC`: The Provider issues the credential (HTTP 200) in SD-JWT VC format, it passes every check of the reference validator, and `picture` is present as an empty string (`pid-portrait`).
    - `MD+PA`, `MD+AC`: The Provider issues the credential (HTTP 200) in mdoc format, it passes every check of the reference validator, and `portrait` is present as an empty byte string (`pid-portrait`).

## Comments

The portrait is `portrait` (`bstr`) in mdoc and `picture` in SD-JWT VC (PID Rulebook chapters 4 and 5).

NOT APPLICABLE when the ICS declares no portrait opt-out (`ICS-17.portrait_opt_out`).

The named check runs in this test case only; the other checks of the reference validator run as in `PP_WS_IA_MainInteraction_001` and must pass too.

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
