# RP_WS_MS_Metadata_003

## Objective

Verify that the Relying Party uses an ephemeral encryption key: a different one for every request.

## References

- [HAIP] section 5
- [OpenID4VP] section 8.3
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start 20 presentations for `default_query_pid` and capture the requests the Conformance Wallet receives, without answering them.

## Expected results

1. Every request carries an encryption key, and no two requests carry the same key.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
