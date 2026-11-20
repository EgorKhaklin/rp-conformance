# AP_WS_DM_Rulebook_101

## Objective

- `SD+PA+Q`: Verify that the selective disclosure of the QEAA in SD-JWT VC format follows the rulebook of `default_credential_A`: each attribute can be disclosed on its own, and no claim SD-JWT VC forbids is selectively disclosable.
- `SD+PA+PB`: Verify that the selective disclosure of the PuB-EAA in SD-JWT VC format follows the rulebook of `default_credential_A`: each attribute can be disclosed on its own, and no claim SD-JWT VC forbids is selectively disclosable.
- `SD+PA+E`: Verify that the selective disclosure of the non-qualified EAA in SD-JWT VC format follows the rulebook of `default_credential_A`: each attribute can be disclosed on its own, and no claim SD-JWT VC forbids is selectively disclosable.

## References

- [ARF] Annex 2, ARB_30
- [SD-JWT VC] section 3.2.2.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid.

## Expected results

1. The Provider issues the attestation (HTTP 200) in SD-JWT VC format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. `attribute_A`, `attribute_B` and `attribute_C` are each in a disclosure of their own, none in the clear, and `iss`, `nbf`, `exp`, `cnf`, `vct`, `status` and `iat` are not selectively disclosable (`attestation-disclosure`).

## Comments

The FCAF defaults name no disclosure rule per attribute; the suite reads the rulebook as allowing each attribute to be disclosed on its own (MAY), which the Provider meets by making each one selectively disclosable.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
