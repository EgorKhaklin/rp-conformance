# RP_WS_SM_RpIntegrity_002

## Objective

Verify that the Client Identifier of the Relying Party is the `x509_hash` of its access certificate.

## References

- [HAIP] section 5
- [OpenID4VP] section 5.9.3
- [ARF] Annex 2, RPA_02
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. `client_id` is `x509_hash:` followed by the base64url SHA-256 hash of the DER encoding of the first certificate in `x5c`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
