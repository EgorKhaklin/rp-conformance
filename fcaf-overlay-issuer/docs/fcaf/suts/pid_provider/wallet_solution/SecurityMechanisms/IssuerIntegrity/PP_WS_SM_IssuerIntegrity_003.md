# PP_WS_SM_IssuerIntegrity_003

## Objective

- `SD+PA`: Verify that the certificate that signs the SD-JWT VC PID follows the ETSI TS 119 412-6 profile of the Provider's category.
- `MD+PA`: Verify that the certificate that signs the mdoc PID follows the ETSI TS 119 412-6 profile of the Provider's category.

## References

- [ARF] Annex 2, ISSU_68, ISSU_70, ISSU_71, ISSU_73
- [ETSI TS 119 412-6]

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. Per variant:
    - `SD+PA`: The harness inspects the SD-JWT VC credential of step 1.
    - `MD+PA`: The harness inspects the mdoc credential of step 1.

## Expected results

1. Per variant:
    - `SD+PA`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `SD+PA`: The SD-JWT VC signer certificate is the one the Test Registrar enrolled in the profile of a PID Provider. The named checks pass: `signer-profile` (the signer certificate is one the Test Registrar enrolled for the Provider in the ETSI TS 119 412-6 profile: end-entity, `keyUsage` `digitalSignature` without certificate or CRL signing, subject with country, organisation and common name, an authority key identifier, valid now; for mdoc the document signer extended key usage `1.0.18013.5.1.2`).
    - `MD+PA`: The mdoc signer certificate is the one the Test Registrar enrolled in the profile of a PID Provider. The named checks pass: `signer-profile` (the signer certificate is one the Test Registrar enrolled for the Provider in the ETSI TS 119 412-6 profile: end-entity, `keyUsage` `digitalSignature` without certificate or CRL signing, subject with country, organisation and common name, an authority key identifier, valid now; for mdoc the document signer extended key usage `1.0.18013.5.1.2`).

## Comments

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`).
