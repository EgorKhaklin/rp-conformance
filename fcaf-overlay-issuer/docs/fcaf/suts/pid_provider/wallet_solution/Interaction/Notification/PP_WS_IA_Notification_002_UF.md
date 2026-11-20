# PP_WS_IA_Notification_002_UF

## Objective

Verify that the PID Provider rejects an unknown `notification_id`, and record how it answers an unknown event.

## References

- [OpenID4VCI] section 11.3

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
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation; the credential response carries a `notification_id`.
2. `CW-1` sends the notification request of the positive case for step 1, except that its `notification_id` is a random value the credential response did not issue (fault `notification.id-unknown`).
3. `CW-1` sends the notification request of the positive case for step 1, except that its `event` is `foo` (fault `notification.event-unknown`).

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider issues no credential and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `invalid_notification_id` or `invalid_notification_request`; never HTTP 5xx.
3. The answer is recorded. OpenID4VCI 1.0 section 11.3 prescribes HTTP 400 with an error object only "When the notification_id value is invalid"; for an unknown `event` it names `invalid_notification_request` as a code that SHOULD be used, without requiring an error response, so no verdict is given on it.

## Comments

Step 3 is informational (spec review 2026-11-20, issuer catalogue section 8.3): the MUST of section 11.3 is scoped to an invalid `notification_id`, which step 2 tests.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-NOT`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
