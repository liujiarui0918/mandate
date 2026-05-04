import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('README.md and README.zh.md have heading-count parity', () => {
  const en = readFileSync('README.md', 'utf8');
  const zh = readFileSync('README.zh.md', 'utf8');
  const enH = (en.match(/^#+ /gm) || []).length;
  const zhH = (zh.match(/^#+ /gm) || []).length;
  assert.equal(enH, zhH, `README.md (${enH}) vs README.zh.md (${zhH})`);
});

test('README.md must mention Mandate slogan', () => {
  const en = readFileSync('README.md', 'utf8');
  assert.match(en, /Mandate of Heaven/i);
});

test('README.md must link to design SPEC', () => {
  const en = readFileSync('README.md', 'utf8');
  assert.match(en, /docs\/specs\/2026-05-01-mandate-design\.md/);
});
