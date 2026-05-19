# Multi-agent frameworks keep copying corporate hierarchies. I tried something older: the Chinese imperial court.

*A deep dive into Mandate, an open-source multi-agent framework with first-class roles for an Imperial Censor and an Imperial Historian.*

---

## The CEO-Manager-Worker problem

Open any multi-agent framework — LangGraph, CrewAI, AutoGen, MetaGPT, Paperclip — and you'll find the same archetypes wearing different t-shirts:

- A **CEO** node (sometimes "Planner", "Orchestrator", "Manager") that decomposes the task.
- A layer of **Managers** that route work.
- A pool of **Workers** that execute leaf tasks.
- A **Critic** or **Reviewer**, usually optional, usually a function call.

This is the modern corporation, rendered in YAML. It's a familiar mental model — and that's exactly why we keep building it. But the modern corporation is barely 150 years old. It has known pathologies: groupthink in the C-suite, telephone-game decomposition, accountability vacuums when something fails. Three years into the LLM-agent era, we're already running into these pathologies in agent systems.

So I asked a different question: **what if we modeled multi-agent governance on a system that ran for 2,000 years and solved problems modern corporations never did?**

That system is the Chinese imperial court. The result is [**Mandate**](https://github.com/liujiarui0918/mandate) — a multi-agent framework where the orchestration layer is an imperial court instead of an org chart.

This isn't aesthetic. It's structural. The court has roles that the corporate metaphor literally cannot express, and those are exactly the roles modern agent systems need.

---

## The five vacancies

Compare the role rosters:

| Role | Corporate Frameworks | Mandate (Imperial Court) |
|---|---|---|
| Decomposer | CEO / Planner | Chancellor (宰相) |
| Group Lead | Manager | CTO (军师) |
| Researcher | (none, usually fused) | Scout (斥候) |
| Executor | Worker | Soldier (士兵) |
| Synthesizer | (none, usually fused) | Secretary (文官) |
| **Independent auditor on separate model** | ❌ | **Censor (锦衣卫)** |
| **Self-evolution + amendment** | ❌ | **Historian (史官)** |
| Authority | Stakeholder | Emperor (皇帝, human) |

The two bolded roles are the headlines. Let me explain why they matter.

### 1. The Censor (锦衣卫) — independent audit as a first-class citizen

In the historical Ming dynasty, the 锦衣卫 (Embroidered Uniform Guard) reported directly to the emperor, bypassing the bureaucratic chain. Their job was to surface what the bureaucracy was hiding.

Translated to LLM agents: every output from every node passes through a Censor that runs on a **different model** than the producer. If your Chancellor runs on GPT-5.5, your Censor for that node runs on Claude or Gemini. The Censor checks for:

- Schema violations (the constitution declares what's legal)
- Hidden assumptions
- Hallucinated facts
- Topology violations (forbidden parent-child dependencies)

Crucially, **the Censor is not a hook, not middleware, not an optional Reviewer agent**. It's a node-level configuration:

```yaml
censor:
  default_tier: balanced
  overrides:
    chancellor:
      strategy: full
      async: false
    soldier:
      strategy: red_line
      async: true
```

In existing frameworks, the closest thing is a "reviewer" agent that another node calls. That has a fundamental flaw: the same model that produced the bad output also calls the reviewer. When GPT-5 is confident-but-wrong, it stays confident-but-wrong through the review. Cross-model audit breaks that loop.

This is the single most important structural difference. Every other feature follows from taking the Censor seriously.

### 2. The Historian (史官) — second-order feedback through Reform PRs

The 史官 was the imperial historian: they recorded every imperial action, and over time their chronicle became the basis for reform memorials (PRs). Dynasties that took the Historian seriously lasted longer.

In Mandate, the Historian:

1. **Appends every event** to a daily chronicle (JSONL).
2. **Detects recurring patterns** — same role failing the same way, same hook firing too often, model drift.
3. **Drafts Reform PRs** as markdown files in `reforms/` — structured proposals to amend the constitution.
4. **Submits them to the Emperor (human)** for ratification.

When the Emperor ratifies, the constitution is amended atomically (with a semver bump) and recorded in `_ratified.yaml`.

This is what Wiener called *second-order feedback*: the system doesn't just adapt its outputs; it adapts the rules that produce its outputs. Most multi-agent frameworks have zero of this. The closest thing is "prompt optimization", which optimizes a string. Reform PRs amend the entire governance structure.

### 3. Lifecycle Hooks — workflow discipline as procedural musts

Modern frameworks express workflow discipline as routing rules: *"if state is X, go to node Y"*. That's flexible, but it puts discipline inside the LLM's reasoning context, where the LLM can rationalize around it.

Mandate uses **hooks**: YAML-declared steps that fire on lifecycle events (`pre_decompose`, `post_audit`, `before_chronicle`, `pre_ratify`, …). A hook is a procedural *must*. If a hook fails, the parent node is blocked.

This is the *exploration vs exploitation* trade-off from March 1991, applied to agent design: hooks are exploitation (proven discipline), the LLM's freedom between hooks is exploration. Mandate makes this trade-off explicit at the configuration layer.

### 4. Topology Constitution — forbidden parent-child dependencies

In `constitution.yaml`:

```yaml
topology:
  enforce_no_parent_child: true
  on_violation: hard_block
```

A node cannot read its parent's output before producing its own. This sounds restrictive — and it is, intentionally. It forces *sibling collaboration* (groups working in parallel) over *vertical telephone-game* (Manager dictates to Worker who dictates to Sub-Worker).

The Topology Validator runs at three layers:
1. Schema-level (JSON Schema) — declared dependencies are syntactically legal.
2. Static — the dependency DAG is checked at constitution load.
3. Runtime — actual data flow is verified per hook.

Conway's Law says the system you build will mirror your communication structure. Mandate constrains the communication structure at the constitution level.

### 5. Bilingual first-class — Eastern and Western at the code layer

The `terms.yaml` file is not localization. It's structural:

```yaml
chancellor: { en: chancellor, zh: 宰相 }
censor:     { en: censor,     zh: 锦衣卫 }
historian:  { en: historian,  zh: 史官 }
```

When you write a hook, you can write `must: 宰相 must call 锦衣卫 after every 决议` or the English equivalent. The CLI normalizes both. This isn't a feature — it's a position that Eastern and Western governance traditions both have something to teach, and the code should reflect that.

---

## The daily cadence — morning court and evening court

Most multi-agent systems are event-driven: a request comes in, agents fire, return, done. Mandate adds a **24-hour heartbeat**:

- **Morning Court (default 09:00)** — Chancellor reports yesterday's results to the Emperor, proposes today's agenda. Emperor ratifies, amends, or redirects. Decision cascades to every leaf node.
- **Evening Court (default 21:00)** — Every leaf node writes a `daily_report.md`. CTO aggregates per group; Chancellor synthesizes. Report archived for next morning's review.

```bash
$ mandate court morning      # trigger morning court manually
$ mandate court evening      # trigger evening court manually
$ mandate court status       # next scheduled time + last result
```

Why does this matter? Because most production multi-agent failures aren't "a single bad reasoning step." They're *drift over time*: the system slowly stops doing what it was supposed to. A daily cadence with structured reports + cross-model audit + Reform PR feedback is *designed to catch drift*.

This is the killer feature for using Mandate as the substrate layer: predictable touchpoints, failure containment, audit trail by construction.

---

## A worked example: scaffold any task as a court

```bash
$ npx create-mandate@alpha my-empire --template both
ok Mandate court scaffolded at ./my-empire/.mandate (template=both)

$ cd my-empire && cat .mandate/constitution/constitution.yaml
```

You get:

- `.mandate/constitution/charter.md` — the project's purpose, written by you
- `.mandate/constitution/constitution.yaml` — topology, censor config, model assignments
- `.mandate/constitution/terms.yaml` — bilingual term dictionary
- `.mandate/workspace/mandate.md` — the entry document for the court

5 seconds, zero LLM calls. Then `npx -p @mandateai/cli@alpha mandate validate .` checks the constitution.

For v0.4, `mandate genesis "<one-sentence goal>"` will design a full court tailored to that goal — LLM-driven imperial architect.

---

## Use cases

Any domain that involves recurring work + multiple decision points + audit needs:

| Domain | One-sentence prompt → |
|---|---|
| 🔬 Research | "10K-word report on fusion energy state-of-the-art 2026" |
| 📈 Trading | "Daily market scan, surface top-3 opportunities at morning court" |
| 🐦 Content | "Run my Twitter: post, engage, analyze, stay compliant" |
| 💻 Engineering | "Ship a Twitter clone in 4 weeks" |
| 📨 Support | "Triage and reply email; escalate edge cases" |
| 🛠️ Ops | "24/7 infrastructure monitoring + incident response" |
| 📣 Marketing | "Plan and execute a 30-day product campaign" |
| 🪞 Self-governance | "Reflect on the court itself; propose reforms" |

Every domain shares one skeleton: 8 roles, lifecycle hooks, censor layer, historian, daily cadence. Only the groups, charter, and skill packs differ.

---

## What's live today (v0.3.0-alpha.1)

```bash
npx --yes create-mandate@alpha my-empire --template both
```

That's all four packages live on npm:

- `@mandateai/validators` — JSON Schema + topology validation
- `@mandateai/runtime` — constitution loader, chronicle, memory, model resolver, hook scheduler, censor interceptor
- `@mandateai/cli` — `mandate validate / status / explain / ratify / veto / audit / court / genesis / run`
- `create-mandate` — top-level scaffolder

v0.4 will add `mandate genesis` (LLM-driven court design), `mandate run` (orchestration loop), and the eight skill packs (one per imperial role).

---

## Theoretical pillars

Mandate isn't just a metaphor swap. It pulls from five disciplines:

| Discipline | Concept | Where it lands in Mandate |
|---|---|---|
| Management theory | Exploration vs Exploitation (March 1991) | Lifecycle Hooks |
| Political science | Imperial bureaucracy ↔ modern corporation | terms.yaml + role roster |
| Cybernetics | Second-order feedback (Wiener) | Historian + Reform PRs |
| Software engineering | Conway's Law | No-parent-child topology |
| Distributed systems | CAP theorem | Sibling-group topology |

---

## Where to take it

If you're building multi-agent systems, the question I'd push you to answer is: **who audits the auditor?**

In a CEO/Manager/Worker setup, when the Manager's review is wrong, there's no one outside the chain to catch it. In a court with a Censor, the Censor reports to the Emperor (human), not to the Chancellor — and runs on a different model — so the chain has an exit.

That's the whole pitch. Everything else — the historian, the morning court, the bilingual terms — follows from taking *independent audit* seriously.

The repo: **https://github.com/liujiarui0918/mandate**

Try it:

```bash
npx --yes create-mandate@alpha my-empire --template both
cd my-empire
npx --yes -p @mandateai/cli@alpha mandate validate .
```

MIT-licensed. PRs welcome — especially Reform PRs for the constitution of Mandate itself (the project eats its own dogfood).

---

*If this changes how you think about multi-agent governance, ⭐ the repo and let me know what court you build first.*
