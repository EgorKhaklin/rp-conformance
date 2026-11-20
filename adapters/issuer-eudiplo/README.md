# EUDIPLO issuer adapter

`IssuerAdapter` for EUDIPLO as the reference PID Provider of the issuer suite (issuer harness design sections 5.4 and
5.5, decision 2), pinned to the release `ghcr.io/eudiplo/eudiplo:9.1.0`. Its ICS is [`ics.yaml`](ics.yaml), its known
findings [`known-findings.yaml`](known-findings.yaml).

## What the adapter configures

One tenant per namespace, as the RP adapter does (`adapters/eudiplo`):

| Hook | EUDIPLO calls |
| --- | --- |
| `enrol(namespace)` | Where the instance has `GET /api/key-chain/{id}/csr`: creates the tenant and three standalone key chains (`attestation`, `statusList`, `access`) and returns their CSRs. **9.1.0 has no CSR endpoint** (`GET /api/key-chain/{id}/csr` answers `404 Cannot GET`; added after 9.1.0 by EUDIPLO/eudiplo#1397), so on 9.1.0 it returns `undefined` and the Test Registrar generates the keys. |
| `setUp(env, namespace)` | Tenant with the roles `issuance:manage` and `issuance:offer` (a tenant left from an earlier run is replaced). Key chains: the CSR key chains get the Registrar's certificates (`PUT /api/key-chain/{id}` `activeCertificate`), or the Registrar's keys are imported with their chains (`POST /api/key-chain/import`): credential signer under `PP-T`, status list signer under the revocation anchor of `PP-T`, access certificate from `AC-A`. Status list settings (`PUT /api/status-list-config`): 2 bits, 10 000 entries, `ttl` 60 s, `immediateUpdate`. The PID configuration `pid-sd-jwt-vc` (`dc+sd-jwt`, `vct` `urn:eudi:pid:1`, `keyBinding`, `statusManagement`, `keyAttestationsRequired` with the ICS levels, 30 days); with `P-MD` the PID in mdoc `pid-mso-mdoc` (`mso_mdoc`, docType and namespace `eu.europa.ec.eudi.pid.1`, signed by the document signer the Registrar issued); with `P-SHORT` the short-lived `pid-sd-jwt-vc-short` and `pid-mso-mdoc-short` (12 hours, no status reference). The issuance configuration: built-in authorization server, `walletAttestationRequired`, `walletProviderTrustLists` = the harness's `TL-WP` pinned to its scheme operator certificate, `batchSize` from the ICS, DPoP, notification endpoint, the Registrar's registration certificate in `issuer_info`, and `walletAttestationStatusCheckMode` `strict` where the instance knows it (not 9.1.0). |
| `createOffer` | `POST /api/issuer/offer`, pre-authorized code at the built-in authorization server, the subject's claims inline (`credentialClaims`) in the names of each configuration's format, with the age attributes and the issuance and expiry dates derived at issuance (`pidClaimsFor`), optionally a 6-digit `tx_code` (`txCode: true`). EUDIPLO offers by reference only; for `byReference: false` the adapter resolves the reference (once, it is single-use) and hands out `credential_offer` by value. |
| `setStatus` | `POST /api/session/revoke` (`0` valid, `1` revoked, `2` suspended), then `GET /api/session/{id}/credential-status` must show the new status for every credential of the session. |
| `refreshTrust` | `DELETE /api/cache/trust-list` |
| `describe` | URL, version and revision (`GET /api/version`), tenant, enrolment method, whether the strict status check could be set |
| `tearDown` | `DELETE /api/tenant/{id}` |

The values the adapter seeds for `SUBJ-1` and `SUBJ-2` are the suite's (`PID_TEST_SUBJECTS` of `@rp-conformance/core`),
in [`src/subjects.ts`](src/subjects.ts) (`PID_SUBJECTS`, `pidClaimsFor`): the Conformance Wallet compares the issued
claims with them (`pid-values`).

With CSR enrolment the adapter creates two attestation key chains, one for SD-JWT VC and one for the mdoc document
signer, and names their profiles in the enrolment request (`credentialSigningProfiles`); the Registrar certifies the
second in the document signer profile of ISO/IEC 18013-5 Annex B.

EUDIPLO's claim field types are JSON types; it has no date type for mdoc, so the mdoc PID carries `birth_date`,
`issuance_date` and `expiry_date` as text strings instead of `full-date` (tag 1004): `PP_WS_DM_PidMdoc_002` is a known
finding, with the issue text in [`upstream-findings/mdoc-full-date.md`](upstream-findings/mdoc-full-date.md). The
portrait opt-out (`DM_Portrait_001`) is not offered: the PID configurations have no portrait, and inline JSON claims
cannot carry the empty byte string an mdoc needs (`ICS-17.portrait_opt_out` No).

Where a field of a later EUDIPLO release is not known to the instance under test, EUDIPLO's schema validation rejects
it with `unrecognized_keys`; the adapter then leaves the field out and repeats the call, so the same adapter runs
against the pinned 9.1.0 and against `main` in the nightly job. Any other rejection fails `setUp`.

## Integration test

Not part of `pnpm test`, since it needs a running EUDIPLO:

```bash
EUDIPLO_IMAGE=ghcr.io/eudiplo/eudiplo:9.1.0 EUDIPLO_PORT=3216 docker compose -p rp-conformance-i16 -f adapters/eudiplo/docker-compose.yml up -d --wait
```

```bash
EUDIPLO_PORT=3216 pnpm test:issuer-eudiplo
```

```bash
docker compose -p rp-conformance-i16 -f adapters/eudiplo/docker-compose.yml down -v
```

It enrols the SUT with the Test Registrar, publishes `TL-WP` (as the Test Wallet Provider builds it, `publishTlWp`) and `TL-PID` on the Test Trust Infrastructure, runs
`setUp`, checks the Credential Issuer metadata (the PID configuration, key attestation levels, batch size, nonce and
notification endpoints, encryption), the authorization server metadata (`attest_jwt_client_auth`, DPoP), the signed
metadata (`Accept: application/jwt`, `x5c` = the Registrar's access certificate chain), creates offers by value and by
reference with and without `tx_code` and resolves them, checks the status list settings, calls `setStatus` and
`refreshTrust`, and checks that `tearDown` removes the tenant. `EUDIPLO_EXPECT_VERSION` (default `9.1.0`) is the version
the instance must report; with `EUDIPLO_EXPECT_VERSION=9.1.0-main.ae0792a` the same test passes against
`ghcr.io/eudiplo/eudiplo:main`, enrolling by CSR and with the strict status check.

`setStatus` cannot be shown without an issued credential: for a session that has issued none, EUDIPLO answers
`409 No status mapping found for session ... and credential configuration undefined`, and
`GET /api/session/{id}/credential-status` answers `[]`. The test asserts exactly that; revocation of an issued PID needs
the issuance client (issue 15) and comes with the first issuer test case (issue 17).

## Hooks EUDIPLO 9.1.0 cannot offer

- **`authenticateSubject`** (`P-AC`): EUDIPLO's built-in authorization server issues authorization codes without any
  login or consent step (docs `issuance/authorization-servers.md`), so there is no subject authentication to script.
  It would need a `chained` authorization server in front of a test OpenID provider whose login the hook scripts (for
  example a small OIDC provider of the harness that logs in `SUBJ-1` without a form), with the claims still coming
  from the offer or an attribute provider. With the built-in server the hook could only follow the redirect, which
  tests the protocol but not "the User authenticates", so the ICS declares `P-AC` No.
- **`changeSubject`** (`SM_Revocation_008`): EUDIPLO keeps no subject record; the claims travel with each offer. It
  would need an attribute provider of the harness that serves `SUBJ-1`'s and then `SUBJ-2`'s values, plus a
  revocation of the old PID, which EUDIPLO's `activeCredentials` policy does only for subjects of an external
  authorization server.

## What EUDIPLO 9.1.0 lacks, and the catalogue test cases it leaves not validated

Checked against the running 9.1.0 (`927ac2c`) and the `v9.1.0` tag of its source; "after 9.1.0" names the upstream
change that adds it on `main`.

| Gap in 9.1.0 | Effect | Test cases not validated against EUDIPLO |
| --- | --- | --- |
| WIA status: when the status list cannot be fetched or parsed, the WIA is accepted (`wallet-attestation.service.ts`: "status checking is optional"); no setting for it (`walletAttestationStatusCheckMode` after 9.1.0, EUDIPLO/eudiplo#1340; the API rejects the field as `unrecognized_keys`) | A PID Provider must reject (catalogue decision 2, ISSU_21). Expected FAIL, a known finding once the test case runs | `PP_WS_SM_ClientAttestation_013_UF` |
| KA status: 9.1.0 checks no key attestation status at all (added after 9.1.0, EUDIPLO/eudiplo#1468) | Expected FAIL | `PP_WS_SM_KeyAttestation_008_UF`, `PP_WS_SM_KeyAttestation_009_UF` |
| Revocation chaining: no `revokeWithWalletUnit` (after 9.1.0, EUDIPLO/eudiplo#1468); `ICS-07` No, `T_chain` none | Mandatory for PID Providers (WURevocation_18): FAIL | `PP_WS_SM_Revocation_006`, `PP_WS_SM_Revocation_007`, `PP_TB_007` |
| No DPoP server nonce (no `DPoP-Nonce` or `use_dpop_nonce` in the source) | NOT APPLICABLE (`ICS-13.dpop_nonce` No; `P-DPN` stands for the nonce endpoint only) | `PP_WS_SM_TokenBinding_006_UF` |
| Identifier lists are read as verifier but never published by the issuer | `P-IL` No | `PP_RP_SM_Revocation_007` and the identifier list variants of `SCN-P` |
| No subject authentication at the built-in authorization server | `P-AC` No (see above) | `PP_WS_IA_AuthorizationCode_*` and every `AC` variant |
| No subject record to change | `changeSubject` missing | `PP_WS_SM_Revocation_008` |
| `NextUpdate` of a wallet provider list is not enforced (after 9.1.0, EUDIPLO/eudiplo#1441) | `ICS-15.next_update_grace` "not enforced"; the `POLICY` verdict compares with that | `PP_Inf_SM_TrustMechanisms_006_UF` is decided by the declared policy, which the catalogue may not accept as a grace period |
| Proofs are bound by `c_nonce` only, which lives 10 minutes | `ICS-14.T_proof` PT10M is above the catalogue's 5 minute cap; the time mutations of the test (`iat` ± 1 h) still apply | `PP_WS_SM_ProofOfPossession_006_UF` to be confirmed with the issuance client |
| Shortest status list lifetime 60 s (`ttl` minimum) | `T_rev` PT1M with `immediateUpdate` | none: `REVOKED(T_rev)` test cases poll for a minute |
| No enrolment by CSR (after 9.1.0, EUDIPLO/eudiplo#1397) | The Registrar generates the keys (`method` `generated`) | none |

Not configured by the adapter although EUDIPLO 9.1.0 supports it; each can be added when the test cases need it:

| Feature | ICS | Test cases not validated until then |
| --- | --- | --- |
| PID in mdoc (`mso_mdoc`, `eu.europa.ec.eudi.pid.1`); a PID Provider must issue both formats (PID_02) | `ICS-02` SD-JWT VC only | `PP_WS_DM_PidMdoc_*`, `PP_WS_MS_Metadata_006`, `PP_WS_IA_MainInteraction_003` and every `MD` variant |
| Deferred issuance (an attribute provider or webhook that defers) | `P-DEF` No | `PP_WS_IA_Deferred_*` |
| Embedded disclosure policy | `P-EDP` No | `AP_WS_MS_Metadata_102`, `AP_WS_SM_Revocation_102` (Attestation Providers) |
| Short-lived configuration without status | `P-SHORT` No | `PP_WS_SM_Validity_002` |
| Portrait and its opt-out | `ICS-17.portrait_opt_out` No | `PP_WS_DM_Portrait_001` |

Observed in passing: with `walletAttestationRequired` the authorization server metadata of 9.1.0 still lists `none`
next to `attest_jwt_client_auth` in `token_endpoint_auth_methods_supported`. Whether the token endpoint then accepts a
request without attestation is for the client attestation test cases to show.
