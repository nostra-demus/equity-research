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
import { pacedCeiling, pacedHasHeadroom } from './triage/budget'
import type { CycleSummary } from './types'

const PACE = { targetTokens: NEWS.groqDailyTokenTarget, floorFrac: NEWS.groqPaceFloorFrac }

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

/** Today's OpenRouter usage (single pooled budget, resets midnight UTC). */
function openRouterUsage(): { used: number; cap: number; tokens: number } | null {
  if (!(NEWS.openRouterEnabled && NEWS.openRouterApiKey && NEWS.openRouterModels.length)) return null
  const today = new Date().toISOString().slice(0, 10)
  let used = 0
  let tokens = 0
  try {
    const o = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'openrouter-budget.json'), 'utf8'))
    if (o?.date === today) { used = Number(o.requests) || 0; tokens = Number(o.tokens) || 0 }
  } catch {
    // fresh / unreadable → 0 used
  }
  return { used, cap: NEWS.openRouterDailyReqCap, tokens }
}

/** Free room left on the OpenRouter daily pool today? */
function openRouterHasHeadroom(): boolean {
  const u = openRouterUsage()
  return !!u && u.used < u.cap
}

/**
 * Is there budget to drain right now? True if Groq has paced headroom OR EITHER free overflow pool
 * (Gemini / OpenRouter) has room. Gating Groq on the pacer spreads an overload day evenly; OR-ing the
 * overflow pools keeps the drain clearing the backlog on their separate free quotas once Groq is paced.
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
  return groqOk || geminiHasHeadroom() || openRouterHasHeadroom()
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
  // the Gemini free-tier overflow pool (absent when no key) — second provider that lifts daily throughput
  gemini?: { enabled: boolean; model: string; requests: number; tokens: number; reqCap: number; tokenCap: number }
  // the OpenRouter free-tier overflow pool (absent when no key) — third provider, strongest free models
  openrouter?: { enabled: boolean; model: string; requests: number; tokens: number; reqCap: number }
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
      today.read += c.candidates || 0
      today.kept += (c.picked || 0) + (c.watched || 0)
      today.dropped += c.dropped || 0
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
  const pool = geminiPoolUsage()
  let gemini: NewsStatus['gemini']
  if (pool) {
    const n = NEWS.geminiModels.length
    gemini = { enabled: true, model: `${n} model${n === 1 ? '' : 's'} (${NEWS.geminiModel}…)`, requests: pool.used, tokens: pool.tokens, reqCap: pool.cap, tokenCap: NEWS.geminiDailyTokenCap * n }
  }
  const or = openRouterUsage()
  let openrouter: NewsStatus['openrouter']
  if (or) {
    const lead = (NEWS.openRouterModels[0] || '').split('/').pop() || 'free'
    openrouter = { enabled: true, model: `${NEWS.openRouterModels.length} model${NEWS.openRouterModels.length === 1 ? '' : 's'} (${lead}…)`, requests: or.used, tokens: or.tokens, reqCap: or.cap }
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
    ...(gemini ? { gemini } : {}),
    ...(openrouter ? { openrouter } : {}),
  }
}

export function startNewsIngester(): void {
  if (!NEWS.enabled) {
    // eslint-disable-next-line no-console
    console.log(NEWS.groqApiKey ? '[news] ingester disabled (NEWS_INGEST_ENABLED=0)' : '[news] ingester idle — set GROQ_API_KEY to turn it on')
    return
  }
  if (timer) return
  const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console
  const tick = async () => {
    if (running) return // never overlap cycles
    running = true
    // next fire is interval-anchored from the tick START (matches setInterval's cadence)
    nextCycleAt = new Date(Date.now() + NEWS.pollIntervalMin * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    try {
      const summary = await runIngestCycle({ log })
      lastNote = summary.note || null
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
      const summary = await runIngestCycle({ log, skipFetch: true })
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
  log(`ingester on — fetch every ${NEWS.pollIntervalMin} min, drain every ${Math.round(DRAIN_INTERVAL_MS / 1000)}s · model ${NEWS.groqModel}${NEWS.geminiEnabled && NEWS.geminiApiKey && NEWS.geminiModels.length ? ` (+ ${NEWS.geminiModels.length}-model gemini overflow)` : ''}${NEWS.openRouterEnabled && NEWS.openRouterApiKey && NEWS.openRouterModels.length ? ` (+ openrouter overflow)` : ''}${NEWS.rssEnabled ? ' · gdelt+rss' : ' · gdelt only'}`)
}

export function stopNewsIngester(): void {
  if (timer) { clearInterval(timer); timer = null }
  if (drainTimer) { clearInterval(drainTimer); drainTimer = null }
}
