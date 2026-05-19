// @mandateai/adapters — adapter tests.
//
// Verifies the dispatcher routes by protocol, each adapter exposes the
// {name, input_schema, output_schema, run} contract, and unwired adapters
// throw NotImplementedError instead of silently failing.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  AdapterError,
  NotImplementedError,
  assertSkillSpec,
  makeRunnable,
  SUPPORTED_PROTOCOLS,
  getAdapter,
  resolveSkill,
  runSkill,
  mcp,
  claudeSkill,
  openclawSkill,
  cli,
  mandateBuiltin,
} from "../src/index.mjs";

test("SUPPORTED_PROTOCOLS lists the 5 protocol kinds", () => {
  assert.deepEqual(
    [...SUPPORTED_PROTOCOLS].sort(),
    ["claude-skill", "cli", "mandate-builtin", "mcp", "openclaw-skill"],
  );
});

test("getAdapter returns the matching adapter module", () => {
  assert.equal(getAdapter("mcp").protocol, "mcp");
  assert.equal(getAdapter("cli").protocol, "cli");
  assert.equal(getAdapter("mandate-builtin").protocol, "mandate-builtin");
  assert.equal(getAdapter("claude-skill").protocol, "claude-skill");
  assert.equal(getAdapter("openclaw-skill").protocol, "openclaw-skill");
});

test("getAdapter throws on unknown protocol", () => {
  assert.throws(() => getAdapter("wizardry"), AdapterError);
});

test("assertSkillSpec rejects malformed specs", () => {
  assert.throws(() => assertSkillSpec(null), AdapterError);
  assert.throws(() => assertSkillSpec({}), /protocol/);
  assert.throws(() => assertSkillSpec({ protocol: "mcp" }), /name/);
});

test("makeRunnable rejects when run is missing", () => {
  assert.throws(
    () => makeRunnable({ name: "x", protocol: "mcp" }),
    /run/,
  );
});

test("makeRunnable freezes the runnable", () => {
  const r = makeRunnable({ name: "x", protocol: "mcp", run: () => 1 });
  assert.equal(Object.isFrozen(r), true);
});

// ---- mandate-builtin

test("mandate-builtin: resolve fails when skill not registered", () => {
  mandateBuiltin.clearBuiltins();
  assert.throws(
    () => mandateBuiltin.resolve({ protocol: "mandate-builtin", name: "noop" }),
    /not registered/,
  );
});

test("mandate-builtin: registered skill is invokable via dispatcher", async () => {
  mandateBuiltin.clearBuiltins();
  mandateBuiltin.registerBuiltin("echo", {
    description: "echoes input",
    run: async (input) => ({ echoed: input }),
  });
  const out = await runSkill({ protocol: "mandate-builtin", name: "echo" }, "hello");
  assert.deepEqual(out, { echoed: "hello" });
});

test("mandate-builtin: listBuiltins returns sorted names", () => {
  mandateBuiltin.clearBuiltins();
  mandateBuiltin.registerBuiltin("zeta", { run: () => null });
  mandateBuiltin.registerBuiltin("alpha", { run: () => null });
  assert.deepEqual(mandateBuiltin.listBuiltins(), ["alpha", "zeta"]);
});

test("mandate-builtin: rejects wrong-protocol spec", () => {
  assert.throws(
    () => mandateBuiltin.resolve({ protocol: "cli", name: "x" }),
    /received protocol/,
  );
});

// ---- mcp

test("mcp: resolve throws when tool not registered", () => {
  mcp.clearMcp();
  assert.throws(
    () => mcp.resolve({ protocol: "mcp", name: "brave-search" }),
    /not registered/,
  );
});

test("mcp: resolved runnable throws NotImplementedError when client factory absent", async () => {
  mcp.clearMcp();
  mcp.registerServer("brave", { transport: "stdio", command: "fake" });
  mcp.registerTool("brave-search", { server: "brave", description: "search" });
  const r = mcp.resolve({ protocol: "mcp", name: "brave-search" });
  assert.equal(r.protocol, "mcp");
  assert.equal(r.description, "search");
  await assert.rejects(() => r.run({ query: "x" }), NotImplementedError);
});

test("mcp: invokes injected client factory", async () => {
  mcp.clearMcp();
  mcp.registerServer("brave", { transport: "stdio", command: "fake" });
  mcp.registerTool("brave-search", { server: "brave" });
  mcp.setClientFactory(async () => ({
    callTool: async (name, input) => ({ called: name, withArg: input }),
  }));
  const out = await runSkill({ protocol: "mcp", name: "brave-search" }, { q: "rust" });
  assert.deepEqual(out, { called: "brave-search", withArg: { q: "rust" } });
  mcp.clearMcp();
});

test("mcp: registerTool rejects unknown server", () => {
  mcp.clearMcp();
  assert.throws(
    () => mcp.registerTool("orphan", { server: "nope" }),
    /unknown server/,
  );
});

// ---- claude-skill

test("claude-skill: resolve throws NotImplementedError when invoker not set", async () => {
  claudeSkill.clearClaudeSkill();
  const r = claudeSkill.resolve({ protocol: "claude-skill", name: "deep-research" });
  assert.equal(r.protocol, "claude-skill");
  await assert.rejects(() => r.run({}), NotImplementedError);
});

test("claude-skill: invokes injected invoker", async () => {
  claudeSkill.clearClaudeSkill();
  claudeSkill.setInvoker(async (skillName, input) => ({ via: "claude", skill: skillName, input }));
  const out = await runSkill({ protocol: "claude-skill", name: "deep-research" }, { topic: "x" });
  assert.deepEqual(out, { via: "claude", skill: "deep-research", input: { topic: "x" } });
  claudeSkill.clearClaudeSkill();
});

test("claude-skill: reads frontmatter when manifest exists", () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-claude-skill-"));
  try {
    const skillDir = join(tmp, "demo");
    mkdirSync(skillDir);
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "---\nname: demo\ndescription: a demo skill\n---\nbody",
      "utf8",
    );
    claudeSkill.setSkillsDir(tmp);
    const manifest = claudeSkill.readSkillManifest("demo");
    assert.equal(manifest.description, "a demo skill");
    assert.equal(claudeSkill.isSkillInstalled("demo"), true);
    assert.equal(claudeSkill.isSkillInstalled("missing"), false);
  } finally {
    claudeSkill.clearClaudeSkill();
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- openclaw-skill

test("openclaw-skill: resolve throws NotImplementedError when invoker not set", async () => {
  openclawSkill.clearOpenclawSkill();
  const r = openclawSkill.resolve({ protocol: "openclaw-skill", name: "web-fetch" });
  assert.equal(r.protocol, "openclaw-skill");
  await assert.rejects(() => r.run({}), NotImplementedError);
});

test("openclaw-skill: lists installed skills from custom dir", () => {
  const tmp = mkdtempSync(join(tmpdir(), "mandate-openclaw-"));
  try {
    mkdirSync(join(tmp, "web-fetch"));
    mkdirSync(join(tmp, "shell"));
    writeFileSync(join(tmp, "web-fetch", "skill.json"), JSON.stringify({ description: "fetch" }));
    openclawSkill.setSkillsDir(tmp);
    assert.deepEqual(openclawSkill.listInstalledSkills(), ["shell", "web-fetch"]);
    assert.equal(openclawSkill.isSkillInstalled("web-fetch"), true);
  } finally {
    openclawSkill.clearOpenclawSkill();
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---- cli

test("cli: resolve throws when not registered", () => {
  cli.clearCli();
  assert.throws(
    () => cli.resolve({ protocol: "cli", name: "gemini-search" }),
    /not registered/,
  );
});

test("cli: registered tool exposes a runnable with source string", () => {
  cli.clearCli();
  cli.registerCli("gemini-search", {
    command: "gemini",
    args: ["--google-search"],
    description: "gemini search",
  });
  const r = cli.resolve({ protocol: "cli", name: "gemini-search", args: ["--quiet"] });
  assert.equal(r.protocol, "cli");
  assert.equal(r.description, "gemini search");
  assert.match(r.source, /gemini --google-search --quiet/);
  cli.clearCli();
});

// ---- dispatcher integration

test("dispatcher routes by protocol", async () => {
  mandateBuiltin.clearBuiltins();
  mandateBuiltin.registerBuiltin("compute", {
    run: async (input) => input.x + input.y,
  });
  const out = await runSkill({ protocol: "mandate-builtin", name: "compute" }, { x: 2, y: 3 });
  assert.equal(out, 5);
  mandateBuiltin.clearBuiltins();
});

test("dispatcher rejects skill spec with unknown protocol", () => {
  assert.throws(
    () => resolveSkill({ protocol: "sorcery", name: "fireball" }),
    /Unknown protocol/,
  );
});
