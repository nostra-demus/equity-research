// Connector health — the durable record of whether each built feed is actually alive. Every scheduled (or
// manual) fetch appends a `connector_attempt`; every auto-repair appends a `connector_repair`. The folded
// view per (connector, subject) — last success, last data date, trailing failure streak, open repair — is
// what the cadence runner acts on and the cockpit's "Live feeds" surface reads. Append-only, same shape +
// guarantees as the other ledgers, under STATE_DIR/connectors/ (gitignored, durable across restarts). The
// staleness + due + status derivations are PURE so they are unit-testable and identical on server + client.

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'
import { cadenceIntervalMs } from './connector-registry'

const execFileAsync = promisify(execFile)

export type FeedStatus = 'unknown' | 'live' | 'stale' | 'broken' | 'repairing'
export type RepairStatus = 'none' | 'repairing' | 'pr_open' | 'assessed'

// A feed is "broken" after this many consecutive failed fetches — the signal a source shape changed (a blip
// clears on the next cycle; a real break keeps failing). Tunable, but low so a genuine break is caught fast.
export const BROKEN_THRESHOLD = 3
// A broken/failing feed is retried at most this often (so the runner doesn't hammer a dead endpoint every poll).
export const RETRY_FLOOR_MS = 60 * 60_000

export interface ConnectorAttempt {
  record_id: string
  kind: 'connector_attempt'
  connector_id: string
  subject: string
  ok: boolean
  as_of: string | null // the data date the fetch reported (from fetch.py stdout), when successful
  error: string | null
  at: string
}
export interface ConnectorRepairEvent {
  record_id: string
  kind: 'connector_repair'
  connector_id: string
  status: RepairStatus // repairing → pr_open | assessed
  pr_url: string | null
  note: string
  at: string
}
export type ConnectorRecord = ConnectorAttempt | ConnectorRepairEvent

export interface FeedHealth {
  connector_id: string
  subject: string
  last_attempt_at: string | null
  last_ok_at: string | null
  last_as_of: string | null
  consecutive_failures: number
  last_error: string | null
  repair_status: RepairStatus
  repair_pr_url: string | null
}

const DIR = (stateDir: string) => path.join(stateDir, 'connectors')
const LEDGER = (stateDir: string) => path.join(DIR(stateDir), 'health.ndjson')
const key = (id: string, subject: string) => `${id}::${subject}`

export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}
function newId(): string {
  return randomUUID().slice(0, 12)
}

async function append(record: ConnectorRecord, stateDir: string): Promise<void> {
  fs.mkdirSync(DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'record_id', record.record_id],
    { cwd: REPO_ROOT },
  )
}

export async function recordAttempt(
  connector_id: string, subject: string, ok: boolean,
  opts: { as_of?: string | null; error?: string | null } = {}, stateDir: string = STATE_DIR,
): Promise<void> {
  await append({
    record_id: newId(), kind: 'connector_attempt', connector_id, subject, ok,
    as_of: opts.as_of ? String(opts.as_of).slice(0, 40) : null,
    error: opts.error ? String(opts.error).slice(0, 500) : null, at: nowIso(),
  }, stateDir)
}

export async function recordRepair(
  connector_id: string, status: RepairStatus,
  opts: { pr_url?: string | null; note?: string } = {}, stateDir: string = STATE_DIR,
): Promise<void> {
  await append({
    record_id: newId(), kind: 'connector_repair', connector_id, status,
    pr_url: opts.pr_url ? String(opts.pr_url).slice(0, 2000) : null,
    note: (opts.note || '').slice(0, 500), at: nowIso(),
  }, stateDir)
}

export function readAll(stateDir: string = STATE_DIR): ConnectorRecord[] {
  let raw: string
  try { raw = fs.readFileSync(LEDGER(stateDir), 'utf8') } catch { return [] }
  const out: ConnectorRecord[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try { const p = JSON.parse(t); if (p && typeof p === 'object' && !Array.isArray(p)) out.push(p as ConnectorRecord) } catch { /* skip */ }
  }
  return out
}

/** Fold the ledger into per-(connector,subject) health. PURE over its input array. */
export function foldHealth(records: ConnectorRecord[]): Map<string, FeedHealth> {
  const attempts = new Map<string, ConnectorAttempt[]>()
  const repairs = new Map<string, ConnectorRepairEvent[]>() // by connector_id
  for (const r of records) {
    if (r.kind === 'connector_attempt') {
      const arr = attempts.get(key(r.connector_id, r.subject)) ?? []
      arr.push(r); attempts.set(key(r.connector_id, r.subject), arr)
    } else if (r.kind === 'connector_repair') {
      const arr = repairs.get(r.connector_id) ?? []
      arr.push(r); repairs.set(r.connector_id, arr)
    }
  }
  const latestRepair = (id: string): ConnectorRepairEvent | null => {
    const arr = repairs.get(id)
    if (!arr || !arr.length) return null
    return arr.reduce((a, b) => (b.at >= a.at ? b : a))
  }
  const out = new Map<string, FeedHealth>()
  for (const [k, arr] of attempts) {
    arr.sort((a, b) => a.at.localeCompare(b.at))
    const last = arr[arr.length - 1]
    const lastOk = [...arr].reverse().find((a) => a.ok) || null
    let streak = 0
    for (let i = arr.length - 1; i >= 0 && !arr[i].ok; i--) streak++
    const rep = latestRepair(last.connector_id)
    out.set(k, {
      connector_id: last.connector_id, subject: last.subject,
      last_attempt_at: last.at,
      last_ok_at: lastOk?.at ?? null,
      last_as_of: lastOk?.as_of ?? null,
      consecutive_failures: streak,
      last_error: streak > 0 ? last.error : null,
      repair_status: rep?.status ?? 'none',
      repair_pr_url: rep?.pr_url ?? null,
    })
  }
  return out
}

/** Health for one (connector, subject) — a never-attempted feed returns the empty baseline. */
export function feedHealthFor(id: string, subject: string, stateDir: string = STATE_DIR): FeedHealth {
  const fh = foldHealth(readAll(stateDir)).get(key(id, subject))
  return fh ?? { connector_id: id, subject, last_attempt_at: null, last_ok_at: null, last_as_of: null, consecutive_failures: 0, last_error: null, repair_status: 'none', repair_pr_url: null }
}

/** Derive the display status. PURE. slaDays may be null (no SLA declared → never "stale", only broken/live). */
export function deriveStatus(fh: FeedHealth, slaDays: number | null, nowMs: number): FeedStatus {
  if (fh.repair_status === 'repairing') return 'repairing'
  if (fh.consecutive_failures >= BROKEN_THRESHOLD) return 'broken'
  if (!fh.last_attempt_at) return 'unknown'
  if (fh.last_ok_at && slaDays && slaDays > 0) {
    const age = nowMs - Date.parse(fh.last_ok_at)
    if (age > slaDays * 24 * 3600_000) return 'stale'
  }
  return fh.last_ok_at ? 'live' : (fh.consecutive_failures > 0 ? 'broken' : 'unknown')
}

/** Is a (connector, subject) due for a fetch now? PURE. Manual-only cadences (event_driven) are never due. */
export function isDue(fh: FeedHealth, cadence: string, nowMs: number, retryFloorMs: number = RETRY_FLOOR_MS): boolean {
  const interval = cadenceIntervalMs(cadence)
  if (interval == null) return false // event_driven / unknown → manual only
  // don't re-attempt a failing feed faster than the retry floor
  if (fh.last_attempt_at && nowMs - Date.parse(fh.last_attempt_at) < retryFloorMs) return false
  if (!fh.last_ok_at) return true // never succeeded → due
  return nowMs - Date.parse(fh.last_ok_at) >= interval
}
