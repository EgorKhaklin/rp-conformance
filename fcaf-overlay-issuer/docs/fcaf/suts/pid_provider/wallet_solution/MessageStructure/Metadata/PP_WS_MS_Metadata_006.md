# PP_WS_MS_Metadata_006

## Objective

Verify that a PID configuration exists in both formats: `dc+sd-jwt` with `vct` `urn:eudi:pid:1` (or a domestic extension) and `mso_mdoc` with doctype `eu.europa.ec.eudi.pid.1`.

## References

- [ARF] Annex 2, PID_02, PID_04, PID_14, ISSU_12

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

1. The captured artifact passes `metadata-pid-configurations` (a `dc+sd-jwt` configuration with `vct` `urn:eudi:pid:1` or `urn:eudi:pid:<country>:…`, and a `mso_mdoc` configuration with `doctype` `eu.europa.ec.eudi.pid.1`).

## Comments

PID only: an Attestation Provider has no counterpart of this test case.
