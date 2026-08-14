// The orchestrator: read every current eligible row, choose the next bounded provider chunk -> local/Groq
// quality path, then the reset-clock-balanced free pool ->
// persist the ideas -> refresh the board. It runs after triage so it reads the freshest ranked wire, but can
// flow around a spent/busy tier instead of going dark behind it. Two cheap guards keep it from starving core triage:
//   - CHANGE DETECTION: it only spends when an uncovered input chunk exists, or once every
//     `refreshSec` as a heartbeat — a per-cycle call (288×/day) would blow the 500k token budget alone.
//   - INTERVAL FLOOR: never more often than `minIntervalSec`, so even a churny wire can't hammer it.
// It reuses every tier's exact budget file, limiter, and provider cooldown — never a parallel budget lane
// (the :8799 double-count lesson). Ideas-contract errors use an idea-scoped cooldown so they cannot sideline
// healthy core triage. The whole provider walk is deadline-bounded below stale-running detection. Never throws.

import {
  Budget, NON_BINDING_DAILY_TOKEN_CAP, armCooldown, clearCooldown, conservativeChatTokenBound,
  dailyQuotaAdmission, getNamedLimiter, getSharedGeminiLimiter, getSharedLimiter, isCoolingDown, selectDailyQuotaCandidate,
  rateInfoForLimiter, type DailyQuotaCandidate, type DailyQuotaMeter,
} from '../triage/budget'
import {
  IDEA_SYSTEM, buildIdeaUserMessage, estimateIdeaTokens, surfaceIdeasBatch,
  type IdeaInputRow, type IdeaOriginType, type IdeaSourceTheme, type IdeaThemeExpression, type RawIdea, type SurfaceIdeasResult,
} from './surface-ideas'
import { surfaceIdeasBatchGemini } from './surface-ideas-gemini'
import {
  ideaDecayAt, ideaId, ideaSnapshotRevision, ideaVersion, priorCoverage, pruneExpiredIdeas, readIdeaById,
  readIdeaSnapshots, readPassState, readTopSweep, retireUnadmittedThemeIdeas, topNEffectHash, topNHash,
  writeIdeaIfRevision, writePassState,
  type IdeaPassChunkState, type SurfacedIdea,
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
import { markIdeasPublicationPending, publishPendingIdeas, type IdeasPublishResult } from './ideas-publisher'
import { randomUUID } from 'node:crypto'

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
  /** Default start-of-day release for finite overflow allowances. Production passes the same value used
   * by news triage; optional keeps deploy/test callers compatible while defaulting to the production 6%. */
  freeProviderPaceFloorFrac?: number
  llmCooldownMs: number
  llmCooldownMaxMs: number
  limiterWaitMs: number
  /** The canonical provider registry used by news triage. Local-primary is separate; demoted local is
   * already the final overflow entry, so the operational chain never hand-wires or duplicates a tier. */
  localProvider?: OverflowProvider | null
  overflowProviders?: OverflowProvider[]
  /** Native Gemini free-tier rotation. Each model owns a separate request/day bucket but shares the same
   * minute limiter, exactly like title triage. Optional keeps existing test/deploy callers compatible. */
  geminiEnabled?: boolean
  geminiApiKey?: string
  geminiBaseUrl?: string
  geminiModels?: { model: string; dailyReqCap: number }[]
  geminiMaxTokens?: number
  geminiDailyTokenCap?: number
  geminiDayTz?: string
  geminiRpm?: number
  geminiTpm?: number
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
  /** Groq predates the overflow registry and supplies its token target here. Every other finite cloud
   * provider derives the same request/token pacing descriptor from its canonical OverflowProvider. */
  pace?: { meter: DailyQuotaMeter; cap: number; floorFraction: number }
  transport?: 'openai' | 'gemini'
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
  /** Test/embedding seam. Omitted uses the guarded production publisher (plain temp repos no-op). */
  publishIdeas?: () => Promise<IdeasPublishResult>
  /** Internal durable hand-off invoked immediately before provider-budget reservation. */
  markProviderDispatch?: (providerId: string, at: number) => void
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

/** Split the complete eligible projection into bounded provider calls without tearing a two-role Theme
 * package apart. A source row shared by two packages may intentionally appear in both chunks: each model
 * call must carry its own complete causal proof, while stable idea identity dedupes any repeated output. */
export function chunkIdeaRows(rows: IdeaInputRow[], configuredSize: number): IdeaInputRow[][] {
  // Three is the smallest safe bound for a complete two-row Theme package plus the independent comparison
  // row required by the lead skim. Production uses 12; this floor only repairs hostile/mistyped config.
  const size = Math.max(3, Math.floor(Number(configuredSize) || 0))
  const rowOrder = new Map(rows.map((row, index) => [row, index]))
  const packages = new Map<string, IdeaInputRow[]>()
  for (const row of rows) {
    for (const context of row.theme_contexts || []) {
      const key = `${context.theme_id}@${context.theme_rev}`
      const group = packages.get(key) || []
      if (!group.includes(row)) group.push(row)
      packages.set(key, group)
    }
  }
  const completePackages = [...packages.entries()].filter(([, group]) => (
    group.some((row) => row.theme_contexts?.some((context) => context.role === 'WHY_NOW'))
    && group.some((row) => row.theme_contexts?.some((context) => context.role === 'EXPRESSION_PROOF'))
  ))
  const packagedRows = new Set(completePackages.flatMap(([, group]) => group))
  const units: { order: number; key: string; rows: IdeaInputRow[] }[] = []
  for (const [key, group] of completePackages) {
    const ordered = [...group].sort((a, b) => (rowOrder.get(a) ?? 0) - (rowOrder.get(b) ?? 0))
    const why = ordered.filter((row) => row.theme_contexts?.some((context) => (
      `${context.theme_id}@${context.theme_rev}` === key && context.role === 'WHY_NOW'
    )))
    const proofs = ordered.filter((row) => row.theme_contexts?.some((context) => (
      `${context.theme_id}@${context.theme_rev}` === key && context.role === 'EXPRESSION_PROOF'
    )))
    // The canonical projection currently emits one why-now + one proof. Keep the splitter correct if a
    // future projection admits several proofs: repeat the causal row and bound each complete unit to size.
    const anchor = why[0]
    if (!anchor) continue
    for (let offset = 0; offset < proofs.length; offset += Math.max(1, size - 1)) {
      const unitRows = [anchor, ...proofs.slice(offset, offset + size - 1)]
      units.push({ order: Math.min(...unitRows.map((row) => rowOrder.get(row) ?? 0)), key: `${key}:${offset}`, rows: unitRows })
    }
  }
  for (const [index, row] of rows.entries()) {
    if (!packagedRows.has(row)) units.push({ order: index, key: `row:${index}`, rows: [row] })
  }
  units.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))

  const chunks: IdeaInputRow[][] = []
  let current: IdeaInputRow[] = []
  for (const unit of units) {
    if (current.length && current.length + unit.rows.length > size) {
      chunks.push(current)
      current = []
    }
    current.push(...unit.rows)
  }
  if (current.length) chunks.push(current)
  // Comparative surfacing deliberately refuses a one-row input. Rebalance an ordinary tail when the
  // preceding chunk has room to give up one independent row; otherwise overlap the nearest ordinary
  // context row. The overlap is intentional and safe because stable idea identity dedupes provider
  // output. Never split a Theme package just to make the arithmetic convenient.
  const tail = chunks.at(-1)
  if (tail?.length === 1 && chunks.length > 1) {
    const prior = chunks[chunks.length - 2]
    const ordinaryIndex = prior.findLastIndex((row) => !packagedRows.has(row))
    if (ordinaryIndex >= 0 && prior.length > 2) tail.unshift(...prior.splice(ordinaryIndex, 1))
    else if (ordinaryIndex >= 0) tail.unshift(prior[ordinaryIndex])
    else {
      // This is the only mathematically impossible bounded case (a size-two Theme package plus one
      // ordinary row). Repeat the complete package rather than sending a malformed one-role Theme input.
      tail.unshift(...prior)
    }
  }
  return chunks
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
    pace: { meter: 'tokens', cap: c.groqDailyTokenTarget, floorFraction: c.groqPaceFloorFrac },
  }
}

/** Materialize Gemini's native per-model pool into the same internal routing descriptor as the finite
 * OpenAI-compatible tiers. This is internal only: the canonical public OverflowProvider registry remains
 * correctly limited to OpenAI-compatible endpoints. */
function geminiIdeaProviders(c: IdeaPassConfig): RoutedIdeaProvider[] {
  if (!(c.geminiEnabled && c.geminiApiKey && c.geminiBaseUrl && c.geminiModels?.length)) return []
  return c.geminiModels.map(({ model, dailyReqCap }) => ({
    id: `gemini:${model}`,
    label: `Gemini · ${model}`,
    color: '--live',
    apiKey: c.geminiApiKey!,
    baseUrl: c.geminiBaseUrl!,
    model,
    dailyReqCap,
    dailyTokenCap: c.geminiDailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP,
    rpm: c.geminiRpm ?? 0,
    tpm: c.geminiTpm ?? 0,
    maxTokens: c.geminiMaxTokens ?? 2500,
    maxAttempts: 1,
    budgetFile: `gemini-budget-${model.replace(/[^a-z0-9]+/gi, '-')}.json`,
    dayTz: c.geminiDayTz,
    pace: { meter: 'requests', cap: dailyReqCap, floorFraction: c.freeProviderPaceFloorFrac ?? 0.06 },
    transport: 'gemini',
  }))
}

interface IdeaQuotaRoute extends DailyQuotaCandidate {
  provider: RoutedIdeaProvider
}

/** One provider's binding daily meter. Local is deliberately unpaced: it is the unlimited $0 tier.
 * Groq paces to its explicit token target; every finite overflow tier paces the same binding allowance
 * as core triage (tokens when a token cap exists, otherwise requests), on the provider's reset clock. */
function providerPace(p: RoutedIdeaProvider, c: IdeaPassConfig): RoutedIdeaProvider['pace'] | null {
  if (p.id === 'local') return null
  if (p.pace) return p.pace
  return p.dailyTokenCap != null
    ? { meter: 'tokens', cap: p.dailyTokenCap, floorFraction: p.paceFloorFrac ?? c.freeProviderPaceFloorFrac ?? 0.06 }
    : { meter: 'requests', cap: p.dailyReqCap, floorFraction: p.paceFloorFrac ?? c.freeProviderPaceFloorFrac ?? 0.06 }
}

function quotaRoute(
  rows: Parameters<typeof surfaceIdeasBatch>[0],
  deps: IdeaPassDeps,
  provider: RoutedIdeaProvider,
  priority: number,
): IdeaQuotaRoute | null {
  const at = (deps.now || (() => Date.now()))()
  if (!provider.apiKey || isCoolingDown(deps.stateDir, provider.id, at)
    || isCoolingDown(deps.stateDir, `ideas:${provider.id}`, at)) return null
  const pace = providerPace(provider, deps.config)
  if (!pace) return null
  const perAttemptTokens = ideaGroqTokenBound(rows, provider.maxTokens)
  const budget = Budget.load(
    deps.stateDir, provider.dailyReqCap, provider.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP,
    at, provider.budgetFile, provider.dayTz,
  )
  if (!budget.canSpend(perAttemptTokens, 1)) return null
  return {
    id: provider.id,
    meter: pace.meter,
    used: pace.meter === 'tokens' ? budget.tokens : budget.requests,
    cap: pace.cap,
    cost: pace.meter === 'tokens' ? perAttemptTokens : 1,
    resetTimeZone: provider.dayTz,
    floorFraction: pace.floorFraction,
    priority,
    provider,
  }
}

/** Explain a cloud route that was excluded from the fair selector without probing it. This preserves the
 * health panel's per-tier reasons while guaranteeing a paced provider cannot re-enter through a fixed-order
 * fallback walk a few lines later. Null means it is eligible and the caller should rebuild the selector. */
function unavailableProviderDecision(
  rows: Parameters<typeof surfaceIdeasBatch>[0],
  deps: IdeaPassDeps,
  p: RoutedIdeaProvider,
): ProviderDecision | null {
  const now = deps.now || (() => Date.now())
  const at = now()
  const label = p.label || p.id
  if (!p.apiKey) return { result: null, reason_code: 'missing_api_key', note: providerReason('missing_api_key', label), provider: label }
  if (isCoolingDown(deps.stateDir, p.id, at)) return { result: null, reason_code: 'provider_cooldown', note: providerReason('provider_cooldown', label), provider: label }
  if (isCoolingDown(deps.stateDir, `ideas:${p.id}`, at)) return { result: null, reason_code: 'provider_cooldown', note: `${label} is cooling down for the Ideas response contract.`, provider: label }
  const perAttemptTokens = ideaGroqTokenBound(rows, p.maxTokens)
  const budget = Budget.load(deps.stateDir, p.dailyReqCap, p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, at, p.budgetFile, p.dayTz)
  if (!budget.ledgerAvailable) {
    return { result: null, reason_code: 'internal_error', note: `${label} usage record needs attention.`, provider: label }
  }
  if (!budget.canSpend(perAttemptTokens, 1)) {
    return { result: null, reason_code: 'daily_budget', note: providerReason('daily_budget', label), provider: label }
  }
  if (!pacedCanSpend(p, deps.config, budget, perAttemptTokens, 1, at)) {
    return { result: null, reason_code: 'paced_budget', note: providerReason('paced_budget', label), provider: label }
  }
  return null
}

function pacedCanSpend(
  p: RoutedIdeaProvider,
  c: IdeaPassConfig,
  budget: Budget,
  perAttemptTokens: number,
  attempts: number,
  at: number,
): boolean {
  if (!budget.canSpend(perAttemptTokens * attempts, attempts)) return false
  const pace = providerPace(p, c)
  if (!pace) return true
  return dailyQuotaAdmission({
    id: p.id,
    meter: pace.meter,
    used: pace.meter === 'tokens' ? budget.tokens : budget.requests,
    cap: pace.cap,
    cost: pace.meter === 'tokens' ? perAttemptTokens * attempts : attempts,
    resetTimeZone: p.dayTz,
    floorFraction: pace.floorFraction,
  }, at).pacedFit
}

function providerReason(code: IdeasHealthReasonCode, label: string): string {
  if (code === 'missing_api_key') return `${label} is not configured.`
  if (code === 'provider_cooldown') return `${label} is cooling down after a transient failure.`
  if (code === 'daily_budget') return `${label}'s daily request or token budget is exhausted.`
  if (code === 'paced_budget') return `${label}'s daily pacer is holding capacity for later news triage.`
  if (code === 'rate_limiter_busy') return `${label}'s shared per-minute window is busy.`
  return `${label} could not be used.`
}

/** One provider attempt with the same budget file, limiter, and cooldown used by news triage. */
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
  if (chainSignal?.aborted) return { result: null, reason_code: 'provider_error', note: `${label}: provider-chain deadline reached`, provider: label }
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
  if (!budget.ledgerAvailable) {
    return { result: null, reason_code: 'internal_error', note: `${label} usage record needs attention.`, provider: label }
  }
  if (!hardAttempts) {
    return !budget.ledgerAvailable
      ? { result: null, reason_code: 'internal_error', note: `${label} usage record needs attention.`, provider: label }
      : { result: null, reason_code: 'daily_budget', note: providerReason('daily_budget', label), provider: label }
  }
  let preflightAttempts = hardAttempts
  const preflightAt = now()
  while (preflightAttempts > 0 && !pacedCanSpend(p, c, budget, perAttemptTokens, preflightAttempts, preflightAt)) preflightAttempts--
  if (!preflightAttempts) {
    if (!budget.ledgerAvailable) {
      return { result: null, reason_code: 'internal_error', note: `${label} usage record needs attention.`, provider: label }
    }
    const code: IdeasHealthReasonCode = providerPace(p, c) ? 'paced_budget' : 'daily_budget'
    return { result: null, reason_code: code, note: providerReason(code, label), provider: label }
  }
  const limiter = p.transport === 'gemini'
    ? getSharedGeminiLimiter(p.rpm, p.tpm ?? 0)
    : p.id === 'groq' ? getSharedLimiter(p.rpm, p.tpm ?? 0) : getNamedLimiter(p.id, p.rpm, p.tpm ?? 0)
  const got = await limiter.acquire(est, deps.sleep, now, c.limiterWaitMs, chainSignal)
  if (!got) return { result: null, reason_code: 'rate_limiter_busy', note: providerReason('rate_limiter_busy', label), provider: label }
  if (chainSignal?.aborted) return { result: null, reason_code: 'provider_error', note: `${label}: provider-chain deadline reached`, provider: label }
  // Another workload can arm a provider-wide hold while this request waits for the shared limiter. Do not
  // spend from a provider that is now waiting after an error, and do not create the durable dispatch marker.
  const postLimiterAt = now()
  if (isCoolingDown(deps.stateDir, p.id, postLimiterAt)
    || isCoolingDown(deps.stateDir, ideaCooldownId, postLimiterAt)) {
    return { result: null, reason_code: 'provider_cooldown', note: providerReason('provider_cooldown', label), provider: label }
  }
  let attempts = Math.min(attemptCap, budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
  const reservationAt = postLimiterAt
  while (attempts > 0 && !pacedCanSpend(p, c, budget, perAttemptTokens, attempts, reservationAt)) attempts--
  // Authorize this exact envelope durably BEFORE reservation. A process death after tryReserve but before
  // the old marker write left a retryable `prepared` checkpoint beside an orphaned reservation. Recovery
  // could then double-count the same envelope in the day's ledger. `authorized` is deliberately
  // conservative: it proves neither a reservation nor provider I/O, but it forbids an automatic retry.
  deps.markProviderDispatch?.(p.id, now())
  // The pacing check and hard-cap reservation are synchronous against Budget's process-shared state, so
  // another workload cannot interleave and consume the same released unit between them. A normal failed
  // reservation returns no result; runIdeaPass then clears the authorization in its existing no-I/O write.
  const reservation = attempts > 0 ? budget.tryReserve(perAttemptTokens * attempts, undefined, reservationAt, attempts) : null
  if (!reservation) {
    if (!budget.ledgerAvailable) {
      return { result: null, reason_code: 'internal_error', note: `${label} usage record needs attention.`, provider: label }
    }
    const code: IdeasHealthReasonCode = providerPace(p, c) ? 'paced_budget' : 'daily_budget'
    return { result: null, reason_code: code, note: providerReason(code, label), provider: label }
  }
  let r: SurfaceIdeasResult | undefined
  const attemptStartedAt = now()
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
    r = p.transport === 'gemini'
      ? await surfaceIdeasBatchGemini(
          rows,
          {
            model: p.model, baseUrl: p.baseUrl, apiKey: p.apiKey, maxTokens: p.maxTokens,
            timeoutMs: ideaTimeoutMs, maxAttempts: attempts, signal: chainSignal,
          },
          deps.fetchFn, deps.sleep,
        )
      : await surfaceIdeasBatch(
          rows,
          {
            model: p.model, models: p.models, baseUrl: p.baseUrl, apiKey: p.apiKey, maxTokens: p.maxTokens,
            headers: p.headers, extraBody: p.extraBody,
            timeoutMs: ideaTimeoutMs,
            maxAttempts: attempts,
            signal: chainSignal,
            requestRemainingHeaderIsDaily: p.id === 'groq' || p.requestRemainingHeaderIsDaily === true,
          },
          deps.fetchFn, deps.sleep,
        )
  } catch (e: any) {
    // surfaceIdeasBatch is fail-soft by contract, but keep the orchestration boundary fail-soft too. If a
    // future adapter regression escapes unexpectedly, charge one conservative attempt and isolate the bug
    // to Ideas instead of crashing the scheduler or pretending the shared provider is unavailable.
    r = {
      ideas: [], requests: 1, tokens: perAttemptTokens, ok: false, failureKind: 'contract',
      // An escaped adapter exception may contain a provider body, account id, or request fragment. The
      // operator needs the stable failure class, not raw third-party text in persisted/public health.
      note: 'idea: unexpected adapter failure',
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
  const providerTerminal = r.failureKind === 'request' && [401, 402, 403, 404].includes(r.httpStatus || 0)
  const ideaDeadlineFailure = r.failureKind === 'availability' && r.timedOut === true
  const providerWideFailure = r.ok
    || r.failureKind === 'rate_limit'
    || (r.failureKind === 'availability' && !ideaDeadlineFailure)
    || providerTerminal
  limiter.learn(rateInfoForLimiter(r.rate, providerWideFailure), now)
  if (r.ok) {
    clearCooldown(deps.stateDir, p.id, attemptStartedAt)
    clearCooldown(deps.stateDir, ideaCooldownId, attemptStartedAt)
    return { result: r, reason_code: null, provider: label }
  }
  if (chainSignal?.aborted) {
    // The pass's own wall-clock guard cancelled the request; that is not evidence that this shared provider
    // is unhealthy. A later pass may probe it normally instead of sidelining core triage.
    return { result: r, reason_code: 'provider_error', note: `${label}: provider-chain deadline reached`, provider: label }
  }
  const localCooldown = p.id === 'local' ? (c.localCooldownMs ?? c.llmCooldownMs) : c.llmCooldownMs
  const localCooldownMax = p.id === 'local' ? localCooldown : c.llmCooldownMaxMs
  const failureAt = now()
  if (r.dailyLimit) {
    // Only an explicit provider-day signal closes the ledger. A generic access or request error did not
    // consume the configured allowance and must not make diagnostics falsely report it as spent.
    budget.exhaust()
  } else if (r.rate?.retryAfterMs != null && Number.isFinite(r.rate.retryAfterMs)) {
    // Retry-After is the provider's exact recovery clock. Keep this hold flat even when the provider has
    // failed before; applying the generic exponential breaker here can turn a precise 25-second window into
    // an unrelated 25-minute outage and strands capacity the provider has already said is available again.
    const retryMs = Math.max(0, Math.floor(r.rate.retryAfterMs))
    if (retryMs > 0) {
      const holdId = providerWideFailure ? p.id : ideaCooldownId
      const reason = providerWideFailure
        ? r.failureKind === 'rate_limit' ? 'rate-limit' : providerTerminal ? 'provider-access' : 'availability'
        : ideaDeadlineFailure ? 'idea-timeout' : r.failureKind === 'request' ? 'idea-request' : 'idea-contract'
      armCooldown(deps.stateDir, failureAt, retryMs, holdId, retryMs, reason)
    }
  } else if (r.failureKind === 'rate_limit') {
    armCooldown(deps.stateDir, failureAt, 60_000, p.id, 60_000, 'rate-limit')
  } else if ((r.failureKind === 'availability' && !ideaDeadlineFailure) || providerTerminal) {
    // Service/network failures use the shared exponential breaker. Provider-wide access failures share it
    // too, but unlike an explicit daily-limit signal they never forge a fully spent allowance.
    armCooldown(deps.stateDir, failureAt, localCooldown, p.id, localCooldownMax,
      providerTerminal ? 'provider-access' : r.timedOut ? 'timeout' : 'availability')
  } else {
    // HTTP 400/413/422, malformed/truncated/schema-invalid output, and any Ideas request timeout may
    // be specific to this richer nonessential seam. Never poison the provider's shared triage health.
    armCooldown(deps.stateDir, now(), localCooldown, ideaCooldownId, localCooldownMax)
  }
  return { result: r, reason_code: 'provider_error', note: `${label}: ${r.note || 'provider error'}`, provider: label }
}

async function callIdeaProvidersDetailed(rows: Parameters<typeof surfaceIdeasBatch>[0], deps: IdeaPassDeps): Promise<ProviderDecision> {
  const primary: RoutedIdeaProvider[] = [
    ...(deps.config.localProvider ? [deps.config.localProvider] : []),
    groqProvider(deps.config),
  ]
  const overflow = deps.config.overflowProviders || []
  const cloud: RoutedIdeaProvider[] = [
    ...overflow.filter((provider) => provider.id !== 'local'),
    ...geminiIdeaProviders(deps.config),
  ]
  const localTail = overflow.filter((provider) => provider.id === 'local')
  // Health declares a running attempt stale after 120s. Keep the full sequential walk below it even when
  // several providers hang; surfaceIdeasBatch combines this signal with each provider's own request timeout.
  const chainTimeoutMs = Math.min(90_000, Math.max(1, deps.config.providerChainTimeoutMs ?? 90_000))
  const chainSignal = AbortSignal.timeout(chainTimeoutMs)
  const skips: ProviderDecision[] = []
  const failures: ProviderDecision[] = []
  const tryProvider = async (provider: RoutedIdeaProvider): Promise<ProviderDecision | null> => {
    if (chainSignal.aborted) return null
    const decision = await callProviderForIdeaPassDetailed(rows, deps, provider, chainSignal)
    if (decision.result?.ok) return decision // a literal valid [] is a real terminal success
    if (decision.result) failures.push(decision)
    else skips.push(decision)
    return null
  }

  // Local primary and Groq retain their quality placement. Groq's own token target is still clock-paced;
  // when it is ahead of schedule, the pass immediately reaches the finite cloud pool below.
  for (const provider of primary) {
    const success = await tryProvider(provider)
    if (success) return success
  }

  // Finite free pool (OpenAI-compatible overflow + every Gemini model). Recompute after each failed attempt
  // because its shared Budget was just charged, then choose the provider furthest behind its reset-clock
  // target. Config order is only the quality tiebreak, never a license for one API family to starve another.
  const pending = cloud.map((provider, priority) => ({ provider, priority }))
  while (pending.length && !chainSignal.aborted) {
    const routes = pending
      .map(({ provider, priority }) => quotaRoute(rows, deps, provider, priority))
      .filter((route): route is IdeaQuotaRoute => route !== null)
    const pick = selectDailyQuotaCandidate(routes, (deps.now || (() => Date.now()))()) as IdeaQuotaRoute | null
    if (pick) {
      const index = pending.findIndex(({ provider }) => provider === pick.provider)
      if (index >= 0) pending.splice(index, 1)
      const success = await tryProvider(pick.provider)
      if (success) return success
      continue
    }

    // Every remaining route is missing, held, hard-capped, or ahead of its clock release. Record those
    // reasons without calling in config order. If the clock moved across a release boundary, retry the fair
    // selection instead of letting that timing race reintroduce fixed-order drain.
    let removed = false
    for (let index = pending.length - 1; index >= 0; index--) {
      const decision = unavailableProviderDecision(rows, deps, pending[index].provider)
      if (!decision) continue
      skips.push(decision)
      pending.splice(index, 1)
      removed = true
    }
    if (!removed) continue
  }

  // A demoted local provider is unlimited and deliberately remains the final fallback, outside the finite
  // reset-clock selector. In normal primary-local mode it appeared in `primary` and this list is empty.
  for (const provider of localTail) {
    const success = await tryProvider(provider)
    if (success) return success
  }
  const failed = failures.at(-1) || null
  const deadlineNote = chainSignal.aborted ? 'The idea provider chain reached its safe runtime limit.' : ''
  const notes = [...failures, ...skips].map((d) => d.note).filter(Boolean).concat(deadlineNote).filter(Boolean).join(' ')
  if (failed?.result) return { ...failed, result: { ...failed.result, note: notes || failed.result.note } }
  const codes = new Set(skips.map((d) => d.reason_code))
  const code: IdeasHealthReasonCode = codes.has('internal_error') ? 'internal_error'
    : codes.has('rate_limiter_busy') ? 'rate_limiter_busy'
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
 * Read every current eligible wire row, resume the first unfinished bounded chunk, and persist surfaced
 * ideas (updating a same-ticker/direction call in place, preserving its first-seen stamp and promoted
 * state). Successful chunks are checkpointed; quota/provider failures remain pending. Never throws.
 */
export async function runIdeaPass(deps: IdeaPassDeps): Promise<IdeaPassResult> {
  const c = deps.config
  const now = deps.now || (() => Date.now())
  const log = deps.log || (() => {})
  const health = (patch: Parameters<typeof updateIdeasHealth>[1], at = now()) => {
    if (deps.persistHealth) updateIdeasHealth(deps.stateDir, patch, at, inspectIdeaSnapshots(deps.repoRoot, at))
  }
  const publish = deps.publishIdeas || (() => publishPendingIdeas(deps.repoRoot, deps.stateDir, {
    nowMs: now(), beforePublish: deps.refreshBoard,
  }))
  const publishFailure = (result: Extract<IdeasPublishResult, { status: 'failed' }>, at = now()): IdeaPassResult => {
    const counts = inspectIdeaSnapshots(deps.repoRoot, at)
    const reason = result.reason === 'unsafe_branch'
      ? 'Idea data publication is pending because this checkout is not the production main branch.'
      : 'Idea data publication is pending after a durable commit/push failure.'
    health({
      enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error',
      outcome: 'failed', reason_code: 'publish_failed', reason, next_eligible_at: null,
      input_count: 0, produced_count: 0,
    }, at)
    return { ran: false, produced: 0, note: reason, reason_code: 'publish_failed' }
  }
  try {
    // Retry a prior crash/failure (and bootstrap pre-marker dirty Ideas data) before every provider/hash/
    // health early return. A publication fault stops new mutations instead of widening local-only drift.
    const recoveredPublication = await publish()
    if (recoveredPublication.status === 'failed') return publishFailure(recoveredPublication)
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
      allEligible: true,
    })
    const allRows = sweep.rows
    const inputCount = allRows.length
    if (sweep.status === 'degraded') {
      const counts = inspectIdeaSnapshots(deps.repoRoot, inputAt)
      const cached = counts.live_count + counts.stale_count > 0
      const reason = 'A recent wire partition is unreadable or has no trustworthy clock; the lead skim is paused rather than ranking an incomplete source set.'
      health({
        enabled: true, status: cached ? 'degraded' : 'error', outcome: 'skipped', reason_code: 'stale_inputs',
        reason, next_eligible_at: null, input_count: inputCount, produced_count: 0,
      }, inputAt)
      return { ran: false, produced: 0, note: reason, reason_code: 'stale_inputs' }
    }
    if (allRows.length < 2) {
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
        input_count: inputCount,
        produced_count: 0,
      }, inputAt)
      return { ran: false, produced: 0, note: reason, reason_code: staleInput ? 'stale_inputs' : 'insufficient_inputs' }
    }

    // Reconcile Theme-only snapshots only after the complete input set clears every integrity/freshness
    // guard. An unreadable partition must not make a valid theme appear withdrawn and trigger deletion.
    // Mixed calls retain independent wire support; promoted and in-flight calls remain lifecycle-owned.
    const retired = retireUnadmittedThemeIdeas(deps.repoRoot, allRows)
    if (retired > 0) {
      markIdeasPublicationPending(deps.stateDir, now())
      await deps.refreshBoard()
      const publication = await publish()
      if (publication.status === 'failed') return publishFailure(publication)
    }

    const hash = topNHash(allRows)
    const effectHash = topNEffectHash(allRows)
    // Must mirror the initial sweep's options EXACTLY — `allEligible` included. `hash`/`effectHash` are
    // computed over that read's rows, so a re-read on narrower options compares a different row set and
    // would report a phantom input change on every pass whose candidate set is wider than one chunk.
    const sourceInputsStillCurrent = (): boolean => {
      const current = readTopSweep(deps.repoRoot, c.topN, {
        nowMs: now(), maxAgeMs: inputMaxAgeHrs * 3_600_000, themesEnabled: c.themesEnabled !== false,
        allEligible: true,
      })
      return current.status === 'ok' && topNHash(current.rows) === hash && topNEffectHash(current.rows) === effectHash
    }
    const inputKey = (row: IdeaInputRow) => `${topNHash([row])}:${topNEffectHash([row])}`
    const rankedInputKeys = allRows.map(inputKey)
    const currentInputKeySet = new Set(rankedInputKeys)
    const rowByInputKey = new Map(allRows.map((row) => [inputKey(row), row]))
    // This file decides which provider envelopes were already paid for. A clean first run has neither a
    // progress record nor health evidence of a provider attempt. If health proves work was sent before,
    // a missing progress record is authority loss—not a fresh queue—and must stop safely.
    const priorHealthRead = inspectPersistedIdeasHealth(deps.stateDir)
    let prev = readPassState(deps.stateDir, true)
    const priorHealth = priorHealthRead.health
    if (!prev && (priorHealthRead.status === 'corrupt'
      || Boolean(priorHealth?.last_attempt_at || priorHealth?.last_success_at))) {
      throw Object.assign(new Error('Ideas progress record needs attention.'), { code: 'EIDEA_PASS_STATE' })
    }
    const priorMarker = prev?.in_flight
    const ambiguousDispatch = priorMarker && priorMarker.phase !== 'prepared'
      && priorMarker.phase !== 'persisted'
    let recoveredAmbiguousDispatch = false
    if (ambiguousDispatch && prev) {
      // There is no provider-wide idempotency key for this request. A sent request with no recorded result
      // can neither be retried (duplicate spend) nor called successful (lost rows). Quarantine only its
      // exact rows so later and newly arriving work can still flow. Preserve any idea this attempt
      // demonstrably wrote by comparing the pre-dispatch snapshot baseline with current revisions and
      // binding the claim only to marker source rows; never infer that an unknown empty result succeeded.
      const claims = new Map<string, string[]>()
      for (const claim of prev.completed_idea_claims || []) {
        if (claim.input_keys.every((key) => currentInputKeySet.has(key))) claims.set(claim.idea_id, claim.input_keys)
      }
      const baseline = new Map((priorMarker.snapshot_revisions || []).map((entry) => [entry.idea_id, entry.revision]))
      const markerSources = priorMarker.input_event_ids?.length === priorMarker.input_keys.length
        ? priorMarker.input_keys.map((key, index) => ({ key, event_id: priorMarker.input_event_ids![index] }))
        : priorMarker.input_keys.flatMap((key) => {
            const row = rowByInputKey.get(key)
            return row ? [{ key, event_id: row.event_id }] : []
          })
      if (priorMarker.snapshot_revisions !== undefined) {
        for (const snapshot of readIdeaSnapshots(deps.repoRoot)) {
          if (baseline.get(snapshot.idea_id) === ideaSnapshotRevision(snapshot)) continue
          if (Date.parse(snapshot.updated_at) < priorMarker.started_at_ms - 1_000) continue
          const events = new Set(snapshot.source_event_ids)
          const supportKeys = markerSources.filter((source) => events.has(source.event_id)).map((source) => source.key)
          if (supportKeys.length) claims.set(snapshot.idea_id, [...new Set(supportKeys)])
        }
      }
      const uncertainInputKeys = [...new Set([
        ...(prev.uncertain_input_keys || []),
        ...priorMarker.input_keys,
      ])].filter((key) => currentInputKeySet.has(key))
      const { in_flight: _ambiguous, uncertain_input_keys: _oldUncertain, ...prior } = prev
      const recovered = {
        ...prior,
        completed_idea_ids: [...claims.keys()],
        completed_idea_claims: [...claims].map(([idea_id, input_keys]) => ({ idea_id, input_keys })),
        ...(uncertainInputKeys.length ? { uncertain_input_keys: uncertainInputKeys } : {}),
      }
      writePassState(deps.stateDir, recovered)
      prev = recovered
      recoveredAmbiguousDispatch = true
    }
    const priorResultPersisted = prev?.in_flight?.phase === 'persisted'
    if (priorResultPersisted && prev) {
      // The result, completed inputs, and source-scoped claims are already durable. Finishing the
      // interrupted terminal checkpoint is a local state repair and never calls the provider again.
      const { in_flight: _settled, ...settled } = prev
      writePassState(deps.stateDir, settled)
      prev = settled
    }
    const priorUncertainInputKeys = prev?.uncertain_input_keys || []
    const activeUncertainKeys = priorUncertainInputKeys.filter((key) => currentInputKeySet.has(key))
    if (prev && (activeUncertainKeys.length !== priorUncertainInputKeys.length
      || activeUncertainKeys.some((key, index) => key !== priorUncertainInputKeys[index]))) {
      // Row identity includes both prompt and persistence effects. A changed/removed row releases only its
      // own old identity; every unrelated uncertain row remains quarantined.
      const { uncertain_input_keys: _staleUncertain, ...current } = prev
      const reconciled = {
        ...current,
        ...(activeUncertainKeys.length ? { uncertain_input_keys: activeUncertainKeys } : {}),
      }
      writePassState(deps.stateDir, reconciled)
      prev = reconciled
    }
    const uncertainInputKeySet = new Set(activeUncertainKeys)
    const uncertaintyReason = activeUncertainKeys.length
      ? `${activeUncertainKeys.length} ranked input${activeUncertainKeys.length === 1 ? '' : 's'} from an interrupted provider request ${activeUncertainKeys.length === 1 ? 'is' : 'are'} set aside. ${activeUncertainKeys.length === 1 ? 'It' : 'They'} will not be sent again automatically. Check provider use and saved ideas before clearing ${activeUncertainKeys.length === 1 ? 'it' : 'them'}.`
      : null
    // The scheduler/standalone entrypoint serializes passes. Therefore a persisted `running` record at
    // the start of a new invocation is crash evidence, not an in-flight peer. Anchor the hard interval to
    // both lifecycle files: ideas-pass.json may already have been stamped after the provider returned,
    // while a crash before that stamp leaves only last_attempt_at. Losing either clock can cause an
    // immediate double-spend or, after a waiting transition, cache a result that never completed.
    const priorUnfinished = !priorResultPersisted && !recoveredAmbiguousDispatch
      && ((priorHealthRead.status === 'ok' && priorHealth?.status === 'running')
      && prev?.in_flight?.phase !== 'prepared')
    const priorAttemptAt = priorHealth?.last_attempt_at ? Date.parse(priorHealth.last_attempt_at) : NaN
    const intervalAnchor = Math.max(
      Number.isFinite(prev?.ran_at_ms) ? prev!.ran_at_ms : Number.NEGATIVE_INFINITY,
      Number.isFinite(priorAttemptAt) ? priorAttemptAt : Number.NEGATIVE_INFINITY,
    )
    // The quarantine warning is deliberately a visible failed/stale-running health record, but it is not
    // a failure of the safe rows that remain callable. Treating that warning like a provider failure resets
    // nothing and suppresses their hourly heartbeat forever after the next scheduler tick.
    const uncertaintyOnlyFailure = Boolean(uncertaintyReason
      && priorHealth?.outcome === 'failed' && priorHealth.reason_code === 'stale_running')
    const priorFailed = !priorResultPersisted
      && (recoveredAmbiguousDispatch || priorHealthRead.status === 'corrupt'
        || (priorHealth?.outcome === 'failed' && !uncertaintyOnlyFailure) || priorUnfinished)
    const elapsed = Number.isFinite(intervalAnchor) ? now() - intervalAnchor : Number.POSITIVE_INFINITY
    if (elapsed < c.minIntervalSec * 1000) {
      const next = intervalAnchor + c.minIntervalSec * 1000
      if (uncertaintyReason) {
        health({
          enabled: true, status: 'degraded', outcome: 'failed', reason_code: 'stale_running',
          reason: uncertaintyReason, next_eligible_at: new Date(next).toISOString(),
          input_count: inputCount, produced_count: 0,
        })
      } else if (priorUnfinished) {
        const counts = inspectIdeaSnapshots(deps.repoRoot, now())
        health({
          enabled: true,
          status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error',
          outcome: 'failed',
          reason_code: 'stale_running',
          reason: 'The prior provider attempt did not record a completion; it will retry after the minimum interval.',
          next_eligible_at: new Date(next).toISOString(),
          input_count: inputCount,
          produced_count: 0,
        })
      } else if (priorFailed) {
        // Throttling is not recovery. Keep the terminal provider/internal failure visible until a real
        // retry completes; only advance its eligibility clock.
        if (priorHealthRead.status === 'corrupt') {
          health({
            enabled: true, status: 'error', outcome: 'failed', reason_code: 'health_corrupt',
            reason: `The idea-pass health record is corrupt: ${priorHealthRead.error}`,
            next_eligible_at: new Date(next).toISOString(), input_count: inputCount, produced_count: 0,
          })
        } else {
          health({ enabled: true, next_eligible_at: new Date(next).toISOString(), input_count: inputCount })
        }
      } else {
        health({ enabled: true, status: 'waiting', outcome: 'skipped', reason_code: 'min_interval', reason: 'The last provider attempt is still inside the minimum interval.', next_eligible_at: new Date(next).toISOString(), input_count: inputCount, produced_count: 0 })
      }
      return uncertaintyReason
        ? { ran: false, produced: 0, note: uncertaintyReason, reason_code: 'stale_running' }
        : priorUnfinished
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
    const chunkKey = (chunk: IdeaPassChunkState) => `${chunk.hash}\0${chunk.effect_hash}`
    // A provider/workload failure leaves completed chunks intact: the next paced attempt resumes at the
    // first incomplete chunk instead of re-spending earlier coverage. A normal heartbeat deliberately
    // starts a fresh coverage window only after every safe current input has completed. Otherwise a
    // provider pause longer than refreshSec could repeatedly restart chunk one and starve the tail.
    // An unresolved envelope must not stop normal hourly refreshes for every other row. Reset completed
    // non-uncertain coverage on schedule while carrying the quarantine and its recovered exact claims.
    const priorCompletedInputKeySet = new Set((prev?.completed_input_keys || []).filter((key) => (
      currentInputKeySet.has(key) && !uncertainInputKeySet.has(key)
    )))
    const everySafeInputCompleted = rankedInputKeys
      .filter((key) => !uncertainInputKeySet.has(key))
      .every((key) => priorCompletedInputKeySet.has(key))
    const resetCoverage = !priorFailed && !changed && dueRefresh && everySafeInputCompleted
    // Keep one stable queue until its current rows have all cleared. Newly ranked rows append behind the
    // unfinished queue instead of rebuilding every chunk from position zero; otherwise a busy wire can
    // keep inserting a fresh rank-one row and starve the same lower-ranked evidence forever.
    const priorOrder = resetCoverage ? [] : (prev?.coverage_order || [])
    const coverageOrder: string[] = []
    const queued = new Set<string>()
    for (const key of [...priorOrder, ...rankedInputKeys]) {
      if (!currentInputKeySet.has(key) || queued.has(key)) continue
      queued.add(key)
      coverageOrder.push(key)
    }
    // Uncertain rows are not complete, but sending them again could duplicate a real request. Remove only
    // those exact identities from automatic envelopes; all other old and new rows keep their queue order.
    const orderedRows = coverageOrder
      .filter((key) => !uncertainInputKeySet.has(key))
      .map((key) => rowByInputKey.get(key))
      .filter((row): row is IdeaInputRow => Boolean(row))
    const chunks = chunkIdeaRows(orderedRows, c.topN)
    const chunkInputKeys = chunks.map((chunk) => chunk.map(inputKey))
    const chunkStates = chunks.map((chunk): IdeaPassChunkState => ({
      hash: topNHash(chunk),
      effect_hash: topNEffectHash(chunk),
    }))
    const currentChunkKeys = new Set(chunkStates.map(chunkKey))
    const legacyCompleted = !changed && !dueRefresh && chunks.length === 1 && prev && !prev.completed_chunks
      ? [{ ...chunkStates[0] }]
      : []
    const reusableCompleted = resetCoverage
      ? []
      : (prev?.completed_chunks || legacyCompleted).filter((chunk) => currentChunkKeys.has(chunkKey(chunk)))
    const completedByKey = new Map(reusableCompleted.map((chunk) => [chunkKey(chunk), chunk]))
    const inferredCompletedInputs = resetCoverage ? [] : chunks.flatMap((chunk, index) => (
      completedByKey.has(chunkKey(chunkStates[index])) ? chunkInputKeys[index] : []
    ))
    const completedInputKeys = new Set((resetCoverage
      ? []
      : (prev?.completed_input_keys || inferredCompletedInputs)).filter((key) => (
      currentInputKeySet.has(key) && !uncertainInputKeySet.has(key)
    )))
    // A claim survives queue churn unless one of its own support rows changed or disappeared.
    const completedIdeaClaims = new Map<string, string[]>()
    if (!resetCoverage) {
      if (prev?.completed_idea_claims !== undefined) {
        for (const claim of prev.completed_idea_claims) {
          // Only a change to this idea's own support can unlock it. Queue churn elsewhere is irrelevant.
          if (claim.input_keys.every((key) => currentInputKeySet.has(key))) {
            completedIdeaClaims.set(claim.idea_id, [...new Set(claim.input_keys)])
          }
        }
      } else {
        // Deploy-compatible migration: old checkpoints knew the accepted ids but not their source rows.
        // Keep those claims until the next normal coverage reset rather than risk a weaker overwrite.
        for (const id of prev?.completed_idea_ids || []) completedIdeaClaims.set(id, [])
      }
    } else {
      for (const claim of prev?.completed_idea_claims || []) {
        if (claim.input_keys.length > 0
          && claim.input_keys.every((key) => currentInputKeySet.has(key))
          && claim.input_keys.some((key) => uncertainInputKeySet.has(key))) {
          completedIdeaClaims.set(claim.idea_id, [...new Set(claim.input_keys)])
        }
      }
    }
    const completedIdeaIds = new Set(completedIdeaClaims.keys())
    const serializedIdeaClaims = () => [...completedIdeaClaims].map(([idea_id, input_keys]) => ({ idea_id, input_keys }))
    const uncertainState = activeUncertainKeys.length ? { uncertain_input_keys: activeUncertainKeys } : {}
    const chunkIsComplete = (index: number): boolean => completedByKey.has(chunkKey(chunkStates[index]))
      || chunkInputKeys[index].every((key) => completedInputKeys.has(key))
    const pendingChunkIndex = chunkStates.findIndex((_chunk, index) => !chunkIsComplete(index))
    if (pendingChunkIndex < 0) {
      // A rerank can change the whole-set hash without changing any exact provider envelope. Carry those
      // proven completions forward under the new set identity; no provider call is needed.
      if (changed || prev?.in_flight || !prev?.coverage_order || !prev.completed_input_keys) writePassState(deps.stateDir, {
        hash, effect_hash: effectHash, ran_at_ms: prev?.ran_at_ms ?? inputAt,
        completed_chunks: chunkStates.map((chunk) => completedByKey.get(chunkKey(chunk)) || chunk),
        coverage_order: coverageOrder,
        completed_input_keys: coverageOrder.filter((key) => completedInputKeys.has(key)),
        completed_idea_ids: [...completedIdeaIds],
        completed_idea_claims: serializedIdeaClaims(),
        ...uncertainState,
      })
      if (uncertaintyReason) {
        health({
          enabled: true, status: 'degraded', outcome: 'failed', reason_code: 'stale_running',
          reason: uncertaintyReason, next_eligible_at: null,
          input_count: inputCount, produced_count: 0,
        })
        return { ran: false, produced: 0, note: uncertaintyReason, reason_code: 'stale_running' }
      }
      const next = prev!.ran_at_ms + c.refreshSec * 1000
      health({ enabled: true, status: 'waiting', outcome: 'skipped', reason_code: 'inputs_unchanged', reason: 'Every current ranked-input chunk has a completed provider result.', next_eligible_at: new Date(next).toISOString(), input_count: inputCount, produced_count: 0 })
      return { ran: false, produced: 0, note: 'all current chunks complete', reason_code: 'inputs_unchanged' }
    }

    const rows = chunks[pendingChunkIndex]
    const currentChunkState = chunkStates[pendingChunkIndex]
    const currentChunkInputKeys = chunkInputKeys[pendingChunkIndex]
    const completedChunks = chunkStates.flatMap((chunk, index) => (
      chunkIsComplete(index) ? [completedByKey.get(chunkKey(chunk)) || chunk] : []
    ))
    const preparedAt = now()
    const attemptId = randomUUID()
    const snapshotRevisionsAtStart = readIdeaSnapshots(deps.repoRoot).map((snapshot) => ({
      idea_id: snapshot.idea_id,
      revision: ideaSnapshotRevision(snapshot),
    }))
    // Prove the progress store is writable before any limiter reservation or provider request. The marker
    // is intentionally durable: prepared safely retries, while a sent-but-unsettled envelope is set aside
    // without stopping unrelated queue work.
    writePassState(deps.stateDir, {
      hash, effect_hash: effectHash, ran_at_ms: prev?.ran_at_ms ?? 0, completed_chunks: completedChunks,
      coverage_order: coverageOrder,
      completed_input_keys: coverageOrder.filter((key) => completedInputKeys.has(key)),
      completed_idea_ids: [...completedIdeaIds],
      completed_idea_claims: serializedIdeaClaims(),
      ...uncertainState,
      in_flight: {
        chunk: currentChunkState, input_keys: currentChunkInputKeys,
        input_event_ids: rows.map((row) => row.event_id), started_at_ms: preparedAt,
        phase: 'prepared', attempt_id: attemptId, snapshot_revisions: snapshotRevisionsAtStart,
      },
    })
    const provider = await callIdeaProvidersDetailed(rows, {
      ...deps,
      markProviderDispatch: (providerId, at) => {
        writePassState(deps.stateDir, {
          hash, effect_hash: effectHash, ran_at_ms: at, completed_chunks: completedChunks,
          coverage_order: coverageOrder,
          completed_input_keys: coverageOrder.filter((key) => completedInputKeys.has(key)),
          completed_idea_ids: [...completedIdeaIds],
          completed_idea_claims: serializedIdeaClaims(),
          ...uncertainState,
          in_flight: {
            chunk: currentChunkState, input_keys: currentChunkInputKeys,
            input_event_ids: rows.map((row) => row.event_id), started_at_ms: preparedAt,
            phase: 'authorized', attempt_id: `${attemptId}:${providerId}`,
            snapshot_revisions: snapshotRevisionsAtStart,
          },
        })
        deps.markProviderDispatch?.(providerId, at)
      },
    })
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
      // No provider request was sent. Clear the prepared marker and restore the prior attempt clock so an
      // eligibility-only skip does not consume the minimum interval.
      writePassState(deps.stateDir, {
        hash, effect_hash: effectHash, ran_at_ms: prev?.ran_at_ms ?? 0, completed_chunks: completedChunks,
        coverage_order: coverageOrder,
        completed_input_keys: coverageOrder.filter((key) => completedInputKeys.has(key)),
        completed_idea_ids: [...completedIdeaIds],
        completed_idea_claims: serializedIdeaClaims(),
        ...uncertainState,
      })
      const fullReason = uncertaintyReason ? `${reason} ${uncertaintyReason}` : reason
      health({
        enabled: true, status: uncertaintyReason ? 'degraded' : status, outcome: 'skipped',
        reason_code: uncertaintyReason ? 'stale_running' : code, reason: fullReason,
        next_eligible_at: null, input_count: inputCount, produced_count: 0,
      })
      return { ran: false, produced: 0, note: fullReason, reason_code: uncertaintyReason ? 'stale_running' : code }
    }
    if (!r.ok) {
      // Stamp the attempt but never the chunk completion, so the exact same envelope resumes after the
      // minimum interval. Previously completed chunks stay durable and are not re-billed.
      writePassState(deps.stateDir, {
        hash, effect_hash: effectHash, ran_at_ms: now(), completed_chunks: completedChunks,
        coverage_order: coverageOrder,
        completed_input_keys: coverageOrder.filter((key) => completedInputKeys.has(key)),
        completed_idea_ids: [...completedIdeaIds],
        completed_idea_claims: serializedIdeaClaims(),
        ...uncertainState,
      })
      const counts = inspectIdeaSnapshots(deps.repoRoot, now())
      const failureReason = `${r.note || 'The provider attempt failed.'}${uncertaintyReason ? ` ${uncertaintyReason}` : ''}`
      health({ enabled: true, status: counts.live_count + counts.stale_count > 0 || uncertaintyReason ? 'degraded' : 'error', outcome: 'failed', reason_code: 'provider_error', reason: failureReason, next_eligible_at: null, input_count: inputCount, produced_count: 0 })
      log(`idea pass: ${r.note || 'no ideas produced'}`)
      return { ran: false, produced: 0, note: failureReason, reason_code: 'provider_error' }
    }

    const snapshots = readIdeaSnapshots(deps.repoRoot)
    const nowIso = new Date(now()).toISOString().replace(/\.\d{3}Z$/, 'Z')
    const seen = new Set<string>()
    const newRawIdeaCount = r.ideas.filter((raw) => !completedIdeaIds.has(ideaId(raw.ticker, raw.direction))).length
    const persistedVersions = new Map<string, string>()
    // `input_keys` travels with each prepared row because persistence happens in a second loop, after the
    // source rows that produced it have gone out of scope. The completion claim must name the exact inputs
    // this call was paid for, so the next pass can tell a settled envelope from an unpaid one.
    const prepared: { id: string; version: string; template: SurfacedIdea; input_keys: string[] }[] = []
    let sourceChangedDuringPass = false
    let writeConflicts = 0
    for (const raw of r.ideas) {
      const id = ideaId(raw.ticker, raw.direction)
      // The server-ranked queue is strongest first. A later comparative chunk may repeat the same
      // ticker+direction, but that weaker occurrence cannot replace the first valid call in this window.
      if (completedIdeaIds.has(id)) continue
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
      if (!sourceInputsStillCurrent()) { sourceChangedDuringPass = true; break }
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
        if (!sourceInputsStillCurrent()) { sourceChangedDuringPass = true; break }
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
      prepared.push({ id, version, input_keys: [...new Set(srcRows.map(inputKey))], template: {
          idea_id: id,
          idea_version: version,
          idea_version_started_at: nowIso,
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
          surfaced_at: nowIso,
          updated_at: nowIso,
          decay_at: decayIso,
          status: 'live',
          promoted_signal_id: null,
        } })
    }
    if (sourceChangedDuringPass || !sourceInputsStillCurrent()) {
      const counts = inspectIdeaSnapshots(deps.repoRoot, now())
      const reason = 'The ranked lead set changed while listings were being verified; the stale provider result was discarded before persistence.'
      health({
        enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error',
        outcome: 'failed', reason_code: 'inputs_changed', reason, next_eligible_at: null,
        input_count: rows.length, produced_count: 0,
      })
      return { ran: true, produced: 0, note: reason, reason_code: 'inputs_changed' }
    }
    // Covers snapshot writes, archive-first prune/deletions, journal appends, and the following board
    // refresh. Mark before mutation; a no-op pass simply clears after a clean status check.
    markIdeasPublicationPending(deps.stateDir, now())
    let persistenceInputChanged = false
    for (const { id, version, template, input_keys: preparedInputKeys } of prepared) {
      let saved = false
      for (let attempt = 0; attempt < 3 && !saved; attempt++) {
        // All async listing work and one final input revalidation completed before this write phase.
        // Re-read lifecycle state for each CAS so a promotion/feedback edit still wins.
        const current = readIdeaById(deps.repoRoot, id)
        const versionStartedAt = current?.idea_version === version
          ? (current.idea_version_started_at || current.updated_at || nowIso)
          : nowIso
        const currentUpdated = current?.updated_at && Date.parse(current.updated_at) > Date.parse(nowIso)
          ? current.updated_at
          : nowIso
        const sameOccurrence = current?.idea_version === version && current?.idea_version_started_at === versionStartedAt
        const idea: SurfacedIdea = {
          ...template,
          idea_version_started_at: versionStartedAt,
          surfaced_at: current?.surfaced_at || nowIso,
          updated_at: currentUpdated,
          status: sameOccurrence && current?.status === 'promoted' ? 'promoted' : 'live',
          promoted_signal_id: sameOccurrence ? (current?.promoted_signal_id || null) : null,
        }
        saved = writeIdeaIfRevision(deps.repoRoot, idea, ideaSnapshotRevision(current), () => {
          const valid = sourceInputsStillCurrent()
          if (!valid) persistenceInputChanged = true
          return valid
        })
        if (saved) {
          persistedVersions.set(id, version)
          completedIdeaIds.add(id)
          completedIdeaClaims.set(id, preparedInputKeys)
        }
        if (persistenceInputChanged) break
      }
      if (persistenceInputChanged) break
      if (!saved) writeConflicts++
    }
    if (persistenceInputChanged) {
      const counts = inspectIdeaSnapshots(deps.repoRoot, now())
      const reason = 'The ranked lead set changed at the persistence boundary; the stale provider result was discarded.'
      health({
        enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error',
        outcome: 'failed', reason_code: 'inputs_changed', reason, next_eligible_at: null,
        input_count: rows.length, produced_count: 0,
      })
      return { ran: true, produced: 0, note: reason, reason_code: 'inputs_changed' }
    }
    pruneExpiredIdeas(deps.repoRoot, now(), c.shelfLifeHrs * 3_600_000) // delete only well past decay (one extra shelf-life)
    await deps.refreshBoard()
    const publication = await publish()
    if (publication.status === 'failed') return publishFailure(publication)
    const finishedAt = now()
    const snapshotState = inspectIdeaSnapshots(deps.repoRoot, finishedAt)
    const produced = [...persistedVersions].filter(([id, version]) => readIdeaById(deps.repoRoot, id)?.idea_version === version).length
    const storeDegraded = snapshotState.snapshot_store.status === 'degraded' || snapshotState.snapshot_store.status === 'unreadable'
    // A literal provider `ideas:[]` is the only honest success_empty. If the model returned one or more
    // leads but none became a valid projectable snapshot, the pass failed regardless of whether the cause
    // was a CAS conflict, a damaged store, or a later source/persistence invariant. Never collapse that into
    // "nothing cleared the bar."
    // An envelope containing only calls already accepted from an earlier chunk is a successful no-op.
    // New returned calls still have to produce at least one valid snapshot or the chunk remains pending.
    const persistenceFailed = newRawIdeaCount > 0 && produced === 0
    const persistenceFailureCode: IdeasHealthReasonCode = writeConflicts > 0
      ? 'write_conflict'
      : storeDegraded
        ? 'snapshot_store_error'
        : 'internal_error'
    const status = persistenceFailed ? (snapshotState.live_count + snapshotState.stale_count || uncertaintyReason ? 'degraded' : 'error')
      : storeDegraded || writeConflicts ? 'degraded'
        : uncertaintyReason ? 'degraded'
          : 'healthy'
    const outcome = persistenceFailed ? 'failed' : produced ? 'success_with_ideas' : 'success_empty'
    const reasonCode: IdeasHealthReasonCode | null = persistenceFailed ? persistenceFailureCode
      : writeConflicts ? 'write_conflict'
      : storeDegraded ? 'snapshot_store_error'
        : uncertaintyReason ? 'stale_running'
          : null
    const providerName = provider.provider || 'The provider'
    const nextCompletedChunks = persistenceFailed
      ? completedChunks
      : [...completedChunks, { ...currentChunkState, returned_count: r.ideas.length }]
    const nextCompletedInputKeys = new Set(completedInputKeys)
    if (!persistenceFailed) for (const key of currentChunkInputKeys) nextCompletedInputKeys.add(key)
    // Completion is checkpointed only after the provider envelope has passed every source/listing/store
    // invariant. A crash or persistence rejection cannot turn an uncommitted chunk into cached success.
    if (!persistenceFailed) {
      // Persist the successful result and its first-occurrence claims before removing the in-flight marker.
      // If the final rename is interrupted, recovery can finish from these exact bytes without a provider
      // retry and without allowing a lower-ranked duplicate to replace an already saved snapshot.
      writePassState(deps.stateDir, {
        hash, effect_hash: effectHash, ran_at_ms: finishedAt, completed_chunks: nextCompletedChunks,
        coverage_order: coverageOrder,
        completed_input_keys: coverageOrder.filter((key) => nextCompletedInputKeys.has(key)),
        completed_idea_ids: [...completedIdeaIds],
        completed_idea_claims: serializedIdeaClaims(),
        ...uncertainState,
        in_flight: {
          chunk: { ...currentChunkState, returned_count: r.ideas.length },
          input_keys: currentChunkInputKeys, input_event_ids: rows.map((row) => row.event_id),
          started_at_ms: preparedAt,
          phase: 'persisted', attempt_id: attemptId, snapshot_revisions: snapshotRevisionsAtStart,
        },
      })
    }
    writePassState(deps.stateDir, {
      hash, effect_hash: effectHash, ran_at_ms: finishedAt, completed_chunks: nextCompletedChunks,
      coverage_order: coverageOrder,
      completed_input_keys: coverageOrder.filter((key) => nextCompletedInputKeys.has(key)),
      completed_idea_ids: [...completedIdeaIds],
      completed_idea_claims: serializedIdeaClaims(),
      ...uncertainState,
    })
    const completedKeysAfter = new Set(nextCompletedChunks.map(chunkKey))
    const remainingChunks = chunkStates.filter((chunk, index) => !completedKeysAfter.has(chunkKey(chunk))
      && chunkInputKeys[index].some((key) => !nextCompletedInputKeys.has(key))).length
    const providerResultReason = persistenceFailed
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
            ? `${providerName} surfaced ${produced} unverified news lead${produced === 1 ? '' : 's'}${remainingChunks ? `; ${remainingChunks} ranked-input chunk${remainingChunks === 1 ? '' : 's'} remain queued.` : '.'}`
            : `${providerName} completed successfully and returned no news leads${remainingChunks ? `; ${remainingChunks} ranked-input chunk${remainingChunks === 1 ? '' : 's'} remain queued.` : '.'}`
    const reason = `${providerResultReason}${uncertaintyReason ? ` ${uncertaintyReason}` : ''}`
    health({
      enabled: true, status, outcome, reason_code: reasonCode,
      reason,
      ...(persistenceFailed ? {} : { last_success_at: new Date(finishedAt).toISOString() }),
      next_eligible_at: new Date(finishedAt + c.minIntervalSec * 1000).toISOString(),
      input_count: inputCount, produced_count: produced,
    }, finishedAt)
    log(`idea pass: ${providerName} surfaced ${produced} idea${produced === 1 ? '' : 's'} from chunk ${pendingChunkIndex + 1}/${chunks.length} (${rows.length} of ${inputCount} ranked items)`)
    return { ran: true, produced, note: persistenceFailed ? reason : undefined, reason_code: reasonCode || undefined }
  } catch (e: any) {
    log(`idea pass error: ${e?.message || e}`)
    const at = now()
    const counts = inspectIdeaSnapshots(deps.repoRoot, at)
    health({ enabled: true, status: counts.live_count + counts.stale_count > 0 ? 'degraded' : 'error', outcome: 'failed', reason_code: 'internal_error', reason: `Idea pass error: ${String(e?.message || e).slice(0, 240)}`, next_eligible_at: null, input_count: 0, produced_count: 0 }, at)
    return { ran: false, produced: 0, note: `error: ${e?.message || e}`, reason_code: 'internal_error' }
  }
}
