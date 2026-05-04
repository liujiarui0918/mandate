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
