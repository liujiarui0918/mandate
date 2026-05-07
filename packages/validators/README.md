# @mandate/validators

JSON Schema validation + topology check for the [Mandate](https://github.com/liujiarui0918/mandate) multi-agent imperial court framework.

## Install

```bash
npm install @mandate/validators
```

## Usage

### Schema validation

```js
import { validateConstitution, validateDecomposition, validateReform, validateHooks } from '@mandate/validators';

const result = validateConstitution(parsedYaml);
if (!result.valid) {
  console.error(result.errors);
}
```

### Topology check

The killer feature: **forbidden parent-child detection**. Project groups in a Mandate court must be sibling-only — `decision_affecting` cross-group dependencies break Conway-clean parallelism.

```js
import { checkTopology, proposeAutoMerges } from '@mandate/validators/topology';

const decomposition = {
  mandate_id: 'm-001',
  groups: [
    { id: 'tech', goal: '...', deadline: '2026-05-08', budget_tokens: 1000, deps: [] },
    { id: 'biz',  goal: '...', deadline: '2026-05-08', budget_tokens: 1000, deps: [{ from: 'tech', kind: 'decision_affecting' }] }
  ]
};

const result = checkTopology(decomposition);
// {
//   valid: false,
//   violations: [{ from: 'tech', to: 'biz', kind: 'decision_affecting' }],
//   suggestedMerges: ['merge_groups: [biz, tech] -> biz-and-tech']
// }
```

`result_only` deps are legal (group B waits for A's output without changing its own decisions). Only `decision_affecting` deps trigger violations.

## Schemas validated

- `constitution.schema.json` — court charter (topology, censor tiers, model map, daily cadence)
- `hooks.schema.json` — role lifecycle hook definitions
- `decomposition.schema.json` — task breakdown into project groups
- `reform.schema.json` — historian's reform PR proposals

Schemas are loaded from `<repo>/spec/` by default. Override via `MANDATE_SCHEMA_ROOT` env var or pass `schemaRoot` arg.

## License

MIT — see [LICENSE](https://github.com/liujiarui0918/mandate/blob/main/LICENSE).

## Links

- 📜 [Design SPEC](https://github.com/liujiarui0918/mandate/blob/main/docs/specs/2026-05-01-mandate-design.md)
- 📖 [Article: Topology Constitution](https://github.com/liujiarui0918/mandate/blob/main/docs/articles/03-topology-constitution.en.md)
- 🏛️ [Mandate main repository](https://github.com/liujiarui0918/mandate)
