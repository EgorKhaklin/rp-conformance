// Issue 27: the Attestation Provider of the issuer suite (issuer catalogue sections 2.1, 2.3 and 5.4). A Provider's
// category decides the entity it is enrolled as, the list its credentials chain to, and the credential it issues: the
// PID for a PID Provider, FCAF `default_credential_A` for a QEAA, PuB-EAA or non-qualified EAA Provider.
import type { CategoryVariant, TestSubject } from './definition';
import type { IssuerProfile } from './ics';

/** The categories of a Provider (ICS-01): PID Provider, QEAA, PuB-EAA, non-qualified EAA Provider. */
export type ProviderCategory = CategoryVariant;

/** The categories of an Attestation Provider, the variants of the `AP_*` test cases. */
export const ATTESTATION_CATEGORIES = ['Q', 'PB', 'E'] as const satisfies readonly ProviderCategory[];
export type AttestationCategory = (typeof ATTESTATION_CATEGORIES)[number];

export const PROVIDER_CATEGORIES: readonly ProviderCategory[] = ['PID', ...ATTESTATION_CATEGORIES];

/** The profile of each category (ICS-01). */
export const CATEGORY_PROFILES: Record<ProviderCategory, IssuerProfile> = { PID: 'P-PID', Q: 'P-Q', PB: 'P-PB', E: 'P-E' };

/**
 * The entity the Test Registrar enrols the Provider as (issuer catalogue sections 3.2 and 3.3), and where its anchors
 * are published: `PP-T` on `TL-PID`, `QP-T` with a granted qualified EAA service on `TL-QEAA` (reached via the LOTL),
 * `PB-T` on `TL-PUB`, `EP-T` under the anchor the rulebook of `default_credential_A` defines (`TA-EAA`).
 */
export const CATEGORY_ENTITIES: Record<ProviderCategory, { entity: 'PP-T' | 'QP-T' | 'PB-T' | 'EP-T'; list: string; name: string; credential: string }> = {
  PID: { entity: 'PP-T', list: 'TL-PID', name: 'PID Provider', credential: 'PID' },
  Q: { entity: 'QP-T', list: 'TL-QEAA', name: 'QEAA Provider', credential: 'QEAA' },
  PB: { entity: 'PB-T', list: 'TL-PUB', name: 'PuB-EAA Provider', credential: 'PuB-EAA' },
  E: { entity: 'EP-T', list: 'TA-EAA', name: 'non-qualified EAA Provider', credential: 'non-qualified EAA' },
};

/** The category of a definition: its category variant, `PID` when it has none (catalogue section 2.3). */
export function categoryOf(definition: { variants?: readonly string[] }): ProviderCategory {
  return (definition.variants?.find((v) => (ATTESTATION_CATEGORIES as readonly string[]).includes(v)) as AttestationCategory | undefined) ?? 'PID';
}

/** The attributes of FCAF `default_credential_A` (FCAF defaults): a positive number, a Latin-1 string, a past date. */
export interface AttestationSubject {
  attribute_A: number;
  /** At most 64 Latin-1 characters. */
  attribute_B: string;
  /** `full-date`, `YYYY-MM-DD`, in the past. */
  attribute_C: string;
}

/**
 * The test subjects as `default_credential_A` data (issuer catalogue section 3.4, ICS-17): `SUBJ-1` has the values the
 * RP harness issues (`DEFAULT_CREDENTIAL_A_CLAIMS` of the forge), `SUBJ-2` is `SUBJ-1` with `attribute_B` changed
 * (`SM_Revocation_008`).
 */
export const ATTESTATION_TEST_SUBJECTS: Record<TestSubject, AttestationSubject> = {
  'SUBJ-1': { attribute_A: 42, attribute_B: 'Beispielwert für Attribut B', attribute_C: '2001-04-21' },
  'SUBJ-2': { attribute_A: 42, attribute_B: 'Geänderter Wert für Attribut B', attribute_C: '2001-04-21' },
};

/** `vct` of `default_credential_A` in SD-JWT VC format, as the forge issues it (`CREDENTIAL_A_VCT`). */
export const ATTESTATION_VCT = 'urn:rp-conformance:credential_a:1';
/** DocType and namespace of `default_credential_A` in mdoc format (`CREDENTIAL_A_DOCTYPE`). */
export const ATTESTATION_DOCTYPE = 'test.rp-conformance.credential_a.1';
