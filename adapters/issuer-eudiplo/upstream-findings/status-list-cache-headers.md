# The status list endpoint sets no cache headers consistent with the token's `ttl` and `exp`

Prepared issue text for the known finding of `PP_RP_IA_Supportive_002` in
[`../known-findings.yaml`](../known-findings.yaml); not reported upstream yet. It is opened by hand once the maintainer
agrees; the issue reference then goes into the entry's `reference` and this file is removed.

Checked against `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`
(version `9.1.0-main.ae0792a`, revision `ae0792a98991c28607879c2291d26b26b9ee9817`), run `i20261120T120336-b81701` of
2026-11-20.

## What EUDIPLO does

`GET /issuers/{tenant}/status-management/status-list/{listId}` with `Accept: application/statuslist+jwt` answers a
Status List Token with `ttl` 60 and `exp` = `iat` + 60, and these headers:

```text
HTTP/1.1 200 OK
access-control-allow-origin: *
content-type: application/statuslist+jwt; charset=utf-8
content-length: 1656
etag: W/"678-GWIKlWLiMg+cyBhwvcQpcW/+/CA"
date: Fri, 20 Nov 2026 12:03:36 GMT
```

No `Cache-Control` and no `Expires`. An HTTP cache between the Relying Party and EUDIPLO may then apply heuristic
freshness (RFC 9111 section 4.2.2) and serve the token beyond its `ttl`, so a revocation reaches the Relying Party later
than the `ttl` the token announces.

## What the specification says

- Token Status List (draft-ietf-oauth-status-list), section 13.7 (caching): the HTTP caching headers of the response
  should be consistent with the `ttl` and `exp` of the token, so that intermediaries do not keep a token longer than the
  Status Issuer intends.
- Issuer catalogue `PP_RP_IA_Supportive_002` (EUDI_generic, EUDI_optional): the response sets cache headers
  consistent with `ttl` and `exp`.

## How to reproduce

```bash
pnpm rp-conformance issuer run --adapter eudiplo --ics adapters/issuer-eudiplo/ics.yaml --only PP_RP_IA_Supportive_002
```

FAIL: step 2 `sl-cache failed (the response sets neither Cache-Control nor Expires)`; the headers are in
`artifacts/PP_RP_IA_Supportive_002/SD+PA/step-2/status-observation.json` (`credentials[0].polls[0].headers`).

## Where in the source

`StatusListController.getList` sets only `Content-Type`
([status-list.controller.ts#L28-L48](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/issuer/status-list/status-list.controller.ts#L28-L48));
the token's `ttl` is set in `StatusListService`
([status-list.service.ts#L340](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/issuer/status-list/status-list.service.ts#L340)).

A fix: set `Cache-Control: max-age=<min(ttl, exp - now)>` (or `no-cache` with the `ETag` EUDIPLO already sends) on
both the JWT and the CWT response.
