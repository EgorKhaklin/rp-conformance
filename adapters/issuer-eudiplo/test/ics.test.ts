import { ISSUER_ICS_ITEMS } from '@rp-conformance/core';
import { describe, expect, it } from 'vitest';
import { durationSeconds, icsProblems, loadIssuerIcs } from '../src/index';

describe('ICS of EUDIPLO as PID Provider (pinned reference image)', () => {
  it('answers every item ICS-01 to ICS-19 within the catalogue limits', async () => {
    const ics = await loadIssuerIcs();
    const answered = new Set(Object.keys(ics.items).map((key) => key.split('.')[0]));
    expect([...answered].sort()).toEqual(Object.keys(ISSUER_ICS_ITEMS).sort());
    expect(icsProblems(ics)).toEqual([]);
  });

  it('declares what the reference image does', async () => {
    const ics = await loadIssuerIcs();
    expect(ics.profiles).toContain('P-PID');
    // Revocation chaining with revokeWithWalletUnit, within T_chain.
    expect(ics.profiles).toContain('P-CHAIN');
    expect(ics.items['ICS-07']).toBe('Yes');
    expect(durationSeconds(ics.items['ICS-07.T_chain'])).toBeLessThanOrEqual(24 * 3600);
    // Strict status checks of WIA and KA: a PID Provider rejects (decision 2).
    expect(ics.items['ICS-18']).toBe('reject');
    expect(ics.items['ICS-15.next_update_grace']).toBe('PT0S');
    // Authorization code at the built-in authorization server, authenticateSubject follows its redirect (issue 20).
    expect(ics.profiles).toContain('P-AC');
    // Still lacking: DPoP server nonce, identifier lists.
    expect(ics.profiles).not.toContain('P-IL');
    expect(ics.items['ICS-13.dpop_nonce']).toBe('No');
    expect(ics.items['ICS-16.min_entries']).toBeGreaterThanOrEqual(10_000);
  });
});

describe('ICS checks', () => {
  it('reads durations', () => {
    expect(durationSeconds('PT7M')).toBe(420);
    expect(durationSeconds('P1DT1H')).toBe(90_000);
    expect(durationSeconds('PT0S')).toBe(0);
    expect(durationSeconds('not bounded')).toBeUndefined();
    expect(durationSeconds('PT')).toBeUndefined();
  });

  it('names values beyond the catalogue limits and profiles without their values', () => {
    expect(
      icsProblems({
        profiles: ['P-HOOK', 'P-CHAIN'],
        items: { 'ICS-06.T_rev': 'P2D', 'ICS-14.T_proof': 'PT10M', 'ICS-16.min_entries': 100 },
      }),
    ).toEqual([
      'ICS-06.T_rev P2D is above the catalogue\'s 86400 s',
      'ICS-14.T_proof PT10M is above the catalogue\'s 300 s',
      'ICS-16.min_entries 100 is below 10 000 (decision 4)',
      'P-CHAIN without a duration ICS-07.T_chain',
    ]);
  });
});
