# RP_WS_DM_IdentifyingData_005a

## Objective

Verify that the Relying Party releases the age-over attribute of a PID in SD-JWT VC format as a boolean with its value.

## References

- [PID rulebook]
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
4. The Relying Party is configured with a variant of `default_query_pid` in SD-JWT VC format that requests only the member `18` of the claim `age_equal_or_over` (claims path `["age_equal_or_over", "18"]`).

## Test Scenario

1. Perform a presentation for the variant of `default_query_pid` named in the preconditions in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it also carries the claim `age_equal_or_over` whose member `18` is `true`.
2. Perform a presentation for the variant of `default_query_pid` named in the preconditions in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it also carries the claim `age_equal_or_over` whose member `18` is `false`.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in the variant of `default_query_pid` named in the preconditions, with the values of the presented variant. The released value is the boolean `true`.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in the variant of `default_query_pid` named in the preconditions, with the values of the presented variant. The released value is the boolean `false`.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
