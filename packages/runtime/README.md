# @mandateai/runtime

Execution engine for [Mandate](https://github.com/liujiarui0918/mandate) — constitution loader, terms resolver, chronicle (JSONL append log), and helpers for self-governing multi-agent imperial courts.

## Install

```bash
npm install @mandateai/runtime
```

## Modules

### Constitution loader

Load + validate `.mandate/constitution/constitution.yaml` against the JSON Schema:

```js
import { loadConstitution, saveConstitution, bumpConstitutionVersion } from '@mandateai/runtime';

const r = loadConstitution('/path/to/my-empire');
if (r.ok) {
  console.log(r.constitution.project);                              // "research-demo"
  console.log(r.constitution.court_cadence?.morning_court?.time);   // "09:00"
}

// Used by `mandate ratify` after applying a reform PR
const bumped = { ...r.constitution, version: bumpConstitutionVersion(r.constitution.version, 'minor') };
saveConstitution('/path/to/my-empire', bumped);
```

### i18n (terms.yaml resolver)

Bilingual first-class — every role has zh / en / latin / alias surface forms.

```js
import { loadI18n } from '@mandateai/runtime';

const { canonicalize, display } = loadI18n();

canonicalize('宰相');         // 'chancellor'
canonicalize('cancellarius'); // 'chancellor'
canonicalize('strategist');   // 'cto'

display('chancellor', 'zh');   // '宰相'
display('chancellor', 'en');   // 'chancellor'
display('chancellor', 'both'); // '宰相 (chancellor)'
```

### Chronicle (JSONL append log)

The historian's source of truth. One file per UTC day at `<courtDir>/.mandate/chronicle/YYYY-MM-DD.jsonl`.

```js
import { appendEvent, readChronicle, readChronicleRange } from '@mandateai/runtime';

await appendEvent('/path/to/my-empire', {
  agent_id: 'chancellor',
  hook_name: 'on_mandate_received',
  outcome: 'ok',
  meta: { groups_dispatched: 3 },
});

// Historian's weekly window
const events = await readChronicleRange('/path/to/my-empire', '2026-05-01', '2026-05-07');
```

Each event is auto-stamped with `ts: <ISO 8601>` if not provided. Append is atomic at the line level (Node `appendFile`); for multi-process safety, callers should serialize across the same date file.

## Roadmap

v0.4 will add:
- `memory.mjs` — workspace lifecycle (init / clear / snapshot)
- `model-resolver.mjs` — preferred + fallback chain probe with cache
- `file-lock.mjs` — cooperative file lock for shared writes
- Hook scheduler + censor interceptor
- Runtime main loop

## License

MIT — see [LICENSE](https://github.com/liujiarui0918/mandate/blob/main/LICENSE).

## Links

- 📜 [Design SPEC](https://github.com/liujiarui0918/mandate/blob/main/docs/specs/2026-05-01-mandate-design.md)
- 🏛️ [Mandate main repository](https://github.com/liujiarui0918/mandate)
