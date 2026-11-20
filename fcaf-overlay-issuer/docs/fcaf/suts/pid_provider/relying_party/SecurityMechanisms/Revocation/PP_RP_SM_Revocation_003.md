# PP_RP_SM_Revocation_003

## Objective

`bits` of the Status List Token is 1, 2, 4 or 8, and `lst` is valid compressed data whose size covers the entries the list declares, including the credential's index.

## References

- [TokenStatusList] section 4.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness fetches the status list the credential of step 1 references, anonymously (no `Authorization` header, no cookie), with `Accept` `application/statuslist+jwt`, and once with the `Accept` of each format the ICS declares (ICS-05).

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The list decodes as Token Status List section 4.1 defines it. The named checks pass: `status-list-decoding` (`bits` is 1, 2, 4 or 8; `lst` is valid ZLIB data); `status-index` (the credential's `idx` lies within the decoded entries); `status` (the credential is valid, `0x00`).

## Comments

Token Status List declares the number of entries only through the size of `lst`: it must hold a whole number of entries of `bits` each, and the credential's `idx` must be one of them.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
