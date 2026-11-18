# RP_Inf_SM_TrustMechanisms_008

## Objective

Verify that the Relying Party reaches the Trusted List of QTSPs through the list of trusted lists, validates it with the certificate of the pointer, and extracts the type and status of its services.

## References

- [ETSI TS 119 612] Annex A
- [ARF] Annex 2, OIA_13, OIA_15b

## Profile applicability

- Relying Party requests QEAAs.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` or `RP_WS_IA_MainInteraction_001b` passed in the same environment for the presentation flow of this test case.

## Test Scenario

1. The Test Trust Infrastructure publishes a new version of `TL-QEAA` in which the service of `QP-N` is a granted qualified service for the issuance of QEAAs. Wait until the Relying Party has retrieved it, at most `T_refresh`.
2. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_qeaa` that differs from it only in that it is issued by `QP-N`.

## Expected results

1. The Test Trust Infrastructure logs a retrieval of the new version of `TL-QEAA` by the Relying Party.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_qeaa`, with the values of `default_credential_qeaa` issued by `QP-N`.

## Comments

Restore the previous version of `TL-QEAA` after the test case.

The credential format does not affect this test case; use the credentials in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
