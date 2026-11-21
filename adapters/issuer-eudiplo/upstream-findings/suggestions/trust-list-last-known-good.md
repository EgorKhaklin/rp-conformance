# Question: keep the last valid Wallet Provider list when a new version fails its seal?

**Not a conformance finding.** No specification requires an issuer to keep the last valid version of a trust list when
a newly fetched version does not verify; ETSI TS 119 602 and ARF WPNot_04 require the seal to be verified before a list
is used. Failing closed conforms. The suite now leaves the choice to the Provider's declaration (ICS-15.invalid_version,
`keep` or `discard`) and declares `discard` for EUDIPLO (`PP_Inf_SM_TrustMechanisms_004_UF`, spec review of
2026-11-20). This is a design question.

EUDIPLO 9.1.0-main.ae0792a, issuance configuration with `walletProviderTrustLists` naming one LoTE. When a newly fetched
Wallet Provider LoTE fails its seal check (bit flip in the JAdES signature, or sealed by a certificate other than the
configured `verifierX509Der`), `CollectTrustedEntities.execute` fails the source, and `TrustStoreService.getTrustStore`
keeps the previous store only while its 5 minute cache lasts. After that every token request is refused with
`invalid_client` "Wallet provider trust lists could not be loaded", and the bad list is fetched again on every request.

Note on the observation: the suite makes EUDIPLO read the list again with `DELETE /api/cache/trust-list`, which itself
discards the cached list, so the test shows EUDIPLO without a cached list rather than EUDIPLO dropping one it held.

The question: fail-closed is deliberate and defensible. Keeping the last list whose seal verified (until its
`NextUpdate`) while logging the failure would stop a single corrupted publication, or an attacker in transit, from
halting all issuance. Would EUDIPLO consider it, perhaps as an option, and remember a refused version so it is not
fetched again on every request?
