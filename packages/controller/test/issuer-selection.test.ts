// Selection of the issuer suite (`rp-conformance issuer`): patterns, positive controls first, one definition per
// variant, `--list`, the usage, and the applicability of a definition and its variant to the Provider's ICS.
import { defineIssuerTestCase, type IssuerIcs, type IssuerTestCaseDefinition, relevancy } from '@rp-conformance/core';
import { issuance, iss, pidProfile, preconditions, rej } from '@rp-conformance/issuer-definitions';
import { describe, expect, it } from 'vitest';
import { issuerMain, listIssuerTestCases } from '../src/issuer/cli';
import { issuerApplicability, resolveConfigurations, usesTxCode } from '../src/issuer/ics';
import { selectIssuerTestCases } from '../src/issuer/runner';

const CONTROL = 'PP_WS_IA_MainInteraction_001';

const make = (id: string, variants: ['SD' | 'MD', 'PA' | 'AC'], control?: string): IssuerTestCaseDefinition =>
  defineIssuerTestCase({
    id,
    variants,
    objective: '',
    references: [],
    profile: pidProfile(...variants),
    relevancy: relevancy.specificRequired,
    technology: [],
    preconditions: [...preconditions.base, ...(control ? [preconditions.control(control)] : [])],
    ...(control ? { control } : {}),
    steps: [{ text: '', run: issuance(...variants), expect: control ? rej() : iss(variants[0]) }],
  });

const all = [
  make('PP_WS_SM_KeyAttestation_004_UF', ['SD', 'PA'], CONTROL),
  make(CONTROL, ['SD', 'PA']),
  make(CONTROL, ['MD', 'PA']),
  make('PP_WS_SM_ProofOfPossession_001_UF', ['SD', 'PA'], CONTROL),
];

const textOnly: IssuerTestCaseDefinition = { ...make('PP_WS_IA_MainInteraction_002', ['SD', 'PA']), steps: [{ text: '', expect: iss('SD') }] };

describe('issuer selection', () => {
  it('adds the positive control in every variant and runs controls first', () => {
    expect(selectIssuerTestCases(all, ['PP_WS_SM_KeyAttestation_004_UF']).map((d) => `${d.id} ${d.variants?.join('+')}`)).toEqual([
      `${CONTROL} SD+PA`,
      `${CONTROL} MD+PA`,
      'PP_WS_SM_KeyAttestation_004_UF SD+PA',
    ]);
  });

  it('selects by pattern', () => {
    expect(selectIssuerTestCases(all, ['PP_WS_SM_*']).map((d) => d.id)).toEqual([CONTROL, CONTROL, 'PP_WS_SM_KeyAttestation_004_UF', 'PP_WS_SM_ProofOfPossession_001_UF']);
  });

  it('selects every executable definition without --only and leaves text-only ones out', () => {
    expect(selectIssuerTestCases([...all, textOnly])).toHaveLength(4);
  });

  it('refuses a pattern that matches nothing executable, naming text-only matches', () => {
    expect(() => selectIssuerTestCases([...all, textOnly], ['PP_WS_IA_MainInteraction_002'])).toThrow(/text only: PP_WS_IA_MainInteraction_002/);
  });

  it('lists one line per test case and variant', () => {
    expect(listIssuerTestCases([all[1], all[0], textOnly])).toEqual([
      `${CONTROL} [SD+PA] (positive control)`,
      'PP_WS_SM_KeyAttestation_004_UF [SD+PA]',
      'PP_WS_IA_MainInteraction_002 [SD+PA] (positive control, text only)',
    ]);
  });

  it('issuer --list prints the issuer definitions; run without an adapter prints the usage', async () => {
    let out = '';
    let err = '';
    const io = { out: (text: string) => void (out += text), err: (text: string) => void (err += text) };
    expect(await issuerMain(['--list'], io)).toBe(0);
    expect(out).toContain(`${CONTROL} [SD+PA] (positive control)`);
    expect(await issuerMain(['run'], io)).toBe(2);
    expect(err).toContain('rp-conformance issuer run --adapter <eudiplo>');
  });
});

describe('issuer ICS', () => {
  const ics: IssuerIcs = { profiles: ['P-PID', 'P-SD', 'P-PA'], items: { 'ICS-02.SD': 'pid-sd-jwt-vc', 'ICS-03.tx_code': 'with and without' } };

  it('applies a variant the ICS declares, not one it does not', () => {
    expect(issuerApplicability(all[1], ics)).toEqual([]);
    expect(issuerApplicability(all[2], ics).join()).toContain('P-MD');
  });

  it('resolves configuration references against ICS-02', () => {
    expect(resolveConfigurations(['ICS-02.SD', 'literal-id'], ics)).toEqual(['pid-sd-jwt-vc', 'literal-id']);
    expect(() => resolveConfigurations(['ICS-02.MD'], ics)).toThrow(/ICS-02.MD/);
  });

  it('uses a tx_code unless the Provider declares offers without one only', () => {
    expect(usesTxCode(ics)).toBe(true);
    expect(usesTxCode({ ...ics, items: { 'ICS-03.tx_code': 'without' } })).toBe(false);
  });
});
