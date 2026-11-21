# Suggestion (hardening): detect a replayed client attestation PoP `jti`

**Not a conformance finding.** OAuth 2.0 Attestation-Based Client Authentication
(draft-ietf-oauth-attestation-based-client-auth-08) section 12.1: "An Authorization Server SHOULD implement measures to
detect replay attacks by the Client Instance", with a list of witnessed `jti` values as one of the RECOMMENDED options.
There is no MUST; the suite records the case as informational (`PP_WS_SM_ClientAttestation_009_UF`, step 4, INFO since
the spec review of 2026-11-20).

EUDIPLO 9.1.0-main.ae0792a. A token request carries a WIA and an `OAuth-Client-Attestation-PoP` whose `jti` equals the
`jti` of a PoP EUDIPLO accepted in an earlier token request of the same Wallet Unit; everything else is valid and fresh.
EUDIPLO answers HTTP 200 with an access token and issues the PID. A PoP with a stale `iat` is rejected (step 3), so the
replay window is bounded by EUDIPLO's `iat` check.

Suggestion: EUDIPLO already keeps a `jti` store for DPoP proofs (`dpop_proof_jti`); the same store, keyed by the client,
for client attestation PoPs within their `iat` window would close the window.
