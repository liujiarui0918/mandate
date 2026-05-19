# create-mandate

Scaffolder for [Mandate](https://github.com/liujiarui0918/mandate) — a self-governing multi-agent imperial court framework.

## Usage

```bash
npx create-mandate my-empire
# or with a template:
npx create-mandate my-empire --template both
```

Available templates:

- `research` — investigation-oriented court (scout, chancellor, soldier roles)
- `self-governance` — recursive self-improving court (full role roster + reforms)
- `both` (default) — scaffolds both templates side-by-side

After scaffolding:

```bash
cd my-empire
npx mandate validate .
```

## What it does

Creates a `.mandate/` directory containing:

- `constitution/` — `constitution.yaml`, `charter.md`, `terms.yaml`
- `workspace/mandate.md` — the entry document for the court

Zero LLM calls during scaffolding — pure file copy.

## Companion packages

- [`@mandateai/cli`](https://www.npmjs.com/package/@mandateai/cli) — full CLI (`mandate validate`, `mandate status`, `mandate ratify`, …)
- [`@mandateai/runtime`](https://www.npmjs.com/package/@mandateai/runtime) — constitution loader, chronicle, memory lifecycle
- [`@mandateai/validators`](https://www.npmjs.com/package/@mandateai/validators) — JSON Schema + topology validation

## License

MIT
