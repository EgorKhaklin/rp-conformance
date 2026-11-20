# A credential configuration with `keyBinding: false` is still published and handled as device-bound

Not reported upstream yet; this is the issue text prepared for it. Found by `AP_WS_MS_Metadata_100` and `_101`,
`AP_WS_MS_Metadata_008` and `AP_WS_SM_KeyAttestation_102` and `_103` [`Q`, `PB`, `E`] of the issuer suite (issue 27,
EUDIPLO as Attestation Provider) against `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`
(`9.1.0-main.ae0792a`) on 2026-11-20.

## What happens

An SD-JWT VC configuration created with `keyBinding: false` and without `keyAttestationsRequired` (an attestation that
is not device-bound; ARF WUA_10a: "the Attestation Provider shall not require a key attestation") is published in the
Credential Issuer metadata as if it were device-bound:

```json
"qeaa-sd-jwt-vc-ndb": {
  "format": "dc+sd-jwt",
  "cryptographic_binding_methods_supported": ["jwk"],
  "proof_types_supported": {
    "attestation": { "proof_signing_alg_values_supported": ["ES256", "ES384", "ES512"] },
    "jwt": { "proof_signing_alg_values_supported": ["ES256", "ES384", "ES512"] }
  }
}
```

A credential request without `proofs` (OpenID4VCI 1.0 section 8.2: `proofs` is required only where the configuration
has `proof_types_supported`) is rejected with HTTP 400 `invalid_proof` "The proofs parameter is missing or does not
contain supported proof types (jwt, attestation)". With a key proof, EUDIPLO issues an SD-JWT VC without `cnf`: the
credential is bound to no key, as configured, so the metadata and the request handling contradict the credential.

Consequences seen by the suite: a wallet cannot tell from the metadata that the configuration needs no key attestation
(`AP_WS_MS_Metadata_100`); the configuration advertises proof types without `key_attestations_required`, which a
device-bound configuration must state (`AP_WS_MS_Metadata_008`, `_101`); an attestation that is not device-bound cannot
be obtained with the WIA only (`AP_WS_SM_KeyAttestation_102`, and the valid step of `_103`).

## Why

- `CredentialConfigService` builds every SD-JWT VC configuration with `bindingMethods: ["jwk"]` and every mdoc one with
  `["cose_key"]`, and `buildProofTypesSupported` adds the proof types whatever `keyBinding` says
  (`apps/backend/src/issuer/configuration/credentials/credentials.service.ts`, lines 352-365 and 406-420).
- `ResolveCredentialProofs` requires a `jwt` or `attestation` proof for every credential request
  (`apps/backend/src/issuer/issuance/oid4vci/application/resolve-credential-proofs.ts`, line 54).
- `SdJwtVcIssuerService` adds `cnf` only when `keyBinding` is set
  (`apps/backend/src/issuer/configuration/credentials/issuer/sdjwtvc-issuer/sdjwtvc-issuer.service.ts`, line 107).

## Suggested fix

For a configuration with `keyBinding: false`, leave out `cryptographic_binding_methods_supported` and
`proof_types_supported` from its metadata, and accept a credential request without `proofs` for it (a proof sent anyway
can be ignored).
