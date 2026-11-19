# RP_WS_SM_Validity_020a

## Objective

Verify that the Relying Party handles a PID in SD-JWT VC format whose administrative expiry date has passed, while its technical validity has not ended, as the policy it declares says.

## References

- [PID rulebook]
- [ARF] section 5
- [SD-JWT VC] section 2.4
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.
4. The Relying Party is configured to request, with `default_query_pid` in SD-JWT VC format, also the administrative expiry date of the PID, `date_of_expiry`.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its `date_of_expiry` lies seven days in the past, while its technical validity (`exp`) has not ended.

## Expected results

1. If the Relying Party declares in its ICS that it rejects such a PID (RP.P.11 Reject), it rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. If it declares that it accepts it (RP.P.11 Accept), it accepts the presentation: its verification result reports success and releases exactly the attributes requested, `date_of_expiry` included, with the values of the presented credential.

## Comments

The PID Rulebook distinguishes the administrative validity of the PID (its expiry date) from the technical validity of the credential. Whether a PID past its expiry date is still acceptable is a decision of the relying service; the ICS item RP.P.11 declares it. A PID whose expiry date is not requested never reaches the Relying Party, since the Conformance Wallet discloses only the requested attributes.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
