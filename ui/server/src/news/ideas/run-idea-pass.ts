// The orchestrator: read the top-N -> first eligible provider in the existing free chain -> persist the
// ideas -> refresh the board. It runs after triage so it reads the freshest ranked wire, but can flow around
// a spent/busy tier instead of going dark behind it. Two cheap guards keep it from starving core triage:
//   - CHANGE DETECTION: it only spends when the top-N event set actually shifts (a hash), or once every
//     `refreshSec` as a heartbeat — a per-cycle call (288×/day) would blow the 500k token budget alone.
//   - INTERVAL FLOOR: never more often than `minIntervalSec`, so even a churny wire can't hammer it.
// It reuses every tier's exact budget file, limiter, and provider cooldown — never a parallel budget lane
// (the :8799 double-count lesson). Ideas-contract errors use an idea-scoped cooldown so they cannot sideline
// healthy core triage. The whole provider walk is deadline-bounded below stale-running detection. Never throws.

import { Budget, armCooldown, clearCooldown, conservativeChatTokenBound, getNamedLimiter, getSharedLimiter, isCoolingDown } from '../triage/budget'
import { IDEA_SYSTEM, buildIdeaUserMessage, estimateIdeaTokens, surfaceIdeasBatch, type SurfaceIdeasResult } from './surface-ideas'
import {
  ideaDecayAt, ideaId, ideaSnapshotRevision, ideaVersion, priorCoverage, pruneExpiredIdeas, readIdeaById,
  readIdeaSnapshots, readPassState, readTopSweep, topNHash, writeIdeaIfRevision, writePassState,
  type SurfacedIdea,
} from './ideas-store'
import { IDEA_LEARNING_HORIZON_DAYS, learnIdeaAdjustment } from './idea-learning'
import { scoreTradeCluster, type TradeEvidence } from '../trade-score'
import type { IdeaInputRow } from './surface-ideas'
import { verifyEquityListing } from '../symbology'
import {
  inspectIdeaSnapshots, inspectPersistedIdeasHealth, updateIdeasHealth, type IdeasHealthReasonCode,
} from './ideas-health'
import type { OverflowProvider } from '../../config'

export interface IdeaPassConfig {
  topN: number
  shelfLifeHrs: number
  inputMaxAgeHrs?: number
  minIntervalSec: number
  refreshSec: number
  groqApiKey: string
  groqBaseUrl: string
  groqModel: string
  groqMaxTokens: number
  groqDailyReqCap: number
  groqDailyTokenCap: number
  groqDailyTokenTarget: number // the daily pacer's spend goal — the idea pass honors the SAME clock-prorated drip as triage
  groqPaceFloorFrac: number
  groqRpm: number
  groqTpm: number
  llmCooldownMs: number
  llmCooldownMaxMs: number
  limiterWaitMs: number
  /** The canonical provider registry used by news triage. Local-primary is separate; demoted local is
   * already the final overflow entry, so the operational chain never hand-wires or duplicates a tier. */
  localProvider?: OverflowProvider | null
  overflowProviders?: OverflowProvider[]
  localCooldownMs?: number
  /** Hard wall-clock bound for the whole sequential walk. Production is capped below health's 120s
   * stale-running threshold; the override exists for deterministic timeout tests. */
  providerChainTimeoutMs?: number
  /** Per-provider latency budget inside the sequential Ideas walk. This may be shorter than a tier's
   * normal triage timeout so fallbacks remain reachable, but expiry is Ideas-scoped and must never mark
   * that shared provider unhealthy for its ordinary workload. */
  providerAttemptTimeoutMs?: number
}

type RoutedIdeaProvider = OverflowProvider & {
  /** Groq alone is clock-paced because its pool is shared with primary triage. Overflow providers use
   * their ordinary hard caps, matching runCycle's existing routing contract. */
  pace?: { targetTokens: number; floorFrac: number }
}

export interface IdeaPassDeps {
  repoRoot: string
  stateDir: string
  config: IdeaPassConfig
  refreshBoard: () => Promise<void>
  now?: () => number
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  log?: (m: string) => void
  persistHealth?: boolean
}

export interface IdeaPassResult { ran: boolean; produced: number; note?: string; reason_code?: IdeasHealthReasonCode }
interface ProviderDecision {
  result: SurfaceIdeasResult | null
  reason_code: IdeasHealthReasonCode | null
  note?: string
  provider?: string
}

/** Worst-case billable tokens for one OpenAI-compatible idea-surfacing attempt. */
export function ideaGroqTokenBound(rows: Parameters<typeof surfaceIdeasBatch>[0], maxOutputTokens: number): number {
  return conservativeChatTokenBound(IDEA_SYSTEM, buildIdeaUserMessage(rows), maxOutputTokens)
}

/** Preserve the raw evidence contract between the sweep and the strict scorer. */
export function tradeEvidenceForIdeaRows(rows: IdeaInputRow[]): TradeEvidence[] {
  return rows.map((s) => ({
    event_id: s.event_id,
    dedup_group: s.dedup_group,
    ts: s.found_at,
    source_name: s.source_name,
    source_tier: s.source_tier,
    triage_score: s.materiality,
    materiality_pre_score: s.materiality_pre_score,
    companies: s.companies,
    scheduled_events: s.scheduled_events,
    event_direction: s.event_direction,
  }))
}

/** The Groq descriptor is synthesized only because Groq predates the overflow registry. */
function groqProvider(c: IdeaPassConfig): RoutedIdeaProvider {
  return {
    id: 'groq', label: 'Groq', color: '--provider-groq', apiKey: c.groqApiKey, baseUrl: c.groqBaseUrl, model: c.groqModel,
    maxTokens: c.groqMaxTokens, dailyReqCap: c.groqDailyReqCap, dailyTokenCap: c.groqDailyTokenCap,
    rpm: c.groqRpm, tpm: c.groqTpm, budgetFile: 'groq-budget.json',
    pace: { targetTokens: c.groqDailyTokenTarget, floorFrac: c.groqPaceFloorFrac },
  }
}

function providerReason(code: IdeasHealthReasonCode, label: string): string {
  if (code === 'missing_api_key') return `${label} is not configured.`
  if (code === 'provider_cooldown') return `${label} is cooling down after a transient failure.`
  if (code === 'daily_budget') return `${label}'s daily request or token budget is exhausted.`
  if (code === 'paced_budget') return `${label}'s daily pacer is holding capacity for later news triage.`
  if (code === 'rate_limiter_busy') return `${label}'s shared per-minute window is busy.`
  return `${label} could not be used.`
}

/** One OpenAI-compatible provider attempt with the same budget file, limiter, and cooldown used by
 * news triage. The provider shape comes from config, so adding another overflow tier remains zero-touch. */
async function callProviderForIdeaPassDetailed(
  rows: Parameters<typeof surfaceIdeasBatch>[0],
  deps: IdeaPassDeps,
  p: RoutedIdeaProvider,
  chainSignal?: AbortSignal,
): Promise<ProviderDecision> {
  const c = deps.config
  const now = deps.now || (() => Date.now())
  const label = p.label || p.id
  const ideaCooldownId = `ideas:${p.id}`
  if (!p.apiKey) return { result: null, reason_code: 'missing_api_key', note: providerReason('missing_api_key', label), provider: label }
  if (isCoolingDown(deps.stateDir, p.id, now())) return { result: null, reason_code: 'provider_cooldown', note: providerReason('provider_cooldown', label), provider: label }
  if (isCoolingDown(deps.stateDir, ideaCooldownId, now())) return { result: null, reason_code: 'provider_cooldown', note: `${label} is cooling down for the Ideas response contract.`, provider: label }
  const est = estimateIdeaTokens(rows.length)
  const perAttemptTokens = ideaGroqTokenBound(rows, p.maxTokens)
  const budget = Budget.load(deps.stateDir, p.dailyReqCap, p.dailyTokenCap ?? 50_000_000, now(), p.budgetFile, p.dayTz)
  // The operational chain gives each tier one bounded probe, then moves on. Retrying one provider twice can
  // consume the entire health window and strand healthy fallbacks. The exported Groq-only compatibility seam
  // keeps its historical two-attempt contract because it has no next tier to try.
  const attemptCap = chainSignal ? 1 : Math.max(1, Math.min(2, p.maxAttempts ?? 2))
  const hardAttempts = Math.min(attemptCap, budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
  if (!hardAttempts) return { result: null, reason_code: 'daily_budget', note: providerReason('daily_budget', label), provider: label }
  let preflightAttempts = hardAttempts
  const preflightAt = now()
  while (preflightAttempts > 0 && !(p.pace
    ? budget.pacedCanSpend(perAttemptTokens * preflightAttempts, p.pace, preflightAt, preflightAttempts)
    : budget.canSpend(perAttemptTokens * preflightAttempts, preflightAttempts))) preflightAttempts--
  if (!preflightAttempts) {
    const code: IdeasHealthReasonCode = p.pace ? 'paced_budget' : 'daily_budget'
    return { result: null, reason_code: code, note: providerReason(code, label), provider: label }
  }
  const limiter = p.id === 'groq' ? getSharedLimiter(p.rpm, p.tpm ?? 0) : getNamedLimiter(p.id, p.rpm, p.tpm ?? 0)
  const got = await limiter.acquire(est, deps.sleep, now, c.limiterWaitMs)
  if (!got) return { result: null, reason_code: 'rate_limiter_busy', note: providerReason('rate_limiter_busy', label), provider: label }
  let attempts = Math.min(attemptCap, budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
  const reservationAt = now()
  while (attempts > 0 && !(p.pace
    ? budget.pacedCanSpend(perAttemptTokens * attempts, p.pace, reservationAt, attempts)
    : budget.canSpend(perAttemptTokens * attempts, attempts))) attempts--
  const reservation = attempts > 0 ? budget.tryReserve(perAttemptTokens * attempts, p.pace, reservationAt, attempts) : null
  if (!reservation) {
    const code: IdeasHealthReasonCode = p.pace ? 'paced_budget' : 'daily_budget'
    return { result: null, reason_code: code, note: providerReason(code, label), provider: label }
  }
  let r: SurfaceIdeasResult | undefined
  let ideaImposedTimeout = false
  if (deps.persistHealth) {
    updateIdeasHealth(deps.stateDir, {
      enabled: true, status: 'running', outcome: 'not_run', reason_code: null,
      reason: `${label} is reading the current ranked lead set.`, last_attempt_at: new Date(now()).toISOString(),
      next_eligible_at: null, input_count: rows.length, produced_count: 0,
    }, now(), inspectIdeaSnapshots(deps.repoRoot, now()))
  }
  try {
    const providerTimeoutMs = p.timeoutMs ?? 30_000
    const ideaTimeoutMs = chainSignal
      ? Math.min(c.providerAttemptTimeoutMs ?? 30_000, providerTimeoutMs)
      : providerTimeoutMs
    ideaImposedTimeout = Boolean(chainSignal && ideaTimeoutMs < providerTimeoutMs)
    r = await surfaceIdeasBatch(
      rows,
      {
        model: p.model, models: p.models, baseUrl: p.baseUrl, apiKey: p.apiKey, maxTokens: p.maxTokens,
        headers: p.headers, extraBody: p.extraBody,
        timeoutMs: ideaTimeoutMs,
        maxAttempts: attempts,
        signal: chainSignal,
      },
      deps.fetchFn, deps.sleep,
    )
  } finally {
    const sentRequests = Number.isFinite(r?.requests) ? Math.max(0, Math.floor(r!.requests)) : 0
    const reportedTokens = Number(r?.tokens)
    const chargedTokens = sentRequests > 0
      ? (reportedTokens > 0
          ? reportedTokens + perAttemptTokens * Math.max(0, sentRequests - 1)
          : perAttemptTokens * sentRequests)
      : 0
    budget.reconcile(reservation, sentRequests, chargedTokens)
  }
  limiter.learn(r.rate, now)
  if (r.ok) {
    clearCooldown(deps.stateDir, p.id)
    clearCooldown(deps.stateDir, ideaCooldownId)
    return { result: r, reason_code: null, provider: label }
  }
  if (chainSignal?.aborted) {
    // The pass's own wall-clock guard cancelled the request; that is not evidence that this shared provider
    // is unhealthy. A later pass may probe it normally instead of sidelining core triage.
    return { result: r, reason_code: 'provider_error', note: `${label}: provider-chain deadline reached`, provider: label }
  }
  const localCooldown = p.id === 'local' ? (c.localCooldownMs ?? c.llmCooldownMs) : c.llmCooldownMs
  const localCooldownMax = p.id === 'local' ? localCooldown : c.llmCooldownMaxMs
  const providerTerminal = r.failureKind === 'request' && [401, 402, 403, 404].includes(r.httpStatus || 0)
  const ideaDeadlineFailure = ideaImposedTimeout
    && r.failureKind === 'availability'
    && /request timed out/i.test(r.note || '')
  if (providerTerminal && p.id !== 'groq') {
    // These are account/model-wide failures for the configured overflow descriptor, so mirror core triage's
    // day-scoped terminal treatment. Groq retains its historical no-exhaust protection (#219).
    budget.exhaust()
  } else if ((r.failureKind === 'availability' && !ideaDeadlineFailure) || providerTerminal) {
    // 429/5xx/timeout/network means the tier itself is unavailable; sharing this cooldown lets every workload
    // route around it. Local retains its canonical short, flat recovery window.
    armCooldown(deps.stateDir, now(), localCooldown, p.id, localCooldownMax)
  } else {
    // HTTP 400/413/422, malformed/truncated/schema-invalid output, and an Ideas-imposed shorter timeout may
    // be specific to this richer nonessential seam. Never poison the provider's shared triage health.
    armCooldown(deps.stateDir, now(), localCooldown, ideaCooldownId, localCooldownMax)
  }
  return { result: r, reason_code: 'provider_error', note: `${label}: ${r.note || 'provider error'}`, provider: label }
}

async function callIdeaProvidersDetailed(rows: Parameters<typeof surfaceIdeasBatch>[0], deps: IdeaPassDeps): Promise<ProviderDecision> {
  const providers: RoutedIdeaProvider[] = [
    ...(deps.config.localProvider ? [deps.config.localProvider] : []),
    groqProvider(deps.config),
    ...(deps.config.overflowProviders || []),
  ]
  // Health declares a running attempt stale after 120s. Keep the full sequential walk below it even when
  // several providers hang; surfaceIdeasBatch combines this signal with each provider's own request timeout.
  const chainTimeoutMs = Math.min(90_000, Math.max(1, deps.config.providerChainTimeoutMs ?? 90_000))
  const chainSignal = AbortSignal.timeout(chainTimeoutMs)
  const skips: ProviderDecision[] = []
  const failures: ProviderDecision[] = []
  for (const provider of providers) {
    if (chainSignal.aborted) break
    const decision = await callProviderForIdeaPassDetailed(rows, deps, provider, chainSignal)
    if (decision.result?.ok) return decision // a literal valid [] is a real terminal success
    if (decision.result) failures.push(decision)
    else skips.push(decision)
  }
  const failed = failures.at(-1) || null
  const deadlineNote = chainSignal.aborted ? 'The idea provider chain reached its safe runtime limit.' : ''
  const notes = [...failures, ...skips].map((d) => d.note).filter(Boolean).concat(deadlineNote).filter(Boolean).join(' ')
  if (failed?.result) return { ...failed, result: { ...failed.result, note: notes || failed.result.note } }
  const codes = new Set(skips.map((d) => d.reason_code))
  const code: IdeasHealthReasonCode = codes.has('rate_limiter_busy') ? 'rate_limiter_busy'
    : codes.has('provider_cooldown') ? 'provider_cooldown'
      : codes.has('paced_budget') ? 'paced_budget'
        : codes.has('daily_budget') ? 'daily_budget'
          : 'missing_api_key'
  return { result: null, reason_code: code, note: notes || 'No configured idea provider is eligible.' }
}

async function callGroqForIdeaPassDetailed(rows: Parameters<typeof surfaceIdeasBatch>[0], deps: IdeaPassDeps): Promise<ProviderDecision> {
  return callProviderForIdeaPassDetailed(rows, deps, groqProvider(deps.config))
}

/** Backward-compatible provider seam used by budget/concurrency tests. Operational callers use the
 * detailed path through runIdeaPass so every null result has a persisted reason code. */
export async function callGroqForIdeaPass(rows: Parameters<typeof surfaceIdeasBatch>[0], deps: IdeaPassDeps): Promise<SurfaceIdeasResult | null> {
  return (await callGroqForIdeaPassDetailed(rows, deps)).result
}

/**
 * Read the wire's top-N, decide whether to spend, run the batch, and persist the surfaced ideas (updating
 * a same-ticker/direction call in place, preserving its first-seen stamp and any promoted state). Prunes
 * long-decayed snapshots and refreshes the board only when it actually produced ideas. Never throws.
 */
export async function runIdeaPass(deps: IdeaPassDeps): Promise<IdeaPassResult> {
  const c = deps.config
  const now = deps.now || (() => Date.now())
  const log = deps.log || (() => {})
  const health = (patch: Parameters<typeof updateIdeasHealth>[1], at = now()) => {
    if (deps.persistHealth) updateIdeasHealth(deps.stateDir, patch, at, inspectIdeaSnapshots(deps.repoRoot, at))
  }
  try {
    const inputAt = now()
    const configuredInputMaxAgeHrs = Number.isFinite(c.inputMaxAgeHrs) && Number(c.inputMaxAgeHrs) > 0
      ? Number(c.inputMaxAgeHrs)
      : c.shelfLifeHrs
    // Input age may tighten the shelf-life contract, never widen it: an input accepted here must still
    // be capable of producing a non-expired lead anchored to its source timestamp.
    const inputMaxAgeHrs = Math.min(configuredInputMaxAgeHrs, c.shelfLifeHrs)
    const sweep = readTopSweep(deps.repoRoot, c.topN, {
      nowMs: inputAt,
      maxAgeMs: inputMaxAgeHrs * 3_600_000,
    })
    const rows = sweep.rows
    if (rows.length < 2) {
      const staleInput = sweep.status === 'stale' || sweep.status === 'corrupt'
      const counts = inspectIdeaSnapshots(deps.repoRoot, inputAt)
      const cached = counts.live_count + counts.stale_count > 0
      const reason = sweep.status === 'stale'
        ? `The newest wire sweep or its source timestamps are older than the ${inputMaxAgeHrs}-hour lead-input ceiling.`
        : sweep.status === 'corrupt'
          ? 'The newest wire sweep has no trustworthy freshness timestamp.'
          : 'At least two current ranked wire items are required before the lead skim can compare setups.'
      health({
        enabled: true,
        status: staleInput ? (cached ? 'degraded' : 'error') : 'waiting',
        outcome: 'skipped',
        reason_code: staleInput ? 'stale_inputs' : 'insufficient_inputs',
        reason,
        next_eligible_at: null,
        input_count: rows.length,
        produced_count: 0,
      }, inputAt)
      return { ran: false, produced: 0, note: reason, reason_code: staleInput ? 'stale_inputs' : 'insufficient_inputs' }
    }

    const hash = topNHash(rows)
    const prev = readPassState(deps.stateDir)
    const priorHealthRead = inspectPersistedIdeasHealth(deps.stateDir)
    const priorHealth = priorHealthRead.health
    // The scheduler/standalone entrypoint serializes passes. Therefore a persisted `running` record at
    // the start of a new invocation is crash evidence, not an in-flight peer. Anchor the hard interval to
    // both lifecycle files: ideas-pass.json may already have been stamped after the provider returned,
    // while a crash before that stamp leaves only last_attempt_at. Losing either clock can cause an
    // immediate double-spend or, after a waiting transition, cache a result that never completed.
    const priorUnfinished = priorHealthRead.status === 'ok' && priorHealth?.status === 'running'
    const priorAttemptAt = priorHealth?.last_attempt_at ? Date.parse(priorHealth.last_attempt_at) : NaN
    const intervalAnchor = Math.max(
      Number.isFinite(prev?.ran_at_ms) ? prev!.ran_at_ms : Number.NEGATIVE_INFINITY,
      Number.isFinite(priorAttemptAt) ? priorAttemptAt : Number.NEGATIVE_INFINITY,
    )
    const priorFailed = priorHealthRead.status === 'corrupt' || priorHealth?.outcome === 'failed' || priorUnfinished
    const elapsed = Number.isFinite(intervalAnchor) ? now() - intervalAnchor : Number.POSITIVE_INFINITY
    if (elapsed < c.minIntervalSec * 1000) {
      const next = intervalAnchor + c.minIntervalSec * 1000
      if (priorUnfinished) {
        const counts = inspectIdeaSnapshots(deps.repoRoot, now())
        health({
          enabled: true,
          status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error',
          outcome: 'failed',
          reason_code: 'stale_running',
          reason: 'The prior provider attempt did not record a completion; it will retry after the minimum interval.',
          next_eligible_at: new Date(next).toISOString(),
          input_count: rows.length,
          produced_count: 0,
        })
      } else if (priorFailed) {
        // Throttling is not recovery. Keep the terminal provider/internal failure visible until a real
        // retry completes; only advance its eligibility clock.
        if (priorHealthRead.status === 'corrupt') {
          health({
            enabled: true, status: 'error', outcome: 'failed', reason_code: 'health_corrupt',
            reason: `The idea-pass health record is corrupt: ${priorHealthRead.error}`,
            next_eligible_at: new Date(next).toISOString(), input_count: rows.length, produced_count: 0,
          })
        } else {
          health({ enabled: true, next_eligible_at: new Date(next).toISOString(), input_count: rows.length })
        }
      } else {
        health({ enabled: true, status: 'waiting', outcome: 'skipped', reason_code: 'min_interval', reason: 'The last provider attempt is still inside the minimum interval.', next_eligible_at: new Date(next).toISOString(), input_count: rows.length, produced_count: 0 })
      }
      return priorUnfinished
        ? { ran: false, produced: 0, note: 'prior provider attempt unfinished', reason_code: 'stale_running' }
        : { ran: false, produced: 0, note: 'within min interval', reason_code: 'min_interval' }
    }
    const changed = !prev || prev.hash !== hash
    // A failed attempt retries as soon as the hard interval allows, even when the event ids are unchanged.
    // Treating the failed hash as a valid cached result used to hide the outage until the hourly heartbeat.
    const dueRefresh = priorFailed
      ? elapsed >= c.minIntervalSec * 1000
      : elapsed >= c.refreshSec * 1000
    if (!changed && !dueRefresh) {
      const next = prev!.ran_at_ms + c.refreshSec * 1000
      health({ enabled: true, status: 'waiting', outcome: 'skipped', reason_code: 'inputs_unchanged', reason: 'The ranked lead set is unchanged; the cached provider result remains current.', next_eligible_at: new Date(next).toISOString(), input_count: rows.length, produced_count: 0 })
      return { ran: false, produced: 0, note: 'top-N unchanged', reason_code: 'inputs_unchanged' }
    }

    const provider = await callIdeaProvidersDetailed(rows, deps)
    const r = provider.result
    if (r === null) {
      const code = provider.reason_code || 'internal_error'
      const deferred = new Set<IdeasHealthReasonCode>(['provider_cooldown', 'daily_budget', 'paced_budget', 'rate_limiter_busy']).has(code)
      const counts = inspectIdeaSnapshots(deps.repoRoot, now())
      const status = deferred ? 'deferred' : (counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error')
      const reason = provider.note || (code === 'missing_api_key' ? 'No configured idea provider has an API key.'
        : code === 'provider_cooldown' ? 'Every configured idea provider is cooling down.'
          : code === 'daily_budget' ? 'Every configured idea provider is out of daily request or token budget.'
            : code === 'paced_budget' ? 'The provider chain is holding paced capacity for later news triage.'
              : code === 'rate_limiter_busy' ? 'Every eligible provider currently has a busy per-minute window.'
                : 'The idea pass could not determine provider eligibility.')
      health({ enabled: true, status, outcome: 'skipped', reason_code: code, reason, next_eligible_at: null, input_count: rows.length, produced_count: 0 })
      return { ran: false, produced: 0, note: reason, reason_code: code }
    }
    // stamp the attempt regardless of outcome so a failing provider isn't re-probed every tick
    writePassState(deps.stateDir, { hash, ran_at_ms: now() })
    if (!r.ok) {
      const counts = inspectIdeaSnapshots(deps.repoRoot, now())
      health({ enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error', outcome: 'failed', reason_code: 'provider_error', reason: r.note || 'The provider attempt failed.', next_eligible_at: null, input_count: rows.length, produced_count: 0 })
      log(`idea pass: ${r.note || 'no ideas produced'}`)
      return { ran: false, produced: 0, note: r.note, reason_code: 'provider_error' }
    }

    const snapshots = readIdeaSnapshots(deps.repoRoot)
    const nowIso = new Date(now()).toISOString().replace(/\.\d{3}Z$/, 'Z')
    const seen = new Set<string>()
    const persistedVersions = new Map<string, string>()
    let writeConflicts = 0
    for (const raw of r.ideas) {
      const id = ideaId(raw.ticker, raw.direction)
      if (seen.has(id)) continue // two raw rows collapsed to the same call — the model returned the best first
      seen.add(id)
      const srcRows = raw.src.map((i) => rows[i]).filter(Boolean)
      if (!srcRows.length) continue
      const eventIds = [...new Set(srcRows.map((s) => s.event_id))]
      // primary = the highest-materiality contributing row; its source anchors a later promotion so the
      // launched signal's SIG_ID byte-matches the wire event (headline|url|date) and Gate 0 sees a real source.
      const primary = srcRows.slice().sort((a, b) => b.materiality - a.materiality)[0]
      const headlines = [primary, ...srcRows.filter((s) => s !== primary)].map((s) => s.headline).filter(Boolean).slice(0, 4)
      const materialityMax = Math.max(0, ...srcRows.map((s) => s.materiality))
      const newestAt = srcRows.map((s) => s.found_at).filter(Boolean).sort().reverse()[0] || nowIso
      const decayIso = ideaDecayAt(newestAt, now(), c.shelfLifeHrs)
      if (!decayIso) continue
      const version = ideaVersion({ ticker: raw.ticker, direction: raw.direction, thesisType: raw.thesis_type, reason: raw.reason, whyNow: raw.why_now, sourceEventIds: eventIds })
      const learning = learnIdeaAdjustment(deps.repoRoot, snapshots, {
        direction: raw.direction, thesisType: raw.thesis_type, horizonDays: IDEA_LEARNING_HORIZON_DAYS,
      })
      const tradeEvidence = tradeEvidenceForIdeaRows(srcRows)
      const verifiedListing = await verifyEquityListing(raw.ticker, raw.company, deps.fetchFn || fetch)
      const trade = scoreTradeCluster(tradeEvidence, {
        nowMs: now(),
        ticker: verifiedListing?.ticker || raw.ticker,
        exchange: verifiedListing?.exchange || raw.exchange,
        tickerVerified: Boolean(verifiedListing),
        listingVerified: Boolean(verifiedListing),
        // The equity directory proves a listed security and venue, not that enough value trades today.
        // Liquidity stays open for Signal Check; a verified listing can advance to needs_data, never check_now.
        liquidityVerified: false,
        pricedIn: raw.priced_in,
        whyNow: raw.why_now,
        learningAdjustment: learning.adjustment,
      })
      const coverage = priorCoverage(deps.repoRoot, raw.ticker)
      let saved = false
      for (let attempt = 0; attempt < 3 && !saved; attempt++) {
        // Listing verification awaited above. Re-read lifecycle state now, then CAS the exact revision so
        // a concurrent promote/decay edit cannot be silently reverted by this older provider result.
        const current = readIdeaById(deps.repoRoot, id)
        const versionStartedAt = current?.idea_version === version
          ? (current.idea_version_started_at || current.updated_at || nowIso)
          : nowIso
        const currentUpdated = current?.updated_at && Date.parse(current.updated_at) > Date.parse(nowIso)
          ? current.updated_at
          : nowIso
        const idea: SurfacedIdea = {
          idea_id: id,
          idea_version: version,
          idea_version_started_at: versionStartedAt,
          ticker: verifiedListing?.ticker || raw.ticker,
          company: raw.company,
          exchange: verifiedListing?.exchange || raw.exchange,
          ticker_verified: Boolean(verifiedListing),
          listing_verified: Boolean(verifiedListing),
          liquidity_verified: false,
          listing_verification_source: verifiedListing?.source || null,
          direction: raw.direction,
          pair_with: raw.pair_with,
          reason: raw.reason,
          why_now: raw.why_now,
          conviction: raw.conviction,
          conviction_basis: 'pre_edge_proxy',
          trade_score: trade.score,
          trade_score_basis: 'evidence_gate_v1',
          trade_score_breakdown: trade.breakdown,
          trade_readiness: trade.readiness,
          missing_checks: trade.missingChecks,
          learning,
          priced_in: raw.priced_in,
          thesis_type: raw.thesis_type,
          source_event_ids: eventIds,
          source_headlines: headlines,
          source_headline: primary?.headline_orig || primary?.headline || null,
          source_url: primary?.url || null,
          source_name: primary?.source_name || null,
          materiality_max: materialityMax,
          newest_source_at: newestAt,
          prior_coverage: coverage,
          surfaced_at: current?.surfaced_at || nowIso,
          updated_at: currentUpdated,
          decay_at: decayIso,
          status: current?.status === 'promoted' ? 'promoted' : 'live',
          promoted_signal_id: current?.promoted_signal_id || null,
        }
        saved = writeIdeaIfRevision(deps.repoRoot, idea, ideaSnapshotRevision(current))
        if (saved) persistedVersions.set(id, version)
      }
      if (!saved) writeConflicts++
    }
    pruneExpiredIdeas(deps.repoRoot, now(), c.shelfLifeHrs * 3_600_000) // delete only well past decay (one extra shelf-life)
    await deps.refreshBoard()
    const finishedAt = now()
    const snapshotState = inspectIdeaSnapshots(deps.repoRoot, finishedAt)
    const produced = [...persistedVersions].filter(([id, version]) => readIdeaById(deps.repoRoot, id)?.idea_version === version).length
    const storeDegraded = snapshotState.snapshot_store.status === 'degraded' || snapshotState.snapshot_store.status === 'unreadable'
    // A literal provider `ideas:[]` is the only honest success_empty. If the model returned one or more
    // leads but none became a valid projectable snapshot, the pass failed regardless of whether the cause
    // was a CAS conflict, a damaged store, or a later source/persistence invariant. Never collapse that into
    // "nothing cleared the bar."
    const persistenceFailed = r.ideas.length > 0 && produced === 0
    const persistenceFailureCode: IdeasHealthReasonCode = writeConflicts > 0
      ? 'write_conflict'
      : storeDegraded
        ? 'snapshot_store_error'
        : 'internal_error'
    const status = persistenceFailed ? (snapshotState.live_count + snapshotState.stale_count ? 'degraded' : 'error')
      : storeDegraded || writeConflicts ? 'degraded'
        : 'healthy'
    const outcome = persistenceFailed ? 'failed' : produced ? 'success_with_ideas' : 'success_empty'
    const reasonCode: IdeasHealthReasonCode | null = persistenceFailed ? persistenceFailureCode
      : writeConflicts ? 'write_conflict'
      : storeDegraded ? 'snapshot_store_error'
        : null
    const providerName = provider.provider || 'The provider'
    const reason = persistenceFailed
      ? writeConflicts > 0
        ? `${providerName} returned news leads, but none could be committed without overwriting a newer snapshot revision.`
        : storeDegraded
          ? `${providerName} returned news leads, but none became a projectable snapshot; ${snapshotState.snapshot_store.corrupt_count + snapshotState.snapshot_store.invalid_count + snapshotState.snapshot_store.unprojectable_count} snapshot file${snapshotState.snapshot_store.file_count === 1 ? '' : 's'} failed the store contract.`
          : `${providerName} returned news leads, but none survived source freshness and persistence validation.`
      : writeConflicts
        ? `${providerName} surfaced ${produced} lead${produced === 1 ? '' : 's'}; ${writeConflicts} concurrent snapshot update${writeConflicts === 1 ? '' : 's'} were preserved.`
        : storeDegraded
          ? `${providerName} completed the pass, but ${snapshotState.snapshot_store.corrupt_count + snapshotState.snapshot_store.invalid_count + snapshotState.snapshot_store.unprojectable_count} snapshot file${snapshotState.snapshot_store.file_count === 1 ? '' : 's'} cannot be projected safely.`
          : produced
            ? `${providerName} surfaced ${produced} unverified news lead${produced === 1 ? '' : 's'}.`
            : `${providerName} completed successfully and returned no news leads.`
    health({
      enabled: true, status, outcome, reason_code: reasonCode,
      reason,
      ...(persistenceFailed ? {} : { last_success_at: new Date(finishedAt).toISOString() }),
      next_eligible_at: new Date(finishedAt + c.minIntervalSec * 1000).toISOString(),
      input_count: rows.length, produced_count: produced,
    }, finishedAt)
    log(`idea pass: ${providerName} surfaced ${produced} idea${produced === 1 ? '' : 's'} from ${rows.length} ranked items`)
    return { ran: true, produced, note: persistenceFailed ? reason : undefined, reason_code: reasonCode || undefined }
  } catch (e: any) {
    log(`idea pass error: ${e?.message || e}`)
    const at = now()
    const counts = inspectIdeaSnapshots(deps.repoRoot, at)
    health({ enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error', outcome: 'failed', reason_code: 'internal_error', reason: `Idea pass error: ${String(e?.message || e).slice(0, 240)}`, next_eligible_at: null, input_count: 0, produced_count: 0 }, at)
    return { ran: false, produced: 0, note: `error: ${e?.message || e}`, reason_code: 'internal_error' }
  }
}
