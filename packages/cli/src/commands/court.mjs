// mandate court session — Daily Court Cadence (morning/evening/status/history).
//
// Subcommands:
//   court morning  — Chancellor sweeps yesterday chronicle, sets today decree
//   court evening  — Retrospective; Historian flags red-lines (LLM)
//   court status   — Latest court events from chronicle (deterministic)
//   court history  — All court events in last N days (deterministic)
//
// Court events are logged to chronicle as type=court_session_held with
// subtype=morning|evening, so the deterministic subcommands work even
// before any LLM is wired.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  loadConstitution,
  appendEvent,
  readChronicle,
  readChronicleRange,
  chronicleDate,
} from "@mandate/runtime";

const SUPPORTED_SESSIONS = new Set(["morning", "evening", "status", "history"]);

export async function runCourt(session, targetDir = ".", opts = {}) {
  if (!SUPPORTED_SESSIONS.has(session)) {
    return {
      ok: false,
      message: "unknown court session " + JSON.stringify(session) + ". Use: " + [...SUPPORTED_SESSIONS].join(" | "),
    };
  }
  const root = resolve(targetDir);
  switch (session) {
    case "status":   return courtStatus(root, opts);
    case "history":  return courtHistory(root, opts);
    case "morning":  return courtMorning(root, opts);
    case "evening":  return courtEvening(root, opts);
  }
}

async function courtStatus(root, opts) {
  const tail = opts && opts.tail !== undefined ? opts.tail : 5;
  const events = await safeReadToday(root);
  const courtEvents = events.filter((e) => e.type === "court_session_held");
  const latest = courtEvents.slice(-tail);
  return {
    ok: true,
    today: chronicleDate(),
    latest_sessions: latest,
    message: latest.length
      ? latest.length + " court session(s) held today"
      : "no court sessions today yet",
  };
}

async function courtHistory(root, opts) {
  const days = opts && opts.days !== undefined ? opts.days : 7;
  const dates = lastNDates(days);
  let events;
  try {
    events = await readChronicleRange(root, dates[0], dates[dates.length - 1]);
  } catch (err) {
    return { ok: false, message: "failed to read chronicle: " + err.message };
  }
  const courtEvents = events.filter((e) => e.type === "court_session_held");
  return {
    ok: true,
    days,
    sessions: courtEvents,
    message: courtEvents.length + " court session(s) in last " + days + " day(s)",
  };
}

async function courtMorning(root, opts) {
  const agentInvoker = opts && opts.agentInvoker ? opts.agentInvoker : null;
  const decree = opts && opts.decree !== undefined ? opts.decree : null;
  const loaded = loadConstitution(root);
  if (!loaded.ok) {
    return { ok: false, message: "failed to load constitution: " + (loaded.errors && loaded.errors[0] ? loaded.errors[0].message : "unknown") };
  }
  const cfg = loaded.constitution;

  if (typeof agentInvoker !== "function") {
    return {
      ok: true,
      session: "morning",
      decree,
      synthesis: null,
      message: "morning court setup ok — supply opts.agentInvoker to invoke Chancellor for synthesis.",
      next_action: "inject agentInvoker(prompt) -> string and re-run",
    };
  }

  const yesterday = await safeReadDate(root, dayOffset(-1));
  const prompt = buildMorningPrompt(cfg, yesterday, decree);
  let synthesis;
  try {
    synthesis = await agentInvoker(prompt);
  } catch (err) {
    return { ok: false, message: "agentInvoker threw: " + err.message };
  }

  const decreePath = join(root, ".mandate", "workspace", "today_decree.md");
  mkdirSync(join(root, ".mandate", "workspace"), { recursive: true });
  writeFileSync(decreePath, String(synthesis), "utf8");

  await appendEvent(root, {
    type: "court_session_held",
    subtype: "morning",
    decree,
    artifact: ".mandate/workspace/today_decree.md",
  });

  return {
    ok: true,
    session: "morning",
    decree,
    synthesis,
    artifact: decreePath,
    message: "morning court convened; today_decree.md written",
  };
}

async function courtEvening(root, opts) {
  const agentInvoker = opts && opts.agentInvoker ? opts.agentInvoker : null;
  const loaded = loadConstitution(root);
  if (!loaded.ok) {
    return { ok: false, message: "failed to load constitution: " + (loaded.errors && loaded.errors[0] ? loaded.errors[0].message : "unknown") };
  }
  const cfg = loaded.constitution;

  if (typeof agentInvoker !== "function") {
    return {
      ok: true,
      session: "evening",
      retrospective: null,
      message: "evening court setup ok — supply opts.agentInvoker to invoke Historian for retrospective.",
      next_action: "inject agentInvoker(prompt) -> string and re-run",
    };
  }

  const today = await safeReadToday(root);
  const prompt = buildEveningPrompt(cfg, today);
  let retrospective;
  try {
    retrospective = await agentInvoker(prompt);
  } catch (err) {
    return { ok: false, message: "agentInvoker threw: " + err.message };
  }

  const retroPath = join(root, ".mandate", "workspace", "today_retrospective.md");
  mkdirSync(join(root, ".mandate", "workspace"), { recursive: true });
  writeFileSync(retroPath, String(retrospective), "utf8");

  await appendEvent(root, {
    type: "court_session_held",
    subtype: "evening",
    artifact: ".mandate/workspace/today_retrospective.md",
    events_observed: today.length,
  });

  return {
    ok: true,
    session: "evening",
    retrospective,
    artifact: retroPath,
    events_observed: today.length,
    message: "evening court adjourned; today_retrospective.md written",
  };
}

function buildMorningPrompt(cfg, yesterdayEvents, decree) {
  const projectName = cfg.project || "mandate-project";
  const lines = [
    "You are the Chancellor of court " + projectName + " v" + cfg.version + ".",
    "Convene morning court. Reflect on yesterday " + yesterdayEvents.length + " chronicled events,",
    "then articulate today decree, group priorities, and any topology changes needed.",
    "",
    decree ? ("Today emperor decree: " + decree) : "No new emperor decree; carry over yesterday priorities.",
    "",
    "Output today_decree.md (markdown) — sections: Priorities | Group assignments | Risks | Token budget.",
  ];
  return lines.join("\n");
}

function buildEveningPrompt(cfg, todayEvents) {
  const projectName = cfg.project || "mandate-project";
  const lines = [
    "You are the Historian of court " + projectName + " v" + cfg.version + ".",
    "Convene evening court. Review today " + todayEvents.length + " chronicled events.",
    "Surface red-line trips, cost overruns, drift signals, and any reform PRs that should be drafted.",
    "",
    "Output today_retrospective.md (markdown) — sections:",
    "  - What worked",
    "  - What broke (with chronicle event refs)",
    "  - Cost summary (token usage by role)",
    "  - Reform PR suggestions (link to reforms/PR-NNN-slug.md if applicable)",
  ];
  return lines.join("\n");
}

async function safeReadToday(root) {
  try { return await readChronicle(root, chronicleDate()); }
  catch { return []; }
}

async function safeReadDate(root, dateStr) {
  try { return await readChronicle(root, dateStr); }
  catch { return []; }
}

function dayOffset(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return chronicleDate(d);
}

function lastNDates(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    out.push(chronicleDate(d));
  }
  return out;
}

export function formatCourtReport(result) {
  if (!result.ok) return "x " + result.message;
  const lines = ["court " + (result.session || "status") + ": " + result.message];
  if (result.next_action) lines.push("  -> " + result.next_action);
  if (result.artifact) lines.push("  artifact: " + result.artifact);
  if (result.latest_sessions && result.latest_sessions.length) {
    lines.push("  Recent court events:");
    for (const e of result.latest_sessions) {
      lines.push("    - " + e.ts + " " + (e.subtype || "session"));
    }
  }
  if (result.sessions && result.sessions.length) {
    lines.push("  Sessions in window:");
    for (const e of result.sessions) {
      lines.push("    - " + e.ts + " " + (e.subtype || "session") + " (artifact: " + (e.artifact || "-") + ")");
    }
  }
  return lines.join("\n");
}
