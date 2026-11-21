# Suggestion (hardening): refuse services a list's `LoTEType` profile does not allow

**Not a conformance finding.** No clause of ETSI TS 119 602 V1.1.1 or the ARF requires a Relying Party to refuse a list
because of its `LoTEType`; the suite records this case as informational (`RP_Inf_SM_TrustMechanisms_006_UF`, INFO since
the spec review of 2026-11-20). This is a suggestion for a cheap consistency check.

## What EUDIPLO does

The scheme operator's endpoint for `TL-PID` serves a version, correctly sealed by the scheme operator, whose `LoTEType`
is `http://uri.etsi.org/19602/LoTEType/EUWalletProvidersList` instead of `.../EUPIDProvidersList`, and which lists an
entity `PP-C` with services of type `http://uri.etsi.org/19602/SvcType/PID/Issuance` and `.../PID/Revocation`. EUDIPLO
uses the version and accepts a PID signed under `PP-C`.

## Why it is only a suggestion

ETSI TS 119 602 V1.1.1 clause 6.3.3 says the `LoTEType` "permits a parser to determine the form of any following field
to expect"; it states no rule for a Relying Party that receives a list of an unexpected type. The test list is itself
not a conforming list of either type: Annex E, Table E.3, allows a wallet providers list only the service types
`SvcType/WalletSolution/Issuance` and `.../Revocation` "to the exclusion of any other", while it carries PID services.
And the type does not turn anything into a PID Provider: `PP-C` is accepted because its service is `PID/Issuance`, which
it would carry in a correctly typed list too. (An earlier draft of this text claimed that a list of another category
"turns its anchors into PID issuers"; that is not what happens.)

## Suggestion

When a list has an EU profile `LoTEType` (Annexes D to I of TS 119 602), leave out services whose type that profile does
not allow, and optionally let a trust list reference state the list type it expects. EUDIPLO reads `LoTEType` only to
pick the profile rules for untyped services
([lote-parser.service.ts#L165](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/lote-parser.service.ts#L165)).
