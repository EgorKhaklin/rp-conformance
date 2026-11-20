import { ISSUER_ICS_ITEMS } from '@rp-conformance/core';
import { describe, expect, it } from 'vitest';
import { loadIssuerIcs } from '../src/index';

describe('ICS of EUDIPLO as PID Provider', () => {
  it('answers every item ICS-01 to ICS-19', async () => {
    const ics = await loadIssuerIcs();
    const answered = new Set(Object.keys(ics.items).map((key) => key.split('.')[0]));
    expect([...answered].sort()).toEqual(Object.keys(ISSUER_ICS_ITEMS).sort());
  });

  it('selects the profiles its answers declare', async () => {
    const ics = await loadIssuerIcs();
    expect(ics.profiles).toContain('P-PID');
    expect(ics.profiles).toContain('P-AC'); // built-in authorization server, authenticateSubject follows its redirect (issue 20)
    expect(ics.profiles).not.toContain('P-CHAIN');
    expect(ics.items['ICS-07']).toBe('No');
    expect(ics.items['ICS-16.min_entries']).toBeGreaterThanOrEqual(10_000);
  });
});
