import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir, cp, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  loadConstitution,
  saveConstitution,
  bumpConstitutionVersion,
  resolveMandateDir,
} from '../src/constitution.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const SCHEMA_ROOT = join(REPO_ROOT, 'spec');
const TEMPLATE_RESEARCH = join(REPO_ROOT, 'examples/research/.mandate');

function makeTmpCourt() {
  return mkdtempSync(join(tmpdir(), 'mandate-runtime-constitution-'));
}

async function scaffoldFromTemplate(targetDir) {
  await mkdir(targetDir, { recursive: true });
  await cp(TEMPLATE_RESEARCH, join(targetDir, '.mandate'), { recursive: true });
}

test('resolveMandateDir: returns root when no .mandate subdir', () => {
  const tmp = makeTmpCourt();
  try {
    assert.equal(resolveMandateDir(tmp), resolve(tmp));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadConstitution: parses + validates the research example', async () => {
  const tmp = makeTmpCourt();
  try {
    await scaffoldFromTemplate(tmp);
    const r = loadConstitution(tmp, { schemaRoot: SCHEMA_ROOT });
    assert.equal(r.ok, true, r.errors ? JSON.stringify(r.errors) : '');
    assert.equal(r.constitution.project, 'research-demo');
    assert.equal(r.constitution.language, 'both');
    assert.equal(r.constitution.court_cadence?.morning_court?.time, '09:00');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadConstitution: returns ok=false when file missing', () => {
  const tmp = makeTmpCourt();
  try {
    const r = loadConstitution(tmp);
    assert.equal(r.ok, false);
    assert.ok(r.errors[0].message.includes('not found'));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadConstitution: returns ok=false on YAML parse error', async () => {
  const tmp = makeTmpCourt();
  try {
    const dir = join(tmp, '.mandate', 'constitution');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'constitution.yaml'), '{not: valid: yaml: at all', 'utf8');
    const r = loadConstitution(tmp);
    assert.equal(r.ok, false);
    assert.ok(r.errors[0].message.includes('parse'));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('loadConstitution: returns ok=false when schema validation fails', async () => {
  const tmp = makeTmpCourt();
  try {
    const dir = join(tmp, '.mandate', 'constitution');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'constitution.yaml'), 'project: bad-court\n', 'utf8');
    const r = loadConstitution(tmp, { schemaRoot: SCHEMA_ROOT });
    assert.equal(r.ok, false);
    assert.ok(Array.isArray(r.errors));
    assert.ok(r.errors.length > 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('bumpConstitutionVersion: patch level', () => {
  assert.equal(bumpConstitutionVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(bumpConstitutionVersion('0.0.0', 'patch'), '0.0.1');
});

test('bumpConstitutionVersion: minor level resets patch', () => {
  assert.equal(bumpConstitutionVersion('1.2.3', 'minor'), '1.3.0');
});

test('bumpConstitutionVersion: major level resets minor + patch', () => {
  assert.equal(bumpConstitutionVersion('1.2.3', 'major'), '2.0.0');
});

test('bumpConstitutionVersion: throws on invalid semver', () => {
  assert.throws(() => bumpConstitutionVersion('not-semver', 'patch'));
  assert.throws(() => bumpConstitutionVersion('1.2', 'patch'));
});

test('bumpConstitutionVersion: throws on unknown level', () => {
  assert.throws(() => bumpConstitutionVersion('1.0.0', 'breaking'));
});

test('saveConstitution: refuses to write invalid constitution', async () => {
  const tmp = makeTmpCourt();
  try {
    await scaffoldFromTemplate(tmp);
    assert.throws(
      () => saveConstitution(tmp, { project: 'bad' }, { schemaRoot: SCHEMA_ROOT }),
      /Refusing to save invalid constitution/,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('saveConstitution: round-trip — load, bump, save, reload matches', async () => {
  const tmp = makeTmpCourt();
  try {
    await scaffoldFromTemplate(tmp);
    const r1 = loadConstitution(tmp, { schemaRoot: SCHEMA_ROOT });
    assert.equal(r1.ok, true);
    const bumped = {
      ...r1.constitution,
      version: bumpConstitutionVersion(r1.constitution.version, 'patch'),
    };
    saveConstitution(tmp, bumped, { schemaRoot: SCHEMA_ROOT });
    const r2 = loadConstitution(tmp, { schemaRoot: SCHEMA_ROOT });
    assert.equal(r2.ok, true);
    assert.equal(r2.constitution.version, bumped.version);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
