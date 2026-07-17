// Platform-independent research-review dispatcher — the research-swarm twin of conviction-dispatch.ts.
//
// Today a due 30/90/180/365d decision review fires ONLY from the macOS `hk-review` launchd timer on the
// single doer Mac (scripts/ops/com.nostradamus.hk-review.plist). When that machine is off, reviews slip:
// the first three 30d reviews landed 10-12 days late. This is a self-healing server tick that fires any
// due review from the always-on engine process, so the outcome-measurement layer no longer depends on one
// laptop's timer. Crash-safe: a window that came due while the app was down fires on the next tick.
//
// OFF by default (auto-spawning paid review runs is opt-in: REVIEW_DISPATCH_ENABLED=1). Bounded by a
// max-concurrent cap and a per-day spawn cap. Reuses listAllCalls() for the DUE computation, so it shares
// the SAME review_due.py rule the hook / command / cockpit already agree on (and now honors the §4a
// supersession layer — a corrected-away run is never reviewed). Spawns the CLI directly (same shape as
// conviction-dispatch); the review run writes its own append-only review file.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { CLAUDE_BIN, DEFAULT_MODEL, REPO_ROOT, STATE_DIR } from './config'
import { listAllCalls } from './outputs'

const BUDGET_FILE = path.join(STATE_DIR, 'review-dispatch.json')

const ENABLED = process.env.REVIEW_DISPATCH_ENABLED === '1'
const TICK_MS = Math.max(300, Number(process.env.REVIEW_TICK_SEC) || 3600) * 1000 // hourly by default
const MAX_CONCURRENT = Math.max(1, Number(process.env.REVIEW_MAX_CONCURRENT) || 1)
const DAILY_CAP = Math.max(1, Number(process.env.REVIEW_DAILY_CAP) || 8)
const MAX_TURNS = Math.max(10, Number(process.env.ENGINE_REVIEW_MAX_TURNS) || 120)
const BUDGET_USD = Math.max(1, Number(process.env.ENGINE_REVIEW_BUDGET_USD) || 20)

const inflightRuns = new Set<string>() // keyed on `${runRoot}|${window}` — the exact run being reviewed

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
export function dueReviews(): { runRoot: string; window: string }[] {
  const out: { runRoot: string; window: string }[] = []
  let calls: any[] = []
  try {
    calls = listAllCalls().calls
  } catch {
    return out
  }
  for (const c of calls) {
    const nc = c?.next_checkpoint
    if (nc && (nc.status === 'due' || nc.status === 'overdue') && c.run_root && nc.window) {
      out.push({ runRoot: String(c.run_root), window: String(nc.window) })
    }
  }
  return out
}

function spawnReview(runRoot: string, window: string): boolean {
  const key = `${runRoot}|${window}`
  if (inflightRuns.has(key) || firedKeyToday(key)) return false // in-flight, or already fired today (restart-safe)
  if (inflightRuns.size >= MAX_CONCURRENT) return false
  if (firedToday() >= DAILY_CAP) { log(`daily cap ${DAILY_CAP} reached — holding ${key}`); return false }
  inflightRuns.add(key)
  const args = ['--print', `/research:review-decisions ${runRoot} ${window}`, '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'bypassPermissions', '--model', DEFAULT_MODEL, '--max-turns', String(MAX_TURNS), '--max-budget-usd', String(BUDGET_USD)]
  try {
    const child = spawn(CLAUDE_BIN, args, { cwd: REPO_ROOT, stdio: 'ignore', detached: true })
    recordFired(key) // only after a successful spawn — a failed launch must not burn the daily cap
    const clear = () => inflightRuns.delete(key)
    child.on('exit', (code) => { clear(); log(`review ${key} exited ${code}`) })
    child.on('error', (e) => { clear(); log(`review ${key} spawn error: ${e.message}`) })
    child.unref()
    log(`fired review ${key}`)
    return true
  } catch (e: any) {
    inflightRuns.delete(key) // spawn threw — budget was NOT bumped, guard released
    log(`could not spawn review ${key}: ${e?.message || e}`)
    return false
  }
}

/** The due reconciler — one pass. Crash-safe: re-running fires anything still due and unfired. */
export function dispatchDueReviews(): void {
  if (!ENABLED) return
  for (const { runRoot, window } of dueReviews()) {
    if (inflightRuns.size >= MAX_CONCURRENT) break
    spawnReview(runRoot, window)
  }
}

export function startReviewLoop(): void {
  if (!ENABLED) {
    log('loop idle — set REVIEW_DISPATCH_ENABLED=1 to auto-fire due decision reviews from the server (the macOS hk-review timer, if installed, still fires them; you can also run /research:review-decisions by hand)')
    return
  }
  setTimeout(() => dispatchDueReviews(), 12_000)
  const t = setInterval(() => dispatchDueReviews(), TICK_MS)
  t.unref?.()
  log(`loop on — due reconciler every ${Math.round(TICK_MS / 1000)}s · max ${MAX_CONCURRENT} concurrent, ${DAILY_CAP}/day, ~$${BUDGET_USD}/review`)
}
