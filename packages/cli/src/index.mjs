/**
 * @mandate/cli — main entry.
 *
 * Routes top-level subcommands to their implementations.
 *
 * v0.3.0-alpha implements: `create`.
 * Other commands print "coming in v0.4" and exit 2.
 */

import { Command } from 'commander';
import { runCreate } from './commands/create.mjs';

const PKG_VERSION = '0.3.0-alpha.0';

function notImplemented(name) {
  return () => {
    console.log(`📜 ${name}: coming in v0.4 (Phase B M3-M8). Track: https://github.com/liujiarui0918/mandate`);
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

  for (const sub of ['genesis', 'evolve', 'run', 'audit', 'ratify', 'veto', 'validate', 'status', 'explain']) {
    program
      .command(`${sub} [args...]`)
      .description(`(coming in v0.4)`)
      .action(notImplemented(sub));
  }

  program
    .command('court <session>')
    .description('(coming in v0.4) trigger morning|evening|status|skip')
    .action(notImplemented('court'));

  await program.parseAsync(argv);
}
