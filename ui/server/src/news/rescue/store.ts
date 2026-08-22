// Restart-safe state for the second-look shadow lane. Candidate observations stay in a rolling 36-hour
// queue; each paced identity check is reserved atomically before network I/O and copied to a bounded
// monthly audit log after completion. Any unreadable/write-failed authority closes admission.

import fs from 'node:fs'
import path from 'node:path'
import { countryFromExchange } from '../equity-quote'
import { coreCompanyName, directoryTickerIdentityKey } from '../symbology'
import type { FeedItem } from '../types'
import type { RescueCandidate, RescuePool, RescueRankInputs } from './selector'

const ROOT = 'news-rescue'
// The durable feed accepts 40,000 rows per UTC day. A 36-hour clock window can intersect late day 1,
// all of day 2, and early day 3, so bursty valid traffic can contain 120,000 rows rather than the
// uniform-rate 60,000. Three 80 MiB daily file ceilings bound the same worst-case byte window.
export const RESCUE_QUEUE_MAX_ITEMS = 120_000
export const RESCUE_QUEUE_MAX_BYTES = 256 * 1024 * 1024
const DAILY_MAX_ITEMS = 240 // hard parser bound; configured admission remains <=200
const DAILY_MAX_BYTES = 2 * 1024 * 1024
const AUDIT_LINE_MAX_BYTES = 2 * 1024
export const RESCUE_QUEUE_WRITE_ERROR = 'The app could not save the second-look queue.'
export const RESCUE_QUEUE_PENDING_WRITE_ERROR = 'The app could not retain rows omitted from the second-look queue.'
export const RESCUE_RESERVATION_WRITE_ERROR = 'The app could not reserve a second-look check.'
export const RESCUE_QUEUE_OVERFLOW_ERROR = 'The saved second-look queue reached its safety limit.'
export const RESCUE_MODE_WRITE_ERROR = 'The app could not save second-look coverage mode.'

export type RescueIdentityStatus = 'verified' | 'identity_unresolved' | 'directory_unavailable'
export type RescueReviewReasonCode =
  | 'identity_verified_shadow'
  | 'could_not_match_listed_stock'
  | 'listing_lookup_temporarily_unavailable'

export const RESCUE_REVIEW_REASON_LABELS: Record<RescueReviewReasonCode, string> = {
  identity_verified_shadow: 'Company matched to a listed stock. Shadow mode stopped before reading the article.',
  could_not_match_listed_stock: 'Could not match the company to a listed stock.',
  listing_lookup_temporarily_unavailable: 'Stock-listing lookup temporarily unavailable.',
}

export interface RescueQueueSnapshot {
  available: boolean
  items: FeedItem[]
  updated_at: string | null
  coverage_started_at: string | null
  /** Exact active firehose file sizes after the queue last committed. Summary lines are included. */
  feed_checkpoint: RescueFeedCheckpoint | null
  /** Queue and staged batch agree before applying the process-local failure witness. */
  durable_committed: boolean
  /** False while a staged replacement or overflow omission has not been safely retired. */
  committed: boolean
  incomplete_since: string | null
  error?: 'unreadable' | 'write_failed' | 'overflow'
}

export interface RescueCheckRecord {
  key: string
  event_id: string
  story_key: string
  identity_key: string
  attempt: number
  pool: RescuePool
  reserved_at: string
  completed_at?: string
  identity_status?: RescueIdentityStatus
  reason_code?: RescueReviewReasonCode
  ticker?: string | null
  company_name: string
  exchange?: string | null
  source?: 'yahoo_symbol_directory'
  rank_inputs: RescueRankInputs
  selector_version: string
  audit_pending?: boolean
  /** Exact byte where this row must start in the append-only monthly audit. */
  audit_offset?: number
}

export interface RescueDayLedger {
  v: 1
  date: string
  checks: RescueCheckRecord[]
}

export interface RescueRuntimeHealth {
  v: 1
  updated_at: string
  audit_healthy: boolean
  audit_error: string | null
  consecutive_directory_failures: number
  directory_pause_until: string | null
  last_directory_status: RescueIdentityStatus | null
  normal_ideas_ready: boolean
  normal_ideas_reason: string | null
  /** Latest instant at which a batch was omitted. It advances on every overflow. */
  queue_overflow_at: string | null
}

const stateRoot = (stateDir: string): string => path.join(stateDir, ROOT)
const queueFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'queue.json')
const queuePendingFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'queue-pending.json')
const modeFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'mode.json')
const healthFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'health.json')
const dayFile = (stateDir: string, date: string): string => path.join(stateRoot(stateDir), 'days', `${date}.json`)
const auditFile = (stateDir: string, month: string): string => path.join(stateRoot(stateDir), 'ledger', `${month}.ndjson`)

// A feed row is already durable before it is copied into this bounded queue. If both the pending-batch
// write and its health write fail, disk has no rescue-side witness for that same cycle. Keep a process-local
// witness long enough to close admission; the repair path then starts a new full coverage window before
// clearing it. Key by resolved state directory so tests and multiple configured engines remain isolated.
const runtimeQueueFailures = new Map<string, number>()
const runtimeQueueKey = (stateDir: string): string => path.resolve(stateDir)
function noteRuntimeQueueFailure(stateDir: string, now: number): void {
  runtimeQueueFailures.set(runtimeQueueKey(stateDir), now)
}
export function rescueRuntimeQueueFailureAt(stateDir: string): number | null {
  return runtimeQueueFailures.get(runtimeQueueKey(stateDir)) ?? null
}

export type RescueFeedCheckpoint = Record<string, number>
export interface RescueFeedCheckpointSnapshot {
  available: boolean
  checkpoint: RescueFeedCheckpoint
}

function rescueCheckpointDates(now: number, maxAgeHrs: number): string[] {
  const count = Math.max(1, Math.ceil(Math.max(1, maxAgeHrs) / 24) + 1)
  const day = new Date(now).toISOString().slice(0, 10)
  const midnight = Date.parse(`${day}T00:00:00Z`)
  return Array.from({ length: count }, (_, daysAgo) =>
    new Date(midnight - daysAgo * 24 * 3_600_000).toISOString().slice(0, 10))
}

/** Cheap restart proof: stat only the at-most-three local firehose files that can overlap the queue. */
export function captureRescueFeedCheckpoint(
  repoRoot: string,
  now = Date.now(),
  maxAgeHrs = 36,
): RescueFeedCheckpointSnapshot {
  const checkpoint: RescueFeedCheckpoint = {}
  try {
    for (const date of rescueCheckpointDates(now, maxAgeHrs)) {
      const file = path.join(repoRoot, 'screener', 'inbox', `${date}_firehose.ndjson`)
      try {
        const stat = fs.statSync(file)
        if (!stat.isFile() || !Number.isSafeInteger(stat.size) || stat.size < 0) throw new Error('feed checkpoint')
        checkpoint[date] = stat.size
      } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') checkpoint[date] = 0
        else throw error
      }
    }
    return { available: true, checkpoint }
  } catch {
    return { available: false, checkpoint: {} }
  }
}

function isRescueFeedCheckpoint(value: unknown): value is RescueFeedCheckpoint {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const entries = Object.entries(value as Record<string, unknown>)
  return entries.length > 0 && entries.length <= 4 && entries.every(([date, bytes]) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isSafeInteger(bytes) && Number(bytes) >= 0)
}

export function rescueFeedCheckpointMatches(
  saved: RescueFeedCheckpoint | null,
  current: RescueFeedCheckpoint,
): boolean {
  if (!saved) return false
  return Object.entries(current).every(([date, bytes]) => (saved[date] ?? 0) === bytes)
}

export function readRescueMode(stateDir: string): { available: boolean; mode: 'off' | 'shadow' | null } {
  const file = modeFile(stateDir)
  if (!fs.existsSync(file)) return { available: true, mode: null }
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size < 2 || stat.size > 1024) throw new Error('mode size')
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw?.v !== 1 || (raw.mode !== 'off' && raw.mode !== 'shadow')
      || typeof raw.updated_at !== 'string' || !Number.isFinite(Date.parse(raw.updated_at))) throw new Error('mode shape')
    return { available: true, mode: raw.mode }
  } catch {
    return { available: false, mode: null }
  }
}

/** Small ingest-boundary marker. Off mode writes this only; it never rewrites the candidate queue. */
export function recordRescueMode(stateDir: string, mode: 'off' | 'shadow', now = Date.now()): boolean {
  return atomicWriteJson(stateDir, modeFile(stateDir), {
    v: 1, mode, updated_at: new Date(now).toISOString(),
  }, 1024)
}

function directorySyncUnsupported(error: unknown): boolean {
  const code = String((error as NodeJS.ErrnoException)?.code || '')
  return ['EINVAL', 'ENOTSUP', 'EOPNOTSUPP', 'ENOSYS'].includes(code)
}

function syncDirectory(dir: string): void {
  try {
    const fd = fs.openSync(dir, 'r')
    try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
  } catch (error) {
    // Some filesystems do not implement directory fsync. Ignore only that explicit platform
    // limitation; EIO and other real durability failures must close second-look admission.
    if (!directorySyncUnsupported(error)) throw error
  }
}

function atomicWriteJson(stateDir: string, file: string, value: unknown, maxBytes: number): boolean {
  let body: string
  try { body = `${JSON.stringify(value)}\n` } catch { return false }
  if (Buffer.byteLength(body, 'utf8') > maxBytes) return false
  const boundary = path.resolve(stateDir)
  const dir = path.resolve(path.dirname(file))
  const relative = path.relative(boundary, dir)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return false
  const boundaryExisted = fs.existsSync(boundary)
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`
  let fd: number | undefined
  try {
    fs.mkdirSync(dir, { recursive: true })
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, body)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(temp, file)
    // Prove every directory entry created by the recursive mkdir, not just the file's immediate
    // parent. On a first deployment this includes stateDir/news-rescue in stateDir itself.
    let current = dir
    for (;;) {
      syncDirectory(current)
      if (current === boundary) break
      current = path.dirname(current)
    }
    if (!boundaryExisted) syncDirectory(path.dirname(boundary))
    return true
  } catch {
    return false
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* no-op */ }
    try { fs.unlinkSync(temp) } catch { /* rename or absent */ }
  }
}

function compactFeedItem(item: FeedItem): FeedItem {
  return {
    kind: 'item', ts: item.ts, ...(item.found_at ? { found_at: item.found_at } : {}),
    event_id: item.event_id, headline: item.headline, ...(item.headline_en ? { headline_en: item.headline_en } : {}),
    url: item.url, domain: item.domain, source_name: item.source_name, via: item.via,
    region: item.region, input_nature: item.input_nature, triage_score: item.triage_score, band: item.band,
    triage_reason: item.triage_reason, relevance: item.relevance, event_types: item.event_types || [],
    issuer_linkage: item.issuer_linkage, companies: item.companies || [], size_bucket: item.size_bucket,
    ...(item.source_tier ? { source_tier: item.source_tier } : {}),
    ...(item.rank_factors ? { rank_factors: item.rank_factors } : {}),
    dedup_status: item.dedup_status, ...(item.dedup_group ? { dedup_group: item.dedup_group } : {}),
    inboxed: item.inboxed, ...(item.caution ? { caution: true } : {}),
    ...(item.decision_rule_version ? { decision_rule_version: item.decision_rule_version } : {}),
    ...(item.decision_kept !== undefined ? { decision_kept: item.decision_kept } : {}),
    ...(item.decision_reason_codes ? { decision_reason_codes: item.decision_reason_codes } : {}),
    ...(item.original_triage_score !== undefined ? { original_triage_score: item.original_triage_score } : {}),
    ...(item.decision_rank_inputs ? { decision_rank_inputs: item.decision_rank_inputs } : {}),
  }
}

function queueRelevant(item: FeedItem): boolean {
  // Keep the whole newly scored funnel for the rolling window. The selector still admits only its
  // narrow 10-39 candidates, while the terminal rows make live reconciliation honest instead of
  // showing every excluded category as zero. compactFeedItem keeps this bounded local copy small.
  return item.kind === 'item' && typeof item.event_id === 'string' && item.event_id.length > 0
    && typeof item.decision_rule_version === 'string' && item.decision_rule_version.length > 0
}

function isRescueQueueItem(item: unknown): item is FeedItem {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  const row = item as Record<string, unknown>
  if (row.kind !== 'item' || typeof row.event_id !== 'string' || !row.event_id) return false
  if (typeof row.headline !== 'string' || typeof row.url !== 'string') return false
  if (typeof row.ts !== 'string' || typeof row.inboxed !== 'boolean') return false
  if (typeof row.triage_score !== 'number' || !Number.isFinite(row.triage_score)) return false
  if (!Array.isArray(row.event_types) || !row.event_types.every((value) => typeof value === 'string')) return false
  if (!Array.isArray(row.companies) || !row.companies.every((company) => {
    if (!company || typeof company !== 'object' || Array.isArray(company)) return false
    const value = company as Record<string, unknown>
    return (value.name == null || typeof value.name === 'string')
      && (value.ticker == null || typeof value.ticker === 'string')
      && (value.listing_country == null || typeof value.listing_country === 'string')
  })) return false
  if (row.rank_factors != null && (typeof row.rank_factors !== 'object' || Array.isArray(row.rank_factors))) return false
  if (row.decision_reason_codes != null
    && (!Array.isArray(row.decision_reason_codes) || !row.decision_reason_codes.every((value) => typeof value === 'string'))) return false
  return typeof row.decision_rule_version === 'string' && row.decision_rule_version.length > 0
}

function isRescueRankInputs(value: unknown): value is RescueRankInputs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const rank = value as Record<string, unknown>
  return ['strong_signal_count', 'event_priority', 'source_rank', 'independent_reports', 'original_score']
    .every((key) => typeof rank[key] === 'number' && Number.isFinite(rank[key]))
    && typeof rank.quantified === 'boolean'
    && typeof rank.specific_date === 'boolean'
    && typeof rank.found_at === 'string'
    && typeof rank.ticker_present === 'boolean'
}

function isRescueCheckRecord(value: unknown): value is RescueCheckRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const check = value as Record<string, unknown>
  if (typeof check.key !== 'string' || !check.key || typeof check.event_id !== 'string' || !check.event_id) return false
  if (typeof check.story_key !== 'string' || !check.story_key) return false
  if (typeof check.identity_key !== 'string' || !check.identity_key || !Number.isInteger(check.attempt) || Number(check.attempt) < 1) return false
  if (check.pool !== 'ticker' && check.pool !== 'name') return false
  if (typeof check.reserved_at !== 'string' || !Number.isFinite(Date.parse(check.reserved_at))
    || typeof check.company_name !== 'string' || !check.company_name) return false
  if (typeof check.selector_version !== 'string' || !check.selector_version || !isRescueRankInputs(check.rank_inputs)) return false
  if (check.ticker != null && (typeof check.ticker !== 'string' || !check.ticker.trim())) return false
  if (check.exchange != null && typeof check.exchange !== 'string') return false
  if (check.source != null && check.source !== 'yahoo_symbol_directory') return false

  const status = check.identity_status
  if (status == null) {
    return check.completed_at == null && check.reason_code == null && check.exchange == null
      && check.source == null && check.audit_pending == null && check.audit_offset == null
  }
  if (!['verified', 'identity_unresolved', 'directory_unavailable'].includes(String(status))) return false
  if (typeof check.completed_at !== 'string' || !Number.isFinite(Date.parse(check.completed_at))) return false
  if (typeof check.audit_pending !== 'boolean'
    || !Number.isSafeInteger(check.audit_offset) || Number(check.audit_offset) < 0) return false
  const expectedReason: Record<RescueIdentityStatus, RescueReviewReasonCode> = {
    verified: 'identity_verified_shadow',
    identity_unresolved: 'could_not_match_listed_stock',
    directory_unavailable: 'listing_lookup_temporarily_unavailable',
  }
  if (check.reason_code !== expectedReason[status as RescueIdentityStatus]) return false
  if (status === 'verified') {
    return typeof check.ticker === 'string' && !!check.ticker.trim()
      && typeof check.exchange === 'string' && !!check.exchange.trim()
      && check.source === 'yahoo_symbol_directory'
  }
  return check.exchange == null && check.source == null
}

/** An explicit off value prevents scored rows from entering the rescue queue. The ingest boundary saves
 * a separate tiny mode marker; disabled Ideas ticks never rewrite this potentially large queue. */
export function rescueQueueEnabled(mode: unknown): boolean {
  return mode === 'shadow'
}

function loadQueueSnapshot(file: string): RescueQueueSnapshot {
  const empty = (): RescueQueueSnapshot => ({
    available: true, items: [], updated_at: null, coverage_started_at: null,
    feed_checkpoint: null, durable_committed: true, committed: true, incomplete_since: null,
  })
  if (!fs.existsSync(file)) return empty()
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size < 2 || stat.size > RESCUE_QUEUE_MAX_BYTES) throw new Error('queue size')
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw?.v !== 1 || !Array.isArray(raw.items) || raw.items.length > RESCUE_QUEUE_MAX_ITEMS) throw new Error('queue shape')
    if (!raw.items.every(isRescueQueueItem)) throw new Error('queue item shape')
    if (raw.coverage_started_at != null
      && (typeof raw.coverage_started_at !== 'string' || !Number.isFinite(Date.parse(raw.coverage_started_at)))) {
      throw new Error('queue coverage clock')
    }
    if (raw.incomplete_since != null
      && (typeof raw.incomplete_since !== 'string' || !Number.isFinite(Date.parse(raw.incomplete_since)))) {
      throw new Error('queue incomplete clock')
    }
    if (raw.feed_checkpoint != null && !isRescueFeedCheckpoint(raw.feed_checkpoint)) throw new Error('queue feed checkpoint')
    const updatedAt = typeof raw.updated_at === 'string' && Number.isFinite(Date.parse(raw.updated_at))
      ? raw.updated_at
      : null
    const coverageStartedAt = typeof raw.coverage_started_at === 'string'
      && Number.isFinite(Date.parse(raw.coverage_started_at)) ? raw.coverage_started_at : null
    const incompleteSince = typeof raw.incomplete_since === 'string'
      && Number.isFinite(Date.parse(raw.incomplete_since)) ? raw.incomplete_since : null
    return {
      available: true,
      items: raw.items,
      updated_at: updatedAt,
      coverage_started_at: coverageStartedAt,
      feed_checkpoint: isRescueFeedCheckpoint(raw.feed_checkpoint) ? raw.feed_checkpoint : null,
      durable_committed: !incompleteSince,
      committed: !incompleteSince,
      incomplete_since: incompleteSince,
    }
  } catch {
    return { ...empty(), available: false, committed: false, error: 'unreadable' }
  }
}

export function loadRescueQueue(stateDir: string): RescueQueueSnapshot {
  const main = loadQueueSnapshot(queueFile(stateDir))
  const pending = loadQueueSnapshot(queuePendingFile(stateDir))
  if (!main.available || !pending.available) return {
    available: false, items: [], updated_at: null, coverage_started_at: null,
    feed_checkpoint: pending.feed_checkpoint || main.feed_checkpoint,
    durable_committed: false, committed: false, incomplete_since: pending.incomplete_since, error: 'unreadable',
  }
  const byId = new Map(main.items.map((item) => [item.event_id, item]))
  let pendingCommitted = !pending.incomplete_since
  for (const item of pending.items) {
    const saved = byId.get(item.event_id)
    if (!saved || JSON.stringify(saved) !== JSON.stringify(item)) pendingCommitted = false
    byId.set(item.event_id, item)
  }
  const items = [...byId.values()]
  if (items.length > RESCUE_QUEUE_MAX_ITEMS) return {
    available: false, items: [], updated_at: null, coverage_started_at: null,
    feed_checkpoint: pending.feed_checkpoint || main.feed_checkpoint,
    durable_committed: false, committed: false, incomplete_since: pending.incomplete_since, error: 'overflow',
  }
  const times = [main.updated_at, pending.updated_at].filter((value): value is string => !!value)
  const starts = [main.coverage_started_at, pending.coverage_started_at]
    .filter((value): value is string => !!value)
  const runtimeFailureAt = rescueRuntimeQueueFailureAt(stateDir)
  return {
    available: true,
    items,
    updated_at: times.sort().at(-1) || null,
    coverage_started_at: starts.sort()[0] || null,
    feed_checkpoint: pending.feed_checkpoint || main.feed_checkpoint,
    durable_committed: pendingCommitted,
    committed: pendingCommitted && runtimeFailureAt == null,
    incomplete_since: runtimeFailureAt == null
      ? pending.incomplete_since
      : new Date(Math.max(runtimeFailureAt, Date.parse(pending.incomplete_since || '') || 0)).toISOString(),
  }
}

export function recordRescueRows(
  stateDir: string,
  rows: readonly FeedItem[],
  now = Date.now(),
  maxAgeHrs = 36,
  continuity?: { before: RescueFeedCheckpoint; after: RescueFeedCheckpoint },
): boolean {
  const prior = loadQueueSnapshot(queueFile(stateDir))
  const pending = loadQueueSnapshot(queuePendingFile(stateDir))
  if (!prior.available || !pending.available) {
    noteRuntimeQueueFailure(stateDir, now)
    updateRescueHealth(stateDir, { audit_healthy: false, audit_error: 'The saved second-look queue cannot be read.' }, now)
    return false
  }
  const minTime = now - Math.max(1, maxAgeHrs) * 3_600_000
  const runtimeFailureAt = rescueRuntimeQueueFailureAt(stateDir)
  const mode = readRescueMode(stateDir)
  const savedFeedCheckpoint = pending.feed_checkpoint || prior.feed_checkpoint
  const continuityBroken = continuity ? !rescueFeedCheckpointMatches(savedFeedCheckpoint, continuity.before) : false
  const coverageStartedAt = !mode.available || mode.mode !== 'shadow' || runtimeFailureAt != null || continuityBroken
    ? new Date(now).toISOString()
    : prior.coverage_started_at || pending.coverage_started_at || new Date(now).toISOString()
  const nextFeedCheckpoint = continuity?.after || savedFeedCheckpoint
  const markOverflow = (pendingItems: readonly FeedItem[]): void => {
    const incompleteSince = new Date(now).toISOString()
    noteRuntimeQueueFailure(stateDir, now)
    // The small staged marker is a second fail-closed authority when the health-file write itself fails.
    // Existing pending rows remain recoverable; newly omitted overflow rows retire by this latest clock.
    atomicWriteJson(stateDir, queuePendingFile(stateDir), {
      v: 1,
      updated_at: incompleteSince,
      coverage_started_at: coverageStartedAt,
      ...(nextFeedCheckpoint ? { feed_checkpoint: nextFeedCheckpoint } : {}),
      incomplete_since: incompleteSince,
      items: pendingItems,
    }, RESCUE_QUEUE_MAX_BYTES)
    updateRescueHealth(stateDir, {
      audit_healthy: false,
      audit_error: RESCUE_QUEUE_OVERFLOW_ERROR,
      queue_overflow_at: incompleteSince,
    }, now)
  }
  const retainedById = new Map<string, FeedItem>()
  // Never age an uncommitted batch out before it reaches the main queue. Once committed, the selector
  // can truthfully classify an old row outside the active window and the next ordinary write may prune it.
  for (const item of pending.items) {
    if (queueRelevant(item)) retainedById.set(item.event_id, compactFeedItem(item))
  }
  for (const item of rows) {
    if (!queueRelevant(item)) continue
    const found = Date.parse(String(item.found_at || item.ts || ''))
    if (!Number.isFinite(found) || found < minTime || found > now + 5 * 60_000) continue
    retainedById.set(item.event_id, compactFeedItem(item))
  }
  const retained = [...retainedById.values()]
    .sort((left, right) => String(left.found_at || left.ts).localeCompare(String(right.found_at || right.ts)))
  if (retained.length > RESCUE_QUEUE_MAX_ITEMS) {
    markOverflow(pending.items)
    return false
  }
  // Stage every not-yet-committed row before replacing the main queue. If the queue replacement fails,
  // the next call must merge this exact batch rather than silently clearing the error with later rows.
  if (retained.length && !atomicWriteJson(stateDir, queuePendingFile(stateDir), {
    v: 1,
    updated_at: new Date(now).toISOString(),
    coverage_started_at: coverageStartedAt,
    ...(nextFeedCheckpoint ? { feed_checkpoint: nextFeedCheckpoint } : {}),
    ...(pending.incomplete_since ? { incomplete_since: pending.incomplete_since } : {}),
    items: retained,
  }, RESCUE_QUEUE_MAX_BYTES)) {
    noteRuntimeQueueFailure(stateDir, now)
    const health = readRescueHealth(stateDir)
    if (health.audit_error !== RESCUE_QUEUE_OVERFLOW_ERROR) {
      updateRescueHealth(stateDir, { audit_healthy: false, audit_error: RESCUE_QUEUE_PENDING_WRITE_ERROR }, now)
    }
    return false
  }
  const byId = new Map<string, FeedItem>()
  for (const item of [...prior.items, ...retained]) {
    if (!queueRelevant(item)) continue
    const found = Date.parse(String(item.found_at || item.ts || ''))
    if (!Number.isFinite(found) || found < minTime || found > now + 5 * 60_000) continue
    byId.set(item.event_id, compactFeedItem(item))
  }
  const items = [...byId.values()].sort((left, right) => String(left.found_at || left.ts).localeCompare(String(right.found_at || right.ts)))
  if (items.length > RESCUE_QUEUE_MAX_ITEMS) {
    markOverflow(retained)
    return false
  }
  const ok = atomicWriteJson(stateDir, queueFile(stateDir), {
    v: 1, updated_at: new Date(now).toISOString(), coverage_started_at: coverageStartedAt,
    ...(nextFeedCheckpoint ? { feed_checkpoint: nextFeedCheckpoint } : {}), items,
  }, RESCUE_QUEUE_MAX_BYTES)
  // A healthy queue write cannot clear an unrelated day-ledger/monthly-audit failure. Those failures
  // stay closed until their own authority is repaired; otherwise a later ingest cycle could reopen the
  // lane before the pending detailed record is safe.
  if (!ok) {
    noteRuntimeQueueFailure(stateDir, now)
    const health = readRescueHealth(stateDir)
    if (health.audit_error !== RESCUE_QUEUE_OVERFLOW_ERROR) updateRescueHealth(stateDir, {
      audit_healthy: false,
      audit_error: RESCUE_QUEUE_WRITE_ERROR,
    }, now)
  }
  else {
    const incompleteAt = Date.parse(pending.incomplete_since || '')
    const incompleteWindowRetired = Number.isFinite(incompleteAt)
      && now - incompleteAt > Math.max(1, maxAgeHrs) * 3_600_000 + 5 * 60_000
    // A staged batch is removable once the main queue contains it. An overflow marker stays until every
    // possibly omitted row has aged out and this bounded rewrite proves the current window is complete.
    if (!pending.incomplete_since || incompleteWindowRetired) {
      try { fs.unlinkSync(queuePendingFile(stateDir)) } catch { /* absent or retained for a safe retry */ }
    }
    // A later successful write is the proof that this queue authority recovered. It may clear only its
    // own transient error; monthly/day-ledger failures remain closed until their repair path proves them.
    const health = readRescueHealth(stateDir)
    const overflowAt = Math.max(
      Date.parse(health.queue_overflow_at || '') || 0,
      Date.parse(pending.incomplete_since || '') || 0,
    )
    const overflowWindowRetired = health.audit_error === RESCUE_QUEUE_OVERFLOW_ERROR
      && overflowAt > 0
      && now - overflowAt > Math.max(1, maxAgeHrs) * 3_600_000 + 5 * 60_000
    if (!health.audit_healthy && ([RESCUE_QUEUE_WRITE_ERROR, RESCUE_QUEUE_PENDING_WRITE_ERROR]
      .includes(String(health.audit_error)) || overflowWindowRetired)) {
      updateRescueHealth(stateDir, {
        audit_healthy: true,
        audit_error: null,
        ...(overflowWindowRetired ? { queue_overflow_at: null } : {}),
      }, now)
    }
    if (!recordRescueMode(stateDir, 'shadow', now)) {
      noteRuntimeQueueFailure(stateDir, now)
      updateRescueHealth(stateDir, {
        audit_healthy: false,
        audit_error: RESCUE_MODE_WRITE_ERROR,
      }, now)
      return false
    }
    const modeHealth = readRescueHealth(stateDir)
    if (!modeHealth.audit_healthy && modeHealth.audit_error === RESCUE_MODE_WRITE_ERROR) {
      updateRescueHealth(stateDir, { audit_healthy: true, audit_error: null }, now)
    }
    runtimeQueueFailures.delete(runtimeQueueKey(stateDir))
  }
  return ok
}

export function loadRescueDay(stateDir: string, date: string): { available: boolean; ledger: RescueDayLedger } {
  const empty: RescueDayLedger = { v: 1, date, checks: [] }
  const file = dayFile(stateDir, date)
  if (!fs.existsSync(file)) return { available: true, ledger: empty }
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size < 2 || stat.size > DAILY_MAX_BYTES) throw new Error('day size')
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw?.v !== 1 || raw.date !== date || !Array.isArray(raw.checks) || raw.checks.length > DAILY_MAX_ITEMS
      || !raw.checks.every(isRescueCheckRecord)) throw new Error('day shape')
    return { available: true, ledger: raw as RescueDayLedger }
  } catch {
    return { available: false, ledger: empty }
  }
}

export function loadRecentRescueChecks(
  stateDir: string,
  now: number,
  keepDays = 3,
): { available: boolean; checks: RescueCheckRecord[] } {
  const days = Array.from({ length: Math.max(1, keepDays) }, (_, daysAgo) =>
    new Date(now - daysAgo * 24 * 3_600_000).toISOString().slice(0, 10))
    .map((date) => loadRescueDay(stateDir, date))
  return { available: days.every((day) => day.available), checks: days.flatMap((day) => day.ledger.checks) }
}

/** One saved check may follow a story from a name-only query to later exact-ticker enrichment. Reuse
 * that verified result only when the returned listing, venue country, company core, and story all
 * agree; an unresolved name remains eligible when genuinely better identity data arrives. */
export function rescueCheckMatchesCandidate(
  check: RescueCheckRecord,
  candidate: RescueCandidate,
): boolean {
  if (check.story_key !== candidate.story_key) return false
  if (check.identity_key === candidate.identity_key) return true
  if (check.pool !== 'name' || check.identity_status !== 'verified' || candidate.pool !== 'ticker'
    || !check.ticker || !check.exchange || !candidate.ticker) return false
  const candidateCountry = String(candidate.listing_country || '').trim().toUpperCase()
  if (!candidateCountry || countryFromExchange(check.exchange) !== candidateCountry) return false
  const savedCore = coreCompanyName(check.company_name)
  const candidateCore = coreCompanyName(candidate.company_name)
  if (!savedCore || savedCore !== candidateCore) return false
  return directoryTickerIdentityKey(check.ticker, candidateCountry)
    === directoryTickerIdentityKey(candidate.ticker, candidateCountry)
}

/** Prove that a transient reservation-write failure has recovered without spending a slot. */
export function repairRescueReservationAuthority(stateDir: string, date: string): boolean {
  const loaded = loadRescueDay(stateDir, date)
  if (!loaded.available || loaded.ledger.checks.length >= DAILY_MAX_ITEMS) return false
  return atomicWriteJson(stateDir, dayFile(stateDir, date), loaded.ledger, DAILY_MAX_BYTES)
}

export function reserveRescueCheck(
  stateDir: string,
  date: string,
  candidate: RescueCandidate,
  selectorVersion: string,
  now = Date.now(),
): RescueCheckRecord | null {
  const loaded = loadRescueDay(stateDir, date)
  if (!loaded.available || loaded.ledger.checks.length >= DAILY_MAX_ITEMS) return null
  const history = loadRecentRescueChecks(stateDir, now)
  if (!history.available) return null
  const attempts = history.checks.filter((check) => rescueCheckMatchesCandidate(check, candidate)).length
  const record: RescueCheckRecord = {
    key: `${date}:${candidate.event_id}:${loaded.ledger.checks.length + 1}`,
    event_id: candidate.event_id,
    story_key: candidate.story_key,
    identity_key: candidate.identity_key,
    attempt: attempts + 1,
    pool: candidate.pool,
    reserved_at: new Date(now).toISOString(),
    ticker: candidate.ticker,
    company_name: candidate.company_name.slice(0, 180),
    rank_inputs: candidate.rank_inputs,
    selector_version: selectorVersion,
  }
  const next: RescueDayLedger = { ...loaded.ledger, checks: [...loaded.ledger.checks, record] }
  return atomicWriteJson(stateDir, dayFile(stateDir, date), next, DAILY_MAX_BYTES) ? record : null
}

function currentAuditOffset(stateDir: string, reservedAt: string, maxBytes: number): number | null {
  const file = auditFile(stateDir, reservedAt.slice(0, 7))
  try {
    const dir = path.dirname(file)
    fs.mkdirSync(dir, { recursive: true })
    fs.accessSync(dir, fs.constants.W_OK)
    if (!fs.existsSync(file)) return maxBytes >= AUDIT_LINE_MAX_BYTES ? 0 : null
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size + AUDIT_LINE_MAX_BYTES > maxBytes) return null
    return stat.size
  } catch {
    return null
  }
}

function auditStateAtOffset(file: string, offset: number):
  | { kind: 'row'; key: string }
  | { kind: 'torn' }
  | { kind: 'invalid' } {
  let fd: number | undefined
  try {
    const size = fs.statSync(file).size
    if (size <= offset) return { kind: 'invalid' }
    const length = Math.min(AUDIT_LINE_MAX_BYTES, size - offset)
    const buffer = Buffer.alloc(length)
    fd = fs.openSync(file, 'r')
    const bytes = fs.readSync(fd, buffer, 0, length, offset)
    const newline = buffer.subarray(0, bytes).indexOf(0x0a)
    // A crash can leave only the un-fsynced suffix of the one row whose exact starting offset is still
    // durable in the day ledger. It is safe to trim only when the entire suffix is bounded and has no
    // newline; a complete different/corrupt row is never guessed away.
    if (newline < 0) return size - offset <= AUDIT_LINE_MAX_BYTES ? { kind: 'torn' } : { kind: 'invalid' }
    const row = JSON.parse(buffer.subarray(0, newline).toString('utf8'))
    return typeof row?.key === 'string' ? { kind: 'row', key: row.key } : { kind: 'invalid' }
  } catch {
    return { kind: 'invalid' }
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* no-op */ }
  }
}

function syncParentDirectory(file: string): boolean {
  // Sync the ledger directory for the new monthly file, then its parent for the ledger directory entry
  // itself. The news-rescue parent already exists before a result can be reserved.
  for (const dir of [path.dirname(file), path.dirname(path.dirname(file))]) {
    let fd: number | undefined
    try {
      fd = fs.openSync(dir, 'r')
      fs.fsyncSync(fd)
    } catch {
      return false
    } finally {
      if (fd !== undefined) try { fs.closeSync(fd) } catch { /* no-op */ }
    }
  }
  return true
}

function appendAudit(stateDir: string, record: RescueCheckRecord, maxBytes: number, checkExisting = false): boolean {
  const month = record.reserved_at.slice(0, 7)
  const file = auditFile(stateDir, month)
  let line: Buffer
  try { line = Buffer.from(`${JSON.stringify({ ...record, audit_pending: undefined })}\n`, 'utf8') } catch { return false }
  if (line.length > AUDIT_LINE_MAX_BYTES) return false
  let fd: number | undefined
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (!Number.isSafeInteger(record.audit_offset) || Number(record.audit_offset) < 0) return false
    const expectedOffset = Number(record.audit_offset)
    let size = fs.existsSync(file) ? fs.statSync(file).size : 0
    // Crash repair reads one bounded row at the offset saved before the append. It never reparses the
    // monthly file, and a different row at that byte closes the lane instead of guessing about order.
    if (checkExisting && size > expectedOffset) {
      const existing = auditStateAtOffset(file, expectedOffset)
      if (existing.kind === 'row') return existing.key === record.key && syncParentDirectory(file)
      if (existing.kind !== 'torn') return false
      fd = fs.openSync(file, 'r+')
      if (fs.fstatSync(fd).size !== size) return false
      fs.ftruncateSync(fd, expectedOffset)
      fs.fsyncSync(fd)
      fs.closeSync(fd)
      fd = undefined
      if (!syncParentDirectory(file)) return false
      size = expectedOffset
    }
    if (size !== expectedOffset) return false
    if (size + line.length > maxBytes) return false
    fd = fs.openSync(file, 'a', 0o600)
    fs.writeFileSync(fd, line)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    // The file bytes alone are not enough for a newly created monthly ledger. Make its directory entry
    // durable before the caller is allowed to clear audit_pending from the short-lived daily authority.
    return syncParentDirectory(file)
  } catch {
    return false
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* no-op */ }
  }
}

/** Conservative preflight for one more detailed result. The exact append still rechecks the real row
 * size and fsyncs it; this guard prevents a known-full/unwritable month from causing an unlogged lookup. */
export function rescueAuditCanAccept(stateDir: string, now: number, maxBytes: number): boolean {
  if (maxBytes < AUDIT_LINE_MAX_BYTES) return false
  const file = auditFile(stateDir, new Date(now).toISOString().slice(0, 7))
  try {
    const dir = path.dirname(file)
    fs.mkdirSync(dir, { recursive: true })
    fs.accessSync(dir, fs.constants.W_OK)
    if (!fs.existsSync(file)) return true
    const stat = fs.statSync(file)
    return stat.isFile() && stat.size + AUDIT_LINE_MAX_BYTES <= maxBytes
  } catch {
    return false
  }
}

export function completeRescueCheck(
  stateDir: string,
  date: string,
  key: string,
  result: { status: RescueIdentityStatus; ticker?: string | null; companyName?: string | null; exchange?: string | null },
  auditMaxBytes: number,
  now = Date.now(),
): boolean {
  const loaded = loadRescueDay(stateDir, date)
  if (!loaded.available) return false
  const index = loaded.ledger.checks.findIndex((check) => check.key === key)
  if (index < 0) return false
  const auditOffset = currentAuditOffset(stateDir, loaded.ledger.checks[index].reserved_at, auditMaxBytes)
  if (auditOffset === null) return false
  const record: RescueCheckRecord = {
    ...loaded.ledger.checks[index],
    completed_at: new Date(now).toISOString(),
    identity_status: result.status,
    reason_code: result.status === 'verified'
      ? 'identity_verified_shadow'
      : result.status === 'identity_unresolved'
        ? 'could_not_match_listed_stock'
        : 'listing_lookup_temporarily_unavailable',
    ...(result.ticker !== undefined ? { ticker: result.ticker } : {}),
    ...(result.companyName ? { company_name: result.companyName.slice(0, 180) } : {}),
    ...(result.exchange !== undefined ? { exchange: result.exchange } : {}),
    ...(result.status === 'verified' ? { source: 'yahoo_symbol_directory' as const } : {}),
    audit_pending: true,
    audit_offset: auditOffset,
  }
  if (!isRescueCheckRecord(record)) return false
  const next: RescueDayLedger = { ...loaded.ledger, checks: [...loaded.ledger.checks] }
  next.checks[index] = record
  if (!atomicWriteJson(stateDir, dayFile(stateDir, date), next, DAILY_MAX_BYTES)) return false
  if (!appendAudit(stateDir, record, auditMaxBytes)) return false
  next.checks[index] = { ...record, audit_pending: false }
  return atomicWriteJson(stateDir, dayFile(stateDir, date), next, DAILY_MAX_BYTES)
}

export function flushPendingRescueAudit(stateDir: string, date: string, auditMaxBytes: number): boolean {
  const loaded = loadRescueDay(stateDir, date)
  if (!loaded.available) return false
  let changed = false
  const checks = loaded.ledger.checks.map((record) => {
    if (!record.audit_pending || !record.identity_status) return record
    if (!appendAudit(stateDir, record, auditMaxBytes, true)) return record
    changed = true
    return { ...record, audit_pending: false }
  })
  if (checks.some((record) => record.audit_pending)) return false
  return !changed || atomicWriteJson(stateDir, dayFile(stateDir, date), { ...loaded.ledger, checks }, DAILY_MAX_BYTES)
}

/** Repair every crash-pending daily record before admission, then keep only the three UTC ledgers that
 * can overlap the 36-hour candidate window. The append-only monthly audit remains the long-lived copy. */
export function reconcileRescueDayLedgers(
  stateDir: string,
  now: number,
  auditMaxBytes: number,
  keepDays = 3,
): boolean {
  const dir = path.join(stateRoot(stateDir), 'days')
  let dates: string[]
  try {
    if (!fs.existsSync(dir)) return true
    dates = fs.readdirSync(dir)
      .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .map((name) => name.slice(0, 10))
      .sort()
    if (dates.length > 4_000) return false
  } catch {
    return false
  }
  const keep = new Set(Array.from({ length: Math.max(1, keepDays) }, (_, daysAgo) =>
    new Date(now - daysAgo * 24 * 3_600_000).toISOString().slice(0, 10)))
  for (const date of dates) {
    if (!flushPendingRescueAudit(stateDir, date, auditMaxBytes)) return false
    if (!keep.has(date)) {
      try { fs.unlinkSync(dayFile(stateDir, date)) } catch { return false }
    }
  }
  return true
}

export function readRescueHealth(stateDir: string): RescueRuntimeHealth {
  const fallback: RescueRuntimeHealth = {
    v: 1, updated_at: new Date(0).toISOString(), audit_healthy: true, audit_error: null,
    consecutive_directory_failures: 0, directory_pause_until: null, last_directory_status: null,
    normal_ideas_ready: true, normal_ideas_reason: null, queue_overflow_at: null,
  }
  const file = healthFile(stateDir)
  if (!fs.existsSync(file)) return fallback
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw?.v !== 1) throw new Error('health shape')
    return {
      ...fallback,
      ...raw,
      audit_healthy: raw.audit_healthy === true,
      audit_error: typeof raw.audit_error === 'string' ? raw.audit_error : null,
      consecutive_directory_failures: Math.max(0, Number(raw.consecutive_directory_failures) || 0),
      directory_pause_until: typeof raw.directory_pause_until === 'string' ? raw.directory_pause_until : null,
      last_directory_status: ['verified', 'identity_unresolved', 'directory_unavailable'].includes(raw.last_directory_status) ? raw.last_directory_status : null,
      normal_ideas_ready: raw.normal_ideas_ready == null ? true : raw.normal_ideas_ready === true,
      normal_ideas_reason: typeof raw.normal_ideas_reason === 'string' ? raw.normal_ideas_reason : null,
      queue_overflow_at: typeof raw.queue_overflow_at === 'string'
        && Number.isFinite(Date.parse(raw.queue_overflow_at)) ? raw.queue_overflow_at : null,
    }
  } catch {
    return { ...fallback, audit_healthy: false, audit_error: 'The second-look health record cannot be read.' }
  }
}

export function updateRescueHealth(
  stateDir: string,
  patch: Partial<Omit<RescueRuntimeHealth, 'v' | 'updated_at'>>,
  now = Date.now(),
): boolean {
  const current = readRescueHealth(stateDir)
  const next: RescueRuntimeHealth = { ...current, ...patch, v: 1, updated_at: new Date(now).toISOString() }
  return atomicWriteJson(stateDir, healthFile(stateDir), next, 64 * 1024)
}

export function noteNormalIdeasReadiness(
  stateDir: string,
  ready: boolean,
  reason: string | null,
  now = Date.now(),
): boolean {
  return updateRescueHealth(stateDir, {
    normal_ideas_ready: ready,
    normal_ideas_reason: ready ? null : String(reason || 'Normal Ideas work did not finish.').slice(0, 240),
  }, now)
}

export function noteDirectoryResult(
  stateDir: string,
  status: RescueIdentityStatus,
  now = Date.now(),
): { saved: boolean; health: RescueRuntimeHealth } {
  const current = readRescueHealth(stateDir)
  let saved: boolean
  if (status === 'directory_unavailable') {
    const failures = current.consecutive_directory_failures + 1
    saved = updateRescueHealth(stateDir, {
      consecutive_directory_failures: failures,
      last_directory_status: status,
      ...(failures >= 3 ? { directory_pause_until: new Date(now + 30 * 60_000).toISOString() } : {}),
    }, now)
  } else {
    saved = updateRescueHealth(stateDir, {
      consecutive_directory_failures: 0,
      directory_pause_until: null,
      last_directory_status: status,
    }, now)
  }
  return { saved, health: saved ? readRescueHealth(stateDir) : current }
}
