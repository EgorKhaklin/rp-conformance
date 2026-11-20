// The issuer definitions are consistent: valid IDs, one definition per test case and variant, the variant's profiles
// in the profile applicability, and every configuration reference declared by the reference Provider's ICS.
import { readFileSync } from 'node:fs';
import { defineIssuerTestCase, ISSUER_OUTPUT_CHECKS, isExecutable, parseIssuerTestCaseId, variantOf } from '@rp-conformance/core';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { executableIssuerDefinitions, issuerDefinitions } from '../src/index';

const eudiploIcs = parse(readFileSync(new URL('../../../adapters/issuer-eudiplo/ics.yaml', import.meta.url), 'utf8')) as { items: Record<string, unknown> };

describe('issuer definitions', () => {
  it('has PP_WS_IA_MainInteraction_001 in SD+PA as an executable positive control', () => {
    const control = executableIssuerDefinitions.find((d) => d.id === 'PP_WS_IA_MainInteraction_001' && variantOf(d) === 'SD+PA');
    expect(control?.control).toBeUndefined();
    expect(control?.steps.map((s) => s.expect.codes)).toEqual([['ISS']]);
  });

  it('has one definition per test case and variant, each with a valid ID', () => {
    const keys = issuerDefinitions.map((d) => `${d.id} ${variantOf(d)}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const definition of issuerDefinitions) expect(() => parseIssuerTestCaseId(definition.id)).not.toThrow();
  });

  it('refuses a variant whose profile is missing, and an RP ID', () => {
    const [definition] = issuerDefinitions;
    expect(() => defineIssuerTestCase({ ...definition, profile: [] })).toThrow(/needs the profile P-SD/);
    expect(() => defineIssuerTestCase({ ...definition, id: 'RP_WS_IA_MainInteraction_001a' })).toThrow(/not an issuer test case ID/);
  });

  it('names only configurations the reference ICS declares', () => {
    for (const definition of issuerDefinitions.filter(isExecutable)) {
      for (const step of definition.steps) {
        if (step.run?.kind !== 'issuance') continue;
        for (const configuration of step.run.configurations) expect(eudiploIcs.items[configuration], configuration).toEqual(expect.any(String));
      }
    }
  });

  it('defines the 17 objectives of SM_Validity and DM_* (issue 21), each with CONF and one named check', () => {
    const area = issuerDefinitions.filter((d) => /^PP_WS_(SM_Validity|DM_)/.test(d.id));
    expect(new Set(area.map((d) => d.id)).size).toBe(17);
    const named = new Set<string>([...ISSUER_OUTPUT_CHECKS, 'status-reference']);
    for (const definition of area) {
      expect(definition.control, definition.id).toBeUndefined();
      for (const step of definition.steps) {
        expect(step.expect.codes, definition.id).toEqual(['CONF']);
        expect(step.expect.checks?.length, definition.id).toBe(1);
        expect(named.has(step.expect.checks?.[0] as string), definition.id).toBe(true);
      }
    }
  });

  it('has the mdoc positive control and both formats with one access token', () => {
    expect(executableIssuerDefinitions.some((d) => d.id === 'PP_WS_IA_MainInteraction_001' && variantOf(d) === 'MD+PA')).toBe(true);
    const both = executableIssuerDefinitions.find((d) => d.id === 'PP_WS_IA_MainInteraction_003' && variantOf(d) === 'PA');
    expect(both?.steps[0].run).toMatchObject({ kind: 'issuance', configurations: ['ICS-02.SD', 'ICS-02.MD'] });
  });
});
