# RP_WS_IA_ProtocolFlow_005

## Objective

Verify that the Relying Party answers a valid Authorization Response via redirects with a `redirect_uri` that carries a fresh response code.

## References

- [OpenID4VP] section 8.2, 13.3
- [HAIP] section 5.1
- [OpenID4VP] section 14.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Perform a presentation for `default_query_pid` via redirects (transaction T1) in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response, and does not open the `redirect_uri` the Relying Party returns.
2. Perform a presentation for `default_query_pid` via redirects (transaction T2) in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response, and does not open the `redirect_uri` the Relying Party returns.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`. The `response_uri` answers with HTTP status 200 and `Content-Type` `application/json`, with a `redirect_uri` that carries a `response_code` of at least 22 characters from the base64url alphabet (at least 128 bits) that differs from that of every earlier transaction of the test case.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`. The `response_uri` answers with HTTP status 200 and `Content-Type` `application/json`, with a `redirect_uri` that carries a `response_code` of at least 22 characters from the base64url alphabet (at least 128 bits) that differs from that of every earlier transaction of the test case.

## Comments

The response code is read from the `response_code` parameter of the `redirect_uri`. Its entropy is judged by its length and alphabet, as for `nonce` and `state` in `RP_WS_MS_ProtocolMessages_003` and `_004`.
