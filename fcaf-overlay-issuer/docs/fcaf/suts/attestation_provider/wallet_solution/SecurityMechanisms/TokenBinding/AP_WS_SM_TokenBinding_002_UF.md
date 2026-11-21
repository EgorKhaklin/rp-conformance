# AP_WS_SM_TokenBinding_002_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects its DPoP-bound access token presented as a Bearer token, or without a DPoP proof.
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects its DPoP-bound access token presented as a Bearer token, or without a DPoP proof.
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects its DPoP-bound access token presented as a Bearer token, or without a DPoP proof.

## References

- [RFC 9449] section 7.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that its credential request presents the DPoP-bound access token with the scheme `Bearer` (`Authorization: Bearer …`), with its valid DPoP proof (fault `dpop.bearer`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that its credential request presents the access token with the scheme `DPoP` but carries no `DPoP` header (fault `dpop.missing`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
