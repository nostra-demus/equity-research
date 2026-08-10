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
import { execFileSync } from 'node:child_process'
import { CONNECTOR_RUNNER, DATA_DIR, REPO_ROOT, connectorAutoRepairReady, connectorRunnerReady } from './config'
import { listConnectors } from './connector-registry'
import { latestRepairStatusForSubject, readAll as readRepairEvents, recordRepair, repairLifecycleTransitionsFromLedger, repairVerificationsFromLedger } from './connector-health'
import { startConnectorRepair } from './connector-repair'
import { BROKEN_THRESHOLD, feedHealthFromLedger } from './feed-health'
import { connectorChildEnv } from './connector-agent'

const log = (m: string) => console.log(`[connector-runner] ${m}`) // eslint-disable-line no-console
const RUNNER_STARTED_AT = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

let timer: ReturnType<typeof setInterval> | null = null
let sweeping = false
let lastSweepAt: string | null = null
const verificationWrites = new Set<string>()
const PR_URL_RE = /^https:\/\/github\.com\/nostra-demus\/equity-research\/pull\/\d+$/

/** Fail-closed runtime proof that this exact PR is merged into the commit which performed the fetch. */
export function inspectRepairPr(prUrl: string): { state: 'OPEN' | 'CLOSED' | 'MERGED'; mergedAt?: string; mergeCommit?: string } | null {
  if (!PR_URL_RE.test(prUrl)) return null
  try {
    const raw = execFileSync('gh', ['pr', 'view', prUrl, '--json', 'state,mergedAt,mergeCommit'], {
      cwd: REPO_ROOT, encoding: 'utf8', timeout: 15_000, stdio: ['ignore', 'pipe', 'ignore'],
      env: connectorChildEnv(),
    })
    const parsed = JSON.parse(raw)
    const state = String(parsed?.state || '')
    if (!['OPEN', 'CLOSED', 'MERGED'].includes(state)) return null
    return {
      state: state as 'OPEN' | 'CLOSED' | 'MERGED',
      mergedAt: parsed?.mergedAt ? String(parsed.mergedAt) : undefined,
      mergeCommit: parsed?.mergeCommit?.oid ? String(parsed.mergeCommit.oid) : undefined,
    }
  } catch { return null }
}

export function resolveMergedRepairPr(prUrl: string, deployedCommit: string) {
  if (!PR_URL_RE.test(prUrl) || !/^[0-9a-f]{40,64}$/.test(deployedCommit)) return null
  try {
    const parsed = inspectRepairPr(prUrl)
    const mergeCommit = String(parsed?.mergeCommit || '')
    const mergedAt = String(parsed?.mergedAt || '')
    if (parsed?.state !== 'MERGED' || !mergedAt || !/^[0-9a-f]{40,64}$/.test(mergeCommit)) return null
    execFileSync('git', ['merge-base', '--is-ancestor', mergeCommit, deployedCommit], {
      cwd: REPO_ROOT, timeout: 5_000, stdio: 'ignore',
    })
    return { mergedAt, mergeCommit, deployedCommit }
  } catch { return null }
}

// A feed is treated as broken only after this many CONSECUTIVE failed sweeps — the definition (and the reason
// for it) lives with the ledger parse in feed-health.ts, which the Data Library reads too. Re-exported here
// because the watchdog IS the historical owner of the threshold and its callers/tests import it from here.
export { BROKEN_THRESHOLD }

/**
 * PURE: given the raw text of #287's run_ledger.ndjson, return every connector × subject whose LATEST decision
 * is `failed` AND whose trailing run of consecutive `failed` sweeps is at least `threshold` — the watchdog's
 * cut of feed-health.ts's one ledger fold (§2: the cockpit's health read and this repair trigger parse the
 * same rows exactly once, in one place).
 */
export function brokenFromLedger(
  ledgerText: string,
  threshold: number = BROKEN_THRESHOLD,
): { connector: string; subject: string; message: string }[] {
  const out: { connector: string; subject: string; message: string }[] = []
  for (const v of feedHealthFromLedger(ledgerText, threshold).values()) {
    if (v.state === 'broken') out.push({ connector: v.connector, subject: v.subject, message: v.message })
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
  const repairEvents = readRepairEvents()
  for (const transition of repairLifecycleTransitionsFromLedger(
    text, repairEvents, inspectRepairPr, resolveMergedRepairPr,
    { automationAvailable: connectorAutoRepairReady(), runnerStartedAt: RUNNER_STARTED_AT },
  )) {
    const key = `assessed:${transition.connector_id}:${transition.subject ?? '*'}:${transition.pr_url}`
    if (verificationWrites.has(key)) continue
    verificationWrites.add(key)
    void recordRepair(transition.connector_id, 'assessed', {
      subject: transition.subject, pr_url: transition.pr_url, note: transition.note,
      base_fingerprint: transition.base_fingerprint, base_commit: transition.base_commit,
    }).finally(() => verificationWrites.delete(key))
  }
  for (const verified of repairVerificationsFromLedger(text, repairEvents, resolveMergedRepairPr)) {
    const key = `verified:${verified.connector_id}:${verified.subject}:${verified.pr_url ?? ''}`
    if (verificationWrites.has(key)) continue
    verificationWrites.add(key)
    void recordRepair(verified.connector_id, 'verified', {
      subject: verified.subject, pr_url: verified.pr_url,
      note: `Verified by a successful staged fetch of ${verified.subject} after the repair PR opened.`,
    }).finally(() => verificationWrites.delete(key))
  }
  const broken = brokenFromLedger(text)
  const health = feedHealthFromLedger(text)
  let repairs = 0
  if (connectorAutoRepairReady()) {
    const connectors = listConnectors()
    for (const b of broken) {
      const m = connectors.find((c) => c.id === b.connector)
      if (!m || !m.subjects.includes(b.subject)) continue
      const rep = latestRepairStatusForSubject(m.id, b.subject)
      if (rep.status === 'repairing' || rep.status === 'pr_open') continue
      const feed = health.get(`${m.id}::${b.subject}`)
      if ((rep.status === 'assessed' || rep.status === 'source_gone') && rep.base_fingerprint
          && rep.base_fingerprint === feed?.connectorFingerprint) continue
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
