# SD-JWT VC: array elements cannot be made selectively disclosable one by one

Basis: **EUDI profile only.** ARF Annex 2 PID_21: "When issuing a PID compliant with [SD-JWT VC], a PID Provider SHALL
make all claims (i.e., all top-level properties, all nested properties, and all array entries) selectively disclosable
individually". RFC 9901 (SD-JWT) section 4.2.2 only provides array element disclosures; it does not require an Issuer
to use them.

## What EUDIPLO does

EUDIPLO 9.1.0-main.ae0792a, PID configuration in SD-JWT VC format (`dc+sd-jwt`). The claim definition of
`nationalities` marks both the array and its elements disclosable:

```json
{ "path": ["nationalities"], "type": "array", "disclosable": true, "children": [{ "path": [null], "type": "string", "disclosable": true }] }
```

The issued PID still discloses `nationalities` only as a whole: one disclosure for the array, no `{"...": <digest>}`
entries for its elements (`PP_WS_SM_IssuerIntegrity_005` SD+PA, `selective-disclosure`: "nationalities[0] is not an
array element disclosure").

## Why

`buildDisclosureFrame` (`apps/backend/src/issuer/configuration/credentials/utils/derive.ts`, around line 430) turns every
path segment into a string key (`segmentToKey`: `null` becomes `"*"`, an index its decimal string), while
`@sd-jwt/core` packs an array element only when the frame's `_sd` of the array contains its numeric index. A disclosable
element path therefore never matches.

## Suggested change

Map a disclosable element path (`null` for every element, or an index) to the numeric indices of the array in the
disclosure frame, so that each element gets its own disclosure.

## How to reproduce

```bash
pnpm rp-conformance issuer run --adapter eudiplo --only PP_WS_SM_IssuerIntegrity_005
```
