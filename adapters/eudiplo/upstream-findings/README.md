# Prepared upstream issues for EUDIPLO

Issue texts for the known findings in [`../known-findings.yaml`](../known-findings.yaml) that are not reported upstream
yet (cre8/rp-conformance#34). Each file is one issue for `EUDIPLO/eudiplo`: the first heading is the title, the rest is
the body. They are opened by hand once the maintainer agrees; the issue reference then goes into the `reference` of
the entries and the file is removed.

Checked against `ghcr.io/eudiplo/eudiplo:main` (`sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`,
version `9.1.0-main.ae0792a`, revision `ae0792a98991c28607879c2291d26b26b9ee9817`), run `r20261119T222700-cfa8a7` of
2026-11-19. Source links point to that revision. The evidence is shortened; the certificates and credentials are test
data of the suite's test PKI.

| File | Test cases |
| --- | --- |
| [dc-api-request-response-uri.md](dc-api-request-response-uri.md) | `RP_WS_MS_ProtocolMessages_005` |
| [dcql-credential-type-not-checked.md](dcql-credential-type-not-checked.md) | `RP_WS_SM_IssuerIntegrity_013_UF`, `_025_UF` |
| [certificate-path-constraints.md](certificate-path-constraints.md) | `RP_WS_SM_IssuerIntegrity_027_UF`, `_034a_UF`, `_037a_UF` (and `_034b_UF`, `_037b_UF`, see #47) |
| [trust-list-invalid-seal-discards-last-valid.md](trust-list-invalid-seal-discards-last-valid.md) | `RP_Inf_SM_TrustMechanisms_002_UF`, `_003_UF` |
| [lote-type-not-checked.md](lote-type-not-checked.md) | `RP_Inf_SM_TrustMechanisms_006_UF` |

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
