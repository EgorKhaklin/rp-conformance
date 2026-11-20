# RP_WS_UC_Presentation_011b_UF

## Objective

Verify that the Relying Party rejects a combined presentation in mdoc format of a PID and an EAA of different persons when it binds the credentials of a combined presentation by their identifying attributes.

## References

- [ARF] section 6.6.3.10
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.
- Relying Party binds the credentials of a combined presentation by comparing their identifying attributes (attribute-based binding).

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_UC_Presentation_010b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa_identifying` in which the Conformance Wallet presents `default_credential_pid` and a variant of `default_credential_eaa` that additionally carries the family name, the given name and the birth date of another person (`Musterfrau`, `Gabriele`, `1971-03-05`), each for its credential query, in a valid Authorization Response.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

Both credentials are valid and bound to the same Wallet Unit key; only their identifying attributes differ.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
