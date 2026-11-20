# Issuer certificate path validation ignores basicConstraints and unknown critical extensions

Basis: RFC 5280 (sections 4.2, 4.2.1.9, 6.1.4 and 6.1.5), which RFC 7515 section 4.1.6 makes binding for the `x5c` of
an SD-JWT VC: "The recipient MUST validate the certificate chain according to RFC 5280". Not an EUDI-specific
requirement. For mdoc the suite relies on ISO/IEC 18013-5 section 9.3.1 for the same RFC 5280 validation; that clause
was not available to verify this text.

## What EUDIPLO does

EUDIPLO checks the certificate path of a presented credential for signatures, validity periods and a match with the
trust list, and nothing else. It accepts credentials whose path a conforming validator rejects:

| Test case | Credential | Defect in the path | EUDIPLO |
| --- | --- | --- | --- |
| `RP_WS_SM_IssuerIntegrity_034a_UF` | SD-JWT VC, `x5c` of 2 | the signer `CN=PP-I under a certificate without cA signer` is issued by `CN=PP-I certificate without cA` (issued by the listed anchor `CN=CA-PP-I`), which has `basicConstraints` critical `CA:FALSE` and nevertheless key usage `keyCertSign, cRLSign` | `verified: true`, `matchedIssuer: PP-I` |
| `RP_WS_SM_IssuerIntegrity_034b_UF` | mdoc | the document signer is issued by the same kind of certificate (`cA` FALSE, `keyCertSign`) | accepted, PID claims released |
| `RP_WS_SM_IssuerIntegrity_037a_UF` | SD-JWT VC | the signer `CN=PP-A critical extension signer` (under the listed anchor `CN=CA-PP-A`) carries the unknown extension `1.3.6.1.4.1.55555.1.1`, marked critical | `verified: true`, `matchedIssuer: PP-A` |
| `RP_WS_SM_IssuerIntegrity_037b_UF` | mdoc | the document signer carries the same unknown critical extension | accepted, PID claims released |

In each case the session ends `completed` with `{"result": "success", ...}` and the PID claims are released.

## What the specification says

RFC 5280:

- Section 6.1.4 (k), preparation for certificate i+1: "If certificate i is a version 3 certificate, verify that the
  basicConstraints extension is present and that cA is set to TRUE." Section 4.2.1.9: "If the cA boolean is not
  asserted, then the keyCertSign bit in the key usage extension MUST NOT be asserted." The intermediate of `_034_UF`
  violates both: it asserts `keyCertSign` without `cA`.
- Section 4.2: "A certificate-using system MUST reject the certificate if it encounters a critical extension it does
  not recognize or a critical extension that contains information that it cannot process." Section 6.1.5 (f) applies
  this to the end-entity certificate.

A certificate without `cA` that issues signing certificates means any end-entity key of a listed provider can issue
more signers; an unknown critical extension may carry a restriction EUDIPLO does not enforce.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only 'RP_WS_SM_IssuerIntegrity_034*_UF,RP_WS_SM_IssuerIntegrity_037*_UF'
```

All four FAIL: "attributes were released" (the credential with its `x5c` or `x5chain` and EUDIPLO's session are in
`artifacts/<test case>/redirect/step-<n>/`). The positive controls in the same run (a PID under `PP-I`'s regular
intermediate CA, a PID with the regular document signer) pass, and the rejections of the same suite for expired or not
yet valid certificates in the path pass too.

## Where in the source

- SD-JWT VC: `CredentialChainValidationService.validateChainPreferring` builds the path, checks validity periods
  (step 6) and matches it with the trust list (step 7), with no check of `basicConstraints`, `keyUsage` or critical
  extensions in between:
  [credential-chain-validation.service.ts#L256-L270](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/credential/credential-chain-validation.service.ts#L256-L270).
  `CertificatePathBuilder` states that the path "is not checked against trust anchors, validity periods or
  constraints" ([certificate-path.util.ts#L70](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/shared/utils/certificate-path.util.ts#L70)).
- mdoc: `mdocContext.x509.verifyCertificateChain` calls `verifyChainCertificates`, which checks signature and validity
  period of each certificate only
  ([mdoc-context.ts#L283](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/mdoc-context.ts#L283)).

One shared check over the built path would cover both: every certificate above the signer has `basicConstraints`
`cA` TRUE (and `keyCertSign`, `pathLenConstraint` respected), and no certificate has a critical extension outside the
set EUDIPLO processes.

Overlap: the open EUDIPLO/eudiplo#1448 already lists "The mdoc context does not check `cA` or `keyCertSign`" as a
follow-up, which covers `_034b_UF`. This report adds the SD-JWT VC path (`_034a_UF`) and unknown critical extensions in
both formats (`_037a_UF`, `_037b_UF`). The document signer extended key usage, part of an earlier draft of this text, is
not a requirement the suite could confirm and is no longer part of it.
