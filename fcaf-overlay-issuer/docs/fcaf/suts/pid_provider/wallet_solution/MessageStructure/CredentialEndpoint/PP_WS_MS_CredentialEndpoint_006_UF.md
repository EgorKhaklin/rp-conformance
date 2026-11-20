# PP_WS_MS_CredentialEndpoint_006_UF

## Objective

Verify that a credential request with a `credential_identifier` not issued in this token response is rejected.

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

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I`, except that its credential request carries, instead of an identifier of its own token response, the `credential_identifier` the token response of another session issued.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `unknown_credential_identifier`; never HTTP 5xx.

## Comments

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
