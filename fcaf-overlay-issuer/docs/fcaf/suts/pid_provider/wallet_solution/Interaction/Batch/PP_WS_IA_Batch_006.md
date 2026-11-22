# PP_WS_IA_Batch_006

## Objective

Verify that the first batch needs a single User authentication regardless of its size.

## References

- [ARF] Annex 2, ISSU_61

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Batch issuance and `batch_size`; `credential_reuse_policy` methods

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- SD-JWT VC

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. `CW-1` runs `SCN-I` in the authorization code flow for `SUBJ-1` without mutation, with a KA that attests `batch_size` keys (ICS-08) and a credential request with `batch_size` key proofs, each signed by another of these keys and carrying the KA. The adapter authenticates `SUBJ-1` once.

## Expected results

1. The Provider issues the credential (HTTP 200) in SD-JWT VC format (`dc+sd-jwt`). Every credential passes format, `issuer-trust` to `PP-T` on `TL-PID`, `issuer-signature`, `disclosures`, `validity`, `holder-binding` (bound to a proof key the KA attests) and `status-reference`, and the Status List Token it references passes the status list checks. One authorization gives the whole batch: the adapter authenticates `SUBJ-1` once, and the Provider issues `batch_size` credentials for it.

## Comments

Runs only in the authorization code flow (`AC`), where the User authenticates.

Variant `SD+AC` (`P-PID`, `P-SD`, `P-AC`, `P-BATCH`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
