# RP_WS_MS_CredentialFormats_004a

## Objective

Verify that the Relying Party requests a PID in SD-JWT VC format with cryptographic holder binding.

## References

- [OpenID4VP] section 6.1
- [ARF] section 6.6.3.8
- [ARF] Annex 2, OIA_17
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. No credential query for a PID sets `require_cryptographic_holder_binding` to false.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
