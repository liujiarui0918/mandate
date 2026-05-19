// @mandateai/runtime/orchestrator — minimal hook-firing main loop.
//
// Wires hook-scheduler + censor-interceptor + chronicle into a single
// "fire one event for one role" call. Real LLM invocation is injected by
// the host (mandate CLI) via the `agentInvoker` and `censorFn` callbacks
// — the orchestrator stays pure / deterministic / testable.
//
// In v0.3-alpha this is a SINGLE-STEP executor; multi-role choreography
// (chancellor → CTO → soldier → ...) is composed by the CLI layer.

import { scheduleForEvent, shouldRetry, nextDelayMs } from './hook-scheduler.mjs';
import { interceptOutput } from './censor-interceptor.mjs';
import { appendEvent } from './chronicle.mjs';

export class HookExecutionError extends Error {
  constructor(message, { hook, attempts, cause } = {}) {
    super(message);
    this.name = 'HookExecutionError';
    this.hook = hook;
    this.attempts = attempts;
    if (cause) this.cause = cause;
  }
}

// Validate a hook output against its declared schema/validator.
async function validateOutput(hook, output, validators) {
  if (hook.validator) {
    const fn = validators?.[hook.validator];
    if (typeof fn !== 'function') {
      throw new HookExecutionError(`No validator registered for "${hook.validator}"`, { hook });
    }
    const result = await fn(output);
    if (result === true) return { ok: true };
    if (result && result.ok) return result;
    return { ok: false, errors: result?.errors ?? ['validation failed'] };
  }
  // Schema validation is the caller's responsibility (ajv lives in
  // @mandateai/validators); orchestrator just yes-passes when only a schema
  // is declared but no validator wired. The CLI plugs the real validator.
  return { ok: true };
}

async function runOnce({ hook, agentInvoker, validators }) {
  const output = await agentInvoker(hook);
  const validation = await validateOutput(hook, output, validators);
  if (!validation.ok) {
    return { ok: false, output, validation };
  }
  return { ok: true, output, validation };
}

// Execute a single hook with retry policy and censor interception.
export async function executeHook({
  hook,
  role,
  runId,
  censorPolicy,
  agentInvoker,
  censorFn,
  validators = {},
  projectRoot = process.cwd(),
  log = true,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  if (typeof agentInvoker !== 'function') {
    throw new TypeError('executeHook: agentInvoker required');
  }
  if (typeof censorFn !== 'function') {
    throw new TypeError('executeHook: censorFn required');
  }

  let attempt = 0;
  let lastResult = null;
  while (true) {
    attempt += 1;
    let result;
    try {
      result = await runOnce({ hook, agentInvoker, validators });
    } catch (err) {
      if (!shouldRetry(hook.retry_policy, attempt)) {
        if (log) {
          await appendEvent(projectRoot, {
            type: 'hook_failed',
            role,
            run_id: runId,
            event: hook.event,
            attempts: attempt,
            error: err.message,
          });
        }
        throw new HookExecutionError(`Hook "${hook.must}" threw after ${attempt} attempts`, {
          hook,
          attempts: attempt,
          cause: err,
        });
      }
      const delay = nextDelayMs(hook.retry_policy, attempt);
      if (delay && delay > 0) await sleep(delay);
      continue;
    }
    lastResult = result;
    if (result.ok) break;
    if (!shouldRetry(hook.retry_policy, attempt)) break;
    const delay = nextDelayMs(hook.retry_policy, attempt);
    if (delay && delay > 0) await sleep(delay);
  }

  // Censor interception.
  const intercepted = await interceptOutput({
    output: lastResult.output,
    strategy: censorPolicy?.strategy ?? 'red_line',
    ctx: {
      runId,
      hookId: `${role}/${hook.event}/${attempt}`,
      attempt,
      schemaFailed: !lastResult.ok,
      rate: censorPolicy?.rate ?? 0.05,
    },
    censorFn,
  });

  if (log) {
    await appendEvent(projectRoot, {
      type: 'hook_fired',
      role,
      run_id: runId,
      event: hook.event,
      writes_to: hook.writes_to,
      attempts: attempt,
      validated: lastResult.ok,
      censored: !intercepted.skipped,
      censor_verdict: intercepted.verdict?.ok ?? null,
    });
  }

  return {
    hook,
    output: lastResult.output,
    attempts: attempt,
    validation: lastResult.validation,
    censor: intercepted,
  };
}

// Fire all hooks for a single (role, event) pair.
export async function fireEvent({
  roleHooks,
  role,
  event,
  stepCount = 0,
  ...rest
}) {
  const hooks = scheduleForEvent(roleHooks, event, { stepCount });
  const results = [];
  for (const hook of hooks) {
    const r = await executeHook({ hook, role, ...rest });
    results.push(r);
  }
  return { event, role, results };
}
