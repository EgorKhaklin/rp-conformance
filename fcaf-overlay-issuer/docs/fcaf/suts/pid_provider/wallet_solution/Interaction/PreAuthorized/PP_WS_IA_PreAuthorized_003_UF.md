# PP_WS_IA_PreAuthorized_003_UF

## Objective

Verify that the PID Provider rejects a pre-authorized code after its lifetime with `invalid_grant`.

## References

- [OpenID4VCI] sections 4.1.1 and 6.3

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code with `tx_code`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that its token request is sent one hour after the lifetime of the pre-authorized code the SUT declares (ICS-14.pre_authorized_code) (fault `token-request.pre-authorized-code-expired`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_grant`; never HTTP 5xx.

## Comments

The lifetime is the one the Provider declares (ICS-14.pre_authorized_code); the token request is sent one hour after it (issuer catalogue section 3.5).

The step waits that long only when the run allows it (`--max-wait`), and then runs last; otherwise it is NOT APPLICABLE in the run. Against EUDIPLO (ICS-14.pre_authorized_code PT24H) it waits 25 hours, so the reference run does not execute it.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
