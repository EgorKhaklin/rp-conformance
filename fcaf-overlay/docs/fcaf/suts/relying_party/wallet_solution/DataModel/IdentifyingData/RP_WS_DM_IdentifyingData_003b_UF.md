# RP_WS_DM_IdentifyingData_003b_UF

## Objective

Verify that the Relying Party rejects a presentation of a PID in mdoc format that does not disclose a requested claim.

## References

- [OpenID4VP] section 6.4, 8.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_generic | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the Conformance Wallet does not disclose the requested attribute `family_name`: the SD-JWT VC carries no disclosure of it, the mdoc no `IssuerSignedItem` for it.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

`default_query_pid` requests every claim it names: it has no `claim_sets`, so a presentation without `family_name` does not satisfy it.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
