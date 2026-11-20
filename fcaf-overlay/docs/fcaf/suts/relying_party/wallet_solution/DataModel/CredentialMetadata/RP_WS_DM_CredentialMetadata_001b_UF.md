# RP_WS_DM_CredentialMetadata_001b_UF

## Objective

Verify that the Relying Party does not release attributes of a PID in mdoc format that were disclosed without being requested.

## References

- [ARF] Annex 2, OIA_16
- [OpenID4VP] section 15.4.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the Conformance Wallet also discloses the attributes `place_of_birth` and `nationalities` (SD-JWT VC) or `place_of_birth` and `nationality` (mdoc), which the query does not request.

## Expected results

1. Either the Relying Party rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and releases exactly the attributes requested in `default_query_pid`, with the issuer-signed values of `default_credential_pid`. In neither case does its verification result release `place_of_birth` or `nationality`.

## Comments

OpenID4VP leaves it to the Relying Party whether to reject a presentation with claims it did not request or to ignore them; either passes, as long as the extra attributes are not released.

Whether the Relying Party retains the extra attributes cannot be observed at its interfaces; the test book item `RP_TB_001` covers retention.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
