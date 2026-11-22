# PP_WS_IA_Batch_003_UF

## Objective

Record how the PID Provider answers a credential request with more `jwt` proofs than its `batch_size`.

## References

- [OpenID4VCI] section 12.2.4

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Batch issuance and `batch_size`; `credential_reuse_policy` methods

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
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `PP_WS_IA_MainInteraction_001`, except that its credential request carries `batch_size` + 1 key proofs, each signed by another key of one KA that attests `batch_size` + 1 keys (fault `batch.over-size`).

## Expected results

1. Whether the Provider rejects the request (`invalid_proof` or `invalid_credential_request`) or issues the credentials is recorded; HTTP 5xx fails. OpenID4VCI 1.0 section 12.2.4 defines `batch_size` as "the maximum array size for the proofs parameter in a Credential Request", which the request exceeds, but states no rejection the Credential Issuer MUST give.

## Comments

Informational since the spec review of 2026-11-20 (issuer catalogue section 8.3): `batch_size` is defined in section 12.2.4, not section 8.2, and no MUST requires the Credential Issuer to reject a larger `proofs` array. Rejecting it is the hardened behaviour; EUDIPLO enforces it for `attestation` proofs (it counts `attested_keys`), not for `jwt` proofs.

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`, `P-BATCH`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
