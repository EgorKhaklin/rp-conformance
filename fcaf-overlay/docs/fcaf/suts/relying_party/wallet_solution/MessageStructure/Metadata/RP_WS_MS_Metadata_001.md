# RP_WS_MS_Metadata_001

## Objective

Verify that the request of the Relying Party carries a public encryption key for the response in `client_metadata`.

## References

- [HAIP] section 5
- [OpenID4VP] section 8.3, 11.1
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

1. `client_metadata.jwks` holds an EC key on P-256 with `alg` `ECDH-ES` and a `kid`, and no key in it carries a private key member.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
