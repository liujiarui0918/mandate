// @mandate/runtime/hook-scheduler — pick which hooks fire next.
//
// Given a role's hook declarations (parsed from the role's hooks.yaml) and
// the current lifecycle event, return an ordered list of hook descriptors
// the orchestrator should execute. The scheduler is pure — no I/O, no LLM
// — so it is trivially testable.

const SUPPORTED_RETRY_POLICIES = new Set(['none', 'once', 'linear', 'exponential']);

export function scheduleForEvent(roleHooks, event, { stepCount = 0 } = {}) {
  if (!roleHooks || typeof roleHooks !== 'object') {
    throw new TypeError('roleHooks must be an object');
  }
  const all = roleHooks.hooks ?? roleHooks;
  const direct = Array.isArray(all[event]) ? all[event] : [];
  const periodic = collectPeriodicForStep(all, stepCount);
  return [...direct.map((h) => normalize(h, event)), ...periodic];
}

function collectPeriodicForStep(all, stepCount) {
  const out = [];
  for (const [key, value] of Object.entries(all)) {
    if (!Array.isArray(value)) continue;
    const m = /^every_n_steps:\s*(\d+)$/.exec(key);
    if (!m) continue;
    const n = Number(m[1]);
    if (n > 0 && stepCount > 0 && stepCount % n === 0) {
      for (const h of value) out.push(normalize(h, `every_${n}_steps`));
    }
  }
  return out;
}

function normalize(hook, event) {
  const policy = hook.retry_policy ?? 'none';
  if (!SUPPORTED_RETRY_POLICIES.has(policy)) {
    throw new Error(`Unsupported retry_policy "${policy}" for ${event}`);
  }
  return Object.freeze({
    event,
    must: hook.must,
    schema: hook.schema ?? null,
    validator: hook.validator ?? null,
    timeout_seconds: hook.timeout_seconds ?? null,
    writes_to: hook.writes_to ?? null,
    retry_policy: policy,
  });
}

// Compute next-attempt delay (ms) for a given retry_policy and attempt count.
// attempt is 1-based: first retry = attempt=1.
export function nextDelayMs(retryPolicy, attempt, { baseMs = 1000, maxMs = 60_000 } = {}) {
  switch (retryPolicy) {
    case 'none':
      return null;
    case 'once':
      return attempt === 1 ? 0 : null;
    case 'linear':
      return Math.min(baseMs * attempt, maxMs);
    case 'exponential':
      return Math.min(baseMs * 2 ** (attempt - 1), maxMs);
    default:
      throw new Error(`Unsupported retry_policy "${retryPolicy}"`);
  }
}

// Returns true if the runtime should retry given a previous failure count.
export function shouldRetry(retryPolicy, previousAttempts) {
  if (previousAttempts < 0) throw new RangeError('previousAttempts must be >= 0');
  switch (retryPolicy) {
    case 'none':
      return false;
    case 'once':
      return previousAttempts < 1;
    case 'linear':
    case 'exponential':
      return previousAttempts < 5; // hard cap
    default:
      throw new Error(`Unsupported retry_policy "${retryPolicy}"`);
  }
}

export const SUPPORTED_EVENTS = Object.freeze([
  'on_role_start',
  'on_input_received',
  'on_output_ready',
  'on_role_end',
  'on_threshold_token_cap',
  'on_threshold_time_cap',
  'on_threshold_error_rate',
]);
