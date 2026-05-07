// @mandate/runtime/censor-interceptor — gate hook outputs through censor.
//
// Per SPEC §5.2 the censor runs in one of three strategies:
//   full      — every hook output, sync
//   sample    — random N% per `rate`, async
//   red_line  — only on schema violation / threshold trip / explicit audit
//
// This module decides WHETHER to invoke the censor for a given hook
// output. The actual censor invocation (a separate-model LLM call) is
// injected by the orchestrator — keeps the interceptor pure / testable.

const STRATEGIES = new Set(['full', 'sample', 'red_line']);

// SHA-1-ish hash → uniform float in [0, 1). Used so that "should sample"
// is deterministic per (run_id, hook_id) — debuggable in chronicle.
function deterministicFloat(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h >>> 0) / 0x100000000;
}

export function shouldInvokeCensor(strategy, ctx) {
  if (!STRATEGIES.has(strategy)) {
    throw new Error(`Unsupported censor strategy "${strategy}". Valid: full | sample | red_line`);
  }
  const isRedLine = ctx?.redLineTripped === true || ctx?.explicitAudit === true || ctx?.schemaFailed === true;

  switch (strategy) {
    case 'full':
      return true;
    case 'red_line':
      return isRedLine;
    case 'sample': {
      if (isRedLine) return true; // sample mode still escalates on red-line
      const rate = ctx?.rate ?? 0.05;
      if (rate <= 0) return false;
      if (rate >= 1) return true;
      const seed = `${ctx?.runId ?? 'no-run'}:${ctx?.hookId ?? 'no-hook'}:${ctx?.attempt ?? 1}`;
      return deterministicFloat(seed) < rate;
    }
    default:
      return false; // unreachable
  }
}

// Censor strategy resolution: combine global tier + per-role override per
// SPEC §5.2.1. Inputs are normalized before lookup.
const TIER_DEFAULTS = Object.freeze({
  paranoid: {
    chancellor: { strategy: 'full', async: false },
    cto:        { strategy: 'full', async: false },
    scout:      { strategy: 'full', async: false },
    secretary:  { strategy: 'full', async: false },
    soldier:    { strategy: 'full', async: false },
    historian:  { strategy: 'full', async: false },
    censor:     { strategy: 'full', async: false },
    emperor:    { strategy: null, async: false }, // human, no censor
  },
  balanced: {
    chancellor: { strategy: 'full', async: false },
    cto:        { strategy: 'full', async: false },
    scout:      { strategy: 'sample', rate: 0.30, async: true },
    secretary:  { strategy: 'sample', rate: 0.30, async: true },
    soldier:    { strategy: 'sample', rate: 0.10, async: true },
    historian:  { strategy: 'red_line', async: false },
    censor:     { strategy: 'red_line', async: false },
    emperor:    { strategy: null, async: false },
  },
  frugal: {
    chancellor: { strategy: 'sample', rate: 0.30, async: true },
    cto:        { strategy: 'sample', rate: 0.30, async: true },
    scout:      { strategy: 'red_line', async: true },
    secretary:  { strategy: 'red_line', async: true },
    soldier:    { strategy: 'red_line', async: true },
    historian:  { strategy: 'red_line', async: false },
    censor:     { strategy: 'red_line', async: false },
    emperor:    { strategy: null, async: false },
  },
});

export const SUPPORTED_TIERS = Object.freeze(['paranoid', 'balanced', 'frugal']);

export function resolveCensorPolicy({ tier = 'balanced', role, overrides = {} } = {}) {
  if (!SUPPORTED_TIERS.includes(tier)) {
    throw new Error(`Unsupported censor tier "${tier}". Valid: ${SUPPORTED_TIERS.join(', ')}`);
  }
  if (typeof role !== 'string' || !role) {
    throw new TypeError('role required');
  }
  const tierDefault = TIER_DEFAULTS[tier][role];
  if (!tierDefault) {
    throw new Error(`No default censor policy for role "${role}" under tier "${tier}"`);
  }
  const override = overrides[role] ?? {};
  return { ...tierDefault, ...override, role, tier };
}

// Verify that subject and censor models are NOT in the same family
// (SPEC §5.3). The model resolver passes the resolved model strings; we
// compare on a coarse "family" prefix (e.g., "claude" vs "gpt" vs "grok").
const FAMILY_PATTERNS = [
  { name: 'claude', test: /^claude/i },
  { name: 'gpt',    test: /^(gpt|openai|o\d|chatgpt)/i },
  { name: 'gemini', test: /^gemini/i },
  { name: 'grok',   test: /^grok/i },
  { name: 'llama',  test: /^(llama|meta-llama)/i },
  { name: 'command-r', test: /^command-r/i },
];

export function modelFamily(modelId) {
  if (typeof modelId !== 'string') return null;
  for (const f of FAMILY_PATTERNS) {
    if (f.test.test(modelId)) return f.name;
  }
  return modelId.split(/[-_/]/)[0]?.toLowerCase() ?? null;
}

export function assertCensorIsolation(subjectModel, censorModel) {
  if (!subjectModel || !censorModel) {
    throw new Error('assertCensorIsolation: both subjectModel and censorModel required');
  }
  const sf = modelFamily(subjectModel);
  const cf = modelFamily(censorModel);
  if (sf && cf && sf === cf) {
    const err = new Error(
      `Censor isolation violated: subject model "${subjectModel}" and censor model "${censorModel}" ` +
        `are both in family "${sf}". Per SPEC §5.3 censor must run on a different model family.`,
    );
    err.code = 'ECENSOR_ISOLATION';
    throw err;
  }
  return true;
}

// Wrap a hook output through censor logic. The censorFn (injected) is
// expected to return { ok: boolean, findings?: [], confidence?: number }.
// If the strategy says skip, we return { skipped: true } without invoking.
export async function interceptOutput({
  output,
  strategy,
  ctx,
  censorFn,
}) {
  if (typeof censorFn !== 'function') {
    throw new TypeError('interceptOutput: censorFn required');
  }
  if (!shouldInvokeCensor(strategy, ctx)) {
    return { skipped: true, output };
  }
  const verdict = await censorFn({ output, ctx });
  return { skipped: false, output, verdict };
}
