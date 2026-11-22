# RP_WS_SH_Encoding_004_UF

## Objective

Verify that the Relying Party rejects an Authorization Response larger than the maximum size it declares, without exhausting its resources, and stays available.

## References

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

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its decrypted payload additionally carries the member `padding`, a string long enough that the `response` parameter exceeds the maximum response size the Relying Party declares in its ICS by one MiB.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents a newly issued `default_credential_pid` in a valid Authorization Response, immediately after the previous step.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via the DC API, the Relying Party's page receiving HTTP 4xx, or its request forwarding the response failing with a network error, also counts as the rejection: the verification result need not report a failure.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of the newly issued credential.

## Comments

The maximum response size is the value the Relying Party declares in its ICS (RP.P.11). The padding is a member of the encrypted payload, so a Relying Party without a size limit decrypts the response and accepts it.

Via the DC API the response reaches the Relying Party through its own page. A back end that refuses the oversized body (for example HTTP 413 from its body parser) may do so before setting CORS headers, so the page sees only a network error, and the transaction stays open. Either is a rejection; the step does not require a failed verification result (spec review 2026-11-20, catalogue section 8.3).

The last step shows that the Relying Party stays available: a Relying Party that crashed or exhausted its resources on the previous step cannot accept it.

The credential format does not affect this test case; use `default_credential_pid` in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
