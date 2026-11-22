# Revocation chaining follows the key attestation only: a revoked Wallet Instance never revokes its PIDs

Basis: **EUDI profile only**, TS3 (Wallet Unit Attestations) v1.5.2 section 2.4.3, and ARF Annex 2 WURevocation_18.
OpenID4VCI 1.0 has no revocation chaining. TS3 1.4.1 had no WIA revocation at all, so this is new with TS3 1.5.

## What the specification says

TS3 v1.5.2 section 2.4.3: "A PID Provider SHALL check the revocation status of **both** the WIA and the KA received
during issuance at least once every 24 hours for the validity period of the PID. If either is revoked, the PID Provider
SHALL revoke the PID." Section 2.3.1: "A PID Provider that has issued a PID to this Wallet Unit SHALL check this
`client_status.status` entry at least once every 24 hours for the validity period of the PID".

## What EUDIPLO does

`revokeWithWalletUnit` records, per issued credential, one wallet unit to follow, and the background check
(`WALLET_UNIT_STATUS_CHECK_INTERVAL`) revokes the credential when that wallet unit's status says revoked. The wallet
unit recorded is the one of the key attestation only: in `OpenIdCredentialProofVerifier` the reference comes from
`checkStatus(provider.keyAttestationJwt, provider)`
([openid-credential-proof-verifier.ts#L88](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/issuer/issuance/oid4vci/adapters/openid-credential-proof-verifier.ts#L88)).
The WIA is checked once, at the token endpoint, and its status reference is not kept with the credential, so a later
revocation of the Wallet Instance cannot reach the PID. This holds independently of the claim the reference is read
from ([wallet-attestation-status-claim.md](wallet-attestation-status-claim.md)).

Effect, shown by the issuer suite (`PP_WS_SM_Revocation_006`, SD+PA and MD+PA): after the Test Wallet Provider revokes
the Wallet Instance's entry in the list the issuance's WIA references, the PID stays valid (`0x00`) in every poll of
EUDIPLO's status list for the declared `T_chain`.

## Suggested change

Record the WIA's status reference (`client_status.status` in TS3 1.5) with the credential as well, and revoke the
credential when either the WIA's or the KA's entry is revoked.
