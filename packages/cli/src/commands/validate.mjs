/**
 * `mandate validate [target]` — static lint for a Mandate court.
 *
 * Checks:
 *   1. .mandate/constitution/constitution.yaml conforms to constitution.schema.json
 *   2. .mandate/workspace/decomposition.yaml (if present) conforms to schema
 *   3. .mandate/workspace/decomposition.yaml topology has no decision-affecting cross-group deps
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import yaml from 'js-yaml';
import {
  validateConstitution,
  validateDecomposition,
  checkTopology,
} from '@mandateai/validators';

/**
 * @param {string} [targetDir]
 * @param {{schemaRoot?:string}} [options]
 * @returns {{ok:boolean, checks:Array, root:string}}
 */
export function runValidate(targetDir = '.', options = {}) {
  const root = resolve(targetDir);
  const mandateDir = existsSync(join(root, '.mandate')) ? join(root, '.mandate') : root;
  const checks = [];
  const schemaRoot = options.schemaRoot;

  const cfgPath = join(mandateDir, 'constitution', 'constitution.yaml');
  if (!existsSync(cfgPath)) {
    checks.push({ name: 'constitution.yaml exists', ok: false, errors: null, path: cfgPath });
    return { ok: false, checks, root };
  }
  let cfg;
  try {
    cfg = yaml.load(readFileSync(cfgPath, 'utf8'));
  } catch (e) {
    checks.push({ name: 'constitution.yaml parse', ok: false, errors: { message: String(e) }, path: cfgPath });
    return { ok: false, checks, root };
  }
  const ccheck = validateConstitution(cfg, schemaRoot);
  checks.push({ name: 'constitution.yaml schema', ok: ccheck.valid, errors: ccheck.errors, path: cfgPath });

  const decompPath = join(mandateDir, 'workspace', 'decomposition.yaml');
  if (existsSync(decompPath)) {
    let decomp;
    try {
      decomp = yaml.load(readFileSync(decompPath, 'utf8'));
    } catch (e) {
      checks.push({ name: 'decomposition.yaml parse', ok: false, errors: { message: String(e) }, path: decompPath });
      return { ok: false, checks, root };
    }
    const dcheck = validateDecomposition(decomp, schemaRoot);
    checks.push({ name: 'decomposition.yaml schema', ok: dcheck.valid, errors: dcheck.errors, path: decompPath });
    const tcheck = checkTopology(decomp);
    checks.push({
      name: 'decomposition topology (no parent-child)',
      ok: tcheck.valid,
      errors: tcheck.violations,
      path: decompPath,
      suggestedMerges: tcheck.suggestedMerges,
    });
  } else {
    checks.push({ name: 'decomposition.yaml (optional)', ok: true, errors: null, path: decompPath, skipped: true });
  }

  const allOk = checks.every((c) => c.ok);
  return { ok: allOk, checks, root };
}

/**
 * Pretty-print the validation result.
 */
export function printValidationReport(result) {
  console.log(`📜 mandate validate — ${result.root}`);
  for (const c of result.checks) {
    const mark = c.ok ? '✓' : '✗';
    const tag = c.skipped ? ' (skipped)' : '';
    console.log(`  ${mark} ${c.name}${tag}`);
    if (!c.ok && c.errors) {
      const errStr = JSON.stringify(c.errors, null, 2).split('\n').map((l) => `      ${l}`).join('\n');
      console.log(errStr);
    }
    if (c.suggestedMerges && c.suggestedMerges.length > 0) {
      for (const s of c.suggestedMerges) console.log(`      → ${s}`);
    }
  }
  console.log(result.ok ? '\n✓ All checks passed.' : '\n✗ Validation failed.');
}
