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
