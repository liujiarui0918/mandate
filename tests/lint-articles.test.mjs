import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glob } from 'glob';

test('every article has both en and zh siblings', async () => {
  const enFiles = await glob('docs/articles/*.en.md');
  const zhFiles = await glob('docs/articles/*.zh.md');
  const enBases = new Set(enFiles.map(f => f.replace(/\.en\.md$/, '')));
  const zhBases = new Set(zhFiles.map(f => f.replace(/\.zh\.md$/, '')));
  for (const b of enBases) assert.ok(zhBases.has(b), `${b}.en.md has no .zh.md sibling`);
  for (const b of zhBases) assert.ok(enBases.has(b), `${b}.zh.md has no .en.md sibling`);
});

test('every article has heading-count parity between en and zh', async () => {
  const enFiles = await glob('docs/articles/*.en.md');
  for (const enFile of enFiles) {
    const zhFile = enFile.replace(/\.en\.md$/, '.zh.md');
    const enHeadings = (readFileSync(enFile, 'utf8').match(/^#+ /gm) || []).length;
    const zhHeadings = (readFileSync(zhFile, 'utf8').match(/^#+ /gm) || []).length;
    assert.equal(enHeadings, zhHeadings, `${enFile} (${enHeadings}) vs ${zhFile} (${zhHeadings}) heading mismatch`);
  }
});
