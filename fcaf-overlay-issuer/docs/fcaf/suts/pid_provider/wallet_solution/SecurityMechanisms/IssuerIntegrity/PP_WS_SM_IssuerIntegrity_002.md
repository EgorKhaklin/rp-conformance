# PP_WS_SM_IssuerIntegrity_002

## Objective

Verify that the mdoc PID's `IssuerAuth` is a COSE_Sign1 with an ECCG agreed `alg` and an `x5chain` validating to the Provider's issuance anchor, that `digestAlgorithm` is SHA-256 and that every value digest matches.

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I` without mutation.
2. The harness inspects the mdoc credential of step 1.

## Expected results

1. The Provider issues the credential (HTTP 200) in mdoc format (`mso_mdoc`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. `IssuerAuth` is as ISO/IEC 18013-5 requires; the chain to `PP-T` is `issuer-trust` and the value digests `disclosures` of `ISS` (step 1). The named checks pass: `signer-algorithm` (`alg` is `ES256`, `ES384` or `ES512`, ECCG agreed, with the signer key on its curve); `signer-chain` (`x5c` or `x5chain` carries the signer certificate first and its intermediates in order, no self-issued trust anchor); `mdoc-digest-algorithm` (the MSO `digestAlgorithm` is `SHA-256`).

## Comments

Execute this test case once for each format named and each grant the Provider declares in its ICS (ICS-02, ICS-03).

OIDF `happy-flow` covers this objective partly (issuer catalogue section 7).

Variant `MD+PA` (`P-PID`, `P-MD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
