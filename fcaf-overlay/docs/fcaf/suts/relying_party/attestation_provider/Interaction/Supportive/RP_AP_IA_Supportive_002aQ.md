# RP_AP_IA_Supportive_002aQ

## Objective

Verify that the Relying Party that caches Status List Tokens retrieves a Status List Token in JWT format at most once for two presentations that reference it within its `ttl`.

## References

- [Token Status List] section 8.3, 11.5, 13.7
- [ARF] Annex 2, VCR_15
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests QEAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.
- Relying Party caches Status List Tokens.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Status List Token in JWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_002a` passed in the same environment.
4. The credential of the first step references a status list URI from which the Relying Party has not retrieved a status list before; the credential of the second step references the same status list at another index.

## Test Scenario

1. Perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents `default_credential_qeaa` in a valid Authorization Response, while the Test Status Provider serves a valid Status List Token for it with a `ttl` of 300 seconds that holds the value 0x00 at every index.
2. Immediately after the previous step, perform a presentation for `default_query_qeaa` in which the Conformance Wallet presents a newly issued `default_credential_qeaa` that references the same status list, in a valid Authorization Response.

## Expected results

1. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_qeaa`, with the values of `default_credential_qeaa`. The Test Status Provider has logged a request from the Relying Party for the status list referenced by the credential.
2. The Relying Party accepts the presentation: its verification result reports success and releases exactly the attributes requested in `default_query_qeaa`, with the values of the newly issued credential. The Test Status Provider logs no request from the Relying Party for the status list referenced by the credential.

## Comments

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
