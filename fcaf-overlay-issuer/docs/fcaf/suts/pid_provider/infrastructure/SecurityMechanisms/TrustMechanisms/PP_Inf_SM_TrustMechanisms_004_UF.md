# PP_Inf_SM_TrustMechanisms_004_UF

## Objective

- `SD+PA`, `SD+AC`: Verify that a `TL-WP` with an invalid seal, or sealed by an untrusted scheme operator, is not used, and that the Provider then acts as it declares (ICS-15.invalid_version): with `keep` the previous list stays in force and `CW-1` still gets the SD-JWT VC PID; with `discard` it uses no list and issues none.
- `MD+PA`, `MD+AC`: Verify that a `TL-WP` with an invalid seal, or sealed by an untrusted scheme operator, is not used, and that the Provider then acts as it declares (ICS-15.invalid_version): with `keep` the previous list stays in force and `CW-1` still gets the mdoc PID; with `discard` it uses no list and issues none.

## References

- [ETSI TS 119 602]
- [ARF] Annex 2, WPNot_04

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ETSI TS 119 602 LoTE
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider trusts `TL-WP` for Wallet Providers through its scheme operator certificate only (catalogue section 3.2), and reads it again on `refreshTrust` or after `T_refresh` (ICS-15).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`: `WP-A` removed; one bit of the signature value of its JAdES seal is flipped. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
2. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the list with the broken seal must not apply).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation (the list with the broken seal must not apply).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the list with the broken seal must not apply).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation (the list with the broken seal must not apply).
3. The Test Trust Infrastructure publishes a new version of `TL-WP` under a higher `LoTESequenceNumber`: `WP-A` removed; it is sealed by a certificate issued by `CA-X`, which its `x5c` header carries, instead of the scheme operator certificate. The adapter makes the Provider read `TL-WP` again (`refreshTrust`), or the harness waits `T_refresh` (ICS-15).
4. Per variant:
    - `SD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the list sealed under `CA-X` must not apply).
    - `SD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation (the list sealed under `CA-X` must not apply).
    - `MD+PA`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation (the list sealed under `CA-X` must not apply).
    - `MD+AC`: The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, authorization code flow with PAR and PKCE. `CW-1` runs `SCN-I` without mutation (the list sealed under `CA-X` must not apply).

## Expected results

1. The version, its sequence number and the refresh are recorded.
2. Per variant:
    - `SD+PA`, `SD+AC`: As the Provider declares in ICS-15.invalid_version: `keep` (the previous `TL-WP` stays in force) gives `ISS` of the SD-JWT VC PID; `discard` (no list is used until a valid version arrives) gives `REJ`. Undeclared counts as `keep`.
    - `MD+PA`, `MD+AC`: As the Provider declares in ICS-15.invalid_version: `keep` (the previous `TL-WP` stays in force) gives `ISS` of the mdoc PID; `discard` (no list is used until a valid version arrives) gives `REJ`. Undeclared counts as `keep`.
3. The version, its sequence number and the refresh are recorded.
4. Per variant:
    - `SD+PA`, `SD+AC`: As the Provider declares in ICS-15.invalid_version: `keep` (the previous `TL-WP` stays in force) gives `ISS` of the SD-JWT VC PID; `discard` (no list is used until a valid version arrives) gives `REJ`. Undeclared counts as `keep`.
    - `MD+PA`, `MD+AC`: As the Provider declares in ICS-15.invalid_version: `keep` (the previous `TL-WP` stays in force) gives `ISS` of the mdoc PID; `discard` (no list is used until a valid version arrives) gives `REJ`. Undeclared counts as `keep`.

## Comments

After the test case the harness publishes the default `TL-WP` (`WP-A`, `WP-B` granted, `WP-W` withdrawn) under a higher sequence number and the Provider refreshes again. Test cases with a `trust-list` step run one at a time.

The bad version removes `WP-A`, so a Provider that used it would refuse `CW-1`. A Provider that keeps the previous list issues the PID; one that discards the list and uses none until a valid version arrives (fail-closed) refuses it. Both conform: ETSI TS 119 602 and the ARF require the seal to be verified before a list is used, not a last-known-good list, so steps 2 and 4 are `POLICY` (ICS-15.invalid_version) since the spec review of 2026-11-20 (issuer catalogue section 8.3). For EUDIPLO the adapter's `refreshTrust` (`DELETE /api/cache/trust-list`) itself empties the cache, so `keep` could not be observed through it in any case.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA` (`P-PID`, `P-SD`, `P-PA`), `SD+AC` (`P-PID`, `P-SD`, `P-AC`), `MD+PA` (`P-PID`, `P-MD`, `P-PA`), `MD+AC` (`P-PID`, `P-MD`, `P-AC`).
