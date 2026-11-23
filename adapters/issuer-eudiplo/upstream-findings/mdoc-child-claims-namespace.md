# mdoc configuration with an array claim is dropped as unknown: child claims paths lack the namespace

Not reported upstream yet; this is the issue text prepared for it. Found by the nightly issuer suite (run
[45068726317](https://github.com/cre8/rp-conformance/actions/runs/45068726317)) against `ghcr.io/eudiplo/eudiplo:main`
at `7586139b2de610464390a8ce2896a097b4810541` (`10.0.0-main.7586139`, built 2026-11-22) and reproduced locally on
2026-11-23. Every mdoc test case of the suite (`PP_WS_DM_PidMdoc_*`, `PP_WS_SM_IssuerIntegrity_*`,
`PP_WS_SM_Unlinkability_*`, `PP_WS_SM_Revocation_*`, `PP_Inf_SM_TrustMechanisms_*` in their `MD` variants) failed at
its first credential request. The adapter now works around it (see below), so the suite no longer shows it.

Basis: OpenID4VCI 1.0 Appendix C.2 (a claims path pointer of an mdoc starts with the namespace, then the
data element identifier); a regression since #1636.

## What happens

A configuration in `mso_mdoc` format with a field that has `children`, as the PID of the PID Rulebook needs:

```json
{
  "namespace": "eu.europa.ec.eudi.pid.1",
  "path": ["nationality"],
  "type": "array",
  "mandatory": true,
  "children": [{ "path": [null], "type": "string" }]
}
```

(likewise `place_of_birth` with the children `locality` and `country`). The Credential Issuer metadata lists the
configuration, but every credential request for it is answered with HTTP 400:

```json
{ "error": "unknown_credential_configuration", "error_description": "Credential configuration 'pid-mso-mdoc' is not supported" }
```

The metadata publishes the paths of the children without the namespace of their parent:

```json
{ "path": ["eu.europa.ec.eudi.pid.1", "nationality"], "mandatory": true },
{ "path": ["nationality", null] },
{ "path": ["place_of_birth", "locality"] },
{ "path": ["place_of_birth", "country"] }
```

## Why

`flattenFields` (`apps/backend/src/issuer/configuration/credentials/utils/derive.ts`, line 36 at `7586139`) resolves a
child's path against its parent's, but does not pass on the parent's `namespace`. `buildClaimsMetadata` (line 557)
prefixes the namespace only for a field that declares it itself, so the paths of children lack it. This was already the
case at `ae0792a`, where the paths were wrong but harmless.

Since #1636 (`641b548`, "make SD-JWT VC array elements selectively disclosable") an array step is published as `null`
instead of `"*"`. `["nationality", null]` then fails the `mso_mdoc` claims path schema of `@openid4vc/openid4vci`
0.10.0 (`zMsoMdocClaimsDescriptionPath`: at least two string elements), so
`getKnownCredentialConfigurationsSupported` (`oid4vci.service.ts`, line 359) leaves the whole configuration out of the
known ones, and the check at line 449 rejects every request for it. SD-JWT VC configurations are not affected; their
paths have no namespace.

## Reproduction

```bash
EUDIPLO_IMAGE=ghcr.io/eudiplo/eudiplo:main EUDIPLO_PORT=3300 docker compose -p rp-conformance-main -f adapters/eudiplo/docker-compose.yml up -d --wait
```

With the adapter before the workaround (`git checkout b20d9f1 -- adapters/issuer-eudiplo/src/subjects.ts`):

```bash
EUDIPLO_PORT=3300 pnpm rp-conformance issuer run --adapter eudiplo --only PP_WS_DM_PidMdoc_001
```

## Suggested fix

Let a child inherit the parent's `namespace` in `flattenFields` when it declares none, so that the metadata publishes
`["eu.europa.ec.eudi.pid.1", "nationality", null]` and `["eu.europa.ec.eudi.pid.1", "place_of_birth", "locality"]`. A
test that runs the published metadata of an mdoc configuration with array children through
`getKnownCredentialConfigurationsSupported` would have caught the regression.

## Workaround in the adapter

`mdocField` (`src/subjects.ts`) declares the namespace on every child as well. EUDIPLO uses a child's `namespace` only
for its published path (and for default values and date formats, which the children do not have), at `ae0792a` as at
`7586139`, so the issued mdoc is unchanged and the published paths are correct. Once the fix is released, the
workaround can stay or go.
