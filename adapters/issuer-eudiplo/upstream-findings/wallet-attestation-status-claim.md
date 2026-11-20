# Status of a WIA or KA in the TS3 1.5 format is never checked (`client_status`, `key_storage_status`)

Basis: **EUDI profile only.** The requirement is in TS3 (EUDI Wallet Technical Specification 3, "Wallet Unit
Attestations") version 1.5 of 2026-03-15 and later; quoted from v1.5.2. EUDIPLO implements the earlier format, which
OpenID4VCI 1.0 (Appendices D.1 and E) and TS3 1.4.1 define, correctly: there the status reference is the top-level
`status` claim. The request is to support the TS3 1.5 claims as well.

## The two formats

- OpenID4VCI 1.0 Appendix D.1 (key attestation) and Appendix E (wallet attestation): an optional top-level `status`
  claim, "Status mechanism for the Wallet Attestation as defined in [I-D.ietf-oauth-status-list]". TS3 1.4.1: a KA
  "SHALL also include the `status` object as specified in appendix D.1 of OID4VCI", and a WIA has no revocation
  mechanism.
- TS3 1.5 and later (v1.5.2 sections 2.3.1, 2.3.2, 2.4.1): the WIA carries `client_status` with `status` (the Token
  Status List reference of the Wallet Instance) and `exp` (the end of the revocation maintenance period); the KA
  carries `key_storage_status` with `status` and `exp`. Section 2.4.3: "A PID Provider SHALL check the revocation status
  of **both** the WIA and the KA received during issuance at least once every 24 hours for the validity period of the
  PID. If either is revoked, the PID Provider SHALL revoke the PID."

## What EUDIPLO does

With `walletAttestationStatusCheckMode: strict`, EUDIPLO reads the status reference only from a top-level `status`
claim (`getStatusEntryFromJwt`: `decodeJwt(jwt).status`), finds none in a TS3 1.5 WIA or KA, and logs for every
issuance:

```text
[WalletAttestationService] Wallet attestation does not contain status claim - skipping status check
[WalletAttestationService] Key attestation does not contain status claim - skipping status check
```

So for a TS3 1.5 WIA or KA no status list is ever requested:

| Test case (issuer suite) | Stimulus | EUDIPLO |
| --- | --- | --- |
| `PP_WS_SM_ClientAttestation_012_UF` | the WIA's entry in its status list is revoked | issues the PID |
| `PP_WS_SM_KeyAttestation_008_UF` | the KA's entry is revoked | issues the PID |
| `PP_WS_SM_ClientAttestation_013_UF`, `PP_WS_SM_KeyAttestation_009_UF` | the WIA's or KA's list answers HTTP 404 or 500, or is a bad Status List Token (bad signature, `alg` `none`, expired, wrong `sub`, wrong signer, …) | issues the PID; the list URL is never requested |
| `PP_WS_IA_Reissuance_005_UF` | the Wallet Instance is revoked, then the refresh grant is used | gives a new access token and a new PID |
| `PP_WS_SM_Revocation_007` | the WSCD (KA entry) is revoked after issuance | the PID stays valid; no wallet unit is recorded for chaining (`checkStatus` records one only from a top-level `status`) |
| `PP_WS_SH_Encoding_004_UF`, steps 3 and 4 | `client_status` / `key_storage_status` point to `http://169.254.169.254/…` | issues the PID |

The last row shows only that the TS3 claims are not read, not a weakness against server-side request forgery: with the
same address in a top-level `status` (steps 5 and 6 of the same test case) EUDIPLO reads it and refuses the attestation
whose status it cannot obtain. Likewise `PP_WS_SH_Encoding_005_UF` (a status list that is a decompression bomb) cannot
show anything while the list is never fetched; it is no evidence for this report.

The missing revocation chaining for the WIA is a separate gap, reported in
[wia-revocation-chaining.md](wia-revocation-chaining.md): even with a top-level `status`, EUDIPLO follows only the KA.

## Where in the source

- `StatusListVerifierService.getStatusEntryFromJwt` reads `decodeJwt(jwt).status`:
  [status-list-verifier.service.ts](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/status-list-verifier.service.ts).
- `WalletAttestationService` skips the check when it finds no such claim:
  [wallet-attestation.service.ts](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/wallet-attestation.service.ts).

Suggested change: read `client_status.status` for a WIA and `key_storage_status.status` for a KA, and keep reading a
top-level `status` for attestations in the earlier format.

## How to reproduce

```bash
pnpm rp-conformance issuer run --adapter eudiplo --only 'PP_WS_SM_ClientAttestation_012_UF,PP_WS_SM_KeyAttestation_008_UF'
```

Both FAIL: the PID is issued for the revoked Wallet Instance or WSCD (`artifacts/<test case>/SD+PA/step-2/`), and the
Test Status Provider logs no request for the list during the step.
