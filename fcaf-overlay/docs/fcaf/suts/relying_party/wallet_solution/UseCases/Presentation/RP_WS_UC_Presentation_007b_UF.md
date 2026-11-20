# RP_WS_UC_Presentation_007b_UF

## Objective

Verify that the Relying Party rejects a presentation in mdoc format that satisfies no option of a required credential set.

## References

- [OpenID4VP] section 6.2, 6.4.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.
- Relying Party requests PuB-EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_UC_Presentation_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid_or_eaa` in which the Conformance Wallet presents only `default_credential_pubeaa` in mdoc format, which satisfies no option of the required credential set, for its credential query, in a valid Authorization Response.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

`default_query_pid_or_eaa` has a required credential set with the options `pid` and `eaa`, and an optional credential set with the option `pubeaa`.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
