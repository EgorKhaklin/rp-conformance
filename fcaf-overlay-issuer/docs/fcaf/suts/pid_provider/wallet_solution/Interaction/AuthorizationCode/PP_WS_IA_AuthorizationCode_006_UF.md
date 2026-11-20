# PP_WS_IA_AuthorizationCode_006_UF

## Objective

Verify that the PID Provider rejects an authorization request for an unknown `credential_configuration_id` in `authorization_details`, and ignores an unknown `scope` value next to a valid request.

## References

- [OpenID4VCI] sections 5.1.1 and 5.1.2

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
5. The adapter completes the authentication of `SUBJ-1` at the Provider (`authenticateSubject`, ICS-03).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that the `credential_configuration_id` in the `authorization_details` of its pushed authorization request is `unknown-configuration`, which the Credential Issuer metadata does not offer (fault `authorization.authorization-details-unknown`).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` as in `PP_WS_IA_MainInteraction_001`, except that its pushed authorization request carries, besides its `authorization_details`, the `scope` value `unknown-scope`, which no credential configuration of the Credential Issuer metadata names (mutation `authorization.scope-unknown`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
2. The unknown `scope` value is ignored (OpenID4VCI 1.0 section 5.1.2: "Credential Issuers MUST ignore unknown scope values in a request"): the PID is issued as requested by the `authorization_details`.

## Comments

The rejection of step 1 may come at PAR, at the authorization endpoint or at the token endpoint; the step passes when the request at which the flow ends is rejected and no credential is issued. Each step uses a new offer.

Step 2 does not expect a rejection: OpenID4VCI 1.0 section 5.1.2 requires a Credential Issuer to ignore unknown scope values, so the request is valid apart from a value the Provider must disregard (decision in the catalogue section 5.1.2, spec review 2026-11-20).

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
