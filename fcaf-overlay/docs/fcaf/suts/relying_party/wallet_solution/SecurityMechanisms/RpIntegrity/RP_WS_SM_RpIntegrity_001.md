# RP_WS_SM_RpIntegrity_001

## Objective

Verify that the request object of the Relying Party is a JWS of type `oauth-authz-req+jwt` with an agreed algorithm that verifies with the leaf certificate it carries.

## References

- [HAIP] section 5, 7
- [RFC9101] section 10.8
- [ARF] Annex 2, OIA_03
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. The request object has `typ` `oauth-authz-req+jwt` and `alg` `ES256`, and its signature verifies with the first certificate in `x5c`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
