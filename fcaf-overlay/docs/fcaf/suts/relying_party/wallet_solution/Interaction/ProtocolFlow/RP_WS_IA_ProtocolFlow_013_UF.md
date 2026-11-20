# RP_WS_IA_ProtocolFlow_013_UF

## Objective

Verify that the Relying Party rejects an Authorization Response whose `state` is not that of its request, or is missing, when the request carries a `state`.

## References

- [OpenID4VP] section 5.2, 14.3.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.
4. The requests of the Relying Party via redirects carry a `state`.

## Test Scenario

1. Perform a presentation for `default_query_pid` via redirects in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its decrypted payload carries a newly generated random `state` instead of the `state` of the request.
2. Perform a presentation for `default_query_pid` via redirects in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its decrypted payload carries no `state`.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

A Relying Party whose requests carry no `state` does not meet the precondition, and the test case does not apply to it.
