// Issue 26: the `trust-list` step of the issuer suite (issuer harness design section 6.1, catalogue `SCN-T` and section
// 5.3): the Test Trust Infrastructure publishes a version of `TL-WP` with the step's changes and at most one of the RP
// harness's trust-list faults, and the Provider refreshes, through the adapter's `refreshTrust` or by waiting `T_refresh`
// (ICS-15). A test case that changed `TL-WP` restores the default version under a higher sequence number afterwards, so
// later test cases see the trust configuration of `default_configuration_PP_1` again. Test cases with a `trust-list`
// step change what the Provider trusts for every Wallet Unit; the runner runs them one at a time (none of them waits).
import { durationMs, faultInfo, type IssuerAdapter, type IssuerExpectation, type IssuerIcs, type IssuerTrustListAction } from '@rp-conformance/core';
import type { Evaluation } from '../evaluate';
import type { IssuerHarness } from './harness';
import { issuerIcsValue } from './ics';

export interface TrustListState {
  /** The versions of `TL-WP` the test case published, the last one last. */
  trustLists?: { action: IssuerTrustListAction; sequenceNumber: number; publishedAt: Date }[];
}

export interface TrustListContext {
  harness: IssuerHarness;
  adapter: IssuerAdapter;
  ics: IssuerIcs;
  namespace: string;
  log?: (line: string) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Makes the Provider read `TL-WP` again: the adapter's `refreshTrust`, or a wait of `T_refresh` (ICS-15). */
async function refresh(ctx: TrustListContext): Promise<string> {
  if (ctx.adapter.refreshTrust) {
    await ctx.adapter.refreshTrust(ctx.namespace);
    return 'the adapter made the Provider refresh its trust lists (refreshTrust)';
  }
  const wait = durationMs(issuerIcsValue(ctx.ics, 'ICS-15.T_refresh'));
  if (wait === undefined) throw new Error('the adapter has no refreshTrust and the ICS declares no T_refresh (ICS-15.T_refresh)');
  ctx.log?.(`    waiting T_refresh ${wait / 1000} s for the Provider to read TL-WP again`);
  await sleep(wait + 1000);
  return `waited T_refresh (${wait / 1000} s)`;
}

/** A `trust-list` step: publishes the version of `TL-WP`, then the Provider refreshes. Its expectation is `INFO`. */
export async function runTrustListStep(action: IssuerTrustListAction, state: TrustListState, ctx: TrustListContext): Promise<Evaluation> {
  const published = await ctx.harness.publishTlWp(action);
  (state.trustLists ??= []).push({ action, sequenceNumber: published.sequenceNumber, publishedAt: published.publishedAt });
  const how = await refresh(ctx);
  const [fault] = action.faults ?? [];
  const changes = [
    ...(action.remove?.length ? [`without ${action.remove.join(', ')}`] : []),
    ...(action.add?.length ? [`with ${action.add.join(', ')} added`] : []),
    ...(action.withdraw?.length ? [`with ${action.withdraw.join(', ')} withdrawn`] : []),
    ...(action.restoreIssuance?.length ? [`with ${action.restoreIssuance.join(', ')} granted`] : []),
    ...(fault ? [`with fault ${fault} (${faultInfo(fault).text})`] : []),
  ];
  return {
    verdict: 'PASS',
    reason: `recorded: TL-WP version ${published.version}, LoTESequenceNumber ${published.sequenceNumber}, entities ${published.entities.join(', ')}${changes.length ? `, ${changes.join(', ')}` : ''}; ${how}`,
  };
}

/** After a test case that published `TL-WP`: the default version under the next sequence number, and a refresh. */
export async function restoreTrustList(state: TrustListState, ctx: TrustListContext): Promise<void> {
  if (!state.trustLists?.length) return;
  await ctx.harness.publishTlWp();
  await refresh(ctx);
}

/**
 * `POLICY` (ICS-15) on an issuance step after a stale `TL-WP` (`trust-list.stale-*`, `PP_Inf_SM_TrustMechanisms_006_UF`):
 * a list past its `NextUpdate` by more than the declared grace period is not used, so the Wallet Provider is not trusted
 * and the Provider rejects (`REJ`); within the grace period the list still applies (`ISS`). Returns the expectation the
 * declaration gives, with the reason.
 */
export function policyExpectation(expect: IssuerExpectation, state: TrustListState, ics: IssuerIcs): { expect: IssuerExpectation; reason: string } | undefined {
  if (!expect.codes.includes('POLICY') || expect.policy !== 'ICS-15') return undefined;
  const last = state.trustLists?.at(-1);
  const [fault] = last?.action.faults ?? [];
  const grace = issuerIcsValue(ics, 'ICS-15.next_update_grace') ?? 'PT0S';
  const beyond = fault === 'trust-list.stale-after-grace';
  const within = fault === 'trust-list.stale-within-grace';
  if (!beyond && !within) throw new Error('POLICY (ICS-15) needs an earlier trust-list step with a stale list');
  const codes = expect.codes.map((code) => (code === 'POLICY' ? (beyond ? 'REJ' : 'ISS') : code));
  return {
    expect: { ...expect, codes },
    reason: `ICS-15 declares a grace period of ${grace}; the list's NextUpdate lies ${beyond ? 'beyond' : 'within'} it, so the declared policy gives ${beyond ? 'REJ' : 'ISS'}`,
  };
}
