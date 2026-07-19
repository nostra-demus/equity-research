// Connector cadence runner — the always-on loop that keeps every built feed fresh. On a poll interval it
// asks, per connector × subject, "is this due?" (health.isDue against the manifest cadence), runs the
// connector's fetch.py --subject into the pool, and records the outcome on the health ledger. When a feed
// crosses the broken threshold and auto-repair is on, it hands the connector to connector-repair.ts. The
// loop is unref'd (can't by itself keep the process alive) and OFF by default — mirrors news/scheduler.ts.
// It runs the connectors that already exist in the repo; it never edits code and never pushes.

import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { CONNECTOR_RUNNER, DATA_DIR, REPO_ROOT, connectorAutoRepairReady, connectorRunnerReady } from './config'
import { listConnectors, cadenceIntervalMs, type ConnectorManifest } from './connector-registry'
import { BROKEN_THRESHOLD, deriveStatus, feedHealthFor, foldHealth, isDue, readAll, recordAttempt, type FeedStatus } from './connector-health'
import { startConnectorRepair } from './connector-repair'

const execFileAsync = promisify(execFile)
const log = (m: string) => console.log(`[connector-runner] ${m}`) // eslint-disable-line no-console

let timer: ReturnType<typeof setInterval> | null = null
let sweeping = false
let lastSweepAt: string | null = null
let fetchedToday = 0
let fetchDay = ''

// A minimal env for the fetcher: runtime + proxy/CA (a fetch needs the network) + any CONNECTOR_* key an
// operator sets for a keyed feed. NO provider secrets, NO PR token — a fetcher only reads a public source.
const FETCH_ALLOW_EXACT = new Set([
  'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'PWD', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'TERM', 'TZ', 'HOSTNAME',
  'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'CURL_CA_BUNDLE', 'REQUESTS_CA_BUNDLE',
  'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'no_proxy', 'all_proxy',
])
export function fetchEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {}
  for (const [k, v] of Object.entries(base)) {
    if (v === undefined) continue
    if (FETCH_ALLOW_EXACT.has(k) || k.startsWith('LC_') || k.startsWith('CONNECTOR_')) env[k] = v
  }
  return env
}

// Parse the data date a successful fetch reported (both reference connectors print "... as_of YYYY-MM-DD").
export function parseAsOf(stdout: string): string | null {
  const m = /as_of\s+(\d{4}-\d{2}-\d{2})/.exec(stdout || '')
  return m ? m[1] : null
}

/** Run one connector's fetcher for one subject. Never throws — returns the outcome for the health ledger. */
export async function runFetch(m: ConnectorManifest, subject: string): Promise<{ ok: boolean; as_of: string | null; error: string | null }> {
  const entry = path.join(m.dir, m.entry)
  try {
    const { stdout } = await execFileAsync('python3', [entry, '--subject', subject, '--data-root', DATA_DIR], {
      cwd: REPO_ROOT, env: fetchEnv(), timeout: CONNECTOR_RUNNER.fetchTimeoutMs, maxBuffer: 8_000_000,
    })
    return { ok: true, as_of: parseAsOf(stdout), error: null }
  } catch (e: any) {
    const tail = String(e?.stderr || e?.stdout || e?.message || 'fetch failed').slice(-400)
    return { ok: false, as_of: null, error: e?.killed ? `timed out after ${Math.round(CONNECTOR_RUNNER.fetchTimeoutMs / 1000)}s` : tail }
  }
}

function resetDailyCounterIfNeeded(): void {
  const d = new Date().toISOString().slice(0, 10)
  if (d !== fetchDay) { fetchDay = d; fetchedToday = 0 }
}

/** One sweep: fetch every DUE feed (bounded), record health, and hand any newly-broken feed to auto-repair. */
export async function sweep(): Promise<{ due: number; fetched: number; ok: number; failed: number; repairs: number }> {
  const connectors = listConnectors()
  const health = foldHealth(readAll())
  const now = Date.now()
  resetDailyCounterIfNeeded()

  // Build the due work-list (connector × subject).
  const due: { m: ConnectorManifest; subject: string }[] = []
  for (const m of connectors) {
    for (const subject of m.subjects) {
      const fh = health.get(`${m.id}::${subject}`) ?? feedHealthFor(m.id, subject)
      if (isDue(fh, m.cadence, now)) due.push({ m, subject })
    }
  }

  let ok = 0, failed = 0, repairs = 0, fetched = 0
  // Phase 1 — fetch every DUE feed (bounded concurrency + daily cap), record each outcome.
  const queue = [...due]
  const worker = async () => {
    for (;;) {
      resetDailyCounterIfNeeded()
      if (fetchedToday >= CONNECTOR_RUNNER.dailyFetchCap) return
      const item = queue.shift()
      if (!item) return
      fetchedToday++; fetched++
      const res = await runFetch(item.m, item.subject)
      await recordAttempt(item.m.id, item.subject, res.ok, { as_of: res.as_of, error: res.error }).catch(() => {})
      if (res.ok) ok++; else failed++
    }
  }
  const n = Math.max(1, Math.min(CONNECTOR_RUNNER.maxConcurrentFetch, queue.length))
  await Promise.all(Array.from({ length: n }, () => worker()))

  // Phase 2 — self-heal. Scan EVERY feed's CURRENT health (not just the ones fetched this sweep — a broken
  // feed in its retry-floor cooldown is not re-fetched, but it still needs repairing). Any feed at/over the
  // broken threshold with no repair already open is handed to the coding agent. startConnectorRepair's own
  // caps + cooldown + inflight guard keep this from stacking or spamming.
  if (connectorAutoRepairReady()) {
    const health2 = foldHealth(readAll())
    for (const m of connectors) {
      for (const subject of m.subjects) {
        const fh = health2.get(`${m.id}::${subject}`)
        if (!fh || fh.consecutive_failures < BROKEN_THRESHOLD) continue
        if (fh.repair_status === 'repairing' || fh.repair_status === 'pr_open') continue
        if (startConnectorRepair(m, subject, fh.last_error || '').accepted) repairs++
      }
    }
  }
  return { due: due.length, fetched, ok, failed, repairs }
}

async function tick(): Promise<void> {
  if (sweeping) return
  sweeping = true
  lastSweepAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  try {
    const r = await sweep()
    if (r.fetched || r.repairs) log(`sweep: ${r.fetched} fetched (${r.ok} ok, ${r.failed} failed), ${r.repairs} repair(s) started`)
  } catch (e: any) {
    log(`sweep error: ${e?.message || e}`)
  } finally {
    sweeping = false
  }
}

/** Start the forever loop. No-op (and logs why) when disabled — safe to call unconditionally at boot. */
export function startConnectorRunner(): void {
  if (timer) return
  if (!connectorRunnerReady()) { log('runner off (set ENGINE_CONNECTOR_RUNNER_ENABLED=1 to keep feeds fresh)'); return }
  setTimeout(() => void tick(), 8000) // let the server settle, then the first sweep
  timer = setInterval(() => void tick(), CONNECTOR_RUNNER.pollIntervalMin * 60_000)
  timer.unref?.()
  log(`runner on — sweep every ${CONNECTOR_RUNNER.pollIntervalMin} min${connectorAutoRepairReady() ? ' · auto-repair on' : ''}`)
}

export function stopConnectorRunner(): void {
  if (timer) { clearInterval(timer); timer = null }
}

/** Run one connector now (a subject, or all its subjects) — the manual "fetch now" path. */
export async function runConnectorNow(id: string, subject?: string): Promise<{ ran: { subject: string; ok: boolean; error: string | null }[] } | null> {
  const m = listConnectors().find((c) => c.id === id)
  if (!m) return null
  const subjects = subject ? (m.subjects.includes(subject) ? [subject] : []) : m.subjects
  const ran: { subject: string; ok: boolean; error: string | null }[] = []
  for (const s of subjects) {
    const res = await runFetch(m, s)
    await recordAttempt(m.id, s, res.ok, { as_of: res.as_of, error: res.error }).catch(() => {})
    ran.push({ subject: s, ok: res.ok, error: res.error })
  }
  return { ran }
}

export interface FeedStatusRow {
  connector_id: string
  subject: string
  series: string
  cadence: string
  status: FeedStatus
  last_ok_at: string | null
  last_as_of: string | null
  last_attempt_at: string | null
  consecutive_failures: number
  staleness_sla_days: number | null
  entry_modules_hint: string[] // the satisfies slugs (best-effort orb hint)
  repair_pr_url: string | null
  next_due_at: string | null
}

/** The cockpit read: every connector × subject with its derived live/stale/broken status. */
export function listFeedStatuses(): FeedStatusRow[] {
  const connectors = listConnectors()
  const health = foldHealth(readAll())
  const now = Date.now()
  const rows: FeedStatusRow[] = []
  for (const m of connectors) {
    for (const subject of m.subjects) {
      const fh = health.get(`${m.id}::${subject}`) ?? feedHealthFor(m.id, subject)
      const interval = cadenceIntervalMs(m.cadence)
      const next = interval != null && fh.last_ok_at ? new Date(Date.parse(fh.last_ok_at) + interval).toISOString().replace(/\.\d{3}Z$/, 'Z') : null
      rows.push({
        connector_id: m.id, subject, series: m.series, cadence: m.cadence,
        status: deriveStatus(fh, m.staleness_sla_days, now),
        last_ok_at: fh.last_ok_at, last_as_of: fh.last_as_of, last_attempt_at: fh.last_attempt_at,
        consecutive_failures: fh.consecutive_failures, staleness_sla_days: m.staleness_sla_days,
        entry_modules_hint: m.satisfies, repair_pr_url: fh.repair_pr_url, next_due_at: next,
      })
    }
  }
  return rows.sort((a, b) => a.connector_id.localeCompare(b.connector_id) || a.subject.localeCompare(b.subject))
}

export function getRunnerStatus(): { enabled: boolean; autoRepair: boolean; pollIntervalMin: number; lastSweepAt: string | null; connectors: number } {
  return {
    enabled: connectorRunnerReady(), autoRepair: connectorAutoRepairReady(),
    pollIntervalMin: CONNECTOR_RUNNER.pollIntervalMin, lastSweepAt, connectors: listConnectors().length,
  }
}
