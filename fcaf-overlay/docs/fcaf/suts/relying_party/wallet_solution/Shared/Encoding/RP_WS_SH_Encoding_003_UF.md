# RP_WS_SH_Encoding_003_UF

## Objective

Verify that the Relying Party rejects a presentation in mdoc format whose DeviceResponse is not well-formed CBOR or not of the structure ISO/IEC 18013-5 defines, or whose COSE structures break the encoding rules of their format: a repeated header label, an MSO not wrapped in tag 24, a device signature that carries its payload.

## References

- [RFC8949] section 3, 5.3
- [RFC9052] section 3, 4.1
- [ISO/IEC 18013-5] section 8.3.2.1.2.2, 9.1.2, 9.1.3
- [OpenID4VP] section B.2
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

1. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its DeviceResponse is cut after half of its bytes.
2. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `documents` member of its DeviceResponse is a map (major type 5) whose key 0 holds the document, instead of an array (major type 4).
3. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that the `documents` member of its DeviceResponse is 10,000 arrays nested in each other, the innermost one empty, instead of the array of documents.
4. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its DeviceResponse is encoded as a map of indefinite length (initial byte 0xbf) without the terminating `break` byte (0xff), so it is not well-formed CBOR.
5. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that the protected header of its `IssuerAuth` structure carries the label `alg` (1) twice, both times with the value -7 (`ES256`), and the signature is made over those bytes.
6. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents, in an otherwise valid Authorization Response, a variant of `default_credential_pid` that differs from it only in that the payload of its `IssuerAuth` structure is the MSO itself instead of `MobileSecurityObjectBytes` (the MSO as an embedded CBOR data item, tag 24), and the signature is made over that payload.
7. Perform a presentation for `default_query_pid` in which the Conformance Wallet presents `default_credential_pid` in an Authorization Response that is valid except that its `DeviceSignature` carries its payload (`DeviceAuthenticationBytes`) instead of `nil`, and is made over that payload.

## Expected results

1. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
2. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
3. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
4. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
5. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
6. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.
7. The Relying Party rejects the presentation: its verification result reports a failure and releases no attribute value from the presentation, and the endpoint receiving the Authorization Response does not answer with HTTP status 5xx.

## Comments

An indefinite-length map is well-formed CBOR, so the fourth step leaves out its `break` byte: the item never ends ([RFC8949] section 3.2.1).

Execute this test case once for each presentation flow the Relying Party supports (redirects, W3C Digital Credentials API).
