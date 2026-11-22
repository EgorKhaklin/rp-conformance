# AP_WS_MS_Offer_002

## Objective

Verify that an offer by reference is served as `application/json` over https and equals an offer by value.

## References

- [OpenID4VCI] section 4.1.3

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

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code flow, by value (`credential_offer`). `CW-1` resolves it and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE, by value (`credential_offer`). `CW-1` resolves it and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.
2. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code flow, by reference (`credential_offer_uri`). `CW-1` resolves it, fetching `credential_offer_uri`, and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, authorization code flow with PAR and PKCE, by reference (`credential_offer_uri`). `CW-1` resolves it, fetching `credential_offer_uri`, and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer.

## Expected results

1. The captured artifact passes `offer-issuer` (`credential_issuer` is an https URL without query or fragment and equals the `credential_issuer` of the metadata served under it); `offer-configurations` (`credential_configuration_ids` is a non-empty array of distinct IDs, each a key of `credential_configurations_supported`).
2. The captured artifact passes `offer-reference-fetch` (`credential_offer_uri` is an https URL and is answered HTTP 200 with `application/json`); `offer-reference-equal` (the offer equals the offer by value of step 1 in every member except the values of the session: `pre-authorized_code` and `issuer_state`).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`).
