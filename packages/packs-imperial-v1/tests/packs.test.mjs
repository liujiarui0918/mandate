// @mandate/packs-imperial-v1 — pack loader tests.
//
// Verifies that all 8 imperial role packs parse correctly, validate
// against the loader's schema, and round-trip through every public
// loader entry point.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ROLES,
  PROTOCOLS,
  PACKS_DIR,
  packPathForRole,
  packPathForName,
  validatePack,
  loadPack,
  loadPackByRole,
  loadAllPacks,
  listPacks,
} from '../src/index.mjs';

test('ROLES contains exactly the 8 imperial roles', () => {
  assert.deepEqual(
    [...ROLES].sort(),
    ['censor', 'chancellor', 'cto', 'emperor', 'historian', 'scout', 'secretary', 'soldier'],
  );
});

test('PROTOCOLS contains exactly the 5 supported adapter kinds', () => {
  assert.deepEqual(
    [...PROTOCOLS].sort(),
    ['claude-skill', 'cli', 'mandate-builtin', 'mcp', 'openclaw-skill'],
  );
});

test('PACKS_DIR is an absolute path', () => {
  assert.ok(PACKS_DIR);
  assert.ok(PACKS_DIR.includes('packs-imperial-v1'));
});

test('packPathForRole rejects unknown roles', () => {
  assert.throws(() => packPathForRole('jester'), /Unknown role/);
});

test('packPathForName rejects unknown pack names', () => {
  assert.throws(() => packPathForName('imperial-jester-v1'), /Unknown pack/);
});

test('validatePack reports missing required fields', () => {
  const result = validatePack({}, 'test');
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('"name"')));
  assert.ok(result.errors.some((e) => e.includes('"version"')));
  assert.ok(result.errors.some((e) => e.includes('"role"')));
  assert.ok(result.errors.some((e) => e.includes('"description"')));
  assert.ok(result.errors.some((e) => e.includes('skills')));
});

test('validatePack rejects invalid role', () => {
  const result = validatePack(
    {
      name: 'x',
      version: '1.0.0',
      role: 'jester',
      description: { en: 'a', zh: 'b' },
      skills: [],
    },
    'test',
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('not a valid imperial role')));
});

test('validatePack rejects invalid skill protocol', () => {
  const result = validatePack(
    {
      name: 'x',
      version: '1.0.0',
      role: 'scout',
      description: { en: 'a', zh: 'b' },
      skills: [{ protocol: 'wizardry', name: 'spellcast' }],
    },
    'test',
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('wizardry')));
});

test('validatePack accepts a minimal valid pack', () => {
  const result = validatePack(
    {
      name: 'x',
      version: '1.0.0',
      role: 'scout',
      description: { en: 'a', zh: 'b' },
      skills: [{ protocol: 'mcp', name: 'brave-search' }],
    },
    'test',
  );
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('loadPackByRole loads emperor pack', async () => {
  const pack = await loadPackByRole('emperor');
  assert.equal(pack.name, 'imperial-emperor-v1');
  assert.equal(pack.role, 'emperor');
  assert.ok(pack.description.en);
  assert.ok(pack.description.zh);
  assert.ok(Array.isArray(pack.skills));
});

test('loadPack loads by canonical pack name', async () => {
  const pack = await loadPack('imperial-historian-v1');
  assert.equal(pack.role, 'historian');
});

test('loadAllPacks returns one entry per imperial role', async () => {
  const packs = await loadAllPacks();
  assert.deepEqual([...Object.keys(packs)].sort(), [...ROLES].sort());
  for (const role of ROLES) {
    assert.equal(packs[role].role, role, `pack for ${role} should declare matching role`);
  }
});

test('listPacks finds all 8 yaml files', async () => {
  const entries = await listPacks();
  assert.equal(entries.length, 8);
  const roles = entries.map((e) => e.role).sort();
  assert.deepEqual(roles, [...ROLES].sort());
  for (const e of entries) {
    assert.ok(e.packName, `${e.role} should have a canonical packName`);
    assert.ok(e.path.endsWith('.pack.yaml'));
  }
});

test('every shipped pack passes validation', async () => {
  for (const role of ROLES) {
    const pack = await loadPackByRole(role);
    const result = validatePack(pack, role);
    assert.equal(
      result.valid,
      true,
      `${role} pack should validate. Errors: ${result.errors.join('; ')}`,
    );
  }
});

test('every shipped skill uses a known protocol', async () => {
  const packs = await loadAllPacks();
  for (const [role, pack] of Object.entries(packs)) {
    for (const skill of pack.skills) {
      assert.ok(
        PROTOCOLS.includes(skill.protocol),
        `${role}/${skill.name} uses unknown protocol "${skill.protocol}"`,
      );
    }
  }
});
