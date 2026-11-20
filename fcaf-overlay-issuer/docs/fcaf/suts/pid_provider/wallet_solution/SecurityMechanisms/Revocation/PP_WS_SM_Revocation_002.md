# PP_WS_SM_Revocation_002

## Objective

Verify that the mdoc PID's MSO carries a `status` element whose `status_list` points to a Status List Token of the Provider.

## References

- [ARF] Annex 2, VCR_11
- [ISO/IEC 18013-5] second edition, section 12.3.6

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
2. The harness fetches the status list the credential of step 1 references, anonymously (no `Authorization` header, no cookie), with `Accept` `application/statuslist+cwt`, and once with the `Accept` of each format the ICS declares (ICS-05).

## Expected results

1. The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The mdoc carries a status reference to a status list; its `uri` answers with a Status List Token in CWT (`application/statuslist+cwt`) signed by the Provider, covering the credential's index. The named checks pass: `sl-uri` (an https URI without user information; an http URI on the loopback host stands for https in a local run); `status-list-fetch` (HTTP 200); `status-list-format` (a Status List Token in the format of the credential); `status-list-type` (`typ` `statuslist+jwt`, or `application/statuslist+cwt`); `status-list-trust` (the signer chains to the revocation anchor of `PP-T` on `TL-PID`, or to its issuance anchor where the list carries it under both services); `status-list-signature` (`ES256`, verifies with the signer certificate); `status-list-subject` (`sub` equals the credential's status `uri`); `status-index` (the credential's `idx` lies within the decoded entries).

## Comments

The status reference itself is also part of `ISS` (`status-reference`); this test case adds that the reference resolves to a list of the Provider (`OBS-SL`).

OIDF `happy-flow` covers this objective partly (issuer catalogue section 7).

Variant `MD+PA` (`P-PID`, `P-MD`, `P-PA`, `P-REV`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
