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

  it('names only configurations the reference ICS declares, in the test cases that apply to it', () => {
    const profiles = new Set((eudiploIcs as { profiles?: string[] }).profiles ?? []);
    // A variant whose profile the ICS does not declare (`MD` without `P-MD`) is NOT APPLICABLE, so its configuration is never resolved.
    for (const definition of issuerDefinitions.filter((d) => isExecutable(d) && d.profile.every((c) => profiles.has(c.equals)))) {
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

// Issue 20: IA_PreAuthorized and IA_AuthorizationCode.
describe('issuer definitions: grants', () => {
  const area = (prefix: string) => issuerDefinitions.filter((d) => d.id.startsWith(prefix));

  it('has the 4 test cases of IA_PreAuthorized in SD+PA and the 7 of IA_AuthorizationCode in SD+AC, all executable', () => {
    expect(area('PP_WS_IA_PreAuthorized_').map((d) => `${d.id} ${variantOf(d)}`)).toEqual(
      ['001_UF', '002_UF', '003_UF', '004_UF'].map((n) => `PP_WS_IA_PreAuthorized_${n} SD+PA`),
    );
    expect(area('PP_WS_IA_AuthorizationCode_').map((d) => `${d.id} ${variantOf(d)}`)).toEqual(
      ['001_UF', '002_UF', '003_UF', '004_UF', '005_UF', '006_UF', '007'].map((n) => `PP_WS_IA_AuthorizationCode_${n} SD+AC`),
    );
    for (const definition of [...area('PP_WS_IA_PreAuthorized_'), ...area('PP_WS_IA_AuthorizationCode_')]) {
      expect(isExecutable(definition), definition.id).toBe(true);
      expect(definition.control).toBe('PP_WS_IA_MainInteraction_001');
    }
  });

  it('has the positive control in SD+AC, and every grant fault the definitions name is of the variant’s grant', async () => {
    expect(executableIssuerDefinitions.some((d) => d.id === 'PP_WS_IA_MainInteraction_001' && variantOf(d) === 'SD+AC')).toBe(true);
    const { GRANT_FAULTS, isGrantFault } = await import('@rp-conformance/core');
    for (const definition of issuerDefinitions) {
      for (const step of definition.steps) {
        if (step.run?.kind !== 'issuance') continue;
        for (const fault of step.run.faults.filter(isGrantFault)) expect(GRANT_FAULTS[fault].grant, `${definition.id} ${fault}`).toBe(step.run.grant);
      }
    }
  });
});
