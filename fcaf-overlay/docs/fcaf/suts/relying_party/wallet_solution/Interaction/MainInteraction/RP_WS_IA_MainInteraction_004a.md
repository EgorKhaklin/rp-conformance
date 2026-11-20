# RP_WS_IA_MainInteraction_004a

## Objective

Verify that the Relying Party accepts a valid presentation of a non-qualified EAA in SD-JWT VC format and releases exactly the requested attributes.

## References

- [ARF] Annex 2, OIA_15
- [HAIP] section 5, 6.1
- [OpenID4VP] section 8.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_eaa`, with the values of `default_credential_eaa`.

## Comments

This test case is the positive baseline for non-qualified EAAs in SD-JWT VC format. `RP_WS_SM_TrustMechanisms_014a` presents the same credential to verify the root of trust of the category.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
