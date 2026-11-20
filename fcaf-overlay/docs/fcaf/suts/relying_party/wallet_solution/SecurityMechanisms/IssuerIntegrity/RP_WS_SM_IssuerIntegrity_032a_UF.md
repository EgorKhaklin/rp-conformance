# RP_WS_SM_IssuerIntegrity_032a_UF

## Objective

Verify that the Relying Party rejects a credential in SD-JWT VC format whose signing certificate is issued by an expired intermediate CA.

## References

- [RFC5280] section 6.1
- [RFC7515] section 4.1.6
- [SD-JWT VC] section 2.5
- [HAIP] section 6.1.1
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

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it is issued by `PP-I`, whose signing certificate is issued by its intermediate CA `CA-PP-I-INT`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` issued by `PP-I` that differs from it only in that its signing certificate is issued by an intermediate CA of `PP-I` under the anchor `CA-PP-I` whose certificate has expired.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid` issued by `PP-I`.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

Step 1 shows that the Relying Party accepts a PID whose signing certificate is issued by an intermediate CA under a listed anchor, so the defect of the intermediate CA is the only difference in step 2.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
