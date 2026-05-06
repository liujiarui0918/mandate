import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runCreate } from '../src/commands/create.mjs';

function makeTmp() {
  return mkdtempSync(join(tmpdir(), 'mandate-cli-test-'));
}

test('runCreate: research template scaffolds .mandate', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'my-empire');
  try {
    const r = await runCreate(target, { template: 'research' });
    assert.equal(r.ok, true, r.message);
    assert.ok(existsSync(join(target, '.mandate', 'constitution', 'constitution.yaml')));
    assert.ok(existsSync(join(target, '.mandate', 'constitution', 'charter.md')));
    assert.ok(existsSync(join(target, '.mandate', 'constitution', 'terms.yaml')));
    assert.ok(existsSync(join(target, '.mandate', 'workspace', 'mandate.md')));
    const cfg = readFileSync(join(target, '.mandate', 'constitution', 'constitution.yaml'), 'utf8');
    assert.match(cfg, /project: research-demo/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: self-governance template uses tighter cadence', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'governance');
  try {
    const r = await runCreate(target, { template: 'self-governance' });
    assert.equal(r.ok, true, r.message);
    const cfg = readFileSync(join(target, '.mandate', 'constitution', 'constitution.yaml'), 'utf8');
    assert.match(cfg, /project: self-governance-demo/);
    assert.match(cfg, /time:\s+"08:00"/);
    assert.match(cfg, /time:\s+"22:00"/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: both template includes self-governance charter alongside', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'both-empire');
  try {
    const r = await runCreate(target, { template: 'both' });
    assert.equal(r.ok, true, r.message);
    assert.ok(existsSync(join(target, '.mandate', 'constitution', 'charter.md')));
    assert.ok(existsSync(join(target, '.mandate', 'constitution', '_self-governance.charter.md')));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: refuses to overwrite without --force', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'twice');
  try {
    await runCreate(target, { template: 'research' });
    const r2 = await runCreate(target, { template: 'research' });
    assert.equal(r2.ok, false);
    assert.match(r2.message, /already has \.mandate/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: --force overwrites', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'force-overwrite');
  try {
    await runCreate(target, { template: 'research' });
    const r2 = await runCreate(target, { template: 'self-governance', force: true });
    assert.equal(r2.ok, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: unknown template fails', async () => {
  const tmp = makeTmp();
  try {
    const r = await runCreate(join(tmp, 'bad'), { template: 'mysticism' });
    assert.equal(r.ok, false);
    assert.match(r.message, /Unknown template/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runCreate: language override edits constitution.yaml', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'zh-only');
  try {
    const r = await runCreate(target, { template: 'research', language: 'zh' });
    assert.equal(r.ok, true);
    const cfg = readFileSync(join(target, '.mandate', 'constitution', 'constitution.yaml'), 'utf8');
    assert.match(cfg, /^language: zh$/m);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
