// @mandateai/runtime — orchestrator + hook-scheduler + censor-interceptor tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  scheduleForEvent,
  shouldRetry,
  nextDelayMs,
  SUPPORTED_EVENTS,
  shouldInvokeCensor,
  resolveCensorPolicy,
  modelFamily,
  assertCensorIsolation,
  interceptOutput,
  SUPPORTED_TIERS,
  HookExecutionError,
  executeHook,
  fireEvent,
  chroniclePath,
  chronicleDate,
} from "../src/index.mjs";

// ---- hook-scheduler ----------------------------------------------------

const sampleHooks = {
  role: "chancellor",
  hooks: {
    on_mandate_received: [
      { must: "decompose mandate", writes_to: "workspace/decomposition.yaml" },
      { must: "topology check", validator: "builtin:topology-check", retry_policy: "none" },
    ],
    on_subtask_dispatch: [
      { must: "write group charter", writes_to: "workspace/groups/{{group_id}}/charter.md" },
    ],
    "every_n_steps: 5": [{ must: "status sweep", writes_to: "workspace/status_report.md" }],
  },
};

test("scheduleForEvent: returns hooks for matching event", () => {
  const out = scheduleForEvent(sampleHooks, "on_mandate_received");
  assert.equal(out.length, 2);
  assert.equal(out[0].event, "on_mandate_received");
  assert.equal(out[0].must, "decompose mandate");
  assert.equal(out[1].validator, "builtin:topology-check");
});

test("scheduleForEvent: returns empty array when event has no hooks", () => {
  assert.deepEqual(scheduleForEvent(sampleHooks, "on_role_end"), []);
});

test("scheduleForEvent: includes periodic hooks when stepCount divides", () => {
  const at5 = scheduleForEvent(sampleHooks, "on_role_end", { stepCount: 5 });
  assert.equal(at5.length, 1);
  assert.equal(at5[0].must, "status sweep");
  assert.equal(at5[0].event, "every_5_steps");
});

test("scheduleForEvent: skips periodic when stepCount does not divide", () => {
  const at3 = scheduleForEvent(sampleHooks, "on_role_end", { stepCount: 3 });
  assert.deepEqual(at3, []);
});

test("scheduleForEvent: hooks are frozen", () => {
  const [first] = scheduleForEvent(sampleHooks, "on_mandate_received");
  assert.equal(Object.isFrozen(first), true);
});

test("scheduleForEvent: throws on bad input", () => {
  assert.throws(() => scheduleForEvent(null, "x"), TypeError);
});

test("scheduleForEvent: rejects unsupported retry policy", () => {
  const bad = { hooks: { on_x: [{ must: "x", retry_policy: "yolo" }] } };
  assert.throws(() => scheduleForEvent(bad, "on_x"), /Unsupported retry_policy/);
});

test("nextDelayMs: returns null for none", () => {
  assert.equal(nextDelayMs("none", 1), null);
});

test("nextDelayMs: returns 0 for once on first attempt, null after", () => {
  assert.equal(nextDelayMs("once", 1), 0);
  assert.equal(nextDelayMs("once", 2), null);
});

test("nextDelayMs: linear scales with attempt", () => {
  assert.equal(nextDelayMs("linear", 1, { baseMs: 100 }), 100);
  assert.equal(nextDelayMs("linear", 3, { baseMs: 100 }), 300);
});

test("nextDelayMs: exponential doubles each attempt", () => {
  assert.equal(nextDelayMs("exponential", 1, { baseMs: 100 }), 100);
  assert.equal(nextDelayMs("exponential", 2, { baseMs: 100 }), 200);
  assert.equal(nextDelayMs("exponential", 4, { baseMs: 100 }), 800);
});

test("nextDelayMs: caps at maxMs", () => {
  assert.equal(nextDelayMs("exponential", 20, { baseMs: 100, maxMs: 5000 }), 5000);
});

test("shouldRetry: respects policy", () => {
  assert.equal(shouldRetry("none", 0), false);
  assert.equal(shouldRetry("once", 0), true);
  assert.equal(shouldRetry("once", 1), false);
  assert.equal(shouldRetry("linear", 4), true);
  assert.equal(shouldRetry("linear", 5), false);
});

test("shouldRetry: rejects negative attempts", () => {
  assert.throws(() => shouldRetry("none", -1), RangeError);
});

test("SUPPORTED_EVENTS contains lifecycle hooks", () => {
  assert.ok(SUPPORTED_EVENTS.includes("on_role_start"));
  assert.ok(SUPPORTED_EVENTS.includes("on_input_received"));
  assert.ok(SUPPORTED_EVENTS.includes("on_output_ready"));
  assert.ok(SUPPORTED_EVENTS.includes("on_role_end"));
});

// ---- censor-interceptor: shouldInvokeCensor

test("shouldInvokeCensor: full always invokes", () => {
  assert.equal(shouldInvokeCensor("full", {}), true);
});

test("shouldInvokeCensor: red_line gates on red-line context", () => {
  assert.equal(shouldInvokeCensor("red_line", {}), false);
  assert.equal(shouldInvokeCensor("red_line", { redLineTripped: true }), true);
  assert.equal(shouldInvokeCensor("red_line", { schemaFailed: true }), true);
  assert.equal(shouldInvokeCensor("red_line", { explicitAudit: true }), true);
});

test("shouldInvokeCensor: sample is deterministic per (runId, hookId, attempt)", () => {
  const ctx = { runId: "abc", hookId: "scout/on_output", attempt: 1, rate: 0.5 };
  const a = shouldInvokeCensor("sample", ctx);
  const b = shouldInvokeCensor("sample", ctx);
  assert.equal(a, b);
});

test("shouldInvokeCensor: sample with rate=0 never invokes (except red-line)", () => {
  assert.equal(shouldInvokeCensor("sample", { runId: "x", hookId: "y", rate: 0 }), false);
  assert.equal(shouldInvokeCensor("sample", { rate: 0, redLineTripped: true }), true);
});

test("shouldInvokeCensor: sample with rate>=1 always invokes", () => {
  assert.equal(shouldInvokeCensor("sample", { runId: "x", hookId: "y", rate: 1 }), true);
});

test("shouldInvokeCensor: rejects unknown strategy", () => {
  assert.throws(() => shouldInvokeCensor("yolo", {}), /Unsupported censor strategy/);
});

// ---- resolveCensorPolicy

test("resolveCensorPolicy: balanced/scout = sample 30% async per SPEC §5.2.1", () => {
  const p = resolveCensorPolicy({ tier: "balanced", role: "scout" });
  assert.equal(p.strategy, "sample");
  assert.equal(p.rate, 0.30);
  assert.equal(p.async, true);
});

test("resolveCensorPolicy: balanced/historian = red_line per SPEC §5.2.1", () => {
  const p = resolveCensorPolicy({ tier: "balanced", role: "historian" });
  assert.equal(p.strategy, "red_line");
});

test("resolveCensorPolicy: per-role override wins", () => {
  const p = resolveCensorPolicy({
    tier: "balanced",
    role: "soldier",
    overrides: { soldier: { strategy: "full", async: false, model: "grok-4.3" } },
  });
  assert.equal(p.strategy, "full");
  assert.equal(p.async, false);
  assert.equal(p.model, "grok-4.3");
});

test("resolveCensorPolicy: paranoid tier = full sync for all", () => {
  for (const role of ["chancellor", "cto", "scout", "soldier"]) {
    const p = resolveCensorPolicy({ tier: "paranoid", role });
    assert.equal(p.strategy, "full");
    assert.equal(p.async, false);
  }
});

test("resolveCensorPolicy: emperor has no censor", () => {
  const p = resolveCensorPolicy({ tier: "balanced", role: "emperor" });
  assert.equal(p.strategy, null);
});

test("resolveCensorPolicy: rejects unknown tier", () => {
  assert.throws(() => resolveCensorPolicy({ tier: "yolo", role: "scout" }), /Unsupported censor tier/);
});

test("SUPPORTED_TIERS exposes the 3 documented tiers", () => {
  assert.deepEqual([...SUPPORTED_TIERS].sort(), ["balanced", "frugal", "paranoid"]);
});

// ---- modelFamily / assertCensorIsolation

test("modelFamily: classifies known families", () => {
  assert.equal(modelFamily("claude-opus-4-7"), "claude");
  assert.equal(modelFamily("gpt-5.5"), "gpt");
  assert.equal(modelFamily("o4-mini"), "gpt");
  assert.equal(modelFamily("gemini-2.5-pro"), "gemini");
  assert.equal(modelFamily("grok-4.3"), "grok");
  assert.equal(modelFamily("command-r-plus"), "command-r");
});

test("assertCensorIsolation: passes when families differ", () => {
  assert.equal(assertCensorIsolation("claude-opus-4-7", "grok-4.3"), true);
});

test("assertCensorIsolation: throws when families match", () => {
  assert.throws(
    () => assertCensorIsolation("claude-opus-4-7", "claude-haiku-4-5"),
    /Censor isolation violated/,
  );
});

test("assertCensorIsolation: error has ECENSOR_ISOLATION code", () => {
  try {
    assertCensorIsolation("gpt-5.5", "gpt-4o");
    assert.fail("expected throw");
  } catch (err) {
    assert.equal(err.code, "ECENSOR_ISOLATION");
  }
});

test("interceptOutput: skips when strategy says no", async () => {
  const r = await interceptOutput({
    output: { x: 1 },
    strategy: "red_line",
    ctx: {},
    censorFn: async () => ({ ok: true }),
  });
  assert.equal(r.skipped, true);
});

test("interceptOutput: invokes censorFn when strategy says yes", async () => {
  let called = 0;
  const r = await interceptOutput({
    output: { x: 1 },
    strategy: "full",
    ctx: {},
    censorFn: async () => {
      called++;
      return { ok: true, confidence: 0.9 };
    },
  });
  assert.equal(called, 1);
  assert.equal(r.skipped, false);
  assert.equal(r.verdict.confidence, 0.9);
});

test("interceptOutput: requires censorFn", async () => {
  await assert.rejects(
    () => interceptOutput({ output: {}, strategy: "full", ctx: {} }),
    TypeError,
  );
});

// ---- orchestrator: executeHook

const trivialHook = Object.freeze({
  event: "on_input_received",
  must: "do thing",
  schema: null,
  validator: null,
  timeout_seconds: null,
  writes_to: null,
  retry_policy: "none",
});

test("executeHook: happy path with full censor", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    const result = await executeHook({
      hook: trivialHook,
      role: "scout",
      runId: "r1",
      censorPolicy: { strategy: "full" },
      agentInvoker: async () => ({ findings: ["x"] }),
      censorFn: async () => ({ ok: true, confidence: 0.95 }),
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(result.attempts, 1);
    assert.deepEqual(result.output, { findings: ["x"] });
    assert.equal(result.censor.skipped, false);
    assert.equal(result.censor.verdict.confidence, 0.95);
    const path = chroniclePath(tmp, chronicleDate());
    assert.ok(existsSync(path));
    const text = readFileSync(path, "utf8");
    assert.match(text, /hook_fired/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("executeHook: retries up to policy limit on thrown error", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    let calls = 0;
    const result = await executeHook({
      hook: { ...trivialHook, retry_policy: "linear" },
      role: "scout",
      runId: "r1",
      censorPolicy: { strategy: "red_line" },
      agentInvoker: async () => {
        calls++;
        if (calls < 3) throw new Error("transient");
        return { ok: true };
      },
      censorFn: async () => ({ ok: true }),
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(calls, 3);
    assert.equal(result.attempts, 3);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("executeHook: surfaces HookExecutionError when retries exhausted", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    await assert.rejects(
      () =>
        executeHook({
          hook: { ...trivialHook, retry_policy: "none" },
          role: "scout",
          runId: "r1",
          censorPolicy: { strategy: "red_line" },
          agentInvoker: async () => {
            throw new Error("boom");
          },
          censorFn: async () => ({ ok: true }),
          projectRoot: tmp,
          sleep: async () => {},
        }),
      HookExecutionError,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("executeHook: red_line censor escalates on schema fail", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    let censorCalled = 0;
    const result = await executeHook({
      hook: { ...trivialHook, validator: "always-fail" },
      role: "scout",
      runId: "r1",
      censorPolicy: { strategy: "red_line" },
      agentInvoker: async () => ({ x: 1 }),
      censorFn: async () => {
        censorCalled++;
        return { ok: false, findings: ["bogus claim"] };
      },
      validators: { "always-fail": () => ({ ok: false, errors: ["nope"] }) },
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(censorCalled, 1, "red_line should escalate when schema fails");
    assert.equal(result.censor.skipped, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("executeHook: validator wired = ok skips censor under red_line", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    let censorCalled = 0;
    const result = await executeHook({
      hook: { ...trivialHook, validator: "always-ok" },
      role: "scout",
      runId: "r1",
      censorPolicy: { strategy: "red_line" },
      agentInvoker: async () => ({ findings: ["valid"] }),
      censorFn: async () => {
        censorCalled++;
        return { ok: true };
      },
      validators: { "always-ok": () => true },
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(censorCalled, 0);
    assert.equal(result.censor.skipped, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- fireEvent

test("fireEvent: runs every hook for an event in declaration order", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    const order = [];
    const result = await fireEvent({
      roleHooks: sampleHooks,
      role: "chancellor",
      event: "on_mandate_received",
      runId: "r1",
      censorPolicy: { strategy: "full" },
      agentInvoker: async (hook) => {
        order.push(hook.must);
        return { ok: true };
      },
      censorFn: async () => ({ ok: true }),
      validators: { "builtin:topology-check": () => true },
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(result.results.length, 2);
    assert.deepEqual(order, ["decompose mandate", "topology check"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("fireEvent: returns empty when event has no hooks", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    const result = await fireEvent({
      roleHooks: sampleHooks,
      role: "chancellor",
      event: "on_role_end",
      runId: "r1",
      censorPolicy: { strategy: "full" },
      agentInvoker: async () => ({}),
      censorFn: async () => ({ ok: true }),
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(result.results.length, 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("fireEvent: includes periodic hooks at matching stepCount", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-orch-"));
  try {
    const fired = [];
    const result = await fireEvent({
      roleHooks: sampleHooks,
      role: "chancellor",
      event: "on_subtask_dispatch",
      stepCount: 5,
      runId: "r1",
      censorPolicy: { strategy: "red_line" },
      agentInvoker: async (hook) => {
        fired.push(hook.event);
        return {};
      },
      censorFn: async () => ({ ok: true }),
      projectRoot: tmp,
      sleep: async () => {},
    });
    assert.equal(result.results.length, 2, "1 direct + 1 periodic");
    assert.deepEqual(fired.sort(), ["every_5_steps", "on_subtask_dispatch"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
