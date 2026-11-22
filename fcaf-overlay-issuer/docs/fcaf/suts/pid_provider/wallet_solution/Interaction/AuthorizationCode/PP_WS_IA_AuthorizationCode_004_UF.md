# PP_WS_IA_AuthorizationCode_004_UF

## Objective

Verify that the PID Provider accepts a PAR `request_uri` only once and only before it expires.

## References

- [RFC 9126] sections 4 and 7.3

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
5. The adapter completes the authentication of `SUBJ-1` at the Provider (`authenticateSubject`, ICS-03).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` without mutation: PAR with PKCE `S256`, the authorization request through the adapter, token request with `code_verifier`, nonce and credential request.
2. `CW-1` sends the authorization request of step 1 again, with the same `client_id` and `request_uri`, through the adapter.
3. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that its authorization request is sent one hour after the `expires_in` of the `request_uri` the pushed authorization request returned (fault `authorization.request-uri-expired`).

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

One-time use is a SHOULD in RFC 9126 section 7.3 (OIDF `fapi2-…-par-attempt-reuse-request_uri` reports success as a WARNING); the catalogue requires the rejection.

Step 3 waits the `expires_in` of the PAR response plus one hour (issuer catalogue section 3.5; OIDF `fapi2-…-par-attempt-to-use-expired-request_uri`). It runs only when the run allows that wait (`--max-wait`), and then last; otherwise it is NOT APPLICABLE in the run and the verdict is that of steps 1 and 2. Against EUDIPLO (`expires_in` 60) it waits 61 minutes.

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
