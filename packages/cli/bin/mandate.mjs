#!/usr/bin/env node
import { main } from '../src/index.mjs';

main(process.argv).catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});
