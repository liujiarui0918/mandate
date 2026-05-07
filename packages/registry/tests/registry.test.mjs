// @mandate/registry — discovery walker tests.
//
// Verifies source chain ordering, cache hit/miss behavior, atomic write
// safety, and that not-installed stubs from npm/clawhub do not poison
// the cache.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  Registry,
  discoverSkill,
  DEFAULT_DISCOVERY_ORDER,
  defaultSources,
  makeLocalSource,
  makeNpmSource,
  makeMandateRegistrySource,
  makeClawhubSource,
  cachePath,
  loadCache,
  saveCache,
  cacheGet,
  cacheSet,
  cacheClear,
  isFresh,
} from "../src/index.mjs";

// ---- constants

test("DEFAULT_DISCOVERY_ORDER matches SPEC §9.2", () => {
  assert.deepEqual(
    [...DEFAULT_DISCOVERY_ORDER],
    ["local", "mandate-registry", "npm", "clawhub"],
  );
});

// ---- cache primitives

test("loadCache: returns empty cache when file missing", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const cache = await loadCache(tmp);
    assert.equal(cache.version, 1);
    assert.deepEqual(cache.entries, {});
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("saveCache + loadCache: roundtrip", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const cache = { version: 1, entries: { foo: { protocol: "mcp", resolved_at: 100 } } };
    await saveCache(tmp, cache);
    const reloaded = await loadCache(tmp);
    assert.equal(reloaded.entries.foo.protocol, "mcp");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("loadCache: returns empty when corrupt", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const path = cachePath(tmp);
    mkdirSync(join(tmp, ".mandate", "skills"), { recursive: true });
    writeFileSync(path, "not json{{{", "utf8");
    const cache = await loadCache(tmp);
    assert.equal(cache.version, 1);
    assert.deepEqual(cache.entries, {});
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("isFresh: respects ttl", () => {
  const now = 10_000;
  assert.equal(isFresh({ resolved_at: 9_500 }, { ttlMs: 1000, now }), true);
  assert.equal(isFresh({ resolved_at: 8_500 }, { ttlMs: 1000, now }), false);
  assert.equal(isFresh(null, { ttlMs: 1000, now }), false);
  assert.equal(isFresh({}, { ttlMs: 1000, now }), false);
});

test("cacheGet returns null when stale", () => {
  const cache = { entries: { x: { resolved_at: 0 } } };
  assert.equal(cacheGet(cache, "x", { ttlMs: 1000, now: 5000 }), null);
});

test("cacheSet stamps resolved_at", () => {
  const cache = { entries: {} };
  cacheSet(cache, "x", { protocol: "mcp" }, { now: 12345 });
  assert.equal(cache.entries.x.resolved_at, 12345);
  assert.equal(cache.entries.x.protocol, "mcp");
});

test("cacheClear empties entries", () => {
  const cache = { entries: { a: {}, b: {} } };
  cacheClear(cache);
  assert.deepEqual(cache.entries, {});
});

// ---- source factories

test("defaultSources returns the 4 SPEC-mandated sources", () => {
  const sources = defaultSources();
  assert.deepEqual(
    Object.keys(sources).sort(),
    ["clawhub", "local", "mandate-registry", "npm"],
  );
});

test("makeLocalSource: misses when nothing installed", () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const src = makeLocalSource({ projectRoot: tmp });
    assert.equal(src.check("nonexistent-skill"), null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("makeLocalSource: hits node_modules/@mandate-skills", () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const skillDir = join(tmp, "node_modules", "@mandate-skills", "vendored-skill");
    mkdirSync(skillDir, { recursive: true });
    const src = makeLocalSource({ projectRoot: tmp });
    const hit = src.check("vendored-skill");
    assert.equal(hit?.source, "local");
    assert.equal(hit?.subsource, "npm-vendored");
    assert.equal(hit?.protocol, "mandate-builtin");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("makeNpmSource: returns installed=false when missing locally", () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const src = makeNpmSource({ projectRoot: tmp });
    const hit = src.check("brand-new-skill");
    assert.equal(hit.source, "npm");
    assert.equal(hit.installed, false);
    assert.match(hit.installHint, /npm install @mandate-skills\/brand-new-skill/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("makeMandateRegistrySource: returns null without fetcher", async () => {
  const src = makeMandateRegistrySource();
  assert.equal(await src.check("anything"), null);
});

test("makeMandateRegistrySource: invokes injected fetcher", async () => {
  const calls = [];
  const fetcher = async (url) => {
    calls.push(url);
    return { protocol: "mcp", url, signature: "sig123" };
  };
  const src = makeMandateRegistrySource({ baseUrl: "https://example.test", fetcher });
  const hit = await src.check("scout-deep-research");
  assert.equal(hit.source, "mandate-registry");
  assert.equal(hit.signed, "sig123");
  assert.equal(calls[0], "https://example.test/skills/scout-deep-research");
});

test("makeClawhubSource: returns null when neither local nor fetcher", async () => {
  const src = makeClawhubSource();
  assert.equal(await src.check("missing-skill-xyz-789"), null);
});

// ---- registry walker

function fakeSource(name, hits) {
  return {
    name,
    check: async (skillName) => hits[skillName] ?? null,
  };
}

test("Registry: walks chain in order, returns first hit", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s1", "s2", "s3"],
      sources: {
        s1: fakeSource("s1", {}),
        s2: fakeSource("s2", { foo: { source: "s2", protocol: "mcp", name: "foo", location: "x" } }),
        s3: fakeSource("s3", { foo: { source: "s3", protocol: "cli", name: "foo", location: "y" } }),
      },
    });
    const hit = await reg.discover("foo");
    assert.equal(hit.source, "s2");
    assert.equal(hit.fromCache, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: returns null when no source has the skill", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s1"],
      sources: { s1: fakeSource("s1", {}) },
    });
    assert.equal(await reg.discover("missing"), null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: subsequent calls hit cache", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    let calls = 0;
    const src = {
      name: "s",
      check: async (n) => {
        calls++;
        return { source: "s", name: n, protocol: "mcp", location: "x" };
      },
    };
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s"],
      sources: { s: src },
    });
    const first = await reg.discover("x");
    assert.equal(first.fromCache, false);
    assert.equal(calls, 1);
    const second = await reg.discover("x");
    assert.equal(second.fromCache, true);
    assert.equal(calls, 1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: useCache=false bypasses cache", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    let calls = 0;
    const src = {
      name: "s",
      check: async (n) => {
        calls++;
        return { source: "s", name: n, protocol: "mcp", location: "x" };
      },
    };
    const reg = new Registry({ projectRoot: tmp, discoveryOrder: ["s"], sources: { s: src } });
    await reg.discover("x");
    await reg.discover("x", { useCache: false });
    assert.equal(calls, 2);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: installed=false hits do NOT cache (next discover re-checks)", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    let installedNow = false;
    const src = {
      name: "s",
      check: async (n) => ({
        source: "s",
        name: n,
        protocol: "mcp",
        location: "x",
        installed: installedNow,
      }),
    };
    const reg = new Registry({ projectRoot: tmp, discoveryOrder: ["s"], sources: { s: src } });
    const miss = await reg.discover("x");
    assert.equal(miss, null);
    installedNow = true;
    const hit = await reg.discover("x");
    assert.equal(hit?.installed, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: discoverAll returns hits from every responding source", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s1", "s2", "s3"],
      sources: {
        s1: fakeSource("s1", { foo: { source: "s1", protocol: "mcp", name: "foo", location: "a" } }),
        s2: fakeSource("s2", {}),
        s3: fakeSource("s3", { foo: { source: "s3", protocol: "cli", name: "foo", location: "b" } }),
      },
    });
    const hits = await reg.discoverAll("foo");
    assert.equal(hits.length, 2);
    assert.equal(hits[0].source, "s1");
    assert.equal(hits[1].source, "s3");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: discoverMany splits resolved/missing", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s"],
      sources: {
        s: fakeSource("s", { found: { source: "s", protocol: "mcp", name: "found", location: "x" } }),
      },
    });
    const result = await reg.discoverMany(["found", "missing", "found2"]);
    assert.deepEqual(Object.keys(result.resolved), ["found"]);
    assert.deepEqual(result.missing.sort(), ["found2", "missing"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: registerSource appends to chain", () => {
  const reg = new Registry({ discoveryOrder: ["a"], sources: {} });
  reg.registerSource("z", { name: "z", check: () => null });
  assert.deepEqual(reg.discoveryOrder, ["a", "z"]);
});

test("Registry: registerSource at index", () => {
  const reg = new Registry({ discoveryOrder: ["a", "b"], sources: {} });
  reg.registerSource("middle", { name: "middle", check: () => null }, { atIndex: 1 });
  assert.deepEqual(reg.discoveryOrder, ["a", "middle", "b"]);
});

test("Registry: unregisterSource removes from chain and registry", () => {
  const reg = new Registry({ discoveryOrder: ["a", "b"], sources: { a: {}, b: {} } });
  reg.unregisterSource("a");
  assert.deepEqual(reg.discoveryOrder, ["b"]);
  assert.equal(reg.sources.a, undefined);
});

test("Registry: clearCache wipes on-disk and in-memory state", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const reg = new Registry({
      projectRoot: tmp,
      discoveryOrder: ["s"],
      sources: {
        s: fakeSource("s", { x: { source: "s", protocol: "mcp", name: "x", location: "p" } }),
      },
    });
    await reg.discover("x");
    await reg.clearCache();
    const cache = await loadCache(tmp);
    assert.deepEqual(cache.entries, {});
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("discoverSkill convenience: works with default sources (no hit)", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-reg-"));
  try {
    const result = await discoverSkill("definitely-not-real-skill-name-xyz", { projectRoot: tmp });
    assert.equal(result, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("Registry: discover throws on bad input", async () => {
  const reg = new Registry({ discoveryOrder: [], sources: {} });
  await assert.rejects(() => reg.discover(""), TypeError);
  await assert.rejects(() => reg.discover(null), TypeError);
});
