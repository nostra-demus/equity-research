// Groq free-tier guardrails. Two independent protections so the loop "never hits a rate limit":
//   - Budget: a persisted daily counter (requests + tokens). A cycle refuses to call Groq once
//     either daily cap is reached; the counter resets when the UTC date rolls over. Survives restarts
//     (STATE_DIR), so a server bounce can't silently reset and overspend.
//   - RateLimiter: minimum spacing between calls to stay under the requests-per-minute ceiling.
// Defaults (config.NEWS) sit under Groq's published free limits with margin; both are env-tunable.

import fs from 'node:fs'
import path from 'node:path'

// Day key (YYYY-MM-DD) marking the reset boundary. Default UTC; pass an IANA tz (e.g.
// 'America/Los_Angeles') for a provider whose daily quota resets in a specific zone — Gemini's
// requests-per-day resets at midnight Pacific, NOT UTC, so its Budget must key on PT or it would
// reset 7-8h early and risk busting Google's still-counting day.
function dayKey(now = Date.now(), tz?: string): string {
  if (!tz) return new Date(now).toISOString().slice(0, 10)
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

const DAY_MS = 86_400_000
// Fraction of the day elapsed, clamped to [0,1]. Default UTC (Unix time has no leap seconds, so
// `now % DAY_MS` is exactly ms since UTC midnight). With a tz, the fraction is of the LOCAL day.
export function dayFraction(now = Date.now(), tz?: string): number {
  if (tz) {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
    const get = (t: string) => Number(p.find((x) => x.type === t)?.value || 0)
    const f = (get('hour') * 3600 + get('minute') * 60 + get('second')) / 86400
    return f < 0 ? 0 : f > 1 ? 1 : f
  }
  const f = (((now % DAY_MS) + DAY_MS) % DAY_MS) / DAY_MS
  return f < 0 ? 0 : f > 1 ? 1 : f
}

// Daily-budget PACER config. The hard caps (canSpend) stop us BUSTING the day's limit; the pacer stops
// us SPENDING IT ALL AT ONCE. targetTokens is the day's spend goal (usually a few % under the hard cap,
// so a buffer is always held); floorFrac is a small always-available slice that gives a start-of-day
// burst and keeps tiny backlogs clearing when we're exactly on schedule.
export interface PaceCfg { targetTokens: number; floorFrac: number }

/**
 * Cumulative tokens the pacer ALLOWS spent by `now`: the day's target released on a linear schedule
 * across the UTC day, never below a small floor. It is measured against the CLOCK, not against prior
 * spend — so a quiet night carries its unspent allowance forward into the next burst automatically,
 * while a heavy morning can't drain the day (the ceiling only rises as fast as the clock).
 */
export function pacedCeiling(now: number, pace: PaceCfg): number {
  if (!(pace.targetTokens > 0)) return Number.POSITIVE_INFINITY // pacer disabled
  const floor = Math.max(0, Math.min(1, pace.floorFrac))
  return pace.targetTokens * Math.max(dayFraction(now), floor)
}

/**
 * Drain-gate mirror of Budget.pacedCanSpend for callers that only have the on-disk counters (scheduler).
 * True when there is room under BOTH the hard caps AND the pacer's clock-prorated ceiling.
 */
export function pacedHasHeadroom(
  tokens: number, requests: number, reqCap: number, tokenCap: number, pace: PaceCfg, now = Date.now(),
): boolean {
  if (requests >= reqCap || tokens >= tokenCap) return false // hard daily backstop
  return tokens < pacedCeiling(now, pace)
}

interface BudgetState { date: string; requests: number; tokens: number }

export class Budget {
  private state: BudgetState
  constructor(private file: string, private reqCap: number, private tokenCap: number, now = Date.now(), private dayTz?: string) {
    this.state = { date: dayKey(now, dayTz), requests: 0, tokens: 0 }
    try {
      const loaded = JSON.parse(fs.readFileSync(file, 'utf8')) as BudgetState
      // carry the counters only if they belong to today (in this provider's reset zone); else fresh day
      if (loaded && loaded.date === this.state.date) this.state = loaded
    } catch {
      // no prior file → today starts at zero
    }
  }

  static load(stateDir: string, reqCap: number, tokenCap: number, now = Date.now(), fileName = 'groq-budget.json', dayTz?: string): Budget {
    return new Budget(path.join(stateDir, fileName), reqCap, tokenCap, now, dayTz)
  }

  /** Mark today's quota fully spent — e.g. the provider returned a per-DAY 429, so skip it until reset. */
  exhaust(): void { this.state.requests = Math.max(this.state.requests, this.reqCap) }

  /** Headroom for one more call expected to cost ~estTokens. False when either daily cap is reached. */
  canSpend(estTokens: number): boolean {
    if (this.state.requests >= this.reqCap) return false
    if (this.state.tokens + Math.max(0, estTokens) > this.tokenCap) return false
    return true
  }

  /**
   * Headroom under the hard cap AND the daily pacer: spend only while today's running total stays under
   * the clock-prorated ceiling. On a normal-volume day the ceiling outruns demand and this never bites
   * (items triage promptly); on an overload day it meters spend into an even drip so the budget lasts
   * the whole day instead of going dark by noon. `pace.targetTokens <= 0` disables the pacer (falls back
   * to the plain hard-cap canSpend).
   */
  pacedCanSpend(estTokens: number, pace: PaceCfg, now = Date.now()): boolean {
    if (!this.canSpend(estTokens)) return false
    return this.state.tokens + Math.max(0, estTokens) <= pacedCeiling(now, pace)
  }

  record(requests: number, tokens: number): void {
    this.state.requests += Math.max(0, requests)
    this.state.tokens += Math.max(0, tokens)
  }

  save(): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true })
      fs.writeFileSync(this.file, JSON.stringify(this.state))
    } catch {
      // best-effort; a missed write only risks a slightly stale counter next cycle
    }
  }

  get requests(): number { return this.state.requests }
  get tokens(): number { return this.state.tokens }
}

// What Groq tells us about the live rate-limit state, parsed from the response headers (groq.ts).
export interface RateInfo {
  tpmLimit?: number // x-ratelimit-limit-tokens — the per-MINUTE token ceiling (the binding free-tier limit)
  tpmRemaining?: number // x-ratelimit-remaining-tokens
  tpmResetMs?: number // x-ratelimit-reset-tokens, in ms
  rpdRemaining?: number // x-ratelimit-remaining-requests — DAILY requests left
  retryAfterMs?: number // retry-after on a 429
}

/**
 * Adaptive pacer. Two controls, both active:
 *   - a minimum gap between calls (requests/min), and
 *   - a sliding 60-second TOKEN window capped at the per-minute ceiling (the limit that actually bites).
 * The ceiling LEARNS from Groq's response headers (learn()), so it tracks the real account limit and a
 * tier upgrade is picked up automatically. On a 429 / near-empty minute it backs off until reset. The
 * wait loop is bounded so an injected no-op clock (tests) can never hang it.
 */
export class RateLimiter {
  private last = 0
  private minGapMs: number
  private tpm: number
  private window: { t: number; tokens: number }[] = []
  private retryUntil = 0
  constructor(rpm: number, tpm = 0) {
    this.minGapMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0
    this.tpm = tpm > 0 ? tpm : 0
  }

  private prune(now: number): void {
    const cut = now - 60_000
    while (this.window.length && this.window[0].t < cut) this.window.shift()
  }
  private spent60(now: number): number {
    this.prune(now)
    return this.window.reduce((s, w) => s + w.tokens, 0)
  }

  /** Block until both the request gap AND the per-minute token window have room for ~estTokens. */
  async acquire(estTokens = 0, sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now()): Promise<void> {
    // request spacing
    const gap = this.last + this.minGapMs - now()
    if (gap > 0) await sleep(gap)
    // token-per-minute pacing + 429 backoff (bounded loop → never hangs on a frozen test clock)
    if (this.tpm > 0 && estTokens > 0) {
      const cost = Math.min(estTokens, this.tpm) // a single est larger than the whole minute can't deadlock
      for (let i = 0; i < 600; i++) {
        const t = now()
        if (t >= this.retryUntil && this.spent60(t) + cost <= this.tpm) break
        const oldest = this.window.length ? this.window[0].t + 60_000 - t : 0
        const wait = t < this.retryUntil ? this.retryUntil - t : Math.max(0, oldest)
        await sleep(Math.max(200, wait || 250))
      }
      this.window.push({ t: now(), tokens: estTokens })
    }
    this.last = now()
  }

  /** Update the live ceiling + backoff from a response's rate headers. */
  learn(rate?: RateInfo, now = () => Date.now()): void {
    if (!rate) return
    if (rate.tpmLimit && rate.tpmLimit > 0) this.tpm = rate.tpmLimit
    if (rate.retryAfterMs && rate.retryAfterMs > 0) this.retryUntil = Math.max(this.retryUntil, now() + rate.retryAfterMs)
    else if (rate.tpmRemaining != null && this.tpm > 0 && rate.tpmRemaining < this.tpm * 0.04 && rate.tpmResetMs) {
      this.retryUntil = Math.max(this.retryUntil, now() + rate.tpmResetMs) // this minute is nearly spent — wait for reset
    }
  }
  /** Explicit 429 backoff. */
  note429(retryAfterMs = 2000, now = () => Date.now()): void {
    this.retryUntil = Math.max(this.retryUntil, now() + Math.max(1000, retryAfterMs))
  }
}

// One process-wide pacer shared by the ingester's triage AND the on-demand enrichment read, so the two
// never collectively blow the per-minute ceiling (the cause of the 429 bursts). Created once; both
// callers pass the same config values, so the args only seed the singleton.
let shared: RateLimiter | null = null
export function getSharedLimiter(rpm: number, tpm: number): RateLimiter {
  if (!shared) shared = new RateLimiter(rpm, tpm)
  return shared
}

// A SEPARATE process-wide pacer for the Gemini overflow provider (its own per-minute ceiling, isolated
// from the Groq limiter so the two free pools run their minute windows in parallel — that parallelism
// is the throughput gain). Only triage calls Gemini; enrichment stays on Groq.
let sharedGemini: RateLimiter | null = null
export function getSharedGeminiLimiter(rpm: number, tpm: number): RateLimiter {
  if (!sharedGemini) sharedGemini = new RateLimiter(rpm, tpm)
  return sharedGemini
}

// Process-wide pacer for the OpenRouter overflow provider (its own per-minute window, free tier ~20 RPM).
let sharedOpenRouter: RateLimiter | null = null
export function getSharedOpenRouterLimiter(rpm: number, tpm: number): RateLimiter {
  if (!sharedOpenRouter) sharedOpenRouter = new RateLimiter(rpm, tpm)
  return sharedOpenRouter
}
