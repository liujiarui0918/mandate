// @mandate/registry/cache — JSON cache for resolved skills.
//
// Cache lives at .mandate/skills/.cache.json under the project root.
// Schema: { version: 1, entries: { [skillName]: { ...hit, resolved_at } } }
// Resolution is fast but writes are atomic-via-rename; reads tolerate
// missing or corrupt files (fall back to empty).

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const CACHE_VERSION = 1;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function cachePath(projectRoot) {
  return join(projectRoot, '.mandate', 'skills', '.cache.json');
}

export async function loadCache(projectRoot) {
  try {
    const text = await readFile(cachePath(projectRoot), 'utf8');
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && parsed.version === CACHE_VERSION) {
      return parsed;
    }
  } catch {
    // missing / corrupt → fresh cache
  }
  return { version: CACHE_VERSION, entries: {} };
}

export async function saveCache(projectRoot, cache) {
  const path = cachePath(projectRoot);
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmp, JSON.stringify(cache, null, 2), 'utf8');
  await rename(tmp, path);
}

export function isFresh(entry, { ttlMs = DEFAULT_TTL_MS, now = Date.now() } = {}) {
  if (!entry || typeof entry.resolved_at !== 'number') return false;
  return now - entry.resolved_at < ttlMs;
}

export function cacheGet(cache, skillName, opts) {
  const entry = cache?.entries?.[skillName];
  if (!entry) return null;
  if (!isFresh(entry, opts)) return null;
  return entry;
}

export function cacheSet(cache, skillName, hit, { now = Date.now() } = {}) {
  if (!cache.entries) cache.entries = {};
  cache.entries[skillName] = { ...hit, resolved_at: now };
}

export function cacheClear(cache) {
  cache.entries = {};
}
