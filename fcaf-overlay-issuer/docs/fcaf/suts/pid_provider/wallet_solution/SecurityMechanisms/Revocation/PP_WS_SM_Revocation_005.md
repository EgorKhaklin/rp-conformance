# PP_WS_SM_Revocation_005

## Objective

- `SD+PA`: Verify that suspending a SD-JWT VC PID sets the suspended value in the published list, reinstating it clears it, and a revocation after the suspension is final.
- `MD+PA`: Verify that suspending a mdoc PID sets the suspended value in the published list, reinstating it clears it, and a revocation after the suspension is final.

## References

- [TokenStatusList] section 7.1
- [ARF] Annex 2, VCR_04

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported
- Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3)

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The adapter can revoke, suspend and reinstate an issued credential and report when it has done so (ICS-06, `P-HOOK`); `T_rev` is declared, at most 24 hours (decision 3).
6. The Provider supports suspension (ICS-05, `P-SUSP`): its status lists have at least 2 bits per entry.

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The adapter suspends the credential of step 1 (`setStatus` suspended) and reports when the Provider has done so (`OBS-ADM`).
3. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the reported event, keeping every version.
4. The adapter reinstates the credential of step 1 (`setStatus` valid) and reports when the Provider has done so (`OBS-ADM`).
5. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the reported event, keeping every version.
6. The adapter revokes the credential of step 1 (`setStatus` revoked) and reports when the Provider has done so (`OBS-ADM`).
7. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the reported revocation, keeping every version with its `iat`, `exp` and the credential's status.

## Expected results

1. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The time the adapter reports is recorded; the window of the next step counts from it.
3. No later than `T_rev` after the reported suspension, a version of the list shows the credential's entry as `0x02` (SUSPENDED), and every later version polled shows it as `0x02` too. The named checks pass: `sl-suspended`.
4. The time the adapter reports is recorded; the window of the next step counts from it.
5. No later than `T_rev` after the reported reinstatement, a version of the list shows the credential's entry as `0x00` (VALID) again, and every later version polled shows it as `0x00` too. The named checks pass: `sl-reinstated`.
6. The time the adapter reports is recorded; the window of the next step counts from it.
7. No later than `T_rev` after the reported revocation, a version of the list shows the credential's entry as `0x01` (INVALID), and every later version polled shows it as `0x01` too.

## Comments

Long running: the steps that wait run after the other test cases, in parallel (issuer harness design section 6.3). The nightly job runs with declared values of minutes (decision 3).

"Final" is checked over every version polled until `T_rev` has passed; `PP_TB_003` covers the policy that a revocation is never reversed.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`, `P-SUSP`, `P-HOOK`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-REV`, `P-SUSP`, `P-HOOK`).
