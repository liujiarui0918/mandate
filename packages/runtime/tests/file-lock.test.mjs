import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  lockfilePath,
  tryAcquireLock,
  releaseLock,
  readLock,
  isStale,
  withLock,
} from '../src/file-lock.mjs';

function makeTmp() {
  return mkdtempSync(join(tmpdir(), 'mandate-runtime-lock-'));
}

test('lockfilePath: appends .lock suffix', () => {
  assert.equal(lockfilePath('/tmp/foo.yaml'), '/tmp/foo.yaml.lock');
});

test('tryAcquireLock: returns LockInfo on success', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const info = tryAcquireLock(target);
    assert.notEqual(info, null);
    assert.equal(typeof info.pid, 'number');
    assert.equal(typeof info.lock_id, 'string');
    assert.match(info.acquired_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(existsSync(lockfilePath(target)), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('tryAcquireLock: returns null when contended (lock held)', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const a = tryAcquireLock(target);
    assert.notEqual(a, null);
    const b = tryAcquireLock(target);
    assert.equal(b, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('releaseLock: deletes lock when lock_id matches', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const info = tryAcquireLock(target);
    assert.equal(releaseLock(target, info.lock_id), true);
    assert.equal(existsSync(lockfilePath(target)), false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('releaseLock: refuses to delete when lock_id mismatches', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    tryAcquireLock(target);
    assert.equal(releaseLock(target, 'wrong-id'), false);
    assert.equal(existsSync(lockfilePath(target)), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('readLock: returns null when no lock', () => {
  const tmp = makeTmp();
  try {
    assert.equal(readLock(join(tmp, 'foo.yaml')), null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('isStale: stale when older than TTL', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const lockPath = lockfilePath(target);
    writeFileSync(
      lockPath,
      JSON.stringify({
        pid: 1,
        hostname: 'h',
        lock_id: 'x',
        acquired_at: new Date(Date.now() - 120_000).toISOString(),
      }),
    );
    assert.equal(isStale(lockPath, 60_000), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('isStale: fresh when within TTL', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    tryAcquireLock(target);
    assert.equal(isStale(lockfilePath(target), 60_000), false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('isStale: corrupt lockfile counts as stale', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    writeFileSync(lockfilePath(target), 'not-json');
    assert.equal(isStale(lockfilePath(target), 60_000), true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('tryAcquireLock: breaks stale lock and acquires', () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const lockPath = lockfilePath(target);
    writeFileSync(
      lockPath,
      JSON.stringify({
        pid: 99999,
        hostname: 'h',
        lock_id: 'old',
        acquired_at: new Date(Date.now() - 120_000).toISOString(),
      }),
    );
    const info = tryAcquireLock(target, { ttlMs: 60_000 });
    assert.notEqual(info, null);
    const onDisk = readLock(target);
    assert.equal(onDisk.lock_id, info.lock_id);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('withLock: runs critical section then releases', async () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    const result = await withLock(target, async () => 42);
    assert.equal(result, 42);
    assert.equal(existsSync(lockfilePath(target)), false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('withLock: releases even if fn throws', async () => {
  const tmp = makeTmp();
  try {
    const target = join(tmp, 'foo.yaml');
    await assert.rejects(
      withLock(target, async () => {
        throw new Error('boom');
      }),
      /boom/,
    );
    assert.equal(existsSync(lockfilePath(target)), false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
