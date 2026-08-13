// Free-text reason router — turns a human's short "why this card is off" note (the feedback popover's
// note box) into ONE scope bucket, so the free-text verdict actually feeds the feedback→scoring loop
// instead of only being eyeballed in a top-reasons list.
//
// Deterministic-safe by construction (CLAUDE.md §12): the route is written ONCE to a new additive
// `feedback_route` ledger line (never mutating the frozen score_breakdown the tuner's backtest replays),
// and the tuner uses it ONLY to recover a record that has no scope_id — never to override one. So the
// gated math stays byte-reproducible.
//
// Two-tier, graceful: a zero-cost keyword route (deriveScope over the note text) is ALWAYS produced and
// is the answer when no LLM is reachable; a single cheap Groq call refines the edge cases the keyword
// table misses. The Groq path shares the same cooldown guardrail as triage/article-read (a provider
// outage arms an exponential backoff and we fall straight back to the keyword route), and the calls are
// tiny (~1 per note, human-paced), but still share the exact daily ledger and minute limiter: every seam
// must obey the same provider allowance or a burst of "small" bypass calls becomes quota loss elsewhere.

import { NEWS, STATE_DIR } from '../../config'
import { deriveScope, type ScopeId } from '../scope'
import {
  Budget,
  armCooldown,
  clearCooldown,
  conservativeChatTokenBound,
  credibleTokenUsage,
  getSharedLimiter,
  isCoolingDown,
  rateInfoForLimiter,
  type RateInfo,
} from './budget'
import { parseRate } from './groq'

export interface ReasonRoute {
  scope: ScopeId | null
  confidence: number // 0–1
  via: 'llm' | 'keyword' | 'none'
}

const SCOPES: ScopeId[] = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy', 'geopolitical', 'generic_media', 'unknown']
const ROUTER_HOLD_ID = 'reason-router:groq'
const TIMEOUT_MS = 12_000
const LIMITER_WAIT_MS = 2_000

const SYSTEM = `You map a buy-side user's SHORT free-text reason (why a news card was mis-scored or irrelevant) onto ONE scope bucket. Reply ONLY JSON: {"scope": <one of single_name|multi_name|sector|macro|commodity|policy|geopolitical|generic_media|unknown>, "confidence": 0..1}.
Guidance: a "this can't help me pick a stock / not investable / just noise" verdict with no sector, macro, or policy angle → "generic_media". A rate/inflation/GDP angle → "macro". A law/regulator/election/tariff angle → "policy". A war/conflict angle → "geopolitical". A single company being wrong or over-rated → "single_name". Never invent a bucket; use "unknown" if genuinely unclear.`

/** The always-available, zero-cost route: run the note text through the same scope lexicons the wire uses. */
function keywordRoute(text: string): ReasonRoute {
  const scope = deriveScope({ headline: text })
  return { scope, confidence: 0.5, via: 'keyword' }
}

export interface ReasonRouterConfig {
  groqApiKey: string
  groqBaseUrl: string
  groqModel: string
  groqRpm: number
  groqTpm: number
  groqDailyReqCap: number
  groqDailyTokenCap: number
  groqDailyTokenTarget: number
  groqPaceFloorFrac: number
  llmCooldownMs: number
  llmCooldownMaxMs: number
}

export interface ReasonRouterOptions {
  stateDir?: string
  signal?: AbortSignal
  /** False on a read-only/replica server: deterministic routing remains available, but this process may
   * not spend shared provider allowance or mutate its budget/health ledgers. Default true. */
  providerSpendingAllowed?: boolean
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  limiterWaitMs?: number
  config?: Partial<ReasonRouterConfig>
}

function configFor(over?: Partial<ReasonRouterConfig>): ReasonRouterConfig {
  return {
    groqApiKey: NEWS.groqApiKey,
    groqBaseUrl: NEWS.groqBaseUrl,
    groqModel: NEWS.groqModel,
    groqRpm: NEWS.groqRpm,
    groqTpm: NEWS.groqTpm,
    groqDailyReqCap: NEWS.groqDailyReqCap,
    groqDailyTokenCap: NEWS.groqDailyTokenCap,
    groqDailyTokenTarget: NEWS.groqDailyTokenTarget,
    groqPaceFloorFrac: NEWS.groqPaceFloorFrac,
    llmCooldownMs: NEWS.llmCooldownMs,
    llmCooldownMaxMs: NEWS.llmCooldownMaxMs,
    ...over,
  }
}

function abortableSleep(
  ms: number,
  signal: AbortSignal | undefined,
  sleep: (ms: number) => Promise<void>,
): Promise<void> {
  if (!signal) return sleep(ms)
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve()
    }
    const onAbort = () => finish(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', onAbort, { once: true })
    sleep(ms).then(() => finish(), finish)
  })
}

/**
 * Route one free-text reason to a scope. Never throws — a bad/empty note returns `{scope:null,via:'none'}`,
 * and any LLM failure degrades to the deterministic keyword route. `fetchFn` is injectable for tests.
 */
export async function routeReason(
  text: string,
  fetchFn: typeof fetch = fetch,
  opts: ReasonRouterOptions = {},
): Promise<ReasonRoute> {
  const t = (text || '').trim()
  if (!t) return { scope: null, confidence: 0, via: 'none' }

  const kw = keywordRoute(t)
  if (opts.providerSpendingAllowed === false) return kw
  const cfg = configFor(opts.config)
  const stateDir = opts.stateDir || STATE_DIR
  const now = opts.now || (() => Date.now())
  const pace = { targetTokens: cfg.groqDailyTokenTarget, floorFrac: cfg.groqPaceFloorFrac }
  const user = t.slice(0, 400)
  const perAttemptTokens = conservativeChatTokenBound(SYSTEM, user, 80)
  const at = now()
  if (!cfg.groqApiKey || opts.signal?.aborted) return kw
  if (isCoolingDown(stateDir, 'groq', at) || isCoolingDown(stateDir, ROUTER_HOLD_ID, at)) return kw

  let budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, at, 'groq-budget.json')
  if (!budget.pacedCanSpend(perAttemptTokens, pace, at)) return kw

  const limiter = getSharedLimiter(cfg.groqRpm, cfg.groqTpm)
  const sleep = opts.sleep || ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  let acquired = false
  try {
    acquired = await limiter.acquire(
      perAttemptTokens,
      (ms) => abortableSleep(ms, opts.signal, sleep),
      now,
      opts.limiterWaitMs ?? LIMITER_WAIT_MS,
    )
  } catch (error: any) {
    if (opts.signal?.aborted || error?.name === 'AbortError') return kw
    return kw
  }
  if (!acquired || opts.signal?.aborted) return kw

  // Re-read and reserve after the limiter wait. This closes both races: another workload may have spent
  // the remaining daily room while this caller waited, the provider day may have rolled over, or another
  // workload may have armed a shared/scoped retry hold while this caller slept in the limiter.
  const admittedAt = now()
  if (isCoolingDown(stateDir, 'groq', admittedAt) || isCoolingDown(stateDir, ROUTER_HOLD_ID, admittedAt)) return kw
  budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, admittedAt, 'groq-budget.json')
  const reservation = budget.tryReserve(perAttemptTokens, pace, admittedAt)
  if (!reservation || opts.signal?.aborted) {
    if (reservation) budget.reconcile(reservation, 0, 0)
    return kw
  }

  const timeout = new AbortController()
  let internalTimedOut = false
  const onCallerAbort = () => timeout.abort()
  opts.signal?.addEventListener('abort', onCallerAbort, { once: true })
  const timer = setTimeout(() => {
    internalTimedOut = true
    timeout.abort()
  }, TIMEOUT_MS)

  let requestMade = false
  let recordedTokens = 0
  let providerReachable = false
  let routerHealthy = false
  let exhaustDay = false
  let attemptStartedAt = 0
  let failureHold: { id: string; baseMs: number; maxMs: number; reason: string } | null = null

  const classifyHttpFailure = (status: number, rate: RateInfo) => {
    exhaustDay = status === 429 && rate.rpdRemaining === 0
    if (exhaustDay) return
    const providerWide = status === 429 || status >= 500 || [401, 402, 403, 404].includes(status)
    const retryMs = rate.retryAfterMs != null && Number.isFinite(rate.retryAfterMs)
      ? Math.max(0, Math.floor(rate.retryAfterMs)) : null
    if (!providerWide) {
      failureHold = retryMs != null
        ? retryMs > 0
          ? { id: ROUTER_HOLD_ID, baseMs: retryMs, maxMs: retryMs, reason: 'reason-router-request' }
          : null
        : { id: ROUTER_HOLD_ID, baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs, reason: 'reason-router-request' }
    } else if (retryMs != null) {
      if (retryMs === 0) { failureHold = null; return }
      failureHold = {
        id: 'groq', baseMs: retryMs, maxMs: retryMs,
        reason: status === 429 ? 'rate-limit' : status >= 500 ? 'availability' : 'provider-access',
      }
    } else if (status === 429) {
      failureHold = { id: 'groq', baseMs: 60_000, maxMs: 60_000, reason: 'rate-limit' }
    } else {
      failureHold = {
        id: 'groq', baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs,
        reason: status >= 500 ? 'availability' : 'provider-access',
      }
    }
  }

  try {
    requestMade = true
    attemptStartedAt = now()
    const res = await fetchFn(`${cfg.groqBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.groqApiKey}` },
      signal: timeout.signal,
      body: JSON.stringify({
        model: cfg.groqModel,
        temperature: 0,
        max_tokens: 80,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: user },
        ],
      }),
    })
    providerReachable = true
    const rate = parseRate(res)
    const providerWide = res.status === 429 || res.status >= 500 || [401, 402, 403, 404].includes(res.status)
    limiter.learn(rateInfoForLimiter(rate, res.ok || providerWide), now)
    if (!res.ok) {
      classifyHttpFailure(res.status, rate)
      return kw
    }
    const data: any = await res.json()
    recordedTokens = credibleTokenUsage(data?.usage?.total_tokens, perAttemptTokens)
    const finishReason = String(data?.choices?.[0]?.finish_reason || '').toLowerCase()
    const content = data?.choices?.[0]?.message?.content
    const parsed = typeof content === 'string' ? JSON.parse(content) : null
    const numericConfidence = Number(parsed?.confidence)
    if (
      finishReason === 'length' || finishReason === 'max_tokens'
      || !SCOPES.includes(parsed?.scope)
      || !Number.isFinite(numericConfidence)
    ) {
      failureHold = { id: ROUTER_HOLD_ID, baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs, reason: 'reason-router-contract' }
      return kw
    }
    const scope = parsed.scope as ScopeId
    const confidence = Math.max(0, Math.min(1, numericConfidence))
    routerHealthy = true
    return { scope, confidence, via: 'llm' }
  } catch (error: any) {
    if (opts.signal?.aborted) return kw
    if (internalTimedOut || error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      failureHold = { id: ROUTER_HOLD_ID, baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs, reason: 'reason-router-timeout' }
    } else if (providerReachable || error instanceof SyntaxError) {
      providerReachable = true
      failureHold = { id: ROUTER_HOLD_ID, baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs, reason: 'reason-router-contract' }
    } else {
      failureHold = { id: 'groq', baseMs: cfg.llmCooldownMs, maxMs: cfg.llmCooldownMaxMs, reason: 'availability' }
    }
    return kw
  } finally {
    clearTimeout(timer)
    opts.signal?.removeEventListener('abort', onCallerAbort)
    budget.reconcile(reservation, requestMade ? 1 : 0, requestMade ? (recordedTokens || perAttemptTokens) : 0)
    if (routerHealthy) {
      clearCooldown(stateDir, 'groq', attemptStartedAt)
      clearCooldown(stateDir, ROUTER_HOLD_ID, attemptStartedAt)
    } else if (!opts.signal?.aborted) {
      // A reachable request/contract response disproves only stale provider-outage state. The guarded clear
      // cannot erase a newer concurrent 429/5xx marker armed after this attempt began.
      if (providerReachable && failureHold?.id !== 'groq') clearCooldown(stateDir, 'groq', attemptStartedAt)
      if (exhaustDay) budget.exhaust()
      else if (failureHold) armCooldown(stateDir, now(), failureHold.baseMs, failureHold.id, failureHold.maxMs, failureHold.reason)
    }
  }
}
