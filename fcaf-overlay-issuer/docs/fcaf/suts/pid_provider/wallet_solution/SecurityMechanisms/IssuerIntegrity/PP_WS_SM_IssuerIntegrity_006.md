# PP_WS_SM_IssuerIntegrity_006

## Objective

- `SD+PA`: Verify that every disclosure salt of the SD-JWT VC PID has at least 128 bits and is unique within the credential.
- `MD+PA`: Verify that the `random` of every IssuerSignedItem of the mdoc PID has at least 16 bytes and is unique within the credential.

## References

- [ARF] Annex 2, ISSU_35 (a)
- [RFC9901] section 9.3
- [ISO/IEC 18013-5] section 9.1.2.5

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
    - `SD+PA`: The salts are long and unique enough that no disclosure can be guessed. The named checks pass: `salt-entropy` (every disclosure salt, or mdoc `random`, has at least 128 bits, and none repeats within the credential).
    - `MD+PA`: The `random` values are long and unique enough that no element can be guessed from its digest. The named checks pass: `salt-entropy` (every disclosure salt, or mdoc `random`, has at least 128 bits, and none repeats within the credential).

## Comments

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

OIDF `happy-flow` and `batch-issuance` cover this objective partly (issuer catalogue section 7).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`).
