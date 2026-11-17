import { type Flow, faultInfo, faultsOf, flowsOf, type TestCaseDefinition } from '@rp-conformance/core';
import { executableDefinitions } from '@rp-conformance/definitions';
import { defaultEntitiesOf } from '@rp-conformance/forge';
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
  const outcomes: { step: number; expected: string; failures: string[]; target?: string }[] = [];
  const transactions = new Map<number, Transaction>();
  const presentations = new Map<number, string>();
  let pidList = defaultEntitiesOf(fixture.pki, 'TL-PID');
  try {
    for (const [i, step] of definition.steps.entries()) {
      const action = step.run;
      if (!action) throw new Error(`step ${i + 1} has no action`);
      if (action.kind === 'start') {
        transactions.set(i + 1, await fixture.transaction());
      } else if (action.kind === 'trust-list') {
        pidList = [...pidList.filter((e) => !action.remove?.includes(e)), ...(action.add ?? [])];
        await fixture.publish(action.list, pidList);
      } else {
        const earlier = action.response.keyOfStep ?? action.response.presentationOfStep;
        const other = earlier ? transactions.get(earlier) : undefined;
        const replayed = action.response.presentationOfStep ? presentations.get(action.response.presentationOfStep) : undefined;
        const result = await fixture.validate(action, { other, flow, replayed });
        transactions.set(i + 1, result.transaction);
        presentations.set(i + 1, result.presentation);
        const [fault] = faultsOf(action);
        outcomes.push({ step: i + 1, expected: step.expect.codes.join('+'), failures: result.failures, target: fault && (faultInfo(fault).target ?? undefined) });
      }
    }
  } finally {
    await fixture.publish('TL-PID');
  }
  return outcomes;
}

describe('executable definitions against the reference validator', () => {
  it('all 184 test definitions are executable: the 121 of the baseline (Phases 1 to 4) and 63 of Phase 5', () => {
    expect(executableDefinitions).toHaveLength(184);
  });

  const runs = executableDefinitions.flatMap((d) => flowsOf(d).map((flow) => [d.id, flow, d] as const));

  it.each(runs)('%s via %s: each step carries exactly its one fault', async (_id, flow, definition) => {
    for (const outcome of await selfValidate(definition, flow)) {
      const label = `step ${outcome.step} (${outcome.expected})`;
      if (!rejects(outcome.expected.split('+'))) {
        expect(outcome.failures, label).toEqual([]);
      } else {
        expect(outcome.failures, label).toHaveLength(1);
        if (outcome.target) expect(outcome.failures, label).toEqual([outcome.target]);
      }
    }
  });
});
