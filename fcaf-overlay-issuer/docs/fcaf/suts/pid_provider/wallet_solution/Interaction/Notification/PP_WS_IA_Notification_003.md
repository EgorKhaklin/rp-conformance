# PP_WS_IA_Notification_003

## Objective

Verify that a `credential_deleted` notification, or no notification at all, does not revoke the credential or otherwise act against the User.

## References

- [ARF] Annex 2, PAD_03
- [OpenID4VCI] section 11.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Notification endpoint

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

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
2. `CW-1` sends a notification request with the `notification_id` of step 1 and `event` `credential_deleted`.
3. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation and sends no notification.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The credential of step 1 stays valid in the status list the Provider publishes after the notification.
3. The Provider issues the credential, and it stays valid in the status list the Provider publishes.

## Comments

`UNCHANGED` is observed once, right after the step: the Provider re-signs its status list on every change (ICS-06.T_rev), so a revocation would show.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-NOT`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
