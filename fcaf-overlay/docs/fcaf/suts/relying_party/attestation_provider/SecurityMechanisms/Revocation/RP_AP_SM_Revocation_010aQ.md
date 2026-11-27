# RP_AP_SM_Revocation_010aQ

## Objective

Verify that the Relying Party uses a Status List Token in JWT format signed under the revocation anchor of the entity that issued the credential.

## References

- [Token Status List] section 5.1, 8.3
- [RFC7519] section 7.2
- [Token Status List] section 11.3
- [ARF] Annex 2, VCR_13, VCR_14
- [ETSI TS 119 612]
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests QEAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Status List Token in JWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_002a` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents `default_credential_qeaa` in a valid Authorization Response, while the Test Status Provider serves a valid Status List Token for it that holds the value 0x00 at the credential's index and is signed by a certificate under the anchor of the granted qualified EAA service of `QP-A` in `TL-QEAA`.
2. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents `default_credential_qeaa` in a valid Authorization Response, while the Test Status Provider serves a valid Status List Token for it that holds the value 0x00 at the credential's index and is signed with the same key and certificate as that credential.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_qeaa`, with the values of `default_credential_qeaa`. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_qeaa`, with the values of the presented credential. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.

## Comments

`QP-A` signs its credentials and its status lists under the same anchor, so in the second step the credential's own certificate is under the anchor of the granted qualified EAA service of `QP-A` in `TL-QEAA` ([Token Status List] section 11.3).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
