# RP_WS_MS_ProtocolMessages_003

## Objective

Verify that the Relying Party uses a fresh `nonce` of sufficient entropy in every request.

## References

- [OpenID4VP] section 5.2, 14.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start 20 presentations for `default_query_pid` and capture the requests the Conformance Wallet receives, without answering them.

## Expected results

1. Every request carries a `nonce` of at least 22 characters from the base64url alphabet (at least 128 bits), and no two requests carry the same `nonce`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
