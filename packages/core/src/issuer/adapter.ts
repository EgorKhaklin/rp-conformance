// The adapter of a PID Provider or Attestation Provider under test (issuer harness design section 5.4), and what the
// harness hands it. Types only; the design marks the API as illustrative, the EUDIPLO adapter settles it.
import type { KeyedCertificate, PublishedTrustList } from '../environment';
import type { IssuanceGrant, TestSubject } from './definition';
import type { IssuerIcs } from './ics';

/** CSRs (PEM, PKCS#10) for the SUT's keys, from which the Test Registrar issues its certificates (catalogue section 3.3). */
export interface EnrolmentRequest {
  /** The credential signing key(s), certified under the SUT's issuance CA. */
  credentialSigning: string[];
  /** The status list signing key, certified under its revocation CA; left out when it signs status lists with its issuance key. */
  statusListSigning?: string;
  /** The key of the access certificate from `AC-A`. */
  access: string;
  /**
   * The format each credential signing key signs, in the order of `credentialSigning`: `sd-jwt-vc` (issuance signer) or
   * `mdoc` (document signer, ISO/IEC 18013-5 Annex B). Default `sd-jwt-vc` for every key.
   */
  credentialSigningProfiles?: CredentialSigningProfile[];
}

/** The certificate profile of a credential signing key: SD-JWT VC issuance signer, or mdoc document signer. */
export type CredentialSigningProfile = 'sd-jwt-vc' | 'mdoc';

/** A certificate the Test Registrar issued; with its key only when the Registrar generated the key (no CSR). */
export type EnrolledCertificate = Omit<KeyedCertificate, 'privateJwk' | 'privateKeyPem'> &
  Partial<Pick<KeyedCertificate, 'privateJwk' | 'privateKeyPem'>>;

/**
 * Everything the Provider under test needs for `default_configuration_PP_1`: trust in `TL-WP`, its certificates from
 * the Test Registrar, and its ICS.
 */
export interface IssuerTestEnvironment {
  runId: string;
  /** `TL-WP`, and the list that contains the SUT (`TL-PID`, `TL-QEAA`, `TL-PUB`, `TA-EAA`). */
  trustLists: PublishedTrustList[];
  /** Credential signing certificate(s) under the SUT's issuance CA. */
  credentialSigningCertificates: EnrolledCertificate[];
  /** The profile of each credential signing certificate, in the same order; default `sd-jwt-vc` for each. */
  credentialSigningProfiles?: CredentialSigningProfile[];
  /** Status list signing certificate under the SUT's revocation CA; left out when it signs with its issuance key. */
  statusListSigningCertificate?: EnrolledCertificate;
  /** Access certificate issued by `AC-A`. */
  accessCertificate: EnrolledCertificate;
  /** Registration certificate issued by `RC-A` (JWT, ETSI TS 119 475). */
  registrationCertificate: string;
  ics: IssuerIcs;
}

export interface CreateOfferRequest {
  subject: TestSubject;
  configurations: string[];
  grant: IssuanceGrant;
  byReference: boolean;
  /** Pre-authorized code grant: protect the code with a transaction code (`tx_code`), returned in `CreatedOffer.txCode`. */
  txCode?: boolean;
  /** The User opts out of the portrait (PID_03, `DM_Portrait_001`); only where the ICS declares the opt-out (ICS-17). */
  portraitOptOut?: boolean;
}

export interface CreatedOffer {
  /** The credential offer, by value or by reference, as the SUT hands it out. */
  offer: string;
  txCode?: string;
  sessionId: string;
}

/**
 * The only Provider specific code of the issuer harness (issuer harness design section 5.4). Optional hooks map to ICS
 * items: no `authenticateSubject` means `P-AC` cannot run, no `setStatus` means `P-HOOK` is No, and no `changeSubject`
 * makes `SM_Revocation_008` NOT APPLICABLE.
 */
export interface IssuerAdapter {
  name: string;
  /** Host name under which the Provider reaches the harness services (`TL-WP`, `SL-WP-*`), for example from a container. */
  harnessHost?: string;
  /** Configure the SUT: trust in TL-WP, its certificates from the Test Registrar, its configurations per the ICS. */
  setUp(env: IssuerTestEnvironment, namespace: string): Promise<void>;
  /**
   * CSRs for the SUT's keys (§5.3), or undefined when the Registrar must generate the keys. `namespace` is the one
   * `setUp` will get, for a SUT whose keys belong to a tenant or namespace that must exist before its CSRs do.
   */
  enrol(namespace?: string): Promise<EnrolmentRequest | undefined>;
  createOffer(req: CreateOfferRequest): Promise<CreatedOffer>;
  /** Complete the subject's authentication for an authorization request and return the redirect with `code`. */
  authenticateSubject?(authorizationRequestUrl: string, subject: TestSubject): Promise<string>;
  /** Revoke, suspend or unsuspend what the session issued; resolves when the SUT reports it done (`OBS-ADM`). */
  setStatus?(sessionId: string, status: 'revoked' | 'suspended' | 'valid'): Promise<{ at: string }>;
  /** Replace SUBJ-1's data with SUBJ-2's (SM_Revocation_008). */
  changeSubject?(from: TestSubject, to: TestSubject): Promise<void>;
  /** Make the SUT fetch TL-WP now instead of waiting T_refresh. */
  refreshTrust?(namespace: string): Promise<void>;
  /** Optional: what the report records about the Provider under test after `setUp`, for example its version. */
  describe?(): Promise<Record<string, string>>;
  /** Optional: release resources the adapter started. */
  tearDown?(): Promise<void>;
}
