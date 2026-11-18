# PID Provider and Attestation Provider functional conformance tests: test catalogue

Draft 0.2, 2026-11-17 (decisions on the open questions applied, see §8.1). Phase "Test Objectives" in FCAF terms, the counterpart of [rp-test-catalogue.md](rp-test-catalogue.md) for the issuing side: every test is defined with its objective, stimulus, expected result, references and applicability. Test cases in the FCAF template and the harness come later; §9 lists what the harness needs beyond the RP harness.

## 0. Summary

| Item | Value |
| --- | --- |
| System under test | PID Provider or Attestation Provider (QEAA, PuB-EAA or non-qualified EAA Provider): the Credential Issuer, its Authorization Server, and the publication of its status lists. Identity proofing of the User and the Provider's back office are outside the protocol boundary and only covered by the test book. |
| Sources | ARF repository `main` of 2026-10-02 (latest tag v3.0.0), Annex 2 HLRs (by category: §3 Attestation & PID Providers, plus the issuer-side HLRs of §1, §2, §5 and §6); PID Rulebook (Annex 3.01); TS3 (Wallet Unit Attestation); OpenID4VCI 1.0; HAIP 1.0; RFC 9449 (DPoP), RFC 9126 (PAR), RFC 7636 (PKCE), OAuth 2.0 Attestation-Based Client Authentication; RFC 9901 (SD-JWT); SD-JWT VC draft-16; Token Status List draft-20; ISO/IEC 18013-5; ETSI TS 119 602, 119 612, 119 412-6, 119 472-3. Versions follow the FCAF reference table, as in the RP catalogue. |
| Structure | FCAF hierarchy with issuer-side classes named by analogy with the RP catalogue: `PP_WS`, `PP_RP`, `PP_Inf`, and `AP_*` for Attestation Providers. Plus a test book `PP_TB`. |
| Size | 182 test objectives: 75 unhappy flow (`_UF`) and 107 positive or conformance checks. Plus 14 test book items. Counted before format, grant and category variants are expanded. |
| Already covered elsewhere | The OIDF OpenID4VCI issuer suite covers parts of the protocol (metadata, offer, token and credential endpoints, proof validation). The mapping is not done yet (§7). Nothing public tests WIA and KA validation against the Wallet Provider LoTE, revocation chaining, status list publication, or the PID data model. |

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
| ICS-15 | `T_refresh` for `TL-WP` and the grace period after its `NextUpdate` | |
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
| `PP_WS_MS_Metadata_001` | Credential Issuer metadata is served at `/.well-known/openid-credential-issuer` under the issuer identifier, and `credential_issuer` equals that identifier. | Fetch | CONF | OpenID4VCI §12.2.2; ISSU_01a | | G/R |
| `PP_WS_MS_Metadata_002` | Signed metadata is a JWS signed with the key of the access certificate, with the access certificate and its intermediates up to `AC-A` (not the anchor) in `x5c`, and validates to `TL-AC`. | Fetch with `Accept: application/jwt` | CONF | ISSU_22; OpenID4VCI §12.2.3; PPNot_04 | | S/R |
| `PP_WS_MS_Metadata_003` | Signed and unsigned metadata carry the same values. | Compare | CONF | OpenID4VCI §12.2.3 | | G/R |
| `PP_WS_MS_Metadata_004` | The registration certificate is included by value, valid, issued by `RC-A`, with the same entity identifier as the access certificate. | Fetch | CONF | RPRC_22; RPRC_22b; ETSI TS 119 472-3 §4.2.3 | | S/R |
| `PP_WS_MS_Metadata_005` | The registration certificate's `entitlement` matches the SUT's category, and `providesAttestations` lists every credential type in `credential_configurations_supported`. | Fetch | CONF | RPRC_15, RPRC_23; ISSU_24a, ISSU_24b; Reg_10e | | S/R |
| `PP_WS_MS_Metadata_006` | A PID configuration exists in both formats: `dc+sd-jwt` with `vct` `urn:eudi:pid:1` (or a domestic extension) and `mso_mdoc` with doctype `eu.europa.ec.eudi.pid.1`. | Fetch | CONF | PID_02, PID_04, PID_14; ISSU_12 | **PID only** | S/R |
| `PP_WS_MS_Metadata_007` | `credential_signing_alg_values_supported`, `proof_signing_alg_values_supported` and DPoP algorithms list only ECCG ACM algorithms. | Fetch | CONF | OIA_03; WUA_04; HAIP 4 | | S/R |
| `PP_WS_MS_Metadata_008` | Device-bound configurations require a key attestation in `proof_types_supported`, with `key_storage` and `user_authentication` at least `iso_18045_high` for a PID. | Fetch | CONF | ISSU_27d; WUA_34; OpenID4VCI App. D.2, App. F | | S/R |
| `PP_WS_MS_Metadata_009` | `credential_reuse_policy` is present per configuration and names method A or B as required; methods are ordered by preference; batch size and thresholds are consistent with `batch_credential_issuance`. | Fetch | CONF | ISSU_39, ISSU_40, ISSU_45, ISSU_50, ISSU_54; ETSI TS 119 472-3 §4.2.4.2 | | S/R |
| `PP_WS_MS_Metadata_010` | `nonce_endpoint` is advertised and returns a fresh `c_nonce` with `Cache-Control: no-store`. | Fetch, POST twice | CONF | OpenID4VCI §7; HAIP 4 | | G/R |
| `PP_WS_MS_Metadata_011` | Authorization Server metadata: PAR required, PKCE `S256` only, DPoP algorithms advertised, `attest_jwt_client_auth` as client authentication, `pre-authorized_grant_anonymous_access_supported` per ICS-03. | Fetch | CONF | HAIP 4; RFC 9126 §5; RFC 7636; RFC 9449 §5.1; ISSU_01a | | S/R |
| `PP_WS_MS_Metadata_012` | `display` contains a name consistent with the trade name in the access certificate. | Fetch | CONF | ISSU_11; Reg_31 | | S/O |
| `PP_WS_MS_Metadata_013` | Metadata does not offer server retrieval or any endpoint that releases attributes to a Relying Party. | Fetch, probe | CONF | ProxId_02 | `MD` | S/R |

##### PP_WS_MS_Offer

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_MS_Offer_001` | The offer names the SUT's `credential_issuer` and only `credential_configuration_ids` that exist in the metadata. | Capture offer | CONF | OpenID4VCI §4.1.1 | | G/R |
| `PP_WS_MS_Offer_002` | An offer by reference is served as `application/json` over https and equals an offer by value. | Fetch `credential_offer_uri` | CONF | OpenID4VCI §4.1.3 | | G/R |
| `PP_WS_MS_Offer_003` | Pre-authorized offer: the code is opaque, and `tx_code` carries `input_mode`, `length` and description when required. | Capture | CONF | OpenID4VCI §4.1.1 | `PA` | G/R |
| `PP_WS_MS_Offer_004` | Authorization code offer: `issuer_state`, if present, is bound to the offer and returned unaltered. | Capture | CONF | OpenID4VCI §4.1.1, §5.1.3 | `AC` | G/O |

##### PP_WS_MS_CredentialEndpoint

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_MS_CredentialEndpoint_001` | A valid request with `credential_configuration_id` and `proofs` returns `credentials` as an array of objects with `credential`. | `SCN-I` | ISS | OpenID4VCI §8.2, §8.3 | | G/R |
| `PP_WS_MS_CredentialEndpoint_002` | When the token response carried `authorization_details` with `credential_identifiers`, a request with `credential_identifier` succeeds. | `SCN-I` with identifiers | ISS | OpenID4VCI §6.2, §8.2 | `AC` | G/R |
| `PP_WS_MS_CredentialEndpoint_003_UF` | Unknown `credential_configuration_id` is rejected. | Random id | REJ:unknown_credential_configuration | OpenID4VCI §8.3.1.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_004_UF` | A configuration the access token was not issued for is rejected. | Token for config A, request config B | REJ | OpenID4VCI §8.2, §8.3.1.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_005_UF` | `credential_identifier` and `credential_configuration_id` together, or neither, is rejected. | Both; none | REJ:invalid_credential_request | OpenID4VCI §8.2 | | G/R |
| `PP_WS_MS_CredentialEndpoint_006_UF` | A `credential_identifier` not issued in this token response is rejected. | Identifier of another session | REJ:unknown_credential_identifier | OpenID4VCI §8.3.1.2 | `AC` | G/R |
| `PP_WS_MS_CredentialEndpoint_007` | Unknown request parameters are ignored. | Extra member `foo` | ISS | OpenID4VCI §8.2 | | G/R |

#### 5.1.2 Layer IA: interaction

##### PP_WS_IA_MainInteraction (positive baseline; positive controls for the `_UF` tests)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_MainInteraction_001` | Issuance of the PID to `CW-1` in each format and grant succeeds, and the credential passes every check of §3.6. | `SCN-I` | ISS | ISSU_01a, ISSU_14, ISSU_15 | `SD`, `MD` × `PA`, `AC` | S/R |
| `PP_WS_IA_MainInteraction_002` | A wallet of a second listed Wallet Provider is served the same way. | `SCN-I` with `CW-B` | ISS | ISSU_19, ISSU_19a, ISSU_28 | | S/R |
| `PP_WS_IA_MainInteraction_003` | Both formats can be obtained in one authorization (one access token, two credential requests). | `SCN-I`, two configurations | ISS | ISSU_12, ISSU_12a | **PID only** | S/R |

##### PP_WS_IA_PreAuthorized

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_PreAuthorized_001_UF` | A pre-authorized code is single-use. | Second token request with the same code | REJ:invalid_grant | OpenID4VCI §6.1, §13 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_002_UF` | Wrong or missing `tx_code` is rejected, and repeated wrong values are limited. | Wrong; missing; 10 wrong attempts then right | REJ:invalid_grant; then REJ or POLICY | OpenID4VCI §6.1, §6.3, §13.6 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_003_UF` | An expired pre-authorized code is rejected. | Use after the declared lifetime + 1 h | REJ:invalid_grant | OpenID4VCI §13 | `PA` | G/R |
| `PP_WS_IA_PreAuthorized_004_UF` | A code from another offer of the same SUT does not give access to this offer's configuration. | Swap code | REJ | OpenID4VCI §13 | `PA` | G/R |

##### PP_WS_IA_AuthorizationCode

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_AuthorizationCode_001_UF` | An authorization request not sent through PAR is rejected. | Plain request at the authorization endpoint | REJ | HAIP 4; RFC 9126 §5 | `AC` | S/R |
| `PP_WS_IA_AuthorizationCode_002_UF` | PAR without PKCE, or with `plain`, is rejected. | No `code_challenge`; method `plain` | REJ | HAIP 4; RFC 7636 §4.3 | `AC` | S/R |
| `PP_WS_IA_AuthorizationCode_003_UF` | A wrong `code_verifier` is rejected. | Other verifier | REJ:invalid_grant | RFC 7636 §4.6 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_004_UF` | A PAR `request_uri` is single-use and expires. | Reuse; use after `expires_in` | REJ | RFC 9126 §4, §7.3 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_005_UF` | An authorization code is single-use and bound to `client_id` and `redirect_uri`. | Reuse; other `client_id`; other `redirect_uri` | REJ:invalid_grant | RFC 6749 §4.1.3, §10.5 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_006_UF` | Unknown `credential_configuration_id` in `authorization_details`, or unknown `scope`, is rejected. | Unknown values | REJ | OpenID4VCI §5.1.1, §5.1.2 | `AC` | G/R |
| `PP_WS_IA_AuthorizationCode_007` | `state` is returned unaltered; `iss` is returned in the authorization response. | Capture | CONF | RFC 6749 §4.1.2; RFC 9207; HAIP 4 | `AC` | G/R |

##### PP_WS_IA_Batch (`P-BATCH`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Batch_001` | A request with `batch_size` proofs returns that many credentials, each bound to a different key from the proofs. | `SCN-I`, N proofs | ISS | ISSU_43, ISSU_64; OpenID4VCI §8.2 | | S/R |
| `PP_WS_IA_Batch_002` | All credentials of a batch carry the same attribute values and the same validity period. | `SCN-I`, N proofs | CONF | ISSU_11a, ISSU_43, ISSU_51 | | S/R |
| `PP_WS_IA_Batch_003_UF` | More proofs than `batch_size` is rejected. | `batch_size` + 1 proofs | REJ:invalid_proof or invalid_credential_request | OpenID4VCI §8.2 | | G/R |
| `PP_WS_IA_Batch_004_UF` | One invalid proof in a batch fails the whole request: no partial batch is issued. | Corrupt the signature of proof 2 of N | REJ:invalid_proof | OpenID4VCI §8.2 | | G/R |
| `PP_WS_IA_Batch_005_UF` | The same key twice in one batch does not give two credentials bound to the same key. | Proofs 1 and 2 with one key | REJ or INFO | ISSU_35 (d) | | S/O |
| `PP_WS_IA_Batch_006` | The first batch needs a single User authentication regardless of its size. | `SCN-I`, `AC`, batch | CONF | ISSU_61 | `AC` | S/R |

##### PP_WS_IA_Reissuance (`P-REISS`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_IA_Reissuance_001` | A refresh token is issued, DPoP-bound to the wallet's key, and gives a new access token without User interaction. | Refresh grant with the original DPoP key | ISS | ISSU_42, ISSU_63, ISSU_65; OpenID4VCI §14.5; RFC 9449 §5 | | S/R |
| `PP_WS_IA_Reissuance_002_UF` | A refresh token presented with another DPoP key is rejected. | DPoP proof with key of `CW-2` | REJ | ISSU_65; RFC 9449 §5 | | S/R |
| `PP_WS_IA_Reissuance_003` | A re-issued credential has the same attributes, new unique elements (salts, status index, key), and a new validity period. | Compare with the original | CONF | ISSU_35, ISSU_59, ISSU_63 | | S/R |
| `PP_WS_IA_Reissuance_004_UF` | After the PID was revoked, the refresh token no longer gives a credential. | Revoke via adapter, then refresh | REJ or POLICY | VCR_04; ISSU_65 | `P-HOOK` | S/O |
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
| `PP_WS_IA_Notification_001` | `credential_accepted`, `credential_failure` and `credential_deleted` are accepted with 204. | Each event | CONF | OpenID4VCI §10 | | G/O |
| `PP_WS_IA_Notification_002_UF` | Unknown `notification_id`, or an unknown event, is rejected. | Random id; event `foo` | REJ:invalid_notification_id or invalid_notification_request | OpenID4VCI §10.3 | | G/O |
| `PP_WS_IA_Notification_003` | A `credential_deleted` notification does not revoke or otherwise act against the User (the wallet must not notify on deletion, so a notification must not be required). | Delete event; no event at all | UNCHANGED | PAD_03 | | S/O |

#### 5.1.3 Layer SM: security mechanisms

##### PP_WS_SM_ClientAttestation (WIA as OAuth client attestation, at PAR and token endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_ClientAttestation_001` | A valid WIA and PoP from `WP-A` are accepted. | `SCN-I` | ISS | WUA_25; ISSU_21, ISSU_30a; OpenID4VCI App. E | | S/R |
| `PP_WS_SM_ClientAttestation_002_UF` | No WIA, or WIA without PoP, is rejected. | Omit both headers; omit PoP | REJ:invalid_client | WUA_25; ISSU_21, ISSU_30a; Attestation-Based Client Auth | | S/R |
| `PP_WS_SM_ClientAttestation_003_UF` | WIA with an invalid signature is rejected. | Corrupt signature | REJ:invalid_client | WUA_25 | | S/R |
| `PP_WS_SM_ClientAttestation_004_UF` | WIA signed under an anchor not in `TL-WP` is rejected. | Signed by (a) `CA-X`, (b) `PP-A`'s issuance CA in `TL-PID`, (c) `AC-A` | REJ:invalid_client | ISSU_21, ISSU_28, ISSU_30a; WPNot_04 | | S/R |
| `PP_WS_SM_ClientAttestation_005_UF` | WIA of a withdrawn Wallet Provider is rejected. | Signed under `WP-W` | REJ:invalid_client | ISSU_30a; WPNot_04 | | S/R |
| `PP_WS_SM_ClientAttestation_006_UF` | WIA signed under `WP-A`'s KA CA (another purpose of the same Wallet Provider) is rejected. | Wrong service anchor | REJ:invalid_client | ISSU_30a; TS3 | | S/R |
| `PP_WS_SM_ClientAttestation_007_UF` | Expired, or not yet valid, WIA is rejected. | `exp` past; `nbf` future (beyond `T_skew`) | REJ:invalid_client | OpenID4VCI App. E; Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_008_UF` | PoP signed with a key other than the WIA's `cnf` key is rejected. | Other key | REJ:invalid_client | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_009_UF` | PoP with wrong `aud`, stale `iat`, or a replayed `jti` is rejected. | Each mutation | REJ:invalid_client | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_010_UF` | WIA whose `sub` differs from the `client_id` of the request is rejected. | Other `client_id` | REJ:invalid_client | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_011_UF` | Wrong `typ` on WIA or PoP is rejected. | `typ` `JWT` | REJ:invalid_client | Attestation-Based Client Auth | | G/R |
| `PP_WS_SM_ClientAttestation_012_UF` | WIA of a revoked Wallet Instance is rejected. | Status set in `SL-WP-A` | REJ | ISSU_21, ISSU_30a; WUA_25, WUA_26 | | S/R |
| `PP_WS_SM_ClientAttestation_013_UF` | WIA status that cannot be obtained (list unreachable, bad signature, expired, signed under a wrong anchor) gives no successful issuance of a PID. | Each TSP mutation of the RP catalogue's `RP_PP_SM_Revocation` | REJ (PID); POLICY (others, ICS-18) | ISSU_21; WUA_25 | | S/R |
| `PP_WS_SM_ClientAttestation_014_UF` | WIA signed with a non-ECCG algorithm is rejected. | ES256K; HS256 | REJ:invalid_client | WUA_04; OIA_03 | | S/R |
| `PP_WS_SM_ClientAttestation_015` | The PID's expiry is no later than the end of the WIA's revocation maintenance period. | WIA with maintenance period ending in 30 days | CONF | ISSU_12c; WUA_30 | **PID only** | S/R |
| `PP_WS_SM_ClientAttestation_016_UF` | A WIA below the SUT's declared minimum remaining maintenance period is rejected, or the PID is shortened. | Maintenance period ending tomorrow | REJ or CONF (`exp` ≤ end) | WUA_32; ISSU_12c | | S/R |

##### PP_WS_SM_KeyAttestation (KA, at the credential endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_KeyAttestation_001` | A valid KA from `WP-A` is accepted, and every credential is bound to one of its `attested_keys`. | `SCN-I`; KA in the proof's `key_attestation` header, and as `attestation` proof type where supported | ISS | WUA_09a, WUA_11a, WUA_12; OpenID4VCI App. D, App. F.1, F.3 | | S/R |
| `PP_WS_SM_KeyAttestation_002_UF` | A PID request without KA is rejected. | Omit KA | REJ:invalid_proof | WUA_05, WUA_11a; ISSU_21 | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_003_UF` | KA with an invalid signature is rejected. | Corrupt signature | REJ:invalid_proof | WUA_11a; OpenID4VCI App. F.4 | | S/R |
| `PP_WS_SM_KeyAttestation_004_UF` | KA signed under an anchor not in `TL-WP`, or under a withdrawn Wallet Provider, is rejected. | (a) `CA-X`, (b) `PP-A`, (c) `WP-W`, (d) `WP-A`'s WIA CA | REJ:invalid_proof | ISSU_21, ISSU_28, ISSU_30 | | S/R |
| `PP_WS_SM_KeyAttestation_005_UF` | Expired KA is rejected. | `exp` past | REJ:invalid_proof | OpenID4VCI App. D | | G/R |
| `PP_WS_SM_KeyAttestation_006_UF` | Proof signed with a key not listed in `attested_keys` is rejected. | Fresh key | REJ:invalid_proof | WUA_09a, WUA_12 | | S/R |
| `PP_WS_SM_KeyAttestation_007_UF` | KA whose `nonce` is not a `c_nonce` of this SUT is rejected, when the SUT offers a nonce endpoint. | Nonce from another session; no nonce | REJ:invalid_nonce or invalid_proof | WUA_10b; OpenID4VCI App. D.1 | `P-DPN` | S/R |
| `PP_WS_SM_KeyAttestation_008_UF` | KA of a revoked WSCD is rejected. | Status set in `SL-WP-A` | REJ | ISSU_21, ISSU_30; WUA_11a | | S/R |
| `PP_WS_SM_KeyAttestation_009_UF` | KA status that cannot be obtained gives no PID. | As `ClientAttestation_013_UF` | REJ (PID); POLICY (others) | ISSU_21; WUA_11a | | S/R |
| `PP_WS_SM_KeyAttestation_010_UF` | For a PID, `key_storage` or `user_authentication` below `iso_18045_high` is rejected. | `iso_18045_moderate`; `iso_18045_basic`; absent | REJ:invalid_proof | WUA_34; ISSU_27d; WIAM_14b | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_011` | The PID's expiry is no later than the end of the KA's revocation maintenance period. | KA maintenance period ending in 30 days | CONF | ISSU_12c; WUA_30 | **PID only** | S/R |
| `PP_WS_SM_KeyAttestation_012_UF` | KA with wrong `typ` or a non-ECCG algorithm is rejected. | `typ` `JWT`; ES256K | REJ:invalid_proof | OpenID4VCI App. D.1; WUA_04 | | S/R |
| `PP_WS_SM_KeyAttestation_013_UF` | A KA of another Wallet Unit, valid in itself, combined with this wallet's WIA, does not give a PID bound to the other unit's keys. | KA of `CW-2`, WIA of `CW-1` | REJ or INFO | WUA_10b; TS3 | | S/O |

##### PP_WS_SM_ProofOfPossession (proofs at the credential endpoint)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_ProofOfPossession_001_UF` | Proof with an invalid signature is rejected. | Corrupt signature | REJ:invalid_proof | OpenID4VCI App. F.1, F.4 | | G/R |
| `PP_WS_SM_ProofOfPossession_002_UF` | Proof with `alg` `none`, a MAC algorithm, or a non-ECCG algorithm is rejected. | `none`; HS256; ES256K | REJ:invalid_proof | OpenID4VCI App. F.1; OIA_03 | | S/R |
| `PP_WS_SM_ProofOfPossession_003_UF` | Proof with a `typ` other than `openid4vci-proof+jwt` is rejected. | `JWT`; absent | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_004_UF` | Proof whose `aud` is not the Credential Issuer identifier is rejected. | Other issuer; absent | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_005_UF` | Proof with a missing, unknown or already used `nonce` is rejected with a fresh `c_nonce`; the retry with that nonce succeeds. | Missing; random; replay a used proof | REJ:invalid_nonce, then ISS | OpenID4VCI §7, §8.3.1.2, App. F.1 | `P-DPN` | G/R |
| `PP_WS_SM_ProofOfPossession_006_UF` | Proof with `iat` outside `T_proof` is rejected. | `iat` −1 h; +1 h | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_007_UF` | Proof whose `iss` differs from the `client_id` is rejected (authorization code flow). | Other `iss` | REJ:invalid_proof | OpenID4VCI App. F.1 | `AC` | G/R |
| `PP_WS_SM_ProofOfPossession_008_UF` | Proof with a private key in `jwk`, or more than one of `jwk`, `kid`, `x5c`, is rejected. | `jwk` with `d`; `jwk` and `x5c` | REJ:invalid_proof | OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_009_UF` | Proof key on an unsupported curve or an invalid point is rejected. | Off-curve point; P-521 if not advertised | REJ:invalid_proof | RFC 8725 §3.4; OpenID4VCI App. F.1 | | G/R |
| `PP_WS_SM_ProofOfPossession_010` | The issued credential's `cnf.jwk` (SD) or `deviceKeyInfo` (MD) equals the proof key. | `SCN-I` | CONF | ISSU_17; WUA_09a | | S/R |

##### PP_WS_SM_TokenBinding (DPoP and access tokens)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_TokenBinding_001` | The token endpoint issues a DPoP-bound access token (`token_type` `DPoP`). | `SCN-I` | CONF | HAIP 4; RFC 9449 §5 | | S/R |
| `PP_WS_SM_TokenBinding_002_UF` | The access token used as a Bearer token, or without a DPoP proof, is rejected. | `Authorization: Bearer`; no `DPoP` header | REJ | RFC 9449 §7.1 | | G/R |
| `PP_WS_SM_TokenBinding_003_UF` | DPoP proof signed with a key other than the one the token is bound to is rejected. | Other key | REJ | RFC 9449 §4.3 | | G/R |
| `PP_WS_SM_TokenBinding_004_UF` | DPoP proof with wrong `htm` or `htu`, missing or wrong `ath`, or stale `iat` is rejected. | Each mutation | REJ | RFC 9449 §4.2, §4.3 | | G/R |
| `PP_WS_SM_TokenBinding_005_UF` | A replayed DPoP proof (same `jti`) is rejected. | Send twice | REJ | RFC 9449 §11.1 | | G/R |
| `PP_WS_SM_TokenBinding_006_UF` | When the SUT requires a DPoP nonce, a proof without it is rejected with a new nonce, and the retry succeeds. | Omit `nonce` | REJ:use_dpop_nonce, then ISS | RFC 9449 §8, §9 | `P-DPN` | G/R |
| `PP_WS_SM_TokenBinding_007_UF` | An expired access token is rejected. | Use after `expires_in` + 1 h | REJ:invalid_token | RFC 6750 §3.1 | | G/R |

##### PP_WS_SM_IssuerIntegrity (what the SUT signs, checked by the validator on `OBS-CRED`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_IssuerIntegrity_001` | SD-JWT VC: `typ` `dc+sd-jwt`, ECCG `alg`, `x5c` with leaf and intermediates (no anchor), validating to the SUT's issuance anchor in its list. | `SCN-I` | CONF | PPNot_03; HAIP 6; SD-JWT VC §3.5; OIA_03 | `SD` | S/R |
| `PP_WS_SM_IssuerIntegrity_002` | mdoc: `IssuerAuth` COSE_Sign1 with ECCG `alg` and `x5chain` validating to the SUT's issuance anchor; `digestAlgorithm` SHA-256; every value digest matches. | `SCN-I` | CONF | PPNot_03; ISO/IEC 18013-5 §9.1.2 | `MD` | S/R |
| `PP_WS_SM_IssuerIntegrity_003` | The signing certificate follows the ETSI TS 119 412-6 profile of the SUT's category. | Inspect leaf | CONF | ISSU_68, ISSU_70, ISSU_71, ISSU_73 | | S/R |
| `PP_WS_SM_IssuerIntegrity_004` | The credential signer is not the access certificate, and the access certificate key signs no credential. | Compare keys | CONF | ISSU_22; Reg_10 | | S/R |
| `PP_WS_SM_IssuerIntegrity_005` | Every claim the PID Rulebook allows is individually selectively disclosable (top level, nested, array entries); `_sd_alg` is `sha-256`. | Inspect disclosures | CONF | PID_21; ARB_30; RFC 9901 §4 | `SD` | S/R |
| `PP_WS_SM_IssuerIntegrity_006` | Salts are at least 128 bits and unique per disclosure; mdoc `random` at least 16 bytes per item. | Inspect | CONF | ISSU_35 (a); RFC 9901 §9.3; ISO/IEC 18013-5 §9.1.2.5 | | S/R |
| `PP_WS_SM_IssuerIntegrity_007` | The issued credential signature algorithm is one of those advertised in the metadata. | Compare | CONF | OpenID4VCI §12.2.4 | | G/R |

##### PP_WS_SM_Validity

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_Validity_001` | The credential carries a validity period (`iat`, `exp`, optionally `nbf`; MSO `validityInfo`) and is valid at the time of issuance within `T_skew`. | `SCN-I` | CONF | SD-JWT VC §3.2.2; ISO/IEC 18013-5 §9.1.2.4 | | G/R |
| `PP_WS_SM_Validity_002` | A credential without a status reference is valid for 24 h or less. | `SCN-I` for a `P-SHORT` configuration | CONF | VCR_01, VCR_01b | `P-SHORT` | S/R |
| `PP_WS_SM_Validity_003` | A credential valid for more than 24 h carries a status reference. | `SCN-I` | CONF | VCR_01, VCR_01b, VCR_02 | | S/R |
| `PP_WS_SM_Validity_004` | The validity period matches what the ICS declares for the configuration. | Compare | CONF | ISSU_38 | | S/O |

##### PP_WS_SM_Revocation (`SCN-L`, `P-REV`, `P-HOOK`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SM_Revocation_001` | SD-JWT VC carries `status.status_list` with `idx` and an https `uri` that resolves to a Status List Token of the SUT. | `SCN-I`, fetch | CONF | VCR_11a; Token Status List §6.2 | `SD` | S/R |
| `PP_WS_SM_Revocation_002` | mdoc carries an MSO status element pointing to a status list or identifier list of the SUT. | `SCN-I`, fetch | CONF | VCR_11; ISO/IEC 18013-5 second edition | `MD` | S/R |
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
| `PP_WS_SM_Unlinkability_002` | Status indices are not assigned sequentially or in another predictable order. | 20 issuances; test for monotonic or consecutive runs | CONF | VCR_17 | `P-REV` | S/R |
| `PP_WS_SM_Unlinkability_003` | Timestamps (`iat`, `nbf`, `exp`, MSO `signed`, `validFrom`, `validUntil`) do not reveal batch membership: two batches issued to `CW-1` and `CW-2` in the same window share them at the declared precision. | Two batches within ICS-16 precision | CONF | ISSU_36 | `P-BATCH` | S/R |
| `PP_WS_SM_Unlinkability_004` | Credentials of one batch are spread over the status list, not on adjacent indices. | Batch of N | CONF | VCR_17; ISSU_36 | `P-BATCH` | S/O |
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
| `PP_WS_DM_PidSdJwt_006` | Type Metadata for `vct` is retrievable and, if `vct#integrity` is present, matches. | Fetch | CONF or INFO | SD-JWT VC §6 | `SD` | G/O |

##### PP_WS_DM_PidMdoc

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_DM_PidMdoc_001` | Doctype and namespace are `eu.europa.ec.eudi.pid.1`; domestic attributes are only in a domestic namespace. | `SCN-I` | CONF | PID_04, PID_05, PID_06 | `MD` | S/R |
| `PP_WS_DM_PidMdoc_002` | All mandatory attributes and metadata of PID Rulebook §4.2 are present as issuer-signed items with the CBOR types of its tables (for example `full-date` tag 1004). | `SCN-I` | CONF | PID_08, PID_09, PID_10 | `MD` | S/R |
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
| `PP_WS_SH_Encoding_002_UF` | Oversized requests and deeply nested JSON are rejected; the SUT stays available. | 10 MB body; nesting depth 10 000 | REJ | OWASP API4 | | G/R |
| `PP_WS_SH_Encoding_003_UF` | `jku`, `x5u` or a `kid` URL in a proof, WIA or KA header is not dereferenced. | Header pointing to the TSP | REJ, NOFETCH | RFC 8725 §3.10 | | G/R |
| `PP_WS_SH_Encoding_004_UF` | A status `uri` in a WIA or KA that fails signature validation is not fetched; a validly signed status `uri` pointing to a private address is not fetched. | WIA by `CA-X` with `uri` = TSP; `uri` = `http://169.254.169.254/…` | REJ, NOFETCH | Token Status List §6.2, §11.4; OWASP SSRF | | G/R |
| `PP_WS_SH_Encoding_005_UF` | A WIA or KA status list that is a decompression bomb is refused without exhausting resources. | `lst` inflating to 1 GB | REJ, SUT stays available | Token Status List §11.1 | | G/R |

##### PP_WS_SH_Encryption (`P-ENC`)

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_WS_SH_Encryption_001` | With `credential_response_encryption`, the response is a JWE to the wallet's key with an advertised `alg` and `enc`. | `SCN-I` with encryption | ISS | OpenID4VCI §8.2, §8.3 | | G/O |
| `PP_WS_SH_Encryption_002_UF` | An `alg` or `enc` not in the metadata is rejected. | `RSA-OAEP-256`; `A128CBC-HS256` | REJ:invalid_encryption_parameters | OpenID4VCI §8.3.1.2 | | G/O |
| `PP_WS_SH_Encryption_003_UF` | A JWK for encryption on an invalid curve point is rejected. | Off-curve point | REJ | RFC 8725 §3.4 | | G/O |

### 5.2 Class PP_RP: PID Provider ↔ Relying Party (published status information, `SCN-P`)

These objectives check what the RP catalogue's `RP_PP_*` tests assume the Provider gets right.

##### PP_RP_IA_Supportive

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_RP_IA_Supportive_001` | The status list is served without authentication, over https, with `Content-Type` `application/statuslist+jwt` or `+cwt` per `Accept`. | Anonymous GET with each `Accept` | CONF | VCR_16; Token Status List §8.1 | | S/R |
| `PP_RP_IA_Supportive_002` | The response sets cache headers consistent with `ttl` and `exp`. | Inspect | CONF | Token Status List §8.1, §13.7 | | G/O |
| `PP_RP_IA_Supportive_003` | The status endpoint does not require or log anything that identifies the requester beyond the HTTP request itself (no tracking parameters, no per-credential URLs). | Inspect URIs of 20 credentials | CONF | VCR_18 note; Token Status List §12.3 | | S/R |

##### PP_RP_SM_Revocation

| ID | Objective | Stimulus | Expected | References | Var | Rel |
| --- | --- | --- | --- | --- | --- | --- |
| `PP_RP_SM_Revocation_001` | The Status List Token has the correct `typ`, `sub` equal to the credential's status `uri`, `iat`, a future `exp`, and `ttl`. | Fetch | CONF | Token Status List §5.1, §5.2 | `SD`, `MD` | G/R |
| `PP_RP_SM_Revocation_002` | It is signed under the SUT's revocation anchor in its list (or under the issuance CA that the list carries under both services). | Validate with §3.2 | CONF | PPNot_03a; PuBPNot_05; RP catalogue decision 3 | | S/R |
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
| `PP_Inf_SM_TrustMechanisms_004_UF` | A `TL-WP` with an invalid seal, or sealed by an untrusted scheme operator, is not used; the previous list stays in force. | Corrupt seal; `CA-X` seal, with `WP-A` removed in it | ISS (old list still applies) | ETSI TS 119 602; WPNot_04 | | S/R |
| `PP_Inf_SM_TrustMechanisms_005_UF` | A `TL-WP` older than the one in use (rollback) is not used. | Serve the previous sequence number, with `WP-W` granted | REJ for `WP-W` | ETSI TS 119 602 | | S/R |
| `PP_Inf_SM_TrustMechanisms_006_UF` | A `TL-WP` past its `NextUpdate` with no newer list is handled per the declared grace period. | Stale list | POLICY (ICS-15) | ETSI TS 119 602 | | S/O |
| `PP_Inf_SM_TrustMechanisms_007` | Every credential, status list and the access certificate validate under the anchors published for the SUT, for the right service (issuance, revocation, access). | Validate with §3.2 | CONF | PPNot_03, PPNot_03a, PPNot_04; PuBPNot_04, PuBPNot_05; RPACANot_03, RPACANot_03a | | S/R |
| `PP_Inf_SM_TrustMechanisms_008` | The SUT sends no request to `TL-WP` or the TSP that carries data about the User or the transaction. | Inspect `OBS-NET` | CONF | VCR_16 analogue; ISSU_35b | | S/R |

### 5.4 Class AP: Attestation Provider specifics

Every `PP_*` objective not marked **PID only** applies to `AP_*` with the same number and the category variants `Q`, `PB`, `E`. For non-qualified EAAs, which revocation method and which anchor apply follow the rulebook (VCR_02, ARB_26). The objectives below apply to Attestation Providers only.

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
| `AP_WS_SM_Revocation_100` | Revocation chaining follows the published policy: revoked within `T_chain` if it chains, unchanged if it does not. | TWP revokes Wallet Instance | POLICY (ICS-07) | WURevocation_19; VCR_07d | `P-CHAIN` | S/O |
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

Not mapped yet. Candidates, to be matched against the module list of the suite version the FCAF pins: `MS_Metadata_001`, `_010`, `_011`; `MS_Offer_001`–`_003`; `MS_CredentialEndpoint_001`, `_003`; `IA_MainInteraction_001` (without the EUDI trust setup); `IA_PreAuthorized_001_UF`; `IA_AuthorizationCode_001_UF`–`_005_UF`; `SM_ProofOfPossession_001_UF`–`_006_UF`; `SM_TokenBinding_002_UF`–`_005_UF`. As for the RP catalogue, the suite would be an optional execution vehicle; the catalogue adds the Wallet Provider trust setup, WIA and KA, and the category variants.

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
- **Section references.** OpenID4VCI 1.0 section and appendix numbers follow the ARF's references (§12.2.3, App. D.2, App. E, App. F.4); HAIP references are to its Sections 4 and 6 without subsections. Both need checking against the versions the FCAF pins before the test case phase.
- **TS3.** The WIA and KA structure (revocation maintenance period, status reference) follows TS3 at the ARF commit above; names of claims are deliberately not fixed here.
- **ISO/IEC 18013-5 second edition** is a draft; the `MD` status and identifier list objectives follow it.
- **DC API issuance** (ISSU_03) enters once its specification exists; the RP harness's DC API shim could then be reused.

## 9. Next steps

1. Done (2026-11-17): decisions on §8.1.
2. Done (2026-11-18): [issuer-harness-design.md](issuer-harness-design.md). The harness design addendum. What the RP harness already has: the test PKI and trust lists (`forge`, `trust-infrastructure`), status list serving and faults (`status-provider`), the reference validator (becomes the checker of `OBS-CRED`), the reference RP (for `PP_RP_SM_Revocation_008`), the controller, verdict model, ICS, JUnit and known findings, and `fcaf-render`. What is new: an OpenID4VCI client with fault injection (WIA and PoP, DPoP, PAR and PKCE, proofs, KA, batch), the Test Wallet Provider (WIA and KA issuance and revocation), an `IssuerAdapter` interface (`setUp`, `createOffer`, `authenticateSubject`, `revoke`, `suspend`, `changeSubject`, `describe`), a Test Registrar for SUT enrolment, and the polling of `OBS-SL`.
3. Self-validation against EUDIPLO as the reference issuer: every executable test case passes against a pinned EUDIPLO release, or is marked not validated with the reason (issuer harness design §5.5 and §12, decision 2). There is no reference issuer of the harness's own.
4. First executable baseline: `IA_MainInteraction`, `SM_ClientAttestation`, `SM_KeyAttestation`, `SM_ProofOfPossession`, `SM_Validity`, `SM_Revocation_001`–`_003`, `DM_PidSdJwt`, `DM_PidMdoc`, `PP_RP_SM_Revocation`. EUDIPLO, through its issuer API in the same Compose setup as the RP adapter, is both the reference and the first SUT.
