# PP_WS_IA_AuthorizationCode_001_UF

## Objective

Verify that the PID Provider rejects an authorization request that was not pushed with PAR.

## References

- [HAIP] sections 4 and 4.3
- [RFC 9126] section 5

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
5. The adapter completes the authentication of `SUBJ-1` at the Provider (`authenticateSubject`, ICS-03).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that it sends no pushed authorization request: the authorization request goes to the authorization endpoint with every parameter in its query (`response_type`, `client_id`, `redirect_uri`, `state`, `issuer_state`, `code_challenge`, `code_challenge_method`, `authorization_details`) (fault `authorization.no-par`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The authorization endpoint rejects with a redirect carrying `error`, or, since no pushed request names the client, with an error page (HTTP 4xx, RFC 6749 section 4.1.2.1); either passes, an authorization code or a token does not. OIDF `fapi2-…-ensure-unsigned-authorization-request-without-using-par-fails`.

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
