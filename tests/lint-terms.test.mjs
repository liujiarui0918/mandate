import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const REQUIRED_TERMS = [
  'emperor', 'chancellor', 'cto', 'scout', 'soldier',
  'secretary', 'censor', 'historian',
  'mandate', 'reform', 'chronicle', 'audit', 'ratify'
];

test('terms.yaml has all required role + action terms', () => {
  const raw = readFileSync('terms.yaml', 'utf8');
  const terms = yaml.load(raw);
  for (const key of REQUIRED_TERMS) {
    assert.ok(terms[key], `missing term: ${key}`);
    assert.ok(terms[key].zh, `term ${key} missing zh`);
    assert.ok(terms[key].en, `term ${key} missing en`);
  }
});

test('terms.yaml zh values are non-empty Chinese', () => {
  const terms = yaml.load(readFileSync('terms.yaml', 'utf8'));
  for (const [key, val] of Object.entries(terms)) {
    assert.match(val.zh, /[一-鿿]/, `${key}.zh should contain Chinese`);
  }
});
