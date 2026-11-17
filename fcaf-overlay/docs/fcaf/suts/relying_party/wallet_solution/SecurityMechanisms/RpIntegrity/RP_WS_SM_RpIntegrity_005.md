# RP_WS_SM_RpIntegrity_005

## Objective

Verify that the request of the Relying Party carries its registration certificate, issued for the entity of its access certificate.

## References

- [ETSI TS 119 475]
- [ETSI TS 119 472-2]
- [ARF] Annex 2, RPRC_07a, RPRC_10, RPRC_19, RPRC_20
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

1. `verifier_info` carries exactly one registration certificate, by value, whose signature verifies, which validates to an anchor in `TL-RC`, has not expired and names the entity identifier of the access certificate.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
