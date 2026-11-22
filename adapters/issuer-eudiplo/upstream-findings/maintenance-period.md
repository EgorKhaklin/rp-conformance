# PID expiry is not bounded by the revocation maintenance period of the WIA and KA

Basis: **EUDI profile only**, TS3 (Wallet Unit Attestations) v1.5.2 section 2.4.3 and ARF Annex 2 ISSU_12c. The
maintenance period (`client_status.exp`, `key_storage_status.exp`) exists only since TS3 1.5; neither OpenID4VCI 1.0
nor TS3 1.4.1 has it.

## What the specification says

- TS3 v1.5.2 section 2.4.3: "The technical validity period of a PID SHALL end before the `client_status.exp` of the WIA
  and the `key_storage_status.exp` of the KA shown to the PID Provider in the issuance process."
- ARF Annex 2 ISSU_12c: "The expiration date of a PID SHALL be no later than the end of the revocation maintenance
  periods of the WIA and the KA presented as part of the PID issuance process."
- TS3 v1.5.2 section 2.4.2: a Wallet Provider ensures that a Wallet Unit "can always present WIAs and KAs whose
  `client_status.exp` and `key_storage_status.exp` (respectively) are at least 31 days in the future". A Provider can
  ask for more with `preferred_client_status_period` and `preferred_key_storage_status_period` (section 2.4).

## What EUDIPLO does

EUDIPLO reads neither value. With a PID configuration of 30 days:

- A WIA whose maintenance period ends tomorrow (`client_status.exp` = now + 1 day) is neither rejected nor does it
  shorten the PID: its `exp` is 30 days later (`PP_WS_SM_ClientAttestation_016_UF`).

The PID of a WIA or KA with the 31 days TS3 guarantees ends in time anyway, since 30 days rounded up to the hour is
shorter (`PP_WS_SM_ClientAttestation_015` and `PP_WS_SM_KeyAttestation_011` with a maintenance period of 31 days). A
configuration with a longer lifetime would outlive it the same way as in `_016_UF`.

## Suggested change

Bound the PID's `exp` by the earlier of `client_status.exp` and `key_storage_status.exp` (or reject an attestation whose
remaining period is below a configured minimum, and publish that minimum as `preferred_client_status_period` /
`preferred_key_storage_status_period`).

## How to reproduce

```bash
pnpm rp-conformance issuer run --adapter eudiplo --only PP_WS_SM_ClientAttestation_016_UF
```

FAIL: `maintenance-period` fails on the issued PID (`artifacts/PP_WS_SM_ClientAttestation_016_UF/SD+PA/step-1/`).
