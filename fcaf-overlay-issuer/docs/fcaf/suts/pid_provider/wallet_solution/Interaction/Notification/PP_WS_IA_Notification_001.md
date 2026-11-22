# PP_WS_IA_Notification_001

## Objective

Verify that the PID Provider accepts the notification events `credential_accepted`, `credential_failure` and `credential_deleted` with HTTP 2xx.

## References

- [OpenID4VCI] section 11.1
- [OpenID4VCI] section 11.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Notification endpoint

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

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the credential response carries a `notification_id`.
2. `CW-1` sends a notification request with the `notification_id` of step 1, `event` `credential_accepted`, the access token of step 1 and a DPoP proof.
3. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the credential response carries a `notification_id`.
4. `CW-1` sends a notification request with the `notification_id` of step 3, `event` `credential_failure`, the access token of step 3 and a DPoP proof.
5. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the credential response carries a `notification_id`.
6. `CW-1` sends a notification request with the `notification_id` of step 5, `event` `credential_deleted`, the access token of step 5 and a DPoP proof.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The notification endpoint answers with HTTP 2xx (OpenID4VCI 1.0 section 11.2: "MUST respond with an HTTP status code in the 2xx range"); whether it is the RECOMMENDED 204 is recorded.
3. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
4. The notification endpoint answers with HTTP 2xx (OpenID4VCI 1.0 section 11.2: "MUST respond with an HTTP status code in the 2xx range"); whether it is the RECOMMENDED 204 is recorded.
5. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
6. The notification endpoint answers with HTTP 2xx (OpenID4VCI 1.0 section 11.2: "MUST respond with an HTTP status code in the 2xx range"); whether it is the RECOMMENDED 204 is recorded.

## Comments

Each event is sent for a credential of its own, since a `notification_id` belongs to one credential response.

OpenID4VCI 1.0 section 11.2 requires a 2xx and only RECOMMENDS 204, so another 2xx (EUDIPLO answers 201) passes and is recorded in the check detail (spec review 2026-11-20, issuer catalogue section 8.3).

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-NOT`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
