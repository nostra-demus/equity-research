// The orchestrator: read the top-N -> one budget-gated free-LLM call -> persist the ideas -> refresh the
// board. Runs from the ingester tick (scheduler.ts), AFTER triage, so it never competes with the wire's
// own scoring. Two cheap guards keep it from ever busting Groq's daily budget or starving triage:
//   - CHANGE DETECTION: it only spends when the top-N event set actually shifts (a hash), or once every
//     `refreshSec` as a heartbeat — a per-cycle call (288×/day) would blow the 500k token budget alone.
//   - INTERVAL FLOOR: never more often than `minIntervalSec`, so even a churny wire can't hammer it.
// It reuses the ingester's exact free-tier guardrails (Budget, the shared RateLimiter, the per-provider
// cooldown) — never a parallel budget lane (the :8799 double-count lesson) — and it NEVER throws.

import { Budget, armCooldown, clearCooldown, conservativeChatTokenBound, getSharedLimiter, isCoolingDown } from '../triage/budget'
import { IDEA_SYSTEM, buildIdeaUserMessage, estimateIdeaTokens, surfaceIdeasBatch, type SurfaceIdeasResult } from './surface-ideas'
import {
  ideaId, ideaVersion, priorCoverage, pruneExpiredIdeas, readIdeaSnapshots, readPassState, readTopSweepRows,
  topNHash, writeIdea, writePassState, type SurfacedIdea,
} from './ideas-store'
import { IDEA_LEARNING_HORIZON_DAYS, learnIdeaAdjustment } from './idea-learning'
import { scoreTradeCluster, type TradeEvidence } from '../trade-score'
import type { IdeaInputRow } from './surface-ideas'
import { verifyEquityListing } from '../symbology'

export interface IdeaPassConfig {
  topN: number
  shelfLifeHrs: number
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
}

export interface IdeaPassResult { ran: boolean; produced: number; note?: string }

/** Worst-case billable tokens for one primary-Groq idea-surfacing attempt. */
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

/**
 * One Groq attempt for the idea batch, sharing the ingester's budget file, shared limiter, and per-provider
 * cooldown. Returns the result on a real call, or null when the pass should be SKIPPED without spending
 * (no key, cooling down, out of daily budget, or the per-minute window is busy). Mirrors the on-demand
 * reader's failure rules exactly: a terminal 4xx exhausts the day; a transient 429/5xx/network arms the
 * shared cooldown (never exhausts — the #219 lesson); a success clears the marker.
 */
export async function callGroqForIdeaPass(rows: Parameters<typeof surfaceIdeasBatch>[0], deps: IdeaPassDeps): Promise<SurfaceIdeasResult | null> {
  const c = deps.config
  const now = deps.now || (() => Date.now())
  if (!c.groqApiKey) return null
  if (isCoolingDown(deps.stateDir, 'groq', now())) return null
  const est = estimateIdeaTokens(rows.length)
  const perAttemptTokens = ideaGroqTokenBound(rows, c.groqMaxTokens)
  const budget = Budget.load(deps.stateDir, c.groqDailyReqCap, c.groqDailyTokenCap, now(), 'groq-budget.json')
  // Gate on the PACER, not the raw hard cap: the idea pass shares groq-budget.json with triage, so it must
  // honor the same clock-prorated ceiling — never spend Groq tokens the pacer is holding back for triage on
  // a heavy-news day (it would draw down the shared daily cap out of turn).
  const pace = { targetTokens: c.groqDailyTokenTarget, floorFrac: c.groqPaceFloorFrac }
  let preflightAttempts = Math.min(2, budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
  const preflightAt = now()
  while (preflightAttempts > 0 && !budget.pacedCanSpend(perAttemptTokens * preflightAttempts, pace, preflightAt, preflightAttempts)) preflightAttempts--
  if (!preflightAttempts) return null
  const limiter = getSharedLimiter(c.groqRpm, c.groqTpm)
  const got = await limiter.acquire(est, deps.sleep, now, c.limiterWaitMs)
  if (!got) return null // the shared Groq minute window is busy (triage mid-cycle) — skip this pass
  let attempts = Math.min(2, budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
  const reservationAt = now()
  while (attempts > 0 && !budget.pacedCanSpend(perAttemptTokens * attempts, pace, reservationAt, attempts)) attempts--
  const reservation = attempts > 0 ? budget.tryReserve(perAttemptTokens * attempts, pace, reservationAt, attempts) : null
  if (!reservation) return null
  let r: SurfaceIdeasResult | undefined
  try {
    r = await surfaceIdeasBatch(
      rows,
      { model: c.groqModel, baseUrl: c.groqBaseUrl, apiKey: c.groqApiKey, maxTokens: c.groqMaxTokens, timeoutMs: 30_000, maxAttempts: attempts },
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
  if (r.ok) { clearCooldown(deps.stateDir, 'groq'); return r }
  // A failure NEVER exhausts the SHARED groq-budget.json — that would disable Groq for triage / article-read
  // / heal off ONE non-essential idea-pass call for the rest of the UTC day (the #219-class "one failed call
  // drains the shared Groq day" trap). Always arm the backing-off per-provider cooldown instead: it self-
  // clears on the next success, and a config-level 400/413 (e.g. IDEAS_TOP_N too high) just backs off harmlessly.
  armCooldown(deps.stateDir, now(), c.llmCooldownMs, 'groq', c.llmCooldownMaxMs)
  return r
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
  try {
    const rows = readTopSweepRows(deps.repoRoot, c.topN)
    if (rows.length < 2) return { ran: false, produced: 0, note: 'not enough ranked items yet' }

    const hash = topNHash(rows)
    const prev = readPassState(deps.stateDir)
    const elapsed = prev ? now() - prev.ran_at_ms : Number.POSITIVE_INFINITY
    if (elapsed < c.minIntervalSec * 1000) return { ran: false, produced: 0, note: 'within min interval' }
    const changed = !prev || prev.hash !== hash
    const dueRefresh = elapsed >= c.refreshSec * 1000
    if (!changed && !dueRefresh) return { ran: false, produced: 0, note: 'top-N unchanged' }

    const r = await callGroqForIdeaPass(rows, deps)
    if (r === null) return { ran: false, produced: 0, note: 'no free budget for the idea pass right now' }
    // stamp the attempt regardless of outcome so a failing provider isn't re-probed every tick
    writePassState(deps.stateDir, { hash, ran_at_ms: now() })
    if (!r.ok) { log(`idea pass: ${r.note || 'no ideas produced'}`); return { ran: false, produced: 0, note: r.note } }

    const snapshots = readIdeaSnapshots(deps.repoRoot)
    const existing = new Map(snapshots.map((i) => [i.idea_id, i]))
    const nowIso = new Date(now()).toISOString().replace(/\.\d{3}Z$/, 'Z')
    const decayIso = new Date(now() + c.shelfLifeHrs * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    const seen = new Set<string>()
    let produced = 0
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
      const prevIdea = existing.get(id)
      const version = ideaVersion({ ticker: raw.ticker, direction: raw.direction, thesisType: raw.thesis_type, reason: raw.reason, whyNow: raw.why_now, sourceEventIds: eventIds })
      const versionStartedAt = prevIdea?.idea_version === version
        ? (prevIdea.idea_version_started_at || prevIdea.updated_at || nowIso)
        : nowIso
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
        source_headline: primary?.headline_orig || primary?.headline || null, // ORIGINAL — anchors the promote SIG to the wire launch
        source_url: primary?.url || null,
        source_name: primary?.source_name || null,
        materiality_max: materialityMax,
        newest_source_at: newestAt,
        prior_coverage: priorCoverage(deps.repoRoot, raw.ticker),
        surfaced_at: prevIdea?.surfaced_at || nowIso, // first-seen is sticky across refreshes
        updated_at: nowIso,
        decay_at: decayIso,
        status: prevIdea?.status === 'promoted' ? 'promoted' : 'live', // never demote a promoted idea
        promoted_signal_id: prevIdea?.promoted_signal_id || null,
      }
      writeIdea(deps.repoRoot, idea)
      produced++
    }
    pruneExpiredIdeas(deps.repoRoot, now(), c.shelfLifeHrs * 3_600_000) // delete only well past decay (one extra shelf-life)
    await deps.refreshBoard()
    log(`idea pass: surfaced ${produced} idea${produced === 1 ? '' : 's'} from ${rows.length} ranked items`)
    return { ran: true, produced }
  } catch (e: any) {
    log(`idea pass error: ${e?.message || e}`)
    return { ran: false, produced: 0, note: `error: ${e?.message || e}` }
  }
}
