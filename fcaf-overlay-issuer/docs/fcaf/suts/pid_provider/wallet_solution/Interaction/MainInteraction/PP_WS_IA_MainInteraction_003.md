# PP_WS_IA_MainInteraction_003

## Objective

- `PA`: Verify that the PID Provider issues the PID in both formats, SD-JWT VC and mdoc, in one authorization in the pre-authorized code flow: one access token, two credential requests, and that both credentials pass every check of the reference validator.
- `AC`: Verify that the PID Provider issues the PID in both formats, SD-JWT VC and mdoc, in one authorization in the authorization code flow with PAR and PKCE: one access token, two credential requests, and that both credentials pass every check of the reference validator.

## References

- [ARF] Annex 2, ISSU_12, ISSU_12a
- [OpenID4VCI] sections 6 and 8

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
    - `PA`: The adapter creates one credential offer for `SUBJ-1` and the PID configurations in SD-JWT VC and mdoc format. `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation and, with the one access token, sends a credential request for each configuration, each with a fresh `c_nonce` and proof.
    - `AC`: The adapter creates one credential offer for `SUBJ-1` and the PID configurations in SD-JWT VC and mdoc format. `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation and, with the one access token, sends a credential request for each configuration, each with a fresh `c_nonce` and proof.

## Expected results

1. The Provider issues both credentials (HTTP 200 to each credential request), one in SD-JWT VC format (`dc+sd-jwt`) and one in mdoc format (`mso_mdoc`). Every credential passes every check of the reference validator.

## Comments

Execute this test case once for each grant the Provider declares in its ICS (ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `PA` (`P-PID`, `P-SD`, `P-MD`, `P-PA`), `AC` (`P-PID`, `P-SD`, `P-MD`, `P-AC`).
