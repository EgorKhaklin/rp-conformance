# PP_WS_IA_Deferred_003_UF

## Objective

Verify that the PID Provider rejects a `transaction_id` redeemed with the access token of another session.

## References

- [OpenID4VCI] section 9.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Deferred issuance

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The adapter can make the Provider defer an issuance for `SUBJ-1` and complete it later (ICS-10).
6. Wallet Unit `CW-2` of `WP-A` (section 3.4).
7. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-2` runs `SCN-I` for `SUBJ-1` without mutation (another session; its access token is used in step 2).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that its deferred credential request presents, with a DPoP proof of its key, the access token of the session of another Wallet Unit, not the one the `transaction_id` was issued to (fault `deferred.access-token-foreign`).

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-DEF`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
