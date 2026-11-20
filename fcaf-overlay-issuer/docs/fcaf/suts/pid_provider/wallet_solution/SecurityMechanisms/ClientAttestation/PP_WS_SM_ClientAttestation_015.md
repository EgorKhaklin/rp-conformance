# PP_WS_SM_ClientAttestation_015

## Objective

Verify that the PID Provider issues the PID in SD-JWT VC format with an expiry no later than the end of the WIA's revocation maintenance period, when that period ends in 30 days.

## References

- [ARF] Annex 2, ISSU_12c, WUA_30
- [TS3] section 2.4.1

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid, and the `exp` member of the `client_status` claim of its WIA, the end of the revocation maintenance period, is 30 days from now.

## Expected results

1. The Provider issues the PID in SD-JWT VC format, it passes every check of `ISS`, and its `exp` is no later than the `exp` of the `client_status` claim of the WIA it was issued for (`maintenance-period`).

## Comments

PID only. The KA keeps its maintenance period of more than a year, so only the WIA bounds the expiry.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
