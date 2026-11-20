// The Provider's ICS (issuer catalogue section 4) as the controller reads it: profiles for the applicability of a test
// case and its variant, declared values for the steps.
import { readFile } from 'node:fs/promises';
import { ISSUER_ICS_ITEMS, type IssuerIcs, type IssuerProfile, type IssuerTestCaseDefinition, VARIANT_PROFILES } from '@rp-conformance/core';
import { parse } from 'yaml';

const PROFILES = new Set<string>(Object.values(ISSUER_ICS_ITEMS).flatMap((item) => [...item.profiles]));

/**
 * Reads an issuer ICS file: `profiles`, the profiles the answers select, and `items`, the declared values keyed by ICS
 * item ID or `<item>.<name>`. Every profile must be one of the catalogue's, every item key one of ICS-01 to ICS-19.
 */
export async function loadIssuerIcs(path: string): Promise<IssuerIcs> {
  const parsed = parse(await readFile(path, 'utf8')) as { profiles?: unknown; items?: unknown } | null;
  if (!parsed || !Array.isArray(parsed.profiles) || !parsed.items || typeof parsed.items !== 'object') {
    throw new Error(`${path}: not an issuer ICS (profiles and items)`);
  }
  for (const profile of parsed.profiles) if (!PROFILES.has(String(profile))) throw new Error(`${path}: unknown profile ${String(profile)}`);
  for (const key of Object.keys(parsed.items)) if (!(key.split('.')[0] in ISSUER_ICS_ITEMS)) throw new Error(`${path}: unknown ICS item ${key}`);
  return { profiles: parsed.profiles as IssuerProfile[], items: parsed.items as IssuerIcs['items'] };
}

/** The profile applicability conditions and variant codes the ICS does not meet; empty when the test case applies. */
export function issuerApplicability(definition: IssuerTestCaseDefinition, ics: IssuerIcs): string[] {
  const unmet = definition.profile.filter((c) => !ics.profiles.includes(c.equals as IssuerProfile)).map((c) => `${c.item} ${c.equals} (${c.text})`);
  for (const variant of definition.variants ?? []) {
    const profile = VARIANT_PROFILES[variant];
    if (!ics.profiles.includes(profile) && !unmet.some((u) => u.includes(` ${profile} `))) unmet.push(`variant ${variant} needs ${profile}`);
  }
  return unmet;
}

/** A declared value as a string, undefined when the ICS does not declare it. */
export function issuerIcsValue(ics: IssuerIcs, key: string): string | undefined {
  const value = ics.items[key];
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return Array.isArray(value) ? value.join(', ') : String(value);
}

/**
 * Resolves the credential configurations of an issuance step: a reference `ICS-02.<format variant>` becomes the
 * configuration ID the ICS declares under it (`ICS-02.SD: pid-sd-jwt-vc`); anything else is taken as an ID.
 */
export function resolveConfigurations(configurations: string[], ics: IssuerIcs): string[] {
  return configurations.map((configuration) => {
    if (!/^ICS-\d{2}\./.test(configuration)) return configuration;
    const value = issuerIcsValue(ics, configuration);
    if (!value) throw new Error(`the ICS declares no credential configuration under ${configuration}`);
    return value;
  });
}

/**
 * Whether the pre-authorized code is protected by a `tx_code` (ICS-03.tx_code): the suite uses one unless the Provider
 * declares offers without one only.
 */
export function usesTxCode(ics: IssuerIcs): boolean {
  return !/^without$/i.test(issuerIcsValue(ics, 'ICS-03.tx_code') ?? 'with');
}
