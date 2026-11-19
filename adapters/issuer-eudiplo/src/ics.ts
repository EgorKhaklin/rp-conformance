import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ISSUER_ICS_ITEMS, type IssuerIcs, type IssuerProfile } from '@rp-conformance/core';
import { parse } from 'yaml';

/** The ICS of EUDIPLO as this adapter configures it. */
export const ICS_PATH = fileURLToPath(new URL('../ics.yaml', import.meta.url));

const PROFILES = new Set<string>(Object.values(ISSUER_ICS_ITEMS).flatMap((item) => [...item.profiles]));

/**
 * Reads an issuer ICS file: `profiles`, the profiles the answers select, and `items`, the declared values keyed by ICS
 * item ID or `<item>.<name>` (`IssuerIcs`). Every profile must be one of the catalogue's, every item key one of
 * ICS-01 to ICS-19.
 */
export async function loadIssuerIcs(path = ICS_PATH): Promise<IssuerIcs> {
  const parsed = parse(await readFile(path, 'utf8')) as { profiles?: unknown; items?: unknown } | null;
  if (!parsed || !Array.isArray(parsed.profiles) || !parsed.items || typeof parsed.items !== 'object') {
    throw new Error(`${path}: not an issuer ICS (profiles and items)`);
  }
  for (const profile of parsed.profiles) {
    if (!PROFILES.has(String(profile))) throw new Error(`${path}: unknown profile ${String(profile)}`);
  }
  for (const key of Object.keys(parsed.items)) {
    if (!(key.split('.')[0] in ISSUER_ICS_ITEMS)) throw new Error(`${path}: unknown ICS item ${key}`);
  }
  return { profiles: parsed.profiles as IssuerProfile[], items: parsed.items as IssuerIcs['items'] };
}

/** A declared value as a list of strings (a YAML list, or one string). */
export function icsList(ics: IssuerIcs, key: string, fallback: string[]): string[] {
  const value = ics.items[key];
  if (value === undefined) return fallback;
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

/** A declared value as a number. */
export function icsNumber(ics: IssuerIcs, key: string, fallback: number): number {
  const value = Number(ics.items[key]);
  return ics.items[key] === undefined || !Number.isFinite(value) ? fallback : value;
}
