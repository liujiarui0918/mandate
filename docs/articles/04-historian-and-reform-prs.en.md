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
