/**
 * `mandate create` — static scaffolder.
 *
 * Copies a chosen template's `.mandate/` directory into the target project.
 * Zero LLM calls. ~5 seconds end-to-end.
 *
 *   mandate create my-empire --template research
 *   mandate create my-empire --template self-governance
 *   mandate create my-empire --template both          (default)
 */

import { mkdir, cp, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATES_ROOT = resolve(__dirname, '../../templates');

const VALID_TEMPLATES = ['research', 'self-governance', 'both'];

/**
 * @param {string} targetDir relative or absolute path to project to create
 * @param {{template?: 'research'|'self-governance'|'both', language?: 'zh'|'en'|'both', censorTier?: 'paranoid'|'balanced'|'frugal', force?: boolean}} options
 * @returns {Promise<{ok:boolean, target:string, copiedFrom:string, message:string}>}
 */
export async function runCreate(targetDir, options = {}) {
  const template = options.template ?? 'both';
  if (!VALID_TEMPLATES.includes(template)) {
    return { ok: false, target: targetDir, copiedFrom: '', message: `Unknown template: ${template}. Choose: ${VALID_TEMPLATES.join(', ')}` };
  }

  const target = resolve(targetDir);
  const targetMandate = join(target, '.mandate');

  if (existsSync(targetMandate) && !options.force) {
    return { ok: false, target, copiedFrom: '', message: `Target already has .mandate/. Pass --force to overwrite.` };
  }

  const primaryTemplate = template === 'both' ? 'research' : template;
  const sourceDir = join(TEMPLATES_ROOT, primaryTemplate, '.mandate');

  if (!existsSync(sourceDir)) {
    return { ok: false, target, copiedFrom: sourceDir, message: `Template dir not found: ${sourceDir}` };
  }

  await mkdir(target, { recursive: true });
  await cp(sourceDir, targetMandate, { recursive: true });

  if (template === 'both') {
    const sgCharter = join(TEMPLATES_ROOT, 'self-governance', '.mandate', 'constitution', 'charter.md');
    if (existsSync(sgCharter)) {
      const dest = join(targetMandate, 'constitution', '_self-governance.charter.md');
      await cp(sgCharter, dest);
    }
  }

  if (options.language || options.censorTier) {
    const cfgPath = join(targetMandate, 'constitution', 'constitution.yaml');
    let raw = await readFile(cfgPath, 'utf8');
    if (options.language) {
      raw = raw.replace(/^language:\s+\S+$/m, `language: ${options.language}`);
    }
    if (options.censorTier) {
      raw = raw.replace(/(censor:\s*\n\s+default_tier:\s+)\S+/m, `$1${options.censorTier}`);
    }
    await writeFile(cfgPath, raw);
  }

  return {
    ok: true,
    target,
    copiedFrom: sourceDir,
    message: `Mandate court scaffolded at ${target}/.mandate (template=${template})`,
  };
}
