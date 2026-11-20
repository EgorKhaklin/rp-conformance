# PP_WS_IA_AuthorizationCode_007

## Objective

Verify that the PID Provider returns the `state` of the authorization request unaltered, and its issuer identifier as `iss`, in the authorization response.

## References

- [RFC 6749] section 4.1.2
- [RFC 9207] section 2
- [HAIP] section 4

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
5. The adapter completes the authentication of `SUBJ-1` at the Provider (`authenticateSubject`, ICS-03).
6. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format, authorization code grant with `issuer_state`. `CW-1` runs `SCN-I` without mutation up to the authorization response, and captures it.

## Expected results

1. The redirect to the `redirect_uri` of `CW-1` carries `state` equal to the `state` of the pushed authorization request, and `iss` equal to the `issuer` of the Authorization Server metadata.

## Comments

OIDF `fapi2-…-happy-flow`. A positive check: it is gated on the positive control like the `_UF` test cases of the area, since it needs the same working flow.

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
