# PP_WS_MS_Offer_003

## Objective

Verify that the pre-authorized code of an offer is opaque, and that `tx_code` carries `input_mode`, `length` and `description` when a transaction code is required.

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

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code flow, by value (`credential_offer`). `CW-1` resolves it and fetches the Credential Issuer metadata of its `credential_issuer`, without redeeming the offer. The offer is protected by a transaction code unless the ICS declares offers without one only (ICS-03).

## Expected results

1. The captured artifact passes `offer-pre-authorized-code` (`pre-authorized_code` is a non-empty string that is neither a JWT nor base64url-encoded JSON; where the adapter obtained a transaction code, `tx_code` is present with `input_mode` `numeric` or `text`, a positive integer `length` and a `description` of at most 300 characters).

## Comments

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
