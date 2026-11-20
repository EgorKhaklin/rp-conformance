# AP_Inf_SM_TrustMechanisms_007

## Objective

- `SD+PA+Q`, `SD+AC+Q`: Verify that the SD-JWT VC attestation, its status list and the access certificate validate under the anchors `TL-QEAA` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `MD+PA+Q`, `MD+AC+Q`: Verify that the mdoc attestation, its status list and the access certificate validate under the anchors `TL-QEAA` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `SD+PA+PB`, `SD+AC+PB`: Verify that the SD-JWT VC attestation, its status list and the access certificate validate under the anchors `TL-PUB` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `MD+PA+PB`, `MD+AC+PB`: Verify that the mdoc attestation, its status list and the access certificate validate under the anchors `TL-PUB` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `SD+PA+E`, `SD+AC+E`: Verify that the SD-JWT VC attestation, its status list and the access certificate validate under the anchors the rulebook anchors (`TA-EAA`) and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `MD+PA+E`, `MD+AC+E`: Verify that the mdoc attestation, its status list and the access certificate validate under the anchors the rulebook anchors (`TA-EAA`) and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.

## References

- [ARF] Annex 2, PPNot_03, PPNot_03a, PPNot_04
- [ARF] Annex 2, PuBPNot_04, PuBPNot_05
- [ARF] Annex 2, RPACANot_03, RPACANot_03a

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ETSI TS 119 602 LoTE
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `MD+AC+Q`, `MD+AC+PB`, `MD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation.
2. The harness inspects the credential of step 1, the Status List Token it references, and the signed Credential Issuer metadata of the issuance (`Accept: application/jwt`).

## Expected results

1. Per variant:
    - `SD+PA+Q`, `SD+AC+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+Q`, `MD+AC+Q`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`, `SD+AC+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+PB`, `MD+AC+PB`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`, `SD+AC+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+E`, `MD+AC+E`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `SD+PA+Q`, `SD+AC+Q`, `MD+PA+Q`, `MD+AC+Q`: Each artifact chains to the anchor of its service. The named checks pass: `anchor-issuance` (`issuer-trust`: the credential chains to the issuance anchor of `QP-T` with its granted qualified EAA service on `TL-QEAA`); `anchor-revocation` (`status-list-trust`: its Status List Token chains to the revocation anchor of `QP-T`, or to its issuance anchor where `TL-QEAA` lists it under both services); `anchor-access` (the signed Credential Issuer metadata carries the access certificate the Test Registrar issued from `AC-A`, chaining to the `AC-A` anchor on `TL-AC`, and its signature verifies).
    - `SD+PA+PB`, `SD+AC+PB`, `MD+PA+PB`, `MD+AC+PB`: Each artifact chains to the anchor of its service. The named checks pass: `anchor-issuance` (`issuer-trust`: the credential chains to the issuance anchor of `PB-T` on `TL-PUB`); `anchor-revocation` (`status-list-trust`: its Status List Token chains to the revocation anchor of `PB-T`, or to its issuance anchor where `TL-PUB` lists it under both services); `anchor-access` (the signed Credential Issuer metadata carries the access certificate the Test Registrar issued from `AC-A`, chaining to the `AC-A` anchor on `TL-AC`, and its signature verifies).
    - `SD+PA+E`, `SD+AC+E`, `MD+PA+E`, `MD+AC+E`: Each artifact chains to the anchor of its service. The named checks pass: `anchor-issuance` (`issuer-trust`: the credential chains to the issuance anchor of `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`)); `anchor-revocation` (`status-list-trust`: its Status List Token chains to the revocation anchor of `EP-T`, or to its issuance anchor where the rulebook anchors (`TA-EAA`) lists it under both services); `anchor-access` (the signed Credential Issuer metadata carries the access certificate the Test Registrar issued from `AC-A`, chaining to the `AC-A` anchor on `TL-AC`, and its signature verifies).

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

The access certificate is observed where the Provider uses it towards a wallet: the signature of its signed Credential Issuer metadata.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `MD+AC+Q` (`P-Q`, `P-MD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `MD+AC+PB` (`P-PB`, `P-MD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`), `MD+AC+E` (`P-E`, `P-MD`, `P-AC`).
