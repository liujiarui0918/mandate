import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  appendEvent,
  readChronicle,
  readChronicleRange,
  chronicleDate,
  chroniclePath,
} from '../src/chronicle.mjs';

function makeTmpCourt() {
  const dir = mkdtempSync(join(tmpdir(), 'mandate-runtime-test-'));
  return dir;
}

test('chronicleDate: returns ISO YYYY-MM-DD', () => {
  const d = new Date('2026-05-08T12:34:56.789Z');
  assert.equal(chronicleDate(d), '2026-05-08');
});

test('chroniclePath: joins courtDir + date correctly', () => {
  const tmp = makeTmpCourt();
  try {
    const p = chroniclePath(tmp, '2026-05-08');
    assert.match(p, /chronicle[\\/]2026-05-08\.jsonl$/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('appendEvent: writes JSONL line with auto-injected ts', async () => {
  const tmp = makeTmpCourt();
  try {
    const r = await appendEvent(tmp, {
      agent_id: 'chancellor',
      hook_name: 'on_mandate_received',
      outcome: 'ok',
    });
    assert.ok(existsSync(r.path));
    const raw = readFileSync(r.path, 'utf8');
    const parsed = JSON.parse(raw.trim().split('\n')[0]);
    assert.equal(parsed.agent_id, 'chancellor');
    assert.equal(parsed.hook_name, 'on_mandate_received');
    assert.equal(parsed.outcome, 'ok');
    assert.match(parsed.ts, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('appendEvent: multiple events accumulate as separate lines', async () => {
  const tmp = makeTmpCourt();
  try {
    await appendEvent(tmp, { agent_id: 'a', hook_name: 'h1' });
    await appendEvent(tmp, { agent_id: 'b', hook_name: 'h2' });
    await appendEvent(tmp, { agent_id: 'c', hook_name: 'h3' });
    const events = await readChronicle(tmp);
    assert.equal(events.length, 3);
    assert.equal(events[0].agent_id, 'a');
    assert.equal(events[2].agent_id, 'c');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('readChronicle: returns [] when file does not exist', async () => {
  const tmp = makeTmpCourt();
  try {
    const events = await readChronicle(tmp, '2099-01-01');
    assert.deepEqual(events, []);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('readChronicle: skips malformed lines', async () => {
  const tmp = makeTmpCourt();
  try {
    await appendEvent(tmp, { agent_id: 'a', hook_name: 'h' });
    const path = chroniclePath(tmp);
    const fs = await import('node:fs/promises');
    await fs.appendFile(path, 'this is not json\n');
    await appendEvent(tmp, { agent_id: 'b', hook_name: 'h2' });
    const events = await readChronicle(tmp);
    assert.equal(events.length, 2);
    assert.equal(events[0].agent_id, 'a');
    assert.equal(events[1].agent_id, 'b');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('readChronicleRange: spans multiple dates', async () => {
  const tmp = makeTmpCourt();
  try {
    const baseDir = chroniclePath(tmp, '2026-05-01').replace(/[/\\][^/\\]+$/, '');
    await mkdir(baseDir, { recursive: true });
    const fs = await import('node:fs/promises');
    await fs.writeFile(
      chroniclePath(tmp, '2026-05-01'),
      JSON.stringify({ ts: '2026-05-01T00:00:00Z', agent_id: 'x', hook_name: 'h' }) + '\n',
    );
    await fs.writeFile(
      chroniclePath(tmp, '2026-05-02'),
      JSON.stringify({ ts: '2026-05-02T00:00:00Z', agent_id: 'y', hook_name: 'h' }) + '\n',
    );
    const events = await readChronicleRange(tmp, '2026-05-01', '2026-05-02');
    assert.equal(events.length, 2);
    assert.equal(events[0].agent_id, 'x');
    assert.equal(events[1].agent_id, 'y');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
