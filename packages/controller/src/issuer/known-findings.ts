// Known findings of a Provider under test (issuer harness design section 5.5): FAILs reported upstream with evidence.
// The reference run reports them as known and marks their test cases not validated; they do not fail the run.
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { IssuerRunReport } from './runner';

export interface IssuerKnownFinding {
  testCase: string;
  /** The variants the finding shows in, as the report names them (`SD+PA`); default every variant. */
  variants?: string[];
  /** What the Provider does wrong, in one sentence. */
  finding: string;
  /** Where the finding is tracked, for example an upstream issue. */
  reference?: string;
}

/** Reads a YAML list of known findings (`testCase`, optional `variants`, `finding`, optional `reference`). */
export async function loadIssuerKnownFindings(path: string): Promise<IssuerKnownFinding[]> {
  const findings = parse(await readFile(path, 'utf8')) as IssuerKnownFinding[] | null;
  if (!Array.isArray(findings)) throw new Error(`${path}: not a list of known findings`);
  for (const [i, f] of findings.entries()) {
    if (typeof f?.testCase !== 'string' || typeof f.finding !== 'string') throw new Error(`${path}: entry ${i + 1} needs testCase and finding`);
    if (f.variants && (!Array.isArray(f.variants) || f.variants.some((v) => typeof v !== 'string'))) throw new Error(`${path}: entry ${i + 1}: variants is not a list`);
  }
  return findings;
}

export function issuerKnownFindingOf(findings: IssuerKnownFinding[], testCase: string, variant: string): IssuerKnownFinding | undefined {
  return findings.find((f) => f.testCase === testCase && (!f.variants || f.variants.includes(variant)));
}

export const describeIssuerFinding = (finding: IssuerKnownFinding) => `${finding.finding}${finding.reference ? ` (${finding.reference})` : ''}`;

/** As `runOutcome` on the RP side: the run passes with no run error, no INCONCLUSIVE or REVIEW, and only known FAILs. */
export function issuerRunOutcome(report: IssuerRunReport, findings: IssuerKnownFinding[]) {
  const unexpected: string[] = report.run.error ? [`run error: ${report.run.error}`] : [];
  const known: string[] = [];
  const resolved: string[] = [];
  for (const result of report.results) {
    const label = `${result.testCase} [${result.variant}]`;
    const finding = issuerKnownFindingOf(findings, result.testCase, result.variant);
    if (result.verdict === 'FAIL' && finding) known.push(`${label}: ${describeIssuerFinding(finding)}`);
    else if (result.verdict === 'FAIL' || result.verdict === 'INCONCLUSIVE' || result.verdict === 'REVIEW') unexpected.push(`${label} ${result.verdict}`);
    else if (result.verdict === 'PASS' && finding) resolved.push(label);
  }
  return { ok: unexpected.length === 0, unexpected, known, resolved };
}
