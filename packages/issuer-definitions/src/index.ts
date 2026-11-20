import { isExecutable, type IssuerTestCaseDefinition } from '@rp-conformance/core';
import { definitions as pidMdoc } from './pid_provider/DataModel/PidMdoc';
import { definitions as pidSdJwt } from './pid_provider/DataModel/PidSdJwt';
import { definitions as portrait } from './pid_provider/DataModel/Portrait';
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
// Issue 19: PP_WS_SM_ClientAttestation, _KeyAttestation, _ProofOfPossession.
import { definitions as clientAttestation } from './pid_provider/SecurityMechanisms/ClientAttestation';
import { definitions as keyAttestation } from './pid_provider/SecurityMechanisms/KeyAttestation';
import { definitions as proofOfPossession } from './pid_provider/SecurityMechanisms/ProofOfPossession';
// Issue 22: revocation and published status lists.
import { definitions as revocation } from './pid_provider/SecurityMechanisms/Revocation';
import { definitions as rpSupportive } from './pid_provider_rp/Interaction/Supportive';
import { definitions as rpRevocation } from './pid_provider_rp/SecurityMechanisms/Revocation';
import { definitions as validity } from './pid_provider/SecurityMechanisms/Validity';
// Issue 26: revocation chaining, PP_Inf, SM_IssuerIntegrity and SM_Unlinkability.
import { definitions as issuerIntegrity } from './pid_provider/SecurityMechanisms/IssuerIntegrity';
import { definitions as revocationLifecycle } from './pid_provider/SecurityMechanisms/RevocationLifecycle';
import { definitions as unlinkability } from './pid_provider/SecurityMechanisms/Unlinkability';
import { definitions as trustMechanisms } from './pid_provider_inf/SecurityMechanisms/TrustMechanisms';
// Issue 20: authorization code and pre-authorized code
import { definitions as authorizationCode } from './pid_provider/Interaction/AuthorizationCode';
import { definitions as preAuthorized } from './pid_provider/Interaction/PreAuthorized';

export * from './wording';
export * from './status';
// Issue 26
export * from './inspection';

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
  // Issue 19
  ...clientAttestation,
  ...keyAttestation,
  ...proofOfPossession,
  // Issue 22: revocation and published status lists.
  ...revocation,
  ...rpSupportive,
  ...rpRevocation,
  // Issue 21: SM_Validity and the PID Rulebook (DM_*).
  ...validity,
  ...pidSdJwt,
  ...pidMdoc,
  ...portrait,
  // Issue 26: revocation chaining, PP_Inf, SM_IssuerIntegrity and SM_Unlinkability.
  ...revocationLifecycle,
  ...issuerIntegrity,
  ...unlinkability,
  ...trustMechanisms,
  // Issue 20
  ...preAuthorized,
  ...authorizationCode,
];

/** The issuer definitions the harness can execute. */
export const executableIssuerDefinitions = issuerDefinitions.filter(isExecutable);
