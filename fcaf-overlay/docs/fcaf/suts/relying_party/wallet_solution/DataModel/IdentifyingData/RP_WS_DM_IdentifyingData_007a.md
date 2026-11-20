# RP_WS_DM_IdentifyingData_007a

## Objective

Verify that the Relying Party accepts a PID in SD-JWT VC format that carries a claim it does not know.

## References

- [SD-JWT VC] section 2.2.2
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
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its Issuer-signed JWT additionally carries the claim `rp_conformance_private_claim` with the value `unknown`, which no specification defines and which is not selectively disclosable.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of the presented variant. Whether it also passes the unknown claim along is not judged: the claim is not selectively disclosable.

## Comments

The claim is not selectively disclosable, so it reaches the Relying Party with every presentation. An mdoc has no such element: the Conformance Wallet presents only requested elements, and a presentation with an element the query does not request is `RP_WS_DM_CredentialMetadata_001b_UF`.

Since the spec review of 2026-11-20 (catalogue section 8.3) the step checks acceptance only: a claim that is always disclosed cannot be withheld (OpenID4VP 1.0 section 6.4 lets a presentation contain claims that "are not selectively disclosable"), so it is treated like the technical claims (`iss`, `vct`, …) when the released attributes are compared.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
