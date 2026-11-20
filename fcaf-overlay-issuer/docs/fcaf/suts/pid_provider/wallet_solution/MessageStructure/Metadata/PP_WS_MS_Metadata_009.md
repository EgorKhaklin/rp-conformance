# PP_WS_MS_Metadata_009

## Objective

Verify that `credential_reuse_policy` is present per configuration and names method A or B as required, with the methods ordered by preference, and that batch size and thresholds are consistent with `batch_credential_issuance`.

## References

- [ARF] Annex 2, ISSU_39, ISSU_40, ISSU_45, ISSU_50, ISSU_54
- [ETSI TS 119 472-3] section 4.2.4.2

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- OpenID4VCI
- HAIP

## Preconditions

1. The Provider is enrolled by the Test Registrar (issuer catalogue section 3.3): its credential signer under `PP-T` on `TL-PID`, its status list signer under the revocation anchor of `PP-T`, its access and registration certificates.
2. The Provider is configured as `default_configuration_PP_1` (section 3.5) and trusts `TL-WP` for Wallet Providers.
3. Wallet Unit `CW-1` of `WP-A` (section 3.4): a valid WIA and a valid KA with `iso_18045_high`, neither revoked.
4. The adapter can create an offer for `SUBJ-1` (ICS-17).

## Test Scenario

1. The Conformance Wallet runs `SCN-M`: it takes the Credential Issuer identifier from an offer the adapter creates, fetches the Credential Issuer metadata from `/.well-known/openid-credential-issuer` inserted before the path of that identifier, once as JSON and once with `Accept: application/jwt`, the metadata of every Authorization Server it names, sends two requests to the nonce endpoint, and fetches `/.well-known/openid-configuration` under the identifier as a probe.

## Expected results

1. The captured artifact passes `metadata-reuse-policy` (every configuration carries `credential_reuse_policy` (or `credential_metadata.credential_reuse_policy`) with `options`; an option names `once_only` (method A) or `limited_time` (method B); every `batch_size` is at most `batch_credential_issuance.batch_size`, and `reissue_trigger_unused` is below it).

## Comments

The order of the options states the preference of the Provider; it cannot be checked against anything and is recorded only.
