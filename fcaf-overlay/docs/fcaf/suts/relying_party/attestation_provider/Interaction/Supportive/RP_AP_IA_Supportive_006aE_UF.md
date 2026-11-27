# RP_AP_IA_Supportive_006aE_UF

## Objective

Verify that the Relying Party rejects a credential in SD-JWT VC format whose status list `uri` points to a link-local address.

## References

- [Token Status List] section 6.2, 8.1, 11.4
- [ARF] Annex 2, VCR_13, VCR_14
- [CIR 2024/2979 amended] Annex II

## Profile applicability

- Relying Party requests credentials in IETF SD-JWT VC format.
- Relying Party requests non-qualified EAAs.
- Relying Party checks the revocation status of QEAAs, PuB-EAAs and non-qualified EAAs.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in IETF SD-JWT VC format.
- Status List Token in JWT format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_004a` passed in the same environment.
4. Every credential presented in this test case references a status list URI from which the Relying Party has not retrieved a status list before.

## Test Scenario

1. Perform a presentation for `default_query_eaa` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_eaa` whose status list `uri` is `http://169.254.169.254/latest/meta-data/rp-conformance/status`.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

The harness never sends a request to the link-local address, and cannot observe whether the Relying Party does; the report records the outcome only. A Relying Party configured to reach private networks, as test set-ups of the harness often are, may try the address and fail on it.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
