// The SUT-neutral part of a test definition: the FCAF test case fields, steps, expectations, relevancy, ICS conditions
// and verdicts. Each kind of SUT adds its step actions and expectation codes: `rp/` for the Relying Party, `issuer/` for
// the PID Provider and Attestation Provider.

/** FCAF test case verdicts. */
export type Verdict = 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'NOT APPLICABLE' | 'REVIEW';

/** A condition of the `Profile applicability` section, evaluated against the ICS of the SUT. */
export interface IcsCondition {
  /** ICS item ID, for example `RP.G.1`. */
  item: string;
  /** The text of the ICS item, rendered as the profile applicability line. */
  text: string;
  /** The answer that makes the test case applicable. */
  equals: string;
}

/** `EUDI-wallet relevancy` values of the FCAF methodology. */
export const relevancy = {
  genericRequired: 'EUDI_generic | EUDI_required',
  genericOptional: 'EUDI_generic | EUDI_optional',
  genericUndefined: 'EUDI_generic | EUDI_undefined',
  specificRequired: 'EUDI_specific | EUDI_required',
  specificOptional: 'EUDI_specific | EUDI_optional',
} as const;

export type Relevancy = (typeof relevancy)[keyof typeof relevancy];

/** Credential formats (OpenID4VP and OpenID4VCI format identifiers). */
export type CredentialFormat = 'dc+sd-jwt' | 'mso_mdoc';

/** An expected result: the codes the controller evaluates and the FCAF text it renders. */
export interface ExpectationOf<Code extends string> {
  codes: Code[];
  text: string;
}

/** One line of `Test Scenario` with its line of `Expected results`, and what the harness executes for it. */
export interface StepDefinitionOf<Action, Expect extends ExpectationOf<string>> {
  /** Test scenario text of the step. */
  text: string;
  /** What the harness executes; left out while the step is text only (a later phase makes it executable). */
  run?: Action;
  expect: Expect;
}

/**
 * An executable test definition: every field of an FCAF test case, so the FCAF markdown is rendered from it, and
 * the executable steps (harness design section 4.2).
 */
export interface TestCaseDefinitionOf<Step extends StepDefinitionOf<unknown, ExpectationOf<string>>> {
  /** The FCAF test case ID; its class, layer and area also give the file location. */
  id: string;
  objective: string;
  references: string[];
  /** `Profile applicability`; rendered as `None` when empty. */
  profile: IcsCondition[];
  relevancy: Relevancy;
  /** `Technology`; the section is left out when empty. */
  technology: string[];
  /** `Preconditions`; rendered as `None` when empty. */
  preconditions: string[];
  /**
   * The positive control(s) this test case depends on: it is executed only if one of them passed for the same flow.
   * Left out for a positive control. The preconditions must state it (see `preconditions.control`).
   */
  control?: string | string[];
  steps: Step[];
  /** `Comments`, one paragraph each; the section is left out when empty. */
  comments?: string[];
}

/** A definition is executable when every step has an action. */
export function isExecutable(definition: { steps: { run?: unknown }[] }): boolean {
  return definition.steps.every((s) => s.run !== undefined);
}

/** The controls of a definition as a list. */
export function controlsOf(definition: { control?: string | string[] }): string[] {
  if (!definition.control) return [];
  return Array.isArray(definition.control) ? definition.control : [definition.control];
}

/** ISO 8601 duration (`PT1H`, `PT5M`, `PT30S`) in milliseconds. */
export function durationMs(value: string | undefined): number | undefined {
  const match = value && /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(value);
  if (!match) return undefined;
  const [, d = '0', h = '0', m = '0', s = '0'] = match;
  return ((Number(d) * 24 + Number(h)) * 60 + Number(m)) * 60_000 + Number(s) * 1000;
}

/**
 * A test book item: a requirement checked by inspection (document, configuration or process review, walkthrough)
 * instead of a protocol stimulus, so it has no steps. The harness reports each one as REVIEW with its method; the
 * Relying Party class `RP_TB` (`rp-test-catalogue.md` section 5.4), the PID Provider and Attestation Provider class
 * `PP_TB` (`issuer-test-catalogue.md` section 5.5).
 */
export interface TestBookItem {
  /** `<class>_TB_<nnn>`, for example `RP_TB_001`. */
  id: string;
  objective: string;
  /** How the item is inspected, for example `Document review.`. */
  method: string;
  references: string[];
  relevancy: Relevancy;
}

/** Test book item IDs: the SUT class prefix, `TB` and a three-digit number. */
export const TEST_BOOK_ID = /^(RP|PP)_TB_(\d{3})$/;

/** Checks a test book item: a valid ID, and an objective and method to review. */
export function defineTestBookItem(item: TestBookItem): TestBookItem {
  if (!TEST_BOOK_ID.test(item.id)) throw new Error(`${item.id} is not a test book item ID`);
  if (!item.objective.trim() || !item.method.trim()) throw new Error(`${item.id}: a test book item needs an objective and a method`);
  return item;
}
