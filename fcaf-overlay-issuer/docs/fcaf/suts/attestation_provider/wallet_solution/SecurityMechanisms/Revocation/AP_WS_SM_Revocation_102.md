# AP_WS_SM_Revocation_102

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider revokes the attestations issued under an embedded disclosure policy within `T_rev` when that policy changes.
- `SD+PA+PB`: Verify that the PuB-EAA Provider revokes the attestations issued under an embedded disclosure policy within `T_rev` when that policy changes.
- `SD+PA+E`: Verify that the non-qualified EAA Provider revokes the attestations issued under an embedded disclosure policy within `T_rev` when that policy changes.

## References

- [ARF] Annex 2, EDP_11
- [TokenStatusList] section 7.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Embedded disclosure policies per configuration (EDP_09)
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration with an embedded disclosure policy that only this test case issues from (`ICS-19.EDP.SD`), pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid.
2. The adapter changes the embedded disclosure policy of the configuration of step 1 (`changeDisclosurePolicy`) and reports when the Provider has done so (`OBS-ADM`).
3. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the reported change of the policy, keeping every version with its `iat`, `exp` and the credential's status.

## Expected results

1. The Provider issues the attestation (HTTP 200) in SD-JWT VC format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The time the adapter reports is recorded; the window of the next step counts from it.
3. No later than `T_rev` after the reported change of the policy, a version of the list shows the credential's entry as `0x01` (INVALID), and every later version polled shows it as `0x01` too.

## Comments

Long running: the steps that wait run after the other test cases, in parallel (issuer harness design section 6.3).

The configuration of `ICS-19.EDP.SD` is one no other test case issues from: a Provider that meets EDP_11 revokes every attestation issued under the old policy, which would revoke the attestations of test cases running at the same time.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-EDP`, `P-REV`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-EDP`, `P-REV`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-EDP`, `P-REV`).
