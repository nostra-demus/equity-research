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

const inflightTickers = new Set<string>()

const log = (m: string) => console.log(`[review-dispatch] ${m}`) // eslint-disable-line no-console
const today = () => new Date().toISOString().slice(0, 10)

function firedToday(): number {
  try {
    const b = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
    return b?.date === today() ? Number(b.fired) || 0 : 0
  } catch {
    return 0
  }
}
function bumpFired(): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(BUDGET_FILE, JSON.stringify({ date: today(), fired: firedToday() + 1 }))
  } catch { /* best-effort */ }
}

// Every standing call with a review checkpoint that is DUE or OVERDUE today, one row per ticker (the
// earliest such window), computed by the shared listAllCalls() timeline. A superseded run never appears.
export function dueReviews(): { ticker: string; window: string }[] {
  const out: { ticker: string; window: string }[] = []
  let calls: any[] = []
  try {
    calls = listAllCalls().calls
  } catch {
    return out
  }
  for (const c of calls) {
    const nc = c?.next_checkpoint
    if (nc && (nc.status === 'due' || nc.status === 'overdue') && c.ticker && nc.window) {
      out.push({ ticker: String(c.ticker), window: String(nc.window) })
    }
  }
  return out
}

function spawnReview(ticker: string, window: string): boolean {
  if (inflightTickers.has(ticker)) return false
  if (inflightTickers.size >= MAX_CONCURRENT) return false
  if (firedToday() >= DAILY_CAP) { log(`daily cap ${DAILY_CAP} reached — holding ${ticker} ${window}`); return false }
  inflightTickers.add(ticker)
  bumpFired()
  const args = ['--print', `/research:review-decisions ${ticker} ${window}`, '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'bypassPermissions', '--model', DEFAULT_MODEL, '--max-turns', String(MAX_TURNS), '--max-budget-usd', String(BUDGET_USD)]
  try {
    const child = spawn(CLAUDE_BIN, args, { cwd: REPO_ROOT, stdio: 'ignore', detached: true })
    const clear = () => inflightTickers.delete(ticker)
    child.on('exit', (code) => { clear(); log(`review ${ticker} ${window} exited ${code}`) })
    child.on('error', (e) => { clear(); log(`review ${ticker} ${window} spawn error: ${e.message}`) })
    child.unref()
    log(`fired review ${ticker} ${window}`)
    return true
  } catch (e: any) {
    inflightTickers.delete(ticker)
    log(`could not spawn review ${ticker} ${window}: ${e?.message || e}`)
    return false
  }
}

/** The due reconciler — one pass. Crash-safe: re-running fires anything still due and unfired. */
export function dispatchDueReviews(): void {
  if (!ENABLED) return
  for (const { ticker, window } of dueReviews()) {
    if (inflightTickers.size >= MAX_CONCURRENT) break
    spawnReview(ticker, window)
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
