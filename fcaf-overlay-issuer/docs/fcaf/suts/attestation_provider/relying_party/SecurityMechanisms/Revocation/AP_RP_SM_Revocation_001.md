# AP_RP_SM_Revocation_001

## Objective

- `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: Verify that the Status List Token the SD-JWT VC attestation references has the correct `typ`, `sub` equal to the credential's status `uri`, `iat`, an `exp` in the future and `ttl`.
- `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: Verify that the Status List Token the mdoc attestation references has the correct `typ`, `sub` equal to the credential's status `uri`, `iat`, an `exp` in the future and `ttl`.

## References

- [TokenStatusList] sections 5.1 and 5.2

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
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The harness fetches the status list the credential of step 1 references, anonymously (no `Authorization` header, no cookie), with `Accept` `application/statuslist+jwt`, and once with the `Accept` of each format the ICS declares (ICS-05).
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The harness fetches the status list the credential of step 1 references, anonymously (no `Authorization` header, no cookie), with `Accept` `application/statuslist+cwt`, and once with the `Accept` of each format the ICS declares (ICS-05).

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+Q`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+PB`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+E`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The Status List Token in JWT (`application/statuslist+jwt`) carries the claims Token Status List requires and recommends. The named checks pass: `status-list-type` (`typ` `statuslist+jwt`, or `application/statuslist+cwt`); `status-list-claims` (`sub`, `iat`, `status_list` with `bits` and `lst`); `status-list-subject` (`sub` equals the credential's status `uri`); `status-list-validity` (`exp` not passed); `sl-lifetime` (`iat`, `exp` and `ttl` present; `exp` after `iat` and in the future; `ttl` positive).
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The Status List Token in CWT (`application/statuslist+cwt`) carries the claims Token Status List requires and recommends. The named checks pass: `status-list-type` (`typ` `statuslist+jwt`, or `application/statuslist+cwt`); `status-list-claims` (`sub`, `iat`, `status_list` with `bits` and `lst`); `status-list-subject` (`sub` equals the credential's status `uri`); `status-list-validity` (`exp` not passed); `sl-lifetime` (`iat`, `exp` and `ttl` present; `exp` after `iat` and in the future; `ttl` positive).

## Comments

`ttl` and `exp` are RECOMMENDED by Token Status List; the catalogue requires both, since `AP_RP_SM_Revocation_005` and `AP_RP_IA_Supportive_002` rely on them.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REV`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`, `P-REV`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REV`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`, `P-REV`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REV`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`, `P-REV`).
