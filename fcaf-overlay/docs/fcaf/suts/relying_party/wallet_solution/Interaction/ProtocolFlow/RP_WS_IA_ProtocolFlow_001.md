# RP_WS_IA_ProtocolFlow_001

## Objective

Verify that the `request_uri` of the Relying Party returns the request object with the media type `application/oauth-authz-req+jwt`.

## References

- [RFC9101] section 5.2
- [OpenID4VP] section 5.10.1
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

1. The `request_uri` answers with `Content-Type` `application/oauth-authz-req+jwt`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
