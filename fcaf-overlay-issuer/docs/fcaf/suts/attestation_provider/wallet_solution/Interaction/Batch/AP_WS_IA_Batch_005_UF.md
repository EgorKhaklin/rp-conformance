# AP_WS_IA_Batch_005_UF

## Objective

Verify that the same key twice in one batch does not give two credentials bound to the same key.

## References

- [ARF] Annex 2, ISSU_35 (d)

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.
- Batch issuance and `batch_size`; `credential_reuse_policy` methods

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

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

1. `CW-1` runs `SCN-I` for `SUBJ-1` as in the positive control `AP_WS_IA_MainInteraction_001`, except that the first two of its `batch_size` key proofs are signed by the same attested key (fault `batch.same-key-twice`).

## Expected results

1. The Provider rejects the request (HTTP 4xx with an error object), or the report records how many credentials it issued and to how many distinct keys they are bound (catalogue: REJ or INFO).

## Comments

Variants (issuer catalogue section 2.3), each executed when the Provider's ICS puts it in the profiles named: `SD+PA+Q` (`P-Q`, `P-SD`, `P-PA`, `P-BATCH`), `SD+PA+PB` (`P-PB`, `P-SD`, `P-PA`, `P-BATCH`), `SD+PA+E` (`P-E`, `P-SD`, `P-PA`, `P-BATCH`).
