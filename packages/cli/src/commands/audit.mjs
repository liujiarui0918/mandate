/**
 * `mandate audit [--days N]` — list red-line events from chronicle and
 * (optionally) instruct Historian to author audits/AUDIT-{ts}-{slug}.md.
 *
 * In v0.3-alpha the LLM-driven audit synthesis is delegated to an
 * injected `historianFn`. Without one, we list the candidate events so
 * the user can review them manually.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  readChronicleRange,
  chronicleDate,
} from '@mandate/runtime';

const RED_LINE_EVENT_TYPES = new Set([
  'red_line_tripped',
  'censor_rejected',
  'topology_violation',
  'token_cap_exceeded',
  'time_cap_exceeded',
  'hook_failed',
]);

export async function runAudit(targetDir = '.', { days = 7, historianFn = null } = {}) {
  const root = resolve(targetDir);
  const dates = lastNDates(days);
  let events = [];
  try {
    events = await readChronicleRange(root, dates[0], dates[dates.length - 1]);
  } catch (err) {
    return { ok: false, message: `failed to read chronicle: ${err.message}` };
  }

  const redLineEvents = events.filter((e) =>
    RED_LINE_EVENT_TYPES.has(e.type) ||
    e.severity === 'red_line' ||
    e.censor_verdict === false
  );

  if (redLineEvents.length === 0) {
    return {
      ok: true,
      candidates: [],
      audits_written: [],
      message: `no red-line events in last ${days} days`,
    };
  }

  if (typeof historianFn !== 'function') {
    return {
      ok: true,
      candidates: redLineEvents,
      audits_written: [],
      message: `${redLineEvents.length} red-line event(s) found; pass historianFn to auto-author audit reports`,
    };
  }

  const auditsDir = join(root, 'audits');
  mkdirSync(auditsDir, { recursive: true });

  const written = [];
  for (const event of redLineEvents) {
    const ts = (event.ts ?? new Date().toISOString()).replace(/[:.]/g, '-');
    const slug = (event.type ?? 'event').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const filename = `AUDIT-${ts}-${slug}.md`;
    const path = join(auditsDir, filename);
    if (existsSync(path)) continue;
    let body;
    try {
      body = await historianFn(event);
    } catch (err) {
      body = `# AUDIT: ${slug}\n\nHistorian invocation failed: ${err.message}\n\n## Raw event\n\n\`\`\`json\n${JSON.stringify(event, null, 2)}\n\`\`\`\n`;
    }
    writeFileSync(path, body, 'utf8');
    written.push(filename);
  }

  return {
    ok: true,
    candidates: redLineEvents,
    audits_written: written,
    message: `${redLineEvents.length} red-line event(s) found, ${written.length} audit report(s) written to audits/`,
  };
}

function lastNDates(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    out.push(chronicleDate(d));
  }
  return out;
}

export function formatAuditReport(result) {
  if (!result.ok) return `✗ ${result.message}`;
  const lines = [`📜 ${result.message}`];
  if (result.candidates.length && result.audits_written.length === 0) {
    lines.push('');
    lines.push('Candidate events:');
    for (const e of result.candidates.slice(0, 20)) {
      lines.push(`  - ${e.ts ?? '?'} ${e.type ?? 'event'} role=${e.role ?? '-'} run=${e.run_id ?? '-'}`);
    }
    if (result.candidates.length > 20) {
      lines.push(`  ... and ${result.candidates.length - 20} more`);
    }
  }
  if (result.audits_written.length) {
    lines.push('');
    lines.push('Audit reports:');
    for (const f of result.audits_written) lines.push(`  - audits/${f}`);
  }
  return lines.join('\n');
}
