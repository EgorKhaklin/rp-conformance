# A new trust list version whose seal does not verify makes EUDIPLO reject every credential under that list

## What EUDIPLO does

A tenant uses a LoTE (here the PID Provider list `TL-PID`) through `trusted_authorities`. EUDIPLO has loaded and used a
valid version of it; its `NextUpdate` is still in the future. The scheme operator's endpoint then serves a new version
that EUDIPLO cannot verify:

- `RP_Inf_SM_TrustMechanisms_002_UF`: one bit of the JAdES seal's signature value is flipped;
- `RP_Inf_SM_TrustMechanisms_003_UF`: the version is sealed by a key other than the scheme operator's (`CA-X`).

Both versions add an entity, `PP-C`. EUDIPLO correctly does not use them: a PID of `PP-C` is rejected. But it also stops
using the valid version it had: a regular PID of the listed provider `PP-A`, accepted a moment earlier, is now rejected
too, and stays rejected until a version that verifies is published.

```json
{
  "status": "failed",
  "failureCode": "trust_list_unavailable",
  "errorReason": "The trusted list could not be loaded, so the credential could not be validated."
}
```

Log: `Failed to load configured trust store: Trust list JWT verification failed for
http://host.docker.internal:56292/r20261119T222700-cfa8a7/TL-PID: signature verification failed`. The response to the
wallet's POST is HTTP 400.

## What the specification says

- ETSI TS 119 602 V1.1.1, clause 6.3.15: `NextUpdate` is "the date and time by which, at the latest, an update of the
  LoTE will be made available"; "LoTE with a Next update occurring in the past shall be discarded as expired". The
  version EUDIPLO had is therefore still current.
- ETSI TS 119 602 clause 6.8: lists "shall be signed by means of an AdES digital signature". A version whose seal does
  not verify against the scheme operator's certificate is not an authentic version of the list, so it can neither
  replace the current one nor invalidate it.
- ARF Annex 2, OIA_15a: "A Relying Party SHALL perform regular trust anchor management, meaning it SHALL download the
  latest version of all applicable Trusted Lists and LoTEs." The latest authentic version is the one EUDIPLO already has.

Neither document says in so many words what a Relying Party does when the download yields an invalid version. This
suite (decision 4 in its test catalogue) expects it to keep the last valid version until that version's `NextUpdate`
(plus a declared grace period), which is the reading above. Failing closed when no valid version is available at all
(EUDIPLO/eudiplo#860) is right and is not affected.

The effect of the current behaviour: anyone who can alter the list in transit, or a single corrupted publication,
makes every presentation under that list fail until the operator publishes again, although EUDIPLO holds a valid,
unexpired list.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only 'RP_Inf_SM_TrustMechanisms_002_UF,RP_Inf_SM_TrustMechanisms_003_UF'
```

Both FAIL in both flows. Step 1 publishes the faulty version and sees EUDIPLO fetch it; step 2 (PID of `PP-C`) is
rejected as it should be; step 3 (valid PID of `PP-A`) fails: "the Relying Party answered the Authorization Response
with HTTP 400" (run `r20261119T222700-cfa8a7`, `artifacts/RP_Inf_SM_TrustMechanisms_002_UF/redirect/step-3/rp-result.json`).
The same valid PID passes the positive control just before.

## Where in the source

`TrustStoreService.getTrustStore` returns the cached store only within `cacheTtlMs`; after that it rebuilds, and
`build` rethrows when a list does not verify, without falling back to the store it had
([trust-store.service.ts#L107](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/trust-store.service.ts#L107),
[#L156](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/trust-store.service.ts#L156)).
`CredentialChainValidationService.getTrustStoreIfConfigured` turns that into `trust_list_unavailable`
([credential-chain-validation.service.ts#L624](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/credential/credential-chain-validation.service.ts#L624)).

A fix: when a list of the source fails to fetch or verify, keep the last version of it that verified, as long as its
`NextUpdate` has not passed, and log the failure; fail closed only when no such version is left. The sequence-number
check EUDIPLO already has (rollback protection) is unaffected.
