# RP_WS_SM_IssuerIntegrity_015

## Objective

Verify that the Relying Party resolves the recursive disclosures of a structured claim of a credential in SD-JWT VC format.

## References

- [RFC9901] section 4.2.6, 7.1
- [PID rulebook]
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
4. The Relying Party is configured to request, with `default_query_pid` in SD-JWT VC format, also the claim `place_of_birth`.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its claim `place_of_birth` is disclosed recursively: the disclosure of `place_of_birth` holds an object whose members `locality` and `country` are themselves selectively disclosable.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
