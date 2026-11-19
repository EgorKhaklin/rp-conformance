// RP_WS_IA_Engagement: how the Relying Party invokes the wallet, checked on the requests the Conformance Wallet
// captures (catalogue scenario SCN-Q). `RP_WS_IA_Engagement_002` (the cross-device QR code encodes the same request as
// same-device) is not written: the harness receives one invocation URI per transaction from the adapter and does not
// read the QR code the Relying Party renders in its user interface.
import { requestTestCase } from '../requests';

const engagement = (testCase: Omit<Parameters<typeof requestTestCase>[0], 'layer' | 'area'>) =>
  requestTestCase({ layer: 'IA', area: 'Engagement', ...testCase });

export const definitions = [
  engagement({
    number: 1,
    flow: 'redirect',
    objective: 'Verify that the Relying Party invokes the wallet on the same device with the custom URL scheme `haip-vp://`, the custom URL scheme `openid4vp://` or an https URL.',
    references: ['[HAIP] section 5.1', '[OpenID4VP] section 9'],
    checks: ['invocation-scheme'],
    rule: 'The invocation URI uses the scheme `haip-vp`, `openid4vp` or `https`.',
  }),
  engagement({
    number: 3,
    flow: 'dc-api',
    objective: 'Verify that the Relying Party invokes the wallet through the W3C Digital Credentials API with a signed OpenID4VP request.',
    references: ['[HAIP] section 5.2', '[OpenID4VP] section A.1, A.3'],
    checks: ['signed-request'],
    rule: 'The page of the Relying Party calls `navigator.credentials.get` with a digital credential request of protocol `openid4vp-v1-signed` or `openid4vp-v1-multisigned` whose request object is signed.',
    comments: ['[HAIP] section 5.2 requires signed requests through the Digital Credentials API, so the unsigned protocol `openid4vp-v1-unsigned` does not pass.'],
  }),
];
