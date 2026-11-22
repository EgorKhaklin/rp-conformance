# PP_RP_SM_Revocation_007

## Objective

Verify that the identifier list the mdoc PID references has a valid signature under the revocation anchor, the structure of ISO/IEC 18013-5, and lists a revoked credential by its identifier.

## References

- [ARF] Annex 2, VCR_11
- [ISO/IEC 18013-5] second edition, section 12.3.6.4

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- ISO/IEC 18013-5 mdoc
- Token Status List

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness fetches the identifier list the MSO references, anonymously.
3. The adapter revokes the credential of step 1 (`setStatus` revoked) and reports when the Provider has done so (`OBS-ADM`).
4. The harness polls the status list of the credential of step 1 anonymously every `min(T_rev / 20, 30 s)` until `T_rev` (ICS-06) after the time the adapter reported, keeping every version with its `iat`, `exp` and the credential's status.

## Expected results

1. The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The identifier list is the Provider's and does not list the fresh credential. The named checks pass: `identifier-list-trust`; `identifier-list-signature`; `identifier-list-claims`; `identifier-status`.
3. The time the adapter reports is recorded; the window of the next step counts from it.
4. No later than `T_rev` after the reported revocation, a version of the list shows the credential's entry as `0x01` (INVALID), and every later version polled shows it as `0x01` too.

## Comments

Not executable against a Provider without identifier lists (`P-IL` No): NOT APPLICABLE. Reading identifier lists in `observe-status` comes with the first Provider that publishes them.

Variant `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-REV`, `P-IL`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
