// The named faults of the issuer suite at the points `wia`, `wia-pop`, `ka` and `proof` (issuer harness design section
// 6.2). Each one is applied after a valid build of the message the Conformance Wallet sends, and must fail exactly its
// `target` check of the reference validator and no other (section 7, level 1); `null` marks a variant that must pass
// every check, because the catalogue expects `ISS`, `CONF` or `INFO` for it. `text` is the FCAF wording of the
// difference, `testCases` the catalogue objectives whose stimulus it is. The implementations are in
// packages/issuer-wallet/src/faults.ts, the checks in packages/validator/src/issuer-request.ts.
//
// The RP faults stay in `FAULTS` (../faults.ts): issuer faults have points and checks of their own, and keeping them
// apart keeps the RP suite's iteration over `FAULT_IDS` unchanged.
import type { IssuerRequestCheck } from './checks';

/** Where an issuer request fault is applied: the WIA, its PoP, the KA, or the key proof of the credential request. */
export type IssuerFaultPoint = 'wia' | 'wia-pop' | 'ka' | 'proof';

export interface IssuerFaultInfo {
  point: IssuerFaultPoint;
  target: IssuerRequestCheck | null;
  /** The difference from the valid message, as the FCAF scenario words it (after "except that" / "only in that"). */
  text: string;
  /** The catalogue objectives (`issuer-test-catalogue.md` section 5.1) whose stimulus the fault is. */
  testCases: string[];
  /**
   * The fault is proven where the SUT requires the KA to carry its `c_nonce` (catalogue `P-DPN`): the valid baseline
   * then sends a KA with the `c_nonce`, and the reference validator requires it (`requireKeyAttestationNonce`).
   */
  requiresKeyAttestationNonce?: true;
  /** The fault needs a value of another issuance: `replay` of the same Wallet Unit, or a `c_nonce` of another session. */
  replay?: 'c_nonce' | 'jti' | 'other-session-c_nonce';
}

const CA = 'PP_WS_SM_ClientAttestation';
const KA = 'PP_WS_SM_KeyAttestation';
const POP = 'PP_WS_SM_ProofOfPossession';
const ENC = 'PP_WS_SH_Encoding';

const wia = (target: IssuerRequestCheck | null, text: string, ...testCases: string[]): IssuerFaultInfo => ({ point: 'wia', target, text, testCases });
const pop = (target: IssuerRequestCheck | null, text: string, ...testCases: string[]): IssuerFaultInfo => ({ point: 'wia-pop', target, text, testCases });
const ka = (target: IssuerRequestCheck | null, text: string, ...testCases: string[]): IssuerFaultInfo => ({ point: 'ka', target, text, testCases });
const proof = (target: IssuerRequestCheck | null, text: string, ...testCases: string[]): IssuerFaultInfo => ({ point: 'proof', target, text, testCases });

export const ISSUER_FAULTS = {
  // WIA, sent as `OAuth-Client-Attestation` at the token endpoint (and at PAR).
  'wia.missing': wia('wia-format', 'the token request carries neither an `OAuth-Client-Attestation` nor an `OAuth-Client-Attestation-PoP` header', `${CA}_002_UF`),
  'wia.signature-bitflip': wia('wia-signature', 'one bit of the signature value of its WIA is flipped', `${CA}_003_UF`),
  'wia.signer-ca-x': wia('wia-trust', 'its WIA is signed by a certificate issued by `CA-X`, which no list of the suite contains', `${CA}_004_UF`),
  'wia.signer-pp-a': wia('wia-trust', "its WIA is signed by a certificate under `PP-A`'s issuance CA in `TL-PID`", `${CA}_004_UF`),
  'wia.signer-ac-a': wia('wia-trust', 'its WIA is signed by a certificate under the anchor of `AC-A` in `TL-AC`', `${CA}_004_UF`),
  'wia.signer-wp-w': wia('wia-trust', 'its WIA is signed by a certificate under the issuance anchor of the withdrawn Wallet Provider `WP-W`', `${CA}_005_UF`),
  // Not a fault since the spec review of 2026-11-20: TS3 sections 2.2.1.2 and 2.2.2.2 bind the anchor to the Trusted
  // List for Wallet Providers, not to one service of the Wallet Provider; `null`, the catalogue expects `INFO`.
  'wia.signer-ka-ca': wia(
    null,
    "its WIA is signed by a certificate under `WP-A`'s KA CA, the anchor `TL-WP` lists for `WP-A`'s key attestations (ServiceName `WP-A WSCD`), not for its Wallet Solution",
    `${CA}_006_UF`,
  ),
  'wia.exp-past': wia('wia-validity', 'its WIA carries an `exp` claim set to the current time minus `T_skew` minus one hour', `${CA}_007_UF`),
  'wia.nbf-future': wia('wia-validity', 'its WIA carries an `nbf` claim set to the current time plus `T_skew` plus one hour', `${CA}_007_UF`),
  'wia.typ-jwt': wia('wia-format', 'the `typ` header of its WIA is `JWT`', `${CA}_011_UF`),
  'wia.es256k': wia('wia-signature', "its WIA is signed with `ES256K` by a key on curve secp256k1, whose certificate is issued under `WP-A`'s WIA anchor and carried in `x5c`", `${CA}_014_UF`),
  'wia.hs256': wia('wia-signature', 'its WIA is protected with `HS256`, keyed with the PEM encoding of the public key of the signing certificate in its `x5c` header', `${CA}_014_UF`),
  'wia.sub-other': wia('wia-client-id', 'the `sub` claim of its WIA is `other-wallet-unit`, while the token request and the PoP carry the `client_id` of the Wallet Unit', `${CA}_010_UF`),
  'wia.maintenance-31-days': wia(null, 'the `exp` member of the `client_status` claim of its WIA, the end of the revocation maintenance period, is 31 days from now (the minimum TS3 section 2.4.2 guarantees a Wallet Unit can present)', `${CA}_015`),
  'wia.maintenance-tomorrow': wia(null, 'the `exp` member of the `client_status` claim of its WIA, the end of the revocation maintenance period, is one day from now', `${CA}_016_UF`),
  'wia.ca-x-status-uri': wia(
    'wia-trust',
    'its WIA is signed by a certificate issued by `CA-X`, and the `uri` of its status reference points to a URL of the Test Status Provider that no other step uses',
    `${ENC}_004_UF`,
  ),
  'wia.status-uri-private': wia(
    'wia-status',
    'the `uri` of the status reference in the `client_status` claim of its WIA is `http://169.254.169.254/latest/meta-data/status`, a link-local address',
    `${ENC}_004_UF`,
  ),
  'wia.jku-header': wia('wia-signature', 'the header of its WIA additionally carries a `jku` member pointing to the Test Status Provider', `${ENC}_003_UF`),
  'wia.x5u-header': wia('wia-signature', 'the header of its WIA additionally carries an `x5u` member pointing to the Test Status Provider', `${ENC}_003_UF`),

  // Proof of possession of the WIA, sent as `OAuth-Client-Attestation-PoP`.
  'wia-pop.missing': pop('wia-pop', 'the token request carries the WIA but no `OAuth-Client-Attestation-PoP` header', `${CA}_002_UF`),
  'wia-pop.other-key': pop('wia-pop', "its WIA's PoP is signed with a newly generated P-256 key instead of the key in the WIA's `cnf` claim", `${CA}_008_UF`),
  'wia-pop.aud-other': pop('wia-pop', "the `aud` claim of its WIA's PoP is `https://other-issuer.example`", `${CA}_009_UF`),
  'wia-pop.iat-stale': pop('wia-pop', "the `iat` claim of its WIA's PoP is the current time minus `T_proof` minus `T_skew` minus one hour", `${CA}_009_UF`),
  'wia-pop.jti-replayed': {
    ...pop('wia-pop', "the `jti` claim of its WIA's PoP is the `jti` of the PoP of an earlier token request of the same Wallet Unit", `${CA}_009_UF`),
    replay: 'jti',
  },
  'wia-pop.typ-jwt': pop('wia-pop', "the `typ` header of its WIA's PoP is `JWT`", `${CA}_011_UF`),

  // KA, sent in the `key_attestation` header of the key proof.
  'ka.missing': ka('ka-format', 'its key proof carries no `key_attestation` header', `${KA}_002_UF`),
  'ka.signature-bitflip': ka('ka-signature', 'one bit of the signature value of its KA is flipped', `${KA}_003_UF`),
  'ka.signer-ca-x': ka('ka-trust', 'its KA is signed by a certificate issued by `CA-X`, which no list of the suite contains', `${KA}_004_UF`),
  'ka.signer-pp-a': ka('ka-trust', "its KA is signed by a certificate under `PP-A`'s issuance CA in `TL-PID`", `${KA}_004_UF`),
  'ka.signer-wp-w': ka('ka-trust', 'its KA is signed by a certificate under the issuance anchor of the withdrawn Wallet Provider `WP-W`', `${KA}_004_UF`),
  'ka.signer-wia-ca': ka(
    null,
    "its KA is signed by a certificate under `WP-A`'s WIA CA, the anchor `TL-WP` lists for `WP-A`'s Wallet Solution (ServiceName `WP-A Wallet`), not for its key attestations",
    `${KA}_004_UF`,
  ),
  'ka.exp-past': ka('ka-validity', 'its KA carries an `exp` claim set to the current time minus `T_skew` minus one hour', `${KA}_005_UF`),
  'ka.nonce-other-session': {
    ...ka('ka-nonce', 'its KA carries a `nonce` claim set to a `c_nonce` the SUT issued to another session', `${KA}_007_UF`),
    replay: 'other-session-c_nonce',
  },
  'ka.nonce-missing': {
    ...ka('ka-nonce', 'its KA carries no `nonce` claim, while the SUT requires the `c_nonce` in it', `${KA}_007_UF`),
    requiresKeyAttestationNonce: true,
  },
  'ka.key-storage-moderate': ka('ka-levels', 'the `key_storage` claim of its KA is `["iso_18045_moderate"]`', `${KA}_010_UF`),
  'ka.key-storage-basic': ka('ka-levels', 'the `key_storage` claim of its KA is `["iso_18045_basic"]`', `${KA}_010_UF`),
  'ka.key-storage-absent': ka('ka-levels', 'its KA carries no `key_storage` claim', `${KA}_010_UF`),
  'ka.user-authentication-moderate': ka('ka-levels', 'the `user_authentication` claim of its KA is `["iso_18045_moderate"]`', `${KA}_010_UF`),
  'ka.user-authentication-basic': ka('ka-levels', 'the `user_authentication` claim of its KA is `["iso_18045_basic"]`', `${KA}_010_UF`),
  'ka.user-authentication-absent': ka('ka-levels', 'its KA carries no `user_authentication` claim', `${KA}_010_UF`),
  'ka.maintenance-31-days': ka(null, 'the `exp` member of the `key_storage_status` claim of its KA, the end of the revocation maintenance period, is 31 days from now (the minimum TS3 section 2.4.2 guarantees a Wallet Unit can present)', `${KA}_011`),
  'ka.typ-jwt': ka('ka-format', 'the `typ` header of its KA is `JWT`', `${KA}_012_UF`),
  'ka.es256k': ka('ka-signature', "its KA is signed with `ES256K` by a key on curve secp256k1, whose certificate is issued under `WP-A`'s KA anchor and carried in `x5c`", `${KA}_012_UF`),
  'ka.other-unit': ka(
    null,
    'it carries a valid KA of the Wallet Unit `CW-2`, and its key proof is signed with a key that KA attests, while the token request carried the WIA of `CW-1`',
    `${KA}_013_UF`,
  ),
  'ka.ca-x-status-uri': ka(
    'ka-trust',
    'its KA is signed by a certificate issued by `CA-X`, and the `uri` of its status reference points to a URL of the Test Status Provider that no other step uses',
    `${ENC}_004_UF`,
  ),
  'ka.status-uri-private': ka(
    'ka-status',
    'the `uri` of the status reference in the `key_storage_status` claim of its KA is `http://169.254.169.254/latest/meta-data/status`, a link-local address',
    `${ENC}_004_UF`,
  ),
  'ka.jku-header': ka('ka-signature', 'the header of its KA additionally carries a `jku` member pointing to the Test Status Provider', `${ENC}_003_UF`),
  'ka.x5u-header': ka('ka-signature', 'the header of its KA additionally carries an `x5u` member pointing to the Test Status Provider', `${ENC}_003_UF`),

  // Key proof (`openid4vci-proof+jwt`) of the credential request.
  'proof.signature-bitflip': proof('proof-signature', 'one bit of the signature value of its key proof is flipped', `${POP}_001_UF`),
  'proof.alg-none': proof('proof-signature', 'its key proof is an unsecured JWT with `alg` `none` and an empty signature', `${POP}_002_UF`),
  'proof.hs256': proof('proof-signature', 'its key proof is protected with `HS256`, keyed with the PEM encoding of the public key in its `jwk` header', `${POP}_002_UF`),
  'proof.es256k': proof(
    'proof-signature',
    "its key proof is signed with `ES256K` by a key on curve secp256k1, which its `jwk` header carries and its KA, signed by `WP-A`'s KA signer, attests",
    `${POP}_002_UF`,
  ),
  'proof.typ-jwt': proof('proof-format', 'the `typ` header of its key proof is `JWT`', `${POP}_003_UF`),
  'proof.typ-missing': proof('proof-format', 'the header of its key proof has no `typ` member', `${POP}_003_UF`),
  'proof.aud-other': proof('proof-claims', 'the `aud` claim of its key proof is `https://other-issuer.example`', `${POP}_004_UF`),
  'proof.aud-missing': proof('proof-claims', 'its key proof carries no `aud` claim', `${POP}_004_UF`),
  'proof.nonce-missing': proof('proof-nonce', 'its key proof carries no `nonce` claim', `${POP}_005_UF`),
  'proof.nonce-random': proof('proof-nonce', 'the `nonce` claim of its key proof is a random value the SUT never issued', `${POP}_005_UF`),
  'proof.nonce-replayed': {
    ...proof('proof-nonce', 'the `nonce` claim of its key proof is the `c_nonce` of an earlier, answered credential request of the same Wallet Unit', `${POP}_005_UF`),
    replay: 'c_nonce',
  },
  'proof.iat-past': proof('proof-claims', 'the `iat` claim of its key proof is the current time minus `T_proof` minus one hour', `${POP}_006_UF`),
  'proof.iat-future': proof('proof-claims', 'the `iat` claim of its key proof is the current time plus `T_skew` plus one hour', `${POP}_006_UF`),
  'proof.iss-other': proof('proof-claims', 'the `iss` claim of its key proof is `other-wallet-unit` instead of the `client_id`', `${POP}_007_UF`),
  'proof.jwk-private': proof('proof-key', 'the `jwk` header of its key proof additionally carries the private key member `d`', `${POP}_008_UF`),
  'proof.jwk-and-x5c': proof('proof-key', 'the header of its key proof carries an `x5c` member with a certificate under `CA-X` next to `jwk`', `${POP}_008_UF`),
  'proof.off-curve': proof('proof-key', 'the `jwk` header of its key proof holds coordinates that are not a point on P-256', `${POP}_009_UF`),
  'proof.p521': proof(
    'proof-signature',
    "its key proof is signed with `ES512` by a key on curve P-521, which its `jwk` header carries and its KA, signed by `WP-A`'s KA signer, attests, while the SUT advertises `ES256` only",
    `${POP}_009_UF`,
  ),
  'proof.key-not-attested': proof('proof-key-attested', 'its key proof is signed with a newly generated P-256 key, carried in its `jwk` header, that its KA does not attest', `${KA}_006_UF`),
  'proof.jku-header': proof('proof-key', 'the header of its key proof additionally carries a `jku` member pointing to the Test Status Provider', `${ENC}_003_UF`),
  'proof.kid-url': proof('proof-key', 'the header of its key proof additionally carries a `kid` member whose value is a URL of the Test Status Provider', `${ENC}_003_UF`),
} as const satisfies Record<string, IssuerFaultInfo>;

export type IssuerFaultId = keyof typeof ISSUER_FAULTS;

export const ISSUER_FAULT_IDS = Object.keys(ISSUER_FAULTS) as IssuerFaultId[];

export function issuerFaultInfo(id: IssuerFaultId): IssuerFaultInfo {
  const info = ISSUER_FAULTS[id] as IssuerFaultInfo | undefined;
  if (!info) throw new Error(`unknown issuer fault ${id}`);
  return info;
}

/**
 * Every stimulus of the catalogue tables `PP_WS_SM_ClientAttestation`, `PP_WS_SM_KeyAttestation` and
 * `PP_WS_SM_ProofOfPossession` (and the `PP_WS_SH_Encoding` stimuli the design puts at these points): the faults that
 * implement it, or why it is not a fault of this layer.
 */
export interface IssuerStimulus {
  testCase: string;
  stimulus: string;
  faults: IssuerFaultId[];
  /** Why the stimulus has no fault here, and where it is implemented instead. */
  leftOut?: string;
}

const VALID = 'the valid issuance (no fault): every valid artifact of every Wallet Unit passes every check';
const STATUS_LIST =
  'a Status List Token fault of the RP harness served as `SL-WP-A` (design section 5.2): the checks are the existing status list checks, applied by the `status-list` point';
const REVOCATION = 'a `wallet-event` step, not a fault: the Test Wallet Provider revokes the entry in `SL-WP-A`; `wia-status` / `ka-status` fail on it (shown in the self-validation)';
const BATCH = 'the batch faults `batch.over-size`, `batch.one-bad-proof` and `batch.same-key-twice` of `SESSION_FAULTS` (./session-faults.ts)';
const OUTPUT = 'a `CONF` check of the issued credential (`holder-binding` of `OBS-CRED`, issue 17), not of the request';

export const ISSUER_REQUEST_STIMULI: IssuerStimulus[] = [
  { testCase: `${CA}_001`, stimulus: 'SCN-I', faults: [], leftOut: VALID },
  { testCase: `${CA}_002_UF`, stimulus: 'Omit both headers', faults: ['wia.missing'] },
  { testCase: `${CA}_002_UF`, stimulus: 'omit PoP', faults: ['wia-pop.missing'] },
  { testCase: `${CA}_003_UF`, stimulus: 'Corrupt signature', faults: ['wia.signature-bitflip'] },
  { testCase: `${CA}_004_UF`, stimulus: '(a) `CA-X`', faults: ['wia.signer-ca-x'] },
  { testCase: `${CA}_004_UF`, stimulus: "(b) `PP-A`'s issuance CA in `TL-PID`", faults: ['wia.signer-pp-a'] },
  { testCase: `${CA}_004_UF`, stimulus: '(c) `AC-A`', faults: ['wia.signer-ac-a'] },
  { testCase: `${CA}_005_UF`, stimulus: 'Signed under `WP-W`', faults: ['wia.signer-wp-w'] },
  { testCase: `${CA}_006_UF`, stimulus: 'Wrong service anchor', faults: ['wia.signer-ka-ca'] },
  { testCase: `${CA}_007_UF`, stimulus: '`exp` past', faults: ['wia.exp-past'] },
  { testCase: `${CA}_007_UF`, stimulus: '`nbf` future (beyond `T_skew`)', faults: ['wia.nbf-future'] },
  { testCase: `${CA}_008_UF`, stimulus: 'Other key', faults: ['wia-pop.other-key'] },
  { testCase: `${CA}_009_UF`, stimulus: 'wrong `aud`', faults: ['wia-pop.aud-other'] },
  { testCase: `${CA}_009_UF`, stimulus: 'stale `iat`', faults: ['wia-pop.iat-stale'] },
  { testCase: `${CA}_009_UF`, stimulus: 'replayed `jti`', faults: ['wia-pop.jti-replayed'] },
  { testCase: `${CA}_010_UF`, stimulus: 'Other `client_id`', faults: ['wia.sub-other'] },
  { testCase: `${CA}_011_UF`, stimulus: '`typ` `JWT` (WIA or PoP)', faults: ['wia.typ-jwt', 'wia-pop.typ-jwt'] },
  { testCase: `${CA}_012_UF`, stimulus: 'Status set in `SL-WP-A`', faults: [], leftOut: REVOCATION },
  { testCase: `${CA}_013_UF`, stimulus: "Each TSP mutation of the RP catalogue's `RP_PP_SM_Revocation`", faults: [], leftOut: STATUS_LIST },
  { testCase: `${CA}_014_UF`, stimulus: 'ES256K', faults: ['wia.es256k'] },
  { testCase: `${CA}_014_UF`, stimulus: 'HS256', faults: ['wia.hs256'] },
  { testCase: `${CA}_015`, stimulus: 'WIA with maintenance period ending in 31 days', faults: ['wia.maintenance-31-days'] },
  { testCase: `${CA}_016_UF`, stimulus: 'Maintenance period ending tomorrow', faults: ['wia.maintenance-tomorrow'] },

  { testCase: `${KA}_001`, stimulus: "SCN-I; KA in the proof's `key_attestation` header", faults: [], leftOut: VALID },
  {
    testCase: `${KA}_001`,
    stimulus: 'KA as `attestation` proof type where supported',
    faults: [],
    leftOut: 'the issuance client sends proof type `jwt` only so far (design section 5.1: "where the metadata offers"); the `attestation` proof type comes with the client feature',
  },
  { testCase: `${KA}_002_UF`, stimulus: 'Omit KA', faults: ['ka.missing'] },
  { testCase: `${KA}_003_UF`, stimulus: 'Corrupt signature', faults: ['ka.signature-bitflip'] },
  { testCase: `${KA}_004_UF`, stimulus: '(a) `CA-X`', faults: ['ka.signer-ca-x'] },
  { testCase: `${KA}_004_UF`, stimulus: '(b) `PP-A`', faults: ['ka.signer-pp-a'] },
  { testCase: `${KA}_004_UF`, stimulus: '(c) `WP-W`', faults: ['ka.signer-wp-w'] },
  { testCase: `${KA}_004_UF`, stimulus: "(d) `WP-A`'s WIA CA", faults: ['ka.signer-wia-ca'] },
  { testCase: `${KA}_005_UF`, stimulus: '`exp` past', faults: ['ka.exp-past'] },
  { testCase: `${KA}_006_UF`, stimulus: 'Fresh key', faults: ['proof.key-not-attested'] },
  { testCase: `${KA}_007_UF`, stimulus: 'Nonce from another session', faults: ['ka.nonce-other-session'] },
  { testCase: `${KA}_007_UF`, stimulus: 'no nonce', faults: ['ka.nonce-missing'] },
  { testCase: `${KA}_008_UF`, stimulus: 'Status set in `SL-WP-A`', faults: [], leftOut: REVOCATION },
  { testCase: `${KA}_009_UF`, stimulus: 'As `ClientAttestation_013_UF`', faults: [], leftOut: STATUS_LIST },
  {
    testCase: `${KA}_010_UF`,
    stimulus: '`iso_18045_moderate`; `iso_18045_basic`; absent',
    faults: ['ka.key-storage-moderate', 'ka.key-storage-basic', 'ka.key-storage-absent', 'ka.user-authentication-moderate', 'ka.user-authentication-basic', 'ka.user-authentication-absent'],
  },
  { testCase: `${KA}_011`, stimulus: 'KA maintenance period ending in 31 days', faults: ['ka.maintenance-31-days'] },
  { testCase: `${KA}_012_UF`, stimulus: '`typ` `JWT`', faults: ['ka.typ-jwt'] },
  { testCase: `${KA}_012_UF`, stimulus: 'ES256K', faults: ['ka.es256k'] },
  { testCase: `${KA}_013_UF`, stimulus: 'KA of `CW-2`, WIA of `CW-1`', faults: ['ka.other-unit'] },

  { testCase: `${POP}_001_UF`, stimulus: 'Corrupt signature', faults: ['proof.signature-bitflip'] },
  { testCase: `${POP}_002_UF`, stimulus: '`none`; HS256; ES256K', faults: ['proof.alg-none', 'proof.hs256', 'proof.es256k'] },
  { testCase: `${POP}_003_UF`, stimulus: '`JWT`; absent', faults: ['proof.typ-jwt', 'proof.typ-missing'] },
  { testCase: `${POP}_004_UF`, stimulus: 'Other issuer; absent', faults: ['proof.aud-other', 'proof.aud-missing'] },
  { testCase: `${POP}_005_UF`, stimulus: 'Missing; random; replay a used proof', faults: ['proof.nonce-missing', 'proof.nonce-random', 'proof.nonce-replayed'] },
  { testCase: `${POP}_006_UF`, stimulus: '`iat` −1 h; +1 h', faults: ['proof.iat-past', 'proof.iat-future'] },
  { testCase: `${POP}_007_UF`, stimulus: 'Other `iss`', faults: ['proof.iss-other'] },
  { testCase: `${POP}_008_UF`, stimulus: '`jwk` with `d`; `jwk` and `x5c`', faults: ['proof.jwk-private', 'proof.jwk-and-x5c'] },
  { testCase: `${POP}_009_UF`, stimulus: 'Off-curve point; P-521 if not advertised', faults: ['proof.off-curve', 'proof.p521'] },
  { testCase: `${POP}_010`, stimulus: 'SCN-I', faults: [], leftOut: OUTPUT },

  { testCase: `${ENC}_003_UF`, stimulus: '`jku`, `x5u` or a `kid` URL in a proof, WIA or KA header', faults: ['wia.jku-header', 'wia.x5u-header', 'ka.jku-header', 'ka.x5u-header', 'proof.jku-header', 'proof.kid-url'] },
  { testCase: `${ENC}_004_UF`, stimulus: 'WIA by `CA-X` with `uri` = TSP', faults: ['wia.ca-x-status-uri', 'ka.ca-x-status-uri'] },
  { testCase: `${ENC}_004_UF`, stimulus: '`uri` = `http://169.254.169.254/…`', faults: ['wia.status-uri-private', 'ka.status-uri-private'] },

  { testCase: 'PP_WS_IA_Batch', stimulus: 'one bad proof; one key twice; `batch_size` + 1 proofs', faults: [], leftOut: BATCH },
];
