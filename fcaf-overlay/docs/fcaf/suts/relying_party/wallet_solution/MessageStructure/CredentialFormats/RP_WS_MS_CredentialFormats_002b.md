# RP_WS_MS_CredentialFormats_002b

## Objective

Verify that the Relying Party requests only attributes in mdoc format that its registration certificate lists.

## References

- [ETSI TS 119 475]
- [ARF] Annex 2, RPRC_19, RPRC_21
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. Every credential and claim the DCQL query requests is covered by a credential and claim the registration certificate in `verifier_info` lists.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
