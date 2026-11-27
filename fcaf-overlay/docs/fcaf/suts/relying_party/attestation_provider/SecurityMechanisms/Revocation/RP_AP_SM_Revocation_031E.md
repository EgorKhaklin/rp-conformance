# RP_AP_SM_Revocation_031E

## Objective

Verify that the Relying Party accepts a credential in mdoc format whose MSO status element names the certificate that signs the referenced Status List Token, and validates the token against that certificate.

## References

- [ISO/IEC 18013-5 ed2]
- [Token Status List] section 5.2, 8.3
- [RFC8392] section 7.2
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.
- Status List Token in CWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_004b` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.
5. The status list referenced by the presented credential holds the value 0x00 (VALID) at the credential's index.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_eaa` that differs from it only in that the `status_list` map in the `status` element of its MSO additionally carries `certificate`: the DER encoding of the certificate that signs the referenced Status List Token, issued under the anchor `CA-EP-A` that the rulebook of `default_credential_eaa` defines.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_eaa`, with the values of `default_credential_eaa`. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.

## Comments

The Status List Token is signed by the certificate the status element names, which is issued under the anchor `CA-EP-A` that the rulebook of `default_credential_eaa` defines. A Relying Party that ignores the element accepts the presentation too, so the test case shows that it accepts a valid credential that carries the element, not that it uses it.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
