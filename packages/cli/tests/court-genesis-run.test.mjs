// @mandate/cli — tests for court / genesis / run shells.
//
// Focuses on deterministic + LLM-stub paths. Real LLM execution is the
// host wiring concern (see docs/specs B.M8 LLM wiring section).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runCourt } from "../src/commands/court.mjs";
import { runGenesis } from "../src/commands/genesis.mjs";
import { runMandate } from "../src/commands/run.mjs";
import { runCreate } from "../src/commands/create.mjs";

async function bootstrapCourt() {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-court-"));
  await runCreate(tmp, { template: "research", language: "en", force: true });
  return tmp;
}

// ---- court status / history (deterministic)

test("court status: empty chronicle returns no sessions", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runCourt("status", tmp);
    assert.equal(result.ok, true);
    assert.equal(result.latest_sessions.length, 0);
    assert.match(result.message, /no court sessions/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court history: empty chronicle returns 0 sessions", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runCourt("history", tmp, { days: 3 });
    assert.equal(result.ok, true);
    assert.equal(result.sessions.length, 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court status surfaces past sessions logged via morning court", async () => {
  const tmp = await bootstrapCourt();
  try {
    const morning = await runCourt("morning", tmp, {
      decree: "test decree",
      agentInvoker: async () => "# Decree\n\n- priority 1\n",
    });
    assert.equal(morning.ok, true);
    assert.ok(existsSync(morning.artifact));
    const status = await runCourt("status", tmp);
    assert.equal(status.latest_sessions.length, 1);
    assert.equal(status.latest_sessions[0].subtype, "morning");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court morning without agentInvoker returns next_action hint", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runCourt("morning", tmp);
    assert.equal(result.ok, true);
    assert.equal(result.synthesis, null);
    assert.match(result.message, /supply opts.agentInvoker/);
    assert.ok(result.next_action);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court evening invokes agentInvoker with prompt + writes retrospective", async () => {
  const tmp = await bootstrapCourt();
  try {
    let capturedPrompt = null;
    const result = await runCourt("evening", tmp, {
      agentInvoker: async (prompt) => {
        capturedPrompt = prompt;
        return "# Retrospective\n\nWhat worked: ...\n";
      },
    });
    assert.equal(result.ok, true);
    assert.ok(capturedPrompt);
    assert.match(capturedPrompt, /Historian/);
    assert.match(readFileSync(result.artifact, "utf8"), /Retrospective/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court rejects unknown session", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runCourt("midnight", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /unknown court session/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("court morning surfaces agentInvoker errors", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runCourt("morning", tmp, {
      agentInvoker: async () => { throw new Error("LLM down"); },
    });
    assert.equal(result.ok, false);
    assert.match(result.message, /LLM down/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- genesis

test("genesis without agentInvoker falls back to scaffold", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-genesis-"));
  try {
    const result = await runGenesis("monitor stock markets", tmp, { template: "research" });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "fallback-scaffold");
    assert.ok(existsSync(join(tmp, ".mandate")));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("genesis with agentInvoker scaffolds + invokes provisional court", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-genesis-"));
  try {
    let capturedPrompt = null;
    const result = await runGenesis("study LLM agents", tmp, {
      template: "research",
      agentInvoker: async (prompt) => {
        capturedPrompt = prompt;
        return "## Refined court design\n\nProject: agent-research\n";
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.mode, "provisional-court");
    assert.ok(capturedPrompt);
    assert.match(capturedPrompt, /provisional 3-agent court/);
    assert.match(result.refined, /Refined court design/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("genesis rejects empty prompt", async () => {
  const result = await runGenesis("", "/tmp/x");
  assert.equal(result.ok, false);
  assert.match(result.message, /prompt required/);
});

test("genesis rejects missing target dir", async () => {
  const result = await runGenesis("anything", "");
  assert.equal(result.ok, false);
  assert.match(result.message, /target directory required/);
});

// ---- run

test("run without agentInvoker returns scaffold-only mode", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runMandate("survey latest agents", tmp);
    assert.equal(result.ok, true);
    assert.equal(result.mode, "scaffold-only");
    assert.match(result.message, /Supply opts.agentInvoker/);
    assert.match(result.run_id, /^run-/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("run rejects empty decree", async () => {
  const result = await runMandate("", "/tmp");
  assert.equal(result.ok, false);
  assert.match(result.message, /decree required/);
});

test("run requires chancellorHooks when invoker provided", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runMandate("test", tmp, {
      agentInvoker: async () => ({ ok: true }),
      censorFn: async () => ({ ok: true }),
    });
    assert.equal(result.ok, false);
    assert.match(result.message, /chancellorHooks required/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("run executes hooks when fully wired", async () => {
  const tmp = await bootstrapCourt();
  try {
    const calls = { agent: 0, censor: 0 };
    const chancellorHooks = {
      hooks: {
        on_mandate_received: [
          { must: "decompose", writes_to: "workspace/decomposition.yaml" },
        ],
      },
    };
    const result = await runMandate("test decree", tmp, {
      agentInvoker: async () => { calls.agent++; return { groups: [] }; },
      censorFn: async () => { calls.censor++; return { ok: true }; },
      chancellorHooks,
    });
    assert.equal(result.ok, true, "result message: " + result.message);
    assert.equal(result.mode, "executed");
    assert.equal(result.hooks_fired, 1);
    assert.equal(calls.agent, 1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("run surfaces failed constitution load", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-run-"));
  try {
    const result = await runMandate("test", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /failed to load constitution/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
