# PP_WS_MS_CredentialEndpoint_003_UF

## Objective

Verify that a credential request for an unknown `credential_configuration_id` is rejected.

## References

- [OpenID4VCI] section 8.3.1.2

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code flow. `CW-1` runs `SCN-I`, except that the `credential_configuration_id` of its credential request is a random value of 16 lowercase hexadecimal characters prefixed `unknown-`, which the Credential Issuer metadata does not offer.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I`, except that the `credential_configuration_id` of its credential request is a random value of 16 lowercase hexadecimal characters prefixed `unknown-`, which the Credential Issuer metadata does not offer.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `unknown_credential_configuration`; never HTTP 5xx.

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`).
