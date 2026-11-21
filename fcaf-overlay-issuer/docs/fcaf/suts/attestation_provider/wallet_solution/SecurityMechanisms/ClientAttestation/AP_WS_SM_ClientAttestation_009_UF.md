# AP_WS_SM_ClientAttestation_009_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects a PoP with a wrong `aud` or a stale `iat` at the token endpoint in the pre-authorized code flow, and record whether it detects a `jti` it has seen before.
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects a PoP with a wrong `aud` or a stale `iat` at the token endpoint in the pre-authorized code flow, and record whether it detects a `jti` it has seen before.
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects a PoP with a wrong `aud` or a stale `iat` at the token endpoint in the pre-authorized code flow, and record whether it detects a `jti` it has seen before.

## References

- [Attestation-Based Client Auth] sections 4 and 5
- [Attestation-Based Client Auth] section 12.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Attestation-Based Client Authentication

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid (its PoP `jti` is replayed in the last step).
2. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `aud` claim of its WIA's PoP is `https://other-issuer.example`.
3. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `iat` claim of its WIA's PoP is the current time minus `T_proof` minus `T_skew` minus one hour.
4. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `jti` claim of its WIA's PoP is the `jti` of the PoP of an earlier token request of the same Wallet Unit.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
4. Whether the Provider rejects the replayed PoP is recorded; HTTP 5xx fails. draft-ietf-oauth-attestation-based-client-auth-08 section 12.1: "An Authorization Server SHOULD implement measures to detect replay attacks", with a `jti` list as one RECOMMENDED option; no MUST.

## Comments

Step 4 is informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): replay detection of the Client Attestation PoP is a SHOULD, and a short `iat` window (step 3) is an alternative measure. A Provider that rejects the replay is the hardened behaviour.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
