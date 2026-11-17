# RP_WS_SM_RpIntegrity_006

## Objective

Verify that the Relying Party never sends an unsigned request.

## References

- [HAIP] section 5.1
- [ARF] Annex 2, RPA_01, RPA_03
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. Via redirects the request object is signed; via the W3C Digital Credentials API the request uses the protocol `openid4vp-v1-signed` or `openid4vp-v1-multisigned`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
