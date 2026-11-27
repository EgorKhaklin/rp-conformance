# RP_AP_IA_Supportive_004bE_UF

## Objective

Verify that the Relying Party makes no positive status statement when the endpoint of a Status List Token in CWT format does not answer in time, refuses the connection or answers with an error, and decides within its declared timeout.

## References

- [Token Status List] section 8.1, 8.3
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.
- Status List Token in CWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_004b` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider answers the request for the referenced status list with a valid Status List Token holding the value 0x00 only after the timeout the Relying Party declares in its ICS plus ten seconds.
2. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the status list `uri` of the credential names a port of the Test Status Provider host on which no server listens, so the connection is refused.
3. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider answers the request for the referenced status list with HTTP status 404.
4. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider answers the request for the referenced status list with HTTP status 500.
5. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response, while the Test Status Provider answers the request for the referenced status list with HTTP status 503 and an HTML page instead of a Status List Token.

## Expected results

1. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
2. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
3. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
4. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
5. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).

## Comments

In the first step the Test Status Provider eventually serves a valid Status List Token, so a Relying Party that waits longer than its declared timeout (ICS RP.R.6) accepts the presentation.

A Status List Token that cannot be used leaves no reliable revocation status. For PIDs the Relying Party SUT rejects the presentation in that case; for QEAA, PuB-EAA and non-qualified EAA the policy declared in the ICS applies (see [ARF] Annex 2, VCR_14).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
