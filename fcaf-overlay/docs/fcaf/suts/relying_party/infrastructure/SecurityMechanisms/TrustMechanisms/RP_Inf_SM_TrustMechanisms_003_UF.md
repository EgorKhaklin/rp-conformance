# RP_Inf_SM_TrustMechanisms_003_UF

## Objective

Verify that the Relying Party does not use a version of the PID Provider list sealed by a key other than that of its scheme operator, and keeps using the last valid version.

## References

- [ETSI TS 119 602]
- [ARF] Annex 2, OIA_15a, OIA_15b

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` or `RP_WS_IA_MainInteraction_001b` passed in the same environment for the presentation flow of this test case.

## Test Scenario

1. The Test Trust Infrastructure publishes a new version of `TL-PID` that adds an entry for `PP-C` with a granted PID/Issuance and PID/Revocation service. It is valid in every other respect, except that it is sealed by a certificate issued by `CA-X`, which its `x5c` header carries, instead of the scheme operator certificate. Wait until the Relying Party has retrieved it, at most `T_refresh`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it is issued by `PP-C`.
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response.

## Expected results

1. The Test Trust Infrastructure logs a retrieval of the new version of `TL-PID` by the Relying Party.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
3. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_pid`, with the values of `default_credential_pid`.

## Comments

A Relying Party keeps using the last valid version of a list until its `NextUpdate` plus the grace period `G`. The new version adds an entity, so a Relying Party that used it would accept that entity's credential.

Restore the previous version of `TL-PID` after the test case.

The credential format does not affect this test case; use the credentials in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
