# RP_WS_MS_Metadata_004b

## Objective

Verify that the `vp_formats_supported` of the Relying Party's request covers the mdoc format it requests, with agreed algorithms only.

## References

- [OpenID4VP] section 11.1, B.2.2, B.3.4
- [ECCG ACM]
- [ARF] Annex 2, OIA_03
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

1. `client_metadata` carries `vp_formats_supported` with an entry for `mso_mdoc`, and every algorithm it lists belongs to the agreed cryptographic mechanisms.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
