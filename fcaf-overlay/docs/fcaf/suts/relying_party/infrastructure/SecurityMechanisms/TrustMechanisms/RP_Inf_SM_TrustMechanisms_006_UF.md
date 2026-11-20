# RP_Inf_SM_TrustMechanisms_006_UF

## Objective

Record whether the Relying Party uses a list whose `LoTEType` is not that of a PID Providers list as the PID Provider list.

## References

- [ETSI TS 119 602]
- [ARF] Annex 2, OIA_15a, OIA_15b
- [ETSI TS 119 602] clause 6.3.3, Annexes D and E
- [ARF] Annex 2, OIA_15

## Profile applicability

None

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` or `RP_WS_IA_MainInteraction_001b` passed in the same environment for the presentation flow of this test case.

## Test Scenario

1. The Test Trust Infrastructure publishes a new version of `TL-PID` that adds an entry for `PP-C` with a granted PID/Issuance and PID/Revocation service. It is valid in every other respect, except that its `LoTEType` is that of a Wallet Providers list (`http://uri.etsi.org/19602/LoTEType/EUWalletProvidersList`), while it is published at the location of `TL-PID` and sealed by its scheme operator. Wait until the Relying Party has retrieved it, at most `T_refresh`.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that it is issued by `PP-C`.

## Expected results

1. The Test Trust Infrastructure logs a retrieval of the new version of `TL-PID` by the Relying Party.
2. Whether the Relying Party accepts or rejects the PID of `PP-C` is recorded; HTTP 5xx fails.

## Comments

The new version adds an entity, so a Relying Party that used it would accept that entity's credential. Whether the last valid version then stays in use (until its `NextUpdate` plus the grace period `G`) is the policy the Relying Party declares in RP.T.4.

Informational since the spec review of 2026-11-20 (catalogue section 8.3). The version is itself not a conforming list of either type: its `LoTEType` is that of a Wallet Providers list (ETSI TS 119 602 Annex E, Table E.1), while it carries PID Providers with PID/Issuance services (Annex D). The `LoTEType` "permits a parser to determine the form of any following field to expect" (clause 6.3.3); no clause requires a Relying Party to refuse a list fetched from the PID list location because of it. Nor does the type alone turn the entries into PID Providers: `PP-C` carries a PID/Issuance service in either case.

Restore the previous version of `TL-PID` after the test case.

The credential format does not affect this test case; use the credentials in a format the Relying Party requests.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
