# RP_WS_UC_Presentation_009_UF

## Objective

Verify that the Relying Party rejects two mdocs returned in one DeviceResponse for two credential queries.

## References

- [HAIP] section 5.3.1
- [OpenID4VP] section 8.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.
- Relying Party requests non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_UC_Presentation_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa` in which the Conformance Wallet presents `default_credential_pid` and `default_credential_eaa`, each for its credential query, in an Authorization Response that is valid except that the entries of its `vp_token` for both credential queries hold one and the same DeviceResponse, which carries the documents of both credentials, each with a valid device signature.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

[HAIP] section 5.3.1 requires each mdoc to be returned in a separate DeviceResponse matching its credential query, and a Verifier rejects a VP Token that fails a check of the VP Token as a whole ([OpenID4VP] section 8.6). The DeviceResponse is otherwise valid: each document carries its own valid device signature over the SessionTranscript of the request.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
