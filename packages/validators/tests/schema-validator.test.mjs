import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConstitution, validateDecomposition, validateReform, validateHooks } from '../src/index.mjs';

const minimalConstitution = {
  version: '1.0.0',
  project: 'demo',
  language: 'both',
  topology: { enforce_no_parent_child: true, on_violation: 'hard_block' },
  censor: { default_tier: 'balanced' },
  historian: { reflection_period_days: 7, reflection_period_tasks: 50 },
  models: {
    chancellor: { preferred: 'gpt-5.5', fallback: ['gpt-5'] },
    cto: { preferred: 'claude-opus-4-7-1m', fallback: [] },
    scout: { preferred: 'gemini-3.1-pro', fallback: [] },
    soldier: { preferred: 'gpt-5.5', fallback: [] },
    secretary: { preferred: 'gemini-3.1-pro', fallback: [] },
    censor: { preferred: 'grok-4.3', fallback: [] },
    historian: { preferred: 'gpt-5.5', fallback: [] },
  },
  skill_resolution: { discovery_order: ['local'], auto_assign: true },
};

test('validateConstitution: minimal example passes', () => {
  const r = validateConstitution(minimalConstitution);
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});

test('validateConstitution: missing required field fails', () => {
  const r = validateConstitution({ project: 'demo' });
  assert.equal(r.valid, false);
  assert.ok(Array.isArray(r.errors));
});

test('validateDecomposition: sibling decomposition passes', () => {
  const d = {
    mandate_id: 'm-001',
    groups: [
      { id: 'tech', goal: 'g', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
    ],
  };
  const r = validateDecomposition(d);
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});

test('validateReform: PR-001 example passes', () => {
  const r = validateReform({
    pr_id: 'PR-001',
    title: 'Test reform PR',
    rationale: 'Detected pattern across runs',
    diff_target: 'constitution.yaml',
    proposed_changes: [{ op: 'merge_groups' }],
    status: 'pending',
  });
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});

test('validateHooks: minimal chancellor hook passes', () => {
  const h = {
    role: 'chancellor',
    hooks: { on_mandate_received: [{ must: 'do x', writes_to: 'a.md' }] },
  };
  const r = validateHooks(h);
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});
