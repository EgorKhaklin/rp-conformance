# RP_WS_UC_Presentation_010a

## Objective

Verify that the Relying Party accepts a combined presentation in SD-JWT VC format of a PID and an EAA whose identifying attributes match.

## References

- [ARF] section 6.6.3.10
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests non-qualified EAAs.
- Relying Party binds the credentials of a combined presentation by comparing their identifying attributes (attribute-based binding).

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa_identifying` in which the Conformance Wallet presents `default_credential_pid` and a variant of `default_credential_eaa` that additionally carries the family name, the given name and the birth date of the holder of the PID, with the same values as the PID, each for its credential query, in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid_eaa_identifying`, with the values of `default_credential_pid` and the EAA.

## Comments

This test case is the positive control of `RP_WS_UC_Presentation_011` in the same format.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
