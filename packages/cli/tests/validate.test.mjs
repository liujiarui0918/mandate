import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runCreate } from '../src/commands/create.mjs';
import { runValidate } from '../src/commands/validate.mjs';

function makeTmp() {
  return mkdtempSync(join(tmpdir(), 'mandate-validate-test-'));
}

test('runValidate: scaffolded research court passes all checks', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'demo');
  try {
    await runCreate(target, { template: 'research' });
    const r = runValidate(target);
    assert.equal(r.ok, true, JSON.stringify(r.checks));
    const constitutionCheck = r.checks.find((c) => c.name === 'constitution.yaml schema');
    assert.ok(constitutionCheck);
    assert.equal(constitutionCheck.ok, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runValidate: scaffolded self-governance court passes all checks', async () => {
  const tmp = makeTmp();
  const target = join(tmp, 'demo-sg');
  try {
    await runCreate(target, { template: 'self-governance' });
    const r = runValidate(target);
    assert.equal(r.ok, true, JSON.stringify(r.checks));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runValidate: missing .mandate fails', () => {
  const tmp = makeTmp();
  try {
    const r = runValidate(tmp);
    assert.equal(r.ok, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
