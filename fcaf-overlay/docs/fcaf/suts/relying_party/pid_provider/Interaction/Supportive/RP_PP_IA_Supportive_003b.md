# RP_PP_IA_Supportive_003b

## Objective

Verify that the Relying Party retrieves a fresh Status List Token in CWT format once the `ttl` of the token it retrieved before has passed, and detects a revocation made in between.

## References

- [Token Status List] section 8.3, 13.7
- [ARF] Annex 2, VCR_15
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party checks the revocation status of PIDs.
- Relying Party caches Status List Tokens.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.
- Status List Token in CWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.
4. Both credentials of this test case reference the same status list URI, from which the Relying Party has not retrieved a status list before, at the index 5.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response, while the Test Status Provider serves a valid Status List Token for it with a `ttl` of 1 second that holds the value 0x00 at the credential's index.
2. Let the Test Status Provider serve, at the same URI, a new Status List Token with a `ttl` of 1 second that holds the value 0x01 (INVALID) at that index; wait 5 seconds, longer than the `ttl`; then perform a presentation for `default_query_pid` in which the Conformance Wallet presents a newly issued `default_credential_pid` with the same status list reference in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.

## Comments

The token carries the shortest `ttl` the claim can express, 1 second, so the test case does not wait out a longer cache period. The second credential stands for the first one presented again: the Relying Party sees the same status list URI and index.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
