// The PM skim — tier 1.5 of the screener, sitting between the ranked wire and the paid gauntlet.
//
// The wire's triage_score answers "how loud is this?" (materiality). It does NOT answer "is there one
// specific, liquid stock to TRADE here, long or short, and is it worth acting on?" — the two are
// different questions, which is why a human still scrolls hundreds of scored rows by hand. This module
// asks the second question of ONLY the already-top-ranked rows, in ONE cheap batched free-LLM call, and
// surfaces the handful that clear the bar as concrete ideas (ticker · side · one plain reason · a dated
// why-now · an honest pre-edge read). Most rows produce NO idea — saying "nothing clears the bar" is the
// correct, doctrine-mandated answer (CLAUDE.md §24, the Rejector), not a failure.
//
// This is a SURFACE skim, never a verdict. Its `conviction` is a pre-edge PROXY on the 0-100 scale, not
// the locked 0.40/0.30/0.30 edge score the paid gauntlet computes — it is stamped `pre_edge_proxy` so it
// can never masquerade as edge (§7). It carries no price target (that is the paid news-impact tier). The
// output schema is a subset of frameworks/screener/candidates.schema.json so a later paid run maps onto
// it rather than fighting it. Batching + JSON mode keep it token-cheap; it reads titles + the metadata the
// wire already computed (materiality/label/types/companies), so the model spends its tokens on the
// event->idea leap, not on re-deriving materiality.

import { conservativeChatTokenBound, type RateInfo } from '../triage/budget'
import {
  EVENT_TYPES, caughtFailure, parseRate, type ProviderFailureKind,
} from '../triage/groq'
import {
  classifyProviderContractFailure,
  classifyProviderHttpFailure,
  classifyProviderLocalStateFailure,
  clearProviderQuarantine,
  honorProviderRetryAfter,
  providerFailureFromQuarantine,
  providerRequestIdentity,
  publicProviderFailureNote,
  publicProviderQuarantineNote,
  quarantineProviderFailure,
  readProviderQuarantine,
  type ProviderFailureClassification,
  type ProviderRequestIdentity,
} from '../provider-failure'
import { cleanTicker, normTicker } from '../symbology'

// §14 thesis-type classification — the surface skim must name when a "stock idea" is really a macro /
// commodity / policy bet wearing a ticker, so it is never shown as a clean single-name pick.
export const THESIS_TYPES = [
  'company_specific', 'sector_cycle', 'macro_conditional', 'policy_conditional',
  'commodity_conditional', 'fx_rates', 'liquidity_positioning', 'governance_turnaround',
  'balance_sheet_survival', 'pair_trade',
] as const
export type ThesisType = (typeof THESIS_TYPES)[number]

export type IdeaDirection = 'long' | 'short' | 'pair'
export type PricedIn = 'priced' | 'room' | 'unknown'
export type IdeaOriginType = 'wire' | 'theme' | 'mixed'
export interface IdeaSourceTheme {
  theme_id: string
  theme_rev: number
  /** Exact wire events from this revision that contributed to the selected, possibly publisher-deduped
   * input row. Optional only for deploy-compatible snapshots written before row↔theme edges existed. */
  evidence_event_ids?: string[]
  /** The supporting event bound to this revision's why-now claim. New lineage always carries it; optional
   * only for deploy-compatible historical snapshots. */
  why_now_event_id?: string
}

export interface IdeaThemeExpression {
  theme_id: string
  theme_rev: number
  name: string
  name_key: string
  ticker: string
  listing_country: string | null
  side: 'beneficiary' | 'harmed'
  role?: 'direct' | 'bottleneck' | 'enabler' | 'harmed' | 'hedge'
  mechanism?: string
  evidence_event_ids: string[]
}

export type IdeaThemeRowRole = 'WHY_NOW' | 'EXPRESSION_PROOF'
export interface IdeaThemeContext {
  theme_id: string
  theme_rev: number
  /** A Theme seed is a causal package, not a free-floating headline. The model must select one exact
   * WHY_NOW row and a distinct EXPRESSION_PROOF row from this same revision. */
  role: IdeaThemeRowRole
  thesis: string
  context: string
  why_now_event_id: string
}

// One row of the top-N the skim reads: exactly the fields the wire already scored (InboxRow subset), so
// the model gets the materiality read for free and spends its budget on the trade idea.
export interface IdeaInputRow {
  event_id: string
  headline: string // display + the model prompt (the English translation when the original is non-English)
  headline_orig: string // the ORIGINAL-language headline — carried so a promotion's SIG_ID byte-matches the wire launch (which uses the original), never the translation
  url: string // the source URL — carried (not sent to the model) so a promotion byte-matches the wire event's SIG_ID
  source_name: string
  region: string
  materiality: number // triage_score (composite priority) — the wire's own read
  materiality_pre_score?: number // raw title-read economic materiality; never substitute the composite
  label: string // event_materiality_label (low/medium/high/critical)
  event_types: string[]
  issuer_linkage: string
  companies: { name: string; ticker: string | null; listing_country: string | null }[]
  found_at: string // ISO — the freshest source timestamp, drives freshness/decay downstream
  /** First local observation of this exact source revision. Internal ordering evidence only: freshness,
   * decay, and the model-visible timestamp remain anchored to `found_at`. */
  observed_at?: string
  source_is_english?: true // positive source-language proof; absent legacy rows stay veto-closed
  /** Enclosing durable projection clock for Theme-only rows. Internal ordering evidence, never rendered
   * or used for source freshness. */
  observed_by_at?: string
  source_tier?: import('../scope').SourceTierId
  scheduled_events?: string[]
  event_direction?: import('../types').EventDirection
  dedup_group?: string // one underlying story across publisher copies
  // Additive provenance for the Themes -> Ideas bridge. Optional so older callers and deployed snapshots
  // remain valid; the provider only chooses `src` indices and never authors either lineage field.
  origin_type?: IdeaOriginType
  source_themes?: IdeaSourceTheme[]
  /** Server-authored allowlist copied from the qualified ThemeSummary. It is model-visible for selection,
   * then enforced after `src` resolution; provider output can never add an eligible company or ticker. */
  theme_expressions?: IdeaThemeExpression[]
  /** Bounded, server-authored Theme package metadata. It makes the real provider prompt auditable: exact
   * revision, exact evidence role, and the short thesis/context that the row is meant to prove. */
  theme_contexts?: IdeaThemeContext[]
}

// A surfaced idea, as the LLM returns it (raw, per-batch). Indices in `src` point back into the input rows
// so the orchestrator can resolve event_ids / headlines / timestamps deterministically (never trust the
// model to echo an id). Invalid trade-defining enums fail closed — model drift degrades to a dropped
// idea, never a silently invented long or company-specific thesis.
export interface RawIdea {
  src: number[] // input-row indices this idea clusters (>=1)
  ticker: string
  company: string | null
  exchange: string | null // the model's guess; UNVERIFIED (no dated listing check at surface tier)
  direction: IdeaDirection
  pair_with: string | null // the other leg's ticker when direction === 'pair'
  reason: string // one plain-English line (§21), no fluff
  why_now: string // §17 — carries a date/window, or says the timing is unproven
  conviction: number // 0-100 PRE-EDGE proxy (NOT the locked edge score)
  priced_in: PricedIn
  thesis_type: ThesisType
}

export interface SurfaceIdeasResult {
  ideas: RawIdea[]
  requests: number
  tokens: number
  ok: boolean
  note?: string
  rate?: RateInfo
  /** Structured failure policy for callers that share provider health with other workloads. Contract and
   * payload-shape failures stay idea-scoped; rate limits, availability, and provider-access failures may
   * hold the shared provider according to their exact recovery semantics. */
  failureKind?: ProviderFailureKind
  httpStatus?: number
  timedOut?: boolean
  dailyLimit?: boolean
  failure?: ProviderFailureClassification
  providerIdentity?: ProviderRequestIdentity
  quarantined?: boolean
}

export interface SurfaceIdeasOptions {
  model: string
  baseUrl: string
  apiKey: string
  maxTokens?: number
  models?: string[]
  headers?: Record<string, string>
  extraBody?: Record<string, unknown>
  timeoutMs?: number
  maxAttempts?: number
  signal?: AbortSignal
  requestRemainingHeaderIsDaily?: boolean
  providerId?: string
  providerLabel?: string
  keyEnvVar?: string
  stateDir?: string
  workload?: string
  contractVersion?: string
  nowMs?: () => number
}

export function ideaProviderRequestIdentity(opts: SurfaceIdeasOptions): ProviderRequestIdentity {
  return providerRequestIdentity({
    providerId: opts.providerId || 'ideas',
    baseUrl: opts.baseUrl,
    model: opts.model,
    models: opts.models,
    apiKey: opts.apiKey,
    keyEnvVar: opts.keyEnvVar,
    transport: 'openai',
    workload: opts.workload || 'ideas',
    contractVersion: opts.contractVersion || 'news-ideas-json-v1',
    request: {
      responseFormat: 'json_object',
      temperature: 0.2,
      configuredMaxTokens: opts.maxTokens ?? 2500,
      extraBody: opts.extraBody || {},
    },
  })
}

function legacyFailureKind(failure: ProviderFailureClassification): ProviderFailureKind {
  if (failure.code === 'rate_limited') return 'rate_limit'
  if (failure.code === 'transient_upstream' || failure.code === 'timeout') return 'availability'
  if (failure.code === 'contract_invalid') return 'contract'
  return 'request'
}

// Input-token estimate for the per-minute limiter. Each row carries the title, evidence tier, separate
// impact/direction reads, scheduled events, company guesses and optional Theme proof, so reserve more
// than the bare triage path. The daily budget separately uses conservativeChatTokenBound over the exact
// rendered prompt and output ceiling.
export function estimateIdeaTokens(rowCount: number): number {
  return 1_100 + rowCount * 180
}

export const IDEA_SYSTEM = `You are the sharpest portfolio manager on a buy-side desk, skimming a ranked news wire the way a human PM does in the morning: reading fast, ignoring most of it, and pulling out EVERY item where there is a specific, tradable stock idea worth acting on RIGHT NOW — long or short, up to a maximum of six.

You are given the desk's already-ranked top items, each with the wire's composite materiality read (0-100), its separate raw economic-impact score when measured, source tier, server-read event direction, scheduled events, severity label, event types, and any companies it guessed. Treat these as evidence, not decoration: prefer primary/official sources, do not substitute the composite materiality score for raw economic impact, and use a scheduled event only when it supplies a real date or window. Event direction describes the event-level effect and is informational unless the row clearly binds it to the exact primary issuer you select. A negative event may support a long in a secondary beneficiary, a positive event may support a short in a harmed rival, and either may support a clean pair; explain that transmission instead of blindly copying or reversing the event label. Your ONLY job is the leap the wire cannot make: from an event to a concrete position — which exact listed stock to play, which way, why, and how sure you are.

Some rows are labelled as a server-qualified Theme package. A Theme package is usable only when your "src" includes BOTH distinct evidence roles from the SAME exact theme id@revision: one row labelled WHY_NOW and at least one row labelled EXPRESSION_PROOF. Never mix revisions, never use a partial package, and never infer a company from the WHY_NOW row alone. The EXPRESSION_PROOF row carries "qualified_theme_expressions", a server-verified allowlist: choose only a listed company/ticker on that allowlist. Beneficiary means long; harmed means short. A pair must use an allowed beneficiary as "ticker" and an allowed harmed company as "pair_with". If a complete same-revision package and the clean expression are not present, do not use those rows and do not surface the idea from them.

THE BAR IS HIGH. Most items yield NO idea. Return an idea ONLY when ALL of these hold:
- there is a SPECIFIC, LISTED, liquid stock (or a clean pair) that expresses the event — not "the sector", not a private company, not an index;
- you can name the ticker with real confidence (never invent or guess a ticker — if you are unsure of the exact symbol, do not surface the idea);
- the event plausibly moves that company's revenue, margins, cash flow, capital structure, or its multiple, in a direction you can state;
- there is a reason it matters NOW (a fresh catalyst, a dated event, a live dislocation) — not a slow, someday story.
If an item is big news but has no clean, liquid single-name expression (a war, a macro print, a policy shift with no pure play), DO NOT force a ticker onto it. Returning FEWER, better ideas — or an empty list — is the correct, valued answer. Never manufacture an idea to fill the list. A dishonest or low-conviction pick is worse than none.

CLUSTER: if several INDEPENDENT items are the same underlying idea (same mechanism, same names), merge them into ONE idea and list all their indices in "src". Rows carrying the same story_family are status observations of ONE underlying story, not independent corroboration: read their corrections, adverse changes, and restorations together, but never raise conviction merely because that family has several rows.

SHORT and PAIR are first-class: when the event HARMS a listed company, that is a short; when it clearly helps one named company at a named rival's expense, that is a pair (long the winner, short the loser). Check the sign before you place the side.

For each idea return:
- src: the input indices this idea draws on (one or more integers).
- ticker: the exact listed symbol, uppercase. Never invent one.
- company: the company's common name.
- exchange: the primary exchange with the ticker if you are confident (e.g. "NYSE", "NASDAQ", "NSE", "BSE", "LSE", "TSE"), else null. This is your own knowledge, unverified — use null when unsure.
- direction: "long" | "short" | "pair".
- pair_with: for a "pair", the OTHER leg's ticker (the one you would short if this is the long leg); else null.
- reason: ONE plain-English sentence a smart non-specialist understands, stating the mechanism — how the event reaches this company's economics. No jargon without its meaning, and NONE of these fluff words: robust, strong, well-positioned, attractive, best-in-class, compelling, poised, cheap, expensive. Keep the exact number where the headline gives one.
- why_now: ONE sentence on why this is live NOW — the dated catalyst or dislocation (give the date/window). If the timing is not actually proven, say so plainly ("timing unproven — thesis is directional").
- conviction: an integer 0-100, your PRE-EDGE read of how good this idea is right now, from what is cheap to see at a skim: how clean and liquid the expression is, how direct and large the impact, and how live the catalyst. This is NOT a deep edge score. Be calibrated and skeptical: reserve 70+ for a genuinely clean, liquid, single-name idea with a clear near-term catalyst; most real ideas sit 40-65; below 40 do not surface it.
- priced_in: your quick guess at whether the market has already moved on this — "priced" (likely already in the price), "room" (plausibly not yet fully reflected), or "unknown".
- thesis_type: classify honestly, one of: ${THESIS_TYPES.join(', ')}. Use company_specific ONLY when the idea genuinely rests on that one company; if the real driver is a commodity, a macro variable, a policy, or FX, say so (commodity_conditional / macro_conditional / policy_conditional / fx_rates) — this flags a market bet wearing a ticker.

Event-type vocabulary (for your reference, matching the desk's tags): ${EVENT_TYPES.join(', ')}.

Return ONLY JSON: {"ideas":[{"src":[<int>],"ticker":"...","company":"...","exchange":null,"direction":"long|short|pair","pair_with":null,"reason":"...","why_now":"...","conviction":<int>,"priced_in":"priced|room|unknown","thesis_type":"company_specific"}]}. Return {"ideas":[]} when nothing on the wire clears the bar. Never include more than 6 ideas; if you have more, keep only the best.`

export function buildIdeaUserMessage(rows: IdeaInputRow[]): string {
  const canonicalFamily = (row: IdeaInputRow): string => {
    const group = typeof row.dedup_group === 'string' ? row.dedup_group.trim() : ''
    return group || row.event_id.trim()
  }
  const familyCounts = new Map<string, number>()
  for (const row of rows) {
    const family = canonicalFamily(row)
    if (family) familyCounts.set(family, (familyCounts.get(family) || 0) + 1)
  }
  const promptStoryFamily = (row: IdeaInputRow): string => {
    // `dedup_group` is the earliest event id. Falling back to event_id labels that legacy anchor with the
    // same canonical family as a grouped update, so the model never counts the two as corroboration.
    const family = canonicalFamily(row)
    if (!family || (familyCounts.get(family) || 0) < 2) return ''
    // Story ids are engine-authored, but keep the model-visible control field single-line and bounded if
    // a legacy/imported sweep contains unexpected bytes.
    const safe = family.replace(/[^A-Za-z0-9._:-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 96)
    return safe ? `story_family=${safe}` : ''
  }
  const lines = rows.map((r, i) => {
    const comp = (r.companies || [])
      .map((c) => (c.ticker ? `${c.name} (${c.ticker})` : c.name))
      .slice(0, 3)
      .join(', ')
    const tags = (r.event_types || []).slice(0, 4).join('/')
    const themeExpressions = (r.theme_expressions || [])
      .map((expression) => `${expression.name} (${expression.ticker}; ${expression.side}${expression.role ? `; ${expression.role}` : ''}${expression.mechanism ? `; mechanism: ${expression.mechanism}` : ''})`)
      .slice(0, 4)
      .join(', ')
    const themeContexts = (r.theme_contexts || [])
      .map((theme) => `${theme.theme_id}@${theme.theme_rev}; role=${theme.role}; why_now_event=${theme.why_now_event_id}; thesis=${JSON.stringify(theme.thesis)}; context=${JSON.stringify(theme.context)}`)
      .slice(0, 4)
      .join(' | ')
    const bits = [
      `found_at=${r.found_at}`,
      `materiality=${Math.round(r.materiality)}`,
      r.materiality_pre_score != null && Number.isFinite(Number(r.materiality_pre_score))
        ? `raw_impact=${Math.round(Number(r.materiality_pre_score))}`
        : '',
      r.source_tier ? `source_tier=${r.source_tier}` : '',
      r.event_direction ? `server_direction=${r.event_direction}` : '',
      promptStoryFamily(r),
      (r.scheduled_events || []).length ? `scheduled_events=${r.scheduled_events!.slice(0, 4).join('/')}` : '',
      r.label ? `severity=${r.label}` : '',
      tags ? `types=${tags}` : '',
      r.issuer_linkage ? `linkage=${r.issuer_linkage}` : '',
      comp ? `names=${comp}` : '',
      themeContexts ? `theme_package=${themeContexts}` : '',
      themeExpressions ? `qualified_theme_expressions=${themeExpressions}` : '',
    ].filter(Boolean).join(' · ')
    return `${i}. [${r.source_name} · ${r.region}] ${r.headline}\n   (${bits})`
  })
  return `Skim these ${rows.length} top-ranked wire items and surface every tradable stock idea that clears the bar, up to 6 (or none):\n${lines.join('\n')}`
}

const DIRECTIONS: IdeaDirection[] = ['long', 'short', 'pair']
const PRICED: PricedIn[] = ['priced', 'room', 'unknown']
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Coerce one raw idea against the input rows it must reference. Returns null (dropped) when it fails the
// hard gates a surface idea must clear: traceable evidence, a real ticker, an explicit valid side and
// thesis classification, plus the required mechanism and timing text. `priced_in` alone may safely
// degrade to unknown because it never authorizes a trade and is capped by the deterministic scorer.
export function coerceIdea(raw: any, rowCount: number): RawIdea | null {
  const src = (Array.isArray(raw?.src) ? raw.src : [])
    .map((n: any) => Number(n))
    .filter((n: number) => Number.isInteger(n) && n >= 0 && n < rowCount)
  const uniqSrc = [...new Set<number>(src)]
  if (!uniqSrc.length) return null // an idea with no traceable source event is not surfaceable

  const ticker = typeof raw?.ticker === 'string' ? cleanTicker(raw.ticker) || '' : ''
  if (!ticker) return null // never surface an idea we can't name a ticker for (§5, no source = no claim)

  if (!DIRECTIONS.includes(raw?.direction)) return null // never turn malformed/omitted output into a long
  const direction: IdeaDirection = raw.direction
  const priced_in: PricedIn = PRICED.includes(raw?.priced_in) ? raw.priced_in : 'unknown'
  if (!(THESIS_TYPES as readonly string[]).includes(raw?.thesis_type)) return null
  const thesis_type: ThesisType = raw.thesis_type
  let conviction = Number(raw?.conviction)
  if (!Number.isFinite(conviction)) conviction = 0
  conviction = Math.max(0, Math.min(100, Math.round(conviction)))
  const pairTicker = typeof raw?.pair_with === 'string' ? cleanTicker(raw.pair_with) : null
  const reason = str(raw?.reason, 280)
  const whyNow = str(raw?.why_now, 240)
  // These are required evidence fields in the persisted contract, not cosmetic defaults. Letting a blank
  // mechanism/timing sentence through creates an invalid snapshot downstream and can turn malformed model
  // output into a false success_empty health state. Likewise, a pair without its second leg is not a pair.
  // Only an exact normalized listing is certainly the same leg at this model boundary. Equal symbol bases
  // across two venues are not issuer identity ("ABC" and "ABC.NS" can be unrelated companies); the
  // orchestrator compares independently verified directory identities after both listings resolve.
  if (!reason || !whyNow || (direction === 'pair' && (!pairTicker || normTicker(pairTicker) === normTicker(ticker)))) return null

  return {
    src: uniqSrc,
    ticker,
    company: str(raw?.company, 120) || null,
    exchange: str(raw?.exchange, 24) || null,
    direction,
    pair_with: direction === 'pair' ? pairTicker : null,
    reason,
    why_now: whyNow,
    conviction,
    priced_in,
    thesis_type,
  }
}

/** Validate one provider answer as a whole. A partial answer is not safe: if one sibling row is malformed,
 * filtering it out turns a provider-contract failure into a healthy result and prevents the fallback chain
 * from recovering the missing trade. Duplicate trade identities are invalid too — the persistence layer has
 * one card per ticker+direction, so accepting both would silently overwrite one thesis. A literal [] remains
 * the provider's honest "nothing clears the bar" result. */
export function coerceCompleteIdeaRows(rawIdeas: unknown[], rowCount: number): RawIdea[] | null {
  if (rawIdeas.length > 6) return null
  const ideas: RawIdea[] = []
  const identities = new Set<string>()
  for (const raw of rawIdeas) {
    const idea = coerceIdea(raw, rowCount)
    if (!idea) return null
    const identity = `${normTicker(idea.ticker)}\u0000${idea.direction}`
    if (identities.has(identity)) return null
    identities.add(identity)
    ideas.push(idea)
  }
  return ideas
}

/**
 * One free-LLM call over the ranked top-N -> candidate ideas. Never throws. Mirrors triageBatch's
 * reliability contract exactly: JSON mode, one retry on a transient 429/5xx, a max_tokens truncation is
 * reported (not half-parsed), and on ok:false the caller must treat the batch as UNPRODUCED (surface no
 * new ideas this pass) — never as "zero ideas confirmed". Provider-agnostic OpenAI-compatible shape, so
 * the same call serves Groq and any overflow provider.
 */
export async function surfaceIdeasBatch(
  rows: IdeaInputRow[],
  opts: SurfaceIdeasOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<SurfaceIdeasResult> {
  if (!rows.length) return { ideas: [], requests: 0, tokens: 0, ok: true }
  const provider = opts.providerLabel || opts.providerId || 'idea'
  const identity = ideaProviderRequestIdentity(opts)
  if (!opts.apiKey) {
    const failure = classifyProviderLocalStateFailure()
    return { ideas: [], requests: 0, tokens: 0, ok: false, note: 'no api key', failureKind: 'request', failure, providerIdentity: identity }
  }
  if (opts.signal?.aborted) return { ideas: [], requests: 0, tokens: 0, ok: false, note: 'idea: provider-chain deadline reached', failureKind: 'request', providerIdentity: identity }
  const standing = opts.stateDir ? readProviderQuarantine(opts.stateDir, identity) : null
  if (standing) {
    const failure = providerFailureFromQuarantine(standing)
    return {
      ideas: [], requests: 0, tokens: 0, ok: false, quarantined: true,
      note: publicProviderQuarantineNote(provider, standing),
      failureKind: legacyFailureKind(failure), failure, providerIdentity: identity,
    }
  }

  let requests = 0
  let tokens = 0
  let lastNote = 'idea fetch error'
  let lastFailure: { failureKind: ProviderFailureKind; failure: ProviderFailureClassification; timedOut?: boolean } = {
    failureKind: 'availability',
    failure: { code: 'transient_upstream', scope: 'provider', action: 'cooldown', providerWide: true },
  }
  const maxAttempts = opts.maxAttempts ?? 2
  const clock = opts.nowMs ?? (() => Date.now())
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (opts.signal?.aborted) break
    const concurrentStanding = opts.stateDir ? readProviderQuarantine(opts.stateDir, identity) : null
    if (concurrentStanding) {
      const failure = providerFailureFromQuarantine(concurrentStanding)
      return {
        ideas: [], requests, tokens, ok: false, quarantined: true,
        note: publicProviderQuarantineNote(provider, concurrentStanding),
        failureKind: legacyFailureKind(failure), failure, providerIdentity: identity,
      }
    }
    const attemptStartedAt = clock()
    try {
      requests++ // one count per fetch invocation, including network/response-decoding failures below
      const requestSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
      const res = await fetchFn(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}`, ...(opts.headers || {}) },
        signal: opts.signal ? AbortSignal.any([opts.signal, requestSignal]) : requestSignal,
        body: JSON.stringify({
          model: opts.model,
          ...(opts.models?.length ? { models: opts.models } : {}),
          temperature: 0.2,
          max_tokens: opts.maxTokens ?? 2500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: IDEA_SYSTEM },
            { role: 'user', content: buildIdeaUserMessage(rows) },
          ],
          ...(opts.extraBody || {}),
        }),
      })
      const rate = parseRate(res)
      if (!res.ok) {
        // Read only to classify safe type/code fields. The body and message never leave this stack frame.
        const rawBody = await res.text().catch(() => '')
        const dailyLimit = opts.requestRemainingHeaderIsDaily === true && res.status === 429 && rate.rpdRemaining === 0
        const failure = honorProviderRetryAfter(classifyProviderHttpFailure(res.status, rawBody), rate.retryAfterMs)
        const failureKind = legacyFailureKind(failure)
        lastNote = publicProviderFailureNote(provider, failure, dailyLimit)
        lastFailure = { failureKind, failure }
        if (((failure.code === 'rate_limited' && !dailyLimit) || failure.code === 'transient_upstream') && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        if (opts.stateDir) quarantineProviderFailure(opts.stateDir, identity, failure, clock())
        return {
          ideas: [], requests, tokens, ok: false, note: lastNote, rate, httpStatus: res.status,
          failureKind, failure, providerIdentity: identity, ...(dailyLimit ? { dailyLimit: true } : {}),
        }
      }
      let data: any
      try {
        data = await res.json()
      } catch (e: any) {
        // A syntactically malformed HTTP-200 envelope is a response-contract failure, not proof that the
        // provider is unavailable. Keep it idea-scoped so this nonessential skim cannot cool core triage.
        // A stream/read failure is transport availability and stays on the retry path below.
        if (e?.name === 'SyntaxError') {
          const failure = classifyProviderContractFailure()
          return { ideas: [], requests, tokens, ok: false, note: 'idea: malformed provider response JSON', rate, failureKind: 'contract', failure, providerIdentity: identity }
        }
        throw e
      }
      tokens += Number(data?.usage?.total_tokens)
        || conservativeChatTokenBound(IDEA_SYSTEM, buildIdeaUserMessage(rows), opts.maxTokens ?? 2500)
      if (data?.choices?.[0]?.finish_reason === 'length') {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'idea: output truncated at max_tokens', rate, failureKind: 'contract', failure, providerIdentity: identity }
      }
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'idea: empty content', rate, failureKind: 'contract', failure, providerIdentity: identity }
      }
      let parsed: any
      try { parsed = JSON.parse(content) } catch {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'idea: non-JSON content', rate, failureKind: 'contract', failure, providerIdentity: identity }
      }
      // An honest empty result has one exact shape: {"ideas":[]}. Treating a missing/wrong `ideas`
      // field as [] makes provider schema drift indistinguishable from "nothing clears the bar" — the
      // same false-green empty state this health contract exists to prevent.
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.ideas)) {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'idea: invalid response schema (expected top-level ideas array)', rate, failureKind: 'contract', failure, providerIdentity: identity }
      }
      const ideas = coerceCompleteIdeaRows(parsed.ideas, rows.length)
      if (!ideas) {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'idea: invalid, duplicate, or excess idea rows', rate, failureKind: 'contract', failure, providerIdentity: identity }
      }
      if (opts.stateDir) clearProviderQuarantine(opts.stateDir, identity, attemptStartedAt)
      return { ideas, requests, tokens, ok: true, rate, providerIdentity: identity }
    } catch (e: any) {
      const failure = caughtFailure(e, provider)
      lastNote = failure.note
      lastFailure = { failureKind: failure.failureKind, failure: failure.failure, ...(failure.timedOut ? { timedOut: true } : {}) }
      if (opts.stateDir) quarantineProviderFailure(opts.stateDir, identity, failure.failure, clock())
      if (opts.signal?.aborted) break
      if (failure.failure.action === 'quarantine') break
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { ideas: [], requests, tokens, ok: false, note: lastNote, providerIdentity: identity, ...lastFailure }
}
