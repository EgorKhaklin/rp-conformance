# SD-JWT VC: array elements cannot be made selectively disclosable one by one

EUDIPLO 9.1.0-main.ae0792a, PID configuration in SD-JWT VC format (`dc+sd-jwt`).

The PID Rulebook (PID_21, ARB_30) and RFC 9901 section 4 let each element of an array claim be disclosed on its own,
for example one entry of `nationalities`. A field definition with `disclosable: true` on the array's element
(`children: [{ path: [null], disclosable: true }]`, or a numeric index) never produces array element disclosures:
`buildDisclosureFrame` (`apps/backend/src/issuer/configuration/credentials/utils/derive.ts` around line 430) turns every
path segment into a string key (`segmentToKey`: `null` becomes `"*"`, an index its decimal string), while
`@sd-jwt/core` packs an array element only when the frame's `_sd` contains its numeric index. Marking the array field
itself makes the whole array one disclosure.

Effect, shown by the issuer suite (cre8/rp-conformance issue 26, `PP_WS_SM_IssuerIntegrity_005` SD+PA): the issued PID
discloses `nationalities` only as a whole (`selective-disclosure`: "nationalities[0] is not an array element
disclosure").

Expected: a disclosable element path (`null` for every element, or an index) yields `{"...": <digest>}` entries, one
disclosure per element.
