# RP_WS_MS_ProtocolMessages_005

## Objective

Verify that the Relying Party sends a signed request with response mode `dc_api.jwt` through the W3C Digital Credentials API.

## References

- [OpenID4VP] section A.2, A.3.2
- [HAIP] section 5.2
- [ARF] Annex 2, OIA_08, OIA_08a
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

1. The request uses the protocol `openid4vp-v1-signed` or `openid4vp-v1-multisigned`, carries `response_mode` `dc_api.jwt` and `expected_origins`, and carries no `response_uri`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
