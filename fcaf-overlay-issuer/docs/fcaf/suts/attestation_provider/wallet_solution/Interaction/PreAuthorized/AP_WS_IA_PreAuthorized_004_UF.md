# AP_WS_IA_PreAuthorized_004_UF

## Objective

- `SD+PA+Q`: Verify that the pre-authorized code of one offer of the QEAA Provider gives no access to the credential configuration of another offer: a credential request for this offer's configuration with the access token of the other offer's code is rejected.
- `SD+PA+PB`: Verify that the pre-authorized code of one offer of the PuB-EAA Provider gives no access to the credential configuration of another offer: a credential request for this offer's configuration with the access token of the other offer's code is rejected.
- `SD+PA+E`: Verify that the pre-authorized code of one offer of the non-qualified EAA Provider gives no access to the credential configuration of another offer: a credential request for this offer's configuration with the access token of the other offer's code is rejected.

## References

- [OpenID4VCI] sections 4.1.1 and 8.3.1.2

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
5. The Provider offers a second credential configuration of another credential type (ICS-02.second), and the adapter can create an offer for it.
6. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code with `tx_code`. It also creates a second offer for `SUBJ-1` and the configuration `ICS-02.second`. `CW-1` runs `SCN-I` for the first offer as in `AP_WS_IA_MainInteraction_001`, except that its token request carries the `pre-authorized_code` (and `tx_code`) of a second offer of the SUT for the configuration `ICS-02.second`, and its credential request then asks for the configuration of this offer (fault `token-request.pre-authorized-code-other-offer`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The token request itself is valid for the second offer, so the Provider may issue its token; the request at which the flow ends is the credential request for the first offer's configuration, which must be rejected (`REJ` with any error code, for example `invalid_credential_request` or `invalid_token`).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
