# RP_WS_IA_ProtocolFlow_012_UF

## Objective

Verify that the Relying Party rejects a second Authorization Response for a completed transaction and keeps the result of the first.

## References

- [OpenID4VP] section 14.1, 14.3.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` via redirects (transaction T1) in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response.
2. Post the identical Authorization Response of step 1 to the `response_uri` of T1 again.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.
2. The `response_uri` answers the second Authorization Response with an HTTP status 4xx, and the verification result of T1 still reports success with the attributes released in step 1.
