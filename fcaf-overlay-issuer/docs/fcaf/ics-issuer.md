# Provider Implementation Conformance Statement (ICS)

This is the Implementation Conformance Statement (ICS) form for PID Providers and Attestation Providers under test. It follows the same approach as the [Wallet ICS](ics.md) and the [Relying Party ICS](ics-rp.md): before testing starts, the implementer answers every item, and test selection compares the `Profile applicability` conditions of each test case with the profiles the answers put the Provider in.

The `Profile applicability` of a test case names the item whose answer selects it. The profile it needs is in the test case's comments, with each variant: for example `P-SD` for a Provider that issues SD-JWT VC, `P-AC` for one that offers the authorization code flow. Items without profiles declare values the test cases use, such as time limits; items marked as deciding `POLICY` expected results declare the behaviour the Provider follows where specifications leave a choice.

Items with the ID `N/A` are surrogate ICS items that select test cases through the Technology section.

## Provider

| ID | ICS item | Profiles | EUDI specifics |
| --- | --- | --- | --- |
| ICS-01 | Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks) | `P-PID`, `P-Q`, `P-PB`, `P-E` |  |
| ICS-02 | Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02). | `P-SD`, `P-MD` |  |
| ICS-03 | Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject. | `P-PA`, `P-AC` |  |
| ICS-04 | Device binding per configuration. PIDs are always device-bound (ISSU_17). | `P-DB`, `P-NDB` |  |
| ICS-05 | Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported | `P-REV`, `P-SHORT`, `P-IL`, `P-SUSP` |  |
| ICS-06 | Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3) | `P-HOOK` |  |
| ICS-07 | Revocation chaining: time limit `T_chain` within which a revoked Wallet Instance or WSCD leads to a revoked PID (WURevocation_18, mandatory for PID Providers; declared, at most 24 h, decision 3). For Attestation Providers whether they chain (WURevocation_19). | `P-CHAIN` | Decides the `POLICY` expected results. |
| ICS-08 | Batch issuance and `batch_size`; `credential_reuse_policy` methods | `P-BATCH` |  |
| ICS-09 | Re-issuance with a device-bound refresh token (ISSU_63, ISSU_65) | `P-REISS` |  |
| ICS-10 | Deferred issuance | `P-DEF` |  |
| ICS-11 | Notification endpoint | `P-NOT` |  |
| ICS-12 | Credential request and response encryption | `P-ENC` |  |
| ICS-13 | DPoP server nonce used; nonce endpoint offered | `P-DPN` |  |
| ICS-14 | `T_proof`, `T_skew` (each at most 5 minutes), lifetime of pre-authorized codes, `c_nonce` and access tokens | Declared values |  |
| ICS-15 | `T_refresh` for `TL-WP` and the grace period after its `NextUpdate` | Declared values | Decides the `POLICY` expected results. |
| ICS-16 | Minimum number of entries per status list (herd privacy, VCR_18), at least 10 000 (decision 4); declared timestamp precision for batch issuance (ISSU_36) | Declared values |  |
| ICS-17 | Whether the adapter seeds `SUBJ-1` and `SUBJ-2`, or the fixed test identities and their attribute values if it cannot (decision 5); whether the PID portrait opt-out is offered (PID_03) | Declared values |  |
| ICS-18 | Policy when the WIA or KA status cannot be obtained (status list unreachable or invalid). Attestation Providers only; PID Providers reject (decision 2). | Declared values | Decides the `POLICY` expected results. |
| ICS-19 | Embedded disclosure policies per configuration (EDP_09) | `P-EDP` |  |

## Technology

Surrogate items that select test cases through their Technology section.

| ID | ICS item | Options | EUDI specifics |
| --- | --- | --- | --- |
| N/A | OpenID4VCI | Yes/No | Every Provider; [OpenID4VCI]. |
| N/A | SD-JWT VC | Yes/No | Follows ICS-02 (`P-SD`); [SD-JWT VC]. |
| N/A | ISO/IEC 18013-5 mdoc | Yes/No | Follows ICS-02 (`P-MD`); [ISO/IEC 18013-5]. |
| N/A | HAIP | Yes/No | Every Provider; [HAIP] section 4. |
| N/A | Attestation-Based Client Authentication | Yes/No | Every Provider; Wallet Instance Attestation as client authentication, [IETF draft-attestation-based-client-auth]. |
| N/A | Token Status List | Yes/No | Follows ICS-05 (`P-REV`); [Token Status List]. |
| N/A | HTTP | Yes/No | Every Provider that publishes status lists or identifier lists. |
