import { type Flow, faultInfo, faultsOf, flowsOf, type TestCaseDefinition } from '@rp-conformance/core';
import { executableDefinitions } from '@rp-conformance/definitions';
import { defaultEntitiesOf, trustedListEntitiesOf } from '@rp-conformance/forge';
import { beforeAll, describe, expect, it } from 'vitest';
import { Fixture, type Transaction } from './fixture';

// Harness design section 7 for the test definitions: every executable step is built exactly as the controller builds
// it, in every flow the test case runs in, and run through the reference validator in `all` mode. A step expected to be accepted passes every check; a step
// expected to be rejected fails exactly one check, the target of its fault if it has one. So each negative step
// carries one deliberate fault and nothing else.

let fixture: Fixture;

beforeAll(async () => {
  fixture = await Fixture.create();
});

// REJ_OR_ACC: the reference validator takes the rejecting branch (a device-signed element fails key-binding).
const rejects = (codes: string[]) => codes.some((c) => c === 'REJ' || c === 'REJ_OR_ACC' || c === 'NOSTAT' || c === 'POLICY');

async function selfValidate(definition: TestCaseDefinition, flow: Flow) {
  const outcomes: { step: number; expected: string; failures: string[]; target?: string; stale?: boolean; exact?: boolean }[] = [];
  const transactions = new Map<number, Transaction>();
  const presentations = new Map<number, string>();
  const entities = { 'TL-PID': defaultEntitiesOf(fixture.pki, 'TL-PID'), 'TL-QEAA': trustedListEntitiesOf(fixture.pki) };
  try {
    for (const [i, step] of definition.steps.entries()) {
      const action = step.run;
      if (!action) throw new Error(`step ${i + 1} has no action`);
      if (action.kind === 'start') {
        transactions.set(i + 1, await fixture.transaction());
      } else if (action.kind === 'request') {
        // Requests of the reference Relying Party's form pass the checks the step names, none of them skipped for a
        // failed prerequisite or for not applying in the flow.
        const result = await fixture.validateRequests(flow, action.query, { count: action.count });
        const named = (step.expect.checks ?? []).map((check) => result.checks.find((c) => c.check === check));
        outcomes.push({
          step: i + 1,
          expected: 'CONF',
          failures: [...result.failures, ...named.filter((c) => c?.status === 'skip' && !/no state|no trusted_authorities/.test(c.detail ?? '')).map((c) => `${c?.check} skipped`)],
          exact: true,
        });
      } else if (action.kind === 'trust-list') {
        // A version with a fault is refused (it fails exactly its target check); the version in use stays.
        const changed = [...entities[action.list].filter((e) => !action.remove?.includes(e)), ...(action.add ?? [])];
        const refused = await fixture.publishVersion(action, changed);
        const [fault] = action.faults ?? [];
        const target = fault && faultInfo(fault).target;
        outcomes.push({ step: i + 1, expected: 'LIST', failures: refused.map((r) => r.failed ?? 'refused'), target: target ?? undefined, exact: true });
        if (!target) entities[action.list] = changed;
      } else {
        const earlier = action.response.keyOfStep ?? action.response.presentationOfStep;
        const other = earlier ? transactions.get(earlier) : undefined;
        const replayed = action.response.presentationOfStep ? presentations.get(action.response.presentationOfStep) : undefined;
        const result = await fixture.validate(action, { other, flow, replayed });
        transactions.set(i + 1, result.transaction);
        presentations.set(i + 1, result.presentation);
        const [fault] = faultsOf(action);
        outcomes.push({
          step: i + 1,
          expected: step.expect.codes.join('+'),
          failures: result.failures,
          target: fault && (faultInfo(fault).target ?? undefined),
          stale: result.credential?.trustListStale,
        });
      }
    }
  } finally {
    await fixture.restore();
  }
  return outcomes;
}

describe('executable definitions against the reference validator', () => {
  it('all 218 test definitions are executable: the 121 of the baseline (Phases 1 to 4) and 97 of Phase 5', () => {
    expect(executableDefinitions).toHaveLength(218);
  });

  const runs = executableDefinitions.flatMap((d) => flowsOf(d).map((flow) => [d.id, flow, d] as const));

  it.each(runs)('%s via %s: each step carries exactly its one fault', async (_id, flow, definition) => {
    for (const outcome of await selfValidate(definition, flow)) {
      const label = `step ${outcome.step} (${outcome.expected})`;
      if (outcome.exact) {
        // A trust-list step: the reference validator refuses the version exactly for its fault's target, or uses it. A
        // request step: the requests pass every check.
        expect(outcome.failures, label).toEqual(outcome.target ? [outcome.target] : []);
        continue;
      }
      expect(outcome.stale ?? false, `${label}: trust-list-stale`).toBe(outcome.expected.split('+').includes('STALE'));
      if (!rejects(outcome.expected.split('+'))) {
        expect(outcome.failures, label).toEqual([]);
      } else {
        expect(outcome.failures, label).toHaveLength(1);
        if (outcome.target) expect(outcome.failures, label).toEqual([outcome.target]);
      }
    }
  });
});
