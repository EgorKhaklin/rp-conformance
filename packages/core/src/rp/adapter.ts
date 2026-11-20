import type { KeyedCertificate, PublishedTrustList } from '../environment';
import type { Flow } from './definition';

/**
 * A default DCQL query of `default_configuration_rp_1`, see the FCAF defaults "Relying Party testing". Each default
 * query asks for its credential "in the credential format of the test case", so it has one variant per format: the
 * plain ID for SD-JWT VC and `…_mdoc` for mdoc. `…_trusted_authorities` is the variant of `default_query_pid`
 * restricted with a `trusted_authorities` entry of type `aki` naming the PID/Issuance anchor of `PP-A`
 * (TrustMechanisms_016). Test cases call each variant by its FCAF name, for example `default_query_pid`. The
 * `default_query_pid_…` variants of the data model test cases request other PID attributes: every mandatory one
 * (`_mandatory`), the age-over attribute for 18 without and with a `values` constraint `true` (`_age_over_18`,
 * `_age_over_18_true`), and three members of the structured address (`_address`, SD-JWT VC only).
 */
export type DefaultQueryId =
  | 'default_query_pid'
  | 'default_query_pid_trusted_authorities'
  | 'default_query_pid_mdoc'
  | 'default_query_pid_mdoc_trusted_authorities'
  | 'default_query_pid_place_of_birth'
  | 'default_query_qeaa'
  | 'default_query_qeaa_mdoc'
  | 'default_query_pubeaa'
  | 'default_query_pubeaa_mdoc'
  | 'default_query_eaa'
  | 'default_query_eaa_mdoc'
  | 'default_query_pid_expiry_date'
  | 'default_query_pid_mdoc_expiry_date'
  | 'default_query_pid_mandatory'
  | 'default_query_pid_mandatory_mdoc'
  | 'default_query_pid_age_over_18'
  | 'default_query_pid_age_over_18_mdoc'
  | 'default_query_pid_age_over_18_true'
  | 'default_query_pid_age_over_18_true_mdoc'
  | 'default_query_pid_address'
  | 'default_query_pid_eaa'
  | 'default_query_pid_eaa_mdoc'
  | 'default_query_pid_or_eaa'
  | 'default_query_pid_or_eaa_mdoc'
  | 'default_query_pid_eaa_identifying'
  | 'default_query_pid_eaa_identifying_mdoc';

/** Every default query, in the order the adapters configure them. */
export const DEFAULT_QUERY_IDS: DefaultQueryId[] = [
  'default_query_pid',
  'default_query_pid_trusted_authorities',
  'default_query_pid_mdoc',
  'default_query_pid_mdoc_trusted_authorities',
  'default_query_pid_place_of_birth',
  'default_query_qeaa',
  'default_query_qeaa_mdoc',
  'default_query_pubeaa',
  'default_query_pubeaa_mdoc',
  'default_query_eaa',
  'default_query_eaa_mdoc',
  'default_query_pid_expiry_date',
  'default_query_pid_mdoc_expiry_date',
  'default_query_pid_mandatory',
  'default_query_pid_mandatory_mdoc',
  'default_query_pid_age_over_18',
  'default_query_pid_age_over_18_mdoc',
  'default_query_pid_age_over_18_true',
  'default_query_pid_age_over_18_true_mdoc',
  'default_query_pid_address',
  'default_query_pid_eaa',
  'default_query_pid_eaa_mdoc',
  'default_query_pid_or_eaa',
  'default_query_pid_or_eaa_mdoc',
  'default_query_pid_eaa_identifying',
  'default_query_pid_eaa_identifying_mdoc',
];

/**
 * The credential categories of the Relying Party SUT, each with its own root of trust in
 * `default_trust_configuration_rp`: PID (`TL-PID`), QEAA (`TL-QEAA`), PuB-EAA (`TL-PUB`) and non-qualified EAA (the
 * anchor its rulebook defines).
 */
export type CredentialCategory = 'pid' | 'qeaa' | 'pub-eaa' | 'eaa';

/** The category of the credential a default query asks for. */
export function categoryOfQuery(query: DefaultQueryId): CredentialCategory {
  if (query.startsWith('default_query_qeaa')) return 'qeaa';
  if (query.startsWith('default_query_pubeaa')) return 'pub-eaa';
  if (query.startsWith('default_query_eaa')) return 'eaa';
  return 'pid';
}

/**
 * The test list of trusted lists (ETSI TS 119 612, XML) that points to the test Trusted List `TL-QEAA`. The Relying
 * Party is configured with the LOTL's location and signing certificates only, the test counterpart of their publication
 * in the Official Journal, and takes `TL-QEAA` and the certificate that signs it from the LOTL's pointer.
 */
export interface PublishedListOfTrustedLists {
  url: string;
  /** PEM of the certificates that may sign the LOTL. */
  signingCertificatesPem: string[];
  /** The Trusted Lists the LOTL points to, for evidence; the Relying Party reads them from the LOTL. */
  pointers: { id: string; url: string; schemeTerritory: string }[];
}

/** A rulebook that defines its own trust anchor, as the rulebook of `default_credential_eaa` defines `CA-EP-A`. */
export interface RulebookTrust {
  /** The default credential the rulebook governs. */
  credential: 'default_credential_eaa';
  /** PEM of the anchors the rulebook defines, for signing the credential and its status lists. */
  anchorsPem: string[];
}

/**
 * Everything the Relying Party under test needs for `default_configuration_rp_1`: the scheme operator
 * certificates and URLs of the test lists, the test LOTL, the rulebook anchors, its access certificate and its
 * registration certificate.
 */
export interface TestEnvironment {
  runId: string;
  trustLists: PublishedTrustList[];
  /** The test LOTL that points to `TL-QEAA`. */
  listOfTrustedLists: PublishedListOfTrustedLists;
  /** The anchors the rulebook of `default_credential_eaa` defines. */
  rulebooks: RulebookTrust[];
  /** The Relying Party's access certificate issued by `AC-A`, with its key. */
  accessCertificate: KeyedCertificate;
  /** The Relying Party's registration certificate issued by `RC-A` (JWT, ETSI TS 119 475). */
  registrationCertificate: string;
  /** The DCQL queries of the default queries. */
  queries: Record<DefaultQueryId, DcqlQuery>;
  /** ICS values the adapter may pass to the Relying Party, for example `T_skew`. */
  ics: Ics;
}

export interface DcqlQuery {
  credentials: {
    id: string;
    format: string;
    meta?: Record<string, unknown>;
    /** `values`: the values the claim may have (OpenID4VP section 6.3). */
    claims?: { id?: string; path: (string | number | null)[]; values?: (string | number | boolean)[] }[];
    require_cryptographic_holder_binding?: boolean;
    trusted_authorities?: { type: string; values: string[] }[];
    /** OpenID4VP 1.0 section 6.1: whether more than one presentation may answer the query; default false. */
    multiple?: boolean;
  }[];
  /** OpenID4VP 1.0 section 6.2: sets of credential query ids, each satisfied by one of its options. */
  credential_sets?: { options: string[][]; required?: boolean }[];
}

export type Outcome = 'success' | 'failure' | 'pending';

export interface RelyingPartyResult {
  outcome: Outcome;
  /** The attributes the Relying Party released to the relying service, by claim path joined with `.`. */
  releasedAttributes?: Record<string, unknown>;
  /** For example `status-unknown` or `trust-list-stale`. */
  flags?: string[];
  /** The Relying Party's own answer, kept as evidence. */
  raw: unknown;
}

export interface StartedPresentation {
  transactionId: string;
  invocation: { uri: string } | { dcApiPage: string };
}

/** The only Relying Party specific code of the harness (harness design section 4.8). */
export interface RelyingPartyAdapter {
  name: string;
  /** Host name under which the Relying Party reaches the harness services; default `127.0.0.1`. */
  harnessHost?: string;
  /** Configure the Relying Party: trust anchors, access and registration certificate, default queries. */
  setUp(env: TestEnvironment, namespace: string): Promise<void>;
  startPresentation(req: { query: DefaultQueryId; flow: Flow; namespace: string }): Promise<StartedPresentation>;
  readResult(transactionId: string, timeoutMs: number): Promise<RelyingPartyResult>;
  /** Optional: make the Relying Party fetch its trust lists now instead of waiting `T_refresh`. */
  refreshTrust?(namespace: string): Promise<void>;
  /** Optional: what the report records about the Relying Party under test after `setUp`, for example its version. */
  describe?(): Promise<Record<string, string>>;
  /** Optional: release resources the adapter started. */
  tearDown?(): Promise<void>;
  /**
   * Optional (ICS RP.P.9): the Relying Party's front end in a user agent. With `url`, the user agent that started the
   * transaction (`same`) or a fresh one (`fresh`) opens it, as a browser opens the `redirect_uri` the wallet hands back;
   * without `url`, the user agent that started the transaction asks the front end for the transaction's result. Reports
   * what the front end released to that user agent (RP_WS_IA_ProtocolFlow_006 to _009).
   */
  frontEnd?(req: { transactionId: string; url?: string; userAgent: 'same' | 'fresh' }): Promise<FrontEndResult>;
}

/** What the Relying Party's front end showed a user agent. */
export interface FrontEndResult {
  /** Whether the front end released verified attributes of the transaction to the user agent. */
  released: boolean;
  /** The released attributes, by claim path joined with `.`. */
  attributes?: Record<string, unknown>;
  /** HTTP status of the front end's answer, when there is one. */
  status?: number;
  /** The front end's own answer, kept as evidence. */
  raw: unknown;
}

/** Implementation Conformance Statement of a Relying Party, keyed by ICS item ID (see `ics-rp.md`). */
export interface Ics {
  /** For example `RP.G.1: Yes`, `RP.P.4: 60`. */
  items: Record<string, string | number | boolean>;
}

/**
 * The category of the credential a credential query of a default query asks for, by its `id`: `qeaa`, `pubeaa` and
 * `eaa` ask for `default_credential_A` of that category, every other id (`pid`) for a PID. A combined default query
 * (`default_query_pid_eaa`) holds credential queries of several categories, each with its own root of trust.
 */
export function categoryOfCredentialQuery(id: string): CredentialCategory {
  if (id === 'qeaa') return 'qeaa';
  if (id === 'pubeaa') return 'pub-eaa';
  if (id === 'eaa') return 'eaa';
  return 'pid';
}
