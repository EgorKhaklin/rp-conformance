# RP_AP_SM_Revocation_013aE_UF

## Objective

Verify that the Relying Party does not use a Status List Token in JWT format whose signer certificate is outside its validity period.

## References

- [Token Status List] section 5.1, 8.3
- [RFC7519] section 7.2
- [RFC5280] section 6.1.3
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests non-qualified EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Status List Token in JWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_004a` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider serves, for the status list referenced by the credential, a Status List Token that holds the value 0x00 at the credential's index and is valid in every other respect, except that its signer certificate has expired.
2. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider serves, for the status list referenced by the credential, a Status List Token that holds the value 0x00 at the credential's index and is valid in every other respect, except that its signer certificate is not yet valid.

## Expected results

1. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
2. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).

## Comments

A Status List Token that cannot be used leaves no reliable revocation status. For PIDs the Relying Party SUT rejects the presentation in that case; for QEAA, PuB-EAA and non-qualified EAA the policy declared in the ICS applies (see [ARF] Annex 2, VCR_14).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
