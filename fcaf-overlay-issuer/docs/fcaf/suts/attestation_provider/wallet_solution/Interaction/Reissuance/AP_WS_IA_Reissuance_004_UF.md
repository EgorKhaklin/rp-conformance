# AP_WS_IA_Reissuance_004_UF

## Objective

Record whether, after the attestation was revoked, the refresh token still gives a credential.

## References

- [ARF] Annex 2, VCR_04, ISSU_65

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Re-issuance with a device-bound refresh token (ISSU_63, ISSU_65)
- Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3)

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the token response carries a refresh token.
2. The adapter revokes the credential of step 1 (`setStatus` revoked).
3. `CW-1` sends a token request with `grant_type` `refresh_token` and the refresh token of step 1, its WIA and a fresh PoP, and a DPoP proof of its original DPoP key; then a nonce request and a credential request with the new access token and a key proof of a fresh attested key.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The adapter reports the revocation.
3. Whether the Provider refuses the refresh or issues a new credential is recorded; HTTP 5xx fails. VCR_04 forbids reversing a revocation of the attestation; whether a revoked attestation may be replaced through its refresh token is not specified.

## Comments

Informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): VCR_04 ("SHALL NOT reverse the revocation") does not cover a new credential obtained with the refresh token, and ISSU_65 is about the Wallet Unit, not the revoked attestation. Refusing the refresh after a revocation is a design choice of the Provider; a later catalogue may make it a `POLICY` with an ICS item.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REISS`, `P-HOOK`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REISS`, `P-HOOK`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REISS`, `P-HOOK`).
