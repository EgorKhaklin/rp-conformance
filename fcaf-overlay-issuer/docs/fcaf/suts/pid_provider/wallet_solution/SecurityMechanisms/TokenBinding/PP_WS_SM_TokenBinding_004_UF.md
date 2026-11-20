# PP_WS_SM_TokenBinding_004_UF

## Objective

Verify that the PID Provider rejects a DPoP proof with a wrong `htm` or `htu`, a missing or wrong `ath`, or a stale `iat`.

## References

- [RFC 9449] section 4.2
- [RFC 9449] section 4.3

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

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the `htm` claim of the DPoP proof of its credential request is `GET` (fault `dpop.htm-wrong`).
2. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the `htu` claim of the DPoP proof of its credential request is the credential endpoint URL with the path segment `/other` appended (fault `dpop.htu-wrong`).
3. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the DPoP proof of its credential request carries no `ath` claim (fault `dpop.ath-missing`).
4. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the `ath` claim of the DPoP proof of its credential request is the hash of another value than the access token (fault `dpop.ath-wrong`).
5. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that the `iat` claim of the DPoP proof of its credential request is the current time minus `T_proof` minus `T_skew` minus one hour (fault `dpop.iat-stale`).

## Expected results

1. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
3. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
4. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
5. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
