# AP_WS_SM_ProofOfPossession_010

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider binds the attestation in SD-JWT VC format to the key of the key proof: `cnf.jwk` equals the proof key.
- `SD+PA+PB`: Verify that the PuB-EAA Provider binds the attestation in SD-JWT VC format to the key of the key proof: `cnf.jwk` equals the proof key.
- `SD+PA+E`: Verify that the non-qualified EAA Provider binds the attestation in SD-JWT VC format to the key of the key proof: `cnf.jwk` equals the proof key.

## References

- [ARF] Annex 2, ISSU_17, WUA_09a
- [OpenID4VCI] Appendix F.1

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid.

## Expected results

1. The Provider issues the attestation; it passes every check of `ISS`, and its `cnf.jwk` is the public key of the key proof (`holder-binding`).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
