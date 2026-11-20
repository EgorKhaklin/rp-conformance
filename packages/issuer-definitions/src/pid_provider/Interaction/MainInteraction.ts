// PP_WS_IA_MainInteraction: the positive baseline of the issuer suite and the positive controls of its `_UF` test
// cases (issuer catalogue section 5.1.2). One definition per variant, expanded by a function as the RP definitions
// expand their formats; this issue implements `SD` × `PA`, the `MD` and `AC` variants follow with mdoc and the
// authorization code flow.
import { defineIssuerTestCase, type FormatVariant, type GrantVariant, relevancy } from '@rp-conformance/core';
import { FORMAT_NAMES, GRANT_NAMES, iss, issuance, pidProfile, preconditions, technologyOf } from '../../wording';

const mainInteraction001 = (format: FormatVariant, grant: GrantVariant) =>
  defineIssuerTestCase({
    id: 'PP_WS_IA_MainInteraction_001',
    variants: [format, grant],
    objective: `Verify that the PID Provider issues the PID in ${FORMAT_NAMES[format]} format to the Wallet Unit \`CW-1\` in the ${GRANT_NAMES[grant]}, and that the credential passes every check of the reference validator.`,
    references: ['[ARF] Annex 2, ISSU_01a, ISSU_14, ISSU_15', '[OpenID4VCI] sections 6, 7 and 8', '[HAIP] section 4'],
    profile: pidProfile(format, grant),
    relevancy: relevancy.specificRequired,
    technology: technologyOf(format),
    preconditions: preconditions.base,
    steps: [
      {
        text: `The adapter creates a credential offer for \`SUBJ-1\` and the PID configuration in ${FORMAT_NAMES[format]} format, ${grant === 'PA' ? 'pre-authorized code with `tx_code` unless the ICS declares offers without one' : 'authorization code'}. \`CW-1\` runs \`SCN-I\` without mutation: metadata, token request with WIA, PoP and DPoP proof, nonce request, credential request with one \`openid4vci-proof+jwt\` that carries the KA.`,
        run: issuance(format, grant),
        expect: iss(format),
      },
    ],
    comments: [
      'Positive control of every `_UF` test case of the same variant (issuer catalogue section 3.7): a `_UF` test case is executed only after this one passed.',
      'Execute this test case once for each format and grant the Provider declares in its ICS (ICS-02, ICS-03).',
    ],
  });

export const definitions = [mainInteraction001('SD', 'PA')];
