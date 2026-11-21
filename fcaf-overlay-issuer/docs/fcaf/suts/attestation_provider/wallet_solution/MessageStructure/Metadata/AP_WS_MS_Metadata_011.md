# AP_WS_MS_Metadata_011

## Objective

Verify the Authorization Server metadata: PAR required, PKCE `S256` only, DPoP algorithms advertised, `attest_jwt_client_auth` as client authentication, `pre-authorized_grant_anonymous_access_supported` per ICS-03.

## References

- [HAIP] sections 4, 4.1 and 4.4.1
- [RFC 9126] section 5
- [RFC 7636]
- [RFC 9449] section 5.1
- [ARF] Annex 2, ISSU_01a

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

1. The captured artifact passes `metadata-authorization-server` (for every Authorization Server: `require_pushed_authorization_requests` true with a `pushed_authorization_request_endpoint`, `code_challenge_methods_supported` `["S256"]`, a non-empty `dpop_signing_alg_values_supported`, `attest_jwt_client_auth` in `token_endpoint_auth_methods_supported`; where the ICS declares the pre-authorized code grant, it is in `grant_types_supported` and `pre-authorized_grant_anonymous_access_supported` is not true).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `Q` (`P-Q`), `PB` (`P-PB`), `E` (`P-E`).
