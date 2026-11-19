# RP_WS_IA_ProtocolFlow_004_UF

## Objective

Verify that the `request_uri` of the Relying Party returns no request object for a completed transaction or an unknown one.

## References

- [OpenID4VP] section 5.10, 14.1
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
2. Retrieve the `request_uri` of T1 again with GET.
3. Start a second presentation (transaction T2) without retrieving its request, and retrieve with GET a `request_uri` that equals that of T1 except that every part in which the `request_uri`s of T1 and T2 differ is replaced by a random value of the same form.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.
2. The `request_uri` answers with an HTTP status 4xx and does not return a request object.
3. The `request_uri` answers with an HTTP status 4xx and does not return a request object.

## Comments

An expired transaction is not part of this test case: `RP_WS_IA_ProtocolFlow_011_UF` covers what the Relying Party accepts after the transaction lifetime.
