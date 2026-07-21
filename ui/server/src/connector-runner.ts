// Connector repair watchdog — the always-on self-healing loop. #287's run_connectors.py (launchd) is the SOLE
// fetcher: it fetches each connector when stale and APPENDS a decision row per connector × subject to its
// ledger at <DATA_DIR>/_connectors/run_ledger.ndjson. This watchdog does NOT fetch. On a poll interval it
// reads that ledger, finds every connector × subject whose LATEST fetch decision is `failed` (a fetch attempt
// that failed — the source likely broke), and, when auto-repair is on, hands the broken connector to
// connector-repair.ts to reproduce, fix fetch.py, and open a fix-it PR. It never fetches, never edits code
// itself, and never pushes. The loop is unref'd (can't by itself keep the process alive) and OFF by default —
// mirrors news/scheduler.ts.

import fs from 'node:fs'
import path from 'node:path'
import { CONNECTOR_RUNNER, DATA_DIR, connectorAutoRepairReady, connectorRunnerReady } from './config'
import { listConnectors } from './connector-registry'
import { latestRepairStatus } from './connector-health'
import { startConnectorRepair } from './connector-repair'

const log = (m: string) => console.log(`[connector-runner] ${m}`) // eslint-disable-line no-console

let timer: ReturnType<typeof setInterval> | null = null
let sweeping = false
let lastSweepAt: string | null = null

// A feed is treated as broken only after this many CONSECUTIVE failed sweeps. run_connectors.py appends one
// run_ledger row per connector × subject per sweep and already retries 0/60/300s WITHIN a single sweep, and
// the launchd cadence is 6-hourly — so 3 consecutive `failed` rows is a sustained ~12–18h break, not a
// transient blip that clears on the next sweep. This restores the protection the removed connector-health
// BROKEN_THRESHOLD gave before this refactor: without it a single transient failure would immediately spend a
// paid repair and potentially open an unnecessary fix-it PR (Codex #310).
export const BROKEN_THRESHOLD = 3

/**
 * PURE: given the raw text of #287's run_ledger.ndjson, return every connector × subject whose LATEST decision
 * is `failed` AND whose trailing run of consecutive `failed` sweeps is at least `threshold`. Rows are one JSON
 * object per connector × subject per sweep, in append (chronological) order, so the streak is counted from the
 * tail and ANY non-`failed` decision (refetched / fresh / skipped_*) resets it. Malformed lines are skipped; a
 * row counts only if it has a string `connector`, a string `subject`, and a `decision`.
 */
export function brokenFromLedger(
  ledgerText: string,
  threshold: number = BROKEN_THRESHOLD,
): { connector: string; subject: string; message: string }[] {
  const state = new Map<string, { connector: string; subject: string; streak: number; message: string }>()
  for (const line of (ledgerText || '').split('\n')) {
    const t = line.trim()
    if (!t) continue
    let row: any
    try { row = JSON.parse(t) } catch { continue }
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    if (typeof row.connector !== 'string' || typeof row.subject !== 'string' || row.decision == null) continue
    const k = `${row.connector}::${row.subject}`
    if (String(row.decision) === 'failed') {
      const streak = (state.get(k)?.streak || 0) + 1
      state.set(k, { connector: row.connector, subject: row.subject, streak, message: String(row.message || '') })
    } else {
      // any non-failed decision recovers/resets the feed — the consecutive-failure streak starts over
      state.set(k, { connector: row.connector, subject: row.subject, streak: 0, message: '' })
    }
  }
  const out: { connector: string; subject: string; message: string }[] = []
  for (const v of state.values()) {
    if (v.streak >= threshold) out.push({ connector: v.connector, subject: v.subject, message: v.message })
  }
  return out
}

/**
 * PURE: the `message` from the LATEST ledger row for a given connector × subject, across ANY decision (not
 * just `failed`), or '' when there is no such row. Same parse discipline as brokenFromLedger (skip malformed
 * lines; require string connector/subject; reject arrays). Chronological append order means the last match
 * wins. Lets the MANUAL repair trigger hand the coding agent the same last-error the watchdog already passes
 * from the ledger — otherwise the manual path ships '(no error text captured)' while the watchdog does not.
 */
export function latestLedgerMessage(ledgerText: string, connector: string, subject: string): string {
  let message = ''
  for (const line of (ledgerText || '').split('\n')) {
    const t = line.trim()
    if (!t) continue
    let row: any
    try { row = JSON.parse(t) } catch { continue }
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    if (typeof row.connector !== 'string' || typeof row.subject !== 'string') continue
    if (row.connector === connector && row.subject === subject) message = String(row.message || '')
  }
  return message
}

const ledgerPath = () => path.join(DATA_DIR, '_connectors', 'run_ledger.ndjson')

/** The last recorded error for a connector × subject from #287's fetch ledger, or '' if unreadable/absent. */
export function lastLedgerError(connector: string, subject: string): string {
  let text = ''
  try { text = fs.readFileSync(ledgerPath(), 'utf8') } catch { return '' }
  return latestLedgerMessage(text, connector, subject)
}

/**
 * One sweep: read #287's fetch ledger and, when auto-repair is on, hand every currently-broken feed to
 * auto-repair. A broken feed is skipped when its connector isn't discovered, the subject isn't in the
 * manifest, or a repair is already in flight (repairing / pr_open). Returns the broken count + repairs started.
 */
export function sweep(): { broken: number; repairs: number } {
  let text = ''
  try { text = fs.readFileSync(ledgerPath(), 'utf8') } catch { text = '' }
  const broken = brokenFromLedger(text)
  let repairs = 0
  if (connectorAutoRepairReady()) {
    const connectors = listConnectors()
    for (const b of broken) {
      const m = connectors.find((c) => c.id === b.connector)
      if (!m || !m.subjects.includes(b.subject)) continue
      const rep = latestRepairStatus(m.id)
      if (rep.status === 'repairing' || rep.status === 'pr_open') continue
      if (startConnectorRepair(m, b.subject, b.message).accepted) repairs++
    }
  }
  return { broken: broken.length, repairs }
}

function tick(): void {
  if (sweeping) return
  sweeping = true
  lastSweepAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  try {
    const r = sweep()
    if (r.repairs > 0) log(`watchdog: ${r.repairs} repair(s) started`)
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
  setTimeout(() => tick(), 8000) // let the server settle, then the first sweep
  timer = setInterval(() => tick(), CONNECTOR_RUNNER.pollIntervalMin * 60_000)
  timer.unref?.()
  log(`repair watchdog on — every ${CONNECTOR_RUNNER.pollIntervalMin} min${connectorAutoRepairReady() ? ' · auto-repair on' : ''}`)
}

export function stopConnectorRunner(): void {
  if (timer) { clearInterval(timer); timer = null }
}

export function getRunnerStatus(): { enabled: boolean; autoRepair: boolean; pollIntervalMin: number; lastSweepAt: string | null; connectors: number } {
  return {
    enabled: connectorRunnerReady(), autoRepair: connectorAutoRepairReady(),
    pollIntervalMin: CONNECTOR_RUNNER.pollIntervalMin, lastSweepAt, connectors: listConnectors().length,
  }
}
