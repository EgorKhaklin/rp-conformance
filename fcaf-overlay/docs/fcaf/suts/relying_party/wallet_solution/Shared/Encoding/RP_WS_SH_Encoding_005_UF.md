# RP_WS_SH_Encoding_005_UF

## Objective

Verify that the Relying Party rejects a KB-JWT whose header or payload carries a member name twice.

## References

- [RFC7515] section 4
- [RFC7519] section 4
- [RFC8259] section 4
- [RFC9901] section 7.3
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the header of its KB-JWT carries the member `alg` twice: first `ES256`, with which it is signed, and last `none`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the payload of its KB-JWT carries the member `nonce` twice: first the `nonce` of the request and last a newly generated random value.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

[RFC7515] section 4 lets a parser either reject duplicate member names or use the lexically last one. The last value of each duplicate is the wrong one, so both conforming behaviours reject the presentation; a parser that keeps the first value accepts it.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
