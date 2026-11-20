# AP_WS_IA_AuthorizationCode_005_UF

## Objective

- `SD+AC+Q`: Verify that the QEAA Provider redeems an authorization code only once, only for the client it was issued to, and only with the `redirect_uri` of its authorization request; each other redemption is rejected with `invalid_grant`.
- `SD+AC+PB`: Verify that the PuB-EAA Provider redeems an authorization code only once, only for the client it was issued to, and only with the `redirect_uri` of its authorization request; each other redemption is rejected with `invalid_grant`.
- `SD+AC+E`: Verify that the non-qualified EAA Provider redeems an authorization code only once, only for the client it was issued to, and only with the `redirect_uri` of its authorization request; each other redemption is rejected with `invalid_grant`.

## References

- [RFC 6749] sections 4.1.3, 5.2 and 10.5

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The adapter completes the authentication of `SUBJ-1` at the Provider (`authenticateSubject`, ICS-03).
6. Wallet Unit `CW-2` of `WP-A` (section 3.4).
7. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` without mutation: PAR with PKCE `S256`, the authorization request through the adapter, token request with `code_verifier`, nonce and credential request.
2. `CW-1` sends the token request of step 1 again: the same `code`, `code_verifier` and `redirect_uri`, with a fresh WIA PoP and DPoP proof.
3. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` without mutation up to the authorization response, and sends no token request.
4. `CW-2` sends a token request with the `code`, `code_verifier` and `redirect_uri` of step 3, authenticated with its own WIA, PoP, DPoP proof and `client_id`.
5. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` as in `AP_WS_IA_MainInteraction_001`, except that the `redirect_uri` of its token request is `https://other-wallet.rp-conformance.invalid/callback`, not the one of its pushed authorization request (fault `token-request.redirect-uri-other`).

## Expected results

1. Per variant:
    - `SD+AC+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+AC+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+AC+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_grant`; never HTTP 5xx.
3. The Provider redirects to the `redirect_uri` of `CW-1` with an authorization code.
4. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_grant`; never HTTP 5xx.
5. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_grant`; never HTTP 5xx.

## Comments

OIDF `fapi2-…-attempt-reuse-authorization-code-after-one-second` and `fapi2-…-ensure-authorization-code-is-bound-to-client` (partial: the OIDF plan does not test the `redirect_uri` binding). Revoking the tokens of step 1 after the reuse is not required here.

Steps 2 and 4 send valid messages; only the code was redeemed before (step 2) or issued to another client (step 4). The reference validator fails `authorization-code` and `code-binding` on them.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`).
