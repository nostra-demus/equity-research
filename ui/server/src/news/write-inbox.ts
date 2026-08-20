// The write stage: land triaged items into the SAME inbox contract /screener:sweep already fills, so
// the cockpit and the gauntlet pick them up with zero changes. Three jobs:
//   - mergeInbox: idempotent merge into screener/inbox/<DATE>_sweep.json (by URL + revision lane), PRESERVING any
//     human state (consumed / launched_signal_id), ranked by triage score and capped;
//   - appendFirehoseSummary: one compact line per cycle into <DATE>_firehose.ndjson (powers the
//     "seen / picked / dropped" board header without bloating the inbox with dropped items);
//   - refreshBoard: rebuild screener/board/index.json via the existing python script.

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { DatabaseSync } from 'node:sqlite'
import type { CycleSummary, InboxRow, TriagedItem } from './types'
import { deriveScope, deriveSourceTier, SOURCE_TIERS, type SourceTierId } from './scope'
import { deriveScheduledEventEvidence } from './schedule'
import { eventIdFor } from './normalize'
import { readInboxHumanActions } from './inbox-actions'
import { sameThemeStoryObservation, themeStoryKey, themeStoryObservationKey } from './themes/story-key'

function inboxPath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_sweep.json`)
}
function firehosePath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_firehose.ndjson`)
}

type DurableRevisionClock = Pick<InboxRow, 'found_at' | 'observed_at' | 'source_is_english'>

interface RevisionClockRecord extends DurableRevisionClock {
  revision_key: string
  event_id: string
}

interface SweepWithRevisionClocks {
  rows?: InboxRow[]
  revision_clock_version?: unknown
  revision_clocks?: unknown
  [key: string]: unknown
}

interface PreparedRevisionRegistryWrite {
  commit(): void
  rollback(): void
}

interface PendingRevisionCoverage {
  manifest: RevisionCoverageManifest | null
  complete: boolean
  coverageThrough: string
  partitionDates: string[]
}

const REVISION_REGISTRY_FILE = 'news-revision-clocks.sqlite'
const REVISION_REGISTRY_SCHEMA_VERSION = '1'
const REVISION_REGISTRY_PAGE_CACHE_KIB = 2_048
const REVISION_REGISTRY_RECENT_AUDIT_DAYS = 14
const REVISION_COVERAGE_FILE = 'news-revision-clocks.coverage.json'
const REVISION_COVERAGE_VERSION = 1
export const REVISION_CLOCK_QUERY_CACHE_MAX = 512
const revisionQueryCache = new Map<string, DurableRevisionClock | null>()

// Exact revision lanes contain a NUL separator. Encode them at the SQLite boundary because the
// synchronous driver truncates bound TEXT at NUL; the embedded sweep index keeps the canonical key.
function registryRevisionKey(revisionKey: string): string {
  return JSON.stringify(revisionKey)
}

function embeddedRevisionKey(registryKey: string): string {
  const decoded = JSON.parse(registryKey)
  if (typeof decoded !== 'string' || !decoded) throw new Error('invalid encoded revision registry key')
  return decoded
}

interface RevisionCoverageManifest {
  version: 1
  generation: number
  complete: boolean
  coverage_through: string
  partition_dates: string[]
}

function cacheRevisionQuery(key: string, value: DurableRevisionClock | null): void {
  revisionQueryCache.delete(key)
  revisionQueryCache.set(key, value)
  while (revisionQueryCache.size > REVISION_CLOCK_QUERY_CACHE_MAX) {
    const oldest = revisionQueryCache.keys().next().value
    if (typeof oldest !== 'string') break
    revisionQueryCache.delete(oldest)
  }
}

// ctimeMs is deliberately absent. This stamp is a cache-freshness signature over NEWS_ARCHIVE_DIR,
// which is a Google Drive for Desktop mount (see config.ts). Drive writes its item-id xattr onto
// archive files independently of content, and an xattr write bumps ctime alone — so including it
// changed the partition signature for byte-identical files, forcing a full re-discovery (a filename
// re-scan of the whole archive plus a line-by-line re-stream of the affected partitions) on every
// sync pass. size + mtime is what actually tracks content. Same root cause as the pool-extractor
// stable-read fix in .claude/tools/extract_pool.py.
function fileStamp(fp: string): string | null {
  try {
    const stat = fs.statSync(fp)
    return `${stat.size}|${stat.mtimeMs}`
  } catch {
    return null
  }
}

function atomicWriteText(fp: string, text: string): void {
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  const tmp = `${fp}.tmp.${process.pid}`
  try {
    const fd = fs.openSync(tmp, 'w')
    try {
      fs.writeFileSync(fd, text)
      fs.fsyncSync(fd)
    } finally { fs.closeSync(fd) }
    fs.renameSync(tmp, fp)
    const dir = fs.openSync(path.dirname(fp), 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
  }
}

function revisionRecord(row: {
  url?: unknown
  headline?: unknown
  headline_en?: unknown
  event_types?: unknown
  found_at?: unknown
  observed_at?: unknown
  source_is_english?: unknown
}): RevisionClockRecord | null {
  if (typeof row.url !== 'string' || typeof row.headline !== 'string'
    || typeof row.found_at !== 'string' || !Number.isFinite(Date.parse(row.found_at))) return null
  const revisionKey = inboxUrlRevisionKey({
      url: row.url,
      headline: row.headline,
      headline_en: row.headline_en,
      event_types: row.event_types,
    })
  return {
    revision_key: revisionKey,
    event_id: eventIdFor(row.headline, row.url),
    found_at: row.found_at,
    ...(typeof row.observed_at === 'string' && Number.isFinite(Date.parse(row.observed_at))
      ? { observed_at: row.observed_at } : {}),
    ...(row.source_is_english === true ? { source_is_english: true as const } : {}),
  }
}

/** The firehose is an append-only observation log. `found_at` was only added to its item records on
 * 2026-08-05; every line written before that carries the ingester's own write stamp as `ts` and nothing
 * else. Dropping those records (the old behaviour) made every legacy partition permanently unprovable,
 * which wedged coverage and then blocked all ingest.
 *
 * The fallback is deliberately narrow in two ways. It applies only when `found_at` is ABSENT — a
 * present-but-malformed stamp is corruption, not legacy shape, and still fails closed exactly as before,
 * so bad source-clock data can never enter the immutable registry. And `ts` is the moment the line was
 * APPENDED, which is later than the sweep's authoritative first-seen `found_at` (measured on the retained
 * 2026-07-13 partition: later for 40 of 40 rows). So `syncRevisionPartition` claims the sweep's own rows
 * FIRST; this fallback can only ever fill a key the sweep no longer retains, never overwrite a real one
 * with a later stamp. */
function firehoseRevisionRecord(
  row: Parameters<typeof revisionRecord>[0] & { ts?: unknown },
): RevisionClockRecord | null {
  if (row.found_at !== undefined) return revisionRecord(row)
  if (typeof row.ts !== 'string' || !Number.isFinite(Date.parse(row.ts))) return null
  return revisionRecord({ ...row, found_at: row.ts })
}

function revisionRecordsFromDocument(doc: SweepWithRevisionClocks, label: string): Map<string, RevisionClockRecord> | null {
  if (doc.revision_clock_version === undefined && doc.revision_clocks === undefined) return null
  if (doc.revision_clock_version !== 1 || !Array.isArray(doc.revision_clocks)) {
    throw new Error(`invalid revision clock index in ${label}`)
  }
  const out = new Map<string, RevisionClockRecord>()
  for (const value of doc.revision_clocks) {
    const row = value as Partial<RevisionClockRecord> | null
    if (!row || typeof row.revision_key !== 'string' || row.revision_key.length === 0
      || typeof row.event_id !== 'string' || !/^EVT-[0-9a-f]{12}$/.test(row.event_id)
      || typeof row.found_at !== 'string' || !Number.isFinite(Date.parse(row.found_at))
      || (row.observed_at !== undefined
        && (typeof row.observed_at !== 'string' || !Number.isFinite(Date.parse(row.observed_at))))
      || (row.source_is_english !== undefined && row.source_is_english !== true)
      || out.has(row.revision_key)) {
      throw new Error(`invalid revision clock record in ${label}`)
    }
    out.set(row.revision_key, row as RevisionClockRecord)
  }
  return out
}

function writeSweepDocumentAtomic(fp: string, doc: SweepWithRevisionClocks): void {
  atomicWriteText(fp, JSON.stringify(doc, null, 2) + '\n')
}

/** Daily sweep files are storage partitions, not revision boundaries. Each wrapper carries a compact,
 * uncapped exact-event clock index that the existing archive/failover path already preserves. Legacy
 * partitions are migrated once from retained rows plus their durable local/archive firehose. */
function revisionPartitionSignature(repoRoot: string, partitionDate: string, archiveDir: string): string {
  const candidates = [
    ['local:sweep', inboxPath(repoRoot, partitionDate)],
    ['local:firehose', firehosePath(repoRoot, partitionDate)],
    ...(archiveDir ? [
      ['archive:sweep', path.join(archiveDir, `${partitionDate}_sweep.json`)],
      ['archive:firehose', path.join(archiveDir, `${partitionDate}_firehose.ndjson`)],
    ] : []),
  ]
  return candidates.map(([label, fp]) => `${label}:${fileStamp(fp) || 'missing'}`).join('|')
}

function firehoseCandidates(repoRoot: string, partitionDate: string, archiveDir: string): string[] {
  return [
    firehosePath(repoRoot, partitionDate),
    ...(archiveDir ? [path.join(archiveDir, `${partitionDate}_firehose.ndjson`)] : []),
  ]
}

/** Stream one legacy NDJSON partition line-by-line. A single huge day never becomes a FeedItem[] or a
 * lifetime map; the caller consumes each valid record immediately into its disk-backed registry. */
function forEachFirehoseRevision(
  repoRoot: string,
  partitionDate: string,
  archiveDir: string,
  visit: (record: RevisionClockRecord) => void,
): boolean {
  for (const candidate of firehoseCandidates(repoRoot, partitionDate, archiveDir)) {
    let fd: number
    try { fd = fs.openSync(candidate, 'r') } catch { continue }
    const buffer = Buffer.allocUnsafe(64 * 1024)
    let carry = ''
    let validLines = 0
    let invalidCompleteLine = false
    try {
      for (;;) {
        const read = fs.readSync(fd, buffer, 0, buffer.length, null)
        if (!read) break
        const text = carry + buffer.toString('utf8', 0, read)
        const lines = text.split('\n')
        carry = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const row = JSON.parse(line)
            validLines++
            if (row?.kind !== 'item') continue
            const record = firehoseRevisionRecord(row)
            if (record) visit(record)
            else invalidCompleteLine = true
          } catch { invalidCompleteLine = true }
        }
      }
      if (carry.trim()) {
        try {
          const row = JSON.parse(carry)
          validLines++
          // A valid non-newline-terminated last record is complete. Invalid trailing bytes are treated
          // as a torn append, but cannot establish coverage on their own.
          if (row?.kind === 'item') {
            const record = firehoseRevisionRecord(row)
            if (record) visit(record)
            else invalidCompleteLine = true
          }
        } catch { /* torn final line */ }
      }
    } finally {
      fs.closeSync(fd)
    }
    if (validLines > 0 && !invalidCompleteLine) return true
  }
  return false
}

function revisionPartitionSources(repoRoot: string, archiveDir: string): Map<string, string> {
  const dates = new Set<string>()
  const scan = (dir: string) => {
    try {
      for (const file of fs.readdirSync(dir)) {
        const match = /^(\d{4}-\d{2}-\d{2})_(?:sweep\.json|firehose\.ndjson)$/.exec(file)
        if (!match) continue
        dates.add(match[1])
      }
    } catch { /* missing local/archive directory */ }
  }
  scan(path.join(repoRoot, 'screener', 'inbox'))
  if (archiveDir) scan(archiveDir)
  return new Map([...dates].map((partitionDate) => [
    partitionDate,
    revisionPartitionSignature(repoRoot, partitionDate, archiveDir),
  ]))
}

function archiveHasRevisionSource(archiveDir: string, beforeDate: string): boolean {
  if (!archiveDir) return true
  try {
    for (const file of fs.readdirSync(archiveDir)) {
      const match = /^(\d{4}-\d{2}-\d{2})_(?:sweep\.json|firehose\.ndjson)$/.exec(file)
      if (match && match[1] < beforeDate && fileStamp(path.join(archiveDir, file))) return true
    }
  } catch { return false }
  return false
}

function revisionSourceGeneration(repoRoot: string, archiveDir: string): string {
  const localDir = path.join(repoRoot, 'screener', 'inbox')
  return JSON.stringify({
    local: [path.resolve(localDir), fileStamp(localDir)],
    archive: archiveDir ? [path.resolve(archiveDir), fileStamp(archiveDir)] : null,
  })
}

function revisionSourcesForDates(repoRoot: string, archiveDir: string, dates: Iterable<string>): Map<string, string> {
  const sources = new Map<string, string>()
  for (const date of dates) {
    const signature = revisionPartitionSignature(repoRoot, date, archiveDir)
    if (!signature.split('|').every((part) => part.endsWith(':missing'))) sources.set(date, signature)
  }
  return sources
}

function recentPriorDates(date: string): string[] {
  const cursor = new Date(`${date}T00:00:00Z`)
  const dates: string[] = []
  for (let i = 0; i < REVISION_REGISTRY_RECENT_AUDIT_DAYS; i++) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
    dates.push(cursor.toISOString().slice(0, 10))
  }
  return dates
}

function nextRevisionAuditDate(db: DatabaseSync, date: string): string | null {
  const cursor = registryMeta(db, 'audit_cursor') || ''
  const after = db.prepare(`
    SELECT partition_date FROM revision_clock_partitions
    WHERE partition_date < ? AND partition_date > ?
    ORDER BY partition_date ASC LIMIT 1
  `).get(date, cursor) as { partition_date?: unknown } | undefined
  if (typeof after?.partition_date === 'string') return after.partition_date
  const first = db.prepare(`
    SELECT partition_date FROM revision_clock_partitions
    WHERE partition_date < ? ORDER BY partition_date ASC LIMIT 1
  `).get(date) as { partition_date?: unknown } | undefined
  return typeof first?.partition_date === 'string' ? first.partition_date : null
}

function registryPath(repoRoot: string, stateDir?: string): string {
  return path.join(stateDir || path.join(repoRoot, 'ui', 'server', '.state'), REVISION_REGISTRY_FILE)
}

function coveragePath(repoRoot: string, stateDir?: string): string {
  return path.join(stateDir || path.join(repoRoot, 'ui', 'server', '.state'), REVISION_COVERAGE_FILE)
}

function readCoverageManifest(repoRoot: string, stateDir?: string): RevisionCoverageManifest | null {
  try {
    const raw = JSON.parse(fs.readFileSync(coveragePath(repoRoot, stateDir), 'utf8')) as Partial<RevisionCoverageManifest>
    if (raw.version !== REVISION_COVERAGE_VERSION || typeof raw.complete !== 'boolean'
      || !Number.isSafeInteger(raw.generation) || Number(raw.generation) < 1
      || typeof raw.coverage_through !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.coverage_through)
      || !Array.isArray(raw.partition_dates)
      || raw.partition_dates.some((date) => typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      || new Set(raw.partition_dates).size !== raw.partition_dates.length) {
      throw new Error('invalid revision clock coverage manifest')
    }
    return raw as RevisionCoverageManifest
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null
    throw error
  }
}

function writeCoverageManifest(
  repoRoot: string,
  stateDir: string | undefined,
  previous: RevisionCoverageManifest | null,
  coverageThrough: string,
  partitionDates: Iterable<string>,
  complete: boolean,
): RevisionCoverageManifest {
  const dates = [...new Set(partitionDates)].sort()
  if (previous?.complete === complete && previous.coverage_through === coverageThrough
    && previous.partition_dates.length === dates.length
    && previous.partition_dates.every((date, index) => date === dates[index])) return previous
  const doc: RevisionCoverageManifest = {
    version: REVISION_COVERAGE_VERSION,
    generation: (previous?.generation || 0) + 1,
    complete,
    coverage_through: coverageThrough,
    partition_dates: dates,
  }
  atomicWriteText(coveragePath(repoRoot, stateDir), `${JSON.stringify(doc, null, 2)}\n`)
  return doc
}

function registryMeta(db: DatabaseSync, key: string): string | null {
  const row = db.prepare('SELECT value FROM revision_clock_meta WHERE key = ?').get(key) as { value?: unknown } | undefined
  return typeof row?.value === 'string' ? row.value : null
}

function saveRegistryMeta(db: DatabaseSync, key: string, value: string): void {
  db.prepare(`
    INSERT INTO revision_clock_meta(key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value)
}

function openRevisionRegistry(repoRoot: string, stateDir?: string): { db: DatabaseSync; file: string } {
  const file = registryPath(repoRoot, stateDir)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  try {
    db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=FULL;
      PRAGMA busy_timeout=5000;
      PRAGMA cache_size=-${REVISION_REGISTRY_PAGE_CACHE_KIB};
      PRAGMA temp_store=FILE;
      CREATE TABLE IF NOT EXISTS revision_clock_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      ) WITHOUT ROWID;
      CREATE TABLE IF NOT EXISTS revision_clock_partitions (
        partition_date TEXT PRIMARY KEY,
        source_signature TEXT NOT NULL
      ) WITHOUT ROWID;
      CREATE TABLE IF NOT EXISTS revision_clocks (
        revision_key TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        partition_date TEXT NOT NULL,
        found_at TEXT NOT NULL,
        observed_at TEXT,
        source_is_english INTEGER NOT NULL CHECK(source_is_english IN (0, 1))
      ) WITHOUT ROWID;
    `)
    const schema = db.prepare("SELECT value FROM revision_clock_meta WHERE key = 'schema_version'").get() as { value?: unknown } | undefined
    if (schema && schema.value !== REVISION_REGISTRY_SCHEMA_VERSION) {
      throw new Error(`unsupported revision clock registry schema ${String(schema.value)}`)
    }
    db.prepare("INSERT OR IGNORE INTO revision_clock_meta(key, value) VALUES ('schema_version', ?)")
      .run(REVISION_REGISTRY_SCHEMA_VERSION)
    return { db, file }
  } catch (error) {
    try { db.close() } catch { /* best effort */ }
    throw error
  }
}

function registryIsCorrupt(error: unknown): boolean {
  const message = String((error as { message?: unknown })?.message || error || '')
  return /(?:database disk image is malformed|file is not a database|SQLITE_CORRUPT|SQLITE_NOTADB)/i.test(message)
}

function registryBootstrapComplete(db: DatabaseSync): boolean {
  return registryMeta(db, 'bootstrap_complete') === '1'
}

function registryCoverageThrough(db: DatabaseSync): string | null {
  return registryMeta(db, 'coverage_through')
}

function registryMissingCoverage(db: DatabaseSync): Set<string> {
  try {
    const stored = JSON.parse(registryMeta(db, 'coverage_missing') || '[]')
    if (!Array.isArray(stored)) return new Set(['invalid-coverage-state'])
    return new Set(stored.filter((value) => typeof value === 'string'))
  } catch { return new Set(['invalid-coverage-state']) }
}

function removeDerivedRegistry(file: string): void {
  for (const suffix of ['', '-wal', '-shm']) {
    try { fs.rmSync(`${file}${suffix}`, { force: true }) } catch { /* best effort; retry reports failure */ }
  }
  for (const key of [...revisionQueryCache.keys()]) if (key.startsWith(`${file}\u0000`)) revisionQueryCache.delete(key)
}

function withRevisionRegistry<T>(
  repoRoot: string,
  stateDir: string | undefined,
  use: (db: DatabaseSync, file: string) => T,
): T {
  const file = registryPath(repoRoot, stateDir)
  for (let attempt = 0; attempt < 2; attempt++) {
    let db: DatabaseSync | undefined
    try {
      const opened = openRevisionRegistry(repoRoot, stateDir)
      db = opened.db
      return use(db, opened.file)
    } catch (error) {
      if (attempt > 0 || !registryIsCorrupt(error)) throw error
      try { db?.close() } catch { /* best effort */ }
      db = undefined
      // The SQLite file is only a lookup projection. Embedded sweep indexes and firehoses remain the
      // durable truth, so replacing a corrupt projection is lossless and the next sync rebuilds it.
      removeDerivedRegistry(file)
    } finally {
      try { db?.close() } catch { /* best effort */ }
    }
  }
  throw new Error('revision clock registry recovery failed')
}

function upsertRevisionRecords(
  db: DatabaseSync,
  partitionDate: string,
  records: Iterable<RevisionClockRecord>,
): void {
  const insert = db.prepare(`
    INSERT INTO revision_clocks (
      revision_key, event_id, partition_date, found_at, observed_at, source_is_english
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(revision_key) DO UPDATE SET
      event_id = excluded.event_id,
      partition_date = excluded.partition_date,
      found_at = excluded.found_at,
      observed_at = excluded.observed_at,
      source_is_english = excluded.source_is_english
    WHERE excluded.partition_date < revision_clocks.partition_date
  `)
  for (const record of records) {
    insert.run(
      registryRevisionKey(record.revision_key),
      record.event_id,
      partitionDate,
      record.found_at,
      record.observed_at || null,
      record.source_is_english === true ? 1 : 0,
    )
  }
}

function upsertRevisionRecord(db: DatabaseSync, partitionDate: string, record: RevisionClockRecord): void {
  db.prepare(`
    INSERT INTO revision_clocks (
      revision_key, event_id, partition_date, found_at, observed_at, source_is_english
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(revision_key) DO UPDATE SET
      event_id = excluded.event_id,
      partition_date = excluded.partition_date,
      found_at = excluded.found_at,
      observed_at = excluded.observed_at,
      source_is_english = excluded.source_is_english
    WHERE excluded.partition_date < revision_clocks.partition_date
  `).run(
    registryRevisionKey(record.revision_key),
    record.event_id,
    partitionDate,
    record.found_at,
    record.observed_at || null,
    record.source_is_english === true ? 1 : 0,
  )
}

function syncRevisionPartition(
  db: DatabaseSync,
  repoRoot: string,
  partitionDate: string,
  archiveDir: string,
): boolean {
  const localPath = inboxPath(repoRoot, partitionDate)
  const archivedPath = archiveDir ? path.join(archiveDir, `${partitionDate}_sweep.json`) : ''
  const candidates = [localPath, ...(archivedPath && archivedPath !== localPath ? [archivedPath] : [])]
  let sweep: { doc: SweepWithRevisionClocks; records: Map<string, RevisionClockRecord> | null; writablePath?: string } | null = null
  for (const fp of candidates) {
    try {
      const doc = JSON.parse(fs.readFileSync(fp, 'utf8')) as SweepWithRevisionClocks
      sweep = {
        doc, records: revisionRecordsFromDocument(doc, path.basename(fp)),
        ...(fp === localPath ? { writablePath: fp } : {}),
      }
      break
    } catch { /* try archive/firehose */ }
  }
  const seen = new Set<string>()
  const accept = (record: RevisionClockRecord) => {
    if (seen.has(record.revision_key)) return
    seen.add(record.revision_key)
    upsertRevisionRecord(db, partitionDate, record)
  }
  for (const record of sweep?.records?.values() || []) accept(record)
  const needsLegacyFirehose = !sweep?.records
  // A retained sweep row carries the AUTHORITATIVE first-seen `found_at`; the legacy firehose carries only
  // the later append-time `ts`. Claim the sweep's keys BEFORE streaming the firehose so the `ts` fallback
  // can only fill keys the sweep no longer retains (the capped-out rows the firehose exists to recover) —
  // never replace a real clock with one that is days too new. A partial write here is safe: the caller
  // wraps this call in a SAVEPOINT and rolls back whenever it returns false.
  let changed = sweep?.records === null
  for (const row of Array.isArray(sweep?.doc.rows) ? sweep.doc.rows : []) {
    const record = revisionRecord(row)
    if (!record || seen.has(record.revision_key)) continue
    accept(record)
    changed = true
  }
  const hasLegacyFirehose = needsLegacyFirehose
    && firehoseCandidates(repoRoot, partitionDate, archiveDir).some((candidate) => fileStamp(candidate) !== null)
  const firehoseReadable = needsLegacyFirehose
    ? forEachFirehoseRevision(repoRoot, partitionDate, archiveDir, accept)
    : false
  if ((!sweep && !firehoseReadable) || (hasLegacyFirehose && !firehoseReadable)) return false
  if (sweep?.writablePath && changed) {
    // Migration metadata itself is bounded by the daily partition, and this compatibility write happens
    // once. Preserve updated_at exactly while making future boots skip the large firehose.
    const records = db.prepare(`
      SELECT revision_key, event_id, found_at, observed_at, source_is_english
      FROM revision_clocks WHERE partition_date = ?
    `).all(partitionDate) as Array<{
      revision_key: string; event_id: string; found_at: string; observed_at: string | null; source_is_english: number
    }>
    sweep.doc.revision_clock_version = 1
    sweep.doc.revision_clocks = records.map((record) => ({
      revision_key: embeddedRevisionKey(record.revision_key), event_id: record.event_id, found_at: record.found_at,
      ...(record.observed_at ? { observed_at: record.observed_at } : {}),
      ...(record.source_is_english === 1 ? { source_is_english: true as const } : {}),
    }))
    writeSweepDocumentAtomic(sweep.writablePath, sweep.doc)
  }
  return true
}

/** Incrementally reconcile compact daily sources into a disk-backed oldest-first registry. Cold boot
 * discovers history once and streams one daily partition at a time. Steady cycles inspect a recent
 * window plus one persisted round-robin old date; a directory-generation change performs one filename
 * discovery so an old restored partition cannot remain invisible. No lifetime revision map lives in JS. */
function syncRevisionRegistry(
  db: DatabaseSync,
  repoRoot: string,
  date: string,
  archiveDir: string,
  stateDir?: string,
): { complete: boolean; pendingCoverage?: PendingRevisionCoverage } {
  const storedSignature = db.prepare(
    'SELECT source_signature FROM revision_clock_partitions WHERE partition_date = ?',
  )
  const savePartition = db.prepare(`
    INSERT INTO revision_clock_partitions(partition_date, source_signature) VALUES (?, ?)
    ON CONFLICT(partition_date) DO UPDATE SET source_signature = excluded.source_signature
  `)
  let changed = false
  const bootstrapComplete = registryBootstrapComplete(db)
  const manifest = readCoverageManifest(repoRoot, stateDir)
  const archiveAvailable = !archiveDir || fileStamp(archiveDir) !== null
  const generation = revisionSourceGeneration(repoRoot, archiveDir)
  const generationChanged = registryMeta(db, 'source_generation') !== generation
    || registryMeta(db, 'coverage_generation') !== String(manifest?.generation || 0)
  const fullDiscovery = (!bootstrapComplete && registryMeta(db, 'source_generation') === null)
    || !manifest || generationChanged
  let missing = registryMissingCoverage(db)
  let sourceByDate: Map<string, string>
  let auditDate: string | null = null
  if (fullDiscovery) {
    sourceByDate = new Map([...revisionPartitionSources(repoRoot, archiveDir)]
      .filter(([partitionDate]) => partitionDate <= date).sort())
    missing.clear()
    if (!archiveAvailable) missing.add('configured-archive-unavailable')
    if (!manifest && archiveDir && !archiveHasRevisionSource(archiveDir, date)) {
      throw new Error('revision clock registry bootstrap cannot prove coverage from an empty configured archive')
    }
    if (manifest?.complete === false && archiveDir && !archiveHasRevisionSource(archiveDir, date)) {
      missing.add('configured-archive-unproven')
    }
    for (const partitionDate of manifest?.partition_dates || []) {
      if (partitionDate <= date && !sourceByDate.has(partitionDate)) missing.add(partitionDate)
    }
  } else {
    auditDate = nextRevisionAuditDate(db, date)
    const missingAudit = [...missing].find((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)) || null
    const knownRecent = (db.prepare(`
      SELECT partition_date FROM revision_clock_partitions
      WHERE partition_date < ? ORDER BY partition_date DESC LIMIT ?
    `).all(date, REVISION_REGISTRY_RECENT_AUDIT_DAYS) as Array<{ partition_date: string }>).map((row) => row.partition_date)
    sourceByDate = revisionSourcesForDates(repoRoot, archiveDir, [
      ...recentPriorDates(date), ...knownRecent, ...(auditDate ? [auditDate] : []),
      ...(missingAudit ? [missingAudit] : []),
    ])
    // Directory membership is unchanged from the fully proved generation. A missing audited path is
    // therefore a same-path source failure, not evidence that the partition never existed.
    if (auditDate && !sourceByDate.has(auditDate)) missing.add(auditDate)
    if (!archiveAvailable) missing.add('configured-archive-unavailable')
  }
  const sources = [...sourceByDate].sort()
  db.exec('BEGIN IMMEDIATE')
  try {
    for (const [partitionDate, signature] of sources) {
      const stored = storedSignature.get(partitionDate) as { source_signature?: unknown } | undefined
      if (stored?.source_signature !== signature || missing.has(partitionDate)) {
        db.exec('SAVEPOINT revision_partition')
        if (!syncRevisionPartition(db, repoRoot, partitionDate, archiveDir)) {
          db.exec('ROLLBACK TO revision_partition')
          db.exec('RELEASE revision_partition')
          missing.add(partitionDate)
          continue
        }
        db.exec('RELEASE revision_partition')
        // Migration may have atomically added revision_clocks to the local sweep, changing its stamp.
        savePartition.run(partitionDate, revisionPartitionSignature(repoRoot, partitionDate, archiveDir))
        missing.delete(partitionDate)
        changed = true
      }
    }
    const coverageComplete = missing.size === 0
    if (!bootstrapComplete && coverageComplete) {
      db.prepare("INSERT INTO revision_clock_meta(key, value) VALUES ('bootstrap_complete', '1') ON CONFLICT(key) DO UPDATE SET value = '1'").run()
    }
    saveRegistryMeta(db, 'source_generation', revisionSourceGeneration(repoRoot, archiveDir))
    saveRegistryMeta(db, 'coverage_missing', JSON.stringify([...missing].sort()))
    if (auditDate) saveRegistryMeta(db, 'audit_cursor', auditDate)
    if (coverageComplete) saveRegistryMeta(db, 'coverage_through', date)
    else {
      saveRegistryMeta(db, 'coverage_generation', String(manifest?.generation || 0))
    }
    // Persist the coverage inventory even when lookup may proceed on an already-known exact key. Without
    // an explicit pending manifest, that known-key write could publish a smaller `complete:true` manifest
    // and forget the corrupt/missing partition that kept bootstrap incomplete.
    const registeredDates = (db.prepare(
      'SELECT partition_date FROM revision_clock_partitions ORDER BY partition_date',
    ).all() as Array<{ partition_date: string }>).map((row) => row.partition_date)
    const partitionDates = [...new Set([
      ...(manifest?.partition_dates || []),
      ...registeredDates,
      ...[...missing].filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)),
    ])].sort()
    const pendingCoverage: PendingRevisionCoverage = {
      manifest,
      complete: coverageComplete,
      coverageThrough: manifest?.coverage_through && manifest.coverage_through > date
        ? manifest.coverage_through : date,
      partitionDates,
    }
    db.exec('COMMIT')
    if (changed || fullDiscovery) revisionQueryCache.clear()
    return { complete: coverageComplete, pendingCoverage }
  } catch (error) {
    try { db.exec('ROLLBACK') } catch { /* best effort */ }
    throw error
  }
}

function prepareRevisionPartitionWrite(
  repoRoot: string,
  partitionDate: string,
  archiveDir: string,
  records: Iterable<RevisionClockRecord>,
  stateDir?: string,
): PreparedRevisionRegistryWrite {
  const durableRecords = [...records]
  const { db } = openRevisionRegistry(repoRoot, stateDir)
  const manifest = readCoverageManifest(repoRoot, stateDir)
  let active = true
  try {
    db.exec('BEGIN IMMEDIATE')
    upsertRevisionRecords(db, partitionDate, durableRecords)
    // The sweep bytes are not installed yet, so mark this partition dirty. The next lookup verifies
    // its durable source stamp after the atomic rename and reconciles if a crash interrupted either side.
    db.prepare(`
      INSERT INTO revision_clock_partitions(partition_date, source_signature) VALUES (?, ?)
      ON CONFLICT(partition_date) DO UPDATE SET source_signature = excluded.source_signature
    `).run(partitionDate, 'pending-sweep-rename')
    return {
      commit: () => {
        if (!active) return
        try {
          db.exec('COMMIT')
          const missing = registryMissingCoverage(db)
          const registeredDates = (db.prepare(
            'SELECT partition_date FROM revision_clock_partitions ORDER BY partition_date',
          ).all() as Array<{ partition_date: string }>).map((row) => row.partition_date)
          const partitionDates = [...new Set([
            ...(manifest?.partition_dates || []),
            ...registeredDates,
            ...[...missing].filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)),
          ])].sort()
          const coverageThrough = [manifest?.coverage_through, registryCoverageThrough(db), partitionDate]
            .filter((value): value is string => typeof value === 'string').sort().at(-1)!
          const nextManifest = writeCoverageManifest(repoRoot, stateDir, manifest, coverageThrough,
            partitionDates, registryBootstrapComplete(db) && missing.size === 0)
          saveRegistryMeta(db, 'coverage_generation', String(nextManifest.generation))
        } finally { active = false; db.close() }
      },
      rollback: () => {
        if (!active) return
        try { db.exec('ROLLBACK') } finally { active = false; db.close() }
      },
    }
  } catch (error) {
    try { if (active) db.exec('ROLLBACK') } catch { /* best effort */ }
    try { db.close() } catch { /* best effort */ }
    throw error
  }
}

export function revisionClockRegistryDiagnostics(repoRoot: string, stateDir?: string): {
  backend: 'sqlite'
  revisionCount: number
  partitionCount: number
  queryCacheEntries: number
  queryCacheMax: number
} {
  return withRevisionRegistry(repoRoot, stateDir, (db, file) => {
    const revisions = db.prepare('SELECT COUNT(*) AS count FROM revision_clocks').get() as { count: number }
    const partitions = db.prepare('SELECT COUNT(*) AS count FROM revision_clock_partitions').get() as { count: number }
    const prefix = `${file}\u0000`
    return {
      backend: 'sqlite',
      revisionCount: Number(revisions.count),
      partitionCount: Number(partitions.count),
      queryCacheEntries: [...revisionQueryCache.keys()].filter((key) => key.startsWith(prefix)).length,
      queryCacheMax: REVISION_CLOCK_QUERY_CACHE_MAX,
    }
  })
}

interface PriorRevisionRead {
  clocks: Map<string, DurableRevisionClock>
  /** Revision keys whose first observation could not be PROVED. Handing any of these a clock would
   * manufacture freshness, so the caller withholds those ITEMS — never the whole cycle. */
  unproven: Set<string>
  /** True when TODAY's own partition is among the blockers. A partial sweep write would then repair
   * today's partition, clear it from coverage_missing, falsely complete coverage, and let the NEXT cycle
   * mint a fresh clock for the very key just withheld. In that one case the caller withholds the WHOLE
   * batch and writes nothing — byte-for-byte what the old throw left behind. An OLD blocked partition
   * cannot be repaired by writing today's sweep (syncRevisionRegistry re-reads that date's own sources
   * every tick), and the non-date sentinels are recomputed from live observation on every fullDiscovery,
   * so neither can be silently erased by a partial write. */
  todayBlocked: boolean
}

function readPriorInboxRevisions(
  repoRoot: string,
  date: string,
  revisionKeys: Set<string>,
  archiveDir: string,
  stateDir?: string,
): PriorRevisionRead {
  const found = new Map<string, DurableRevisionClock>()
  return withRevisionRegistry(repoRoot, stateDir, (db, file) => {
    const sync = syncRevisionRegistry(db, repoRoot, date, archiveDir, stateDir)
    const coverageThrough = registryCoverageThrough(db)
    if (sync.pendingCoverage) {
      const nextManifest = writeCoverageManifest(repoRoot, stateDir, sync.pendingCoverage.manifest,
        sync.pendingCoverage.coverageThrough, sync.pendingCoverage.partitionDates,
        sync.pendingCoverage.complete)
      saveRegistryMeta(db, 'coverage_generation', String(nextManifest.generation))
    }
    const lookup = db.prepare(`
      SELECT found_at, observed_at, source_is_english
      FROM revision_clocks
      WHERE revision_key = ? AND partition_date <= ?
    `)
    for (const revisionKey of revisionKeys) {
      const cacheKey = `${file}\u0000${date}\u0000${revisionKey}`
      let clock = revisionQueryCache.get(cacheKey)
      if (clock === undefined && !revisionQueryCache.has(cacheKey)) {
        const row = lookup.get(registryRevisionKey(revisionKey), date) as {
          found_at?: unknown; observed_at?: unknown; source_is_english?: unknown
        } | undefined
        clock = row && typeof row.found_at === 'string'
          ? {
              found_at: row.found_at,
              ...(typeof row.observed_at === 'string' ? { observed_at: row.observed_at } : {}),
              ...(row.source_is_english === 1 ? { source_is_english: true as const } : {}),
            }
          : null
        cacheRevisionQuery(cacheKey, clock)
      }
      if (clock) found.set(revisionKey, clock)
    }
    // Existing registry hits remain safe while a known partition is temporarily unavailable: they are
    // already the oldest durable tuple. Only a miss would manufacture freshness, so fail that miss closed
    // until complete coverage is re-proved.
    const completeThroughDate = sync.complete && registryBootstrapComplete(db)
      && Boolean(coverageThrough && coverageThrough >= date)
    // Fail the PROJECTION closed, not the CYCLE. This used to throw, and the throw was the defect:
    // mergeInbox runs BEFORE the wire write, the audit summary and the backlog cleanup, so refusing one
    // row's clock also destroyed all three — an integrity refusal rendered as a total blackout
    // (2026-08-17: ~250 consecutive cycles, 0 items, every screener view empty). Coverage is recomputed
    // from disk on every call and `unproven` is never persisted, so the moment a partition becomes
    // readable these keys resolve normally: no latch, no deadlock.
    const unproven = new Set<string>()
    let todayBlocked = false
    if (!completeThroughDate && found.size !== revisionKeys.size) {
      todayBlocked = registryMissingCoverage(db).has(date)
      for (const revisionKey of revisionKeys) if (!found.has(revisionKey)) unproven.add(revisionKey)
    }
    return { clocks: found, unproven, todayBlocked }
  })
}

function nextInboxSeq(rows: InboxRow[]): number {
  let max = 0
  for (const r of rows) {
    const m = /-(\d+)$/.exec(r.inbox_id || '')
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

export interface MergeOptions {
  maxRows?: number // cap on UNCONSUMED rows (ranked by score); consumed rows are always kept
  now?: () => Date
  archiveDir?: string
  stateDir?: string
}

export interface InboxRevisionClocks {
  foundAt: string
  observedAt?: string
  sourceIsEnglish: boolean
}

export interface MergeInboxResult {
  rowCount: number
  /** Immutable provenance for every incoming exact revision, including rows omitted by the UI cap. */
  revisionClocksByEvent: Map<string, InboxRevisionClocks>
  /** Incoming event ids this merge refused to project: their first observation could not be proved, or
   * their row could not be represented. They are NOT in the sweep and NOT clocked, and the caller must
   * return them to the backlog UNSEEN so a later cycle retries them. Empty on a clean merge. */
  withheldEventIds: Set<string>
}

const tierRank = (t?: string | null): number => (t ? SOURCE_TIERS[t as SourceTierId]?.rank ?? 0 : 0)
const MAX_OBSERVATIONS_PER_STORY = 6
const sourceTime = (row: Pick<InboxRow, 'found_at'>): number => {
  const parsed = Date.parse(row.found_at)
  return Number.isFinite(parsed) ? parsed : 0
}
const byQuality = (a: InboxRow, b: InboxRow): number =>
  tierRank(b.source_tier) - tierRank(a.source_tier)
  || (b.triage_score ?? -1) - (a.triage_score ?? -1)
  || sourceTime(b) - sourceTime(a)
  || a.inbox_id.localeCompare(b.inbox_id)
const byRecency = (a: InboxRow, b: InboxRow): number =>
  sourceTime(b) - sourceTime(a) || byQuality(a, b)

export type StoryObservationKind = 'ordinary' | 'other' | 'adverse' | 'restorative'
export type HumanVetoStoryState = 'positive' | 'adverse' | 'restorative' | 'unknown'

type StoryObservationView = {
  headline?: unknown
  headline_en?: unknown
  event_types?: unknown
}

// Keep this classifier deliberately smaller than story-key's broad preservation detector. Its only job
// is to reserve two slots inside the bounded family history: one for an adverse state, and one for a
// correction/restoration. Ambiguous words such as "changes" or the noun "proceeds" remain `other`, so a
// burst of harmless rewrites cannot evict either state from the audit trail.
const ADVERSE_STATE_RE = /\b(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|deferrals?|suspend(?:s|ed|ing)?|suspensions?|scrap(?:s|ped|ping)?|call(?:s|ed|ing)?[\s-]+off|adjourn(?:s|ed|ing|ments?)?|withdraw(?:s|n|ing|als?)?|withdrew|retract(?:s|ed|ing|ions?)?|rescind(?:s|ed|ing)?|revok(?:e|es|ed|ing|ations?)|reject(?:s|ed|ing|ions?)?|invalidat(?:e|es|ed|ing|ions?)?|terminat(?:e|es|ed|ing|ions?)?|annul(?:s|led|ling|ments?)?)\b/i
const CORRECTION_STATE_RE = /\b(?:correct(?:s|ed|ing|ions?)?|clarif(?:y|ies|ied|ying|ications?)|revis(?:e|es|ed|ing|ions?)|restat(?:e|es|ed|ing|ements?)|inaccurate|untrue)\b/i
// Negation must bind directly to the adverse predicate. An arbitrary span made "did not explain why
// the regulator cancelled approval" look like a restoration even though cancellation still stood.
const NEGATED_ADVERSE_RE = /\b(?:not|never|no longer|won['’]?t|isn['’]?t|wasn['’]?t|weren['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|wouldn['’]?t|cannot|can['’]?t)\s+(?:(?:be|been|being)\s+)?(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?|withdraw(?:s|n|ing|als?)?)\b/i
// Denial is a restoration only when grammar binds the denial to the adverse claim. A loose
// "denies ... cancelled" span made unrelated headlines such as "denies responsibility after the
// regulator cancelled approval" look like reversals.
const DENIES_ADVERSE_REPORT_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:reports?|claims?|allegations?|rumou?rs?)\s+(?:that\s+)?(?:the\s+|its\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|had been|will be)\s+)?(?:cancel(?:l?ed|lation)?|postpon(?:ed|ement)|delay(?:ed)?|defer(?:red|ral)|suspend(?:ed|sion))\b/i
const DENIES_ADVERSE_ACTION_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:it|the company|the issuer|the board|the regulator)\s+(?:(?:has|had)\s+)?(?:cancel(?:l?ed|ling)?|postpon(?:ed|ing)?|delay(?:ed|ing)?|defer(?:red|ring)?|suspend(?:ed|ing)?)\b/i
const DENIES_ADVERSE_STATUS_RE = /\b(?:den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing))\s+(?:the\s+|its\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|had been|will be)\s+)?(?:cancel(?:l?ed|lation)?|postpon(?:ed|ement)|delay(?:ed)?|defer(?:red|ral)|suspend(?:ed|sion))\b/i
const UNDONE_ADVERSE_RE = /\b(?:cancel(?:s|l?ed|lations?|l?ing)?|postpon(?:e(?:s|d)?|ements?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?)\b(?:\s+[\p{L}\p{N}'’-]+){0,4}\s+\b(?:is|are|was|were|has been|have been|claims? are|reports? are)\s+(?:withdrawn|rescinded|reversed|denied|false|incorrect|inaccurate|untrue)\b/iu
const EXPLICIT_UNDO_RE = /\b(?:revers(?:e|es|ed|ing)\s+(?:the\s+)?decision\s+to\s+cancel|cancel(?:s|l?ed|l?ing)?\s+(?:the\s+)?postponement|withdraw(?:s|n|ing)?\s+(?:the\s+)?(?:[\p{L}\p{N}'’-]+\s+){0,3}cancellation\s+notice)\b/iu
// Generic "proceed/resume" is not proof that the vetoed object changed state (an investigation can
// proceed while an approval remains cancelled). Only a directly named status object is restorative.
const RESUMPTION_RE = /\b(?:reinstat(?:e|es|ed|ing)|restor(?:e|es|ed|ing)|resum(?:e|es|ed|ing))\s+(?:the\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend|trading|production|service|talks?)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend|trading|production|service|talks?)\s+(?:(?:is|are|was|were|has been|have been|will be)\s+)?(?:reinstated|restored|resumed)\b/i
// Bounded family history may retain an explicitly scheduled proceeding even though that wording is
// intentionally too broad to overturn a human veto. "As scheduled" supplies the missing status bind.
const SCHEDULED_PROCEED_RE = /\b(?:agm|egm|meeting|event|deal|transaction|vote|dividend|trading|production|service|talks?)\s+(?:(?:will|would|shall|is|are|was|were|has|have)\s+)?(?:still\s+)?(?:proceed|proceeds|proceeded|proceeding)\s+as\s+scheduled\b/i
const RESTORED_STATUS_RE = /\b(?:reinstat(?:e|es|ed|ing)|restor(?:e|es|ed|ing))\s+(?:the\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance|agm|meeting|event|deal|transaction|vote|guidance|dividend)\s+(?:(?:is|are|was|were|has been|have been|will be)\s+)?(?:reinstated|restored)\b/i
const RESTORE_CONFIDENCE_RE = /\brestor(?:e|es|ed|ing)\s+(?:(?:investor|consumer|market|public)\s+)?confidence\b/i
const RESTORE_STATE_RE = /\brestor(?:e|es|ed|ing|ation)\b/i
const EXPLICIT_REPORT_REVISION_RE = /\b(?:retract(?:s|ed|ing)?|withdraw(?:s|n|ing)?|correct(?:s|ed|ing)?|clarif(?:y|ies|ied|ying))\b[^.;:]{0,60}\b(?:report|claim|statement|announcement|notice)\b|\b(?:report|claim|statement|announcement|notice)\b[^.;:]{0,60}\b(?:retract(?:s|ed|ing)?|withdraw(?:s|n|ing)?|correct(?:s|ed|ing)?|clarif(?:y|ies|ied|ying))\b/i
const NEGATIVE_APPROVAL_STATE_RE = /\b(?:do|does|did|has|have|had|will|would|can|could)\s+not\s+(?:receive|obtain|secure|get|win|gain)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:fail(?:s|ed|ing)?\s+to\s+)(?:receive|obtain|secure|get|win|gain)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\s+(?:(?:is|was|has been|had been|will be)\s+)?(?:not|never)\s+(?:granted|approved|received|obtained|secured|confirmed)\b|\b(?:received|obtained|secured|has|have|had)\s+no\s+(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b/i
const POSITIVE_APPROVAL_STATE_RE = /\b(?:approves?|approved|grants?|granted|receives?|received|obtains?|obtained|secures?|secured|wins?|won)\s+(?:the\s+|an?\s+)?(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b|\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\s+(?:(?:is|was|has been|had been)\s+)?(?:granted|approved|received|obtained|secured|confirmed|valid|active)\b/i
// A human dismissal may be bypassed only by an observed state change, never by a forecast or an
// unattributed/contested report. Keep this global across positive, adverse, and restorative lanes: a
// modal before "cancelled" is just as unproven as one before "approved". Do not include plain "says" or
// "reports" here because an identified company/regulator can make a factual statement, and the guarded
// denial grammar below deliberately accepts "denies reports that ...". Explicit uncertainty markers do
// close the exception.
const SPECULATIVE_STATE_RE = /\b(?:may|might|could|would|should|expects?|expected|plans?|planned|seeks?|seeking|aims?|hopes?|appears?|seems?|likely|potentially|possibly|tentative|conditional|pending|unconfirmed|unverified|reportedly|allegedly|purportedly|rumou?rs?|rumou?red|speculat(?:e[sd]?|ing|ion|ive)|according\s+to\s+(?:unnamed|unidentified|anonymous)\s+sources?)\b/i
const NON_AFFIRMATIVE_APPROVAL_RE = /\b(?:not|never|no|cannot|can['’]?t|won['’]?t|isn['’]?t|wasn['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|without|failed?|fails?|yet\s+to|await(?:s|ed|ing)?|pending|conditional|unconfirmed|tentative|false|falsely|alleged|allegedly|purported|claimed?|disput(?:e|es|ed|ing)|den(?:y|ies|ied|ying)|refut(?:e|es|ed|ing)|rumou?rs?)\b/i

const HUMAN_VETO_CLAUSE_SPLIT_RE = /[.;:!?]+|\s+(?:after|while|although|but|whereas|despite|because|when|however|yet|nevertheless)\s+/i
// Negating a delay/suspension to a separate process is not a status assertion about an object merely
// mentioned inside that process: "did not suspend investigation into approval" says nothing about
// whether approval itself is active. This guard applies only to the strict human-veto parser.
const NEGATED_NON_STATUS_ACTION_RE = /\b(?:not|never|no longer|won['’]?t|isn['’]?t|wasn['’]?t|weren['’]?t|hasn['’]?t|haven['’]?t|hadn['’]?t|wouldn['’]?t|cannot|can['’]?t)\s+(?:(?:be|been|being)\s+)?(?:delay(?:s|ed|ing)?|postpon(?:e(?:s|d)?|ements?|ing)|defer(?:s|red|ring)?|suspend(?:s|ed|ing)?)\s+(?:(?:the|an?)\s+)?(?:review|hearing|investigation|inquiry|proceedings?|process|consideration|decision)\b/i

function classifyHumanVetoClause(headline: string): HumanVetoStoryState {
  if (SPECULATIVE_STATE_RE.test(headline) || NEGATED_NON_STATUS_ACTION_RE.test(headline)) return 'unknown'
  const restorative = NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || RESTORED_STATUS_RE.test(headline)
  // Denials and direct negation contain an adverse word syntactically, so an atomic restorative match
  // wins inside one clause. Independent contradictory clauses are reconciled by the caller below.
  if (restorative) return 'restorative'
  if (ADVERSE_STATE_RE.test(headline) || NEGATIVE_APPROVAL_STATE_RE.test(headline)) return 'adverse'
  if (!NON_AFFIRMATIVE_APPROVAL_RE.test(headline)
    && !NEGATIVE_APPROVAL_STATE_RE.test(headline)
    && POSITIVE_APPROVAL_STATE_RE.test(headline)) return 'positive'
  return 'unknown'
}

const headlineFor = (row: StoryObservationView): string =>
  String((typeof row.headline_en === 'string' && row.headline_en.trim()) || row.headline || '').slice(0, 1_000)

/** Strict source-state parser used only for the guarded human-veto exception. Unknown grammar stays
 * closed. It intentionally does not treat a generic Correction:, denial, resume, or "did not" as a
 * transition; the wording must prove the status itself changed. */
export function classifyHumanVetoStoryState(row: StoryObservationView): HumanVetoStoryState {
  const headline = headlineFor(row)
  if (SPECULATIVE_STATE_RE.test(headline)) return 'unknown'
  const states = new Set(headline.split(HUMAN_VETO_CLAUSE_SPLIT_RE)
    .map(classifyHumanVetoClause)
    .filter((state): state is Exclude<HumanVetoStoryState, 'unknown'> => state !== 'unknown'))
  // A headline asserting both sides of a status is not evidence for either side. This also protects
  // callers that use the headline-wide classifier without the object binder below.
  return states.size === 1 ? [...states][0] : 'unknown'
}

const HUMAN_VETO_OBJECTS: Array<[string, RegExp]> = [
  ['approval', /\b(?:approval|permit|licen[cs]e|authori[sz]ation|clearance)\b/i],
  ['meeting', /\b(?:agm|egm|meeting|event)\b/i],
  ['deal', /\b(?:deal|transaction|merger|acquisition|bid|offer)\b/i],
  ['vote', /\b(?:vote|ballot|referendum)\b/i],
  ['guidance', /\bguidance\b/i],
  ['dividend', /\bdividend\b/i],
  ['trading', /\btrading\b/i],
  ['production', /\bproduction\b/i],
  ['service', /\bservice\b/i],
  ['talks', /\btalks?\b/i],
]
const ANAPHORIC_STATUS_RE = /\b(?:it|this|that|the\s+(?:decision|status)|cancellation|postponement|deferral|suspension|withdrawal|rejection|revocation|termination|annulment|restoration|reinstatement|resumption|reversal|rescission)\b/i
const ANAPHORIC_RESTORATIVE_RE = /\b(?:restoration|reinstatement|resumption|reversal|rescission)\b|\b(?:it|this|that|the\s+(?:decision|status))\s+(?:(?:is|was|remains?|has been|had been)\s+)?(?:restored|reinstated|resumed|valid|active)\b/i

/** Object-bound state evidence for a human-veto transition. Clauses are separated at contrast/causal
 * connectors so "restores dividend after approval was cancelled" cannot masquerade as restoration of
 * the approval. Conflicting states for one object are deliberately unknown. */
export function humanVetoStoryStates(row: StoryObservationView): Map<string, HumanVetoStoryState> {
  const headline = headlineFor(row)
  // A headline-level qualifier such as "Unconfirmed:" governs the asserted status even if punctuation
  // separates it from the predicate. Partial clause parsing must not wash that qualifier away.
  if (SPECULATIVE_STATE_RE.test(headline)) return new Map()
  const clauses = headline.split(HUMAN_VETO_CLAUSE_SPLIT_RE)
  const found = new Map<string, HumanVetoStoryState>()
  let antecedentObject: string | undefined
  for (const clause of clauses) {
    let state = classifyHumanVetoClause(clause)
    let objects = HUMAN_VETO_OBJECTS.filter(([, pattern]) => pattern.test(clause))
    // Status nouns and pronouns can carry the immediately preceding single object: "approval was not
    // cancelled; regulator confirms cancellation" is contradictory approval evidence, not a clean
    // restoration. Unknown antecedents remain closed rather than being guessed.
    if (!objects.length && antecedentObject && ANAPHORIC_STATUS_RE.test(clause)) {
      objects = [[antecedentObject, /(?:)/]]
      if (state === 'unknown' && ANAPHORIC_RESTORATIVE_RE.test(clause)) state = 'restorative'
    }
    if (state === 'unknown') continue
    // One clause-level predicate cannot safely be assigned across multiple financial objects. A future
    // dependency parser may bind each independently; deterministic admission remains fail-closed today.
    if (objects.length !== 1) continue
    for (const [object] of objects) {
      const prior = found.get(object)
      found.set(object, prior && prior !== state ? 'unknown' : state)
      antecedentObject = object
    }
  }
  return found
}

/** Shared bounded-history classifier for Inbox and Ideas. It uses the model-visible English translation
 * when one exists, but deliberately keeps a narrow restoration grammar: a noun such as "proceeds" or an
 * unrelated denial must never displace the actual row that reverses an adverse state. */
export function classifyStoryObservation(row: StoryObservationView): StoryObservationKind {
  const headline = headlineFor(row)
  const eventTypes = Array.isArray(row.event_types) ? row.event_types.map(String) : []
  const correction = eventTypes.includes('accounting_restatement') || CORRECTION_STATE_RE.test(headline)
  const restoration = NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || RESUMPTION_RE.test(headline)
    || SCHEDULED_PROCEED_RE.test(headline)
    || (RESTORE_STATE_RE.test(headline) && !RESTORE_CONFIDENCE_RE.test(headline))
  // A "Correction:" prefix does not by itself reverse the state being reported. For example,
  // "Correction: approval was cancelled" is still adverse and must not walk around a human veto as
  // though it restored the approval. An actual negation/undo remains restorative; otherwise the
  // asserted adverse state wins before the generic correction lane.
  if (restoration) return 'restorative'
  if (ADVERSE_STATE_RE.test(headline)) return 'adverse'
  if (correction) return 'restorative'

  const probeFamily = '__inbox_observation_kind__'
  return themeStoryKey({ ...row, dedup_group: probeFamily }) === probeFamily ? 'ordinary' : 'other'
}

/** Narrow positive proof that a headline explicitly revises/undoes an earlier claim. This is stricter
 * than the bounded-history classifier: a generic later adverse verb is not enough to bypass a human
 * veto when the prior state was unrecognized. */
export function isExplicitStoryRevision(row: StoryObservationView): boolean {
  const headline = headlineFor(row)
  return NEGATED_ADVERSE_RE.test(headline)
    || DENIES_ADVERSE_REPORT_RE.test(headline)
    || DENIES_ADVERSE_ACTION_RE.test(headline)
    || DENIES_ADVERSE_STATUS_RE.test(headline)
    || UNDONE_ADVERSE_RE.test(headline)
    || EXPLICIT_UNDO_RE.test(headline)
    || EXPLICIT_REPORT_REVISION_RE.test(headline)
    || RESUMPTION_RE.test(headline)
    || (RESTORE_STATE_RE.test(headline) && !RESTORE_CONFIDENCE_RE.test(headline))
}

/** A publisher can correct or retract an article in place at the same URL. URL-only identity would
 * overwrite that falsifying observation with the old headline before revision-aware story collapse can
 * see it. Keep URL idempotence within each canonical ordinary/correction/reversal lane instead. */
function inboxUrlRevisionKey(row: { url: string; headline?: unknown; headline_en?: unknown; event_types?: unknown }): string {
  // Revision identity is exact-content based, not dependent on a finite English status vocabulary.
  // Thus "confirms expansion" and a later "abandons expansion" survive as two bounded observations even
  // when neither phrase happens to be in the preservation regex. An exact replay remains idempotent.
  const headline = String(row.headline || row.headline_en || '')
  const lane = themeStoryObservationKey({
    event_id: eventIdFor(headline, row.url),
    dedup_group: '__url_revision__',
    headline: row.headline,
    headline_en: row.headline_en,
    event_types: row.event_types,
  })
  return `${row.url}\u0000${lane}`
}

/**
 * Collapse publisher copies, retain a bounded family audit, and apply maxRows family-first. Every chosen
 * family contributes its best §4 source before a second observation is admitted, so the global cap cannot
 * undo the source pin or let one status-heavy family starve unrelated evidence.
 */
function selectInboxRows(rows: InboxRow[], maxRows: number): InboxRow[] {
  const byGroup = new Map<string, InboxRow[]>()
  for (const r of rows) {
    const g = r.dedup_group?.trim() || `__inbox__:${r.inbox_id}`
    const arr = byGroup.get(g)
    if (arr) arr.push(r)
    else byGroup.set(g, [r])
  }
  const selections = [...byGroup.entries()].map(([key, members]) => {
    const representatives: InboxRow[] = []
    for (const member of [...members].sort(byQuality)) {
      const identity = {
        ...member,
        event_id: eventIdFor(member.headline || String(member.headline_en || ''), member.url),
      }
      if (representatives.some((prior) => sameThemeStoryObservation(identity, {
        ...prior,
        event_id: eventIdFor(prior.headline || String(prior.headline_en || ''), prior.url),
      }))) continue
      representatives.push(member)
    }
    const strongest = representatives.slice().sort(byQuality)[0]
    const newest = representatives.slice().sort(byRecency)[0]
    const newestAdverse = representatives.filter((row) => classifyStoryObservation(row) === 'adverse').sort(byRecency)[0]
    const newestRestorative = representatives.filter((row) => classifyStoryObservation(row) === 'restorative').sort(byRecency)[0]
    const selected = new Map<string, InboxRow>()
    for (const pinned of [strongest, newestAdverse, newestRestorative, newest]) {
      if (pinned) selected.set(pinned.inbox_id, pinned)
    }
    for (const row of representatives.slice().sort(byRecency)) {
      if (selected.size >= MAX_OBSERVATIONS_PER_STORY) break
      selected.set(row.inbox_id, row)
    }
    const priority = members.slice().sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1)
      || tierRank(b.source_tier) - tierRank(a.source_tier)
      || sourceTime(b) - sourceTime(a)
      || a.inbox_id.localeCompare(b.inbox_id))[0]
    return { key, priority, rows: [...selected.values()] }
  }).sort((a, b) => (b.priority.triage_score ?? -1) - (a.priority.triage_score ?? -1)
    || tierRank(b.priority.source_tier) - tierRank(a.priority.source_tier)
    || sourceTime(b.priority) - sourceTime(a.priority)
    || a.key.localeCompare(b.key))

  const cap = Math.max(0, Math.floor(maxRows))
  const chosen = selections.slice(0, cap)
  const kept: InboxRow[] = []
  for (let depth = 0; kept.length < cap; depth++) {
    let found = false
    for (const family of chosen) {
      const row = family.rows[depth]
      if (!row) continue
      kept.push(row)
      found = true
      if (kept.length >= cap) break
    }
    if (!found) break
  }
  return kept
}

/**
 * Merge pick/watch items into today's inbox file. Existing rows keep their consumed/launched state;
 * a re-seen URL in the same revision lane replaces the prior source observation and triage payload while
 * preserving only its inbox id and human lifecycle. A correction or reversal at that URL remains a
 * distinct observation. Returns the inbox row count plus immutable clocks for every incoming revision.
 */
export function mergeInbox(repoRoot: string, date: string, items: TriagedItem[], opts: MergeOptions = {}): MergeInboxResult {
  const maxRows = opts.maxRows && opts.maxRows > 0 ? Math.floor(opts.maxRows) : 40
  const now = opts.now || (() => new Date())
  // One clock for the whole atomic merge. It records when this exact revision first reached the local
  // inbox; unlike a publisher's `found_at`, it advances when an article is edited in place.
  const mergedAt = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const fp = inboxPath(repoRoot, date)
  let existing: SweepWithRevisionClocks = {}
  try { existing = JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { existing = {} }
  const durableActions = readInboxHumanActions(repoRoot)
  if (!durableActions.complete) {
    throw new Error('inbox human-action ledger is incomplete; refusing to rewrite the sweep projection')
  }
  const actionState = new Map<string, { consumed?: typeof durableActions.rows[number]; dismissed?: typeof durableActions.rows[number] }>()
  for (const action of durableActions.rows) {
    const observationId = eventIdFor(action.headline, action.url)
    const state = actionState.get(observationId) || {}
    if (action.action === 'consumed') state.consumed = action
    if (action.action === 'dismissed') state.dismissed = action
    actionState.set(observationId, state)
  }
  // The ledger is authoritative and the sweep is repairable UI state. Reapply durable actions before
  // ranking/capping so a successful ledger append followed by a failed projection rename cannot let the
  // next scanner pass evict the still-live-looking row and strand its later restore.
  for (const row of Array.isArray(existing.rows) ? existing.rows : []) {
    const state = actionState.get(eventIdFor(row.headline, row.url))
    if (!state) continue
    if (state.consumed) {
      row.consumed = true
      row.consumed_at ||= state.consumed.action_at
      row.launched_signal_id = state.consumed.launched_signal_id || row.launched_signal_id || null
      row.human_action_id = state.consumed.action_id
    }
    if (state.dismissed) {
      row.dismissed = true
      row.dismissed_at ||= state.dismissed.action_at
      row.human_action_id = state.dismissed.action_id
    }
  }
  const byUrlRevision = new Map<string, InboxRow>()
  for (const r of Array.isArray(existing.rows) ? existing.rows : []) if (r && r.url) byUrlRevision.set(inboxUrlRevisionKey(r), r)
  // Derived, rebuildable state — exactly like the post-sync reload below and the partition read in
  // syncRevisionPartition, both of which already catch. A corrupt current index is rebuilt from the
  // visible rows plus the durable registry and reinstalled by the final atomic write below. Left bare,
  // one bad entry in TODAY's revision_clocks array wedged the merge for ever, while a TOTALLY
  // unparseable sweep self-healed a few lines earlier — the strictly-worse-for-being-less-broken bug.
  let currentRevisionClocks: Map<string, RevisionClockRecord>
  try {
    currentRevisionClocks = revisionRecordsFromDocument(existing, path.basename(fp))
      || new Map<string, RevisionClockRecord>()
  } catch { currentRevisionClocks = new Map<string, RevisionClockRecord>() }
  // Manual sweep rows are not firehose items, but the command preserves this wrapper index. Union every
  // visible valid row before selection so a later auto-ingest cap cannot erase its first observation.
  for (const row of byUrlRevision.values()) {
    const record = revisionRecord(row)
    if (record && !currentRevisionClocks.has(record.revision_key)) currentRevisionClocks.set(record.revision_key, record)
  }
  const priorRead = readPriorInboxRevisions(
    repoRoot,
    date,
    new Set(items.map((item) => inboxUrlRevisionKey(item))),
    opts.archiveDir || '',
    opts.stateDir,
  )
  const priorRevisions = priorRead.clocks
  const withheldEventIds = new Set<string>()
  // todayBlocked: a partial write could repair TODAY's partition and falsely complete coverage, so
  // degrade at BATCH granularity there — write nothing, exactly as the old throw did, minus the throw.
  // Otherwise degrade per ITEM: nothing about one unprovable key makes its batch-mates unsafe.
  const holdWholeBatch = priorRead.todayBlocked && priorRead.unproven.size > 0
  const merging = holdWholeBatch ? [] : items.filter((it) => {
    if (!priorRead.unproven.has(inboxUrlRevisionKey(it))) return true
    withheldEventIds.add(it.event_id)
    return false
  })
  if (holdWholeBatch) for (const it of items) withheldEventIds.add(it.event_id)
  if (!merging.length && withheldEventIds.size) {
    // Durable state is byte-for-byte what the throw left behind: no sweep is rewritten, so no fabricated
    // clock and no partial partition can later be mistaken for proof. What survives now is everything
    // DOWNSTREAM — the wire, the firehose audit line, the day's counters, the backlog cleanup.
    return {
      rowCount: Array.isArray(existing.rows) ? existing.rows.length : 0,
      revisionClocksByEvent: new Map(),
      withheldEventIds,
    }
  }
  // A fresh registry may migrate today's legacy sweep from its uncapped firehose while resolving prior
  // clocks. Reload that post-sync index before composing the final wrapper: otherwise this function's
  // pre-migration `existing` snapshot would immediately overwrite the migrated capped-out revisions.
  try {
    const synced = JSON.parse(fs.readFileSync(fp, 'utf8')) as SweepWithRevisionClocks
    const syncedRevisionClocks = revisionRecordsFromDocument(synced, path.basename(fp))
    for (const [revisionKey, record] of syncedRevisionClocks || []) {
      currentRevisionClocks.set(revisionKey, record)
    }
  } catch { /* an absent/corrupt current sweep is repaired by the final atomic write below */ }

  const dateCompact = date.replace(/-/g, '')
  let seq = nextInboxSeq(existing.rows || [])

  for (const it of merging) {
    const urlRevisionKey = inboxUrlRevisionKey(it)
    const eventId = eventIdFor(it.headline, it.url)
    const prior = byUrlRevision.get(urlRevisionKey)
    const olderPrior = priorRevisions.get(urlRevisionKey)
    // A daily index created while an older partition was temporarily unavailable is repairable cache,
    // not authority over the first durable observation. The oldest prior partition wins globally.
    const immutablePrior = olderPrior || currentRevisionClocks.get(urlRevisionKey) || prior
    const sourceFields = {
      headline: it.headline,
      headline_en: it.headline_en, // latest translated content, not the first copy seen at this URL
      headline_lang: it.headline_lang,
      url: it.url,
      source_name: it.source_name,
      input_nature: it.input_nature,
      found_at: it.found_at,
    }
    const triageFields = {
      triage_score: it.triage_score,
      triage_reason: it.triage_reason,
      region: it.region,
      relevance: it.relevance,
      materiality_pre_score: it.materiality_pre_score,
      event_types: it.event_types,
      issuer_linkage: it.issuer_linkage,
      companies: it.companies,
      size_bucket: it.size_bucket,
      scope: deriveScope(it),
      source_tier: deriveSourceTier(it),
      event_materiality_label: it.event_materiality_label,
      event_direction: it.event_direction,
      event_scope: it.event_scope,
      // Trade timing must come from the source row, never from the later model-authored `why_now`.
      // Category-only schedule tags are useful UI facets but are not dated catalyst evidence.
      scheduled_events: deriveScheduledEventEvidence({ headline: it.headline }),
      rank_factors: it.rank_factors, // composite-priority breakdown; triage_score IS the composite
      prelim_note: it.triage_reason, // keep the legacy field populated for any reader that uses it
      dedup_status: it.dedup_status,
      dedup_group: it.dedup_group, // story-cluster id — collapse duplicate stories below
    }
    if (prior) {
      // A publisher may rewrite the correction text in place. Retaining the old source fields would pair
      // a new score with stale evidence. Rebuild the owned row from the newest observation, carrying only
      // stable identity and explicit human state across the refresh.
      byUrlRevision.set(urlRevisionKey, {
        ...sourceFields,
        // Exact content is the same evidence observation, so neither its first source time nor local
        // first-seen clock may move on a re-fetch. Advancing either would launder freshness or make an old
        // revision look newer than a later human action. Distinct content gets a distinct lane below.
        ...(typeof immutablePrior?.found_at === 'string' ? { found_at: immutablePrior.found_at } : {}),
        ...triageFields,
        inbox_id: prior.inbox_id,
        consumed: prior.consumed === true,
        launched_signal_id: prior.launched_signal_id ?? null,
        ...(typeof immutablePrior?.observed_at === 'string'
          ? { observed_at: immutablePrior.observed_at }
          : {}),
        // Do not backfill language proof onto an already-stored legacy observation during an exact
        // refresh; that could newly authorize a post-veto exception for evidence whose language was
        // never established when the person acted.
        ...(immutablePrior?.source_is_english === true ? { source_is_english: true as const } : {}),
        ...(typeof prior.consumed_at === 'string' ? { consumed_at: prior.consumed_at } : {}),
        ...(typeof prior.human_action_id === 'string' ? { human_action_id: prior.human_action_id } : {}),
        ...(typeof prior.dismissed === 'boolean' ? { dismissed: prior.dismissed } : {}),
        ...(typeof prior.dismissed_at === 'string' ? { dismissed_at: prior.dismissed_at } : {}),
        ...(typeof prior.dismissed_by === 'string' ? { dismissed_by: prior.dismissed_by } : {}),
      })
    } else {
      byUrlRevision.set(urlRevisionKey, {
        inbox_id: `INB-${dateCompact}-${String(seq++).padStart(3, '0')}`,
        ...sourceFields,
        ...(typeof immutablePrior?.found_at === 'string' ? { found_at: immutablePrior.found_at } : {}),
        ...(immutablePrior
          ? (typeof immutablePrior.observed_at === 'string' ? { observed_at: immutablePrior.observed_at } : {})
          : { observed_at: mergedAt }),
        ...((immutablePrior ? immutablePrior.source_is_english : it.source_is_english) === true
          ? { source_is_english: true as const } : {}),
        consumed: false,
        launched_signal_id: null,
        ...triageFields,
      })
    }
    if (olderPrior || !currentRevisionClocks.has(urlRevisionKey)) {
      const record = revisionRecord(byUrlRevision.get(urlRevisionKey)!)
      if (!record) {
        // One unrepresentable row leaves THIS merge, never the batch. Restore the projection to exactly
        // what it was before this item was considered.
        if (prior) byUrlRevision.set(urlRevisionKey, prior); else byUrlRevision.delete(urlRevisionKey)
        withheldEventIds.add(eventId)
        continue
      }
      // Replace a later current-day clock only when an older durable partition repaired it. Otherwise
      // first-wins insertion keeps the current partition immutable.
      currentRevisionClocks.set(urlRevisionKey, record)
    }
  }

  // Reconcile every incoming kept-band revision before the UI selection cap. Feed and Theme persistence
  // must not fall back to a refreshed provider clock merely because this row ranked below today's inbox.
  const revisionClocksByEvent = new Map<string, InboxRevisionClocks>()
  for (const item of merging) {
    const row = byUrlRevision.get(inboxUrlRevisionKey(item))
    if (!row) continue
    // `normalizeAndFilter` computes event_id before applying its 500-character storage cap. Keep that
    // canonical incoming identity so downstream feed/Theme lookup cannot miss a long-title revision.
    revisionClocksByEvent.set(item.event_id, {
      foundAt: row.found_at,
      ...(typeof row.observed_at === 'string' ? { observedAt: row.observed_at } : {}),
      sourceIsEnglish: row.source_is_english === true,
    })
  }

  // rank by score; always keep consumed AND dismissed rows (human state is history — never evicted,
  // never resurrected by a re-seen URL), cap only the live unconsumed tail
  const all = [...byUrlRevision.values()]
  all.sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
  const humanState = all.filter((r) => r.consumed || r.dismissed || r.launched_signal_id)
  // collapse duplicate STORIES before the cap, so one story never eats several inbox slots and the cap
  // counts distinct stories (news/dedup.ts). Ungrouped rows and run-touched groups pass through intact.
  const live = selectInboxRows(all.filter((r) => !r.consumed && !r.dismissed && !r.launched_signal_id), maxRows)
  const rows = [...humanState, ...live].sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))

  // preserve whatever the existing document carried (a manual sweep's focus_hint, its source label,
  // any future fields) — this merge only owns `rows` and the freshness stamps
  const doc = {
    ...existing,
    date,
    updated_at: mergedAt,
    focus_hint: (existing as any).focus_hint ?? null,
    source: (existing as any).source || 'auto_ingester',
    revision_clock_version: 1,
    revision_clocks: [...currentRevisionClocks.values()],
    rows,
  }
  // atomic tmp+rename: this file is the ground truth for human state (consumed/dismissed) and is
  // read by the CLI sweep and the python board builder — neither may ever see a half-written file
  const registryWrite = prepareRevisionPartitionWrite(
    repoRoot, date, opts.archiveDir || '', currentRevisionClocks.values(), opts.stateDir,
  )
  try {
    writeSweepDocumentAtomic(fp, doc)
    registryWrite.commit()
  } catch (error) {
    registryWrite.rollback()
    throw error
  }
  return { rowCount: rows.length, revisionClocksByEvent, withheldEventIds }
}

export function appendFirehoseSummary(repoRoot: string, date: string, summary: CycleSummary): void {
  const fp = firehosePath(repoRoot, date)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.appendFileSync(fp, JSON.stringify({ kind: 'cycle_summary', ...summary }) + '\n')
  } catch {
    // a missed firehose line only loses a board counter for the cycle — never fail ingestion for it
  }
}

const execFileAsync = promisify(execFile)

/**
 * Rebuild the board index using the existing python script. Best-effort by default (logs but never
 * throws) — every auto-poll / best-effort caller relies on that so a rebuild hiccup never breaks the
 * click it rode in on. Pass `throwOnFailure: true` for a caller that must know the rebuild actually
 * happened (e.g. the manual "rebuild from ledger" endpoint) — it rethrows instead of swallowing, so the
 * caller can surface a real failure instead of quietly returning the stale, pre-rebuild index.
 */
// async execFile (never execFileSync — a multi-second rebuild must not block the event loop; see
// readiness.ts). Concurrent rebuilds are safe: the python script writes per-PID tmp + rename, and
// each rebuild is deterministic from the stores, so last-rename-wins converges to the truth.
export async function refreshBoard(repoRoot: string, log: (m: string) => void = () => {}, opts: { throwOnFailure?: boolean } = {}): Promise<void> {
  try {
    await execFileAsync('python3', [path.join(repoRoot, 'scripts', 'update_board_index.py')], { cwd: repoRoot, timeout: 60_000, maxBuffer: 8_000_000 })
  } catch (e: any) {
    log(`board refresh failed: ${e?.message || e}`)
    if (opts.throwOnFailure) throw e
  }
}
