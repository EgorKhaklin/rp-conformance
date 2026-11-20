# PP_WS_SM_TokenBinding_007_UF

## Objective

Verify that the PID Provider rejects an expired access token.

## References

- [RFC 6750] section 3.1

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

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that its credential request is sent once the `expires_in` of the access token, plus the `T_skew` the Provider declares, plus one minute has passed (fault `access-token.expired`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_token`; never HTTP 5xx.

## Comments

The step waits out the access token lifetime: `expires_in`, plus the `T_skew` the Provider declares (ICS-14, at most 5 minutes), plus one minute. The catalogue's "plus one hour" (section 3.5) moves time values the suite writes; a lifetime the Provider enforces can only be waited for, and one minute past the declared tolerance is past any tolerance the Provider declares. A run executes the step only when `ISSUER_MAX_WAIT_SECONDS` (default 600) allows the wait; otherwise the result is INCONCLUSIVE.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
