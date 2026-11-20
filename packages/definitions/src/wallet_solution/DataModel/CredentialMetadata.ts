// RP_WS_DM_CredentialMetadata: attributes beyond the query, and values the query does not allow.
import {
  comments,
  defineTestCase,
  faultInfo,
  type FormatWording,
  formats,
  PID,
  pid,
  positiveControlOf,
  preconditions,
  presentation,
  presentationStep,
  rej,
  rejOrAcc,
  relevancy,
  scenario,
  step,
  testCaseId,
} from '@rp-conformance/core';
import { CIR_PRESENTATION, queryVariant } from './IdentifyingData';

const sdJwtVc = formats.sdJwtVc;

const base = (format: FormatWording) => ({
  profile: [format.profile],
  technology: [format.technology],
  control: positiveControlOf(format),
});

const unrequested = (format: FormatWording) =>
  defineTestCase({
    id: testCaseId('WS', 'DM', 'CredentialMetadata', 1, format.letter, true),
    ...base(format),
    objective: `Verify that the Relying Party does not release attributes of a PID in ${format.name} format that were disclosed without being requested.`,
    references: ['[ARF] Annex 2, OIA_16', '[OpenID4VP] section 15.4.2', CIR_PRESENTATION],
    relevancy: relevancy.specificOptional,
    preconditions: [...preconditions.base, preconditions.control(positiveControlOf(format))],
    steps: [
      step({
        ...presentationStep.presentationFault('presentation.unrequested-disclosed', { format: format.credentialFormat }),
        expect: rejOrAcc({
          credential: PID,
          extra: `In neither case does its verification result release \`place_of_birth\` or \`${format === sdJwtVc ? 'nationalities' : 'nationality'}\`.`,
        }),
      }),
    ],
    comments: [
      'OpenID4VP leaves it to the Relying Party whether to reject a presentation with claims it did not request or to ignore them; either passes, as long as the extra attributes are not released.',
      'Whether the Relying Party retains the extra attributes cannot be observed at its interfaces; the test book item `RP_TB_001` covers retention.',
      comments.flow,
    ],
  });

const valuesConstraint = (format: FormatWording) => {
  const fault = format === sdJwtVc ? 'credential.age-over-18-false-required-true' : 'mdoc.age-over-18-false-required-true';
  const query = faultInfo(fault).query;
  if (!query) throw new Error(`${fault} names no query`);
  return defineTestCase({
    id: testCaseId('WS', 'DM', 'CredentialMetadata', 2, format.letter, true),
    ...base(format),
    objective: `Verify that the Relying Party rejects a PID in ${format.name} format whose claim value violates the \`values\` constraint of the query.`,
    references: ['[OpenID4VP] section 6.3, 14.9, 15.4.1', CIR_PRESENTATION],
    relevancy: relevancy.genericRequired,
    preconditions: [...preconditions.base, preconditions.control(positiveControlOf(format)), queryVariant.ageOver18(format, true)],
    steps: [
      step({
        text: scenario.credentialVariant(faultInfo(fault).text, { query: 'the variant of `default_query_pid` named in the preconditions' }),
        run: presentation({ query, credential: pid.of(format.credentialFormat, { faults: [fault] }) }),
        expect: rej(),
      }),
    ],
    comments: [comments.flow],
  });
};

export const definitions = [unrequested(formats.sdJwtVc), unrequested(formats.mdoc), valuesConstraint(formats.sdJwtVc), valuesConstraint(formats.mdoc)];
