// PP_WS_SM_ClientAttestation: the WIA as OAuth client attestation and its PoP, at the token endpoint (and at PAR once
// the authorization code flow exists), issuer catalogue section 5.1.3. One definition per test case and variant; the
// variants run so far are `SD` × `PA`, as for the positive control `PP_WS_IA_MainInteraction_001`.
import { type FormatVariant, type GrantVariant, type IssuerTestCaseDefinition, relevancy } from '@rp-conformance/core';
import { FORMAT_NAMES, GRANT_NAMES } from '../../wording';
import { faultStep, issuanceStep, maintenanceConf, rejected, revocationStep, STATUS_LIST_FAULTS, STATUS_LIST_HTTP, statusListSteps, validStep, securityTestCase } from './attestations';

const ACBA = '[Attestation-Based Client Auth] sections 4 and 5';
const OPENID4VCI = '[OpenID4VCI] Appendix E';

const testCase = securityTestCase({ relevancy: relevancy.specificRequired, technology: ['Attestation-Based Client Authentication'] });

const invalidClient = rejected('invalid_client');

function clientAttestation(format: FormatVariant, grant: GrantVariant): IssuerTestCaseDefinition[] {
  const id = (n: string) => `PP_WS_SM_ClientAttestation_${n}`;
  const where = `at the token endpoint in the ${GRANT_NAMES[grant]}`;
  return [
    testCase(format, grant, {
      id: id('001'),
      objective: `Verify that the PID Provider accepts a valid WIA and its PoP from the Wallet Provider \`WP-A\` ${where} and issues the PID in ${FORMAT_NAMES[format]} format.`,
      references: ['[ARF] Annex 2, WUA_25, ISSU_21, ISSU_30a', OPENID4VCI, ACBA],
      steps: [validStep(format, grant)],
      comments: ['The valid half of every `PP_WS_SM_ClientAttestation_*_UF` test case of the same variant.'],
    }),
    testCase(format, grant, {
      id: id('002_UF'),
      objective: `Verify that the PID Provider rejects a token request without WIA, or with a WIA but without its PoP, ${where}.`,
      references: ['[ARF] Annex 2, WUA_25, ISSU_21, ISSU_30a', ACBA],
      steps: [faultStep(format, grant, 'wia.missing', invalidClient), faultStep(format, grant, 'wia-pop.missing', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('003_UF'),
      objective: `Verify that the PID Provider rejects a WIA with an invalid signature ${where}.`,
      references: ['[ARF] Annex 2, WUA_25', ACBA],
      steps: [faultStep(format, grant, 'wia.signature-bitflip', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('004_UF'),
      objective: `Verify that the PID Provider rejects a WIA signed under an anchor that \`TL-WP\` does not publish ${where}: \`CA-X\`, \`PP-A\`'s issuance CA in \`TL-PID\`, \`AC-A\`.`,
      references: ['[ARF] Annex 2, ISSU_21, ISSU_28, ISSU_30a, WPNot_04', '[ETSI TS 119 602]'],
      steps: (['wia.signer-ca-x', 'wia.signer-pp-a', 'wia.signer-ac-a'] as const).map((fault) => faultStep(format, grant, fault, invalidClient)),
    }),
    testCase(format, grant, {
      id: id('005_UF'),
      objective: `Verify that the PID Provider rejects a WIA of the withdrawn Wallet Provider \`WP-W\` ${where}.`,
      references: ['[ARF] Annex 2, ISSU_30a, WPNot_04', '[ETSI TS 119 602]'],
      steps: [faultStep(format, grant, 'wia.signer-wp-w', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('006_UF'),
      objective: `Verify that the PID Provider rejects a WIA signed under \`WP-A\`'s KA CA, an anchor \`TL-WP\` publishes for another purpose of the same Wallet Provider, ${where}.`,
      references: ['[ARF] Annex 2, ISSU_30a', '[TS3] section 3.2', '[ETSI TS 119 602]'],
      steps: [faultStep(format, grant, 'wia.signer-ka-ca', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('007_UF'),
      objective: `Verify that the PID Provider rejects an expired WIA, and a WIA that is not yet valid beyond \`T_skew\`, ${where}.`,
      references: [OPENID4VCI, ACBA, '[RFC7519] sections 4.1.4 and 4.1.5'],
      relevancy: relevancy.genericRequired,
      steps: [faultStep(format, grant, 'wia.exp-past', invalidClient), faultStep(format, grant, 'wia.nbf-future', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('008_UF'),
      objective: `Verify that the PID Provider rejects a PoP signed with a key other than the WIA's \`cnf\` key ${where}.`,
      references: [ACBA],
      relevancy: relevancy.genericRequired,
      steps: [faultStep(format, grant, 'wia-pop.other-key', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('009_UF'),
      objective: `Verify that the PID Provider rejects a PoP with a wrong \`aud\`, a stale \`iat\`, or a \`jti\` it has seen before ${where}.`,
      references: [ACBA],
      relevancy: relevancy.genericRequired,
      steps: [
        validStep(format, grant, { why: 'its PoP `jti` is replayed in the last step' }),
        faultStep(format, grant, 'wia-pop.aud-other', invalidClient),
        faultStep(format, grant, 'wia-pop.iat-stale', invalidClient),
        faultStep(format, grant, 'wia-pop.jti-replayed', invalidClient),
      ],
    }),
    testCase(format, grant, {
      id: id('010_UF'),
      objective: `Verify that the PID Provider rejects a WIA whose \`sub\` differs from the \`client_id\` of the request ${where}.`,
      references: [ACBA],
      relevancy: relevancy.genericRequired,
      steps: [faultStep(format, grant, 'wia.sub-other', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('011_UF'),
      objective: `Verify that the PID Provider rejects a WIA or a PoP whose \`typ\` is \`JWT\` ${where}.`,
      references: [ACBA],
      relevancy: relevancy.genericRequired,
      steps: [faultStep(format, grant, 'wia.typ-jwt', invalidClient), faultStep(format, grant, 'wia-pop.typ-jwt', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('012_UF'),
      objective: `Verify that the PID Provider rejects the WIA of a revoked Wallet Instance ${where}.`,
      references: ['[ARF] Annex 2, ISSU_21, ISSU_30a, WUA_25, WUA_26', '[Token Status List]', '[TS3] section 2.5'],
      steps: [revocationStep('wia'), issuanceStep(format, grant, 'all valid; its WIA refers to the revoked entry', rejected())],
    }),
    testCase(format, grant, {
      id: id('013_UF'),
      objective: `Verify that the PID Provider issues no PID ${where} when the status of the WIA cannot be obtained: the list is unreachable, or it is a Status List Token with a bad signature, expired, malformed or signed under a wrong anchor.`,
      references: ['[ARF] Annex 2, ISSU_21, WUA_25', '[Token Status List] sections 5.1 and 8.3', '[TS3] section 2.5'],
      steps: [
        ...STATUS_LIST_HTTP.flatMap((status) => statusListSteps(format, grant, 'wia', status)),
        ...STATUS_LIST_FAULTS.flatMap((fault) => statusListSteps(format, grant, 'wia', fault)),
      ],
      comments: [
        'The stimuli are the Status List Token faults (JWT) of the RP catalogue\'s `RP_PP_SM_Revocation`, served for `SL-WP-A`, and two HTTP errors for the list\'s URL. `status-list.signer-wp-a-revocation` is not one: `WP-A`\'s revocation signer is the valid signer of `SL-WP-A`.',
        'A PID Provider rejects (decision 2); an Attestation Provider follows its ICS-18 policy (`POLICY`).',
      ],
    }),
    testCase(format, grant, {
      id: id('014_UF'),
      objective: `Verify that the PID Provider rejects a WIA signed with an algorithm outside the ECCG agreed cryptographic mechanisms (\`ES256K\`, \`HS256\`) ${where}.`,
      references: ['[ARF] Annex 2, WUA_04, OIA_03', '[ECCG ACM]', '[RFC8725] section 3.1'],
      steps: [faultStep(format, grant, 'wia.es256k', invalidClient), faultStep(format, grant, 'wia.hs256', invalidClient)],
    }),
    testCase(format, grant, {
      id: id('015'),
      objective: `Verify that the PID Provider issues the PID in ${FORMAT_NAMES[format]} format with an expiry no later than the end of the WIA's revocation maintenance period, when that period ends in 30 days.`,
      references: ['[ARF] Annex 2, ISSU_12c, WUA_30', '[TS3] section 2.4.1'],
      steps: [faultStep(format, grant, 'wia.maintenance-30-days', maintenanceConf(format, 'WIA'))],
      comments: ['PID only. The KA keeps its maintenance period of more than a year, so only the WIA bounds the expiry.'],
    }),
    testCase(format, grant, {
      id: id('016_UF'),
      objective: `Verify that the PID Provider rejects a WIA whose revocation maintenance period ends tomorrow, below the minimum remaining period it requires, or issues a PID that expires no later than that end.`,
      references: ['[ARF] Annex 2, WUA_32, ISSU_12c', '[TS3] section 2.4.1'],
      steps: [
        faultStep(format, grant, 'wia.maintenance-tomorrow', {
          codes: ['REJ', 'CONF'],
          oneOf: true,
          checks: ['maintenance-period'],
          text: 'Either the Provider issues no credential and no token and answers with HTTP 4xx and an OAuth error object, or it issues a PID that passes every check of `ISS` and whose `exp` is no later than the `exp` of the WIA\'s `client_status` claim (`maintenance-period`); never HTTP 5xx.',
        }),
      ],
    }),
  ];
}

export const definitions = clientAttestation('SD', 'PA');
