# AP_WS_SM_Revocation_100

## Objective

- `SD+PA+Q`: Verify that the QEAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in SD-JWT VC format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.
- `SD+PA+PB`: Verify that the PuB-EAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in SD-JWT VC format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.
- `SD+PA+E`: Verify that the non-qualified EAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in SD-JWT VC format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.
- `MD+PA+Q`: Verify that the QEAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in mdoc format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.
- `MD+PA+PB`: Verify that the PuB-EAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in mdoc format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.
- `MD+PA+E`: Verify that the non-qualified EAA Provider follows the revocation chaining policy it declares (ICS-07): when the Test Wallet Provider revokes the Wallet Instance of `CW-1`, the attestation in mdoc format issued to it is revoked within `T_chain` if the Provider chains, and stays valid if it does not.

## References

- [ARF] Annex 2, WURevocation_19, VCR_07d
- [TS3] section 2.5

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- OpenID4VCI
- SD-JWT VC
- Token Status List
- ISO/IEC 18013-5 mdoc

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3) as the entity of its category: its credential signer under `QP-T` (a granted qualified EAA service on `TL-QEAA`), `PB-T` (on `TL-PUB`) or `EP-T` (under the rulebook anchor `CA-EP-T`), its status list signer under the revocation anchor of that entity, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) with FCAF `default_credential_A` as its attestation, and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).
5. The Provider declares in ICS-07 whether it chains revocation (WURevocation_19), and `T_chain` when it does.

## Test Scenario

1. The Test Wallet Provider serves `SL-WP-A` for this test case under a URL of its own, every entry valid, and the WIA of `CW-1` in the following steps refers to it with the unit's Wallet Instance entry.
2. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in SD-JWT VC format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid (the WIA refers to the list of step 1).
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The adapter creates a credential offer for `SUBJ-1` and the attestation configuration in mdoc format, pre-authorized code. `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA, all valid (the WIA refers to the list of step 1).
3. The Test Wallet Provider revokes the Wallet Instance of `CW-1`: it serves a new version of the list of step 1, under the same URL, with the unit's Wallet Instance entry `0x01` (INVALID) and every other entry unchanged.
4. The harness polls the status list of the credential of step 2 anonymously every `min(T_chain / 20, 30 s)` until `T_chain` (ICS-07; for a Provider that does not chain, the `T_chain` of the suite's default, the declared value of the ICS) after the revocation of the Wallet Instance, keeping every version.

## Expected results

1. What the Test Wallet Provider served, and when, is recorded.
2. Per variant:
    - `SD+PA+Q`, `SD+PA+PB`, `SD+PA+E`: The Provider issues the attestation (HTTP 200) in SD-JWT VC format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
    - `MD+PA+Q`, `MD+PA+PB`, `MD+PA+E`: The Provider issues the attestation (HTTP 200) in mdoc format. It passes format, `issuer-trust` to the entity of the Provider's category, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks.
3. What the Test Wallet Provider served, and when, is recorded.
4. The outcome follows ICS-07: a Provider that chains shows the entry as `0x01` (INVALID) no later than `T_chain` after the revocation, and in every later version polled (`REVOKED(T_chain)`); one that does not chain shows it as `0x00` (VALID) in every version polled (`UNCHANGED`).

## Comments

Long running: the steps that wait run after the other test cases, in parallel (issuer harness design section 6.3).

The catalogue names `P-CHAIN` in the `Var` column, but the objective covers both answers of ICS-07 (`POLICY`), so the test case applies to every Attestation Provider.

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-REV`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-REV`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-REV`), `MD+PA+Q` (`P-Q`, `P-MD`, `P-PA`, `P-REV`), `MD+PA+PB` (`P-PB`, `P-MD`, `P-PA`, `P-REV`), `MD+PA+E` (`P-E`, `P-MD`, `P-PA`, `P-REV`).
