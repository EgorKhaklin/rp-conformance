# RP_WS_SH_Encoding_001_UF

## Objective

Verify that the Relying Party rejects an Authorization Response whose `response` is not a well-formed compact JWE, answering via redirects with an HTTP status 4xx that reveals no internal details.

## References

- [RFC7516] section 7.1, 9
- [OpenID4VP] section 8.3.1
- [HAIP] section 5
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` or `RP_WS_IA_MainInteraction_001b` passed in the same environment for the presentation flow of this test case.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its `response` parameter is the JWE without its last segment, the authentication tag, so it has four segments instead of five.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the protected header segment of the JWE in its `response` parameter contains the characters `*` and `!`, which are not in the base64url alphabet.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the `response_uri` answers the Authorization Response with an HTTP status 4xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the `response_uri` answers the Authorization Response with an HTTP status 4xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.

## Comments

The credential format does not affect this test case; use `default_credential_pid` in a format the Relying Party requests.

Via the W3C Digital Credentials API the response returns to the Relying Party's own page, which passes it on to its back end in a way OpenID4VP leaves to the Relying Party; there the HTTP status and the body of that answer are not evaluated.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
