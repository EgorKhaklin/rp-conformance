# RP_WS_SM_DeviceBinding_011_UF

## Objective

Verify that the Relying Party does not take a device-signed data element of a presentation in mdoc format as a PID attribute.

## References

- [ISO/IEC 18013-5] section 9.1.3
- [ARF] section 6.6.3.6
- [CIR 2024/2982 amended] Annex II

## Profile applicability

- Relying Party requests credentials in ISO/IEC 18013-5 mdoc format.

## EUDI-wallet relevancy

EUDI_specific | EUDI_required

## Technology

- Presentation of a credential in ISO/IEC 18013-5 mdoc format.

## Preconditions

1. The Relying Party is set to `default_configuration_rp_1`.
2. The test environment publishes `default_trust_configuration_rp`, and the Relying Party has loaded it.
3. Test case `RP_WS_IA_MainInteraction_001b` passed in the same environment.

## Test Scenario

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `DeviceNameSpaces` its device signature covers contain the element `family_name` with the value `Musterfrau` in the namespace `eu.europa.ec.eudi.pid.1`, which the MSO does not authorise through `keyAuthorizations`.

## Expected results

1. Either the Relying Party rejects the presentation (its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx), or it accepts the presentation and releases exactly the attributes requested in `default_query_pid`, with the issuer-signed values of `default_credential_pid`. In neither case does it release the device-signed value `Musterfrau`.

## Comments

Data elements in `DeviceNameSpaces` are signed by the Wallet Unit, not by the PID Provider. The MSO of `default_credential_pid` carries no `keyAuthorizations`, so it authorises none of them.

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
