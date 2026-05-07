/**
 * `mandate veto <PR-id> [--reason "..."]` — Emperor rejects a reform PR.
 * Marks status=vetoed in frontmatter and moves the PR to reforms/_rejected/.
 * Constitution is NOT modified.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import matter from 'gray-matter';

export async function runVeto(prId, targetDir = '.', { reason = '', dryRun = false } = {}) {
  if (!prId) return { ok: false, message: 'PR id required' };
  if (!/^PR-\d{3,}$/.test(prId)) {
    return { ok: false, message: `invalid PR id "${prId}"` };
  }
  const root = resolve(targetDir);
  const reformsDir = join(root, 'reforms');
  if (!existsSync(reformsDir)) {
    return { ok: false, message: `reforms/ does not exist at ${root}` };
  }

  const prFile = findPrFile(reformsDir, prId);
  if (!prFile) return { ok: false, message: `${prId} not found` };

  let parsed;
  try {
    parsed = matter(readFileSync(prFile, 'utf8'));
  } catch (err) {
    return { ok: false, message: `failed to parse ${prFile}: ${err.message}` };
  }
  const reform = parsed.data ?? {};
  if (reform.status === 'ratified') {
    return { ok: false, message: `${prId} is already ratified; cannot veto` };
  }
  if (reform.status === 'vetoed') {
    return { ok: false, message: `${prId} is already vetoed` };
  }

  const vetoedAt = new Date().toISOString();
  const updatedFront = {
    ...reform,
    status: 'vetoed',
    vetoed_at: vetoedAt,
    veto_reason: reason || null,
  };
  const updatedText = matter.stringify(parsed.content, updatedFront);

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      prId,
      message: `dry-run: would veto ${prId} and move to reforms/_rejected/`,
    };
  }

  const rejectedDir = join(reformsDir, '_rejected');
  mkdirSync(rejectedDir, { recursive: true });
  const newPath = join(rejectedDir, basename(prFile));
  writeFileSync(prFile, updatedText, 'utf8');
  renameSync(prFile, newPath);

  return {
    ok: true,
    prId,
    moved_to: `reforms/_rejected/${basename(newPath)}`,
    reason: reason || null,
    message: `${prId} vetoed; moved to reforms/_rejected/`,
  };
}

function findPrFile(reformsDir, prId) {
  const exact = join(reformsDir, `${prId}.md`);
  if (existsSync(exact)) return exact;
  for (const f of readdirSync(reformsDir)) {
    if (f.startsWith(`${prId}-`) && f.endsWith('.md')) return join(reformsDir, f);
  }
  return null;
}
