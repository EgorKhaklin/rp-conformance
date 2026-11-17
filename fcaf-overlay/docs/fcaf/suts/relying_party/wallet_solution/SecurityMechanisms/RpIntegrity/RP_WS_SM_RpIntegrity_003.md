# RP_WS_SM_RpIntegrity_003

## Objective

Verify that the certificate chain of the Relying Party's request validates to an anchor of the list of Access Certificate Authorities.

## References

- [HAIP] section 5
- [ARF] Annex 2, RPA_02, RPA_04, Reg_10b
- [CIR 2024/2982 amended] Annex II

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.

## Test Scenario

1. Start a presentation for `default_query_pid` and capture the request the Conformance Wallet receives, without answering it.

## Expected results

1. `x5c` holds the access certificate and any intermediate certificates, no trust anchor and no self-signed certificate, and validates to an anchor in `TL-AC`.

## Comments

The Conformance Wallet does not answer the requests; the test case checks only what the Relying Party sends.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
