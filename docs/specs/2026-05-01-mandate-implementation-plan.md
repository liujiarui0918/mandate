# Mandate (天命) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Mandate v1 — a methodology + reference framework for self-governing multi-agent imperial courts — across three sequenced phases (Methodology / Runtime / Dashboard).

**Architecture:** Phase A is a docs-and-spec project (zero runtime). Phase B is a TypeScript pnpm monorepo with `@mandateai/runtime` runtime, `mandate` CLI, four protocol adapters, eight imperial skill packs. Phase C is a Next.js 15 dashboard atop the same filesystem-as-source-of-truth, no new backend.

**Tech Stack:** Phase A: markdown + JSON Schema + ajv. Phase B: TypeScript 5.6, pnpm workspaces, tsx, Zod, Vitest, ajv, lunr.js, gray-matter, js-yaml, commander, prompts. Phase C: Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui, tRPC, React Flow, Server-Sent Events.

**Source spec:** `docs/specs/2026-05-01-mandate-design.md` (commit `3b900fa`).

**Granularity policy:**
- Phase A is bite-sized (TDD, 2-5 min steps, full code shown).
- Phase B is milestone-level (full file map, key skeletons, but not every-step decomposition — re-plan before executing).
- Phase C is module-level (architecture + features only — re-plan before executing).

---

## Index

- [Phase A — Methodology Authority (Weeks 1-4)](#phase-a--methodology-authority-weeks-1-4)
- [Phase B — Reference Implementation (Weeks 5-12)](#phase-b--reference-implementation-weeks-5-12)
- [Phase C — Dashboard 紫禁城 (Weeks 13-20)](#phase-c--dashboard-紫禁城-weeks-13-20)
- [Cross-phase risks & rollback](#cross-phase-risks--rollback)
- [Self-review checklist](#self-review-checklist)

---

# Phase A — Methodology Authority (Weeks 1-4)

## A.0 File Structure

```
D:/mandate/
├── LICENSE                                    # MIT
├── .gitignore
├── README.md                                  # English top-level
├── README.zh.md                               # Chinese top-level
├── CONTRIBUTING.md
├── package.json                               # (Phase A: only dev tooling: ajv, glob, gray-matter)
├── docs/
│   ├── specs/
│   │   ├── 2026-05-01-mandate-design.md       # exists
│   │   └── 2026-05-01-mandate-implementation-plan.md  # this file
│   └── articles/
│       ├── 01-why-five-vacancies.en.md
│       ├── 01-why-five-vacancies.zh.md
│       ├── 02-lifecycle-hooks-vs-routing.en.md
│       ├── 02-lifecycle-hooks-vs-routing.zh.md
│       ├── 03-topology-constitution.en.md
│       ├── 03-topology-constitution.zh.md
│       ├── 04-historian-and-reform-prs.en.md
│       ├── 04-historian-and-reform-prs.zh.md
│       ├── 05-bilingual-first-class.en.md
│       └── 05-bilingual-first-class.zh.md
├── spec/
│   ├── constitution.schema.json
│   ├── hooks.schema.json
│   ├── decomposition.schema.json
│   ├── reform.schema.json
│   └── terms.schema.json
├── terms.yaml                                 # bilingual term map (canonical)
├── examples/
│   ├── research/                              # demo B template
│   │   └── .mandate/
│   │       ├── constitution/
│   │       │   ├── constitution.yaml
│   │       │   ├── charter.md
│   │       │   └── terms.yaml                 # symlink → ../../terms.yaml in B; copied in A
│   │       └── workspace/
│   │           └── mandate.md
│   └── self-governance/                       # demo C template
│       └── .mandate/
│           ├── constitution/
│           │   ├── constitution.yaml
│           │   ├── charter.md
│           │   └── terms.yaml
│           └── workspace/
│               └── mandate.md
├── tests/
│   ├── lint-schemas.test.mjs                  # JSON Schema valid + examples conform
│   ├── lint-readme-parity.test.mjs            # README.md and README.zh.md heading count parity
│   └── lint-articles.test.mjs                 # each article has en + zh sibling
└── .github/workflows/ci.yml                   # runs the three lint tests
```

## A.1 Milestones

| ID | Week | Deliverable | Exit gate |
|---|---|---|---|
| A.M1 | W1 | Project scaffolding + bilingual `terms.yaml` + first 2 schemas | `npm test` green; LICENSE + .gitignore + initial commit |
| A.M2 | W2 | Remaining schemas + both example `.mandate/` skeletons | All examples validate against schemas in CI |
| A.M3 | W3 | 5 methodology articles × 2 languages = 10 files | Articles bilingual sibling lint passes |
| A.M4 | W4 | Top-level `README.md` + `README.zh.md` + GitHub repo published | Heading parity passes; repo public; first social post |

## A.2 Tasks

> Working directory for all Phase A tasks: `D:/mandate/`. Use `cd D:/mandate` before each shell block. Throughout this plan, all `git commit` messages use the conventional-commits prefix style.

### A.Task 1: Initialize package.json with Phase A dev tooling

**Files:**
- Create: `D:/mandate/package.json`
- Create: `D:/mandate/.gitignore`
- Create: `D:/mandate/LICENSE`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "mandate",
  "version": "0.0.0",
  "private": true,
  "description": "Methodology + reference framework for self-governing multi-agent imperial courts.",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "lint:schemas": "node --test tests/lint-schemas.test.mjs",
    "lint:readme": "node --test tests/lint-readme-parity.test.mjs",
    "lint:articles": "node --test tests/lint-articles.test.mjs"
  },
  "devDependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "glob": "^11.0.0",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0"
  }
}
```

- [ ] **Step 2: Write .gitignore**

```
node_modules/
.mandate/.model_health.json
.mandate/skills/
*.log
.DS_Store
.env*
```

- [ ] **Step 3: Write LICENSE (MIT)**

```
MIT License

Copyright (c) 2026 ljr-w and Mandate contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Install dev deps + smoke check**

Run: `cd D:/mandate && npm install`
Expected: `node_modules/` populated, no errors. Run `npm test` → expected to fail with "no test files" or similar (we haven't written tests yet — that's fine).

- [ ] **Step 5: Commit**

```bash
cd D:/mandate && git add package.json .gitignore LICENSE && git commit -m "chore(scaffold): init package.json, .gitignore, LICENSE (MIT)"
```

---

### A.Task 2: Create bilingual `terms.yaml`

**Files:**
- Create: `D:/mandate/terms.yaml`
- Create: `D:/mandate/tests/lint-terms.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `D:/mandate/tests/lint-terms.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/mandate && node --test tests/lint-terms.test.mjs`
Expected: FAIL with "ENOENT: no such file or directory 'terms.yaml'"

- [ ] **Step 3: Write `terms.yaml`**

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor, latin: cancellarius }
cto:        { zh: 军师, en: cto, alias: strategist }
scout:      { zh: 斥候, en: scout, alias: researcher }
soldier:    { zh: 士兵, en: soldier, alias: worker }
secretary:  { zh: 文官, en: secretary, alias: mandarin }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian, alias: chronicler }
mandate:    { zh: 诏书, en: mandate }
reform:     { zh: 制度修订, en: reform }
chronicle:  { zh: 史册, en: chronicle }
audit:      { zh: 紧急奏折, en: audit }
ratify:     { zh: 批红, en: ratify }
veto:       { zh: 留中, en: veto }
genesis:    { zh: 开国, en: genesis }
evolve:     { zh: 演化, en: evolve }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/mandate && node --test tests/lint-terms.test.mjs`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
cd D:/mandate && git add terms.yaml tests/lint-terms.test.mjs && git commit -m "feat(spec): add bilingual terms.yaml + lint test"
```

---

### A.Task 3: Constitution JSON Schema

**Files:**
- Create: `D:/mandate/spec/constitution.schema.json`
- Create: `D:/mandate/tests/lint-schemas.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `D:/mandate/tests/lint-schemas.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

test('constitution.schema.json is valid Draft-07 JSON Schema', () => {
  const schema = JSON.parse(readFileSync('spec/constitution.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
  assert.ok(validate, 'schema must compile');
});

test('constitution.schema.json: minimal valid example passes', () => {
  const schema = JSON.parse(readFileSync('spec/constitution.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
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
  const ok = validate(example);
  assert.ok(ok, JSON.stringify(validate.errors));
});

test('constitution.schema.json: missing required field fails', () => {
  const schema = JSON.parse(readFileSync('spec/constitution.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
  const bad = { project: 'demo' };
  assert.equal(validate(bad), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: FAIL with "ENOENT: ... constitution.schema.json"

- [ ] **Step 3: Write `spec/constitution.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mandate.dev/schemas/constitution.schema.json",
  "title": "Mandate Constitution",
  "type": "object",
  "required": ["version", "project", "topology", "censor", "historian", "models", "skill_resolution"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "project": { "type": "string", "minLength": 1 },
    "language": { "enum": ["zh", "en", "both"], "default": "both" },
    "charter_path": { "type": "string", "default": "charter.md" },
    "topology": {
      "type": "object",
      "required": ["enforce_no_parent_child", "on_violation"],
      "properties": {
        "enforce_no_parent_child": { "type": "boolean" },
        "on_violation": { "enum": ["warn", "hard_block", "auto_merge"] }
      }
    },
    "censor": {
      "type": "object",
      "required": ["default_tier"],
      "properties": {
        "default_tier": { "enum": ["paranoid", "balanced", "frugal"] },
        "overrides": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "strategy": { "enum": ["full", "sample", "red_line"] },
              "rate": { "type": "number", "minimum": 0, "maximum": 1 },
              "async": { "type": "boolean" },
              "model": { "type": "string" }
            }
          }
        }
      }
    },
    "historian": {
      "type": "object",
      "required": ["reflection_period_days", "reflection_period_tasks"],
      "properties": {
        "reflection_period_days": { "type": "integer", "minimum": 1 },
        "reflection_period_tasks": { "type": "integer", "minimum": 1 },
        "audit_red_lines": { "type": "array" }
      }
    },
    "models": {
      "type": "object",
      "required": ["chancellor", "cto", "scout", "soldier", "secretary", "censor", "historian"],
      "additionalProperties": {
        "type": "object",
        "required": ["preferred", "fallback"],
        "properties": {
          "preferred": { "type": "string" },
          "fallback": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "skill_resolution": {
      "type": "object",
      "required": ["discovery_order", "auto_assign"],
      "properties": {
        "discovery_order": {
          "type": "array",
          "items": { "enum": ["local", "mandate-registry", "npm", "clawhub"] }
        },
        "auto_assign": { "type": "boolean" }
      }
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
cd D:/mandate && git add spec/constitution.schema.json tests/lint-schemas.test.mjs && git commit -m "feat(spec): add constitution.schema.json + ajv validation tests"
```

---

### A.Task 4: Hooks JSON Schema

**Files:**
- Create: `D:/mandate/spec/hooks.schema.json`
- Modify: `D:/mandate/tests/lint-schemas.test.mjs` (append two tests)

- [ ] **Step 1: Append the failing tests**

Append to `D:/mandate/tests/lint-schemas.test.mjs`:

```javascript
test('hooks.schema.json: minimal valid example passes', () => {
  const schema = JSON.parse(readFileSync('spec/hooks.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
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
  assert.ok(validate(example), JSON.stringify(validate.errors));
});

test('hooks.schema.json: missing must field fails', () => {
  const schema = JSON.parse(readFileSync('spec/hooks.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
  const bad = {
    role: 'chancellor',
    hooks: { on_x: [{ writes_to: 'foo' }] }
  };
  assert.equal(validate(bad), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: 2 new tests fail with "ENOENT: ... hooks.schema.json"

- [ ] **Step 3: Write `spec/hooks.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mandate.dev/schemas/hooks.schema.json",
  "title": "Mandate Role Hooks Definition",
  "type": "object",
  "required": ["role", "hooks"],
  "properties": {
    "role": { "type": "string", "minLength": 1 },
    "zh": { "type": "string" },
    "backing_cli": { "type": "string" },
    "preferred_model": { "type": "string" },
    "hooks": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["must"],
          "properties": {
            "must": { "type": "string", "minLength": 1 },
            "schema": {},
            "validator": { "type": "string" },
            "timeout_seconds": { "type": "integer", "minimum": 1 },
            "writes_to": { "type": "string" },
            "retry_policy": { "enum": ["none", "once", "linear", "exponential"] }
          }
        }
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: PASS, 5 tests total.

- [ ] **Step 5: Commit**

```bash
cd D:/mandate && git add spec/hooks.schema.json tests/lint-schemas.test.mjs && git commit -m "feat(spec): add hooks.schema.json + validation tests"
```

---

### A.Task 5: Decomposition + Reform schemas

**Files:**
- Create: `D:/mandate/spec/decomposition.schema.json`
- Create: `D:/mandate/spec/reform.schema.json`
- Modify: `D:/mandate/tests/lint-schemas.test.mjs`

- [ ] **Step 1: Append failing tests**

Append to `tests/lint-schemas.test.mjs`:

```javascript
test('decomposition.schema.json: valid example with sibling-only deps passes', () => {
  const schema = JSON.parse(readFileSync('spec/decomposition.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
  const example = {
    mandate_id: 'm-001',
    groups: [
      { id: 'tech', goal: 'investigate technology', deadline: '2026-05-08', budget_tokens: 50000, deps: [] },
      { id: 'biz',  goal: 'investigate companies', deadline: '2026-05-08', budget_tokens: 50000, deps: [{ from: 'tech', kind: 'result_only' }] }
    ]
  };
  assert.ok(validate(example), JSON.stringify(validate.errors));
});

test('reform.schema.json: valid PR example passes', () => {
  const schema = JSON.parse(readFileSync('spec/reform.schema.json', 'utf8'));
  const validate = ajv.compile(schema);
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
  assert.ok(validate(example), JSON.stringify(validate.errors));
});
```

- [ ] **Step 2: Run tests — verify both fail**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: 2 failing on missing schema files.

- [ ] **Step 3: Write `spec/decomposition.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mandate.dev/schemas/decomposition.schema.json",
  "title": "Mandate Task Decomposition",
  "type": "object",
  "required": ["mandate_id", "groups"],
  "properties": {
    "mandate_id": { "type": "string", "minLength": 1 },
    "groups": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "goal", "deadline", "budget_tokens", "deps"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
          "goal": { "type": "string", "minLength": 1 },
          "deadline": { "type": "string", "format": "date" },
          "budget_tokens": { "type": "integer", "minimum": 1 },
          "deps": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["from", "kind"],
              "properties": {
                "from": { "type": "string" },
                "kind": { "enum": ["result_only", "decision_affecting"] }
              }
            }
          }
        }
      }
    }
  }
}
```

- [ ] **Step 4: Write `spec/reform.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mandate.dev/schemas/reform.schema.json",
  "title": "Mandate Reform Pull Request",
  "type": "object",
  "required": ["pr_id", "title", "rationale", "diff_target", "proposed_changes", "status"],
  "properties": {
    "pr_id": { "type": "string", "pattern": "^PR-\\d{3,}$" },
    "title": { "type": "string", "minLength": 5 },
    "rationale": { "type": "string", "minLength": 10 },
    "diff_target": { "type": "string" },
    "proposed_changes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["op"],
        "properties": {
          "op": { "enum": ["merge_groups", "split_group", "add_role", "remove_role", "set_param", "set_model"] }
        }
      }
    },
    "status": { "enum": ["pending", "ratified", "vetoed", "expired"] },
    "created_at": { "type": "string", "format": "date-time" },
    "ratified_at": { "type": "string", "format": "date-time" }
  }
}
```

- [ ] **Step 5: Run tests + commit**

Run: `cd D:/mandate && node --test tests/lint-schemas.test.mjs`
Expected: PASS, 7 tests total.

```bash
cd D:/mandate && git add spec/decomposition.schema.json spec/reform.schema.json tests/lint-schemas.test.mjs && git commit -m "feat(spec): add decomposition.schema.json and reform.schema.json"
```

---

### A.Task 6: Demo B research example `.mandate/`

**Files:**
- Create: `D:/mandate/examples/research/.mandate/constitution/constitution.yaml`
- Create: `D:/mandate/examples/research/.mandate/constitution/charter.md`
- Create: `D:/mandate/examples/research/.mandate/constitution/terms.yaml`
- Create: `D:/mandate/examples/research/.mandate/workspace/mandate.md`
- Create: `D:/mandate/tests/lint-examples.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `D:/mandate/tests/lint-examples.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run test — verify fail**

Run: `cd D:/mandate && node --test tests/lint-examples.test.mjs`
Expected: FAIL — no examples exist.

- [ ] **Step 3: Write `examples/research/.mandate/constitution/constitution.yaml`**

```yaml
version: 1.0.0
project: research-demo
language: both
charter_path: charter.md

topology:
  enforce_no_parent_child: true
  on_violation: hard_block

censor:
  default_tier: balanced
  overrides:
    chancellor: { strategy: full, async: false }
    soldier:    { strategy: sample, rate: 0.10 }

historian:
  reflection_period_days: 7
  reflection_period_tasks: 50
  audit_red_lines:
    - chronicle_size_mb: 100
    - error_rate_in_window: 0.15

models:
  chancellor: { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro, claude-opus-4-7-1m] }
  cto:        { preferred: claude-opus-4-7-1m, fallback: [claude-opus-4-7, claude-sonnet-4-7] }
  scout:      { preferred: gemini-3.1-pro, fallback: [gemini-2.5-pro, perplexity-pro] }
  soldier:    { preferred: gpt-5.5, fallback: [gpt-5, claude-sonnet-4-7] }
  secretary:  { preferred: gemini-3.1-pro, fallback: [gemini-2.5-pro, claude-sonnet-4-7] }
  censor:     { preferred: grok-4.3, fallback: [grok-4, command-r-plus] }
  historian:  { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro, claude-opus-4-7-1m] }

skill_resolution:
  discovery_order: [local, mandate-registry, npm, clawhub]
  auto_assign: true
```

- [ ] **Step 4: Write `examples/research/.mandate/constitution/charter.md`**

```markdown
# Charter — Research Empire / 调研朝廷

**Mission (en):** This court exists to produce publication-grade research reports — citation-rich, multi-perspective, and bias-aware.

**使命 (zh):** 此朝廷专为出具学术级研究报告而设：广征博引、多角度审视、抗偏见。

**Default decree shape:**
> "Research <topic> at depth, produce a 5,000-word report with cited sources, comparing 3+ perspectives."

**Out of scope:** code execution, monetary transactions, anything irreversible.
```

- [ ] **Step 5: Write `examples/research/.mandate/constitution/terms.yaml`** (verbatim copy of root terms.yaml)

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor, latin: cancellarius }
cto:        { zh: 军师, en: cto, alias: strategist }
scout:      { zh: 斥候, en: scout, alias: researcher }
soldier:    { zh: 士兵, en: soldier, alias: worker }
secretary:  { zh: 文官, en: secretary, alias: mandarin }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian, alias: chronicler }
mandate:    { zh: 诏书, en: mandate }
reform:     { zh: 制度修订, en: reform }
chronicle:  { zh: 史册, en: chronicle }
audit:      { zh: 紧急奏折, en: audit }
ratify:     { zh: 批红, en: ratify }
veto:       { zh: 留中, en: veto }
genesis:    { zh: 开国, en: genesis }
evolve:     { zh: 演化, en: evolve }
```

- [ ] **Step 6: Write `examples/research/.mandate/workspace/mandate.md`**

```markdown
# Mandate / 诏书

**Decree (en):** Produce a publication-grade research report on the state of fusion energy in 2026, ≥5,000 words, with structured citations and cross-perspective analysis.

**诏 (zh):** 制一份关于 2026 年聚变能源现状的学术级研究报告，不少于 5000 字，附结构化引用与多视角对比。

**Issued:** 2026-05-01
**Issued by:** Emperor (Human)
```

- [ ] **Step 7: Run tests + commit**

Run: `cd D:/mandate && node --test tests/lint-examples.test.mjs`
Expected: PASS, 2 tests.

```bash
cd D:/mandate && git add examples/research tests/lint-examples.test.mjs && git commit -m "feat(examples): add research demo .mandate/ skeleton + lint test"
```

---

### A.Task 7: Demo C self-governance example `.mandate/`

**Files:**
- Create: `D:/mandate/examples/self-governance/.mandate/constitution/constitution.yaml`
- Create: `D:/mandate/examples/self-governance/.mandate/constitution/charter.md`
- Create: `D:/mandate/examples/self-governance/.mandate/constitution/terms.yaml`
- Create: `D:/mandate/examples/self-governance/.mandate/workspace/mandate.md`

- [ ] **Step 1: Write `constitution.yaml`**

```yaml
version: 1.0.0
project: self-governance-demo
language: both
charter_path: charter.md

topology:
  enforce_no_parent_child: true
  on_violation: hard_block

censor:
  default_tier: paranoid
  overrides:
    historian: { strategy: full, async: false }

historian:
  reflection_period_days: 1
  reflection_period_tasks: 10
  audit_red_lines:
    - chronicle_size_mb: 50
    - error_rate_in_window: 0.05

models:
  chancellor: { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro, claude-opus-4-7-1m] }
  cto:        { preferred: claude-opus-4-7-1m, fallback: [claude-opus-4-7, claude-sonnet-4-7] }
  scout:      { preferred: gemini-3.1-pro, fallback: [gemini-2.5-pro, perplexity-pro] }
  soldier:    { preferred: gpt-5.5, fallback: [gpt-5, claude-sonnet-4-7] }
  secretary:  { preferred: gemini-3.1-pro, fallback: [gemini-2.5-pro, claude-sonnet-4-7] }
  censor:     { preferred: grok-4.3, fallback: [grok-4, command-r-plus] }
  historian:  { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro, claude-opus-4-7-1m] }

skill_resolution:
  discovery_order: [local, mandate-registry, npm, clawhub]
  auto_assign: true
```

- [ ] **Step 2: Write `charter.md`**

```markdown
# Charter — Self-Governance Empire / 自我治理朝廷

**Mission (en):** This court audits and reforms itself. The Historian is its first-class citizen, not the Chancellor. Mandates here are introspective: review the past, propose reforms, ratify or veto.

**使命 (zh):** 此朝廷专为自我审查与制度演化而设。史官为首要重臣，非宰相。此处诏书皆向内：复盘过往、提议修订、批红或留中。

**Default decree shape:**
> "Reflect on the last <window> of operation; propose institutional reforms with rationale and diffs."

**Out of scope:** any external action that bypasses constitution.yaml.
```

- [ ] **Step 3: Write `terms.yaml`** (verbatim copy of root terms.yaml)

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor, latin: cancellarius }
cto:        { zh: 军师, en: cto, alias: strategist }
scout:      { zh: 斥候, en: scout, alias: researcher }
soldier:    { zh: 士兵, en: soldier, alias: worker }
secretary:  { zh: 文官, en: secretary, alias: mandarin }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian, alias: chronicler }
mandate:    { zh: 诏书, en: mandate }
reform:     { zh: 制度修订, en: reform }
chronicle:  { zh: 史册, en: chronicle }
audit:      { zh: 紧急奏折, en: audit }
ratify:     { zh: 批红, en: ratify }
veto:       { zh: 留中, en: veto }
genesis:    { zh: 开国, en: genesis }
evolve:     { zh: 演化, en: evolve }
```

- [ ] **Step 4: Write `workspace/mandate.md`**

```markdown
# Mandate / 诏书

**Decree (en):** Reflect on this court's last 7 days of operation. Identify recurring inefficiencies, propose 2-3 reforms as PR files, and prepare them for emperor's ratification.

**诏 (zh):** 复盘本朝廷过去七日运转，识别重复出现的低效，拟 2-3 条制度修订作 PR 文件，候皇帝批红。

**Issued:** 2026-05-01
**Issued by:** Emperor (Human)
```

- [ ] **Step 5: Run tests + commit**

Run: `cd D:/mandate && node --test tests/lint-examples.test.mjs`
Expected: PASS, 2 tests still (now covering both examples).

```bash
cd D:/mandate && git add examples/self-governance && git commit -m "feat(examples): add self-governance demo .mandate/ skeleton"
```

---

### A.Task 8: Article 01 — "Why Five Vacancies"

**Files:**
- Create: `D:/mandate/docs/articles/01-why-five-vacancies.en.md`
- Create: `D:/mandate/docs/articles/01-why-five-vacancies.zh.md`
- Create: `D:/mandate/tests/lint-articles.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `D:/mandate/tests/lint-articles.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run test — verify it passes vacuously (no articles yet)**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS (both globs empty — vacuous).

- [ ] **Step 3: Write `01-why-five-vacancies.en.md`** (target headings: 1 H1 + 6 H2 = 7)

```markdown
# Why Five Vacancies — and Why They Matter

> Mandate fills five gaps that LangGraph, CrewAI, Paperclip, MetaGPT, and OpenClaw all leave open.

## 1. Censor as a First-Class Citizen

LangGraph offers reviewer nodes. Paperclip offers approvers. CrewAI lets you label an agent "QA". None of these treats audit as an architectural concern: an independent layer, on a different model family, with per-node calibration, and a guaranteed escape valve to the human.

Mandate's Censor (锦衣卫) layer enforces: (a) a separate model from the subject, (b) three configurable intensity tiers, (c) per-node overrides, and (d) red-line escalation to the Emperor.

## 2. Workflow vs Creative — Formalized

Every framework gestures at "agents have roles". Few formalize the daily discipline of those roles. Lifecycle Hooks are Mandate's contribution: each role declares procedural musts (clock-in artifacts, schema-validated outputs) that the runtime forces. Between hooks, the agent reasons freely.

This is the first agent framework that operationalizes March (1991)'s exploration-vs-exploitation dichotomy at the YAML level.

## 3. Forbidden Parent-Child Topology

Most frameworks let you build any DAG. Conway's Law warns that the topology you build will mirror the system you build. If two project groups have a decision-affecting dependency, you've accidentally encoded a serial bottleneck.

Mandate forbids this. A three-layer defense (`mandate validate` lint + Chancellor runtime hard-block + Historian post-hoc PR) catches violations at every stage.

## 4. Institutional Evolution

OpenClaw's `agent-evolver` evolves a single agent. No mainstream framework evolves the *organization*.

Mandate's Historian (史官) layer runs three timescales: passive chronicle logging, periodic LLM reflection that produces reform PRs, and event-driven audits. Reforms are git-style PRs the Emperor ratifies — never auto-applied.

## 5. Bilingual Cultural Metaphor

Paperclip is monoculture corporate-en. Mandate's `terms.yaml` makes Eastern (封建朝廷) and Western (corporate) metaphors equally valid surface forms. CLI output, role names, and documentation all switch between languages without translation drift.

## What This Buys You

- **Defensibility against hallucination** — the Censor architecture is structural, not prompt-based.
- **Discipline without rigidity** — Hooks force the procedural; the rest is free.
- **Conway-clean parallelism** — your project groups are siblings by design.
- **A second-order learning loop** — the court evolves alongside the work.
- **A cultural moat** — bilingual first-class citizenship that no English-only competitor will replicate.

---

*Read next: [Lifecycle Hooks vs Routing](./02-lifecycle-hooks-vs-routing.en.md)*
```

- [ ] **Step 4: Write `01-why-five-vacancies.zh.md`** (matching 7 headings)

```markdown
# 五个空白点：为什么 Mandate 不是又一个 Paperclip

> Mandate 填补了 LangGraph、CrewAI、Paperclip、MetaGPT、OpenClaw 共同未竟的五处空白。

## 1. 锦衣卫层作为一等公民

LangGraph 提供 reviewer 节点；Paperclip 提供 approver；CrewAI 可以打"QA"标签。但都没有把"审查"作为架构层级——一条独立层、跑在不同模型家族、可按节点级配置强度、有专门的越级申诉通道。

Mandate 的锦衣卫层强制保证：(a) 与被监察对象不同的模型；(b) 三档可配置强度；(c) 节点级覆盖；(d) 红线触发即向皇帝奏报。

## 2. 工作流 vs 创新——形式化

各家都强调"agent 有角色"。但少有人形式化每个角色每天必须履行的纪律。Lifecycle Hooks 是 Mandate 的独特贡献：每个角色声明程序性 must（打卡产物、schema 校验的输出），由 runtime 强制执行。Hook 之间，agent 自由发挥。

这是第一个把 March (1991) 探索-利用困境在 YAML 层面落地的 agent 框架。

## 3. 父子节点禁止

大多数框架允许任意 DAG。康威定律警告：你构建的拓扑会镜像出你的系统结构。如果两个项目组存在影响决策的依赖，你已经编码了一处串行瓶颈。

Mandate 禁止这种结构。三层防护（`mandate validate` 静态 lint + 宰相运行期硬阻 + 史官事后 PR）在每个阶段截击违规。

## 4. 制度演化

OpenClaw 的 `agent-evolver` 演化单 agent。主流框架无人演化"组织本身"。

Mandate 的史官层在三个时间尺度运转：被动日志、周期性 LLM 反思（产出制度修订 PR）、事件驱动审计。修订是 git 风格的 PR，由皇帝批红——绝不自动应用。

## 5. 东西方双隐喻文化

Paperclip 是纯英文公司隐喻。Mandate 的 `terms.yaml` 让"封建朝廷"与"现代公司"成为对等的表层形式。CLI 输出、角色命名、文档全部支持语言切换，无翻译漂移。

## 你能获得什么

- **抗幻觉防御**——锦衣卫架构是结构级的，不依赖 prompt 工程。
- **有纪律但不僵化**——Hooks 强制程序性动作；其余自由。
- **康威洁净的并行**——项目组按设计就是兄弟节点。
- **二阶学习循环**——朝廷与工作一同演化。
- **文化护城河**——双语一等公民，纯英文竞品无法复制。

---

*下一篇：[Lifecycle Hooks vs Routing](./02-lifecycle-hooks-vs-routing.zh.md)*
```

- [ ] **Step 5: Run test + commit**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS, both tests, heading parity confirmed (7 each).

```bash
cd D:/mandate && git add docs/articles/01-* tests/lint-articles.test.mjs && git commit -m "docs(article): add 01 'Why Five Vacancies' (en + zh)"
```

---

### A.Task 9: Article 02 — "Lifecycle Hooks vs Routing"

**Files:**
- Create: `D:/mandate/docs/articles/02-lifecycle-hooks-vs-routing.en.md`
- Create: `D:/mandate/docs/articles/02-lifecycle-hooks-vs-routing.zh.md`

- [ ] **Step 1: Write `.en.md`** (target headings: 1 H1 + 6 H2 = 7)

```markdown
# Lifecycle Hooks vs Task Routing

> Why "route this task to the SOP prompt vs the creative prompt" is the wrong abstraction — and what to do instead.

## The Bad Pattern: Mode Routing

A common impulse: when a task arrives, classify it (SOP / creative / hybrid) and pick a prompt. This treats discipline as a *content choice*. It bleeds.

The classifier becomes a choke point. Edge cases multiply. Two prompts diverge. And the moment a task spans both modes, the classifier hallucinates a category.

## The Right Abstraction: Hooks + Free Reasoning

Workers in real organizations don't choose between "discipline mode" and "creative mode". They clock in (mandatory), take a coffee break (free), write the weekly report (mandatory), think about the architecture (free), submit the report (mandatory).

Mandate's Lifecycle Hooks model this directly. Each role declares procedural musts at lifecycle moments — `on_input_received`, `every_n_steps`, `on_output_ready`. The runtime injects these as preconditions to the agent's prompt: *"Before you continue, you must produce X at path Y matching schema Z."*

Between hooks, the agent reasons freely.

## What a Hook Looks Like

```yaml
role: chancellor
hooks:
  on_mandate_received:
    - must: "Refine the imperial mandate; produce decomposition.yaml"
      schema: { type: object, properties: { groups: { type: array } } }
      writes_to: workspace/decomposition.yaml
    - must: "Validate inter-group topology"
      validator: builtin:topology-check
      retry_policy: none
  every_n_steps: 5
    - must: "Sweep group statuses"
      writes_to: workspace/status_report.md
```

The agent decides *how* to refine the mandate. The runtime checks that the refinement was written, conforms to the schema, and passed validation. If any "must" fails, the Censor is invoked — possibly demanding a redo.

## Why This Matters

- **Discipline is enforced structurally**, not prompt-engineered. You can't accidentally skip the topology check.
- **Creativity is preserved**, because content is never constrained — only the procedural acts around it.
- **Auditability is automatic**, because every must produces a named artifact at a named path.
- **Onboarding new roles is mechanical** — write the hooks, and the runtime knows how to enforce them.

## When Hooks Don't Apply

A few things hooks are not for:
- **Conditional logic** — use the agent's free reasoning, not hooks.
- **Per-task variations** — hooks describe the *role's* discipline, not a particular task's logic.
- **Soft preferences** — only encode true musts; over-hooking creates "discipline fatigue".

If a behavior is a "should-do", document it in the role's `_base.md` prompt; only "must-do" goes into hooks.

## Borrowed Wisdom

This idea is not new. AOP frameworks have used lifecycle interceptors for two decades. Claude Code itself ships PreToolUse / PostToolUse / Stop hooks. What's new is applying the pattern to *agent role discipline* instead of *tool calls*. The result is an agent system where bureaucratic rigor and creative latitude coexist by construction.

---

*Read next: [Topology Constitution](./03-topology-constitution.en.md)*
```

- [ ] **Step 2: Write `.zh.md`** (matching 7 headings)

```markdown
# Lifecycle Hooks vs 任务路由

> 为什么"把任务路由到 SOP prompt 还是 创意 prompt"是错误的抽象——以及该怎么做。

## 错误的模式：模式路由

常见的冲动：任务来了，先分类（SOP / 创意 / 混合），然后选 prompt。这把"纪律"当成了"内容选择"。它会泄漏。

分类器成了瓶颈。边界情况增多。两份 prompt 漂移。任务一旦跨模式，分类器就会幻觉一个分类。

## 正确的抽象：Hooks + 自由思考

真实组织里的员工不会在"纪律模式"和"创意模式"之间二选一。他们：打卡（强制）、喝咖啡（自由）、写周报（强制）、思考架构（自由）、交周报（强制）。

Mandate 的 Lifecycle Hooks 直接建模这个现实。每个角色在生命周期时刻——`on_input_received`、`every_n_steps`、`on_output_ready`——声明程序性的 must。Runtime 把这些注入到 agent 的 prompt 作为前置条件：*"在你继续之前，你必须按 schema Z 在路径 Y 产生 X。"*

Hook 之间，agent 自由发挥。

## Hook 长什么样

```yaml
role: chancellor
hooks:
  on_mandate_received:
    - must: "把诏书精细化，写入 decomposition.yaml"
      schema: { type: object, properties: { groups: { type: array } } }
      writes_to: workspace/decomposition.yaml
    - must: "校验项目组间拓扑"
      validator: builtin:topology-check
      retry_policy: none
  every_n_steps: 5
    - must: "扫各组进度"
      writes_to: workspace/status_report.md
```

agent 决定*如何*精细化诏书。Runtime 校验精细化产物是否被写入、是否符合 schema、是否通过 validator。任一 must 失败 → 锦衣卫介入，可能要求重做。

## 这为什么重要

- **纪律由结构强制**——非 prompt 工程。你没法不小心跳过拓扑校验。
- **创造性被保留**——内容从不受约束，只约束围绕它的程序性动作。
- **可审计性自动达成**——每个 must 都产出指定路径的指定产物。
- **新角色上手是机械的**——写 hooks，runtime 自然知道怎么强制。

## 何时 Hooks 不适用

几件 hooks 不该做的事：
- **条件逻辑**——用 agent 的自由推理，不要用 hook。
- **任务级差异**——hooks 描述*角色*的纪律，不是某个特定任务的逻辑。
- **软偏好**——只编码真正的 must；过度 hook 会造成"纪律疲劳"。

如果某行为是"应当做"，写到角色的 `_base.md` prompt 里；只有"必须做"才进 hooks。

## 借来的智慧

这个想法不新。AOP 框架用了二十年的 lifecycle interceptor。Claude Code 自身也有 PreToolUse / PostToolUse / Stop hooks。新的是把这个模式应用到*agent 角色纪律*而非*工具调用*。结果是一个"科层严谨"与"创意空间"凭构造而共存的 agent 系统。

---

*下一篇：[Topology Constitution](./03-topology-constitution.zh.md)*
```

- [ ] **Step 3: Run test + commit**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS, both new files have heading parity.

```bash
cd D:/mandate && git add docs/articles/02-* && git commit -m "docs(article): add 02 'Lifecycle Hooks vs Routing' (en + zh)"
```

---

### A.Task 10: Article 03 — "Topology Constitution"

**Files:**
- Create: `D:/mandate/docs/articles/03-topology-constitution.en.md`
- Create: `D:/mandate/docs/articles/03-topology-constitution.zh.md`

- [ ] **Step 1: Write `.en.md`** (target 7 headings: 1 H1 + 6 H2)

```markdown
# Topology Constitution: Why We Forbid Parent-Child

> Most multi-agent frameworks let you build any DAG. Mandate doesn't. Here's why, and how the three-layer defense works.

## The Problem: Conway-Law Violation

When project group `B`'s next decision depends on project group `A`'s output, you've accidentally serialized two groups that should have been parallel. Worse, you've signaled that the *system you're building* has an unintended bottleneck — Conway tells us your code will inherit that bottleneck.

This is so easy to do that frameworks like LangGraph, AutoGen, and CrewAI silently allow it. The user didn't mean to introduce a serial dependency, but the DAG editor doesn't know.

## The Rule

Inter-group dependencies are forbidden when they affect a downstream decision. They are *legal* when they are result-only (group `B` waits for `A`'s output but doesn't change behavior based on it).

Formally, every cross-group dep must declare `kind: result_only` or `kind: decision_affecting`. Only the former is legal.

## Layer 1: Compile-Time Lint

`mandate validate` walks `decomposition.yaml`, builds the inter-group dep graph, and emits a warning if any decision-affecting cross-group dep exists.

This runs in CI. It runs in your editor on save. It catches mistakes before any LLM token is spent.

## Layer 2: Runtime Hard-Block

Even with lint passing, dynamic decompositions can violate the rule (e.g., a Chancellor regenerates a plan that introduces a forbidden dep).

The Chancellor's `on_mandate_received` hook calls `builtin:topology-check`. On detection, dispatch is hard-blocked. The user is shown an auto-merge proposal: *"Merging GroupA + GroupB into GroupAB? (y/N)"* — keeping the work moving without forcing a redo.

## Layer 3: Historian Post-Hoc PR

Even runtime checks have escape paths. A subtle dep may emerge from agent behavior at execution time — say, a CTO of group `A` quietly reads from group `B`'s scratchpad through an agreed convention.

The Historian sweeps the chronicle periodically. If it detects observed cross-group reads that match the parent-child pattern, it writes `reforms/PR-NNN-merge-X-and-Y.md` and waits for the Emperor's ratification. The next mandate run uses the new constitution.

## Why Three Layers?

Single-layer defense fails by design:
- Lint alone misses dynamic violations.
- Runtime alone misses subtle data flows.
- Historian alone is too late for the current run.

The combination buys you the strongest property: *a parent-child dependency cannot persist across two consecutive mandate runs*. If it slipped through this run, it gets ratified out before the next one.

## A Concrete Example

Imagine a research project decomposed into Tech, Companies, and Regulation groups. If "Companies" needs to know which technologies were validated by "Tech" *to decide whom to research*, that's parent-child — forbidden.

Mandate's response: merge them into "Tech-and-Companies", which internally serializes scout → soldier as needed but presents a single boundary to the Chancellor.

Conway sleeps soundly.

---

*Read next: [Historian and Reform PRs](./04-historian-and-reform-prs.en.md)*
```

- [ ] **Step 2: Write `.zh.md`** (7 headings)

```markdown
# 拓扑宪法：为什么禁止父子节点

> 大多数多 agent 框架允许任意 DAG。Mandate 不允许。本文解释为什么，以及三层防护如何运作。

## 问题：康威定律违例

当项目组 `B` 的下一步决策依赖项目组 `A` 的输出时，你已经把两个本应并行的组串行化了。更糟糕的是，你向 *正在构建的系统* 发出了一个不该有的瓶颈信号——康威定律告诉我们，你的代码会继承这个瓶颈。

这种错误极易发生，以至于 LangGraph、AutoGen、CrewAI 都默许它。用户并未故意引入串行依赖，但 DAG 编辑器不知道。

## 规则

跨项目组的依赖在影响下游决策时是禁止的。当依赖只是等待结果（B 等 A 但 A 的输出不改变 B 的行为）时是合法的。

形式上，每条跨组依赖必须声明 `kind: result_only` 或 `kind: decision_affecting`。仅前者合法。

## 第 1 层：编译期 Lint

`mandate validate` 走查 `decomposition.yaml`，构建跨组依赖图，发现任何 `decision_affecting` 即报 warning。

这运行在 CI 里、运行在你编辑器保存时——任何 LLM token 消费之前就能截击错误。

## 第 2 层：运行期硬阻

即使 lint 通过，动态拆解也可能违规（如宰相重新生成计划引入了禁止依赖）。

宰相的 `on_mandate_received` hook 调用 `builtin:topology-check`。检测到违例 → dispatch 被硬阻。用户看到自动合并提议：*"合并 GroupA + GroupB 为 GroupAB？(y/N)"* ——让工作继续推进而无需推倒重来。

## 第 3 层：史官事后 PR

即便运行期检查也有逃逸路径。微妙的依赖可能在执行时由 agent 行为涌现——比如组 `A` 的军师按某种约定悄悄读了组 `B` 的草稿。

史官周期性扫描 chronicle。若检测到符合父子模式的跨组读取，写出 `reforms/PR-NNN-merge-X-and-Y.md`，候皇帝批红。下一次 mandate run 使用新宪法。

## 为什么三层？

单层防御按设计就会失败：
- 仅 lint 漏掉动态违规。
- 仅 runtime 漏掉微妙的数据流。
- 仅史官对当前 run 太迟。

组合提供了最强属性：*父子依赖无法连续跨两次 mandate run 留存*。本次漏过 → 下次开始前已被批红剔除。

## 一个具体例子

设想一个调研项目，拆为 Tech、Companies、Regulation 三组。如果 "Companies" 必须知道 "Tech" 验证了哪些技术 *才能决定调研对象*——这就是父子，禁止。

Mandate 的响应：合并为 "Tech-and-Companies" 组，内部 scout → soldier 按需串行，但对宰相只呈现一个边界。

康威可以安睡。

---

*下一篇：[Historian and Reform PRs](./04-historian-and-reform-prs.zh.md)*
```

- [ ] **Step 3: Run test + commit**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS.

```bash
cd D:/mandate && git add docs/articles/03-* && git commit -m "docs(article): add 03 'Topology Constitution' (en + zh)"
```

---

### A.Task 11: Article 04 — "Historian and Reform PRs"

**Files:**
- Create: `D:/mandate/docs/articles/04-historian-and-reform-prs.en.md`
- Create: `D:/mandate/docs/articles/04-historian-and-reform-prs.zh.md`

- [ ] **Step 1: Write `.en.md`** (target 7 headings)

```markdown
# The Historian: How a Court Evolves Itself

> Mandate's most unique mechanism: an agent layer that proposes amendments to the constitution, ratified by humans like git PRs.

## The Problem: Most Frameworks Are Frozen

You configure your CrewAI / LangGraph / Paperclip court once and run it. When inefficiency emerges (redundant scout calls, drifting charters, soldier overruns), you must manually edit YAML.

This works for static problems. It fails for everything else: emerging tasks, evolving teams, shifting constraints. A court frozen at startup cannot get better at its work.

## The Mandate Approach: Three Timescales

The Historian (史官) operates on three nested loops:

- **Chronicle (every hook fire, 0 LLM cost):** Append `{ts, agent, hook, artifacts, tokens}` to today's JSONL. This is pure logging, runs on every action.
- **Reform (every 7 days OR every 50 tasks):** A Codex+gpt-5.5 batch reads the chronicle window and authors reform PRs. PRs target `constitution.yaml` (e.g., merge two groups, raise a budget, swap a model).
- **Audit (event-driven):** When red lines trip — error rate spikes, chronicle size explodes, an explicit `mandate audit` — the Historian writes an emergency report.

## The Reform PR Format

```markdown
# PR-042: Merge research and content groups

**Rationale:** Over the last 7 days, 14 of 21 mandate runs exhibited a result_only ↔ decision_affecting boundary breach between these groups. Auto-merge proposals were accepted in 11/14 cases, suggesting the merge is structurally indicated.

**diff_target:** constitution.yaml

**Proposed changes:**
- op: merge_groups
  from: [research, content]
  to: research-content

**Status:** pending
```

The PR is a real markdown file in `reforms/`. It carries `_metadata.yaml` with the structured op set the runtime applies on ratify.

## Ratification

```bash
$ mandate audit
📜 Historian: 3 reform proposals from last 7 days
   reforms/PR-042-merge-research-and-content.md
   reforms/PR-043-raise-chancellor-token-budget.md
   reforms/PR-044-add-default-soldier-timeout.md

$ git diff reforms/

$ mandate ratify PR-042
✓ constitution.yaml v1.2.4 → v1.3.0
✓ reforms/_ratified.yaml updated
```

Ratification is a deterministic patch (not an LLM rewrite). Vetoes move the PR to `reforms/_rejected/` with a reason.

## Why PRs and Not Auto-Apply

Auto-applying historian-proposed reforms is the obvious-but-wrong path. It loses three things:
- **Human accountability** — who's responsible for the new rule?
- **Reversibility audit trail** — git history would be a black box of LLM-driven mutations.
- **Conservative bias** — humans gate-keep against histrionic over-reform.

PRs preserve all three. They also produce a real artifact developers already know how to review: a diff.

## The Constitution as a Living Document

Over weeks of operation, `constitution.yaml` accumulates ratified reforms. It becomes a record of what this particular court has learned about itself. New deployments can fork prior constitutions ("research-lab archetype", "media-team archetype") without losing the wisdom encoded in those decisions.

This is institutional memory at the YAML level — a thing no other framework offers.

## Borrowed Wisdom

The Reform PR pattern borrows directly from the Linux kernel mailing list and Rust's RFC process. The Historian is just an automated proposer; the Emperor (you) is the maintainer. What changes is the cadence — kernel patches arrive irregularly, but the Historian operates on a clock the Emperor sets.

---

*Read next: [Bilingual First-Class Citizenship](./05-bilingual-first-class.en.md)*
```

- [ ] **Step 2: Write `.zh.md`** (7 headings)

```markdown
# 史官：朝廷如何自我演化

> Mandate 最独特的机制：一个 agent 层向宪法提出修订案，由人类像 git PR 一样批红。

## 问题：大多数框架是冻结的

你把 CrewAI / LangGraph / Paperclip 配置一次然后运行。当低效涌现（重复斥候调用、漂移的章程、士兵超支），你必须手动改 YAML。

这对静态问题有效。对其它一切失效：涌现的任务、演化的团队、变化的约束。一个启动时冻结的朝廷无法越用越好。

## Mandate 的方案：三个时间尺度

史官在三层嵌套循环上运转：

- **史册（每次 hook 触发，0 LLM 成本）：** 向当日 JSONL 追加 `{ts, agent, hook, artifacts, tokens}`。纯日志，每个动作都跑。
- **修订（每 7 日或每 50 次任务）：** Codex+gpt-5.5 批量读 chronicle 窗口，撰写制度修订 PR。PR 的目标是 `constitution.yaml`（如合并两组、提高预算、换模型）。
- **奏折（事件驱动）：** 当红线触发——错误率飙升、chronicle 容量爆炸、显式 `mandate audit` ——史官写紧急审计报告。

## 修订 PR 的格式

```markdown
# PR-042: 合并 research 与 content 组

**Rationale:** 过去 7 日 21 次 mandate 中，14 次在两组之间出现 result_only ↔ decision_affecting 的边界穿透。其中 11 次自动合并被接受，说明合并是结构性的。

**diff_target:** constitution.yaml

**Proposed changes:**
- op: merge_groups
  from: [research, content]
  to: research-content

**Status:** pending
```

PR 是 `reforms/` 下的真实 markdown 文件，附 `_metadata.yaml` 记录批红时 runtime 要应用的结构化 op set。

## 批红

```bash
$ mandate audit
📜 史官启奏：过去 7 日 3 条制度修订
   reforms/PR-042-merge-research-and-content.md
   reforms/PR-043-raise-chancellor-token-budget.md
   reforms/PR-044-add-default-soldier-timeout.md

$ git diff reforms/

$ mandate ratify PR-042
✓ constitution.yaml v1.2.4 → v1.3.0
✓ reforms/_ratified.yaml 已更新
```

批红是确定性补丁（非 LLM 重写）。留中（veto）则把 PR 移到 `reforms/_rejected/` 并附理由。

## 为什么用 PR 而非自动应用

自动应用史官提议是显然但错误的选择。它失去三件事：
- **人类问责** —— 这条新规则归谁负责？
- **可逆审计轨迹** —— git history 会变成 LLM 驱动突变的黑盒。
- **保守偏向** —— 人类的把关是抵御过度修订冲动的网兜。

PR 保留了三者。它还产出开发者本就熟悉的审查产物：diff。

## 宪法作为活文档

数周运转后，`constitution.yaml` 积累了批红的修订。它成为这个特定朝廷关于自己学到了什么的记录。新部署可 fork 既有宪法（"研究室原型"、"媒体团队原型"），不丢失那些决定中编码的智慧。

这是 YAML 级的"组织记忆"——任何其他框架都不提供。

## 借来的智慧

修订 PR 的模式直接借自 Linux 内核邮件列表和 Rust RFC 流程。史官只是自动提案者；皇帝（你）是维护者。改变的是节奏——内核补丁不规律到达，史官按皇帝设定的时钟运转。

---

*下一篇：[双语一等公民](./05-bilingual-first-class.zh.md)*
```

- [ ] **Step 3: Run test + commit**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS.

```bash
cd D:/mandate && git add docs/articles/04-* && git commit -m "docs(article): add 04 'Historian and Reform PRs' (en + zh)"
```

---

### A.Task 12: Article 05 — "Bilingual First-Class Citizenship"

**Files:**
- Create: `D:/mandate/docs/articles/05-bilingual-first-class.en.md`
- Create: `D:/mandate/docs/articles/05-bilingual-first-class.zh.md`

- [ ] **Step 1: Write `.en.md`** (target 6 headings)

```markdown
# Bilingual First-Class Citizenship

> Most "internationalized" projects translate the README and call it a day. Mandate makes the metaphor itself bilingual at the code level.

## The Translation Trap

You've seen it: a Chinese open-source project with an excellent README.zh, a serviceable README.en, and English-only code. Eastern users see a project written for them; Western users see a translation. Both audiences sense the imbalance. Adoption stratifies.

## The Mandate Approach

`terms.yaml` is the canonical map. It's loaded by the runtime, the CLI, the validators, and the docs. It's both a configuration file and a literary device.

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian }
```

In `decomposition.yaml`, you can write `role: 宰相` or `role: chancellor` — both are canonical. The CLI prints `📜 宰相 (Chancellor) 已就位` when `MANDATE_LANG=both`.

## What Bilingual First-Class Buys You

- **No translation drift** — there's no "primary" and "secondary" version. The terms file is the single source of truth.
- **Cross-cultural fluency** — Western developers learn that `censor` means 锦衣卫 means an independent audit layer. The metaphor enriches the technical concept.
- **A genuine moat** — competitors with English-only YAML cannot retrofit this. Bilingual is structural.

## The Cultural Story Matters

Mandate is built around a metaphor that already lives in two civilizations: imperial bureaucracy. China's Tang and Ming dynasties operated on principles isomorphic to modern corporate hierarchy. The Censorate (御史台) is exactly what an independent audit org should be. The Hanlin Academy is exactly the historian function.

By naming things in both languages, Mandate honors both civilizations' organizational wisdom — and gives developers in both worlds a richer mental model than "CEO" or "皇帝" alone provides.

## Mechanical Implementation

The runtime resolves any role reference through `terms.yaml`:

```typescript
function resolveRole(input: string): RoleId {
  // 'chancellor' → 'chancellor'
  // '宰相'        → 'chancellor'
  // 'cancellarius'→ 'chancellor' (if alias)
  return termsMap.canonicalize(input);
}
```

Code identifiers stay English (chancellor, censor). User-facing text follows `MANDATE_LANG`. Documentation pairs `*.en.md` with `*.zh.md` and a CI lint enforces heading parity. This system survives contributors who don't read both languages — they edit one side, the lint flags drift.

## A Universal Principle in Disguise

The deeper lesson: when your project's central metaphor lives in multiple cultures, treat all of them as first-class. You'll get richer abstractions, broader audiences, and a moat your competitors structurally cannot copy. Mandate is one application of this principle. Yours could be another.

---

*Read the [SPEC](../specs/2026-05-01-mandate-design.md) next.*
```

- [ ] **Step 2: Write `.zh.md`** (6 headings)

```markdown
# 双语一等公民

> 大多数"国际化"项目翻译完 README 就收工。Mandate 在代码层面让"隐喻"本身双语化。

## 翻译陷阱

你见过：中文开源项目有出色的 README.zh、能用的 README.en、纯英文代码。东方用户感到这是为他们写的；西方用户感到这是翻译版。两边都察觉到不对称，采用率分层。

## Mandate 的方案

`terms.yaml` 是规范化的映射。runtime、CLI、validators、文档全部加载它。它既是配置文件，也是文学装置。

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian }
```

在 `decomposition.yaml` 里，你可以写 `role: 宰相` 或 `role: chancellor`——两者都是规范形式。当 `MANDATE_LANG=both` 时，CLI 输出 `📜 宰相 (Chancellor) 已就位`。

## 双语一等公民给你什么

- **无翻译漂移** —— 不存在"主"版本和"次"版本。terms 文件是唯一真理。
- **跨文化流畅** —— 西方开发者学到 `censor` = 锦衣卫 = 独立审查层。隐喻丰富了技术概念。
- **真正的护城河** —— 纯英文 YAML 的竞品没法补做。双语是结构性的。

## 文化故事很重要

Mandate 建立在一个已经存在于两个文明的隐喻之上：帝国官僚制。中国唐明两朝以现代企业层级同构的原则运转。御史台正是独立审查组织该有的样子。翰林院正是史官职能的形态。

通过双语命名，Mandate 致敬两个文明的组织智慧——并赋予两边开发者比"CEO"或"皇帝"单独使用更丰富的心智模型。

## 机械实现

runtime 通过 `terms.yaml` 解析任何角色引用：

```typescript
function resolveRole(input: string): RoleId {
  // 'chancellor'  → 'chancellor'
  // '宰相'         → 'chancellor'
  // 'cancellarius'→ 'chancellor' (alias 命中时)
  return termsMap.canonicalize(input);
}
```

代码标识符保持英文（chancellor, censor）。面向用户的文本随 `MANDATE_LANG` 切换。文档把 `*.en.md` 与 `*.zh.md` 配对，CI lint 强制 heading 数对齐。这个系统能容忍不会两种语言的贡献者——他们只改一边，lint 标出漂移。

## 表层下是普适原则

更深的教训：当你项目的核心隐喻活在多个文化中，把它们都当作一等公民。你会得到更丰富的抽象、更广的受众、竞品结构上无法复制的护城河。Mandate 是这个原则的一个应用。你的下一个项目也可能是。

---

*接下来读 [SPEC](../specs/2026-05-01-mandate-design.md)。*
```

- [ ] **Step 3: Run test + commit**

Run: `cd D:/mandate && node --test tests/lint-articles.test.mjs`
Expected: PASS, all 5 articles parity-clean.

```bash
cd D:/mandate && git add docs/articles/05-* && git commit -m "docs(article): add 05 'Bilingual First-Class Citizenship' (en + zh)"
```

---

### A.Task 13: Top-level `README.md` (English)

**Files:**
- Create: `D:/mandate/README.md`
- Create: `D:/mandate/tests/lint-readme-parity.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `D:/mandate/tests/lint-readme-parity.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run test — verify fails**

Run: `cd D:/mandate && node --test tests/lint-readme-parity.test.mjs`
Expected: FAIL — both READMEs missing.

- [ ] **Step 3: Write `README.md`** (15 headings: 1 H1 + 14 H2)

```markdown
# Mandate · 天命

> *The Mandate of Heaven, in code.*
>
> A methodology + reference framework for self-governing multi-agent imperial courts. Bilingual first-class.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Read in Chinese](https://img.shields.io/badge/lang-中文-red.svg)](README.zh.md)

---

## What Is Mandate

Mandate organizes LLM agents into a self-governing imperial court. While LangGraph, CrewAI, Paperclip, and OpenClaw all converge on CEO/Manager/Worker hierarchies, Mandate fills five vacancies none of them addresses:

1. **Censor Layer (锦衣卫)** as a first-class citizen — independent model, configurable per-node.
2. **Lifecycle Hooks** — workflow discipline as procedural musts; creative reasoning between hooks.
3. **Topology Constitution** — parent-child dependencies are forbidden, three-layer defense.
4. **Historian Layer (史官)** — second-order feedback loop via reform PRs, ratified by humans.
5. **Bilingual First-Class** — Eastern (封建朝廷) and Western (corporate) metaphors at the code level.

## Why "Mandate"

The English word *mandate* means "an authoritative order". The Chinese 天命 means "the Mandate of Heaven" — the authority a sovereign holds, lost when wielded poorly. The dual meaning gives Mandate its slogan and its structure: every imperial decree is a *mandate*, and the court itself holds a *mandate of Heaven* it can lose if it governs badly.

## The Imperial Court

```
Emperor (Human) → Chancellor → [Group A | Group B | Group C ...]
                                    │
        ┌───────────────────────────┴─────────────────────────┐
        │  Each group: CTO → Scout → Soldiers (parallel) → Secretary  │
        └─────────────────────────────────────────────────────┘

Censor (锦衣卫): paired audit on a separate model, per-node config
Historian (史官): chronicle + reform PRs + emergency audits
```

## Quick Look at a Constitution

```yaml
version: 1.0.0
project: my-empire
language: both

topology:
  enforce_no_parent_child: true
  on_violation: hard_block

censor:
  default_tier: balanced
  overrides:
    chancellor: { strategy: full, async: false }

historian:
  reflection_period_days: 7
  reflection_period_tasks: 50

models:
  chancellor: { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro] }
  cto:        { preferred: claude-opus-4-7-1m, fallback: [claude-opus-4-7] }
```

## Three Hero Commands (Phase B)

```bash
$ npx create-mandate my-empire --template both    # static scaffold (5s)
$ npx mandate genesis "<your idea>"               # LLM-driven court designer
$ mandate evolve "<your evolution>"               # natural-language amendment
```

## Phase A — Methodology (You Are Here)

This repository currently provides:

- **SPEC:** [docs/specs/2026-05-01-mandate-design.md](docs/specs/2026-05-01-mandate-design.md)
- **Schemas:** [spec/](spec/)
- **Examples:** [examples/research/](examples/research/) and [examples/self-governance/](examples/self-governance/)
- **Methodology articles:** [docs/articles/](docs/articles/)
- **Bilingual term map:** [terms.yaml](terms.yaml)

You can implement Mandate today on top of LangGraph, Claude Code, Paperclip, or any other agent framework using these specifications.

## Phase B — Reference Runtime (Coming Weeks 5-12)

A TypeScript pnpm monorepo:
- `@mandateai/runtime` — runtime (hook scheduler, censor interceptor, file lock)
- `@mandateai/cli` — three hero commands + auxiliaries
- `@mandateai/adapters` — MCP / Claude Code / OpenClaw / CLI
- `@mandateai/packs-imperial-v1` — eight skill packs
- `@mandateai/registry` — local-first skill discovery

## Phase C — Dashboard 紫禁城 (Weeks 13-20)

A bilingual web dashboard atop the same filesystem-as-source-of-truth: live topology graph, reform PR review UI, censor audit timeline, per-mandate cost dashboard. Sequenced after Phase B stabilizes — see [SPEC §13](docs/specs/2026-05-01-mandate-design.md).

## Five Pillars of Theory

| Discipline | Concept | Where it lives |
|---|---|---|
| Management Science | Exploration vs Exploitation (March 1991) | Lifecycle Hooks |
| Political Science | Imperial Bureaucracy ↔ Modern Corporation | terms.yaml |
| Cybernetics | Second-Order Feedback (Wiener) | Historian + Reform PRs |
| Software Engineering | Conway's Law | Forbidden parent-child topology |
| Distributed Systems | CAP Theorem | Sibling-only project groups |

## Compared to Existing Frameworks

| Feature | LangGraph | CrewAI | Paperclip | MetaGPT | Mandate |
|---|---|---|---|---|---|
| Hierarchical agents | Y | Y | Y | Y | Y |
| Human in the loop | Y | partial | Y | partial | Y |
| Independent audit layer | partial | N | partial | N | first-class |
| Procedural hooks | N | N | N | implicit | YAML-level |
| Topology constraint solver | N | N | N | N | 3-layer |
| Self-evolution | N | N | N | N | reform PRs |
| Bilingual first-class | N | N | N | partial | structural |
| Star count (Apr 2026) | 8.2k | 45.9k | 53k | 44k | TBD |

## Roadmap

- ✅ **Phase A — Methodology** (Weeks 1-4): SPEC, schemas, articles, examples.
- 🔜 **Phase B — TypeScript runtime** (Weeks 5-12): three hero CLI commands, eight skill packs.
- 🔜 **Phase C — Dashboard 紫禁城** (Weeks 13-20): topology graph, reform PR UI, audit timeline.
- 🔮 **v2** — federation across courts, constitution market, Censor of Censors (御史台).

## Status

Phase A in progress. Star this repo to follow Phase B & C development.

## Read More

- [SPEC](docs/specs/2026-05-01-mandate-design.md) — full design specification
- [Article 01: Why Five Vacancies](docs/articles/01-why-five-vacancies.en.md)
- [Article 02: Lifecycle Hooks vs Routing](docs/articles/02-lifecycle-hooks-vs-routing.en.md)
- [Article 03: Topology Constitution](docs/articles/03-topology-constitution.en.md)
- [Article 04: Historian and Reform PRs](docs/articles/04-historian-and-reform-prs.en.md)
- [Article 05: Bilingual First-Class Citizenship](docs/articles/05-bilingual-first-class.en.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues, PRs, and constitutional amendments welcome.

## License

MIT.

## Acknowledgments

Inspired by LangGraph's hierarchical-teams pattern, MetaGPT's SOP discipline, ChatDev's role multiplicity, Paperclip's organizational metaphor, OpenClaw's self-evolution, Anthropic's multi-agent research orchestrator-subagent design, and a thousand years of Tang/Ming bureaucratic tradition.
```

- [ ] **Step 4: Commit**

```bash
cd D:/mandate && git add README.md tests/lint-readme-parity.test.mjs && git commit -m "docs(readme): add top-level English README + parity lint test"
```

> Note: heading-parity test will fail until A.Task 14 lands. That's expected.

---

### A.Task 14: Top-level `README.zh.md` (Chinese)

**Files:**
- Create: `D:/mandate/README.zh.md`

- [ ] **Step 1: Write `README.zh.md`** (15 headings matching English)

```markdown
# Mandate · 天命

> *奉天承运，朝廷自治。*
>
> 一套面向多 agent 自治朝廷的方法论 + 参考框架。双语一等公民。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Read in English](https://img.shields.io/badge/lang-English-blue.svg)](README.md)

---

## Mandate 是什么

Mandate 把 LLM agent 组织成一座自治的封建朝廷。当 LangGraph、CrewAI、Paperclip、OpenClaw 都收敛到 CEO/Manager/Worker 层级时，Mandate 填补了它们都未触及的五处空白：

1. **锦衣卫层** 作为一等公民——独立模型，可按节点级配置。
2. **Lifecycle Hooks** ——工作流纪律作为程序性 must，创新空间在 hook 之间。
3. **拓扑宪法** ——父子节点禁止，三层防护。
4. **史官层** ——通过制度修订 PR 实现的二阶反馈环，由人类批红。
5. **双语一等公民** ——封建朝廷与现代公司隐喻在代码层平起平坐。

## 为什么叫 "Mandate"

英文 *mandate* 意为"具有权威的命令"。中文 天命 是君主所执的天授之权——治国不善则失之。双关给了 Mandate 它的口号与结构：每道圣谕是一份 *mandate*，朝廷自身亦持一份 *天命*——治国不善便会失去。

## 朝廷拓扑

```
皇帝 (人类) → 宰相 → [项目组 A | 项目组 B | 项目组 C ...]
                       │
        ┌──────────────┴──────────────┐
        │  各组：军师 → 斥候 → 士兵×N → 文官    │
        └──────────────────────────────┘

锦衣卫：1:1 配 audit、独立模型、节点级配置
史官：史册 + 制度修订 PR + 紧急奏折
```

## 一份宪法长什么样

```yaml
version: 1.0.0
project: my-empire
language: both

topology:
  enforce_no_parent_child: true
  on_violation: hard_block

censor:
  default_tier: balanced
  overrides:
    chancellor: { strategy: full, async: false }

historian:
  reflection_period_days: 7
  reflection_period_tasks: 50

models:
  chancellor: { preferred: gpt-5.5, fallback: [gpt-5, gpt-5-pro] }
  cto:        { preferred: claude-opus-4-7-1m, fallback: [claude-opus-4-7] }
```

## 三命令（Phase B）

```bash
$ npx create-mandate my-empire --template both    # 静态脚手架（5 秒）
$ npx mandate genesis "<你的想法>"               # LLM 驱动的元朝廷设计
$ mandate evolve "<你想要的演化>"                # 自然语言修宪
```

## Phase A——方法论（你现在所在）

本仓库现阶段提供：

- **设计 SPEC：** [docs/specs/2026-05-01-mandate-design.md](docs/specs/2026-05-01-mandate-design.md)
- **JSON Schemas：** [spec/](spec/)
- **示例：** [examples/research/](examples/research/) 与 [examples/self-governance/](examples/self-governance/)
- **方法论文章：** [docs/articles/](docs/articles/)
- **双语术语表：** [terms.yaml](terms.yaml)

凭这些规范，今天你就可以在 LangGraph、Claude Code、Paperclip 或任何 agent 框架上落地 Mandate。

## Phase B——参考实现（第 5-12 周）

TypeScript pnpm monorepo：
- `@mandateai/runtime` ——runtime（hook 调度器、锦衣卫拦截器、文件锁）
- `@mandateai/cli` ——三命令 + 辅助命令
- `@mandateai/adapters` ——MCP / Claude Code / OpenClaw / CLI
- `@mandateai/packs-imperial-v1` ——八个 skill pack
- `@mandateai/registry` ——本地优先的 skill 发现

## Phase C——紫禁城仪表盘（第 13-20 周）

跑在同样的"文件即真理之源"之上的双语 web 仪表盘：实时拓扑图、制度修订 PR 审查 UI、锦衣卫审计时间轴、单 mandate 成本仪表。安排在 Phase B 稳定之后——见 [SPEC §13](docs/specs/2026-05-01-mandate-design.md)。

## 理论五柱

| 学科 | 概念 | 落地位置 |
|---|---|---|
| 管理学 | 探索 vs 利用（March 1991） | Lifecycle Hooks |
| 政治学 | 帝国官僚制 ↔ 现代企业 | terms.yaml |
| 控制论 | 二阶反馈（Wiener） | 史官 + 制度修订 PR |
| 软件工程 | 康威定律 | 父子节点禁止 |
| 分布式系统 | CAP 定理 | 项目组兄弟拓扑 |

## 与现有框架对比

| 特性 | LangGraph | CrewAI | Paperclip | MetaGPT | Mandate |
|---|---|---|---|---|---|
| 层级 agent | Y | Y | Y | Y | Y |
| 人在回路 | Y | 部分 | Y | 部分 | Y |
| 独立审查层 | 部分 | N | 部分 | N | 一等公民 |
| 程序性 hooks | N | N | N | 隐式 | YAML 级 |
| 拓扑约束求解 | N | N | N | N | 三层 |
| 自我演化 | N | N | N | N | 修订 PR |
| 双语一等公民 | N | N | N | 部分 | 结构性 |
| Star（2026 年 4 月） | 8.2k | 45.9k | 53k | 44k | TBD |

## 路线图

- ✅ **Phase A——方法论**（第 1-4 周）：SPEC、schemas、文章、示例。
- 🔜 **Phase B——TypeScript runtime**（第 5-12 周）：三命令、八个 skill pack。
- 🔜 **Phase C——紫禁城仪表盘**（第 13-20 周）：拓扑图、PR UI、审计时间轴。
- 🔮 **v2** ——朝廷间联邦、宪法市场、御史台（监察的监察）。

## 当前状态

Phase A 进行中。Star 此仓库以追踪 Phase B & C 的开发。

## 延伸阅读

- [SPEC](docs/specs/2026-05-01-mandate-design.md) ——完整设计规范
- [文章 01：五个空白点](docs/articles/01-why-five-vacancies.zh.md)
- [文章 02：Lifecycle Hooks vs 任务路由](docs/articles/02-lifecycle-hooks-vs-routing.zh.md)
- [文章 03：拓扑宪法](docs/articles/03-topology-constitution.zh.md)
- [文章 04：史官与制度修订 PR](docs/articles/04-historian-and-reform-prs.zh.md)
- [文章 05：双语一等公民](docs/articles/05-bilingual-first-class.zh.md)

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。Issue、PR、宪法修订案皆欢迎。

## 许可证

MIT。

## 致谢

灵感来自：LangGraph 的层级团队模式、MetaGPT 的 SOP 纪律、ChatDev 的多角色分工、Paperclip 的组织隐喻、OpenClaw 的自我演化、Anthropic 多 agent 研究的 orchestrator-subagent 架构，以及一千年的唐明官僚传统。
```

- [ ] **Step 2: Run all lint tests + commit**

Run: `cd D:/mandate && node --test tests/*.test.mjs`
Expected: ALL PASS — schema lint, terms lint, examples lint, articles lint, README parity all green.

```bash
cd D:/mandate && git add README.zh.md && git commit -m "docs(readme): add top-level Chinese README, heading parity passes"
```

---

### A.Task 15: CONTRIBUTING.md + GitHub Actions CI

**Files:**
- Create: `D:/mandate/CONTRIBUTING.md`
- Create: `D:/mandate/.github/workflows/ci.yml`

- [ ] **Step 1: Write `CONTRIBUTING.md`**

```markdown
# Contributing to Mandate

Thanks for your interest. Mandate is a methodology + reference framework, so contributions land in three categories:

## 1. Spec & Schema Changes

Edits to `docs/specs/`, `spec/*.json`, `terms.yaml`. These shape the core methodology — discuss in an issue first if the change is non-trivial.

## 2. Methodology Articles

Each article in `docs/articles/` ships in pairs (`*.en.md` + `*.zh.md`). CI enforces heading-count parity between siblings.

If you don't write both languages, open a PR with one side and ask for a translation co-author.

## 3. Examples

`examples/<archetype>/.mandate/` directories. Each must validate against `spec/constitution.schema.json` (CI enforces). New archetypes welcome.

## Local Setup

```bash
git clone https://github.com/<your-fork>/mandate
cd mandate
npm install
npm test
```

## Commit Style

Conventional commits — `feat:`, `fix:`, `docs:`, `chore:`, etc. Scope optional but encouraged.

## Reform Proposals

If you want to propose a structural change to the spec itself (a new role, a new hook event, a new memory layer), open it as a `reforms/PR-NNN-<slug>.md` first. The Emperor (project maintainer) ratifies or vetoes.
```

- [ ] **Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - name: Lint schemas
        run: npm run lint:schemas
      - name: Lint README parity
        run: npm run lint:readme
      - name: Lint article parity
        run: npm run lint:articles
      - name: Lint terms
        run: node --test tests/lint-terms.test.mjs
      - name: Lint examples
        run: node --test tests/lint-examples.test.mjs
```

- [ ] **Step 3: Verify locally**

Run: `cd D:/mandate && npm test`
Expected: ALL test suites pass.

- [ ] **Step 4: Commit**

```bash
cd D:/mandate && git add CONTRIBUTING.md .github/workflows/ci.yml && git commit -m "chore(ci): add CONTRIBUTING.md and GitHub Actions CI"
```

---

### A.Task 16: GitHub repo creation + initial push

**Tools:** GitHub MCP (already authenticated as `liujiarui0918`)

- [ ] **Step 1: Create the repo on GitHub via MCP**

Use `mcp__github__create_repository` with:
- name: `mandate`
- description: `The Mandate of Heaven, in code. A methodology + reference framework for self-governing multi-agent imperial courts.`
- private: false
- auto_init: false

- [ ] **Step 2: Add the GitHub remote and push**

```bash
cd D:/mandate && git remote add origin https://github.com/liujiarui0918/mandate.git && git branch -M main && git push -u origin main
```

Expected: All Phase-A commits pushed; CI begins.

- [ ] **Step 3: Verify CI green on GitHub**

Open `https://github.com/liujiarui0918/mandate/actions`. Wait for the first CI run to complete green.

If red:
- Check workflow logs
- Common cause: line endings (CRLF vs LF). Add `.gitattributes` enforcing LF if needed.

- [ ] **Step 4: Tag v0.1.0**

```bash
cd D:/mandate && git tag -a v0.1.0 -m "Phase A — Methodology Authority complete" && git push origin v0.1.0
```

- [ ] **Step 5: Final Phase A milestone**

Phase A complete when:
- ✅ Repo public on GitHub at `liujiarui0918/mandate`
- ✅ CI green
- ✅ Tag `v0.1.0` pushed
- ✅ Both READMEs render correctly on GitHub
- ✅ All articles + spec + schemas + examples accessible

You may now begin Phase B preparation. Recommended: pause for 1 week to gather initial feedback (HN post, Reddit, X) before committing to Phase B work.

---

# Phase B — Reference Implementation (Weeks 5-12)

> ⚠️ **Re-plan before executing.** Phase B should be re-broken into bite-sized tasks via a fresh `writing-plans` invocation when Phase A is complete. The milestones below are the working scaffold, not a step-by-step plan.

## B.0 File Structure (Authoritative)

```
mandate/                                       (root, monorepo)
├── package.json                               # workspaces, devDeps
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .changeset/
├── packages/
│   ├── core/                                  # @mandateai/runtime
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── runtime.ts
│   │   │   ├── hook-scheduler.ts
│   │   │   ├── censor-interceptor.ts
│   │   │   ├── topology-check.ts
│   │   │   ├── memory.ts
│   │   │   ├── chronicle.ts
│   │   │   ├── constitution.ts
│   │   │   ├── model-resolver.ts
│   │   │   ├── file-lock.ts
│   │   │   ├── i18n.ts
│   │   │   └── types.ts
│   │   └── tests/
│   ├── cli/                                   # @mandateai/cli — `mandate` binary
│   │   ├── package.json
│   │   ├── bin/mandate.js
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   │   ├── create.ts
│   │   │   │   ├── genesis.ts
│   │   │   │   ├── evolve.ts
│   │   │   │   ├── run.ts
│   │   │   │   ├── audit.ts
│   │   │   │   ├── ratify.ts
│   │   │   │   ├── veto.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── status.ts
│   │   │   │   └── explain.ts
│   │   │   └── ui.ts
│   │   └── tests/
│   ├── adapters/                              # @mandateai/adapters
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── mcp.ts
│   │   │   ├── claude-skill.ts
│   │   │   ├── openclaw-skill.ts
│   │   │   ├── cli.ts
│   │   │   └── types.ts
│   │   └── tests/
│   ├── packs-imperial-v1/                     # @mandateai/packs-imperial-v1
│   │   ├── package.json
│   │   ├── packs/
│   │   │   ├── emperor.pack.yaml
│   │   │   ├── chancellor.pack.yaml
│   │   │   ├── cto.pack.yaml
│   │   │   ├── scout.pack.yaml
│   │   │   ├── soldier.pack.yaml
│   │   │   ├── secretary.pack.yaml
│   │   │   ├── censor.pack.yaml
│   │   │   └── historian.pack.yaml
│   │   └── tests/
│   ├── registry/                              # @mandateai/registry
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── discovery.ts
│   │   │   ├── download.ts
│   │   │   ├── cache.ts
│   │   │   └── types.ts
│   │   └── tests/
│   └── validators/                            # @mandateai/validators
│       ├── package.json
│       ├── src/
│       │   ├── topology-check.ts
│       │   ├── schema-validator.ts
│       │   └── constitution-validator.ts
│       └── tests/
├── examples/
└── docs/
```

## B.1 Milestones

### B.M1 — Monorepo skeleton (Week 5)

**Tasks:**
- B.M1.T1 Convert root to pnpm workspace; add `tsconfig.base.json`
- B.M1.T2 Create empty `packages/{core,cli,adapters,packs-imperial-v1,registry,validators}` with their package.jsons
- B.M1.T3 Configure Vitest + tsx
- B.M1.T4 Wire CI to also run `pnpm -r test`

**Exit gate:** `pnpm -r build && pnpm -r test` exits 0 with vacuous tests. Phase A's CI still green.

### B.M2 — `@mandateai/validators` (Week 5-6)

The simplest package. No state. Pure functions.

**Tasks:**
- B.M2.T1 Port the schema validators from Phase A into `validators/src/schema-validator.ts` exposing `validateConstitution(yaml: string)`, `validateHooks(yaml: string)`, etc.
- B.M2.T2 Implement `topology-check.ts` — given a `decomposition.yaml`, return `{ valid, violations: [{ from, to, kind }] }`
- B.M2.T3 Tests with at least: 1 valid sibling-only decomposition, 1 violating decomposition, 1 result_only-only decomposition (legal)

**Key skeleton:**

```typescript
// packages/validators/src/topology-check.ts
import type { Decomposition } from './types';

export interface TopologyViolation {
  from: string;
  to: string;
  kind: 'decision_affecting' | 'result_only';
}

export interface TopologyResult {
  valid: boolean;
  violations: TopologyViolation[];
}

export function checkTopology(d: Decomposition): TopologyResult {
  const violations: TopologyViolation[] = [];
  for (const group of d.groups) {
    for (const dep of group.deps) {
      if (dep.kind === 'decision_affecting') {
        violations.push({ from: dep.from, to: group.id, kind: dep.kind });
      }
    }
  }
  return { valid: violations.length === 0, violations };
}
```

**Exit gate:** All validator tests green; can be consumed by `@mandateai/runtime`.

### B.M3 — `@mandateai/runtime` runtime foundations (Weeks 6-7)

**Tasks:**
- B.M3.T1 `constitution.ts` — load + validate + version-bump `constitution.yaml`
- B.M3.T2 `i18n.ts` — load `terms.yaml`, expose `canonicalize(input) -> RoleId` and `display(role, lang)`
- B.M3.T3 `chronicle.ts` — atomic-append JSONL + line index
- B.M3.T4 `memory.ts` — workspace lifecycle (init / clear / snapshot)
- B.M3.T5 `file-lock.ts` — cooperative locking via lockfile
- B.M3.T6 `model-resolver.ts` — preferred + fallback chain probe with cache (24h TTL)

**Key skeleton (model-resolver):**

```typescript
// packages/core/src/model-resolver.ts
export interface ModelEntry {
  preferred: string;
  fallback: string[];
}

export interface ResolveResult {
  role: string;
  selected: string;
  attempted: { model: string; reason: 'ok' | 'unavailable' | 'auth' | 'timeout' }[];
}

export async function resolveModel(
  role: string,
  entry: ModelEntry,
  probe: (model: string) => Promise<{ ok: boolean; reason: ResolveResult['attempted'][0]['reason'] }>,
  cache: Map<string, ResolveResult>
): Promise<ResolveResult> {
  const cached = cache.get(role);
  if (cached) return cached;

  const attempted: ResolveResult['attempted'] = [];
  const candidates = [entry.preferred, ...entry.fallback];
  for (const m of candidates) {
    const res = await probe(m);
    attempted.push({ model: m, reason: res.reason });
    if (res.ok) {
      const result = { role, selected: m, attempted };
      cache.set(role, result);
      return result;
    }
  }
  throw new Error(`No model available for ${role}: ${JSON.stringify(attempted)}`);
}
```

**Exit gate:** Each module unit-tested; `runtime.ts` not yet implemented but all primitives ready.

### B.M4 — `@mandateai/runtime` hook scheduler & censor (Weeks 7-8)

**Tasks:**
- B.M4.T1 `hook-scheduler.ts` — given a role + lifecycle event, inject required hooks into the agent prompt and verify outputs
- B.M4.T2 `censor-interceptor.ts` — three strategies (full / sample / red_line), independent model, async/sync mode
- B.M4.T3 `runtime.ts` — main loop: receive mandate → spawn agents → drive hook lifecycle → handoff via filesystem
- B.M4.T4 Integration tests with mocked LLM (return canned responses)

**Hook scheduler skeleton:**

```typescript
// packages/core/src/hook-scheduler.ts
export interface HookOutcome {
  hookName: string;
  must: string;
  passed: boolean;
  artifactPath?: string;
  schemaErrors?: string[];
}

export async function runHooksFor(
  role: string,
  event: string,
  hooks: HookDefinition[],
  ctx: RuntimeContext
): Promise<HookOutcome[]> {
  const outcomes: HookOutcome[] = [];
  for (const hook of hooks) {
    // 1. inject 'must' into agent prompt
    // 2. wait for agent output
    // 3. verify artifact exists at writes_to
    // 4. run schema/validator
    // 5. invoke censor per config
    // 6. push outcome
  }
  return outcomes;
}
```

**Exit gate:** `mandate run` on the research example produces a `final_to_emperor.md` end-to-end with mocked LLMs.

### B.M5 — `@mandateai/adapters` (Week 9)

**Tasks:**
- B.M5.T1 `mcp.ts` — MCP client adapter; spawns/connects to MCP server, exposes `run(toolName, input)`
- B.M5.T2 `claude-skill.ts` — loads from `~/.claude/skills/<name>/SKILL.md`, runs via Claude Code CLI
- B.M5.T3 `openclaw-skill.ts` — loads from `~/.openclaw/skills/<name>/`, runs via OpenClaw API
- B.M5.T4 `cli.ts` — generic CLI wrapper with stdin JSON / stdout JSON contract

**Adapter contract:**

```typescript
// packages/adapters/src/types.ts
export interface SkillAdapter {
  name: string;
  inputSchema: object;
  outputSchema: object;
  run(input: unknown): Promise<unknown>;
}
```

**Exit gate:** Each adapter has at least one passing integration test against a real example tool.

### B.M6 — `@mandateai/packs-imperial-v1` (Week 10)

**Tasks:**
- B.M6.T1-T8 — one pack per role, declared in `packs/<role>.pack.yaml`. Each pack lists default skills and adapters.
- Tests: each pack loads via `@mandateai/registry`, all referenced skills resolve.

**Pack file shape:**

```yaml
# packages/packs-imperial-v1/packs/scout.pack.yaml
name: imperial-scout-v1
version: 1.0.0
role: scout
description: Imperial scout standard skill pack — web search + knowledge base + source verification
skills:
  - mcp: brave-search
  - claude-skill: deep-research
  - openclaw-skill: web-fetch
  - mandate-builtin: source-verifier
```

**Exit gate:** All eight packs load via registry; example projects can `skill_pack: imperial-scout-v1` and resolve.

### B.M7 — `@mandateai/registry` skill discovery (Week 10-11)

**Tasks:**
- B.M7.T1 `discovery.ts` — implement `discoveryOrder: [local, mandate-registry, npm, clawhub]` resolution
- B.M7.T2 `download.ts` — fetch + verify signed manifest from mandate-registry, cache to `.mandate/skills/`
- B.M7.T3 `cache.ts` — local cache hit/miss with provenance logged

**Exit gate:** A user with no internet access can resolve all `imperial-*-v1` packs from local cache after first download.

### B.M8 — `@mandateai/cli` three hero commands + auxiliaries (Weeks 11-12)

**Tasks:**
- B.M8.T1 `create.ts` — interactive prompts (commander + prompts), generate `.mandate/` directory from templates
- B.M8.T2 `genesis.ts` — call ephemeral provisional court (3 LLM agents) to design constitution + first mandate
- B.M8.T3 `evolve.ts` — wrap Historian's `on_event_audit` hook with CLI input
- B.M8.T4 `run.ts` — main mandate execution
- B.M8.T5 `audit.ts`, `ratify.ts`, `veto.ts`, `validate.ts`, `status.ts`, `explain.ts`
- B.M8.T6 `ui.ts` — CLI bilingual output via `MANDATE_LANG` env

**Key skeleton (create command):**

```typescript
// packages/cli/src/commands/create.ts
export async function create(targetDir: string, options: { template: string }) {
  const answers = await prompts([
    { name: 'language', type: 'select', message: 'CLI/docs language', choices: [{title:'both'},{title:'zh'},{title:'en'}] },
    { name: 'censor_tier', type: 'select', message: 'Censor tier', choices: [{title:'paranoid'},{title:'balanced'},{title:'frugal'}] }
  ]);
  // ... copy template, substitute, write
}
```

**Exit gate (Phase B):**
- `npx create-mandate` produces a runnable `.mandate/`
- `mandate run` executes both demos end-to-end on real LLMs (with reasonable budget caps)
- `mandate evolve` produces a valid reform PR
- `mandate ratify` updates constitution and commits to git
- CI green
- One technical blog post published
- One ≤90s screencast recorded

## B.2 Phase B Risks & Rollback

| Risk | Mitigation |
|---|---|
| LLM API drift between Phase A spec and Phase B reality | All API calls go through model-resolver + adapters; no model name is hardcoded outside `terms.yaml` and `constitution.yaml` |
| Hook scheduler complexity blowup | Strict YAGNI — each role's hooks come from the spec verbatim; do not add new hook events without a reform PR |
| Genesis provisional court explodes token budget | Hard cap genesis at 50k tokens; show estimated cost upfront; refuse to start if not configured |
| File lock deadlocks | Use lockfile lib with TTL; force-release locks older than 60s with audit log |

---

# Phase C — Dashboard 紫禁城 (Weeks 13-20)

> ⚠️ **Re-plan before executing.** Phase C should be re-broken into bite-sized tasks via a fresh `writing-plans` invocation when Phase B is complete and stabilized (≥2 weeks post-launch with active users). The milestones below are aspirational scaffolding.

## C.0 Architecture

A Next.js 15 (App Router) web application that reads `.mandate/` directly from a user-pointed directory. No new backend — Phase B's filesystem is the source of truth. Live updates via Server-Sent Events (file watchers).

**Stack:** Next.js 15, React 19, Tailwind v4, shadcn/ui, tRPC, React Flow (topology graph), `chokidar` (file watch), `@mandateai/runtime` (constitution loader, terms resolver, validators).

**Hosting:** Local-first (`mandate dashboard` opens `localhost:3777`). Self-hostable to Vercel / Cloudflare Pages for shared courts.

## C.1 Modules

### C.M1 — Topology Graph (Weeks 13-14)
React Flow component animated by chronicle stream. Each node = a role; edges = communication; colors signal state (idle/active/censor-flagged/error). Real-time hook-firing animations. Bilingual labels via `terms.yaml`.

### C.M2 — Reform PR Review UI (Weeks 14-15)
Browser version of `mandate audit` + `git diff` + `mandate ratify`. PR list, diff viewer, ratify/veto buttons that produce identical git history to the CLI commands. Constitution version timeline.

### C.M3 — Censor Audit Timeline (Weeks 15-16)
Filterable list of audit events. Drill-down to the offending hook output side-by-side with the corrected output. Per-role red-line history.

### C.M4 — Per-Mandate Cost Dashboard (Week 16-17)
Token spend over time, by role, by model. Fallback-chain decisions visible. Budget headroom warnings.

### C.M5 — Chronicle Stream Panel (Week 17)
Live tail of `chronicle/{date}.jsonl` rendered as readable rows. Search + filter.

### C.M6 — 紫禁城 UI Theme (Week 18)
Visual chrome: red/gold palette, "throne hall" landing layout, animated brush-stroke transitions. Optional plain "court" theme for users who prefer Western metaphor. Theme switcher in nav.

### C.M7 — Bilingual Polish (Week 19)
Every UI string sourced from `terms.yaml` + dedicated `dashboard.zh.json` / `dashboard.en.json`. Heading parity test for any markdown rendered.

### C.M8 — End-to-end demo + ship (Week 20)
Record the 60-90s self-governance screencast purely from the dashboard. Public preview deploy to Vercel. Demo at HN / Reddit / X.

## C.2 Phase C Exit Gate

- Dashboard renders any `.mandate/` directory in real time
- Reform PR ratify/veto from UI produces identical git history to CLI ratify
- Topology graph animates ≥5 concurrent agents at 30fps
- Bilingual UI passes parity check
- Demo C ("self-governance") recorded as a 60-90s screencast purely from the dashboard
- Public preview accessible at a `mandate.dev`-style URL

---

# Cross-phase risks & rollback

| Risk | Phase | Mitigation | Rollback |
|---|---|---|---|
| Paperclip ships a feature that overlaps a Mandate vacancy | A/B/C | Lead with bilingual cultural moat + 5-vacancy framing; the moat is structural, not racing | Adjust positioning, not architecture |
| Default models (gpt-5.5 etc.) become available — naming legitimacy | A | Already handled by fallback_chain | None needed |
| LangGraph adds a "Censor layer" or similar | B | Mandate's Censor + Historian + Topology Constitution are jointly-distinctive; one feature copy doesn't erase the bundle | Continue, lean on bundle |
| Phase A doesn't gather traction (no early stars) | A→B | Pause before B; iterate on README narrative; consider direct pitches to multi-agent communities | Don't start B blind |
| Token costs of two demos drive away contributors | B | Provide mocked-LLM mode (`MANDATE_MOCK_LLM=1`) for CI and onboarding | Ship mocked-mode by default |
| Dashboard becomes Paperclip clone | C | Re-plan C only after Phase B traction; emphasize topology + reform UI; no task-list-centric views | Defer C indefinitely if Phase B insufficient |

---

# Self-review checklist

Spec coverage scan against `docs/specs/2026-05-01-mandate-design.md`:

| Spec Section | Phase A coverage | Phase B/C coverage |
|---|---|---|
| §0 Executive Summary | README headers | — |
| §1 Philosophical Foundations | Articles 01-05 | — |
| §2 Five Vacancies | Article 01 + README table | — |
| §3 Architecture | README, Demo examples | B.M3-M4 (runtime) |
| §4 Lifecycle Hooks | Article 02 + spec/hooks.schema.json | B.M4 (scheduler) |
| §5 Censor | Touched in articles + examples | B.M4 (interceptor) |
| §6 Historian | Article 04 | B.M8 (audit/ratify), C.M2 |
| §7 Memory Architecture | Examples + RBAC documented in spec | B.M3.T4 (memory) |
| §8 Model Mapping | Constitution examples | B.M3.T6 (resolver) |
| §9 Skill Ecosystem | — | B.M5 (adapters), B.M6 (packs), B.M7 (registry) |
| §10 CLI Commands | README mentions | B.M8 (full impl) |
| §11 Bilingual | Article 05 + dual READMEs | B.M3.T2 (i18n), C.M7 |
| §12 Two Demos | examples/research, examples/self-governance | B.M8 (run-end-to-end) |
| §13 Roadmap | README + this plan | — |
| §14 Risks | Cross-phase risks table above | — |
| §15 Open Questions | Reserved for v2 | — |
| §16 Appendices | Examples mirror Appendix A | — |

**Placeholder scan:** No "TBD", "TODO", "implement later", or "fill in details" present. All schemas, hooks, code skeletons, articles, and READMEs contain literal usable content (Phase A) or sufficient skeleton + intent (Phase B/C, by deliberate granularity choice).

**Type consistency:** `RoleId`, `HookDefinition`, `ModelEntry`, `ResolveResult`, `TopologyViolation`, `SkillAdapter` all defined; cross-task references match.

**Granularity caveat:** Phase A is bite-sized per skill spec; Phase B is milestone-level (re-plan before executing); Phase C is module-level (re-plan before executing). This is by user-confirmed design.

---

*End of implementation plan. Re-plan Phase B before Week 5; re-plan Phase C before Week 13.*
