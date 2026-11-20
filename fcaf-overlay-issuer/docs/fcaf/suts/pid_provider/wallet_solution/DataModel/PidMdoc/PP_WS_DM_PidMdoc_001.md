# PP_WS_DM_PidMdoc_001

## Objective

Verify that the docType and namespace of the PID in mdoc format are `eu.europa.ec.eudi.pid.1`, and that domestic attributes are only in a domestic namespace.

## References

- [ARF] Annex 2, PID_04, PID_05, PID_06
- [ARF] Annex 3.01 (PID Rulebook), chapter 4

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.

## Expected results

1. The Provider issues the credential (HTTP 200) in mdoc format, it passes every check of the reference validator, and the MSO docType is `eu.europa.ec.eudi.pid.1`, the PID attributes are in namespace `eu.europa.ec.eudi.pid.1`, every element of that namespace is an attribute of the Rulebook, and any other namespace is a domestic one (`eu.europa.ec.eudi.pid.<country>.<n>`) (`pid-type`).

## Comments

The named check runs in this test case only; the other checks of the reference validator run as in `PP_WS_IA_MainInteraction_001` and must pass too.

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
