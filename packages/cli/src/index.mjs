// @mandateai/cli — main entry.
//
// Routes top-level subcommands to their implementations.

import { Command } from "commander";
import { runCreate } from "./commands/create.mjs";
import { runValidate, printValidationReport } from "./commands/validate.mjs";
import { runEvolve } from "./commands/evolve.mjs";
import { runRatify } from "./commands/ratify.mjs";
import { runVeto } from "./commands/veto.mjs";
import { runStatus, formatStatusReport } from "./commands/status.mjs";
import { runExplain, formatExplainReport } from "./commands/explain.mjs";
import { runAudit, formatAuditReport } from "./commands/audit.mjs";
import { runCourt, formatCourtReport } from "./commands/court.mjs";
import { runGenesis } from "./commands/genesis.mjs";
import { runMandate } from "./commands/run.mjs";

const PKG_VERSION = "0.3.0-alpha.1";

export async function main(argv) {
  const program = new Command();
  program
    .name("mandate")
    .description("Mandate (天命) — multi-agent imperial court framework")
    .version(PKG_VERSION);

  program
    .command("create <target-dir>")
    .description("scaffold a new Mandate court (.mandate/) — zero LLM calls")
    .option("-t, --template <name>", "template: research | self-governance | both", "both")
    .option("-l, --language <lang>", "CLI/docs language: zh | en | both")
    .option("-c, --censor-tier <tier>", "paranoid | balanced | frugal")
    .option("-f, --force", "overwrite if .mandate already exists", false)
    .action(async (targetDir, opts) => {
      const result = await runCreate(targetDir, {
        template: opts.template,
        language: opts.language,
        censorTier: opts.censorTier,
        force: opts.force,
      });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      if (result.ok) console.log("  Next: cd " + targetDir + " && mandate run <your first decree>");
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("validate [target]")
    .description("static lint of a Mandate court (constitution + decomposition + topology)")
    .option("--schema-root <path>", "override schema directory")
    .action(async (target, opts) => {
      const result = runValidate(target || ".", { schemaRoot: opts.schemaRoot });
      printValidationReport(result);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("evolve [target]")
    .description("bump constitution version after a manual edit (semver)")
    .option("--major", "bump major version (topology change)")
    .option("--minor", "bump minor version (new role / hook)")
    .option("--patch", "bump patch version (parameter tweak, default)")
    .option("--dry-run", "preview without writing")
    .action(async (target, opts) => {
      const bump = opts.major ? "major" : opts.minor ? "minor" : "patch";
      const result = await runEvolve(target || ".", { bump, dryRun: !!opts.dryRun });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("ratify <pr-id> [target]")
    .description("Emperor seal — apply a reform PR + bump constitution")
    .option("--major", "bump major version (default: minor)")
    .option("--patch", "bump patch version (default: minor)")
    .option("--dry-run", "preview without writing")
    .action(async (prId, target, opts) => {
      const bump = opts.major ? "major" : opts.patch ? "patch" : "minor";
      const result = await runRatify(prId, target || ".", { bump, dryRun: !!opts.dryRun });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("veto <pr-id> [target]")
    .description("Reject a reform PR — moves to reforms/_rejected/ with reason")
    .option("-r, --reason <text>", "rejection reason")
    .option("--dry-run", "preview without writing")
    .action(async (prId, target, opts) => {
      const result = await runVeto(prId, target || ".", { reason: opts.reason || "", dryRun: !!opts.dryRun });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("status [target]")
    .description("show current court state (constitution, workspace, recent chronicle)")
    .option("--tail <n>", "tail N most recent chronicle events", "10")
    .action(async (target, opts) => {
      const tail = Number(opts.tail) || 10;
      const result = await runStatus(target || ".", { tail });
      console.log(formatStatusReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("explain <role> [target]")
    .description("print a role hooks + skills + visible files")
    .option("--json", "output as JSON")
    .action(async (role, target, opts) => {
      const result = await runExplain(role, target || ".", { format: opts.json ? "json" : "text" });
      console.log(formatExplainReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("audit [target]")
    .description("list red-line events from chronicle (last N days)")
    .option("--days <n>", "days back to scan", "7")
    .action(async (target, opts) => {
      const days = Number(opts.days) || 7;
      const result = await runAudit(target || ".", { days });
      console.log(formatAuditReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("court <session> [target]")
    .description("Daily Court Cadence: morning | evening | status | history")
    .option("--days <n>", "history window in days", "7")
    .option("--tail <n>", "status tail count", "5")
    .option("--decree <text>", "morning court decree text")
    .action(async (session, target, opts) => {
      const result = await runCourt(session, target || ".", {
        days: Number(opts.days) || 7,
        tail: Number(opts.tail) || 5,
        decree: opts.decree,
      });
      console.log(formatCourtReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("genesis <prompt> <target-dir>")
    .description("LLM-driven court designer — refines a prompt into a tuned court")
    .option("-t, --template <name>", "fallback template if no agentInvoker", "both")
    .option("-l, --language <lang>", "CLI/docs language: zh | en | both")
    .option("-c, --censor-tier <tier>", "paranoid | balanced | frugal")
    .option("-f, --force", "overwrite if .mandate already exists", false)
    .action(async (prompt, targetDir, opts) => {
      const result = await runGenesis(prompt, targetDir, {
        template: opts.template,
        language: opts.language,
        censorTier: opts.censorTier,
        force: opts.force,
      });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      if (result.next_action) console.log("  -> " + result.next_action);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command("run <decree> [target]")
    .description("execute one mandate end-to-end (requires agentInvoker + censorFn)")
    .option("--no-snapshot", "skip workspace snapshot before run")
    .action(async (decree, target, opts) => {
      const result = await runMandate(decree, target || ".", { snapshot: opts.snapshot !== false });
      console.log(result.ok ? "ok " + result.message : "x " + result.message);
      if (result.next_action) console.log("  -> " + result.next_action);
      process.exit(result.ok ? 0 : 1);
    });

  await program.parseAsync(argv);
}
