# AP_WS_DM_Rulebook_102

## Objective

- `SD+PA+Q`: Verify that the QEAA in SD-JWT VC format is signed under a granted qualified EAA service (`EAA/Q`) in the Trusted List reached via the LOTL (`TL-QEAA`).
- `MD+PA+Q`: Verify that the QEAA in mdoc format is signed under a granted qualified EAA service (`EAA/Q`) in the Trusted List reached via the LOTL (`TL-QEAA`).

## References

- [ARF] Annex 2, ISSU_08, ISSU_70, OIA_13
- [ETSI TS 119 612] section 5.5

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA+Q`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid.
    - `MD+PA+Q`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid.

## Expected results

1. Per variant:
    - `SD+PA+Q`: The Provider issues the attestation (HTTP 200) in SD-JWT VC format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. The signing certificate chains to the anchor of a service of type `http://uri.etsi.org/TrstSvc/Svctype/EAA/Q` with status granted, of `QP-T` in `TL-QEAA`, which the LOTL points to (`qualified-service`).
    - `MD+PA+Q`: The Provider issues the attestation (HTTP 200) in mdoc format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. The signing certificate chains to the anchor of a service of type `http://uri.etsi.org/TrstSvc/Svctype/EAA/Q` with status granted, of `QP-T` in `TL-QEAA`, which the LOTL points to (`qualified-service`).

## Comments

The qualified electronic seal itself (a QSCD-held key, ETSI EN 319 412-3) is a property of the signing key the test book covers (`PP_TB_002`); the protocol shows the qualified service the signer chains to.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`).
