# Mandate · 天命

> **One sentence → a working multi-agent court for any task.**
>
> *The Mandate of Heaven, in code.* Mandate turns any goal into a self-governing imperial court of agents — with daily morning and evening sessions. Bilingual first-class.

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

> **v0.3.1-alpha (May 2026):** `create` and `validate` are live. Until npm publish, run from this repo:
>
> ```bash
> git clone https://github.com/liujiarui0918/mandate
> cd mandate && npm install
> node packages/cli/bin/mandate.mjs create my-empire --template both
> node packages/cli/bin/mandate.mjs validate my-empire
> ```
>
> `genesis`, `evolve`, `run`, `court`, `audit`, `ratify`, `veto` land in v0.4.

## Use Cases — Any Task Becomes a Court

Mandate is a meta-framework: one prompt to `mandate genesis` and you get a fully wired court for any of these (or anything else):

| Domain | One-sentence prompt → |
|---|---|
| 🔬 Research | *"Compile a 10K-word report on fusion energy in 2026"* |
| 📈 Trading | *"Monitor stocks daily, surface 3 opportunities each morning"* |
| 🐦 Content | *"Run my Twitter account: post, engage, analyze, comply"* |
| 💻 Coding | *"Build and ship a Twitter clone in 4 weeks"* |
| 📨 Customer Support | *"Triage and respond to my inbox; escalate edge cases"* |
| 🛠️ Ops | *"24/7 monitor + incident response for my infrastructure"* |
| 📣 Marketing | *"Plan and execute a 30-day product campaign"* |
| 🪞 Self-Governance | *"Reflect on this court itself; propose institutional reforms"* |

Each domain gets the same skeleton: 8 imperial roles, lifecycle hooks, censor layer, historian, daily cadence — only the project groups, charters and skill packs differ.

## Daily Cadence — Morning + Evening Sessions

Every Mandate court runs on a 24h heartbeat:

- **早朝 Morning Court (default 09:00):** Chancellor reports yesterday's results to the Emperor and proposes today's agenda. Emperor ratifies, amends, or redirects. Decisions cascade down to every leaf node.
- **晚朝 Evening Court (default 21:00):** Each leaf node (Soldier / Scout / Secretary) writes a `daily_report.md`. CTOs aggregate per-group; Chancellor synthesizes; report awaits next morning's review.

```bash
$ mandate court morning      # trigger early-morning session manually
$ mandate court evening      # trigger evening debrief manually
$ mandate court status       # next scheduled session + last outcome
```

This is what makes Mandate suitable as a project's *base layer*: predictable touchpoints, failure containment, audit trail by construction. See [Article 06](docs/articles/06-daily-court-cadence.en.md) for the full mechanism.

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

- [x] **Phase A — Methodology** (Weeks 1-4): SPEC, schemas, articles, examples.
- [ ] **Phase B — TypeScript runtime** (Weeks 5-12): three hero CLI commands, eight skill packs.
- [ ] **Phase C — Dashboard 紫禁城** (Weeks 13-20): topology graph, reform PR UI, audit timeline.
- [ ] **v2** — federation across courts, constitution market, Censor of Censors (御史台).

## Status

Phase A in progress. Star this repo to follow Phase B & C development.

## Read More

- [SPEC](docs/specs/2026-05-01-mandate-design.md) — full design specification
- [Article 01: Why Five Vacancies](docs/articles/01-why-five-vacancies.en.md)
- [Article 02: Lifecycle Hooks vs Routing](docs/articles/02-lifecycle-hooks-vs-routing.en.md)
- [Article 03: Topology Constitution](docs/articles/03-topology-constitution.en.md)
- [Article 04: Historian and Reform PRs](docs/articles/04-historian-and-reform-prs.en.md)
- [Article 05: Bilingual First-Class Citizenship](docs/articles/05-bilingual-first-class.en.md)
- [Article 06: Daily Court Cadence](docs/articles/06-daily-court-cadence.en.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues, PRs, and constitutional amendments welcome.

## License

MIT.

## Acknowledgments

Inspired by LangGraph's hierarchical-teams pattern, MetaGPT's SOP discipline, ChatDev's role multiplicity, Paperclip's organizational metaphor, OpenClaw's self-evolution, Anthropic's multi-agent research orchestrator-subagent design, and a thousand years of Tang/Ming bureaucratic tradition.
