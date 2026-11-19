# RP_WS_IA_ProtocolFlow_003

## Objective

Verify that the Relying Party, when it sets `request_uri_method` to `post`, returns the `wallet_nonce` the wallet posts in the signed request object.

## References

- [OpenID4VP] section 5.10, 5.10.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party supports presentations via redirects.
- Relying Party sets `request_uri_method` to `post`.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` via redirects; the Conformance Wallet retrieves the request object with an HTTP POST to the `request_uri` that carries `wallet_metadata` and a newly generated `wallet_nonce`, without answering the request.

## Expected results

1. The invocation URI carries `request_uri_method` `post`, and the request object returned to the POST carries the posted `wallet_nonce`.

## Comments

The OIDF verifier test module `oid4vp-1final-verifier-request-uri-method-post` covers the same objective.

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
