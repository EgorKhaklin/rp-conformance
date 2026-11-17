# RP_WS_SM_DeviceBinding_013b_UF

## Objective

Verify that the Relying Party rejects device authentication in mdoc format with an algorithm outside the agreed cryptographic mechanisms.

## References

- [ECCG ACM]
- [HAIP] section 7
- [ARF] Annex 2, OIA_03
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

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the mdoc is bound (`deviceKeyInfo`) to a key of the Conformance Wallet on curve secp256k1, and its `DeviceSignature` is made with that key and algorithm `ES256K` (-47).

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The credential is bound to the key that makes the device authentication, so the algorithm and its curve are the only difference from a valid presentation.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
