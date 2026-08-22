// Restart-safe state for the second-look shadow lane. Candidate observations stay in a rolling 36-hour
// queue; each paced identity check is reserved atomically before network I/O and copied to a bounded
// monthly audit log after completion. Any unreadable/write-failed authority closes admission.

import fs from 'node:fs'
import path from 'node:path'
import type { FeedItem } from '../types'
import type { RescueCandidate, RescuePool, RescueRankInputs } from './selector'

const ROOT = 'news-rescue'
const QUEUE_MAX_ITEMS = 40_000
const QUEUE_MAX_BYTES = 40 * 1024 * 1024
const DAILY_MAX_ITEMS = 240 // hard parser bound; configured admission remains <=200
const DAILY_MAX_BYTES = 2 * 1024 * 1024
const AUDIT_LINE_MAX_BYTES = 2 * 1024
const QUEUE_WRITE_ERROR = 'The app could not save the second-look queue.'

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
  error?: 'unreadable' | 'write_failed' | 'overflow'
}

export interface RescueCheckRecord {
  key: string
  event_id: string
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
}

const stateRoot = (stateDir: string): string => path.join(stateDir, ROOT)
const queueFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'queue.json')
const healthFile = (stateDir: string): string => path.join(stateRoot(stateDir), 'health.json')
const dayFile = (stateDir: string, date: string): string => path.join(stateRoot(stateDir), 'days', `${date}.json`)
const auditFile = (stateDir: string, month: string): string => path.join(stateRoot(stateDir), 'ledger', `${month}.ndjson`)

function atomicWriteJson(file: string, value: unknown, maxBytes: number): boolean {
  let body: string
  try { body = `${JSON.stringify(value)}\n` } catch { return false }
  if (Buffer.byteLength(body, 'utf8') > maxBytes) return false
  const dir = path.dirname(file)
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
    try {
      const parent = fs.openSync(dir, 'r')
      try { fs.fsyncSync(parent) } finally { fs.closeSync(parent) }
    } catch { /* the file itself is durable; unsupported directory fsync is not a false failure */ }
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
  const score = Number(item.triage_score)
  if (item.inboxed || !Number.isFinite(score) || score < 10 || score > 39) return false
  const reasons = new Set(item.decision_reason_codes || [])
  return reasons.has('second_look_candidate') || reasons.has('no_strong_company_event') || reasons.has('duplicate_story')
}

export function loadRescueQueue(stateDir: string): RescueQueueSnapshot {
  const file = queueFile(stateDir)
  if (!fs.existsSync(file)) return { available: true, items: [], updated_at: null }
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size < 2 || stat.size > QUEUE_MAX_BYTES) throw new Error('queue size')
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw?.v !== 1 || !Array.isArray(raw.items) || raw.items.length > QUEUE_MAX_ITEMS) throw new Error('queue shape')
    return {
      available: true,
      items: raw.items.filter((item: any) => item?.kind === 'item' && typeof item.event_id === 'string') as FeedItem[],
      updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : null,
    }
  } catch {
    return { available: false, items: [], updated_at: null, error: 'unreadable' }
  }
}

export function recordRescueRows(stateDir: string, rows: readonly FeedItem[], now = Date.now(), maxAgeHrs = 36): boolean {
  if (!rows.length) return true
  const prior = loadRescueQueue(stateDir)
  if (!prior.available) {
    updateRescueHealth(stateDir, { audit_healthy: false, audit_error: 'The saved second-look queue cannot be read.' }, now)
    return false
  }
  const minTime = now - Math.max(1, maxAgeHrs) * 3_600_000
  const byId = new Map<string, FeedItem>()
  for (const item of [...prior.items, ...rows]) {
    if (!queueRelevant(item)) continue
    const found = Date.parse(String(item.found_at || item.ts || ''))
    if (!Number.isFinite(found) || found < minTime || found > now + 5 * 60_000) continue
    byId.set(item.event_id, compactFeedItem(item))
  }
  const items = [...byId.values()].sort((left, right) => String(left.found_at || left.ts).localeCompare(String(right.found_at || right.ts)))
  if (items.length > QUEUE_MAX_ITEMS) {
    updateRescueHealth(stateDir, { audit_healthy: false, audit_error: 'The saved second-look queue reached its safety limit.' }, now)
    return false
  }
  const ok = atomicWriteJson(queueFile(stateDir), { v: 1, updated_at: new Date(now).toISOString(), items }, QUEUE_MAX_BYTES)
  // A healthy queue write cannot clear an unrelated day-ledger/monthly-audit failure. Those failures
  // stay closed until their own authority is repaired; otherwise a later ingest cycle could reopen the
  // lane before the pending detailed record is safe.
  if (!ok) updateRescueHealth(stateDir, {
    audit_healthy: false,
    audit_error: QUEUE_WRITE_ERROR,
  }, now)
  else {
    // A later successful write is the proof that this queue authority recovered. It may clear only its
    // own transient error; monthly/day-ledger failures remain closed until their repair path proves them.
    const health = readRescueHealth(stateDir)
    if (!health.audit_healthy && health.audit_error === QUEUE_WRITE_ERROR) {
      updateRescueHealth(stateDir, { audit_healthy: true, audit_error: null }, now)
    }
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
    if (raw?.v !== 1 || raw.date !== date || !Array.isArray(raw.checks) || raw.checks.length > DAILY_MAX_ITEMS) throw new Error('day shape')
    return { available: true, ledger: raw as RescueDayLedger }
  } catch {
    return { available: false, ledger: empty }
  }
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
  const attempts = loaded.ledger.checks.filter((check) => check.event_id === candidate.event_id
    && check.identity_key === candidate.identity_key).length
  const record: RescueCheckRecord = {
    key: `${date}:${candidate.event_id}:${loaded.ledger.checks.length + 1}`,
    event_id: candidate.event_id,
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
  return atomicWriteJson(dayFile(stateDir, date), next, DAILY_MAX_BYTES) ? record : null
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

function auditRowAtOffset(file: string, offset: number): string | null {
  let fd: number | undefined
  try {
    const size = fs.statSync(file).size
    if (size <= offset) return null
    const length = Math.min(AUDIT_LINE_MAX_BYTES, size - offset)
    const buffer = Buffer.alloc(length)
    fd = fs.openSync(file, 'r')
    const bytes = fs.readSync(fd, buffer, 0, length, offset)
    const newline = buffer.subarray(0, bytes).indexOf(0x0a)
    if (newline < 0) return null
    const row = JSON.parse(buffer.subarray(0, newline).toString('utf8'))
    return typeof row?.key === 'string' ? row.key : null
  } catch {
    return null
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* no-op */ }
  }
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
    const size = fs.existsSync(file) ? fs.statSync(file).size : 0
    // Crash repair reads one bounded row at the offset saved before the append. It never reparses the
    // monthly file, and a different row at that byte closes the lane instead of guessing about order.
    if (checkExisting && size > expectedOffset) return auditRowAtOffset(file, expectedOffset) === record.key
    if (size !== expectedOffset) return false
    if (size + line.length > maxBytes) return false
    fd = fs.openSync(file, 'a', 0o600)
    fs.writeFileSync(fd, line)
    fs.fsyncSync(fd)
    return true
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
  const next: RescueDayLedger = { ...loaded.ledger, checks: [...loaded.ledger.checks] }
  next.checks[index] = record
  if (!atomicWriteJson(dayFile(stateDir, date), next, DAILY_MAX_BYTES)) return false
  if (!appendAudit(stateDir, record, auditMaxBytes)) return false
  next.checks[index] = { ...record, audit_pending: false }
  return atomicWriteJson(dayFile(stateDir, date), next, DAILY_MAX_BYTES)
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
  return !changed || atomicWriteJson(dayFile(stateDir, date), { ...loaded.ledger, checks }, DAILY_MAX_BYTES)
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
  return atomicWriteJson(healthFile(stateDir), next, 64 * 1024)
}

export function noteDirectoryResult(stateDir: string, status: RescueIdentityStatus, now = Date.now()): RescueRuntimeHealth {
  const current = readRescueHealth(stateDir)
  if (status === 'directory_unavailable') {
    const failures = current.consecutive_directory_failures + 1
    updateRescueHealth(stateDir, {
      consecutive_directory_failures: failures,
      last_directory_status: status,
      ...(failures >= 3 ? { directory_pause_until: new Date(now + 30 * 60_000).toISOString() } : {}),
    }, now)
  } else {
    updateRescueHealth(stateDir, {
      consecutive_directory_failures: 0,
      directory_pause_until: null,
      last_directory_status: status,
    }, now)
  }
  return readRescueHealth(stateDir)
}
