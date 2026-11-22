# RP_WS_DM_CredentialMetadata_001b_UF

## Objective

Record whether the Relying Party releases attributes of a PID in mdoc format that were disclosed without being requested.

## References

- [OpenID4VP] section 6.4
- [GDPR] Art. 5(1)(c)
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_optional

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the Conformance Wallet also discloses the attributes `place_of_birth` and `nationalities` (SD-JWT VC) or `place_of_birth` and `nationality` (mdoc), which the query does not request.

## Expected results

1. Whether the Relying Party rejects the presentation, or accepts it and releases `place_of_birth` or `nationality` besides the requested attributes, is recorded; HTTP 5xx fails.

## Comments

Informational since the spec review of 2026-11-20 (catalogue section 8.3): OpenID4VP 1.0 section 6.4 ("Wallets MUST NOT send selectively disclosable claims that have not been selected") binds the wallet, not the Relying Party. ARF OIA_16 is about discarding unique elements and timestamps, and OpenID4VP section 15.4.2 about which claims a Verifier requests; neither says what a Relying Party does with claims it did not request. Not releasing them is the data-minimising behaviour (GDPR Art. 5(1)(c)).

Whether the Relying Party retains the extra attributes cannot be observed at its interfaces; the test book item `RP_TB_001` covers retention.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
