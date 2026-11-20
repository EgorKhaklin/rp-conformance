# RP_WS_UC_Presentation_004a_UF

## Objective

Verify that the Relying Party releases nothing from a `vp_token` entry in SD-JWT VC format whose key is the `id` of no credential query of the request.

## References

- [OpenID4VP] section 8.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_UC_Presentation_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid_eaa` in which the Conformance Wallet presents `default_credential_pid` and `default_credential_eaa`, each for its credential query, in an Authorization Response that is valid except that its `vp_token` additionally holds an entry with the key `x`, which is the `id` of no credential query of the request, with a valid presentation of the same PID that discloses every attribute of the PID.

## Expected results

1. Either the Relying Party rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and releases exactly the attributes requested in `default_query_pid_eaa`, with the issuer-signed values of `default_credential_pid` and `default_credential_eaa`. In particular, it releases no attribute of the PID that only the entry `x` discloses.

## Comments

Rejecting the response and ignoring the entry `x` both pass, as long as nothing from that entry is released as verified (decision 7 of the test catalogue). The entry discloses attributes that `default_query_pid_eaa` does not request, so a release of its content is visible in the verification result.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
