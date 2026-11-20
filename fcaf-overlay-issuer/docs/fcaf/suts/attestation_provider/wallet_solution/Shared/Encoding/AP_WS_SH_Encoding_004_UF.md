# AP_WS_SH_Encoding_004_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider fetches no status `uri` of a WIA or KA that fails signature validation, and no validly signed status `uri` that points to a private address.
- `SD+PA+PB`: Verify that the PuB-EAA Provider fetches no status `uri` of a WIA or KA that fails signature validation, and no validly signed status `uri` that points to a private address.
- `SD+PA+E`: Verify that the non-qualified EAA Provider fetches no status `uri` of a WIA or KA that fails signature validation, and no validly signed status `uri` that points to a private address.

## References

- [Token Status List] section 6.2
- [Token Status List] section 11.4
- [OWASP] Server-Side Request Forgery

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under the entity of its category (`QP-T` with a granted qualified EAA service on `TL-QEAA`, `PB-T` on `TL-PUB`, or `EP-T` under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of the entity of its category, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `AP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that its WIA is signed by a certificate issued by `CA-X`, and the `uri` of its status reference points to a URL of the Test Status Provider that no other step uses (fault `wia.ca-x-status-uri`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that its KA is signed by a certificate issued by `CA-X`, and the `uri` of its status reference points to a URL of the Test Status Provider that no other step uses (fault `ka.ca-x-status-uri`).
3. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the `uri` of the status reference in the `client_status` claim of its WIA is `http://169.254.169.254/latest/meta-data/status`, a link-local address (fault `wia.status-uri-private`).
4. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the `uri` of the status reference in the `key_storage_status` claim of its KA is `http://169.254.169.254/latest/meta-data/status`, a link-local address (fault `ka.status-uri-private`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx. The Test Status Provider logs no request for the URL the fault points to during the step.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx. The Test Status Provider logs no request for the URL the fault points to during the step.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
4. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

A request to `169.254.169.254` does not reach the Test Status Provider, so the harness cannot log it: steps 3 and 4 expect REJ only. Whether the Provider tried the address is visible in its own logs (for EUDIPLO, `OUTBOUND_URL_ALLOW_PRIVATE_NETWORK` decides).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
