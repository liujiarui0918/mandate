// @mandateai/registry — skill discovery walker.
//
// Walks the configured source chain in order; first hit wins. Caches
// resolved hits (excluding "not installed" stubs) so repeat lookups are
// I/O-free. The registry is process-local; concurrent runs of @mandateai/cli
// share the on-disk cache via the .mandate/skills/.cache.json file.

import { defaultSources } from './sources.mjs';
import { loadCache, saveCache, cacheGet, cacheSet, cacheClear, isFresh } from './cache.mjs';

export const DEFAULT_DISCOVERY_ORDER = Object.freeze([
  'local',
  'mandate-registry',
  'npm',
  'clawhub',
]);

export class Registry {
  constructor({
    projectRoot = process.cwd(),
    discoveryOrder = DEFAULT_DISCOVERY_ORDER,
    sources = defaultSources({ projectRoot }),
    fetcher = null,
    cacheTtlMs,
  } = {}) {
    this.projectRoot = projectRoot;
    this.discoveryOrder = [...discoveryOrder];
    this.sources = { ...sources };
    if (fetcher && this.sources['mandate-registry']) {
      this.sources['mandate-registry'].fetcher = fetcher;
    }
    if (fetcher && this.sources.clawhub) {
      this.sources.clawhub.fetcher = fetcher;
    }
    this.cacheTtlMs = cacheTtlMs;
    this._cache = null;
  }

  // Add or replace a source. The new source can be added to the chain
  // by passing { atIndex } or appending to the end if omitted.
  registerSource(name, source, { atIndex } = {}) {
    this.sources[name] = source;
    if (!this.discoveryOrder.includes(name)) {
      if (typeof atIndex === 'number') {
        this.discoveryOrder.splice(atIndex, 0, name);
      } else {
        this.discoveryOrder.push(name);
      }
    }
  }

  unregisterSource(name) {
    delete this.sources[name];
    this.discoveryOrder = this.discoveryOrder.filter((n) => n !== name);
  }

  async _ensureCache() {
    if (this._cache === null) {
      this._cache = await loadCache(this.projectRoot);
    }
    return this._cache;
  }

  async clearCache() {
    const cache = await this._ensureCache();
    cacheClear(cache);
    await saveCache(this.projectRoot, cache);
  }

  // Walk the chain, return the first hit or null.
  async discover(skillName, { useCache = true, persist = true } = {}) {
    if (typeof skillName !== 'string' || !skillName) {
      throw new TypeError('discover: skillName must be a non-empty string');
    }
    const cache = await this._ensureCache();
    if (useCache) {
      const hit = cacheGet(cache, skillName, { ttlMs: this.cacheTtlMs });
      if (hit && hit.installed !== false) {
        return { ...hit, fromCache: true };
      }
    }
    for (const sourceName of this.discoveryOrder) {
      const source = this.sources[sourceName];
      if (!source || typeof source.check !== 'function') continue;
      const hit = await source.check(skillName);
      if (hit && hit.installed !== false) {
        cacheSet(cache, skillName, hit);
        if (persist) await saveCache(this.projectRoot, cache);
        return { ...hit, fromCache: false };
      }
    }
    return null;
  }

  // Like discover() but returns ALL hits (one per source) for diagnostics.
  async discoverAll(skillName) {
    const hits = [];
    for (const sourceName of this.discoveryOrder) {
      const source = this.sources[sourceName];
      if (!source || typeof source.check !== 'function') continue;
      const hit = await source.check(skillName);
      if (hit) hits.push(hit);
    }
    return hits;
  }

  // Resolve a list of skill names; returns { resolved, missing }.
  async discoverMany(skillNames, opts) {
    const resolved = {};
    const missing = [];
    for (const name of skillNames) {
      const hit = await this.discover(name, opts);
      if (hit) resolved[name] = hit;
      else missing.push(name);
    }
    return { resolved, missing };
  }

  isFresh(entry) {
    return isFresh(entry, { ttlMs: this.cacheTtlMs });
  }
}

// Convenience: one-call discovery with default config.
export async function discoverSkill(skillName, opts) {
  const reg = new Registry(opts);
  return reg.discover(skillName);
}
