# PP_WS_MS_Metadata_013

## Objective

Verify that the metadata offers no server retrieval and no endpoint that releases attributes to a Relying Party.

## References

- [ARF] Annex 2, ProxId_02
- [ISO/IEC 18013-5] section 8.3.3.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).

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

1. The captured artifact passes `metadata-no-server-retrieval` (no member of the Credential Issuer or Authorization Server metadata names server retrieval, a `userinfo_endpoint` or a Web API, and `/.well-known/openid-configuration` under the identifier advertises no `userinfo_endpoint`).

## Comments

Variant `MD` (`P-PID`, `P-MD`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
