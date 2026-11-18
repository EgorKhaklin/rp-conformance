# RP_WS_MS_ProtocolMessages_004

## Objective

Verify that a `state` the Relying Party uses is fresh and unguessable.

## References

- [OpenID4VP] section 5.2, 14.3.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start 20 presentations for `default_query_pid` via redirects and capture the requests the Conformance Wallet receives, without answering them.

## Expected results

1. If the requests carry a `state`, each one is at least 22 characters from the base64url alphabet (at least 128 bits), and no two requests carry the same `state`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
