# AP_WS_IA_Deferred_002_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider rejects an unknown, or already redeemed, `transaction_id`.
- `SD+PA+PB`: Verify that the PuB-EAA Provider rejects an unknown, or already redeemed, `transaction_id`.
- `SD+PA+E`: Verify that the non-qualified EAA Provider rejects an unknown, or already redeemed, `transaction_id`.

## References

- [OpenID4VCI] section 9.3

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The adapter can make the Provider defer an issuance for `SUBJ-1` and complete it later (ICS-10).
6. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the `transaction_id` of its deferred credential request is a random value the credential response did not issue (fault `deferred.transaction-id-unknown`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation. The credential response is deferred (HTTP 202 with `transaction_id` and `interval`); `CW-1` polls the deferred credential endpoint with the `transaction_id` and its access token, at the `interval`, until the credential arrives.
3. `CW-1` sends the deferred credential request of step 2 again, with its `transaction_id`, already redeemed, and its access token.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_transaction_id`; never HTTP 5xx.
2. Per variant:
    - `SD+PA+Q`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+PB`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `SD+PA+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_transaction_id`; never HTTP 5xx.

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-DEF`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-DEF`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-DEF`).
