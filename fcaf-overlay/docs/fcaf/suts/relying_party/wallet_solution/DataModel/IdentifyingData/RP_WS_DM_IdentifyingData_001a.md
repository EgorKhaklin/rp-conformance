# RP_WS_DM_IdentifyingData_001a

## Objective

Verify that the Relying Party releases every mandatory attribute of a PID in SD-JWT VC format with its value and data type, including names with characters outside Latin-1.

## References

- [PID rulebook]
- [ARF] Annex 2, ARB_06
- [SD-JWT VC] section 2.2
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
4. The Relying Party is configured with a variant of `default_query_pid` in SD-JWT VC format that requests every mandatory attribute of the PID rulebook: `family_name`, `given_name`, `birthdate`, `place_of_birth`, `nationalities`, `date_of_expiry`, `issuing_authority` and `issuing_country`.

## Test Scenario

1. Perform a presentation for the variant of `default_query_pid` named in the preconditions in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its `family_name` is `Παπαδοπούλου` and its `given_name` is `Łucja`, values with characters outside Latin-1 (ISO/IEC 8859-1), and it carries every mandatory attribute of the PID rulebook: besides `family_name`, `given_name`, `birthdate`, `place_of_birth` and `nationalities` also `date_of_expiry`, `issuing_authority` and `issuing_country`.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in the variant of `default_query_pid` named in the preconditions, with the values of the presented variant. Each value equals the issued one exactly: the names as the same sequence of Unicode characters, the dates as `YYYY-MM-DD` text, the nationalities as an array of country codes and the place of birth as an object.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
