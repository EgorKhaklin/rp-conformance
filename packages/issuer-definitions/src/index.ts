import { isExecutable, type IssuerTestCaseDefinition } from '@rp-conformance/core';
import { definitions as mainInteraction } from './pid_provider/Interaction/MainInteraction';
// Issue 22: revocation and published status lists.
import { definitions as revocation } from './pid_provider/SecurityMechanisms/Revocation';
import { definitions as rpSupportive } from './pid_provider_rp/Interaction/Supportive';
import { definitions as rpRevocation } from './pid_provider_rp/SecurityMechanisms/Revocation';

export * from './wording';
export * from './status';

/**
 * Every issuer test definition (issuer harness design section 6.1), one per test case and variant: the source of truth
 * for the issuer test cases, as `@rp-conformance/definitions` is for the RP ones. Areas append their definitions here.
 */
export const issuerDefinitions: IssuerTestCaseDefinition[] = [
  ...mainInteraction,
  // Issue 22: revocation and published status lists.
  ...revocation,
  ...rpSupportive,
  ...rpRevocation,
];

/** The issuer definitions the harness can execute. */
export const executableIssuerDefinitions = issuerDefinitions.filter(isExecutable);
