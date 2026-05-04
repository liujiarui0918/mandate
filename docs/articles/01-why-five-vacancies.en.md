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
