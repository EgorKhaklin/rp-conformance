# PP_WS_IA_Reissuance_004_UF

## Objective

Verify that after the PID was revoked, the refresh token no longer gives a credential.

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the token response carries a refresh token.
2. The adapter revokes the credential of step 1 (`setStatus` revoked).
3. `CW-1` sends a token request with `grant_type` `refresh_token` and the refresh token of step 1, its WIA and a fresh PoP, and a DPoP proof of its original DPoP key; then a nonce request and a credential request with the new access token and a key proof of a fresh attested key.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The adapter reports the revocation.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The catalogue accepts REJ or the policy of the Provider; no ICS item declares such a policy, so the suite expects REJ.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REISS`, `P-HOOK`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
