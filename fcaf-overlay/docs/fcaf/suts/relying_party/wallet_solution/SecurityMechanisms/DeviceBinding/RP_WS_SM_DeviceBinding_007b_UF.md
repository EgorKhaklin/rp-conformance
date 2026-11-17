# RP_WS_SM_DeviceBinding_007b_UF

## Objective

Verify that the Relying Party rejects a PID in mdoc format that is not bound to a key of the Wallet Unit.

## References

- [OpenID4VP] section 6.1, 8.6
- [ARF] section 6.6.3.8
- [ISO/IEC 18013-5] section 9.1.3
- [OpenID4VP] section B.2.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its MSO carries no `deviceKeyInfo`, so it is bound to no device key.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The Conformance Wallet still adds a device signature made with its own key, so the missing binding in the credential is the only difference from a valid presentation.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
