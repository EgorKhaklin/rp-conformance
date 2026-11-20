# PID expiry is not bounded by the revocation maintenance period of the WIA and KA

EUDIPLO 9.1.0-main.ae0792a, PID configuration with a lifetime of 30 days.

TS3 v1.5.2 section 2.4 (`client_status.exp`, `key_storage_status.exp`) and ARF ISSU_12c: a PID must not outlive the
period during which the Wallet Provider maintains the status of the Wallet Unit. EUDIPLO ignores both values:

- WIA maintenance ends in 30 days: the PID's `exp` is 30 days rounded up to the hour, about 48 minutes after
  `client_status.exp` (`PP_WS_SM_ClientAttestation_015`); same for the KA (`PP_WS_SM_KeyAttestation_011`).
- WIA maintenance ends tomorrow: EUDIPLO neither rejects the WIA nor shortens the PID (`exp` 30 days later,
  `PP_WS_SM_ClientAttestation_016_UF`).
