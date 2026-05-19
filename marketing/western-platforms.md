# Western Platforms — Launch Copy

Source-of-truth article: `anchor-en.md` in this directory.

---

## 1. Hacker News (Show HN)

> **Timing matters enormously.** Best slots:
> - Tuesday/Wednesday/Thursday, 7–9am US Pacific
> - Avoid Friday afternoon, Monday morning, weekends, US holidays
>
> **One shot per project.** Don't re-submit; HN penalizes dupes.

### Title (≤ 80 chars)

Pick **one**:

- `Show HN: Mandate – a multi-agent framework modeled on China's imperial court`
- `Show HN: Mandate – multi-agent framework with an Imperial Censor on a separate model`
- `Show HN: Mandate – I rebuilt LangGraph as a Chinese imperial court`

Recommended: **first** (most descriptive, neutral tone, HN-friendly).

### Self-comment (post immediately after submission, **before** anyone else can comment)

```
Author here. Quick context on why this exists.

Every multi-agent framework I've worked with (LangGraph, CrewAI, AutoGen, MetaGPT) reuses the same archetypes: a Planner that decomposes, Managers that route, Workers that execute, optional Reviewer. This is the modern corporation rendered in YAML.

The Chinese imperial bureaucracy ran for 2,000 years and explicitly solved two problems that the corporate metaphor doesn't model well:

1. The 锦衣卫 (Censor) reports directly to the emperor, bypassing the bureaucracy, with the specific job of catching what the bureaucracy hides. In Mandate this is a per-node config (different model than the producer; node-level strategy: red_line/balanced/full). It's not a "Reviewer agent" inside the same chain — it's an out-of-chain auditor.

2. The 史官 (Historian) records every imperial action and drafts reform memorials. In Mandate the Historian appends a JSONL chronicle, detects patterns, and drafts "Reform PRs" — structured proposals to amend the constitution. The Emperor (human) ratifies; the constitution bumps semver.

Plus four other vacancies the corporate metaphor doesn't fill: lifecycle hooks as procedural musts, topology constitution (no parent-child deps), bilingual terms.yaml, and a daily morning/evening court cadence (24h heartbeat against drift).

Live today on npm (alpha):
  npx --yes create-mandate@alpha my-empire --template both

v0.4 adds `mandate genesis "<one-sentence goal>"` — LLM-driven court designer.

MIT-licensed. The codebase is small and readable (~5 packages, < 100kB total).

Happy to answer questions.
```

### Anticipated HN comments + your responses

| Likely comment | Have a reply ready |
|---|---|
| "Cute metaphor, but what does this actually do that LangGraph doesn't?" | Point to: per-node cross-model audit + Reform PRs (atomic constitution amendments). Show a 4-line YAML example. |
| "Why bilingual?" | Not localization — `terms.yaml` lets hooks mix `宰相 must call 锦衣卫` with English. Code-level positional statement. |
| "Daily cadence sounds like cron + a Slack bot." | Right, that's the boring layer. The non-boring part: cron triggers a structured Morning Court that re-evaluates the constitution against the chronicle, can ratify pending Reform PRs, and cascades decisions. The structure is the value, not the scheduler. |
| "How does Censor handle cost?" | Per-node `tier` selects which model class. `red_line` runs minimal validation; `full` runs deep audit. Empirically 1.2–1.4× the producer's cost when used for `balanced`. |
| "Is the imperial metaphor cringe?" | It's a position. The frameworks that don't have a Censor concept aren't neutral; they're making the (unstated) choice that audit is optional. Mandate makes the opposite choice explicit. The metaphor names the choice. |
| "Where's the demo video?" | "Video coming this week — for now: `npx --yes create-mandate@alpha test` runs in 5s, no LLM calls needed." |

### Do / Don't

- ✅ Reply to every comment in the first 6 hours
- ✅ Be concrete; show code/yaml in replies
- ✅ Concede limits honestly (v0.4 not yet shipped → say so)
- ❌ Don't argue about the metaphor — re-anchor on the structural point (cross-model audit)
- ❌ Don't link to other social posts in the HN thread
- ❌ Don't ask friends to upvote (HN flags this aggressively)

---

## 2. Reddit

### r/LocalLLaMA (340k members)

**Title:** `Mandate: a multi-agent framework with cross-model audit (Censor) and self-amending constitution (Historian)`

**Body:**

```
Sharing an OSS multi-agent framework I just published to npm.

TL;DR: instead of CEO/Manager/Worker, the role roster is modeled on the Chinese imperial court — Chancellor, CTO, Scout, Soldier, Secretary + two roles missing from corporate frameworks: Censor (锦衣卫) for cross-model audit, and Historian (史官) for self-amendment via Reform PRs.

Why this matters for local LLM users specifically:

- The Censor runs on a *different model* than the producer. So you can have Chancellor on a big remote model (GPT-5/Claude) and the Censor on a local Llama/Qwen — independent audit without doubling remote spend.
- The Historian writes a JSONL chronicle of every event, fully local. No telemetry, no cloud dependency.
- Constitution is plain YAML, model picks are explicit per role with fallback chains.

Live on npm (alpha):
    npx --yes create-mandate@alpha my-empire --template both

Then:
    cd my-empire
    npx --yes -p @mandateai/cli@alpha mandate validate .

GitHub: https://github.com/liujiarui0918/mandate

v0.4 will add `mandate genesis` (LLM-driven court designer) + the 8 skill packs. Happy to answer anything about the Censor/Historian design.
```

### r/ClaudeAI

**Title:** `Built a Claude-friendly multi-agent framework with cross-model audit — Censor on a different model than the producer`

**Body** (emphasize Claude angle):

```
The single most useful pattern I've found running multi-agent with Claude is putting a *different* model on the auditor — so when Claude is confidently wrong, GPT or Gemini catches it (and vice versa). I built a framework around making this a first-class config rather than a custom integration.

In Mandate, every node has a `censor` config — what model audits it, what tier (red_line/balanced/full), sync or async. So you can express things like "Chancellor on Claude Opus 1M, audited by GPT-5 with full strategy" in 4 lines of YAML.

Also includes lifecycle hooks (procedural musts), no-parent-child topology (forces sibling collaboration), bilingual `terms.yaml`, and a morning/evening court cadence (24h heartbeat).

    npx --yes create-mandate@alpha my-empire --template both

GitHub: https://github.com/liujiarui0918/mandate

The design doc is in docs/specs/ — happy to discuss tradeoffs.
```

### r/programming

**Title:** `Mandate: multi-agent orchestration modeled on the Chinese imperial court (npm + MIT)`

**Body** — keep it concrete, programming-sub culture is anti-hype:

```
Open-source multi-agent framework. Two structural differences from LangGraph/CrewAI/AutoGen:

1. Cross-model Censor — every node's output passes through an auditor on a different model. Configured per-node in YAML.

2. Self-amending constitution — a Historian role detects patterns (failing hooks, model drift), drafts Reform PRs as markdown, human ratifies. Constitution is a YAML file that bumps semver on each ratification.

Both come from explicitly modeling the role set on the Chinese imperial bureaucracy (锦衣卫 + 史官) instead of CEO/Manager/Worker. The metaphor is the point — it lets you express roles the corporate metaphor literally can't.

Code: https://github.com/liujiarui0918/mandate

Try: `npx --yes create-mandate@alpha my-empire --template both`

MIT, ~100kB across 4 npm packages, no external deps beyond ajv and js-yaml.
```

### r/MachineLearning

> **Caveat:** r/MachineLearning is research-heavy; framework launches sometimes get removed as "engineering". Frame around the design contribution.

**Title:** `[P] Multi-agent framework with cross-model audit and second-order feedback (Historian + Reform PRs)`

**Body:**

```
A framework design experiment: what changes if we model multi-agent governance on the Chinese imperial court instead of corporate hierarchies?

Two structural moves:
1. Cross-model audit per node — addresses the "same-model review" failure mode (Reviewer agent and producer share generative bias). Concretely: per-node censor config with model + tier (red_line/balanced/full).
2. Second-order feedback via Reform PRs — Historian role detects patterns in a JSONL chronicle, drafts structured amendments to the constitution. Human ratifies. The system's rules evolve, not just its outputs.

Theoretical pillars: March 1991 exploration/exploitation (hooks as exploitation), Wiener second-order feedback (Historian), Conway's Law (topology constraints in the constitution).

Open-source, MIT: https://github.com/liujiarui0918/mandate

Curious what people think about the cross-model audit pattern specifically — is anyone else doing this? Best precedent I've found is constitutional AI debate setups, but those are still within the same model family.
```

---

## 3. Twitter / X

### Main launch tweet (~270 chars)

```
Most multi-agent frameworks copy CEO/Manager/Worker — the modern corporation in YAML.

I tried something older: the Chinese imperial court. 2000 years, with roles the corporate metaphor literally can't express.

Mandate · 天命 is live on npm.

🔗 github.com/liujiarui0918/mandate
```

### Thread (8 tweets) — post as reply chain to the launch tweet

**Tweet 2/8:**
```
Why this matters:

LangGraph, CrewAI, AutoGen, MetaGPT — same archetypes wearing different names. Planner. Manager. Worker. Optional Reviewer.

That's the modern corporation. ~150 years old. Known pathologies: groupthink, telephone-game decomposition, accountability voids.
```

**Tweet 3/8:**
```
The Chinese imperial court had two roles the corporate metaphor cannot express:

锦衣卫 (Censor) — independent auditor reporting directly to the emperor, bypassing the bureaucracy
史官 (Historian) — records every imperial act, drafts reform memorials

Mandate makes both first-class.
```

**Tweet 4/8:**
```
Censor = cross-model audit, per node, in 4 lines of YAML:

censor:
  default_tier: balanced
  overrides:
    chancellor:
      strategy: full

Chancellor runs on GPT-5? Censor for that node runs on Claude. The same model that produced the bad output can't whitewash the review.
```

**Tweet 5/8:**
```
Historian writes a JSONL chronicle of every event. Detects patterns: repeating failures, hook fires too often, model drift.

Then it drafts Reform PRs as markdown — structured proposals to amend the constitution.

Human (Emperor) ratifies. Constitution bumps semver. Atomic.
```

**Tweet 6/8:**
```
Plus three more vacancies filled:

- Lifecycle hooks as procedural musts (not LLM-routed)
- Topology constitution: parent-child deps forbidden, forces sibling collab
- Bilingual terms.yaml — write hooks in English or Chinese, both first-class
```

**Tweet 7/8:**
```
Live on npm today:

npx --yes create-mandate@alpha my-empire --template both

5 seconds, zero LLM calls, you get a full court scaffold.

v0.4 will add `mandate genesis "<your goal>"` — LLM-driven court designer.
```

**Tweet 8/8:**
```
The whole pitch in one question: who audits the auditor?

In CEO/Manager/Worker, when the review is wrong, no one outside the chain can catch it.
In a court with a Censor, audit exits the chain.

⭐ if this changes how you think about multi-agent: github.com/liujiarui0918/mandate
```

### 5 alternative one-shot tweets (use for follow-up days)

```
1. The Chinese imperial court ran for 2000 years.
   The modern corporation has been around for 150.
   We've been building multi-agent frameworks on the wrong metaphor.

   Mandate · 天命 — multi-agent with 锦衣卫 + 史官
   github.com/liujiarui0918/mandate

2. Hot take: every multi-agent framework with a "Reviewer agent" is performing audit theater.

   Reviewer and Producer share the same model = shared blind spots.

   Cross-model audit (Censor on a different model) is the only honest version.
   Mandate: github.com/liujiarui0918/mandate

3. Watch a Chinese imperial court spin up in 5 seconds:

   $ npx --yes create-mandate@alpha my-empire --template both
   ✓ Mandate court scaffolded at ./my-empire/.mandate

   8 roles. Censor. Historian. Daily court cadence. 100kB.
   github.com/liujiarui0918/mandate

4. Most multi-agent failures aren't "one bad reasoning step."
   They're DRIFT over time.

   Mandate's morning/evening court is a 24h heartbeat designed to catch drift:
   - Structured daily report from every leaf
   - Chronicle aggregation
   - Reform PRs when patterns emerge

5. Open-sourced a multi-agent framework where:
   - The Censor (auditor) runs on a different model than the producer
   - The constitution amends itself via Reform PRs ratified by humans
   - Roles are bilingual (Chinese 宰相/锦衣卫 + English Chancellor/Censor)

   github.com/liujiarui0918/mandate
```

### Visual content to record/produce

1. **15-second screen recording**: terminal, `npx --yes create-mandate@alpha demo --template both`, then `cat .mandate/constitution/constitution.yaml` — shows the court spinning up.
2. **Diagram**: the 8-role court topology (use Excalidraw / Figma — Emperor at top, Chancellor below, then 3 parallel groups, Censor/Historian on the side reporting upward).

---

## 4. Product Hunt

> PH is best for B2B/SaaS, but dev tools can do well. Don't expect HN-level conversion. Treat it as a credibility badge + secondary traffic source.

**Tagline (≤ 60 chars):** `Multi-agent framework with imperial censor + self-amending rules`

**Description:**

```
Mandate is an open-source multi-agent framework that ditches the standard CEO/Manager/Worker hierarchy for a Chinese imperial court model.

What's actually different from LangGraph / CrewAI / AutoGen:

🛡️ Censor (锦衣卫) — independent auditor on a *different model* than the producer, per-node config. Catches what same-model review misses.

📜 Historian (史官) — appends a chronicle of every event, detects patterns, drafts Reform PRs that humans ratify to amend the constitution.

🪝 Lifecycle hooks — workflow discipline as procedural musts (YAML), not LLM-routed conditionals.

🏛️ Topology constitution — parent-child dependencies forbidden, forces sibling collaboration over telephone-game.

🌐 Bilingual first-class — write hooks in English (`chancellor must call censor`) or Chinese (`宰相 must call 锦衣卫`), CLI normalizes both.

⏰ Morning/Evening court — 24h cadence designed to catch drift in long-running agent systems.

Live on npm:
    npx --yes create-mandate@alpha my-empire --template both

MIT-licensed. 4 packages, ~100kB total. Node 20+.

GitHub: github.com/liujiarui0918/mandate
```

**Gallery (5 images recommended):**
1. Hero: court diagram (8 roles + Censor/Historian flow)
2. Terminal screencap: `npx create-mandate` + result
3. constitution.yaml screenshot with annotations
4. Comparison table (Mandate vs LangGraph vs CrewAI)
5. The Reform PR flow diagram

**Maker comment (post within 1h of launch):**

```
Maker here.

I built this because every multi-agent system I deployed in production eventually drifted — slowly stopping doing what it was supposed to. The Reviewer agent pattern didn't catch it because Reviewer shared the same model and same blind spots as the producer.

The Chinese imperial bureaucracy ran for 2000 years on two structural ideas the modern corporate metaphor doesn't capture: cross-channel audit (Censor reports to emperor, not to ministers) and recorded second-order feedback (Historian writes a chronicle that becomes the basis for reform memorials).

Mandate translates both into config — `censor:` block per node, `historian:` block with reflection periods. The metaphor is the point: it names choices that other frameworks leave unstated.

Try it: `npx --yes create-mandate@alpha demo --template both` (5s, no LLM calls).

Questions very welcome.
```

---

## Launch-day timing template (US-centric)

```
T-3 days  : Final README polish + demo GIF recorded
T-2 days  : Anchor article posted on dev.to (sets up "I wrote about it here" replies)
T-1 day   : 2 warm-up tweets (no link to repo yet) on the imperial-court angle
T-0 06:55 : Submit Show HN (US Pacific time)
T-0 07:00 : Post self-comment on HN immediately
T-0 07:15 : Cross-post to Reddit (r/LocalLLaMA, r/ClaudeAI staggered ~30min apart)
T-0 08:00 : Launch tweet + thread on X
T-0 09:00 : Post on Product Hunt
T-0 10:00 : Share to Discord/Slack/group chats
T-0 day   : Reply to every comment within 1h
T+1 day   : Recap thread on X — "First 24h numbers + lessons" (this gets second wave)
T+3 days  : Cross-post anchor article to Medium (different audience)
T+1 week  : Chinese platforms (different timezone optimal)
```
