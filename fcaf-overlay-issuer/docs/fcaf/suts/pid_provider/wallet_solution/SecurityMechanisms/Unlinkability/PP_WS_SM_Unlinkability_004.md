# PP_WS_SM_Unlinkability_004

## Objective

- `SD+PA`: Verify that the SD-JWT VC credentials of one batch are spread over the status list, not on adjacent indices.
- `MD+PA`: Verify that the mdoc credentials of one batch are spread over the status list, not on adjacent indices.

## References

- [ARF] Annex 2, VCR_17
- [ARF] Annex 2, ISSU_36

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Batch issuance and `batch_size`; `credential_reuse_policy` methods
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider issues in batches (ICS-08, `P-BATCH`) of at least 2.

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation, with 2 proofs over the keys of one KA (a batch of one logical PID).
2. The harness compares the credentials of steps 1 to 1.

## Expected results

1. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. No two credentials of the batch are on adjacent indices. The named checks pass: `batch-spread` (no two credentials of one batch are on adjacent indices of a status list).

## Comments

Execute this test case once for each format the Provider issues and each grant it declares in its ICS (ICS-02, ICS-03).

OIDF `batch-issuance` covers this objective partly (issuer catalogue section 7).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-BATCH`, `P-REV`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-BATCH`, `P-REV`).
