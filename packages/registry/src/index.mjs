// @mandateai/registry — skill discovery for Mandate.
//
// Walks a configurable source chain (local / mandate-registry / npm /
// clawhub) to locate a skill by name, then caches the result. Adapter
// dispatch is downstream — registry resolves "where does this skill live",
// adapters resolve "how do I run it".

export {
  Registry,
  discoverSkill,
  DEFAULT_DISCOVERY_ORDER,
} from './registry.mjs';

export {
  defaultSources,
  makeLocalSource,
  makeNpmSource,
  makeMandateRegistrySource,
  makeClawhubSource,
} from './sources.mjs';

export {
  cachePath,
  loadCache,
  saveCache,
  cacheGet,
  cacheSet,
  cacheClear,
  isFresh,
} from './cache.mjs';
