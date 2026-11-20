# Unsecured key proof (`alg` `none`) is refused with `invalid_credential_request` instead of `invalid_proof`

EUDIPLO 9.1.0-main.ae0792a. A credential request whose only `jwt` key proof has `alg` `none` and an empty signature is
refused with HTTP 400 and `error` `invalid_credential_request` (`PP_WS_SM_ProofOfPossession_002_UF`, step 1). HS256 and
ES256K proofs get `invalid_proof`. OpenID4VCI 1.0 section 8.3.1.2: an invalid key proof is `invalid_proof`.
