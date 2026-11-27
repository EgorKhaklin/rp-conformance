# RP_AP_SM_Revocation_014bQ_UF

## Objective

Verify that the Relying Party handles a Status List Token in CWT format that was issued in the future, or longer ago than the maximum age it declares, as its declared freshness policy says.

## References

- [Token Status List] section 5.2, 8.3
- [ARF] Annex 2, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests QEAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.
- Status List Token in CWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_002b` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents `default_credential_qeaa` in a valid Authorization Response, while the Test Status Provider serves, for the status list referenced by the credential, a Status List Token that holds the value 0x00 at the credential's index and is valid in every other respect, except that its issued at claim (6) is set to the current time plus `T_skew` plus one hour.
2. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents `default_credential_qeaa` in a valid Authorization Response, while the Test Status Provider serves, for the status list referenced by the credential, a Status List Token that holds the value 0x00 at the credential's index and is valid in every other respect, except that its issued at claim (6) lies 30 days in the past, while its expiration time (4) lies one day in the future.

## Expected results

1. If the Relying Party declares in its ICS that it refuses a Status List Token whose `iat` lies in the future (RP.R.8 Yes), it makes no positive status statement and handles the presentation as it declares in RP.R.2: it rejects it (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`). Otherwise it accepts the presentation and releases exactly the attributes requested in `default_query_qeaa`, with the values of `default_credential_qeaa`.
2. If the maximum age of a Status List Token the Relying Party declares in its ICS (RP.R.7) is 30 days or less, it makes no positive status statement and handles the presentation as it declares in RP.R.2: it rejects it (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`). If it declares no maximum age, or a longer one, it accepts the presentation and releases exactly the attributes requested in `default_query_qeaa`, with the values of `default_credential_qeaa`.

## Comments

[Token Status List] section 8.3 leaves the freshness of a Status List Token to the policy of the Relying Party; the ICS items RP.R.7 and RP.R.8 declare it. A refused token leaves no reliable revocation status.

A Status List Token that cannot be used leaves no reliable revocation status. For PIDs the Relying Party SUT rejects the presentation in that case; for QEAA, PuB-EAA and non-qualified EAA the policy declared in the ICS applies (see [ARF] Annex 2, VCR_14).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
