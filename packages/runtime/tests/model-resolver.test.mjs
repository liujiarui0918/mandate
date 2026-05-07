import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  resolveModel,
  resolveAllModels,
  loadModelHealth,
  saveModelHealth,
  modelHealthPath,
  describeResolution,
} from '../src/model-resolver.mjs';

function makeTmpCourt() {
  return mkdtempSync(join(tmpdir(), 'mandate-runtime-resolver-'));
}

const sampleEntry = {
  preferred: 'gpt-5.5',
  fallback: ['gpt-5', 'gpt-5-pro', 'claude-opus-4-7-1m'],
};

test('resolveModel: returns preferred when probe says ok', async () => {
  const probe = async (m) => ({ ok: m === 'gpt-5.5', reason: m === 'gpt-5.5' ? 'ok' : 'unavailable' });
  const r = await resolveModel('chancellor', sampleEntry, probe);
  assert.equal(r.selected, 'gpt-5.5');
  assert.equal(r.attempted.length, 1);
  assert.equal(r.attempted[0].reason, 'ok');
});

test('resolveModel: falls back when preferred unavailable', async () => {
  const probe = async (m) => ({
    ok: m === 'gpt-5',
    reason: m === 'gpt-5' ? 'ok' : 'unavailable',
  });
  const r = await resolveModel('chancellor', sampleEntry, probe);
  assert.equal(r.selected, 'gpt-5');
  assert.equal(r.attempted.length, 2);
  assert.equal(r.attempted[0].model, 'gpt-5.5');
  assert.equal(r.attempted[0].reason, 'unavailable');
  assert.equal(r.attempted[1].reason, 'ok');
});

test('resolveModel: returns empty selected when all fail', async () => {
  const probe = async () => ({ ok: false, reason: 'unavailable' });
  const r = await resolveModel('chancellor', sampleEntry, probe);
  assert.equal(r.selected, '');
  assert.equal(r.attempted.length, 4);
});

test('resolveModel: cache hit returns without probing', async () => {
  let probeCalls = 0;
  const probe = async () => {
    probeCalls++;
    return { ok: true, reason: 'ok' };
  };
  const cache = {
    chancellor: {
      role: 'chancellor',
      selected: 'gpt-5.5',
      attempted: [{ model: 'gpt-5.5', reason: 'ok' }],
      cached_at: new Date().toISOString(),
    },
  };
  const r = await resolveModel('chancellor', sampleEntry, probe, { cache, ttlMs: 60_000 });
  assert.equal(r.selected, 'gpt-5.5');
  assert.equal(probeCalls, 0);
});

test('resolveModel: cache expired triggers re-probe', async () => {
  let probeCalls = 0;
  const probe = async () => {
    probeCalls++;
    return { ok: true, reason: 'ok' };
  };
  const cache = {
    chancellor: {
      role: 'chancellor',
      selected: 'gpt-5.5',
      attempted: [],
      cached_at: new Date(Date.now() - 999_999_999).toISOString(),
    },
  };
  const r = await resolveModel('chancellor', sampleEntry, probe, { cache, ttlMs: 60_000 });
  assert.equal(r.selected, 'gpt-5.5');
  assert.equal(probeCalls, 1);
});

test('resolveModel: strict=true skips fallback chain', async () => {
  const probe = async (m) => ({
    ok: m === 'gpt-5',
    reason: m === 'gpt-5' ? 'ok' : 'unavailable',
  });
  const r = await resolveModel('chancellor', sampleEntry, probe, { strict: true });
  assert.equal(r.selected, '');
  assert.equal(r.attempted.length, 1);
});

test('resolveModel: probe throw counted as unknown', async () => {
  const probe = async () => {
    throw new Error('network error');
  };
  const r = await resolveModel('chancellor', sampleEntry, probe);
  assert.equal(r.selected, '');
  assert.equal(r.attempted[0].reason, 'unknown');
});

test('resolveAllModels: resolves all roles + persists cache', async () => {
  const tmp = makeTmpCourt();
  try {
    await mkdir(join(tmp, '.mandate'), { recursive: true });
    const constitution = {
      models: {
        chancellor: { preferred: 'gpt-5.5', fallback: ['gpt-5'] },
        cto: { preferred: 'claude-opus-4-7-1m', fallback: [] },
      },
    };
    const probe = async () => ({ ok: true, reason: 'ok' });
    const out = await resolveAllModels(constitution, probe, tmp);
    assert.equal(out.chancellor.selected, 'gpt-5.5');
    assert.equal(out.cto.selected, 'claude-opus-4-7-1m');
    assert.equal(existsSync(modelHealthPath(tmp)), true);
    const cached = await loadModelHealth(tmp);
    assert.ok(cached.chancellor);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadModelHealth: returns {} when missing', async () => {
  const tmp = makeTmpCourt();
  try {
    const r = await loadModelHealth(tmp);
    assert.deepEqual(r, {});
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadModelHealth: returns {} when corrupt', async () => {
  const tmp = makeTmpCourt();
  try {
    await mkdir(join(tmp, '.mandate'), { recursive: true });
    const fs = await import('node:fs/promises');
    await fs.writeFile(modelHealthPath(tmp), 'not-json');
    const r = await loadModelHealth(tmp);
    assert.deepEqual(r, {});
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('saveModelHealth + loadModelHealth: round-trip', async () => {
  const tmp = makeTmpCourt();
  try {
    await mkdir(join(tmp, '.mandate'), { recursive: true });
    const cache = {
      chancellor: {
        role: 'chancellor',
        selected: 'gpt-5',
        attempted: [],
        cached_at: '2026-05-08T00:00:00.000Z',
      },
    };
    await saveModelHealth(tmp, cache);
    const back = await loadModelHealth(tmp);
    assert.deepEqual(back, cache);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('describeResolution: marks preferred match', () => {
  const r = { role: 'chancellor', selected: 'gpt-5.5', attempted: [], cached_at: '' };
  assert.match(describeResolution(r, 'gpt-5.5'), /chancellor: gpt-5\.5 ✓/);
});

test('describeResolution: marks fallback', () => {
  const r = { role: 'chancellor', selected: 'gpt-5', attempted: [], cached_at: '' };
  assert.match(describeResolution(r, 'gpt-5.5'), /fallback from gpt-5\.5/);
});

test('describeResolution: marks no-model-available', () => {
  const r = { role: 'chancellor', selected: '', attempted: [{}, {}], cached_at: '' };
  assert.match(describeResolution(r, 'gpt-5.5'), /NO MODEL AVAILABLE/);
});
