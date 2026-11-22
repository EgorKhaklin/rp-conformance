## PID Provider testing

The following items apply when the System Under Test is a PID Provider or an Attestation Provider: its Credential Issuer and Authorization Server, the credentials it signs and the status information it publishes. They are those of the [Issuer catalogue] section 3. The test environment reuses the controlled trust infrastructure of [Relying Party testing](#relying-party-testing) and adds a Wallet Provider of its own, so that the Provider faces Wallet Units whose every attestation the test environment controls.

### Provider test roles

| Role | Function |
| --- | --- |
| Conformance Wallet | OpenID4VCI client. Follows offers, runs both grants, sends the Wallet Instance Attestation (WIA) and its proof of possession, DPoP proofs, key attestations (KA) and proofs, and validates every credential it receives with the reference validator. Applies at most one deviation per test step to the messages it sends. |
| Test Wallet Provider | Issues WIAs and KAs under the Wallet Provider anchors of `TL-WP`, with controllable claims, keys, validity, `key_storage` and `user_authentication` values, and status references. Can revoke a Wallet Instance or a WSCD. |
| Test Status Provider | Serves the WIA and KA status lists of the Test Wallet Provider with controllable content, signature and availability, and logs every request it receives. |
| Test Trust Infrastructure | Publishes the lists of trusted entities and the Trusted Lists below, and modified versions of them. |
| Test Registrar | Issues the Provider's access and registration certificates, and certifies the Provider's signing keys under the test issuance and revocation CAs. |
| Adapter | Creates credential offers for a test subject, triggers revocation and other back-office events, and authenticates the test subject in the authorization code flow, as declared in the Provider ICS. |

### Provider trust configuration

The Provider is configured with the scheme operator certificates of the test lists only, and derives Wallet Provider trust from `TL-WP`. Lists not named here are those of `default_trust_configuration_rp`.

| ID | Content |
| --- | --- |
| `TL-WP` | Wallet Provider list of trusted entities. `WP-A`: granted, with separate CAs for WIA and KA signing and for their status lists. `WP-B`: a second granted Wallet Provider. `WP-W`: withdrawn. |
| `TL-PID` | Contains the Provider as `PP-T`: its issuance CA and its revocation CA, as certified by the Test Registrar. Also `PP-A`, another PID Provider, used as a wrong anchor for WIAs and KAs. |
| `TL-QEAA`, `TL-PUB`, `TA-EAA` | Contain an Attestation Provider for its category: `QP-T` with a granted qualified EAA service on `TL-QEAA` (the Trusted List the LOTL points to), `PB-T` on `TL-PUB`, or `EP-T` under the anchor `CA-EP-T` that the rulebook of its attestation defines. |
| `TL-AC`, `TL-RC` | `AC-A` and `RC-A`, which issued the Provider's access and registration certificates. |
| `CA-X` | Self-signed CA on no list. |

A WIA or KA is trusted only if it validates to an anchor that `TL-WP` publishes for that purpose, for a Wallet Provider whose status is granted. A chain to an anchor in any other list, or to `CA-X`, is untrusted.

### Wallet Units and subjects

| ID | Content |
| --- | --- |
| `CW-1` | Wallet Unit of `WP-A`: a WIA with a fresh `cnf` key, not revoked, with a revocation maintenance period of more than one year; a KA with `key_storage` and `user_authentication` `iso_18045_high`, as many `attested_keys` as the batch size, not revoked, with the same maintenance period. |
| `CW-2` | A second, independent Wallet Unit of `WP-A`. |
| `CW-B` | A Wallet Unit of `WP-B`. |
| `SUBJ-1` | Test subject whose attributes the adapter seeds or knows (ICS-17). The Conformance Wallet compares every issued value with them. For an Attestation Provider, the attributes of `default_credential_A`. |
| `SUBJ-2` | `SUBJ-1` with one attribute changed. |

### `default_configuration_PP_1`

| Property | Setting, contents, or value |
| --- | --- |
| Enrolment | Before the first test, the Provider generates its keys and the Test Registrar certifies them from CSRs: the credential signing certificates under the Provider's issuance CA in `TL-PID` (`PP-T`), or for an Attestation Provider under that of its category (`QP-T`, `PB-T`, `EP-T`), the status list signing certificate under its revocation CA, the access certificate from `AC-A` and the registration certificate from `RC-A`, with `providesAttestations` listing every credential type the Provider offers. |
| Service | One registered service, with the certificates of the enrolment. The metadata offers every credential configuration declared in the ICS. |
| Trust | The Provider trusts only `TL-WP` for Wallet Providers and has refreshed it before the test. |
| Offers | The adapter can create a credential offer for `SUBJ-1` and a configuration, by value or by reference, for each grant the ICS declares. For the authorization code flow it completes the User's authentication for `SUBJ-1` without a human. |
| Back office | The adapter can revoke and, where supported, suspend a given issued credential, and reports when it has done so (ICS-06). |
| Clock | Synchronised with the time source of the test environment. The proof and DPoP freshness window `T_proof` and the clock tolerance `T_skew` are those declared in the ICS, each at most 5 minutes. Time deviations use the declared value plus one hour. |

### Observation and expected results

The Provider's answer is the outcome. The tester reads the status code, error object and headers at every endpoint, every credential received (checked by the reference validator), the metadata, the status lists and identifier lists the Provider publishes, the requests the Provider sends to the Test Status Provider and the Test Trust Infrastructure, and what the adapter reports for back-office events.

| Code | Pass criterion |
| --- | --- |
| `ISS` | The Provider issues the credentials, and every check of the reference validator passes on each of them. |
| `REJ` | The Provider issues no credential and no token for the request, and answers with a 4xx and an OAuth or OpenID4VCI error object; no HTTP 5xx. `REJ` with a named error code passes only with that code. |
| `CONF` | The captured artifact conforms to the stated rule. |
| `REVOKED(t)` | Within time `t`, the status list or identifier list the Provider publishes shows the credential as revoked, and it stays revoked in every later version. |
| `UNCHANGED` | The credential's status stays valid in every version of the list the Provider publishes during the test. |
| `NOFETCH` | The Provider sends no request to the named address during the transaction. |
| `POLICY` | The outcome follows the policy the Provider declared in its ICS. |
| `INFO` | The behaviour is recorded in the report; no verdict. |

A test case whose ID ends in `_UF` is executed only after its positive control passed for the same variant; otherwise its verdict is INCONCLUSIVE.
