# Issuer certificate path validation ignores basicConstraints, unknown critical extensions and the document signer EKU

## What EUDIPLO does

EUDIPLO checks the certificate path of a presented credential for signatures, validity periods and a match with the
trust list, and nothing else. It accepts credentials whose path a conforming validator rejects:

| Test case | Credential | Defect in the path | EUDIPLO |
| --- | --- | --- | --- |
| `RP_WS_SM_IssuerIntegrity_034a_UF` | SD-JWT VC, `x5c` of 2 | the signer `CN=PP-I under a certificate without cA signer` is issued by `CN=PP-I certificate without cA` (issued by the listed anchor `CN=CA-PP-I`), which has `basicConstraints` critical `CA:FALSE` (key usage `keyCertSign, cRLSign`) | `verified: true`, `matchedIssuer: PP-I` |
| `RP_WS_SM_IssuerIntegrity_037a_UF` | SD-JWT VC | the signer `CN=PP-A critical extension signer` (under the listed anchor `CN=CA-PP-A`) carries the unknown extension `1.3.6.1.4.1.55555.1.1`, marked critical | `verified: true`, `matchedIssuer: PP-A` |
| `RP_WS_SM_IssuerIntegrity_027_UF` | mdoc | the MSO is signed by `CN=PP-A signer without document signer EKU` (under `CN=CA-PP-A`): key usage `digitalSignature`, no extended key usage; the regular document signer has EKU `1.0.18013.5.1.2` | `verified: true`, `matchedIssuer: PP-A` |

In each case the session ends `completed` with `{"result": "success", ...}` and the PID claims are released.

The mdoc variants of the first two (`_034b_UF`, `_037b_UF`) are accepted as well. In this suite's current release
they still show as PASS, because their test document signers start one day before the run while the MSO is signed two
days before, and EUDIPLO rejects the MSO for that ("The MSO signed date ... must be within the validity period of the
certificate"). With that fixed in the suite, EUDIPLO accepts both. So the gap covers both formats.

## What the specification says

- RFC 5280 section 6.1.4 (k), preparation for certificate i+1: "If certificate i is a version 3 certificate, verify
  that the basicConstraints extension is present and that cA is set to TRUE." Section 4.2.1.9: "If the cA boolean is
  not asserted, then the keyCertSign bit in the key usage extension MUST NOT be asserted."
- RFC 5280 section 4.2: "A certificate-using system MUST reject the certificate if it encounters a critical extension
  it does not recognize or a critical extension that contains information that it cannot process."
- ISO/IEC 18013-5 Annex B, document signer certificate profile: extended key usage `1.0.18013.5.1.2`, mandatory and
  critical. Section 9.3.1 has the reader validate the document signer certificate against this profile.

A certificate without `cA` that issues signing certificates means any end-entity key of a listed provider can issue
more signers; an unknown critical extension may carry a restriction EUDIPLO does not enforce.

## How to reproduce

```bash
pnpm rp-conformance run --adapter eudiplo --only 'RP_WS_SM_IssuerIntegrity_027_UF,RP_WS_SM_IssuerIntegrity_034a_UF,RP_WS_SM_IssuerIntegrity_037a_UF'
```

All three FAIL in both flows: "attributes were released" (run `r20261119T222700-cfa8a7`; the credential with its `x5c`
or `x5chain` and EUDIPLO's session are in `artifacts/<test case>/redirect/step-<n>/`). The positive controls in the same
run (a PID under `PP-I`'s regular intermediate CA, a PID with the regular document signer) pass, and the rejections
of the same suite for expired or not yet valid certificates in the path pass too.

## Where in the source

- SD-JWT VC: `CredentialChainValidationService.validateChainPreferring` builds the path, checks validity periods
  (step 6) and matches it with the trust list (step 7), with no check of `basicConstraints`, `keyUsage` or critical
  extensions in between:
  [credential-chain-validation.service.ts#L256-L270](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/credential/credential-chain-validation.service.ts#L256-L270).
  `CertificatePathBuilder` states that the path "is not checked against trust anchors, validity periods or
  constraints" ([certificate-path.util.ts#L70](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/shared/utils/certificate-path.util.ts#L70)).
- mdoc: `mdocContext.x509.verifyCertificateChain` calls `verifyChainCertificates`, which checks signature and validity
  period of each certificate only
  ([mdoc-context.ts#L283](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/verifier/presentations/mdoc-context.ts#L283));
  nothing checks the document signer EKU.

One shared check over the built path would cover both: every certificate above the signer has `basicConstraints`
`cA` TRUE (and `keyCertSign`, `pathLenConstraint` respected), no certificate has a critical extension outside the set
EUDIPLO processes, and for mdoc the signer has EKU `1.0.18013.5.1.2`.

Related: EUDIPLO/eudiplo#1448 lists "The mdoc context does not check `cA` or `keyCertSign`" as a follow-up. This
report adds the SD-JWT VC path, unknown critical extensions and the EKU.
