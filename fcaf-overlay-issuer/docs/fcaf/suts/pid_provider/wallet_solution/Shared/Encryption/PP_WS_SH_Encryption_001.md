# PP_WS_SH_Encryption_001

## Objective

Verify that with `credential_response_encryption` the PID Provider answers with a JWE to the key of the Wallet Unit, with an advertised `alg` and `enc`.

## References

- [OpenID4VCI] section 8.2
- [OpenID4VCI] section 8.3
- [OpenID4VCI] section 10

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Credential request and response encryption

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

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation, except that the credential request is a JWE (`ECDH-ES`, the first advertised `enc`) to the key of `credential_request_encryption`, and carries `credential_response_encryption` with an ephemeral P-256 key (`alg` `ECDH-ES`) and the first advertised `enc`.

## Expected results

1. The Provider answers with a JWE (`application/jwt`) that `CW-1` decrypts with its ephemeral key. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-ENC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
