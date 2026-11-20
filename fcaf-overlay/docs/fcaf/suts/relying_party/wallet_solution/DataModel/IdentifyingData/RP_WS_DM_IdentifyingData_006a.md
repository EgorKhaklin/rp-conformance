# RP_WS_DM_IdentifyingData_006a

## Objective

Verify that the Relying Party releases the disclosed members of a structured PID attribute in SD-JWT VC format with their values.

## References

- [PID rulebook]
- [RFC9901] section 4.2.6, 7.1
- [OpenID4VP] section 7
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
4. The Relying Party is configured with a variant of `default_query_pid` in SD-JWT VC format that requests only the members `locality`, `postal_code` and `country` of the claim `address` (claims paths `["address", "locality"]`, `["address", "postal_code"]` and `["address", "country"]`).

## Test Scenario

1. Perform a presentation for the variant of `default_query_pid` named in the preconditions in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it also carries the claim `address` with the members `street_address`, `house_number`, `locality`, `postal_code` and `country`, each of them selectively disclosable within the disclosure of `address`.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in the variant of `default_query_pid` named in the preconditions, with the values of the presented variant. It releases `locality`, `postal_code` and `country` of the address, and not `street_address` or `house_number`, which the Conformance Wallet does not disclose.

## Comments

The Conformance Wallet discloses `address` with only the disclosures of the three requested members. The PID in mdoc format has no structured address: the PID rulebook encodes its address as separate data elements (`resident_city`, `resident_postal_code`, …), which `RP_WS_DM_IdentifyingData_001b` covers as any other element.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
