# RP_WS_IA_ProtocolFlow_008_UF

## Objective

Verify that the front end of the Relying Party redeems a response code once only.

## References

- [OpenID4VP] section 8.2, 13.3
- [HAIP] section 5.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via redirects.
- Relying Party redeems the response code of a presentation via redirects at its own front end.

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

1. Perform a presentation for `default_query_pid` via redirects (transaction T1) in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response, and does not open the `redirect_uri` the Relying Party returns.
2. In the user agent that started T1, open the `redirect_uri` of T1.
3. In the same user agent, open the `redirect_uri` of T1 a second time.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.
2. The front end of the Relying Party shows the user agent the result of T1: it releases the attributes of its verification result.
3. The front end of the Relying Party releases no attribute of T1 to the user agent, and does not answer with HTTP status 5xx.

## Comments

The response code protects against session fixation: only the user agent in which the transaction was started, and which the wallet sends back with the `redirect_uri`, receives the result. The front end of the Relying Party is opened in the user agent that started the transaction, which keeps its session (for example a cookie), or in a fresh user agent without it.
