import { isExecutable, type IssuerTestCaseDefinition } from '@rp-conformance/core';
import { definitions as pidMdoc } from './pid_provider/DataModel/PidMdoc';
import { definitions as pidSdJwt } from './pid_provider/DataModel/PidSdJwt';
import { definitions as portrait } from './pid_provider/DataModel/Portrait';
import { definitions as mainInteraction } from './pid_provider/Interaction/MainInteraction';
import { definitions as validity } from './pid_provider/SecurityMechanisms/Validity';

export * from './wording';

/**
 * Every issuer test definition (issuer harness design section 6.1), one per test case and variant: the source of truth
 * for the issuer test cases, as `@rp-conformance/definitions` is for the RP ones. Areas append their definitions here.
 */
export const issuerDefinitions: IssuerTestCaseDefinition[] = [
  ...mainInteraction,
  // Issue 21: SM_Validity and the PID Rulebook (DM_*).
  ...validity,
  ...pidSdJwt,
  ...pidMdoc,
  ...portrait,
];

/** The issuer definitions the harness can execute. */
export const executableIssuerDefinitions = issuerDefinitions.filter(isExecutable);
