# AP_WS_IA_MainInteraction_001

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `MD+PA+Q`: Verify that the QEAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `SD+AC+Q`: Verify that the QEAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `MD+AC+Q`: Verify that the QEAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `SD+PA+PB`: Verify that the PuB-EAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `MD+PA+PB`: Verify that the PuB-EAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `SD+AC+PB`: Verify that the PuB-EAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `MD+AC+PB`: Verify that the PuB-EAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `SD+PA+E`: Verify that the non-qualified EAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `MD+PA+E`: Verify that the non-qualified EAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the pre-authorized code flow, and that the credential passes every check of the reference validator.
- `SD+AC+E`: Verify that the non-qualified EAA Provider issues the attestation in SD-JWT VC format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.
- `MD+AC+E`: Verify that the non-qualified EAA Provider issues the attestation in mdoc format to the Wallet Unit `CW-1` in the authorization code flow with PAR and PKCE, and that the credential passes every check of the reference validator.

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code with `tx_code` unless the ICS declares offers without one. `CW-1` runs `SCN-I` without mutation: metadata, token request with WIA, PoP and DPoP proof, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code with `tx_code` unless the ICS declares offers without one. `CW-1` runs `SCN-I` without mutation: metadata, token request with WIA, PoP and DPoP proof, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code with `issuer_state`. `CW-1` runs `SCN-I` without mutation: metadata, pushed authorization request with PKCE `S256`, `authorization_details`, WIA, PoP and DPoP proof, the authorization request through the adapter (`authenticateSubject`), token request with WIA, PoP and DPoP proof and the `code_verifier`, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.
    - `MD+AC+Q`, `MD+AC+PB`, `MD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, authorization code with `issuer_state`. `CW-1` runs `SCN-I` without mutation: metadata, pushed authorization request with PKCE `S256`, `authorization_details`, WIA, PoP and DPoP proof, the authorization request through the adapter (`authenticateSubject`), token request with WIA, PoP and DPoP proof and the `code_verifier`, nonce request, credential request with one `openid4vci-proof+jwt` that carries the KA.

## Expected results

1. Per variant:
    - `SD+PA+Q`, `SD+AC+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+Q`, `MD+AC+Q`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`, `SD+AC+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+PB`, `MD+AC+PB`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`, `SD+AC+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+E`, `MD+AC+E`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

Positive control of every `_UF` test case of the same variant (issuer catalogue section 3.7): a `_UF` test case is executed only after this one passed.

Execute this test case once for each format and grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `MD+AC+Q` (`P-Q`, `P-MD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `MD+AC+PB` (`P-PB`, `P-MD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`), `MD+AC+E` (`P-E`, `P-MD`, `P-AC`).
