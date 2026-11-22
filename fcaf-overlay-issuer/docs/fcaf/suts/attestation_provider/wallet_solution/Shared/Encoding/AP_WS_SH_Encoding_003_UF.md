# AP_WS_SH_Encoding_003_UF

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider does not dereference a `jku`, `x5u` or `kid` URL in the header of a proof, WIA or KA.
- `SD+PA+PB`: Verify that the PuB-EAA Provider does not dereference a `jku`, `x5u` or `kid` URL in the header of a proof, WIA or KA.
- `SD+PA+E`: Verify that the non-qualified EAA Provider does not dereference a `jku`, `x5u` or `kid` URL in the header of a proof, WIA or KA.

## References

- [RFC 8725] section 3.10

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

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its WIA additionally carries a `jku` member pointing to the Test Status Provider (fault `wia.jku-header`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its WIA additionally carries an `x5u` member pointing to the Test Status Provider (fault `wia.x5u-header`).
3. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its KA additionally carries a `jku` member pointing to the Test Status Provider (fault `ka.jku-header`).
4. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its KA additionally carries an `x5u` member pointing to the Test Status Provider (fault `ka.x5u-header`).
5. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its key proof additionally carries a `jku` member pointing to the Test Status Provider (fault `proof.jku-header`).
6. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the header of its key proof additionally carries a `kid` member whose value is a URL of the Test Status Provider (fault `proof.kid-url`).

## Expected results

1. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.
2. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.
3. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.
4. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.
5. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.
6. The Test Status Provider logs no request for the URL the fault points to during the step. Whether the Provider rejects the request or issues the attestation (ignoring the header) is recorded; both conform.

## Comments

RFC 8725 section 3.10 warns against "blindly following a "jku" (JWK set URL) or "x5u" (X.509 URL) header" and says applications "SHOULD protect against such attacks"; it does not require rejecting a JWS that carries one. The verdict is therefore NOFETCH alone (spec review 2026-11-20, issuer catalogue section 8.3).

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`).
