# PP_WS_IA_PreAuthorized_002_UF

## Objective

Verify that the PID Provider rejects a token request with a wrong `tx_code` with `invalid_grant` and one without the `tx_code` the offer requires with `invalid_request`, and that it limits repeated wrong values: after ten wrong `tx_code` values even the right one is refused.

## References

- [OpenID4VCI] sections 6.1, 6.3 and 13.6.1

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

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code with `tx_code`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that the `tx_code` of its token request is a wrong value of the declared length (fault `token-request.tx-code-wrong`).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code with `tx_code`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that its token request carries no `tx_code`, although the offer requires one (fault `token-request.tx-code-missing`).
3. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code with `tx_code`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that it first sends 10 token requests with wrong `tx_code` values of the declared length, then the token request with the right `tx_code` (fault `token-request.tx-code-repeated`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_grant`; never HTTP 5xx.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_request`; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

Each step uses a new offer. OpenID4VCI section 6.3 names the error of each: `invalid_grant` for a wrong `tx_code` (step 1), `invalid_request` when the Authorization Server expects a `tx_code` and the Client provides none (step 2). Step 3 expects `REJ` with any error code for the last, right `tx_code`: OpenID4VCI 1.0 sets no limit on wrong attempts (issuer catalogue section 8.2), the limit rests on its security considerations (section 13.6.1) and ISSU policy.

Applies when the Provider protects pre-authorized codes with a `tx_code` (ICS-03.tx_code); the runner reports the test case NOT APPLICABLE for a Provider that declares offers without one only.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
