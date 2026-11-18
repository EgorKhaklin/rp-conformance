# RP_WS_MS_CredentialFormats_003a

## Objective

Verify that the `trusted_authorities` of the Relying Party's request for a credential in SD-JWT VC format names anchors of the list that is the root of trust of the requested category.

## References

- [OpenID4VP] section 6.1.1.1
- [HAIP] section 5
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party uses `trusted_authorities` in DCQL queries.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. The Relying Party is configured to restrict `default_query_pid` with a `trusted_authorities` entry of type `aki` that names only the PID/Issuance anchor of `PP-A`.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. Every `trusted_authorities` entry is of type `aki` and names only key identifiers of PID/Issuance anchors of `TL-PID`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
