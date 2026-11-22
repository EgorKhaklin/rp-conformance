# PP_RP_IA_Supportive_002

## Objective

Verify that HTTP cache headers of the Provider's status list response, if it sets any, are consistent with the token's `ttl` and `exp`.

## References

- [TokenStatusList] sections 8.2 and 13.7
- [RFC 9111] section 4.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List
- HTTP

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness fetches the status list the credential of step 1 references, anonymously (no `Authorization` header, no cookie), with `Accept` `application/statuslist+jwt`, and once with the `Accept` of each format the ICS declares (ICS-05).

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. A cache that follows the response headers never serves the token longer than `ttl` or past `exp`; a response without caching-related headers passes. The named checks pass: `sl-cache` (if `Cache-Control` or `Expires` is present: `max-age` no longer than `ttl` and not beyond `exp`, `Expires` not after `exp`, or `no-cache`/`no-store`; no header at all passes).

## Comments

EUDI_optional. Token Status List has no cache-header rule for the Status Provider: section 8.2 says only that "If caching-related HTTP headers are present in the HTTP response, Relying Parties MUST prioritize the exp and ttl claims", and section 13.7 describes how Relying Parties use `ttl` and `exp`. A response without such headers therefore passes; headers that are present are checked because an HTTP cache between the Provider and a Relying Party does not read the token (spec review 2026-11-20, issuer catalogue section 8.3).

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
