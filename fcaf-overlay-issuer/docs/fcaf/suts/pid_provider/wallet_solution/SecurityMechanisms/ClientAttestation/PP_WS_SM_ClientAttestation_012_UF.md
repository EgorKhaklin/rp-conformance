# PP_WS_SM_ClientAttestation_012_UF

## Objective

Verify that the PID Provider rejects the WIA of a revoked Wallet Instance at the token endpoint in the pre-authorized code flow.

## References

- [ARF] Annex 2, ISSU_21, ISSU_30a, WUA_25, WUA_26
- [Token Status List]
- [TS3] section 2.5

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC
- Attestation-Based Client Authentication

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The Test Wallet Provider revokes the Wallet Instance of `CW-1`: the entry of its WIA in `SL-WP-A` is set to 1 (revoked), in a new version of the list signed under the revocation anchor of `WP-A` and served under a URL of this test case, to which the status reference of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; its WIA refers to the revoked entry.

## Expected results

1. The Test Wallet Provider serves the list; recorded in the report.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
