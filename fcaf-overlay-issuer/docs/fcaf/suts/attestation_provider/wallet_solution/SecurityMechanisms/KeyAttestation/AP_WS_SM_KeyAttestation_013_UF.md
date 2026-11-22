# AP_WS_SM_KeyAttestation_013_UF

## Objective

- `SD+PA+Q`: Verify how the QEAA Provider treats a KA of another Wallet Unit, valid in itself, sent with this Wallet Unit's WIA at the credential endpoint in the pre-authorized code flow: it rejects the request, or the outcome is recorded.
- `SD+PA+PB`: Verify how the PuB-EAA Provider treats a KA of another Wallet Unit, valid in itself, sent with this Wallet Unit's WIA at the credential endpoint in the pre-authorized code flow: it rejects the request, or the outcome is recorded.
- `SD+PA+E`: Verify how the non-qualified EAA Provider treats a KA of another Wallet Unit, valid in itself, sent with this Wallet Unit's WIA at the credential endpoint in the pre-authorized code flow: it rejects the request, or the outcome is recorded.

## References

- [ARF] Annex 2, WUA_10b
- [TS3] section 2.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and it carries a valid KA of the Wallet Unit `CW-2`, and its key proof is signed with a key that KA attests, while the token request carried the WIA of `CW-1`.

## Expected results

1. The Provider rejects the request with HTTP 4xx and an OAuth or OpenID4VCI error object, or the outcome (an attestation bound to a key of `CW-2`) is recorded in the report; never HTTP 5xx.

## Comments

Nothing in the request links the KA to the WIA, so a Provider cannot tell the two Wallet Units apart; the catalogue records the behaviour.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
