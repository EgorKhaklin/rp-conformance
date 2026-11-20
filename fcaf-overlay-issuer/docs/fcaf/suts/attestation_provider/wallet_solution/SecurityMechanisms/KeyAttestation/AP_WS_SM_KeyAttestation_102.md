# AP_WS_SM_KeyAttestation_102

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider issues an attestation that is not device-bound with the WIA only, and that a KA sent anyway does not change the result.
- `SD+PA+PB`: Verify that the PuB-EAA Provider issues an attestation that is not device-bound with the WIA only, and that a KA sent anyway does not change the result.
- `SD+PA+E`: Verify that the non-qualified EAA Provider issues an attestation that is not device-bound with the WIA only, and that a KA sent anyway does not change the result.

## References

- [ARF] Annex 2, WUA_10a, ISSU_30a
- [OpenID4VCI] section 8.2

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

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`), pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request without key proof and without KA.
2. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration that is not device-bound (`ICS-04.NDB.SD`), pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA anyway.

## Expected results

1. The Provider issues the attestation (HTTP 200) in SD-JWT VC format, bound to no key (no `cnf`), as the configuration declares. It passes format, `issuer-trust` to the entity of its category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (no binding) and `status-reference`, and the status list checks.
2. The Provider issues the attestation (HTTP 200) in SD-JWT VC format, bound to no key (no `cnf`), as the configuration declares. It passes format, `issuer-trust` to the entity of its category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (no binding) and `status-reference`, and the status list checks.

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-NDB`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-NDB`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-NDB`).
