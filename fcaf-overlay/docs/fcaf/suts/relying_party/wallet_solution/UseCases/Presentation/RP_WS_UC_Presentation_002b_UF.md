# RP_WS_UC_Presentation_002b_UF

## Objective

Verify that the Relying Party rejects a combined presentation in mdoc format of which one required credential is invalid, and does not release the valid part as verified.

## References

- [OpenID4VP] section 8.6
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
3. Test case `RP_WS_UC_Presentation_001b` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa` in which the Conformance Wallet presents `default_credential_pid` and `default_credential_eaa`, each for its credential query, in an Authorization Response that is valid except that the status list referenced by `default_credential_eaa` holds the value 0x01 (INVALID) at the credential's index, while `default_credential_pid` is valid.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The rejected presentation must not release the attributes of the valid PID either: an OpenID4VP Verifier rejects the whole VP Token when a required credential query is not satisfied by a valid presentation.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
