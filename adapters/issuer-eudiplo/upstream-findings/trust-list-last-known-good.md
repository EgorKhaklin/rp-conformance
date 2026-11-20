# A Wallet Provider list with a bad seal makes every wallet untrusted: no last valid list is kept

EUDIPLO 9.1.0-main.ae0792a, issuance configuration with `walletProviderTrustLists` naming one LoTE.

When a newly fetched Wallet Provider LoTE fails its seal check (bit flip in the JAdES signature, or sealed by a
certificate other than the configured `verifierX509Der`), EUDIPLO has no list to fall back to:
`CollectTrustedEntities.execute` (`apps/backend/src/trust/application/collect-trusted-entities.ts` around lines 119-125)
fails the source, and `TrustStoreService.getTrustStore` (`trust-store.service.ts` around lines 107-134) keeps the
previous store only while its 5 minute cache lasts. After that, or after `DELETE /api/cache/trust-list`, every token
request is refused with `invalid_client` "Wallet provider trust lists could not be loaded". A bad seal is not even
remembered as refused, so the bad list is fetched again on every request.

ETSI TS 119 602 and WPNot_04 expect a relying issuer to discard an unverifiable list and keep using the last valid
one. Otherwise anyone who can corrupt the published list in transit stops all issuance.

Effect, shown by the issuer suite (cre8/rp-conformance issue 26, `PP_Inf_SM_TrustMechanisms_004_UF`, SD+PA and MD+PA):
after a refresh, a version of `TL-WP` with a broken seal (and with `WP-A` removed in it) makes the token request of
`CW-1` of `WP-A` fail with HTTP 401 `invalid_client` instead of the previous list applying; the same for a version
sealed under `CA-X`.

Expected: keep the last list whose seal verified (until its `NextUpdate`) when a new version cannot be verified.
