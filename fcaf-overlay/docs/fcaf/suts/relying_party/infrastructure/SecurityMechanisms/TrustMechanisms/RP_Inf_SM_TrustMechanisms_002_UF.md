# RP_Inf_SM_TrustMechanisms_002_UF

## Objective

Verify that the Relying Party does not use a version of the PID Provider list whose seal is invalid, and then acts as it declares (RP.T.4): it keeps the last valid version, or uses none.

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

1. The Test Trust Infrastructure publishes a new version of `TL-PID` that adds an entry for `PP-C` with a granted PID/Issuance and PID/Revocation service. It is valid in every other respect, except that one bit of the signature value of its JAdES seal is flipped. Wait until the Relying Party has retrieved it, at most `T_refresh`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it is issued by `PP-C`.
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in a valid Authorization Response.

## Expected results

1. The Test Trust Infrastructure logs a retrieval of the new version of `TL-PID` by the Relying Party.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
3. As the Relying Party declares in RP.T.4: `Keep` accepts the presentation and releases exactly the requested attributes (the last valid version of `TL-PID` stays in use); `Discard` rejects it (no usable `TL-PID`).

## Comments

The new version adds an entity, so a Relying Party that used it would accept that entity's credential. Whether the last valid version then stays in use (until its `NextUpdate` plus the grace period `G`) is the policy the Relying Party declares in RP.T.4.

Step 3 is `POLICY` (RP.T.4) since the spec review of 2026-11-20 (catalogue section 9): ETSI TS 119 602 and the ARF require the seal of a list to be verified before it is used, but no specification requires a Relying Party to keep the last valid version, so discarding the list (fail-closed) conforms too.

Restore the previous version of `TL-PID` after the test case.

The credential format does not affect this test case; use the credentials in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
