# PID Provider and Attestation Provider functional conformance tests: test catalogue

Draft 0.2, 2026-11-17 (decisions on the open questions applied, see §8.1). Phase "Test Objectives" in FCAF terms, the counterpart of [rp-test-catalogue.md](rp-test-catalogue.md) for the issuing side: every test is defined with its objective, stimulus, expected result, references and applicability. Test cases in the FCAF template and the harness come later; §9 lists what the harness needs beyond the RP harness.

## 0. Summary

| Item | Value |
| --- | --- |
| System under test | PID Provider or Attestation Provider (QEAA, PuB-EAA or non-qualified EAA Provider): the Credential Issuer, its Authorization Server, and the publication of its status lists. Identity proofing of the User and the Provider's back office are outside the protocol boundary and only covered by the test book. |
| Sources | ARF repository `main` of 2026-10-02 (latest tag v3.0.0), Annex 2 HLRs (by category: §3 Attestation & PID Providers, plus the issuer-side HLRs of §1, §2, §5 and §6); PID Rulebook (Annex 3.01); TS3 (Wallet Unit Attestation); OpenID4VCI 1.0; HAIP 1.0; RFC 9449 (DPoP), RFC 9126 (PAR), RFC 7636 (PKCE), OAuth 2.0 Attestation-Based Client Authentication; RFC 9901 (SD-JWT); SD-JWT VC draft-16; Token Status List draft-20; ISO/IEC 18013-5; ETSI TS 119 602, 119 612, 119 412-6, 119 472-3. Versions follow the FCAF reference table, as in the RP catalogue. |
| Structure | FCAF hierarchy with issuer-side classes named by analogy with the RP catalogue: `PP_WS`, `PP_RP`, `PP_Inf`, and `AP_*` for Attestation Providers. Plus a test book `PP_TB`. |
| Size | 182 test objectives: 75 unhappy flow (`_UF`) and 107 positive or conformance checks. Plus 14 test book items. Counted before format, grant and category variants are expanded. |
| Already covered elsewhere | 56 objectives correspond to modules of the OIDF plan `oid4vci-1_0-issuer-haip-test-plan` (conformance suite release-v5.2.2, as run by EUDIPLO), marked "OIDF" below: 17 exactly, 39 partly (§7). 30 of the plan's 61 modules have no objective here; §7.3 lists them as candidates. Nothing public tests WIA and KA validation against the Wallet Provider LoTE, WIA and KA revocation, revocation chaining, the pre-authorized code flow under HAIP, status list publication over time, or the PID data model. |

### Why the existing suites are not enough

- **FCAF** tests only the Wallet Solution. Its `WS_PP` and `WS_AP` classes are the wallet's interface towards a PID or Attestation Provider: the Provider is the test tool there, not the SUT. FCAF names PID Providers and Attestation Providers as future SUTs.
- **OIDF OpenID4VCI issuer tests** check the protocol against the specification. They do not know the EUDI trust model: which Wallet Providers an issuer must accept and reject (ISSU_19, ISSU_28), WIA and KA revocation (ISSU_21, ISSU_30, WUA_25, WUA_11a), the LoA High key storage required for PIDs (WUA_34), revocation chaining (WURevocation_18), the registration certificate in the metadata (RPRC_22), the PID Rulebook, or unlinkability of what is issued (ISSU_35, ISSU_36, VCR_17).

## 1. Scope

In scope: everything the Provider does in an issuance transaction, and the artifacts it publishes that other parties rely on.

- Publishing Credential Issuer and Authorization Server metadata, signed with the access certificate, with the registration certificate by value.
- Credential offers, pre-authorized code flow, authorization code flow with PAR and PKCE, token endpoint, nonce endpoint, credential endpoint, batch issuance, deferred issuance, notification, re-issuance.
- Validating the Wallet Unit: Wallet Instance Attestation (WIA) as client attestation, Key Attestation (KA), their trust anchors in the Wallet Provider LoTE, and their revocation status.
- Validating proofs of possession and DPoP, and binding the issued credential to an attested key.
- What is issued: format, signature and certificate chain, validity period, status reference, device binding, the PID Rulebook data model, selective disclosure, and unique elements.
- Revocation: status lists and identifier lists the Provider publishes, revocation on request and on events, and revocation chaining when the Wallet Unit is revoked.

Out of scope for now: identity proofing at LoA High (ISSU_18) and the authentication of the User in the authorization code flow, which the adapter automates against a test account (§3.5); issuance over the W3C Digital Credentials API (ISSU_03, conditional on the specification); Cryptographic Binding of Attestations (ACP_05, ACP_07, no scheme yet); ZKP (Topic 53); SUA attestations and payments (Topic 20); QTSP access to Authentic Sources (QTSPAS_*, a separate interface with its own specification, TS11); migration (Mig_*, which is wallet-side). Non-functional testing (load, penetration) is out of scope as in the RP catalogue.

## 2. Structure and conventions

### 2.1 Test classes

| Class | Interface | Contents |
| --- | --- | --- |
| `PP_WS` | PID Provider ↔ Wallet Solution | Metadata, offer, every endpoint of OpenID4VCI, WIA and KA validation, proofs, DPoP, and everything about the issued PID. |
| `PP_RP` | PID Provider ↔ Relying Party | Status lists and identifier lists as the Provider publishes them for Relying Parties. |
| `PP_Inf` | PID Provider ↔ trust infrastructure | Use of the Wallet Provider LoTE, and consistency of the Provider's signers with the anchors published for it. |
| `AP_WS`, `AP_RP`, `AP_Inf` | Attestation Provider ↔ same | Every `PP_*` objective not marked **PID only** applies to `AP_*` with the same number and the category variant `Q`, `PB` or `E`. The `AP_*` sections list only the objectives specific to Attestation Providers, numbered from 100. |
| `PP_TB` | Test book | Policies and processes without a protocol stimulus: identity proofing, revocation policies, discarding unique elements. |

Layers follow the FCAF: `MS` message structure, `IA` interaction, `SM` security mechanisms, `DM` data model, `SH` shared (robustness). The areas under `SM` are named after the mechanism the Provider must enforce: `ClientAttestation` (WIA), `KeyAttestation` (KA), `ProofOfPossession`, `TokenBinding` (DPoP and refresh tokens), `IssuerIntegrity` (what the Provider signs), `Validity`, `Revocation`, `Unlinkability`.

The class names are not reserved by the FCAF methodology the way `RP_*` are. They mirror the wallet's `WS_PP` and `WS_AP` and need the FCAF maintainers' agreement (§8.2).

### 2.2 Identifiers

`<Class>_<Layer>_<Area>_<nnn>[<variant letter>][_UF]`, as in the RP catalogue and the FCAF. For example `PP_WS_SM_KeyAttestation_004_UF`.

### 2.3 Variant codes

| Code | Meaning |
| --- | --- |
| `SD` | Credential in SD-JWT VC format (`dc+sd-jwt`) |
| `MD` | Credential in mdoc format (`mso_mdoc`) |
| `PA` | Pre-authorized code flow (with or without `tx_code`, per ICS) |
| `AC` | Authorization code flow with PAR and PKCE |
| `PID`, `Q`, `PB`, `E` | Category of the SUT: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider. Default `PID` in `PP_*`. |

A test that names neither `PA` nor `AC` runs in every grant the ICS declares. A test that names neither `SD` nor `MD` runs for every format the SUT issues.

### 2.4 Relevancy

FCAF labels as in the RP catalogue: `G`/`S`/`A` for EUDI_generic, EUDI_specific, EUDI_agnostic, then `R`/`O`/`U` for EUDI_required, EUDI_optional, EUDI_undefined.

### 2.5 Expected result codes

| Code | Pass criterion |
| --- | --- |
| `ISS` | The SUT issues the credential(s), and every check of the reference validator passes on each of them: format, signature and chain to the SUT's issuance anchor, validity, status reference, device binding to an attested key, data model (§3.6). |
| `REJ` | The SUT issues no credential and no token for the request. It answers with a 4xx and an OAuth or OpenID4VCI error object. No HTTP 5xx, no crash. Any defined error code passes; the code is recorded in the report (decision 1). |
| `REJ:<code>` | `REJ` with the named error code. Used only where a specification requires that code; any other code is FAIL (decision 1) (for example `invalid_nonce` together with a fresh `c_nonce`, `use_dpop_nonce` with a `DPoP-Nonce` header, `invalid_grant` for a used pre-authorized code). |
| `CONF` | The captured artifact (metadata, offer, credential, status list, response) conforms to the stated rule. |
| `REVOKED(t)` | Within time `t`, the status list (or identifier list) the SUT publishes shows the credential as revoked, and it stays revoked in every later version. |
| `UNCHANGED` | The credential's status stays valid in every version of the list the SUT publishes during the test. |
| `NOFETCH` | The SUT sends no request to the named address during the transaction (from `OBS-NET`). |
| `POLICY` | The outcome follows the policy the SUT declared in its ICS. |
| `INFO` | Behaviour is recorded in the report; no verdict. |

## 3. Test environment

The suite reuses the controlled trust infrastructure of the RP catalogue (§3 there) and adds a Wallet Provider of its own, so that the SUT faces wallets whose every attestation the suite controls.

### 3.1 Test roles

| Role | Function |
| --- | --- |
| Conformance Wallet (CW) | OpenID4VCI client. Follows offers, runs both grants, sends WIA and PoP, DPoP proofs, KA and proofs, and validates every credential it receives. Can apply exactly one mutation per test to any message it sends. |
| Test Wallet Provider (TWP) | Issues WIAs and KAs under the suite's Wallet Provider anchors, with controllable claims, keys, validity, `key_storage` and `user_authentication` values, and status references. Can revoke a Wallet Instance or a WSCD. |
| Test Status Provider (TSP) | Serves the WIA and KA status lists of the TWP with controllable content, signature and availability, and logs every request. |
| Test Trust Infrastructure (TTI) | Publishes the LoTEs and Trusted Lists of §3.2, sealed by the test scheme operator, and modified versions. |
| Test Registrar | Issues the SUT's access certificate (`AC-A`) and registration certificate (`RC-A`), and enrols the SUT's signing keys under the test issuance and revocation CAs (§3.3). |
| Tester / adapter | Creates offers for a test subject, triggers revocation and other back-office events, and authenticates the test subject in the authorization code flow (§3.5). |

### 3.2 Trust configuration defined by the suite

The SUT is configured with the suite's scheme operator certificates only, and derives Wallet Provider trust from `TL-WP`. Lists not named here are as in the RP catalogue §3.2.

| ID | Content |
| --- | --- |
| `TL-WP` | Wallet Provider LoTE. `WP-A`: granted, separate CAs for WIA and KA signing and for their status lists. `WP-B`: a second granted Wallet Provider (ISSU_28: all listed Wallet Providers are accepted). `WP-W`: withdrawn. |
| `TL-PID` | Contains the SUT as `PP-T` when it is a PID Provider: its issuance CA and its revocation CA, as enrolled in §3.3. Also `PP-A` (another PID Provider, used as a wrong anchor for WIA and KA). |
| `TL-QEAA`, `TL-PUB`, `TA-EAA` | Contain the SUT as `QP-T`, `PB-T` or `EP-T` for its category. |
| `TL-AC`, `TL-RC` | `AC-A` and `RC-A`, which issued the SUT's access and registration certificates. |
| `CA-X` | Self-signed CA on no list. |

A WIA or KA is trusted only if it validates to an anchor that `TL-WP` publishes for that purpose, for a Wallet Provider whose status is granted. A chain to an anchor in any other list, or to `CA-X`, is untrusted.

### 3.3 SUT enrolment

Enrolment is required (decision 6): it gives every trust test exactly one correct answer. A Provider that cannot obtain certificates for its keys under the test PKI cannot run the automated suite. Before the first test, the SUT generates its keys and the Test Registrar issues, from CSRs:

- the credential signing certificate(s) under the SUT's issuance CA in its list (`PP-T`, `QP-T`, `PB-T`, or under `TA-EAA`), in the profile of ETSI TS 119 412-6 for its category;
- the status list signing certificate under the SUT's revocation CA, or the SUT declares that it signs status lists with its issuance key and the list carries its issuance CA under both services (RP catalogue decision 3);
- the access certificate from `AC-A`, with the entity identifier, service identifier and trade name of `default_configuration_PP_1`;
- the registration certificate from `RC-A` for that service, with `entitlement` for its category and `providesAttestations` listing every credential type it offers.

### 3.4 Default wallets and subjects

| ID | Content |
| --- | --- |
| `CW-1` | Wallet Unit of `WP-A`: a WIA with a fresh `cnf` key, not revoked, with a revocation maintenance period > 1 year; a KA with `key_storage` and `user_authentication` `iso_18045_high`, `attested_keys` as many as the batch size, not revoked, same maintenance period. |
| `CW-2` | A second, independent Wallet Unit of `WP-A`, for the cross-wallet unlinkability tests. |
| `CW-B` | A Wallet Unit of `WP-B`. |
| `SUBJ-1` | Test subject whose attributes the adapter seeds or knows (ICS-17). The CW compares every issued value with them. |
| `SUBJ-2` | `SUBJ-1` with one attribute changed, for `SM_Revocation_008`. |

### 3.5 Default SUT configuration (`default_configuration_PP_1`)

- One registered service `S1`, with the certificates from §3.3. The metadata offers every credential configuration in the ICS.
- The SUT trusts only `TL-WP` for Wallet Providers and has refreshed it before the test.
- The adapter can create a credential offer for `SUBJ-1` and a configuration, by value or by reference, for each grant the ICS declares. For the authorization code flow it completes the User's authentication at the SUT for `SUBJ-1` (a test account, a test IdP, or a scripted login), so the CW gets the authorization code without a human.
- The adapter can revoke and, where supported, suspend a given issued credential, and report when it has done so (ICS-06).
- The SUT clock is synchronised. The suite caps the proof and DPoP freshness window `T_proof` and the clock tolerance `T_skew` at 5 minutes each; the SUT may declare tighter values. Time mutations use the declared value plus one hour.

### 3.6 How the verdict is observed

The issuer side is easier to observe than the RP side: the SUT's answer is the outcome.

- `OBS-HTTP`: status code, error object and headers at every endpoint.
- `OBS-CRED`: every credential received. The reference validator from the RP harness checks it with the suite's trust configuration: the same named checks the RP must perform, now applied to the SUT's output, plus the data model checks of `DM_*`.
- `OBS-META`: Credential Issuer and Authorization Server metadata, plain and signed.
- `OBS-SL`: the status lists and identifier lists the SUT publishes, fetched anonymously on each poll.
- `OBS-NET`: requests the SUT sends to the TSP and TTI (WIA and KA status lists, `TL-WP`).
- `OBS-ADM`: what the adapter reports for back-office events (revocation done at time `t`).

### 3.7 Generic scenarios

- `SCN-M` metadata: fetch the Credential Issuer metadata (as JSON and as signed JWT) and the Authorization Server metadata; check them.
- `SCN-I` issuance: the adapter creates an offer; the CW runs the grant of the variant, presenting WIA, PoP, DPoP proofs, KA and proofs, all valid except for mutation M; the tester reads `OBS-HTTP` and `OBS-CRED`.
- `SCN-L` lifecycle: as `SCN-I` without mutation, then event E (adapter revocation, TWP revokes the Wallet Instance or the WSCD, subject data changes); poll `OBS-SL` until the time limit.
- `SCN-T` trust: the TTI publishes a mutated `TL-WP`, the SUT refreshes (hook or wait `T_refresh`), then `SCN-I`.
- `SCN-P` published artifacts: fetch and check the status lists and identifier lists referenced by credentials issued in `SCN-I`.

Rule for every `_UF` test, as in the RP catalogue: its positive control (same scenario, same variant, no mutation) must pass first, or the verdict is INCONCLUSIVE.

Verdicts: PASS, FAIL, INCONCLUSIVE, REVIEW, NOT APPLICABLE.

## 4. Implementation Conformance Statement (ICS) for Providers

| ICS | Question | Profile |
| --- | --- | --- |
| ICS-01 | Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks) | `P-PID`, `P-Q`, `P-PB`, `P-E` |
| ICS-02 | Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02). | `P-SD`, `P-MD` |
| ICS-03 | Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject. | `P-PA`, `P-AC` |
| ICS-04 | Device binding per configuration. PIDs are always device-bound (ISSU_17). | `P-DB`, `P-NDB` |
| ICS-05 | Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported | `P-REV`, `P-SHORT`, `P-IL`, `P-SUSP` |
| ICS-06 | Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3) | `P-HOOK` |
| ICS-07 | Revocation chaining: time limit `T_chain` within which a revoked Wallet Instance or WSCD leads to a revoked PID (WURevocation_18, mandatory for PID Providers; declared, at most 24 h, decision 3). For Attestation Providers whether they chain (WURevocation_19). | `P-CHAIN` |
| ICS-08 | Batch issuance and `batch_size`; `credential_reuse_policy` methods | `P-BATCH` |
| ICS-09 | Re-issuance with a device-bound refresh token (ISSU_63, ISSU_65) | `P-REISS` |
| ICS-10 | Deferred issuance | `P-DEF` |
| ICS-11 | Notification endpoint | `P-NOT` |
| ICS-12 | Credential request and response encryption | `P-ENC` |
| ICS-13 | DPoP server nonce used; nonce endpoint offered | `P-DPN` |
| ICS-14 | `T_proof`, `T_skew` (each at most 5 minutes), lifetime of pre-authorized codes, `c_nonce` and access tokens | |
| ICS-15 | `T_refresh` for `TL-WP`, the grace period after its `NextUpdate`, and whether the previous `TL-WP` stays in force after a version whose seal fails (`keep`) or no list is used until a valid one arrives (`discard`) (§8.3) | used by `POLICY` |
| ICS-16 | Minimum number of entries per status list (herd privacy, VCR_18), at least 10 000 (decision 4); declared timestamp precision for batch issuance (ISSU_36) | |
| ICS-17 | Whether the adapter seeds `SUBJ-1` and `SUBJ-2`, or the fixed test identities and their attribute values if it cannot (decision 5); whether the PID portrait opt-out is offered (PID_03) | |
| ICS-18 | Policy when the WIA or KA status cannot be obtained (status list unreachable or invalid). Attestation Providers only; PID Providers reject (decision 2). | used by `POLICY` |
| ICS-19 | Embedded disclosure policies per configuration (EDP_09) | `P-EDP` |

## 5. Catalogue

Columns as in the RP catalogue: **Objective**, **Stimulus** (mutation on top of the scenario), **Expected** (§2.5), **References**, **Var**, **Rel**.

### 5.1 Class PP_WS: PID Provider ↔ Wallet Solution

#### 5.1.1 Layer MS: message structure

##### PP_WS_MS_Metadata (`SCN-M`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_MS_Metadata_001` | Credential Issuer metadata is served at `/.well-known/openid-credential-issuer` under the issuer identifier, and `credential_issuer` equals that identifier. | Fetch | CONF (OIDF `metadata-test`; partial) | OpenID4VCI §12.2.2, §12.2.4; ISSU_01a | | G/R |
| `PP_WS_MS_Metadata_002` | Signed metadata is a JWS signed with the key of the access certificate, with the access certificate and its intermediates up to `AC-A` (not the anchor) in `x5c`, and validates to `TL-AC`. | Fetch with `Accept: application/jwt` | CONF (OIDF `metadata-test-signed`; partial) | ISSU_22; OpenID4VCI §12.2.3; HAIP 4.1; PPNot_04 | | S/R |
| `PP_WS_MS_Metadata_003` | Signed and unsigned metadata carry the same values. | Compare | CONF | OpenID4VCI §12.2.3 | | G/R |
| `PP_WS_MS_Metadata_004` | The registration certificate is included by value, valid, issued by `RC-A`, with the same entity identifier as the access certificate. | Fetch | CONF | RPRC_22; RPRC_22b; ETSI TS 119 472-3 §4.2.3 | | S/R |
| `PP_WS_MS_Metadata_005` | The registration certificate's `entitlement` matches the SUT's category, and `providesAttestations` lists every credential type in `credential_configurations_supported`. | Fetch | CONF | RPRC_15, RPRC_23; ISSU_24a, ISSU_24b; Reg_10e | | S/R |
| `PP_WS_MS_Metadata_006` | A PID configuration exists in both formats: `dc+sd-jwt` with `vct` `urn:eudi:pid:1` (or a domestic extension) and `mso_mdoc` with doctype `eu.europa.ec.eudi.pid.1`. | Fetch | CONF | PID_02, PID_04, PID_14; ISSU_12 | **PID only** | S/R |
| `PP_WS_MS_Metadata_007` | `credential_signing_alg_values_supported`, `proof_signing_alg_values_supported` and DPoP algorithms list only ECCG ACM algorithms. | Fetch | CONF | OIA_03; WUA_04; HAIP 7 | | S/R |
| `PP_WS_MS_Metadata_008` | Device-bound configurations require a key attestation in `proof_types_supported`, with `key_storage` and `user_authentication` at least `iso_18045_high` for a PID. | Fetch | CONF | ISSU_27d; WUA_34; OpenID4VCI §12.2.4, App. D.2, App. F | | S/R |
| `PP_WS_MS_Metadata_009` | `credential_reuse_policy` is present per configuration and names method A or B as required; methods are ordered by preference; batch size and thresholds are consistent with `batch_credential_issuance`. | Fetch | CONF | ISSU_39, ISSU_40, ISSU_45, ISSU_50, ISSU_54; ETSI TS 119 472-3 §4.2.4.2 | | S/R |
| `PP_WS_MS_Metadata_010` | `nonce_endpoint` is advertised and returns a fresh `c_nonce` with `Cache-Control: no-store`. | Fetch, POST twice | CONF (OIDF `metadata-test`, `happy-flow`; partial) | OpenID4VCI §7.2; HAIP 4.1 | | G/R |
| `PP_WS_MS_Metadata_011` | Authorization Server metadata: PAR required, PKCE `S256` only, DPoP algorithms advertised, `attest_jwt_client_auth` as client authentication, `pre-authorized_grant_anonymous_access_supported` per ICS-03. | Fetch | CONF (OIDF `metadata-test`, `fapi2-…-discovery-end-point-verification`; partial) | HAIP 4, 4.1, 4.4.1; RFC 9126 §5; RFC 7636; RFC 9449 §5.1; ISSU_01a | | S/R |
| `PP_WS_MS_Metadata_012` | `display` contains a name consistent with the trade name in the access certificate. | Fetch | CONF | ISSU_11; Reg_31 | | S/O |
| `PP_WS_MS_Metadata_013` | Metadata does not offer server retrieval or any endpoint that releases attributes to a Relying Party. | Fetch, probe | CONF | ProxId_02 | `MD` | S/R |

##### PP_WS_MS_Offer

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_MS_Offer_001` | The offer names the SUT's `credential_issuer` and only `credential_configuration_ids` that exist in the metadata. | Capture offer | CONF (OIDF `happy-flow`; partial) | OpenID4VCI §4.1.1 | | G/R |
| `PP_WS_MS_Offer_002` | An offer by reference is served as `application/json` over https and equals an offer by value. | Fetch `credential_offer_uri` | CONF (OIDF `happy-flow`; partial) | OpenID4VCI §4.1.3 | | G/R |
| `PP_WS_MS_Offer_003` | Pre-authorized offer: the code is opaque, and `tx_code` carries `input_mode`, `length` and description when required. | Capture | CONF | OpenID4VCI §4.1.1 | `PA` | G/R |
| `PP_WS_MS_Offer_004` | Authorization code offer: `issuer_state`, if present, is bound to the offer and returned unaltered. | Capture | CONF (OIDF `happy-flow`; partial) | OpenID4VCI §4.1.1, §5.1.3 | `AC` | G/O |

##### PP_WS_MS_CredentialEndpoint

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_MS_CredentialEndpoint_001` | A valid request with `credential_configuration_id` and `proofs` returns `credentials` as an array of objects with `credential`. | `SCN-I` | ISS (OIDF `happy-flow`) | OpenID4VCI §8.2, §8.3 | | G/R |
| `PP_WS_MS_CredentialEndpoint_002` | When the token response carried `authorization_details` with `credential_identifiers`, a request with `credential_identifier` succeeds. | `SCN-I` with identifiers | ISS | OpenID4VCI §6.2, §8.2 | `AC` | G/R |
| `PP_WS_MS_CredentialEndpoint_003_UF` | Unknown `credential_configuration_id` is rejected. | Random id | REJ:unknown_credential_configuration (OIDF `fail-unknown-credential-configuration`) | OpenID4VCI §8.3.1.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_004_UF` | A configuration the access token was not issued for is rejected. | Token for config A, request config B | REJ | OpenID4VCI §8.2, §8.3.1.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_005_UF` | `credential_identifier` and `credential_configuration_id` together, or neither, is rejected. | Both; none | REJ:invalid_credential_request | OpenID4VCI §8.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_006_UF` | A `credential_identifier` not issued in this token response is rejected. | Identifier of another session | REJ:unknown_credential_identifier (OIDF `fail-unknown-credential-identifier`; partial) | OpenID4VCI §8.3.1.2 | `AC` | G/R |
| `PP_WS_MS_CredentialEndpoint_007` | Unknown request parameters are ignored. | Extra member `foo` | ISS (OIDF `happy-flow`) | OpenID4VCI §8.2 | | G/R |

#### 5.1.2 Layer IA: interaction

##### PP_WS_IA_MainInteraction (positive baseline; positive controls for the `_UF` tests)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_MainInteraction_001` | Issuance of the PID to `CW-1` in each format and grant succeeds, and the credential passes every check of §3.6. | `SCN-I` | ISS (OIDF `happy-flow`; partial) | ISSU_01a, ISSU_14, ISSU_15 | `SD`, `MD` × `PA`, `AC` | S/R |
| `PP_WS_IA_MainInteraction_002` | A wallet of a second listed Wallet Provider is served the same way. | `SCN-I` with `CW-B` | ISS | ISSU_19, ISSU_19a, ISSU_28 | | S/R |
| `PP_WS_IA_MainInteraction_003` | Both formats can be obtained in one authorization (one access token, two credential requests). | `SCN-I`, two configurations | ISS | ISSU_12, ISSU_12a | **PID only** | S/R |

##### PP_WS_IA_PreAuthorized

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_PreAuthorized_001_UF` | A pre-authorized code is single-use. | Second token request with the same code | REJ:invalid_grant | OpenID4VCI §4.1.1, §6.3, §13.6.1 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_002_UF` | Wrong or missing `tx_code` is rejected, and repeated wrong values are limited. | Wrong; missing; 10 wrong attempts then right | REJ:invalid_grant (wrong); REJ:invalid_request (missing, §6.3); then REJ or POLICY | OpenID4VCI §6.1, §6.3, §13.6.1 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_003_UF` | An expired pre-authorized code is rejected. | Use after the declared lifetime + 1 h (NOT APPLICABLE in a run whose wait limit is shorter; scheduled last otherwise) | REJ:invalid_grant | OpenID4VCI §4.1.1, §6.3 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_004_UF` | A code from another offer of the same SUT does not give access to this offer's configuration. | Swap code | REJ | OpenID4VCI §4.1.1, §8.3.1.2 | `PA` | G/R |

##### PP_WS_IA_AuthorizationCode

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_AuthorizationCode_001_UF` | An authorization request not sent through PAR is rejected. | Plain request at the authorization endpoint | REJ (OIDF `fapi2-…-ensure-unsigned-authorization-request-without-using-par-fails`) | HAIP 4, 4.3; RFC 9126 §5 | `AC` | S/R |
| `PP_WS_IA_AuthorizationCode_002_UF` | PAR without PKCE, or with `plain`, is rejected. | No `code_challenge`; method `plain` | REJ (OIDF `fapi2-…-par-ensure-pkce-required`, `fapi2-…-par-plain-pkce-rejected`) | HAIP 4; RFC 7636 §4.3 | `AC` | S/R |
| `PP_WS_IA_AuthorizationCode_003_UF` | A wrong `code_verifier` is rejected. | Other verifier | REJ:invalid_grant (OIDF `fapi2-…-incorrect-pkce-code-verifier-rejected`, `fapi2-…-ensure-pkce-code-verifier-required`) | RFC 7636 §4.6 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_004_UF` | A PAR `request_uri` is single-use and expires. | Reuse; use after `expires_in` + 1 h (that half NOT APPLICABLE in a run whose wait limit is shorter; scheduled last otherwise) | REJ (OIDF `fapi2-…-par-attempt-reuse-request_uri`, `fapi2-…-par-attempt-to-use-expired-request_uri`; partial) | RFC 9126 §4, §7.3 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_005_UF` | An authorization code is single-use and bound to `client_id` and `redirect_uri`. | Reuse; other `client_id`; other `redirect_uri` | REJ:invalid_grant (OIDF `fapi2-…-attempt-reuse-authorization-code-after-one-second`, `fapi2-…-ensure-authorization-code-is-bound-to-client`; partial) | RFC 6749 §4.1.3, §10.5 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_006_UF` | Unknown `credential_configuration_id` in `authorization_details` is rejected; an unknown `scope` value next to a valid request is ignored. | Unknown `credential_configuration_id`; unknown `scope` value added | REJ; ISS for the `scope` (§8.3) | OpenID4VCI §5.1.1, §5.1.2 ("MUST ignore unknown scope values") | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_007` | `state` is returned unaltered; `iss` is returned in the authorization response. | Capture | CONF (OIDF `fapi2-…-happy-flow`) | RFC 6749 §4.1.2; RFC 9207; HAIP 4 | `AC` | G/R |

##### PP_WS_IA_Batch (`P-BATCH`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Batch_001` | A request with `batch_size` proofs returns that many credentials, each bound to a different key from the proofs. | `SCN-I`, N proofs | ISS (OIDF `batch-issuance`; partial) | ISSU_43, ISSU_64; OpenID4VCI §8.2 | | S/R |
| `PP_WS_IA_Batch_002` | All credentials of a batch carry the same attribute values and the same validity period. | `SCN-I`, N proofs | CONF (OIDF `batch-issuance`; partial) | ISSU_11a, ISSU_43, ISSU_51 | | S/R |
| `PP_WS_IA_Batch_003_UF` | How a request with more proofs than `batch_size` is answered is recorded. | `batch_size` + 1 `jwt` proofs | INFO (§8.3; rejection with invalid_proof or invalid_credential_request is the hardened behaviour) | OpenID4VCI §12.2.4 (`batch_size` is the maximum array size; no rejection MUST) | | G/O |
| `PP_WS_IA_Batch_004_UF` | One invalid proof in a batch fails the whole request: no partial batch is issued. | Corrupt the signature of proof 2 of N | REJ:invalid_proof | OpenID4VCI §8.2 | | G/R |
| `PP_WS_IA_Batch_005_UF` | The same key twice in one batch does not give two credentials bound to the same key. | Proofs 1 and 2 with one key | REJ or INFO | ISSU_35 (d) | | S/O |
| `PP_WS_IA_Batch_006` | The first batch needs a single User authentication regardless of its size. | `SCN-I`, `AC`, batch | CONF | ISSU_61 | `AC` | S/R |

##### PP_WS_IA_Reissuance (`P-REISS`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Reissuance_001` | A refresh token is issued, DPoP-bound to the wallet's key, and gives a new access token without User interaction. | Refresh grant with the original DPoP key | ISS (OIDF `fapi2-…-refresh-token`; partial) | ISSU_42, ISSU_63, ISSU_65; OpenID4VCI §14.5; HAIP 4.4; RFC 9449 §5 | | S/R |
| `PP_WS_IA_Reissuance_002_UF` | A refresh token presented by another Wallet Unit is rejected. | Refresh by `CW-2` with its own WIA, PoP and DPoP key (§8.3) | REJ (OIDF `fapi2-…-refresh-token`; partial) | ISSU_65; RFC 6749 §6, §10.4; RFC 9449 §5 (a confidential client's refresh token is bound to the client, not to the DPoP key) | | S/R |
| `PP_WS_IA_Reissuance_003` | A re-issued credential has the same attributes, new unique elements (salts, status index, key), and a new validity period. | Compare with the original | CONF | ISSU_35, ISSU_59, ISSU_63 | | S/R |
| `PP_WS_IA_Reissuance_004_UF` | Whether the refresh token still gives a credential after the PID was revoked is recorded. | Revoke via adapter, then refresh | INFO (§8.3; refusing is a design choice, no requirement) | VCR_04 (no reversal of a revocation; does not cover re-issuance); ISSU_65 | `P-HOOK` | S/O |
| `PP_WS_IA_Reissuance_005_UF` | A WIA or KA presented at re-issuance is validated as at first issuance: a revoked Wallet Instance gets no new credential. | TWP revokes the Wallet Instance, then refresh | REJ | ISSU_21, WUA_25 | | S/R |

##### PP_WS_IA_Deferred (`P-DEF`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Deferred_001` | A deferred response carries `transaction_id` and `interval`; polling returns `issuance_pending` and then the credential. | `SCN-I` with deferral | ISS | OpenID4VCI §9 | | G/O |
| `PP_WS_IA_Deferred_002_UF` | Unknown, or already redeemed, `transaction_id` is rejected. | Random id; second redemption | REJ:invalid_transaction_id | OpenID4VCI §9.3 | | G/O |
| `PP_WS_IA_Deferred_003_UF` | A `transaction_id` redeemed with another access token is rejected. | Token of another session | REJ | OpenID4VCI §9.1 | | G/O |

##### PP_WS_IA_Notification (`P-NOT`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Notification_001` | `credential_accepted`, `credential_failure` and `credential_deleted` are accepted with HTTP 2xx; whether it is the RECOMMENDED 204 is recorded. | Each event | CONF (OIDF `happy-flow`; partial) | OpenID4VCI §11.1, §11.2 (2xx MUST, 204 RECOMMENDED) | | G/O |
| `PP_WS_IA_Notification_002_UF` | Unknown `notification_id` is rejected; the answer to an unknown event is recorded. | Random id; event `foo` | REJ:invalid_notification_id or invalid_notification_request; INFO for the event (§8.3) | OpenID4VCI §11.3 (the 400 MUST covers an invalid `notification_id` only; the error codes are SHOULD) | | G/O |
| `PP_WS_IA_Notification_003` | A `credential_deleted` notification does not revoke or otherwise act against the User (the wallet must not notify on deletion, so a notification must not be required). | Delete event; no event at all | UNCHANGED (OIDF `happy-flow-skip-notification`; partial) | PAD_03 | | S/O |

#### 5.1.3 Layer SM: security mechanisms

##### PP_WS_SM_ClientAttestation (WIA as OAuth client attestation, at PAR and token endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_ClientAttestation_001` | A valid WIA and PoP from `WP-A` are accepted. | `SCN-I` | ISS (OIDF `happy-flow`; partial) | WUA_25; ISSU_21, ISSU_30a; OpenID4VCI App. E | | S/R |
| `PP_WS_SM_ClientAttestation_002_UF` | No WIA, or WIA without PoP, is rejected. | Omit both headers; omit PoP | REJ:invalid_client | WUA_25; ISSU_21, ISSU_30a; Attestation-Based Client Auth | | S/R |
| `PP_WS_SM_ClientAttestation_003_UF` | WIA with an invalid signature is rejected. | Corrupt signature | REJ:invalid_client (OIDF `fail-invalid-client-attestation-signature`) | WUA_25 | | S/R |
| `PP_WS_SM_ClientAttestation_004_UF` | WIA signed under an anchor not in `TL-WP` is rejected. | Signed by (a) `CA-X`, (b) `PP-A`'s issuance CA in `TL-PID`, (c) `AC-A` | REJ:invalid_client | ISSU_21, ISSU_28, ISSU_30a; WPNot_04 | | S/R |
| `PP_WS_SM_ClientAttestation_005_UF` | WIA of a withdrawn Wallet Provider is rejected. | Signed under `WP-W` | REJ:invalid_client | ISSU_30a; WPNot_04 | | S/R |
| `PP_WS_SM_ClientAttestation_006_UF` | How a WIA signed under `WP-A`'s KA CA (another service of the same Wallet Provider) is treated is recorded. | Other service anchor of the same Wallet Provider | INFO (§8.3) | ISSU_28, ISSU_30a; TS3 §2.2.1.2 (anchor on the Trusted List for Wallet Providers; §3.2 informative) | | S/O |
| `PP_WS_SM_ClientAttestation_007_UF` | Expired, or not yet valid, WIA is rejected. | `exp` past; `nbf` future (beyond `T_skew`) | REJ:invalid_client (OIDF `fail-client-attestation-exp-in-past`; partial) | OpenID4VCI App. E; Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_008_UF` | PoP signed with a key other than the WIA's `cnf` key is rejected. | Other key | REJ:invalid_client (OIDF `fail-mismatched-client-attestation-pop-key`, `fail-invalid-client-attestation-pop-signature`) | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_009_UF` | PoP with wrong `aud` or stale `iat` is rejected; whether a replayed `jti` is detected is recorded. | Each mutation | REJ:invalid_client; INFO for the `jti` replay (§8.3) (OIDF `fail-client-attestation-pop-wrong-aud`; partial) | Attestation-Based Client Auth; its §12.1 (replay detection SHOULD) | | G/R |
| `PP_WS_SM_ClientAttestation_010_UF` | WIA whose `sub` differs from the `client_id` of the request is rejected. | Other `client_id` | REJ:invalid_client (OIDF `fail-client-attestation-no-sub`, `fapi2-…-ensure-client-id-in-token-endpoint`; partial) | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_011_UF` | Wrong `typ` on WIA or PoP is rejected. | `typ` `JWT` | REJ:invalid_client | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_012_UF` | WIA of a revoked Wallet Instance is rejected. | Status set in `SL-WP-A` | REJ | ISSU_21, ISSU_30a; WUA_25, WUA_26 | | S/R |
| `PP_WS_SM_ClientAttestation_013_UF` | WIA status that cannot be obtained (list unreachable, bad signature, expired, signed under a wrong anchor) gives no successful issuance of a PID. | Each TSP mutation of the RP catalogue's `RP_PP_SM_Revocation` | REJ (PID); POLICY (others, ICS-18) | ISSU_21; WUA_25 | | S/R |
| `PP_WS_SM_ClientAttestation_014_UF` | WIA signed with a non-ECCG algorithm is rejected. | ES256K; HS256 | REJ:invalid_client | WUA_04; OIA_03 | | S/R |
| `PP_WS_SM_ClientAttestation_015` | The PID's expiry is no later than the end of the WIA's revocation maintenance period. | WIA with maintenance period ending in 31 days (the minimum TS3 §2.4.2 guarantees; §8.3) | CONF | ISSU_12c; WUA_30; TS3 §2.4.3 (EUDI/TS3 only) | **PID only** | S/R |
| `PP_WS_SM_ClientAttestation_016_UF` | A WIA below the SUT's declared minimum remaining maintenance period is rejected, or the PID is shortened. | Maintenance period ending tomorrow | REJ or CONF (`exp` ≤ end) | ISSU_12c; TS3 §2.4.3 (EUDI/TS3 only) | **PID only** | S/R |

##### PP_WS_SM_KeyAttestation (KA, at the credential endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_KeyAttestation_001` | A valid KA from `WP-A` is accepted, and every credential is bound to one of its `attested_keys`. | `SCN-I`; KA in the proof's `key_attestation` header, and as `attestation` proof type where supported | ISS (OIDF `happy-flow`; partial) | WUA_09a, WUA_11a, WUA_12; OpenID4VCI App. D, App. F.1, F.3 | | S/R |
| `PP_WS_SM_KeyAttestation_002_UF` | A PID request without KA is rejected. | Omit KA | REJ:invalid_proof | WUA_05, WUA_11a; ISSU_21 | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_003_UF` | KA with an invalid signature is rejected. | Corrupt signature | REJ:invalid_proof (OIDF `fail-invalid-key-attestation-signature`) | WUA_11a; OpenID4VCI App. F.4 | | S/R |
| `PP_WS_SM_KeyAttestation_004_UF` | KA signed under an anchor not in `TL-WP`, or under a withdrawn Wallet Provider, is rejected. | (a) `CA-X`, (b) `PP-A`, (c) `WP-W`, (d) `WP-A`'s WIA CA | REJ:invalid_proof for (a)–(c); INFO for (d) (§8.3) | ISSU_21, ISSU_28, ISSU_30; TS3 §2.2.2.2 | | S/R |
| `PP_WS_SM_KeyAttestation_005_UF` | Expired KA is rejected. | `exp` past | REJ:invalid_proof | OpenID4VCI App. D | | G/R |
| `PP_WS_SM_KeyAttestation_006_UF` | Proof signed with a key not listed in `attested_keys` is rejected. | Fresh key | REJ:invalid_proof | WUA_09a, WUA_12 | | S/R |
| `PP_WS_SM_KeyAttestation_007_UF` | A KA without `nonce` as the `attestation` proof type is rejected, when the SUT offers a nonce endpoint; the KA `nonce` in a `jwt` proof is recorded. | Nonce from another session; no nonce (`jwt` proof); no nonce (`attestation` proof) | REJ:invalid_nonce or invalid_proof for the `attestation` proof; INFO in a `jwt` proof (§8.3) (OIDF `fail-invalid-nonce`; partial) | WUA_10b; OpenID4VCI App. D.1, F.1 (wallet rule), F.3, F.4; TS3 §2.2.2.2 | `P-DPN` | S/R |
| `PP_WS_SM_KeyAttestation_008_UF` | KA of a revoked WSCD is rejected. | Status set in `SL-WP-A` | REJ | ISSU_21, ISSU_30; WUA_11a | | S/R |
| `PP_WS_SM_KeyAttestation_009_UF` | KA status that cannot be obtained gives no PID. | As `ClientAttestation_013_UF` | REJ (PID); POLICY (others) | ISSU_21; WUA_11a | | S/R |
| `PP_WS_SM_KeyAttestation_010_UF` | For a PID, `key_storage` or `user_authentication` below `iso_18045_high` is rejected. | `iso_18045_moderate`; `iso_18045_basic`; absent | REJ:invalid_proof | WUA_34; ISSU_27d; WIAM_14b | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_011` | The PID's expiry is no later than the end of the KA's revocation maintenance period. | KA maintenance period ending in 31 days (the minimum TS3 §2.4.2 guarantees; §8.3) | CONF | ISSU_12c; WUA_30; TS3 §2.4.3 (EUDI/TS3 only) | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_012_UF` | KA with wrong `typ` or a non-ECCG algorithm is rejected. | `typ` `JWT`; ES256K | REJ:invalid_proof | OpenID4VCI App. D.1; WUA_04 | | S/R |
| `PP_WS_SM_KeyAttestation_013_UF` | A KA of another Wallet Unit, valid in itself, combined with this wallet's WIA, does not give a PID bound to the other unit's keys. | KA of `CW-2`, WIA of `CW-1` | REJ or INFO | WUA_10b; TS3 | | S/O |

##### PP_WS_SM_ProofOfPossession (proofs at the credential endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_ProofOfPossession_001_UF` | Proof with an invalid signature is rejected. | Corrupt signature | REJ:invalid_proof (OIDF `fail-invalid-jwt-proof-signature`) | OpenID4VCI App. F.1, F.4 | | G/R |
| `PP_WS_SM_ProofOfPossession_002_UF` | Proof with `alg` `none`, a MAC algorithm, or a non-ECCG algorithm is rejected. | `none`; HS256; ES256K | REJ:invalid_proof | OpenID4VCI App. F.1; OIA_03 | | S/R |
| `PP_WS_SM_ProofOfPossession_003_UF` | Proof with a `typ` other than `openid4vci-proof+jwt` is rejected. | `JWT`; absent | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_004_UF` | Proof whose `aud` is not the Credential Issuer identifier is rejected. | Other issuer; absent | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_005_UF` | Proof with a missing, unknown or already used `nonce` is rejected with a fresh `c_nonce`; the retry with that nonce succeeds. | Missing; random; replay a used proof | REJ:invalid_nonce, then ISS (OIDF `fail-invalid-nonce`; partial) | OpenID4VCI §7, §8.3.1.2, App. F.1 | `P-DPN` | G/R |
| `PP_WS_SM_ProofOfPossession_006_UF` | Proof with `iat` outside `T_proof` is rejected. | `iat` −1 h; +1 h | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_007_UF` | How a proof whose `iss` differs from the `client_id` is treated is recorded (authorization code flow). | Other `iss` | INFO (§8.3; rejection with invalid_proof is the hardened behaviour) | OpenID4VCI App. F.1 (wallet MUST), F.4 (no `iss` check) | `AC` | G/O |
| `PP_WS_SM_ProofOfPossession_008_UF` | Proof with a private key in `jwk`, or more than one of `jwk`, `kid`, `x5c`, is rejected. | `jwk` with `d`; `jwk` and `x5c` | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_009_UF` | Proof key on an unsupported curve or an invalid point is rejected. | Off-curve point; P-521 if not advertised | REJ:invalid_proof | RFC 8725 §3.4; OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_010` | The issued credential's `cnf.jwk` (SD) or `deviceKeyInfo` (MD) equals the proof key. | `SCN-I` | CONF (OIDF `happy-flow`) | ISSU_17; WUA_09a | | S/R |

##### PP_WS_SM_TokenBinding (DPoP and access tokens)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_TokenBinding_001` | The token endpoint issues a DPoP-bound access token (`token_type` `DPoP`). | `SCN-I` | CONF (OIDF `fapi2-…-happy-flow`) | HAIP 4; RFC 9449 §5 | | S/R |
| `PP_WS_SM_TokenBinding_002_UF` | The access token used as a Bearer token, or without a DPoP proof, is rejected. | `Authorization: Bearer`; no `DPoP` header | REJ (OIDF `fapi2-…-dpop-negative-tests`) | RFC 9449 §7.1 | | G/R |
| `PP_WS_SM_TokenBinding_003_UF` | DPoP proof signed with a key other than the one the token is bound to is rejected. | Other key | REJ (OIDF `fapi2-…-dpop-negative-tests`) | RFC 9449 §4.3 | | G/R |
| `PP_WS_SM_TokenBinding_004_UF` | DPoP proof with wrong `htm` or `htu`, missing or wrong `ath`, or stale `iat` is rejected. | Each mutation | REJ (OIDF `fapi2-…-dpop-negative-tests`) | RFC 9449 §4.2, §4.3 | | G/R |
| `PP_WS_SM_TokenBinding_005_UF` | A replayed DPoP proof (same `jti`) is rejected. | Send twice | REJ (OIDF `fapi2-…-dpop-negative-tests`; partial) | RFC 9449 §11.1 | | G/R |
| `PP_WS_SM_TokenBinding_006_UF` | When the SUT requires a DPoP nonce, a proof without it is rejected with a new nonce, and the retry succeeds. | Omit `nonce` | REJ:use_dpop_nonce, then ISS | RFC 9449 §8, §9 | `P-DPN` | G/R |
| `PP_WS_SM_TokenBinding_007_UF` | An expired access token is rejected. | Use after `expires_in` + 1 h | REJ:invalid_token | RFC 6750 §3.1 | | G/R |

##### PP_WS_SM_IssuerIntegrity (what the SUT signs, checked by the validator on `OBS-CRED`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_IssuerIntegrity_001` | SD-JWT VC: `typ` `dc+sd-jwt`, ECCG `alg`, `x5c` with leaf and intermediates (no anchor), validating to the SUT's issuance anchor in its list. | `SCN-I` | CONF (OIDF `happy-flow`; partial) | PPNot_03; HAIP 6.1.1; SD-JWT VC §3.5; OIA_03 | `SD` | S/R |
| `PP_WS_SM_IssuerIntegrity_002` | mdoc: `IssuerAuth` COSE_Sign1 with ECCG `alg` and `x5chain` validating to the SUT's issuance anchor; `digestAlgorithm` SHA-256; every value digest matches. | `SCN-I` | CONF (OIDF `happy-flow`; partial) | PPNot_03; ISO/IEC 18013-5 §9.1.2 | `MD` | S/R |
| `PP_WS_SM_IssuerIntegrity_003` | The signing certificate follows the ETSI TS 119 412-6 profile of the SUT's category. | Inspect leaf | CONF | ISSU_68, ISSU_70, ISSU_71, ISSU_73 | | S/R |
| `PP_WS_SM_IssuerIntegrity_004` | The credential signer is not the access certificate, and the access certificate key signs no credential. | Compare keys | CONF | ISSU_22; Reg_10 | | S/R |
| `PP_WS_SM_IssuerIntegrity_005` | Every claim the PID Rulebook allows is individually selectively disclosable (top level, nested, array entries); `_sd_alg` is `sha-256`. | Inspect disclosures | CONF | PID_21 (the EUDI SHALL); RFC 9901 §4.2.2 (permits array element disclosures, does not require them) | `SD` | S/R |
| `PP_WS_SM_IssuerIntegrity_006` | Salts are unique per disclosure, and whether they reach 128 bits is recorded; mdoc `random` at least 16 bytes per item. | Inspect | CONF; INFO for the SD-JWT VC salt length (§8.3) (OIDF `happy-flow`, `batch-issuance`; partial) | ISSU_35 (a) (uniqueness); RFC 9901 §9.3 (new salt per claim MUST; 128 bits RECOMMENDED); ISO/IEC 18013-5 §9.1.2.5 (not verified) | | S/R |
| `PP_WS_SM_IssuerIntegrity_007` | The issued credential signature algorithm is one of those advertised in the metadata. | Compare | CONF | OpenID4VCI §12.2.4 | | G/R |

##### PP_WS_SM_Validity

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_Validity_001` | The credential carries a validity period (`iat`, `exp`, optionally `nbf`; MSO `validityInfo`) and is valid at the time of issuance within `T_skew`. | `SCN-I` | CONF (OIDF `happy-flow`; partial) | SD-JWT VC §3.2.2; ISO/IEC 18013-5 §9.1.2.4 | | G/R |
| `PP_WS_SM_Validity_002` | A credential without a status reference is valid for 24 h or less. | `SCN-I` for a `P-SHORT` configuration | CONF | VCR_01, VCR_01b | `P-SHORT` | S/R |
| `PP_WS_SM_Validity_003` | A credential valid for more than 24 h carries a status reference. | `SCN-I` | CONF | VCR_01, VCR_01b, VCR_02 | | S/R |
| `PP_WS_SM_Validity_004` | The validity period matches what the ICS declares for the configuration. | Compare | CONF | ISSU_38 | | S/O |

##### PP_WS_SM_Revocation (`SCN-L`, `P-REV`, `P-HOOK`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_Revocation_001` | SD-JWT VC carries `status.status_list` with `idx` and an https `uri` that resolves to a Status List Token of the SUT. | `SCN-I`, fetch | CONF (OIDF `happy-flow`; partial) | VCR_11a; Token Status List §6.2 | `SD` | S/R |
| `PP_WS_SM_Revocation_002` | mdoc carries an MSO status element pointing to a status list or identifier list of the SUT. | `SCN-I`, fetch | CONF (OIDF `happy-flow`; partial) | VCR_11; ISO/IEC 18013-5 second edition | `MD` | S/R |
| `PP_WS_SM_Revocation_003` | After the adapter revokes the credential, the published list shows it revoked within `T_rev`, and never valid again. | Adapter revoke | REVOKED(`T_rev`) | VCR_03, VCR_04; ETSI EN 319 411-1 REV-6.2.4-03A | | S/R |
| `PP_WS_SM_Revocation_004` | Revoking one credential of a batch, or one format, revokes the logical PID: every technical credential of it is revoked. | Adapter revoke of the logical PID | REVOKED(`T_rev`) for all | VCR_07a; PAD_02 | `P-BATCH` | S/R |
| `PP_WS_SM_Revocation_005` | Suspension sets the suspended value and unsuspension clears it; revocation after suspension is final. | Suspend, unsuspend, revoke | CONF, then REVOKED | Token Status List §7.1; VCR_04 | `P-SUSP` | S/O |
| `PP_WS_SM_Revocation_006` | Revocation chaining: when the TWP revokes the Wallet Instance, the PID is revoked within `T_chain`. | Revoke in `SL-WP-A` (WIA) | REVOKED(`T_chain`) | WURevocation_18; WUA_29; VCR_07c | **PID only** | S/R |
| `PP_WS_SM_Revocation_007` | Revocation chaining: when the TWP revokes the WSCD, the PID is revoked within `T_chain`. | Revoke in `SL-WP-A` (KA) | REVOKED(`T_chain`) | WURevocation_18; WUA_29 | **PID only** | S/R |
| `PP_WS_SM_Revocation_008` | When subject data changes while the PID has more than 24 h left, the old PID is revoked and re-issuance gives the new values. | Adapter switches `SUBJ-1` → `SUBJ-2` | REVOKED(`T_rev`), then ISS with new values | VCR_09; ISSU_62 | `P-HOOK`; NOT APPLICABLE without seeding (ICS-17) | S/R |
| `PP_WS_SM_Revocation_009` | Revoking a credential does not change the status of other credentials, including those of other Wallet Units and of the same unit's other logical credentials. | Revoke one; poll others | UNCHANGED for the rest | Token Status List §4 | | G/R |
| `PP_WS_SM_Revocation_010` | Unrelated events (notification `credential_deleted`, a failed issuance, a WIA status list outage) do not revoke issued credentials. | Each event | UNCHANGED | PAD_03; VCR_05 | | S/O |

##### PP_WS_SM_Unlinkability

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_Unlinkability_001` | Across 20 issuances to `CW-1` and `CW-2`, no salt, digest, status index, device key or signature value repeats. | 20 × `SCN-I` | CONF | ISSU_35 | | S/R |
| `PP_WS_SM_Unlinkability_002` | Status indices are not assigned sequentially or in another predictable order. | 20 issuances; test for monotonic or consecutive runs | CONF (OIDF `batch-issuance`; partial) | VCR_17; HAIP 6.1 | `P-REV` | S/R |
| `PP_WS_SM_Unlinkability_003` | Timestamps (`iat`, `nbf`, `exp`, MSO `signed`, `validFrom`, `validUntil`) do not reveal batch membership: two batches issued to `CW-1` and `CW-2` in the same window share them at the declared precision. | Two batches within ICS-16 precision | CONF (OIDF `batch-issuance`; partial) | ISSU_36 | `P-BATCH` | S/R |
| `PP_WS_SM_Unlinkability_004` | Credentials of one batch are spread over the status list, not on adjacent indices. | Batch of N | CONF (OIDF `batch-issuance`; partial) | VCR_17; ISSU_36 | `P-BATCH` | S/O |
| `PP_WS_SM_Unlinkability_005` | The issued credential contains no identifier of the Wallet Instance, WIA or KA. | Inspect | CONF | WUA_08; ISSU_35b | | S/R |

#### 5.1.4 Layer DM: data model (PID Rulebook)

All **PID only**; Attestation Providers are tested against their rulebook in `AP_WS_DM_*`.

##### PP_WS_DM_PidSdJwt

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_DM_PidSdJwt_001` | `vct` is `urn:eudi:pid:1` or a domestic type in the `urn:eudi:pid:` namespace that extends it. | `SCN-I` | CONF | PID_14 | `SD` | S/R |
| `PP_WS_DM_PidSdJwt_002` | All mandatory attributes and metadata of PID Rulebook §5.2 are present, with the names and encodings of its tables. | `SCN-I` | CONF | PID_17, PID_18; ISSU_14 | `SD` | S/R |
| `PP_WS_DM_PidSdJwt_003` | Values equal `SUBJ-1`'s data, and every value (including age claims) is valid at `nbf` or `iat`. | Compare | CONF | PID_19; ISSU_14 | `SD` | S/R |
| `PP_WS_DM_PidSdJwt_004` | `date_of_issuance` and `date_of_expiry`, if present, are consistent with `iat`/`nbf` and `exp` per the declared policy. | Compare | CONF | PID_20 | `SD` | S/R |
| `PP_WS_DM_PidSdJwt_005` | A domestic extension's claims are documented in a published rulebook. | Inspect type metadata and rulebook | CONF | PID_16 | `SD` | S/O |
| `PP_WS_DM_PidSdJwt_006` | Type Metadata for `vct` is retrievable and, if `vct#integrity` is present, matches. | Fetch | CONF or INFO (OIDF `happy-flow`; partial) | SD-JWT VC §6 | `SD` | G/O |

##### PP_WS_DM_PidMdoc

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_DM_PidMdoc_001` | Doctype and namespace are `eu.europa.ec.eudi.pid.1`; domestic attributes are only in a domestic namespace. | `SCN-I` | CONF | PID_04, PID_05, PID_06 | `MD` | S/R |
| `PP_WS_DM_PidMdoc_002` | All mandatory attributes and metadata of PID Rulebook §3.1.2 are present as issuer-signed items with the CBOR types of its table (for example `full-date` tag 1004). | `SCN-I` | CONF | PID_08, PID_09 (EUDI only), PID_10; PID Rulebook v1.7 §3.1.2 (ARF PID_09 still links it as "Section 4.2.1"); RFC 8943; ISO/IEC 18013-5 not verified | `MD` | S/R |
| `PP_WS_DM_PidMdoc_003` | Each attribute identifier appears at most once. | Inspect | CONF | PID_11 | `MD` | S/R |
| `PP_WS_DM_PidMdoc_004` | Values equal `SUBJ-1`'s data and are valid at `validFrom` (age attributes included). | Compare | CONF | PID_12 | `MD` | S/R |
| `PP_WS_DM_PidMdoc_005` | `issuance_date` and `expiry_date`, if present, are consistent with `validFrom` and `validUntil` per the declared policy. | Compare | CONF | PID_13 | `MD` | S/R |
| `PP_WS_DM_PidMdoc_006` | The values in the mdoc and the SD-JWT VC of the same issuance are the same. | Compare both formats | CONF | ISSU_12; PID_02 | `SD`+`MD` | S/R |

##### PP_WS_DM_Portrait

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_DM_Portrait_001` | When the User opts out of the portrait, `portrait` is present as an empty string (SD) or empty `bstr` (MD). | Opt out via adapter | CONF | PID_03 | ICS-17 | S/O |

#### 5.1.5 Layer SH: robustness

##### PP_WS_SH_Encoding

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SH_Encoding_001_UF` | Malformed JSON, wrong `Content-Type`, and malformed JWTs at every endpoint are rejected without 5xx. | Truncated JSON; `text/plain`; two-part JWT | REJ | RFC 8725; OpenID4VCI §8.3.1 | | G/R |
| `PP_WS_SH_Encoding_002_UF` | An oversized request is rejected (any 4xx, an error object not required); how deeply nested JSON is handled is recorded; the SUT stays available. | 10 MB body; nesting depth 10 000 | REJ (4xx); INFO for the nesting (§8.3) | OWASP API4; OpenID4VCI §8.2 (unknown parameters MUST be ignored); RFC 8259 §9 (nesting limits "may") | | G/R |
| `PP_WS_SH_Encoding_003_UF` | `jku`, `x5u` or a `kid` URL in a proof, WIA or KA header is not dereferenced. | Header pointing to the TSP | NOFETCH; rejection or issuance recorded (§8.3) | RFC 8725 §3.10 (SHOULD protect; no rejection required) | | G/R |
| `PP_WS_SH_Encoding_004_UF` | A status `uri` in a WIA or KA that fails signature validation is not fetched; a validly signed status `uri` pointing to a private address is not fetched. | WIA by `CA-X` with `uri` = TSP; `uri` = `http://169.254.169.254/…` in `client_status` / `key_storage_status` (TS3 1.5), and in a top-level `status` (before TS3 1.5; INFO, §8.3) | REJ, NOFETCH; INFO for the top-level `status` | Token Status List §6.2, §11.4; OWASP SSRF; TS3 §2.3 (EUDI/TS3 claims) | | G/R |
| `PP_WS_SH_Encoding_005_UF` | A WIA or KA status list that is a decompression bomb is refused without exhausting resources. | `lst` inflating to 1 GB | REJ, SUT stays available | Token Status List §11.1 | | G/R |

##### PP_WS_SH_Encryption (`P-ENC`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SH_Encryption_001` | With `credential_response_encryption`, the response is a JWE to the wallet's key with an advertised `alg` and `enc`. | `SCN-I` with encryption | ISS (OIDF `happy-flow`) | OpenID4VCI §8.2, §8.3, §10 | | G/O |
| `PP_WS_SH_Encryption_002_UF` | An `alg` or `enc` not in the metadata is rejected. | `RSA-OAEP-256`; `A128CBC-HS256` | REJ:invalid_encryption_parameters (OIDF `fail-unsupported-encryption-algorithm`; partial) | OpenID4VCI §8.3.1.2 | | G/O |
| `PP_WS_SH_Encryption_003_UF` | A JWK for encryption on an invalid curve point is rejected. | Off-curve point | REJ | RFC 8725 §3.4 | | G/O |

### 5.2 Class PP_RP: PID Provider ↔ Relying Party (published status information, `SCN-P`)

These objectives check what the RP catalogue's `RP_PP_*` tests assume the Provider gets right.

##### PP_RP_IA_Supportive

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_RP_IA_Supportive_001` | The status list is served without authentication, over https, with `Content-Type` `application/statuslist+jwt` or `+cwt` per `Accept`. | Anonymous GET with each `Accept` | CONF (OIDF `happy-flow`; partial) | VCR_16; Token Status List §8.1 | | S/R |
| `PP_RP_IA_Supportive_002` | Cache headers of the response, if any, are consistent with `ttl` and `exp`; no headers pass (§8.3). | Inspect | CONF | Token Status List §8.2 (RP rule when headers are present), §13.7; RFC 9111 §4.2 | | G/O |
| `PP_RP_IA_Supportive_003` | The status endpoint does not require or log anything that identifies the requester beyond the HTTP request itself (no tracking parameters, no per-credential URLs). | Inspect URIs of 20 credentials | CONF (OIDF `batch-issuance`; partial) | VCR_18 note; Token Status List §12.3 | | S/R |

##### PP_RP_SM_Revocation

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_RP_SM_Revocation_001` | The Status List Token has the correct `typ`, `sub` equal to the credential's status `uri`, `iat`, a future `exp`, and `ttl`. | Fetch | CONF | Token Status List §5.1, §5.2 | `SD`, `MD` | G/R |
| `PP_RP_SM_Revocation_002` | It is signed under the SUT's revocation anchor in its list (or under the issuance CA that the list carries under both services). | Validate with §3.2 | CONF (OIDF `happy-flow`; partial) | PPNot_03a; PuBPNot_05; RP catalogue decision 3 | | S/R |
| `PP_RP_SM_Revocation_003` | `bits` is 1, 2, 4 or 8; `lst` is valid compressed data whose size matches the declared number of entries. | Decode | CONF | Token Status List §4.1 | | G/R |
| `PP_RP_SM_Revocation_004` | The list holds at least the declared minimum number of entries, and at least 10 000. | Decode | CONF | VCR_18; ICS-16 | | S/R |
| `PP_RP_SM_Revocation_005` | A new version is published before the previous one's `exp`, so a Relying Party never has only an expired token. | Poll across `exp` | CONF | Token Status List §8.3; VCR_14 | | S/R |
| `PP_RP_SM_Revocation_006` | The signing algorithm is ECCG and the signer certificate is valid during the token's validity. | Inspect | CONF | OIA_03; RFC 5280 | | S/R |
| `PP_RP_SM_Revocation_007` | Identifier list for mdoc: valid signature under the revocation anchor, correct structure, revoked credentials listed by their identifier. | Fetch, revoke, fetch | CONF, REVOKED | VCR_11; ISO/IEC 18013-5 second edition | `MD`; `P-IL` | S/R |
| `PP_RP_SM_Revocation_008` | The Provider's own revocation anchor and the signer it uses validate the reference RP's checks: the reference RP accepts a fresh credential and rejects a revoked one. | Present to the reference RP | ACC, then REJ | VCR_11, VCR_11a; RP catalogue `RP_WS_SM_Revocation` | | S/R |

### 5.3 Class PP_Inf: PID Provider ↔ trust infrastructure (`SCN-T`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_Inf_SM_TrustMechanisms_001` | The SUT reads Wallet Provider anchors from the LoTE `TL-WP` per ETSI TS 119 602. | `SCN-T`, unchanged list | ISS | ISSU_19, ISSU_19b, ISSU_28a | | S/R |
| `PP_Inf_SM_TrustMechanisms_002_UF` | A Wallet Provider removed from `TL-WP`, or with status withdrawn, is no longer accepted after refresh. | Remove `WP-A`; withdraw `WP-A` | REJ:invalid_client | ISSU_30a; WPNot_04 | | S/R |
| `PP_Inf_SM_TrustMechanisms_003` | A Wallet Provider added to `TL-WP` is accepted after refresh. | Add `WP-C` | ISS | ISSU_28; WPNot_04 | | S/R |
| `PP_Inf_SM_TrustMechanisms_004_UF` | A `TL-WP` with an invalid seal, or sealed by an untrusted scheme operator, is not used; the Provider then keeps the previous list or uses none, as it declares. | Corrupt seal; `CA-X` seal, with `WP-A` removed in it | POLICY (ICS-15.invalid_version: `keep` ISS, `discard` REJ) (§8.3) | ETSI TS 119 602 (seal verified before use; no last-known-good rule); WPNot_04 | | S/R |
| `PP_Inf_SM_TrustMechanisms_005_UF` | A `TL-WP` older than the one in use (rollback) is not used. | Serve the previous sequence number, with `WP-W` granted | REJ for `WP-W` | ETSI TS 119 602 | | S/R |
| `PP_Inf_SM_TrustMechanisms_006_UF` | A `TL-WP` past its `NextUpdate` with no newer list is handled per the declared grace period. | Stale list | POLICY (ICS-15) | ETSI TS 119 602 | | S/O |
| `PP_Inf_SM_TrustMechanisms_007` | Every credential, status list and the access certificate validate under the anchors published for the SUT, for the right service (issuance, revocation, access). | Validate with §3.2 | CONF | PPNot_03, PPNot_03a, PPNot_04; PuBPNot_04, PuBPNot_05; RPACANot_03, RPACANot_03a | | S/R |
| `PP_Inf_SM_TrustMechanisms_008` | The SUT sends no request to `TL-WP` or the TSP that carries data about the User or the transaction. | Inspect `OBS-NET` | CONF | VCR_16 analogue; ISSU_35b | | S/R |

### 5.4 Class AP: Attestation Provider specifics

Every `PP_*` objective not marked **PID only** applies to `AP_*` with the same number and the category variants `Q`, `PB`, `E`. For non-qualified EAAs, which revocation method and which anchor apply follow the rulebook (VCR_02, ARB_26). The objectives below apply to Attestation Providers only.

Implementation (issue 27). The `AP_*` variants are derived from the `PP_*` definitions: same steps, faults and expected results, with the Provider enrolled as `QP-T`, `PB-T` or `EP-T` and FCAF `default_credential_A` as its attestation. Two expected results change with the category: `ClientAttestation_013_UF` and `KeyAttestation_009_UF` expect `POLICY` (ICS-18) instead of `REJ`, and `SM_Revocation_008` compares the values of `default_credential_A`. A Provider of several categories answers the ICS once per category; each category runs against its own instance. A configuration that is not device-bound is named in the ICS under `ICS-04.NDB.SD`. `AP_WS_SM_Revocation_102` issues from a configuration of its own, named under `ICS-19.EDP.SD`: changing its embedded disclosure policy revokes every attestation issued under it (EDP_11), so no other test case may issue from it. `AP_WS_SM_Revocation_100` applies to every Attestation Provider: its `POLICY` (ICS-07) covers both answers, so `P-CHAIN` is not a condition of it.

##### AP_WS_MS_Metadata

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `AP_WS_MS_Metadata_100` | A non-device-bound configuration states that it needs no KA and offers no proof type that requires one. | Fetch | CONF | WUA_10a | `P-NDB` | S/R |
| `AP_WS_MS_Metadata_101` | A device-bound configuration states the required `key_storage` and `user_authentication` levels. | Fetch | CONF | ISSU_27d | `P-DB` | S/R |
| `AP_WS_MS_Metadata_102` | An embedded disclosure policy is included by value in the metadata of the configuration. | Fetch | CONF | EDP_09; ETSI TS 119 472-3 | `P-EDP` | S/O |
| `AP_WS_MS_Metadata_103` | QEAA and PuB-EAA configurations use SD-JWT VC or mdoc. | Fetch | CONF | ARB_01 | `Q`, `PB` | S/R |

##### AP_WS_SM_KeyAttestation

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `AP_WS_SM_KeyAttestation_100` | A device-bound attestation is bound to an attested key (as `PP_WS_SM_KeyAttestation_001`). | `SCN-I` | ISS | ISSU_27, ISSU_30; WUA_09a | `P-DB` | S/R |
| `AP_WS_SM_KeyAttestation_101_UF` | `key_storage` or `user_authentication` below the level the metadata requires is rejected. | One level below | REJ:invalid_proof | ISSU_27d; WUA_05a | `P-DB` | S/R |
| `AP_WS_SM_KeyAttestation_102` | A non-device-bound attestation is issued with WIA only; a KA sent anyway does not change the result. | No KA; KA present | ISS | WUA_10a; ISSU_30a | `P-NDB` | S/R |
| `AP_WS_SM_KeyAttestation_103` | A non-device-bound attestation still requires a valid, non-revoked WIA from a listed Wallet Provider. | `ClientAttestation_002_UF`–`_012_UF` | REJ | ISSU_30a; WUA_25 | `P-NDB` | S/R |

##### AP_WS_SM_Revocation

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `AP_WS_SM_Revocation_100` | Revocation chaining follows the published policy: revoked within `T_chain` if it chains, unchanged if it does not. | TWP revokes Wallet Instance | POLICY (ICS-07) | WURevocation_19; VCR_07d | | S/O |
| `AP_WS_SM_Revocation_101` | When the Provider chains, the attestation's expiry is no later than the end of the WIA's and KA's maintenance period. | Short maintenance period | CONF | ISSU_12d | `P-CHAIN` | S/R |
| `AP_WS_SM_Revocation_102` | A change to the embedded disclosure policy revokes the attestations issued under the old one. | Adapter changes the EDP | REVOKED(`T_rev`) | EDP_11 | `P-EDP` | S/R |
| `AP_WS_SM_Revocation_103` | A non-qualified EAA follows the revocation method its rulebook prescribes. | `SCN-I`, inspect | CONF | VCR_02 | `E` | S/R |

##### AP_WS_DM_Rulebook

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `AP_WS_DM_Rulebook_100` | The attestation conforms to its rulebook: type identifier, mandatory attributes, encodings. For the suite: FCAF `default_credential_A`. | `SCN-I` | CONF | ISSU_25 | | S/R |
| `AP_WS_DM_Rulebook_101` | Selective disclosure follows the rulebook's MUST/MAY/MUST NOT per claim. | Inspect | CONF | ARB_30 | `SD` | S/R |
| `AP_WS_DM_Rulebook_102` | QEAA signature is a qualified electronic seal or signature under a granted qualified EAA service in the Trusted List reached via `TL-QEAA`. | Validate | CONF | ISSU_08; ISSU_70; OIA_13 | `Q` | S/R |

### 5.5 Class PP_TB: test book (inspection)

| ID | Objective | Method | References | Rel |
| --- | --- | --- | --- | --- |
| `PP_TB_001` | Identity of the PID subject is verified at LoA High; for attestations, the subject's identity and the User's right to the attestation are verified. | Document review, walkthrough | ISSU_18; ISSU_27a, ISSU_27b, ISSU_27c | S/R |
| `PP_TB_002` | Issuance and management policy per ETSI TS 119 471 clauses 6 and 7, at least NCP+ (PID, PuB-EAA) or QCP-n/l-qscd (QEAA). | Document review | ISSU_67, ISSU_69, ISSU_72 | S/R |
| `PP_TB_003` | Revocation policy exists and names the conditions; compromise, User request and death lead to revocation; revocation is never reversed. | Document review; complements `SM_Revocation_003` | VCR_04, VCR_05, VCR_06, VCR_07a, VCR_07b, VCR_08 | S/R |
| `PP_TB_004` | Policy on the methods A–D and the parameters (validity, batch size) with a linkability risk rationale. | Document review; compare `MS_Metadata_009` | ISSU_38, ISSU_41 | S/R |
| `PP_TB_005` | Unique elements and timestamps are discarded after issuance and not passed to other parties. | Inspect storage and logs after issuance | ISSU_35b | S/R |
| `PP_TB_006` | A list of supported Wallet Solutions is published and easy to find; all Wallet Solutions recognised under the notified eID scheme are supported (PID); QEAA and PuB-EAA Providers do not discriminate between Wallet Solutions. | Website review | ISSU_19a, ISSU_20, ISSU_29 | S/R |
| `PP_TB_007` | Revocation chaining runs for the whole validity of every PID; the policy for requesting Wallet Unit revocation on death exists. | Process review; complements `SM_Revocation_006` | WURevocation_13, WURevocation_18; WUA_29 | S/R |
| `PP_TB_008` | Registration certificates reach all service supply points with the same service identifier; registration data is kept current. | Process review | RPRC_14; Reg_08 | S/R |
| `PP_TB_009` | Only ECCG ACM algorithms are configured for credentials, status lists, WIA and KA validation. | Configuration review | OIA_03; WUA_04 | S/R |
| `PP_TB_010` | Revocation can be outsourced, but the Provider remains the only party deciding it. | Contract and process review | VCR_03 | S/R |
| `PP_TB_011` | Representation attestations are short-lived or revocable by every party entitled to request it. | Document review | RP_02 | S/O |
| `PP_TB_012` | A QEAA Provider obtains User approval before asking an Authentic Source to verify attributes, and uses the TS11 interface. | Walkthrough | QTSPAS_05, QTSPAS_08 | S/R |
| `PP_TB_013` | A domestic PID namespace or type is published in a rulebook. | Document review | PID_07, PID_16 | S/O |
| `PP_TB_014` | Re-issuance needs no User action wherever possible. | Walkthrough; complements `IA_Reissuance_001` | ISSU_42 | S/R |

## 6. Traceability: ARF requirement → tests

| ARF HLR | Tests |
| --- | --- |
| ISSU_01a, ISSU_15, ISSU_26 (OpenID4VCI + HAIP) | `MS_Metadata`, `MS_Offer`, `MS_CredentialEndpoint`, `IA_*`, `SM_ProofOfPossession`, `SM_TokenBinding` |
| ISSU_12, ISSU_12a, PID_02 (formats) | `MS_Metadata_006`, `IA_MainInteraction_003`, `DM_PidMdoc_006` |
| ISSU_12c, ISSU_12d, WUA_30, WUA_32 (validity vs maintenance period) | `SM_ClientAttestation_015`, `_016_UF`, `SM_KeyAttestation_011`, `AP_WS_SM_Revocation_101` |
| ISSU_14, ISSU_25, PID_03–PID_21 (data model) | `DM_PidSdJwt`, `DM_PidMdoc`, `DM_Portrait`, `AP_WS_DM_Rulebook` |
| ISSU_17, ISSU_27, WUA_09a, WUA_12 (device binding) | `SM_KeyAttestation_001`, `_006_UF`, `SM_ProofOfPossession_010`, `AP_WS_SM_KeyAttestation_100` |
| ISSU_19, ISSU_19b, ISSU_28, ISSU_28a, WPNot_04 (Wallet Provider anchors) | `SM_ClientAttestation_004_UF`–`_006_UF`, `SM_KeyAttestation_004_UF`, `IA_MainInteraction_002`, `PP_Inf_SM_TrustMechanisms_001`–`_006_UF` |
| ISSU_21, ISSU_30, ISSU_30a, WUA_11a, WUA_25 (WIA and KA validation and revocation) | `SM_ClientAttestation`, `SM_KeyAttestation`, `IA_Reissuance_005_UF`, `AP_WS_SM_KeyAttestation_103` |
| ISSU_22, ISSU_32, PPNot_04 (signed metadata) | `MS_Metadata_002`, `_003`, `SM_IssuerIntegrity_004` |
| ISSU_24a, ISSU_24b, RPRC_15, RPRC_22, RPRC_22b, RPRC_23, Reg_10e (registration certificate) | `MS_Metadata_004`, `_005` |
| ISSU_27d, WUA_05, WUA_05a, WUA_34, WIAM_14b (key storage level) | `MS_Metadata_008`, `SM_KeyAttestation_010_UF`, `AP_WS_MS_Metadata_101`, `AP_WS_SM_KeyAttestation_101_UF` |
| ISSU_35, ISSU_36, VCR_17, VCR_18 (unlinkability) | `SM_Unlinkability`, `SM_IssuerIntegrity_006`, `PP_RP_SM_Revocation_004`, `PP_TB_005` |
| ISSU_39, ISSU_40, ISSU_43–ISSU_54, ISSU_61, ISSU_64 (reuse methods, batches) | `MS_Metadata_009`, `IA_Batch`, `PP_TB_004` |
| ISSU_42, ISSU_63, ISSU_65 (re-issuance) | `IA_Reissuance`, `PP_TB_014` |
| ISSU_68, ISSU_70, ISSU_71, ISSU_73 (signing certificate profiles) | `SM_IssuerIntegrity_003` |
| VCR_01, VCR_01b, VCR_02, VCR_11, VCR_11a (revocation method) | `SM_Validity_002`, `_003`, `SM_Revocation_001`, `_002`, `AP_WS_SM_Revocation_103`, `PP_RP_SM_Revocation_007` |
| VCR_03–VCR_09, PAD_02 (revocation events) | `SM_Revocation_003`–`_008`, `PP_TB_003`, `PP_TB_010` |
| VCR_07c, VCR_07d, WURevocation_18, WURevocation_19, WUA_29 (revocation chaining) | `SM_Revocation_006`, `_007`, `AP_WS_SM_Revocation_100`, `PP_TB_007` |
| VCR_16, PPNot_03a, PuBPNot_05 (status list publication) | `PP_RP_*` |
| PPNot_03, PuBPNot_04, RPACANot_03, RPACANot_03a (anchors for the Provider's signers) | `SM_IssuerIntegrity_001`, `_002`, `PP_Inf_SM_TrustMechanisms_007` |
| OIA_03, WUA_04 (ECCG algorithms) | `MS_Metadata_007`, `SM_ClientAttestation_014_UF`, `SM_KeyAttestation_012_UF`, `SM_ProofOfPossession_002_UF`, `PP_RP_SM_Revocation_006`, `PP_TB_009` |
| WUA_10a, WUA_10b (KA context) | `SM_KeyAttestation_007_UF`, `_013_UF`, `AP_WS_MS_Metadata_100`, `AP_WS_SM_KeyAttestation_102` |
| ProxId_02 | `MS_Metadata_013` |
| EDP_09, EDP_11 | `AP_WS_MS_Metadata_102`, `AP_WS_SM_Revocation_102` |
| ISSU_18, ISSU_27a–c, ISSU_38, ISSU_67, ISSU_69, ISSU_72, QTSPAS_05, QTSPAS_08, RP_02 | `PP_TB` |

## 7. Overlap with the OIDF OpenID4VCI issuer suite

As for the RP catalogue, the OIDF suite is an optional execution vehicle for the objectives marked "OIDF"; the catalogue adds the Wallet Provider trust setup, WIA and KA validation against `TL-WP`, revocation, the PID data model and the category variants.

**Basis.** The plan `oid4vci-1_0-issuer-haip-test-plan` of the OpenID conformance suite, release-v5.2.2, which EUDIPLO runs in its CI (`apps/backend/test/oidf/`, EUDIPLO commit `11022b4`). Its module snapshot has 63 entries: 61 distinct modules, because `happy-flow` and `fail-unknown-credential-configuration` run once with plain and once with encrypted credential responses. 21 modules are OpenID4VCI modules (prefix `oid4vci-1_0-issuer-`, written without it below), 40 are FAPI 2.0 Security Profile modules (prefix `fapi2-security-profile-final-`, written `fapi2-…-`) in which the credential endpoint is the protected resource. What each module checks was read from its source at that tag (`vci10issuer` and `fapi2spfinal` packages, `VCIProfileBehavior`, `VCIHaipProfileBehavior` and the credential validation sequences), not inferred from its name.

**How the plan runs.** Variants are fixed by the plan: authorization code grant only, PAR, PKCE, DPoP, `client_attestation` as client authentication, unsigned PAR parameters. EUDIPLO runs four instances: `sd_jwt_vc` and `mdoc`, each issuer-initiated (offer by the SUT) and wallet-initiated. It skips four modules: `fapi2-…-user-rejects-authentication` and `fapi2-…-par-ensure-reused-request-uri-prior-to-auth-completion-succeeds` (need an interactive login), `fapi2-…-ensure-unsigned-authorization-request-without-using-par-fails` (the error page needs a manual screenshot), and `happy-flow-multiple-clients` in the issuer-initiated variants (the second client reuses a single-use offer). It accepts WARNING as well as PASSED for the metadata and FAPI2 modules.

**Differences that keep most mappings partial.**

- Trust: the suite trusts the Wallet Attestation and key attestation signers through JWKS configured in the plan (`client_attester_keys_jwks`, `key_attestation_jwks`), and the credential and status list signers through configured anchor certificates. There is no LoTE, no Wallet Provider status, no WIA or KA revocation, and no access or registration certificate.
- Error codes: for WIA faults the suite accepts HTTP 400 or 401 with `invalid_client`, `invalid_request` or `invalid_client_attestation`. The catalogue requires `invalid_client` (decision 1), so a SUT can pass the module and fail the objective.
- SHOULD-level checks end in WARNING (DPoP `jti` replay, one-time `request_uri`, fewer credentials than proofs in a batch). The catalogue expects REJ or the full count there, so a WARNING in the OIDF log is a FAIL of the objective.
- One instance, one issuance: unlinkability checks run within one batch, not across wallets and repeated issuances.

### 7.1 Mapping: module → objective

"Exact" means the module applies the objective's stimulus and checks its expected result; "partial" means it covers part of the stimulus or part of the check, as the note says. Objective IDs are shortened by dropping `PP_WS_`.

| Module | Objective(s) | Coverage | Note |
| --- | --- | --- | --- |
| `metadata-test` | `MS_Metadata_001`, `_010`, `_011` | partial | Fetches `/.well-known/openid-credential-issuer` as JSON; checks required fields, https URLs, the `credential_issuer` URI, `nonce_endpoint` present (HAIP 4.1), well-formed algorithm, display and encryption metadata, and the Authorization Server metadata (RFC 8414, `issuer` match, client attestation algorithms). Does not check that algorithms are ECCG (`_007`), key storage levels (`_008`) or `credential_reuse_policy` (`_009`). The rest is candidate C1. |
| `metadata-test-signed` | `MS_Metadata_002` | partial | Requests `application/jwt`, checks `typ` `openidvci-issuer-metadata+jwt` and verifies the signature with the `x5c` leaf. No chain to an anchor, no access certificate, no comparison with the unsigned metadata (`_003`). Skipped when the SUT answers with JSON. |
| `happy-flow` | `MS_CredentialEndpoint_001`, `_007`, `SM_ProofOfPossession_010` | exact | Unknown members are added to the credential request (and to the authorization, token and notification requests, candidate C16). The credential's `cnf.jwk` or mdoc device key is compared with the proof key. |
| `happy-flow` | `IA_MainInteraction_001`; `MS_Offer_001`, `_002`, `_004`; `MS_Metadata_010`; `IA_Notification_001`; `SM_ClientAttestation_001`; `SM_KeyAttestation_001`; `SM_IssuerIntegrity_001`, `_002`, `_006`; `SM_Validity_001`; `SM_Revocation_001`, `_002`; `DM_PidSdJwt_006`; `PP_RP_IA_Supportive_001`; `PP_RP_SM_Revocation_002` | partial | One authorization code issuance with PAR, PKCE, DPoP, a WIA from the suite's own attester and a KA where the configuration requires one; no `TL-WP`, no category variant, no §3.6 data model checks. Offer checks only in the issuer-initiated variant, and `_002` only when the SUT sends the offer by reference. Nonce endpoint: 200 and `Cache-Control: no-store`, called once. Notification: `credential_accepted` only, 2xx accepted. SD-JWT VC: `iat`, `nbf`, `exp`, `typ`, `vct`, unique salts within the credential, `x5c` chain to the configured anchor; Type Metadata fetched, `vct#integrity` checked when present. mdoc: `IssuerAuth` signature, value digests, doctype, MSO revocation mechanism present. Status list: token fetched, `application/statuslist+jwt`, `x5c` chain to the configured status anchor, entry valid; no ECCG, no anchor category, no `+cwt`. |
| `happy-flow` (encrypted) | `SH_Encryption_001` | exact | Also sends a second request with DEFLATE compression (`zip`), candidate C8. |
| `happy-flow-additional-requests` | none | | TLS 1.2 or later and BCP 195 ciphers at the credential endpoint (C2); permissive `Accept` header and FAPI customer IP header tolerated (C3). |
| `happy-flow-multiple-clients` | none | | Two OAuth clients of the same attester are served one after the other (C4). Not `IA_MainInteraction_002`: there is no second Wallet Provider. Skipped by EUDIPLO in the issuer-initiated variants. |
| `happy-flow-skip-notification` | `IA_Notification_003` | partial | Issuance completes without any notification; does not check that nothing is revoked. |
| `batch-issuance` | `IA_Batch_001`, `_002`; `SM_IssuerIntegrity_006`; `SM_Unlinkability_002`, `_003`, `_004`; `PP_RP_IA_Supportive_003` | partial | One proof per credential (`batch_size`, capped at 20). No more credentials than proofs; fewer is a WARNING, the catalogue expects all. Same Credential Dataset; distinct binding keys matching the proofs; distinct salts; time claims rounded or randomized, not a precise shared timestamp (FAILURE for SD-JWT VC, WARNING for mdoc; the catalogue's `_002` "same validity period" is compatible with rounding); distinct and unpredictable status indices (FAILURE for SD-JWT VC under HAIP 6.1, WARNING for mdoc); shared status list URI (WARNING). All within one batch to one wallet; the catalogue compares 20 issuances to two wallets. Skipped if the SUT does not advertise `batch_credential_issuance` or returns one credential. |
| `fail-invalid-nonce` | `SM_ProofOfPossession_005_UF`, `SM_KeyAttestation_007_UF` | partial | A random `c_nonce` goes into the proof and, where used, into the KA at the same time; expects `invalid_nonce`. Does not isolate the KA, and has no missing nonce, replay or retry case. |
| `fail-invalid-jwt-proof-signature` | `SM_ProofOfPossession_001_UF` | exact | Expects `invalid_proof`. |
| `fail-invalid-key-attestation-signature` | `SM_KeyAttestation_003_UF` | exact | KA in the `jwt` proof's `key_attestation` header or as `attestation` proof; expects `invalid_proof`. Skipped if no KA is required. |
| `fail-invalid-client-attestation-signature` | `SM_ClientAttestation_003_UF` | exact | At the PAR endpoint. Error code accepted more broadly than the catalogue (see above). |
| `fail-invalid-client-attestation-pop-signature` | `SM_ClientAttestation_008_UF` | exact (with `fail-mismatched-client-attestation-pop-key`) | Corrupted PoP signature at PAR. |
| `fail-client-attestation-exp-in-past` | `SM_ClientAttestation_007_UF` | partial | `exp` 10 minutes in the past; no `nbf` case. |
| `fail-client-attestation-no-sub` | `SM_ClientAttestation_010_UF` | partial | `sub` missing, not different from `client_id`. |
| `fail-client-attestation-pop-wrong-aud` | `SM_ClientAttestation_009_UF` | partial | Wrong `aud` only; no stale `iat`, no replayed `jti`. |
| `fail-mismatched-client-attestation-pop-key` | `SM_ClientAttestation_008_UF` | exact | PoP validly signed with a key other than the WIA's `cnf` key. |
| `fail-missing-proof` | none | | Credential request without `proofs`, expects `invalid_proof` (C5). |
| `fail-unknown-credential-configuration` (plain and encrypted) | `MS_CredentialEndpoint_003_UF` | exact | Expects `unknown_credential_configuration`. |
| `fail-unknown-credential-identifier` | `MS_CredentialEndpoint_006_UF` | partial | Random identifier, not one from another session; expects `unknown_credential_identifier`. |
| `fail-on-access-token-in-query` | none | | Access token sent as query parameter must be rejected (C6). |
| `fail-unsupported-encryption-algorithm` | `SH_Encryption_002_UF` | partial | Unsupported `alg` only; expects `invalid_encryption_parameters`. |
| `fapi2-…-access-token-type-header-case-sensitivity` | none | | `DPoP` authorization scheme in another case must be accepted (C7). |
| `fapi2-…-attempt-reuse-authorization-code-after-one-second` | `IA_AuthorizationCode_005_UF` | partial | Reuse; revocation of the tokens already issued is a WARNING. |
| `fapi2-…-check-dpop-proof-nbf-exp` | none | | DPoP proofs carrying `nbf` and `exp` are accepted (C7). |
| `fapi2-…-discovery-end-point-verification` | `MS_Metadata_011` | partial | AS metadata: PAR, `S256`, DPoP algorithms, `authorization_response_iss_parameter_supported`, `attest_jwt_client_auth` (WARNING only). `pre-authorized_grant_anonymous_access_supported` not checked. |
| `fapi2-…-dpop-negative-tests` | `SM_TokenBinding_002_UF`, `_003_UF`, `_004_UF` | exact | At the credential endpoint: no DPoP proof, `Bearer` scheme, other key, wrong `htm`, wrong `htu`, missing or wrong `ath`, `iat` ±1 h. |
| `fapi2-…-dpop-negative-tests` | `SM_TokenBinding_005_UF` | partial | Replayed `jti` is a SHOULD and ends in WARNING. The other faults of this module (missing claims, `typ`, `alg` `none` or RS256, private key in `jwk`, two `DPoP` headers, `htu` normalisation) are C7. |
| `fapi2-…-ensure-authorization-code-is-bound-to-client` | `IA_AuthorizationCode_005_UF` | partial | Code redeemed by another client; `redirect_uri` binding not tested. |
| `fapi2-…-ensure-authorization-request-with-long-state` | none | | C9. |
| `fapi2-…-ensure-authorization-request-without-state-success` | none | | C9. |
| `fapi2-…-ensure-client-id-in-token-endpoint` | `SM_ClientAttestation_010_UF` | partial | Second client's `client_id` with the first client's attestation at the token endpoint. |
| `fapi2-…-ensure-different-state-inside-and-outside-request-object` | none | | With unsigned PAR: `state` at the authorization endpoint differs from the pushed one (C9). |
| `fapi2-…-ensure-dpop-auth-code-binding-success` | none | | C10. |
| `fapi2-…-ensure-dpopproof-at-par-endpoint-binding-success` | none | | C10. |
| `fapi2-…-ensure-dpopproof-with-iat-10seconds-after-succeeds` | none | | C7. |
| `fapi2-…-ensure-dpopproof-with-iat-10seconds-before-succeeds` | none | | C7. |
| `fapi2-…-ensure-holder-of-key-required` | none | | Token request without DPoP rejected (C11); TLS checks at all endpoints (C2). |
| `fapi2-…-ensure-mismatched-dpop-jkt-fails` | none | | C10. |
| `fapi2-…-ensure-pkce-code-verifier-required` | `IA_AuthorizationCode_003_UF` | exact (with `incorrect-pkce-…`) | Missing `code_verifier`. |
| `fapi2-…-ensure-redirect-uri-in-authorization-request` | none | | C9. |
| `fapi2-…-ensure-request-object-without-redirect-uri-fails` | none | | C9. |
| `fapi2-…-ensure-response-type-code-idtoken-fails` | none | | C9. |
| `fapi2-…-ensure-response-type-token-fails` | none | | C9. |
| `fapi2-…-ensure-token-endpoint-fails-with-expired-auth-code` | none | | C12. |
| `fapi2-…-ensure-token-endpoint-fails-with-mismatched-dpop-jkt` | none | | C10. |
| `fapi2-…-ensure-token-endpoint-fails-with-mismatched-dpop-proof-jkt` | none | | C10. |
| `fapi2-…-ensure-unsigned-authorization-request-without-using-par-fails` | `IA_AuthorizationCode_001_UF` | exact | Skipped by EUDIPLO: the error page needs a manual screenshot. |
| `fapi2-…-happy-flow` | `IA_AuthorizationCode_007`, `SM_TokenBinding_001` | exact | `state` and `iss` in the authorization response; DPoP-bound access token used at the credential endpoint. |
| `fapi2-…-incorrect-pkce-code-verifier-rejected` | `IA_AuthorizationCode_003_UF` | exact | Expects `invalid_grant`. |
| `fapi2-…-par-attempt-invalid-http-method` | none | | C13. |
| `fapi2-…-par-attempt-reuse-request_uri` | `IA_AuthorizationCode_004_UF` | partial | One-time use is a SHOULD (RFC 9126 §7.3): success is a WARNING. |
| `fapi2-…-par-attempt-to-use-expired-request_uri` | `IA_AuthorizationCode_004_UF` | partial | Expiry half of the objective. |
| `fapi2-…-par-attempt-to-use-request_uri-for-different-client` | none | | C13. |
| `fapi2-…-par-authorization-request-containing-request_uri-form-param` | none | | C13. |
| `fapi2-…-par-ensure-pkce-required` | `IA_AuthorizationCode_002_UF` | exact (with the next) | No PKCE. |
| `fapi2-…-par-plain-pkce-rejected` | `IA_AuthorizationCode_002_UF` | exact | Method `plain`. |
| `fapi2-…-par-ensure-reused-request-uri-prior-to-auth-completion-succeeds` | none | not a candidate | A recommendation about the login page; needs an interactive login and is skipped by EUDIPLO. |
| `fapi2-…-par-without-duplicate-parameters` | none | | C9. |
| `fapi2-…-plain-fapi-tolerate-unregistered-redirect-uri` | none | not a candidate | Both outcomes are permitted (RFC 9126 §2.4); nothing to fail. |
| `fapi2-…-refresh-token` | `IA_Reissuance_001`, `_002_UF` | partial | A refresh token, if issued, gives a new access token; a DPoP-bound refresh token without a DPoP proof is rejected (the catalogue's `_002_UF` uses another key). The module's other checks are C14. |
| `fapi2-…-state-only-outside-request-object-not-used` | none | | C9. |
| `fapi2-…-user-rejects-authentication` | none | | C15. Skipped by EUDIPLO. |

**Counts.** 31 of the 61 modules cover at least one objective (17 OpenID4VCI, 14 FAPI2). 28 modules cover none and feed the candidates below; 2 are not candidates. On the catalogue side 56 of the 182 objectives are marked "OIDF": 17 exact, 39 partial. By group: `MS_*` 11, `IA_*` 13, `SM_*` 26, `DM_*` 1, `SH_*` 2, `PP_RP_*` 3. No `PP_Inf_*`, `AP_*` or `PP_TB_*` objective is covered.

### 7.2 Candidates named in the previous version of this section

| Candidate | Result |
| --- | --- |
| `MS_Metadata_001`, `_010`, `_011` | Mapped, partial. |
| `MS_Offer_001`, `_002` | Mapped, partial (issuer-initiated variant). |
| `MS_Offer_003` | Not covered: the HAIP plan runs the authorization code grant only. The plain plan `oid4vci-1_0-issuer-test-plan` has the same modules with a pre-authorized code variant, which would cover the offer and the happy flow but not `tx_code` faults; EUDIPLO does not run it. |
| `MS_CredentialEndpoint_001`, `_003` | Mapped, exact. |
| `IA_MainInteraction_001` | Mapped, partial (without the EUDI trust setup). |
| `IA_PreAuthorized_001_UF` | Not covered: no pre-authorized code in the HAIP plan, and no module reuses a pre-authorized code in either plan. |
| `IA_AuthorizationCode_001_UF`–`_005_UF` | Mapped: `_001_UF`, `_002_UF`, `_003_UF` exact; `_004_UF`, `_005_UF` partial. |
| `SM_ProofOfPossession_001_UF`, `_005_UF` | Mapped: exact and partial. |
| `SM_ProofOfPossession_002_UF`, `_003_UF`, `_004_UF`, `_006_UF` | Not covered: release-v5.2.2 has no module that sends a proof with `alg` `none` or a MAC, a wrong `typ`, a wrong `aud` or an `iat` outside the window. Only the signature and the nonce are faulted. |
| `SM_TokenBinding_002_UF`–`_005_UF` | Mapped through `fapi2-…-dpop-negative-tests`: `_002_UF`–`_004_UF` exact, `_005_UF` partial. |

### 7.3 Candidates for new objectives

What the plan tests and the catalogue has no objective for. The rows are not added here; each line names the modules and the basis.

| # | Candidate | Modules | Basis |
| --- | --- | --- | --- |
| C1 | Metadata well-formedness beyond `MS_Metadata`: a `scope` for every credential configuration, https URLs, `display` locales, consistent `credential_request_encryption` and `credential_response_encryption`, AS metadata valid against the RFC 8414 schema, AS `jwks_uri` with public asymmetric keys only. | `metadata-test`, `fapi2-…-discovery-end-point-verification` | HAIP 4.1; OpenID4VCI §12.2.4, §8.2; RFC 8414 §2 |
| C2 | TLS 1.2 or later only, BCP 195 cipher suites, at the Authorization Server and the Credential Issuer endpoints. | `fapi2-…-ensure-holder-of-key-required`, `happy-flow-additional-requests` | OpenID4VCI §13.9; FAPI 2.0 SP §5.2 via HAIP 4 |
| C3 | The credential endpoint tolerates a permissive `Accept` header and extra request headers. Low value; probably not worth a row. | `happy-flow-additional-requests` | RFC 9110 §12.5.1 |
| C4 | Two wallets issued one after the other with separate clients get separate, working sessions. | `happy-flow-multiple-clients` | OpenID4VCI §3.4 |
| C5 | A credential request without `proofs`, for a configuration that requires key binding, is rejected with `invalid_proof`. | `fail-missing-proof` | OpenID4VCI §8.2, §8.3.1.2 |
| C6 | An access token sent as a query parameter is rejected. | `fail-on-access-token-in-query` | FAPI 2.0 SP §5.3.4 via HAIP 4 |
| C7 | DPoP proof handling at the credential endpoint: proofs missing `typ`, `alg`, `jwk`, `jti`, `htm`, `htu` or `iat`, with a wrong `typ`, `alg` `none` or a non-advertised algorithm, an invalid signature, a private key in `jwk`, or two `DPoP` headers are rejected; `htu` is compared after normalisation; the `DPoP` scheme is case-insensitive; `iat` 10 s off and extra `nbf`/`exp` claims are accepted. | `fapi2-…-dpop-negative-tests`, `-access-token-type-header-case-sensitivity`, `-check-dpop-proof-nbf-exp`, `-ensure-dpopproof-with-iat-10seconds-after-succeeds`, `-…-before-succeeds` | RFC 9449 §4.2, §4.3, §7.1; RFC 9110 §11.1 |
| C8 | Encrypted credential request with DEFLATE compression (`zip`) is handled. | `happy-flow` (encrypted) | OpenID4VCI §8.2, §10 |
| C9 | Authorization request handling with PAR: the authorization endpoint accepts `client_id` and `request_uri` alone and ignores parameters not pushed; `response_type` other than `code` is rejected; `state` is optional and a long `state` is returned intact; a missing `redirect_uri` is rejected or the registered one is used. | `fapi2-…-par-without-duplicate-parameters`, `-state-only-outside-request-object-not-used`, `-ensure-different-state-inside-and-outside-request-object`, `-ensure-response-type-code-idtoken-fails`, `-ensure-response-type-token-fails`, `-ensure-authorization-request-without-state-success`, `-ensure-authorization-request-with-long-state`, `-ensure-redirect-uri-in-authorization-request`, `-ensure-request-object-without-redirect-uri-fails` | RFC 9126 §4; RFC 6749 §3.1.2.3, §4.1.1; FAPI 2.0 SP §5.3.2.2 |
| C10 | DPoP binding of the authorization code: `dpop_jkt` at PAR and a DPoP proof at PAR bind the code; a token request with another DPoP key, or a `dpop_jkt` that does not match the PAR proof, is rejected. | `fapi2-…-ensure-dpop-auth-code-binding-success`, `-ensure-dpopproof-at-par-endpoint-binding-success`, `-ensure-mismatched-dpop-jkt-fails`, `-ensure-token-endpoint-fails-with-mismatched-dpop-jkt`, `-…-mismatched-dpop-proof-jkt` | RFC 9449 §10 |
| C11 | A token request without a DPoP proof is rejected (no unbound access token is issued). | `fapi2-…-ensure-holder-of-key-required` | HAIP 4; RFC 9449 §5 |
| C12 | An expired authorization code is rejected. | `fapi2-…-ensure-token-endpoint-fails-with-expired-auth-code` | RFC 6749 §4.1.2 |
| C13 | PAR endpoint: only POST; a `request_uri` parameter inside the pushed request is rejected; a `request_uri` is bound to the client that pushed it. | `fapi2-…-par-attempt-invalid-http-method`, `-par-authorization-request-containing-request_uri-form-param`, `-par-attempt-to-use-request_uri-for-different-client` | RFC 9126 §2.1, §4 |
| C14 | Refresh token: a refresh request without client authentication, with a WIA for another client instance key, or from another client, is rejected. Extends `IA_Reissuance`. | `fapi2-…-refresh-token` | RFC 6749 §6; OAuth 2.0 Attestation-Based Client Authentication §10.3 |
| C15 | A User who rejects authentication ends with `access_denied` at the wallet's redirect URI. Needs an adapter step. | `fapi2-…-user-rejects-authentication` | RFC 6749 §4.1.2.1 |
| C16 | Unknown parameters are ignored in the authorization, token and notification requests too (extends `MS_CredentialEndpoint_007`). | `happy-flow` | OpenID4VCI §5.1.3, §6.1, §11.1 |
| C17 | SD-JWT VC Type Metadata is consistent with the credential: `vct` matches, mandatory claims are present and selective disclosure follows the Type Metadata (extends `DM_PidSdJwt_006`). | `happy-flow` | SD-JWT VC §6 |
| C18 | The client attestation challenge endpoint, if advertised, answers 200 with `Cache-Control: no-store`. | all modules with `client_attestation` | OAuth 2.0 Attestation-Based Client Authentication |

## 8. Decisions and remaining notes

### 8.1 Decisions (2026-11-17)

| # | Question | Decision | Applied in |
| --- | --- | --- | --- |
| 1 | Do wrong error codes fail a test? | FAIL only where a specification requires the code (`REJ:<code>`: for example `invalid_nonce`, `use_dpop_nonce`, `invalid_grant`, `invalid_client`). Elsewhere any 4xx error object passes and the code is recorded. | §2.5 |
| 2 | What if the SUT cannot obtain the WIA or KA status (list unreachable, invalid, expired, wrong signer)? | PID Providers reject: ISSU_21 requires the check before issuing. Attestation Providers follow the policy they declare (ICS-18), as Relying Parties do for VCR_14. | ICS-18, `SM_ClientAttestation_013_UF`, `SM_KeyAttestation_009_UF` |
| 3 | Time limits for revocation | `T_rev` and `T_chain` are declared by the SUT and capped at 24 h each: `T_rev` from ETSI EN 319 411-1 REV-6.2.4-03A, `T_chain` by the same bound, because WURevocation_18 says only "regularly" and "immediately". The nightly job runs with declared values of minutes. | ICS-06, ICS-07, `SM_Revocation_003`–`_008`, `AP_WS_SM_Revocation_100` |
| 4 | Minimum status list size (VCR_18) | The SUT declares a minimum, and the suite enforces a floor of 10 000 entries until the EC or ETSI sets a number. | ICS-16, `PP_RP_SM_Revocation_004` |
| 5 | Test subjects | The adapter seeds `SUBJ-1` and `SUBJ-2`. A Provider that cannot seed declares fixed test identities with their attribute values; tests that need a change of subject data are then NOT APPLICABLE. | §3.4, ICS-17, `SM_Revocation_008`, `DM_*` |
| 6 | Enrolment of the SUT's keys under the suite PKI | Required, so that the suite's trust configuration has one correct answer. A Provider whose keys cannot be certified under the test PKI cannot run the automated suite. | §3.3 |
| 7 | Repository | This repository, with shared packages (`forge`, `validator`, `trust-infrastructure`, `status-provider`, `controller`, `fcaf-render`) and separate definitions and adapters. A rename to cover both SUTs comes later. | §9 |

### 8.2 Remaining notes

- **Class names.** `PP_*` and `AP_*` are not reserved by the FCAF methodology. Contribution needs the FCAF maintainers' agreement on the SUT and the names, as for the RP SUT.
- **Section references.** Checked on 2026-11-19 against the published OpenID4VCI 1.0 and HAIP 1.0 (openid.net, the errata-incorporating URLs). Corrected: Notification is OpenID4VCI §11, not §10 (`IA_Notification_001`, `_002_UF`); `credential_issuer` equality, `key_attestations_required` and the algorithm lists are in §12.2.4 (`MS_Metadata_001`, `_008`); the nonce response and `no-store` are §7.2 (`MS_Metadata_010`); the pre-authorized code's lifetime and single use are §4.1.1 and its errors §6.3, the replay discussion §13.6.1, and there is no §13 rule on code swapping (`IA_PreAuthorized_001_UF`–`_004_UF`); response encryption is §10 (`SH_Encryption_001`); a KA nonce rule is also in App. F.1 (`SM_KeyAttestation_007_UF`). HAIP references now name subsections: 4.1 metadata and nonce endpoint, 4.3 PAR authentication, 4.4 refresh tokens, 4.4.1 Wallet Attestation, 6.1 status list index, 6.1.1 `x5c` of the credential, and 7 for algorithms (`MS_Metadata_007` cited 4). Correct as cited: §4.1.1, §4.1.3, §5.1.1–§5.1.3, §6.2, §8.2, §8.3, §8.3.1, §8.3.1.2, §9, §9.1, §9.3, §12.2.2, §12.2.3, §14.5, App. D, D.1, D.2, E, F.1, F.3, F.4. Two remarks outside the numbering: OpenID4VCI 1.0 has no limit on wrong `tx_code` attempts (the second half of `IA_PreAuthorized_002_UF` rests on earlier drafts and ISSU policy, not the specification), and an `invalid_nonce` error no longer carries a fresh `c_nonce`, the wallet fetches one from the Nonce Endpoint (§7, §8.3.1.2), which `SM_ProofOfPossession_005_UF` should say when its row is next edited. HAIP 1.0 itself cites OpenID4VCI with stale numbers (signed metadata "11.2.3" for §12.2.3, refresh "13.5" for §14.5, the `jwt` proof type "Appendix E" for App. F.1); the catalogue cites OpenID4VCI directly. Which versions the FCAF pins is still to be confirmed before the test case phase.
- **TS3.** The WIA and KA structure (revocation maintenance period, status reference) follows TS3 at the ARF commit above; names of claims are deliberately not fixed here.
- **ISO/IEC 18013-5 second edition** is a draft; the `MD` status and identifier list objectives follow it.
- **DC API issuance** (ISSU_03) enters once its specification exists; the RP harness's DC API shim could then be reused.

### 8.3 Corrections after the spec review of the EUDIPLO findings (2026-11-20)

Before any finding was reported upstream, every FAIL of the reference run was checked against the primary
specifications and EUDIPLO's source at `ae0792a`. Where the test demanded more than a specification does, the test
changed; where no specification has a MUST, the result is informational (`INFO`) or follows a declared policy
(`POLICY`), and the row states the true normative strength. Requirements of the EUDI profile only (ARF, TS3, PID
Rulebook) stay FAILs and are marked as such in `adapters/issuer-eudiplo/known-findings.yaml` (`basis: profile`); the
upstream texts are in `adapters/issuer-eudiplo/upstream-findings/`.

| Test case | Change | Why |
| --- | --- | --- |
| `IA_AuthorizationCode_006_UF` | Step 2 adds the unknown `scope` value to a valid request and expects `ISS`; the reference validator ignores unknown scope values. | OpenID4VCI 1.0 section 5.1.2: "Credential Issuers MUST ignore unknown scope values in a request." |
| `IA_Reissuance_002_UF` | The refresh token is presented by `CW-2` with its own WIA, PoP and DPoP key; the fault `dpop.refresh-other-key` is gone. | RFC 9449 section 5: refresh tokens of confidential clients "are not bound to the DPoP proof public key"; they are bound to the client (RFC 6749 sections 6, 10.4). |
| `IA_Notification_001` | Any 2xx passes (check `notification-2xx`); a 2xx other than 204 is recorded. | OpenID4VCI 1.0 section 11.2: 2xx MUST, 204 RECOMMENDED. |
| `SH_Encoding_002_UF` | Step 1 accepts a 4xx without an OAuth error object (413); step 2 (deep nesting) is INFO. | OpenID4VCI 1.0 section 8.2: unrecognized parameters MUST be ignored; RFC 8259 section 9: nesting limits "may". |
| `SH_Encoding_003_UF` | NOFETCH only; rejection or issuance recorded. | RFC 8725 section 3.10 asks not to follow `jku`/`x5u` ("SHOULD protect"), not to reject. |
| `PP_RP_IA_Supportive_002` | A response without caching headers passes; present headers are still checked; references §8.2 and §13.7. | Token Status List (draft 21) has no cache-header rule for the Status Provider; section 8.2 only tells Relying Parties to prefer `exp`/`ttl` "If caching-related HTTP headers are present". |
| `SM_ClientAttestation_006_UF`, `SM_KeyAttestation_004_UF` (d) | INFO; the reference validator accepts any issuance anchor of `TL-WP` for a WIA or KA. | TS3 sections 2.2.1.2, 2.2.2.2 and ARF ISSU_28, ISSU_30a bind anchors per Wallet Provider; TS3 section 3.2 is informative and maps no KA field. |
| `SM_KeyAttestation_007_UF` | Steps 3 and 4 (KA `nonce` in a `jwt` proof) are INFO; step 5 (`attestation` proof without nonce) still rejects. | OpenID4VCI 1.0 Appendix F.4 and TS3 section 2.2.2.2 require the `c_nonce` in the proof; F.1's KA nonce rule binds the wallet. Step 4 equals the area's valid baseline. |
| `SM_ClientAttestation_009_UF` | Step 4 (PoP `jti` replay) INFO. | Attestation-Based Client Auth (draft 08) section 12.1: replay detection SHOULD. |
| `IA_Batch_003_UF` | INFO, `G/O`; reference §12.2.4. | `batch_size` is "the maximum array size for the proofs parameter" (section 12.2.4); no rejection MUST. |
| `IA_Reissuance_004_UF` | Step 3 INFO. | VCR_04 forbids reversing a revocation; re-issuance after revocation is not covered. |
| `IA_Notification_002_UF` | Step 3 (unknown event) INFO. | Section 11.3's 400 MUST is scoped to an invalid `notification_id`; the codes are SHOULD. |
| `SM_ProofOfPossession_007_UF` | INFO, `G/O`. | Appendix F.1's `iss` rule binds the wallet; F.4 lists no `iss` check. |
| `SM_IssuerIntegrity_006` | A SD-JWT VC salt below 128 bits is recorded, not failed; uniqueness still fails. | RFC 9901 section 9.3: 128 bits RECOMMENDED; ISSU_35 is about uniqueness. |
| `PP_Inf_SM_TrustMechanisms_004_UF` | Steps 2 and 4 are `POLICY` (new ICS-15.invalid_version: `keep` gives `ISS`, `discard` `REJ`). | No specification requires a last-known-good list; fail-closed conforms. The EUDIPLO adapter's `refreshTrust` empties the cache itself. |
| `SM_ClientAttestation_015`, `SM_KeyAttestation_011` | Stimulus 31 days instead of 30; references TS3 section 2.4.3. | TS3 section 2.4.2 guarantees a Wallet Unit can present at least 31 days; 30 days was below that guarantee. |
| `AP_WS_SM_Revocation_101` | Stimulus 31 days instead of 30, as `SM_ClientAttestation_015` and `SM_KeyAttestation_011`. | TS3 section 2.4.2, as above. The other `AP_*` variants of the test cases in this table take the change from the `PP_*` definition. |
| `SM_ClientAttestation_016_UF` | References TS3 section 2.4.3 and ISSU_12c; WUA_32 dropped. **PID only** since 2026-11-23, as `SM_ClientAttestation_015`. | WUA_32 is about communicating a minimum period, not about the PID's expiry. ISSU_12c and TS3 section 2.4.3 bound the PID; an Attestation Provider is bound only when it chains (ISSU_12d), which `AP_WS_SM_Revocation_101` tests. |
| `SH_Encoding_004_UF` | Steps 5 and 6 put the private address in a top-level `status` (before TS3 1.5), recorded as INFO. | Steps 3 and 4 use the TS3 1.5 claims; a Provider that reads only the earlier claim never reads the address there, so they say nothing about request forgery. |
| `DM_PidMdoc_002`, `SM_IssuerIntegrity_005` | References: PID Rulebook v1.7 section 3.1.2 (not "4.2"), ISO/IEC 18013-5 not verified; PID_21 is the SHALL, RFC 9901 section 4.2.2 only permits array element disclosures; ARB_30 dropped. | EUDI profile requirements. |

## 9. Next steps

1. Done (2026-11-17): decisions on §8.1.
2. Done (2026-11-18): [issuer-harness-design.md](issuer-harness-design.md). The harness design addendum. What the RP harness already has: the test PKI and trust lists (`forge`, `trust-infrastructure`), status list serving and faults (`status-provider`), the reference validator (becomes the checker of `OBS-CRED`), the reference RP (for `PP_RP_SM_Revocation_008`), the controller, verdict model, ICS, JUnit and known findings, and `fcaf-render`. What is new: an OpenID4VCI client with fault injection (WIA and PoP, DPoP, PAR and PKCE, proofs, KA, batch), the Test Wallet Provider (WIA and KA issuance and revocation), an `IssuerAdapter` interface (`setUp`, `createOffer`, `authenticateSubject`, `revoke`, `suspend`, `changeSubject`, `describe`), a Test Registrar for SUT enrolment, and the polling of `OBS-SL`.
3. Self-validation against EUDIPLO as the reference issuer: every executable test case passes against a pinned EUDIPLO release, or is marked not validated with the reason (issuer harness design §5.5 and §12, decision 2). There is no reference issuer of the harness's own.
4. First executable baseline: `IA_MainInteraction`, `SM_ClientAttestation`, `SM_KeyAttestation`, `SM_ProofOfPossession`, `SM_Validity`, `SM_Revocation_001`–`_003`, `DM_PidSdJwt`, `DM_PidMdoc`, `PP_RP_SM_Revocation`. EUDIPLO, through its issuer API in the same Compose setup as the RP adapter, is both the reference and the first SUT.
