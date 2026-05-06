import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTopology, proposeAutoMerges } from '../src/topology-check.mjs';

test('checkTopology: sibling-only DAG is valid', () => {
  const d = {
    mandate_id: 'm-001',
    groups: [
      { id: 'tech', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
      { id: 'biz', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
    ],
  };
  const r = checkTopology(d);
  assert.equal(r.valid, true);
  assert.equal(r.violations.length, 0);
  assert.equal(r.suggestedMerges.length, 0);
});

test('checkTopology: result_only cross-group dep is legal', () => {
  const d = {
    mandate_id: 'm-002',
    groups: [
      { id: 'tech', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
      { id: 'biz', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [{ from: 'tech', kind: 'result_only' }] },
    ],
  };
  const r = checkTopology(d);
  assert.equal(r.valid, true);
  assert.equal(r.violations.length, 0);
});

test('checkTopology: decision_affecting cross-group dep is a violation', () => {
  const d = {
    mandate_id: 'm-003',
    groups: [
      { id: 'tech', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
      { id: 'biz', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [{ from: 'tech', kind: 'decision_affecting' }] },
    ],
  };
  const r = checkTopology(d);
  assert.equal(r.valid, false);
  assert.equal(r.violations.length, 1);
  assert.deepEqual(r.violations[0], { from: 'tech', to: 'biz', kind: 'decision_affecting' });
  assert.equal(r.suggestedMerges.length, 1);
  assert.match(r.suggestedMerges[0], /merge_groups: \[biz, tech\] -> biz-and-tech/);
});

test('checkTopology: unknown group reference flagged', () => {
  const d = {
    mandate_id: 'm-004',
    groups: [
      { id: 'biz', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [{ from: 'ghost', kind: 'result_only' }] },
    ],
  };
  const r = checkTopology(d);
  assert.equal(r.valid, false);
  assert.equal(r.violations[0].reason, 'unknown_group');
});

test('checkTopology: invalid input returns error', () => {
  const r = checkTopology(null);
  assert.equal(r.valid, false);
  assert.ok(r.error);
});

test('proposeAutoMerges: deduplicates pairs', () => {
  const v = [
    { from: 'a', to: 'b', kind: 'decision_affecting' },
    { from: 'b', to: 'a', kind: 'decision_affecting' },
  ];
  const proposals = proposeAutoMerges(v);
  assert.equal(proposals.length, 1);
});
