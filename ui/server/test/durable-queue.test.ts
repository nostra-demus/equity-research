import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { gunzipSync } from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import {
  durableQueueDatabasePath,
  inspectDurableQueueCounts,
  loadDurableQueueHistory,
  purgeCompletedDurableQueueItems,
  replaceDurableQueueLane,
  retireDurableQueueItems,
} from '../src/news/durable-queue'
import { inspectDeferredBacklog, loadDeferred, saveDeferred } from '../src/news/runCycle'
import type { NewsItem } from '../src/news/types'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../..')

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error: any) {
    console.error(`FAIL  ${name}\n      ${error?.stack || error}`)
    process.exitCode = 1
  }
}

function tmp(prefix = 'durable-news-queue-'): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function item(i: number): NewsItem {
  return {
    event_id: `EVT-durable-${i}`,
    headline: `Durable queue test headline number ${i}`,
    url: `https://reuters.com/durable-${i}`,
    domain: 'reuters.com',
    source_name: 'Reuters',
    region: 'GLOBAL',
    input_nature: 'news_headline',
    found_at: '2026-08-25T10:00:00Z',
    deferred_at: '2026-08-25T10:01:00Z',
    dedup_status: 'new',
    via: 'gdelt',
  }
}

check('legacy JSON migrates once and SQLite remains authoritative when that projection disappears or corrupts', () => {
  const state = tmp()
  fs.writeFileSync(path.join(state, 'news-deferred.json'), `${JSON.stringify([item(1), item(2)])}\n`)
  const migrated = inspectDeferredBacklog(state)
  assert.equal(migrated.available, true)
  assert.deepEqual(migrated.items.map((row) => row.event_id), [item(1).event_id, item(2).event_id])
  assert.equal(fs.statSync(durableQueueDatabasePath(state)).mode & 0o777, 0o600)

  fs.writeFileSync(path.join(state, 'news-deferred.json'), '{broken json')
  const afterCorruption = inspectDeferredBacklog(state)
  assert.equal(afterCorruption.available, true, 'a broken compatibility file cannot take the canonical database down')
  assert.deepEqual(afterCorruption.items.map((row) => row.event_id), migrated.items.map((row) => row.event_id))
})

check('the hot-file cap is not a data cap: every excess item stays active in SQLite overflow', () => {
  const state = tmp()
  const rows = [item(10), item(11), item(12), item(13), item(14)]
  assert.equal(saveDeferred(state, rows, () => {}, 2), true)
  assert.deepEqual(loadDeferred(state).map((row) => row.event_id), rows.map((row) => row.event_id))
  assert.deepEqual(inspectDurableQueueCounts(state), {
    active: 5, completed: 0, retired: 0, barrier: 0, hot: 2, overflow: 3,
  })
})

check('hot-window replacement and overflow spill roll back together if either write fails', () => {
  const state = tmp()
  const original = [item(15), item(16)]
  assert.equal(saveDeferred(state, original, () => {}, 2), true)
  const db = new DatabaseSync(durableQueueDatabasePath(state))
  try {
    db.exec(`
      CREATE TRIGGER reject_test_overflow BEFORE INSERT ON news_queue
      WHEN NEW.event_id = '${item(17).event_id}' AND NEW.lane = 'overflow'
      BEGIN SELECT RAISE(ABORT, 'test overflow failure'); END;
    `)
  } finally { db.close() }

  assert.equal(saveDeferred(state, [item(15), item(17)], () => {}, 1), false)
  assert.deepEqual(loadDeferred(state).map((row) => row.event_id), original.map((row) => row.event_id))
  assert.deepEqual(inspectDurableQueueCounts(state), {
    active: 2, completed: 0, retired: 0, barrier: 0, hot: 2, overflow: 0,
  })
})

check('age retirement removes scheduling pressure but preserves every full payload and reason in SQLite', () => {
  const state = tmp()
  const rows = [item(20), item(21)]
  assert.equal(saveDeferred(state, rows), true)
  assert.equal(retireDurableQueueItems(state, rows, 'waited-longer-than-48h', new Date('2026-08-28T10:00:00Z')), true)
  assert.equal(loadDeferred(state).length, 0)
  assert.deepEqual(loadDurableQueueHistory(state, 'retired').map((row) => row.event_id).sort(), rows.map((row) => row.event_id).sort())
  const counts = inspectDurableQueueCounts(state)
  assert.equal(counts?.retired, 2)
  assert.equal(counts?.active, 0)
  const db = new DatabaseSync(durableQueueDatabasePath(state), { readOnly: true })
  try {
    const reasons = db.prepare("SELECT DISTINCT terminal_reason FROM news_queue WHERE state = 'retired'").all() as Array<{ terminal_reason: string }>
    assert.deepEqual(reasons.map((row) => row.terminal_reason), ['waited-longer-than-48h'])
  } finally { db.close() }
})

check('a completed row cannot block retirement of another row, and completed tombstones are purged', () => {
  const state = tmp()
  const rows = [item(22), item(23)]
  assert.equal(saveDeferred(state, rows), true)
  assert.equal(replaceDurableQueueLane(state, 'hot', [rows[1]], 'test-completed'), true)
  assert.equal(inspectDurableQueueCounts(state)?.completed, 1)

  assert.equal(retireDurableQueueItems(state, rows, 'test-retirement', new Date('2026-08-28T10:00:00Z')), true)
  assert.deepEqual(loadDurableQueueHistory(state, 'retired').map((row) => row.event_id), [rows[1].event_id])
  assert.equal(inspectDurableQueueCounts(state)?.completed, 1)
  assert.equal(purgeCompletedDurableQueueItems(state), true)
  assert.equal(inspectDurableQueueCounts(state)?.completed, 0)
})

check('a stale overflow projection keeps its tombstone until the old file is actually removed', () => {
  const state = tmp()
  const stale = { ...item(24), input_pending: true as const }
  assert.equal(saveDeferred(state, [stale]), true)
  assert.equal(replaceDurableQueueLane(state, 'hot', [], 'test-consumed'), true)
  assert.equal(inspectDurableQueueCounts(state)?.completed, 1)

  const overflowFile = path.join(state, 'news-input-overflow.json')
  // This is the state left when SQLite completion commits but deleting the old JSON projection fails.
  fs.writeFileSync(overflowFile, `${JSON.stringify({ v: 2, items: [stale] })}\n`)
  assert.equal(saveDeferred(state, []), true)
  assert.equal(inspectDurableQueueCounts(state)?.completed, 1, 'the stale file remains blocked by its tombstone')
  assert.deepEqual(inspectDeferredBacklog(state).items, [], 'the completed row cannot be resurrected')

  fs.rmSync(overflowFile)
  assert.equal(saveDeferred(state, []), true)
  assert.equal(inspectDurableQueueCounts(state)?.completed, 0, 'cleanup resumes only after projection removal')
})

check('a killed process cannot expose half a SQLite queue transaction', () => {
  const state = tmp()
  assert.equal(saveDeferred(state, [item(30)]), true)
  const database = durableQueueDatabasePath(state)
  const attempted = item(31)
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import { DatabaseSync } from 'node:sqlite';
    const db = new DatabaseSync(${JSON.stringify(database)});
    db.exec('BEGIN IMMEDIATE');
    db.prepare(\`INSERT INTO news_queue (
      event_id, lane, state, payload_json, sequence, generation, enqueued_at, updated_at
    ) VALUES (?, 'hot', 'active', ?, 999999, 'killed', ?, ?)\`).run(
      ${JSON.stringify(attempted.event_id)}, ${JSON.stringify(JSON.stringify(attempted))},
      '2026-08-25T10:01:00Z', '2026-08-25T10:01:00Z'
    );
    process.exit(19);
  `], { encoding: 'utf8' })
  assert.equal(child.status, 19)
  assert.deepEqual(loadDeferred(state).map((row) => row.event_id), [item(30).event_id])
})

check('a corrupt canonical SQLite queue fails closed and is never rebuilt from an older compatibility file', () => {
  const state = tmp()
  assert.equal(saveDeferred(state, [item(35)]), true)
  const database = durableQueueDatabasePath(state)
  for (const suffix of ['-wal', '-shm']) fs.rmSync(`${database}${suffix}`, { force: true })
  fs.writeFileSync(database, 'not a sqlite database')
  const inspection = inspectDeferredBacklog(state)
  assert.equal(inspection.available, false)
  assert.deepEqual(inspection.items, [])
})

check('the snapshot helper produces an integrity-checked standalone database from a live WAL queue', () => {
  const state = tmp()
  assert.equal(saveDeferred(state, [item(40), item(41)]), true)
  const destination = path.join(tmp(), 'queue-copy.sqlite')
  const script = path.join(REPO_ROOT, 'scripts/ops/news-queue-snapshot.mjs')
  const output = execFileSync(process.execPath, [script, durableQueueDatabasePath(state), destination], { encoding: 'utf8' })
  assert.match(output, /"schema":1/)
  const db = new DatabaseSync(destination, { readOnly: true })
  try {
    assert.equal((db.prepare('PRAGMA quick_check').get() as any).quick_check, 'ok')
    assert.equal((db.prepare("SELECT COUNT(*) AS count FROM news_queue WHERE state = 'active'").get() as any).count, 2)
  } finally { db.close() }
})

check('the Drive archive uses verified atomic copies, prunes only matching old files, and stores restorable queue snapshots', () => {
  const root = tmp('durable-news-archive-repo-')
  const state = path.join(root, 'ui/server/.state')
  const inbox = path.join(root, 'screener/inbox')
  const archive = tmp('durable-news-drive-')
  const log = path.join(tmp(), 'archive.log')
  fs.mkdirSync(inbox, { recursive: true })
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  fs.symlinkSync(path.join(REPO_ROOT, 'scripts/ops'), path.join(root, 'scripts/ops'), 'dir')
  assert.equal(saveDeferred(state, [item(50)]), true)
  const source = path.join(inbox, '2026-06-01_firehose.ndjson')
  fs.writeFileSync(source, '{"kind":"item","event_id":"EVT-archive"}\n')
  const old = new Date(Date.now() - 45 * 86_400_000)
  fs.utimesSync(source, old, old)

  const script = path.join(REPO_ROOT, 'scripts/ops/news-archive.sh')
  execFileSync('/bin/bash', [script], {
    env: {
      ...process.env,
      REPO: root,
      ENGINE_STATE_DIR: state,
      NEWS_ARCHIVE_DIR: archive,
      NEWS_LOCAL_RETENTION_DAYS: '30',
      ARCHIVE_LOG: log,
      NODE_BIN: process.execPath,
    },
  })
  const archivedFirehose = path.join(archive, path.basename(source))
  assert.equal(fs.existsSync(source), false, 'local data is pruned only after the archive bytes match')
  assert.equal(fs.readFileSync(archivedFirehose, 'utf8'), '{"kind":"item","event_id":"EVT-archive"}\n')
  const latest = path.join(archive, 'news-queue-latest.sqlite.gz')
  assert.equal(fs.existsSync(latest), true)
  assert.equal(fs.existsSync(`${latest}.sha256`), true)
  const restored = path.join(tmp(), 'restored.sqlite')
  fs.writeFileSync(restored, gunzipSync(fs.readFileSync(latest)))
  const db = new DatabaseSync(restored, { readOnly: true })
  try {
    assert.equal((db.prepare('PRAGMA quick_check').get() as any).quick_check, 'ok')
    assert.equal((db.prepare("SELECT COUNT(*) AS count FROM news_queue WHERE state = 'active'").get() as any).count, 1)
  } finally { db.close() }
})

console.log(`durable queue tests: ${passed} passed`)
