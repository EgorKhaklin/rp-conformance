// The issuer definitions are consistent: valid IDs, one definition per test case and variant, the variant's profiles
// in the profile applicability, and every configuration reference declared by the reference Provider's ICS.
import { readFileSync } from 'node:fs';
import { defineIssuerTestCase, isExecutable, parseIssuerTestCaseId, variantOf } from '@rp-conformance/core';
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
