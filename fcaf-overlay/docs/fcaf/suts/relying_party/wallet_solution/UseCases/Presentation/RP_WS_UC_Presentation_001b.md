# RP_WS_UC_Presentation_001b

## Objective

Verify that the Relying Party accepts a valid combined presentation of a PID and an EAA in mdoc format for a DCQL query that requests both.

## References

- [OpenID4VP] section 6, 8.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa` in which the Conformance Wallet presents `default_credential_pid` and `default_credential_eaa` in mdoc format, each for its credential query, in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid_eaa`, with the values of `default_credential_pid` and `default_credential_eaa`.

## Comments

This test case is the positive control for the unhappy-flow test cases of `RP_WS_UC_Presentation` in mdoc format. When it fails, those test cases cannot produce a meaningful verdict in the same environment.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
