// Types of the issuer suite (issuer harness design section 6): the variants, the step actions and the expected
// results of a test case whose system under test is a PID Provider or an Attestation Provider. Types only; the runner,
// the evaluators and the issuer faults come later.
import type { CredentialFormat, ExpectationOf, StepDefinitionOf, TestCaseDefinitionOf } from '../definition';
import type { FaultId } from '../faults';
import type { IssuerIcsCondition, IssuerPolicyItem } from './ics';

/** Variant codes of the issuer catalogue section 2.3: the credential format. */
export type FormatVariant = 'SD' | 'MD';
/** Variant codes of the issuer catalogue section 2.3: the grant, pre-authorized code or authorization code with PAR and PKCE. */
export type GrantVariant = 'PA' | 'AC';
/** Variant codes of the issuer catalogue section 2.3: the category of the SUT; default `PID` in `PP_*`. */
export type CategoryVariant = 'PID' | 'Q' | 'PB' | 'E';
export type IssuerVariant = FormatVariant | GrantVariant | CategoryVariant;

/** The credential format of each format variant. */
export const FORMAT_VARIANTS: Record<FormatVariant, CredentialFormat> = { SD: 'dc+sd-jwt', MD: 'mso_mdoc' };

/** The OpenID4VCI grant type of each grant variant. */
export type IssuanceGrant = 'pre-authorized_code' | 'authorization_code';
export const GRANT_VARIANTS: Record<GrantVariant, IssuanceGrant> = { PA: 'pre-authorized_code', AC: 'authorization_code' };

/** Test classes of the issuer catalogue section 2.1. */
export type IssuerTestClass = 'PP_WS' | 'PP_RP' | 'PP_Inf' | 'AP_WS' | 'AP_RP' | 'AP_Inf' | 'PP_TB';

/** The default Wallet Units of the issuer catalogue section 3.4. */
export type WalletUnit = 'CW-1' | 'CW-2' | 'CW-B';
/** The test subjects of the issuer catalogue section 3.4. */
export type TestSubject = 'SUBJ-1' | 'SUBJ-2';

/** Fetch the Credential Issuer metadata (as JSON and as signed JWT) and the Authorization Server metadata (`SCN-M`). */
export interface MetadataAction {
  kind: 'metadata';
}

/**
 * Run `SCN-I`: the adapter creates an offer, the Conformance Wallet runs the grant with every message valid except
 * at most one fault.
 */
export interface IssuanceAction {
  kind: 'issuance';
  /** Default `CW-1`. */
  walletUnit?: WalletUnit;
  /** Default `SUBJ-1`. */
  subject?: TestSubject;
  /** The credential configurations of the offer. */
  configurations: string[];
  grant: IssuanceGrant;
  /** Offer by reference (`credential_offer_uri`) instead of by value. */
  offerByReference?: boolean;
  /** Number of proofs; default 1. */
  batchSize?: number;
  /** Named faults (at most one); empty for a valid issuance. */
  faults: FaultId[];
  /** Stop after the token response, without a credential request. */
  stopAfterToken?: boolean;
  /** Expect and follow a deferred credential response. */
  deferred?: boolean;
  /** Encrypt the credential request and ask for an encrypted response. */
  encryption?: boolean;
  /** Request by `credential_identifier` instead of `credential_configuration_id`. */
  credentialIdentifier?: boolean;
}

/** An artifact of an earlier step that a `token-reuse` step sends again. */
export type ReusedArtifact = 'authorization-code' | 'par-request-uri' | 'refresh-token' | 'transaction-id' | 'dpop-proof' | 'proof';

/** Repeat a request of an earlier step with one of its artifacts. */
export interface TokenReuseAction {
  kind: 'token-reuse';
  artifact: ReusedArtifact;
  /** The step (1-based) whose artifact is reused. */
  ofStep: number;
}

/** The Test Wallet Provider revokes a Wallet Instance or a WSCD, or changes one of its status lists `SL-WP-*`. */
export interface WalletEventAction {
  kind: 'wallet-event';
  event: 'revoke-instance' | 'revoke-wscd' | 'status-list';
  /** Default `CW-1`. */
  walletUnit?: WalletUnit;
  /** For `status-list`: the list, for example `SL-WP-WIA`, and the faults (at most one) of the version it serves. */
  statusList?: { id: string; faults: FaultId[] };
}

/** An adapter hook for a back-office event: `setStatus` for what an earlier step issued, or `changeSubject`. */
export type IssuerEventAction =
  | { kind: 'issuer-event'; event: 'set-status'; status: 'revoked' | 'suspended' | 'valid'; ofStep: number }
  | { kind: 'issuer-event'; event: 'change-subject'; from: TestSubject; to: TestSubject };

/** Publish a version of `TL-WP`, as the RP harness's trust-list step does for `TL-PID`. */
export interface IssuerTrustListAction {
  kind: 'trust-list';
  list: 'TL-WP';
  remove?: string[];
  add?: string[];
  /** Named trust-list faults (at most one); empty or left out for a valid version. */
  faults?: FaultId[];
}

/** Poll `OBS-SL` for the credentials of earlier steps until `t` or until the expectation is settled. */
export interface ObserveStatusAction {
  kind: 'observe-status';
  /** The steps (1-based) whose credentials are observed. */
  ofSteps: number[];
  /** ISO 8601 duration, or the ICS value it comes from (`T_rev`, `T_chain`). */
  t: string;
}

/** Present a credential of an earlier step to the reference RP (`PP_RP_SM_Revocation_008`). */
export interface PresentAction {
  kind: 'present';
  ofStep: number;
}

export type IssuerStepAction =
  | MetadataAction
  | IssuanceAction
  | TokenReuseAction
  | WalletEventAction
  | IssuerEventAction
  | IssuerTrustListAction
  | ObserveStatusAction
  | PresentAction;

/**
 * Expected result codes of the issuer catalogue section 2.5, checked as the issuer harness design section 6.3
 * describes. `REJ:<code>` names the OAuth or OpenID4VCI `error`; `REVOKED(t)` the time limit, an ISO 8601 duration or
 * the ICS value (`REVOKED(T_rev)`).
 */
export type IssuerExpectationCode =
  | 'ISS'
  | 'REJ'
  | `REJ:${string}`
  | 'CONF'
  | `REVOKED(${string})`
  | 'UNCHANGED'
  | 'NOFETCH'
  | 'POLICY'
  | 'INFO';

export interface IssuerExpectation extends ExpectationOf<IssuerExpectationCode> {
  /** For `POLICY`: the ICS item that decides the outcome. */
  policy?: IssuerPolicyItem;
  /** For `CONF` and `ISS`: the named checks of the reference validator, for example the data model checks. */
  checks?: string[];
  /** For `NOFETCH`: the URL, or the list (`TL-WP`, `SL-WP-*`), the SUT must not request. */
  noFetch?: string;
}

export type IssuerStepDefinition = StepDefinitionOf<IssuerStepAction, IssuerExpectation>;

/** An executable issuer test definition: every field of an FCAF test case and the executable steps. */
export interface IssuerTestCaseDefinition extends TestCaseDefinitionOf<IssuerStepDefinition> {
  /** `<Class>_<Layer>_<Area>_<nnn>[<variant letter>][_UF]`, for example `PP_WS_SM_KeyAttestation_004_UF`. */
  id: string;
  profile: IssuerIcsCondition[];
  /** The variant codes the test case is restricted to; every variant the ICS declares when left out. */
  variants?: IssuerVariant[];
}
