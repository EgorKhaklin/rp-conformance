# Changing the embedded disclosure policy leaves the attestations issued under the old one valid

Not reported upstream yet; this is the issue text prepared for it. Found by `AP_WS_SM_Revocation_102` [`SD+PA+Q`] of the
issuer suite (issue 27, EUDIPLO as QEAA Provider) against `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`
(`9.1.0-main.ae0792a`) on 2026-11-20.

## What happens

A configuration with `embeddedDisclosurePolicy` `{ "policy": "allowList", "values": ["https://rp.rp-test"] }` issues an
attestation with a status list entry. The policy is then changed with `PATCH /api/issuer/credentials/{id}`
(`values: ["https://rp-b.rp-test"]`); `GET /api/issuer/credentials/{id}` returns the new policy, and the metadata
publishes it as `disclosure_policy`. The attestation issued under the old policy stays valid: its entry is `0x00` in
every version of the status list polled for `T_rev` (60 s) after the change, while a revocation through
`POST /api/session/revoke` is published within that time.

ARF Annex 2, EDP_11: when an Attestation Provider changes the embedded disclosure policy of an attestation type, it
revokes the attestations issued with the previous policy, so that Wallet Units obtain new ones carrying the new policy.

## Why

`CredentialConfigService.update` (`apps/backend/src/issuer/configuration/credentials/credentials.service.ts`, called by
`PATCH /api/issuer/credentials/{id}` in `credential-config.controller.ts`, line 75) stores the configuration and does not
touch the status list entries of the credentials issued under it.

## Suggested fix

When `embeddedDisclosurePolicy` of a configuration changes, revoke (status `0x01`) the entries of the credentials issued
under that configuration with the previous policy, or offer it as an option of the update.
