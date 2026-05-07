// mandate run "<decree>" — execute one mandate from end to end.
//
// In v0.3-alpha this is a wired shell that validates the decree + spins up
// a workspace + records the run in chronicle. Hook execution itself
// requires a host-injected agentInvoker (the orchestrator from
// @mandate/runtime is fully implemented; the CLI just composes it).

import { resolve } from "node:path";
import {
  loadConstitution,
  initWorkspace,
  appendEvent,
  fireEvent,
  resolveCensorPolicy,
} from "@mandate/runtime";

export async function runMandate(decree, targetDir, opts) {
  opts = opts || {};
  if (!decree || typeof decree !== "string") {
    return { ok: false, message: "decree required (e.g., mandate run 'survey latest LLM agents')" };
  }
  const root = resolve(targetDir || ".");
  const loaded = loadConstitution(root);
  if (!loaded.ok) {
    return { ok: false, message: "failed to load constitution: " + (loaded.errors && loaded.errors[0] ? loaded.errors[0].message : "unknown") };
  }
  const cfg = loaded.constitution;

  const runId = "run-" + Date.now().toString(36);
  await initWorkspace(root, { snapshotPrevious: opts.snapshot !== false });
  await appendEvent(root, { type: "mandate_received", run_id: runId, decree });

  const agentInvoker = opts.agentInvoker || null;
  const censorFn = opts.censorFn || null;

  if (typeof agentInvoker !== "function" || typeof censorFn !== "function") {
    return {
      ok: true,
      mode: "scaffold-only",
      run_id: runId,
      decree,
      message:
        "mandate received and workspace prepared. " +
        "Supply opts.agentInvoker (your LLM call) AND opts.censorFn (independent-model audit) to actually run hooks.",
      next_action: "wire @mandate/runtime executeHook with your provider; see B.M4 orchestrator",
    };
  }

  const chancellorHooks = opts.chancellorHooks || null;
  if (!chancellorHooks) {
    return {
      ok: false,
      message: "chancellorHooks required when agentInvoker provided. Pass the role hooks declaration.",
    };
  }

  const censorPolicy = resolveCensorPolicy({
    tier: cfg.censor && cfg.censor.default_tier ? cfg.censor.default_tier : "balanced",
    role: "chancellor",
    overrides: cfg.censor && cfg.censor.overrides ? cfg.censor.overrides : {},
  });

  let result;
  try {
    result = await fireEvent({
      roleHooks: chancellorHooks,
      role: "chancellor",
      event: "on_mandate_received",
      runId,
      censorPolicy,
      agentInvoker,
      censorFn,
      validators: opts.validators || {},
      projectRoot: root,
    });
  } catch (err) {
    await appendEvent(root, { type: "mandate_failed", run_id: runId, error: err.message });
    return { ok: false, message: "mandate execution threw: " + err.message };
  }

  await appendEvent(root, { type: "mandate_completed", run_id: runId, hooks_fired: result.results.length });

  return {
    ok: true,
    mode: "executed",
    run_id: runId,
    decree,
    hooks_fired: result.results.length,
    message: "mandate run complete (" + result.results.length + " chancellor hook(s) fired)",
  };
}
