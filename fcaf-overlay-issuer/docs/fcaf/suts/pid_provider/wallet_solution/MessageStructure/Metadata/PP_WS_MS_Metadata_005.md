# PP_WS_MS_Metadata_005

## Objective

Verify that the registration certificate's `entitlement` matches the Provider's category, and that `providesAttestations` lists every credential type in `credential_configurations_supported`.

## References

- [ARF] Annex 2, RPRC_15, RPRC_23, ISSU_24a, ISSU_24b, Reg_10e

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- HAIP

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The Conformance Wallet runs `SCN-M`: it takes the Credential Issuer identifier from an offer the adapter creates, fetches the Credential Issuer metadata from `/.well-known/openid-credential-issuer` inserted before the path of that identifier, once as JSON and once with `Accept: application/jwt`, the metadata of every Authorization Server it names, sends two requests to the nonce endpoint, and fetches `/.well-known/openid-configuration` under the identifier as a probe.

## Expected results

1. The captured artifact passes `metadata-registration-entitlement` (`entitlements` contains `https://uri.etsi.org/19475/Entitlement/PID_Provider`; `provides_attestations` lists the `vct` of every `dc+sd-jwt` configuration and the doctype of every `mso_mdoc` configuration).
