# RP_WS_IA_ProtocolFlow_002

## Objective

Verify that the request object of the Relying Party can be retrieved from its `request_uri` more than once.

## References

- [OpenID4VP] section 5.10
- [RFC9101] section 5.2
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

1. Start a presentation for `default_query_pid` via redirects; the Conformance Wallet retrieves the request object from the `request_uri` with GET, and then a second time with GET, without answering the request.

## Expected results

1. The second retrieval returns HTTP status 200 with a request object of the same `client_id`.

## Comments

The OIDF verifier test module `oid4vp-1final-verifier-request-uri-fetched-twice` covers the same objective.

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
