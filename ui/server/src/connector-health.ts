// Connector repair-events ledger — the durable record of every AUTO-REPAIR the watchdog opened for a built
// feed. When the repair watchdog (connector-runner.ts) sees #287's run_connectors.py fetch ledger report a
// connector's latest fetch as `failed`, it hands the connector to connector-repair.ts, which appends a
// `connector_repair` event here (repairing → pr_open | assessed). This module owns ONLY that repair-event
// ledger — the watchdog reads it to skip a connector that already has a repair in flight. Append-only, under
// STATE_DIR/connectors/ (gitignored, durable across restarts), same shape + guarantees as the other ledgers.
// Fetching a feed and tracking its freshness is #287's job (run_connectors.py + pipelines.ts / GET
// /api/pipelines); this file no longer records fetch attempts or derives feed health.

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'
import { BROKEN_THRESHOLD } from './feed-health'

const execFileAsync = promisify(execFile)

export type RepairStatus = 'none' | 'repairing' | 'pr_open' | 'verified' | 'assessed' | 'source_gone'

export interface ConnectorRepairEvent {
  record_id: string
  kind: 'connector_repair'
  connector_id: string
  subject: string | null
  base_fingerprint: string | null
  base_commit: string | null
  status: RepairStatus // repairing → pr_open | assessed
  pr_url: string | null
  note: string
  at: string
}

const DIR = (stateDir: string) => path.join(stateDir, 'connectors')
const LEDGER = (stateDir: string) => path.join(DIR(stateDir), 'health.ndjson')
const repairWriteQueues = new Map<string, Promise<void>>()

export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}
function newId(): string {
  return randomUUID().slice(0, 12)
}

async function append(record: ConnectorRepairEvent, stateDir: string): Promise<void> {
  fs.mkdirSync(DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'record_id', record.record_id],
    { cwd: REPO_ROOT },
  )
}

export async function recordRepair(
  connector_id: string, status: RepairStatus,
  opts: {
    pr_url?: string | null; note?: string; subject?: string | null;
    base_fingerprint?: string | null; base_commit?: string | null;
  } = {}, stateDir: string = STATE_DIR,
): Promise<void> {
  const subject = opts.subject ? String(opts.subject).slice(0, 100) : null
  const record: ConnectorRepairEvent = {
    record_id: newId(), kind: 'connector_repair', connector_id, status,
    subject,
    base_fingerprint: opts.base_fingerprint ? String(opts.base_fingerprint).slice(0, 128) : null,
    base_commit: opts.base_commit ? String(opts.base_commit).slice(0, 128) : null,
    pr_url: opts.pr_url ? String(opts.pr_url).slice(0, 2000) : null,
    note: (opts.note || '').slice(0, 500), at: nowIso(),
  }
  // The append helper has a cross-process file lock, but lock acquisition does
  // not preserve call order. Keep one in-process chain per durable target so a
  // later chronological terminal decision (for example assessed after a new
  // broken streak) can never land before an older verified write and be
  // overwritten by it in the append-only projection.
  const key = `${path.resolve(stateDir)}\u0000${connector_id}\u0000${subject ?? '*'}`
  const previous = repairWriteQueues.get(key) ?? Promise.resolve()
  const pending = previous.catch(() => undefined).then(() => append(record, stateDir))
  repairWriteQueues.set(key, pending)
  try {
    await pending
  } finally {
    if (repairWriteQueues.get(key) === pending) repairWriteQueues.delete(key)
  }
}

/** Every repair event on the ledger, in file (chronological) order. [] when the ledger is absent — never throws. */
export function readAll(stateDir: string = STATE_DIR): ConnectorRepairEvent[] {
  let raw: string
  try { raw = fs.readFileSync(LEDGER(stateDir), 'utf8') } catch { return [] }
  const out: ConnectorRepairEvent[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const p = JSON.parse(t)
      if (p && typeof p === 'object' && !Array.isArray(p) && p.kind === 'connector_repair') out.push(p as ConnectorRepairEvent)
    } catch { /* skip */ }
  }
  return out
}

/**
 * The latest repair event's status + PR url for one connector, or {status:'none', pr_url:null} if none. The
 * watchdog uses this to skip a connector that already has a repair in flight (repairing / pr_open).
 */
export function latestRepairEvent(connectorId: string, stateDir: string = STATE_DIR): ConnectorRepairEvent | null {
  let latest: ConnectorRepairEvent | null = null
  for (const r of readAll(stateDir)) {
    if (r.connector_id !== connectorId) continue
    if (!latest || r.at >= latest.at) latest = r
  }
  return latest
}

export function latestRepairStatus(connectorId: string, stateDir: string = STATE_DIR): {
  status: RepairStatus; pr_url: string | null; at: string | null; subject: string | null;
  base_fingerprint: string | null; base_commit: string | null;
} {
  const latest = latestRepairEvent(connectorId, stateDir)
  return latest
    ? {
        status: latest.status, pr_url: latest.pr_url, at: latest.at, subject: latest.subject ?? null,
        base_fingerprint: latest.base_fingerprint ?? null, base_commit: latest.base_commit ?? null,
      }
    : { status: 'none', pr_url: null, at: null, subject: null, base_fingerprint: null, base_commit: null }
}

/** Latest event applicable to one coverage row; connector-wide (null subject) events apply to all rows. */
export function latestRepairStatusForSubject(
  connectorId: string, subject: string, stateDir: string = STATE_DIR,
): ReturnType<typeof latestRepairStatus> {
  let latest: ConnectorRepairEvent | null = null
  for (const event of readAll(stateDir)) {
    if (event.connector_id !== connectorId || (event.subject != null && event.subject !== subject)) continue
    if (!latest || event.at >= latest.at) latest = event
  }
  return latest ? {
    status: latest.status, pr_url: latest.pr_url, at: latest.at, subject: latest.subject ?? null,
    base_fingerprint: latest.base_fingerprint ?? null, base_commit: latest.base_commit ?? null,
  } : { status: 'none', pr_url: null, at: null, subject: null, base_fingerprint: null, base_commit: null }
}

function latestApplicableRepairEvents(repairs: ConnectorRepairEvent[]): ConnectorRepairEvent[] {
  const subjects = new Map<string, Set<string | null>>()
  for (const event of repairs) {
    const set = subjects.get(event.connector_id) ?? new Set<string | null>()
    if (event.subject != null) set.add(event.subject)
    subjects.set(event.connector_id, set)
  }
  const selected = new Map<string, ConnectorRepairEvent>()
  for (const [connector, scoped] of subjects) {
    const targets = [null, ...scoped]
    for (const subject of targets) {
      let latest: ConnectorRepairEvent | null = null
      for (const event of repairs) {
        if (event.connector_id !== connector) continue
        if (subject == null ? event.subject != null : (event.subject != null && event.subject !== subject)) continue
        if (!latest || event.at >= latest.at) latest = event
      }
      if (latest) selected.set(latest.record_id, latest)
    }
  }
  return [...selected.values()]
}

function ledgerRowAt(row: any): string | null {
  return typeof row?.checked_at === 'string' ? row.checked_at
    : (Number(row?.ts) > 0 ? new Date(Number(row.ts) * 1000).toISOString() : null)
}

/**
 * Fold one subject's post-merge rows in append order.  This is shared by both
 * terminal-state readers so a sustained break cannot be emitted as `assessed`
 * by one reader while an older success is emitted as `verified` by the other.
 */
function trailingPostMergeFailureStreak(
  rows: any[], startIndex: number, event: ConnectorRepairEvent, subject: string,
  mergedAt: string, resolveMerged: MergedPrResolver,
): number {
  let streak = 0
  for (let index = startIndex; index < rows.length; index++) {
    const row = rows[index]
    if (row.connector !== event.connector_id || row.subject !== subject) continue
    const at = ledgerRowAt(row)
    if (!at || at <= mergedAt) continue
    const deployed = typeof row.connector_commit === 'string'
      ? resolveMerged(event.pr_url || '', row.connector_commit) : null
    if (!deployed) { streak = 0; continue }
    const nonEscalating = ['credentials_missing', 'suspect', 'quarantined'].includes(String(row.outcome || ''))
    streak = row.decision === 'failed' && !nonEscalating ? streak + 1 : 0
  }
  return streak
}

/**
 * PURE post-merge verification gate.  A repair is verified only by a real,
 * successful fetch of the repaired subject after the PR-open event.  A later
 * `fresh` row does not exercise the code and cannot close the lifecycle.
 */
export function repairVerificationsFromLedger(
  ledgerText: string, repairs: ConnectorRepairEvent[],
  resolveMerged: MergedPrResolver = () => null,
): { connector_id: string; subject: string; pr_url: string | null }[] {
  const rows: any[] = []
  for (const line of (ledgerText || '').split('\n')) {
    try { const row = JSON.parse(line); if (row && typeof row === 'object' && !Array.isArray(row)) rows.push(row) } catch { /* skip */ }
  }
  const out: { connector_id: string; subject: string; pr_url: string | null }[] = []
  const targets = new Map<string, Set<string>>()
  for (const event of repairs) if (event.subject) {
    const set = targets.get(event.connector_id) ?? new Set<string>(); set.add(event.subject); targets.set(event.connector_id, set)
  }
  for (const row of rows) if (typeof row.connector === 'string' && typeof row.subject === 'string') {
    const set = targets.get(row.connector) ?? new Set<string>(); set.add(row.subject); targets.set(row.connector, set)
  }
  for (const [connector, subjects] of targets) for (const subject of [...subjects].sort()) {
    let event: ConnectorRepairEvent | null = null
    for (const candidate of repairs) {
      if (candidate.connector_id !== connector || (candidate.subject != null && candidate.subject !== subject)) continue
      if (!event || candidate.at >= event.at) event = candidate
    }
    if (!event) continue
    if (event.status !== 'pr_open' || !event.base_fingerprint || !event.pr_url) continue
    // Old repair events were connector-wide (`subject:null`). A proven post-merge fetch clears that legacy
    // lock one subject at a time, including an unmentioned subject after another subject already got a scoped
    // terminal event.
    for (let index = rows.length - 1; index >= 0; index--) {
      const row = rows[index]
      if (row.connector !== event.connector_id || row.subject !== subject || row.decision !== 'refetched'
          || !['current', 'no_new_release'].includes(String(row.outcome || ''))
          || typeof row.connector_commit !== 'string' || typeof row.connector_fingerprint !== 'string'
          || row.connector_fingerprint === event.base_fingerprint
          || (event.base_commit && row.connector_commit === event.base_commit)) continue
      const at = ledgerRowAt(row)
      if (!at) continue
      const merged = resolveMerged(event.pr_url, row.connector_commit)
      if (!merged || at <= merged.mergedAt) continue
      // A qualifying success is historical, not terminal, when the same proven
      // deployment subsequently ends in a full broken streak.  Break rather
      // than searching for an even older success: the later failure state
      // supersedes every earlier success for this repair target.
      if (trailingPostMergeFailureStreak(
        rows, index + 1, event, subject, merged.mergedAt, resolveMerged,
      ) >= BROKEN_THRESHOLD) break
      out.push({ connector_id: event.connector_id, subject, pr_url: event.pr_url })
      break
    }
  }
  return out.sort((a, b) => a.connector_id.localeCompare(b.connector_id) || a.subject.localeCompare(b.subject))
}

export interface RepairLifecycleTransition {
  connector_id: string
  subject: string | null
  pr_url: string | null
  note: string
  base_fingerprint: string | null
  base_commit: string | null
}
export type RepairPrStateResolver = (prUrl: string) => {
  state: 'OPEN' | 'CLOSED' | 'MERGED'; mergedAt?: string; mergeCommit?: string;
} | null

export interface RepairLifecycleOptions {
  /** A hard-disabled runtime cannot truthfully have an automatic repair in flight. */
  automationAvailable?: boolean
  /** A `repairing` event older than this process is an orphan after a restart. */
  runnerStartedAt?: string
  /** A wedged same-process repair is eventually released instead of claiming to run forever. */
  repairingTimeoutMs?: number
  nowMs?: number
}

const DEFAULT_REPAIRING_TIMEOUT_MS = 6 * 3600_000

function repairingIsOrphaned(event: ConnectorRepairEvent, options: RepairLifecycleOptions): boolean {
  if (options.automationAvailable === false) return true
  const eventMs = Date.parse(String(event.at || ''))
  const startedMs = options.runnerStartedAt ? Date.parse(options.runnerStartedAt) : NaN
  const nowMs = options.nowMs ?? Date.now()
  const timeoutMs = options.repairingTimeoutMs ?? DEFAULT_REPAIRING_TIMEOUT_MS
  if (!Number.isFinite(eventMs)) return true
  // Timestamps are second-precision. Compare whole seconds so a repair written in the process's first
  // second is not misclassified merely because module initialization retained milliseconds.
  if (Number.isFinite(startedMs) && Math.floor(eventMs / 1000) < Math.floor(startedMs / 1000)) return true
  return !Number.isFinite(timeoutMs) || timeoutMs <= 0 || nowMs - eventMs > timeoutMs
}

/** Release stale pr_open locks after a closed PR or a post-merge sustained break. */
export function repairLifecycleTransitionsFromLedger(
  ledgerText: string, repairs: ConnectorRepairEvent[], inspectPr: RepairPrStateResolver,
  resolveMerged: MergedPrResolver = () => null,
  options: RepairLifecycleOptions = {},
): RepairLifecycleTransition[] {
  const rows: any[] = []
  for (const line of (ledgerText || '').split('\n')) {
    try { const row = JSON.parse(line); if (row && typeof row === 'object' && !Array.isArray(row)) rows.push(row) } catch { /* skip */ }
  }
  const out: RepairLifecycleTransition[] = []
  for (const event of latestApplicableRepairEvents(repairs)) {
    // Include subjects already named by the repair ledger as well as fetch-ledger subjects. This prevents
    // a legacy connector-wide transition from overwriting a newer subject-scoped terminal event.
    const concreteSubjects = [...new Set([
      ...repairs.filter((candidate) => candidate.connector_id === event.connector_id && candidate.subject != null)
        .map((candidate) => String(candidate.subject)),
      ...rows
      .filter((row) => row.connector === event.connector_id && typeof row.subject === 'string')
        .map((row) => String(row.subject)),
    ])].sort()
    const applicableSubjects: (string | null)[] = event.subject ? [event.subject]
      : concreteSubjects.filter((subject) => {
          let latest: ConnectorRepairEvent | null = null
          for (const candidate of repairs) {
            if (candidate.connector_id !== event.connector_id
                || (candidate.subject != null && candidate.subject !== subject)) continue
            if (!latest || candidate.at >= latest.at) latest = candidate
          }
          return latest?.record_id === event.record_id
        })

    if (event.status === 'repairing') {
      if (!repairingIsOrphaned(event, options)) continue
      const targets = event.subject != null ? [event.subject]
        : (applicableSubjects.length ? applicableSubjects : (concreteSubjects.length ? [] : [null]))
      for (const subject of targets) {
        out.push({
          connector_id: event.connector_id, subject, pr_url: event.pr_url ?? null,
          note: options.automationAvailable === false
            ? 'Automatic connector coding is disabled; released an orphaned repair-running state for manual handling.'
            : 'Repair-running state survived a restart or exceeded its execution window; released for an honest retry.',
          base_fingerprint: event.base_fingerprint ?? null, base_commit: event.base_commit ?? null,
        })
      }
      continue
    }
    if (event.status !== 'pr_open' || !event.pr_url) continue
    const pr = inspectPr(event.pr_url)
    if (!pr || pr.state === 'OPEN') continue
    if (pr.state === 'CLOSED') {
      const closedTargets = applicableSubjects.length ? applicableSubjects
        : (event.subject == null && concreteSubjects.length ? [] : [event.subject])
      for (const subject of closedTargets) {
        out.push({ connector_id: event.connector_id, subject, pr_url: event.pr_url,
          note: 'Repair PR closed without merge; released the repair lock.',
          base_fingerprint: event.base_fingerprint, base_commit: event.base_commit })
      }
      continue
    }
    if (!pr.mergedAt) continue

    // Pre-v2 repair events had no base fingerprint. They cannot honestly earn `verified`, because there is
    // no before-value against which to prove the connector changed. Once a merged deployment performs a
    // real successful refetch, release only as `assessed` instead of leaving the old PR lock stranded forever.
    if (!event.base_fingerprint) {
      const subjects = applicableSubjects.filter((subject): subject is string => subject != null)
      let legacyReleased = false
      for (const subject of subjects) {
        const exercised = rows.some((row) => {
          if (row.connector !== event.connector_id || row.subject !== subject || row.decision !== 'refetched'
              || !['current', 'no_new_release'].includes(String(row.outcome || ''))
              || typeof row.connector_commit !== 'string') return false
          const at = ledgerRowAt(row)
          return !!at && at > pr.mergedAt! && !!resolveMerged(event.pr_url!, row.connector_commit)
        })
        if (exercised) {
          legacyReleased = true
          out.push({
            connector_id: event.connector_id, subject, pr_url: event.pr_url,
            note: 'Merged legacy repair completed a successful post-deploy refetch, but its old ledger row has no base fingerprint; released as assessed rather than claiming verified.',
            base_fingerprint: null, base_commit: event.base_commit ?? null,
          })
        }
      }
      if (legacyReleased) continue
    }
    // The pre-merge break which triggered the repair cannot count toward proving the merged repair failed.
    // Require a complete new BROKEN_THRESHOLD streak, all after merge and all from commits proven to contain
    // that merge. Any success, non-escalating hold, or unproven deployment resets the streak.
    const subjects = applicableSubjects.filter((subject): subject is string => subject != null)
    for (const subject of subjects) {
      const postMergeFailStreak = trailingPostMergeFailureStreak(
        rows, 0, event, subject, pr.mergedAt, resolveMerged,
      )
      if (postMergeFailStreak >= BROKEN_THRESHOLD) {
        out.push({ connector_id: event.connector_id, subject, pr_url: event.pr_url,
          note: 'Repair PR merged, but the subject remained broken after deployment; released for another repair.',
          base_fingerprint: event.base_fingerprint, base_commit: event.base_commit })
      }
    }
  }
  return out.sort((a, b) => a.connector_id.localeCompare(b.connector_id))
}

export interface MergedPrDeployment {
  mergedAt: string
  mergeCommit: string
  deployedCommit: string
}
export type MergedPrResolver = (prUrl: string, deployedCommit: string) => MergedPrDeployment | null
