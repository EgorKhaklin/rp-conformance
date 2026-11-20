# AP_WS_SM_IssuerIntegrity_004

## Objective

- `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: Verify that the SD-JWT VC attestation is not signed with the access certificate, and that the access certificate's key signs no credential.
- `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: Verify that the mdoc attestation is not signed with the access certificate, and that the access certificate's key signs no credential.

## References

- [ARF] Annex 2, ISSU_22
- [ARF] Annex 2, Reg_10

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The harness inspects the SD-JWT VC credential of step 1.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The harness inspects the mdoc credential of step 1.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+Q`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+PB`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+E`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The credential signer is another certificate with another key than the access certificate the Test Registrar issued from `AC-A`. The named checks pass: `signer-not-access` (the signer certificate and its key differ from the access certificate and its key).

## Comments

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`).
