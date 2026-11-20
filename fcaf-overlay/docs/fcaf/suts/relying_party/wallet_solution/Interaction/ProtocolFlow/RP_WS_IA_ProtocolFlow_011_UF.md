# RP_WS_IA_ProtocolFlow_011_UF

## Objective

Verify that the Relying Party rejects an Authorization Response that arrives after the lifetime of its transaction.

## References

- [OpenID4VP] section 14.1
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
4. The Relying Party declares its transaction lifetime `T_tx` in its ICS (RP.P.7).

## Test Scenario

1. Start a presentation for `default_query_pid`; the Conformance Wallet retrieves the request at once, and sends a valid Authorization Response that presents `default_credential_pid` only when `T_tx` plus 2 seconds have passed since the start.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
