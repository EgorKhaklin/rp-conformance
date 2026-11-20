// Types of the issuer suite (issuer harness design section 6): the variants, the step actions and the expected
// results of a test case whose system under test is a PID Provider or an Attestation Provider. Types only; the runner,
// the evaluators and the issuer faults come later.
import type { CredentialFormat, ExpectationOf, StepDefinitionOf, TestCaseDefinitionOf } from '../definition';
import type { FaultId } from '../faults';
import type { GrantFaultId } from './grant-faults';
import type { IssuerIcsCondition, IssuerPolicyItem, IssuerProfile } from './ics';

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
  faults: (FaultId | GrantFaultId)[];
  /** Stop after the token response, without a credential request. */
  stopAfterToken?: boolean;
  /** Authorization code flow: stop after the authorization response, before the token request (its code is left for a `token-reuse` step). */
  stopAfterAuthorization?: boolean;
  /** Expect and follow a deferred credential response. */
  deferred?: boolean;
  /** Encrypt the credential request and ask for an encrypted response. */
  encryption?: boolean;
  /** Request by `credential_identifier` instead of `credential_configuration_id`. */
  credentialIdentifier?: boolean;
}

/** An artifact of an earlier step that a `token-reuse` step sends again. */
export type ReusedArtifact = 'authorization-code' | 'pre-authorized-code' | 'par-request-uri' | 'refresh-token' | 'transaction-id' | 'dpop-proof' | 'proof';

/** Repeat a request of an earlier step with one of its artifacts. */
export interface TokenReuseAction {
  kind: 'token-reuse';
  artifact: ReusedArtifact;
  /** The step (1-based) whose artifact is reused. */
  ofStep: number;
  /** The Wallet Unit that sends it; default the one of that step (`CW-2` for a code redeemed by another client). */
  walletUnit?: WalletUnit;
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
  /**
   * The variant this definition runs in, one code per dimension it depends on (format, grant, category), for example
   * `['SD', 'PA']`. A test case has one definition per variant, expanded by a function (issuer harness design section
   * 6.1); the report keys its results by ID and variant (`variantOf`), and a `_UF` test case is gated on its control in
   * the same variant. Left out for a test case that depends on no variant.
   */
  variants?: IssuerVariant[];
}

/** The parts of an issuer test case ID (issuer catalogue section 2.2). */
export interface IssuerTestCaseId {
  sutClass: IssuerTestClass;
  layer: string;
  area: string;
  number: number;
  variant: string;
  unhappyFlow: boolean;
}

const ISSUER_TEST_CASE_ID = /^((?:PP|AP)_(?:WS|RP|Inf))_([A-Z]{2})_([A-Za-z]+)_(\d{3})([a-z]?)(_UF)?$/;

/** Parses an issuer test case ID, `<Class>_<Layer>_<Area>_<nnn>[<variant letter>][_UF]`. */
export function parseIssuerTestCaseId(id: string): IssuerTestCaseId {
  const match = ISSUER_TEST_CASE_ID.exec(id);
  if (!match) throw new Error(`${id} is not an issuer test case ID`);
  return {
    sutClass: match[1] as IssuerTestClass,
    layer: match[2],
    area: match[3],
    number: Number(match[4]),
    variant: match[5],
    unhappyFlow: Boolean(match[6]),
  };
}

/** The Provider profile each variant code needs (issuer catalogue sections 2.3 and 4). */
export const VARIANT_PROFILES: Record<IssuerVariant, IssuerProfile> = {
  SD: 'P-SD',
  MD: 'P-MD',
  PA: 'P-PA',
  AC: 'P-AC',
  PID: 'P-PID',
  Q: 'P-Q',
  PB: 'P-PB',
  E: 'P-E',
};

/**
 * The variant of an expanded definition as the report and the known findings name it, for example `SD+PA`: its
 * variant codes in the order format, grant, category.
 */
export function variantOf(definition: { variants?: IssuerVariant[] }): string {
  const order: IssuerVariant[] = ['SD', 'MD', 'PA', 'AC', 'PID', 'Q', 'PB', 'E'];
  const variants = [...(definition.variants ?? [])].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return variants.length ? variants.join('+') : 'default';
}

const ISSUER_CONTROL_MENTION = /`((?:PP|AP)_WS_IA_MainInteraction_\d{3}[a-z]?)`/g;

/**
 * Checks an issuer definition as `defineTestCase` checks an RP one: a valid ID, at least one step, at most one fault
 * per issuance step, each variant code's profile in the profile applicability, and `control` exactly the positive
 * controls the preconditions name.
 */
export function defineIssuerTestCase(definition: IssuerTestCaseDefinition): IssuerTestCaseDefinition {
  parseIssuerTestCaseId(definition.id);
  if (definition.steps.length === 0) throw new Error(`${definition.id}: a test case needs at least one step`);
  for (const step of definition.steps) {
    if (step.run?.kind === 'issuance' && step.run.faults.length > 1) throw new Error(`${definition.id}: a step applies one fault, not ${step.run.faults.join(', ')}`);
  }
  for (const variant of definition.variants ?? []) {
    if (!definition.profile.some((condition) => condition.equals === VARIANT_PROFILES[variant])) {
      throw new Error(`${definition.id}: variant ${variant} needs the profile ${VARIANT_PROFILES[variant]} in its profile applicability`);
    }
  }
  const named = new Set(definition.preconditions.flatMap((p) => [...p.matchAll(ISSUER_CONTROL_MENTION)].map((m) => m[1])));
  const gated = new Set(definition.control ? (Array.isArray(definition.control) ? definition.control : [definition.control]) : []);
  if (named.size !== gated.size || [...named].some((id) => !gated.has(id))) {
    throw new Error(`${definition.id}: control (${[...gated].join(', ') || 'none'}) differs from the controls the preconditions name (${[...named].join(', ') || 'none'})`);
  }
  return definition;
}
