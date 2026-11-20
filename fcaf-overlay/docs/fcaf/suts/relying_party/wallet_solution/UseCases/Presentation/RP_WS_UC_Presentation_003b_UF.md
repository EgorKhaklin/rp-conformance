# RP_WS_UC_Presentation_003b_UF

## Objective

Verify that the Relying Party rejects a presentation in mdoc format that leaves out a required credential query.

## References

- [OpenID4VP] section 6.4, 8.6
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

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa` in which the Conformance Wallet presents `default_credential_pid` and `default_credential_eaa`, each for its credential query, in an Authorization Response that is valid except that its `vp_token` has no entry for the credential query `pid`, so it carries only the presentation of the EAA.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
