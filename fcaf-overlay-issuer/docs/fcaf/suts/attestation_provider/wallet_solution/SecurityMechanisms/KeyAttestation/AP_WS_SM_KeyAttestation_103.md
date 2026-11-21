# AP_WS_SM_KeyAttestation_103

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider still requires a valid, non-revoked WIA of a Wallet Provider on `TL-WP` for an attestation that is not device-bound: the stimuli of `AP_WS_SM_ClientAttestation_002_UF` to `_012_UF` are rejected.
- `SD+PA+PB`: Verify that the PuB-EAA Provider still requires a valid, non-revoked WIA of a Wallet Provider on `TL-WP` for an attestation that is not device-bound: the stimuli of `AP_WS_SM_ClientAttestation_002_UF` to `_012_UF` are rejected.
- `SD+PA+E`: Verify that the non-qualified EAA Provider still requires a valid, non-revoked WIA of a Wallet Provider on `TL-WP` for an attestation that is not device-bound: the stimuli of `AP_WS_SM_ClientAttestation_002_UF` to `_012_UF` are rejected.

## References

- [ARF] Annex 2, ISSU_30a, WUA_25
- [Attestation-Based Client Auth]

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Device binding per configuration. PIDs are always device-bound (ISSU_17).

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Attestation-Based Client Authentication

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`), pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request without key proof and without KA, all valid (the valid half of this test case).
2. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the token request carries neither an `OAuth-Client-Attestation` nor an `OAuth-Client-Attestation-PoP` header. (stimulus of `AP_WS_SM_ClientAttestation_002_UF`)
3. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the token request carries the WIA but no `OAuth-Client-Attestation-PoP` header. (stimulus of `AP_WS_SM_ClientAttestation_002_UF`)
4. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that one bit of the signature value of its WIA is flipped. (stimulus of `AP_WS_SM_ClientAttestation_003_UF`)
5. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA is signed by a certificate issued by `CA-X`, which no list of the suite contains. (stimulus of `AP_WS_SM_ClientAttestation_004_UF`)
6. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA is signed by a certificate under `PP-A`'s issuance CA in `TL-attestation`. (stimulus of `AP_WS_SM_ClientAttestation_004_UF`)
7. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA is signed by a certificate under the anchor of `AC-A` in `TL-AC`. (stimulus of `AP_WS_SM_ClientAttestation_004_UF`)
8. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA is signed by a certificate under the issuance anchor of the withdrawn Wallet Provider `WP-W`. (stimulus of `AP_WS_SM_ClientAttestation_005_UF`)
9. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and its WIA is signed by a certificate under `WP-A`'s KA CA, the anchor `TL-WP` lists for `WP-A`'s key attestations (ServiceName `WP-A WSCD`), not for its Wallet Solution. (stimulus of `AP_WS_SM_ClientAttestation_006_UF`)
10. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA carries an `exp` claim set to the current time minus `T_skew` minus one hour. (stimulus of `AP_WS_SM_ClientAttestation_007_UF`)
11. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA carries an `nbf` claim set to the current time plus `T_skew` plus one hour. (stimulus of `AP_WS_SM_ClientAttestation_007_UF`)
12. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its WIA's PoP is signed with a newly generated P-256 key instead of the key in the WIA's `cnf` claim. (stimulus of `AP_WS_SM_ClientAttestation_008_UF`)
13. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid (its PoP `jti` is replayed in the last step). (stimulus of `AP_WS_SM_ClientAttestation_009_UF`)
14. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `aud` claim of its WIA's PoP is `https://other-issuer.example`. (stimulus of `AP_WS_SM_ClientAttestation_009_UF`)
15. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `iat` claim of its WIA's PoP is the current time minus `T_proof` minus `T_skew` minus one hour. (stimulus of `AP_WS_SM_ClientAttestation_009_UF`)
16. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `jti` claim of its WIA's PoP is the `jti` of the PoP of an earlier token request of the same Wallet Unit. (stimulus of `AP_WS_SM_ClientAttestation_009_UF`)
17. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `sub` claim of its WIA is `other-wallet-unit`, while the token request and the PoP carry the `client_id` of the Wallet Unit. (stimulus of `AP_WS_SM_ClientAttestation_010_UF`)
18. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `typ` header of its WIA is `JWT`. (stimulus of `AP_WS_SM_ClientAttestation_011_UF`)
19. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `typ` header of its WIA's PoP is `JWT`. (stimulus of `AP_WS_SM_ClientAttestation_011_UF`)
20. The Test Wallet Provider revokes the Wallet Instance of `CW-1`: the entry of its WIA in `SL-WP-A` is set to 1 (revoked), in a new version of the list signed under the revocation anchor of `WP-A` and served under a URL of this test case, to which the status reference of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). (stimulus of `AP_WS_SM_ClientAttestation_012_UF`)
21. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`) (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; its WIA refers to the revoked entry. (stimulus of `AP_WS_SM_ClientAttestation_012_UF`)

## Expected results

1. The Provider issues the attestation (HTTP 200) in SD-JWT VC format, bound to no key (no `cnf`), as the configuration declares. It passes format, `issuer-trust` to the entity of its category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (no binding) and `status-reference`, and the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
4. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
5. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
6. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
7. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
8. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
9. Whether the Provider rejects the WIA or issues the attestation is recorded; HTTP 5xx fails. Both conform: TS3 section 2.2.1.2 requires a chain to "a trust anchor found on the Trusted List for Wallet Providers", which the KA CA of `WP-A` is.
10. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
11. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
12. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
13. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
14. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
15. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
16. Whether the Provider rejects the replayed PoP is recorded; HTTP 5xx fails. draft-ietf-oauth-attestation-based-client-auth-08 section 12.1: "An Authorization Server SHOULD implement measures to detect replay attacks", with a `jti` list as one RECOMMENDED option; no MUST.
17. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
18. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
19. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_client`; never HTTP 5xx.
20. The Test Wallet Provider serves the list; recorded in the report.
21. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The stimuli of `AP_WS_SM_ClientAttestation_012_UF` (revoked WIA) run last, since they revoke the Wallet Instance of `CW-1` for the rest of the test case.

The stimuli concern the WIA and its PoP at the token endpoint, before any credential request; where the Provider's metadata lists proof types for the configuration, the Conformance Wallet sends a key proof as the metadata asks.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-NDB`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-NDB`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-NDB`).
