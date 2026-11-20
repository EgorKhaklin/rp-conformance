# PP_WS_SM_KeyAttestation_009_UF

## Objective

Verify that the PID Provider issues no PID at the credential endpoint in the pre-authorized code flow when the status of the KA cannot be obtained: the list is unreachable, or it is a Status List Token with a bad signature, expired, malformed or signed under a wrong anchor.

## References

- [ARF] Annex 2, ISSU_21, WUA_11a
- [Token Status List] sections 5.1 and 8.3
- [TS3] section 2.5

## Profile applicability

- Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)
- Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).
- Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.

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
5. The positive control `PP_WS_IA_MainInteraction_001` passed in the same variant.

## Test Scenario

1. The Test Wallet Provider answers the request for the list with HTTP 404 and no Status List Token, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
2. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
3. The Test Wallet Provider answers the request for the list with HTTP 500 and no Status List Token, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
4. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
5. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that one bit of its signature value is flipped, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
6. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
7. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is an unsecured JWT with `alg` `none` and an empty signature, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
8. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
9. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that the Test Status Provider serves the bare status list JSON object (`bits`, `lst`) instead of a Status List Token, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
10. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
11. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `exp` claim is set to the current time minus `T_skew` minus one hour, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
12. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
13. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `sub` claim is the URI of a different status list, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
14. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
15. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `typ` header is `JWT`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
16. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
17. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its payload has no `sub` claim, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
18. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
19. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its payload has no `iat` claim, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
20. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
21. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its payload has no `status_list` claim, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
22. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
23. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `status_list` claim has no `bits` member, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
24. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
25. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `status_list` claim has no `lst` member, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
26. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
27. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed by a certificate issued by `CA-X`, with that certificate chain in `x5c`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
28. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
29. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it carries no `x5c` header, so its signer cannot be validated, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
30. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
31. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed by a self-signed certificate that is not part of `default_trust_configuration_rp`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
32. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
33. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed by a certificate under the revocation anchor of `PP-B`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
34. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
35. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed by a certificate under the anchor of `AC-A` in `TL-AC`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
36. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
37. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed with the key and certificate that signed the presented credential, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
38. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
39. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed by another certificate issued under the issuance CA `CA-PP-A` of `PP-A`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
40. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
41. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its signer certificate chains to a self-signed root that `x5c` includes and that is not part of `default_trust_configuration_rp`, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
42. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
43. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its signer certificate has expired, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
44. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
45. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its signer certificate is not yet valid, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
46. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
47. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that the `lst` member of its `status_list` claim is not valid base64url, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
48. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
49. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that the `lst` member of its `status_list` claim decodes to bytes that are not valid ZLIB data, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
50. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
51. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that its `lst` value decompresses to more bytes than the maximum status list size the Relying Party declares, for example a ZLIB stream that inflates to 1 GiB of zero bytes, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
52. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
53. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that the `bits` value of its status list is 3, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
54. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
55. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is signed with `ES256K` (curve secp256k1), under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
56. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.
57. The Test Wallet Provider serves `SL-WP-A` as a Status List Token that is valid except that it is protected with `HS256`, keyed with the encoded public key of the certificate in its `x5c` header, under a URL of this test case, to which the status reference of the KA of the following issuance points with the same index (a Provider may reuse a fetched `SL-WP-A` for its `ttl`). The entry of `CW-1`'s KA is 0 (valid).
58. The adapter creates a credential offer for `SUBJ-1` and the PID configuration in SD-JWT VC format (pre-authorized code flow). `CW-1` runs `SCN-I`: token request with WIA, PoP and DPoP proof, nonce request, credential request with an `openid4vci-proof+jwt` that carries the KA in its `key_attestation` header, all valid; the status of its KA cannot be obtained from that list.

## Expected results

1. The Test Wallet Provider serves the list; recorded in the report.
2. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
3. The Test Wallet Provider serves the list; recorded in the report.
4. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
5. The Test Wallet Provider serves the list; recorded in the report.
6. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
7. The Test Wallet Provider serves the list; recorded in the report.
8. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
9. The Test Wallet Provider serves the list; recorded in the report.
10. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
11. The Test Wallet Provider serves the list; recorded in the report.
12. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
13. The Test Wallet Provider serves the list; recorded in the report.
14. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
15. The Test Wallet Provider serves the list; recorded in the report.
16. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
17. The Test Wallet Provider serves the list; recorded in the report.
18. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
19. The Test Wallet Provider serves the list; recorded in the report.
20. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
21. The Test Wallet Provider serves the list; recorded in the report.
22. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
23. The Test Wallet Provider serves the list; recorded in the report.
24. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
25. The Test Wallet Provider serves the list; recorded in the report.
26. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
27. The Test Wallet Provider serves the list; recorded in the report.
28. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
29. The Test Wallet Provider serves the list; recorded in the report.
30. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
31. The Test Wallet Provider serves the list; recorded in the report.
32. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
33. The Test Wallet Provider serves the list; recorded in the report.
34. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
35. The Test Wallet Provider serves the list; recorded in the report.
36. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
37. The Test Wallet Provider serves the list; recorded in the report.
38. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
39. The Test Wallet Provider serves the list; recorded in the report.
40. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
41. The Test Wallet Provider serves the list; recorded in the report.
42. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
43. The Test Wallet Provider serves the list; recorded in the report.
44. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
45. The Test Wallet Provider serves the list; recorded in the report.
46. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
47. The Test Wallet Provider serves the list; recorded in the report.
48. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
49. The Test Wallet Provider serves the list; recorded in the report.
50. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
51. The Test Wallet Provider serves the list; recorded in the report.
52. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
53. The Test Wallet Provider serves the list; recorded in the report.
54. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
55. The Test Wallet Provider serves the list; recorded in the report.
56. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.
57. The Test Wallet Provider serves the list; recorded in the report.
58. The Provider issues no credential and no token for the request and answers with HTTP 4xx and an OAuth or OpenID4VCI error object; never HTTP 5xx.

## Comments

The stimuli of `PP_WS_SM_ClientAttestation_013_UF`, applied to the status reference of the KA.

A PID Provider rejects (decision 2); an Attestation Provider follows its ICS-18 policy (`POLICY`).

Variant `SD+PA` (`P-PID`, `P-SD`, `P-PA`) (issuer catalogue section 2.3); it applies when the Provider's ICS puts it in these profiles.
