# FCAF overlay: Relying Party baseline test cases

Draft of 2026-11-06. This overlay adds a **Relying Party** System Under Test to the EU Functional Conformance Assessment Framework (FCAF, [conformance.eudi.dev](https://conformance.eudi.dev)), with 121 baseline test cases and 137 further test cases written in the FCAF test case format. The objectives and the decisions behind them are in [rp-test-catalogue.md](../rp-test-catalogue.md).

## Base

The overlay is laid over the content branch `submitted` of `eu-digital-identity-wallet/eudi-doc-functional-conformance-assessment` at commit `0ed4ab1` (2026-10-16). Copy `docs/fcaf/` over the `docs/fcaf/` of that branch.

## Contents

New files:

| Path | Content |
| --- | --- |
| `docs/fcaf/suts/relying_party/index.md` | Relying Party SUT overview, test classes, decisions applied |
| `docs/fcaf/suts/relying_party/wallet_solution/` | Class `RP_WS`: overview, baseline list, test case page, 212 test cases (84 of the baseline) |
| `docs/fcaf/suts/relying_party/infrastructure/` | Class `RP_Inf`: overview, baseline list, test case page, 9 test cases |
| `docs/fcaf/suts/relying_party/pid_provider/` | Class `RP_PP`: overview, baseline list, test case page, 37 test cases |
| `docs/fcaf/ics-rp.md` | Relying Party ICS (capabilities, policies, time values, surrogate technology items) |

Modified copies of existing files (the base content plus additions):

| Path | Change |
| --- | --- |
| `docs/fcaf/defaults.md` | Appends the section "Relying Party testing": test roles, verification result, `default_configuration_rp_1`, `default_trust_configuration_rp`, the PID and attestation credentials and the default queries |
| `docs/fcaf/references.md` | Adds `[ARF]` (v3.0.0), `[ETSI TS 119 602]`, `[ISO/IEC 18013-5 ed2]`, `[RFC8392]`, `[RFC8725]` |
| `docs/fcaf/.nav.yml` | Adds the Relying Party SUT and the Relying Party ICS to the navigation |
| `docs/fcaf/suts/index.md` | Mentions the draft Relying Party SUT |

`fcaf_lint-rp.patch` changes the lint tool on the `site` branch (`tools/fcaf_lint.py`) so that it checks `RP_*` test case files and reads the ICS vocabulary from `ics-rp.md` as well. Without it the lint skips these files.

## Baseline

| Area | Test cases | Of which unhappy flow |
| --- | --- | --- |
| `RP_WS_IA_MainInteraction` (positive controls) | 2 | 0 |
| `RP_WS_SM_Validity` | 10 | 8 |
| `RP_WS_SM_Revocation` | 18 | 13 |
| `RP_WS_SM_TrustMechanisms` | 32 | 22 |
| `RP_WS_SM_SessionEncryption` | 22 | 16 |
| `RP_PP_SM_Revocation` | 37 | 31 |
| **Total** | **121** | **90** |

Variant letters: `a` is SD-JWT VC (with a Status List Token in JWT format in `RP_PP`), `b` is mdoc (CWT); in `SessionEncryption`, `a` is redirects with `direct_post.jwt` and `b` the W3C Digital Credentials API with `dc_api.jwt`. Where a catalogue objective has several stimuli, each stimulus is one test step with its own expected result.

Catalogue objectives in these areas that are not in the baseline: `RP_WS_SM_Validity_004` (informative only), `RP_WS_SM_Validity_020` (policy-dependent), `RP_WS_SM_Revocation_011` (aggregate of two other test cases), `RP_PP_SM_Revocation_014` and `_031` (optional checks), `RP_WS_SM_TrustMechanisms_017` (optional check).

## Beyond the baseline

The remaining catalogue areas are written as test cases one area at a time (harness Phase 5). They appear on the test case pages of their class but not in the baseline lists.

| Area | Test cases | Of which unhappy flow |
| --- | --- | --- |
| `RP_WS_SM_SessionBinding` | 10 | 10 |
| `RP_WS_SM_DeviceBinding` | 15 | 14 |
| `RP_WS_SM_IssuerIntegrity` | 38 | 36 |
| `RP_Inf_SM_TrustMechanisms` | 9 | 6 |
| `RP_WS_MS_ProtocolMessages` | 5 | 0 |
| `RP_WS_MS_Metadata` | 5 | 0 |
| `RP_WS_MS_CredentialFormats` | 8 | 0 |
| `RP_WS_SM_RpIntegrity` | 7 | 0 |
| `RP_WS_IA_Engagement` | 2 | 0 |
| `RP_WS_IA_ProtocolFlow` | 14 | 8 |
| `RP_WS_IA_MainInteraction` (`_002` to `_005`) | 8 | 0 |
| `RP_WS_DM_IdentifyingData` | 12 | 4 |
| `RP_WS_DM_CredentialMetadata` | 4 | 4 |
| **Total** | **137** | **82** |

Variant letters are the credential format, as in the baseline. Most of these test cases are for one format and run in every presentation flow; `SessionBinding_002` and `_008` are for redirects, `_006`, `_007` and `_009` for the W3C Digital Credentials API, because the audience of a KB-JWT and the handover of an mdoc differ between the flows. The request-side test cases (`RP_WS_MS_*`, `RP_WS_SM_RpIntegrity`) check the requests the Relying Party sends, without answering them; `ProtocolMessages_001`, `_002` and `_004` are for redirects, `ProtocolMessages_005` and `RpIntegrity_007` for the W3C Digital Credentials API. The `RP_Inf` test cases, in the new class directory `infrastructure/`, publish a new version of `TL-PID` or `TL-QEAA` and present a credential whose acceptance depends on it.

Catalogue objectives in these areas that are not written: `RP_WS_SM_SessionBinding_010`, `RP_WS_SM_DeviceBinding_012`, `RP_WS_SM_RpIntegrity_010` and `_011` (ISO/IEC 18013-5 proximity, which the harness does not cover); `RP_WS_SM_IssuerIntegrity_035` (a signing certificate revoked by a CRL: an optional check, and the harness serves no CRLs); `RP_Inf_SM_TrustMechanisms_007` (changes reach every Relying Party Instance: the harness observes one), `_010` and `_011` (covered by other test cases); `RP_WS_MS_ProtocolMessages_006` (ISO/IEC 18013-7 Annex C); `RP_WS_SM_RpIntegrity_008` (several services) and `_009` (intermediaries).

`RP_WS_IA_Engagement` and `RP_WS_IA_ProtocolFlow` (issue 29) cover how the Relying Party invokes the wallet and handles the steps around the presentation. `Engagement_001` and `ProtocolFlow_001` to `_003` are request-side test cases; `ProtocolFlow_002` retrieves the request object twice, `_003` with POST and `wallet_nonce` and applies only when the Relying Party sets `request_uri_method` to `post` (ICS RP.P.8). `ProtocolFlow_004_UF` retrieves the `request_uri` of a completed and of an unknown transaction; `_005` checks the `redirect_uri` with its response code; `_006_UF` to `_009_UF` open the `redirect_uri` in the user agent that started the transaction, in a fresh one, twice, or with a forged response code, and apply only when the Relying Party redeems the response code at its own front end (ICS RP.P.9); `_010` and `_014` send the wallet's error response; `_011_UF` sends the Authorization Response after the transaction lifetime `T_tx` (ICS RP.P.7), in both flows; `_012_UF` sends it twice; `_013_UF` changes or removes its `state`. Not written: `RP_WS_IA_Engagement_002` (the cross-device QR code encodes the same request as same-device): the harness receives one invocation URI per transaction and does not read the QR code the Relying Party renders in its user interface. The catalogue rows of `Engagement_001`, `ProtocolFlow_003`, `_004_UF`, `_006_UF` to `_009_UF` and `_014` were changed to what is executable; each row says why.

The data model test cases (`RP_WS_DM_*`, in the new layer directory `DataModel/`) present attribute variants of `default_credential_pid`, several of them for a variant of `default_query_pid` that the preconditions name: every mandatory attribute of the PID rulebook, the age-over attribute for 18 without and with a `values` constraint, three members of the structured address. They need the attributes the Relying Party releases, which every adapter reports with its verification result. `RP_WS_DM_IdentifyingData_006` and `_007` are written for SD-JWT VC only: the mdoc PID has no structured address, and an unknown mdoc element reaches the Relying Party only when the wallet presents an element the query does not request, which is `RP_WS_DM_CredentialMetadata_001b_UF`. `RP_WS_DM_IdentifyingData_004` accepts a rejection, or an acceptance whose verification result flags the attribute (`attribute-invalid`); `RP_WS_DM_CredentialMetadata_001` a rejection, or an acceptance that does not release the extra attributes. Whether the Relying Party retains them cannot be observed and stays with the test book (`RP_TB_001`).

## Test book

The 10 test book items of the catalogue (`RP_TB_001` to `_010`, [rp-test-catalogue.md](../rp-test-catalogue.md) section 5.4) are not rendered and stay in the catalogue only. The FCAF names test books as one of its elements ("structured collections of manual or non-automatable test cases", `introduction.md` of `submitted` at `0ed4ab1`), but defines no format, template, test class or location for them: its only template is the test specification template, whose test scenario and expected results an inspection does not have, and the FCAF identifiers and the lint require a layer and an area. The definitions are in [../packages/definitions/src/test_book](../packages/definitions/src/test_book); every run lists them as REVIEW with their method in `report.json`, `summary.md` and the JUnit XML, and they never fail a run. They can be rendered once the FCAF defines a test book format.

## Rendering

The files are rendered; do not edit them here. The test cases come from the executable definitions in [../packages/definitions](../packages/definitions), the shared pages from [../packages/fcaf-render/pages](../packages/fcaf-render/pages), and the modified FCAF pages from their originals in [../packages/fcaf-render/upstream](../packages/fcaf-render/upstream) (`submitted` at `0ed4ab1`). From the repository root:

```bash
pnpm fcaf:render
```

CI fails when the committed files differ from the rendered ones, and runs the lint below through `scripts/fcaf-lint.sh`.

## Verification done

- The FCAF lint (`tools/fcaf_lint.py` from the `site` branch at `e2f076a`, with the patch above) reports 0 blocking findings and 0 warnings for the 258 files, including the advisory checks for ICS vocabulary, reference keys, `default_*` definitions, relative links and identifier markup. CI runs it with `--enforce-all`, so any finding fails the build.
- The lint over the whole corpus reports the same 3,779 warnings with and without the overlay, so the modified shared pages change nothing for the existing Wallet Solution test cases.
- The MkDocs build of the FCAF site (the `site` branch at `e2f076a` with the hooks of the FCAF repository) passes with `--strict`, with the overlay laid over `submitted`; the `include-markdown` pages render all 218 test cases. `scripts/site-build.sh` runs it, and `.github/workflows/pages.yml` publishes the result at [rp-conformance.eudi-wallet.dev](https://rp-conformance.eudi-wallet.dev/), under this project's name and colours instead of the Commission's.

## Open points before an upstream pull request

1. Agreement with the FCAF maintainers on adding a Relying Party SUT; the methodology already reserves the classes `RP_WS`, `RP_PP`, `RP_AP` and `RP_Inf`.
2. The lint patch goes to the `site` branch, the content to `submitted`.
3. The EUDI anchors: the test cases cite `[CIR 2024/2982 amended] Annex II` for presentation and `[CIR 2024/2979 amended] Annex II` for revocation (the latter following [ARF] Annex 2, VCR_11). Whether these Implementing Regulations bind Relying Parties directly, or only through the Wallet's profile, needs confirmation.
4. `[ISO/IEC 18013-5 ed2]` refers to a draft; its section numbers are left out.
5. SD-JWT VC `typ` `vc+sd-jwt` is rejected in the catalogue (decision 6), but no baseline test case covers it yet.
