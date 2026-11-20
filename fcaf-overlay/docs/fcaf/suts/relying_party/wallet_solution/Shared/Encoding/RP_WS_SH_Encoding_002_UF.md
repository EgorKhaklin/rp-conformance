# RP_WS_SH_Encoding_002_UF

## Objective

Verify that the Relying Party rejects a presentation in SD-JWT VC format that is not a well-formed SD-JWT: a missing separator, an empty disclosure, a disclosure that is not valid JSON, or a KB-JWT whose payload is not valid JSON.

## References

- [RFC9901] section 4, 7.1, 7.3
- [RFC8259] section 2
- [RFC7519] section 7.2
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001a` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `~` that separates the last disclosure from the KB-JWT is missing, so the last disclosure and the KB-JWT form one segment.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that it carries an empty segment between two disclosures (`~~`), while the `sd_hash` of its KB-JWT is computed over the presented SD-JWT with that segment.
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that its disclosure of `family_name` is replaced by a disclosure whose base64url decoding is not valid JSON (the closing bracket of the array is missing), and the `_sd` array of its Issuer-signed JWT carries the digest of that disclosure.
4. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the payload of its KB-JWT is not valid JSON: its `iat` member has the value `NaN`, while the KB-JWT is signed over that payload.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
3. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
4. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

In the fourth step the invalid JSON is in the KB-JWT rather than in the SD-JWT itself; JSON has no `NaN` ([RFC8259] section 6).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
