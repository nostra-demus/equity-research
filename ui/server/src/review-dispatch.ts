// Platform-independent research-review dispatcher — the research-swarm twin of conviction-dispatch.ts.
//
// Due 30/90/180/365d decision reviews are owned by this tracked, provider-inheriting server loop. The old
// direct-Claude macOS timer is retired because it bypassed admission, quota, cancellation and provenance.
// Crash-safe: a window that came due while the app was down fires on the next tick.
//
// OFF by default (auto-spawning paid review runs is opt-in: REVIEW_DISPATCH_ENABLED=1). Bounded by a
// max-concurrent cap and a per-day spawn cap. Reuses listAllCalls() for the DUE computation, so it shares
// the SAME review_due.py rule the hook / command / cockpit already agree on (and now honors the §4a
// supersession layer — a corrected-away run is never reviewed). Paid work is injected through the
// tracked launcher, so provider/profile, admission, cancellation, quota, activity, and provenance remain
// identical to a cockpit click.

import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import {
  hasProvenLegacyClaudeLineage,
  readLastProviderSelection,
  type RecordedProviderSelection,
} from './execution-provenance'
import { listAllCalls } from './outputs'
import type { RunStatus } from './types'

const BUDGET_FILE = path.join(STATE_DIR, 'review-dispatch.json')

const ENABLED = process.env.REVIEW_DISPATCH_ENABLED === '1'
const TICK_MS = Math.max(300, Number(process.env.REVIEW_TICK_SEC) || 3600) * 1000 // hourly by default
const MAX_CONCURRENT = Math.max(1, Number(process.env.REVIEW_MAX_CONCURRENT) || 1)
const DAILY_CAP = Math.max(1, Number(process.env.REVIEW_DAILY_CAP) || 8)
const inflightRuns = new Set<string>() // keyed on `${runRoot}|${window}` — the exact run being reviewed

export interface TrackedReviewLaunch {
  ticker: string
  runRoot: string
  window: string
  selection: RecordedProviderSelection
  onTerminal: (status: RunStatus) => void
}
export type TrackedReviewLauncher = (request: TrackedReviewLaunch) => Promise<void>
let trackedLauncher: TrackedReviewLauncher | null = null

const log = (m: string) => console.log(`[review-dispatch] ${m}`) // eslint-disable-line no-console
const today = () => new Date().toISOString().slice(0, 10)

// Persisted per-day state: the spawn budget AND the set of (runRoot|window) already fired today. The
// fired-today set survives a restart, so a detached review child still running after a bounce is not
// re-fired (the in-memory inflight guard alone would be lost on restart). Both reset when the date rolls.
function readState(): { date: string; fired: number; keys: string[] } {
  try {
    const b = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
    if (b?.date === today()) return { date: b.date, fired: Number(b.fired) || 0, keys: Array.isArray(b.keys) ? b.keys : [] }
  } catch { /* fresh */ }
  return { date: today(), fired: 0, keys: [] }
}
function firedToday(): number { return readState().fired }
function firedKeyToday(key: string): boolean { return readState().keys.includes(key) }
function recordFired(key: string): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    const s = readState()
    if (!s.keys.includes(key)) s.keys.push(key)
    fs.writeFileSync(BUDGET_FILE, JSON.stringify({ date: today(), fired: s.fired + 1, keys: s.keys }))
  } catch { /* best-effort */ }
}
// Every standing call with a review checkpoint DUE or OVERDUE today, keyed on the RUN it belongs to (not
// the bare ticker): listAllCalls() emits one row per run folder, and next_checkpoint is THAT run's earliest
// pending window. A superseded run never appears. Reviewing by ticker would resolve to the latest run and
// silently skip an older still-due run of the same ticker.
export async function dueReviews(): Promise<{ ticker: string; runRoot: string; window: string }[]> {
  const out: { ticker: string; runRoot: string; window: string }[] = []
  let calls: any[] = []
  try {
    calls = (await listAllCalls()).calls
  } catch {
    return out
  }
  for (const c of calls) {
    const nc = c?.next_checkpoint
    if (nc && (nc.status === 'due' || nc.status === 'overdue') && c.ticker && c.run_root && nc.window) {
      out.push({ ticker: String(c.ticker), runRoot: String(c.run_root), window: String(nc.window) })
    }
  }
  return out
}

// Read-only view of the persisted per-day dispatch state (exported for tests).
export function readDispatchState(): { date: string; fired: number; keys: string[] } { return readState() }

function inheritedSelection(runRoot: string): RecordedProviderSelection | null {
  const recorded = readLastProviderSelection(runRoot, 'published')
  if (recorded) return recorded
  return hasProvenLegacyClaudeLineage(runRoot) ? { provider: 'claude' } : null
}

/** Exported for focused dispatcher tests; production injects the common launcher from server.ts. */
export function setTrackedReviewLauncher(launcher: TrackedReviewLauncher | null): void {
  trackedLauncher = launcher
}

export function spawnReview(runRoot: string, window: string, ticker?: string): boolean {
  const key = `${runRoot}|${window}`
  if (inflightRuns.has(key) || firedKeyToday(key)) return false // in-flight, or already fired today (restart-safe)
  if (inflightRuns.size >= MAX_CONCURRENT) return false
  if (firedToday() >= DAILY_CAP) { log(`daily cap ${DAILY_CAP} reached — holding ${key}`); return false }
  const selection = inheritedSelection(runRoot)
  if (!selection) {
    log(`holding ${key} — source decision has no trusted provider/profile provenance; run it manually with an explicit provider`)
    return false
  }
  if (!trackedLauncher) { log(`holding ${key} — tracked launcher is not configured`); return false }
  const subject = ticker || path.basename(runRoot).replace(/_[0-9]{4}-[0-9]{2}-[0-9]{2}(?:_.*)?$/, '')
  if (!subject) { log(`holding ${key} — source ticker could not be resolved`); return false }
  inflightRuns.add(key)
  let terminal = false
  const clear = (status?: RunStatus) => {
    if (terminal) return
    terminal = true
    inflightRuns.delete(key)
    if (status) log(`review ${key} finished ${status}`)
  }
  void trackedLauncher({ ticker: subject, runRoot, window, selection, onTerminal: clear })
    .then(() => { recordFired(key); log(`fired tracked review ${key} via ${selection.provider}`) })
    .catch((error: any) => { clear(); log(`could not admit review ${key}: ${error?.message || error}`) })
  return true
}

/** The due reconciler — one pass. Crash-safe: re-running fires anything still due and unfired. */
export async function dispatchDueReviews(): Promise<void> {
  if (!ENABLED) return
  for (const { ticker, runRoot, window } of await dueReviews()) {
    if (inflightRuns.size >= MAX_CONCURRENT) break
    spawnReview(runRoot, window, ticker)
  }
}

export function startReviewLoop(launcher: TrackedReviewLauncher): void {
  setTrackedReviewLauncher(launcher)
  if (!ENABLED) {
    log('loop idle — set REVIEW_DISPATCH_ENABLED=1 to auto-fire due decision reviews from the server; you can also run /research:review-decisions by hand')
    return
  }
  setTimeout(() => void dispatchDueReviews(), 12_000)
  const t = setInterval(() => void dispatchDueReviews(), TICK_MS)
  t.unref?.()
  log(`loop on — due reconciler every ${Math.round(TICK_MS / 1000)}s · max ${MAX_CONCURRENT} concurrent, ${DAILY_CAP}/day`)
}
