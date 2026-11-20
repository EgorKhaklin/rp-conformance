# AP_RP_SM_Revocation_008

## Objective

Verify that the Provider's revocation anchor and the signer it uses pass the reference Relying Party's checks: the reference Relying Party accepts a fresh attestation the Provider issued and rejects it once the Provider has revoked it.

## References

- [ARF] Annex 2, VCR_11, VCR_11a
- [RP catalogue] `RP_WS_SM_Revocation`

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported
- Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3)

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The adapter can revoke an issued credential (ICS-06, `P-HOOK`).
6. The reference Relying Party trusts the list of its category as published after enrolment, and `TL-AC` for its own access certificate.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The reference Relying Party starts a presentation of `default_query_pid` over redirects; the Conformance Wallet presents the credential of step 1 with a KB-JWT signed with the key of its proof.
3. The adapter revokes the credential of step 1 (`setStatus` revoked) and reports when the Provider has done so (`OBS-ADM`).
4. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the time the adapter reported, keeping every version with its `iat`, `exp` and the credential's status.
5. The reference Relying Party starts a new presentation of `default_query_pid`; the Conformance Wallet presents the credential of step 1 again.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The reference Relying Party accepts the presentation: every credential and status list check passes, the status is `0x00`.
3. The time the adapter reports is recorded; the window of the next step counts from it.
4. No later than `T_rev` after the reported revocation, a version of the list shows the credential's entry as `0x01` (INVALID), and every later version polled shows it as `0x01` too.
5. The reference Relying Party rejects the presentation, and the check that fails is `status`: the list shows the credential revoked; every other check passes.

## Comments

Long running: step 4 waits `T_rev`; the test case runs after the others.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REV`, `P-HOOK`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REV`, `P-HOOK`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REV`, `P-HOOK`).
