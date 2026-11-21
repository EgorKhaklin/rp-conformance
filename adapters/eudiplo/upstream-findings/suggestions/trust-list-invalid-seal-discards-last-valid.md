# Question: keep the last valid trust list when a new version fails its seal?

**Not a conformance finding.** No specification requires a Relying Party to keep the last valid version of a list when a
newly fetched version does not verify; failing closed conforms too. The suite now leaves the choice to the Relying
Party's declaration (ICS item RP.T.4, `Keep` or `Discard`) and declares `Discard` for EUDIPLO
(`RP_Inf_SM_TrustMechanisms_002_UF`, `_003_UF`, spec review of 2026-11-20). This is a design question.

## What EUDIPLO does

After EUDIPLO has loaded a valid version of `TL-PID`, the scheme operator's endpoint serves a version whose JAdES seal
does not verify (one bit flipped, or sealed under `CA-X`). EUDIPLO does not use it, and also stops using the valid
version it had: every PID under that list is rejected with `trust_list_unavailable` until a version that verifies is
published.

Note on the observation: the suite makes EUDIPLO read the list again with `DELETE /api/cache/trust-list`, which itself
discards the cached list. The test therefore shows EUDIPLO without a cached list, not EUDIPLO dropping a list it still
held. `TrustStoreService.getTrustStore` does keep the previous store while its cache lasts
([trust-store.service.ts#L107](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/trust/trust-store.service.ts#L107));
after that it rebuilds and fails when a list does not verify.

## What the specifications say

ETSI TS 119 602 V1.1.1 clause 6.3.15 defines `NextUpdate` as the time "by which, at the latest, an update of the LoTE
will be made available"; clause 6.8 requires lists to be signed. ARF Annex 2 OIA_15a requires regular trust anchor
management. None of them says what happens when a download yields an unauthentic version.

## The question

Fail-closed is deliberate in EUDIPLO and defensible. The alternative, keeping the last version that verified until its
`NextUpdate` while logging the failure, avoids that a single corrupted publication (or an attacker in transit) stops all
presentations under that list. Would EUDIPLO consider it, perhaps as an option?
