/**
 * `mandate evolve [--major|--minor|--patch]` — bump constitution version
 * after a manual edit. Refuses to bump if the constitution is invalid.
 */

import { resolve } from 'node:path';
import {
  loadConstitution,
  saveConstitution,
  bumpConstitutionVersion,
} from '@mandate/runtime';

const VALID_BUMPS = new Set(['major', 'minor', 'patch']);

export async function runEvolve(targetDir = '.', { bump = 'patch', dryRun = false } = {}) {
  if (!VALID_BUMPS.has(bump)) {
    return { ok: false, message: `invalid bump "${bump}". Valid: major|minor|patch` };
  }
  const root = resolve(targetDir);
  const loaded = loadConstitution(root);
  if (!loaded.ok) {
    return { ok: false, message: `failed to load constitution: ${loaded.errors?.[0]?.message ?? 'unknown error'}` };
  }
  const cfg = loaded.constitution;
  const previousVersion = cfg.version;
  const nextVersion = bumpConstitutionVersion(previousVersion, bump);
  const next = { ...cfg, version: nextVersion };
  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      previousVersion,
      newVersion: nextVersion,
      bump,
      message: `dry-run: would bump ${previousVersion} → ${nextVersion} (${bump})`,
    };
  }
  try {
    saveConstitution(root, next);
  } catch (err) {
    return { ok: false, message: `failed to save constitution: ${err.message}` };
  }
  return {
    ok: true,
    previousVersion,
    newVersion: nextVersion,
    bump,
    message: `constitution bumped ${previousVersion} → ${nextVersion} (${bump})`,
  };
}
