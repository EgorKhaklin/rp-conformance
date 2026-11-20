# AP_WS_MS_Metadata_102

## Objective

- `Q`: Verify that the embedded disclosure policy of each configuration of the QEAA Provider is included by value in its metadata.
- `PB`: Verify that the embedded disclosure policy of each configuration of the PuB-EAA Provider is included by value in its metadata.
- `E`: Verify that the embedded disclosure policy of each configuration of the non-qualified EAA Provider is included by value in its metadata.

## References

- [ARF] Annex 2, EDP_09
- [ETSI TS 119 472-3]

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Embedded disclosure policies per configuration (EDP_09)

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

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

1. The captured artifact passes `metadata-disclosure-policy` (the configurations with an embedded disclosure policy carry it by value, as an object in `disclosure_policy`, `policy` or `credential_metadata.policy`, and none only by reference (`policy_uri`)).

## Comments

No profile names the metadata member of an embedded disclosure policy yet; the check accepts `disclosure_policy`, `policy` or `credential_metadata.policy` of the configuration until one does.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `Q` (`P-Q`, `P-EDP`), `PB` (`P-PB`, `P-EDP`), `E` (`P-E`, `P-EDP`).
