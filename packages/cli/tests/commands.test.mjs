// @mandate/cli — tests for evolve / ratify / veto / status / explain / audit.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runEvolve } from "../src/commands/evolve.mjs";
import { runRatify } from "../src/commands/ratify.mjs";
import { runVeto } from "../src/commands/veto.mjs";
import { runStatus } from "../src/commands/status.mjs";
import { runExplain } from "../src/commands/explain.mjs";
import { runAudit } from "../src/commands/audit.mjs";
import { runCreate } from "../src/commands/create.mjs";

import yaml from "js-yaml";
import matter from "gray-matter";

function newCourt() {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-cli-"));
  return tmp;
}

async function bootstrapCourt() {
  const tmp = newCourt();
  await runCreate(tmp, { template: "research", language: "en", force: true });
  return tmp;
}

// ---- evolve

test("evolve: bumps patch by default", async () => {
  const tmp = await bootstrapCourt();
  try {
    const before = yaml.load(
      readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8"),
    );
    const result = await runEvolve(tmp);
    assert.equal(result.ok, true);
    assert.equal(result.bump, "patch");
    const [a, b, c] = before.version.split(".").map(Number);
    assert.equal(result.newVersion, `${a}.${b}.${c + 1}`);
    const after = yaml.load(
      readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8"),
    );
    assert.equal(after.version, result.newVersion);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("evolve: --major bumps major", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runEvolve(tmp, { bump: "major" });
    assert.equal(result.ok, true);
    assert.match(result.newVersion, /^\d+\.0\.0$/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("evolve: --dry-run does not write", async () => {
  const tmp = await bootstrapCourt();
  try {
    const before = readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8");
    const result = await runEvolve(tmp, { bump: "minor", dryRun: true });
    assert.equal(result.ok, true);
    assert.equal(result.dryRun, true);
    const after = readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8");
    assert.equal(before, after);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("evolve: rejects invalid bump", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runEvolve(tmp, { bump: "yolo" });
    assert.equal(result.ok, false);
    assert.match(result.message, /invalid bump/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("evolve: surfaces error when no constitution", async () => {
  const tmp = newCourt();
  try {
    const result = await runEvolve(tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /failed to load constitution/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- ratify

function writePr(reformsDir, prId, frontmatter, body = "PR body") {
  mkdirSync(reformsDir, { recursive: true });
  const text = matter.stringify(body, frontmatter);
  const filename = frontmatter.title
    ? `${prId}-${frontmatter.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`
    : `${prId}.md`;
  const path = join(reformsDir, filename);
  writeFileSync(path, text, "utf8");
  return path;
}

test("ratify: applies set_param + set_model and bumps minor", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-001", {
      pr_id: "PR-001",
      title: "Tighten censor",
      rationale: "Drift detected in scout",
      diff_target: "constitution.yaml#censor",
      status: "pending",
      proposed_changes: [
        { op: "set_param", path: "censor.default_tier", value: "paranoid" },
        { op: "set_model", role: "scout", preferred: "gemini-3.1-pro" },
      ],
    });
    const result = await runRatify("PR-001", tmp, { bump: "minor" });
    assert.equal(result.ok, true);
    const cfg = yaml.load(
      readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8"),
    );
    assert.equal(cfg.censor.default_tier, "paranoid");
    assert.equal(cfg.models.scout.preferred, "gemini-3.1-pro");
    const ledger = yaml.load(readFileSync(join(tmp, "reforms/_ratified.yaml"), "utf8"));
    assert.equal(ledger.ratified[0].pr_id, "PR-001");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("ratify: refuses already-ratified PR", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-002", {
      pr_id: "PR-002",
      title: "Already done",
      rationale: "x",
      diff_target: "x",
      status: "ratified",
      proposed_changes: [{ op: "set_param", path: "x.y", value: 1 }],
    });
    const result = await runRatify("PR-002", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /already ratified/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("ratify: rejects invalid PR id format", async () => {
  const result = await runRatify("not-a-pr", ".");
  assert.equal(result.ok, false);
  assert.match(result.message, /invalid PR id/);
});

test("ratify: handles missing PR", async () => {
  const tmp = await bootstrapCourt();
  try {
    mkdirSync(join(tmp, "reforms"));
    const result = await runRatify("PR-999", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /not found/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("ratify: --dry-run does not modify constitution", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-003", {
      pr_id: "PR-003",
      title: "Dry run test",
      rationale: "x",
      diff_target: "x",
      status: "pending",
      proposed_changes: [{ op: "set_param", path: "censor.default_tier", value: "frugal" }],
    });
    const before = readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8");
    const result = await runRatify("PR-003", tmp, { dryRun: true });
    assert.equal(result.ok, true);
    assert.equal(result.dryRun, true);
    const after = readFileSync(join(tmp, ".mandate/constitution/constitution.yaml"), "utf8");
    assert.equal(before, after);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- veto

test("veto: marks PR vetoed and moves to _rejected/", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-010", {
      pr_id: "PR-010",
      title: "Bad idea",
      rationale: "x",
      diff_target: "x",
      status: "pending",
      proposed_changes: [{ op: "set_param", path: "x.y", value: 1 }],
    });
    const result = await runVeto("PR-010", tmp, { reason: "would break censor" });
    assert.equal(result.ok, true);
    assert.match(result.moved_to, /_rejected/);
    const moved = readFileSync(join(tmp, result.moved_to), "utf8");
    const parsed = matter(moved);
    assert.equal(parsed.data.status, "vetoed");
    assert.equal(parsed.data.veto_reason, "would break censor");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("veto: refuses to veto an already-ratified PR", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-011", {
      pr_id: "PR-011",
      title: "Done",
      rationale: "x",
      diff_target: "x",
      status: "ratified",
      proposed_changes: [{ op: "set_param", path: "x.y", value: 1 }],
    });
    const result = await runVeto("PR-011", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /already ratified/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- status

test("status: reports constitution + workspace state", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runStatus(tmp);
    assert.equal(result.ok, true);
    assert.ok(result.status.constitution);
    assert.equal(result.status.workspace_present, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("status: reports ratified count when ledger present", async () => {
  const tmp = await bootstrapCourt();
  try {
    writePr(join(tmp, "reforms"), "PR-020", {
      pr_id: "PR-020",
      title: "x",
      rationale: "x",
      diff_target: "x",
      status: "pending",
      proposed_changes: [{ op: "set_param", path: "censor.default_tier", value: "paranoid" }],
    });
    await runRatify("PR-020", tmp);
    const result = await runStatus(tmp);
    assert.equal(result.status.reforms.ratified, 1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("status: surfaces error when constitution missing", async () => {
  const tmp = newCourt();
  try {
    const result = await runStatus(tmp);
    assert.equal(result.ok, true);
    assert.equal(result.status.constitution, null);
    assert.ok(result.status.constitution_error);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- explain

test("explain: returns role report with model + visible files", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runExplain("chancellor", tmp);
    assert.equal(result.ok, true);
    assert.equal(result.report.role, "chancellor");
    assert.ok(result.report.model);
    assert.ok(Array.isArray(result.report.visible_files));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("explain: rejects unknown role", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runExplain("jester", tmp);
    assert.equal(result.ok, false);
    assert.match(result.message, /unknown role/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("explain: requires role argument", async () => {
  const result = await runExplain("", ".");
  assert.equal(result.ok, false);
  assert.match(result.message, /role required/);
});

// ---- audit

test("audit: returns empty when chronicle is empty", async () => {
  const tmp = await bootstrapCourt();
  try {
    const result = await runAudit(tmp, { days: 7 });
    assert.equal(result.ok, true);
    assert.equal(result.candidates.length, 0);
    assert.match(result.message, /no red-line events/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("audit: surfaces red-line events from chronicle", async () => {
  const tmp = await bootstrapCourt();
  try {
    const { appendEvent, chronicleDate } = await import("@mandate/runtime");
    await appendEvent(tmp, {
      type: "hook_failed",
      role: "scout",
      run_id: "r1",
      severity: "red_line",
    });
    await appendEvent(tmp, {
      type: "hook_fired",
      role: "scout",
      run_id: "r2",
    });
    const result = await runAudit(tmp, { days: 1 });
    assert.equal(result.ok, true);
    assert.equal(result.candidates.length, 1, "only the failed hook should surface");
    assert.equal(result.candidates[0].type, "hook_failed");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("audit: writes audit reports when historianFn injected", async () => {
  const tmp = await bootstrapCourt();
  try {
    const { appendEvent } = await import("@mandate/runtime");
    await appendEvent(tmp, {
      type: "censor_rejected",
      role: "soldier",
      run_id: "r1",
    });
    const result = await runAudit(tmp, {
      days: 1,
      historianFn: async (event) => `# AUDIT for ${event.type}\n\nfindings: ...\n`,
    });
    assert.equal(result.ok, true);
    assert.equal(result.audits_written.length, 1);
    const path = join(tmp, "audits", result.audits_written[0]);
    const text = readFileSync(path, "utf8");
    assert.match(text, /AUDIT for censor_rejected/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
