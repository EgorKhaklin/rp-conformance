# AP_WS_MS_CredentialEndpoint_004_UF

## Objective

Verify that a credential request for a configuration the access token was not issued for is rejected.

## References

- [OpenID4VCI] sections 8.2 and 8.3.1.2

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

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code flow. `CW-1` runs `SCN-I`, except that the `credential_configuration_id` of its credential request names a second configuration the Credential Issuer metadata offers, for which the offer and the access token were not issued.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I`, except that the `credential_configuration_id` of its credential request names a second configuration the Credential Issuer metadata offers, for which the offer and the access token were not issued.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The Provider must offer a second credential configuration in its metadata; without one the step is INCONCLUSIVE.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`).
