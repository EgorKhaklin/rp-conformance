import { isExecutable, type IssuerTestCaseDefinition } from '@rp-conformance/core';
import { definitions as mainInteraction } from './pid_provider/Interaction/MainInteraction';
// Issue 25: DPoP, batch, re-issuance, deferred, notification, encoding, encryption
import { definitions as batch } from './pid_provider/Interaction/Batch';
import { definitions as deferred } from './pid_provider/Interaction/Deferred';
import { definitions as notification } from './pid_provider/Interaction/Notification';
import { definitions as reissuance } from './pid_provider/Interaction/Reissuance';
import { definitions as tokenBinding } from './pid_provider/SecurityMechanisms/TokenBinding';
import { definitions as encoding } from './pid_provider/Shared/Encoding';
import { definitions as encryption } from './pid_provider/Shared/Encryption';
// Issue 24: message structure
import { definitions as credentialEndpoint } from './pid_provider/MessageStructure/CredentialEndpoint';
import { definitions as metadata } from './pid_provider/MessageStructure/Metadata';
import { definitions as offer } from './pid_provider/MessageStructure/Offer';

export * from './wording';

/**
 * Every issuer test definition (issuer harness design section 6.1), one per test case and variant: the source of truth
 * for the issuer test cases, as `@rp-conformance/definitions` is for the RP ones. Areas append their definitions here.
 */
export const issuerDefinitions: IssuerTestCaseDefinition[] = [
  ...mainInteraction,
  // Issue 25
  ...tokenBinding,
  ...batch,
  ...reissuance,
  ...deferred,
  ...notification,
  ...encoding,
  ...encryption,
  // Issue 24: message structure
  ...metadata,
  ...offer,
  ...credentialEndpoint,
];

/** The issuer definitions the harness can execute. */
export const executableIssuerDefinitions = issuerDefinitions.filter(isExecutable);
