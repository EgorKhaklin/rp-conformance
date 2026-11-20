# RP_WS_DM_IdentifyingData_002a

## Objective

Verify that the Relying Party accepts a PID in SD-JWT VC format that carries no attribute besides the requested ones.

## References

- [PID rulebook]
- [ARF] Annex 2, ARB_09
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it carries no attribute besides `family_name`, `given_name` and `birthdate`: it has neither `place_of_birth` nor `nationalities`.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of the presented variant.

## Comments

`default_credential_pid` carries none of the optional attributes of the PID rulebook. The variant also leaves out every attribute that `default_query_pid` does not request, so no attribute the Relying Party did not ask for can make up for one it expects.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
