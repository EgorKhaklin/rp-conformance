# RP_WS_MS_CredentialFormats_001b

## Objective

Verify that the DCQL query of the Relying Party's request for a credential in mdoc format is valid.

## References

- [OpenID4VP] section 6, 7, B.2.3, B.3.5
- [HAIP] section 5.3.1, 5.3.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. The credential queries have unique `id`s, the format `mso_mdoc` with `meta.doctype_value`, and valid claims path pointers.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
