// In-server scheduler — the "runs whenever the cockpit is up" hosting mode. One guarded call from
// server.ts after the control plane binds; if no triage provider exists (or NEWS_INGEST_ENABLED=0) it logs
// once and stays dark, so a providerless deploy behaves exactly as before. A cycle never throws and never
// blocks the event loop; the interval is unref'd so it can't, by itself, keep the process alive.
//
// The scheduler also carries the ingester's STATUS for the cockpit's auto-scan chip: when the last
// cycle ran, when the next is due, and today's read/kept/dropped — the daily counts are summed from
// the firehose file on disk so a server restart never zeroes them.

import fs from 'node:fs'
import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { acquireSingletonLock, releaseSingletonLock } from '../singleton-lock'
import { readFeed } from './feed'
import { refreshBoard } from './write-inbox'
import { DEFERRED_CAP, inspectDeferredBacklog, loadDeferred, runIngestCycle, triageGroqTokenBound } from './runCycle'
import { healEnrichCache } from './enrich-heal'
import { runIdeaPass } from './ideas/run-idea-pass'
import { initializeIdeasHealth, inspectIdeaSnapshots, updateIdeasHealth } from './ideas/ideas-health'
import { runQualifiedIdeaOutcomePass } from '../qualified-idea-outcome-runner'
import {
  conservativeChatUsdBound, cooldownInfo, dailyQuotaAdmission, inspectBudgetLedger, inspectUsdLedger,
  isCoolingDown, pacedCeiling, pacedHasHeadroom, usdAmountFits,
} from './triage/budget'
import { SYSTEM, buildUserMessage, estimateTokens } from './triage/groq'
import { preTriagePriority } from './rank'
import type { CycleSummary, DeferReason, LastResortState } from './types'

// The news-lead skim config, assembled once from NEWS. It reuses the ingester's canonical OpenAI-compatible
// local/Groq/overflow registry and each tier's own budget, limiter, and cooldown — one accounting path, with
// no hand-wired provider names beyond the grandfathered Groq primary descriptor.
const IDEA_PASS_CONFIG = {
  topN: NEWS.ideasTopN,
  shelfLifeHrs: NEWS.ideasShelfLifeHrs,
  inputMaxAgeHrs: NEWS.ideasInputMaxAgeHrs,
  themesEnabled: NEWS.themesEnabled,
  minIntervalSec: NEWS.ideasMinIntervalSec,
  refreshSec: NEWS.ideasRefreshSec,
  groqApiKey: NEWS.groqApiKey,
  groqBaseUrl: NEWS.groqBaseUrl,
  groqModel: NEWS.groqModel,
  groqMaxTokens: NEWS.ideasMaxTokens,
  groqDailyReqCap: NEWS.groqDailyReqCap,
  groqDailyTokenCap: NEWS.groqDailyTokenCap,
  groqDailyTokenTarget: NEWS.groqDailyTokenTarget,
  groqPaceFloorFrac: NEWS.groqPaceFloorFrac,
  freeProviderPaceFloorFrac: NEWS.freeProviderPaceFloorFrac,
  groqRpm: NEWS.groqRpm,
  groqTpm: NEWS.groqTpm,
  llmCooldownMs: NEWS.llmCooldownMs,
  llmCooldownMaxMs: NEWS.llmCooldownMaxMs,
  localCooldownMs: NEWS.localCooldownMs,
  localProvider: NEWS.localProvider,
  overflowProviders: NEWS.overflowProviders,
  geminiEnabled: NEWS.geminiEnabled,
  geminiApiKey: NEWS.geminiApiKey,
  geminiBaseUrl: NEWS.geminiBaseUrl,
  geminiModels: NEWS.geminiModels,
  geminiMaxTokens: NEWS.ideasMaxTokens,
  geminiDailyTokenCap: NEWS.geminiDailyTokenCap,
  geminiDayTz: NEWS.geminiDayTz,
  geminiRpm: NEWS.geminiRpm,
  geminiTpm: NEWS.geminiTpm,
  limiterWaitMs: 4000, // give up a busy tier's minute window quickly, then try the next one
}

/** One configured lead-skim pass shared by both runtime topologies (in-process scheduler and the
 * standalone launchd cycle). Keeping this in one place prevents production from silently omitting a
 * feature the cockpit-hosted scheduler happens to run. */
export async function runConfiguredIdeaPass(log: (m: string) => void = () => {}) {
  // The standalone entrypoint deliberately runs Ideas under the provider lease even when title ingestion
  // is disabled. Ideas consumes an already-persisted, freshness-checked sweep and has its own provider
  // registry; NEWS_INGEST_ENABLED must not silently disable this independent coverage path.
  if (!NEWS.ideasEnabled || !NEWS.ideaProviderConfigured) {
    const at = Date.now()
    const ideasDisabled = !NEWS.ideasEnabled
    updateIdeasHealth(STATE_DIR, {
      enabled: NEWS.ideasEnabled, status: ideasDisabled ? 'disabled' : 'error', outcome: 'not_run',
      reason_code: ideasDisabled ? 'disabled' : 'missing_api_key',
      reason: ideasDisabled
        ? 'The idea pass is disabled by IDEAS_ENABLED=0.'
        : 'The idea pass has no configured local, Groq, Gemini, or OpenAI-compatible fallback provider.',
      next_eligible_at: null,
      input_count: 0, produced_count: 0,
    }, at, inspectIdeaSnapshots(REPO_ROOT, at))
    return {
      ran: false, produced: 0,
      note: ideasDisabled ? 'disabled' : 'missing_api_key',
      reason_code: ideasDisabled ? 'disabled' as const : 'missing_api_key' as const,
    }
  }
  return runIdeaPass({
    repoRoot: REPO_ROOT, stateDir: STATE_DIR, config: IDEA_PASS_CONFIG,
    refreshBoard: () => refreshBoard(REPO_ROOT, log), log, persistHealth: true,
  })
}

/** Outcome settlement is independent of whether the cheap lead skim is enabled. */
export async function runConfiguredQualifiedIdeaOutcomes(log: (m: string) => void = () => {}) {
  try { return await runQualifiedIdeaOutcomePass(REPO_ROOT, Date.now(), STATE_DIR) }
  catch (e: any) { log(`qualified idea outcome pass error: ${e?.message || e}`); return null }
}

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
let initialTickTimer: ReturnType<typeof setTimeout> | null = null
let ingesterRetryTimer: ReturnType<typeof setTimeout> | null = null
let outcomeTimer: ReturnType<typeof setInterval> | null = null
let outcomeRunning = false
let running = false
let lastCycleAt: string | null = null
let nextCycleAt: string | null = null
let lastNote: string | null = null
// True when another engine owns the ingester lock for this data dir, so THIS process serves the cockpit but
// never fetches/scores (read-only). Surfaced in status/diagnostics so "why am I not scanning?" is answerable.
let readOnlyMode = false
let providerSpendingOwner = false

/** Only the process that owns the retained ingester lease may spend from the shared news-provider pools.
 * A standalone ingest process can briefly own that lease while this HTTP server is still serving. In
 * that topology the read-only server must keep serving cached/deterministic responses, but must not run
 * its own Groq/overflow/Gemini calls: their daily budgets are disk-atomic, while minute windows and
 * learned provider retry state deliberately live with the one active owner. */
export function providerSpendingAllowedForState(ingestionEnabled: boolean, readOnly: boolean, owner: boolean): boolean {
  return ingestionEnabled && !readOnly && owner
}

export function newsProviderSpendingAllowed(): boolean {
  // Interactive provider calls share the in-process limiter/cooldown state of the enabled scheduler.
  // An HTTP-only process never spends provider capacity: in the supported standalone topology the short-
  // lived `ingest:once` owner has the provider keys and lease, while this process serves deterministic/cache
  // responses. This prevents two independent minute limiters from bursting the same provider account.
  const providerWorkEnabled = NEWS.enabled || (NEWS.ideasEnabled && NEWS.ideaProviderConfigured)
  return providerSpendingAllowedForState(providerWorkEnabled, readOnlyMode, providerSpendingOwner)
}

/** Diagnostics describe the shared pipeline, not only this HTTP process. A read-only cockpit means another
 * owner is active and its disk-backed retry/day state remains actionable; globally disabled/no-owner does not. */
export function providerDiagnosticsActiveForState(ingestionEnabled: boolean, readOnly: boolean, owner: boolean): boolean {
  return ingestionEnabled && (readOnly || owner)
}

/** Avoid redundant interval calls inside this process. The runner's repository lock is the authoritative
 * whole-pass singleton across every engine process pointed at the same research ledgers. */
async function runScheduledQualifiedIdeaOutcomes(
  log: (m: string) => void,
  run: (log: (m: string) => void) => Promise<unknown> = runConfiguredQualifiedIdeaOutcomes,
): Promise<void> {
  if (outcomeRunning) return
  outcomeRunning = true
  try { await run(log) }
  finally { outcomeRunning = false }
}

/** Start the exact-horizon settlement clock. It is deliberately separate from news ingestion: full
 * research outcomes still mature when the cheap news skim is disabled, missing a provider key, or
 * serving read-only because another process owns the ingester lock. Returns false when already active. */
export function startQualifiedIdeaOutcomeLoop(
  log: (m: string) => void = () => {},
  options: { intervalMs?: number; run?: (log: (m: string) => void) => Promise<unknown> } = {},
): boolean {
  if (outcomeTimer) return false
  const run = options.run || runConfiguredQualifiedIdeaOutcomes
  const intervalMs = Math.max(10, options.intervalMs ?? Math.max(60_000, NEWS.pollIntervalMin * 60_000))
  void runScheduledQualifiedIdeaOutcomes(log, run)
  outcomeTimer = setInterval(() => { void runScheduledQualifiedIdeaOutcomes(log, run) }, intervalMs)
  outcomeTimer.unref?.()
  return true
}

/** Stop the settlement clock. An already-running pass is allowed to finish; no later pass is queued. */
export function stopQualifiedIdeaOutcomeLoop(): void {
  if (outcomeTimer) { clearInterval(outcomeTimer); outcomeTimer = null }
}

// How often the drain tick works the deferred backlog (no fetch). Short, so the daily-budget pacer
// releases its clock-prorated allowance in small frequent sub-bursts (an even all-day drip) rather than
// one lump per fetch — the per-minute RateLimiter still governs the instantaneous rate, and the pacer's
// own clock ceiling governs how much of the day's budget is available right now.
const DRAIN_INTERVAL_MS = Math.max(30, Number(process.env.NEWS_DRAIN_INTERVAL_SEC) || 60) * 1000

/** How many items are waiting un-triaged in the deferred spillover (read-only, never throws). */
function backlogCount(): number {
  const backlog = inspectDeferredBacklog(STATE_DIR)
  return backlog.available ? backlog.items.length : 0
}
/** Today's date in the Gemini reset zone (midnight Pacific), matching the per-model Budget day key. */
function geminiToday(now = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NEWS.geminiDayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** A model pool is provider-day-exhausted only when every configured bucket reported it. One closed model
 * is ordinary rotation state while another model can still take the batch. */
export function geminiPoolProviderDayExhausted(reportedModels: number, configuredModels: number): boolean {
  return configuredModels > 0 && reportedModels === configuredModels
}

/** Aggregate today's usage across the Gemini model-rotation pool (each model = a separate daily bucket). */
function geminiPoolUsage(): { used: number; cap: number; tokens: number; providerDayExhausted: boolean; ledgerUnavailable: boolean } | null {
  if (!(NEWS.geminiEnabled && NEWS.geminiApiKey && NEWS.geminiModels.length)) return null
  const day = geminiToday()
  let used = 0
  let tokens = 0
  let cap = 0
  let providerDayExhaustedModels = 0
  let unavailableModels = 0
  for (const e of NEWS.geminiModels) {
    cap += e.dailyReqCap
    const file = `gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`
    const g = readDailyBudget(file, day)
    if (g.ledgerUnavailable) { unavailableModels++; continue }
    used += g.requests
    tokens += g.tokens
    if (g.providerDayExhausted) providerDayExhaustedModels++
  }
  // This is an aggregate lane: one model's day bucket can close while another remains callable. Label the
  // POOL provider-day-exhausted only when every configured model reported that state; otherwise the healthy
  // model must remain “Eligible to try” and the closed member is merely internal rotation state.
  return {
    used, cap, tokens,
    providerDayExhausted: geminiPoolProviderDayExhausted(providerDayExhaustedModels, NEWS.geminiModels.length),
    ledgerUnavailable: unavailableModels > 0,
  }
}

/** Pure: the token reservation for the NEXT batch the drain loop would actually submit, given how many
 *  items are waiting — min(backlogItems, NEWS.triageBatch), not a fixed full-batch estimate. When fewer
 *  than a full batch remain (e.g. 1 queued item, ~595 tokens), reserving the default 12-item batch's
 *  ~1,640 tokens made a provider with room for the real, smaller submission read as "spent" and the drain
 *  skip it (Codex review, PR #316). An empty backlog reserves estimateTokens(0) — the fixed per-call
 *  overhead, not zero. Exported + pure so it is unit-testable without a filesystem backlog fixture. */
export function drainBatchEst(backlogItems: number): number { return estimateTokens(Math.min(Math.max(0, backlogItems), NEWS.triageBatch)) }

/** Strict hard-cap reservation for the batch currently waiting on disk. Unlike `drainBatchEst` (a calibrated
 * rate-limiter estimate), this includes the complete prompt bytes + configured output ceiling, matching
 * runCycle's daily-budget admission. Diagnostics use it before saying a token-gated tier can take work.
 * With no waiting work there is no concrete next call to reserve, so only the already-recorded cap applies. */
function diagnosticBatchTokenBound(batch: ReturnType<typeof loadDeferred>, maxTokens: number): number {
  if (!batch.length) return 0
  return triageGroqTokenBound(batch, { model: '', baseUrl: '', apiKey: '', maxTokens })
}

/** Pure: can a request/token-gated free provider (overflow provider OR one Gemini pool model) score a batch
 *  RIGHT NOW? Not in a failure cooldown, under its request cap, and — when token-gated — with room for one
 *  more batch (tokens + est), not merely strictly under the token cap. This mirrors the triage loop's real
 *  pick `!ov.coolingDown && ov.budget.canSpend(est)` (runCycle); factored out (like anthropicDrainReady) so
 *  the drain gate stops lying about a cooling or one-batch-short provider — and so it is unit-testable. */
export function providerDrainUsable(cooling: boolean, used: number, reqCap: number, tokens: number, tokenCap: number | undefined, est: number): boolean {
  if (cooling) return false // cooling → the loop skips it
  if (used >= reqCap) return false // request cap reached
  if (tokenCap != null && tokens + Math.max(0, est) > tokenCap) return false // can't fit one more batch
  return true
}

/** Is ANY Gemini pool model usable RIGHT NOW — not in a failure cooldown AND under its own daily request
 *  cap? Mirrors the triage loop's `gemPick` (runCycle) and the diagnostics pool read, so the drain gate
 *  cannot call the pool "has headroom" when its only budgeted model is cooling. The pool-aggregate check it
 *  replaces (used < cap across all models) hid exactly that case. */
function geminiAnyUsableNow(now = Date.now()): boolean {
  if (!(NEWS.geminiEnabled && NEWS.geminiApiKey && NEWS.geminiModels.length)) return false
  const day = geminiToday(now)
  const batch = loadDeferred(STATE_DIR).slice(0, NEWS.triageBatch)
  const strictCost = diagnosticBatchTokenBound(batch, NEWS.geminiMaxTokens)
  for (const e of NEWS.geminiModels) {
    const g = readDailyBudget(`gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`, day)
    if (g.ledgerUnavailable) continue
    const retryHeld = triageRetryInfo(`gemini:${e.model}`, now).until > now
    const hardFit = !g.dayUnavailable
      && providerDrainUsable(retryHeld, g.requests, e.dailyReqCap, g.tokens, NEWS.geminiDailyTokenCap, strictCost || 1)
    const pacedFit = dailyQuotaAdmission({
      id: `gemini:${e.model}`, meter: 'requests', used: g.requests, cap: e.dailyReqCap, cost: 1,
      resetTimeZone: NEWS.geminiDayTz, floorFraction: NEWS.freeProviderPaceFloorFrac,
    }, now).pacedFit
    if (hardFit && pacedFit) return true
  }
  return false
}

/** Any Gemini pool model usable right now (drain-gate wrapper over geminiAnyUsableNow). */
function geminiHasHeadroom(now = Date.now()): boolean {
  return geminiAnyUsableNow(now)
}

/** Today's usage for one OpenAI-compatible overflow provider (its own budget file, reset zone p.dayTz). */
function overflowUsage(p: (typeof NEWS.overflowProviders)[number]): { id: string; label: string; color: string; used: number; cap: number; tokens: number; dayUnavailable: boolean; providerDayExhausted: boolean; ledgerUnavailable: boolean } {
  const day = p.dayTz ? new Intl.DateTimeFormat('en-CA', { timeZone: p.dayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now()) : new Date().toISOString().slice(0, 10)
  const ledger = readDailyBudget(p.budgetFile, day)
  return {
    id: p.id, label: p.label, color: p.color, used: ledger.requests, cap: p.dailyReqCap,
    tokens: ledger.tokens, dayUnavailable: ledger.dayUnavailable,
    providerDayExhausted: ledger.providerDayExhausted, ledgerUnavailable: ledger.ledgerUnavailable,
  }
}

/** Can ANY OpenAI-compatible overflow provider score a batch RIGHT NOW? Mirrors the triage loop's real pick
 *  (`!ov.coolingDown && ov.budget.canSpend(est)`, runCycle): not in a failure cooldown, under its request
 *  cap, and — for a token-gated provider (Cerebras) — with room for one more batch (tokens + est), not just
 *  strictly under the cap. The old check was BOTH cooldown-blind (a cooling provider with request budget —
 *  e.g. NVIDIA at 34/150 while cooling — read as headroom, so the drain ran and scored 0) and est-blind (a
 *  token-gated Cerebras one batch short of its 900k cap read as headroom the loop then skipped). */
function overflowHasHeadroom(now = Date.now()): boolean {
  const batch = loadDeferred(STATE_DIR).slice(0, NEWS.triageBatch)
  return NEWS.overflowProviders.some((p) => {
    const u = overflowUsage(p)
    if (u.ledgerUnavailable || u.dayUnavailable) return false
    const strictCost = diagnosticBatchTokenBound(batch, p.maxTokens)
    const retryHeld = triageRetryInfo(p.id, now).until > now
    const hardFit = providerDrainUsable(retryHeld, u.used, u.cap, u.tokens, p.dailyTokenCap, strictCost)
    if (!hardFit) return false
    if (p.id === 'local') return true // demoted local is intentionally unpaced
    return dailyQuotaAdmission({
      id: p.id,
      meter: p.dailyTokenCap != null ? 'tokens' : 'requests',
      used: p.dailyTokenCap != null ? u.tokens : u.used,
      cap: p.dailyTokenCap ?? u.cap,
      // With no deferred triage batch this predicate is gating article-cache healing, whose exact prompt
      // is checked again by its own reservation. A one-unit probe preserves the broad "some allowance"
      // answer instead of disabling healing whenever the triage queue happens to be empty.
      cost: p.dailyTokenCap != null ? (strictCost || 1) : 1,
      resetTimeZone: p.dayTz,
      floorFraction: p.paceFloorFrac ?? NEWS.freeProviderPaceFloorFrac,
    }, now).pacedFit
  })
}

/**
 * Is there budget to drain right now? True if Groq has paced headroom OR any free overflow pool (Gemini or
 * an OpenAI-compatible provider) has room. Gating Groq on the pacer spreads an overload day evenly; OR-ing
 * the overflow pools keeps the drain clearing the backlog on their separate free quotas once Groq is paced.
 */
export function budgetHasHeadroom(now = Date.now()): boolean {
  const today = new Date(now).toISOString().slice(0, 10)
  const batch = loadDeferred(STATE_DIR).slice(0, NEWS.triageBatch)
  const strictCost = diagnosticBatchTokenBound(batch, NEWS.triageMaxTokens)
  let groqOk = Boolean(NEWS.groqApiKey) && triageRetryInfo('groq', now).until <= now
  if (groqOk) {
    const b = readDailyBudget('groq-budget.json', today)
    // Groq is drain-usable only if its durable authority is valid, it is not day-closed, and one complete
    // batch fits the same hard-cap+pacer predicate used by admission. A missing file is the sole fresh case.
    groqOk = !b.ledgerUnavailable && !b.dayUnavailable
      && pacedHasHeadroom(b.tokens, b.requests, NEWS.groqDailyReqCap, NEWS.groqDailyTokenCap, PACE, now, strictCost)
  }
  return groqOk || geminiHasHeadroom(now) || overflowHasHeadroom(now)
}

/**
 * Can the Haiku last-resort tier absorb backlog RIGHT NOW? Pure decision (no I/O) so it is unit-testable,
 * in the style of tierHealth: enabled AND not in a cross-cycle failure cooldown AND still under its daily
 * $ ceiling. The drain gate has to know this: the last-resort exists to soak up exactly this backlog, so
 * on an overload day when every FREE tier is tapped out but Haiku still has budget, the drain must run for
 * Haiku to clear it. Omitting it here was the real defect behind "N items deferred" climbing toward the
 * loss cap — budgetHasHeadroom saw the free tiers spent, returned false, and the frequent drain never ran,
 * so the backlog could only nibble down at the much slower fetch cadence while fresh items kept arriving.
 */
export function anthropicDrainReady(
  enabled: boolean, coolingDown: boolean, usdToday: number, usdCap: number,
  topPriority = Infinity, minPriority = 0, nextCallUsd = 0,
): boolean {
  const reserve = Number.isFinite(nextCallUsd) ? Math.max(0, nextCallUsd) : Number.POSITIVE_INFINITY
  if (!(enabled && !coolingDown && usdAmountFits(usdToday, reserve, usdCap))) return false
  // Respect the priority floor. runCycle scores a batch on Haiku only when its LEAD item clears
  // anthropicMinPriority (runCycle: `preTriagePriority(batch[0]) >= cfg.anthropicMinPriority`), and the queue
  // is priority-sorted, so the whole-backlog max IS the first batch's lead. If even that is below the floor,
  // Haiku refuses EVERY batch — a drain gated on Haiku alone would then make zero progress and re-defer the
  // identical backlog every DRAIN_INTERVAL, churning the firehose + the deferred file each minute. So when
  // Haiku is the only usable tier and the backlog's best item is sub-floor, report NO headroom.
  // (Default minPriority 0 → topPriority defaults to Infinity → the check is a no-op for the common case.)
  return topPriority >= minPriority
}

/** Highest pre-triage priority in the deferred backlog RIGHT NOW (recency-decayed). Decides whether a
 *  Haiku-only drain can make ANY progress against the anthropicMinPriority floor. Read-only; 0 on an
 *  empty/unreadable backlog. Only consulted when a floor is configured (minPriority > 0). */
function maxBacklogPriority(now = Date.now()): number {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'news-deferred.json'), 'utf8'))
    if (!Array.isArray(arr) || !arr.length) return 0
    const d = new Date(now)
    let max = -Infinity
    for (const it of arr) { const p = preTriagePriority(it, d); if (p > max) max = p }
    return Number.isFinite(max) ? max : 0
  } catch {
    return 0
  }
}

/** Live read of anthropicDrainReady from disk (config flags + the $ ledger + both retry scopes). */
export function anthropicHasHeadroom(now = Date.now()): boolean {
  const enabled = NEWS.anthropicFallbackEnabled && (NEWS.anthropicFallbackMode === 'subscription' || !!NEWS.anthropicApiKey)
  if (!enabled) return false
  // Match runCycle's triageIsHeld decision exactly. A request/contract/attempt-timeout is deliberately
  // workload-scoped, but it still makes another Anthropic TRIAGE drain no-progress until that clock opens.
  // Reading only the shared marker made the scheduler launch an identical drain every minute while the
  // cycle immediately skipped the held tier and re-deferred the same backlog.
  const cooling = triageRetryInfo('anthropic-triage', now).until > now
  const u = readDailyUsd('anthropic-triage-budget.json', new Date(now).toISOString().slice(0, 10))
  if (u.ledgerUnavailable) return false
  const batch = loadDeferred(STATE_DIR).slice(0, NEWS.triageBatch)
  const nextCallUsd = NEWS.anthropicFallbackMode === 'subscription'
    ? Math.max(0, NEWS.anthropicPerCallUsd)
    : conservativeChatUsdBound(
        SYSTEM,
        buildUserMessage(batch),
        NEWS.anthropicMaxTokens,
        NEWS.anthropicInPricePerMTok,
        NEWS.anthropicOutPricePerMTok,
      )
  // Only pay for the backlog scan when a floor is actually set (default 0 → skip, topPriority stays Infinity).
  const topPriority = NEWS.anthropicMinPriority > 0 ? maxBacklogPriority(now) : Infinity
  return anthropicDrainReady(true, cooling, u.usd, NEWS.anthropicDailyUsd, topPriority, NEWS.anthropicMinPriority, nextCallUsd)
}

/**
 * Can the LOCAL tier absorb backlog RIGHT NOW? Only meaningful when local is PRIMARY: NEWS.localProvider is
 * set exactly then, and in that mode local is deliberately NOT in overflowProviders (config.buildOverflow-
 * Providers), so overflowHasHeadroom cannot see it. A DEMOTED local rejoins that array and is already
 * covered there — hence the localProvider guard rather than a flat "is local enabled".
 * Local is unlimited and $0 (no request/token/usd ceiling), so the only gate is a failure cooldown.
 * Omitting it was a real drain-gate hole: with local primary and every cloud tier spent, budgetHasHeadroom
 * and anthropicHasHeadroom both returned false, so the 60s drain never ran — even though the one tier with
 * NO ceiling could have cleared the entire backlog.
 */
function localHasHeadroom(now = Date.now()): boolean {
  if (!NEWS.localProvider) return false
  const day = NEWS.localProvider.dayTz
    ? new Intl.DateTimeFormat('en-CA', { timeZone: NEWS.localProvider.dayTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
    : new Date(now).toISOString().slice(0, 10)
  const ledger = readDailyBudget(NEWS.localProvider.budgetFile, day)
  return !ledger.ledgerUnavailable && !ledger.dayUnavailable && triageRetryInfo('local', now).until <= now
}

/**
 * The DRAIN gate: is there ANY tier that can score a batch right now? The free-tier budget check
 * (budgetHasHeadroom), the unlimited LOCAL tier when it is primary, OR the Haiku last-resort still having
 * room. Kept separate from budgetHasHeadroom because that predicate ALSO gates the Groq-bound heal + idea
 * passes, which the paid last-resort must not turn on — only the backlog drain (which routes through every
 * tier, local and Haiku included) may.
 */
function drainHasHeadroom(now = Date.now()): boolean {
  return budgetHasHeadroom(now) || localHasHeadroom(now) || anthropicHasHeadroom(now)
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
  // true when another engine owns the ingester lock → this process is read-only (serves but never scans)
  readOnly: boolean
  // items waiting un-triaged in the deferred spillover, and the loss boundary they are counted against.
  // A first-class field so the cockpit can show the backlog depth without the heavier diagnostics call.
  backlog: { count: number; cap: number; unavailable?: boolean }
  today: { read: number; kept: number; dropped: number; cycles: number }
  // tokenTarget = the pacer's day goal; paceCeiling = tokens allowed spent BY NOW under the clock
  // schedule (tokens ≈ paceCeiling ⇒ the pacer is metering; tokens ≪ paceCeiling ⇒ free-flowing).
  budget: {
    requests: number; tokens: number; reqCap: number; tokenCap: number; tokenTarget: number; paceCeiling: number
    enabled: boolean; unlimited: false; spendingAllowed: boolean; health: TierHealth
    providerDayExhausted?: boolean; ledgerUnavailable?: boolean
    cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string
  }
  // every free OVERFLOW pool (Gemini + each OpenAI-compatible provider), one entry per provider. The cockpit
  // renders a chip per entry, so a newly-added provider appears automatically. Empty when none are keyed.
  // tokenCap is set ONLY for TOKEN-gated providers (e.g. Cerebras) — the cockpit then shows the chip in
  // tokens (its BINDING limit) instead of requests, so the readout is ground truth, not a non-binding proxy.
  overflow: {
    id: string; label: string; color: string; model: string; requests: number; reqCap: number; tokens: number; tokenCap?: number
    enabled: boolean; unlimited: boolean; spendingAllowed: boolean; health: TierHealth
    providerDayExhausted?: boolean; ledgerUnavailable?: boolean
    cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string
  }[]
  // the LOCAL primary brain — the unlimited $0 tier tried FIRST for every batch when enabled AND primary
  // (NEWS_LOCAL_PRIMARY, default on once enabled). Absent when local is off OR demoted to a fallback (it then
  // appears in `overflow` instead). The cockpit renders this FIRST and prominently, showing live tokens/requests
  // processed today — there is deliberately NO cap to show, so it reads "N tok · M req today", not a used/cap bar.
  local?: {
    id: string; label: string; color: string; model: string; requests: number; tokens: number
    enabled: true; unlimited: true; spendingAllowed: boolean; health: TierHealth
    providerDayExhausted?: boolean; cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string; ledgerUnavailable?: boolean
  }
}

/** Status for the cockpit. Daily counts come from today's firehose ON DISK (restart-proof). */
export function getNewsStatus(): NewsStatus {
  const todayDate = new Date().toISOString().slice(0, 10)
  const statusNow = Date.now()
  const backlogInspection = inspectDeferredBacklog(STATE_DIR)
  const diagnosticBatch = backlogInspection.available ? backlogInspection.items.slice(0, NEWS.triageBatch) : []
  const spendingAllowed = providerDiagnosticsActiveForState(NEWS.enabled, readOnlyMode, providerSpendingOwner)
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
  const groqLedger = readDailyBudget('groq-budget.json', todayDate)
  const groqEnabled = !!NEWS.groqApiKey
  const groqRetry = triageRetryInfo('groq', statusNow)
  const groqCoolMs = Math.max(0, groqRetry.until - statusNow)
  const groqEst = diagnosticBatchTokenBound(diagnosticBatch, NEWS.triageMaxTokens)
  const groqSpent = groqLedger.dayUnavailable || groqLedger.requests >= NEWS.groqDailyReqCap
    || groqLedger.tokens >= NEWS.groqDailyTokenCap
    || (diagnosticBatch.length > 0 && groqLedger.tokens + groqEst > NEWS.groqDailyTokenCap)
  const groqPaced = groqEnabled && !groqSpent && diagnosticBatch.length > 0
    && !pacedHasHeadroom(groqLedger.tokens, groqLedger.requests, NEWS.groqDailyReqCap, NEWS.groqDailyTokenCap, PACE, statusNow, groqEst)
  const budget: NewsStatus['budget'] = {
    requests: groqLedger.requests, tokens: groqLedger.tokens, reqCap: NEWS.groqDailyReqCap, tokenCap: NEWS.groqDailyTokenCap,
    tokenTarget: NEWS.groqDailyTokenTarget, paceCeiling: Math.round(pacedCeiling(statusNow, PACE)),
    enabled: groqEnabled, unlimited: false, spendingAllowed,
    health: tierHealth(groqEnabled, groqCoolMs, groqSpent, groqPaced, groqLedger.ledgerUnavailable),
    ...(groqLedger.providerDayExhausted ? { providerDayExhausted: true } : {}),
    ...(groqLedger.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
    ...retryDiagnostics(groqRetry, statusNow),
  }
  const overflow: NewsStatus['overflow'] = []
  const pool = geminiPoolUsage()
  if (pool) {
    const n = NEWS.geminiModels.length
    let anyUsable = false
    let anyHardFit = false
    let anyPacedFit = false
    let nextRetry: RetryInfo | null = null
    const geminiEst = diagnosticBatchTokenBound(diagnosticBatch, NEWS.geminiMaxTokens)
    const day = geminiToday(statusNow)
    for (const model of NEWS.geminiModels) {
      const ledger = readDailyBudget(`gemini-budget-${model.model.replace(/[^a-z0-9]+/gi, '-')}.json`, day)
      if (ledger.ledgerUnavailable || ledger.dayUnavailable) continue
      const retry = triageRetryInfo(`gemini:${model.model}`, statusNow)
      if (!nextRetry || (retry.until > statusNow && retry.until < nextRetry.until)) nextRetry = retry
      const hardFit = ledger.requests < model.dailyReqCap
        && (diagnosticBatch.length === 0 || ledger.tokens + geminiEst <= NEWS.geminiDailyTokenCap)
      if (!hardFit) continue
      anyHardFit = true
      const admission = diagnosticBatch.length === 0 || dailyQuotaAdmission({
        id: `gemini:${model.model}`, meter: 'requests', used: ledger.requests, cap: model.dailyReqCap,
        cost: 1, resetTimeZone: NEWS.geminiDayTz, floorFraction: NEWS.freeProviderPaceFloorFrac,
      }, statusNow).pacedFit
      if (admission) anyPacedFit = true
      if (admission && retry.until <= statusNow) anyUsable = true
    }
    const retry = nextRetry || { until: 0, fails: 0 }
    const coolMs = !anyUsable && anyPacedFit ? Math.max(0, retry.until - statusNow) : 0
    const spent = !anyHardFit
    const paced = anyHardFit && !anyPacedFit
    overflow.push({
      id: 'gemini', label: 'Gemini', color: '--live', model: `${n} model${n === 1 ? '' : 's'} (${NEWS.geminiModel}…)`,
      requests: pool.used, reqCap: pool.cap, tokens: pool.tokens,
      enabled: true, unlimited: false, spendingAllowed,
      health: tierHealth(true, coolMs, spent, paced, pool.ledgerUnavailable),
      ...(pool.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(pool.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(coolMs > 0 ? retryDiagnostics(retry, statusNow) : {}),
    })
  }
  for (const p of NEWS.overflowProviders) {
    const u = overflowUsage(p)
    const lead = (p.model || '').split('/').pop() || p.id
    const retry = triageRetryInfo(p.id, statusNow)
    const coolMs = Math.max(0, retry.until - statusNow)
    const strictCost = diagnosticBatchTokenBound(diagnosticBatch, p.maxTokens)
    const hardFit = !u.dayUnavailable && u.used < u.cap
      && (p.dailyTokenCap == null || u.tokens < p.dailyTokenCap)
      && (diagnosticBatch.length === 0 || p.dailyTokenCap == null || u.tokens + strictCost <= p.dailyTokenCap)
    const admission = diagnosticBatch.length === 0 || p.id === 'local' || dailyQuotaAdmission({
      id: p.id, meter: p.dailyTokenCap != null ? 'tokens' : 'requests',
      used: p.dailyTokenCap != null ? u.tokens : u.used, cap: p.dailyTokenCap ?? u.cap,
      cost: p.dailyTokenCap != null ? strictCost : 1, resetTimeZone: p.dayTz,
      floorFraction: p.paceFloorFrac ?? NEWS.freeProviderPaceFloorFrac,
    }, statusNow).pacedFit
    // token-gated providers (Cerebras) carry tokenCap so the chip reports tokens (the binding limit); a
    // request-gated provider (OpenRouter/NVIDIA) leaves it undefined → the chip stays on requests, as before.
    overflow.push({
      id: p.id, label: p.label, color: p.color, model: lead, requests: u.used, reqCap: u.cap, tokens: u.tokens, tokenCap: p.dailyTokenCap,
      enabled: true, unlimited: p.id === 'local', spendingAllowed,
      health: tierHealth(true, coolMs, !hardFit, hardFit && !admission, u.ledgerUnavailable),
      ...(u.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(u.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...retryDiagnostics(retry, statusNow),
    })
  }
  // LOCAL primary brain live readout — its daily tokens/requests (from local-budget.json, the file runCycle
  // records each cycle) plus cooldown/health, so the cockpit can show it FIRST and prominently. Absent unless
  // local is primary (NEWS.localProvider set); when demoted it stays a normal overflow chip above.
  let local: NewsStatus['local']
  if (NEWS.localProvider) {
    const lp = NEWS.localProvider
    const lb = readDailyBudget(lp.budgetFile, todayDate)
    const cd = triageRetryInfo('local', statusNow)
    const coolMs = Math.max(0, cd.until - statusNow)
    local = {
      id: lp.id, label: lp.label, color: lp.color, model: lp.model.split('/').pop() || lp.id,
      requests: lb.requests, tokens: lb.tokens, enabled: true, unlimited: true, spendingAllowed,
      health: tierHealth(true, coolMs, lb.dayUnavailable, false, lb.ledgerUnavailable),
      ...(lb.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(lb.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...retryDiagnostics(cd, statusNow),
    }
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
    readOnly: readOnlyMode,
    backlog: {
      count: backlogInspection.available ? backlogInspection.items.length : 0,
      cap: DEFERRED_CAP,
      ...(!backlogInspection.available ? { unavailable: true } : {}),
    },
    today,
    budget,
    overflow,
    local,
  }
}

// ============================ end-to-end pipeline diagnostics ============================
// The FULL, honest state of every triage tier + the deferred backlog, reconstructed entirely from state
// already on disk (per-provider budget files, `<id>-health.json` cooldown markers, the Haiku $ ledger, the
// deferred spillover, the firehose). This exists because the three highest-value facts — the backlog depth
// vs its loss boundary, the Haiku last-resort's $ spend + plan-quota state, and every provider's cooldown —
// were all persisted but surfaced NOWHERE, so "Groq in failure cooldown" could print while the paid fallback
// had silently tapped out too. Zero-touch: tiers are enumerated from the SAME config arrays the run loop
// uses (NEWS.overflowProviders / NEWS.geminiModels), so a newly-keyed provider appears with no edit here.

export type TierHealth = 'healthy' | 'paced' | 'cooling' | 'budget-spent' | 'unavailable' | 'disabled'

export interface TierDiagnostics {
  id: string
  label: string
  color: string // a CSS var NAME (e.g. '--accent', '--provider-cb') — never a literal; the chip reads it
  role: 'primary' | 'overflow' | 'gemini' | 'last-resort'
  order: number // routing order in the fallback chain (0 = tried first)
  enabled: boolean
  /** A shared news engine currently owns the provider lease. False means the scanner is globally off or
   * has no owner; a read-only cockpit observing another active owner still reports true and surfaces that
   * owner's real retry/day/allowance blockers from the shared state directory. */
  spendingAllowed?: boolean
  meter: 'requests' | 'usd' // how this tier is bounded — Haiku is metered in $, the rest in requests/tokens
  health: TierHealth
  /** The provider explicitly reported its day-scoped allowance unavailable. Counters remain actual engine
   * use; this flag, not a forged used==cap meter, explains why admission is closed. */
  providerDayExhausted?: boolean
  /** The durable usage authority is present but unreadable/invalid (or future-dated). Admission fails closed;
   * counters are omitted because reporting zero would invent allowance that the ledger cannot prove. */
  ledgerUnavailable?: boolean
  requestsToday?: number
  reqCap?: number
  tokensToday?: number
  tokenCap?: number // set only for token-gated providers (Cerebras) — its binding limit
  usdToday?: number // last-resort only
  usdCap?: number // last-resort only
  callsToday?: number // last-resort only
  // A cooldown is an ENGINE retry hold after an observed error. It is not evidence that the provider's
  // own quota is cooling/resetting, so expose the cause + next engine retry explicitly. All are optional
  // for old-marker / rolling-deploy tolerance.
  cooldownRemainingMs?: number // >0 while the engine is holding retries
  cooldownReason?: string // failure-class tag carried by the health marker (never a provider quota claim)
  retryScope?: 'shared' | 'triage' // whether the hold affects every workload or only triage requests
  nextEligibleAt?: string // ISO instant at which the engine may probe this tier again
  consecutiveFailures?: number // failure streak behind the current retry policy; NOT failures today
  failuresToday?: number // only when a future attempt ledger can prove this day-scoped total
  fails?: number // legacy alias for old cockpit bundles during a rolling deploy
  triageAttemptsToday?: number // actual provider calls made by triage today, including in-call retries
  triageScoredBatchesToday?: number // triage batches that returned usable scores today
  lastCycleRequests?: number // batches this tier scored in the most recent cycle (absent = not tracked per-tier)
}

export interface NewsDiagnostics {
  ts: string
  enabled: boolean
  running: boolean
  readOnly: boolean // another engine owns the ingester → this one serves but never scans
  intervalMin: number
  lastCycleAt: string | null
  nextCycleAt: string | null
  tiers: TierDiagnostics[] // ordered primary → overflow → gemini → last-resort
  backlog: {
    unavailable?: boolean // the saved waiting list could not be read; count and percentage are unknown
    count: number // items waiting un-triaged
    cap: number // DEFERRED_CAP — the loss boundary; backlog past this is silently dropped
    pctOfCap: number // 0..100
    nearLimit: boolean // ≥80% of the cap — approaching silent data loss
    trend: 'growing' | 'shrinking' | 'flat' | null // over today's recent cycles (null = too few to tell)
    lostToday: number // items ACTUALLY dropped past the cap so far today (sum of cycle dropped_at_cap) — real, not projected, data loss
  }
  today: { read: number; kept: number; dropped: number; cycles: number }
  lastCycle: {
    ts: string
    phase: 'fetch' | 'drain' | null
    fetched: number
    candidates: number
    fresh: number | null
    carryover: number | null
    picked: number
    watched: number
    dropped: number
    deferred: number | null
    aborted: boolean
    note: string | null
    deferReason: DeferReason | null
    lastResort: LastResortState | null
    anthropicCostUsd: number | null
    scoredBy: { id: string; label: string; requests: number }[] // per-tier batches scored this cycle
  } | null
  defer: {
    active: boolean // is there a live backlog being held right now?
    reason: DeferReason | null // structured reason from the most recent deferring cycle
    plainNote: string | null // the honest human sentence (the fixed, fallback-aware note)
    lastResort: LastResortState | null // the Haiku fallback's state — the piece that used to be hidden
    // Split the two materially different blockers. A configured allowance being used is an engine policy;
    // a retry hold means a real call errored and the engine is waiting before probing again. Neither field
    // claims knowledge of the provider account's live quota. `blockingTiers` stays as the compatibility union.
    retryHeldTiers: string[]
    providerDayExhaustedTiers: string[]
    allowanceExhaustedTiers: string[]
    unavailableTiers: string[]
    pacedTiers: string[]
    blockingTiers: string[]
  }
}

/** Optional retry metadata shared by every diagnostics row. Keeping the legacy `fails` alias lets an old
 * cockpit render a new engine, while the explicit field stops a new cockpit from mistaking a consecutive
 * streak for a day-scoped failure count. */
interface RetryInfo { until: number; fails: number; reason?: string; scope?: 'shared' | 'triage' }

/** A triage call is blocked by either the provider-wide availability hold or its triage-workload hold.
 * If both are live, the later gate wins because that is the true next eligibility instant. */
function triageRetryInfo(id: string, now: number): RetryInfo {
  const shared = { ...cooldownInfo(STATE_DIR, id), scope: 'shared' as const }
  const workload = { ...cooldownInfo(STATE_DIR, `triage:${id}`), scope: 'triage' as const }
  const live = [shared, workload].filter((x) => x.until > now).sort((a, b) => b.until - a.until)
  if (live.length) return live[0]
  // Once eligible, retain the newest streak for truthful "consecutive" context until a success clears it.
  return workload.until > shared.until ? workload : shared
}

function retryDiagnostics(
  cd: RetryInfo, now: number,
): Pick<TierDiagnostics, 'cooldownRemainingMs' | 'cooldownReason' | 'retryScope' | 'nextEligibleAt' | 'consecutiveFailures' | 'fails'> {
  const remaining = Math.max(0, cd.until - now)
  return {
    ...(remaining > 0 ? {
      cooldownRemainingMs: remaining,
      nextEligibleAt: new Date(cd.until).toISOString(),
      ...(cd.reason ? { cooldownReason: cd.reason } : {}),
      ...(cd.scope ? { retryScope: cd.scope } : {}),
    } : {}),
    ...(cd.fails > 0 ? { consecutiveFailures: cd.fails, fails: cd.fails } : {}),
  }
}

/** Sum an additive provider map without inventing zero for older firehose rows that predate it. */
function providerCycleTotal(
  cycles: CycleSummary[], key: string, field: 'provider_attempts' | 'provider_scored_batches',
): number | undefined {
  let seen = false
  let total = 0
  for (const cycle of cycles as Array<CycleSummary & {
    provider_attempts?: Record<string, number>
    provider_scored_batches?: Record<string, number>
  }>) {
    const map = cycle[field]
    if (!map) continue
    seen = true
    const value = Number(map[key])
    if (Number.isFinite(value) && value > 0) total += value
  }
  return seen ? total : undefined
}

function providerWorkDiagnostics(
  cycles: CycleSummary[], key: string,
): Pick<TierDiagnostics, 'triageAttemptsToday' | 'triageScoredBatchesToday' | 'failuresToday'> {
  const attempts = providerCycleTotal(cycles, key, 'provider_attempts')
  const scored = providerCycleTotal(cycles, key, 'provider_scored_batches')
  return {
    ...(attempts !== undefined ? { triageAttemptsToday: attempts } : {}),
    ...(scored !== undefined ? { triageScoredBatchesToday: scored } : {}),
    ...(attempts !== undefined && scored !== undefined ? { failuresToday: Math.max(0, attempts - scored) } : {}),
  }
}

/** Read the exact request/token authority used by Budget. Unavailable is separate from real zero usage. */
function readDailyBudget(file: string, dayKey: string): { requests: number; tokens: number; dayUnavailable: boolean; providerDayExhausted: boolean; ledgerUnavailable: boolean } {
  const ledger = inspectBudgetLedger(path.join(STATE_DIR, file), dayKey)
  return ledger.available
    ? { ...ledger, ledgerUnavailable: false }
    : { requests: 0, tokens: 0, dayUnavailable: false, providerDayExhausted: false, ledgerUnavailable: true }
}

/** Read the exact $ authority used by UsdBudget. Unavailable is separate from real zero usage. */
function readDailyUsd(file: string, dayKey: string): { usd: number; calls: number; ledgerUnavailable: boolean } {
  const ledger = inspectUsdLedger(path.join(STATE_DIR, file), dayKey)
  return ledger.available ? { ...ledger, ledgerUnavailable: false } : { usd: 0, calls: 0, ledgerUnavailable: true }
}

/** Compose a tier's health from its live signals. A damaged authority is neither healthy nor "spent". */
export function tierHealth(enabled: boolean, coolMs: number, budgetSpent: boolean, paced = false, ledgerUnavailable = false): TierHealth {
  if (!enabled) return 'disabled'
  if (ledgerUnavailable) return 'unavailable'
  if (coolMs > 0) return 'cooling'
  if (budgetSpent) return 'budget-spent'
  if (paced) return 'paced'
  return 'healthy'
}

/** Direction of the deferred backlog over today's recent cycles (null when too few data points). Exported for tests. */
export function backlogTrend(cycles: CycleSummary[]): 'growing' | 'shrinking' | 'flat' | null {
  const series = cycles
    .filter((c) => typeof c.backlog === 'number')
    .sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
    .map((c) => c.backlog as number)
  if (series.length < 2) return null
  const latest = series[series.length - 1]
  const prior = series[Math.max(0, series.length - 6)] // compare against ~5 cycles back (or the oldest we have)
  const delta = latest - prior
  const band = Math.max(5, prior * 0.1) // ignore small wiggles: >10% (min 5 items) is a real move
  return delta > band ? 'growing' : delta < -band ? 'shrinking' : 'flat'
}

/** The FULL end-to-end pipeline diagnostics for the cockpit. Read-only, never throws — every branch degrades
 *  to zeros/nulls so a partial/absent state file never fails the endpoint (matches getNewsStatus/sources). */
export function getNewsDiagnostics(): NewsDiagnostics {
  const now = Date.now()
  const ts = new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const status = getNewsStatus() // reuse the same today-counts + read-only + backlog computation
  const providerWorkEnabled = NEWS.enabled || (NEWS.ideasEnabled && NEWS.ideaProviderConfigured)
  const spendingAllowed = providerDiagnosticsActiveForState(providerWorkEnabled, status.readOnly, providerSpendingOwner)
  const todayUtc = new Date(now).toISOString().slice(0, 10)

  // newest cycle by ts (today's firehose) → drives the last-cycle flow + per-tier scoredBy + defer read
  let cyclesToday: CycleSummary[] = []
  try { cyclesToday = (readFeed(REPO_ROOT, 1).cycles as CycleSummary[]) || [] } catch { cyclesToday = [] }
  const last = cyclesToday.length
    ? [...cyclesToday].sort((a, b) => String(a.ts).localeCompare(String(b.ts)))[cyclesToday.length - 1]
    : null
  const diagnosticBatch = loadDeferred(STATE_DIR).slice(0, NEWS.triageBatch)

  const tiers: TierDiagnostics[] = []
  // local is the PRIMARY brain (unlimited, $0, tried first) → it leads the ladder and Groq becomes a fallback.
  const localPrimary = !!NEWS.localProvider
  let order = 0

  // --- Local primary brain (order 0) — unlimited, $0, tried FIRST for every batch ---
  if (NEWS.localProvider) {
    const lp = NEWS.localProvider
    const b = readDailyBudget(lp.budgetFile, todayUtc)
    const cd = triageRetryInfo('local', now)
    const coolMs = Math.max(0, cd.until - now)
    tiers.push({
      id: lp.id, label: lp.label, color: lp.color, role: 'primary', order: order++, enabled: true, spendingAllowed, meter: 'requests',
      health: tierHealth(true, coolMs, b.dayUnavailable, false, b.ledgerUnavailable), // no configured cap, but its durable authority must still be valid
      ...(b.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(b.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(!b.ledgerUnavailable ? { requestsToday: b.requests, tokensToday: b.tokens } : {}), // no reqCap / tokenCap on purpose — it is unlimited
      ...retryDiagnostics(cd, now), ...providerWorkDiagnostics(cyclesToday, lp.id), lastCycleRequests: last?.local_requests,
    })
  }

  // --- Groq (the PRIMARY when local is off; the FIRST FALLBACK when local is primary) ---
  {
    const enabled = !!NEWS.groqApiKey
    const b = readDailyBudget('groq-budget.json', todayUtc)
    const cd = triageRetryInfo('groq', now)
    const coolMs = Math.max(0, cd.until - now)
    const est = diagnosticBatchTokenBound(diagnosticBatch, NEWS.triageMaxTokens)
    const spent = b.dayUnavailable || b.requests >= NEWS.groqDailyReqCap || b.tokens >= NEWS.groqDailyTokenCap || b.tokens + est > NEWS.groqDailyTokenCap
    const paced = enabled && !spent && !pacedHasHeadroom(b.tokens, b.requests, NEWS.groqDailyReqCap, NEWS.groqDailyTokenCap, PACE, now, est)
    tiers.push({
      id: 'groq', label: 'Groq', color: '--accent', role: localPrimary ? 'overflow' : 'primary', order: order++, enabled, spendingAllowed, meter: 'requests',
      health: tierHealth(enabled, coolMs, spent, paced, b.ledgerUnavailable),
      ...(b.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(b.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(!b.ledgerUnavailable ? { requestsToday: b.requests, tokensToday: b.tokens } : {}),
      reqCap: NEWS.groqDailyReqCap, tokenCap: NEWS.groqDailyTokenCap,
      ...retryDiagnostics(cd, now), ...providerWorkDiagnostics(cyclesToday, 'groq'), lastCycleRequests: last?.groq_requests,
    })
  }

  // --- OpenAI-compatible overflow registry, enumerated from config (zero-touch) ---
  for (const p of NEWS.overflowProviders) {
    const u = overflowUsage(p)
    const cd = triageRetryInfo(p.id, now)
    const coolMs = Math.max(0, cd.until - now)
    // est-aware, via the SAME predicate the drain gate uses (cooling handled separately by tierHealth, so
    // pass false here): a token-gated provider one batch short of its cap CANNOT score, so it reads
    // "budget-spent", not "Healthy" (the reported Cerebras 900k/900k case).
    const strictCost = diagnosticBatchTokenBound(diagnosticBatch, p.maxTokens)
    const hardFit = !u.dayUnavailable && (diagnosticBatch.length === 0
      ? u.used < u.cap && (p.dailyTokenCap == null || u.tokens < p.dailyTokenCap)
      : providerDrainUsable(false, u.used, u.cap, u.tokens, p.dailyTokenCap, strictCost))
    const admission = diagnosticBatch.length === 0 ? null : dailyQuotaAdmission({
      id: p.id,
      meter: p.dailyTokenCap != null ? 'tokens' : 'requests',
      used: p.dailyTokenCap != null ? u.tokens : u.used,
      cap: p.dailyTokenCap ?? u.cap,
      cost: p.dailyTokenCap != null ? strictCost : 1,
      resetTimeZone: p.dayTz,
      floorFraction: p.paceFloorFrac ?? NEWS.freeProviderPaceFloorFrac,
    }, now)
    const spent = !hardFit || (admission != null && !admission.hardCapFit)
    const paced = !spent && admission != null && !admission.pacedFit
    tiers.push({
      id: p.id, label: p.label, color: p.color, role: 'overflow', order: order++, enabled: true, spendingAllowed, meter: 'requests',
      health: tierHealth(true, coolMs, spent, paced, u.ledgerUnavailable),
      ...(u.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(u.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(!u.ledgerUnavailable ? { requestsToday: u.used, tokensToday: u.tokens } : {}),
      reqCap: u.cap, tokenCap: p.dailyTokenCap,
      ...retryDiagnostics(cd, now), ...providerWorkDiagnostics(cyclesToday, p.id),
    })
  }

  // --- Gemini pool (one aggregate tier; per-model cooldowns folded into a single pool-usable read) ---
  const pool = geminiPoolUsage()
  if (pool) {
    const geminiDay = geminiToday()
    let anyUsableNow = false
    let anyHardFit = false
    let anyPacedFit = false
    let soonestRecoverMs = Infinity
    let soonestRetry: RetryInfo | null = null
    const strictCost = diagnosticBatchTokenBound(diagnosticBatch, NEWS.geminiMaxTokens)
    for (const e of NEWS.geminiModels) {
      const cd = triageRetryInfo(`gemini:${e.model}`, now)
      const coolMs = Math.max(0, cd.until - now)
      // A model is usable NOW only if it is neither cooling NOR out of its daily request budget. A PerDay 429
      // exhausts a model's budget WITHOUT arming a cooldown, so checking the cooldown alone would call an
      // exhausted model "usable" when it can't score — mirror runCycle's gemPick = !cooling && budget.canSpend.
      const model = readDailyBudget(`gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`, geminiDay)
      if (model.ledgerUnavailable) continue
      const hardFit = !model.dayUnavailable && (diagnosticBatch.length === 0
        ? model.requests < e.dailyReqCap && model.tokens < NEWS.geminiDailyTokenCap
        : providerDrainUsable(false, model.requests, e.dailyReqCap, model.tokens, NEWS.geminiDailyTokenCap, strictCost))
      if (!hardFit) continue
      anyHardFit = true
      const admission = diagnosticBatch.length === 0 ? null : dailyQuotaAdmission({
        id: `gemini:${e.model}`, meter: 'requests', used: model.requests, cap: e.dailyReqCap, cost: 1,
        resetTimeZone: NEWS.geminiDayTz, floorFraction: NEWS.freeProviderPaceFloorFrac,
      }, now)
      const released = admission == null || admission.pacedFit
      if (!released) continue
      anyPacedFit = true
      if (coolMs > 0) {
        if (coolMs < soonestRecoverMs) {
          soonestRecoverMs = coolMs
          soonestRetry = cd
        }
      } else {
        anyUsableNow = true
      }
    }
    const spent = !anyHardFit
    // Retry-held only when a clock-released, hard-fit model is actually held. If hard allowance remains but
    // none has reached its reset-clock release, the pool is paced—not errored or provider-quota exhausted.
    const coolMs = !anyUsableNow && anyPacedFit && !spent && soonestRecoverMs !== Infinity ? soonestRecoverMs : 0
    const paced = !spent && !anyUsableNow && coolMs === 0
    tiers.push({
      id: 'gemini', label: 'Gemini pool', color: '--live', role: 'gemini', order: order++, enabled: true, spendingAllowed, meter: 'requests',
      health: tierHealth(true, coolMs, spent, paced, pool.ledgerUnavailable),
      ...(pool.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(pool.providerDayExhausted ? { providerDayExhausted: true } : {}),
      ...(!pool.ledgerUnavailable ? { requestsToday: pool.used, tokensToday: pool.tokens } : {}),
      reqCap: pool.cap,
      ...retryDiagnostics(coolMs > 0 && soonestRetry ? soonestRetry : { until: 0, fails: 0 }, now),
      ...providerWorkDiagnostics(cyclesToday, 'gemini'), lastCycleRequests: last?.gemini_requests,
    })
  }

  // --- Haiku last-resort (order last), metered in $ ---
  {
    const enabled = NEWS.anthropicFallbackEnabled && (NEWS.anthropicFallbackMode === 'subscription' || !!NEWS.anthropicApiKey)
    const u = readDailyUsd('anthropic-triage-budget.json', todayUtc)
    const cd = triageRetryInfo('anthropic-triage', now)
    const coolMs = Math.max(0, cd.until - now)
    const spent = u.usd >= NEWS.anthropicDailyUsd
    tiers.push({
      id: 'anthropic-triage', label: 'Haiku · last resort', color: '--provider-haiku', role: 'last-resort', order: order++,
      enabled, spendingAllowed, meter: 'usd', health: tierHealth(enabled, coolMs, spent, false, u.ledgerUnavailable),
      ...(u.ledgerUnavailable ? { ledgerUnavailable: true } : {}),
      ...(!u.ledgerUnavailable ? { usdToday: Math.round(u.usd * 10_000) / 10_000, callsToday: u.calls } : {}),
      usdCap: NEWS.anthropicDailyUsd,
      ...retryDiagnostics(cd, now), ...providerWorkDiagnostics(cyclesToday, 'anthropic-triage'), lastCycleRequests: last?.anthropic_requests,
    })
  }

  // backlog gauge (depth vs the loss boundary + short trend)
  const count = status.backlog.count
  const cap = status.backlog.cap
  const pctOfCap = cap > 0 ? Math.round((count / cap) * 1000) / 10 : 0
  // real data loss so far today = sum of each cycle's dropped_at_cap (backlog overran the cap). Restart-safe
  // (read from the firehose on disk), same today-window as the read/kept/dropped totals.
  const lostToday = cyclesToday.reduce((s, c) => s + (typeof c.dropped_at_cap === 'number' ? c.dropped_at_cap : 0), 0)
  const backlog = {
    ...((status.backlog.unavailable ?? false) ? { unavailable: true } : {}),
    count,
    cap,
    pctOfCap,
    nearLimit: !(status.backlog.unavailable ?? false) && pctOfCap >= 80,
    trend: (status.backlog.unavailable ?? false) ? null : backlogTrend(cyclesToday),
    lostToday,
  }

  // per-tier "who scored the last cycle" (overflow is summed across providers, so it shows as one row)
  const scoredBy: { id: string; label: string; requests: number }[] = []
  if (last) {
    if (last.local_requests) scoredBy.push({ id: 'local', label: 'Local', requests: last.local_requests })
    if (last.groq_requests) scoredBy.push({ id: 'groq', label: 'Groq', requests: last.groq_requests })
    if (last.overflow_requests) scoredBy.push({ id: 'overflow', label: 'Overflow', requests: last.overflow_requests })
    if (last.gemini_requests) scoredBy.push({ id: 'gemini', label: 'Gemini', requests: last.gemini_requests })
    if (last.anthropic_requests) scoredBy.push({ id: 'anthropic-triage', label: 'Haiku', requests: last.anthropic_requests })
  }

  const lastCycle: NewsDiagnostics['lastCycle'] = last
    ? {
        ts: last.ts,
        phase: last.phase || null,
        fetched: last.fetched || 0,
        candidates: last.candidates || 0,
        fresh: typeof last.fresh === 'number' ? last.fresh : null,
        carryover: typeof last.carryover === 'number' ? last.carryover : null,
        picked: last.picked || 0,
        watched: last.watched || 0,
        dropped: last.dropped || 0,
        deferred: typeof last.deferred === 'number' ? last.deferred : null,
        aborted: !!last.aborted,
        note: last.note || null,
        deferReason: last.defer_reason || null,
        lastResort: last.last_resort || null,
        anthropicCostUsd: typeof last.anthropic_cost_usd === 'number' ? last.anthropic_cost_usd : null,
        scoredBy,
      }
    : null

  // Keep retry policy, configured allowance, and deliberate pacing separate. They have different remedies,
  // and collapsing them into "tapped out" falsely implied that a retry timer was provider quota state.
  const retryHeldTiers = tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'cooling' && !t.providerDayExhausted).map((t) => t.id)
  const providerDayExhaustedTiers = tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.providerDayExhausted).map((t) => t.id)
  const allowanceExhaustedTiers = tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'budget-spent' && !t.providerDayExhausted).map((t) => t.id)
  const unavailableTiers = tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'unavailable').map((t) => t.id)
  const pacedTiers = tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'paced').map((t) => t.id)
  const blockingTiers = [...retryHeldTiers, ...providerDayExhaustedTiers, ...allowanceExhaustedTiers, ...unavailableTiers] // rolling-deploy compatibility

  return {
    ts,
    enabled: status.enabled,
    running: status.running,
    readOnly: status.readOnly,
    intervalMin: status.intervalMin,
    lastCycleAt: status.lastCycleAt,
    nextCycleAt: status.nextCycleAt,
    tiers,
    backlog,
    today: status.today,
    lastCycle,
    defer: {
      active: count > 0,
      reason: last?.defer_reason || null,
      plainNote: last?.note || null,
      lastResort: last?.last_resort || null,
      retryHeldTiers,
      providerDayExhaustedTiers,
      allowanceExhaustedTiers,
      unavailableTiers,
      pacedTiers,
      blockingTiers,
    },
  }
}

const INGESTER_LOCK_FILE = 'news-ingester.lock'

/** Single-instance guard for the ingester, keyed on STATE_DIR (the lock file lives in it). Stops a
 *  SECOND engine pointed at the SAME data dir — e.g. a stray manual `npm start` on another port — from
 *  running a DUPLICATE ingester, which doubles every feed/GDELT/LLM fetch and races every write (the
 *  2026-06-20 ":8799" incident: a forgotten manual instance double-loaded the machine for ~2 days).
 *  Thin wrapper over the shared retained kernel lock (singleton-lock.ts); the resume supervisor uses the same
 *  helper with its own lock file, so the two never block each other. Behavior unchanged. */
export function acquireIngesterLock(stateDir: string): boolean {
  return acquireSingletonLock(stateDir, INGESTER_LOCK_FILE)
}

/** Release our retained descriptor on a clean exit. A crash closes it in the kernel automatically. */
export function releaseIngesterLock(stateDir: string): void {
  releaseSingletonLock(stateDir, INGESTER_LOCK_FILE)
}

export function startNewsIngester(): void {
  const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console
  // This loop belongs to the cockpit process, not to the news provider. Start it before every news-mode
  // branch; its own guard makes repeated startNewsIngester calls idempotent.
  startQualifiedIdeaOutcomeLoop(log)
  initializeIdeasHealth(STATE_DIR, REPO_ROOT)
  const ideasOnly = !NEWS.enabled && NEWS.ideasEnabled && NEWS.ideaProviderConfigured
  if (!NEWS.enabled && !ideasOnly) {
    providerSpendingOwner = false
    readOnlyMode = false
    const at = Date.now()
    const missingProvider = !NEWS.ideaProviderConfigured
    updateIdeasHealth(STATE_DIR, {
      enabled: NEWS.ideasEnabled,
      status: NEWS.ideasEnabled ? 'error' : 'disabled', outcome: 'not_run',
      reason_code: NEWS.ideasEnabled ? (missingProvider ? 'missing_api_key' : 'ingester_disabled') : 'disabled',
      reason: NEWS.ideasEnabled
        ? (missingProvider ? 'The idea pass has no configured provider.' : 'The news ingester is disabled by NEWS_INGEST_ENABLED=0.')
        : 'The idea pass is disabled by IDEAS_ENABLED=0.',
      next_eligible_at: null, input_count: 0, produced_count: 0,
    }, at, inspectIdeaSnapshots(REPO_ROOT, at))
    // eslint-disable-next-line no-console
    console.log(NEWS.ideaProviderConfigured ? '[news] ingester disabled (NEWS_INGEST_ENABLED=0)' : '[news] ingester idle — configure an idea provider to turn it on')
    return
  }
  if (timer) return
  // One ingester per data dir. A second engine (stray manual start, wrong-port instance) still serves
  // HTTP but must NOT double-fetch/double-write against the same STATE_DIR.
  if (!acquireIngesterLock(STATE_DIR)) {
    providerSpendingOwner = false
    readOnlyMode = true // surfaced in status/diagnostics so the cockpit can say why this engine isn't scanning
    // eslint-disable-next-line no-console
    console.log('[news] another engine already owns the ingester for this data dir — read-only for now; lock acquisition will retry automatically.')
    if (!ingesterRetryTimer) {
      ingesterRetryTimer = setTimeout(() => {
        ingesterRetryTimer = null
        startNewsIngester()
      }, 30_000)
      ingesterRetryTimer.unref?.()
    }
    return
  }
  readOnlyMode = false
  providerSpendingOwner = true
  process.once('exit', () => releaseIngesterLock(STATE_DIR))
  if (ideasOnly) {
    // Title fetching may be intentionally off while a fresh persisted sweep is still available. Keep the
    // lead skim alive in the server topology too, under this same retained provider lease; the standalone
    // entrypoint already follows this contract. No fetch/drain loop is started in this mode.
    const ideasTick = async () => {
      nextCycleAt = new Date(Date.now() + NEWS.pollIntervalMin * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
      if (running) return
      running = true
      try { await runConfiguredIdeaPass(log) }
      catch (e: any) { log(`idea pass error: ${e?.message || e}`) }
      finally {
        running = false
        lastCycleAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
        if (!providerSpendingOwner && !timer) releaseIngesterLock(STATE_DIR)
      }
    }
    initialTickTimer = setTimeout(() => { initialTickTimer = null; void ideasTick() }, 5000)
    initialTickTimer.unref?.()
    nextCycleAt = new Date(Date.now() + 5000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    timer = setInterval(ideasTick, NEWS.pollIntervalMin * 60_000)
    timer.unref?.()
    log(`title ingestion off — Ideas stays on under the provider lease every ${NEWS.pollIntervalMin} min`)
    return
  }
  const tick = async () => {
    // Advance BEFORE the overlap guard. setInterval fires on schedule whether or not we run, so the next
    // fetch attempt is always one interval away — even when this tick is skipped because a drain is still
    // in flight. Assigning after the guard left nextCycleAt frozen at the last tick that actually ran, so
    // a busy backlog (drains hogging `running`) made the status report a next look already in the PAST.
    nextCycleAt = new Date(Date.now() + NEWS.pollIntervalMin * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    if (running) return // never overlap cycles
    running = true
    try {
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
      }
      // This is deliberately outside the ingest try. runIdeaPass applies its own sweep + found_at age
      // ceiling, so a transient source failure does not suppress a safe pass over still-current inputs.
      // Outcome settlement has one owner: its independent interval above.
      await runConfiguredIdeaPass(log)
    } catch (e: any) {
      // runConfiguredIdeaPass is fail-soft, but keep a final boundary so an unexpected regression cannot
      // wedge the scheduler lock.
      log(`idea pass error: ${e?.message || e}`)
    } finally {
      running = false
      lastCycleAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
      // stopNewsIngester may be called while provider I/O is still in flight. Keep the kernel lease until
      // that promise settles so another process cannot overlap the old cycle; an immediate same-process
      // restart flips providerSpendingOwner back to true and deliberately keeps the lease.
      if (!providerSpendingOwner && !timer && !drainTimer) releaseIngesterLock(STATE_DIR)
    }
  }
  // Drain tick: between fetch cycles, keep working the deferred backlog so Groq runs continuously at
  // the sustainable per-minute pace whenever there's a backlog + daily budget (true 24/7 throttle).
  // Skips entirely when caught up or out of budget; never overlaps a fetch cycle (shared `running`).
  const drain = async () => {
    if (running || backlogCount() === 0 || !drainHasHeadroom()) return
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
      if (!providerSpendingOwner && !timer && !drainTimer) releaseIngesterLock(STATE_DIR)
    }
  }

  initialTickTimer = setTimeout(() => { initialTickTimer = null; void tick() }, 5000) // let the server settle, then run the first cycle
  initialTickTimer.unref?.()
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
  providerSpendingOwner = false
  readOnlyMode = false
  if (initialTickTimer) { clearTimeout(initialTickTimer); initialTickTimer = null }
  if (ingesterRetryTimer) { clearTimeout(ingesterRetryTimer); ingesterRetryTimer = null }
  if (timer) { clearInterval(timer); timer = null }
  if (drainTimer) { clearInterval(drainTimer); drainTimer = null }
  if (!running) releaseIngesterLock(STATE_DIR)
  stopQualifiedIdeaOutcomeLoop()
}
