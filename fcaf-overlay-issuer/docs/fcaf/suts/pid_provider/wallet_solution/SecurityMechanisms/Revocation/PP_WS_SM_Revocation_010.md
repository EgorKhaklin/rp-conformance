# PP_WS_SM_Revocation_010

## Objective

- `SD+PA`: Verify that unrelated events, a failed issuance and an outage of the WIA status list, do not revoke an issued SD-JWT VC PID.
- `MD+PA`: Verify that unrelated events, a failed issuance and an outage of the WIA status list, do not revoke an issued mdoc PID.

## References

- [ARF] Annex 2, PAD_03
- [ARF] Annex 2, VCR_05

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

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
5. `T_chain` is declared (ICS-07): a Provider that chains revocation reads the WIA status within it.

## Test Scenario

1. The Test Wallet Provider serves `SL-WP-A` for this test case under a URL of its own, every entry valid, and the WIA of `CW-1` in the following steps refers to it with the unit's Wallet Instance entry (a Provider may keep a fetched list for its `ttl`, so a shared list could mask the change).
2. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the WIA refers to the list of step 1).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the WIA refers to the list of step 1).
3. Per variant:
    - `SD+PA`: A failed issuance: the adapter creates a credential offer for `SUBJ-1`, PID configuration in SD-JWT VC format; `CW-1` runs `SCN-I` with one bit of the signature of its proof flipped (`proof.signature-bitflip`).
    - `MD+PA`: A failed issuance: the adapter creates a credential offer for `SUBJ-1`, PID configuration in mdoc format; `CW-1` runs `SCN-I` with one bit of the signature of its proof flipped (`proof.signature-bitflip`).
4. An outage of the WIA status list: the URL of the list of step 1 answers HTTP 503 without a token from now on.
5. The harness polls the status list of the credential of step 2 anonymously every `min(T_chain / 20, 30 s)` until `T_chain` (ICS-07) after the outage began, keeping every version.

## Expected results

1. What the Test Wallet Provider served, and when, is recorded.
2. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
4. What the Test Wallet Provider served, and when, is recorded.
5. Every version polled shows the entry as `0x00` (VALID).

## Comments

Long running: the steps that wait run after the other test cases, in parallel (issuer harness design section 6.3). The nightly job runs with declared values of minutes (decision 3).

The notification `credential_deleted` (the third event of the catalogue) needs the notification step of issue 25 (`PP_WS_IA_Notification`); it is added to this test case when that step is on `main`.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-REV`).
