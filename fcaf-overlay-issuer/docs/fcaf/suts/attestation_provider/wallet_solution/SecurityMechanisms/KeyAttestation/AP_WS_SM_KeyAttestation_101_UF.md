# AP_WS_SM_KeyAttestation_101_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects a KA whose `key_storage` or `user_authentication` is one level below what the configuration's metadata requires (`key_attestations_required`, declared in ICS-04).
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects a KA whose `key_storage` or `user_authentication` is one level below what the configuration's metadata requires (`key_attestations_required`, declared in ICS-04).
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects a KA whose `key_storage` or `user_authentication` is one level below what the configuration's metadata requires (`key_attestations_required`, declared in ICS-04).

## References

- [ARF] Annex 2, ISSU_27d, WUA_05a
- [OpenID4VCI] Appendix D

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
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid except that the `key_storage` claim of its KA is `["iso_18045_moderate"]`.
2. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid except that the `key_storage` claim of its KA is `["iso_18045_basic"]`.
3. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid except that the `user_authentication` claim of its KA is `["iso_18045_moderate"]`.
4. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid except that the `user_authentication` claim of its KA is `["iso_18045_basic"]`.

## Expected results

1. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
2. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
3. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.
4. The Provider issues no credential for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_proof`; never HTTP 5xx.

## Comments

A level the Provider accepts (ICS-04.key_storage, ICS-04.user_authentication) is not below what it requires: the step with that level is NOT APPLICABLE, and the steps with the levels below the lowest accepted one decide the verdict.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-DB`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-DB`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-DB`).
