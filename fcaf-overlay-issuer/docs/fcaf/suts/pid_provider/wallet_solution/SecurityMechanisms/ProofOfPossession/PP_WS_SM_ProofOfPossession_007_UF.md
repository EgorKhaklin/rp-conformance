# PP_WS_SM_ProofOfPossession_007_UF

## Objective

Record how the PID Provider treats a key proof whose `iss` differs from the `client_id` at the credential endpoint in the authorization code flow with PAR and PKCE.

## References

- [OpenID4VCI] Appendix F.1
- [OpenID4VCI] Appendix F.4

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (authorization code flow with PAR and PKCE). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `iss` claim of its key proof is `other-wallet-unit` instead of the `client_id`.

## Expected results

1. Whether the Provider rejects the request (`invalid_proof`) or issues the PID is recorded; HTTP 5xx fails. The proof violates Appendix F.1 ("The value of this claim MUST be the `client_id` of the Client making the Credential request"), but the checks a Credential Issuer MUST make in Appendix F.4 do not include `iss`.

## Comments

Informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): F.1 binds the wallet, and F.4 lists no `iss` check. Rejecting the proof is the hardened behaviour.

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
