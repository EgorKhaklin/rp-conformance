# RP_WS_IA_ProtocolFlow_010

## Objective

Verify that the Relying Party ends a transaction as failed when the wallet answers with an Authorization Error Response, and acknowledges it with HTTP status 200.

## References

- [OpenID4VP] section 8.2, 8.3.1, 8.5
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

1. Start a presentation for `default_query_pid` via redirects; the Conformance Wallet answers with an unencrypted Authorization Error Response with `error` `access_denied` and the `state` of the request, posted to the `response_uri`.
2. Start a second presentation for `default_query_pid` via redirects; the Conformance Wallet answers it in the same way with `error` `invalid_request`.

## Expected results

1. The `response_uri` answers with HTTP status 200 and `Content-Type` `application/json`. The verification result of the transaction reports a failure and releases no attribute value.
2. The `response_uri` answers with HTTP status 200 and `Content-Type` `application/json`. The verification result of the transaction reports a failure and releases no attribute value.

## Comments

[OpenID4VP] section 8.3.1 permits the wallet to send an error response unencrypted even when the request asks for response mode `direct_post.jwt`.
