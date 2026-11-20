// The known findings of the EUDIPLO adapters (spec review of 2026-11-20): every entry says what it rests on, the base
// specification (`confirmed`) or the EUDI profile only (`profile`).
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadIssuerKnownFindings } from '../src/issuer/known-findings';
import { loadKnownFindings } from '../src/known-findings';

const root = resolve(import.meta.dirname, '../../..');

describe('known findings of the EUDIPLO adapters', () => {
  it('mark every RP finding as confirmed or profile', async () => {
    const findings = await loadKnownFindings(resolve(root, 'adapters/eudiplo/known-findings.yaml'));
    expect(findings.filter((f) => !f.basis).map((f) => f.testCase)).toEqual([]);
  });

  it('mark every issuer finding as confirmed or profile', async () => {
    const findings = await loadIssuerKnownFindings(resolve(root, 'adapters/issuer-eudiplo/known-findings.yaml'));
    expect(findings.filter((f) => !f.basis).map((f) => f.testCase)).toEqual([]);
  });
});
