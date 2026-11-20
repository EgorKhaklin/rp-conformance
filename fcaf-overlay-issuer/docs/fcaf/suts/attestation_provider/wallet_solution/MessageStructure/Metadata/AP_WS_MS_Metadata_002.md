# AP_WS_MS_Metadata_002

## Objective

Verify that the signed Credential Issuer metadata is a JWS signed with the key of the access certificate, carrying the access certificate and its intermediates up to `AC-A` (not the anchor) in `x5c`, and that it validates to `TL-AC`.

## References

- [ARF] Annex 2, ISSU_22, PPNot_04
- [OpenID4VCI] section 12.2.3
- [HAIP] section 4.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- HAIP

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The Conformance Wallet runs `SCN-M`: it takes the Credential Issuer identifier from an offer the adapter creates, fetches the Credential Issuer metadata from `/.well-known/openid-credential-issuer` inserted before the path of that identifier, once as JSON and once with `Accept: application/jwt`, the metadata of every Authorization Server it names, sends two requests to the nonce endpoint, and fetches `/.well-known/openid-configuration` under the identifier as a probe.

## Expected results

1. The captured artifact passes `metadata-signed` (HTTP 200, `application/jwt`; `typ` `openidvci-issuer-metadata+jwt`, an agreed `alg`; `x5c` without the anchor validates to an anchor of `TL-AC`; the leaf is an access certificate per ETSI TS 119 411-8 and verifies the signature; `sub` is the Credential Issuer identifier, `iat` present).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `Q` (`P-Q`), `PB` (`P-PB`), `E` (`P-E`).
