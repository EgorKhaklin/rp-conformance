import type { TestSubject } from '@rp-conformance/core';

/**
 * The attribute values the adapter seeds for each test subject (issuer catalogue section 3.4, ICS-17). EUDIPLO takes the
 * claims with the offer (`credentialClaims`, type `inline`), so the adapter seeds the subject on every offer. The
 * Conformance Wallet compares every issued value with these.
 *
 * `SUBJ-1` has the values of `default_credential_pid` of the RP harness (`DEFAULT_PID_CLAIMS` of the forge) and the
 * PID Rulebook's issuance metadata; `SUBJ-2` is `SUBJ-1` with one attribute changed, `family_name`
 * (`SM_Revocation_008`).
 */
export const PID_SUBJECTS: Record<TestSubject, Record<string, unknown>> = {
  'SUBJ-1': {
    family_name: 'Mustermann',
    given_name: 'Erika',
    birthdate: '1964-08-12',
    place_of_birth: { locality: 'Berlin', country: 'DE' },
    nationalities: ['DE'],
    issuing_authority: 'DE',
    issuing_country: 'DE',
  },
  'SUBJ-2': {
    family_name: 'Gabler',
    given_name: 'Erika',
    birthdate: '1964-08-12',
    place_of_birth: { locality: 'Berlin', country: 'DE' },
    nationalities: ['DE'],
    issuing_authority: 'DE',
    issuing_country: 'DE',
  },
};

/** The claim definitions of the PID configuration (`fields`), every one selectively disclosable. */
export const PID_FIELDS = [
  { path: ['family_name'], type: 'string', mandatory: true, disclosable: true },
  { path: ['given_name'], type: 'string', mandatory: true, disclosable: true },
  { path: ['birthdate'], type: 'string', mandatory: true, disclosable: true },
  {
    path: ['place_of_birth'],
    type: 'object',
    mandatory: true,
    disclosable: true,
    children: [
      { path: ['locality'], type: 'string', disclosable: true },
      { path: ['country'], type: 'string', disclosable: true },
    ],
  },
  { path: ['nationalities'], type: 'array', mandatory: true, disclosable: true, children: [{ path: [null], type: 'string' }] },
  { path: ['issuing_authority'], type: 'string', mandatory: true, disclosable: true },
  { path: ['issuing_country'], type: 'string', mandatory: true, disclosable: true },
];
