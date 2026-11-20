# WIA and KA are accepted under each other's anchor of the same Wallet Provider

EUDIPLO 9.1.0-main.ae0792a. `TL-WP` lists Wallet Provider `WP-A` with two issuance services: `WP-A Wallet` (the WIA CA)
and `WP-A WSCD` (the KA CA), as TS3 v1.5.2 section 3.2 maps ServiceName to `wallet_name` / WSCD type.

- A WIA (`wallet_name` `WP-A Wallet`) signed by a certificate under the KA CA `CA-WP-A-KA` is accepted at the token
  endpoint (`PP_WS_SM_ClientAttestation_006_UF`).
- A KA signed by a certificate under the WIA CA `CA-WP-A` is accepted at the credential endpoint
  (`PP_WS_SM_KeyAttestation_004_UF`, stimulus (d)).

EUDIPLO matches the signer against every Wallet Solution issuance service of the entity
(`apps/backend/src/trust/wallet-attestation.service.ts`, `acceptedServiceTypes: [...walletSolutionServiceTypes]`,
`matchAttestationSigner`) and does not distinguish the service an attestation of that purpose must chain to.

Expected: a WIA chains to the service named by its `wallet_name`, a KA to the WSCD service.
