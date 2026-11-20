# AP_WS_SM_TokenBinding_001

## Objective

- `SD+PA+Q`: Verify that the token endpoint of the QEAA Provider issues a DPoP-bound access token (`token_type` `DPoP`), bound to the key of the DPoP proof of the token request.
- `SD+PA+PB`: Verify that the token endpoint of the PuB-EAA Provider issues a DPoP-bound access token (`token_type` `DPoP`), bound to the key of the DPoP proof of the token request.
- `SD+PA+E`: Verify that the token endpoint of the non-qualified EAA Provider issues a DPoP-bound access token (`token_type` `DPoP`), bound to the key of the DPoP proof of the token request.

## References

- [HAIP] section 4
- [RFC 9449] section 5
- [RFC 9449] section 6

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation, with a DPoP proof at the token endpoint.

## Expected results

1. The token response carries `token_type` `DPoP`. Where the access token is a JWT, its `cnf.jkt` is the JWK SHA-256 thumbprint of the DPoP key of `CW-1`.

## Comments

The binding itself is shown by `AP_WS_SM_TokenBinding_002_UF` and `_003_UF`: a Bearer presentation and a proof of another key are rejected.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
