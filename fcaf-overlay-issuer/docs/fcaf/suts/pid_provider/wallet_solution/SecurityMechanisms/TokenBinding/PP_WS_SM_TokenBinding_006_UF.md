# PP_WS_SM_TokenBinding_006_UF

## Objective

Verify that a PID Provider that requires a DPoP server nonce rejects a proof without it with `use_dpop_nonce` and a new `DPoP-Nonce`, and that the retry with the nonce succeeds.

## References

- [RFC 9449] section 8
- [RFC 9449] section 9

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
5. The Provider declares that it uses a DPoP server nonce (ICS-13.dpop_nonce Yes).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the DPoP proof of its token request carries no `nonce` claim, and the Conformance Wallet does not retry with the `DPoP-Nonce` before the first answer (fault `dpop.nonce-omitted`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` without mutation: it answers `use_dpop_nonce` with one retry carrying the `DPoP-Nonce`.

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object with `error` `use_dpop_nonce`; never HTTP 5xx.
2. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.

## Comments

NOT APPLICABLE when the Provider declares no DPoP server nonce (ICS-13.dpop_nonce No): `P-DPN` also stands for the nonce endpoint.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-DPN`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
