/**
 * @mandateai/runtime — constitution loader.
 *
 * Loads `<courtDir>/.mandate/constitution/constitution.yaml`,
 * validates against the JSON Schema via @mandateai/validators,
 * and returns a typed config object.
 *
 * Also supports semver-aware version bumps when reform PRs are ratified
 * (delegated to bumpConstitutionVersion).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import yaml from 'js-yaml';
import { validateConstitution } from '@mandateai/validators';

/**
 * Resolve the .mandate/ directory inside a court dir.
 * If `targetDir` already ends in `.mandate`, return as-is.
 */
export function resolveMandateDir(targetDir) {
  const root = resolve(targetDir);
  const direct = join(root, '.mandate');
  if (existsSync(direct)) return direct;
  return root;
}

/**
 * Load + validate a constitution from a court dir.
 *
 * @param {string} courtDir e.g. "/tmp/my-empire" or "/tmp/my-empire/.mandate"
 * @param {{schemaRoot?:string}} [options]
 * @returns {{ok:true, constitution:object, path:string} | {ok:false, errors:object[]|null, path:string}}
 */
export function loadConstitution(courtDir, options = {}) {
  const mandateDir = resolveMandateDir(courtDir);
  const path = join(mandateDir, 'constitution', 'constitution.yaml');
  if (!existsSync(path)) {
    return { ok: false, errors: [{ message: `constitution.yaml not found at ${path}` }], path };
  }
  let parsed;
  try {
    parsed = yaml.load(readFileSync(path, 'utf8'));
  } catch (e) {
    return { ok: false, errors: [{ message: `YAML parse error: ${String(e)}` }], path };
  }
  const r = validateConstitution(parsed, options.schemaRoot);
  if (!r.valid) {
    return { ok: false, errors: r.errors, path };
  }
  return { ok: true, constitution: parsed, path };
}

/**
 * Bump the constitution's semver version.
 *
 * Levels:
 *   - 'major' for topology changes (added/removed roles, hook events)
 *   - 'minor' for new roles or new hooks within existing roles
 *   - 'patch' for parameter tweaks (model changes, censor strategy, cadence times)
 *
 * @param {string} currentVersion e.g. "1.2.3"
 * @param {'major'|'minor'|'patch'} level
 * @returns {string}
 */
export function bumpConstitutionVersion(currentVersion, level) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(currentVersion);
  if (!m) throw new Error(`Invalid semver: ${currentVersion}`);
  const [, maj, min, pat] = m.map(Number);
  if (level === 'major') return `${maj + 1}.0.0`;
  if (level === 'minor') return `${maj}.${min + 1}.0`;
  if (level === 'patch') return `${maj}.${min}.${pat + 1}`;
  throw new Error(`Unknown bump level: ${level}`);
}

/**
 * Persist a constitution back to disk (used by ratify).
 *
 * Performs a validate-before-write to guarantee we never persist a broken
 * constitution. Returns the new file path.
 *
 * @param {string} courtDir
 * @param {object} constitution
 * @param {{schemaRoot?:string}} [options]
 */
export function saveConstitution(courtDir, constitution, options = {}) {
  const r = validateConstitution(constitution, options.schemaRoot);
  if (!r.valid) {
    throw new Error(`Refusing to save invalid constitution: ${JSON.stringify(r.errors)}`);
  }
  const mandateDir = resolveMandateDir(courtDir);
  const path = join(mandateDir, 'constitution', 'constitution.yaml');
  const dump = yaml.dump(constitution, { lineWidth: 120, noRefs: true });
  writeFileSync(path, dump, 'utf8');
  return path;
}
