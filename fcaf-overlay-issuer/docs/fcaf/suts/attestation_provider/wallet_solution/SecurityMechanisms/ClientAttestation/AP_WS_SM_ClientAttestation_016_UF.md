# AP_WS_SM_ClientAttestation_016_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects a WIA whose revocation maintenance period ends tomorrow, below the minimum remaining period it requires, or issues an attestation that expires no later than that end.
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects a WIA whose revocation maintenance period ends tomorrow, below the minimum remaining period it requires, or issues an attestation that expires no later than that end.
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects a WIA whose revocation maintenance period ends tomorrow, below the minimum remaining period it requires, or issues an attestation that expires no later than that end.

## References

- [ARF] Annex 2, ISSU_12c
- [TS3] sections 2.4.1 and 2.4.3

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Attestation-Based Client Authentication

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and the `exp` member of the `client_status` claim of its WIA, the end of the revocation maintenance period, is one day from now.

## Expected results

1. Either the Provider issues no credential and no token and answers with HTTP 4xx and an OAuth error object, or it issues an attestation that passes every check of `ISS` and whose `exp` is no later than the `exp` of the WIA's `client_status` claim (`maintenance-period`); never HTTP 5xx.

## Comments

An EUDI/TS3 requirement: TS3 section 2.4.3 "The technical validity period of an attestation SHALL end before the `client_status.exp` of the WIA" and ARF ISSU_12c. WUA_32 (communicating a minimum remaining period) is not the rule tested here.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
