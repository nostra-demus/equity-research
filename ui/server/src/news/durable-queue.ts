import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import type { NewsItem } from './types'

const DATABASE_FILE = 'news-queue.sqlite'
const ESTABLISHED_FILE = 'news-queue.sqlite.established'
const SCHEMA_VERSION = '1'

export type QueueLane = 'barrier' | 'hot' | 'overflow'
export type QueueTerminalState = 'completed' | 'retired'

export interface LegacyQueueRow {
  item: NewsItem
  lane: QueueLane
}

export interface DurableQueueInspection {
  available: boolean
  items: NewsItem[]
  overflow: number
}

export interface DurableQueueCounts {
  active: number
  completed: number
  retired: number
  barrier: number
  hot: number
  overflow: number
}

function queuePath(stateDir: string): string {
  return path.join(stateDir, DATABASE_FILE)
}

function establishedPath(stateDir: string): string {
  return path.join(stateDir, ESTABLISHED_FILE)
}

function pathExists(file: string): boolean {
  try { fs.statSync(file); return true }
  catch (error: any) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function persistEstablishedMarker(stateDir: string): void {
  const target = establishedPath(stateDir)
  if (pathExists(target)) return
  const tmp = `${target}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`
  let fd: number | undefined
  try {
    fd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(fd, `schema=${SCHEMA_VERSION}\n`)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(tmp, target)
    const dirFd = fs.openSync(stateDir, 'r')
    try { fs.fsyncSync(dirFd) } finally { fs.closeSync(dirFd) }
  } finally {
    try { if (fd != null) fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
  }
}

function meta(db: DatabaseSync, key: string): string | null {
  const row = db.prepare('SELECT value FROM news_queue_meta WHERE key = ?').get(key) as { value?: unknown } | undefined
  return typeof row?.value === 'string' ? row.value : null
}

function saveMeta(db: DatabaseSync, key: string, value: string): void {
  db.prepare(`
    INSERT INTO news_queue_meta(key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value)
}

function openQueue(stateDir: string): DatabaseSync {
  fs.mkdirSync(stateDir, { recursive: true })
  const file = queuePath(stateDir)
  const databaseExists = pathExists(file)
  const established = pathExists(establishedPath(stateDir))
  if (!databaseExists && established) {
    throw new Error('established durable news queue database is missing')
  }
  const needsSetup = !databaseExists || !established
  const db = new DatabaseSync(file)
  try {
    db.exec(`
      PRAGMA synchronous=FULL;
      PRAGMA busy_timeout=5000;
      PRAGMA cache_size=-8192;
      PRAGMA temp_store=FILE;
      PRAGMA foreign_keys=ON;
    `)
    const journal = db.prepare('PRAGMA journal_mode').get() as { journal_mode?: unknown } | undefined
    if (journal?.journal_mode !== 'wal') db.exec('PRAGMA journal_mode=WAL')
    if (needsSetup) db.exec(`
        CREATE TABLE IF NOT EXISTS news_queue_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        ) WITHOUT ROWID;
        CREATE TABLE IF NOT EXISTS news_queue (
          event_id TEXT PRIMARY KEY,
          lane TEXT NOT NULL CHECK(lane IN ('barrier', 'hot', 'overflow')),
          state TEXT NOT NULL CHECK(state IN ('active', 'completed', 'retired')),
          payload_json TEXT,
          sequence INTEGER NOT NULL,
          generation TEXT NOT NULL,
          enqueued_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          terminal_at TEXT,
          terminal_reason TEXT
        ) STRICT;
        CREATE INDEX IF NOT EXISTS news_queue_active_order
          ON news_queue(state, lane, sequence);
        CREATE INDEX IF NOT EXISTS news_queue_terminal_order
          ON news_queue(state, terminal_at);
      `)
    const schema = meta(db, 'schema_version')
    if (schema && schema !== SCHEMA_VERSION) throw new Error(`unsupported durable news queue schema ${schema}`)
    if (!schema) saveMeta(db, 'schema_version', SCHEMA_VERSION)
    try { fs.chmodSync(file, 0o600) } catch { /* the database still remains usable on restrictive mounts */ }
    return db
  } catch (error) {
    try { db.close() } catch { /* best effort */ }
    throw error
  }
}

function transaction<T>(db: DatabaseSync, use: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = use()
    db.exec('COMMIT')
    return result
  } catch (error) {
    try { db.exec('ROLLBACK') } catch { /* preserve the original error */ }
    throw error
  }
}

function uniqueRows(rows: readonly LegacyQueueRow[]): LegacyQueueRow[] {
  const seen = new Set<string>()
  const result: LegacyQueueRow[] = []
  for (const row of rows) {
    if (!row.item?.event_id || seen.has(row.item.event_id)) continue
    seen.add(row.item.event_id)
    result.push(row)
  }
  return result
}

function nextSequence(db: DatabaseSync): number {
  const row = db.prepare('SELECT COALESCE(MAX(sequence), 0) AS value FROM news_queue').get() as { value?: number | bigint }
  return Number(row?.value || 0) + 1
}

function insertActiveRows(
  db: DatabaseSync,
  rows: readonly LegacyQueueRow[],
  generation: string,
  updateExisting: boolean,
): void {
  let sequence = nextSequence(db)
  const now = new Date().toISOString()
  const insert = db.prepare(updateExisting ? `
    INSERT INTO news_queue (
      event_id, lane, state, payload_json, sequence, generation, enqueued_at, updated_at,
      terminal_at, terminal_reason
    ) VALUES (?, ?, 'active', ?, ?, ?, ?, ?, NULL, NULL)
    ON CONFLICT(event_id) DO UPDATE SET
      lane = excluded.lane,
      payload_json = excluded.payload_json,
      sequence = excluded.sequence,
      generation = excluded.generation,
      updated_at = excluded.updated_at
    WHERE news_queue.state = 'active'
  ` : `
    INSERT OR IGNORE INTO news_queue (
      event_id, lane, state, payload_json, sequence, generation, enqueued_at, updated_at,
      terminal_at, terminal_reason
    ) VALUES (?, ?, 'active', ?, ?, ?, ?, ?, NULL, NULL)
  `)
  for (const row of uniqueRows(rows)) {
    insert.run(
      row.item.event_id,
      row.lane,
      JSON.stringify(row.item),
      sequence++,
      generation,
      row.item.deferred_at || now,
      now,
    )
  }
}

function decodeRows(rows: Array<{ payload_json?: unknown }>): NewsItem[] {
  return rows.map((row) => {
    if (typeof row.payload_json !== 'string') throw new Error('durable queue row has no payload')
    const item = JSON.parse(row.payload_json) as NewsItem
    if (!item || typeof item.event_id !== 'string' || !item.event_id || typeof item.headline !== 'string') {
      throw new Error('durable queue row has an invalid payload')
    }
    return item
  })
}

function legacyFingerprint(rows: readonly LegacyQueueRow[]): string {
  const hash = createHash('sha256')
  const seen = new Set<string>()
  for (const row of rows) {
    const id = row.item?.event_id
    if (!id || seen.has(id)) continue
    seen.add(id)
    hash.update(`${id.length}:`)
    hash.update(id)
  }
  return `${seen.size}:${hash.digest('hex')}`
}

/**
 * Bootstrap once from the pre-SQLite journals, then treat SQLite as the source of truth. Later legacy
 * readers may still add a previously unseen id during a rolling downgrade, but stale files can never
 * resurrect a row that SQLite has already completed or retired.
 */
export function inspectDurableQueue(
  stateDir: string,
  legacy: { available: boolean; rows: LegacyQueueRow[] },
): DurableQueueInspection {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    const bootstrapped = meta(db, 'bootstrap_complete') === '1'
    if (!bootstrapped && !legacy.available) return { available: false, items: [], overflow: 0 }
    const fingerprint = legacy.available ? legacyFingerprint(legacy.rows) : null
    if (!bootstrapped || (fingerprint != null && meta(db, 'legacy_fingerprint') !== fingerprint)) {
      transaction(db, () => {
        // Recheck after taking the lock so two simultaneous inspectors do not both replay a changed file.
        if (bootstrapped && fingerprint != null && meta(db!, 'legacy_fingerprint') === fingerprint) return
        const generation = `legacy-${Date.now()}-${process.pid}`
        insertActiveRows(db!, legacy.available ? legacy.rows : [], generation, !bootstrapped)
        if (!bootstrapped) saveMeta(db!, 'bootstrap_complete', '1')
        if (fingerprint != null) saveMeta(db!, 'legacy_fingerprint', fingerprint)
      })
    }
    // This fsynced sentinel lives outside SQLite. If the canonical database later disappears, openQueue
    // must fail closed instead of rebuilding an incomplete queue from bounded compatibility projections.
    persistEstablishedMarker(stateDir)
    const items = decodeRows(db.prepare(`
      SELECT payload_json FROM news_queue
      WHERE state = 'active'
      ORDER BY CASE lane WHEN 'barrier' THEN 0 WHEN 'hot' THEN 1 ELSE 2 END, sequence
    `).all() as Array<{ payload_json?: unknown }>)
    const overflowRow = db.prepare(`
      SELECT COUNT(*) AS count FROM news_queue WHERE state = 'active' AND lane = 'overflow'
    `).get() as { count?: number | bigint }
    return { available: true, items, overflow: Number(overflowRow?.count || 0) }
  } catch {
    return { available: false, items: [], overflow: 0 }
  } finally {
    try { db?.close() } catch { /* best effort */ }
  }
}

function writeRows(stateDir: string, use: (db: DatabaseSync) => void): boolean {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    if (meta(db, 'bootstrap_complete') !== '1') return false
    transaction(db, () => use(db!))
    return true
  } catch {
    return false
  } finally {
    try { db?.close() } catch { /* best effort */ }
  }
}

/** Atomically replace one scheduler lane. Removed rows leave tombstones until the firehose projection catches up. */
export function replaceDurableQueueLane(
  stateDir: string,
  lane: QueueLane,
  items: readonly NewsItem[],
  terminalReason: string,
): boolean {
  return writeRows(stateDir, (db) => {
    const generation = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2)}`
    insertActiveRows(db, items.map((item) => ({ item, lane })), generation, true)
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE news_queue
      SET state = 'completed', payload_json = NULL, terminal_at = ?, terminal_reason = ?, updated_at = ?
      WHERE state = 'active' AND lane = ? AND generation <> ?
    `).run(now, terminalReason, now, lane, generation)
  })
}

/**
 * Replace the bounded hot window and spill its tail into overflow as one commit. Existing overflow
 * remains active: callers use this while progressively draining a larger provider backlog.
 */
export function replaceDurableQueueWindow(
  stateDir: string,
  hotItems: readonly NewsItem[],
  overflowItems: readonly NewsItem[],
  terminalReason: string,
): boolean {
  return writeRows(stateDir, (db) => {
    const generation = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2)}`
    insertActiveRows(db, hotItems.map((item) => ({ item, lane: 'hot' })), generation, true)
    insertActiveRows(db, overflowItems.map((item) => ({ item, lane: 'overflow' })), generation, true)
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE news_queue
      SET state = 'completed', payload_json = NULL, terminal_at = ?, terminal_reason = ?, updated_at = ?
      WHERE state = 'active' AND lane = 'hot' AND generation <> ?
    `).run(now, terminalReason, now, generation)
  })
}

/** Full raw-input barrier: the supplied set becomes the exact active queue in one transaction. */
export function replaceAllDurableQueueItems(
  stateDir: string,
  items: readonly NewsItem[],
  lane: QueueLane = 'barrier',
): boolean {
  return writeRows(stateDir, (db) => {
    const generation = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2)}`
    insertActiveRows(db, items.map((item) => ({ item, lane })), generation, true)
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE news_queue
      SET state = 'completed', payload_json = NULL, terminal_at = ?, terminal_reason = 'absent-from-input-barrier', updated_at = ?
      WHERE state = 'active' AND generation <> ?
    `).run(now, now, generation)
  })
}

/** Update or add active payloads without completing other work. */
export function mergeDurableQueueItems(
  stateDir: string,
  items: readonly NewsItem[],
  lane: QueueLane,
): boolean {
  return writeRows(stateDir, (db) => {
    const generation = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2)}`
    insertActiveRows(db, items.map((item) => ({ item, lane })), generation, true)
  })
}

/** Scored checkpoints keep their current lane but replace the raw payload atomically. */
export function checkpointDurableQueueItems(stateDir: string, items: readonly NewsItem[]): boolean {
  return writeRows(stateDir, (db) => {
    const findLane = db.prepare("SELECT lane FROM news_queue WHERE event_id = ? AND state = 'active'")
    const rows = items.map((item) => {
      const current = findLane.get(item.event_id) as { lane?: QueueLane } | undefined
      return { item, lane: current?.lane || 'hot' }
    })
    insertActiveRows(db, rows, `${Date.now()}-${process.pid}-checkpoint`, true)
  })
}

/** Retired work leaves the active scheduler but keeps its exact payload and reason forever. */
export function retireDurableQueueItems(
  stateDir: string,
  items: readonly NewsItem[],
  reason: string,
  at: Date,
): boolean {
  if (!items.length) return true
  return writeRows(stateDir, (db) => {
    const update = db.prepare(`
      UPDATE news_queue
      SET state = 'retired', payload_json = ?, terminal_at = ?, terminal_reason = ?, updated_at = ?
      WHERE event_id = ? AND state = 'active'
    `)
    const insert = db.prepare(`
      INSERT OR IGNORE INTO news_queue (
        event_id, lane, state, payload_json, sequence, generation, enqueued_at, updated_at,
        terminal_at, terminal_reason
      ) VALUES (?, 'hot', 'retired', ?, ?, 'retirement', ?, ?, ?, ?)
    `)
    const stamp = at.toISOString()
    let sequence = nextSequence(db)
    for (const item of uniqueRows(items.map((value) => ({ item: value, lane: 'hot' })))) {
      const payload = JSON.stringify(item.item)
      const result = update.run(payload, stamp, reason, stamp, item.item.event_id)
      if (Number(result.changes) === 0) {
        const inserted = insert.run(
          item.item.event_id,
          payload,
          sequence++,
          item.item.deferred_at || stamp,
          stamp,
          stamp,
          reason,
        )
        if (Number(inserted.changes) === 0) {
          const existing = db.prepare('SELECT state FROM news_queue WHERE event_id = ?').get(item.item.event_id) as { state?: string } | undefined
          // A concurrently completed item is already safe in the fsynced firehose. It must not roll back
          // retirement of the other active rows in this batch.
          if (existing?.state !== 'retired' && existing?.state !== 'completed') {
            throw new Error(`cannot preserve retirement payload for ${item.item.event_id}`)
          }
        }
      }
    }
  })
}

export function durableQueueLaneCount(stateDir: string, lane: QueueLane): number | null {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    if (meta(db, 'bootstrap_complete') !== '1') return null
    const row = db.prepare(`
      SELECT COUNT(*) AS count FROM news_queue WHERE state = 'active' AND lane = ?
    `).get(lane) as { count?: number | bigint }
    return Number(row?.count || 0)
  } catch { return null }
  finally { try { db?.close() } catch { /* best effort */ } }
}

/**
 * Completed rows already exist in the fsynced firehose. Keep their small tombstones only until the old
 * JSON projection has caught up, then remove them so normal throughput cannot make the local database grow
 * forever. Retired-unscored payloads are never purged here.
 */
export function purgeCompletedDurableQueueItems(stateDir: string): boolean {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    if (meta(db, 'bootstrap_complete') !== '1') return false
    transaction(db, () => {
      db!.prepare("DELETE FROM news_queue WHERE state = 'completed'").run()
    })
    // Checkpoints cannot run inside the write transaction. Reclaiming WAL pages is useful but not part
    // of the deletion's durability boundary, so a busy reader may safely defer it to a later cleanup.
    try { db.exec('PRAGMA wal_checkpoint(PASSIVE)') } catch { /* non-fatal maintenance */ }
    return true
  } catch {
    return false
  } finally {
    try { db?.close() } catch { /* best effort */ }
  }
}

export function inspectDurableQueueCounts(stateDir: string): DurableQueueCounts | null {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    if (meta(db, 'bootstrap_complete') !== '1') return null
    const rows = db.prepare(`
      SELECT state, lane, COUNT(*) AS count FROM news_queue GROUP BY state, lane
    `).all() as Array<{ state: 'active' | QueueTerminalState; lane: QueueLane; count: number | bigint }>
    const result: DurableQueueCounts = { active: 0, completed: 0, retired: 0, barrier: 0, hot: 0, overflow: 0 }
    for (const row of rows) {
      const count = Number(row.count)
      result[row.state] += count
      if (row.state === 'active') result[row.lane] += count
    }
    return result
  } catch { return null }
  finally { try { db?.close() } catch { /* best effort */ } }
}

export function loadDurableQueueHistory(
  stateDir: string,
  state: 'retired',
  limit: number = 1_000,
): NewsItem[] {
  let db: DatabaseSync | undefined
  try {
    db = openQueue(stateDir)
    const safeLimit = Math.max(0, Math.floor(limit))
    return decodeRows(db.prepare(`
      SELECT payload_json FROM news_queue WHERE state = ?
      ORDER BY terminal_at DESC, sequence DESC LIMIT ?
    `).all(state, safeLimit) as Array<{ payload_json?: unknown }>)
  } catch { return [] }
  finally { try { db?.close() } catch { /* best effort */ } }
}

export function durableQueueDatabasePath(stateDir: string): string {
  return queuePath(stateDir)
}

export function durableQueueEstablishedPath(stateDir: string): string {
  return establishedPath(stateDir)
}
