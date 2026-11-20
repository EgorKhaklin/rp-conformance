# Attestation Provider (SUT)

The **Attestation Provider** System Under Test covers a Provider that issues electronic attestations of attributes to Wallet Units with OpenID4VCI and publishes their status: a QEAA Provider, a PuB-EAA Provider or a non-qualified EAA Provider. Like the [PID Provider (SUT)](../pid_provider/index.md), it is a draft that mirrors the Wallet Solution class `WS_AP`, kept apart from the Relying Party SUT until the FCAF maintainers agree on it.

The Provider is tested as a black box in the same controlled environment as a PID Provider (see the [defaults](../../defaults.md#pid-provider-testing)), enrolled by the Test Registrar as the entity of its category, and it issues FCAF `default_credential_A` as its attestation. The [Provider ICS](../../ics-issuer.md) declares its category (ICS-01) and selects the applicable test cases.

## Test Classes within the Attestation Provider

- **AttestationProvider_WalletSolution (AP_WS)**: every objective of `PP_WS` that is not specific to the PID, and the objectives specific to Attestation Providers: configurations that are not device-bound, the key attestation levels a configuration requires, embedded disclosure policies, revocation chaining as the Provider declares it, the revocation method of a non-qualified EAA, and the rulebook of the attestation.
- **AttestationProvider_RelyingParty (AP_RP)**: the status lists the Provider publishes for Relying Parties, as `PP_RP`.
- **AttestationProvider_Infrastructure (AP_Inf)**: use of the Wallet Provider list of trusted entities, and the consistency of the Provider's signers with the anchors published for its category, as `PP_Inf`.

A test case of `PP_*` that the catalogue does not mark **PID only** applies here with the same number (catalogue section 2.1); the objectives specific to Attestation Providers are numbered from 100.

## Variants

Besides the credential format (`SD`, `MD`) and the grant (`PA`, `AC`), each test case runs in the category variant of the Provider:

| Variant | Category | Enrolled as | Root of trust of its attestations |
| --- | --- | --- | --- |
| `Q` | QEAA Provider | `QP-T` | A granted qualified EAA service (`EAA/Q`) in `TL-QEAA`, the Trusted List the LOTL points to |
| `PB` | PuB-EAA Provider | `PB-T` | Its issuance service in `TL-PUB` |
| `E` | non-qualified EAA Provider | `EP-T` | The anchor `CA-EP-T` that the rulebook of `default_credential_A` defines (`TA-EAA`) |

Each test case page shows its variants in its comments; where the variants differ in a step, the step lists the text per variant.

## Decisions applied in these test cases

- What an Attestation Provider does when the status of a Wallet Instance Attestation or key attestation cannot be obtained is its declared policy (ICS-18), and the expected result follows it (`POLICY`).
- Whether an Attestation Provider revokes its attestations with the Wallet Unit is its declared policy (ICS-07, WURevocation_19).
- A configuration may be not device-bound (ICS-04, `P-NDB`): the attestation is then issued with the Wallet Instance Attestation only.
