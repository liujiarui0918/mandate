/**
 * @mandate/runtime — terms.yaml resolver (i18n).
 *
 * Loads terms.yaml and provides:
 *   - canonicalize(input): map any surface form (zh/en/latin/alias) -> canonical role key
 *   - display(role, lang): render a role for human display in the requested language
 *
 * The court treats both Eastern (封建朝廷) and Western (corporate) metaphors
 * as first-class. terms.yaml is the single source of truth for that mapping.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

/**
 * @typedef {Object} TermEntry
 * @property {string} zh
 * @property {string} en
 * @property {string} [latin]
 * @property {string} [alias]
 */

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Resolve the path of terms.yaml.
 * Search order:
 *   1. explicit path argument
 *   2. process.env.MANDATE_TERMS_PATH
 *   3. <repo>/terms.yaml (relative to this module — useful when running from monorepo)
 */
export function resolveTermsPath(arg) {
  if (arg && typeof arg === 'string' && existsSync(arg)) return resolve(arg);
  if (process.env.MANDATE_TERMS_PATH && existsSync(process.env.MANDATE_TERMS_PATH)) {
    return resolve(process.env.MANDATE_TERMS_PATH);
  }
  // packages/runtime/src/i18n.mjs -> ../../../terms.yaml
  const rootGuess = resolve(__dirname, '../../../terms.yaml');
  if (existsSync(rootGuess)) return rootGuess;
  return null;
}

/**
 * Load and parse a terms.yaml.
 *
 * @param {string} [path] — explicit path; otherwise auto-resolved.
 * @returns {Record<string, TermEntry>}
 */
export function loadTerms(path) {
  const resolved = resolveTermsPath(path);
  if (!resolved) throw new Error('terms.yaml not found (set MANDATE_TERMS_PATH or pass an explicit path)');
  const raw = readFileSync(resolved, 'utf8');
  const parsed = yaml.load(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`terms.yaml at ${resolved} is empty or malformed`);
  }
  return parsed;
}

/**
 * Build a fast canonicalizer from a terms map.
 *
 * Returns a function that maps any surface form (zh / en / latin / alias)
 * to the canonical key, or undefined if not recognized.
 *
 * @param {Record<string, TermEntry>} terms
 */
export function buildCanonicalizer(terms) {
  const lookup = new Map();
  for (const [key, entry] of Object.entries(terms)) {
    if (!entry || typeof entry !== 'object') continue;
    lookup.set(key.toLowerCase(), key);
    if (entry.zh) lookup.set(entry.zh, key);
    if (entry.en) lookup.set(entry.en.toLowerCase(), key);
    if (entry.latin) lookup.set(entry.latin.toLowerCase(), key);
    if (entry.alias) lookup.set(entry.alias.toLowerCase(), key);
  }
  return function canonicalize(input) {
    if (input == null) return undefined;
    const s = String(input).trim();
    return lookup.get(s) ?? lookup.get(s.toLowerCase());
  };
}

/**
 * Build a display formatter.
 *
 * @param {Record<string, TermEntry>} terms
 */
export function buildDisplay(terms) {
  return function display(roleKey, lang = 'both') {
    const entry = terms[roleKey];
    if (!entry) return roleKey;
    if (lang === 'zh') return entry.zh ?? entry.en ?? roleKey;
    if (lang === 'en') return entry.en ?? entry.zh ?? roleKey;
    if (lang === 'both') {
      const zh = entry.zh ?? '';
      const en = entry.en ?? '';
      if (zh && en && zh !== en) return `${zh} (${en})`;
      return zh || en || roleKey;
    }
    return roleKey;
  };
}

/**
 * Convenience: load terms + return both helpers.
 *
 * @param {string} [path]
 * @returns {{terms: Record<string,TermEntry>, canonicalize: (input:string)=>string|undefined, display: (key:string, lang?:string)=>string, path: string|null}}
 */
export function loadI18n(path) {
  const resolved = resolveTermsPath(path);
  const terms = loadTerms(path);
  return {
    terms,
    canonicalize: buildCanonicalizer(terms),
    display: buildDisplay(terms),
    path: resolved,
  };
}
