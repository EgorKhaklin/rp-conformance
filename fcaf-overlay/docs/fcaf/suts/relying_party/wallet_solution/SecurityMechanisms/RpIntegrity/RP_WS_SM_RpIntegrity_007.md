# RP_WS_SM_RpIntegrity_007

## Objective

Verify that the signed request of the Relying Party through the W3C Digital Credentials API names only its own Origin in `expected_origins`.

## References

- [OpenID4VP] section A.2, A.3.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party supports presentations via the W3C Digital Credentials API.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation via the W3C Digital Credentials API with response mode `dc_api.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` via the W3C Digital Credentials API and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. `expected_origins` names the Origin of the Relying Party's page and no other.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
