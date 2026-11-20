# RP_WS_DM_IdentifyingData_004a_UF

## Objective

Verify that the Relying Party does not silently accept PID attributes in SD-JWT VC format whose values have the wrong data type.

## References

- [PID rulebook]
- [ISO 8601-1:2019]
- [OpenID4VP] section 8.6
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
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.
4. The Relying Party is configured with a variant of `default_query_pid` in SD-JWT VC format that requests every mandatory attribute of the PID rulebook: `family_name`, `given_name`, `birthdate`, `place_of_birth`, `nationalities`, `date_of_expiry`, `issuing_authority` and `issuing_country`.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its `birthdate` is the integer `19640812` instead of the string `1964-08-12`.
2. Perform a presentation for the variant of `default_query_pid` named in the preconditions in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its `nationalities` is the string `DE` instead of an array of country codes.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Alternatively, it accepts the presentation and its verification result flags `birthdate` as invalid (`attribute-invalid`). It does not accept the presentation without such a flag.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Alternatively, it accepts the presentation and its verification result flags `nationalities` as invalid (`attribute-invalid`). It does not accept the presentation without such a flag.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
