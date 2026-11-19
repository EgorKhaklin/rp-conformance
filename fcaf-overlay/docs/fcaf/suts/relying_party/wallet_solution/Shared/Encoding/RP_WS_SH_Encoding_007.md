# RP_WS_SH_Encoding_007

## Objective

Verify that the answers of the Relying Party to faulty Authorization Responses reveal no internal details to the wallet.

## References

- [OpenID4VP] section 8.3.1, 15.9
- [HAIP] section 5.1
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party supports presentations via redirects.

## EUDI-wallet relevancy

EUDI_generic | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Presentation via redirects with response mode `direct_post.jwt`.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its `response` parameter is the JWE without its last segment, the authentication tag, so it has four segments instead of five.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the protected header segment of the JWE in its `response` parameter contains the characters `*` and `!`, which are not in the base64url alphabet.
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `~` that separates the last disclosure from the KB-JWT is missing, so the last disclosure and the KB-JWT form one segment.
4. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the payload of its KB-JWT carries the member `nonce` twice: first the `nonce` of the request and last a newly generated random value.
5. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that the `x5c` header of its Issuer-signed JWT carries 50 certificates: its signing certificate followed by 49 self-signed CA certificates that are not part of `default_trust_configuration_rp`.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.
3. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.
4. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.
5. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx. Via redirects, the body of the answer of the `response_uri` reveals no internal details of the Relying Party: no stack trace, source file path, module directory, exception class name or database error.

## Comments

The steps repeat stimuli of `RP_WS_SH_Encoding_001_UF`, `_002_UF`, `_005_UF` and `_006a_UF`. Only the answer to the wallet is examined: the verification result the Relying Party hands to its relying service may carry any detail it wants.
