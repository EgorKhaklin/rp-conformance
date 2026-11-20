# Unsecured key proof (`alg` `none`) is refused with `invalid_credential_request` instead of `invalid_proof`

Basis: OpenID4VCI 1.0, section 8.3.1.2 (minor). The proof is rejected; only the error code differs.

EUDIPLO 9.1.0-main.ae0792a. A credential request whose only `jwt` key proof has `alg` `none` and an empty signature is
refused with HTTP 400 and `error` `invalid_credential_request` (`PP_WS_SM_ProofOfPossession_002_UF`, step 1). HS256 and
ES256K proofs get `invalid_proof`.

OpenID4VCI 1.0 section 8.3.1.2: "The error parameter SHOULD be a single ASCII [USASCII] error code from the following",
with `invalid_proof` for "one of the provided key proofs is invalid"; and "For errors related to the Credential
Request's payload, such as issues with type, format, proofs, ... the specific error codes from this section MUST be used
instead of the generic invalid_request". `invalid_credential_request` is one of those codes, so the request is rejected
correctly; the more specific `invalid_proof` would tell the wallet that the proof is the problem, as it does for HS256
and ES256K.
