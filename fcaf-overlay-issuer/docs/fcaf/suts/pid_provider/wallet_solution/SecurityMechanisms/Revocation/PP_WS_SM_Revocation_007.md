# PP_WS_SM_Revocation_007

## Objective

- `SD+PA`: Verify revocation chaining: when the Test Wallet Provider revokes the WSCD of `CW-1` in `SL-WP-A` (the KA status), the PID in SD-JWT VC format issued to it is revoked within `T_chain`.
- `MD+PA`: Verify revocation chaining: when the Test Wallet Provider revokes the WSCD of `CW-1` in `SL-WP-A` (the KA status), the PID in mdoc format issued to it is revoked within `T_chain`.

## References

- [ARF] Annex 2, WURevocation_18
- [ARF] Annex 2, WUA_29
- [TS3] section 2.5

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported
- Revocation chaining: time limit `T_chain` within which a revoked Wallet Instance or WSCD leads to a revoked PID (WURevocation_18, mandatory for PID Providers; declared, at most 24 h, decision 3). For Attestation Providers whether they chain (WURevocation_19).

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

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
5. The Provider is a PID Provider and chains revocation (ICS-07, `P-CHAIN`, mandatory for PID Providers); `T_chain` is declared, at most 24 hours (decision 3).

## Test Scenario

1. The Test Wallet Provider serves `SL-WP-A` for this test case under a URL of its own, every entry valid, and the KA of `CW-1` in the following steps refers to it with the unit's WSCD entry (a Provider may keep a fetched list for its `ttl`, so a shared list could mask the change).
2. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the KA refers to the list of step 1).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the KA refers to the list of step 1).
3. The harness polls the status list of the credential of step 2 anonymously once, before the revocation, keeping every version.
4. The Test Wallet Provider revokes the WSCD of `CW-1`: it serves a new version of the list of step 1, under the same URL, with the unit's WSCD entry `0x01` (INVALID) and every other entry unchanged.
5. The harness polls the status list of the credential of step 2 anonymously every `min(T_chain / 20, 30 s)` until `T_chain` (ICS-07) after the revocation of the WSCD, keeping every version with its `iat`, `exp` and the credential's status.

## Expected results

1. What the Test Wallet Provider served, and when, is recorded.
2. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. Every version polled shows the entry as `0x00` (VALID).
4. What the Test Wallet Provider served, and when, is recorded.
5. No later than `T_chain` after the revocation of the WSCD, a version of the list shows the credential's entry as `0x01` (INVALID), and every later version polled shows it as `0x01` too.

## Comments

Long running: the steps that wait run after the other test cases, in parallel (issuer harness design section 6.3). The nightly job runs with declared values of minutes (decision 3).

The WIA and KA carry their status as TS3 defines it: `client_status.status.status_list` (WIA) and `key_storage_status.status.status_list` (KA).

**PID only** (catalogue): an Attestation Provider declares whether it chains (WURevocation_19).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`, `P-CHAIN`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-REV`, `P-CHAIN`).
