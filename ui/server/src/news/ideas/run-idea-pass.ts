// The orchestrator: read the top-N -> first eligible provider in the existing free chain -> persist the
// ideas -> refresh the board. It runs after triage so it reads the freshest ranked wire, but can flow around
// a spent/busy tier instead of going dark behind it. Two cheap guards keep it from starving core triage:
//   - CHANGE DETECTION: it only spends when the top-N event set actually shifts (a hash), or once every
//     `refreshSec` as a heartbeat — a per-cycle call (288×/day) would blow the 500k token budget alone.
//   - INTERVAL FLOOR: never more often than `minIntervalSec`, so even a churny wire can't hammer it.
// It reuses every tier's exact budget file, limiter, and provider cooldown — never a parallel budget lane
// (the :8799 double-count lesson). Ideas-contract errors use an idea-scoped cooldown so they cannot sideline
// healthy core triage. The whole provider walk is deadline-bounded below stale-running detection. Never throws.

import { Budget, NON_BINDING_DAILY_TOKEN_CAP, armCooldown, clearCooldown, conservativeChatTokenBound, getNamedLimiter, getSharedLimiter, isCoolingDown } from '../triage/budget'
import {
  IDEA_SYSTEM, buildIdeaUserMessage, estimateIdeaTokens, surfaceIdeasBatch,
  type IdeaInputRow, type IdeaOriginType, type IdeaSourceTheme, type IdeaThemeExpression, type RawIdea, type SurfaceIdeasResult,
} from './surface-ideas'
import {
  ideaDecayAt, ideaId, ideaSnapshotRevision, ideaVersion, priorCoverage, pruneExpiredIdeas, readIdeaById,
  readIdeaSnapshots, readPassState, readTopSweep, retireUnadmittedThemeIdeas, topNEffectHash, topNHash,
  writeIdeaIfRevision, writePassState,
  type SurfacedIdea,
} from './ideas-store'
import { IDEA_LEARNING_HORIZON_DAYS, learnIdeaAdjustment } from './idea-learning'
import { directionMatchesEvidence, scoreTradeCluster, TRADE_SCORE_POLICY_VERSION, type TradeEvidence } from '../trade-score'
import { baseTicker, coreCompanyName, normTicker, verifyEquityListing, type VerifiedEquityListing } from '../symbology'
import { normName } from '../text-match'
import { eventIdFor } from '../normalize'
import {
  inspectIdeaSnapshots, inspectPersistedIdeasHealth, updateIdeasHealth, type IdeasHealthReasonCode,
} from './ideas-health'
import type { OverflowProvider } from '../../config'

export interface IdeaPassConfig {
  topN: number
  shelfLifeHrs: number
  inputMaxAgeHrs?: number
  /** Direct Themes → Ideas bridge gate; omitted remains enabled for deploy-compatible callers. */
  themesEnabled?: boolean
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

type EvidenceDirection = 'long' | 'short' | 'mixed' | 'unknown'

/** Bind event sentiment to a proposed single-name position only when the server row names exactly that
 * independently verified primary issuer. The triage label describes the event as a whole; it is not the
 * sign of every supplier, customer, rival, or pair expression the PM may select. Ambiguous/secondary
 * mappings therefore remain informational instead of falsely vetoing a valid beneficiary or harmed name. */
export function directionBoundToVerifiedListing(
  rows: IdeaInputRow[],
  listing: VerifiedEquityListing | null,
): EvidenceDirection {
  if (!listing) return 'unknown'
  const ticker = normTicker(listing.ticker)
  const tickerBase = baseTicker(ticker)
  // Keep identity-bearing words such as Group and Holdings. coreCompanyName removes only legal forms,
  // so "Acme Corp" can match "Acme Corporation" without collapsing distinct issuers such as
  // "Man Holdings" and "Man Group plc" onto the same generic stem.
  const company = coreCompanyName(listing.companyName)
  if (!ticker || !company) return 'unknown'
  const boundRows = rows.filter((row) => {
    if ((row.origin_type || 'wire') !== 'wire' || row.issuer_linkage !== 'primary') return false
    const named = (row.companies || []).filter((candidate) => {
      const candidateTicker = normTicker(candidate.ticker)
      // An exact verified symbol is the stronger identity key and must not be defeated by harmless display-
      // name differences ("Amazon" vs "Amazon.com Inc"). Triage may also carry the listing-agnostic base
      // (NHY) while the independently verified directory returns its suffixed venue symbol (NHY.OL). Bind
      // that one-way alias only when the verified symbol really has a known exchange suffix, the base is not
      // degenerate, and the exact issuer core agrees. Never equate two suffixed venues or a same-base issuer
      // with a different name. If triage honestly leaves ticker null, exact issuer-core identity may bind.
      if (!candidateTicker) return coreCompanyName(candidate.name) === company
      if (candidateTicker === ticker) return true
      return tickerBase !== ticker && tickerBase.length >= 2 && candidateTicker === tickerBase &&
        coreCompanyName(candidate.name) === company
    })
    // Multiple named issuers make an event-level sign ambiguous even if one happens to match the trade.
    return row.companies.length === 1 && named.length === 1
  })
  const directions = new Set(boundRows
    .map((row) => row.event_direction)
    .filter((direction) => direction && direction !== 'neutral' && direction !== 'unknown'))
  if (directions.size !== 1) return directions.size ? 'mixed' : 'unknown'
  const direction = [...directions][0]
  return direction === 'positive' ? 'long' : direction === 'negative' ? 'short' : 'mixed'
}

/** Self-trade detection requires either the exact normalized listing or an independently returned issuer
 * identity on both legs. A shared base symbol across venues is deliberately absent: venues reuse symbols
 * for unrelated companies, so baseTicker equality is not evidence of a cross-listing alias. */
export function verifiedListingsIdentifySameIssuer(
  primary: VerifiedEquityListing,
  pair: VerifiedEquityListing,
): boolean {
  if (normTicker(primary.ticker) === normTicker(pair.ticker)) return true
  const primaryCompany = coreCompanyName(primary.companyName)
  const pairCompany = coreCompanyName(pair.companyName)
  return Boolean(primaryCompany && pairCompany && primaryCompany === pairCompany)
}

/** Derive provenance only after the model has selected raw source indices. Theme rows elsewhere in the
 * batch cannot leak into the saved idea, and provider-authored JSON has no lineage field to trust. */
type ThemeProofMap = Map<string, Set<string>>
const themeProofKey = (themeId: string, themeRev: number) => `${themeId}@${themeRev}`
export interface ThemeIdeaProof {
  evidenceByTheme: ThemeProofMap
  /** Exact server-qualified harmed expression name used to verify a pair's second listing. Null for
   * non-pairs and wire-only pairs, whose second leg uses an exact ticker-only directory lookup. */
  pairCompanyName: string | null
}

/** Enforce the server-authored Theme contract after resolving provider `src` indices. Proof lives at the
 * selected revision/set level: one row may be the fresh why-now trigger while an older row is the exact
 * company-expression proof. Requiring every row to carry the expression rejected that legitimate 13D-style
 * evidence stack; requiring both edges across the selected set keeps it fail-closed. */
export function themeProofForIdea(raw: RawIdea, rows: IdeaInputRow[]): ThemeIdeaProof | null {
  const themeRows = rows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed')
  if (!themeRows.length) return { evidenceByTheme: new Map(), pairCompanyName: null }
  const companyKey = normName(raw.company)
  const primaryTicker = normTicker(raw.ticker)
  const primarySide = raw.direction === 'short' ? 'harmed' : 'beneficiary'
  const pairTicker = raw.direction === 'pair' ? normTicker(raw.pair_with) : ''
  if (!companyKey || !primaryTicker || (raw.direction === 'pair' && (!pairTicker || pairTicker === primaryTicker))) return null

  const revisionsByTheme = new Map<string, number>()
  const groups = new Map<string, { theme: IdeaSourceTheme; rows: IdeaInputRow[] }>()
  for (const row of themeRows) {
    if (!row.source_themes?.length || !row.theme_contexts?.length) return null
    for (const theme of row.source_themes) {
      const priorRevision = revisionsByTheme.get(theme.theme_id)
      if (priorRevision !== undefined && priorRevision !== theme.theme_rev) return null
      revisionsByTheme.set(theme.theme_id, theme.theme_rev)
      const key = themeProofKey(theme.theme_id, theme.theme_rev)
      let group = groups.get(key)
      if (!group) {
        group = { theme, rows: [] }
        groups.set(key, group)
      } else if (!group.theme.why_now_event_id || !theme.why_now_event_id
        || group.theme.why_now_event_id !== theme.why_now_event_id) return null
      const contexts = row.theme_contexts.filter((context) => (
        context.theme_id === theme.theme_id && context.theme_rev === theme.theme_rev
        && context.why_now_event_id === theme.why_now_event_id
      ))
      if (contexts.length !== 1 || !(theme.evidence_event_ids || []).includes(row.event_id)) return null
      group.rows.push(row)
    }
  }

  const proofs: ThemeProofMap = new Map()
  const coveredRows = new Set<IdeaInputRow>()
  let pairCompanyKey = ''
  let pairCompanyName: string | null = null
  for (const [key, group] of groups) {
    const whyNowId = group.theme.why_now_event_id
    const whyRows = group.rows.filter((row) => row.event_id === whyNowId
      && row.theme_contexts?.some((context) => context.theme_id === group.theme.theme_id
        && context.theme_rev === group.theme.theme_rev && context.role === 'WHY_NOW'))
    const proofRows = group.rows.filter((row) => row.event_id !== whyNowId
      && row.theme_contexts?.some((context) => context.theme_id === group.theme.theme_id
        && context.theme_rev === group.theme.theme_rev && context.role === 'EXPRESSION_PROOF'))
    // A coalesced event can be WHY_NOW for several actionable Themes. Selecting that shared row plus
    // Theme A's issuer proof must not make Theme B's absent proof mandatory. Treat each revision as an
    // independent package and admit only complete packages that bind the returned issuer/side.
    if (!whyNowId || whyRows.length !== 1 || !proofRows.length) continue
    const primaryMatch = proofRows.flatMap((row) => (row.theme_expressions || []).map((expression) => ({ row, expression })))
      .find(({ row, expression }) => (
        expression.theme_id === group.theme.theme_id
        && expression.theme_rev === group.theme.theme_rev
        && expression.side === primarySide
        && normTicker(expression.ticker) === primaryTicker
        && expression.name_key === companyKey
        && expression.evidence_event_ids.includes(row.event_id)
      ))
    if (!primaryMatch) continue
    const eventIds = new Set([whyNowId, primaryMatch.row.event_id])
    let pairMatch: { row: IdeaInputRow; expression: IdeaThemeExpression } | undefined
    if (raw.direction === 'pair') {
      pairMatch = proofRows.flatMap((row) => (row.theme_expressions || []).map((expression) => ({ row, expression })))
        .find(({ row, expression }) => (
          expression.theme_id === group.theme.theme_id
          && expression.theme_rev === group.theme.theme_rev
          && expression.side === 'harmed'
          && normTicker(expression.ticker) === pairTicker
          && expression.evidence_event_ids.includes(row.event_id)
        ))
      if (!pairMatch) continue
      const pair = pairMatch.expression
      const matchedPairKey = pair.name_key || normName(pair.name)
      if (!matchedPairKey || (pairCompanyKey && pairCompanyKey !== matchedPairKey)) return null
      if (!pairCompanyKey) { pairCompanyKey = matchedPairKey; pairCompanyName = pair.name }
      eventIds.add(pairMatch.row.event_id)
    }
    proofs.set(key, eventIds)
    coveredRows.add(whyRows[0])
    coveredRows.add(primaryMatch.row)
    if (pairMatch) coveredRows.add(pairMatch.row)
  }
  // Every selected Theme-bearing row must belong to at least one complete package that actually proves
  // this idea. This keeps a shared WHY_NOW row package-separable while still failing closed on a selected
  // expression-only row, a lone trigger, or an unrelated/partial second package.
  if (!proofs.size || themeRows.some((row) => !coveredRows.has(row))) return null
  return { evidenceByTheme: proofs, pairCompanyName }
}

export function ideaLineageForRows(
  rows: IdeaInputRow[],
  expressionProofs?: ThemeProofMap,
): { origin_type: IdeaOriginType; source_themes: IdeaSourceTheme[] } | null {
  const restrictToProvenPackages = expressionProofs !== undefined
  let sawWire = false
  let sawTheme = false
  const sourceThemes: IdeaSourceTheme[] = []
  for (const row of rows) {
    const origin = row.origin_type || 'wire'
    if (origin === 'wire' || origin === 'mixed') sawWire = true
    if (!restrictToProvenPackages && (origin === 'theme' || origin === 'mixed')) sawTheme = true
    for (const theme of row.source_themes || []) {
      const key = themeProofKey(theme.theme_id, theme.theme_rev)
      const provenEvidence = expressionProofs?.get(key)
      // A shared row may carry contexts for multiple packages. Persistence must retain only the packages
      // that passed the exact issuer/side proof above; otherwise an incidental Theme becomes a mandatory
      // lineage edge and can later retire an otherwise valid idea.
      if (restrictToProvenPackages && !provenEvidence) continue
      sawTheme = true
      if (!theme.why_now_event_id) return null
      const evidenceIds = restrictToProvenPackages
        ? [...provenEvidence!]
        : (theme.evidence_event_ids?.length ? theme.evidence_event_ids : [row.event_id])
      const existing = sourceThemes.find((candidate) => candidate.theme_id === theme.theme_id)
      if (existing) {
        if (existing.theme_rev !== theme.theme_rev || existing.why_now_event_id !== theme.why_now_event_id) return null
        const merged = new Set(existing.evidence_event_ids || [])
        for (const eventId of evidenceIds) merged.add(eventId)
        existing.evidence_event_ids = [...merged]
      } else if (sourceThemes.length < 64) {
        sourceThemes.push({
          theme_id: theme.theme_id,
          theme_rev: theme.theme_rev,
          evidence_event_ids: [...new Set(evidenceIds)],
          why_now_event_id: theme.why_now_event_id,
        })
      }
    }
  }
  if (restrictToProvenPackages && rows.some((row) => row.origin_type === 'theme' || row.origin_type === 'mixed')
    && !sourceThemes.length) return null
  if (sawTheme && sourceThemes.some((theme) => !theme.why_now_event_id
    || !theme.evidence_event_ids?.includes(theme.why_now_event_id))) return null
  return {
    origin_type: sawTheme ? (sawWire ? 'mixed' : 'theme') : 'wire',
    source_themes: sourceThemes,
  }
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
  const budget = Budget.load(deps.stateDir, p.dailyReqCap, p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, now(), p.budgetFile, p.dayTz)
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
  } catch (e: any) {
    // surfaceIdeasBatch is fail-soft by contract, but keep the orchestration boundary fail-soft too. If a
    // future adapter regression escapes unexpectedly, charge one conservative attempt and isolate the bug
    // to Ideas instead of crashing the scheduler or pretending the shared provider is unavailable.
    r = {
      ideas: [], requests: 1, tokens: perAttemptTokens, ok: false, failureKind: 'contract',
      note: `idea: unexpected adapter failure: ${e?.message || String(e)}`,
    }
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
      themesEnabled: c.themesEnabled !== false,
    })
    const rows = sweep.rows
    if (sweep.status === 'degraded') {
      const counts = inspectIdeaSnapshots(deps.repoRoot, inputAt)
      const cached = counts.live_count + counts.stale_count > 0
      const reason = 'A recent wire partition is unreadable or has no trustworthy clock; the lead skim is paused rather than ranking an incomplete source set.'
      health({
        enabled: true, status: cached ? 'degraded' : 'error', outcome: 'skipped', reason_code: 'stale_inputs',
        reason, next_eligible_at: null, input_count: rows.length, produced_count: 0,
      }, inputAt)
      return { ran: false, produced: 0, note: reason, reason_code: 'stale_inputs' }
    }
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

    // Reconcile Theme-only snapshots only after the complete input set clears every integrity/freshness
    // guard. An unreadable partition must not make a valid theme appear withdrawn and trigger deletion.
    // Mixed calls retain independent wire support; promoted and in-flight calls remain lifecycle-owned.
    const retired = retireUnadmittedThemeIdeas(deps.repoRoot, rows)
    if (retired > 0) await deps.refreshBoard()

    const hash = topNHash(rows)
    const effectHash = topNEffectHash(rows)
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
    // Prompt spend and persistence effects are separate. A Theme revision/evidence edge can change while
    // the model-visible rows stay byte-identical; that still needs one minimal rerun so saved lineage and
    // version catch up instead of reusing an incoherent cached effect.
    const changed = !prev || prev.hash !== hash || prev.effect_hash !== effectHash
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
    writePassState(deps.stateDir, { hash, effect_hash: effectHash, ran_at_ms: now() })
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
      const srcRows = raw.src.map((i) => rows[i]).filter(Boolean)
      if (!srcRows.length) continue
      // Resolve selected indices first, then bind returned issuer/ticker/direction to every server-qualified
      // Theme expression. Provider JSON cannot mint a constituent. A rejected duplicate stays out of `seen`
      // so a later correctly bound row for the same directional call may still be persisted.
      const expressionProofs = themeProofForIdea(raw, srcRows)
      if (!expressionProofs) continue
      const lineage = ideaLineageForRows(srcRows, expressionProofs.evidenceByTheme)
      if (!lineage) continue
      const eventIds = [...new Set([
        ...srcRows.map((s) => s.event_id),
        ...lineage.source_themes.flatMap((theme) => theme.evidence_event_ids || []),
      ])]
      // Wire-only calls use the highest-materiality selected row. Theme/mixed calls MUST launch from the
      // exact causal row designated by the admitted revision, never from a louder structural proof row.
      const whyNowIds = new Set(lineage.source_themes.map((theme) => theme.why_now_event_id).filter(Boolean))
      if (lineage.origin_type !== 'wire' && whyNowIds.size !== 1) continue
      const primary = lineage.origin_type === 'wire'
        ? srcRows.slice().sort((a, b) => b.materiality - a.materiality)[0]
        : srcRows.find((row) => row.event_id === [...whyNowIds][0]
          && row.theme_contexts?.some((context) => context.role === 'WHY_NOW'))
      if (!primary?.headline_orig || !primary.url || !primary.source_name
        || eventIdFor(primary.headline_orig, primary.url) !== primary.event_id
        || !eventIds.includes(primary.event_id)) continue
      const headlines = [primary, ...srcRows.filter((s) => s !== primary)].map((s) => s.headline).filter(Boolean).slice(0, 4)
      const materialityMax = Math.max(0, ...srcRows.map((s) => s.materiality))
      const newestAt = lineage.origin_type === 'wire'
        ? (srcRows.map((s) => s.found_at).filter(Boolean).sort().reverse()[0] || nowIso)
        : primary.found_at
      const decayIso = ideaDecayAt(newestAt, now(), c.shelfLifeHrs)
      if (!decayIso) continue
      const learning = learnIdeaAdjustment(deps.repoRoot, snapshots, {
        direction: raw.direction, thesisType: raw.thesis_type, horizonDays: IDEA_LEARNING_HORIZON_DAYS,
      })
      const tradeEvidence = tradeEvidenceForIdeaRows(srcRows)
      const verifiedListing = await verifyEquityListing(raw.ticker, raw.company, deps.fetchFn || fetch)
      let verifiedPairListing: Awaited<ReturnType<typeof verifyEquityListing>> = null
      if (raw.direction === 'pair') {
        // A pair asserts that BOTH legs are tradable listed equities. Theme/mixed inputs bind the second
        // lookup to the exact harmed expression name that cleared server qualification. Wire-only inputs
        // have no authoritative second company name, so use the directory's safe exact-ticker path.
        if (!verifiedListing || !raw.pair_with) continue
        const hasThemeInput = srcRows.some((row) => row.origin_type === 'theme' || row.origin_type === 'mixed')
        const pairCompanyName = hasThemeInput ? expressionProofs.pairCompanyName : null
        if (hasThemeInput && !pairCompanyName) continue
        verifiedPairListing = await verifyEquityListing(
          raw.pair_with,
          pairCompanyName || undefined,
          deps.fetchFn || fetch,
        )
        if (!verifiedPairListing || verifiedListingsIdentifySameIssuer(verifiedListing, verifiedPairListing)) continue
      }
      const persistedPairTicker = raw.direction === 'pair' ? verifiedPairListing!.ticker : null
      const version = ideaVersion({
        ticker: verifiedListing?.ticker || raw.ticker,
        direction: raw.direction,
        pairWith: persistedPairTicker,
        thesisType: raw.thesis_type,
        reason: raw.reason,
        whyNow: raw.why_now,
        sourceEventIds: eventIds,
        primarySourceEventId: primary.event_id,
        sourceHeadline: primary.headline_orig,
        sourceUrl: primary.url,
        sourceName: primary.source_name,
        originType: lineage.origin_type,
        sourceThemes: lineage.source_themes,
      })
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
      // A Theme already binds beneficiary/harmed sides through its qualified expression proof. A wire pair
      // necessarily maps two instruments, so one event-level sign cannot describe both legs. For a naked
      // wire call, veto reversal only when the row uniquely names the exact verified primary issuer.
      const boundDirection = lineage.origin_type === 'wire' && raw.direction !== 'pair'
        ? directionBoundToVerifiedListing(srcRows, verifiedListing)
        : 'unknown'
      // A rejected row must not reserve the stable id: a later provider row may bind the issuer correctly.
      if (!directionMatchesEvidence(raw.direction, boundDirection)) continue
      seen.add(id)
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
          pair_with: persistedPairTicker,
          reason: raw.reason,
          why_now: raw.why_now,
          conviction: raw.conviction,
          conviction_basis: 'pre_edge_proxy',
          trade_score: trade.score,
          trade_score_basis: TRADE_SCORE_POLICY_VERSION,
          trade_score_breakdown: trade.breakdown,
          trade_readiness: trade.readiness,
          missing_checks: trade.missingChecks,
          learning,
          priced_in: raw.priced_in,
          thesis_type: raw.thesis_type,
          origin_type: lineage.origin_type,
          source_themes: lineage.source_themes,
          source_event_ids: eventIds,
          primary_source_event_id: primary.event_id,
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
