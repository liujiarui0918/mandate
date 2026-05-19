#!/usr/bin/env node
import { main } from '@mandateai/cli';

const [node, , ...rest] = process.argv;
const argv = [node, 'mandate', 'create', ...rest];

main(argv).catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});
