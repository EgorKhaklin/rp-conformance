# RP_WS_MS_ProtocolMessages_002

## Objective

Verify that the request object of the Relying Party carries the parameters of a request for response mode `direct_post.jwt`.

## References

- [HAIP] section 5, 5.1
- [OpenID4VP] section 5.2, 5.8, 8.2, 8.3.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` via redirects and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. The request object carries `response_type` `vp_token`, `response_mode` `direct_post.jwt`, an https `response_uri`, no `redirect_uri`, the `client_id` of the invocation URI, a `nonce`, a `dcql_query` and `aud` `https://self-issued.me/v2`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
