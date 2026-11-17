# RP_WS_SM_IssuerIntegrity_010_UF

## Objective

Verify that the Relying Party rejects a credential in SD-JWT VC format with a disclosure whose claim name is reserved or already present at its level.

## References

- [RFC9901] section 4.2.1, 7.1
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

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it carries an additional disclosure, referenced from the `_sd` array of the Issuer-signed JWT, whose claim name is `_sd`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it carries an additional disclosure, referenced from the `_sd` array of the Issuer-signed JWT, whose claim name is `...`.
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its Issuer-signed JWT also carries `family_name` as a plain claim, at the same level as the disclosure of `family_name`.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
3. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
