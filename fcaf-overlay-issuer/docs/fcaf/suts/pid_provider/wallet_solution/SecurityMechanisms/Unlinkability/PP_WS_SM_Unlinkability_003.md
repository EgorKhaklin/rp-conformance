# PP_WS_SM_Unlinkability_003

## Objective

- `SD+PA`: Verify that the timestamps of the SD-JWT VC PID (`iat`, `nbf`, `exp`) do not reveal batch membership: two batches issued to `CW-1` and `CW-2` within the declared precision share them.
- `MD+PA`: Verify that the timestamps of the mdoc PID (MSO `signed`, `validFrom`, `validUntil`) do not reveal batch membership: two batches issued to `CW-1` and `CW-2` within the declared precision share them.

## References

- [ARF] Annex 2, ISSU_36

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Batch issuance and `batch_size`; `credential_reuse_policy` methods

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. Wallet Unit `CW-2` of `WP-A` (section 3.4).
6. The Provider issues in batches (ICS-08, `P-BATCH`) of at least 2 and declares its timestamp precision (ICS-16).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
2. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-2` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-2` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
3. The harness compares the credentials of steps 1 to 2.

## Expected results

1. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. At the timestamp precision the Provider declares (ICS-16), the timestamps of both batches are equal. The named checks pass: `batch-timestamps` (the credentials of batches received in one window of the declared precision (ICS-16) carry the same `iat`, `nbf`, `exp`, or MSO `signed`, `validFrom`, `validUntil`, at that precision).

## Comments

Execute this test case once for each format the Provider issues and each grant it declares in its ICS (ICS-02, ICS-03).

OIDF `batch-issuance` covers this objective partly (issuer catalogue section 7).

Batches received in different precision windows are compared only within their window.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-BATCH`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-BATCH`).
