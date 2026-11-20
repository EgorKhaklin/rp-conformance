# DC API request object carries `response_uri`

## What EUDIPLO does

For a presentation with `response_type` `dc-api`, the signed request object EUDIPLO passes to
`navigator.credentials.get` (protocol `openid4vp-v1-signed`, `response_mode` `dc_api.jwt`) also carries a
`response_uri`, the same one the redirect flow uses:

```json
{
  "response_type": "vp_token",
  "client_id": "x509_hash:V8sw3KF2tUfnAg_zUzwWHwM7aRw0J28NPoZmHOhMFug",
  "response_uri": "http://127.0.0.1:3230/presentations/c936f459-f025-4af2-9a5f-1687b762126e/oid4vp",
  "response_mode": "dc_api.jwt",
  "expected_origins": ["http://127.0.0.1:56293"],
  "aud": "https://self-issued.me/v2"
}
```

## What the specification says

OpenID4VP 1.0, Appendix A.2: "Out of the Authorization Request parameters defined in [RFC6749] and Section 5, the
following are supported with OpenID4VP over the W3C Digital Credentials API:" `client_id`, `response_type`,
`response_mode`, `nonce`, `client_metadata`, `request`, `transaction_data`, `dcql_query`, `verifier_info`.
`response_uri` is not among them: over the DC API the response goes back through the API to the page, not to a URI of
the Verifier. HAIP 1.0 section 5.2 requires `dc_api.jwt` and refers to Appendix A for the rest.

A.2 has no explicit "MUST NOT" for `response_uri`, and a Wallet ignores parameters it does not recognize, so this is a
low-severity deviation. It matters because a Wallet that does read `response_uri` from a DC API request would post the
response there, outside the channel whose origin `expected_origins` binds.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only RP_WS_MS_ProtocolMessages_005
```

The test case starts a presentation in the DC API flow, captures the request the page hands to
`navigator.credentials.get` and checks it. Result: `FAIL`, check `dc-api-request`: "the DC API request carries a
response_uri" (run `r20261119T222700-cfa8a7`, `artifacts/RP_WS_MS_ProtocolMessages_005/dc-api/step-1/`). All other
checks of the request pass (`expected_origins`, encryption key, `dcql_query`).

## Where in the source

`Oid4vpService.createAuthorizationRequest` sets `response_uri` unconditionally and only switches `response_mode` and
`expected_origins` on `session.useDcApi`:
[oid4vp.service.ts#L367](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/oid4vp/oid4vp.service.ts#L367).
Leaving it out when `session.useDcApi` is set would fix it. The verification does not need it in this flow: the mdoc
handover for `dc_api` is built from `nonce`, `expected_origins` and the key thumbprint
(`mdoc-credential-verifier-format.ts`). EUDIPLO's own DC API client would need the endpoint to post the response to from
elsewhere, for example from the offer response.
