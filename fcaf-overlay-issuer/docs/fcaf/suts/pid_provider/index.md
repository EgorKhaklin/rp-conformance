# PID Provider (SUT)

The **PID Provider** System Under Test covers a Provider that issues PIDs to Wallet Units with OpenID4VCI and publishes their status: its Credential Issuer and Authorization Server, the credentials it signs, and the status lists and identifier lists it publishes. The FCAF methodology does not reserve test classes for Providers; this draft mirrors the Wallet Solution classes `WS_PP` and `WS_AP` and is kept apart from the Relying Party SUT until the FCAF maintainers agree on it.

The Provider is tested as a black box in the controlled environment described in the [defaults](../../defaults.md#pid-provider-testing). A Conformance Wallet runs the issuance with Wallet Instance Attestations and key attestations of a Test Wallet Provider, all valid except for the one deviation a test step defines, and a reference validator checks every credential, metadata document and status list the Provider returns. The [Provider ICS](../../ics-issuer.md) selects the applicable test cases.

## Test Classes within the PID Provider

- **PidProvider_WalletSolution (PP_WS)**: issuance interface: metadata, credential offer, every OpenID4VCI endpoint, the validation of Wallet Instance Attestations, key attestations and proofs, and the PID it issues.
- **PidProvider_RelyingParty (PP_RP)**: the status lists and identifier lists the Provider publishes for Relying Parties.
- **PidProvider_Infrastructure (PP_Inf)**: use of the Wallet Provider list of trusted entities, and the consistency of the Provider's signers with the anchors published for it.

Attestation Providers (`AP_*`) follow the same objectives with the category variants `Q`, `PB` and `E` and are not written yet.

## Variants

A test case runs once per variant the Provider's ICS declares: the credential format (`SD` for SD-JWT VC, `MD` for mdoc) and the grant (`PA` for the pre-authorized code flow, `AC` for the authorization code flow with PAR and PKCE). Each test case page shows its variants in its comments; where the variants differ in a step, the step lists the text per variant.

## Decisions applied in these test cases

- The Provider is enrolled under the test PKI before testing (`default_configuration_PP_1`), so every trust test has exactly one correct outcome.
- A Provider rejects a request with a 4xx and an OAuth or OpenID4VCI error object; any defined error code passes unless a specification requires a particular one.
- A PID Provider rejects a Wallet Instance Attestation or key attestation whose status cannot be obtained.
- The time limits `T_rev` and `T_chain` within which a revocation is published are declared in the ICS, each at most 24 hours.
