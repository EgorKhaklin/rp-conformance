# The `nonce` of a KA in a `jwt` proof is not checked

EUDIPLO 9.1.0-main.ae0792a, nonce endpoint offered.

OpenID4VCI 1.0 Appendix F.1 (`key_attestation`): if the Credential Issuer provided a `c_nonce`, the `nonce` claim in the
key attestation MUST be set to a server-provided `c_nonce`; Appendix F.4 verifies it. EUDIPLO issues the PID when the
KA in the `key_attestation` header of a valid `jwt` proof

- carries the `c_nonce` of another, completed session (`PP_WS_SM_KeyAttestation_007_UF`, step 3), or
- carries no `nonce` at all (step 4).

As the `attestation` proof type, a KA without `nonce` is rejected (step 5 passes).
