# Relying Party and PID Provider conformance

!!! warning "Unofficial draft"

    This site is not published or endorsed by the European Commission. It shows the Functional Conformance Assessment Framework (FCAF), as on its `submitted` branch at commit `@FCAF_SUBMITTED@`, with a proposed **Relying Party** System Under Test and a draft **PID Provider** System Under Test added. The official FCAF is at [conformance.eudi.dev](https://conformance.eudi.dev).

The FCAF tests only the Wallet Solution. This project adds the tests a Relying Party must pass: a service that requests and verifies PIDs and attestations from Wallet Units. The focus is on what it must reject: expired credentials, revoked or suspended credentials, unusable status lists, wrong trust anchors, stale trust lists, faulty response encryption.

It also adds the tests a PID Provider must pass when it issues PIDs with OpenID4VCI: the metadata and offers it publishes, the Wallet Instance Attestations, key attestations and proofs it must reject, the PID it issues, checked against the PID Rulebook, and the status lists it publishes. These test cases are a separate draft, since the FCAF methodology does not reserve test classes for Providers.

## Where to start

| Page | Content |
| --- | --- |
| [Relying Party (SUT)](fcaf/suts/relying_party/index.md) | Overview, test classes, the decisions applied |
| [(rp_ws) Wallet Solution](fcaf/suts/relying_party/wallet_solution/rp_ws.md) | Test cases on what the Relying Party receives from a Wallet Unit: validity, revocation, trust, session encryption |
| [(rp_pp) PID Provider](fcaf/suts/relying_party/pid_provider/rp_pp.md) | Test cases on the Status List Tokens and identifier lists of a PID Provider |
| [Defaults: Relying Party testing](fcaf/defaults.md#relying-party-testing) | Test roles, verification result, default configuration, credentials and queries |
| [ICS (Relying Party)](fcaf/ics-rp.md) | Capabilities, policies, time values and surrogate technology items a Relying Party declares |
| [PID Provider (SUT)](fcaf/suts/pid_provider/index.md) | Overview, test classes, variants, the decisions applied |
| [(pp_ws) Wallet Solution](fcaf/suts/pid_provider/wallet_solution/pp_ws.md) | Test cases on what the PID Provider receives from and issues to a Wallet Unit: metadata, offer, credential endpoint, client and key attestation, proofs, validity, revocation, the PID data model |
| [(pp_rp) Relying Party](fcaf/suts/pid_provider/relying_party/pp_rp.md) | Test cases on the status lists a PID Provider publishes for Relying Parties |
| [Attestation Provider (SUT)](fcaf/suts/attestation_provider/index.md) | Overview, test classes, the category variants `Q`, `PB` and `E`, the decisions applied |
| [(ap_ws) Wallet Solution](fcaf/suts/attestation_provider/wallet_solution/ap_ws.md) | Test cases on what a QEAA, PuB-EAA or non-qualified EAA Provider receives from and issues to a Wallet Unit, including configurations that are not device-bound, revocation chaining by policy and the rulebook of the attestation |
| [Defaults: PID Provider testing](fcaf/defaults.md#pid-provider-testing) | Test roles, trust configuration, Wallet Units and subjects, `default_configuration_PP_1`, expected result codes |
| [ICS (PID and Attestation Provider)](fcaf/ics-issuer.md) | The Provider ICS items and the profiles they select |
| [Relying Party suite](rp/index.md) | The Relying Party suite, its catalogue and harness design, and EUDIPLO as reference verifier with its ICS and known findings |
| [Issuer suite](issuer/index.md) | The issuer suite, its catalogue and harness design, and EUDIPLO as reference issuer with its ICS and known findings |

Everything else is the FCAF itself; of its pages only the defaults, the references, the navigation and the SUT overview are extended.

## The harness

The test cases are rendered from executable definitions. The [harness](https://github.com/cre8/rp-conformance) runs them unattended against a Relying Party or a PID Provider through an adapter: a Conformance Wallet, status list and trust list servers, and an artifact forge that injects exactly one fault per test step, both over redirects and over the W3C Digital Credentials API; for a PID Provider an issuance client with a Test Wallet Provider and a Test Registrar. The [README](https://github.com/cre8/rp-conformance#readme) shows how to run it, and each suite has its test catalogue, which traces every test objective to the ARF, and its harness design: [Relying Party suite](rp/index.md), [issuer suite](issuer/index.md).

## Licence

[EUPL-1.2](https://github.com/cre8/rp-conformance/blob/main/LICENSE). The FCAF content is © European Union, under the same licence.
