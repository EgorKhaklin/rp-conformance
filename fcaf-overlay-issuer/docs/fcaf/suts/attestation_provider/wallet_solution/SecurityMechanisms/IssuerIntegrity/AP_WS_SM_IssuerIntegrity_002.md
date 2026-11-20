# AP_WS_SM_IssuerIntegrity_002

## Objective

Verify that the mdoc attestation's `IssuerAuth` is a COSE_Sign1 with an ECCG agreed `alg` and an `x5chain` validating to the Provider's issuance anchor, that `digestAlgorithm` is SHA-256 and that every value digest matches.

## References

- [ARF] Annex 2, PPNot_03
- [ISO/IEC 18013-5] section 9.1.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness inspects the mdoc credential of step 1.

## Expected results

1. Per variant:
    - `MD+PA+Q`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `QP-T` with its granted qualified EAA service on `TL-QEAA`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+PB`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PB-T` on `TL-PUB`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+E`: The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `EP-T` under the anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`), `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. Per variant:
    - `MD+PA+Q`: `IssuerAuth` is as ISO/IEC 18013-5 requires; the chain to `QP-T` is `issuer-trust` and the value digests `disclosures` of `ISS` (step 1). The named checks pass: `signer-algorithm` (`alg` is `ES256`, `ES384` or `ES512`, ECCG agreed, with the signer key on its curve); `signer-chain` (`x5c` or `x5chain` carries the signer certificate first and its intermediates in order, no self-issued trust anchor); `mdoc-digest-algorithm` (the MSO `digestAlgorithm` is `SHA-256`).
    - `MD+PA+PB`: `IssuerAuth` is as ISO/IEC 18013-5 requires; the chain to `PB-T` is `issuer-trust` and the value digests `disclosures` of `ISS` (step 1). The named checks pass: `signer-algorithm` (`alg` is `ES256`, `ES384` or `ES512`, ECCG agreed, with the signer key on its curve); `signer-chain` (`x5c` or `x5chain` carries the signer certificate first and its intermediates in order, no self-issued trust anchor); `mdoc-digest-algorithm` (the MSO `digestAlgorithm` is `SHA-256`).
    - `MD+PA+E`: `IssuerAuth` is as ISO/IEC 18013-5 requires; the chain to `EP-T` is `issuer-trust` and the value digests `disclosures` of `ISS` (step 1). The named checks pass: `signer-algorithm` (`alg` is `ES256`, `ES384` or `ES512`, ECCG agreed, with the signer key on its curve); `signer-chain` (`x5c` or `x5chain` carries the signer certificate first and its intermediates in order, no self-issued trust anchor); `mdoc-digest-algorithm` (the MSO `digestAlgorithm` is `SHA-256`).

## Comments

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

OIDF `happy-flow` covers this objective partly (issuer catalogue section 7).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`).
