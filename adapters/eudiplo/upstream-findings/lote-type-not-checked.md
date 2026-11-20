# A Wallet Providers list is accepted as PID Provider list: `LoTEType` is not checked against the list's purpose

## What EUDIPLO does

A tenant uses the PID Provider list `TL-PID` through `trusted_authorities`. The scheme operator's endpoint serves a new
version, correctly sealed by the scheme operator, whose `LoTEType` is
`http://uri.etsi.org/19602/LoTEType/EUWalletProvidersList` instead of `.../EUPIDProvidersList`, and which adds an entity
`PP-C` with services of type `http://uri.etsi.org/19602/SvcType/PID/Issuance` and `.../PID/Revocation`.

EUDIPLO uses that version and accepts a PID signed under `PP-C`:

```json
{"result": "success", "credentials": [{"id": "pid", "verified": true, "trust": {"matchedIssuer": "PP-C", "matchMode": "ca"}}]}
```

## What the specification says

- ETSI TS 119 602 V1.1.1, clause 6.3.3: "The LoTEType component specifies the type of the list of trusted entities."
- Annex D (PID providers list), Table D.1: "The value of the LoTEType component shall be
  `http://uri.etsi.org/19602/LoTEType/EUPIDProvidersList`"; Table D.3 allows the service types `SvcType/PID/Issuance`
  and `SvcType/PID/Revocation`.
- Annex E (wallet providers list), Table E.3: the service types `SvcType/WalletSolution/Issuance` and
  `.../Revocation` may be used "to the exclusion of any other". A list of this type cannot list PID issuance services.
- ARF Annex 2, OIA_12 and the note to OIA_15: PID signatures are validated with trust anchors from the PID Provider
  LoTE, and trust anchors of different categories are kept apart.

A list whose type is not the PID Provider list is not a source of PID trust anchors, whatever its services say. Without
the check, a list of another category served at (or configured as) the PID list location turns its anchors into PID
issuers.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only RP_Inf_SM_TrustMechanisms_006_UF
```

FAIL in both flows: step 1 publishes the version and sees EUDIPLO fetch it, step 2 (PID of `PP-C`): "attributes were
released" (run `r20261119T222700-cfa8a7`, `artifacts/RP_Inf_SM_TrustMechanisms_006_UF/redirect/step-2/rp-result.json`).
The same version with the correct `LoTEType` is what `RP_Inf_SM_TrustMechanisms_001` publishes, so `LoTEType` is the
only difference.

## Where in the source

`LoteParserService.parse` reads `LoTEType` only to pick the profile rules for untyped services and statuses; typed
services are read "by their types alone"
([lote-parser.service.ts#L165](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/lote-parser.service.ts#L165),
[lote-profiles.ts#L14](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/domain/lote-profiles.ts#L14)).
Nothing compares the service types with the types the list's profile allows, and the verifier's service type filter
(`PID/Issuance` for a PID) is applied to the services, not to the list.

A fix: when a list has an EU profile `LoTEType` (Annexes D to I), leave out services whose type the profile does not
allow, so a Wallet Providers list contributes no PID issuers. Optionally, let a trust list reference state the list
type it expects and refuse a list of another type.
