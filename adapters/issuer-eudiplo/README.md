# EUDIPLO issuer adapter

`IssuerAdapter` for EUDIPLO as the reference PID Provider of the issuer suite (issuer harness design sections 5.4 and
5.5, decision 2). Its ICS is [`ics.yaml`](ics.yaml), its known findings [`known-findings.yaml`](known-findings.yaml).

## Reference image

The suite is validated against a digest of EUDIPLO's main image, pinned in [`reference.env`](reference.env) (read by
`docker compose --env-file` and by `REFERENCE_EUDIPLO` in [`src/reference.ts`](src/reference.ts); change it there only):

| | |
| --- | --- |
| Image | `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7` |
| Version (`GET /api/version`) | `9.1.0-main.ae0792a` |
| Revision | `ae0792a98991c28607879c2291d26b26b9ee9817` |

It stays a digest of the main image until a release of EUDIPLO has the features below (decision of 2026-11-20). The
release 9.1.0 lacks too much of what the catalogue tests:

> **Why not 9.1.0.** EUDIPLO 9.1.0 (2026-10-10) cannot create a CSR for its keys (`GET /api/key-chain/{id}/csr` answers
> `404 Cannot GET`), so the Test Registrar had to generate them. It accepts a wallet attestation whose status list cannot
> be fetched and has no setting to reject it (`walletAttestationStatusCheckMode` came with EUDIPLO/eudiplo#1340). It
> checks no key attestation status at all and cannot revoke a PID with its wallet unit (`revokeWithWalletUnit` came with
> EUDIPLO/eudiplo#1468). It keeps using a trust list after its `NextUpdate` (EUDIPLO/eudiplo#1441). Against 9.1.0, a
> PID Provider would fail `ClientAttestation_013_UF`, `KeyAttestation_008_UF` and `_009_UF`, and could not run
> `SM_Revocation_006`, `_007` or `PP_TB_007` at all. The adapter still configures 9.1.0 (it leaves out what the instance
> does not know), so it can be run against later releases to decide when one can replace the digest.

## What the adapter configures

One tenant per namespace, as the RP adapter does (`adapters/eudiplo`):

| Hook | EUDIPLO calls |
| --- | --- |
| `enrol(namespace)` | Creates the tenant and three standalone key chains (`attestation`, `statusList`, `access`) and returns their CSRs (`GET /api/key-chain/{id}/csr`). On an instance without the CSR route (9.1.0) it returns `undefined` and the Test Registrar generates the keys. |
| `setUp(env, namespace)` | Tenant with the roles `issuance:manage` and `issuance:offer` (one left from an earlier run is replaced). Key chains: the Registrar's certificates for the CSR key chains (`PUT /api/key-chain/{id}` `activeCertificate`), or else the Registrar's keys imported with their chains (`POST /api/key-chain/import`): credential signer under `PP-T`, status list signer under the revocation anchor of `PP-T`, access certificate from `AC-A`. Status list settings (`PUT /api/status-list-config`): 2 bits, 10 000 entries, `ttl` 60 s, `immediateUpdate`. The PID configuration `pid-sd-jwt-vc` (`dc+sd-jwt`, `vct` `urn:eudi:pid:1`, `keyBinding`, `statusManagement`, `keyAttestationsRequired` with the ICS levels, `revokeWithWalletUnit`, 30 days). The issuance configuration: built-in authorization server, `walletAttestationRequired`, `walletProviderTrustLists` = the harness's `TL-WP` pinned to its scheme operator certificate, `walletAttestationStatusCheckMode` `strict` (wallet attestations at the authorization server, key attestations at the credential endpoint), `batchSize` from the ICS, DPoP, notification endpoint, and the Registrar's registration certificate in `issuer_info`. |
| `createOffer` | `POST /api/issuer/offer`, pre-authorized code at the built-in authorization server, the subject's claims inline (`credentialClaims`), optionally a 6-digit `tx_code` (`txCode: true`). EUDIPLO offers by reference only; for `byReference: false` the adapter resolves the reference (once, it is single-use) and hands out `credential_offer` by value. |
| `setStatus` | `POST /api/session/revoke` (`0` valid, `1` revoked, `2` suspended), then `GET /api/session/{id}/credential-status` must show the new status for every credential of the session. |
| `refreshTrust` | `DELETE /api/cache/trust-list` |
| `describe` | URL, version and revision (`GET /api/version`), tenant, enrolment method, the status check mode and revocation chaining as configured |
| `tearDown` | `DELETE /api/tenant/{id}` |

Revocation chaining is a poll: every `WALLET_UNIT_STATUS_CHECK_INTERVAL` seconds EUDIPLO reads the key attestation
status of every PID it follows and revokes the PIDs of a revoked wallet unit. The Compose file sets it to 30 s (default
3600 s), so `T_chain` is 30 s plus up to 300 s of reuse of `SL-WP-A` (its `ttl`) plus `T_rev`: PT7M in the ICS.

The values the adapter seeds for `SUBJ-1` and `SUBJ-2` are in [`src/subjects.ts`](src/subjects.ts) (`PID_SUBJECTS`):
the Conformance Wallet compares the issued claims with them. `loadIssuerIcs` rejects an ICS whose declared durations
exceed the catalogue's caps (`T_rev`, `T_chain` 24 h; `T_proof`, `T_skew` 5 minutes) or with fewer than 10 000 status
list entries.

## Integration test

Not part of `pnpm test`, since it needs a running EUDIPLO:

```bash
EUDIPLO_PORT=3216 docker compose --env-file adapters/issuer-eudiplo/reference.env -p rp-conformance-i16 -f adapters/eudiplo/docker-compose.yml up -d --wait
```

```bash
EUDIPLO_PORT=3216 pnpm test:issuer-eudiplo
```

```bash
docker compose -p rp-conformance-i16 -f adapters/eudiplo/docker-compose.yml down -v
```

It enrols the SUT by CSR with the Test Registrar, publishes `TL-WP` (as the Test Wallet Provider builds it,
`publishTlWp`) and `TL-PID` on the Test Trust Infrastructure, and runs `setUp`. It then checks:

- that EUDIPLO stored the strict status check and `revokeWithWalletUnit`;
- the Credential Issuer metadata: the PID configuration, the key attestation levels, the batch size, the nonce and notification endpoints, and encryption;
- the authorization server metadata: `attest_jwt_client_auth` and DPoP;
- the signed metadata (`Accept: application/jwt`), whose `x5c` must be the Registrar's access certificate chain;
- offers by value and by reference, with and without `tx_code`, which it resolves;
- the status list settings, `setStatus` and `refreshTrust`;
- that `tearDown` removes the tenant.

`EUDIPLO_EXPECT_VERSION` (default: the version in `reference.env`) is the version the instance must report; the checks
of the reference's own features run only when it is the reference version.

`setStatus` cannot be shown without an issued credential: for a session that has issued none, EUDIPLO answers
`409 No status mapping found for session ... and credential configuration undefined`, and
`GET /api/session/{id}/credential-status` answers `[]`. The test asserts exactly that; revocation of an issued PID comes
with the issuance client and the first issuer test cases (issue 17).

## What the pinned image still lacks, and the test cases it leaves not validated

Checked against the running image and EUDIPLO's source at `ae0792a`.

| Gap | Effect | Test cases not validated against EUDIPLO |
| --- | --- | --- |
| No login at the built-in authorization server: it issues authorization codes without a login or consent step | No `authenticateSubject` yet, `P-AC` No (see below) | `PP_WS_IA_AuthorizationCode_*` and every `AC` variant |
| No DPoP server nonce (no `DPoP-Nonce` or `use_dpop_nonce` in the source) | NOT APPLICABLE (`ICS-13.dpop_nonce` No; `P-DPN` stands for the nonce endpoint only) | `PP_WS_SM_TokenBinding_006_UF` |
| Identifier lists are read as verifier but never published by the issuer | `P-IL` No | `PP_RP_SM_Revocation_007` and the identifier list variants of `SCN-P` |
| A proof's `iat` is checked only against the future; its age is bounded only by the `c_nonce`, which lives 10 minutes | `ICS-14.T_proof` "not bounded"; the test cases take the 5 minute cap | `PP_WS_SM_ProofOfPossession_006_UF` (`iat` − 1 h with a fresh `c_nonce`): expected FAIL, a known finding once it runs |
| No subject record to change: the claims travel with each offer | No `changeSubject` | `PP_WS_SM_Revocation_008` (NOT APPLICABLE) |
| With `walletAttestationRequired`, the authorization server metadata still lists `none` next to `attest_jwt_client_auth` in `token_endpoint_auth_methods_supported` | Whether a request without attestation is accepted is for the client attestation test cases to show | to be seen in `PP_WS_SM_ClientAttestation_*` |
| Shortest status list lifetime 60 s (`ttl` minimum, live) | `T_rev` PT1M with `immediateUpdate` | none: `REVOKED(T_rev)` test cases poll for a minute |
| Revocation chaining is a poll, and a suspended wallet unit changes nothing | `T_chain` PT7M; a suspended WIA or KA is still rejected at issuance (strict), but suspension does not chain | none (the catalogue chains revocation only) |

Not configured by the adapter although EUDIPLO supports it; each can be added when the test cases need it:

| Feature | ICS | Test cases not validated until then |
| --- | --- | --- |
| PID in mdoc (`mso_mdoc`, `eu.europa.ec.eudi.pid.1`); a PID Provider must issue both formats (PID_02) | `ICS-02` SD-JWT VC only | `PP_WS_DM_PidMdoc_*`, `PP_WS_MS_Metadata_006`, `PP_WS_IA_MainInteraction_003` and every `MD` variant |
| Deferred issuance (an attribute provider or webhook that defers) | `P-DEF` No | `PP_WS_IA_Deferred_*` |
| Embedded disclosure policy | `P-EDP` No | `AP_WS_MS_Metadata_102`, `AP_WS_SM_Revocation_102` (Attestation Providers) |
| Short-lived configuration without status | `P-SHORT` No | `PP_WS_SM_Validity_002` |
| Portrait and its opt-out | `ICS-17.portrait_opt_out` No | `PP_WS_DM_Portrait_001` |

## Authorization code flow with a scripted login (for issue 20)

The pinned image can run the authorization code flow with a real login through a **chained** authorization server
(docs `issuance/authorization-servers.md`, "Chained"). EUDIPLO is the authorization server towards the wallet: PAR,
PKCE `S256`, DPoP and wallet attestation stay EUDIPLO's. It delegates the login to an upstream OpenID provider:

1. The harness runs a small test OpenID provider on the host: discovery, `jwks_uri`, an authorization endpoint and a
   token endpoint. Its authorization endpoint logs in the test subject without a form: it answers at once with a
   redirect to EUDIPLO's callback carrying a `code`, for the subject the adapter named, and its ID token has
   `sub` = `SUBJ-1`. The Compose file already allows HTTP and private addresses for outbound calls
   (`OUTBOUND_URL_ALLOW_HTTP`, `OUTBOUND_URL_ALLOW_PRIVATE_NETWORK`), so EUDIPLO can reach it at
   `host.docker.internal`. The redirect URI to register is `{PUBLIC_URL}/issuers/{tenant}/chained-as/callback`.
2. `setUp` adds `{ "type": "chained", "id": "subject-login", "upstream": { "issuer": "<provider>", "clientId": "eudiplo" } }`
   to `authorizationServers`, after the built-in server, with `walletAttestationRequired` as for the built-in one. The
   built-in server must stay the first entry, since only it redeems pre-authorized codes.
3. `createOffer` with `grant: 'authorization_code'` posts `flow: authorization_code` and `authorization_server: subject-login`.
   The claims stay inline with the offer, so the subject's values do not depend on the provider.
4. `authenticateSubject(authorizationRequestUrl, subject)` makes the provider log in `subject` next. It then follows
   the redirects: EUDIPLO's `/chained-as/authorize`, the provider, EUDIPLO's `/chained-as/callback`. It returns the
   final redirect to the wallet's `redirect_uri` with `code`.

The `oid4vp` authorization server is the alternative: the "login" is a PID presentation, which the RP harness's
Conformance Wallet could answer. It ties the issuer suite to the RP side, though, so the chained server is the simpler
choice. The built-in server issues codes without any login, so a hook there would only follow the redirect, and would
not test that the User authenticates.
