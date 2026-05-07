// mandate genesis — LLM-driven court designer.
//
// Convenes a provisional 3-agent court (provisional Chancellor + provisional
// CTO + provisional Censor) to refine a one-line user prompt into a real
// .mandate/ scaffold tuned to the user's domain.
//
// In v0.3-alpha this command is a wired shell: validation + chronicle log
// + scaffold drop-in are deterministic. The 3-agent refinement requires
// a host-injected agentInvoker. Without one, falls back to runCreate
// with the user-specified template.

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { runCreate } from "./create.mjs";
import { appendEvent } from "@mandate/runtime";

export async function runGenesis(prompt, targetDir, opts) {
  opts = opts || {};
  if (!prompt || typeof prompt !== "string") {
    return { ok: false, message: "prompt required (e.g., mandate genesis 'monitor stock markets')" };
  }
  if (!targetDir) {
    return { ok: false, message: "target directory required" };
  }
  const root = resolve(targetDir);

  const agentInvoker = opts.agentInvoker || null;

  if (typeof agentInvoker !== "function") {
    const createResult = await runCreate(targetDir, {
      template: opts.template || "both",
      language: opts.language,
      censorTier: opts.censorTier,
      force: opts.force,
    });
    if (!createResult.ok) return createResult;

    return {
      ok: true,
      mode: "fallback-scaffold",
      prompt,
      scaffolded_at: root,
      message:
        "scaffolded default court at " + targetDir + ". Inject opts.agentInvoker to run " +
        "the 3-agent provisional court refinement (provisional Chancellor + CTO + Censor).",
      next_action: "see docs/specs/2026-05-01-mandate-design.md §10.2 for the genesis recipe",
    };
  }

  const refinementPrompt = buildGenesisPrompt(prompt);
  let refined;
  try {
    refined = await agentInvoker(refinementPrompt);
  } catch (err) {
    return { ok: false, message: "provisional court invocation failed: " + err.message };
  }

  const createResult = await runCreate(targetDir, {
    template: opts.template || "both",
    language: opts.language,
    censorTier: opts.censorTier,
    force: opts.force,
  });
  if (!createResult.ok) return createResult;

  if (existsSync(root)) {
    try {
      await appendEvent(root, {
        type: "genesis_held",
        prompt,
        refined_summary: typeof refined === "string" ? refined.slice(0, 500) : null,
      });
    } catch { /* chronicle write is best-effort */ }
  }

  return {
    ok: true,
    mode: "provisional-court",
    prompt,
    refined,
    scaffolded_at: root,
    message: "genesis complete; provisional court refinement saved to chronicle as genesis_held",
  };
}

function buildGenesisPrompt(userPrompt) {
  const lines = [
    "You are a provisional 3-agent court (provisional Chancellor + CTO + Censor).",
    "User wants a multi-agent system to: " + userPrompt,
    "",
    "Refine this into a Mandate court design:",
    "  1. Decompose into N project groups (Chancellor)",
    "  2. For each group, draft an investigation_brief and implementation_doc skeleton (CTO)",
    "  3. Identify any forbidden patterns (Censor)",
    "",
    "Output a markdown summary with: project name, groups, censor tier, model preferences, censor red-lines.",
  ];
  return lines.join("\n");
}
