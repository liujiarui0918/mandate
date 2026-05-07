# Mandate (天命) — Design Specification

> **Status:** Draft v0.2
> **Date:** 2026-05-01 (v0.1) · 2026-05-06 (v0.2: Daily Court Cadence + meta-framework framing)
> **Author:** ljr-w + Claude (brainstorming session)
> **Slogan:** *The Mandate of Heaven, in code.* / *奉天承运，朝廷自治。*

---

## 0. Executive Summary

**Mandate** is a methodology + reference framework for organizing LLM agents into a self-governing imperial court. It treats **governance** — not orchestration — as the first-class citizen.

While 2026's flagship multi-agent frameworks (LangGraph, CrewAI, Paperclip, OpenClaw, MetaGPT) all converge on "CEO/Manager/Worker" hierarchies, Mandate fills five neglected gaps that none of them addresses systematically:

1. **Censor Layer (锦衣卫) as a first-class citizen** — every node gets a paired auditor on a separate model, configurable per-node intensity.
2. **Lifecycle Hooks** — each role's "discipline" (procedural musts) is formalized as hooks; creative reasoning lives between hooks. This is the first agent framework that operationalizes the *exploration vs exploitation* trade-off (March 1991).
3. **Topology Constitution** — parent/child dependencies between project groups are *forbidden* and enforced via a three-layer defense (compile-time lint + runtime hard-block + post-hoc historian PR).
4. **Historian Layer (史官) for institutional evolution** — chronicles, periodic reform PRs, and event-driven audits create a second-order feedback loop that lets the court evolve its own constitution.
5. **Bilingual first-class citizenship** — Eastern (封建朝廷) and Western (corporate) metaphors coexist via a `terms.yaml` map; CLI output and YAML role names work in either language.

The project ships as **A→B→C sequenced delivery**:
- **Phase A (weeks 1-4):** Methodology authority — bilingual README, SPEC, prompt templates, YAML schema, 5-10 articles. Anyone can implement Mandate on top of LangGraph / Claude Code / Paperclip without our code.
- **Phase B (weeks 5-12):** Reference TypeScript runtime — `npx create-mandate`, `npx mandate genesis`, `mandate evolve`, eight `imperial-*-v1` skill packs.
- **Phase C (weeks 13-20):** Bilingual web dashboard ("紫禁城" / "Forbidden City"). Sequenced after Phase B stabilizes to avoid a head-on collision with Paperclip's first-mover window; differentiates via topology-aware visualization + reform PR review surface + bilingual cultural shell.

---

## 1. Philosophical Foundations

Five disciplinary pillars frame the methodology. Each is referenced by name in the README to give the project academic credibility:

| Discipline | Concept | Implementation Locus |
|---|---|---|
| Management Science | Exploration-vs-Exploitation Dilemma (March, 1991) | Lifecycle Hooks (procedural) + free reasoning (creative) |
| Political Science / History | Imperial Bureaucracy (Tang/Ming) ↔ Modern Corporation | Bilingual term map (`terms.yaml`) |
| Cybernetics | Second-Order Feedback Loop (Wiener; von Foerster) | Historian three-stage process + reform PR ratification |
| Software Engineering | Conway's Law (Conway, 1968) | Project-group topology hard constraint |
| Distributed Systems | CAP Theorem (Brewer, 2000) | Sibling-only DAG; no cross-group decision dependencies |
| Swarm Intelligence | Blackboard Pattern (Hayes-Roth) | Filesystem-as-source-of-truth; role-scoped visibility |

**Design tenet:** Mandate is opinionated about *governance shape* and *forbidden patterns*, but agnostic about *which model runs where*, *which skills attach to which role*, and *what content a role produces*. The court enforces the rules of court; the agents do the thinking.

---

## 2. The Five Vacancies Mandate Fills

Differentiation matrix vs the strongest 2026 incumbents:

| # | Vacancy | Mandate's Fill | Closest Existing | Gap |
|---|---|---|---|---|
| ① | Censor as first-class | Dedicated Censor layer + 3-tier config + per-node override + independent model | LangGraph reviewer node, Paperclip approver | Existing tools treat reviewers as ordinary nodes; none guarantees censor independence or per-node calibration |
| ② | Workflow vs creative formalized | Lifecycle Hooks (must-do procedural acts) + free content space between hooks | Implicit in MetaGPT SOPs | No framework formalizes the dichotomy at the YAML level |
| ③ | Forbidden parent-child topology | Three-layer defense: lint (`mandate validate`) + dispatcher hard-block + historian post-hoc PR | LangGraph allows arbitrary DAGs | Nobody encodes Conway-Law-violation prevention as a constraint solver |
| ④ | Institutional evolution | Historian three-stage: chronicle (passive) + reforms PR (periodic) + audits (event) | OpenClaw `agent-evolver` evolves single agents | No framework evolves the *organization* itself via human-ratified PRs |
| ⑤ | Bilingual cultural metaphor | First-class `terms.yaml` + dual CLI output + dual README narrative arcs | Paperclip is monoculture corporate-en | Eastern open-source projects mostly translate; Mandate makes the metaphor itself bilingual code-level |

---

## 3. Architecture: The Imperial Court

### 3.1 Court Topology (ASCII)

```
┌────────────────────────────────────────────────────────┐
│            皇帝 Emperor (Human Layer)                  │
│   issues mandate / ratifies reforms / vetoes audits    │
└─────────────────────┬──────────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────────┐
│            宰相 Chancellor (CEO Layer)                 │
│  receives mandate → refines → decomposes →             │
│  validates topology → dispatches to project groups     │
└──┬──────────────┬──────────────┬───────────────────────┘
   ▼              ▼              ▼
 ┌Group A┐    ┌Group B┐      ┌Group C┐    ⋯  (parallel, sibling-only)
 │ 军师 cto│    │ 军师 cto│      │ 军师 cto│
 │   ↓↑   │    │   ↓↑   │      │   ↓↑   │
 │ 斥候    │    │ 斥候    │      │ 斥候    │
 │ scout  │    │ scout  │      │ scout  │
 │   ↓    │    │   ↓    │      │   ↓    │
 │士兵×N   │    │士兵×N   │      │士兵×N   │  (intra-group parallel)
 │soldier │    │soldier │      │soldier │
 │   ↓    │    │   ↓    │      │   ↓    │
 │文官    │    │文官    │      │文官    │
 │secretary│   │secretary│     │secretary│
 └────────┘    └────────┘      └────────┘

╔════════════════════════════════════════════════════════╗
║  锦衣卫 Censor — paired with each node, per-node config║
║  audits hook outputs + full agent outputs              ║
║  runs on independent model, never self-audits          ║
╚════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════╗
║  史官 Historian — meta layer (Codex + gpt-5.5)         ║
║  (a) chronicle/*.jsonl   passive logging, 0 LLM cost   ║
║  (b) reforms/PR-NNN.md   periodic LLM reflection       ║
║  (c) audits/AUDIT-NNN.md event-triggered emergency     ║
╚════════════════════════════════════════════════════════╝
```

### 3.2 Eight Roles & Default Model Map

Default model assignments encode the user's original document; `fallback_chain` automatically degrades when a `preferred` model is unavailable.

| Role | zh | Backing CLI | preferred | fallback_chain |
|---|---|---|---|---|
| Emperor | 皇帝 | (Human) | — | — |
| Chancellor | 宰相 | OpenClaw | `gpt-5.5` | gpt-5 → gpt-5-pro → claude-opus-4-7-1m |
| CTO | 军师 | Claude Code | `claude-opus-4-7-1m` | claude-opus-4-7 → claude-sonnet-4-7 |
| Scout | 斥候 | Gemini CLI | `gemini-3.1-pro` | gemini-2.5-pro → perplexity-pro |
| Soldier | 士兵 | Codex | `gpt-5.5` | gpt-5 → claude-sonnet-4-7 |
| Secretary | 文官 | Gemini CLI | `gemini-3.1-pro` | gemini-2.5-pro → claude-sonnet-4-7 |
| Censor | 锦衣卫 | Grok CLI | `grok-4.3` | grok-4 → command-r-plus |
| Historian | 史官 | **Codex** | **`gpt-5.5`** | gpt-5 → gpt-5-pro → claude-opus-4-7-1m |

**Note on Historian model (per user revision 2026-05-01):** Historian uses Codex + gpt-5.5 (same as Soldier). Rationale: Historian processes large chronicle windows for reform synthesis — long-context + strict instruction following are exactly Codex's strengths.

**Reality check (2026-05):** GPT-5.5, Gemini 3.1 Pro, Grok 4.3 are not confirmed publicly available as of the design date. The framework probes availability at startup and falls back per chain. When the preferred model later releases, no user config change is required — the framework auto-upgrades.

### 3.3 Topology Constitution: Forbidden Parent-Child

A *parent-child dependency* exists when project group `B`'s next decision must consume project group `A`'s output. This is forbidden because it breaks parallelism and erodes Conway-Law-clean boundaries.

**Exception:** result-only dependencies (group `B` waits for group `A`'s output but `A`'s output does *not* alter `B`'s decision tree) are legal — modeled as `dependency_kind: result_only`.

**Three-layer defense:**

1. **Compile-time lint** — `mandate validate` walks `decomposition.yaml`, builds the inter-group dependency graph, and emits a warning (non-blocking) if any cross-group dep is decision-affecting.
2. **Runtime dispatcher hard-block** — Chancellor's `on_mandate_received` hook calls `builtin:topology-check`; on detection, dispatch is blocked and the user is shown an auto-merge proposal: *"Merging GroupA + GroupB into GroupAB? (y/N)"*
3. **Historian post-hoc PR** — even if a violation slipped through (e.g., emerged dynamically), the periodic Historian sweep detects it from chronicle and writes `reforms/PR-NNN-merge-X-and-Y.md` for human ratification.

---

## 4. Lifecycle Hooks System

### 4.1 The Core Idea

Each role declares a set of `hooks` — procedural acts the runtime *forces* the agent to perform at lifecycle moments. Between hooks, the agent reasons freely.

> *Workflow ability* = what you must do (clock in, write the weekly report, sign the dispatch ledger).
> *Creative ability* = how you actually do the substantive work.

This dichotomy is **never resolved by routing tasks to different prompts**. It is encoded structurally: the *hook fires* and *its output schema is verified*; the *content* is the agent's free creation.

### 4.2 Hook Trigger Points

The runtime emits these lifecycle events for every role; each role declares which it cares about:

- `on_role_start` — agent boots into session
- `on_input_received` — task input arrives
- `on_<custom_event>` — role-specific events (e.g., `on_scout_report_received`)
- `every_n_steps: K` — periodic check (think "weekly meeting")
- `on_threshold_<X>` — guardrail event (token cap, time cap, error rate)
- `on_output_ready` — before publishing output upward
- `on_role_end` — clean shutdown

### 4.3 Hook Declaration Schema

```yaml
role: <name>
zh: <chinese-name>
hooks:
  <event>:
    - must: "<imperative description of the procedural act>"
      schema: <JSON Schema or filename glob the output must satisfy>
      validator: <builtin: or custom: validator id>          # optional
      timeout_seconds: <int>                                  # optional
      writes_to: <relative path under workspace/ or chronicle/>
      retry_policy: <none | once | linear | exponential>
```

### 4.4 Full Hook Definitions for All Roles

#### Chancellor (宰相)

```yaml
role: chancellor
zh: 宰相
hooks:
  on_mandate_received:
    - must: "Refine the imperial mandate; produce decomposition.yaml with N parallel project groups"
      schema:
        type: object
        properties:
          groups:
            type: array
            items:
              required: [id, goal, deadline, budget_tokens, deps]
      writes_to: workspace/decomposition.yaml
    - must: "Validate inter-group topology; reject if forbidden parent-child detected"
      validator: builtin:topology-check
      retry_policy: none   # hard block
    - must: "Append a decision record to the day's chronicle"
      writes_to: chronicle/{{date}}.jsonl
  on_subtask_dispatch:
    - must: "Generate a charter document for each project group"
      writes_to: workspace/groups/{{group_id}}/group_charter.md
  every_n_steps: 5
    - must: "Sweep all group statuses; write a status report"
      writes_to: workspace/status_report.md
  on_all_groups_completed:
    - must: "Synthesize all final_drafts into the emperor's report"
      writes_to: workspace/final_to_emperor.md
    - must: "Notify Historian for archival (async)"
```

#### CTO (军师)

```yaml
role: cto
zh: 军师
hooks:
  on_assignment_from_chancellor:
    - must: "Author an investigation brief for the Scout"
      writes_to: workspace/groups/{{group_id}}/investigation_brief.md
    - must: "Decide soldier headcount (cap=10) and write worker_plan"
      writes_to: workspace/groups/{{group_id}}/worker_plan.yaml
  on_scout_report_received:
    - must: "Integrate scout findings into the implementation document"
      writes_to: workspace/groups/{{group_id}}/implementation_doc.md
    - must: "Split the implementation into per-worker task files"
      writes_to: workspace/groups/{{group_id}}/workers/{{worker_id}}.md
  on_workers_done:
    - must: "Aggregate worker outputs into a first draft report"
      writes_to: workspace/groups/{{group_id}}/first_draft.md
    - must: "Hand off the first draft to the Secretary"
  on_secretary_done:
    - must: "Submit final group report to Chancellor"
      writes_to: workspace/groups/{{group_id}}/cto_final.md
```

#### Scout (斥候)

```yaml
role: scout
zh: 斥候
hooks:
  on_brief_received:
    - must: "Acknowledge the brief; record sources to investigate"
      writes_to: workspace/groups/{{group_id}}/scout_plan.md
  on_output_ready:
    - must: "Submit a scout report with structured findings + cited sources"
      schema:
        required: [findings, sources, confidence_per_finding]
      writes_to: workspace/groups/{{group_id}}/scout_report.md
```

#### Soldier (士兵)

```yaml
role: soldier
zh: 士兵
hooks:
  on_task_received:
    - must: "Acknowledge the task and confirm understanding"
      writes_to: workspace/groups/{{group_id}}/workers/{{worker_id}}_ack.md
  on_output_ready:
    - must: "Deliver the work product per the implementation doc"
      writes_to: workspace/groups/{{group_id}}/workers/{{worker_id}}_output.md
    - must: "Update progress in worker_log.jsonl"
      writes_to: workspace/groups/{{group_id}}/worker_log.jsonl
```

#### Secretary (文官)

```yaml
role: secretary
zh: 文官
hooks:
  on_first_draft_received:
    - must: "Polish prose, layout, visual hierarchy without altering substance"
      writes_to: workspace/groups/{{group_id}}/final_draft.md
    - must: "Diff against first_draft and log scope of changes"
      writes_to: workspace/groups/{{group_id}}/secretary_diff.md
```

#### Censor (锦衣卫)

```yaml
role: censor
zh: 锦衣卫
hooks:
  on_subject_hook_fired:                # observes other agents' hooks
    - must: "Validate the subject's hook output against its declared schema"
      validator: schema-from-subject
    - must: "Run hallucination + drift checks on substantive content"
      writes_to: audits/{{subject_role}}/{{ts}}.md
  on_red_line_triggered:
    - must: "Escalate to Emperor via audits/EMERGENCY-{{ts}}.md"
      writes_to: audits/EMERGENCY-{{ts}}.md
```

#### Historian (史官)

```yaml
role: historian
zh: 史官
backing_cli: codex                      # per design revision 2026-05-01
preferred_model: gpt-5.5
hooks:
  on_any_hook_fired:                    # ambient passive logger
    - must: "Append structured event to chronicle (no LLM call)"
      writes_to: chronicle/{{date}}.jsonl
  on_periodic_reflection:               # weekly or every-N-tasks
    - must: "Read chronicle window; identify recurring patterns / inefficiencies"
    - must: "Author one or more reform proposals as PR files"
      writes_to: reforms/PR-{{auto_num}}-{{slug}}.md
  on_event_audit:                       # triggered by red_line or `mandate audit`
    - must: "Author an emergency audit report"
      writes_to: audits/AUDIT-{{ts}}-{{slug}}.md
```

### 4.5 Runtime Behavior

1. When a hook fires, the runtime *injects* into the agent's prompt: *"Before you continue, you must perform the following: [hook descriptions]. Each must produce the named artifact at the named path matching the named schema."*
2. After the agent returns, the runtime checks each `must`'s artifact existence and schema compliance.
3. If non-compliant: Censor is invoked (per its own config) and may demand a redo.
4. Once all musts pass, the agent is free to continue substantive reasoning.

---

## 5. The Censor Layer (锦衣卫)

### 5.1 Three Tiers + Per-Node Override

```yaml
mandate:
  censor: balanced               # paranoid | balanced | frugal — global default
  censor_overrides:
    chancellor:
      strategy: full             # every hook + every output
      async: false               # block until censor passes
      model: grok-4.3
    soldier:
      strategy: sample
      rate: 0.05                 # 5% of outputs sampled
      async: true                # never blocks
    historian:
      strategy: red_line         # only on threshold trips
```

### 5.2 Strategy Semantics

| Strategy | Frequency | Sync/Async | Cost vs baseline |
|---|---|---|---|
| `full` | every hook artifact + every full output | sync (blocking) | ~2.5× |
| `sample` | random N% per `rate` | async | ~1.05–1.3× |
| `red_line` | only on schema violation / token cap / output anomaly / explicit `mandate audit` | sync when fires | ~1.05× |

### 5.2.1 Default Strategy Per Tier

The three global tiers expand into per-role defaults like this (users may override any cell via `censor_overrides`):

| Role | `paranoid` | `balanced` (default) | `frugal` |
|---|---|---|---|
| Chancellor | full, sync | full, sync | sample 30%, async |
| CTO | full, sync | full, sync | sample 30%, async |
| Scout | full, sync | sample 30%, async | red_line |
| Secretary | full, sync | sample 30%, async | red_line |
| Soldier | full, sync | sample 10%, async | red_line |
| Historian | full, sync | red_line | red_line |
| Emperor | (Human, no censor) | (Human, no censor) | (Human, no censor) |

Rationale: Chancellor/CTO are decision multipliers — errors propagate downstream, so they're censored heavily under `balanced`. Soldiers are leaves; their errors are localized, so light sampling is sufficient. Historian's outputs are PRs (human-ratified anyway), so red_line is enough.

### 5.3 Why Independent Model

Censor must run on a model architecturally distinct from the subject. Default `grok-4.3` (per the user's original design) reflects Grok's empirically lower hallucination rate on factual checks. Falling back to `command-r-plus` keeps censor diversity even if Grok is unavailable.

A subject *cannot* be censored by the same model family it runs on — the runtime enforces this at startup, refusing degenerate configs.

---

## 6. The Historian Layer (史官) & Institutional Evolution

### 6.1 Three-Stage Process

| Stage | Trigger | Cost | Output | Path |
|---|---|---|---|---|
| Chronicle | every hook fire | 0 LLM | structured JSONL log | `chronicle/{{date}}.jsonl` |
| Reform | every 7 days **OR** every 50 tasks (whichever first) | 1 LLM batch run (Codex + gpt-5.5) | PR markdown | `reforms/PR-NNN-{{slug}}.md` |
| Audit | red_line trigger / explicit `mandate audit` | 1 LLM run | emergency report | `audits/AUDIT-{{ts}}-{{slug}}.md` |

### 6.2 Reform PR Workflow (Hero Moment)

```
$ mandate audit
📜 史官启奏：审最近 7 日，发现 3 处宪法漏洞
   reforms/PR-001-merge-research-and-content.md
   reforms/PR-002-add-default-timeout.md
   reforms/PR-003-raise-chancellor-token-budget.md

$ git diff reforms/

$ mandate ratify PR-001                    # emperor's vermillion seal
✓ constitution.yaml: v1.2.4 → v1.3.0
✓ reforms/_ratified.yaml updated
✓ next mandate run will use new constitution
```

**Key invariants:**
- Historian *never* edits `constitution.yaml` directly — only writes proposals.
- Ratification is `git apply` style (deterministic patches), not LLM rewrites.
- Rejected PRs (`mandate veto PR-002`) move to `reforms/_rejected/` with the rejection reason.

### 6.3 Constitution Versioning

`constitution.yaml` carries a `version: x.y.z` field; ratification bumps it. Major (x) for topology changes; minor (y) for new roles or hook additions; patch (z) for parameter tweaks.

---

## 7. Shared Memory Architecture

### 7.1 Filesystem Layout

```
.mandate/
├── constitution/                # invariant rules — emperor's will
│   ├── constitution.yaml        # court charter (topology / censor tiers / model map)
│   ├── charter.md               # project mission
│   ├── terms.yaml               # bilingual term map
│   └── reforms/                 # ratified PRs
│       ├── PR-001-...md
│       └── _ratified.yaml       # merged PR ledger
│
├── memory/                      # long-term project knowledge (RAG-indexed)
│   ├── facts/                   # atomic factual snippets
│   ├── decisions/               # architecture decision records
│   └── lessons/                 # post-mortems
│
├── chronicle/                   # raw execution log
│   ├── 2026-05-01.jsonl
│   └── _index.json
│
├── workspace/                   # current task — reset per mandate run
│   ├── mandate.md               # this round's imperial decree
│   ├── decomposition.yaml       # chancellor's split
│   ├── status_report.md         # chancellor's periodic sweep
│   ├── final_to_emperor.md      # final synthesis
│   └── groups/<group_id>/
│       ├── group_charter.md
│       ├── investigation_brief.md
│       ├── scout_plan.md
│       ├── scout_report.md
│       ├── implementation_doc.md
│       ├── worker_plan.yaml
│       ├── worker_log.jsonl
│       ├── workers/<worker_id>_ack.md
│       ├── workers/<worker_id>_output.md
│       ├── first_draft.md
│       ├── secretary_diff.md
│       ├── final_draft.md
│       └── cto_final.md
│
└── audits/                      # censor + historian incident reports
    ├── chancellor/
    ├── EMERGENCY-{{ts}}.md
    └── AUDIT-{{ts}}-{{slug}}.md
```

### 7.2 RBAC Visibility Matrix

| Role | Read | Write |
|---|---|---|
| Emperor | all | constitution/, mandate.md, ratification commits |
| Chancellor | constitution/, memory/, workspace/* | decomposition.yaml, status_report.md, final_to_emperor.md, chronicle |
| CTO | constitution, memory, *own* group | own group files |
| Scout / Soldier | constitution (slim), own group, own subtask | own subtask files, worker_log |
| Secretary | own group | final_draft.md, secretary_diff.md |
| Censor | subject's group + chronicle | audits/{{subject_role}}/ |
| Historian | all (read-only) | chronicle/, reforms/, audits/ |

### 7.3 Indexing & Retrieval

- `memory/` is indexed by **lunr.js** (Phase B Node) or **sqlite-vss** (if configured) — *no external vector DB dependency in v1*.
- `chronicle/` is line-indexed by `_index.json` for cheap range queries.
- `workspace/` is ephemeral; cleared on each `mandate run` with a snapshot stored in `chronicle/_snapshots/`.

### 7.4 Concurrency

- Different groups write physically disjoint paths (`workspace/groups/<id>/`), eliminating most concurrent-write hazards.
- Where unavoidable (e.g., chronicle), the runtime uses an atomic-append pattern (write to temp, rename).
- Constitution edits are serialized through the ratify command; never written from agent code paths.

---

## 8. Model Mapping (Three-Tier Default)

### 8.1 Resolution Algorithm

```
for each role:
  1. read user's mandate.config.yaml override (if any)
  2. else read constitution.yaml model entry (preferred + fallback_chain)
  3. probe preferred (1-token ping) — accept if 200 within 5s
  4. else iterate fallback_chain — accept first that passes probe
  5. cache result in .mandate/.model_health.json (24h TTL)
  6. log: "📜 chancellor: gpt-5.5 unavailable → gpt-5 ✓"
```

### 8.2 Strict Mode

```yaml
mandate:
  model_resolution:
    strict: true        # refuse to start if any preferred fails
```

For compliance scenarios where a fallback is unacceptable.

### 8.3 Cost Awareness

Each role config can carry `budget_tokens_per_run`; runtime totals up and aborts if a single mandate exceeds the global cap. Reported in `chronicle/` for cost retrospectives.

---

## 9. Skill Ecosystem

### 9.1 Multi-Protocol Adapter

Adapters all expose `{name, input_schema, output_schema, run(input) -> output}`:

- `mcp` — Model Context Protocol (preferred for new tools)
- `claude-skill` — Claude Code skills (`~/.claude/skills/`)
- `openclaw-skill` — OpenClaw skills (`~/.openclaw/skills/`, ClawHub)
- `cli` — raw CLI wrapper with stdin/stdout JSON contract
- `mandate-builtin` — packaged with `@mandate/runtime`

### 9.2 Skill Discovery

```yaml
mandate:
  skill_resolution:
    discovery_order: [local, mandate-registry, npm, clawhub]
    auto_assign: true
```

- `local` — checks `~/.claude/skills/`, `~/.openclaw/skills/`, `./node_modules`
- `mandate-registry` — official skill index (HTTP, signed manifests)
- `npm` — `@mandate-skills/*` scope on npm
- `clawhub` — fallback to OpenClaw's registry (skills wrapped with adapter)

Found locally? Use it. Not local? Download to `.mandate/skills/` and cache. Show source provenance in CLI logs.

### 9.3 Skill Packs (v1, Eight Official)

| Pack | Bundles |
|---|---|
| `imperial-emperor-v1` | CLI UX prompts, ratification helper, charter authoring |
| `imperial-chancellor-v1` | task decomposition, dependency-graph analysis, topology validator |
| `imperial-cto-v1` | investigation-brief authoring, implementation-doc authoring, subtask scheduler |
| `imperial-scout-v1` | web search (Brave/Tavily), deep-research, web-fetch, source-verifier |
| `imperial-soldier-v1` | code generation, text generation, file ops |
| `imperial-secretary-v1` | markdown beautifier, layout polisher, citation formatter |
| `imperial-censor-v1` | PII detection, fact-check probes, red-line lexicon, confidence scoring |
| `imperial-historian-v1` | chronicle aggregator, pattern detector, reform-PR drafter (Codex-driven) |

### 9.4 Pack Composition

```yaml
scout:
  skill_pack: imperial-scout-v1
  # advanced override
  skill_pack_overrides:
    extends: imperial-scout-v1
    exclude: [openclaw-skill:web-fetch]
    add:
      - mcp: tavily
```

---

## 10. CLI Surface (Three Hero Commands)

### 10.1 `npx create-mandate` — Static Scaffolder

```
$ npx create-mandate my-empire --template both
? Project language for CLI/docs: zh / en / both [both]
? Default censor tier: paranoid / balanced / frugal [balanced]
? Default Historian period: 7d / 50tasks / both [both]
? Include demo B (Deep Research)? [Y/n]
? Include demo C (Self-Governance)? [Y/n]
✓ .mandate/ generated (2.4s, 0 LLM calls)
✓ Run: cd my-empire && mandate run "<your first decree>"
```

Templates: `research` (demo B only), `self-governance` (demo C only), `both` (default), `bare` (no demos).

### 10.2 `npx mandate genesis` — LLM-Driven Court Designer

```
$ npx mandate genesis "I want a multi-agent system to monitor stock markets"
📜 Convening provisional court (3 ephemeral agents)...
📜 Provisional Chancellor refines requirements...
📜 Provisional CTO drafts initial topology...
📜 Provisional Censor reviews for forbidden patterns...
✓ Generated: constitution/ + first workspace/mandate.md
✓ Run: mandate run
   (estimated tokens used: 18,420 ≈ $1.20)
```

Provisional agents are ephemeral — they author the court structure and exit. Their reasoning is preserved in `chronicle/_genesis.jsonl` so the new court has full context of its own origin.

### 10.3 `mandate evolve` — Self-Modifying Court

```
$ mandate evolve "Add an Investigative Bureau to check the Censors themselves"
📜 Historian intake → convene reflection court
📜 Wrote reforms/PR-042-add-investigative-bureau.md
$ git diff reforms/PR-042-...
$ mandate ratify PR-042
✓ constitution.yaml v1.3.0 → v1.4.0 (new role: bureau)
✓ next mandate run will materialize the new layer
```

Internally `evolve` is a thin wrapper over the Historian's reflection pathway, plumbed to a CLI input.

### 10.4 Auxiliary Commands

- `mandate run [decree]` — execute a mandate (interactive or arg)
- `mandate validate` — static lint of constitution + decomposition
- `mandate audit` — force a Historian audit pass
- `mandate ratify <PR-id>` — apply a reform PR
- `mandate veto <PR-id>` — reject a reform PR
- `mandate status` — show in-flight groups and budgets
- `mandate explain <role>` — print the role's hooks + skills + visible files

---

## 11. Bilingual First-Class Citizenship

### 11.1 `terms.yaml`

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
```

YAML accepts either side as the canonical key (`role: 宰相` ≡ `role: chancellor`).

### 11.2 CLI Output

```
$ MANDATE_LANG=zh mandate run
📜 宰相已就位 — gpt-5（fallback from gpt-5.5）

$ MANDATE_LANG=en mandate run
📜 Chancellor in session — gpt-5 (fallback from gpt-5.5)

$ MANDATE_LANG=both mandate run
📜 宰相 (Chancellor) 已就位 — gpt-5
```

### 11.3 Documentation

- `README.md` (en) and `README.zh.md` (zh) are equally maintained — neither is a translation; each is the *primary* face for its audience.
- Methodology articles in `docs/articles/` ship in pairs (`*.en.md` + `*.zh.md`).
- Code identifiers are English (chancellor, censor, historian) for global contributor friendliness.

---

## 12. Two Demos

### 12.1 Demo B — Deep Research

**Decree:** *"Produce a publication-grade research report on the state of fusion energy in 2026, with citations."*

**Court behavior:**
- Chancellor decomposes into 3 sibling groups: Technology, Companies, Regulation.
- Each group's CTO authors an investigation brief; Scout runs deep-research + source-verifier.
- Soldiers (1 per subsection) draft prose.
- Secretary polishes; CTO assembles; Chancellor synthesizes.
- Final artifact: `workspace/final_to_emperor.md` — citation-rich markdown.

**Demo gif:** ~30 seconds of fast-forwarded `mandate run` showing parallel groups, censor interventions, final report.

### 12.2 Demo C — Self-Governance

**Decree:** *"Reflect on this court's last week of operation; propose institutional reforms."*

**Court behavior:**
- Historian (Codex + gpt-5.5) reads chronicle — identifies recurring inefficiencies (token waste, redundant scout calls, unclear charters).
- Drafts 2-3 reform PRs.
- Emperor reviews diffs; ratifies one, vetoes another, edits the third.
- Constitution version bumps; next mandate uses new rules.

**Demo gif:** the `mandate evolve` flow as shown in §10.3, with `git diff` and `mandate ratify` steps emphasized.

---

## 13. Roadmap

### Phase A — Methodology Authority (Weeks 1-4)

Deliverables:
- Bilingual top-level `README.md` + `README.zh.md`
- This SPEC document
- `docs/articles/` × 5-10 (one article per pillar / per vacancy filled)
- `examples/research-template/` — full `.mandate/` for Demo B
- `examples/self-governance-template/` — full `.mandate/` for Demo C
- `spec/constitution.schema.json` — JSON Schema for `constitution.yaml`
- `spec/hooks.schema.json` — JSON Schema for hook declarations
- `terms.yaml` — bilingual term map

Anyone can reproduce Mandate on top of LangGraph / Claude Code / Paperclip from this material.

### Phase B — Reference Implementation (Weeks 5-12)

TypeScript pnpm monorepo:

```
mandate/
├── packages/
│   ├── core/                    # runtime: hook scheduler, censor interceptor, file lock
│   ├── cli/                     # create-mandate, genesis, evolve, run, audit, ratify
│   ├── adapters/                # MCP / claude-skill / openclaw-skill / cli
│   ├── packs-imperial-v1/       # 8 skill packs
│   ├── registry/                # skill discovery & download
│   └── validators/              # topology-check, schema validators
├── docs/
├── examples/
│   ├── research/
│   └── self-governance/
└── spec/
```

Phase B exit criteria:
- Both demos run end-to-end on a fresh machine after `npx create-mandate`.
- CI runs both demos against mocked LLM responses.
- One technical blog post published.
- One ≤90s demo video.

### Phase C — Bilingual Dashboard "紫禁城" (Weeks 13-20, sequenced after Phase B)

Web dashboard for visualizing and operating a running court. Starts only after Phase B exit criteria are met; its purpose is to convert Phase A/B's methodology authority + working runtime into a visual product surface that retains users.

**Differentiators vs Paperclip's task-list dashboard:**
- **Topology-aware visualization** — animated court graph (皇帝 → 宰相 → 项目组 → 各角色) with live agent state, hook firings, and censor interceptions overlaid in real time
- **Reform PR review as a primary surface** — diff viewer + ratify/veto buttons in browser; constitution version history timeline. Paperclip has no concept of constitution evolution.
- **Bilingual cultural shell** — UI chrome themed as "紫禁城" with optional plain Western "court" theme; language switch in nav. Visual moat that no English-only competitor will replicate.
- **Censor audit timeline** — red-line events, drift detections, hallucination flags filterable per role with drill-down to the offending hook output
- **Per-mandate cost & token dashboard** — live spend, fallback chain decisions, model probe history

**Tech stack (proposed):** Next.js 15 (App Router) + React 19 + Tailwind v4 + shadcn/ui + tRPC + Server-Sent Events for live chronicle stream + d3.js / React Flow for topology graph. Backend reuses `@mandate/runtime`'s runtime — dashboard is a thin presentation tier over the same files-as-source-of-truth.

**Phase C exit criteria:**
- Dashboard renders any `.mandate/` directory in real time
- Reform PR ratify/veto from UI produces identical git history to CLI ratify
- Topology graph animates ≥5 concurrent agents at 30fps
- Bilingual UI passes parity check (no string drift)
- Demo C ("self-governance") is recorded as a 60-90s screencast purely from the dashboard

**Phase C is in the long-term roadmap, not deferred.** Phase A and B are sequenced first to avoid premature platform competition with Paperclip; Phase C launches once Mandate's methodology + runtime have established differentiated mindshare.

---

## 14. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Paperclip parity confusion ("just another zero-human company framework") | High | High | Lead with the **5 vacancies** narrative; bilingual cultural moat; sequence Phase C dashboard after Phase B traction (weeks 13-20), so Mandate enters the platform contest with established methodology + runtime authority instead of as a copycat |
| Default model unavailability (gpt-5.5 etc.) | Certain | Medium | Three-tier fallback chain; clear startup logs about substitutions |
| Hook fatigue (too many forced acts slow agents) | Medium | Medium | Default hook set is minimal; per-role `hooks.disable: [<event>]` for opt-out |
| Censor budget blowout | Medium | High | Default `balanced` tier samples 30%/10% on inner layers; `frugal` exists for cost-sensitive users |
| Constitutionally invalid genesis output | Low | Medium | `mandate validate` runs immediately after `genesis`; provisional court itself includes a Censor |
| Reform PR backlog | Medium | Low | UI affords batch ratify/veto; PRs older than 30 days auto-archive |
| Bilingual maintenance drift | Medium | Low | CI enforces parallel structure of `*.en.md` and `*.zh.md` (heading count parity) |

---

## 15. Open Questions / Future Work

1. **Inter-court federation** — multiple Mandate courts collaborating across organizations (akin to Ruflo's federation, but with explicit treaty/protocol layer). v3 horizon.
2. **Constitution market** — community-shared `constitution.yaml` archetypes (e.g., "research-lab court", "media-team court", "trading-desk court"). Phase B+ depending on adoption.
3. **Censor of Censors (御史台)** — the user already raised this as an evolve example; whether to pre-bake or leave to user evolution. Currently leaning *leave to user*, since it makes a great evolve demo.
4. **Probabilistic hooks** — hooks with `p: 0.7` execution probability (e.g., for stochastic exploration). Not in v1.
5. **Cross-mandate memory continuity** — currently `workspace/` resets per run; should some long-running projects keep workspace? Likely yes via `--persistent-workspace` flag, deferred.

---

## 16. Appendices

### Appendix A — Minimal `constitution.yaml`

```yaml
version: 1.0.0
project: my-empire
language: both                     # zh | en | both
charter_path: charter.md

topology:
  enforce_no_parent_child: true
  on_violation: hard_block         # warn | hard_block | auto_merge

censor:
  default_tier: balanced
  overrides:
    chancellor: { strategy: full, async: false }
    soldier:    { strategy: sample, rate: 0.05 }

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
                                    # Historian uses Codex + gpt-5.5 per design revision 2026-05-01

skill_resolution:
  discovery_order: [local, mandate-registry, npm, clawhub]
  auto_assign: true
```

### Appendix B — Glossary (en/zh)

See `constitution/terms.yaml`.

### Appendix C — References

- March, J. G. (1991). *Exploration and Exploitation in Organizational Learning*. Organization Science 2(1).
- Conway, M. E. (1968). *How Do Committees Invent?*. Datamation.
- Brewer, E. (2000). *Towards Robust Distributed Systems*. PODC keynote.
- Wiener, N. (1948). *Cybernetics: Or Control and Communication in the Animal and the Machine*.
- Anthropic Engineering (2025). *How we built our multi-agent research system*. https://www.anthropic.com/engineering/multi-agent-research-system
- LangGraph Docs. *Hierarchical Agent Teams*. https://langchain-ai.github.io/langgraph/tutorials/multi_agent/hierarchical_agent_teams/
- Hong, S. et al. (2023). *MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework*. arXiv:2308.00352.
- Qian, C. et al. (2024). *ChatDev: Communicative Agents for Software Development*. ACL 2024.
- Paperclip. *Open-source orchestration for zero-human companies*. https://github.com/paperclipai/paperclip
- OpenClaw. https://github.com/openclaw/openclaw

---

*End of design specification (v0.1). v0.2 addendum follows.*

---

## 17. Daily Court Cadence — Morning + Evening Sessions (v0.2)

### 17.1 Why a Cadence

Without a heartbeat, an agent system drifts. Tasks pile up, status is opaque, the Emperor (human) loses the picture. A daily cadence imposes a 24h rhythm: the morning sets direction, the evening closes the books. This is the *standup + retro* of organizational practice, dressed in imperial form.

This single mechanism converts Mandate from "a framework you configure once" into "a court that runs itself daily" — and is what makes Mandate suitable as the **base layer for any project**: any domain (research, trading, content, ops, coding) gets the same predictable rhythm without per-domain customization.

### 17.2 Morning Court (早朝)

**Default time:** 09:00 local. Configurable.

```
Step 1  Chancellor loads chronicle/<yesterday>.jsonl
Step 2  Chancellor authors morning_court_report.md:
        - Yesterday: completion summary per project group
        - Outstanding / blocked items
        - Censor + Historian highlights
        - Today's draft agenda
Step 3  Report rendered to Emperor (CLI panel / dashboard popup)
Step 4  Emperor decides: approve / amend / redirect
        - Timeout default 30 min → approve_all
Step 5  Chancellor materializes today_decomposition.yaml from ratified agenda
Step 6  Cascade dispatch: triggers on_morning_dispatch_received
Step 7  Each group's CTO authors today_group_brief.md
        and dispatches further to Scout/Soldier/Secretary
```

### 17.3 Evening Court (晚朝)

**Default time:** 21:00 local. Configurable.

```
Step 1  Leaf nodes (Soldier / Scout / Secretary) fire on_evening_self_report:
        - daily_report.md per node:
          * tasks completed today
          * blockers / unfinished + reasons
          * tomorrow's expected work (optional)
Step 2  Each group's CTO fires on_evening_aggregate:
        - reads all leaf daily_report.md in this group
        - produces group_evening_report.md
Step 3  Chancellor fires on_evening_synthesis:
        - aggregates all group_evening_report.md
        - produces chancellor_evening_report.md
        - filed in chronicle/evening-courts/{date}.md
        - awaits next morning's review
```

### 17.4 Configuration Schema (added to constitution.yaml)

```yaml
court_cadence:
  enabled: true                              # set false to disable cadence entirely
  morning_court:
    time: "09:00"                            # 24h "HH:MM" or cron expression
    emperor_decision_timeout_minutes: 30
    on_timeout: approve_all                  # approve_all | hold | escalate
  evening_court:
    time: "21:00"
    leaf_report_required: true               # every leaf node must produce daily_report
    skip_if_no_activity: true                # skip cadence if zero tasks ran today
  timezone: Asia/Shanghai                    # IANA tz name
```

### 17.5 New Lifecycle Hook Events

Four new events extend §4.2:

| Event | Fires on | Default subscribers |
|---|---|---|
| `on_morning_court_start` | scheduler tick at morning time | Chancellor only |
| `on_morning_dispatch_received` | after Emperor ratifies agenda | CTO, then cascades to Scout/Soldier/Secretary |
| `on_evening_report_due` | scheduler tick at evening time | every leaf node (Scout, Soldier, Secretary) |
| `on_evening_aggregate_due` | after all leaves report | CTO first, then Chancellor |

Hook authoring follows the same schema in §4.3. Example for Chancellor:

```yaml
hooks:
  on_morning_court_start:
    - must: "Read yesterday's chronicle and produce morning_court_report.md"
      writes_to: chronicle/morning-courts/{{date}}.md
      schema:
        required: [yesterday_summary, outstanding_items, today_draft_agenda]
    - must: "Render report to Emperor; await ratification"
      timeout_seconds: 1800                   # 30 minutes
      retry_policy: none
  on_evening_synthesis:
    - must: "Aggregate all group_evening_report.md into chancellor_evening_report.md"
      writes_to: chronicle/evening-courts/{{date}}.md
```

### 17.6 New CLI Commands

| Command | Effect |
|---|---|
| `mandate court morning` | Manually trigger morning court (good for first run / debug) |
| `mandate court evening` | Manually trigger evening court |
| `mandate court status` | Show next scheduled court time + last court outcome |
| `mandate court skip --today` | Skip today's cadence (holidays, manual override) |

These integrate into §10's CLI surface alongside `run / genesis / evolve / audit / ratify / veto / validate / status / explain`.

### 17.7 Filesystem Additions

Extends §7.1:

```
.mandate/
├── chronicle/
│   ├── morning-courts/
│   │   └── 2026-05-04.md                    # 早朝奏报 + emperor ratification record
│   └── evening-courts/
│       └── 2026-05-04.md                    # 晚朝综合报告
├── workspace/
│   ├── today_agenda.md                      # produced by morning court
│   └── groups/<group_id>/
│       ├── today_brief.md                   # produced by CTO after morning dispatch
│       └── workers/<worker_id>_daily_report.md  # leaf evening report
```

### 17.8 Why This Is the Defining Feature

1. **Predictable human-in-the-loop touchpoints** — instead of ad-hoc interruptions, the Emperor reviews at fixed times, freeing both human and machine.
2. **Failure-mode containment** — if a group drifts, the next morning's report surfaces it. If a leaf is stuck, evening report flags it. No silent failures spanning days.
3. **Audit trail by construction** — every working day produces a paired `morning-courts/{date}.md` + `evening-courts/{date}.md`. The court's history reads like a real organization's records.
4. **Cultural resonance** — "早朝" / "晚朝" in Chinese imperial tradition (Ming-Qing daily 朝会), "morning briefing / evening debrief" in Western corporate culture. Both audiences immediately grok the metaphor.
5. **Meta-framework enabler** — combined with `mandate genesis "<any task>"`, this means *any project* gets the same daily rhythm out of the box. Mandate becomes the operating system, the user's prompt is the only domain-specific input.

### 17.9 Bilingual Term Additions (terms.yaml)

```yaml
morning_court: { zh: 早朝, en: morning_court, alias: morning_session }
evening_court: { zh: 晚朝, en: evening_court, alias: evening_session }
daily_report:  { zh: 日报, en: daily_report }
agenda:        { zh: 议程, en: agenda }
ratify_agenda: { zh: 批红议程, en: ratify_agenda }
```

### 17.10 Changes to Other Sections

- **§4.2** (Hook trigger points): add the four events from §17.5.
- **§7.1** (Filesystem layout): add the three new path patterns from §17.7.
- **§10.4** (Auxiliary commands): add the four `mandate court ...` commands.
- **§12** (Two Demos): both demos now run on the daily cadence by default; first morning court is auto-triggered on `mandate run` if no agenda exists yet.
- **§13** (Roadmap): cadence is part of Phase A spec; CLI implementation in Phase B.M8; dashboard renders cadence timeline in Phase C.M5.

---

*End of v0.2 addendum. Ratify, veto, or amend.*
