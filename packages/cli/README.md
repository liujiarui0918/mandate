# @mandateai/cli

CLI for [Mandate](https://github.com/liujiarui0918/mandate) — *one sentence → a working multi-agent court for any task*.

```bash
npx create-mandate my-empire --template both
```

## What is Mandate?

Mandate organizes LLM agents into a self-governing imperial court with:
- **Censor Layer (锦衣卫)** — first-class audit on independent model
- **Lifecycle Hooks** — workflow discipline + creative freedom between hooks
- **Topology Constitution** — forbidden parent-child dependencies (3-layer defense)
- **Historian (史官)** — reform PRs the human ratifies, never auto-applied
- **Daily Cadence** — morning court 09:00 + evening court 21:00

→ Read the full story at [github.com/liujiarui0918/mandate](https://github.com/liujiarui0918/mandate).

## Commands

### v0.3.1-alpha (live)

```bash
mandate create <target-dir>           # scaffold .mandate/ from template (zero LLM calls)
mandate validate [target]             # lint constitution + decomposition + topology
```

#### `mandate create`

```bash
npx create-mandate my-empire --template both                   # default
npx create-mandate research-court --template research          # B: deep research demo
npx create-mandate gov-court --template self-governance        # C: self-reform demo
npx create-mandate court --language zh --censor-tier paranoid  # config overrides
```

Templates ship with full `.mandate/` skeletons: `constitution/{constitution.yaml, charter.md, terms.yaml}` and `workspace/mandate.md`. Daily cadence pre-configured (09:00/21:00 for research, 08:00/22:00 for self-governance).

#### `mandate validate`

```bash
mandate validate my-empire
# 📜 mandate validate — /path/to/my-empire
#   ✓ constitution.yaml schema
#   ✓ decomposition.yaml (skipped)
#   ✓ All checks passed.
```

Validates against four JSON Schemas + runs topology check (forbidden parent-child).

### v0.4 (coming, currently print "coming in v0.4")

- `mandate genesis "<your idea>"` — LLM-driven court designer
- `mandate evolve "<your evolution>"` — natural-language constitution amendment
- `mandate run [decree]` — execute the imperial decree across the court
- `mandate court morning|evening|status|skip` — daily cadence triggers
- `mandate audit / ratify / veto / status / explain` — auxiliary operations

## Daily Cadence

Every Mandate court runs a 24h heartbeat:

- **早朝 Morning Court (default 09:00)** — Chancellor reports yesterday + proposes today's agenda; Emperor ratifies/amends/redirects; cascades to all leaves
- **晚朝 Evening Court (default 21:00)** — Each leaf writes `daily_report.md`; CTOs aggregate; Chancellor synthesizes

## Use Cases — Any Task Becomes a Court

| Domain | One-sentence prompt |
|---|---|
| 🔬 Research | *"Compile a 10K-word fusion energy report"* |
| 📈 Trading | *"Surface 3 stock opportunities each morning"* |
| 🐦 Content | *"Run my Twitter: post, engage, analyze, comply"* |
| 💻 Coding | *"Build and ship a Twitter clone in 4 weeks"* |
| 🪞 Self-Governance | *"Reflect on this court; propose reforms"* |

## License

MIT — see [LICENSE](https://github.com/liujiarui0918/mandate/blob/main/LICENSE).

## Links

- 📜 [Design SPEC](https://github.com/liujiarui0918/mandate/blob/main/docs/specs/2026-05-01-mandate-design.md)
- 📖 [Methodology articles](https://github.com/liujiarui0918/mandate/tree/main/docs/articles)
- 🏛️ [Mandate main repository](https://github.com/liujiarui0918/mandate)
- 🐛 [Report issues](https://github.com/liujiarui0918/mandate/issues)
