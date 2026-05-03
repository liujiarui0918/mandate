import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glob } from 'glob';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const constitutionSchema = ajv.compile(JSON.parse(readFileSync('spec/constitution.schema.json', 'utf8')));

test('every examples/*/.mandate/constitution/constitution.yaml validates', async () => {
  const files = await glob('examples/*/.mandate/constitution/constitution.yaml');
  assert.ok(files.length >= 1, 'at least one example must exist');
  for (const f of files) {
    const data = yaml.load(readFileSync(f, 'utf8'));
    const ok = constitutionSchema(data);
    assert.ok(ok, `${f}: ${JSON.stringify(constitutionSchema.errors)}`);
  }
});

test('every example has charter.md and a workspace/mandate.md', async () => {
  const dirs = await glob('examples/*/.mandate');
  for (const d of dirs) {
    assert.ok(readFileSync(`${d}/constitution/charter.md`, 'utf8').length > 0);
    assert.ok(readFileSync(`${d}/workspace/mandate.md`, 'utf8').length > 0);
  }
});
