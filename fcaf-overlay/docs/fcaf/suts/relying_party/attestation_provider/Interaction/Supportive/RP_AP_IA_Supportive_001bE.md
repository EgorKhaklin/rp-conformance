# RP_AP_IA_Supportive_001bE

## Objective

Verify that the Relying Party retrieves a Status List Token in CWT format with an HTTP `GET` of its URI, without authentication and without data that identifies the user or the transaction.

## References

- [Token Status List] section 8.1, 8.3, 12
- [ARF] Annex 2, VCR_16
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.
- Status List Token in CWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_004b` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents `default_credential_eaa` in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_eaa`, with the values of `default_credential_eaa`. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential. Every request the Test Status Provider logs from the Relying Party for that status list is an HTTP `GET` of exactly the status `uri` of the credential, without a query component, without `Authorization` and `Cookie` headers, without the identifier of the transaction in its URI or headers, and with an `Accept` header, if it sends one, that admits `application/statuslist+cwt`.

## Comments

[Token Status List] section 8.1 lets the Relying Party leave out the `Accept` header when the token's media type is known out of band, so its absence is no failure.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
