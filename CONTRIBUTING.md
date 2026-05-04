# Contributing to Mandate

Thanks for your interest. Mandate is a methodology + reference framework, so contributions land in three categories:

## 1. Spec & Schema Changes

Edits to `docs/specs/`, `spec/*.json`, `terms.yaml`. These shape the core methodology — discuss in an issue first if the change is non-trivial.

## 2. Methodology Articles

Each article in `docs/articles/` ships in pairs (`*.en.md` + `*.zh.md`). CI enforces heading-count parity between siblings.

If you don't write both languages, open a PR with one side and ask for a translation co-author.

## 3. Examples

`examples/<archetype>/.mandate/` directories. Each must validate against `spec/constitution.schema.json` (CI enforces). New archetypes welcome — common deployments include research, self-governance, trading, content, customer-support, etc.

## Local Setup

```bash
git clone https://github.com/<your-fork>/mandate
cd mandate
npm install
npm test
```

## Commit Style

Conventional commits — `feat:`, `fix:`, `docs:`, `chore:`, etc. Scope optional but encouraged.

## Reform Proposals

If you want to propose a structural change to the spec itself (a new role, a new hook event, a new memory layer), open it as a `reforms/PR-NNN-<slug>.md` first. The Emperor (project maintainer) ratifies or vetoes.
