// Evaluators of the issuer expected results (issuer harness design section 6.3). They are pure: the runner hands them
// what the step saw (the HTTP exchanges with the Provider, what it issued, the reference validator's results) and they
// return a verdict with its reason.
import type { CheckResult, IssuerExpectation, IssuerExpectationCode } from '@rp-conformance/core';
import { type Evaluation, worst } from '../evaluate';

/** One request of the step to the Provider and its answer, as the evaluators need it. */
export interface ObservedExchange {
  /** `offer`, `metadata`, `metadata-jwt`, `token`, `nonce`, `credential`. */
  step: string;
  /** HTTP status; undefined when no response arrived. */
  status?: number;
  /** The OAuth or OpenID4VCI `error` of the response (JSON body or `WWW-Authenticate`), if any. */
  error?: string;
  /** Why no response arrived. */
  transportError?: string;
}

/** A credential the Provider issued, with the reference validator's result over it (`OBS-CRED`). */
export interface ObservedCredential {
  checks: CheckResult[];
}

/** What an issuance step observed (`OBS-HTTP`, `OBS-CRED`). */
export interface IssuanceObservation {
  exchanges: ObservedExchange[];
  /** The Provider issued an access token in the step. */
  tokenIssued: boolean;
  credentials: ObservedCredential[];
  /** Checks over all credentials of the step, for example `pid-formats`. */
  stepChecks?: CheckResult[];
  /** Why the flow stopped before a credential arrived, as the issuance client reports it. */
  error?: string;
}

const describe = (exchange: ObservedExchange) =>
  `${exchange.step} ${exchange.status !== undefined ? `HTTP ${exchange.status}` : `no response (${exchange.transportError ?? 'unknown'})`}${exchange.error ? ` error ${exchange.error}` : ''}`;

/** The first answer with HTTP 5xx: a Provider never answers a request of the suite with a server error. */
const serverError = (observation: IssuanceObservation) => observation.exchanges.find((e) => e.status !== undefined && e.status >= 500);

/** The last request of the step, at which the flow ended. */
const last = (observation: IssuanceObservation) => observation.exchanges.at(-1);

/**
 * `ISS`: the credential endpoint answered HTTP 200 (202 with a later credential once deferred issuance is implemented),
 * at least one credential arrived, and every check of the reference validator passed on each of them; the checks the
 * expectation names must also have run. A request without any response is INCONCLUSIVE: the harness could not reach
 * the Provider.
 */
export function evaluateIssued(observation: IssuanceObservation, named: string[] = []): Evaluation {
  const failed = serverError(observation);
  if (failed) return { verdict: 'FAIL', reason: `the Provider answered with a server error: ${describe(failed)}` };
  const end = last(observation);
  if (observation.credentials.length === 0) {
    if (!end) return { verdict: 'INCONCLUSIVE', reason: `the issuance did not start: ${observation.error ?? 'no request was sent'}` };
    if (end.status === undefined) return { verdict: 'INCONCLUSIVE', reason: `the Provider did not answer: ${describe(end)}` };
    return { verdict: 'FAIL', reason: `no credential was issued: ${describe(end)}${observation.error ? ` (${observation.error})` : ''}` };
  }
  const problems: string[] = [];
  // A named check of the step as a whole (`pid-formats`, over both formats of one issuance) is judged on the step's
  // checks; every other named check on each credential.
  const stepChecks = observation.stepChecks ?? [];
  const onStep = named.filter((check) => stepChecks.some((c) => c.check === check));
  for (const [index, credential] of observation.credentials.entries()) {
    const label = observation.credentials.length > 1 ? `credential ${index + 1}: ` : '';
    const failures = credential.checks.filter((c) => c.status === 'fail');
    if (failures.length) problems.push(`${label}${failures.map((c) => `${c.check} failed (${c.detail ?? 'no detail'})`).join('; ')}`);
    const missing = named.filter((check) => !onStep.includes(check) && !credential.checks.some((c) => c.check === check && c.status === 'pass'));
    if (missing.length && !failures.length) problems.push(`${label}named checks did not pass: ${missing.join(', ')}`);
  }
  for (const check of stepChecks.filter((c) => onStep.includes(c.check) && c.status !== 'pass')) {
    problems.push(`${check.check} ${check.status === 'fail' ? 'failed' : 'was skipped'} on the step (${check.detail ?? 'no detail'})`);
  }
  if (problems.length) return { verdict: 'FAIL', reason: problems.join('; ') };
  const passed = [...new Set([...observation.credentials, { checks: stepChecks }].flatMap((c) => c.checks.filter((r) => r.status === 'pass').map((r) => r.check)))];
  return { verdict: 'PASS', reason: `issued ${observation.credentials.length} credential(s); every check passed (${passed.join(', ')})` };
}

/**
 * `REJ` and `REJ:<code>`: the Provider issued no credential, and the request at which the flow ended was answered with
 * HTTP 4xx and an OAuth or OpenID4VCI error object; no answer of the step was HTTP 5xx. The flow ends at the faulty
 * request, so a token issued for an earlier, valid request of the step (the token request before a faulty proof) is
 * not a token "for the request". The error code is recorded; `REJ:<code>` requires that code.
 */
export function evaluateRejected(observation: IssuanceObservation, code?: string): Evaluation {
  const failed = serverError(observation);
  if (failed) return { verdict: 'FAIL', reason: `the Provider answered with a server error: ${describe(failed)}` };
  if (observation.credentials.length > 0) return { verdict: 'FAIL', reason: `the Provider issued ${observation.credentials.length} credential(s)` };
  const end = last(observation);
  if (!end) return { verdict: 'INCONCLUSIVE', reason: `the faulty request was not sent: ${observation.error ?? 'no request'}` };
  if (end.status === undefined) return { verdict: 'INCONCLUSIVE', reason: `the Provider did not answer: ${describe(end)}` };
  if (end.status < 400) return { verdict: 'FAIL', reason: `the Provider did not reject the request: ${describe(end)}` };
  if (!end.error) return { verdict: 'FAIL', reason: `HTTP ${end.status} at ${end.step} without an OAuth or OpenID4VCI error object` };
  if (code && end.error !== code) return { verdict: 'FAIL', reason: `rejected at ${end.step} with error ${end.error}, expected ${code}` };
  return { verdict: 'PASS', reason: `rejected at ${end.step}: HTTP ${end.status}, error ${end.error}` };
}

/** What an issuance step ended with, for `INFO`. */
function outcomeOf(observation: IssuanceObservation): string {
  const failed = serverError(observation);
  if (failed) return `the Provider answered with a server error: ${describe(failed)}`;
  if (observation.credentials.length) return `issued ${observation.credentials.length} credential(s)`;
  const end = last(observation);
  return end ? `ended at ${describe(end)}` : `no request was sent${observation.error ? ` (${observation.error})` : ''}`;
}

/**
 * Evaluates the codes of an issuance step; the step's verdict is the worst of them, or with `oneOf` the best (the
 * catalogue's "REJ or CONF"). `CONF` on an issuance step is `ISS` whose named checks must also pass. `INFO` records
 * the outcome and passes, unless the Provider answered with HTTP 5xx.
 */
export function evaluateIssuance(expectation: IssuerExpectation, observation: IssuanceObservation): Evaluation {
  const evaluations = expectation.codes.map((code: IssuerExpectationCode): Evaluation => {
    if (code === 'ISS' || code === 'CONF') return evaluateIssued(observation, expectation.checks);
    if (code === 'REJ') return evaluateRejected(observation);
    if (code.startsWith('REJ:')) return evaluateRejected(observation, code.slice('REJ:'.length));
    if (code === 'INFO') return serverError(observation) ? { verdict: 'FAIL', reason: outcomeOf(observation) } : { verdict: 'PASS', reason: `recorded: ${outcomeOf(observation)}` };
    return { verdict: 'INCONCLUSIVE', reason: `expected result ${code} is not implemented for an issuance step` };
  });
  if (expectation.oneOf) {
    const passed = evaluations.find((e) => e.verdict === 'PASS');
    if (passed) return passed;
    return { verdict: worst(evaluations.map((e) => e.verdict)), reason: `none of ${expectation.codes.join(', ')}: ${evaluations.map((e) => e.reason).join('; ')}` };
  }
  return { verdict: worst(evaluations.map((e) => e.verdict)), reason: evaluations.map((e) => e.reason).join('; ') };
}
