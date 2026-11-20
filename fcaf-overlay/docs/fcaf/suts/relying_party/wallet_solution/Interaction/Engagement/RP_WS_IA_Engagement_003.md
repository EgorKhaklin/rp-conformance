# RP_WS_IA_Engagement_003

## Objective

Verify that the Relying Party invokes the wallet through the W3C Digital Credentials API with a signed OpenID4VP request.

## References

- [HAIP] section 5.2
- [OpenID4VP] section A.1, A.3
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

1. The page of the Relying Party calls `navigator.credentials.get` with a digital credential request of protocol `openid4vp-v1-signed` or `openid4vp-v1-multisigned` whose request object is signed.

## Comments

[HAIP] section 5.2 requires signed requests through the Digital Credentials API, so the unsigned protocol `openid4vp-v1-unsigned` does not pass.

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.
