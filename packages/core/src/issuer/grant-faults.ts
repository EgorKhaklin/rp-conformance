// The checks and named faults of the grant: the authorization code flow with PAR and PKCE, and the pre-authorized code
// flow (issuer harness design section 6.2, points `authorization` and `token-request`). Each fault is applied after a
// valid build of the flow the Conformance Wallet runs and must fail exactly its `target` check of the reference
// validator and no other (section 7, level 1); the implementations are in packages/issuer-wallet/src/grant-faults.ts,
// the checks in packages/validator/src/issuer-grant.ts.
//
// Reusing an artifact of an earlier step (a pre-authorized code, a PAR `request_uri`, an authorization code) is not a
// fault but a `token-reuse` step; the same checks decide it (`pre-authorized-code`, `request-uri`, `authorization-code`,
// `code-binding`). Kept apart from the faults of the points `wia`, `wia-pop`, `ka` and `proof` (issue 18).

/**
 * The checks of the grant, in the order the reference validator evaluates them. They are what an Authorization Server
 * must verify before it issues a code or a token, so each one is the reason a conforming one rejects a faulty request.
 */
export const GRANT_CHECKS = [
  // Authorization code flow: the PAR request and the authorization request (RFC 9126; RFC 7636; OpenID4VCI 1.0 section 5)
  'par',
  'pkce',
  'authorization-details',
  'request-uri',
  // Its token request (RFC 6749 section 4.1.3; RFC 7636 section 4.6)
  'authorization-code',
  'code-binding',
  'pkce-verifier',
  // Pre-authorized code flow: its token request (OpenID4VCI 1.0 sections 4.1.1, 6.1 and 6.3)
  'pre-authorized-code',
  'tx-code',
] as const;

export type GrantCheck = (typeof GRANT_CHECKS)[number];

/**
 * The checks of the authorization response the Authorization Server redirects to the wallet with (RFC 6749 section
 * 4.1.2, RFC 9207; HAIP section 4): named by `CONF` expectations, not targets of a fault.
 */
export const AUTHORIZATION_RESPONSE_CHECKS = ['authorization-response-code', 'authorization-response-state', 'authorization-response-iss'] as const;

export type AuthorizationResponseCheck = (typeof AUTHORIZATION_RESPONSE_CHECKS)[number];

/** Where a grant fault is applied: the PAR and authorization request, or the token request. */
export type GrantFaultPoint = 'authorization' | 'token-request';

export interface GrantFaultInfo {
  point: GrantFaultPoint;
  target: GrantCheck;
  /** The difference from the valid flow, as the FCAF scenario words it (after "except that" / "only in that"). */
  text: string;
  /** The catalogue objectives (`issuer-test-catalogue.md` section 5.1.2) whose stimulus the fault is. */
  testCases: string[];
  /** The grant the fault applies to. */
  grant: 'authorization_code' | 'pre-authorized_code';
  /**
   * The fault waits for a lifetime the SUT declares or returns, plus one hour (catalogue section 3.5): the PAR
   * `request_uri` (`expires_in`) or the pre-authorized code (ICS-14). The runner makes such a step NOT APPLICABLE when
   * the wait exceeds the run's limit (`--max-wait`).
   */
  waitsFor?: 'request-uri' | 'pre-authorized-code';
  /** The fault needs the code of a second offer, for a second configuration of the same SUT (ICS-02.second). */
  otherOffer?: true;
}

const AC = 'PP_WS_IA_AuthorizationCode';
const PA = 'PP_WS_IA_PreAuthorized';

const authorization = (target: GrantCheck, text: string, ...testCases: string[]): GrantFaultInfo => ({ point: 'authorization', grant: 'authorization_code', target, text, testCases });
const codeToken = (target: GrantCheck, text: string, ...testCases: string[]): GrantFaultInfo => ({ point: 'token-request', grant: 'authorization_code', target, text, testCases });
const preAuthToken = (target: GrantCheck, text: string, ...testCases: string[]): GrantFaultInfo => ({ point: 'token-request', grant: 'pre-authorized_code', target, text, testCases });

/** Wrong `tx_code` attempts before the right one in `token-request.tx-code-repeated` (catalogue `IA_PreAuthorized_002_UF`). */
export const TX_CODE_WRONG_ATTEMPTS = 10;
/** The margin added to a lifetime before an expired artifact is used (catalogue section 3.5). */
export const EXPIRY_MARGIN_SECONDS = 3600;

export const GRANT_FAULTS = {
  'authorization.no-par': authorization(
    'par',
    'it sends no pushed authorization request: the authorization request goes to the authorization endpoint with every parameter in its query (`response_type`, `client_id`, `redirect_uri`, `state`, `issuer_state`, `code_challenge`, `code_challenge_method`, `authorization_details`)',
    `${AC}_001_UF`,
  ),
  'authorization.pkce-missing': authorization('pkce', 'its pushed authorization request carries neither `code_challenge` nor `code_challenge_method`', `${AC}_002_UF`),
  'authorization.pkce-plain': authorization('pkce', 'its pushed authorization request carries `code_challenge_method` `plain` and the `code_verifier` itself as `code_challenge`', `${AC}_002_UF`),
  'authorization.authorization-details-unknown': authorization(
    'authorization-details',
    'the `credential_configuration_id` in the `authorization_details` of its pushed authorization request is `unknown-configuration`, which the Credential Issuer metadata does not offer',
    `${AC}_006_UF`,
  ),
  'authorization.scope-unknown': authorization(
    'authorization-details',
    'its pushed authorization request carries no `authorization_details` but `scope` `unknown-scope`, which no credential configuration of the Credential Issuer metadata names',
    `${AC}_006_UF`,
  ),
  'authorization.request-uri-expired': {
    ...authorization('request-uri', 'its authorization request is sent one hour after the `expires_in` of the `request_uri` the pushed authorization request returned', `${AC}_004_UF`),
    waitsFor: 'request-uri',
  },
  'token-request.code-verifier-wrong': codeToken('pkce-verifier', 'the `code_verifier` of its token request is a newly generated verifier, not the one whose S256 hash was sent as `code_challenge`', `${AC}_003_UF`),
  'token-request.code-verifier-missing': codeToken('pkce-verifier', 'its token request carries no `code_verifier`', `${AC}_003_UF`),
  'token-request.redirect-uri-other': codeToken(
    'code-binding',
    'the `redirect_uri` of its token request is `https://other-wallet.rp-conformance.invalid/callback`, not the one of its pushed authorization request',
    `${AC}_005_UF`,
  ),
  'token-request.tx-code-wrong': preAuthToken('tx-code', 'the `tx_code` of its token request is a wrong value of the declared length', `${PA}_002_UF`),
  'token-request.tx-code-missing': preAuthToken('tx-code', 'its token request carries no `tx_code`, although the offer requires one', `${PA}_002_UF`),
  'token-request.tx-code-repeated': preAuthToken(
    'tx-code',
    `it first sends ${TX_CODE_WRONG_ATTEMPTS} token requests with wrong \`tx_code\` values of the declared length, then the token request with the right \`tx_code\``,
    `${PA}_002_UF`,
  ),
  'token-request.pre-authorized-code-other-offer': {
    ...preAuthToken(
      'pre-authorized-code',
      'its token request carries the `pre-authorized_code` (and `tx_code`) of a second offer of the SUT for the configuration `ICS-02.second`, and its credential request then asks for the configuration of this offer',
      `${PA}_004_UF`,
    ),
    otherOffer: true,
  },
  'token-request.pre-authorized-code-expired': {
    ...preAuthToken('pre-authorized-code', 'its token request is sent one hour after the lifetime of the pre-authorized code the SUT declares (ICS-14.pre_authorized_code)', `${PA}_003_UF`),
    waitsFor: 'pre-authorized-code',
  },
} as const satisfies Record<string, GrantFaultInfo>;

export type GrantFaultId = keyof typeof GRANT_FAULTS;

export const GRANT_FAULT_IDS = Object.keys(GRANT_FAULTS) as GrantFaultId[];

export const isGrantFault = (id: string): id is GrantFaultId => id in GRANT_FAULTS;

export function grantFaultInfo(id: GrantFaultId): GrantFaultInfo {
  const info = GRANT_FAULTS[id] as GrantFaultInfo | undefined;
  if (!info) throw new Error(`unknown grant fault ${id}`);
  return info;
}

/** Every stimulus of the catalogue tables `IA_PreAuthorized` and `IA_AuthorizationCode`: its faults, or how it runs instead. */
export interface GrantStimulus {
  testCase: string;
  stimulus: string;
  faults: GrantFaultId[];
  /** Why the stimulus has no fault, and where it is implemented instead. */
  leftOut?: string;
}

const REUSE = (artifact: string) => `a \`token-reuse\` step that sends the ${artifact} of an earlier step again, not a fault; the check it fails is shown in the self-validation`;

export const GRANT_STIMULI: GrantStimulus[] = [
  { testCase: `${PA}_001_UF`, stimulus: 'Second token request with the same code', faults: [], leftOut: REUSE('`pre-authorized_code`') },
  { testCase: `${PA}_002_UF`, stimulus: 'Wrong', faults: ['token-request.tx-code-wrong'] },
  { testCase: `${PA}_002_UF`, stimulus: 'missing', faults: ['token-request.tx-code-missing'] },
  { testCase: `${PA}_002_UF`, stimulus: '10 wrong attempts then right', faults: ['token-request.tx-code-repeated'] },
  { testCase: `${PA}_003_UF`, stimulus: 'Use after the declared lifetime + 1 h', faults: ['token-request.pre-authorized-code-expired'] },
  { testCase: `${PA}_004_UF`, stimulus: 'Swap code', faults: ['token-request.pre-authorized-code-other-offer'] },
  { testCase: `${AC}_001_UF`, stimulus: 'Plain request at the authorization endpoint', faults: ['authorization.no-par'] },
  { testCase: `${AC}_002_UF`, stimulus: 'No `code_challenge`', faults: ['authorization.pkce-missing'] },
  { testCase: `${AC}_002_UF`, stimulus: 'method `plain`', faults: ['authorization.pkce-plain'] },
  { testCase: `${AC}_003_UF`, stimulus: 'Other verifier', faults: ['token-request.code-verifier-wrong', 'token-request.code-verifier-missing'] },
  { testCase: `${AC}_004_UF`, stimulus: 'Reuse', faults: [], leftOut: REUSE('PAR `request_uri`') },
  { testCase: `${AC}_004_UF`, stimulus: 'use after `expires_in`', faults: ['authorization.request-uri-expired'] },
  { testCase: `${AC}_005_UF`, stimulus: 'Reuse', faults: [], leftOut: REUSE('authorization code') },
  { testCase: `${AC}_005_UF`, stimulus: 'other `client_id`', faults: [], leftOut: `${REUSE('authorization code')}, as the Wallet Unit \`CW-2\`` },
  { testCase: `${AC}_005_UF`, stimulus: 'other `redirect_uri`', faults: ['token-request.redirect-uri-other'] },
  { testCase: `${AC}_006_UF`, stimulus: 'Unknown `credential_configuration_id`', faults: ['authorization.authorization-details-unknown'] },
  { testCase: `${AC}_006_UF`, stimulus: 'unknown `scope`', faults: ['authorization.scope-unknown'] },
  { testCase: `${AC}_007`, stimulus: 'Capture', faults: [], leftOut: 'a `CONF` check of the authorization response (`authorization-response-state`, `authorization-response-iss`), not of the request' },
];
