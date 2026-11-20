# PP_WS_SH_Encoding_002_UF

## Objective

Verify that the PID Provider rejects oversized requests and deeply nested JSON, and stays available.

## References

- [OWASP API Security Top 10] API4:2023

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

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that its credential request additionally carries a member `padding` whose value is a string of 10 MiB (fault `encoding.oversized`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that its credential request additionally carries a member `nested` whose value is an array nested 10 000 levels deep (fault `encoding.deep-nesting`).
3. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
3. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

Step 3 shows that the Provider is still available after the two requests.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
