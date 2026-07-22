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
 * True when there is room under BOTH the hard caps AND the pacer's clock-prorated ceiling. Pass `est` (one
 * batch's estimated tokens) to reserve room for at least that batch — then the answer matches what the
 * triage loop's `Budget.pacedCanSpend(est)` will actually allow (tokens + est), instead of over-reporting
 * headroom for a provider one batch short of its ceiling. `est=0` keeps the original at-cap semantics.
 */
export function pacedHasHeadroom(
  tokens: number, requests: number, reqCap: number, tokenCap: number, pace: PaceCfg, now = Date.now(), est = 0,
): boolean {
  const need = Math.max(0, est)
  if (requests >= reqCap || tokens + need > tokenCap) return false // hard daily backstop (reserve one batch)
  return tokens + need <= pacedCeiling(now, pace)
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

// Cross-cycle PER-PROVIDER cooldown — a third free-tier guardrail, sitting alongside Budget and RateLimiter.
// The in-cycle "stop poking a down provider" flags (runCycle groqDownThisCycle / ov.failed) only live for
// ONE cycle; the scheduler runs many cycles/day, so a sustained outage would still burn one failed probe on
// every cycle — and a 429 / timeout still counts as a request against the daily cap. This marker persists an
// "unhealthy until T" timestamp per provider id in STATE_DIR (`<id>-health.json`) so repeated cycles STOP
// probing a provider that keeps failing (routing to the next provider / deferring) until the window lapses.
// It is armed ONLY on a real failure and cleared on the very next success, so a HEALTHY provider is never
// touched. Shared by EVERY Groq/overflow/Gemini seam (triage, the article-read + auto-heal path, the themes
// namer) so one down provider is skipped everywhere at once, not just in triage.
//
// Two robustness properties matter:
//   - EXPONENTIAL BACKOFF: each consecutive failed probe doubles the window (base, 2×, 4×, … capped at
//     maxMs), so the daily failed-probe count grows only LOGARITHMICALLY with outage length — a sustained
//     outage falls from thousands of probes to a few dozen. That fully protects a large cap (Groq's 13,000
//     — ~50 probes is noise) and drastically cuts waste on the small-cap fallbacks. It does NOT make a
//     TINY-cap provider un-drainable: a >~day-long continuous outage of an overflow provider (~45/day) or a
//     single Gemini model (~20/day) can still APPROACH its cap late in the day — but never EXCEED it
//     (budget.canSpend gates further calls once the cap is reached), and it self-heals at the daily reset,
//     while every other provider (and the primary Groq path) keeps serving.
//   - IN-MEMORY FALLBACK: the marker is mirrored in a process-lifetime map. If the STATE_DIR write fails
//     (e.g. disk full — which correlates with a long outage as backlogs/logs grow), the in-memory marker
//     still gates THIS process, so a persistent write failure can't silently reopen the request-cap burn.
//
// NOTE (per-STATE_DIR scope): markers + budgets are keyed on STATE_DIR. A single-instance ingester lock
// (scheduler.ts) prevents a duplicate ingester in the SAME STATE_DIR. A second engine pointed at a DIFFERENT
// STATE_DIR but the SAME provider account keeps its own markers/budget — bounded ~2× the (already few-dozen)
// per-day probe count, but the two budget mirrors under-count real org spend; avoid running two full
// ingesters against one account.
interface CooldownState { unhealthyUntil: number; fails: number }
const cooldownMem = new Map<string, CooldownState>() // `${stateDir}\0${id}` → state; process-lifetime fallback

function healthFile(id: string): string { return `${id.replace(/[^a-z0-9]+/gi, '-')}-health.json` }
function memKey(stateDir: string, id: string): string { return `${stateDir}\u0000${id}` } // \u0000 (NUL) separator: absent from any path/id, so the key never collides

/** The live cooldown state for a provider: whichever of the on-disk marker and the in-memory fallback is
 *  LATER (disk is the source of truth; the fallback covers a failed write). Absent/unreadable → healthy. */
function readCooldownState(stateDir: string, id: string): CooldownState {
  const mem = cooldownMem.get(memKey(stateDir, id))
  let disk: CooldownState | null = null
  try {
    const s = JSON.parse(fs.readFileSync(path.join(stateDir, healthFile(id)), 'utf8')) as CooldownState
    const until = Number(s?.unhealthyUntil)
    if (Number.isFinite(until) && until > 0) {
      const fails = Number(s?.fails)
      disk = { unhealthyUntil: until, fails: Number.isFinite(fails) && fails > 0 ? fails : 1 }
    }
  } catch {
    // no marker / unreadable → nothing on disk
  }
  if (disk && mem) return disk.unhealthyUntil >= mem.unhealthyUntil ? disk : mem
  return disk || mem || { unhealthyUntil: 0, fails: 0 }
}

/** Epoch ms the provider is considered unhealthy until (0 when there is no live marker). Never throws. */
export function readCooldownUntil(stateDir: string, id = 'groq'): number {
  return readCooldownState(stateDir, id).unhealthyUntil
}

/** True while the provider is still inside its cooldown window — callers skip probing it. */
export function isCoolingDown(stateDir: string, id = 'groq', now = Date.now()): boolean {
  return readCooldownUntil(stateDir, id) > now
}

/** The live cooldown snapshot for a provider — its unhealthy-until epoch (0 = healthy) plus the consecutive
 *  failure count driving the current backoff window. For status/diagnostics readers that need the fail count
 *  `readCooldownUntil` doesn't expose. Never throws. */
export function cooldownInfo(stateDir: string, id = 'groq'): { until: number; fails: number } {
  const s = readCooldownState(stateDir, id)
  return { until: s.unhealthyUntil, fails: s.fails }
}

/** Arm/extend the cooldown on a real failure, with exponential backoff: each consecutive failed probe
 *  doubles the window (baseMs, 2×, 4×, …) capped at maxMs. Persisted to disk AND the in-memory fallback. */
export function armCooldown(stateDir: string, now: number, baseMs: number, id = 'groq', maxMs = 3_600_000): void {
  if (!(baseMs > 0)) return
  const fails = readCooldownState(stateDir, id).fails + 1 // consecutive failures so far (0 when healthy/cleared) + this one
  const window = Math.min(baseMs * Math.pow(2, fails - 1), Math.max(baseMs, maxMs))
  const state: CooldownState = { unhealthyUntil: now + window, fails }
  cooldownMem.set(memKey(stateDir, id), state) // in-memory first — survives a disk-write failure below
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, healthFile(id)), JSON.stringify(state))
  } catch {
    // disk write failed (e.g. disk full during a long outage) — the in-memory marker still gates this
    // process, so the cooldown holds until restart instead of silently reopening the request-cap burn
  }
}

/** Clear the marker (provider recovered) — resets the backoff counter. No-op when none exists. */
export function clearCooldown(stateDir: string, id = 'groq'): void {
  cooldownMem.delete(memKey(stateDir, id))
  try {
    fs.rmSync(path.join(stateDir, healthFile(id)), { force: true })
  } catch {
    // best-effort — a stale marker with a PAST timestamp already reads as healthy anyway
  }
}

/** Test hook only — clears the process-wide in-memory cooldown fallback between hermetic cases. */
export function resetCooldownMemory(): void { cooldownMem.clear() }

interface UsdState { date: string; usd: number; calls: number }

/**
 * A daily DOLLAR ledger — the guardrail for the paid/subscription last-resort tier, whose cost is reported
 * per call (the `claude` CLI's total_cost_usd, or an API usage×price calc) rather than in tokens. The Budget
 * class above meters requests+tokens; this meters spend, which is the unit the operator actually reasons in
 * ("score the overflow, but stop at $5/day and defer the rest").
 *
 * On the SUBSCRIPTION path no card is charged (the plan is flat-fee) — there the reported cost is a proxy
 * for how much of the shared plan quota this tier has drawn, so the same ceiling doubles as the governor
 * that stops news triage starving the research runs. Persisted in STATE_DIR, keyed on the day, so a server
 * restart cannot silently reset the counter and overspend.
 */
export class UsdBudget {
  private state: UsdState
  constructor(private file: string, private capUsd: number, now = Date.now(), private dayTz?: string) {
    this.state = { date: dayKey(now, dayTz), usd: 0, calls: 0 }
    try {
      const loaded = JSON.parse(fs.readFileSync(file, 'utf8')) as UsdState
      if (loaded && loaded.date === this.state.date) this.state = loaded // today's counters; else a fresh day
    } catch {
      // no prior file → today starts at zero
    }
  }

  static load(stateDir: string, capUsd: number, now = Date.now(), fileName = 'anthropic-triage-budget.json', dayTz?: string): UsdBudget {
    return new UsdBudget(path.join(stateDir, fileName), capUsd, now, dayTz)
  }

  /** Room for one more call expected to cost ~estUsd. False once the day's ceiling is reached. NB the
   *  `>=` guard is load-bearing: with the default estUsd=0 a plain `usd + est <= cap` would still answer
   *  TRUE at exactly the ceiling, letting one extra call through every cycle after the budget was spent. */
  canSpend(estUsd = 0): boolean {
    if (this.state.usd >= this.capUsd) return false
    return this.state.usd + Math.max(0, estUsd) <= this.capUsd
  }

  /** Mark the day's ceiling as reached — e.g. a terminal auth/quota error that won't recover today. */
  exhaust(): void { this.state.usd = Math.max(this.state.usd, this.capUsd) }

  record(usd: number): void {
    this.state.usd += Math.max(0, Number(usd) || 0)
    this.state.calls += 1
  }

  save(): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true })
      fs.writeFileSync(this.file, JSON.stringify(this.state))
    } catch {
      // best-effort; a missed write only risks a slightly stale counter next cycle
    }
  }

  get usd(): number { return this.state.usd }
  get calls(): number { return this.state.calls }
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

  /**
   * Block until both the request gap AND the per-minute token window have room for ~estTokens, then
   * reserve the slot. Resolves `true` once acquired.
   *
   * With `maxWaitMs` set, it gives up and resolves `false` the moment the NEXT required wait would push
   * past that budget — without sleeping it out. This is the lever a USER-FACING caller pulls: when the
   * background ingester has the per-minute Groq window saturated, the on-demand article read skips Groq
   * in milliseconds and falls through to the next provider, instead of blocking the HTTP response for up
   * to two minutes. Without `maxWaitMs` (the ingester) the wait is unbounded exactly as before, and the
   * resolved value is simply ignored — so every existing caller is byte-for-byte unaffected.
   */
  async acquire(
    estTokens = 0,
    sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
    now = () => Date.now(),
    maxWaitMs?: number,
  ): Promise<boolean> {
    const deadline = maxWaitMs != null && maxWaitMs >= 0 ? now() + maxWaitMs : Number.POSITIVE_INFINITY
    // request spacing
    const gap = this.last + this.minGapMs - now()
    if (gap > 0) {
      if (now() + gap > deadline) return false // can't even satisfy request spacing within the budget
      await sleep(gap)
    }
    // token-per-minute pacing + 429 backoff (bounded loop → never hangs on a frozen test clock)
    if (this.tpm > 0 && estTokens > 0) {
      const cost = Math.min(estTokens, this.tpm) // a single est larger than the whole minute can't deadlock
      for (let i = 0; i < 600; i++) {
        const t = now()
        if (t >= this.retryUntil && this.spent60(t) + cost <= this.tpm) break
        const oldest = this.window.length ? this.window[0].t + 60_000 - t : 0
        const wait = Math.max(200, (t < this.retryUntil ? this.retryUntil - t : Math.max(0, oldest)) || 250)
        if (t + wait > deadline) return false // the next wait would blow the budget → let the caller move on
        await sleep(wait)
      }
      this.window.push({ t: now(), tokens: estTokens })
    }
    this.last = now()
    return true
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

// Process-wide pacer per named OVERFLOW provider (OpenRouter, NVIDIA, …) — one RateLimiter per id, so each
// provider's per-minute window is isolated and they run in parallel. Created once per id (rpm/tpm seed it).
const namedLimiters = new Map<string, RateLimiter>()
export function getNamedLimiter(id: string, rpm: number, tpm: number): RateLimiter {
  let lim = namedLimiters.get(id)
  if (!lim) { lim = new RateLimiter(rpm, tpm); namedLimiters.set(id, lim) }
  return lim
}

// Test hook only — clears the process-wide limiter singletons. In production these are deliberately shared
// across the ingester AND the on-demand article read (so the two never collectively bust the per-minute
// ceiling). In unit tests that run many cases in ONE process with DIFFERENT injected clocks, that sharing
// would otherwise leak a window entry between cases; reset between cases to keep each hermetic.
export function resetSharedLimiters(): void {
  shared = null
  sharedGemini = null
  namedLimiters.clear()
}
