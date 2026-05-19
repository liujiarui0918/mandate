/**
 * @mandateai/runtime — model resolver.
 *
 * Implements the three-tier default specified in SPEC §8:
 *   1. user override in mandate.config.yaml (handled upstream)
 *   2. constitution model entry { preferred, fallback: [...] }
 *   3. probe each candidate; pick first that passes
 *
 * Caches results in <courtDir>/.mandate/.model_health.json with a 24h TTL
 * so we don't probe every model on every startup.
 *
 * Probe function is injected (no hard dependency on any LLM provider).
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { resolveMandateDir } from './constitution.mjs';

/**
 * @typedef {Object} ModelEntry
 * @property {string} preferred
 * @property {string[]} fallback
 *
 * @typedef {{ok:boolean, reason:'ok'|'unavailable'|'auth'|'timeout'|'unknown'}} ProbeResult
 *
 * @typedef {Object} ResolveResult
 * @property {string} role
 * @property {string} selected
 * @property {Array<{model:string, reason:string}>} attempted
 * @property {string} [cached_at]
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Get the model-health cache file path for a court.
 */
export function modelHealthPath(courtDir) {
  return join(resolveMandateDir(courtDir), '.model_health.json');
}

/**
 * Load the cache (returns {} if missing or corrupt).
 */
export async function loadModelHealth(courtDir) {
  const path = modelHealthPath(courtDir);
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Persist the cache.
 */
export async function saveModelHealth(courtDir, cache) {
  const path = modelHealthPath(courtDir);
  const dir = dirname(path);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(path, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Resolve a single role's model.
 *
 * @param {string} role
 * @param {ModelEntry} entry
 * @param {(model:string) => Promise<ProbeResult>} probe
 * @param {{cache?: Record<string, ResolveResult>, ttlMs?: number, strict?: boolean}} [options]
 * @returns {Promise<ResolveResult>}
 */
export async function resolveModel(role, entry, probe, options = {}) {
  const { cache = {}, ttlMs = DEFAULT_TTL_MS, strict = false } = options;

  const cached = cache[role];
  if (cached && cached.cached_at) {
    const age = Date.now() - Date.parse(cached.cached_at);
    if (!Number.isNaN(age) && age < ttlMs) {
      return cached;
    }
  }

  const candidates = strict ? [entry.preferred] : [entry.preferred, ...entry.fallback];
  const attempted = [];
  for (const model of candidates) {
    let r;
    try {
      r = await probe(model);
    } catch {
      r = { ok: false, reason: 'unknown' };
    }
    attempted.push({ model, reason: r.reason });
    if (r.ok) {
      const result = {
        role,
        selected: model,
        attempted,
        cached_at: new Date().toISOString(),
      };
      cache[role] = result;
      return result;
    }
  }

  const result = {
    role,
    selected: '',
    attempted,
    cached_at: new Date().toISOString(),
  };
  return result;
}

/**
 * Resolve all roles in a constitution at once.
 *
 * @param {object} constitution loaded from constitution.yaml
 * @param {(model:string) => Promise<ProbeResult>} probe
 * @param {string} courtDir for cache persistence
 * @param {{ttlMs?:number, strict?:boolean, persist?:boolean}} [options]
 * @returns {Promise<Record<string, ResolveResult>>}
 */
export async function resolveAllModels(constitution, probe, courtDir, options = {}) {
  const { persist = true, ttlMs = DEFAULT_TTL_MS, strict = false } = options;
  const models = constitution?.models ?? {};
  const cache = await loadModelHealth(courtDir);
  const out = {};
  for (const [role, entry] of Object.entries(models)) {
    out[role] = await resolveModel(role, entry, probe, { cache, ttlMs, strict });
  }
  if (persist) {
    await saveModelHealth(courtDir, cache);
  }
  return out;
}

/**
 * Pretty-format a fallback decision for display.
 *
 *   "chancellor: gpt-5.5 ✓"
 *   "chancellor: gpt-5 (fallback from gpt-5.5)"
 *   "chancellor: NO MODEL AVAILABLE (tried 4)"
 */
export function describeResolution(result, preferred) {
  if (!result.selected) {
    return `${result.role}: NO MODEL AVAILABLE (tried ${result.attempted.length})`;
  }
  if (result.selected === preferred) {
    return `${result.role}: ${result.selected} ✓`;
  }
  return `${result.role}: ${result.selected} (fallback from ${preferred})`;
}
