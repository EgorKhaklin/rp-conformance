# PP_WS_SM_ProofOfPossession_005_UF

## Objective

Verify that the PID Provider rejects a key proof with a missing, unknown or already used `nonce` with `invalid_nonce` at the credential endpoint in the pre-authorized code flow, and issues when the request is sent again with a fresh `c_nonce`.

## References

- [OpenID4VCI] sections 7 and 8.3.1.2
- [OpenID4VCI] Appendix F.1

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- DPoP server nonce used; nonce endpoint offered

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

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

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid (its `c_nonce` is replayed in the last step).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that its key proof carries no `nonce` claim.
3. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `nonce` claim of its key proof is a random value the SUT never issued.
4. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid except that the `nonce` claim of its key proof is the `c_nonce` of an earlier, answered credential request of the same Wallet Unit.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
2. The Provider refuses the credential request with HTTP 4xx and `error` `invalid_proof`, never HTTP 5xx. The Conformance Wallet then fetches a fresh `c_nonce` from the nonce endpoint and sends the request again with a valid proof over it, with the same access token: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. The Provider refuses the credential request with HTTP 4xx and `error` `invalid_nonce`, never HTTP 5xx. The Conformance Wallet then fetches a fresh `c_nonce` from the nonce endpoint and sends the request again with a valid proof over it, with the same access token: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
4. The Provider refuses the credential request with HTTP 4xx and `error` `invalid_nonce`, never HTTP 5xx. The Conformance Wallet then fetches a fresh `c_nonce` from the nonce endpoint and sends the request again with a valid proof over it, with the same access token: The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

The catalogue names `invalid_nonce` for all three stimuli. OpenID4VCI 1.0 section 8.3.1.2 makes a key proof without a `c_nonce` an `invalid_proof` and only a proof with an invalid `c_nonce` an `invalid_nonce`; the step without `nonce` follows the specification.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-DPN`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
