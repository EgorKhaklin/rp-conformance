# PP_RP_SM_Revocation_005

## Objective

Verify that the Provider publishes a new version of the status list before the previous one's `exp`, so a Relying Party never has only an expired token.

## References

- [TokenStatusList] section 8.3
- [ARF] Annex 2, VCR_14

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness polls the status list anonymously every `min(t / 20, 30 s)`, where `t` is the time to the first version's `exp`, until two intervals after that `exp`, keeping every version with its `iat` and `exp`.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Every poll, before and after the first version expires, returns a token that has not expired. The named checks pass: `sl-lifetime` (`iat`, `exp` and `ttl` present; `exp` after `iat` and in the future; `ttl` positive); `sl-continuity` (polls continue past the first version's `exp`; no poll returns an expired token).

## Comments

Long running: the step waits for the token lifetime, which the adapter sets to the shortest the Provider allows (issue 22); it runs after the other test cases.

A Provider that signs a new version only on request still passes: what counts is that no fetch returns an expired token.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-REV`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
