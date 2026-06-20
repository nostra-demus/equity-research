// In-server scheduler — the "runs whenever the cockpit is up" hosting mode. One guarded call from
// server.ts after the control plane binds; if there's no Groq key (or NEWS_INGEST_ENABLED=0) it logs
// once and stays dark, so a keyless deploy behaves exactly as before. A cycle never throws and never
// blocks the event loop; the interval is unref'd so it can't, by itself, keep the process alive.
//
// The scheduler also carries the ingester's STATUS for the cockpit's auto-scan chip: when the last
// cycle ran, when the next is due, and today's read/kept/dropped — the daily counts are summed from
// the firehose file on disk so a server restart never zeroes them.

import fs from 'node:fs'
import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { readFeed } from './feed'
import { runIngestCycle } from './runCycle'
import { healEnrichCache } from './enrich-heal'
import { pacedCeiling, pacedHasHeadroom } from './triage/budget'
import type { CycleSummary } from './types'

const PACE = { targetTokens: NEWS.groqDailyTokenTarget, floorFrac: NEWS.groqPaceFloorFrac }

// BULLETPROOF cycle guard: no single ingest cycle may run longer than this. The OLD guard was a
// Promise.race against a timeout — but a race only ABANDONS the slow promise, it doesn't stop it: the
// `finally` released the `running` lock while the real cycle was still in-flight, so the next tick started
// a SECOND concurrent runIngestCycle. Two cycles then double-fetched every source and stomped module-level
// state (e.g. gdelt.ts's gdeltSkipUntilMs → bursts of 429s with no backoff between), worsening the single-
// thread starvation. Fix: ABORT instead of abandon. Every fetch a cycle makes flows through one injected
// fetchFn, so a cycle-level AbortSignal cancels them all at once; the cycle then settles fail-soft, and the
// caller AWAITS it to settlement before releasing `running` — so a slow/timed-out cycle can never overlap
// the next tick. (No wedge either: every fetch is individually timeout-bounded AND the guard aborts them.)
const CYCLE_TIMEOUT_MS = NEWS.cycleTimeoutMs

/** Wrap a fetchFn so every request it makes is also cancelled by `signal`, WITHOUT touching any adapter:
 *  each adapter sets its own per-request signal (its timeout); we AbortSignal.any() it with the cycle's. */
export function withCycleSignal(base: typeof fetch, signal: AbortSignal): typeof fetch {
  return ((url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) =>
    base(url, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, signal]) : signal })) as typeof fetch
}

/** Run an abortable cycle: start it with a fresh AbortController, abort it (and call onTimeout once) if it
 *  overruns timeoutMs, and AWAIT it to settlement either way. Resolves/rejects ONLY once the underlying
 *  work has finished, so the caller's `running` lock is released only when nothing is in-flight — no
 *  overlap. Exported for tests. */
export async function runAbortableCycle<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = CYCLE_TIMEOUT_MS,
  onTimeout?: () => void,
): Promise<T> {
  const ac = new AbortController()
  const guard = setTimeout(() => { onTimeout?.(); ac.abort() }, timeoutMs)
  ;(guard as { unref?: () => void }).unref?.()
  try {
    return await run(ac.signal)
  } finally {
    clearTimeout(guard)
  }
}

let timer: ReturnType<typeof setInterval> | null = null
let drainTimer: ReturnType<typeof setInterval> | null = null
let running = false
let lastCycleAt: string | null = null
let nextCycleAt: string | null = null
let lastNote: string | null = null

// How often the drain tick works the deferred backlog (no fetch). Short, so the daily-budget pacer
// releases its clock-prorated allowance in small frequent sub-bursts (an even all-day drip) rather than
// one lump per fetch — the per-minute RateLimiter still governs the instantaneous rate, and the pacer's
// own clock ceiling governs how much of the day's budget is available right now.
const DRAIN_INTERVAL_MS = Math.max(30, Number(process.env.NEWS_DRAIN_INTERVAL_SEC) || 60) * 1000

/** How many items are waiting un-triaged in the deferred spillover (read-only, never throws). */
function backlogCount(): number {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'news-deferred.json'), 'utf8'))
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}
/** Today's date in the Gemini reset zone (midnight Pacific), matching the per-model Budget day key. */
function geminiToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NEWS.geminiDayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now())
}

/** Aggregate today's usage across the Gemini model-rotation pool (each model = a separate daily bucket). */
function geminiPoolUsage(): { used: number; cap: number; tokens: number } | null {
  if (!(NEWS.geminiEnabled && NEWS.geminiApiKey && NEWS.geminiModels.length)) return null
  const day = geminiToday()
  let used = 0
  let tokens = 0
  let cap = 0
  for (const e of NEWS.geminiModels) {
    cap += e.dailyReqCap
    const f = path.join(STATE_DIR, `gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`)
    try {
      const g = JSON.parse(fs.readFileSync(f, 'utf8'))
      if (g?.date === day) { used += Number(g.requests) || 0; tokens += Number(g.tokens) || 0 }
    } catch {
      // missing/unreadable model budget counts as 0 used (fresh)
    }
  }
  return { used, cap, tokens }
}

/** Any free room left across the whole Gemini pool today? */
function geminiHasHeadroom(): boolean {
  const u = geminiPoolUsage()
  return !!u && u.used < u.cap
}

/** Today's usage for one OpenAI-compatible overflow provider (its own budget file, reset zone p.dayTz). */
function overflowUsage(p: (typeof NEWS.overflowProviders)[number]): { id: string; label: string; color: string; used: number; cap: number; tokens: number } {
  const day = p.dayTz ? new Intl.DateTimeFormat('en-CA', { timeZone: p.dayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now()) : new Date().toISOString().slice(0, 10)
  let used = 0
  let tokens = 0
  try {
    const o = JSON.parse(fs.readFileSync(path.join(STATE_DIR, p.budgetFile), 'utf8'))
    if (o?.date === day) { used = Number(o.requests) || 0; tokens = Number(o.tokens) || 0 }
  } catch {
    // fresh / unreadable → 0 used
  }
  return { id: p.id, label: p.label, color: p.color, used, cap: p.dailyReqCap, tokens }
}

/** Free room left on ANY OpenAI-compatible overflow provider today? */
function overflowHasHeadroom(): boolean {
  return NEWS.overflowProviders.some((p) => {
    const u = overflowUsage(p)
    // A TOKEN-gated provider (Cerebras) binds on tokens, not requests: once it spends its daily token cap
    // its request count can still be low, so a requests-only test would wrongly report headroom and the
    // drain loop would busy-wait every tick running skipFetch cycles that can't actually score anything.
    // Count it out of headroom when EITHER limit is reached (requests OR, where it has one, tokens).
    if (p.dailyTokenCap != null && u.tokens >= p.dailyTokenCap) return false
    return u.used < u.cap
  })
}

/**
 * Is there budget to drain right now? True if Groq has paced headroom OR any free overflow pool (Gemini or
 * an OpenAI-compatible provider) has room. Gating Groq on the pacer spreads an overload day evenly; OR-ing
 * the overflow pools keeps the drain clearing the backlog on their separate free quotas once Groq is paced.
 */
function budgetHasHeadroom(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  let groqOk = true
  try {
    const b = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'groq-budget.json'), 'utf8'))
    if (b?.date === today) groqOk = pacedHasHeadroom(Number(b.tokens) || 0, Number(b.requests) || 0, NEWS.groqDailyTokenCap, NEWS.groqDailyReqCap, PACE)
  } catch {
    return true // unreadable budget → don't stall the drain
  }
  return groqOk || geminiHasHeadroom() || overflowHasHeadroom()
}

export interface NewsStatus {
  enabled: boolean
  running: boolean
  intervalMin: number
  model: string
  rssEnabled: boolean
  lastCycleAt: string | null
  nextCycleAt: string | null
  lastNote: string | null
  today: { read: number; kept: number; dropped: number; cycles: number }
  // tokenTarget = the pacer's day goal; paceCeiling = tokens allowed spent BY NOW under the clock
  // schedule (tokens ≈ paceCeiling ⇒ the pacer is metering; tokens ≪ paceCeiling ⇒ free-flowing).
  budget: { requests: number; tokens: number; reqCap: number; tokenCap: number; tokenTarget: number; paceCeiling: number }
  // every free OVERFLOW pool (Gemini + each OpenAI-compatible provider), one entry per provider. The cockpit
  // renders a chip per entry, so a newly-added provider appears automatically. Empty when none are keyed.
  // tokenCap is set ONLY for TOKEN-gated providers (e.g. Cerebras) — the cockpit then shows the chip in
  // tokens (its BINDING limit) instead of requests, so the readout is ground truth, not a non-binding proxy.
  overflow: { id: string; label: string; color: string; model: string; requests: number; reqCap: number; tokens: number; tokenCap?: number }[]
}

/** Status for the cockpit. Daily counts come from today's firehose ON DISK (restart-proof). */
export function getNewsStatus(): NewsStatus {
  const todayDate = new Date().toISOString().slice(0, 10)
  const today = { read: 0, kept: 0, dropped: 0, cycles: 0 }
  try {
    const { cycles } = readFeed(REPO_ROOT, 1)
    for (const c of cycles as CycleSummary[]) {
      if ((c.ts || '').slice(0, 10) !== todayDate) continue
      today.cycles++
      // read = items the scanner actually READ AND SCORED today = kept + dropped. We deliberately do
      // NOT sum c.candidates here: candidates is the triage QUEUE size (this cycle's fresh items PLUS
      // the deferred backlog re-queued from earlier cycles), so a budget-deferred item is re-counted in
      // candidates on every cycle until it's finally scored. That made "read" balloon far above
      // kept+dropped on busy/budget-capped days, so the three numbers no longer reconciled. picked +
      // watched + dropped counts each item exactly once — in the one cycle it's scored — so read always
      // ties out as kept + dropped.
      today.kept += (c.picked || 0) + (c.watched || 0)
      today.dropped += c.dropped || 0
      today.read += (c.picked || 0) + (c.watched || 0) + (c.dropped || 0)
    }
  } catch {
    // a status read never throws
  }
  const budget = {
    requests: 0, tokens: 0, reqCap: NEWS.groqDailyReqCap, tokenCap: NEWS.groqDailyTokenCap,
    tokenTarget: NEWS.groqDailyTokenTarget, paceCeiling: Math.round(pacedCeiling(Date.now(), PACE)),
  }
  try {
    // read the persisted daily counter directly (same file Budget writes); counts only if today's
    const b = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'groq-budget.json'), 'utf8'))
    if (b?.date === todayDate) {
      budget.requests = Number(b.requests) || 0
      budget.tokens = Number(b.tokens) || 0
    }
  } catch {
    // best-effort
  }
  const overflow: NewsStatus['overflow'] = []
  const pool = geminiPoolUsage()
  if (pool) {
    const n = NEWS.geminiModels.length
    overflow.push({ id: 'gemini', label: 'Gemini', color: '--live', model: `${n} model${n === 1 ? '' : 's'} (${NEWS.geminiModel}…)`, requests: pool.used, reqCap: pool.cap, tokens: pool.tokens })
  }
  for (const p of NEWS.overflowProviders) {
    const u = overflowUsage(p)
    const lead = (p.model || '').split('/').pop() || p.id
    // token-gated providers (Cerebras) carry tokenCap so the chip reports tokens (the binding limit); a
    // request-gated provider (OpenRouter/NVIDIA) leaves it undefined → the chip stays on requests, as before.
    overflow.push({ id: p.id, label: p.label, color: p.color, model: lead, requests: u.used, reqCap: u.cap, tokens: u.tokens, tokenCap: p.dailyTokenCap })
  }
  return {
    enabled: NEWS.enabled,
    running,
    intervalMin: NEWS.pollIntervalMin,
    model: NEWS.groqModel,
    rssEnabled: NEWS.rssEnabled,
    lastCycleAt,
    nextCycleAt: NEWS.enabled ? nextCycleAt : null,
    lastNote,
    today,
    budget,
    overflow,
  }
}

const INGESTER_LOCK_FILE = 'news-ingester.lock'

/** Single-instance guard for the ingester, keyed on STATE_DIR (the lock file lives in it). Stops a
 *  SECOND engine pointed at the SAME data dir — e.g. a stray manual `npm start` on another port — from
 *  running a DUPLICATE ingester, which doubles every feed/GDELT/LLM fetch and races every write (the
 *  2026-06-20 ":8799" incident: a forgotten manual instance double-loaded the machine for ~2 days).
 *  Returns true iff THIS process now owns the lock. FAILS OPEN: any unexpected fs error returns true, so
 *  the guard can never stop the legitimate sole engine from ingesting — it returns false ONLY when it
 *  positively confirms another LIVE owner. A crashed holder leaves a stale lock the next start steals via
 *  the liveness check (a SIGTERM/SIGKILL never fires the clean-exit release). */
export function acquireIngesterLock(stateDir: string): boolean {
  const fp = path.join(stateDir, INGESTER_LOCK_FILE)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.mkdirSync(stateDir, { recursive: true })
      const fd = fs.openSync(fp, 'wx') // atomic create-exclusive: win the race, or throw EEXIST
      try { fs.writeSync(fd, String(process.pid)) } finally { fs.closeSync(fd) }
      return true
    } catch (e: any) {
      if (e?.code !== 'EEXIST') return true // unexpected fs error → never block the sole engine
      let holder = 0
      try { holder = parseInt(fs.readFileSync(fp, 'utf8').trim(), 10) || 0 } catch { /* unreadable */ }
      if (holder === process.pid) return true // re-entrant: we already own it
      if (holder > 0) {
        let alive = false
        try { process.kill(holder, 0); alive = true } catch (err: any) { alive = err?.code === 'EPERM' } // EPERM = exists, not ours
        if (alive) return false // another LIVE engine owns the ingester for this data dir
      }
      try { fs.unlinkSync(fp) } catch { /* cleared elsewhere */ } // stale (dead/zero/unreadable) → drop, retry create
    }
  }
  return true // couldn't prove a live owner after stealing a stale lock → fail open
}

/** Best-effort release of OUR lock (clean exit only). A crash leaves a stale lock that the next start
 *  steals via acquireIngesterLock's liveness check, so this is a courtesy, not a correctness requirement. */
export function releaseIngesterLock(stateDir: string): void {
  const fp = path.join(stateDir, INGESTER_LOCK_FILE)
  try { if (fs.readFileSync(fp, 'utf8').trim() === String(process.pid)) fs.unlinkSync(fp) } catch { /* nothing to release */ }
}

export function startNewsIngester(): void {
  if (!NEWS.enabled) {
    // eslint-disable-next-line no-console
    console.log(NEWS.groqApiKey ? '[news] ingester disabled (NEWS_INGEST_ENABLED=0)' : '[news] ingester idle — set GROQ_API_KEY to turn it on')
    return
  }
  if (timer) return
  // One ingester per data dir. A second engine (stray manual start, wrong-port instance) still serves
  // HTTP but must NOT double-fetch/double-write against the same STATE_DIR.
  if (!acquireIngesterLock(STATE_DIR)) {
    // eslint-disable-next-line no-console
    console.log('[news] another engine already owns the ingester for this data dir — staying read-only (no duplicate fetching). Stop the other instance, or point this one at a separate ENGINE_STATE_DIR.')
    return
  }
  process.once('exit', () => releaseIngesterLock(STATE_DIR))
  const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console
  const tick = async () => {
    if (running) return // never overlap cycles
    running = true
    // next fire is interval-anchored from the tick START (matches setInterval's cadence)
    nextCycleAt = new Date(Date.now() + NEWS.pollIntervalMin * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    try {
      const summary = await runAbortableCycle(
        (signal) => runIngestCycle({ log, signal, fetchFn: withCycleSignal(fetch, signal) }),
        CYCLE_TIMEOUT_MS,
        () => log(`cycle exceeded ${Math.round(CYCLE_TIMEOUT_MS / 1000)}s guard — aborting in-flight work`),
      )
      lastNote = summary.note || null
      // AUTO-FIX (under the SAME cycle lock so it can't overlap a drain and double-spend a budget file):
      // re-read any degraded THE STORY entries still on the wire, so a momentarily-missed article fixes
      // itself without a human reopening it. Budget-gated, capped, never throws, and bounded by its own
      // per-fetch timeouts — AWAITED to completion (not raced) so it can't overlap the next tick either.
      if (budgetHasHeadroom()) await healEnrichCache({ hasBudget: budgetHasHeadroom, log })
    } catch (e: any) {
      log(`cycle error: ${e?.message || e}`)
      lastNote = `cycle error: ${e?.message || e}`
    } finally {
      running = false
      lastCycleAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    }
  }
  // Drain tick: between fetch cycles, keep working the deferred backlog so Groq runs continuously at
  // the sustainable per-minute pace whenever there's a backlog + daily budget (true 24/7 throttle).
  // Skips entirely when caught up or out of budget; never overlaps a fetch cycle (shared `running`).
  const drain = async () => {
    if (running || backlogCount() === 0 || !budgetHasHeadroom()) return
    running = true
    try {
      const summary = await runAbortableCycle(
        (signal) => runIngestCycle({ log, signal, skipFetch: true, fetchFn: withCycleSignal(fetch, signal) }),
        CYCLE_TIMEOUT_MS,
        () => log(`drain exceeded ${Math.round(CYCLE_TIMEOUT_MS / 1000)}s guard — aborting in-flight work`),
      )
      lastNote = summary.note || lastNote
    } catch (e: any) {
      log(`drain error: ${e?.message || e}`)
    } finally {
      running = false
      lastCycleAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    }
  }

  setTimeout(tick, 5000) // let the server settle, then run the first cycle
  nextCycleAt = new Date(Date.now() + 5000).toISOString().replace(/\.\d{3}Z$/, 'Z')
  timer = setInterval(tick, NEWS.pollIntervalMin * 60_000)
  timer.unref?.()
  drainTimer = setInterval(() => void drain(), DRAIN_INTERVAL_MS)
  drainTimer.unref?.()
  const gemOn = NEWS.geminiEnabled && NEWS.geminiApiKey && NEWS.geminiModels.length
  const overflowLabels = [...(gemOn ? [`gemini×${NEWS.geminiModels.length}`] : []), ...NEWS.overflowProviders.map((p) => p.id)]
  log(`ingester on — fetch every ${NEWS.pollIntervalMin} min, drain every ${Math.round(DRAIN_INTERVAL_MS / 1000)}s · model ${NEWS.groqModel}${overflowLabels.length ? ` (+ overflow: ${overflowLabels.join(', ')})` : ''}${NEWS.rssEnabled ? ' · gdelt+rss' : ' · gdelt only'}`)
}

export function stopNewsIngester(): void {
  if (timer) { clearInterval(timer); timer = null }
  if (drainTimer) { clearInterval(drainTimer); drainTimer = null }
}
