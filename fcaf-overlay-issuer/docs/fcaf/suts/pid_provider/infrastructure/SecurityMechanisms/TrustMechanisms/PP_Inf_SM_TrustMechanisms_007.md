# PP_Inf_SM_TrustMechanisms_007

## Objective

- `SD+PA`, `SD+AC`: Verify that the SD-JWT VC PID, its status list and the access certificate validate under the anchors `TL-PID` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.
- `MD+PA`, `MD+AC`: Verify that the mdoc PID, its status list and the access certificate validate under the anchors `TL-PID` and `TL-AC` publish for the Provider, each for its service: issuance, revocation, access.

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation.
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation.
2. The harness inspects the credential of step 1, the Status List Token it references, and the signed Credential Issuer metadata of the issuance (`Accept: application/jwt`).

## Expected results

1. Per variant:
    - `SD+PA`, `SD+AC`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA`, `MD+AC`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Each artifact chains to the anchor of its service. The named checks pass: `anchor-issuance` (`issuer-trust`: the credential chains to the issuance anchor of `PP-T` on `TL-PID`); `anchor-revocation` (`status-list-trust`: its Status List Token chains to the revocation anchor of `PP-T`, or to its issuance anchor where `TL-PID` lists it under both services); `anchor-access` (the signed Credential Issuer metadata carries the access certificate the Test Registrar issued from `AC-A`, chaining to the `AC-A` anchor on `TL-AC`, and its signature verifies).

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

The access certificate is observed where the Provider uses it towards a wallet: the signature of its signed Credential Issuer metadata.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
