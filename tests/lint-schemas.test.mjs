import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const constitutionSchema = JSON.parse(readFileSync('spec/constitution.schema.json', 'utf8'));
const hooksSchema = JSON.parse(readFileSync('spec/hooks.schema.json', 'utf8'));
const decompositionSchema = JSON.parse(readFileSync('spec/decomposition.schema.json', 'utf8'));
const reformSchema = JSON.parse(readFileSync('spec/reform.schema.json', 'utf8'));

const validateConstitution = ajv.compile(constitutionSchema);
const validateHooks = ajv.compile(hooksSchema);
const validateDecomposition = ajv.compile(decompositionSchema);
const validateReform = ajv.compile(reformSchema);

test('constitution.schema.json is valid Draft-07 JSON Schema', () => {
  assert.ok(validateConstitution, 'schema must compile');
});

test('constitution.schema.json: minimal valid example passes', () => {
  const example = {
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
      historian: { preferred: 'gpt-5.5', fallback: [] }
    },
    skill_resolution: {
      discovery_order: ['local', 'mandate-registry'],
      auto_assign: true
    }
  };
  const ok = validateConstitution(example);
  assert.ok(ok, JSON.stringify(validateConstitution.errors));
});

test('constitution.schema.json: missing required field fails', () => {
  const bad = { project: 'demo' };
  assert.equal(validateConstitution(bad), false);
});

test('hooks.schema.json: minimal valid example passes', () => {
  const example = {
    role: 'chancellor',
    zh: '宰相',
    hooks: {
      on_mandate_received: [
        {
          must: 'Refine mandate; produce decomposition.yaml',
          writes_to: 'workspace/decomposition.yaml',
          retry_policy: 'none'
        }
      ]
    }
  };
  assert.ok(validateHooks(example), JSON.stringify(validateHooks.errors));
});

test('hooks.schema.json: missing must field fails', () => {
  const bad = {
    role: 'chancellor',
    hooks: { on_x: [{ writes_to: 'foo' }] }
  };
  assert.equal(validateHooks(bad), false);
});

test('decomposition.schema.json: valid example with sibling-only deps passes', () => {
  const example = {
    mandate_id: 'm-001',
    groups: [
      { id: 'tech', goal: 'investigate technology', deadline: '2026-05-08', budget_tokens: 50000, deps: [] },
      { id: 'biz',  goal: 'investigate companies', deadline: '2026-05-08', budget_tokens: 50000, deps: [{ from: 'tech', kind: 'result_only' }] }
    ]
  };
  assert.ok(validateDecomposition(example), JSON.stringify(validateDecomposition.errors));
});

test('reform.schema.json: valid PR example passes', () => {
  const example = {
    pr_id: 'PR-001',
    title: 'Merge research and content groups',
    rationale: 'Detected parent-child dep across runs',
    diff_target: 'constitution.yaml',
    proposed_changes: [
      { op: 'merge_groups', from: ['research', 'content'], to: 'research-content' }
    ],
    status: 'pending'
  };
  assert.ok(validateReform(example), JSON.stringify(validateReform.errors));
});
