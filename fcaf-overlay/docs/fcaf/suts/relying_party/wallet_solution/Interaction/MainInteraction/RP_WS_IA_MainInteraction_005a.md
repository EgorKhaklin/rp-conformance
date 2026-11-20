# RP_WS_IA_MainInteraction_005a

## Objective

Verify that the Relying Party releases only the requested attributes of a PID in SD-JWT VC format whose other attributes are not disclosed.

## References

- [ARF] Annex 2, OIA_07
- [RFC9901] section 7.1
- [OpenID4VP] section 6.4, 8.6
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

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response, in which it discloses only the requested attributes and not `place_of_birth` and `nationalities`.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`. In particular, `place_of_birth` and `nationalities` are absent from the verification result.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
