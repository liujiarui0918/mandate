import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  workspacePath,
  snapshotDirPath,
  snapshotTimestamp,
  initWorkspace,
  snapshotWorkspace,
  clearGroupWorkspace,
  readArtifact,
  writeArtifact,
  listSnapshots,
} from '../src/memory.mjs';

function makeTmpCourt() {
  return mkdtempSync(join(tmpdir(), 'mandate-runtime-memory-'));
}

test('snapshotTimestamp: filesystem-safe ISO with no colons or dots', () => {
  const ts = snapshotTimestamp(new Date('2026-05-08T12:34:56.789Z'));
  assert.equal(ts, '2026-05-08T12-34-56-789Z');
  assert.doesNotMatch(ts, /[:.]/);
});

test('workspacePath + snapshotDirPath: return expected paths', () => {
  const tmp = makeTmpCourt();
  try {
    assert.match(workspacePath(tmp), /workspace$/);
    assert.match(snapshotDirPath(tmp), /chronicle[\\/]_snapshots$/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: creates fresh empty workspace', async () => {
  const tmp = makeTmpCourt();
  try {
    const r = await initWorkspace(tmp);
    assert.equal(existsSync(r.path), true);
    assert.equal(r.snapshot, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: snapshots prior workspace before clearing', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    await writeArtifact(tmp, 'mandate.md', '# previous run');
    const r = await initWorkspace(tmp);
    assert.notEqual(r.snapshot, null);
    assert.equal(existsSync(r.snapshot), true);
    assert.equal(existsSync(join(r.snapshot, 'mandate.md')), true);
    assert.equal(await readArtifact(tmp, 'mandate.md'), null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: opt out of snapshot via snapshotPrevious=false', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    await writeArtifact(tmp, 'mandate.md', '# stale');
    const r = await initWorkspace(tmp, { snapshotPrevious: false });
    assert.equal(r.snapshot, null);
    assert.equal(await readArtifact(tmp, 'mandate.md'), null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('writeArtifact + readArtifact: round-trips text content', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    await writeArtifact(tmp, 'groups/research/scout_report.md', 'findings here');
    const back = await readArtifact(tmp, 'groups/research/scout_report.md');
    assert.equal(back, 'findings here');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('readArtifact: returns null when missing', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    const back = await readArtifact(tmp, 'nope.md');
    assert.equal(back, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearGroupWorkspace: clears existing group dir', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    await writeArtifact(tmp, 'groups/biz/scout_report.md', 'data');
    const r = await clearGroupWorkspace(tmp, 'biz');
    assert.equal(r.cleared, true);
    assert.equal(await readArtifact(tmp, 'groups/biz/scout_report.md'), null);
    assert.equal(existsSync(r.path), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('clearGroupWorkspace: creates dir even if not existed', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    const r = await clearGroupWorkspace(tmp, 'newgroup');
    assert.equal(r.cleared, false);
    assert.equal(existsSync(r.path), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('snapshotWorkspace: returns null when no workspace exists', async () => {
  const tmp = makeTmpCourt();
  try {
    const result = await snapshotWorkspace(tmp);
    assert.equal(result, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('listSnapshots: returns sorted snapshot timestamps', async () => {
  const tmp = makeTmpCourt();
  try {
    await initWorkspace(tmp);
    await writeArtifact(tmp, 'a.md', 'a');
    await snapshotWorkspace(tmp, { ts: '2026-05-01T00-00-00-000Z' });
    await snapshotWorkspace(tmp, { ts: '2026-05-03T00-00-00-000Z' });
    await snapshotWorkspace(tmp, { ts: '2026-05-02T00-00-00-000Z' });
    const list = await listSnapshots(tmp);
    assert.deepEqual(list, [
      '2026-05-01T00-00-00-000Z',
      '2026-05-02T00-00-00-000Z',
      '2026-05-03T00-00-00-000Z',
    ]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
