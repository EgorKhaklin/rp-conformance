import type { IcsCondition } from '../definition';

/** The items of the Implementation Conformance Statement for Providers (issuer catalogue section 4). */
export type IssuerIcsItemId =
  | 'ICS-01'
  | 'ICS-02'
  | 'ICS-03'
  | 'ICS-04'
  | 'ICS-05'
  | 'ICS-06'
  | 'ICS-07'
  | 'ICS-08'
  | 'ICS-09'
  | 'ICS-10'
  | 'ICS-11'
  | 'ICS-12'
  | 'ICS-13'
  | 'ICS-14'
  | 'ICS-15'
  | 'ICS-16'
  | 'ICS-17'
  | 'ICS-18'
  | 'ICS-19';

/** The profiles the answers of the Provider ICS put a Provider in (issuer catalogue section 4, column `Profile`). */
export type IssuerProfile =
  | 'P-PID'
  | 'P-Q'
  | 'P-PB'
  | 'P-E'
  | 'P-SD'
  | 'P-MD'
  | 'P-PA'
  | 'P-AC'
  | 'P-DB'
  | 'P-NDB'
  | 'P-REV'
  | 'P-SHORT'
  | 'P-IL'
  | 'P-SUSP'
  | 'P-HOOK'
  | 'P-CHAIN'
  | 'P-BATCH'
  | 'P-REISS'
  | 'P-DEF'
  | 'P-NOT'
  | 'P-ENC'
  | 'P-DPN'
  | 'P-EDP';

export interface IssuerIcsItem {
  /** The question of the item, as the catalogue words it. */
  question: string;
  /** The profiles the answer selects; empty for an item that only declares values. */
  profiles: IssuerProfile[];
  /** The item decides a `POLICY` expectation. */
  policy?: true;
}

/** The ICS items ICS-01 to ICS-19 of the issuer catalogue section 4, with their exact wording and profiles. */
export const ISSUER_ICS_ITEMS = {
  'ICS-01': {
    question: 'Category: PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider (which rulebooks)',
    profiles: ['P-PID', 'P-Q', 'P-PB', 'P-E'],
  },
  'ICS-02': {
    question: 'Formats issued per credential configuration: SD-JWT VC, mdoc. A PID Provider issues both (PID_02).',
    profiles: ['P-SD', 'P-MD'],
  },
  'ICS-03': {
    question:
      'Grants: pre-authorized code (with or without `tx_code`), authorization code. How the adapter authenticates the test subject.',
    profiles: ['P-PA', 'P-AC'],
  },
  'ICS-04': {
    question: 'Device binding per configuration. PIDs are always device-bound (ISSU_17).',
    profiles: ['P-DB', 'P-NDB'],
  },
  'ICS-05': {
    question:
      'Revocation method per configuration and format: short-lived (≤ 24 h), Token Status List, identifier list (VCR_01, VCR_01b, VCR_11, VCR_11a); suspension supported',
    profiles: ['P-REV', 'P-SHORT', 'P-IL', 'P-SUSP'],
  },
  'ICS-06': {
    question:
      'Adapter hooks: revoke, suspend and unsuspend, change subject data, User revocation request; time limit `T_rev` within which a revocation is published (declared, at most 24 h, decision 3)',
    profiles: ['P-HOOK'],
  },
  'ICS-07': {
    question:
      'Revocation chaining: time limit `T_chain` within which a revoked Wallet Instance or WSCD leads to a revoked PID (WURevocation_18, mandatory for PID Providers; declared, at most 24 h, decision 3). For Attestation Providers whether they chain (WURevocation_19).',
    profiles: ['P-CHAIN'],
    policy: true,
  },
  'ICS-08': { question: 'Batch issuance and `batch_size`; `credential_reuse_policy` methods', profiles: ['P-BATCH'] },
  'ICS-09': { question: 'Re-issuance with a device-bound refresh token (ISSU_63, ISSU_65)', profiles: ['P-REISS'] },
  'ICS-10': { question: 'Deferred issuance', profiles: ['P-DEF'] },
  'ICS-11': { question: 'Notification endpoint', profiles: ['P-NOT'] },
  'ICS-12': { question: 'Credential request and response encryption', profiles: ['P-ENC'] },
  'ICS-13': { question: 'DPoP server nonce used; nonce endpoint offered', profiles: ['P-DPN'] },
  'ICS-14': {
    question: '`T_proof`, `T_skew` (each at most 5 minutes), lifetime of pre-authorized codes, `c_nonce` and access tokens',
    profiles: [],
  },
  'ICS-15': {
    question:
      '`T_refresh` for `TL-WP`, the grace period after its `NextUpdate`, and whether the previous `TL-WP` stays in force after a version whose seal fails (`keep`) or no list is used until a valid version arrives (`discard`)',
    profiles: [],
    policy: true,
  },
  'ICS-16': {
    question:
      'Minimum number of entries per status list (herd privacy, VCR_18), at least 10 000 (decision 4); declared timestamp precision for batch issuance (ISSU_36)',
    profiles: [],
  },
  'ICS-17': {
    question:
      'Whether the adapter seeds `SUBJ-1` and `SUBJ-2`, or the fixed test identities and their attribute values if it cannot (decision 5); whether the PID portrait opt-out is offered (PID_03)',
    profiles: [],
  },
  'ICS-18': {
    question:
      'Policy when the WIA or KA status cannot be obtained (status list unreachable or invalid). Attestation Providers only; PID Providers reject (decision 2).',
    profiles: [],
    policy: true,
  },
  'ICS-19': { question: 'Embedded disclosure policies per configuration (EDP_09)', profiles: ['P-EDP'] },
} as const satisfies Record<IssuerIcsItemId, IssuerIcsItem>;

/**
 * A `Profile applicability` condition on a Provider profile: the test case applies when the answer to `item` puts the
 * Provider in the profile `equals`. `text` is the question of the item, since the catalogue words no line per profile.
 */
export interface IssuerIcsCondition extends IcsCondition {
  item: IssuerIcsItemId;
  equals: IssuerProfile;
}

/** The `Profile applicability` condition of each profile, for issuer test cases, as `ics` is for RP test cases. */
export const issuerProfiles = Object.fromEntries(
  Object.entries(ISSUER_ICS_ITEMS).flatMap(([item, { question, profiles }]) =>
    profiles.map((profile) => [profile, { item, text: question, equals: profile }]),
  ),
) as Record<IssuerProfile, IssuerIcsCondition>;

/** The ICS items the `POLICY` expectation is compared with (issuer harness design section 6.3). */
export type IssuerPolicyItem = 'ICS-07' | 'ICS-15' | 'ICS-18';

/**
 * Implementation Conformance Statement of a Provider: the profiles its answers select, and the values it declares
 * (`T_rev`, `T_chain`, `T_proof`, `T_skew`, `T_refresh`, `batch_size`, the minimum status list size, the policies).
 */
export interface IssuerIcs {
  profiles: IssuerProfile[];
  /** Keyed by ICS item ID, or `<item>.<name>` for one of several values of an item, for example `ICS-14.T_proof: PT5M`. */
  items: Record<string, string | number | boolean | string[]>;
  /**
   * Issue 27: the same implementation also acting as an Attestation Provider of another category (one Provider instance
   * per category, for example one EUDIPLO tenant each). Each entry is the ICS of that Provider: its own profiles, and the
   * items that differ from the ones above. A run executes the test cases of each category against its own instance.
   */
  categories?: Partial<Record<'Q' | 'PB' | 'E', { profiles: IssuerProfile[]; items?: IssuerIcs['items'] }>>;
}
