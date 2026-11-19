# Verifier accepts a credential of a type the DCQL query did not request (`vct_values`, `doctype_value`)

## What EUDIPLO does

EUDIPLO accepts a presented credential whatever its type, as long as its signature, trust chain and claims verify:

- SD-JWT VC: the query asks for `"meta": { "vct_values": ["urn:eudi:pid:1"] }`; the credential, signed by the listed
  PID Provider `PP-A`, has `"vct": "urn:eudi:other:1"`. Session `status` `completed`, outcome
  `{"result": "success", "credentials": [{"id": "pid", "verified": true, "trust": {"matchedIssuer": "PP-A", ...}}]}`,
  and the claims are released with `"vct": "urn:eudi:other:1"`.
- mdoc: the query asks for `"meta": { "doctype_value": "eu.europa.ec.eudi.pid.1" }`; the MSO and the document carry
  `docType` `org.iso.18013.5.1.mDL` (namespace `eu.europa.ec.eudi.pid.1`, signed by `PP-A`'s document signer). Session
  `completed`, `verified: true`, claims `family_name`, `given_name`, `birth_date` released.

## What the specification says

- OpenID4VP 1.0, Appendix B.3.5: `vct_values` is "A non-empty array of strings that specifies allowed values for the
  type of the requested Verifiable Credential." Appendix B.2.3: `doctype_value` is the "allowed value for the doctype
  of the requested Verifiable Credential."
- OpenID4VP 1.0, section 8.6: the Verifier validates "that the returned Credential(s) meet all criteria defined in the
  query in the Authorization Request", and checks "that the set of Presentations returned satisfies all requirements
  defined in the Verifier's request as described in Section 6.4"; a Presentation that fails a check "MUST be
  discarded". Section 14.9: "the Verifier MUST perform its own security checks on the returned Credentials and
  Presentations."

A Wallet that returns a credential of another type (by mistake or on purpose) must not get its claims accepted as a PID.
For SD-JWT VC, a `vct` that extends one of `vct_values` (SD-JWT VC type inheritance) may be accepted; `urn:eudi:other:1`
does not.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only RP_WS_SM_IssuerIntegrity_013_UF,RP_WS_SM_IssuerIntegrity_025_UF
```

Both FAIL in both flows (redirect and DC API): "attributes were released" (run `r20261119T222700-cfa8a7`,
`artifacts/RP_WS_SM_IssuerIntegrity_013_UF/redirect/step-1/` and `.../RP_WS_SM_IssuerIntegrity_025_UF/redirect/step-1/`:
`request.jwt`, `credential.sd-jwt` or `credential.issuer-signed.cbor`, `rp-result.json`). The positive controls with
`vct` `urn:eudi:pid:1` and `docType` `eu.europa.ec.eudi.pid.1` pass.

## Where in the source

`VerifyPresentationResponse.execute` passes `claims` and `claimSets` of the credential query to the format's
`verify`, but not `credentialQuery.meta`, and no other step compares the presented `vct` or `docType` with it:
[verify-presentation-response.ts#L242](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/application/verify-presentation-response.ts#L242).
Both formats already return the type (`MdocverifierService` returns `docType`; the SD-JWT VC payload has `vct`), so a
check after `verify`, failing the credential when the type is not in `meta.vct_values` or is not `meta.doctype_value`,
would cover both. The ISO 18013-7 flow (`iso18013.service.ts`) builds its `ItemsRequest` from `doctype_value` but may
need the same check on the response.
