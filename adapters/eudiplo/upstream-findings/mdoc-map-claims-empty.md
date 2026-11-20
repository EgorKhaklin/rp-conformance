# mdoc: a data element whose value is a CBOR map is released as an empty object `{}`

Basis: a product bug, not a violation of a specification clause. The PID Rulebook v1.7 section 3.1.4 defines
`place_of_birth` of the mdoc PID as a map (`locality`, `region`, `country`), and a Relying Party that releases it as
`{}` loses the value it verified.

## What EUDIPLO does

A PID in mdoc format with every mandatory data element, among them `place_of_birth` = `{"locality": "Berlin",
"country": "DE"}` (a CBOR map), verifies, and the session result releases:

```json
"place_of_birth": {}
```

The text, date and array elements of the same document (`family_name`, `birth_date`, `nationality`, …) are released
with their values. The same happens for any element whose value is a CBOR map.

## Why

`MdocverifierService.verify` collects the claims per namespace with `issuerSigned.getPrettyClaims(ns)` of `@owf/mdoc`
([mdocverifier.service.ts#L162](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/credential/mdocverifier/mdocverifier.service.ts#L162)).
It returns the value of a map element as a JavaScript `Map`, which `JSON.stringify` writes as `{}` when the session
result is stored and returned. Converting `Map` values to plain objects (recursively) before the claims are stored
would keep them.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only RP_WS_DM_IdentifyingData_001b
```

FAIL in both flows: `place_of_birth.locality` and `place_of_birth.country` missing, `place_of_birth` released as `{}`
(`artifacts/RP_WS_DM_IdentifyingData_001b/<flow>/step-1/rp-result.json`). Until 2026-11-20 the suite flattened released
attributes in a way that dropped empty objects, which hid the same defect in other test cases that present
`place_of_birth` in mdoc format without requesting it; it now reports them too.
