/**
 * @mandate/cli — main entry.
 *
 * Routes top-level subcommands to their implementations.
 *
 * v0.3.0-alpha implements: create, validate, evolve, ratify, veto,
 * status, explain, audit. Genesis / run / court still skeleton-only —
 * those need a host-injected LLM provider (B.M4 main loop is wired but
 * the CLI side currently prints a "wire your provider" hint).
 */

import { Command } from 'commander';
import { runCreate } from './commands/create.mjs';
import { runValidate, printValidationReport } from './commands/validate.mjs';
import { runEvolve } from './commands/evolve.mjs';
import { runRatify } from './commands/ratify.mjs';
import { runVeto } from './commands/veto.mjs';
import { runStatus, formatStatusReport } from './commands/status.mjs';
import { runExplain, formatExplainReport } from './commands/explain.mjs';
import { runAudit, formatAuditReport } from './commands/audit.mjs';

const PKG_VERSION = '0.3.0-alpha.0';

function notImplemented(name) {
  return () => {
    console.log(`📜 ${name}: requires LLM provider — wire @mandate/runtime's executeHook with your agentInvoker.`);
    console.log(`  See: docs/specs/2026-05-01-mandate-implementation-plan.md (B.M8 LLM wiring)`);
    process.exit(2);
  };
}

export async function main(argv) {
  const program = new Command();
  program
    .name('mandate')
    .description('Mandate (天命) — multi-agent imperial court framework')
    .version(PKG_VERSION);

  program
    .command('create <target-dir>')
    .description('scaffold a new Mandate court (.mandate/) — zero LLM calls')
    .option('-t, --template <name>', 'template: research | self-governance | both', 'both')
    .option('-l, --language <lang>', 'CLI/docs language: zh | en | both', undefined)
    .option('-c, --censor-tier <tier>', 'paranoid | balanced | frugal', undefined)
    .option('-f, --force', 'overwrite if .mandate already exists', false)
    .action(async (targetDir, opts) => {
      const result = await runCreate(targetDir, {
        template: opts.template,
        language: opts.language,
        censorTier: opts.censorTier,
        force: opts.force,
      });
      if (result.ok) {
        console.log(`✓ ${result.message}`);
        console.log(`  Next: cd ${targetDir} && mandate run "<your first decree>"`);
        process.exit(0);
      } else {
        console.error(`✗ ${result.message}`);
        process.exit(1);
      }
    });

  program
    .command('validate [target]')
    .description('static lint of a Mandate court (constitution + decomposition + topology)')
    .option('--schema-root <path>', 'override schema directory (default: <repo>/spec)')
    .action(async (target, opts) => {
      const result = runValidate(target ?? '.', { schemaRoot: opts.schemaRoot });
      printValidationReport(result);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('evolve [target]')
    .description('bump constitution version after a manual edit (semver)')
    .option('--major', 'bump major version (topology change)')
    .option('--minor', 'bump minor version (new role / hook)')
    .option('--patch', 'bump patch version (parameter tweak, default)')
    .option('--dry-run', 'preview without writing')
    .action(async (target, opts) => {
      const bump = opts.major ? 'major' : opts.minor ? 'minor' : 'patch';
      const result = await runEvolve(target ?? '.', { bump, dryRun: !!opts.dryRun });
      console.log(result.ok ? `✓ ${result.message}` : `✗ ${result.message}`);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('ratify <pr-id> [target]')
    .description("Emperor's vermillion seal — apply a reform PR + bump constitution")
    .option('--major', 'bump major version (default: minor)')
    .option('--patch', 'bump patch version (default: minor)')
    .option('--dry-run', 'preview without writing')
    .action(async (prId, target, opts) => {
      const bump = opts.major ? 'major' : opts.patch ? 'patch' : 'minor';
      const result = await runRatify(prId, target ?? '.', { bump, dryRun: !!opts.dryRun });
      console.log(result.ok ? `✓ ${result.message}` : `✗ ${result.message}`);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('veto <pr-id> [target]')
    .description('Reject a reform PR — moves to reforms/_rejected/ with reason')
    .option('-r, --reason <text>', 'rejection reason (recorded in PR frontmatter)')
    .option('--dry-run', 'preview without writing')
    .action(async (prId, target, opts) => {
      const result = await runVeto(prId, target ?? '.', {
        reason: opts.reason ?? '',
        dryRun: !!opts.dryRun,
      });
      console.log(result.ok ? `✓ ${result.message}` : `✗ ${result.message}`);
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('status [target]')
    .description('show current court state (constitution, workspace, recent chronicle)')
    .option('--tail <n>', 'tail N most recent chronicle events (default 10)', '10')
    .action(async (target, opts) => {
      const tail = Number(opts.tail) || 10;
      const result = await runStatus(target ?? '.', { tail });
      console.log(formatStatusReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('explain <role> [target]')
    .description("print a role's hooks + skills + visible files")
    .option('--json', 'output as JSON')
    .action(async (role, target, opts) => {
      const result = await runExplain(role, target ?? '.', { format: opts.json ? 'json' : 'text' });
      console.log(formatExplainReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  program
    .command('audit [target]')
    .description('list red-line events from chronicle (last N days)')
    .option('--days <n>', 'days back to scan (default 7)', '7')
    .action(async (target, opts) => {
      const days = Number(opts.days) || 7;
      const result = await runAudit(target ?? '.', { days });
      console.log(formatAuditReport(result));
      process.exit(result.ok ? 0 : 1);
    });

  for (const sub of ['genesis', 'run']) {
    program
      .command(`${sub} [args...]`)
      .description(`(needs LLM provider — see docs/specs)`)
      .action(notImplemented(sub));
  }

  program
    .command('court <session>')
    .description('(needs LLM provider) trigger morning|evening|status|history')
    .action(notImplemented('court'));

  await program.parseAsync(argv);
}
