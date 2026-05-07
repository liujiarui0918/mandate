import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalizer, buildDisplay, loadI18n } from '../src/i18n.mjs';

const sampleTerms = {
  emperor: { zh: '皇帝', en: 'emperor', latin: 'imperator' },
  chancellor: { zh: '宰相', en: 'chancellor', latin: 'cancellarius' },
  cto: { zh: '军师', en: 'cto', alias: 'strategist' },
  scout: { zh: '斥候', en: 'scout' },
};

test('canonicalize: maps zh form to canonical key', () => {
  const c = buildCanonicalizer(sampleTerms);
  assert.equal(c('宰相'), 'chancellor');
  assert.equal(c('皇帝'), 'emperor');
});

test('canonicalize: maps en form to canonical key (case-insensitive)', () => {
  const c = buildCanonicalizer(sampleTerms);
  assert.equal(c('chancellor'), 'chancellor');
  assert.equal(c('Chancellor'), 'chancellor');
  assert.equal(c('CHANCELLOR'), 'chancellor');
});

test('canonicalize: maps latin form to canonical key', () => {
  const c = buildCanonicalizer(sampleTerms);
  assert.equal(c('imperator'), 'emperor');
  assert.equal(c('cancellarius'), 'chancellor');
});

test('canonicalize: maps alias to canonical key', () => {
  const c = buildCanonicalizer(sampleTerms);
  assert.equal(c('strategist'), 'cto');
});

test('canonicalize: returns undefined for unknown input', () => {
  const c = buildCanonicalizer(sampleTerms);
  assert.equal(c('unknown'), undefined);
  assert.equal(c(null), undefined);
  assert.equal(c(undefined), undefined);
});

test('display: zh renders Chinese name', () => {
  const d = buildDisplay(sampleTerms);
  assert.equal(d('chancellor', 'zh'), '宰相');
});

test('display: en renders English name', () => {
  const d = buildDisplay(sampleTerms);
  assert.equal(d('chancellor', 'en'), 'chancellor');
});

test('display: both renders bilingual format', () => {
  const d = buildDisplay(sampleTerms);
  assert.equal(d('chancellor', 'both'), '宰相 (chancellor)');
});

test('display: unknown role returns the key as-is', () => {
  const d = buildDisplay(sampleTerms);
  assert.equal(d('unknown_role', 'both'), 'unknown_role');
});

test('loadI18n: loads repo-root terms.yaml when available', () => {
  let i18n;
  try {
    i18n = loadI18n();
  } catch {
    return; // skip when terms.yaml is not findable
  }
  assert.ok(i18n.terms);
  assert.ok(i18n.canonicalize);
  assert.ok(i18n.display);
  assert.equal(i18n.canonicalize('chancellor'), 'chancellor');
});
