# RP_WS_SM_SessionBinding_007_UF

## Objective

Verify that the Relying Party rejects a presentation in SD-JWT VC format via the W3C Digital Credentials API whose KB-JWT is addressed to the Origin of another page.

## References

- [OpenID4VP] section 5.9.3, A.4, B.3.6
- [RFC9901] section 7.3
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
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` via the W3C Digital Credentials API in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `aud` claim of its KB-JWT is `origin:https://other.example` instead of `origin:` followed by the Origin of the page.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
