# RP_WS_SM_IssuerIntegrity_027_UF

## Objective

Record whether the Relying Party accepts a credential in mdoc format whose signing certificate, under the right anchor, is not an ISO/IEC 18013-5 document signer certificate (no extended key usage `1.0.18013.5.1.2`).

## References

- [ISO/IEC 18013-5] Annex B (not verified)
- [ETSI TS 119 412-6] clause 4
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its document signer certificate, issued under the same anchor, has no extended key usage `1.0.18013.5.1.2`.

## Expected results

1. Whether the Relying Party accepts or rejects the presentation is recorded; HTTP 5xx fails.

## Comments

Informational since the spec review of 2026-11-20 (catalogue section 8.3): ETSI TS 119 412-6 clause 4, the certificate profile of PID Providers, requires no extended key usage (it allows key usage type C "Due to the requirements of ISO/IEC 18013-5"), and the ISO/IEC 18013-5 Annex B profile of the document signer was not available to the review. The test certificate is a plain end-entity certificate, so it differs from a document signer in more than the extended key usage.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
