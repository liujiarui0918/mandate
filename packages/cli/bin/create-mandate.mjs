#!/usr/bin/env node
/**
 * `npx create-mandate <project> [options]` shim.
 * Rewrites argv to `mandate create <project> [options]` and dispatches.
 */
import { main } from '../src/index.mjs';

const [node, , ...rest] = process.argv;
const argv = [node, 'mandate', 'create', ...rest];

main(argv).catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});
