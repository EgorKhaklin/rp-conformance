// The test subjects of the issuer suite (issuer catalogue section 3.4, ICS-17) as PID data, and their encoding in the two
// formats of the PID Rulebook (ARF Annex 3.01: chapter 4 for ISO/IEC 18013-5 mdoc, chapter 5 for SD-JWT VC). The adapter
// seeds these values, and the reference validator compares every issued value with them (`pid-values`).
import type { TestSubject } from './definition';

/** The attributes of a test subject that the PID carries unchanged, under their PID Rulebook names. */
export interface PidSubject {
  family_name: string;
  given_name: string;
  /** `full-date`, `YYYY-MM-DD`. */
  birth_date: string;
  place_of_birth: { country?: string; region?: string; locality?: string };
  /** ISO 3166-1 alpha-2 codes. */
  nationality: string[];
  issuing_authority: string;
  issuing_country: string;
}

/**
 * `SUBJ-1` has the values of `default_credential_pid` of the RP harness; `SUBJ-2` is `SUBJ-1` with one attribute changed,
 * `family_name` (`SM_Revocation_008`).
 */
export const PID_TEST_SUBJECTS: Record<TestSubject, PidSubject> = {
  'SUBJ-1': {
    family_name: 'Mustermann',
    given_name: 'Erika',
    birth_date: '1964-08-12',
    place_of_birth: { locality: 'Berlin', country: 'DE' },
    nationality: ['DE'],
    issuing_authority: 'DE',
    issuing_country: 'DE',
  },
  'SUBJ-2': {
    family_name: 'Gabler',
    given_name: 'Erika',
    birth_date: '1964-08-12',
    place_of_birth: { locality: 'Berlin', country: 'DE' },
    nationality: ['DE'],
    issuing_authority: 'DE',
    issuing_country: 'DE',
  },
};

/** The claim names of the SD-JWT VC encoding where they differ from the mdoc identifiers (PID Rulebook chapter 5). */
export const PID_SD_JWT_NAMES: Record<string, string> = {
  birth_date: 'birthdate',
  nationality: 'nationalities',
  expiry_date: 'date_of_expiry',
  issuance_date: 'date_of_issuance',
  family_name_birth: 'birth_family_name',
  given_name_birth: 'birth_given_name',
  email_address: 'email',
  mobile_phone_number: 'phone_number',
  portrait: 'picture',
};

/** A subject's PID data in the claim names of a format: `SD` (SD-JWT VC, PID Rulebook chapter 5) or `MD` (mdoc, chapter 4). */
export function pidClaimsOf(subject: PidSubject, format: 'SD' | 'MD'): Record<string, unknown> {
  const data = structuredClone(subject) as unknown as Record<string, unknown>;
  if (format === 'MD') return data;
  return Object.fromEntries(Object.entries(data).map(([name, value]) => [PID_SD_JWT_NAMES[name] ?? name, value]));
}

/**
 * The age attributes a PID carries for a birth date at a time, as the PID Rulebook defines them: `age_over_NN`
 * (`age_equal_or_over.NN` in SD-JWT VC), `age_in_years`, `age_birth_year`. Every date is taken in UTC.
 */
export function ageOf(birthDate: string, at: Date): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const age = at.getUTCFullYear() - year;
  const before = at.getUTCMonth() + 1 < month || (at.getUTCMonth() + 1 === month && at.getUTCDate() < day);
  return before ? age - 1 : age;
}
