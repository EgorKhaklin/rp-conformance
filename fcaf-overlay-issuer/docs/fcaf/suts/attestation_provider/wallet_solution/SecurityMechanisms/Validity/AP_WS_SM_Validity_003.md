# AP_WS_SM_Validity_003

## Objective

- `SD+PA+Q`, `SD+AC+Q`, `SD+PA+PB`, `SD+AC+PB`, `SD+PA+E`, `SD+AC+E`: Verify that an attestation in SD-JWT VC format valid for more than 24 hours carries a status reference.
- `MD+PA+Q`, `MD+AC+Q`, `MD+PA+PB`, `MD+AC+PB`, `MD+PA+E`, `MD+AC+E`: Verify that an attestation in mdoc format valid for more than 24 hours carries a status reference.

## References

- [ARF] Annex 2, VCR_01, VCR_01b, VCR_02

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `SD+AC+Q`, `SD+AC+PB`, `SD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format; `CW-1` runs `SCN-I` in the pre-authorized code flow without mutation.
    - `MD+AC+Q`, `MD+AC+PB`, `MD+AC+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format; `CW-1` runs `SCN-I` in the authorization code flow with PAR and PKCE without mutation.

## Expected results

1. Per variant:
    - `SD+PA+Q`, `SD+AC+Q`, `SD+PA+PB`, `SD+AC+PB`, `SD+PA+E`, `SD+AC+E`: The Provider issues the credential (HTTP 200) in SD-JWT VC format, it passes every check of the reference validator, and a credential whose validity period exceeds 24 hours carries a status reference (`status.status_list` with `idx` and `uri`) (`status-reference`).
    - `MD+PA+Q`, `MD+AC+Q`, `MD+PA+PB`, `MD+AC+PB`, `MD+PA+E`, `MD+AC+E`: The Provider issues the credential (HTTP 200) in mdoc format, it passes every check of the reference validator, and a credential whose validity period exceeds 24 hours carries a status reference (the MSO `status` with a `status_list` or `identifier_list` entry) (`status-reference`).

## Comments

The named check runs in this test case only; the other checks of the reference validator run as in `AP_WS_IA_MainInteraction_001` and must pass too.

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+AC+Q` (`P-Q`, `P-SD`, `P-AC`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `MD+AC+Q` (`P-Q`, `P-MD`, `P-AC`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+AC+PB` (`P-PB`, `P-SD`, `P-AC`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `MD+AC+PB` (`P-PB`, `P-MD`, `P-AC`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`), `SD+AC+E` (`P-E`, `P-SD`, `P-AC`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`), `MD+AC+E` (`P-E`, `P-MD`, `P-AC`).
