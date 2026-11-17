# RP_WS_SM_SessionBinding_005a_UF

## Objective

Verify that the Relying Party rejects a valid presentation in SD-JWT VC format that was made for an earlier transaction and is sent again in a later one.

## References

- [OpenID4VP] section 14.1, 14.1.2
- [RFC9901] section 7.3
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` (transaction T1) in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response.
2. Perform a presentation for `default_query_pid` (transaction T2) in which the Conformance Wallet sends an Authorization Response that is valid except that its `vp_token` carries, unchanged, the presentation the Conformance Wallet sent in T1, while the Authorization Response itself is encrypted to the encryption key of T2.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The presentation sent in T2 is the one the Relying Party accepted in T1, so the `nonce` of its KB-JWT is that of the request of T1. Only the transaction differs.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
