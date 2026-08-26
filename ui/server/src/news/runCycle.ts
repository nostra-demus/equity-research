// One ingest cycle, end to end: FETCH (GDELT + RSS in parallel) → NORMALIZE+FILTER+DEDUP → TRIAGE
// (Groq, batched, budget- and rate-limited) → WRITE (ranked inbox + per-item feed records + firehose
// summary + board refresh + live bus events). It NEVER throws — every stage degrades to a logged,
// counted no-op. Haiku runs on the host's flat-fee Claude subscription by default and is bounded by the
// shared-plan dollar governor; the audited router may move it ahead of weak free peers only under explicit
// queue pressure. All I/O is dependency-injectable so the pipeline is testable with mocked fetch + clock.

import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { newsBus } from './bus'
import { appendFeedItems, inspectFeedCapacity, inspectHistoricalFeedIdentities, readFeed } from './feed'
import { assignDedupGroups } from './dedup'
import { fetchGdelt } from './sources/gdelt'
import { acknowledgeRssDeliveries, fetchRss } from './sources/rss'
import { fetchNse } from './sources/nse'
import { fetchExchangeIntl } from './sources/exchange-intl'
import { fetchGovData } from './sources/gov-data'
import { fetchReddit } from './sources/reddit'
import { eventIdFor, loadLedgerEventIds, normalizeAndFilter } from './normalize'
import { pickTranslation } from './lang'
import { resolveEventRegion } from './geo'
import { resolveCountry } from './geography'
import { invalidateFacets } from './facets'
import { SeenCache } from './seen-cache'
import { Budget, NON_BINDING_DAILY_TOKEN_CAP, UsdBudget, armCooldown, clearCooldown, conservativeChatTokenBound, conservativeChatUsdBound, cooldownInfo, dailyQuotaAdmission, getNamedLimiter, getSharedGeminiLimiter, getSharedLimiter, rateInfoForLimiter, readCooldownUntil, selectDailyQuotaCandidate, type DailyQuotaCandidate, type PaceCfg } from './triage/budget'
import { triageBatchGemini } from './triage/gemini'
import { triageBatchAnthropic } from './triage/anthropic'
import { isAuthExpiredNote, isPlanQuotaNote, isTerminalApiNote, triageBatchClaudeCli, type ClaudeCliRunner } from './triage/claude-cli'
import { SYSTEM, buildUserMessage, estimateTokens, openAiRequestIdentity, scoreToBand, triageBatch, triageMaxOutputTokens, type TriageOptions, type TriageResult } from './triage/groq'
import { readProviderQuarantine } from './provider-failure'
import { rankScore, preTriagePriority, capSocialBand, capSocialScore, deriveMaterialityLabel } from './rank'
import { deriveScope, deriveSourceTier, toEventScope } from './scope'
import { deriveCommodities } from './commodities'
import { beginPipelineFlowCycle, buildPipelineFlowRates, completePipelineFlowCycle, countUniqueNewArrivals, readPipelineFlowCycles } from './pipeline-flow'
import {
  deterministicCycleId,
  deterministicDecisionId,
  credentialRejected,
  evaluateProviderRouting,
  recordProviderDecision,
  recordProviderOutcome,
  recordProviderSnapshot,
  recordRouterModeIfChanged,
  type ProviderCandidateScore,
  type ProviderFailureClass,
  type ProviderRoutingCandidate,
  type ProviderRoutingEvaluation,
  type ProviderRoutingOptions,
  type ProviderStateSnapshotEvent,
} from './provider-routing'
import { appendFirehoseSummary, mergeInbox, refreshBoard, type InboxRevisionClocks } from './write-inbox'
import { runThemesCycle, bumpCycleCounter, themesConfigFromNews } from './themes/engine'
import { makeThemeNamer } from './themes/llm'
import type { ThemeItemView } from './themes/types'
import { verifyEquityListing } from './symbology'
import type { CycleSummary, FeedItem, NewsItem, RawArticle, TriagedItem } from './types'
import { withInitialRescueDecision } from './rescue/selector'
import {
  captureRescueFeedCheckpoint, recordRescueMode, rescueQueueEnabled, stageRescueFeedRange,
} from './rescue/store'
import { updateSemanticIndex } from '../retrieval/semantic'
import fs from 'node:fs'
import {
  checkpointDurableQueueItems,
  durableQueueLaneCount,
  inspectDurableQueue,
  purgeCompletedDurableQueueItems,
  replaceAllDurableQueueItems,
  replaceDurableQueueLane,
  replaceDurableQueueWindow,
  retireDurableQueueItems,
  type LegacyQueueRow,
} from './durable-queue'

// Items we could NOT score this cycle (daily budget hit, or a Groq batch that failed even after
// retry) spill into this file and are re-queued next cycle. Without it they'd be silently lost:
// the sources won't hand them back (GDELT's lookback ages out; an unchanged RSS feed answers 304).
const DEFERRED_FILE = 'news-deferred.json'
const DEFERRED_PENDING_FILE = 'news-deferred-pending.json'
const INPUT_OVERFLOW_FILE = 'news-input-overflow.json'
const SCORED_CHECKPOINT_FILE = 'news-scored-checkpoints.ndjson'
const SCORED_CHECKPOINT_MAX_BYTES = 100_000_000

/** Worst-case billable tokens for one primary-Groq triage attempt. Reads the output ceiling through
 *  triageMaxOutputTokens — the same batch-sized function the adapter puts on the wire — so the reservation can
 *  never under-state what the call is allowed to emit. A bound computed off the raw config value would
 *  under-reserve for a large batch, which is exactly how a hard daily cap gets busted. */
export function triageGroqTokenBound(items: NewsItem[], options: TriageOptions): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(items), triageMaxOutputTokens(items.length, options.maxTokens))
}

/** The CALIBRATED expected tokens for one triage attempt — what a successful batch really costs, as opposed to
 *  the worst case above. Only the pacing admission test uses it (DailyQuotaCandidate.paceCost); the hard cap
 *  and every reservation keep the conservative bound. */
export function triagePaceTokenBound(items: NewsItem[]): number {
  return estimateTokens(items.length)
}

function hardCapAttempts(budget: Budget, perAttemptTokens: number, maxAttempts: number): number {
  return Math.min(Math.max(1, maxAttempts), budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
}

function chargedAttemptTokens(result: TriageResult | undefined, perAttemptTokens: number): { requests: number; tokens: number } {
  const requests = Number.isFinite(result?.requests) ? Math.max(0, Math.floor(result!.requests)) : 0
  const reportedTokens = Number(result?.tokens)
  const tokens = requests > 0
    ? (reportedTokens > 0 ? reportedTokens + perAttemptTokens * Math.max(0, requests - 1) : perAttemptTokens * requests)
    : 0
  return { requests, tokens }
}

function addProviderCount(target: Record<string, number>, id: string, value: number): void {
  const n = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  if (n > 0) target[id] = (target[id] || 0) + n
}

function routingFailureClass(result: TriageResult): ProviderFailureClass {
  if (result.dailyLimit) return 'provider-day-limit'
  if (result.failure?.code === 'auth' || result.failure?.code === 'entitlement') return 'credential'
  if (result.failure?.code === 'billing') return 'plan-quota'
  if (result.failure?.code === 'model_terminal' || result.failure?.code === 'request_invalid') return 'contract'
  if (result.failureKind === 'contract') return 'contract'
  if (result.failureKind === 'rate_limit') return 'rate-limit'
  if (result.timedOut) return 'timeout'
  if (result.failureKind === 'availability') return 'availability'
  return 'unknown'
}

// Normalization and triage bound every source/model field. Reserve a deliberately conservative 64KiB for
// each eventual NDJSON item before spending a provider call (observed rows peak below 8KiB). The runtime
// assertion at the append boundary fails closed if a future additive field ever violates this contract.
export const MAX_FEED_ITEM_BYTES = 64 * 1024

/** A model-output/request-shape failure belongs to this prompt/workload, not to the provider as a whole.
 * Keeping a separate marker prevents one malformed triage answer from sidelining article reads, Themes,
 * and Ideas that the same endpoint may still serve correctly. Availability/rate-limit failures continue
 * to use the shared provider id because every workload would hit the same outage/window. */
function triageCooldownId(providerId: string): string { return `triage:${providerId}` }

function clearTriageCooldowns(stateDir: string, providerId: string, attemptStartedAt?: number): void {
  clearCooldown(stateDir, providerId, attemptStartedAt)
  clearCooldown(stateDir, triageCooldownId(providerId), attemptStartedAt)
}

function triageIsHeld(stateDir: string, providerId: string, at: number): boolean {
  const shared = cooldownInfo(stateDir, providerId)
  const workload = cooldownInfo(stateDir, triageCooldownId(providerId))
  // Pre-quarantine engines collapsed 401/402/403/404 into an un-fingerprinted provider-access marker. It
  // cannot prove that a new key/model is still bad and, after three failures, used to block that repair
  // forever. OpenAI-compatible routes now take one classified attempt instead. Gemini/Anthropic retain the
  // legacy marker until their adapters migrate to the shared classifier.
  const canonical = providerId !== 'anthropic-triage' && !providerId.startsWith('gemini:')
  const held = (marker: ReturnType<typeof cooldownInfo>) => marker.until > at
    && !(canonical && marker.reason === 'provider-access')
  return held(shared) || held(workload)
}

function triageFailureIsProviderWide(result: TriageResult): boolean {
  if (result.ok) return true
  if (result.failure) return result.failure.providerWide
  const accessFailure = result.httpStatus != null && [401, 402, 403, 404].includes(result.httpStatus)
  return result.failureKind === 'rate_limit'
    || (result.failureKind === 'availability' && !result.timedOut)
    || accessFailure
}

/** Persist the narrowest retry hold that matches a failed triage call. Retry-After is authoritative and
 * flat; service/network failures use the shared exponential breaker; request/JSON failures remain scoped
 * to triage. Only an explicit provider day-limit signal closes the daily ledger — a generic error must not
 * be laundered into a false "quota spent" reading. */
function holdAfterTriageFailure(args: {
  stateDir: string
  providerId: string
  result: TriageResult
  at: number
  cooldownMs: number
  cooldownMaxMs: number
  aborted: boolean
  budget?: Budget
}): void {
  const { stateDir, providerId, result, at, cooldownMs, cooldownMaxMs, aborted, budget } = args
  if (aborted || result.quarantined || result.failure?.action === 'quarantine') return
  if (result.dailyLimit) {
    budget?.exhaust()
    return
  }
  const scopedId = triageCooldownId(providerId)
  const accessFailure = result.httpStatus != null && [401, 402, 403, 404].includes(result.httpStatus)
  // All four statuses hold the whole provider, but they do not mean the same thing to the operator, and
  // groq.ts already draws the distinction the engine used to throw away. Telling someone to rotate a key
  // when the real fault is an exhausted balance or a model id that no longer exists sends them to fix a
  // credential that was never broken. The SCOPE is unchanged; only the reason narrows.
  const accessReason = result.httpStatus === 402 ? 'provider-credits'
    : result.httpStatus === 404 ? 'provider-endpoint'
    : 'provider-access'
  const providerWide = triageFailureIsProviderWide(result)
  const scopedReason = result.timedOut ? 'timeout'
    : result.failureKind === 'contract' ? 'triage-contract'
      : result.failureKind === 'availability' ? 'triage-availability' : 'triage-request'
  // How long the failing call actually ran. Rides onto the marker so a LATER cycle — which sees only the
  // marker, never the failure note — can still tell the operator "timed out at 30.0s" instead of "an error".
  const took = result.elapsedMs
  if (result.rate?.retryAfterMs != null && Number.isFinite(result.rate.retryAfterMs)) {
    const retryMs = Math.max(0, Math.floor(result.rate.retryAfterMs))
    // A header does not widen the failure's scope. Request/contract responses can carry Retry-After too;
    // honor their exact clock on the triage circuit without sidelining every other provider workload.
    const reason = providerWide
      ? result.failureKind === 'rate_limit' ? 'rate-limit' : accessFailure ? accessReason : 'availability'
      : scopedReason
    if (retryMs > 0) armCooldown(stateDir, at, retryMs, providerWide ? providerId : scopedId, retryMs, reason, took)
    return
  }
  if (result.failureKind === 'rate_limit') {
    armCooldown(stateDir, at, 60_000, providerId, 60_000, 'rate-limit', took)
    return
  }
  if (result.failureKind === 'availability') {
    armCooldown(
      stateDir, at, cooldownMs, providerWide ? providerId : scopedId, cooldownMaxMs,
      providerWide ? 'availability' : scopedReason, took,
    )
    return
  }
  if (accessFailure) {
    armCooldown(stateDir, at, cooldownMs, providerId, cooldownMaxMs, accessReason, took)
    return
  }
  armCooldown(stateDir, at, cooldownMs, scopedId, cooldownMaxMs, scopedReason, took)
}

/** One primary-Groq ingester batch with an atomic reservation shared by chat/read/idea callers. */
export async function triageGroqWithReservation(args: {
  budget: Budget
  pace: PaceCfg
  estimatedTokens: number
  items: NewsItem[]
  options: TriageOptions
  now?: () => number
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  maxAttempts?: number
}): Promise<TriageResult | null> {
  const now = args.now || (() => Date.now())
  const perAttemptTokens = triageGroqTokenBound(args.items, args.options)
  const pacePerAttempt = triagePaceTokenBound(args.items)
  let attempts = hardCapAttempts(args.budget, perAttemptTokens, args.maxAttempts ?? 2)
  const at = now()
  // Both gates PACE on the calibrated cost and hold the HARD CAP on the conservative bound — see
  // triagePaceTokenBound and tryReserve. They must agree: when only the admission was calibrated, it
  // admitted batches the reservation then refused, and the cycle dropped them reporting nothing.
  while (attempts > 0 && !args.budget.pacedCanSpend(perAttemptTokens * attempts, args.pace, at, attempts, pacePerAttempt * attempts)) attempts--
  if (!attempts) return null
  const reservation = args.budget.tryReserve(perAttemptTokens * attempts, args.pace, at, attempts, pacePerAttempt * attempts)
  if (!reservation) return null
  let result: TriageResult | undefined
  try {
    result = await triageBatch(args.items, { ...args.options, maxAttempts: attempts }, args.fetchFn, args.sleep)
    return result
  } finally {
    const charged = chargedAttemptTokens(result, perAttemptTokens)
    // A timeout/429/malformed reply often has no usage object even though the provider counted the call.
    // Charge the full safe bound for every sent attempt without reported usage; zero (or the empirical
    // rate-limiter estimate) is not an honest fallback for work authorized under a hard daily cap.
    args.budget.reconcile(reservation, charged.requests, charged.tokens)
  }
}
// Canonical work window for items not yet scored (budget hit / LLM hiccup / plan quota spent). The earlier
// implementation treated this as a loss boundary and silently sliced excess rows. It now bounds only the
// hot file rewritten at each phase: excess source rows stay in INPUT_OVERFLOW_FILE and replay later. 1,000
// was below real peaks (2,383 on 2026-07-07; 1,244 on 2026-07-16), so the default still leaves wide room for
// normal processing while the source-neutral overflow protects exceptional bursts without making every
// phase rewrite an unbounded file.
export const DEFERRED_CAP = (() => { const n = Number(process.env.NEWS_DEFERRED_CAP); return Number.isFinite(n) && n > 0 ? n : 100_000 })()

export function scoringJournalSlots(pendingRows: number, cap: number = DEFERRED_CAP): number {
  const safeCap = Math.max(0, Math.floor(Number.isFinite(cap) ? cap : 0))
  const occupied = Math.max(0, Math.floor(Number.isFinite(pendingRows) ? pendingRows : safeCap))
  return Math.max(0, safeCap - occupied)
}

/** A target partition is journaled before its first append. While that date is still inside the local
 * retention window, a missing local/archive file is therefore positive evidence that the append never
 * began and retrying today is safe. After local retention, absence is ambiguous (an archived commit may be
 * temporarily unavailable), so recovery must fail closed. Future/bad dates are never treated as empty. */
export function recentMissingFeedTargetIsRetryable(
  targetDate: string,
  currentDate: string,
  localRetentionDays: number,
): boolean {
  const targetMs = Date.parse(`${targetDate}T00:00:00Z`)
  const currentMs = Date.parse(`${currentDate}T00:00:00Z`)
  if (!Number.isFinite(targetMs) || !Number.isFinite(currentMs)) return false
  const ageDays = Math.floor((currentMs - targetMs) / 86_400_000)
  const retention = Math.max(1, Math.floor(Number.isFinite(localRetentionDays) ? localRetentionDays : 0))
  return ageDays >= 0 && ageDays < retention
}

// AGE BOUND on the backlog. The work window above bounds each canonical rewrite, but the durable overflow
// may grow during a long provider outage; residence age separately prevents an undrainable stale queue, so a long
// provider outage let it grow without limit (11,000 items on 2026-08-13 → 23,422 on 2026-08-16) and every
// later cycle hit its wall-clock guard re-queuing the same wall. It can then never drain: at the ~36
// items/cycle the degraded tiers managed, a 23,000-item backlog outlives every item in it.
// 48h of RESIDENCE — measured from when an item entered the backlog, never from when its source published
// it. An item that has waited two days behind the queue has lost to two days of fresher news and will keep
// losing; holding it costs queue position and scoring budget that today's news needs. Bounded and
// env-tunable, like the cap.
// NOT a wire-window argument: readFeed windows the wire by the FIREHOSE FILE DATE, which is the cycle date,
// so an item scored today reaches the wire today however old its `found_at` is.
export const DEFERRED_MAX_AGE_MS = (() => {
  const n = Number(process.env.NEWS_DEFERRED_MAX_AGE_HOURS)
  return (Number.isFinite(n) && n > 0 ? n : 48) * 3_600_000
})()

// The share of each cycle's triage slots RESERVED for items fetched this cycle. See buildTriageQueue.
export const FRESH_RESERVE_FRAC = (() => {
  const n = Number(process.env.NEWS_FRESH_RESERVE_FRAC)
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.5
})()

/** Split a backlog into what has waited less than DEFERRED_MAX_AGE_MS and what has aged out of it.
 *  An absent or unparseable timestamp is KEPT — an item is never lost to a missing timestamp. */
export function expireBacklog(
  items: NewsItem[],
  now: Date,
  maxAgeMs: number = DEFERRED_MAX_AGE_MS,
  opts: { requireDeferredStamp?: boolean } = {},
): { live: NewsItem[]; expired: NewsItem[] } {
  const live: NewsItem[] = []
  const expired: NewsItem[] = []
  const at = now.getTime()
  for (const it of items) {
    // A feed-pending row has already paid for and completed scoring. Its residence timestamp stays intact
    // for audit, but the unscored-backlog age policy must never retire it before the authoritative firehose
    // projection lands. Capacity and disk faults can span UTC rollover; those rows retry until committed.
    if (it.feed_pending) {
      live.push(it)
      continue
    }
    // RESIDENCE time, not publication time. `found_at` is the SOURCE's clock — gov-data stamps it with the
    // FDA report date under a 21-day lookback (config govDataLookbackDays), so keying on it retired items
    // discovered minutes ago, unscored, on their first deferral. `deferred_at` is stamped when an item
    // first enters the backlog; `found_at` is the fallback for rows written before that field existed.
    //
    // requireDeferredStamp: expire ONLY on the deferred_at residence clock, never the found_at fallback.
    // The FRESH path carries genuinely-new items whose found_at is a publication date (a gov-data item can be
    // three weeks old yet discovered today), so keying the fresh path on found_at would re-introduce the very
    // publication-date deletion migrateDeferred exists to prevent — only a REDELIVERED item, which carries a
    // preserved deferred_at from preserveResidence, is eligible for expiry there.
    const stamp = opts.requireDeferredStamp ? it?.deferred_at : (it?.deferred_at || it?.found_at)
    const t = Date.parse(String(stamp || ''))
    if (Number.isFinite(t) && at - t > maxAgeMs) expired.push(it)
    else live.push(it)
  }
  return { live, expired }
}

/** Stamp the residence clock on anything entering the backlog, leaving an existing stamp alone — an item
 *  that has already waited a day does not get a fresh start by being re-deferred. */
export function stampDeferred(rows: NewsItem[], at: string): NewsItem[] {
  return rows.map((it) => (it?.deferred_at ? it : { ...it, deferred_at: at }))
}

/** Give rows written by the previous version a residence clock the first time this one sees them.
 *
 *  Without this, the very first load after deploy has no `deferred_at` anywhere, every row falls through to
 *  the `found_at` fallback, and the transition reproduces exactly the bug the fallback exists to survive —
 *  a gov-data row discovered yesterday but published three weeks ago is retired unscored on cycle one. The
 *  fallback is for reading a legacy row, not for expiring one.
 *
 *  The cost is one bounded, one-time 48h extension for a pre-existing backlog. That is the right trade: the
 *  wall this PR drains is capped by DEFERRED_CAP and ages out a day or two later anyway, whereas silently
 *  deleting freshly-discovered items is the P1 this whole change exists to stop. */
export function migrateDeferred(rows: NewsItem[], at: string): NewsItem[] {
  return stampDeferred(rows, at)
}

/** Carry an existing residence stamp across a source REDELIVERY. Overnight and weekend cycles routinely
 *  re-serve an unscored item, and it arrives on the fresh path with no `deferred_at` — so without this the
 *  item re-enters the backlog as a new arrival and its clock restarts every time the source repeats it,
 *  which is precisely how an item outlives an age bound forever. Keyed on `event_id`, the dedup identity. */
export function preserveResidence(fresh: NewsItem[], backlog: NewsItem[]): NewsItem[] {
  if (!backlog.length) return fresh
  const held = new Map<string, string>()
  for (const b of backlog) if (b?.event_id && b.deferred_at) held.set(b.event_id, b.deferred_at)
  if (!held.size) return fresh
  return fresh.map((f) => {
    const prior = f?.event_id ? held.get(f.event_id) : undefined
    return prior && !f.deferred_at ? { ...f, deferred_at: prior } : f
  })
}

/**
 * Order the triage queue so a deep backlog can NEVER starve the items fetched THIS cycle.
 *
 * The queue used to be one flat list sorted by preTriagePriority. That is a strict priority queue, and a
 * strict priority queue starves its low-priority classes for as long as a higher class keeps arriving.
 * preTriagePriority is `tier*3 + keyword + recency` (rank.ts), so a STALE routine exchange filing scores
 * 5*3 + 0 + 0 = 15 while a FRESH newswire headline with no material keyword scores 2*3 + 0 + 5 = 11. Once
 * the backlog held thousands of exchange filings, every one of them outranked every ordinary news item
 * forever: from 2026-08-14 to 2026-08-16 all 540 items the engine scored were `primary_filing`, all of
 * them 5–12h stale, all of them routine, and all 540 scored below the watch threshold and dropped. Zero
 * news reached the wire in three days — not because the triage was wrong about any of them, but because
 * news never got a slot to be judged in.
 *
 * So the two pools share the cycle's slots instead of competing for them. Within each pool the §4
 * priority order is preserved EXACTLY (most material first); the only thing that changes is that fresh
 * items are guaranteed `freshShare` of the queue — and, because a cycle only ever consumes a PREFIX of
 * the queue, of whatever prefix the cycle can afford. freshShare 0 restores the old strict-priority order.
 */
export function buildTriageQueue(
  requeued: NewsItem[],
  fresh: NewsItem[],
  now: Date,
  freshShare: number = FRESH_RESERVE_FRAC,
): NewsItem[] {
  const byPriority = (a: NewsItem, b: NewsItem) => preTriagePriority(b, now) - preTriagePriority(a, now)
  // Scored rows awaiting the firehose are a commit-recovery queue, not fresh scoring work. Put them first
  // (oldest residence first) so the next successful shard append drains them before new provider work.
  const pending = [...requeued, ...fresh]
    .filter((it) => !!it.feed_pending)
    .sort((a, b) => String(a.deferred_at || '').localeCompare(String(b.deferred_at || '')) || a.event_id.localeCompare(b.event_id))
  const freshQ = fresh.filter((it) => !it.feed_pending).sort(byPriority)
  const backQ = requeued.filter((it) => !it.feed_pending).sort(byPriority)
  const share = Math.max(0, Math.min(1, Number.isFinite(freshShare) ? freshShare : FRESH_RESERVE_FRAC))
  // Share 0 is the documented rollback lever (NEWS_FRESH_RESERVE_FRAC=0), so it must restore the ORIGINAL
  // behaviour — one priority sort across both pools. The interleave below would instead append fresh
  // items only once the backlog drained, whatever their priority: an absolute version of the starvation
  // this reserve exists to prevent, reached by the switch meant to undo it.
  if (share <= 0) return [...pending, ...backQ, ...freshQ].sort((a, b) => {
    if (!!a.feed_pending !== !!b.feed_pending) return a.feed_pending ? -1 : 1
    return a.feed_pending ? a.event_id.localeCompare(b.event_id) : byPriority(a, b)
  })
  const out: NewsItem[] = []
  let f = 0
  let b = 0
  while (f < freshQ.length || b < backQ.length) {
    // take fresh when it is still under quota for the NEXT slot — that keeps the guarantee true of every
    // prefix, not just of the whole queue (the cycle rarely reaches the whole queue)
    const freshUnderQuota = f < share * (out.length + 1)
    if (f < freshQ.length && (b >= backQ.length || freshUnderQuota)) out.push(freshQ[f++])
    else out.push(backQ[b++])
  }
  return [...pending, ...out]
}

/** Rolling-safe proof that a persisted feed-pending row contains the complete scored contract. A marker on
 * a malformed/older row is not enough to bypass the model: the cycle fails closed and preserves the journal. */
function isFeedPendingTriaged(item: NewsItem): item is TriagedItem {
  const triaged = ['uncommitted', 'cap', 'io_failure'].includes(String(item.feed_pending))
    && Number.isFinite(Date.parse(String(item.feed_triaged_at || '')))
    && Number.isFinite((item as Partial<TriagedItem>).triage_score)
    && Number.isFinite((item as Partial<TriagedItem>).materiality_pre_score)
    && typeof (item as Partial<TriagedItem>).triage_reason === 'string'
    && ['material', 'relevant_non_material', 'irrelevant'].includes(String((item as Partial<TriagedItem>).relevance))
    && ['primary', 'secondary', 'sector', 'macro'].includes(String((item as Partial<TriagedItem>).issuer_linkage))
    && ['pick', 'watch', 'drop'].includes(String((item as Partial<TriagedItem>).band))
    && Array.isArray((item as Partial<TriagedItem>).event_types)
    && Array.isArray((item as Partial<TriagedItem>).companies)
    && typeof (item as Partial<TriagedItem>).size_bucket === 'string'
    && typeof (item as Partial<TriagedItem>).event_materiality_label === 'string'
    && typeof (item as Partial<TriagedItem>).event_direction === 'string'
    && typeof (item as Partial<TriagedItem>).event_scope === 'string'
  if (!triaged) return false
  const exact = item.pending_feed_item
  if (!exact) return !item.feed_target_date || /^\d{4}-\d{2}-\d{2}$/.test(item.feed_target_date)
  return exact.kind === 'item'
    && exact.event_id === item.event_id
    && exact.headline === item.headline
    && exact.url === item.url
    && exact.domain === item.domain
    && exact.source_name === item.source_name
    && exact.input_nature === item.input_nature
    && exact.triage_score === (item as TriagedItem).triage_score
    && exact.band === (item as TriagedItem).band
    && exact.triage_reason === (item as TriagedItem).triage_reason
    && exact.relevance === (item as TriagedItem).relevance
    && JSON.stringify(exact.event_types) === JSON.stringify((item as TriagedItem).event_types)
    && exact.issuer_linkage === (item as TriagedItem).issuer_linkage
    && JSON.stringify(exact.companies) === JSON.stringify((item as TriagedItem).companies)
    && exact.size_bucket === (item as TriagedItem).size_bucket
    && exact.event_materiality_label === (item as TriagedItem).event_materiality_label
    && exact.event_direction === (item as TriagedItem).event_direction
    && exact.event_scope === (item as TriagedItem).event_scope
    && exact.dedup_status === item.dedup_status
    && exact.inboxed === ((item as TriagedItem).band !== 'drop')
    && Number.isFinite(Date.parse(exact.ts))
    && exact.ts === item.feed_triaged_at
    && (!item.feed_target_date || /^\d{4}-\d{2}-\d{2}$/.test(item.feed_target_date))
}

export type DeferredBacklogInspection = { available: true; items: NewsItem[] } | { available: false; items: [] }

function readDeferredFile(file: string): { status: 'missing' } | { status: 'ok'; items: NewsItem[] } | { status: 'unavailable' } {
  let text: string
  try { text = fs.readFileSync(file, 'utf8') }
  catch (error: any) { return error?.code === 'ENOENT' ? { status: 'missing' } : { status: 'unavailable' } }
  try {
    const value = JSON.parse(text)
    // v2 is intentionally an object wrapper whenever scored feed-recovery state is present. A pre-v2
    // worker rejects it as unavailable and pauses, instead of treating the additive marker as ordinary
    // unscored work during a rolling downgrade. Plain arrays remain the legacy/raw-backlog format.
    const rows = Array.isArray(value)
      ? value
      : value?.v === 2 && Array.isArray(value.items) ? value.items : null
    if (!rows || rows.some((row: any) => !row || typeof row !== 'object'
      || typeof row.event_id !== 'string' || !row.event_id
      || typeof row.headline !== 'string')) return { status: 'unavailable' }
    return { status: 'ok', items: rows as NewsItem[] }
  } catch { return { status: 'unavailable' } }
}

function readInputOverflow(stateDir: string): { status: 'missing' | 'unavailable' } | { status: 'ok'; items: NewsItem[] } {
  const result = readDeferredFile(path.join(stateDir, INPUT_OVERFLOW_FILE))
  if (result.status !== 'ok') return result
  // Every overflow row is a raw-input handoff. Requiring the marker keeps a manually replaced/older file
  // from being mistaken for this authority and preserves the rolling-downgrade fail-closed contract.
  return result.items.every((item) => item.input_pending === true)
    ? result
    : { status: 'unavailable' }
}

function inputOverflowPresence(stateDir: string): 'present' | 'missing' | 'unavailable' {
  let projection: 'present' | 'missing' | 'unavailable'
  try {
    const stat = fs.statSync(path.join(stateDir, INPUT_OVERFLOW_FILE))
    projection = stat.isFile() ? 'present' : 'unavailable'
  } catch (error: any) {
    projection = error?.code === 'ENOENT' ? 'missing' : 'unavailable'
  }
  if (projection === 'unavailable') return projection
  const durableCount = durableQueueLaneCount(stateDir, 'overflow')
  if (durableCount == null) return projection
  // A failed legacy-projection delete still matters when SQLite has already completed the lane. Keep the
  // projection visible until it is actually gone so its tombstones cannot be purged and resurrected.
  return durableCount > 0 || projection === 'present' ? 'present' : 'missing'
}

function readScoredCheckpoints(stateDir: string): { status: 'missing' | 'unavailable' } | { status: 'ok'; items: NewsItem[] } {
  const file = path.join(stateDir, SCORED_CHECKPOINT_FILE)
  let bytes: Buffer
  try { bytes = fs.readFileSync(file) }
  catch (error: any) { return { status: error?.code === 'ENOENT' ? 'missing' : 'unavailable' } }
  if (bytes.length > SCORED_CHECKPOINT_MAX_BYTES) return { status: 'unavailable' }
  // A host/process death may leave only the final batch line torn. Earlier newline-delimited checkpoints
  // remain authoritative; trim that unacknowledged tail before exposing any row.
  if (bytes.length && bytes[bytes.length - 1] !== 0x0a) {
    const lastNewline = bytes.lastIndexOf(0x0a)
    const safeLength = lastNewline < 0 ? 0 : lastNewline + 1
    try {
      const fd = fs.openSync(file, 'r+')
      try { fs.ftruncateSync(fd, safeLength); fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
      bytes = bytes.subarray(0, safeLength)
    } catch { return { status: 'unavailable' } }
  }
  const items: NewsItem[] = []
  for (const raw of bytes.toString('utf8').split('\n')) {
    const text = raw.trim()
    if (!text) continue
    let row: any
    try { row = JSON.parse(text) } catch { return { status: 'unavailable' } }
    if (row?.v !== 1 || !Array.isArray(row.items) || row.items.length > DEFERRED_CAP) return { status: 'unavailable' }
    for (const item of row.items) {
      if (!item || typeof item !== 'object' || typeof item.event_id !== 'string' || !item.event_id
        || typeof item.headline !== 'string' || !item.feed_pending) return { status: 'unavailable' }
      items.push(item as NewsItem)
      if (items.length > DEFERRED_CAP) return { status: 'unavailable' }
    }
  }
  return { status: 'ok', items }
}

/** Small append-only scored-result WAL. Unlike saveDeferred, this writes only the just-completed batch, so
 * a 20k-row raw queue is not reserialized+fsynced after every 12-row model response. */
export function appendScoredCheckpoint(stateDir: string, items: readonly TriagedItem[]): boolean {
  if (!items.length) return true
  if (!checkpointDurableQueueItems(stateDir, items)) return false
  const file = path.join(stateDir, SCORED_CHECKPOINT_FILE)
  const line = Buffer.from(`${JSON.stringify({ v: 1, items })}\n`, 'utf8')
  let fd: number | undefined
  let offset = 0
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fd = fs.openSync(file, 'a+')
    offset = fs.fstatSync(fd).size
    if (offset + line.length > SCORED_CHECKPOINT_MAX_BYTES) return false
    let written = 0
    while (written < line.length) {
      const n = fs.writeSync(fd, line, written, line.length - written)
      if (n <= 0) throw new Error('scored checkpoint append made no progress')
      written += n
    }
    if (fs.fstatSync(fd).size !== offset + line.length) throw new Error('scored checkpoint append was short')
    fs.fsyncSync(fd)
    if (offset === 0) fsyncDirectory(stateDir)
    return true
  } catch {
    if (fd !== undefined) {
      try { fs.ftruncateSync(fd, offset); fs.fsyncSync(fd) } catch { /* torn tail is repaired on read */ }
    }
    return false
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
  }
}

export function inspectDeferredBacklog(stateDir: string): DeferredBacklogInspection {
  const primary = readDeferredFile(path.join(stateDir, DEFERRED_FILE))
  const pending = readDeferredFile(path.join(stateDir, DEFERRED_PENDING_FILE))
  const scored = readScoredCheckpoints(stateDir)
  const overflow = readInputOverflow(stateDir)
  const legacyAvailable = primary.status !== 'unavailable' && pending.status !== 'unavailable'
    && scored.status !== 'unavailable' && overflow.status !== 'unavailable'
  const merged: LegacyQueueRow[] = []
  const seen = new Set<string>()
  // The pending file is the write-ahead journal. If its rename landed but canonical replacement failed,
  // it contains the NEWER typed marker/payload for the same id and must win over stale canonical state.
  for (const row of [
    ...(scored.status === 'ok' ? scored.items.map((item) => ({ item, lane: 'hot' as const })) : []),
    ...(pending.status === 'ok' ? pending.items.map((item) => ({ item, lane: 'barrier' as const })) : []),
    ...(primary.status === 'ok' ? primary.items.map((item) => ({ item, lane: 'hot' as const })) : []),
    ...(overflow.status === 'ok' ? overflow.items.map((item) => ({ item, lane: 'overflow' as const })) : []),
  ]) {
    if (seen.has(row.item.event_id)) continue
    seen.add(row.item.event_id)
    merged.push(row)
  }
  const durable = inspectDurableQueue(stateDir, { available: legacyAvailable, rows: merged })
  return durable.available ? { available: true, items: durable.items } : { available: false, items: [] }
}

export function loadDeferred(stateDir: string): NewsItem[] {
  const snapshot = inspectDeferredBacklog(stateDir)
  return snapshot.available ? snapshot.items : []
}

function fsyncDirectory(dirPath: string): void {
  const fd = fs.openSync(dirPath, 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

/** Persist bytes and their rename across a host crash, not merely a process crash. */
function writeAtomicDurably(tmp: string, target: string, bytes: string): void {
  const fd = fs.openSync(tmp, 'w', 0o600)
  try {
    fs.writeFileSync(fd, bytes)
    fs.fsyncSync(fd)
  } finally { fs.closeSync(fd) }
  fs.renameSync(tmp, target)
  fsyncDirectory(path.dirname(target))
}

/** Full raw-input rolling-deploy barrier. The old worker already inspects DEFERRED_PENDING_FILE and rejects
 * object-wrapped v2 state, so the FIRST durable handoff must land here rather than in a new pathname it
 * cannot see. Keep this full superset until both the bounded canonical prefix and overflow suffix are
 * durable; every crash boundary then pauses old workers while current workers can merge every row. */
function saveInputBarrier(stateDir: string, items: readonly NewsItem[], log: (m: string) => void): boolean {
  const target = path.join(stateDir, DEFERRED_PENDING_FILE)
  const tmp = `${target}.input.tmp`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const retained = items.map((item) => ({ ...item, input_pending: true as const }))
    if (!replaceAllDurableQueueItems(stateDir, retained, 'barrier')) {
      throw new Error('SQLite input barrier was not committed')
    }
    writeAtomicDurably(tmp, target, `${JSON.stringify({ v: 2, items: retained })}\n`)
    return true
  } catch (e: any) {
    log(`saveInputBarrier failed (${e?.message || e}) — source handoff was not acknowledged and prior backlog bytes were preserved`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* prior pending authority remains intact */ }
    return false
  }
}

/** Replace only the canonical hot window while the full pending barrier remains in place. Calling the
 * ordinary saveDeferred here would overwrite/remove that barrier before overflow became durable. */
function saveCanonicalInputWindow(stateDir: string, items: readonly NewsItem[], log: (m: string) => void): boolean {
  const target = path.join(stateDir, DEFERRED_FILE)
  const tmp = `${target}.input.tmp`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const retained = items.map((item) => ({ ...item, input_pending: true as const }))
    if (!replaceDurableQueueLane(stateDir, 'hot', retained, 'absent-from-hot-input-window')) {
      throw new Error('SQLite hot input window was not committed')
    }
    writeAtomicDurably(tmp, target, `${JSON.stringify({ v: 2, items: retained })}\n`)
    return true
  } catch (e: any) {
    log(`saveCanonicalInputWindow failed (${e?.message || e}) — full pending barrier remains authoritative`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* full pending barrier remains authoritative */ }
    return false
  }
}

function clearInputBarrier(stateDir: string, log: (m: string) => void): boolean {
  const target = path.join(stateDir, DEFERRED_PENDING_FILE)
  const tmp = `${target}.clear.tmp`
  try {
    const outstanding = durableQueueLaneCount(stateDir, 'barrier')
    if (outstanding == null || outstanding > 0) {
      throw new Error(`SQLite input barrier still contains ${outstanding == null ? 'unknown' : outstanding} item(s)`)
    }
    // Keep an empty v2 rollback barrier permanently. A pre-SQLite worker rejects this wrapper and pauses,
    // so it can never consume a plain-array projection without updating the canonical database.
    writeAtomicDurably(tmp, target, `${JSON.stringify({ v: 2, items: [] })}\n`)
    // Do not purge here. A scored checkpoint or overflow projection may still exist and could resurrect a
    // completed row after a crash. saveDeferred owns the single purge boundary after every projection is gone.
    return true
  } catch (e: any) {
    log(`clearInputBarrier failed (${e?.message || e}) — full pending barrier remains authoritative`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
    return false
  }
}

/** Source-neutral raw overflow authority. The canonical backlog remains bounded to DEFERRED_CAP work rows,
 * while this file holds every excess fetched row until a later standalone or in-process cycle can admit it.
 * It is written before any source acknowledgement or provider call. Empty means delete+directory-fsync so
 * saveDeferred can safely return to the legacy array format after the overflow has fully drained. */
function saveInputOverflow(stateDir: string, items: readonly NewsItem[], log: (m: string) => void): boolean {
  const target = path.join(stateDir, INPUT_OVERFLOW_FILE)
  const tmp = `${target}.tmp`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const retained = items.map((item) => ({ ...item, input_pending: true as const }))
    if (!replaceDurableQueueLane(stateDir, 'overflow', retained, 'removed-from-input-overflow')) {
      throw new Error('SQLite input overflow was not committed')
    }
    if (!items.length) {
      fs.rmSync(target, { force: true })
      fsyncDirectory(stateDir)
      return true
    }
    writeAtomicDurably(tmp, target, `${JSON.stringify({ v: 2, items: retained })}\n`)
    return true
  } catch (e: any) {
    log(`saveInputOverflow failed (${e?.message || e}) — source handoff was not acknowledged and existing overflow bytes were preserved`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* last-good overflow remains authoritative */ }
    return false
  }
}

// ATOMIC write: this file owns the bounded active work window. A plain truncating write
// that fails mid-way (e.g. ENOSPC during a long outage, exactly when the backlog is largest) would leave a
// truncated/corrupt file that next loadDeferred parses as [] — silently dropping up to DEFERRED_CAP held
// items with no trace. So write a temp file in the same dir and rename it over the target (atomic on one
// filesystem): a failed temp write leaves the last-good backlog intact, and the error is LOGGED, not swallowed.
// Returns true when the backlog was persisted this cycle, false when the write failed and the last-good file
// was kept instead. The caller surfaces a false as `deferred_write_failed` on the cycle summary, so the
// backlog/deferred counts are not reported as safely-on-disk when the new list never reached the file — an
// ENOSPC mid-outage could otherwise show items "waiting" that were actually only in memory (Codex review, PR #316).
export function saveDeferred(
  stateDir: string,
  items: NewsItem[],
  log: (m: string) => void = () => {},
  cap: number = DEFERRED_CAP,
): boolean {
  // Direct callers and maintenance commands may enter here before runIngestCycle has loaded the queue.
  // Bootstrap from the last-good file journals first; every later write can then require SQLite.
  if (!inspectDeferredBacklog(stateDir).available) {
    log('saveDeferred failed (durable queue unavailable) — canonical backlog was preserved')
    return false
  }
  const target = path.join(stateDir, DEFERRED_FILE)
  const tmp = `${target}.tmp`
  const pending = path.join(stateDir, DEFERRED_PENDING_FILE)
  const pendingTmp = `${pending}.tmp`
  const scoredCheckpoint = path.join(stateDir, SCORED_CHECKPOINT_FILE)
  const overflowPresence = inputOverflowPresence(stateDir)
  if (overflowPresence === 'unavailable') {
    log('saveDeferred failed (input overflow authority unavailable) — canonical backlog was preserved')
    return false
  }
  // Projection recovery rows outrank unscored work in the active window. A large provider tail must never
  // slice away an already-paid scored row waiting only for durable feed completion.
  const prioritized = [
    ...items.filter((item) => !!item.feed_pending),
    ...items.filter((item) => !item.feed_pending),
  ]
  const safeCap = Math.max(0, Math.floor(Number.isFinite(cap) ? cap : 0))
  const retained = prioritized.slice(0, safeCap)
  const excess = prioritized.slice(safeCap)
  if (!replaceDurableQueueWindow(stateDir, retained, excess, 'removed-from-active-work-window')) {
    log(`saveDeferred failed (SQLite transaction refused) — ${items.length} item(s) remain in the last committed queue`)
    return false
  }
  const bytes = JSON.stringify((overflowPresence === 'present'
    || excess.length > 0 || retained.some((item) => !!item.feed_pending || item.input_pending === true))
    ? { v: 2, items: retained }
    : retained) + '\n'
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    // Write-ahead journal: if the canonical rename fails after one-shot sources have already delivered new
    // rows, the next cycle can still merge and retry them instead of losing them with process memory.
    writeAtomicDurably(pendingTmp, pending, bytes)
    writeAtomicDurably(tmp, target, bytes)
    let compatibilityJournalsCleared = false
    try {
      // Replace the write-ahead rows with a permanent empty v2 downgrade barrier. Old workers reject it;
      // current readers treat it as an empty compatibility projection.
      writeAtomicDurably(pendingTmp, pending, `${JSON.stringify({ v: 2, items: [] })}\n`)
      fs.rmSync(scoredCheckpoint, { force: true })
      fsyncDirectory(stateDir)
      compatibilityJournalsCleared = true
    } catch { /* duplicate journal is harmless; reads dedupe ids */ }
    // An old overflow projection can still name completed rows after its delete failed. Preserve their
    // tombstones until the file is really gone; otherwise the next legacy merge could resurrect them.
    if (compatibilityJournalsCleared && overflowPresence === 'missing'
      && !purgeCompletedDurableQueueItems(stateDir)) {
      log('saveDeferred: SQLite completion tombstones remain for a later cleanup')
    }
    return true
  } catch (e: any) {
    log(`saveDeferred failed (${e?.message || e}) — kept the last-good backlog and any completed pending journal; ${items.length} item(s) need a retry`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* best-effort temp cleanup */ }
    try { fs.rmSync(pendingTmp, { force: true }) } catch { /* completed pending journal is intentionally kept */ }
    return false
  }
}

// A cycle calls saveDeferred at several durable phase boundaries: raw input, post-triage, exact feed payload,
// and final cleanup. Every one excludes backlogExpired; the final cleanup shrinks the file to the true tail.
// Therefore ANY pre-projection canonical write plus the final write form the two booleans below. Both exclude
// backlogExpired rows, so EITHER write succeeding already durably replaces the on-disk file with a copy that
// no longer has them — the expired rows are gone from disk the moment the FIRST of the two writes lands, not
// only once the LAST one does. Tracking only the final write's result (overwriting the journal write's result
// on the second call) undercounts retirement in the partial-success case: journal write ok, cleanup write
// fails. Exported as its own function so that case can be pinned by a table test without needing to drive a
// real disk failure under the (root) test runner, where chmod-based simulation doesn't work. (Codex #453 —
// partial-success across the two backlog writes.)
export function backlogDurablyCleared(journalWriteOk: boolean, cleanupWriteOk: boolean): boolean {
  return journalWriteOk || cleanupWriteOk
}

// Tracking-param-insensitive key for the GDELT↔RSS merge ONLY (event_id keeps hashing the verbatim
// URL — that recipe is shared with Gate-0 and must not drift). Stops the same story arriving once
// via GDELT's canonical URL and once via an RSS link with ?utm_… from being scored twice.
function urlKey(u: string): string {
  try {
    const x = new URL(u)
    x.hash = ''
    const drop: string[] = []
    x.searchParams.forEach((_v, k) => {
      if (/^utm_/i.test(k) || /^(fbclid|gclid|cmpid|mc_cid|mc_eid|ref)$/i.test(k)) drop.push(k)
    })
    for (const k of drop) x.searchParams.delete(k)
    return x.toString().replace(/\/+$/, '')
  } catch {
    return u
  }
}

type Cfg = typeof NEWS

export interface RunCycleDeps {
  repoRoot?: string
  stateDir?: string
  config?: Partial<Cfg>
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
  // drain-only mode: skip the FETCH layers and just triage the deferred backlog (the scheduler runs
  // this between fetch cycles so Groq never sits idle while there's a backlog + daily budget left).
  skipFetch?: boolean
  // the cycle's abort signal (from runAbortableCycle's wall-clock guard). When it fires, the triage loop
  // stops starting new batches/provider calls instead of grinding the whole backlog — see the break below.
  signal?: AbortSignal
  // The subscription last-resort tier SPAWNS the `claude` CLI, which `fetchFn` cannot stub. Inject a fake
  // here to exercise that tier without a real process (and without drawing the host's plan quota); a test
  // that doesn't care should instead set config.anthropicFallbackEnabled=false. Undefined ⇒ the real CLI.
  claudeCliRunner?: ClaudeCliRunner
  /** Test seam for journal/final-cleanup failure. Production always uses the atomic saveDeferred writer. */
  saveDeferredFn?: typeof saveDeferred
  /** Test seam for the small append-only per-batch scored-result checkpoint. */
  appendScoredCheckpointFn?: typeof appendScoredCheckpoint
  /** Test seam for a durable cycle-summary refusal. */
  appendFirehoseSummaryFn?: typeof appendFirehoseSummary
}

/** Maintain Themes on EVERY scanner clock, including a fetch that produced no new on-list items. Theme
 * admission and retirement depend on wall time, and validation retries depend on discovery cadence; tying
 * this stage to a non-empty triage queue leaves open clients with stale actionable rows on quiet days. */
async function runThemesStage(input: {
  cfg: Cfg
  repoRoot: string
  stateDir: string
  picks: TriagedItem[]
  dfPicks?: TriagedItem[]
  fetchFn: typeof fetch
  now: () => Date
  log: (m: string) => void
  signal?: AbortSignal
  revisionClocksByEvent?: ReadonlyMap<string, InboxRevisionClocks>
}): Promise<void> {
  const { cfg, repoRoot, stateDir, picks, dfPicks, fetchFn, now, log, signal, revisionClocksByEvent } = input
  if (!cfg.themesEnabled) return
  try {
    const toThemeItems = (rows: TriagedItem[]): ThemeItemView[] => rows
      .filter((t) => t.triage_score >= cfg.themesMinScore)
      .map((t) => {
        const clocks = revisionClocksByEvent?.get(t.event_id)
        const sourceIsEnglish = clocks ? clocks.sourceIsEnglish : t.source_is_english === true
        return {
          event_id: t.event_id,
          dedup_group: t.dedup_group, // one underlying story across publisher copies — Themes counts it once
          headline: t.headline,
          headline_en: t.headline_en,
          ...(sourceIsEnglish ? { source_is_english: true as const } : {}),
          // The inbox row is the durable exact-revision record. An acted-on refresh may carry a newer
          // provider timestamp in `t`, but mergeInbox deliberately keeps the source clock the human saw.
          found_at: clocks?.foundAt || t.found_at,
          ...(clocks?.observedAt ? { observed_at: clocks.observedAt } : {}),
          companies: t.companies,
          event_types: t.event_types,
          issuer_linkage: t.issuer_linkage,
          triage_score: t.triage_score,
          materiality_pre_score: t.materiality_pre_score,
          source_tier: deriveSourceTier(t),
          source_name: t.source_name,
          url: t.url,
          scope: deriveScope(t),
          region: t.region,
          country: resolveCountry(t.headline, t.headline_en, t.companies, t.region, t.issuer_linkage),
          commodities: deriveCommodities(t),
        }
      })
    const themeItems = toThemeItems(picks)
    const dfItems = dfPicks ? toThemeItems(dfPicks) : undefined
    const n = bumpCycleCounter(stateDir)
    let themesTimeout: ReturnType<typeof setTimeout> | undefined
    const res = await Promise.race([
      runThemesCycle({
        repoRoot,
        stateDir,
        items: themeItems,
        ...(dfItems ? { dfItems } : {}),
        runDiscovery: n % Math.max(1, cfg.themesDiscoverEveryCycles) === 0,
        minScore: cfg.themesMinScore,
        now,
        cfg: themesConfigFromNews(cfg),
        llmNamer: makeThemeNamer(cfg, fetchFn, stateDir, log, signal),
        verifyListing: (ticker, companyName) => verifyEquityListing(ticker, companyName, fetchFn),
      }),
      new Promise<never>((_, reject) => {
        themesTimeout = setTimeout(() => reject(new Error('themes stage exceeded 90s — skipped')), 90_000)
        themesTimeout.unref?.()
      }),
    ]).finally(() => { if (themesTimeout) clearTimeout(themesTimeout) })
    for (const summary of res.changed) newsBus.emit({ type: 'theme-update', theme: summary })
    for (const removal of res.removed) newsBus.emit({ type: 'theme-remove', removal })
    if (res.changed.length || res.removed.length) log(`themes: ${res.changed.length} updated, ${res.removed.length} removed`)
  } catch (e: any) {
    log(`themes stage error: ${e?.message || e}`)
  }
}

export async function runIngestCycle(deps: RunCycleDeps = {}): Promise<CycleSummary> {
  const cfg: Cfg = { ...NEWS, ...(deps.config || {}) }
  const repoRoot = deps.repoRoot || REPO_ROOT
  const stateDir = deps.stateDir || STATE_DIR
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = deps.now || (() => new Date())
  const log = deps.log || (() => {})
  const persistDeferred = deps.saveDeferredFn || saveDeferred
  const persistScoredCheckpoint = deps.appendScoredCheckpointFn || appendScoredCheckpoint
  const persistCycleSummary = deps.appendFirehoseSummaryFn || appendFirehoseSummary
  const ts = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const date = ts.slice(0, 10)
  const cycleStartedAt = Date.parse(ts)
  const rescueCheckpointBefore = captureRescueFeedCheckpoint(repoRoot, cycleStartedAt, cfg.rescueMaxAgeHrs)
  if (!rescueQueueEnabled(cfg.rescueMode) && !recordRescueMode(stateDir, 'off', cycleStartedAt)) {
    log('second look disabled, but its small off-mode marker could not be saved')
  }
  const routingCycleId = deterministicCycleId(ts)
  const routingOptions = (): ProviderRoutingOptions => ({
    repoRoot,
    stateDir,
    archiveDir: cfg.newsArchiveDir,
    requestedMode: cfg.providerRouterMode,
    shadowHours: cfg.providerRouterShadowHours,
    minOutcomes: cfg.providerRouterMinOutcomes,
    now: now().getTime(),
  })

  const phase: 'fetch' | 'drain' = deps.skipFetch ? 'drain' : 'fetch'
  const blank: CycleSummary = { ts, ok: false, fetched: 0, candidates: 0, picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0, phase }

  const hasScoringProvider = Boolean(
    cfg.groqApiKey
    || cfg.localProvider
    || cfg.overflowProviders.some((provider) => provider.apiKey)
    || (cfg.geminiEnabled && cfg.geminiApiKey && cfg.geminiModels.length)
    || (cfg.anthropicFallbackEnabled && (cfg.anthropicFallbackMode === 'subscription' || cfg.anthropicApiKey)),
  )
  // The backlog is durable authority for one-shot fetched rows. Bad JSON/schema or an unreadable file may
  // conceal work, so stop before fetching or spending and never overwrite it as an invented empty queue.
  const backlogSnapshot = inspectDeferredBacklog(stateDir)
  if (!backlogSnapshot.available) {
    return {
      ...blank,
      deferred_read_failed: true,
      note: 'news backlog record needs attention — fetch and scoring paused; existing files were preserved',
    }
  }
  const corruptFeedPending = backlogSnapshot.items.find((item) => !!item.feed_pending && !isFeedPendingTriaged(item))
  if (corruptFeedPending) {
    const failure: CycleSummary = {
      ...blank,
      feed_commit_version: 1,
      completed_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      deferred_read_failed: true,
      deferred: backlogSnapshot.items.length,
      backlog: backlogSnapshot.items.length,
      backlog_cap: DEFERRED_CAP,
      defer_reason: 'storage-emergency',
      defer_reasons: ['storage-emergency'],
      note: `feed recovery record ${corruptFeedPending.event_id} is inconsistent — scoring and projection paused; backlog files were preserved`,
    }
    appendFirehoseSummary(repoRoot, date, failure)
    newsBus.emit({ type: 'news-cycle', summary: failure })
    return failure
  }
  // Feed-pending rows are already scored and need no model. They must still cross the persistence boundary
  // when every provider is disabled or temporarily absent; only a purely-unscored queue remains idle.
  const hasDrainablePending = backlogSnapshot.items.some(isFeedPendingTriaged)
  if (!hasScoringProvider && !hasDrainablePending && backlogSnapshot.items.length === 0) {
    await runThemesStage({ cfg, repoRoot, stateDir, picks: [], fetchFn, now, log, signal: deps.signal })
    return { ...blank, note: 'no scoring provider configured — ingester idle' }
  }

  // Capture the last complete hour before this cycle installs its in-progress receipt. It is used only as
  // one of Haiku's pressure gates; incomplete history never manufactures pressure.
  const preCycleFlowRead = readPipelineFlowCycles(repoRoot, cfg.newsArchiveDir, now().getTime(), cfg.cycleTimeoutMs, stateDir)
  const preCycleFlow = buildPipelineFlowRates(preCycleFlowRead.cycles, now().getTime(), cfg.cycleTimeoutMs, preCycleFlowRead.history)

  // Start a compact, fsynced completion receipt before any fetch/scoring/projection work. If the cycle dies
  // or its summary cannot be fsynced, the marker makes trailing-rate coverage unavailable rather than letting
  // a missing high-inflow/low-scan look create false headroom. Refuse work when this safety receipt cannot land.
  if (!beginPipelineFlowCycle(stateDir, ts, now().getTime(), cfg.cycleTimeoutMs)) {
    return { ...blank, deferred_write_failed: true, note: 'pipeline flow safety record unavailable — scan paused before reading or scoring' }
  }
  const publishCycleSummary = (summary: CycleSummary): void => {
    summary.feed_commit_version = 1
    const summaryDurable = persistCycleSummary(repoRoot, date, summary)
    if (summaryDurable) completePipelineFlowCycle(stateDir, ts)
    if (rescueQueueEnabled(cfg.rescueMode)) {
      const checkpointAt = Date.parse(summary.completed_at || summary.ts)
      const checkpointAfter = captureRescueFeedCheckpoint(repoRoot, checkpointAt, cfg.rescueMaxAgeHrs)
      if (!rescueCheckpointBefore.available || !checkpointAfter.available
        || !stageRescueFeedRange(stateDir, checkpointAt, {
          before: rescueCheckpointBefore.checkpoint,
          after: checkpointAfter.checkpoint,
        })) {
        log('second look shadow paused — its small post-Ideas feed marker could not be saved')
      }
    }
    newsBus.emit({ type: 'news-cycle', summary })
  }
  if (!hasScoringProvider && !hasDrainablePending) {
    const count = backlogSnapshot.items.length
    const summary: CycleSummary = {
      ...blank,
      ok: true,
      completed_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      candidates: backlogSnapshot.items.length,
      fresh: 0,
      new_arrivals: 0,
      carryover: backlogSnapshot.items.length,
      deferred: backlogSnapshot.items.length,
      backlog: count,
      backlog_cap: DEFERRED_CAP,
      defer_reason: 'no-scoring-provider',
      defer_reasons: ['no-scoring-provider'],
      note: `no scoring provider configured — ${backlogSnapshot.items.length} unscored item${backlogSnapshot.items.length === 1 ? '' : 's'} remain durably queued`,
    }
    publishCycleSummary(summary)
    await runThemesStage({ cfg, repoRoot, stateDir, picks: [], fetchFn, now, log, signal: deps.signal })
    return summary
  }

  // Announce the cycle BEFORE any network work, so the cockpit can say "looking now" for its whole
  // duration rather than staying blind until the summary lands ~minutes later. Every exit path below
  // emits a matching news-cycle, so a start is never left dangling.
  newsBus.emit({ type: 'news-cycle-start', ts, phase })

  // 1. FETCH — GDELT, RSS and the NSE primary-disclosure API in parallel; one layer failing never
  // blocks the others. Merge by URL (first wins; order is only a tiebreak — each carries its own
  // `via` provenance for the live feed). In drain-only mode we skip the network entirely and just
  // work the deferred backlog (no re-fetch → never hammers the upstream feeds between fetch cycles).
  const fetches = deps.skipFetch ? [] as PromiseSettledResult<RawArticle[]>[] : await Promise.allSettled([
    fetchGdelt({ lookbackMin: cfg.gdeltLookbackMin, baseUrl: cfg.gdeltBaseUrl, chunkSize: cfg.gdeltChunkSize, chunkGapMs: cfg.gdeltChunkGapMs, timeoutMs: cfg.rssTimeoutMs, cycleMs: cfg.pollIntervalMin * 60_000, backoffCyclesOn429: cfg.gdeltBackoffCyclesOn429 }, { fetchFn, sleep, log }),
    cfg.rssEnabled
      ? fetchRss(
          {
            feedsPath: path.join(repoRoot, cfg.rssFeedsPath),
            lookbackMin: cfg.gdeltLookbackMin,
            timeoutMs: cfg.rssTimeoutMs,
            stateDir,
            userAgent: cfg.rssUserAgent || undefined,
            concurrency: cfg.rssConcurrency,
            perHostGapMs: cfg.rssPerHostGapMs,
          },
          { fetchFn, sleep, now, log },
        )
      : Promise.resolve([] as RawArticle[]),
    cfg.nseEnabled
      ? fetchNse({ baseUrl: cfg.nseBaseUrl, lookbackHours: cfg.nseLookbackHours, timeoutMs: cfg.rssTimeoutMs, userAgent: cfg.rssUserAgent || undefined }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
    cfg.exchangeIntlEnabled
      ? fetchExchangeIntl({ lookbackHours: cfg.exchangeIntlLookbackHours, timeoutMs: cfg.rssTimeoutMs, userAgent: cfg.rssUserAgent || undefined }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
    cfg.govDataEnabled
      ? fetchGovData({ lookbackDays: cfg.govDataLookbackDays, timeoutMs: cfg.rssTimeoutMs }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
    cfg.redditEnabled
      ? fetchReddit(
          {
            feedsPath: path.join(repoRoot, cfg.redditFeedsPath),
            lookbackHours: cfg.redditLookbackHours,
            timeoutMs: cfg.rssTimeoutMs,
            perHostGapMs: cfg.redditPerHostGapMs,
            mirrorTemplate: cfg.redditMirrorTemplate || undefined,
            cycleMs: cfg.pollIntervalMin * 60_000,
            backoffCyclesOn429: cfg.redditBackoffCyclesOn429,
            overallBudgetMs: cfg.redditOverallBudgetMs,
          },
          { fetchFn, sleep, now, log },
        )
      : Promise.resolve([] as RawArticle[]),
  ])
  const raws: RawArticle[] = []
  const seenUrl = new Set<string>()
  // per-source delivery for THIS cycle, keyed by `via` — the live counterpart to the on-open source
  // health snapshot. A layer that fetched nothing simply never appears.
  const bySource: Record<string, number> = {}
  for (const f of fetches) {
    if (f.status !== 'fulfilled') {
      log(`fetch layer failed: ${(f as PromiseRejectedResult).reason?.message || f.reason}`)
      continue
    }
    for (const a of f.value) {
      // A URL is not a revision identity: RSS/regulator feeds can reuse it for a correction or reversal.
      // Keep distinct normalized headlines while still collapsing tracking-param copies of the same revision.
      const key = a.url && `${urlKey(a.url)}\u0000${String(a.title || '').trim().replace(/\s+/g, ' ').toLowerCase()}`
      if (key && !seenUrl.has(key)) {
        seenUrl.add(key)
        raws.push(a)
        const via = a.via || 'other'
        bySource[via] = (bySource[via] || 0) + 1
      }
    }
  }
  // A drain fetches nothing, so `sources` stays absent there rather than reporting a misleading all-zero row.
  const sources = phase === 'fetch' ? bySource : undefined

  // 2. NORMALIZE + FILTER + DEDUP — plus the previous cycle's deferred (unscored) spillover
  const seen = SeenCache.load(stateDir)
  const ledgerIds = loadLedgerEventIds(path.join(repoRoot, 'screener', 'ledger', 'events.ndjson'))
  // Migrate before anything reads a residence stamp: rows written by the previous version carry none, and
  // reading them through the `found_at` fallback would expire them by publication date — the bug this
  // replaced. Then carry each stamp across a source REDELIVERY, so an item a source keeps re-serving does
  // not restart its clock every time it reappears on the fresh path.
  // `input_pending` exists only to make the raw handoff fail closed across rollback. Once this worker has
  // loaded the v2 authority it is ordinary unscored queue work; do not carry the marker into later journals.
  const backlogRows = migrateDeferred(backlogSnapshot.items.map(({ input_pending: _inputPending, ...item }) => item), ts)
  // A feed-pending backlog copy is the scored authority. A source redelivery only has raw fields and must
  // never overwrite it, strip its exact pending FeedItem payload, or spend another LLM call on the same id.
  const feedPendingIds = new Set(backlogRows.filter((it) => !!it.feed_pending).map((it) => it.event_id))
  const fresh = preserveResidence(normalizeAndFilter(raws, { ledgerEventIds: ledgerIds, seen, now }), backlogRows)
    .filter((it) => !feedPendingIds.has(it.event_id))
  const freshIds = new Set(fresh.map((i) => i.event_id))
  const nowDate = now()
  const carried = backlogRows.filter((d) => d?.event_id && !freshIds.has(d.event_id)
    // A crash may save Seen after a durable append but before backlog cleanup/downstream replay. Typed
    // pending is recovery authority and outranks the optimization cache until this cycle acknowledges it.
    && (!!d.feed_pending || !seen.has(d.event_id)))
  // Retire the part of the backlog that can no longer reach the 2-day wire, BEFORE it competes for a slot.
  // Reported, never silent: it is a missed scoring target, but SQLite keeps the exact payload and reason.
  let { live: requeued, expired: carriedExpired } = expireBacklog(carried, nowDate)
  // A REDELIVERED aged item is NOT in `carried` — its event_id is in freshIds, so the filter above dropped
  // the carried copy — so it would bypass expiry entirely and live in the fresh pool forever, restarting
  // nothing (preserveResidence kept its clock) but never retiring, consuming a fresh-reserved slot every
  // cycle a source re-serves it. Expire it here too, but ONLY on its preserved deferred_at
  // (requireDeferredStamp) — never found_at — so a genuinely-new item with an old publication date is
  // untouched. (Codex #453 — redelivered rows must be expired before fresh classification.)
  let { live: freshLive, expired: freshExpired } = expireBacklog(fresh, nowDate, DEFERRED_MAX_AGE_MS, { requireDeferredStamp: true })
  // `freshLive` is a routing pool, not an arrival counter: it also contains a source redelivery of an ID
  // already resident in the backlog. Partition by durable identity before emitting queue inflow telemetry.
  const newArrivals = countUniqueNewArrivals(freshLive, backlogRows)
  let backlogExpired = [...carriedExpired, ...freshExpired]
  let retirementPersisted = false
  if (backlogExpired.length) {
    retirementPersisted = retireDurableQueueItems(
      stateDir,
      backlogExpired,
      `waited-longer-than-${Math.round(DEFERRED_MAX_AGE_MS / 3_600_000)}h`,
      nowDate,
    )
    if (!retirementPersisted) {
      // If the terminal transaction cannot commit, keep every candidate active. Age is a scheduling policy,
      // never permission to forget bytes when the durable ledger is unavailable.
      requeued = [...requeued, ...carriedExpired]
      freshLive = [...freshLive, ...freshExpired]
      carriedExpired = []
      freshExpired = []
      backlogExpired = []
      log('backlog retirement paused — SQLite could not preserve the terminal payload; all items remain active')
    }
  }
  if (backlogExpired.length) {
    log(`backlog: ${backlogExpired.length} item${backlogExpired.length === 1 ? '' : 's'} retired — waited longer than ${Math.round(DEFERRED_MAX_AGE_MS / 3_600_000)}h behind the queue; never scored`)
  }
  // Order the triage queue by a cheap deterministic pre-priority so the SCARCE Groq budget scores the
  // most promising items first (a material keyword / primary filing / fresh item before routine news),
  // while RESERVING a share of the slots for this cycle's fresh items so a deep backlog can never starve
  // today's news out of the wire. Whatever the budget can't reach this cycle defers to the next — never
  // lost, but now the tail that defers is the low-priority tail of each pool, not a random one, and never
  // the whole of one pool. (rank.ts preTriagePriority; buildTriageQueue above.)
  let items = buildTriageQueue(requeued, freshLive, nowDate)

  if (!items.length) {
    // saveDeferred keeps the last-good file and returns false when the write fails (ENOSPC, permissions, a
    // failed rename). Every other call site propagates that; dropping it here reported `backlog: 0` on a
    // full disk while the same rows stayed on disk to be re-loaded, re-expired and re-counted every cycle —
    // inflating retiredToday without bound behind a gauge that read "caught up".
    const hadInputOverflow = inputOverflowPresence(stateDir) === 'present'
    const canonicalCleared = persistDeferred(stateDir, [], log) // any stale spillover was consumed by the filters above
    // If every staged overflow row expired/was already seen, clear that authority only after the canonical
    // empty v2 receipt lands, then rewrite the canonical file once more as a rollback-readable empty array.
    // A crash between those steps leaves v2 (old worker pauses), never a false empty legacy authority.
    const overflowCleared = canonicalCleared && (!hadInputOverflow || saveInputOverflow(stateDir, [], log))
    const cleared = overflowCleared && (!hadInputOverflow || persistDeferred(stateDir, [], log))
    const queueAfterClear = inspectDeferredBacklog(stateDir)
    const queueCleared = queueAfterClear.available && queueAfterClear.items.length === 0
    const rssHandoffCleared = cleared && phase === 'fetch' && cfg.rssEnabled
      ? acknowledgeRssDeliveries(stateDir)
      : true
    const summary: CycleSummary = {
      ...blank, completed_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      ok: true, fetched: raws.length, fresh: freshLive.length, new_arrivals: newArrivals, carryover: requeued.length,
      backlog: queueAfterClear.available ? queueAfterClear.items.length : carried.length, backlog_cap: DEFERRED_CAP,
      ...(cleared ? {} : { deferred_write_failed: true }),
      // A cycle whose whole queue was the expired backlog still has to REPORT the retirement — this is
      // precisely the cycle whose note would otherwise read "no new on-list items" over a missed scoring
      // target. The payload itself remains recoverable in SQLite.
      // Counted only once the clear actually succeeded: if the write failed the rows are still on disk and
      // will be re-loaded, re-expired and re-counted next cycle, so counting them now double-counts the
      // same loss into retiredToday every cycle until the disk recovers.
      ...(backlogExpired.length && retirementPersisted ? { backlog_expired: backlogExpired.length } : {}),
      note: !rssHandoffCleared
        ? 'RSS delivery journal needs attention — existing bytes preserved for replay'
        : backlogExpired.length && retirementPersisted
        ? `no new on-list items · ${backlogExpired.length} backlog item${backlogExpired.length === 1 ? '' : 's'} RETIRED unscored — waited longer than ${Math.round(DEFERRED_MAX_AGE_MS / 3_600_000)}h behind the queue`
        : 'no new on-list items',
      ...(sources ? { sources } : {}),
    }
    publishCycleSummary(summary)
    await runThemesStage({ cfg, repoRoot, stateDir, picks: [], fetchFn, now, log, signal: deps.signal })
    return summary
  }

  // Raw queue write-ahead boundary: every normalized source row lands before the first provider call. RSS
  // may now commit its conditional validators because an ETag/304 can no longer erase the only delivery;
  // other one-shot sources gain the same crash-safe backlog authority.
  //
  // When backlog + fresh exceeds the canonical work cap, never refuse the WHOLE cycle: the standalone
  // ingest:once topology has no one-minute drain tick, so an all-or-none guard deadlocks forever at the cap.
  // Existing durable backlog owns the admitted prefix; every excess source row first lands in a separate,
  // source-neutral overflow authority, then replays on later standalone or in-process cycles.
  const residentIds = new Set(backlogRows.map((item) => item.event_id))
  const orderedInput = [
    ...items.filter((item) => residentIds.has(item.event_id)),
    ...items.filter((item) => !residentIds.has(item.event_id)),
  ]
  const activeInput = orderedInput.slice(0, DEFERRED_CAP)
  const overflowInput = orderedInput.slice(DEFERRED_CAP)
  const existingOverflow = inputOverflowPresence(stateDir) === 'present'
  const inputJournalRows = stampDeferred(activeInput, ts).map((item) => ({ ...item, input_pending: true as const }))
  let inputJournalOk = false
  if (overflowInput.length || existingOverflow) {
    // First persist ALL rows at the pending pathname every old worker already inspects. Its v2 wrapper makes
    // a rollback worker pause. Keep that full barrier through the canonical-prefix and overflow-suffix
    // writes; removing it sooner creates a crash window where old code can accept legacy canonical bytes and
    // ignore the new overflow path. Current readers merge/dedupe the superset at every intermediate state.
    const allInputRows = stampDeferred(orderedInput, ts).map((item) => ({ ...item, input_pending: true as const }))
    inputJournalOk = saveInputBarrier(stateDir, allInputRows, log)
      && saveCanonicalInputWindow(stateDir, inputJournalRows, log)
      && saveInputOverflow(stateDir, stampDeferred(overflowInput, ts), log)
      && clearInputBarrier(stateDir, log)
  } else {
    inputJournalOk = persistDeferred(stateDir, inputJournalRows, log)
  }
  if (!inputJournalOk) {
    const durableAfterFailure = inspectDeferredBacklog(stateDir)
    const summary: CycleSummary = {
      ...blank,
      completed_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      fetched: raws.length,
      candidates: orderedInput.length,
      fresh: freshLive.length,
      new_arrivals: newArrivals,
      carryover: requeued.length,
      deferred: orderedInput.length,
      backlog: durableAfterFailure.available ? durableAfterFailure.items.length : backlogSnapshot.items.length,
      backlog_cap: DEFERRED_CAP,
      deferred_write_failed: true,
      defer_reason: 'storage-emergency',
      defer_reasons: ['storage-emergency'],
      note: 'STORAGE EMERGENCY — normalized source queue or its overflow could not be durably journaled; provider calls paused and source acknowledgements were retained',
      ...(sources ? { sources } : {}),
    }
    publishCycleSummary(summary)
    return summary
  }
  items = activeInput
  if (phase === 'fetch' && cfg.rssEnabled && !acknowledgeRssDeliveries(stateDir)) {
    log('rss: durable delivery acknowledgement refused — raw journal preserved for a later replay')
  }

  // 3. TRIAGE (batched, budget + adaptive token-per-minute pacing). The pacer is SHARED with the
  // on-demand enrichment read so the two never collectively blow the per-minute ceiling, and it LEARNS
  // the live ceiling from Groq's response headers (no 429 bursts; full sustainable throughput).
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, now().getTime())
  const limiter = getSharedLimiter(cfg.groqRpm, cfg.groqTpm)
  // Gemini OVERFLOW — a ROTATION POOL of free models. Each model is a SEPARATE per-project-per-model
  // free daily bucket (resets midnight Pacific), so the pool stacks the (tiny, ~20/day) per-model
  // trickles. When Groq is paced/capped, a batch goes to the first pool model with room instead of
  // deferring; a per-DAY 429 marks that model done for the day. Inactive (empty) when no key — the
  // Groq-only path is byte-for-byte unchanged.
  const geminiOn = cfg.geminiEnabled && !!cfg.geminiApiKey && cfg.geminiModels.length > 0
  // Each pool model also carries a per-cycle `failed` flag AND a cross-cycle cooldown (id `gemini:<model>`),
  // so a transient Gemini failure isn't re-picked every batch (it had no per-cycle flag before — the audit's
  // intra-cycle burn) NOR re-probed every cycle during an outage (draining the tiny ~20/day bucket).
  const geminiPool = geminiOn
    ? cfg.geminiModels.map((e) => ({
        model: e.model,
        budget: Budget.load(stateDir, e.dailyReqCap, cfg.geminiDailyTokenCap, now().getTime(), `gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`, cfg.geminiDayTz),
        failed: false,
        coolingDown: triageIsHeld(stateDir, `gemini:${e.model}`, now().getTime()),
        cooldownWasSet: readCooldownUntil(stateDir, `gemini:${e.model}`) || readCooldownUntil(stateDir, triageCooldownId(`gemini:${e.model}`)),
      }))
    : []
  const geminiLimiter = geminiOn ? getSharedGeminiLimiter(cfg.geminiRpm, cfg.geminiTpm) : null
  // OpenAI-compatible OVERFLOW registry (Cerebras, OpenRouter, NVIDIA, …) — each its own budget + per-minute
  // limiter, tried in config order after Groq. Adding a provider is a config entry; this loop needs no change.
  // A token-gated provider (Cerebras) sets dailyTokenCap + tpm so it paces on its BINDING limit (tokens); a
  // request-gated one omits them → a non-binding 50M token cap + tpm 0 (request-spacing only), as before.
  const overflow = cfg.overflowProviders.map((p) => ({
    p,
    budget: Budget.load(stateDir, p.dailyReqCap, p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, now().getTime(), p.budgetFile, p.dayTz),
    limiter: getNamedLimiter(p.id, p.rpm, p.tpm ?? 0),
    requests: 0,
    tokens: 0,
    failed: false, // set when a call errors this cycle → skip it so the batch flows to the next provider
    // cross-cycle cooldown (read once at cycle start, same as Groq's): skip a provider that a PRIOR cycle
    // marked unhealthy so a sustained outage can't re-probe it every cycle and drain its (small) daily cap.
    coolingDown: triageIsHeld(stateDir, p.id, now().getTime()),
    cooldownWasSet: readCooldownUntil(stateDir, p.id) || readCooldownUntil(stateDir, triageCooldownId(p.id)), // >0 → a marker existed at start; clear it if we recover
  }))
  // Route by descriptor semantics, never by an aggregate provider's id. Ordinary direct cloud providers
  // continue to share the fair reset-clock pool with Gemini. Aggregate routers sit strictly AFTER that whole
  // pool and must be configured with dedicated/keyless upstream allowances, never credentials used by these
  // direct routes. This ordering and the router's independent cap do not themselves prevent upstream double-
  // spend. A demoted local tier remains later still because it is unlimited but slow. The legacy id fallback
  // keeps hand-built/test local descriptors compatible; every canonical descriptor carries routeClass.
  const routeClass = (o: (typeof overflow)[number]) => o.p.routeClass ?? (o.p.id === 'local' ? 'local-fallback' : 'direct')
  const overflowDirect = overflow.filter((o) => routeClass(o) === 'direct')
  const overflowAggregate = overflow.filter((o) => routeClass(o) === 'aggregate-fallback')
  const overflowLocal = overflow.filter((o) => routeClass(o) === 'local-fallback')
  // LAST-RESORT tier (Claude Haiku). Default backend = the host's flat-fee SUBSCRIPTION via the local
  // `claude` CLI, which needs NO key — so it is ON by default; `api` mode instead needs a dedicated metered
  // key. Bounded by a daily $ LEDGER (restart-safe) rather than request counts, because that is the unit the
  // operator reasons in and the unit the CLI reports. Own per-minute limiter + cross-cycle cooldown, exactly
  // like the free providers — but it draws real (plan or metered) budget, so it is the LAST thing tried
  // before a batch defers. Ceiling reached ⇒ null-op ⇒ the defer path below is unchanged.
  const anthropicOn = cfg.anthropicFallbackEnabled && (cfg.anthropicFallbackMode === 'subscription' || !!cfg.anthropicApiKey)
  const anthropicBudget = anthropicOn
    ? UsdBudget.load(stateDir, cfg.anthropicDailyUsd, now().getTime(), 'anthropic-triage-budget.json')
    : null
  const anthropicLimiter = anthropicOn ? getNamedLimiter('anthropic-triage', cfg.anthropicRpm, 0) : null
  const anthropicSharedCooldown = anthropicOn ? cooldownInfo(stateDir, 'anthropic-triage') : { until: 0, fails: 0 }
  const anthropicWorkloadCooldown = anthropicOn ? cooldownInfo(stateDir, triageCooldownId('anthropic-triage')) : { until: 0, fails: 0 }
  const anthropicCooldownWasSet = anthropicSharedCooldown.until || anthropicWorkloadCooldown.until
  const anthropicCoolingDown = anthropicOn && triageIsHeld(stateDir, 'anthropic-triage', now().getTime())
  // WHY the tier is cooling, carried on the marker itself. The failure note only exists in the cycle that
  // actually failed, so a later cycle — the one the operator is usually looking at — could otherwise only
  // say "backing off after an error". With this, an expired sign-in keeps naming itself (and its fix) on
  // every subsequent cycle until it clears.
  const anthropicCooldownReason = anthropicOn
    ? (anthropicSharedCooldown.until >= anthropicWorkloadCooldown.until ? anthropicSharedCooldown : anthropicWorkloadCooldown).reason || ''
    : ''
  // LOCAL PRIMARY BRAIN. cfg.localProvider is non-null ONLY when local is enabled AND primary (the default once
  // enabled) — it is then tried FIRST for every batch below, ahead of Groq, with NO daily cap and no per-minute
  // spacing. Its budget file (local-budget.json) is still recorded so the cockpit can show live tokens/requests
  // processed today. When null (local off, or demoted to a fallback via NEWS_LOCAL_PRIMARY=0 → it rejoins the
  // overflow chain), this whole path is inert and the Groq-first chain is byte-for-byte unchanged.
  const localProvider = cfg.localProvider
  const localOn = !!localProvider
  const localLimiter = localOn ? getNamedLimiter('local', localProvider!.rpm, localProvider!.tpm ?? 0) : null
  const localBudget = localOn ? Budget.load(stateDir, localProvider!.dailyReqCap, localProvider!.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, now().getTime(), localProvider!.budgetFile, localProvider!.dayTz) : null
  const localCoolingDown = localOn && triageIsHeld(stateDir, 'local', now().getTime())
  const localCooldownWasSet = localOn ? readCooldownUntil(stateDir, 'local') || readCooldownUntil(stateDir, triageCooldownId('local')) : 0
  let localRequests = 0
  let localTokens = 0
  let localDownThisCycle = false // once the local box fails this cycle, stop poking it and use the cloud fallback
  const triageIdentityFields = (providerId: string, providerLabel: string, keyEnvVar?: string) => ({
    providerId, providerLabel, ...(keyEnvVar ? { keyEnvVar } : {}), stateDir,
    workload: 'triage', contractVersion: 'news-triage-json-v1',
  })
  const triageOptionsForProvider = (providerId: string): TriageOptions | null => {
    if (providerId === 'groq') return {
      model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey,
      maxTokens: cfg.triageMaxTokens, requestRemainingHeaderIsDaily: true,
      ...triageIdentityFields('groq', 'Groq', 'GROQ_API_KEY'),
    }
    if (providerId === 'local' && localProvider) return {
      model: localProvider.model, models: localProvider.models, baseUrl: localProvider.baseUrl,
      apiKey: localProvider.apiKey, maxTokens: localProvider.maxTokens, headers: localProvider.headers,
      extraBody: localProvider.extraBody, timeoutMs: localProvider.timeoutMs,
      ...triageIdentityFields('local', localProvider.label || 'Local', localProvider.keyEnvVar),
    }
    const entry = overflow.find((candidate) => candidate.p.id === providerId)?.p
    if (!entry) return null
    return {
      model: entry.model, models: entry.models, baseUrl: entry.baseUrl, apiKey: entry.apiKey,
      maxTokens: entry.maxTokens, headers: entry.headers, extraBody: entry.extraBody,
      timeoutMs: entry.timeoutMs, requestRemainingHeaderIsDaily: entry.requestRemainingHeaderIsDaily,
      ...triageIdentityFields(entry.id, entry.label, entry.keyEnvVar),
    }
  }
  const providerIsQuarantined = (providerId: string): boolean => {
    const options = triageOptionsForProvider(providerId)
    return !!(options && readProviderQuarantine(stateDir, openAiRequestIdentity(options, 'triage', 'news-triage-json-v1')))
  }
  const pendingTriaged = items.filter(isFeedPendingTriaged).map((item) => ({
    ...item,
    feed_triaged_at: item.feed_triaged_at || item.pending_feed_item?.ts || ts,
  }))
  const unscoredItems = items.filter((item) => !isFeedPendingTriaged(item))
  const feedCapacity = inspectFeedCapacity(repoRoot, date, cfg.feedItemsDailyCap, cfg.feedItemsDailyMaxBytes)
  const acknowledgedEventIds = new Set<string>(feedCapacity.status === 'available' ? feedCapacity.eventIds : [])
  let historicalFeedReadFailed = false
  const historicalDates = new Set(pendingTriaged
    .flatMap((item) => [
      (item.pending_feed_item?.ts || item.feed_triaged_at || '').slice(0, 10),
      item.feed_target_date || '',
    ])
    .filter((pendingDate) => /^\d{4}-\d{2}-\d{2}$/.test(pendingDate) && pendingDate !== date))
  for (const pendingDate of historicalDates) {
    const historical = inspectHistoricalFeedIdentities(repoRoot, pendingDate, cfg.newsArchiveDir)
    if (historical.status === 'io_failure'
      || (historical.status === 'missing'
        && !recentMissingFeedTargetIsRetryable(pendingDate, date, cfg.newsLocalRetentionDays))) {
      historicalFeedReadFailed = true
      continue
    }
    // A recent missing target is the legitimate crash-before-first-append state described by
    // recentMissingFeedTargetIsRetryable. It contains no identities and can safely retry today.
    if (historical.status === 'missing') continue
    for (const eventId of historical.eventIds) acknowledgedEventIds.add(eventId)
  }
  const pendingNeedingRows = feedCapacity.status === 'available'
    ? pendingTriaged.filter((item) => !acknowledgedEventIds.has(item.event_id)).length
    : pendingTriaged.length
  // Never spend a provider call without one shard's guaranteed durable room. A full/near-full shard is
  // represented as the next empty shard, so capacity protection no longer pauses scoring until UTC midnight.
  const byteGuaranteedSlots = feedCapacity.status === 'available'
    ? Math.floor(feedCapacity.remainingBytes / MAX_FEED_ITEM_BYTES)
    : 0
  const scoringSlots = hasScoringProvider && !historicalFeedReadFailed && pendingNeedingRows === 0
    && feedCapacity.status === 'available' && byteGuaranteedSlots > 0
    // A catastrophic append failure can turn every scored row into feed-pending. Never score more rows than
    // the durable backlog can retain, so its priority slice can preserve the ENTIRE unwritten scored set.
    ? Math.min(
        scoringJournalSlots(pendingTriaged.length),
        Math.max(0, feedCapacity.remainingItems - pendingNeedingRows),
        byteGuaranteedSlots,
      )
    : 0
  const scoreItems = unscoredItems.slice(0, scoringSlots)
  const capacityDeferred = unscoredItems.slice(scoringSlots)
  const feedPreflightFailed = feedCapacity.status === 'io_failure' || historicalFeedReadFailed
  const triaged: TriagedItem[] = pendingTriaged
  const deferred: NewsItem[] = [...capacityDeferred] // unscored this cycle (provider/feed capacity) — re-queued next cycle
  let groqRequests = 0
  let groqTokens = 0
  let geminiRequests = 0
  let geminiTokens = 0
  let anthropicRequests = 0
  let anthropicTokens = 0
  let anthropicCostUsd = 0
  const providerAttempts: Record<string, number> = {}
  const providerScoredBatches: Record<string, number> = {}
  let anthropicDownThisCycle = false // once the paid tier fails this cycle, stop poking it (save the cap)
  let anthropicBudgetBlocked = false // remaining dollars cannot fit one conservative provider call
  let anthropicFailNote = '' // the Haiku tier's failure note this cycle → distinguishes plan-quota from a transient error
  let usageLedgerUnavailable = false // durable authority damage is not a spent allowance/provider quota
  let budgetHit = false
  let providerDayLimitHit = false
  let paceHit = false
  let providerRetryHeld = false
  let scoredCheckpointWriteFailed = false
  let batchFailed = false
  let aborted = false // the wall-clock guard killed this cycle mid-way and dumped the remainder to the backlog
  // Once Groq fails this cycle (org 429 / network), STOP poking it for the rest of the cycle and go
  // straight to overflow — otherwise a sustained Groq outage burns the whole daily request cap on
  // failed calls (each 429 still counts as a request), locking Groq out even after the outage clears.
  let groqDownThisCycle = false
  // CROSS-CYCLE cooldown: `groqDownThisCycle` only lives for one cycle, but the scheduler runs many
  // cycles/day — so a sustained outage would still burn one failed probe PER cycle across thousands of
  // cycles, which is exactly what emptied the request cap on 2026-07-11 (13,000 req / ~14,100 tok). A
  // prior cycle that failed persists an "unhealthy until T" marker; while it's live we skip Groq entirely
  // this cycle (straight to overflow / defer) and don't touch the marker (it decays by time). We read it
  // once here: `groqCooldownUntil` is the persisted value (0 = none) — kept so that when the window has
  // lapsed (marker present but NOT in the future) we probe once and clear the stale marker if it recovers.
  const groqCooldownUntil = Math.max(readCooldownUntil(stateDir, 'groq'), readCooldownUntil(stateDir, triageCooldownId('groq')))
  const groqCoolingDown = groqCooldownUntil > now().getTime()
  const pace = { targetTokens: cfg.groqDailyTokenTarget, floorFrac: cfg.groqPaceFloorFrac }
  const configuredFreeLedgerUnavailable = (): boolean =>
    (!!cfg.groqApiKey && (!budget.ledgerAvailable || budget.lastReserveFailure === 'authority_unavailable'))
    || (!!localBudget && (!localBudget.ledgerAvailable || localBudget.lastReserveFailure === 'authority_unavailable'))
    || overflow.some((ov) => !ov.budget.ledgerAvailable || ov.budget.lastReserveFailure === 'authority_unavailable')
    || geminiPool.some((gem) => !gem.budget.ledgerAvailable || gem.budget.lastReserveFailure === 'authority_unavailable')
  const anthropicLedgerUnavailable = (): boolean => anthropicOn
    && (anthropicBudget?.ledgerAvailable !== true || anthropicBudget.lastReserveFailure === 'authority_unavailable')
  const credentialRejectedFor = (providerId: string): boolean => {
    // The canonical OpenAI path is fingerprinted. Never let its obsolete, un-fingerprinted access streak
    // veto a repaired configuration before the new classifier can test it once.
    if (triageOptionsForProvider(providerId)) return providerIsQuarantined(providerId)
    const shared = cooldownInfo(stateDir, providerId)
    const workload = cooldownInfo(stateDir, triageCooldownId(providerId))
    return credentialRejected(shared.reason, shared.accessFails ?? 0) || credentialRejected(workload.reason, workload.accessFails ?? 0)
  }

  const auditBatch = scoreItems.slice(0, cfg.triageBatch)
  const auditAllowanceFor = (providerId: string): { allowanceUsed?: number; allowanceReleased?: number; allowanceCap?: number } => {
    const at = now().getTime()
    if (providerId === 'local') return {}
    if (providerId === 'groq') {
      const options: TriageOptions = { model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey, maxTokens: cfg.triageMaxTokens, requestRemainingHeaderIsDaily: true, ...triageIdentityFields('groq', 'Groq', 'GROQ_API_KEY') }
      const admission = dailyQuotaAdmission({ id: providerId, meter: 'tokens', used: budget.tokens, cap: cfg.groqDailyTokenTarget, cost: triageGroqTokenBound(auditBatch, options), paceCost: triagePaceTokenBound(auditBatch), floorFraction: cfg.groqPaceFloorFrac }, at)
      return { allowanceUsed: budget.tokens, allowanceReleased: admission.released, allowanceCap: cfg.groqDailyTokenTarget }
    }
    const overflowEntry = overflow.find((entry) => entry.p.id === providerId)
    if (overflowEntry) {
      const options: TriageOptions = { model: overflowEntry.p.model, models: overflowEntry.p.models, baseUrl: overflowEntry.p.baseUrl, apiKey: overflowEntry.p.apiKey, maxTokens: overflowEntry.p.maxTokens, headers: overflowEntry.p.headers, extraBody: overflowEntry.p.extraBody, timeoutMs: overflowEntry.p.timeoutMs, maxAttempts: 1, requestRemainingHeaderIsDaily: overflowEntry.p.requestRemainingHeaderIsDaily, ...triageIdentityFields(overflowEntry.p.id, overflowEntry.p.label, overflowEntry.p.keyEnvVar) }
      const tokenMeter = overflowEntry.p.dailyTokenCap != null
      const used = tokenMeter ? overflowEntry.budget.tokens : overflowEntry.budget.requests
      const cap = tokenMeter ? overflowEntry.p.dailyTokenCap! : overflowEntry.p.dailyReqCap
      const admission = dailyQuotaAdmission({ id: providerId, meter: tokenMeter ? 'tokens' : 'requests', used, cap, cost: tokenMeter ? triageGroqTokenBound(auditBatch, options) : 1, paceCost: tokenMeter ? triagePaceTokenBound(auditBatch) : 1, resetTimeZone: overflowEntry.p.dayTz, floorFraction: overflowEntry.p.paceFloorFrac ?? cfg.freeProviderPaceFloorFrac }, at)
      return { allowanceUsed: used, allowanceReleased: admission.released, allowanceCap: cap }
    }
    if (providerId.startsWith('gemini:')) {
      const model = providerId.slice('gemini:'.length)
      const entry = geminiPool.find((candidate) => candidate.model === model)
      const modelConfig = cfg.geminiModels.find((candidate) => candidate.model === model)
      if (entry && modelConfig) {
        const cap = modelConfig.dailyReqCap
        const admission = dailyQuotaAdmission({ id: providerId, meter: 'requests', used: entry.budget.requests, cap, cost: 1, resetTimeZone: cfg.geminiDayTz, floorFraction: cfg.freeProviderPaceFloorFrac }, at)
        return { allowanceUsed: entry.budget.requests, allowanceReleased: admission.released, allowanceCap: cap }
      }
    }
    if (providerId === 'anthropic-triage' && anthropicBudget) {
      const callBound = cfg.anthropicFallbackMode === 'subscription'
        ? Math.max(0, cfg.anthropicPerCallUsd)
        : conservativeChatUsdBound(SYSTEM, buildUserMessage(auditBatch), cfg.anthropicMaxTokens, cfg.anthropicInPricePerMTok, cfg.anthropicOutPricePerMTok)
      const admission = dailyQuotaAdmission({ id: providerId, meter: 'requests', used: anthropicBudget.usd, cap: cfg.anthropicDailyUsd, cost: callBound, paceCost: callBound, floorFraction: cfg.freeProviderPaceFloorFrac }, at)
      return { allowanceUsed: anthropicBudget.usd, allowanceReleased: admission.released, allowanceCap: cfg.anthropicDailyUsd }
    }
    return {}
  }

  // The audit ledger starts with the state from which every batch decision is made. It contains only
  // bounded enums and counters: provider response/error text and the batch contents never enter it.
  const startProviderSnapshots: ProviderStateSnapshotEvent['providers'] = [
    ...(localProvider ? [{ id: 'local', state: providerIsQuarantined('local') ? 'unavailable' as const : localCoolingDown ? 'cooling' as const : 'healthy' as const, eligible: !localCoolingDown && !credentialRejectedFor('local'), reason: providerIsQuarantined('local') ? 'quarantined' as const : credentialRejectedFor('local') ? 'credential-rejected' as const : localCoolingDown ? 'cooldown' as const : 'eligible' as const, consecutiveFailures: cooldownInfo(stateDir, 'local').fails, ...auditAllowanceFor('local') }] : []),
    ...(cfg.groqApiKey ? [{ id: 'groq', state: !budget.ledgerAvailable || providerIsQuarantined('groq') ? 'unavailable' as const : groqCoolingDown ? 'cooling' as const : budget.providerDayExhausted ? 'budget-spent' as const : 'healthy' as const, eligible: budget.ledgerAvailable && !groqCoolingDown && !budget.providerDayExhausted && !credentialRejectedFor('groq'), reason: !budget.ledgerAvailable ? 'ledger-unavailable' as const : providerIsQuarantined('groq') ? 'quarantined' as const : credentialRejectedFor('groq') ? 'credential-rejected' as const : groqCoolingDown ? 'cooldown' as const : budget.providerDayExhausted ? 'provider-day-exhausted' as const : 'eligible' as const, consecutiveFailures: cooldownInfo(stateDir, 'groq').fails, ...auditAllowanceFor('groq') }] : []),
    ...overflow.map((ov) => ({ id: ov.p.id, state: !ov.budget.ledgerAvailable || providerIsQuarantined(ov.p.id) ? 'unavailable' as const : ov.coolingDown ? 'cooling' as const : ov.budget.providerDayExhausted ? 'budget-spent' as const : 'healthy' as const, eligible: ov.budget.ledgerAvailable && !ov.coolingDown && !ov.budget.providerDayExhausted && !credentialRejectedFor(ov.p.id), reason: !ov.budget.ledgerAvailable ? 'ledger-unavailable' as const : providerIsQuarantined(ov.p.id) ? 'quarantined' as const : credentialRejectedFor(ov.p.id) ? 'credential-rejected' as const : ov.coolingDown ? 'cooldown' as const : ov.budget.providerDayExhausted ? 'provider-day-exhausted' as const : routeClass(ov) === 'aggregate-fallback' ? 'aggregate-band' as const : routeClass(ov) === 'local-fallback' ? 'demoted-local-band' as const : 'eligible' as const, consecutiveFailures: cooldownInfo(stateDir, ov.p.id).fails, ...auditAllowanceFor(ov.p.id) })),
    ...geminiPool.map((gem) => ({ id: `gemini:${gem.model}`, state: !gem.budget.ledgerAvailable ? 'unavailable' as const : gem.coolingDown ? 'cooling' as const : gem.budget.providerDayExhausted ? 'budget-spent' as const : 'healthy' as const, eligible: gem.budget.ledgerAvailable && !gem.coolingDown && !gem.budget.providerDayExhausted && !credentialRejectedFor(`gemini:${gem.model}`), reason: !gem.budget.ledgerAvailable ? 'ledger-unavailable' as const : credentialRejectedFor(`gemini:${gem.model}`) ? 'credential-rejected' as const : gem.coolingDown ? 'cooldown' as const : gem.budget.providerDayExhausted ? 'provider-day-exhausted' as const : 'eligible' as const, consecutiveFailures: cooldownInfo(stateDir, `gemini:${gem.model}`).fails, ...auditAllowanceFor(`gemini:${gem.model}`) })),
    ...(anthropicOn ? [{ id: 'anthropic-triage', state: !anthropicBudget?.ledgerAvailable ? 'unavailable' as const : anthropicCoolingDown ? 'cooling' as const : 'healthy' as const, eligible: anthropicBudget?.ledgerAvailable === true && !anthropicCoolingDown && !credentialRejectedFor('anthropic-triage'), reason: !anthropicBudget?.ledgerAvailable ? 'ledger-unavailable' as const : credentialRejectedFor('anthropic-triage') ? 'credential-rejected' as const : anthropicCoolingDown ? 'cooldown' as const : 'eligible' as const, consecutiveFailures: cooldownInfo(stateDir, 'anthropic-triage').fails, ...auditAllowanceFor('anthropic-triage') }] : []),
  ]
  let routingTelemetryWritable = recordProviderSnapshot(repoRoot, {
    kind: 'provider_snapshot',
    ts,
    cycleId: routingCycleId,
    phase: 'cycle-start',
    providers: startProviderSnapshots,
  })
  let latestRoutingEvaluation: ProviderRoutingEvaluation | null = null

  batchLoop: for (let i = 0; i < scoreItems.length; i += cfg.triageBatch) {
    // The wall-clock guard fired: stop starting new batches. The wrapped fetchFn already fails fast, but
    // without this the loop walks every remaining batch retrying each provider (burning daily LLM quota on
    // doomed calls and holding the cycle lock past the abort). Requeue the untriaged remainder to the
    // deferred backlog FIRST (same as the budget-exhausted path below) so the abort loses nothing, then stop.
    if (deps.signal?.aborted) {
      aborted = true
      deferred.push(...scoreItems.slice(i))
      log(`cycle aborted — deferring ${scoreItems.length - i} remaining item(s) to the next cycle`)
      break
    }
    const batch = scoreItems.slice(i, i + cfg.triageBatch)
    const est = estimateTokens(batch.length)
    const groqOptions: TriageOptions = { model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey, maxTokens: cfg.triageMaxTokens, requestRemainingHeaderIsDaily: true, ...triageIdentityFields('groq', 'Groq', 'GROQ_API_KEY') }
    const groqAttemptTokenBound = triageGroqTokenBound(batch, groqOptions)
    // PROVIDER PICK. Prefer Groq while it's on-schedule (the pacer keeps it spread across the day); when
    // Groq is paced/capped, overflow to Gemini's separate free pool; defer only when BOTH are out.
    // PROVIDER PICK, in order: Groq (primary, paced across the day) → OpenAI-compatible overflow registry
    // (OpenRouter, NVIDIA, …, best first) → Gemini pool → defer when all are out.
    // One attempt per provider per batch. A Retry-After can be minutes long; sleeping inside Groq's second
    // retry held the global cycle lock and prevented the same batch from reaching healthy overflow capacity.
    // The outer router persists the exact retry window and falls through immediately, so an in-call retry is
    // both slower and less sustainable than giving the next allowance its turn.
    let groqAttempts = Math.min(1, budget.remainingRequests, Math.floor(budget.remainingTokens / groqAttemptTokenBound))
    const groqAdmissionAt = now().getTime()
    const groqPaceBound = triagePaceTokenBound(batch)
    // Admission on the calibrated cost, hard cap + reservation on the conservative bound. Groq's bound is
    // ~11,800 tokens against a measured successful batch of ~1,554-4,000, so demanding the worst case as
    // admission headroom is what stranded a tier that still had allowance ("Saved for later today").
    while (groqAttempts > 0 && !budget.pacedCanSpend(groqAttemptTokenBound * groqAttempts, pace, groqAdmissionAt, groqAttempts, groqPaceBound * groqAttempts)) groqAttempts--
    const groqOk = !!cfg.groqApiKey && groqAttempts > 0
    const candidateAt = now().getTime()
    const candidateReason = (args: { enabled: boolean; ledger: boolean; exhausted: boolean; held: boolean; quarantined?: boolean; rejected?: boolean; hard: boolean; paced: boolean }): ProviderRoutingCandidate['eligibilityReason'] => {
      if (!args.enabled) return 'disabled'
      if (!args.ledger) return 'ledger-unavailable'
      if (args.quarantined) return 'quarantined'
      if (args.rejected) return 'credential-rejected'
      if (args.exhausted) return 'provider-day-exhausted'
      if (args.held) return 'cooldown'
      if (!args.hard) return 'hard-cap'
      if (!args.paced) return 'paced'
      return 'eligible'
    }
    const routingCandidates: ProviderRoutingCandidate[] = []
    if (localProvider) {
      const held = localDownThisCycle || triageIsHeld(stateDir, 'local', candidateAt)
      const reason = candidateReason({ enabled: true, ledger: localBudget?.ledgerAvailable === true, exhausted: false, held, quarantined: providerIsQuarantined('local'), rejected: credentialRejectedFor('local'), hard: true, paced: true })
      routingCandidates.push({ id: 'local', label: localProvider.label, order: 0, band: 'direct', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: 1, consecutiveFailures: cooldownInfo(stateDir, 'local').fails })
    }
    if (cfg.groqApiKey) {
      const held = groqDownThisCycle || triageIsHeld(stateDir, 'groq', candidateAt)
      const reason = candidateReason({ enabled: true, ledger: budget.ledgerAvailable, exhausted: budget.providerDayExhausted, held, quarantined: providerIsQuarantined('groq'), rejected: credentialRejectedFor('groq'), hard: budget.canSpend(groqAttemptTokenBound, 1), paced: groqOk })
      const admission = dailyQuotaAdmission({ id: 'groq', meter: 'tokens', used: budget.tokens, cap: cfg.groqDailyTokenTarget, cost: groqAttemptTokenBound, paceCost: groqPaceBound, floorFraction: cfg.groqPaceFloorFrac }, candidateAt)
      routingCandidates.push({ id: 'groq', label: 'Groq', order: 1, band: 'direct', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: admission.normalizedDeficit, consecutiveFailures: cooldownInfo(stateDir, 'groq').fails })
    }
    let configuredOrder = 2
    for (const ov of overflowDirect) {
      const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: 1, requestRemainingHeaderIsDaily: ov.p.requestRemainingHeaderIsDaily, ...triageIdentityFields(ov.p.id, ov.p.label, ov.p.keyEnvVar) }
      const perAttemptTokens = triageGroqTokenBound(batch, options)
      const tokenMeter = ov.p.dailyTokenCap != null
      const admission = dailyQuotaAdmission({ id: ov.p.id, meter: tokenMeter ? 'tokens' : 'requests', used: tokenMeter ? ov.budget.tokens : ov.budget.requests, cap: tokenMeter ? ov.p.dailyTokenCap! : ov.p.dailyReqCap, cost: tokenMeter ? perAttemptTokens : 1, paceCost: tokenMeter ? triagePaceTokenBound(batch) : 1, resetTimeZone: ov.p.dayTz, floorFraction: ov.p.paceFloorFrac ?? cfg.freeProviderPaceFloorFrac }, candidateAt)
      const held = ov.failed || triageIsHeld(stateDir, ov.p.id, candidateAt)
      const reason = candidateReason({ enabled: true, ledger: ov.budget.ledgerAvailable, exhausted: ov.budget.providerDayExhausted, held, quarantined: providerIsQuarantined(ov.p.id), rejected: credentialRejectedFor(ov.p.id), hard: admission.hardCapFit && ov.budget.canSpend(perAttemptTokens, 1), paced: admission.pacedFit })
      routingCandidates.push({ id: ov.p.id, label: ov.p.label, order: configuredOrder++, band: 'direct', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: admission.normalizedDeficit, consecutiveFailures: cooldownInfo(stateDir, ov.p.id).fails })
    }
    for (const gem of geminiPool) {
      const modelConfig = cfg.geminiModels.find((candidate) => candidate.model === gem.model)
      const cap = modelConfig?.dailyReqCap ?? 0
      const options: TriageOptions = { model: gem.model, baseUrl: cfg.geminiBaseUrl, apiKey: cfg.geminiApiKey, maxTokens: cfg.geminiMaxTokens, maxAttempts: 1 }
      const perAttemptTokens = triageGroqTokenBound(batch, options)
      const admission = dailyQuotaAdmission({ id: `gemini:${gem.model}`, meter: 'requests', used: gem.budget.requests, cap, cost: 1, resetTimeZone: cfg.geminiDayTz, floorFraction: cfg.freeProviderPaceFloorFrac }, candidateAt)
      const held = gem.failed || triageIsHeld(stateDir, `gemini:${gem.model}`, candidateAt)
      const reason = candidateReason({ enabled: geminiOn && !!modelConfig, ledger: gem.budget.ledgerAvailable, exhausted: gem.budget.providerDayExhausted, held, rejected: credentialRejectedFor(`gemini:${gem.model}`), hard: admission.hardCapFit && gem.budget.canSpend(perAttemptTokens, 1), paced: admission.pacedFit })
      routingCandidates.push({ id: `gemini:${gem.model}`, label: gem.model, order: configuredOrder++, band: 'direct', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: admission.normalizedDeficit, consecutiveFailures: cooldownInfo(stateDir, `gemini:${gem.model}`).fails })
    }
    for (const ov of overflowAggregate) {
      const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: 1, requestRemainingHeaderIsDaily: ov.p.requestRemainingHeaderIsDaily, ...triageIdentityFields(ov.p.id, ov.p.label, ov.p.keyEnvVar) }
      const perAttemptTokens = triageGroqTokenBound(batch, options)
      const tokenMeter = ov.p.dailyTokenCap != null
      const admission = dailyQuotaAdmission({ id: ov.p.id, meter: tokenMeter ? 'tokens' : 'requests', used: tokenMeter ? ov.budget.tokens : ov.budget.requests, cap: tokenMeter ? ov.p.dailyTokenCap! : ov.p.dailyReqCap, cost: tokenMeter ? perAttemptTokens : 1, paceCost: tokenMeter ? triagePaceTokenBound(batch) : 1, resetTimeZone: ov.p.dayTz, floorFraction: ov.p.paceFloorFrac ?? cfg.freeProviderPaceFloorFrac }, candidateAt)
      const held = ov.failed || triageIsHeld(stateDir, ov.p.id, candidateAt)
      const reason = candidateReason({ enabled: true, ledger: ov.budget.ledgerAvailable, exhausted: ov.budget.providerDayExhausted, held, quarantined: providerIsQuarantined(ov.p.id), rejected: credentialRejectedFor(ov.p.id), hard: admission.hardCapFit && ov.budget.canSpend(perAttemptTokens, 1), paced: admission.pacedFit })
      routingCandidates.push({ id: ov.p.id, label: ov.p.label, order: configuredOrder++, band: 'aggregate', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: admission.normalizedDeficit, consecutiveFailures: cooldownInfo(stateDir, ov.p.id).fails })
    }
    for (const ov of overflowLocal) {
      const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: 1, ...triageIdentityFields(ov.p.id, ov.p.label, ov.p.keyEnvVar) }
      const perAttemptTokens = triageGroqTokenBound(batch, options)
      const held = ov.failed || triageIsHeld(stateDir, ov.p.id, candidateAt)
      const reason = candidateReason({ enabled: true, ledger: ov.budget.ledgerAvailable, exhausted: ov.budget.providerDayExhausted, held, quarantined: providerIsQuarantined(ov.p.id), rejected: credentialRejectedFor(ov.p.id), hard: ov.budget.canSpend(perAttemptTokens, 1), paced: true })
      routingCandidates.push({ id: ov.p.id, label: ov.p.label, order: configuredOrder++, band: 'demoted-local', eligible: reason === 'eligible', eligibilityReason: reason, releasedCapacityUrgency: 1, consecutiveFailures: cooldownInfo(stateDir, ov.p.id).fails })
    }
    const batchMaxPriority = batch.reduce((maximum, item) => Math.max(maximum, preTriagePriority(item, now())), -Infinity)
    const haikuCallBoundUsd = cfg.anthropicFallbackMode === 'subscription'
      ? Math.max(0, cfg.anthropicPerCallUsd)
      : conservativeChatUsdBound(SYSTEM, buildUserMessage(batch), cfg.anthropicMaxTokens, cfg.anthropicInPricePerMTok, cfg.anthropicOutPricePerMTok)
    const haikuAdmission = dailyQuotaAdmission({ id: 'anthropic-triage', meter: 'requests', used: anthropicBudget?.usd || 0, cap: cfg.anthropicDailyUsd, cost: haikuCallBoundUsd, paceCost: haikuCallBoundUsd, floorFraction: cfg.freeProviderPaceFloorFrac }, candidateAt)
    const haikuHardFit = !!anthropicBudget?.canSpend(haikuCallBoundUsd)
    // Do not strand the last already-released call envelope at the dollar ceiling. This preserves the
    // established one-call fallback while the normal path still spreads Haiku spend across the UTC day.
    const haikuFinalEnvelope = (anthropicBudget?.usd || 0) > 0
      && Math.max(0, cfg.anthropicDailyUsd - (anthropicBudget?.usd || 0)) <= haikuCallBoundUsd + 1e-9
    const haikuPacedFit = haikuAdmission.pacedFit || (haikuHardFit && haikuFinalEnvelope)
    const oldestDeferredAt = backlogSnapshot.items.reduce((oldest, item) => {
      const value = item.deferred_at ? Date.parse(item.deferred_at) : NaN
      return Number.isFinite(value) ? Math.min(oldest, value) : oldest
    }, Infinity)
    const queuePressure = backlogSnapshot.items.length >= DEFERRED_CAP * 0.1
      || (Number.isFinite(oldestDeferredAt) && candidateAt - oldestDeferredAt >= 6 * 3_600_000)
      || (preCycleFlow.comparison.measured && (preCycleFlow.comparison.status === 'behind' || preCycleFlow.comparison.status === 'equal'))
    const haikuHeld = anthropicDownThisCycle || triageIsHeld(stateDir, 'anthropic-triage', candidateAt)
    const haikuBaseReason = candidateReason({ enabled: anthropicOn, ledger: anthropicBudget?.ledgerAvailable === true, exhausted: false, held: haikuHeld, rejected: credentialRejectedFor('anthropic-triage'), hard: haikuHardFit, paced: haikuPacedFit })
    routingCandidates.push({ id: 'anthropic-triage', label: 'Claude Haiku', order: configuredOrder++, band: 'direct', eligible: queuePressure && batchMaxPriority >= cfg.anthropicMinPriority && haikuBaseReason === 'eligible', eligibilityReason: batchMaxPriority < cfg.anthropicMinPriority ? 'minimum-priority' : !queuePressure ? 'haiku-pressure' : haikuBaseReason, releasedCapacityUrgency: haikuAdmission.normalizedDeficit, consecutiveFailures: cooldownInfo(stateDir, 'anthropic-triage').fails, isHaiku: true })

    let routingEvaluation = evaluateProviderRouting(routingOptions(), routingCandidates)
    const freeScores = routingEvaluation.candidates.filter((candidate) => candidate.id !== 'anthropic-triage' && candidate.eligible && (candidate.band || 'direct') === 'direct')
    const everyFreeProviderWeak = freeScores.every((candidate) => candidate.components.usableBatchYield < 0.6)
    if (!queuePressure && everyFreeProviderWeak) {
      const haiku = routingCandidates.find((candidate) => candidate.id === 'anthropic-triage')
      if (haiku && batchMaxPriority >= cfg.anthropicMinPriority && haikuBaseReason === 'eligible') {
        haiku.eligible = true
        haiku.eligibilityReason = 'eligible'
        routingEvaluation = evaluateProviderRouting(routingOptions(), routingCandidates)
      }
    }
    latestRoutingEvaluation = routingEvaluation
    if (routingTelemetryWritable && !recordRouterModeIfChanged(routingOptions(), routingCycleId, routingEvaluation.router)) routingTelemetryWritable = false
    let adaptiveTarget = routingTelemetryWritable && routingEvaluation.router.mode === 'adaptive' ? routingEvaluation.selectedProviderId : null
    let adaptiveTargetFailed = false
    let auditAttemptIndex = 0
    let activeAudit: { providerId: string; decisionId: string; startedAt: number } | null = null
    const prepareAudit = (providerId: string): boolean => {
      if (activeAudit?.providerId === providerId) return true
      if (!routingTelemetryWritable) return true
      const decisionId = deterministicDecisionId(routingCycleId, Math.floor(i / cfg.triageBatch), auditAttemptIndex++)
      const bandWeight = (candidate: ProviderCandidateScore) => candidate.band === 'aggregate' ? 1 : candidate.band === 'demoted-local' ? 2 : 0
      const actualOrder = [...routingEvaluation.candidates].filter((candidate) => candidate.eligible).sort((left, right) => {
        const band = bandWeight(left) - bandWeight(right)
        if (band) return band
        return routingEvaluation.router.mode === 'adaptive'
          ? (left.rank ?? Infinity) - (right.rank ?? Infinity) || left.order - right.order
          : left.order - right.order
      })
      const actualRanks = new Map(actualOrder.map((candidate, index) => [candidate.id, index + 1]))
      const auditOk = recordProviderDecision(routingOptions(), {
        kind: 'provider_decision', ts: now().toISOString(), cycleId: routingCycleId, decisionId,
        mode: routingEvaluation.router.mode, actualProviderId: providerId,
        shadowProviderId: routingEvaluation.shadowProviderId, exploration: routingEvaluation.exploration,
        candidates: routingEvaluation.candidates.map((candidate) => ({ id: candidate.id, eligible: candidate.eligible, reason: candidate.eligibilityReason, score: candidate.score, rank: candidate.rank, actualRank: actualRanks.get(candidate.id) ?? null, shadowRank: candidate.rank, sampleSize: candidate.sampleSize, components: candidate.components })),
      })
      if (!auditOk) {
        routingTelemetryWritable = false
        adaptiveTarget = null
        activeAudit = null
        return false
      }
      activeAudit = { providerId, decisionId, startedAt: now().getTime() }
      return true
    }
    const completeAudit = (providerId: string, result: TriageResult, costUsd = 0): void => {
      if (activeAudit?.providerId !== providerId || !routingTelemetryWritable) return
      const auditOk = recordProviderOutcome(routingOptions(), {
        kind: 'provider_outcome', ts: now().toISOString(), cycleId: routingCycleId,
        decisionId: activeAudit.decisionId, providerId, outcome: result.ok ? 'success' : 'failure',
        failureClass: result.ok ? null : routingFailureClass(result), batchSize: batch.length,
        scoredItems: result.ok ? batch.length : 0, networkCalls: result.requests, tokens: result.tokens,
        costUsd, elapsedMs: result.elapsedMs ?? Math.max(0, now().getTime() - activeAudit.startedAt),
      })
      if (!auditOk) routingTelemetryWritable = false
      if (!result.ok && providerId === adaptiveTarget) adaptiveTargetFailed = true
      activeAudit = null
    }
    const closeUnattemptedAudit = (): void => {
      if (!activeAudit || !routingTelemetryWritable) return
      const audit = activeAudit
      const auditOk = recordProviderOutcome(routingOptions(), {
        kind: 'provider_outcome', ts: now().toISOString(), cycleId: routingCycleId,
        decisionId: audit.decisionId, providerId: audit.providerId, outcome: 'failure',
        failureClass: 'budget', batchSize: batch.length, scoredItems: 0, networkCalls: 0,
        tokens: 0, costUsd: 0, elapsedMs: Math.max(0, now().getTime() - audit.startedAt),
      })
      if (!auditOk) routingTelemetryWritable = false
      if (audit.providerId === adaptiveTarget) adaptiveTargetFailed = true
      activeAudit = null
    }
    if (adaptiveTarget && !prepareAudit(adaptiveTarget)) adaptiveTarget = null
    try {
    // RESILIENT PROVIDER CHAIN: try Groq (primary) → overflow registry → Gemini pool, falling to the
    // NEXT provider whenever the current one is unavailable OR was tried and FAILED. The old code only
    // reached overflow when Groq was capped — so a Groq outage (org 429 / network blip) just deferred
    // every batch AND burned the daily request cap on failures. Now a single provider being down can
    // never stall triage: the batch flows to whoever is up. `res` stays undefined only when NOTHING
    // was even attempted (all daily budgets out) → that's the genuine "defer the rest" case.
    let res: TriageResult | undefined
    const stopAbortedBatch = (): boolean => {
      if (!deps.signal?.aborted || res?.ok) return false
      aborted = true
      deferred.push(...scoreItems.slice(i))
      log(`cycle aborted during scoring — deferring ${scoreItems.length - i} unscored item(s) to the next cycle`)
      return true
    }
    // LOCAL PRIMARY BRAIN, tried FIRST: unlimited, $0, no cap. When the local box is up it scores the WHOLE
    // scan and the Groq → overflow → Gemini → Haiku chain below never fires — no ceiling, no daily-cap loss.
    // When it is down this cycle (box asleep / unreachable / error), we arm a SHORT cooldown and fall straight
    // through to that chain, exactly as before. Inert when local is off or demoted (localProvider is null),
    // so the Groq-first path is unchanged: `res` stays undefined and the gate below runs Groq first.
    if (localProvider && localBudget?.ledgerAvailable === true && (!adaptiveTarget || adaptiveTarget === 'local' || adaptiveTargetFailed) && !localDownThisCycle && !credentialRejectedFor('local') && !triageIsHeld(stateDir, 'local', now().getTime())) {
      const acquired = await localLimiter!.acquire(est, sleep, () => now().getTime(), undefined, deps.signal) // rpm 0 → returns immediately (no spacing)
      if (stopAbortedBatch()) break batchLoop
      if (!acquired) continue
      // The limiter can wait while another workload learns a provider failure. Never dispatch from a stale
      // pre-wait hold snapshot; leave `res` empty so the same batch can fall through to a healthy cloud tier.
      if (!credentialRejectedFor('local') && !triageIsHeld(stateDir, 'local', now().getTime())) {
        prepareAudit('local')
        const attemptStartedAt = now().getTime()
        res = await triageBatch(batch, { model: localProvider.model, models: localProvider.models, baseUrl: localProvider.baseUrl, apiKey: localProvider.apiKey, maxTokens: localProvider.maxTokens, headers: localProvider.headers, extraBody: localProvider.extraBody, timeoutMs: localProvider.timeoutMs, maxAttempts: localProvider.maxAttempts, ...triageIdentityFields('local', localProvider.label || 'Local', localProvider.keyEnvVar) }, fetchFn, sleep)
        completeAudit('local', res)
        localRequests += res.requests
        localTokens += res.tokens
        addProviderCount(providerAttempts, 'local', res.requests)
        localBudget!.record(res.requests, res.tokens) // record to local-budget.json so the cockpit shows live throughput
        localLimiter!.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime())
        if (res.ok) {
          addProviderCount(providerScoredBatches, 'local', 1)
          if (localCooldownWasSet) clearTriageCooldowns(stateDir, 'local', attemptStartedAt) // do not erase a newer concurrent failure
        } else {
          localDownThisCycle = true // box is down this cycle → stop poking it, fall through to the cloud fallback chain
          // SHORT, FLAT cooldown (base == max flattens the exponential) so the NEXT cycle re-probes quickly when the
          // box wakes — local has no daily cap to protect from failed-probe burn, so fast recovery beats sparing a probe.
          holdAfterTriageFailure({ stateDir, providerId: 'local', result: res, at: now().getTime(), cooldownMs: cfg.localCooldownMs, cooldownMaxMs: cfg.localCooldownMs, aborted: !!deps.signal?.aborted, budget: localBudget! })
        }
      }
      if (stopAbortedBatch()) break batchLoop
    }
    // Groq (now the FIRST FALLBACK when local is primary; the primary when local is off/demoted). Gated on
    // `!res || !res.ok` so it runs only when local didn't already score the batch — when local is off, `res` is
    // undefined here and this is byte-for-byte the old Groq-first behaviour.
    if ((!res || !res.ok) && (!adaptiveTarget || adaptiveTarget === 'groq' || adaptiveTargetFailed) && groqOk && !groqDownThisCycle && !credentialRejectedFor('groq') && !triageIsHeld(stateDir, 'groq', now().getTime())) {
      const acquired = await limiter.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
      if (stopAbortedBatch()) break batchLoop
      if (!acquired) continue
      if (!credentialRejectedFor('groq') && !triageIsHeld(stateDir, 'groq', now().getTime())) {
        prepareAudit('groq')
        const attemptStartedAt = now().getTime()
        const reservedResult = await triageGroqWithReservation({
          budget, pace, estimatedTokens: est, items: batch,
          options: groqOptions,
          now: () => now().getTime(), fetchFn, sleep, maxAttempts: 1,
        })
        if (reservedResult) {
          res = reservedResult
          completeAudit('groq', res)
          groqRequests += res.requests
          groqTokens += res.tokens
          addProviderCount(providerAttempts, 'groq', res.requests)
          limiter.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime()) // track live minute ceilings; only provider-wide Retry-After enters the shared limiter
          if (!res.ok) {
            groqDownThisCycle = true // Groq is having a bad cycle → skip it for the rest of THIS cycle, save the cap
            // …and across cycles until the window lapses — EXCEPT on a cycle abort, where the wall-clock guard
            // cancelled an in-flight call. That is not a Groq failure, and cooling on it strands the primary tier.
            holdAfterTriageFailure({ stateDir, providerId: 'groq', result: res, at: now().getTime(), cooldownMs: cfg.llmCooldownMs, cooldownMaxMs: cfg.llmCooldownMaxMs, aborted: !!deps.signal?.aborted, budget })
          } else if (groqCooldownUntil) {
            addProviderCount(providerScoredBatches, 'groq', 1)
            clearTriageCooldowns(stateDir, 'groq', attemptStartedAt) // do not erase a newer concurrent failure
          } else {
            addProviderCount(providerScoredBatches, 'groq', 1)
          }
        }
      }
      if (stopAbortedBatch()) break batchLoop
    }
    // The demoted local tier is the only caller of this sequential helper. Finite direct and aggregate cloud
    // allowances each keep reset-clock pacing below; local is unlimited and deliberately remains last.
    const walkOverflow = async (segment: typeof overflow) => {
      for (const ov of segment) {
        if (deps.signal?.aborted) return
        // skip already-failed (this cycle), cross-cycle cooling-down, or out-of-budget providers
        if (ov.failed || credentialRejectedFor(ov.p.id) || triageIsHeld(stateDir, ov.p.id, now().getTime())) continue
        const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: ov.p.maxAttempts, ...triageIdentityFields(ov.p.id, ov.p.label, ov.p.keyEnvVar) }
        const perAttemptTokens = triageGroqTokenBound(batch, options)
        if (!hardCapAttempts(ov.budget, perAttemptTokens, ov.p.maxAttempts ?? 2)) continue
        const acquired = await ov.limiter.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
        if (deps.signal?.aborted) return
        if (!acquired) return
        if (credentialRejectedFor(ov.p.id) || triageIsHeld(stateDir, ov.p.id, now().getTime())) continue
        const attempts = hardCapAttempts(ov.budget, perAttemptTokens, ov.p.maxAttempts ?? 2)
        const reservation = attempts > 0 ? ov.budget.tryReserve(perAttemptTokens * attempts, undefined, now().getTime(), attempts) : null
        if (!reservation) continue
        const attemptStartedAt = now().getTime()
        prepareAudit(ov.p.id)
        // timeoutMs/maxAttempts: undefined for every provider except one that opts into a longer-than-generic
        // call guard (e.g. the local tier — see its OverflowProvider entry) — triageBatch's own defaults
        // (30_000ms, 2 attempts) apply exactly as before when omitted.
        let overflowResult: TriageResult | undefined
        try {
          overflowResult = await triageBatch(batch, { ...options, maxAttempts: attempts }, fetchFn, sleep)
          res = overflowResult
        } finally {
          const charged = chargedAttemptTokens(overflowResult, perAttemptTokens)
          ov.budget.reconcile(reservation, charged.requests, charged.tokens)
        }
        ov.requests += res.requests
        ov.tokens += res.tokens
        completeAudit(ov.p.id, res)
        addProviderCount(providerAttempts, ov.p.id, res.requests)
        ov.limiter.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime())
        if (res.ok) {
          addProviderCount(providerScoredBatches, ov.p.id, 1)
          if (ov.cooldownWasSet) clearTriageCooldowns(stateDir, ov.p.id, attemptStartedAt) // do not erase a newer concurrent failure
          break // scored — stop walking the chain
        }
        ov.failed = true // skip this provider for the rest of the cycle so the batch can flow to the next
        const localFallback = routeClass(ov) === 'local-fallback'
        holdAfterTriageFailure({ stateDir, providerId: ov.p.id, result: res, at: now().getTime(), cooldownMs: localFallback ? cfg.localCooldownMs : cfg.llmCooldownMs, cooldownMaxMs: localFallback ? cfg.localCooldownMs : cfg.llmCooldownMaxMs, aborted: !!deps.signal?.aborted, budget: ov.budget })
        if (deps.signal?.aborted) return
      }
    }

    // FINITE FREE CAPACITY POOL. The old fixed walk always started at Cerebras, then Mistral, then
    // OpenRouter/NVIDIA, and only then Gemini. That is priority, not utilization: early tiers consumed or
    // failed repeatedly while later allowances sat untouched. Build the exact one-call admission for every
    // finite tier, release each against its provider-day clock, and select the tier furthest behind target.
    // One provider call per selection is deliberate: on failure the SAME batch immediately moves to another
    // tier instead of spending a second scarce request retrying the first.
    type OverflowRoute = DailyQuotaCandidate & {
      kind: 'overflow'
      ov: (typeof overflowDirect)[number]
      options: TriageOptions
      perAttemptTokens: number
      otherHardFit: boolean
    }
    type GeminiRoute = DailyQuotaCandidate & {
      kind: 'gemini'
      gem: (typeof geminiPool)[number]
      options: TriageOptions
      perAttemptTokens: number
      otherHardFit: boolean
    }
    type FreePoolRoute = OverflowRoute | GeminiRoute
    const overflowQuotaRoute = (ov: (typeof overflow)[number], priority: number): OverflowRoute => {
      const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: 1, requestRemainingHeaderIsDaily: ov.p.requestRemainingHeaderIsDaily, ...triageIdentityFields(ov.p.id, ov.p.label, ov.p.keyEnvVar) }
      const perAttemptTokens = triageGroqTokenBound(batch, options)
      const tokenMeter = ov.p.dailyTokenCap != null
      return {
        kind: 'overflow' as const,
        id: ov.p.id,
        meter: tokenMeter ? 'tokens' as const : 'requests' as const,
        used: tokenMeter ? ov.budget.tokens : ov.budget.requests,
        cap: tokenMeter ? ov.p.dailyTokenCap! : ov.p.dailyReqCap,
        cost: tokenMeter ? perAttemptTokens : 1,
        // ADMISSION is tested against the calibrated expected cost; the hard cap and the reservation below
        // keep the conservative worst case. On a token-metered tier those differ 3-8x, and gating admission
        // on the worst case is what made a tier with allowance in hand read "Saved for later today".
        paceCost: tokenMeter ? triagePaceTokenBound(batch) : 1,
        resetTimeZone: ov.p.dayTz,
        floorFraction: ov.p.paceFloorFrac ?? cfg.freeProviderPaceFloorFrac,
        priority,
        ov,
        options,
        perAttemptTokens,
        otherHardFit: ov.budget.canSpend(perAttemptTokens, 1),
      }
    }
    const freePoolRoutes = (): FreePoolRoute[] => {
      const routes: FreePoolRoute[] = overflowDirect.map(overflowQuotaRoute)
      if (geminiOn) {
        for (const [index, gem] of geminiPool.entries()) {
          const modelConfig = cfg.geminiModels.find((candidate) => candidate.model === gem.model)
          if (!modelConfig) continue
          const options: TriageOptions = { model: gem.model, baseUrl: cfg.geminiBaseUrl, apiKey: cfg.geminiApiKey, maxTokens: cfg.geminiMaxTokens, maxAttempts: 1 }
          const perAttemptTokens = triageGroqTokenBound(batch, options)
          routes.push({
            kind: 'gemini', id: `gemini:${gem.model}`, meter: 'requests',
            used: gem.budget.requests, cap: modelConfig.dailyReqCap, cost: 1,
            resetTimeZone: cfg.geminiDayTz, floorFraction: cfg.freeProviderPaceFloorFrac,
            priority: overflowDirect.length + index, gem, options, perAttemptTokens,
            otherHardFit: gem.budget.canSpend(perAttemptTokens, 1),
          })
        }
      }
      return routes
    }
    const aggregateFallbackRoutes = (): OverflowRoute[] => overflowAggregate.map(overflowQuotaRoute)
    // Count contract failures across the whole same-batch route, including the later aggregate. Availability,
    // cap, pacing, and cooldown failures always fall through; unusable model output retains the existing
    // bounded cross-model retry policy so one malformed prompt cannot burn every provider allowance.
    let contractFailures = res?.failureKind === 'contract' ? 1 : 0
    if ((!res || !res.ok) && (!adaptiveTarget || adaptiveTargetFailed || freePoolRoutes().some((route) => route.id === adaptiveTarget))) {
      // A failed atomic reservation is an admission failure for this batch, not evidence that the provider
      // itself is unhealthy. Exclude only this route from the current selection loop so a broken/busy ledger
      // cannot be picked forever and starve healthy later allowances; the next batch may safely re-probe it.
      const reservationUnavailable = new Set<string>()
      // Contract failures on THIS batch, across every free provider it has been offered to. A `contract`
      // failure means the call returned and the body was unusable — evidence about the batch at least as much
      // as about the provider — so re-sending the identical text around the whole pool spends N requests for
      // zero rows. Capped, not banned: the cross-model retry does sometimes rescue a batch, so keep the first
      // one and drop the rest. (cfg.contractRetriesPerBatch; see config.ts for the measured rationale.)
      // Seed from the failure that has ALREADY happened: `res` may hold a contract failure from the local
      // primary or from Groq, and the cap counts re-sends of THIS batch whoever produced the first unusable
      // body. Starting at 0 under-counted by one, and made `NEWS_CONTRACT_RETRIES_PER_BATCH=0` still send
      // the batch to one pool provider — which config.ts and the README both document as "never re-sends".
      while (true) {
        if (contractFailures > cfg.contractRetriesPerBatch) {
          log(`triage batch @${i}: ${contractFailures} unusable-response failure${contractFailures === 1 ? '' : 's'} — not re-sending this batch to more free providers (cap ${cfg.contractRetriesPerBatch})`)
          break
        }
        const routes = freePoolRoutes()
        const available = routes.filter((route) => !reservationUnavailable.has(route.id) && !credentialRejectedFor(route.id) && route.otherHardFit && (
          route.kind === 'overflow'
            ? !route.ov.failed && !triageIsHeld(stateDir, route.ov.p.id, now().getTime())
            : !route.gem.failed && !triageIsHeld(stateDir, route.id, now().getTime())
        ))
        const pick = (adaptiveTarget && !adaptiveTargetFailed
          ? available.find((route) => route.id === adaptiveTarget) || null
          : selectDailyQuotaCandidate(available, now().getTime())) as FreePoolRoute | null
        if (!pick) break
        if (pick.kind === 'overflow') {
          const { ov } = pick
          const acquired = await ov.limiter.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
          if (stopAbortedBatch()) break batchLoop
          if (!acquired) {
            reservationUnavailable.add(pick.id)
            continue
          }
          if (credentialRejectedFor(ov.p.id) || triageIsHeld(stateDir, ov.p.id, now().getTime())) { reservationUnavailable.add(pick.id); continue }
          const refreshedAdmission = dailyQuotaAdmission({
            ...pick,
            used: pick.meter === 'tokens' ? ov.budget.tokens : ov.budget.requests,
          }, now().getTime())
          if (!refreshedAdmission.pacedFit || !ov.budget.canSpend(pick.perAttemptTokens, 1)) {
            reservationUnavailable.add(pick.id)
            continue
          }
          const reservation = ov.budget.tryReserve(pick.perAttemptTokens, undefined, now().getTime(), 1)
          if (!reservation) { reservationUnavailable.add(pick.id); continue }
          const attemptStartedAt = now().getTime()
          prepareAudit(ov.p.id)
          let result: TriageResult | undefined
          try {
            result = await triageBatch(batch, pick.options, fetchFn, sleep)
            res = result
          } finally {
            const charged = chargedAttemptTokens(result, pick.perAttemptTokens)
            ov.budget.reconcile(reservation, charged.requests, charged.tokens)
          }
          ov.requests += res.requests
          ov.tokens += res.tokens
          completeAudit(ov.p.id, res)
          addProviderCount(providerAttempts, ov.p.id, res.requests)
          ov.limiter.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime())
          if (res.ok) {
            addProviderCount(providerScoredBatches, ov.p.id, 1)
            if (ov.cooldownWasSet) clearTriageCooldowns(stateDir, ov.p.id, attemptStartedAt)
            break
          }
          ov.failed = true
          if (res.failureKind === 'contract') contractFailures++
          holdAfterTriageFailure({ stateDir, providerId: ov.p.id, result: res, at: now().getTime(), cooldownMs: cfg.llmCooldownMs, cooldownMaxMs: cfg.llmCooldownMaxMs, aborted: !!deps.signal?.aborted, budget: ov.budget })
          if (stopAbortedBatch()) break batchLoop
          continue
        }

        const { gem } = pick
        const acquired = await geminiLimiter!.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
        if (stopAbortedBatch()) break batchLoop
        if (!acquired) {
          reservationUnavailable.add(pick.id)
          continue
        }
        if (credentialRejectedFor(pick.id) || triageIsHeld(stateDir, pick.id, now().getTime())) { reservationUnavailable.add(pick.id); continue }
        const refreshedAdmission = dailyQuotaAdmission({ ...pick, used: gem.budget.requests }, now().getTime())
        if (!refreshedAdmission.pacedFit || !gem.budget.canSpend(pick.perAttemptTokens, 1)) {
          reservationUnavailable.add(pick.id)
          continue
        }
        const reservation = gem.budget.tryReserve(pick.perAttemptTokens, undefined, now().getTime(), 1)
        if (!reservation) { reservationUnavailable.add(pick.id); continue }
        const attemptStartedAt = now().getTime()
        prepareAudit(pick.id)
        let result: TriageResult | undefined
        try {
          result = await triageBatchGemini(batch, pick.options, fetchFn, sleep)
          res = result
        } finally {
          const charged = chargedAttemptTokens(result, pick.perAttemptTokens)
          gem.budget.reconcile(reservation, charged.requests, charged.tokens)
        }
        geminiRequests += res.requests
        geminiTokens += res.tokens
        completeAudit(pick.id, res)
        // BOTH keys, always: the aggregate 'gemini' row the cockpit's pool chip reads, AND the per-model
        // `gemini:<model>` row. The pool is five separate daily buckets behind one chip, so an aggregate-only
        // count cannot answer "WHICH of the five failed 24 times?" — the question the panel's own numbers
        // provoke. Additive keys, so every existing reader is unchanged.
        addProviderCount(providerAttempts, 'gemini', res.requests)
        addProviderCount(providerAttempts, pick.id, res.requests)
        geminiLimiter!.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime())
        if (res.ok) {
          addProviderCount(providerScoredBatches, 'gemini', 1)
          addProviderCount(providerScoredBatches, pick.id, 1)
          if (gem.cooldownWasSet) clearTriageCooldowns(stateDir, pick.id, attemptStartedAt)
          break
        }
        gem.failed = true
        if (res.failureKind === 'contract') contractFailures++
        // name the MODEL, not the pool — five models sit behind one chip and they fail for different reasons
        log(`triage batch @${i}: ${pick.id} ${res.note || 'failed'}`)
        holdAfterTriageFailure({ stateDir, providerId: pick.id, result: res, at: now().getTime(), cooldownMs: cfg.llmCooldownMs, cooldownMaxMs: cfg.llmCooldownMaxMs, aborted: !!deps.signal?.aborted, budget: gem.budget })
        if (stopAbortedBatch()) break batchLoop
      }
    }
    // AGGREGATE LAST-FREE FALLBACK. Only now — after every eligible direct/Gemini route either had no released
    // allowance or was attempted and failed — may a self-hosted router try its dedicated/keyless upstream
    // pool. Its finite cap meters calls into the router, not those upstreams; sharing direct-provider keys
    // would still double-spend them. One failed aggregate can fall through without provider-id knowledge.
    if ((!res || !res.ok) && (!adaptiveTarget || adaptiveTargetFailed || adaptiveTarget !== 'anthropic-triage') && contractFailures <= cfg.contractRetriesPerBatch) {
      const reservationUnavailable = new Set<string>()
      while (!res || !res.ok) {
        if (contractFailures > cfg.contractRetriesPerBatch) break
        const available = aggregateFallbackRoutes().filter((route) => {
          if (reservationUnavailable.has(route.id) || !route.otherHardFit || route.ov.failed) return false
          if (credentialRejectedFor(route.ov.p.id) || triageIsHeld(stateDir, route.ov.p.id, now().getTime())) return false
          return dailyQuotaAdmission(route, now().getTime()).pacedFit
        })
        const pick = selectDailyQuotaCandidate(available, now().getTime()) as OverflowRoute | null
        if (!pick) break
        const { ov } = pick
        const acquired = await ov.limiter.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
        if (stopAbortedBatch()) break batchLoop
        if (!acquired) { reservationUnavailable.add(pick.id); continue }
        if (credentialRejectedFor(ov.p.id) || triageIsHeld(stateDir, ov.p.id, now().getTime())) { reservationUnavailable.add(pick.id); continue }
        const refreshedAdmission = dailyQuotaAdmission({
          ...pick,
          used: pick.meter === 'tokens' ? ov.budget.tokens : ov.budget.requests,
        }, now().getTime())
        if (!refreshedAdmission.pacedFit || !ov.budget.canSpend(pick.perAttemptTokens, 1)) {
          reservationUnavailable.add(pick.id)
          continue
        }
        const reservation = ov.budget.tryReserve(pick.perAttemptTokens, undefined, now().getTime(), 1)
        if (!reservation) { reservationUnavailable.add(pick.id); continue }
        const attemptStartedAt = now().getTime()
        prepareAudit(ov.p.id)
        let result: TriageResult | undefined
        try {
          result = await triageBatch(batch, pick.options, fetchFn, sleep)
          res = result
        } finally {
          const charged = chargedAttemptTokens(result, pick.perAttemptTokens)
          ov.budget.reconcile(reservation, charged.requests, charged.tokens)
        }
        ov.requests += res.requests
        ov.tokens += res.tokens
        completeAudit(ov.p.id, res)
        addProviderCount(providerAttempts, ov.p.id, res.requests)
        ov.limiter.learn(rateInfoForLimiter(res.rate, triageFailureIsProviderWide(res)), () => now().getTime())
        if (res.ok) {
          addProviderCount(providerScoredBatches, ov.p.id, 1)
          if (ov.cooldownWasSet) clearTriageCooldowns(stateDir, ov.p.id, attemptStartedAt)
          break
        }
        ov.failed = true
        if (res.failureKind === 'contract') contractFailures++
        holdAfterTriageFailure({ stateDir, providerId: ov.p.id, result: res, at: now().getTime(), cooldownMs: cfg.llmCooldownMs, cooldownMaxMs: cfg.llmCooldownMaxMs, aborted: !!deps.signal?.aborted, budget: ov.budget })
        if (stopAbortedBatch()) break batchLoop
      }
    }
    // LOCAL LAST: a demoted local tier is unlimited but slow, so it only gets the batch once the finite
    // direct/Gemini pool and the aggregate fallback have both passed.
    if ((!res || !res.ok) && (!adaptiveTarget || adaptiveTargetFailed || adaptiveTarget !== 'anthropic-triage')) await walkOverflow(overflowLocal)
    if (stopAbortedBatch()) break batchLoop
    // LAST-RESORT: every free brain is paced/capped/cooling/failed for this batch → score it on Claude Haiku
    // (the host's subscription by default) rather than deferring and risking the 1,000-cap drop under
    // sustained overload. This is what keeps RECENCY: the item is scored now, not next reset. Gated: enabled
    // + not-already-failed-this-cycle + not cross-cycle cooling + daily $ ceiling not reached + the batch's
    // most material item clears the priority floor — gating on it spends the scarce budget on what matters
    // first. Read as the batch MAX, not batch[0]: the queue interleaves two priority-sorted pools
    // (buildTriageQueue), so its lead item is no longer guaranteed to be its highest-priority one, and
    // gating on the lead alone would refuse a batch that carries a floor-clearing item behind it.
    const anthropicCallBoundUsd = haikuCallBoundUsd
    const anthropicCanReserve = !!anthropicBudget?.canSpend(anthropicCallBoundUsd)
    const anthropicLedgerAvailable = !anthropicLedgerUnavailable()
    const haikuPressureNow = queuePressure || everyFreeProviderWeak || (!!res && !res.ok)
    if (!anthropicLedgerAvailable) usageLedgerUnavailable = true
    else if (anthropicOn && !anthropicCanReserve) anthropicBudgetBlocked = true
    if (
      (!res || !res.ok) && (!adaptiveTarget || adaptiveTarget === 'anthropic-triage' || adaptiveTargetFailed) &&
      anthropicOn && haikuPressureNow && !anthropicDownThisCycle && !credentialRejectedFor('anthropic-triage') && !triageIsHeld(stateDir, 'anthropic-triage', now().getTime()) &&
      anthropicCanReserve && haikuPacedFit && batch.reduce((m, it) => Math.max(m, preTriagePriority(it, nowDate)), -Infinity) >= cfg.anthropicMinPriority
    ) {
      const acquired = await anthropicLimiter!.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
      if (stopAbortedBatch()) break batchLoop
      if (!acquired) continue
      if (credentialRejectedFor('anthropic-triage') || triageIsHeld(stateDir, 'anthropic-triage', now().getTime())) {
        providerRetryHeld = true
        deferred.push(...scoreItems.slice(i))
        break batchLoop
      }
      // The subscription adapter may make one bounded retry when the first exact response is unusable.
      // Reserve both possible calls atomically when the day still has room. Near the ceiling, keep the
      // useful one-call fallback instead of refusing the tier altogether. The USD ledger's `calls` value
      // remains one logical triage batch; the reserved dollar envelope is what bounds provider attempts.
      let subscriptionMaxAttempts = 1
      let usdReservation = cfg.anthropicFallbackMode === 'subscription'
        ? anthropicBudget!.tryReserve(anthropicCallBoundUsd * 2, now().getTime(), 2)
        : null
      if (usdReservation) subscriptionMaxAttempts = 2
      // Retry a smaller envelope only when the two-call estimate genuinely did not fit. A busy/corrupt
      // authority must not be polled again until its lock releases and then mistaken for fresh permission.
      else if (anthropicBudget!.lastReserveFailure !== 'authority_unavailable') {
        usdReservation = anthropicBudget!.tryReserve(anthropicCallBoundUsd, now().getTime(), 1)
      }
      // Another server process may have reserved the last dollars after our unlocked routing hint. The
      // locked reservation is authoritative; without it no paid/subscription provider I/O may start.
      if (!usdReservation) {
        usageLedgerUnavailable = usageLedgerUnavailable
          || configuredFreeLedgerUnavailable()
          || anthropicLedgerUnavailable()
        if (!usageLedgerUnavailable) budgetHit = true
        deferred.push(...scoreItems.slice(i))
        break batchLoop
      }
      const attemptStartedAt = now().getTime()
      prepareAudit('anthropic-triage')
      const ar = cfg.anthropicFallbackMode === 'subscription'
        ? await triageBatchClaudeCli(batch, {
            model: cfg.anthropicModel,
            timeoutMs: cfg.anthropicTimeoutMs,
            budgetUsd: cfg.anthropicPerCallUsd,
            budgetRemainingUsd: usdReservation.usd,
            maxAttempts: subscriptionMaxAttempts,
            signal: deps.signal,
            beforeRetry: subscriptionMaxAttempts > 1
              ? async () => {
                  const acquired = await anthropicLimiter!.acquire(est, sleep, () => now().getTime(), undefined, deps.signal)
                  return acquired && !triageIsHeld(stateDir, 'anthropic-triage', now().getTime())
                }
              : undefined,
          }, deps.claudeCliRunner)
        : await triageBatchAnthropic(
            batch,
            { model: cfg.anthropicApiModel, baseUrl: cfg.anthropicBaseUrl, apiKey: cfg.anthropicApiKey, maxTokens: cfg.anthropicMaxTokens, inPricePerMTok: cfg.anthropicInPricePerMTok, outPricePerMTok: cfg.anthropicOutPricePerMTok, maxAttempts: 1, signal: deps.signal },
            fetchFn,
            sleep,
          )
      res = ar
      anthropicRequests += ar.requests
      anthropicTokens += ar.tokens
      // A paid API/CLI dispatch is not free merely because the response omitted usage or the socket/parent
      // aborted before usage arrived. Keep one conservative per-call bound for each proven dispatch, while
      // releasing any reserved retry that never ran. Use actual cost only when the provider reported it.
      const reconciledAnthropicUsd = ar.requests <= 0
        ? 0
        : ar.costUsdKnown === true
          ? ar.costUsd
          : Math.min(usdReservation.usd, ar.requests * anthropicCallBoundUsd)
      anthropicCostUsd += reconciledAnthropicUsd
      completeAudit('anthropic-triage', ar, reconciledAnthropicUsd)
      addProviderCount(providerAttempts, 'anthropic-triage', ar.requests)
      anthropicBudget!.reconcile(usdReservation, reconciledAnthropicUsd, ar.requests)
      anthropicLimiter!.learn(rateInfoForLimiter(ar.rate, triageFailureIsProviderWide(ar)), () => now().getTime())
      if (ar.ok) {
        addProviderCount(providerScoredBatches, 'anthropic-triage', 1)
        if (anthropicCooldownWasSet) clearTriageCooldowns(stateDir, 'anthropic-triage', attemptStartedAt) // do not erase a newer concurrent failure
      } else if (!deps.signal?.aborted) {
        anthropicDownThisCycle = true // bad cycle → skip this tier for the rest of it (don't burn the budget)
        anthropicFailNote = ar.note || '' // keep the reason so the cycle note can say plan-quota vs a transient error
        if (cfg.anthropicFallbackMode === 'api') {
          // API failures use the same typed reason router as every free provider. 429/503/access evidence is
          // provider-wide; request/contract/attempt-timeout failures stay on the Anthropic-triage workload.
          // Retry-After is an exact flat clock in either scope. Critically, a generic 429/4xx does NOT spend
          // the durable $ day — only the adapter's explicit dailyLimit signal is allowed to close that ledger.
          if (ar.dailyLimit) anthropicBudget!.exhaust()
          else {
            const providerWide = triageFailureIsProviderWide(ar)
            holdAfterTriageFailure({
              stateDir, providerId: 'anthropic-triage', result: ar, at: now().getTime(),
              cooldownMs: providerWide ? cfg.llmCooldownMs : cfg.anthropicTransientCooldownMs,
              cooldownMaxMs: providerWide ? cfg.llmCooldownMaxMs : cfg.anthropicTransientCooldownMs,
              aborted: false,
            })
          }
        // Subscription CLI failures have no typed HTTP response. Keep its purpose-built sign-in/plan-quota
        // policy: recoverable sign-in and transient/contract failures re-probe quickly, while an explicit
        // plan quota waits on the long breaker. Other terminal CLI API errors retain the legacy day stop.
        } else if (isAuthExpiredNote(ar.note || '')) armCooldown(stateDir, now().getTime(), cfg.anthropicTransientCooldownMs, 'anthropic-triage', cfg.anthropicTransientCooldownMs, 'auth-expired')
        else if (isTerminalApiNote(ar.note || '')) anthropicBudget!.exhaust()
        else if (isPlanQuotaNote(ar.note || '')) armCooldown(stateDir, now().getTime(), cfg.llmCooldownMs, 'anthropic-triage', cfg.llmCooldownMaxMs)
        else armCooldown(stateDir, now().getTime(), cfg.anthropicTransientCooldownMs, 'anthropic-triage', cfg.anthropicTransientCooldownMs)
      }
      if (stopAbortedBatch()) break batchLoop
    }
    if (!res) {
      // NOTHING was attempted. Distinguish three states that the old `!budget.canSpend(est)` collapsed:
      // configured allowance genuinely cannot fit a call; allowance exists but is clock-paced; or allowance
      // is released but an engine retry hold is protecting it after an error. This is operator truth, and it
      // stops "every quota spent" appearing while OpenRouter/NVIDIA/Gemini still have unused allowance.
      const routes = [...freePoolRoutes(), ...aggregateFallbackRoutes()]
      const routeState = routes.map((route) => ({
        route,
        admission: dailyQuotaAdmission(route, now().getTime()),
        blocked: route.kind === 'overflow'
          ? route.ov.failed || triageIsHeld(stateDir, route.ov.p.id, now().getTime())
          : route.gem.failed || triageIsHeld(stateDir, route.id, now().getTime()),
      }))
      const groqHard = !!cfg.groqApiKey && budget.canSpend(groqAttemptTokenBound, 1)
      const groqReleased = groqOk
      const groqBlocked = groqDownThisCycle || triageIsHeld(stateDir, 'groq', now().getTime())
      const localPrimaryHard = !!localProvider && localBudget!.canSpend(triageGroqTokenBound(batch, { model: localProvider.model, baseUrl: localProvider.baseUrl, apiKey: localProvider.apiKey, maxTokens: localProvider.maxTokens }), 1)
      const localPrimaryBlocked = localPrimaryHard && (localDownThisCycle || triageIsHeld(stateDir, 'local', now().getTime()))
      const localFallbackHard = overflowLocal.some((ov) => ov.budget.canSpend(triageGroqTokenBound(batch, { model: ov.p.model, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens }), 1))
      const localFallbackBlocked = localFallbackHard && overflowLocal.every((ov) => ov.failed || triageIsHeld(stateDir, ov.p.id, now().getTime()))
      const anyHard = groqHard || localPrimaryHard || localFallbackHard || routeState.some(({ route, admission }) => route.otherHardFit && admission.hardCapFit)
      const anyReleased = groqReleased || localPrimaryHard || localFallbackHard || routeState.some(({ route, admission }) => route.otherHardFit && admission.pacedFit)
      const anyRetryBlock = (groqReleased && groqBlocked) || localPrimaryBlocked || localFallbackBlocked || routeState.some(({ route, admission, blocked }) => route.otherHardFit && admission.pacedFit && blocked)
      providerRetryHeld = anyReleased && anyRetryBlock
      paceHit = !providerRetryHeld && anyHard && !anyReleased
      usageLedgerUnavailable = usageLedgerUnavailable
        || configuredFreeLedgerUnavailable()
        || anthropicLedgerUnavailable()
      const anyProviderDayLimit = (!!cfg.groqApiKey && budget.providerDayExhausted)
        || Boolean(localBudget?.providerDayExhausted)
        || overflow.some((ov) => ov.budget.providerDayExhausted)
        || geminiPool.some((gem) => gem.budget.providerDayExhausted)
      providerDayLimitHit = !usageLedgerUnavailable && !anyHard && anyProviderDayLimit
      budgetHit = !usageLedgerUnavailable && !anyHard && !providerDayLimitHit
      deferred.push(...scoreItems.slice(i)) // everything from here on waits for the next cycle / drain
      break
    }
    if (!res.ok) {
      // a failed batch is UNSCORED, not scored-zero: do NOT mark seen (the 7-day cache would make
      // the drop permanent) — defer the whole batch and try again next cycle
      batchFailed = true
      deferred.push(...batch)
      log(`triage batch @${i}: ${res.note || 'failed'} — ${batch.length} item${batch.length === 1 ? '' : 's'} deferred to next cycle`)
      continue
    }
    const batchTriagedStart = triaged.length
    for (let j = 0; j < batch.length; j++) {
      const it = batch[j]
      const t = res.byIndex.get(j)
      // a missing index on an OK response is a deliberate model omission → score 0 (drop), marked
      // seen so we don't pay to re-score it next cycle
      const score = t ? t.materiality_pre_score : 0
      // composite PRIORITY: the Groq read, lifted/lowered by the §4 source tier, company-vs-broad
      // scope, strongest event, size and recency — the deterministic, no-extra-cost re-rank that
      // stops terse primary filings being buried under verbose news (see rank.ts). triage_score
      // becomes this priority; materiality_pre_score keeps the raw Groq read for transparency.
      // reads the active weight set (rank-weights.ts) — boost_weight included — so a Scoring-panel edit
      // changes ingest scoring with no redeploy. cfg.rankBoostWeight still seeds the default boost.
      const ranked = rankScore(
        { materiality_pre_score: score, issuer_linkage: t?.issuer_linkage, companies: t?.companies, event_types: t?.event_types, input_nature: it.input_nature, headline: it.headline, headline_en: t?.headline_en, size_bucket: t?.size_bucket, found_at: it.found_at, event_materiality_label: t?.event_materiality_label },
        now(),
      )
      // §4/§24 doctrine cap: a Reddit/`social` item can never be a top pick NOR out-rank filings for a
      // scarce inbox slot. capSocialScore clamps the composite priority below the pick threshold so the
      // band cap AND the score-ordering both hold; capSocialBand is then belt-and-suspenders on the band.
      // caution_only social (r/wallstreetbets) is "weighted lowest" — clamp below the watch line / to `drop`.
      const caution = it.caution === true
      const cappedScore = capSocialScore(ranked.rank_score, ranked.rank_factors.source_tier_id, cfg.pickThreshold, cfg.watchThreshold, caution)
      const band = capSocialBand(scoreToBand(cappedScore, cfg.pickThreshold, cfg.watchThreshold), ranked.rank_factors.source_tier_id, caution)
      // English translation of a non-English headline — kept for a non-Latin original OR a model-named
      // non-English source language (news/lang.ts pickTranslation); else null → the UI shows the original.
      const headline_en = pickTranslation(it.headline, t?.headline_en, t?.headline_lang)
      triaged.push({
        ...it,
        triage_score: cappedScore,
        triage_reason: t?.why || 'not material',
        relevance: t?.relevance || 'irrelevant',
        materiality_pre_score: score,
        event_types: t?.event_types || [],
        issuer_linkage: t?.issuer_linkage || 'sector',
        companies: t?.companies || [],
        size_bucket: t?.size_bucket || 'unknown',
        band,
        // the FINAL event-materiality classifier fields: the label is re-derived from cappedScore (the
        // SHOWN score) so it can never contradict it; scope reuses the scope_id the ranker already won
        // (ranked.rank_factors.scope_id) instead of re-deriving, so the two can't disagree.
        event_materiality_label: deriveMaterialityLabel(cappedScore),
        event_direction: t?.event_direction || 'unknown',
        event_scope: toEventScope(ranked.rank_factors.scope_id),
        rank_factors: ranked.rank_factors,
        headline_en,
        // the source language named — only when a translation was actually kept (for the "original · X" label)
        ...(headline_en && t?.headline_lang ? { headline_lang: t.headline_lang } : {}),
        ...(t?.source_is_english === true ? { source_is_english: true as const } : {}),
        // Geography = where the EVENT is, not where it was published: re-derive region from the triage
        // read (news/geo.ts), keeping the publisher's domain region as source_region. Falls back to the
        // domain region when the read gives no signal, so an unscored/omitted item never regresses.
        region: resolveEventRegion(t, it.region),
        source_region: it.region,
      })
    }
    // Checkpoint each completed provider batch immediately. The raw queue journal prevents article loss, but
    // without this second receipt a host crash late in a long loop would pay to rescore every earlier batch.
    // Stop dispatching more calls if the checkpoint cannot land; the raw v2 authority remains retryable.
    const completedBatch = triaged.slice(batchTriagedStart).map((item) => ({
      ...item,
      deferred_at: item.deferred_at || ts,
      feed_pending: item.feed_pending || 'uncommitted' as const,
      feed_triaged_at: item.feed_triaged_at || item.pending_feed_item?.ts || ts,
    }))
    triaged.splice(batchTriagedStart, completedBatch.length, ...completedBatch)
    const unprocessedAfterBatch = scoreItems.slice(i + batch.length)
    if (!persistScoredCheckpoint(stateDir, completedBatch)) {
      scoredCheckpointWriteFailed = true
      deferred.push(...unprocessedAfterBatch)
      log(`scored checkpoint unavailable after batch @${i} — stopped further provider calls; raw queue remains durable`)
      break batchLoop
    }
    } finally {
      // A provider selected by the adaptive route can lose a reservation or become held before network
      // I/O. That is an audited zero-call budget failure, not a forever-open decision and not a fake
      // provider failure. Real decisions that could not be persisted remain explicit gaps instead.
      closeUnattemptedAudit()
    }
  }
  budget.save()
  if (localBudget) localBudget.save() // persist local's daily tokens/requests so the cockpit reads live throughput
  for (const g of geminiPool) g.budget.save()
  for (const o of overflow) o.budget.save()
  if (anthropicBudget) anthropicBudget.save()
  // Journal every scored row alongside the true deferred tail BEFORE any inbox/feed projection. A failed
  // atomic inbox rename or process crash can then retry one-shot source rows; successful projection removes
  // these temporary safety entries below. Seen is deliberately not persisted until projection succeeds.
  // This journal write already excludes backlogExpired (carriedExpired/freshExpired never entered `deferred`
  // or the triage queue `items` that `triaged` was drawn from) — so a successful journal write ALONE already
  // durably removes the expired rows from disk, independent of whether the later cleanup write below succeeds.
  for (const item of triaged) {
    item.feed_pending ||= 'uncommitted'
    item.feed_triaged_at ||= item.pending_feed_item?.ts || ts
  }
  const deferredJournalOk = persistDeferred(stateDir, stampDeferred([...triaged, ...deferred], ts), log)
  let deferredPersisted = deferredJournalOk

  // 3b. DEDUP — micro-cluster this cycle's items against the recent firehose into STORIES (finer than
  // themes), so the firehose line + the SSE event each carry a stable story-cluster id and the wire
  // shows one row per story. Uses the cycle ts for fresh items so it matches the read-side recompute
  // (feed.ts withDedup). Fully guarded — a dedup bug never blocks or corrupts the core pipeline.
  if (cfg.dedupEnabled && triaged.length) {
    try {
      const recent = readFeed(repoRoot, 2, { now }).items
      const views = [
        ...recent.map((it) => ({ event_id: it.event_id, headline: it.headline, ts: it.ts, companies: it.companies, source_name: it.source_name })),
        ...triaged.map((t) => ({ event_id: t.event_id, headline: t.headline, ts, companies: t.companies, source_name: t.source_name })),
      ]
      const groups = assignDedupGroups(views, { windowHours: cfg.dedupWindowHours, jaccard: cfg.dedupJaccard, verbatimJaccard: cfg.dedupVerbatimJaccard, maxScan: cfg.dedupMaxScan })
      for (const t of triaged) {
        // Once the exact payload exists it is immutable recovery authority, including its story id.
        t.dedup_group = t.pending_feed_item?.dedup_group || groups.get(t.event_id) || t.event_id
      }
    } catch (e: any) {
      log(`dedup stage error: ${e?.message || e}`)
    }
  }

  // 4. WRITE
  const picks = triaged.filter((t) => t.band !== 'drop')
  let inboxed = 0
  let revisionClocksByEvent = new Map<string, InboxRevisionClocks>()
  let withheldEventIds = new Set<string>()
  let inboxWriteFailed = false
  // An exact pending payload proves this pick/watch was already merged. Re-merging it after UTC rollover
  // would create a second day's sweep row. Seed its immutable clocks for Themes and merge only rows that do
  // not yet have an exact post-inbox payload.
  for (const item of picks) {
    const exact = item.pending_feed_item
    if (!exact) continue
    revisionClocksByEvent.set(item.event_id, {
      foundAt: exact.found_at || item.found_at,
      ...(exact.observed_at ? { observedAt: exact.observed_at } : {}),
      sourceIsEnglish: exact.source_is_english === true,
    })
  }
  const picksNeedingInbox = picks.filter((item) => !item.pending_feed_item)
  if (picksNeedingInbox.length) {
    const byInboxDate = new Map<string, TriagedItem[]>()
    for (const item of picksNeedingInbox) {
      const originalDate = (item.feed_triaged_at || date).slice(0, 10)
      const inboxDate = /^\d{4}-\d{2}-\d{2}$/.test(originalDate) ? originalDate : date
      byInboxDate.set(inboxDate, [...(byInboxDate.get(inboxDate) || []), item])
    }
    let mergedAny = false
    for (const [inboxDate, group] of byInboxDate) try {
      const merged = mergeInbox(repoRoot, inboxDate, group, {
        maxRows: cfg.inboxMaxRows,
        now,
        archiveDir: cfg.newsArchiveDir,
        stateDir,
      })
      for (const [eventId, clocks] of merged.revisionClocksByEvent) revisionClocksByEvent.set(eventId, clocks)
      for (const eventId of merged.withheldEventIds) withheldEventIds.add(eventId)
      mergedAny = true
    } catch (e: any) {
      // LAST BACKSTOP — this module's standing invariant is that a cycle never throws, and every other
      // stage already honours it (dedup, themes, appendFirehoseSummary). mergeInbox was the sole
      // exception, and it runs UPSTREAM of the wire, so its refusals rendered as a blank cockpit reading
      // 0 read · 0 kept · 0 dropped. Anything refused here is WITHHELD, not lost: the kept rows go back
      // to the backlog UNSEEN to be retried, the dropped rows still reach the wire with their own raw
      // clocks, the summary is still written, and the failure is REPORTED. Never widen this to swallow
      // non-write failures.
      inboxWriteFailed = true
      for (const t of group) withheldEventIds.add(t.event_id)
      log(`inbox write withheld: ${e?.message || e}`)
    }
    if (mergedAny) {
      try { await refreshBoard(repoRoot, log) }
      catch (e: any) { log(`board refresh failed after durable inbox merge: ${e?.message || e}`) }
    }
  }
  try {
    const current = JSON.parse(fs.readFileSync(path.join(repoRoot, 'screener', 'inbox', `${date}_sweep.json`), 'utf8'))
    inboxed = Array.isArray(current?.rows) ? current.rows.length : 0
  } catch { inboxed = 0 }
  // A row is only a candidate to land until its firehose item is durably appended below. Inbox-withheld
  // rows never reach that boundary. An unusable shard limit or I/O failure can still refuse a suffix, and that
  // suffix must remain uncounted, unseen, and queued until a later cycle actually persists it.
  const eligibleFeedCandidates = triaged.filter((t) => !withheldEventIds.has(t.event_id))
  // append reports an ordered prefix. Put already-durable acknowledgements first so a new row blocked by
  // today's cap cannot strand a later historical acknowledgement behind it forever.
  const feedCandidates = [
    ...eligibleFeedCandidates.filter((item) => acknowledgedEventIds.has(item.event_id)),
    ...eligibleFeedCandidates.filter((item) => !acknowledgedEventIds.has(item.event_id)),
  ]

  // per-item feed records — for KEPT and DROPPED alike, so the live wire shows everything the
  // scanner read and why; then stream each to live listeners
  const feedItems: FeedItem[] = feedCandidates.map((t) => {
    // A prior-version row can cross the durable feed boundary only after a restart. Add the current
    // decision annotation here too so recovered scored work remains part of shadow reconciliation.
    if (t.pending_feed_item) return withInitialRescueDecision(t.pending_feed_item)
    const clocks = revisionClocksByEvent.get(t.event_id)
    const sourceIsEnglish = clocks ? clocks.sourceIsEnglish : t.source_is_english === true
    return withInitialRescueDecision({
      kind: 'item',
      ts: t.feed_triaged_at || ts,
      // Exact kept revisions use the pair mergeInbox persisted. Dropped rows have no inbox lane and retain
      // their raw source clock; `ts` above remains the separate triage audit clock in either case.
      found_at: clocks?.foundAt || t.found_at,
      ...(clocks?.observedAt ? { observed_at: clocks.observedAt } : {}),
      event_id: t.event_id,
      headline: t.headline,
      headline_en: t.headline_en, // English translation of a non-English headline (news/lang.ts); null when English
      ...(t.headline_lang ? { headline_lang: t.headline_lang } : {}),
      ...(sourceIsEnglish ? { source_is_english: true as const } : {}),
      url: t.url,
      domain: t.domain,
      source_name: t.source_name,
      via: t.via || 'gdelt',
      region: t.region, // the EVENT's market (news/geo.ts) — the legacy 8-bucket region
      // the publisher's region, persisted only when it differs from the event region (e.g. an SCMP/CN
      // domain piece about Bangladesh → region OTHER, source_region CN) — the override's audit trail
      ...(t.source_region && t.source_region !== t.region ? { source_region: t.source_region } : {}),
      // the EVENT's country (ISO alpha-2, news/geography.ts) — the country-level Geography filter's key.
      // null when no confident signal ("Global / unspecified"). Re-derived on read for older lines (feed.ts).
      country: resolveCountry(t.headline, t.headline_en, t.companies, t.region, t.issuer_linkage),
      input_nature: t.input_nature,
      triage_score: t.triage_score,
      band: t.band,
      triage_reason: t.triage_reason,
      relevance: t.relevance,
      event_types: t.event_types,
      issuer_linkage: t.issuer_linkage,
      companies: t.companies,
      size_bucket: t.size_bucket,
      // derived, zero-cost classification — persisted so the wire + a later backfill agree
      scope: deriveScope(t),
      source_tier: deriveSourceTier(t),
      // canonical commodity tag(s) (news/commodities.ts) — absent when the headline names none
      ...(() => { const cs = deriveCommodities(t); return cs ? { commodity: cs[0], commodities: cs } : {} })(),
      // event-materiality classifier's final fields — already resolved onto t in the TRIAGE loop above
      event_materiality_label: t.event_materiality_label,
      event_direction: t.event_direction,
      event_scope: t.event_scope,
      snippet: t.snippet, // the feed's own lede — fetch-free body for on-open enrichment
      rank_factors: t.rank_factors, // the composite-priority breakdown (rank.ts) — for the WHY in the UI
      dedup_status: t.dedup_status,
      dedup_group: t.dedup_group, // story-cluster id (news/dedup.ts) — the live wire collapses on it
      inboxed: t.band !== 'drop',
      caution: t.caution, // caution_only social — preserved so the display re-rank (feed.ts) re-applies the lowest cap
    })
  })
  // Persist the exact post-inbox payload BEFORE append. This is the crash-replay authority for every field,
  // including original triage time and durable inbox clocks. If this journal cannot land, do not start a
  // new append: the earlier marker journal remains retryable, but it intentionally predates exact projection.
  for (let i = 0; i < feedCandidates.length; i++) {
    feedCandidates[i].pending_feed_item = feedItems[i]
    // Preserve the last proven target when it already contains the event. Otherwise journal THIS attempt's
    // partition before append, closing D → D+1 → crash → D+2 idempotence without mutating FeedItem.ts.
    if (!acknowledgedEventIds.has(feedCandidates[i].event_id)) feedCandidates[i].feed_target_date = date
  }
  const exactFeedJournalOk = persistDeferred(stateDir, stampDeferred([...triaged, ...deferred], ts), log)
  const oversizedFeedItem = feedItems.find((item) =>
    Buffer.byteLength(`${JSON.stringify(item)}\n`, 'utf8') > MAX_FEED_ITEM_BYTES)
  if (oversizedFeedItem) {
    log(`feed persistence refused oversized item ${oversizedFeedItem.event_id}; exact scored payload remains queued`)
  }
  // This result is the authoritative commit boundary. Cap refusal and I/O failure are different operator
  // states, but both make the unwritten suffix retryable work — never reported progress.
  const feedAppend = exactFeedJournalOk && !feedPreflightFailed && !oversizedFeedItem
    ? appendFeedItems(repoRoot, date, feedItems, cfg.feedItemsDailyCap, cfg.feedItemsDailyMaxBytes, { acknowledgedEventIds })
    : { status: 'io_failure' as const, written: 0, unwritten: feedItems.length, appendedEventIds: [] }
  const persistedFeedItems = feedItems.slice(0, feedAppend.written)
  const persistedRows = feedCandidates.slice(0, feedAppend.written)
  const feedUnwrittenRows = feedCandidates.slice(feedAppend.written)
  const feedUnwritten = feedAppend.unwritten
  const feedWriteFailed = feedAppend.status === 'io_failure' || feedPreflightFailed
  const preflightCapKind = feedCapacity.status === 'available'
    ? feedCapacity.remainingBytes <= 0 || byteGuaranteedSlots < unscoredItems.length
      ? 'bytes' as const
      : feedCapacity.remainingItems < pendingNeedingRows + unscoredItems.length
        ? 'items' as const
        : undefined
    : undefined
  const feedCapKind = feedAppend.status === 'cap' ? feedAppend.cap : preflightCapKind
  const newlyAppendedIds = new Set(feedAppend.appendedEventIds)
  const newlyAppendedFeedItems = persistedFeedItems.filter((item) => newlyAppendedIds.has(item.event_id))
  const newlyAppendedRows = persistedRows.filter((item) => newlyAppendedIds.has(item.event_id))
  // Only a row appended by THIS cycle is new durable progress. A crash/final-cleanup failure can leave an
  // already-fsynced event in the pending journal; acknowledging it on the next look clears recovery state,
  // but counting or replaying it again would overstate scanning and could falsely show headroom over inflow.
  const picked = newlyAppendedRows.filter((t) => t.band === 'pick').length
  const watched = newlyAppendedRows.filter((t) => t.band === 'watch').length
  const dropped = newlyAppendedRows.filter((t) => t.band === 'drop').length
  const inboxFeedPending = feedUnwrittenRows.filter((t) => t.band !== 'drop').length
  if (newlyAppendedFeedItems.length) invalidateFacets() // a fresh cycle changed the archive — drop the facet index so new items/countries show up before the TTL
  // Historical acknowledgement completes recovery bookkeeping but must not replay a stale live event.
  for (const fi of newlyAppendedFeedItems) newsBus.emit({ type: 'news-item', item: fi })
  if (feedAppend.status === 'cap') {
    log(`feed persistence cap: ${feedUnwritten} scored item${feedUnwritten === 1 ? '' : 's'} remain queued and unseen`)
  } else if (feedWriteFailed) {
    log(`feed persistence write failed: ${feedUnwritten} scored item${feedUnwritten === 1 ? '' : 's'} remain queued and unseen`)
  }
  // A kept row now has a durable inbox projection; a dropped row has its durable firehose audit record.
  // Only now may the optimization cache suppress a future source delivery. If any write above throws, the
  // safety backlog remains and the item is neither seen nor silently lost.
  for (const t of persistedRows) seen.add(t.event_id, t.materiality_pre_score)
  const seenPersisted = seen.save()
  // Optional neural index. It runs only when explicitly configured, only over newly persisted items, and
  // is fully fail-open: provider trouble can never block the wire or turn an item into a false non-match.
  // Derived sinks are idempotent recovery work. Include historical acknowledgements so a crash after the
  // feed fsync but before indexing/Themes is repaired on the next look; only counters/SSE stay new-only.
  if (persistedFeedItems.length && cfg.retrievalEmbeddingEnabled) {
    try {
      const indexed = await updateSemanticIndex({
        stateDir,
        items: persistedFeedItems,
        fetchFn,
        config: {
          enabled: cfg.retrievalEmbeddingEnabled,
          apiKey: cfg.retrievalEmbeddingApiKey,
          baseUrl: cfg.retrievalEmbeddingBaseUrl,
          model: cfg.retrievalEmbeddingModel,
          timeoutMs: cfg.retrievalEmbeddingTimeoutMs,
          batchSize: cfg.retrievalEmbeddingBatchSize,
          maxItemsPerCycle: cfg.retrievalEmbeddingMaxItemsPerCycle,
        },
      })
      if (indexed.indexed) log(`semantic index: added ${indexed.indexed} event${indexed.indexed === 1 ? '' : 's'}`)
      if (indexed.status === 'provider_error') log(`semantic index: ${indexed.note || 'provider error'} — hybrid search remains active`)
    } catch (e: any) {
      log(`semantic index error: ${e?.message || e} — hybrid search remains active`)
    }
  }

  // Themes is also a derived sink. Keep the exact recovery journal until semantic assignment and Themes have
  // both had their chance: a crash after feed fsync but before either stage must replay the acknowledged row.
  // Membership assignment is idempotent; token-DF accounting receives new-only rows separately.
  await runThemesStage({
    cfg, repoRoot, stateDir, picks: persistedRows.filter((t) => t.band !== 'drop'),
    dfPicks: newlyAppendedRows.filter((t) => t.band !== 'drop'),
    fetchFn, now, log, signal: deps.signal, revisionClocksByEvent,
  })

  // Final cleanup is deliberately AFTER all derived sinks. Shrink the exact recovery journal only when the
  // firehose is durable and those idempotent recovery stages have been attempted.
  const retryState: NonNullable<NewsItem['feed_pending']> = feedAppend.status === 'cap' ? 'cap' : 'io_failure'
  const retryRows = [
    // Keep a durable exact acknowledgement receipt until the dedup cache is also durable. Otherwise a
    // source redelivery after rollover could pay for and append the same event again.
    ...(!seenPersisted
      ? persistedRows.map((t) => ({ ...t, feed_pending: 'uncommitted' as const }))
      : []),
    ...picks.filter((t) => withheldEventIds.has(t.event_id)).map((t) => ({ ...t, feed_pending: 'uncommitted' as const })),
    ...feedUnwrittenRows.map((t) => ({ ...t, feed_pending: retryState })),
    ...deferred,
  ]
  const stampedRetryRows = stampDeferred(retryRows, ts)
  deferredPersisted = persistDeferred(stateDir, stampedRetryRows, log)
  // A false writer result can still leave its atomic pending journal complete. Inspect both authorities and
  // prove that every row expected in the active window is retryable before escalating to an emergency.
  const retrySnapshot = inspectDeferredBacklog(stateDir)
  const retryById = new Map(retrySnapshot.items.map((item) => [item.event_id, item]))
  const requiredRetryRows = [
    ...stampedRetryRows.filter((item) => !!item.feed_pending),
    ...stampedRetryRows.filter((item) => !item.feed_pending),
  ].slice(0, DEFERRED_CAP)
  const retryJournalDurable = retrySnapshot.available && requiredRetryRows.every((expected) => {
    const actual = retryById.get(expected.event_id)
    if (!actual) return false
    if (expected.feed_pending && !actual.feed_pending) return false
    if (exactFeedJournalOk && expected.pending_feed_item
      && JSON.stringify(actual.pending_feed_item) !== JSON.stringify(expected.pending_feed_item)) return false
    return true
  })
  // An unreadable final authority is itself an emergency, even when this active prefix produced no retry
  // rows. Durable raw overflow can still hold a suffix that this cycle did not admit, so treating an EIO as
  // an exact empty snapshot would publish a false `backlog: 0` while work remains on disk.
  const retrySnapshotUnavailable = !retrySnapshot.available
  const storageEmergency = retrySnapshotUnavailable
    || (requiredRetryRows.length > 0 && !retryJournalDurable)
  const knownRetryIds = new Set([
    ...overflowInput.map((item) => item.event_id),
    ...stampedRetryRows.map((item) => item.event_id),
  ])
  const authoritativeBacklogCount = retrySnapshot.available
    ? retrySnapshot.items.length
    : knownRetryIds.size
  // The raw input journal already excludes this cycle's expired rows. Any later successful scored/exact/final
  // journal is also sufficient; do not undercount retirement merely because final cleanup failed.
  const expiredRemoved = retirementPersisted || backlogDurablyCleared(
    inputJournalOk || deferredJournalOk || exactFeedJournalOk,
    deferredPersisted,
  )

  const overflowReq = overflow.reduce((s, o) => s + o.requests, 0)
  const overflowTok = overflow.reduce((s, o) => s + o.tokens, 0)
  const overflowLog = overflow.filter((o) => o.requests).map((o) => ` · ${o.p.id} ${o.requests} req / ${o.tokens} tok`).join('')

  // The Haiku last-resort tier's state at cycle end — the piece that was invisible when "Groq in failure
  // cooldown" printed with no hint the paid fallback had ALSO tapped out (the reported surprise). `usd-cap`
  // is checked before `scored` on purpose: a tier that scored a few batches and THEN hit its ceiling is
  // exactly why the rest still deferred, so the ceiling is the honest reason to show.
  // Only the plan's OWN quota being spent is 'plan-quota' (the subscription CLI canonicalises a 429 to
  // "usage limit reached — plan quota spent", claude-cli.ts). A transient per-minute rate-limit or an
  // api-mode billing/credit error is NOT the shared plan resetting — those fall through to 'cooling', so we
  // don't tell the operator to "wait for the plan to reset" when there is no plan quota to reset.
  const planQuotaHit = isPlanQuotaNote(anthropicFailNote)
  // An expired sign-in is named from this cycle's own failure note when there IS one, and otherwise from the
  // reason carried on the cooldown marker — so every cycle after the first keeps telling the operator the real
  // cause (and the one-line fix) instead of degrading to a nameless "backing off after an error". The live
  // note takes precedence deliberately: once the tier probes again and fails a DIFFERENT way (a timeout, say),
  // that new cause is the honest one to show, not the stale reason left on the marker by the previous failure.
  // Gated to subscription mode, matching the armCooldown call above: in api mode a 401 is a bad/revoked key
  // (terminal, §2 above), never a recoverable sign-in, so it must never read as 'auth-expired' here either.
  // (The cooldown-marker branch is already safe by construction — the marker can only carry the 'auth-expired'
  // reason if the gated armCooldown call above set it — but the note-present branch checks the raw note text
  // independent of mode and needs its own gate.)
  const authExpiredHit = anthropicFailNote
    ? (cfg.anthropicFallbackMode === 'subscription' && isAuthExpiredNote(anthropicFailNote))
    : anthropicCooldownReason === 'auth-expired'
  const lastResort: CycleSummary['last_resort'] = !anthropicOn
    ? 'off'
    : anthropicLedgerUnavailable()
      ? 'unavailable'
      : triageIsHeld(stateDir, 'anthropic-triage', now().getTime()) || anthropicDownThisCycle
        ? (planQuotaHit ? 'plan-quota' : authExpiredHit ? 'auth-expired' : 'cooling')
        : anthropicBudgetBlocked || !anthropicBudget?.canSpend()
          ? 'usd-cap'
          : anthropicRequests > 0
            ? 'scored'
            : 'available'
  const scoringDeferredCount = Math.max(0, deferred.length - capacityDeferred.length)
  // When items deferred, name the LAST-RESORT tier's state too, so a defer note can't read as if Groq were
  // the only blocker. Added only when the tier genuinely could NOT absorb the spillover (never for
  // 'scored'/'available', which weren't the reason anything deferred).
  const lastResortClause = !scoringDeferredCount
    ? ''
    : lastResort === 'off'
      ? ' · Haiku last-resort is off'
      : lastResort === 'unavailable'
        ? ' · Haiku last-resort usage record needs attention'
        : lastResort === 'usd-cap'
          ? ` · Haiku last-resort at its $${cfg.anthropicDailyUsd}/day ceiling`
          : lastResort === 'plan-quota'
            ? ' · Haiku last-resort paused — Claude plan quota spent, waiting for it to reset'
            : lastResort === 'auth-expired'
              ? " · Haiku last-resort paused — the engine's Claude sign-in has expired; run `claude auth login` on the engine host and it resumes on the next look"
              : lastResort === 'cooling'
                ? ' · Haiku last-resort backing off after an error'
                : ''

  const scoringDefPlural = scoringDeferredCount === 1 ? '' : 's'
  // The durable backlog also owns rows that WERE scored but did not cross a persistence boundary. Include
  // inbox-withheld and feed-unwritten work in the true queue-depth arithmetic; reporting only
  // the unscored provider tail would make the gauge smaller than the file we just wrote.
  const defCount = authoritativeBacklogCount
  const baseNote = aborted && scoringDeferredCount
    ? `cycle hit its time guard — ${scoringDeferredCount} item${scoringDefPlural} dumped to the backlog for the next look${lastResortClause}`
    : usageLedgerUnavailable && scoringDeferredCount
      ? `one or more provider usage records need attention — ${scoringDeferredCount} item${scoringDefPlural} deferred; no allowance or quota exhaustion is claimed${lastResortClause}`
      : providerDayLimitHit && scoringDeferredCount
        ? `one or more free providers reported their day limit and no other scoring tier could fit — ${scoringDeferredCount} item${scoringDefPlural} deferred until provider-day reset${lastResortClause}`
        : budgetHit && scoringDeferredCount
          ? `configured free-tier engine allowances cannot fit another safe batch — ${scoringDeferredCount} item${scoringDefPlural} deferred until their provider-day reset${lastResortClause}`
          : providerRetryHeld && scoringDeferredCount
            ? `provider retries held after errors — ${scoringDeferredCount} item${scoringDefPlural} deferred until the next eligible retry window${lastResortClause}`
            : paceHit && scoringDeferredCount
              ? `engine allowances paced for the day — ${scoringDeferredCount} item${scoringDefPlural} held for the next drain so every usable tier lasts to its reset${lastResortClause}`
              : batchFailed && scoringDeferredCount
                ? `${scoringDeferredCount} item${scoringDefPlural} not scored (LLM hiccup) — deferred to next cycle${lastResortClause}`
                : undefined
  // Work beyond the hot window remains in durable overflow, so reaching DEFERRED_CAP adds no loss clause.
  const capNote = baseNote
  // Same honesty for the age boundary: a retired item was never scored and never will be. Its exact payload
  // remains recoverable in SQLite, but the missed scoring target is still reported even on
  // a cycle that deferred nothing, because that is exactly the cycle whose note would otherwise read clean.
  // Count retirement ONLY once a backlog write durably removed the expired rows — `expiredRemoved`, which is
  // true when EITHER the pre-projection journal write OR the final cleanup write succeeded (both write the
  // same expired-excluding tail, so either one durably replaces the on-disk file). If BOTH fail, the last-good
  // file predates this cycle's expiry and still holds the expired rows — they'll be re-loaded, re-expired and
  // re-counted next cycle, so reporting them RETIRED now would double-count the same loss until the disk
  // recovers. SQLite retirement now satisfies this gate itself; the file-write checks remain for rolling
  // compatibility. (Codex #453 — ordinary-cycle
  // summary, and its partial-success follow-up: a lone failed cleanup write must not undo a successful journal write.)
  const coreNote = backlogExpired.length > 0 && expiredRemoved
    ? `${capNote ? `${capNote} · ` : ''}${backlogExpired.length} backlog item${backlogExpired.length === 1 ? '' : 's'} RETIRED unscored — waited longer than ${Math.round(DEFERRED_MAX_AGE_MS / 3_600_000)}h behind the queue`
    : capNote
  // Surface a down PRIMARY brain even when the fallback coped and nothing deferred: the operator wants to know the
  // local box is asleep/unreachable, because the scan is then spending capped cloud/paid budget and risks a ceiling.
  const localDownNote = localOn && localDownThisCycle
    ? 'LOCAL primary brain unreachable this look — running on the capped cloud fallback; check the box'
    : ''
  // The 2026-08-17 blackout was invisible because a refused projection and a genuinely quiet scan both
  // render as `0 kept`. Say which one this is, in words an operator can act on.
  const inboxNote = withheldEventIds.size
    ? `held back ${withheldEventIds.size} item${withheldEventIds.size === 1 ? '' : 's'} — first-seen clock not proved${inboxWriteFailed ? ' (inbox write refused)' : ''}; they stay queued and retry next look`
    : ''
  const pendingRecoveryHeld = capacityDeferred.length > 0 && pendingNeedingRows > 0
  const noScoringProviderHeld = capacityDeferred.length > 0 && !hasScoringProvider
  // Describe THIS look's boundary. A prior marker explains why recovery exists, but once today's append
  // succeeds it must not keep claiming that storage is unavailable or today's cap is full.
  const feedIoReason = feedWriteFailed
  const feedCapReason = feedAppend.status === 'cap'
    || !!preflightCapKind
  const heldUnscored = capacityDeferred.length
  const feedNote = feedIoReason
    ? `feed persistence unavailable — ${feedUnwritten} scored and ${heldUnscored} unscored item${feedUnwritten + heldUnscored === 1 ? '' : 's'} stayed queued; no unproved rows count as complete`
    : feedCapReason
      ? `feed shard ${feedCapKind || 'item'} limit could not accept work — ${feedUnwritten} scored and ${heldUnscored} unscored item${feedUnwritten + heldUnscored === 1 ? '' : 's'} stayed queued; provider calls stop at known capacity`
      : pendingRecoveryHeld
        ? `feed recovery drained first — ${heldUnscored} unscored item${heldUnscored === 1 ? '' : 's'} stayed queued without a provider call`
        : ''
  const storageNote = retrySnapshotUnavailable
    ? `STORAGE EMERGENCY — final retry authority could not be read; backlog depth is unavailable${authoritativeBacklogCount ? ` (known lower bound: ${authoritativeBacklogCount})` : ''}`
    : storageEmergency
    ? 'STORAGE EMERGENCY — no durable backlog or write-ahead journal contains every retry row expected in the active work window'
    : ''
  const checkpointNote = scoredCheckpointWriteFailed
    ? 'scored-batch checkpoint was refused — further provider calls stopped and remaining raw work stayed queued'
    : ''
  const seenNote = !seenPersisted
    ? `${persistedRows.length} completed item${persistedRows.length === 1 ? '' : 's'} remain in recovery until the durable dedup receipt can be saved`
    : ''
  const noProviderNote = noScoringProviderHeld
    ? `no scoring provider configured — ${capacityDeferred.length} unscored item${capacityDeferred.length === 1 ? '' : 's'} remain durably queued`
    : ''
  const note = [storageNote, checkpointNote, seenNote, localDownNote, inboxNote, feedNote, noProviderNote, coreNote].filter(Boolean).join(' · ') || undefined
  const providerDeferReason: CycleSummary['defer_reason'] = !scoringDeferredCount
    ? undefined
    : aborted
      ? 'aborted'
      : usageLedgerUnavailable
        ? 'usage-ledger-unavailable'
        : providerDayLimitHit
          ? 'provider-day-limit'
          : budgetHit
            ? 'free-budget-spent'
            : providerRetryHeld
              ? 'provider-retry-held'
              : paceHit
                ? 'allowance-paced'
                : batchFailed
                  ? 'batch-failed'
                  : undefined
  // Complete ordered cause set. The first entry remains the legacy primary for rolling-deploy clients.
  const deferReasons = ([
    ...(storageEmergency ? ['storage-emergency' as const] : []),
    ...(feedIoReason ? ['feed-write-failed' as const] : []),
    ...(feedCapReason ? ['feed-cap' as const] : []),
    ...(withheldEventIds.size ? ['inbox-withheld' as const] : []),
    ...(noScoringProviderHeld ? ['no-scoring-provider' as const] : []),
    ...(providerDeferReason ? [providerDeferReason] : []),
  ] as NonNullable<CycleSummary['defer_reasons']>).filter((reason, index, all) => all.indexOf(reason) === index)
  const deferReason = deferReasons[0]

  const summary: CycleSummary = {
    ts, completed_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    ok: true, fetched: raws.length, candidates: items.length,
    picked, watched, dropped, inboxed, groq_requests: groqRequests, groq_tokens: groqTokens,
    // end-to-end transparency: split the read balloon (fresh vs re-queued backlog), and always carry the
    // backlog depth + active work-window size + the fallback's state so the cockpit never has to infer them.
    fresh: freshLive.length, new_arrivals: newArrivals, carryover: requeued.length,
    ...(defCount ? { deferred: defCount } : {}),
    // If cleanup was refused, the pre-append exact journal can legitimately still contain completed recovery
    // rows. Report the readable on-disk authority, not the smaller intended cleanup list.
    // When the final read fails, this is only the rows still known from the untouched overflow suffix and
    // intended active retry set. Omit an unproved zero entirely; deferred_read_failed is the unavailable bit.
    ...(retrySnapshot.available || authoritativeBacklogCount > 0 ? { backlog: authoritativeBacklogCount } : {}),
    backlog_cap: DEFERRED_CAP,
    ...(backlogExpired.length && expiredRemoved ? { backlog_expired: backlogExpired.length } : {}),
    ...(feedUnwritten ? { feed_unwritten: feedUnwritten } : {}),
    ...(feedWriteFailed ? { feed_write_failed: true } : {}),
    ...(feedCapKind && feedCapReason ? { feed_cap_kind: feedCapKind } : {}),
    ...(inboxFeedPending ? { inbox_feed_pending: inboxFeedPending } : {}),
    ...(deferredPersisted && !scoredCheckpointWriteFailed ? {} : { deferred_write_failed: true }),
    ...(retrySnapshotUnavailable ? { deferred_read_failed: true } : {}),
    ...(!seenPersisted ? { seen_write_failed: true } : {}),
    ...(withheldEventIds.size ? { inbox_withheld: withheldEventIds.size } : {}),
    ...(inboxWriteFailed ? { inbox_write_failed: true } : {}),
    ...(aborted ? { aborted: true } : {}),
    ...(deferReason ? { defer_reason: deferReason } : {}),
    ...(deferReasons.length ? { defer_reasons: deferReasons } : {}),
    last_resort: lastResort,
    ...(localRequests ? { local_requests: localRequests, local_tokens: localTokens } : {}),
    ...(localOn && localDownThisCycle ? { local_down: true } : {}),
    ...(geminiRequests ? { gemini_requests: geminiRequests, gemini_tokens: geminiTokens } : {}),
    ...(overflowReq ? { overflow_requests: overflowReq, overflow_tokens: overflowTok } : {}),
    ...(anthropicRequests ? { anthropic_requests: anthropicRequests, anthropic_tokens: anthropicTokens, anthropic_cost_usd: Math.round(anthropicCostUsd * 10_000) / 10_000 } : {}),
    ...(Object.keys(providerAttempts).length ? { provider_attempts: providerAttempts } : {}),
    ...(Object.keys(providerScoredBatches).length ? { provider_scored_batches: providerScoredBatches } : {}),
    ...(sources ? { sources } : {}),
    phase,
    note,
  }
  if (routingTelemetryWritable) {
    routingTelemetryWritable = recordProviderSnapshot(repoRoot, {
      kind: 'provider_snapshot', ts: summary.completed_at || ts, cycleId: routingCycleId, phase: 'cycle-complete',
      providers: latestRoutingEvaluation ? latestRoutingEvaluation.candidates.map((candidate) => ({
        id: candidate.id,
        state: candidate.eligibilityReason === 'cooldown' || candidate.eligibilityReason === 'credential-rejected'
          ? 'cooling'
          : candidate.eligibilityReason === 'ledger-unavailable'
            ? 'unavailable'
            : candidate.eligibilityReason === 'hard-cap' || candidate.eligibilityReason === 'provider-day-exhausted'
              ? 'budget-spent'
              : candidate.eligibilityReason === 'paced'
                ? 'paced'
                : 'healthy',
        eligible: candidate.eligible,
        reason: candidate.eligibilityReason,
        consecutiveFailures: candidate.consecutiveFailures,
        ...auditAllowanceFor(candidate.id),
      })) : startProviderSnapshots.map((provider) => ({ ...provider, ...auditAllowanceFor(provider.id) })),
    })
  }
  publishCycleSummary(summary)
  log(`news cycle: fetched ${raws.length}, ${items.length} new, picked ${picked}, watched ${watched}, dropped ${dropped}; ${localRequests ? `local ${localRequests} req / ${localTokens} tok · ` : ''}groq ${groqRequests} req / ${groqTokens} tok${geminiRequests ? ` · gemini ${geminiRequests} req / ${geminiTokens} tok` : ''}${overflowLog}${anthropicRequests ? ` · haiku ${anthropicRequests} req / $${anthropicCostUsd.toFixed(3)}` : ''}`)

  return summary
}
