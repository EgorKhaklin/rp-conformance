# PP_WS_SM_KeyAttestation_007_UF

## Objective

Verify that the PID Provider, which offers a nonce endpoint, rejects a KA whose `nonce` is a `c_nonce` of another session, and a KA without `nonce`, in the `key_attestation` header and as the `attestation` proof type, at the credential endpoint in the pre-authorized code flow.

## References

- [ARF] Annex 2, WUA_10b
- [OpenID4VCI] Appendix D.1 and F.3

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- DPoP server nonce used; nonce endpoint offered

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

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

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-2` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid (its `c_nonce` is the nonce of another session in the next step).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid (the KA carries the `c_nonce` of this request in its `nonce` claim).
3. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA carries a `nonce` claim set to a `c_nonce` the SUT issued to another session.
4. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA carries no `nonce` claim, while the SUT requires the `c_nonce` in it.
5. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its KA carries no `nonce` claim, while the SUT requires the `c_nonce` in it.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_nonce` or `invalid_proof`; never HTTP 5xx.
4. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_nonce` or `invalid_proof`; never HTTP 5xx.
5. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_nonce` or `invalid_proof`; never HTTP 5xx.

## Comments

A Provider with a nonce endpoint requires the `c_nonce` in the KA both in the `key_attestation` header of a `jwt` proof (OpenID4VCI 1.0 Appendix F.1: "the `nonce` claim in the key attestation MUST be set to a server-provided `c_nonce`") and as the `attestation` proof type (Appendix F.3). The step without `nonce` is run in both proof types; the last one sends the KA as the only proof, of proof type `attestation`.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-DPN`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
