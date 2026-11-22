# AP_WS_IA_Reissuance_002_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects a refresh token presented by another Wallet Unit than the one it was issued to.
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects a refresh token presented by another Wallet Unit than the one it was issued to.
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects a refresh token presented by another Wallet Unit than the one it was issued to.

## References

- [ARF] Annex 2, ISSU_65
- [RFC 6749] sections 6 and 10.4
- [RFC 9449] section 5

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
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the token response carries a refresh token.
2. `CW-2` sends a token request with `grant_type` `refresh_token` and the refresh token `CW-1` received in step 1, with its own client authentication: its `client_id`, its WIA and a fresh PoP, and a DPoP proof of a DPoP key of its own.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The Wallet Unit authenticates with its WIA (a confidential client), so RFC 9449 section 5 does not bind its refresh token to the DPoP key: "Refresh tokens issued to confidential clients ... are not bound to the DPoP proof public key", they are bound to the client (RFC 6749 sections 6 and 10.4). The test therefore presents the refresh token as another client, `CW-2`, as the catalogue words the stimulus; a refresh with the same client and a new DPoP key is not a fault (spec review 2026-11-20, issuer catalogue section 8.3).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REISS`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REISS`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REISS`).
