# Daily Court Cadence: Morning + Evening Sessions

> The single mechanism that turns Mandate from "a framework you configure once" into "a court that runs itself every day".

## The Missing Heartbeat

Every multi-agent framework will tell you it can run continuously. Few will admit that without a rhythm, continuous quickly becomes chaotic. Tasks pile up. Status is opaque. The human-in-the-loop drifts out of the loop.

Real organizations solved this centuries ago. The Ming and Qing courts held 早朝 (morning court) at dawn — the Chancellor reported yesterday's affairs and proposed today's agenda; the Emperor ratified, amended, or redirected. At dusk, 晚朝 collected the day's outcomes back upward. The pattern is universal: morning briefing, evening debrief. Mandate makes it the heartbeat of the entire agent system.

## Morning Court (早朝) — 09:00

```
Step 1  Chancellor reads chronicle/<yesterday>.jsonl
Step 2  Chancellor authors morning_court_report.md
        - Yesterday's per-group completion summary
        - Outstanding / blocked items
        - Censor + Historian highlights
        - Today's draft agenda
Step 3  Report renders to Emperor (CLI / dashboard)
Step 4  Emperor decides: approve / amend / redirect
        - Default: 30-minute timeout → approve_all
Step 5  Chancellor materializes today_decomposition.yaml
Step 6  Cascade dispatch fires on_morning_dispatch_received
Step 7  Each CTO writes today_group_brief.md
        and dispatches to scouts/soldiers/secretaries
```

The Emperor's three options are not abstract. They map directly to commands: ratify the whole agenda with a keystroke, edit a YAML and ratify, or escalate to a fresh `mandate evolve` if the day's direction has fundamentally shifted.

## Evening Court (晚朝) — 21:00

```
Step 1  Leaf nodes (Soldier / Scout / Secretary) fire
        on_evening_self_report and write daily_report.md:
        - completed today
        - blockers / unfinished + reasons
        - tomorrow's expected work
Step 2  Each CTO fires on_evening_aggregate:
        - reads all leaf daily_report.md in this group
        - produces group_evening_report.md
Step 3  Chancellor fires on_evening_synthesis:
        - aggregates all group_evening_report.md
        - produces chancellor_evening_report.md
        - filed in chronicle/evening-courts/{date}.md
        - awaits next morning's review
```

Note the direction reversal. Morning is top-down (Chancellor → CTO → leaves). Evening is bottom-up (leaves → CTO → Chancellor). The system breathes in and out once per day.

## What This Buys You

- **Predictable touchpoints.** The Emperor reviews at fixed times. Both human and machine know when to expect input.
- **Failure containment.** A drifting group surfaces in tomorrow's morning report. A stuck leaf surfaces in tonight's evening report. No silent failures spanning days.
- **Audit trail by construction.** Every working day produces a paired `morning-courts/{date}.md` + `evening-courts/{date}.md`. The court's history reads like real organizational records.
- **Cultural resonance.** Chinese 早朝/晚朝, Western standup/retro — both audiences immediately understand. The metaphor sells itself.

## Configuration

```yaml
court_cadence:
  enabled: true
  morning_court:
    time: "09:00"
    emperor_decision_timeout_minutes: 30
    on_timeout: approve_all
  evening_court:
    time: "21:00"
    leaf_report_required: true
    skip_if_no_activity: true
  timezone: Asia/Shanghai
```

Self-governance courts run a tighter cadence (08:00 / 15min / escalate; 22:00 / required true / skip false) because their job *is* daily reflection. Research courts use the gentler defaults. Cron expressions are accepted in `time` for irregular schedules.

## The Meta-framework Connection

This is what makes Mandate viable as the *base layer for any project*. Combine `mandate genesis "<your task>"` with the daily cadence and you get:

```bash
$ npx mandate genesis "Run my Twitter account daily"
✓ 4 project groups, 28 hooks, morning 09:00, evening 21:00
$ mandate court morning
📜 Day 1: no chronicle yet — initialize agenda from charter
📜 Today: 3 posts, 5 engagements, KPI review at 21:00
```

Day 2 onward, every morning surfaces yesterday's KPIs without you asking. Every evening collects today's outcomes without you prompting. The court runs itself. You only step in at your scheduled court hour — or when the Censor escalates a red line.

---

*Read next: [Why Five Vacancies](./01-why-five-vacancies.en.md) — back to the start, now with a heartbeat.*
