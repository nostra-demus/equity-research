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

/**
 * PURE: given the raw text of #287's run_ledger.ndjson, return every connector × subject whose LATEST decision
 * is `failed`. Rows are one JSON object per connector × subject per sweep, in append (chronological) order, so
 * the LAST row per (connector, subject) is the current state. Malformed lines are skipped; a row counts only
 * if it has a string `connector`, a string `subject`, and a `decision`.
 */
export function brokenFromLedger(ledgerText: string): { connector: string; subject: string; message: string }[] {
  const latest = new Map<string, { connector: string; subject: string; decision: string; message: string }>()
  for (const line of (ledgerText || '').split('\n')) {
    const t = line.trim()
    if (!t) continue
    let row: any
    try { row = JSON.parse(t) } catch { continue }
    if (!row || typeof row !== 'object') continue
    if (typeof row.connector !== 'string' || typeof row.subject !== 'string' || row.decision == null) continue
    latest.set(`${row.connector}::${row.subject}`, {
      connector: row.connector, subject: row.subject, decision: String(row.decision), message: String(row.message || ''),
    })
  }
  const out: { connector: string; subject: string; message: string }[] = []
  for (const v of latest.values()) {
    if (v.decision === 'failed') out.push({ connector: v.connector, subject: v.subject, message: v.message })
  }
  return out
}

const ledgerPath = () => path.join(DATA_DIR, '_connectors', 'run_ledger.ndjson')

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
