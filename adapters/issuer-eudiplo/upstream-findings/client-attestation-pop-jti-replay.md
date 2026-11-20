# A client attestation PoP whose `jti` was accepted before is accepted again

EUDIPLO 9.1.0-main.ae0792a. A token request carries a WIA and an `OAuth-Client-Attestation-PoP` whose `jti` equals the
`jti` of a PoP EUDIPLO accepted (token issued) in an earlier token request of the same Wallet Unit; everything else is
valid and fresh. EUDIPLO answers HTTP 200 with an access token and issues the PID
(`PP_WS_SM_ClientAttestation_009_UF`, step 4).

OAuth 2.0 Attestation-Based Client Authentication (PoP `jti`) lets the server reject replays; the catalogue requires
it. EUDIPLO keeps a `jti` store for DPoP proofs (`dpop_proof_jti`) but none for client attestation PoPs.
