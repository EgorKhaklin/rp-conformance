# AP_WS_IA_Reissuance_003

## Objective

Verify that a re-issued credential has the same attributes, new unique elements (salts, status index, key) and a new validity period.

## References

- [ARF] Annex 2, ISSU_35, ISSU_59, ISSU_63

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Re-issuance with a device-bound refresh token (ISSU_63, ISSU_65)

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the token response carries a refresh token.
2. `CW-1` sends a token request with `grant_type` `refresh_token` and the refresh token of step 1, its WIA and a fresh PoP, and a DPoP proof of its original DPoP key; then a nonce request and a credential request with the new access token and a key proof of a fresh attested key.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. Compared with the credential of step 1, the new credential states the same claims about `SUBJ-1`, shares no disclosure salt, has another status list index, is bound to the new key, and has a later `iat` and `exp`; equal ones pass only when both fall within the timestamp precision the Provider declares (ICS-16).
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. Compared with the credential of step 1, the new credential states the same claims about `SUBJ-1`, shares no disclosure salt, has another status list index, is bound to the new key, and has a later `iat` and `exp`; equal ones pass only when both fall within the timestamp precision the Provider declares (ICS-16).
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. Compared with the credential of step 1, the new credential states the same claims about `SUBJ-1`, shares no disclosure salt, has another status list index, is bound to the new key, and has a later `iat` and `exp`; equal ones pass only when both fall within the timestamp precision the Provider declares (ICS-16).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REISS`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REISS`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REISS`).
