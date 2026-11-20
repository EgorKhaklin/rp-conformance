# AP_WS_MS_Metadata_004

## Objective

Verify that the registration certificate is included in the metadata by value, valid, issued by `RC-A`, with the same entity identifier as the access certificate.

## References

- [ARF] Annex 2, RPRC_22, RPRC_22b
- [ETSI TS 119 472-3] section 4.2.3

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

1. The captured artifact passes `metadata-registration-certificate` (exactly one `issuer_info` entry of format `registration_cert` carries the certificate by value; it validates to an anchor of `TL-RC`, its signature verifies, it is not expired, and it is valid for the entity identifier of the access certificate in the signed metadata).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `Q` (`P-Q`), `PB` (`P-PB`), `E` (`P-E`).
