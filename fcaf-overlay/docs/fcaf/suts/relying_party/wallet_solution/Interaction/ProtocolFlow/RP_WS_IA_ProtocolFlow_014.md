# RP_WS_IA_ProtocolFlow_014

## Objective

Verify that the Relying Party ends a transaction via the W3C Digital Credentials API as failed when the wallet returns an error object.

## References

- [OpenID4VP] section A.4
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via the W3C Digital Credentials API.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Presentation via the W3C Digital Credentials API with response mode `dc_api.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` via the W3C Digital Credentials API; the Conformance Wallet resolves the request and returns the `data` object `{"error": "access_denied"}` to the page.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

A cancelled request (the promise of `navigator.credentials.get` rejected) reaches only the page of the Relying Party; neither OpenID4VP nor HAIP defines what the page reports to its back end, so this test case does not cover it.
