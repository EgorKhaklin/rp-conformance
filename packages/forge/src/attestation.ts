// `default_credential_A` of the FCAF defaults, which the Test Issuers issue as a QEAA (`QP-A`), a PuB-EAA (`PB-A`) or a
// non-qualified EAA (`EP-A`): one credential type with the attributes `attribute_A` (numerical), `attribute_B` (string)
// and `attribute_C` (date), in SD-JWT VC and in mdoc format. The category follows from the issuer, not from the type.
import { issueMdoc } from './mdoc';
import { issueSdJwtVc, type SdJwtVcIssueOptions } from './pid';
import { DEFAULT_PID_MDOC_CLAIMS, type MdocIssueOptions } from './mdoc';

/** `vct` of `default_credential_A` in SD-JWT VC format. A URN, so a Relying Party has no type metadata to fetch. */
export const CREDENTIAL_A_VCT = 'urn:rp-conformance:credential_a:1';
/** DocType and namespace of `default_credential_A` in mdoc format, under the reserved top-level domain `test`. */
export const CREDENTIAL_A_DOCTYPE = 'test.rp-conformance.credential_a.1';
export const CREDENTIAL_A_NAMESPACE = 'test.rp-conformance.credential_a.1';

/**
 * The attribute values of `default_credential_A`: a positive number, a Latin-1 string of at most 64 characters, and a
 * date in the past (`full-date` in mdoc format).
 */
export const DEFAULT_CREDENTIAL_A_CLAIMS = {
  attribute_A: 42,
  attribute_B: 'Beispielwert für Attribut B',
  attribute_C: '2001-04-21',
} as const;

/** `default_credential_A` in SD-JWT VC format, issued like the PID. */
export function issueCredentialASdJwtVc(options: SdJwtVcIssueOptions) {
  return issueSdJwtVc({ ...options, vct: CREDENTIAL_A_VCT, claims: { ...DEFAULT_CREDENTIAL_A_CLAIMS } });
}

/** `default_credential_A` in mdoc format, issued like the PID. */
export function issueCredentialAMdoc(options: MdocIssueOptions) {
  return issueMdoc({
    ...options,
    docType: CREDENTIAL_A_DOCTYPE,
    namespace: CREDENTIAL_A_NAMESPACE,
    claims: { ...DEFAULT_CREDENTIAL_A_CLAIMS },
    fullDates: new Set(['attribute_C']),
  });
}

/**
 * The identifying attributes `default_credential_A` carries in UC_Presentation_010 and _011: those of the holder of
 * `default_credential_pid`, or of another person. `birthdate` in SD-JWT VC format, `birth_date` (`full-date`) in mdoc
 * format, as in the PID.
 */
export function identifyingClaims(of: 'holder' | 'other-person', format: 'dc+sd-jwt' | 'mso_mdoc'): Record<string, unknown> {
  const person =
    of === 'holder'
      ? { family_name: DEFAULT_PID_MDOC_CLAIMS.family_name, given_name: DEFAULT_PID_MDOC_CLAIMS.given_name, birth: DEFAULT_PID_MDOC_CLAIMS.birth_date }
      : { family_name: 'Musterfrau', given_name: 'Gabriele', birth: '1971-03-05' };
  return { family_name: person.family_name, given_name: person.given_name, [format === 'mso_mdoc' ? 'birth_date' : 'birthdate']: person.birth };
}

/** `default_credential_A` in SD-JWT VC format with additional claims, issued like the PID. */
export function issueCredentialASdJwtVcWith(claims: Record<string, unknown>) {
  return (options: SdJwtVcIssueOptions) => issueSdJwtVc({ ...options, vct: CREDENTIAL_A_VCT, claims: { ...DEFAULT_CREDENTIAL_A_CLAIMS, ...claims } });
}

/** `default_credential_A` in mdoc format with additional elements (`birth_date` as `full-date`), issued like the PID. */
export function issueCredentialAMdocWith(claims: Record<string, unknown>) {
  return (options: MdocIssueOptions) =>
    issueMdoc({
      ...options,
      docType: CREDENTIAL_A_DOCTYPE,
      namespace: CREDENTIAL_A_NAMESPACE,
      claims: { ...DEFAULT_CREDENTIAL_A_CLAIMS, ...claims },
      fullDates: new Set(['attribute_C', 'birth_date']),
    });
}
