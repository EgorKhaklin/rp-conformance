# PP_WS_IA_MainInteraction_001

## Objective

- `SD+PA`: Verify that the PID Provider issues the PID in SD-JWT VC format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `MD+PA`: Verify that the PID Provider issues the PID in mdoc format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `SD+AC`: Verify that the PID Provider issues the PID in SD-JWT VC format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `MD+AC`: Verify that the PID Provider issues the PID in mdoc format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.

## References

- [ARF] Annex 2, ISSU_01a, ISSU_14, ISSU_15
- [OpenID4VCI] sections 6, 7 and 8
- [HAIP] section 4

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
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code with `tx_code` unless the ICS declares offers without one. `CW-1` runs `SCN-I` without mutation: metadata, token request with WIA, PoP and DPoP proof, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code with `tx_code` unless the ICS declares offers without one. `CW-1` runs `SCN-I` without mutation: metadata, token request with WIA, PoP and DPoP proof, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code with `issuer_state`. `CW-1` runs `SCN-I` without mutation: metadata, pushed authorization request with PKCE `S256`, `authorization_details`, WIA, PoP and DPoP proof, the authorization request through the adapter (`authenticateSubject`), token request with WIA, PoP and DPoP proof and the `code_verifier`, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, authorization code with `issuer_state`. `CW-1` runs `SCN-I` without mutation: metadata, pushed authorization request with PKCE `S256`, `authorization_details`, WIA, PoP and DPoP proof, the authorization request through the adapter (`authenticateSubject`), token request with WIA, PoP and DPoP proof and the `code_verifier`, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.

## Expected results

1. Per variant:
    - `SD+PA`, `SD+AC`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`, `MD+AC`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

Positive control of every `_UF` test case of the same variant (issuer catalogue section 3.7): a `_UF` test case is executed only after this one passed.

Execute this test case once for each format and grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
