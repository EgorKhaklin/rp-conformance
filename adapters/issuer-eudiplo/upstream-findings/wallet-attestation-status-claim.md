# Status of a TS3 WIA or KA is never checked (`client_status` / `key_storage_status`)

EUDIPLO 9.1.0-main.ae0792a, issuance configuration with `walletAttestationStatusCheckMode: strict`.

Since TS3 1.5 (v1.5.2 sections 2.3.1, 2.3.2, 2.4.3) a WIA carries its Token Status List reference in
`client_status.status` and a KA in `key_storage_status.status`; TS3 2.4.3 requires PID and Attestation Providers to
check the KA revocation status at issuance. EUDIPLO reads the reference only from a top-level `status` claim
(`apps/backend/src/trust/status-list-verifier.service.ts` `getStatusEntryFromJwt`: `decodeJwt(jwt).status`), finds
none, and logs for every issuance:

```
[WalletAttestationService] Wallet attestation does not contain status claim - skipping status check
[WalletAttestationService] Key attestation does not contain status claim - skipping status check
```

Effect, shown by the issuer suite (cre8/rp-conformance issue 19): a PID is issued for a revoked Wallet Instance
(`PP_WS_SM_ClientAttestation_012_UF`) or WSCD (`PP_WS_SM_KeyAttestation_008_UF`), and when the status list answers
HTTP 404/500 or is a bad Status List Token (bad signature, `alg` `none`, expired, wrong `sub`, wrong signer, …;
`_013_UF`, `_009_UF`). The list URL is never requested. Revocation chaining (`revokeWithWalletUnit`) cannot follow a
TS3 KA either.

Expected: read `client_status.status` and `key_storage_status.status` (and keep `status` for pre-1.5 attestations).

Revocation chaining (cre8/rp-conformance issue 26): with `revokeWithWalletUnit` on both PID configurations and
`WALLET_UNIT_STATUS_CHECK_INTERVAL` 30 s, revoking the Wallet Instance (`PP_WS_SM_Revocation_006`) or the WSCD (`_007`)
in a list that the TS3 WIA or KA of the issuance references leaves the PID valid in every poll for 7 minutes. No wallet
unit is recorded for a KA without a top-level `status` (`openid-credential-proof-verifier.ts` `checkStatus`), and a
WIA's status is checked once at the token endpoint only, so neither revocation can chain.
