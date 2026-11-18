# RP_WS_SM_RpIntegrity_004

## Objective

Verify that the Relying Party signs its request with a valid access certificate that carries its identity.

## References

- [ETSI TS 119 411-8] section 6.6.1
- [ARF] Annex 2, RPA_02, Reg_32, Reg_33, Reg_34
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

1. The first certificate in `x5c` is valid at the time of the request and follows the access certificate profile, including its policy, its contact information and an entity identifier in its subject.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
