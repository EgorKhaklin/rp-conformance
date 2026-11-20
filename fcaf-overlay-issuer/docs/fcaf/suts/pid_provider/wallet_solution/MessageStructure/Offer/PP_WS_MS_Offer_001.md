# PP_WS_MS_Offer_001

## Objective

Verify that the credential offer names the Provider's `credential_issuer` and only `credential_configuration_ids` that exist in the metadata.

## References

- [OpenID4VCI] section 4.1.1

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

## Test Scenario

1. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code flow, by value (`credential_offer`). `CW-1` resolves it and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE, by value (`credential_offer`). `CW-1` resolves it and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.

## Expected results

1. The captured artifact passes `offer-issuer` (`credential_issuer` is an https URL without query or fragment and equals the `credential_issuer` of the metadata served under it); `offer-configurations` (`credential_configuration_ids` is a non-empty array of distinct IDs, each a key of `credential_configurations_supported`).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`).
