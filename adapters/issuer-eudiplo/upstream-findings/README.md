# Prepared upstream issues for EUDIPLO as PID Provider

Issue texts for the known findings in [`../known-findings.yaml`](../known-findings.yaml). Each file is one issue for
`EUDIPLO/eudiplo`: the first heading is the title, the rest is the body. All of them were filed on 2026-11-21 and
2026-11-22: the table links the issues, the `reference` of the entries names them, and the texts are removed. A new
finding gets its text here first and is filed once the maintainer agrees.

All findings were reviewed against the primary specifications and EUDIPLO's source at `ae0792a` on 2026-11-20 (spec
review of the EUDIPLO findings). Each text names the specification version it quotes and says whether the requirement
is one of the base specification (`basis: confirmed` in the findings list) or of the EUDI profile only (`basis:
profile`: ARF, TS3, PID Rulebook), in which case EUDIPLO conforms to the base specification. Findings whose test was
wrong were removed with their texts; findings without a specification MUST are no longer FAILs, and the texts kept for
them are in [`suggestions/`](suggestions), labelled as hardening suggestions or questions.

Checked against `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`
(`9.1.0-main.ae0792a`, the image pinned in [`../reference.env`](../reference.env)). Source links point to revision
`ae0792a98991c28607879c2291d26b26b9ee9817`.

| Issue or text | Basis | Test cases |
| --- | --- | --- |
| [EUDIPLO/eudiplo#1618](https://github.com/EUDIPLO/eudiplo/issues/1618) | confirmed (OpenID4VCI 1.0 §9.3) | `PP_WS_IA_Deferred_002_UF` |
| [EUDIPLO/eudiplo#1619](https://github.com/EUDIPLO/eudiplo/issues/1619) | confirmed, minor (OpenID4VCI 1.0 §8.3.1.2) | `PP_WS_SM_ProofOfPossession_002_UF` |
| [EUDIPLO/eudiplo#1620](https://github.com/EUDIPLO/eudiplo/issues/1620) | profile (TS3 ≥ 1.5) | `PP_WS_SM_ClientAttestation_012_UF`, `_013_UF`, `PP_WS_SM_KeyAttestation_008_UF`, `_009_UF`, `PP_WS_SM_Revocation_007`, `PP_WS_IA_Reissuance_005_UF`, `PP_WS_SH_Encoding_004_UF` (and `_005_UF`, which it keeps from showing anything) |
| [EUDIPLO/eudiplo#1621](https://github.com/EUDIPLO/eudiplo/issues/1621) | profile (TS3 1.5 §2.4.3, WURevocation_18) | `PP_WS_SM_Revocation_006` |
| [EUDIPLO/eudiplo#1622](https://github.com/EUDIPLO/eudiplo/issues/1622) | profile (TS3 1.5 §2.4.3, ISSU_12c) | `PP_WS_SM_ClientAttestation_016_UF` |
| [EUDIPLO/eudiplo#1623](https://github.com/EUDIPLO/eudiplo/issues/1623) | profile (PID Rulebook v1.7 §3.1.2, PID_09) | `PP_WS_DM_PidMdoc_002` |
| [EUDIPLO/eudiplo#1624](https://github.com/EUDIPLO/eudiplo/issues/1624) | profile (PID_21) | `PP_WS_SM_IssuerIntegrity_005` |
| [EUDIPLO/eudiplo#1625](https://github.com/EUDIPLO/eudiplo/issues/1625) | profile (ARF WUA_10a; issue 27, not part of the review) | `AP_WS_MS_Metadata_008`, `_100`, `_101`, `AP_WS_SM_KeyAttestation_102`, `_103` |
| [EUDIPLO/eudiplo#1626](https://github.com/EUDIPLO/eudiplo/issues/1626) | profile (ARF EDP_11; issue 27, not part of the review) | `AP_WS_SM_Revocation_102` |
| [EUDIPLO/eudiplo#1650](https://github.com/EUDIPLO/eudiplo/issues/1650) | confirmed (OpenID4VCI 1.0 Appendix C.2), regression on `main` since `641b548` (#1636); worked around in the adapter (`mdocField` in `src/subjects.ts`), so no test case shows it | every `MD` variant on `main` before the workaround (`unknown_credential_configuration`) |

The `AP_*` variants of the `PP_*` test cases above (issue 27) share their text and basis.

Suggestions and questions (not conformance findings, no FAIL in the suite):

| File | Test cases (informational or `POLICY`) |
| --- | --- |
| [suggestions/client-attestation-pop-jti-replay.md](suggestions/client-attestation-pop-jti-replay.md) | `PP_WS_SM_ClientAttestation_009_UF` step 4 (INFO) |
| [suggestions/sd-jwt-salt-length.md](suggestions/sd-jwt-salt-length.md) | `PP_WS_SM_IssuerIntegrity_006` (SD; salt length recorded) |
| [suggestions/trust-list-last-known-good.md](suggestions/trust-list-last-known-good.md) | `PP_Inf_SM_TrustMechanisms_004_UF` (`POLICY` ICS-15.invalid_version) |

Removed after the review, because the test was wrong: the WIA/KA service anchor text (`PP_WS_SM_ClientAttestation_006_UF`,
`PP_WS_SM_KeyAttestation_004_UF`), the KA nonce text (`PP_WS_SM_KeyAttestation_007_UF`) and the status list cache
header text (`PP_RP_IA_Supportive_002`). The other findings the review classed as wrong tests or without a MUST
(`PP_WS_IA_AuthorizationCode_006_UF`, `_Reissuance_002_UF`, `_004_UF`, `_Notification_001`, `_002_UF`, `_Batch_003_UF`,
`PP_WS_SH_Encoding_002_UF`, `_003_UF`, `PP_WS_SM_ProofOfPossession_007_UF`) had no text here.

To reproduce one of them:

```bash
EUDIPLO_PORT=3228 docker compose --env-file adapters/issuer-eudiplo/reference.env -p rp-conformance-fix -f adapters/eudiplo/docker-compose.yml up -d --wait
```

```bash
EUDIPLO_PORT=3228 pnpm rp-conformance issuer run --adapter eudiplo --only '<test case ID>'
```
