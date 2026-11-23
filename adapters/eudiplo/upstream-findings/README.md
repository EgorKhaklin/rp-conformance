# Prepared upstream issues for EUDIPLO

Issue texts for the known findings in [`../known-findings.yaml`](../known-findings.yaml) that are not reported upstream
yet. Each file is one issue for `EUDIPLO/eudiplo`: the first heading is the title, the rest is the body. The confirmed
findings were filed on 2026-11-21 and the table links their issues; the others are opened by hand once the maintainer agrees, the issue reference then goes into the `reference` of the
entries and the file is removed.

All findings were reviewed against the primary specifications and EUDIPLO's source on 2026-11-20 (spec review of the
EUDIPLO findings). Each text names the specification version it quotes and says whether the requirement is one of the
base specification (`basis: confirmed` in the findings list) or of the EUDI profile only (`basis: profile`). Findings
whose test was wrong were removed with their texts; findings without a specification MUST are no longer FAILs, and the
texts kept for them are in [`suggestions/`](suggestions), clearly labelled as hardening suggestions or questions.

Checked against `ghcr.io/eudiplo/eudiplo:main` (`sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`,
version `9.1.0-main.ae0792a`, revision `ae0792a98991c28607879c2291d26b26b9ee9817`). Source links point to that
revision. The evidence is shortened; the certificates and credentials are test data of the suite's test PKI.

| Issue or text | Basis | Test cases |
| --- | --- | --- |
| [EUDIPLO/eudiplo#1649](https://github.com/EUDIPLO/eudiplo/issues/1649) | confirmed (RFC 9052 section 3) | `RP_WS_SH_Encoding_003_UF` step 5 (`mdoc.issuer-auth-duplicate-label`, found 2026-11-22) |

Fixed on `ghcr.io/eudiplo/eudiplo:main` (`10.0.0-main.7586139`, re-run of 2026-11-22) and removed from the findings
list: [EUDIPLO/eudiplo#1615](https://github.com/EUDIPLO/eudiplo/issues/1615) (`RP_WS_SM_IssuerIntegrity_013_UF`,
`_025_UF`), [EUDIPLO/eudiplo#1616](https://github.com/EUDIPLO/eudiplo/issues/1616) (`_034a_UF`, `_034b_UF`, `_037a_UF`,
`_037b_UF`) and [EUDIPLO/eudiplo#1617](https://github.com/EUDIPLO/eudiplo/issues/1617) (`RP_WS_DM_IdentifyingData_001b`).

`RP_WS_SM_Validity_005b_UF` (an expired mdoc's status list is fetched before the validity check, in `@owf/mdoc`) is a
profile-only known finding without a text here: the "MUST NOT" fetch rule of Token Status List section 8.3 is in
draft-19 and later (draft-17 and -18 word it as "no further procedures ... MUST be performed"), while HAIP 1.0 pins
draft-14; low severity. No issue is needed: `@owf/mdoc` checks the validity before the status since
[openwallet-foundation-labs/identity-common-ts#478](https://github.com/openwallet-foundation-labs/identity-common-ts/pull/478)
(merged 2026-11-17, after the 0.10.0 release). EUDIPLO main (`7586139`, re-run of 2026-11-23) still resolves
`@owf/mdoc` 0.10.0; the finding goes once it takes a release with the fix (0.11.0, in alpha on 2026-11-23).

Suggestions and questions (not conformance findings, no FAIL in the suite):

| File | Test cases (informational or `POLICY`) |
| --- | --- |
| [suggestions/trust-list-invalid-seal-discards-last-valid.md](suggestions/trust-list-invalid-seal-discards-last-valid.md) | `RP_Inf_SM_TrustMechanisms_002_UF`, `_003_UF` (`POLICY` RP.T.4) |
| [suggestions/lote-type-not-checked.md](suggestions/lote-type-not-checked.md) | `RP_Inf_SM_TrustMechanisms_006_UF` (INFO) |

Removed after the review: the DC API `response_uri` text (`RP_WS_MS_ProtocolMessages_005`; OpenID4VP 1.0 Appendix A.2
allows additional parameters), and the document signer EKU part of the certificate path text
(`RP_WS_SM_IssuerIntegrity_027_UF`, now INFO: ETSI TS 119 412-6 clause 4 does not require the EKU, and the ISO/IEC
18013-5 profile could not be verified).

To reproduce any of them from a checkout of this repository:

```bash
pnpm install
```

```bash
EUDIPLO_IMAGE=ghcr.io/eudiplo/eudiplo:main docker compose -f adapters/eudiplo/docker-compose.yml up -d --wait
```

```bash
pnpm rp-conformance run --adapter eudiplo --only '<test case ID>'
```

The run writes `reports/<run>/report.json` and, per test case, flow and step, the request object, the credential, the
presentation and EUDIPLO's session (`rp-result.json`) under `reports/<run>/artifacts/`.
