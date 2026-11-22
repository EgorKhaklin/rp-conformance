# RP_WS_SM_Validity_020b

## Objective

Verify that the Relying Party handles a PID in mdoc format whose administrative expiry date has passed, while its technical validity has not ended, as the policy it declares says.

## References

- [PID rulebook]
- [ARF] section 5
- [ISO/IEC 18013-5] section 9.3.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.
4. The Relying Party is configured to request, with `default_query_pid` in mdoc format, also the administrative expiry date of the PID, `expiry_date`.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its `expiry_date` lies seven days in the past, while its technical validity (`validUntil`) has not ended.

## Expected results

1. If the Relying Party declares in its ICS that it rejects such a PID (RP.P.12 Reject), it rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. If it declares that it accepts it (RP.P.12 Accept), it accepts the presentation: its verification result reports success and releases exactly the attributes requested, `expiry_date` included, with the values of the presented credential.

## Comments

The PID Rulebook distinguishes the administrative validity of the PID (its expiry date) from the technical validity of the credential. Whether a PID past its expiry date is still acceptable is a decision of the relying service; the ICS item RP.P.12 declares it. A PID whose expiry date is not requested never reaches the Relying Party, since the Conformance Wallet discloses only the requested attributes.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
