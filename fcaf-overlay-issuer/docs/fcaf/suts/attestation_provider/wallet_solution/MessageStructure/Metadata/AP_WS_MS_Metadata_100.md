# AP_WS_MS_Metadata_100

## Objective

- `Q`: Verify that a configuration of the QEAA Provider that is not device-bound states that it needs no KA: it declares no cryptographic binding and offers no proof type that requires one.
- `PB`: Verify that a configuration of the PuB-EAA Provider that is not device-bound states that it needs no KA: it declares no cryptographic binding and offers no proof type that requires one.
- `E`: Verify that a configuration of the non-qualified EAA Provider that is not device-bound states that it needs no KA: it declares no cryptographic binding and offers no proof type that requires one.

## References

- [ARF] Annex 2, WUA_10a
- [OpenID4VCI] section 12.2.4

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Device binding per configuration. PIDs are always device-bound (ISSU_17).

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- HAIP

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The Conformance Wallet runs `SCN-M`: it takes the Credential Issuer identifier from an offer the adapter creates, fetches the Credential Issuer metadata as JSON and with `Accept: application/jwt`, and the metadata of every Authorization Server it names.

## Expected results

1. The captured artifact passes `metadata-no-key-binding` (at least one configuration has no `cryptographic_binding_methods_supported`, and none of them lists `proof_types_supported` or `key_attestations_required`).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `Q` (`P-Q`, `P-NDB`), `PB` (`P-PB`, `P-NDB`), `E` (`P-E`, `P-NDB`).
