// The harness services of an issuer run (issuer harness design sections 3 and 5.3): the test PKI, the Test Status
// Provider (`SL-WP-A`, `SL-WP-B`), the Test Trust Infrastructure (`TL-WP`, `TL-PID`, `TL-AC`, `TL-RC`), the Test Wallet
// Provider with its Wallet Units, and the enrolment of the Provider under test by the Test Registrar.
import type { IssuerAdapter, IssuerIcs, IssuerTestEnvironment, PublishedTrustList } from '@rp-conformance/core';
import { buildSealedLote, createTestPki, type Enrolment, enrolSut, LIST_PROFILES, type LoteListId, PID_DOCTYPE, PID_VCT, type TestPki, toEnrolledCertificate } from '@rp-conformance/forge';
import { StatusProvider } from '@rp-conformance/status-provider';
import { TrustInfrastructure } from '@rp-conformance/trust-infrastructure';
import { TRUST_RULES, TrustStore } from '@rp-conformance/validator';
import { publishTlWp, TestWalletProvider } from '@rp-conformance/wallet-provider';

/** What the access certificate from `AC-A` names for the Provider under test (`default_configuration_PP_1`). */
export const PROVIDER_ACCESS = { entityIdentifier: 'VATDE-987654321', serviceIdentifier: 'S1', tradeName: 'PID Provider under conformance test' };

export interface IssuerHarnessOptions {
  runId: string;
  namespace: string;
  /** Host name under which the Provider reaches the harness services. */
  harnessHost: string;
  bindHost?: string;
  ics: IssuerIcs;
}

export interface IssuerHarness {
  pki: TestPki;
  status: StatusProvider;
  trust: TrustInfrastructure;
  twp: TestWalletProvider;
  namespace: string;
  /** Set by `enrol`. */
  env?: IssuerTestEnvironment;
  enrolment?: Enrolment;
  /** The reference validator's trust configuration: `TL-PID` as published after enrolment. */
  trustStore?: TrustStore;
  /** `fetch` for the harness itself: URLs under the harness host go to the local services. */
  fetch: typeof fetch;
  /**
   * Enrols the Provider (Test Registrar, design section 5.3) through the adapter's `enrol`, publishes `TL-PID` with
   * `PP-T` as enrolled, and builds the environment `setUp` gets.
   */
  enrol(adapter: IssuerAdapter): Promise<IssuerTestEnvironment>;
  stop(): Promise<void>;
}

/** The credential types of the registration certificate: the PID in every format the ICS declares (ICS-02). */
function providedAttestations(ics: IssuerIcs) {
  return [
    ...(ics.profiles.includes('P-SD') ? [{ format: 'dc+sd-jwt', meta: { vct_values: [PID_VCT] } }] : []),
    ...(ics.profiles.includes('P-MD') ? [{ format: 'mso_mdoc', meta: { doctype_value: PID_DOCTYPE } }] : []),
  ];
}

/**
 * Starts the harness services of an issuer run. The Provider gets only the scheme operator certificates: it derives
 * Wallet Provider trust from `TL-WP` (catalogue section 3.2).
 */
export async function startIssuerHarness(options: IssuerHarnessOptions): Promise<IssuerHarness> {
  const pki = await createTestPki();
  const bind = options.bindHost ?? '0.0.0.0';
  const status = await new StatusProvider().start({ host: bind, port: 0, publicHost: options.harnessHost });
  const trust = await new TrustInfrastructure().start({ host: bind, port: 0, publicHost: options.harnessHost });
  // The harness reaches its own services on the loopback interface, whatever name the Provider uses for them.
  const local = (url: string) => {
    for (const service of [status.baseUrl, trust.baseUrl]) {
      const port = new URL(service).port;
      const prefix = `http://${options.harnessHost}:${port}`;
      if (url.startsWith(prefix)) return `http://127.0.0.1:${port}${url.slice(prefix.length)}`;
    }
    return url;
  };
  const localFetch: typeof fetch = (input, init) => fetch(typeof input === 'string' ? local(input) : input instanceof URL ? local(input.href) : input, init);
  const twp = await TestWalletProvider.create({ pki, statusProvider: status, runId: options.namespace });
  const tlWp = await publishTlWp(trust, options.namespace, pki);

  const loteType = (list: LoteListId) => LIST_PROFILES[list].loteType;
  const describe = (id: LoteListId, url: string): PublishedTrustList => ({
    id,
    loteType: loteType(id),
    url,
    schemeOperatorCertificatePem: pki.schemeOperators[id].certificate.pem,
  });

  const harness: IssuerHarness = {
    pki,
    status,
    trust,
    twp,
    namespace: options.namespace,
    fetch: localFetch,
    async enrol(adapter) {
      const csrs = await adapter.enrol(options.namespace);
      const enrolment = await enrolSut(pki, {
        entity: 'PP-T',
        ...(csrs ? { csrs } : {}),
        // EnrolmentRequest does not say which key signs which format: with CSRs every key signs SD-JWT VCs until mdoc
        // is implemented; without, the Registrar generates one SD-JWT VC signer.
        credentialSigningProfiles: csrs ? csrs.credentialSigning.map(() => 'sd-jwt-vc' as const) : ['sd-jwt-vc'],
        statusListWithIssuanceKey: csrs ? !csrs.statusListSigning : false,
        access: PROVIDER_ACCESS,
        registration: { providesAttestations: providedAttestations(options.ics) },
      });
      // PP-T is published as enrolled (its revocation anchor may have become its issuance anchor).
      const lists: PublishedTrustList[] = [describe('TL-WP', tlWp.url)];
      for (const id of ['TL-PID', 'TL-AC', 'TL-RC'] as LoteListId[]) {
        const sealed = await buildSealedLote({ list: id, pki, distributionPoint: trust.urlOf(options.namespace, id) });
        lists.push(describe(id, trust.publish(options.namespace, id, sealed.jws).url));
      }
      const env: IssuerTestEnvironment = {
        runId: options.runId,
        trustLists: lists,
        credentialSigningCertificates: enrolment.credentialSigners.map(toEnrolledCertificate),
        ...(enrolment.statusListSigner ? { statusListSigningCertificate: toEnrolledCertificate(enrolment.statusListSigner) } : {}),
        accessCertificate: toEnrolledCertificate(enrolment.access),
        registrationCertificate: enrolment.registrationCertificate,
        ics: options.ics,
      };
      const tlPid = lists.find((l) => l.id === 'TL-PID') as PublishedTrustList;
      const trustStore = new TrustStore([{ id: tlPid.id, url: tlPid.url, loteType: tlPid.loteType, schemeOperatorCertificatePem: tlPid.schemeOperatorCertificatePem }], localFetch);
      const refreshed = await trustStore.refresh();
      const refused = refreshed.filter((r) => r.error);
      if (refused.length) throw new Error(`the reference validator refused ${refused.map((r) => `${r.id}: ${r.error}`).join('; ')}`);
      Object.assign(harness, { env, enrolment, trustStore });
      return env;
    },
    async stop() {
      await status.stop();
      await trust.stop();
    },
  };
  return harness;
}

/** The trust rule of the Provider's category: a PID Provider's credentials chain to `PP-T` on `TL-PID`. */
export const PID_TRUST_RULE = TRUST_RULES.pid;
