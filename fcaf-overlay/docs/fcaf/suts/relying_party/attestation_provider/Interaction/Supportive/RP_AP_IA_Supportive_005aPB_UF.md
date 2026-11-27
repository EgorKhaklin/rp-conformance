# RP_AP_IA_Supportive_005aPB_UF

## Objective

Verify that the Relying Party follows a redirect loop at the endpoint of a Status List Token in JWT format only a bounded number of times, makes no positive status statement, and stays available.

## References

- [Token Status List] section 8.1, 11.4
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests PuB-EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Status List Token in JWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_003a` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_pubeaa` in which the Conformance Wallet presents `default_credential_pubeaa` in a valid Authorization Response, while the Test Status Provider answers every request for the referenced status list with HTTP status 302 and a `Location` header naming that same URI.
2. Perform a presentation for `default_query_pubeaa` in which the Conformance Wallet presents a newly issued `default_credential_pubeaa` in a valid Authorization Response, immediately after the previous step, while the Test Status Provider serves a valid Status List Token for it that holds the value 0x00 at its index.

## Expected results

1. The Relying Party makes no positive status statement and handles the presentation as it declares in its ICS (RP.R.2): either it rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and its verification result flags the revocation status as unknown (`status-unknown`).
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pubeaa`, with the values of the newly issued credential.

## Comments

The Test Status Provider logs every request of the loop; the report shows how many redirects the Relying Party followed.

A Status List Token that cannot be used leaves no reliable revocation status. For PIDs the Relying Party SUT rejects the presentation in that case; for QEAA, PuB-EAA and non-qualified EAA the policy declared in the ICS applies (see [ARF] Annex 2, VCR_14).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
