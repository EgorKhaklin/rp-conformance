import { isExecutable, type IssuerTestCaseDefinition } from '@rp-conformance/core';
import { definitions as mainInteraction } from './pid_provider/Interaction/MainInteraction';
// Issue 19: PP_WS_SM_ClientAttestation, _KeyAttestation, _ProofOfPossession.
import { definitions as clientAttestation } from './pid_provider/SecurityMechanisms/ClientAttestation';
import { definitions as keyAttestation } from './pid_provider/SecurityMechanisms/KeyAttestation';
import { definitions as proofOfPossession } from './pid_provider/SecurityMechanisms/ProofOfPossession';

export * from './wording';

/**
 * Every issuer test definition (issuer harness design section 6.1), one per test case and variant: the source of truth
 * for the issuer test cases, as `@rp-conformance/definitions` is for the RP ones. Areas append their definitions here.
 */
export const issuerDefinitions: IssuerTestCaseDefinition[] = [
  ...mainInteraction,
  // Issue 19
  ...clientAttestation,
  ...keyAttestation,
  ...proofOfPossession,
];

/** The issuer definitions the harness can execute. */
export const executableIssuerDefinitions = issuerDefinitions.filter(isExecutable);
