# Bilingual First-Class Citizenship

> Most "internationalized" projects translate the README and call it a day. Mandate makes the metaphor itself bilingual at the code level.

## The Translation Trap

You've seen it: a Chinese open-source project with an excellent README.zh, a serviceable README.en, and English-only code. Eastern users see a project written for them; Western users see a translation. Both audiences sense the imbalance. Adoption stratifies.

## The Mandate Approach

`terms.yaml` is the canonical map. It's loaded by the runtime, the CLI, the validators, and the docs. It's both a configuration file and a literary device.

```yaml
emperor:    { zh: 皇帝, en: emperor, latin: imperator }
chancellor: { zh: 宰相, en: chancellor }
censor:     { zh: 锦衣卫, en: censor, alias: jin-yi-wei }
historian:  { zh: 史官, en: historian }
```

In `decomposition.yaml`, you can write `role: 宰相` or `role: chancellor` — both are canonical. The CLI prints `📜 宰相 (Chancellor) 已就位` when `MANDATE_LANG=both`.

## What Bilingual First-Class Buys You

- **No translation drift** — there's no "primary" and "secondary" version. The terms file is the single source of truth.
- **Cross-cultural fluency** — Western developers learn that `censor` means 锦衣卫 means an independent audit layer. The metaphor enriches the technical concept.
- **A genuine moat** — competitors with English-only YAML cannot retrofit this. Bilingual is structural.

## The Cultural Story Matters

Mandate is built around a metaphor that already lives in two civilizations: imperial bureaucracy. China's Tang and Ming dynasties operated on principles isomorphic to modern corporate hierarchy. The Censorate (御史台) is exactly what an independent audit org should be. The Hanlin Academy is exactly the historian function.

By naming things in both languages, Mandate honors both civilizations' organizational wisdom — and gives developers in both worlds a richer mental model than "CEO" or "皇帝" alone provides.

## Mechanical Implementation

The runtime resolves any role reference through `terms.yaml`:

```typescript
function resolveRole(input: string): RoleId {
  // 'chancellor' → 'chancellor'
  // '宰相'        → 'chancellor'
  // 'cancellarius'→ 'chancellor' (if alias)
  return termsMap.canonicalize(input);
}
```

Code identifiers stay English (chancellor, censor). User-facing text follows `MANDATE_LANG`. Documentation pairs `*.en.md` with `*.zh.md` and a CI lint enforces heading parity. This system survives contributors who don't read both languages — they edit one side, the lint flags drift.

## A Universal Principle in Disguise

The deeper lesson: when your project's central metaphor lives in multiple cultures, treat all of them as first-class. You'll get richer abstractions, broader audiences, and a moat your competitors structurally cannot copy. Mandate is one application of this principle. Yours could be another.

---

*Read the [SPEC](../specs/2026-05-01-mandate-design.md) next.*
