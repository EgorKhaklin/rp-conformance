# RP_Inf_SM_TrustMechanisms_009_UF

## Objective

Verify that the Relying Party does not use a Trusted List of QTSPs signed with a certificate that the pointer of the list of trusted lists does not name.

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

1. The Test Trust Infrastructure publishes a new version of `TL-QEAA` in which the service of `QP-N` is a granted qualified service for the issuance of QEAAs. It is valid in every other respect, except that it is signed by a certificate issued by `CA-X`, which is not the certificate the LOTL names in its pointer to `TL-QEAA`. Wait until the Relying Party has retrieved it, at most `T_refresh`.
2. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_qeaa` that differs from it only in that it is issued by `QP-N`.

## Expected results

1. The Test Trust Infrastructure logs a retrieval of the new version of `TL-QEAA` by the Relying Party.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The catalogue expects the QEAA of `QP-A` to be rejected. A Relying Party keeps using the last valid version of the list, so the new version instead grants `QP-N` a qualified service, and the QEAA of `QP-N` stays rejected.

Restore the previous version of `TL-QEAA` after the test case.

The credential format does not affect this test case; use the credentials in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
