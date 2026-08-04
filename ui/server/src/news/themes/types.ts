// Shapes for the dynamic themes layer — living investment narratives (e.g. "AI data-center buildout",
// "China rebound") that the ranked news firehose is bucketed into. Deliberately dependency-light
// (only the news CompanyGuess type) so the whole themes engine is unit-testable with no I/O.

import type { CompanyGuess, FeedItem } from '../types'

export type ThemeTier = 'hot' | 'active' | 'cooling' | 'parked'
export type ThemeStatus = 'live' | 'merged' | 'retired'
export type OrderTier = 1 | 2 | 3 // first / second / third order (direct → ripple)
export type ImpactSide = 'beneficiary' | 'harmed' | 'mixed'
export type ThemeEvidenceStance = 'supports' | 'challenges'
export type ThemeActivity = 'new' | 'reinforced' | 'challenged' | 'quiet'
export type ThemeConviction = 'high' | 'medium' | 'watch'
export type ThemeHorizon = 'days' | 'weeks' | 'months' | 'years'
export type ThemeExpressionRole = 'direct' | 'bottleneck' | 'enabler' | 'harmed' | 'hedge'

/** Versioned, evidence-bound investment thesis compiled by the existing discovery validator. Raw lexical
 * clusters have no contract and remain internal Context. The model may write the hypothesis, but every
 * source-bearing field is joined back to real member IDs before this object is persisted. */
export interface ThemeNarrative {
  version: 1
  thesis: string
  why_now: string
  why_now_event_id: string
  mechanism_steps: string[]
  horizon: ThemeHorizon
  falsifier: string // analyst-generated test, shown as such; not represented as a sourced fact
  anchor_terms: [string, string]
  evidence: { event_id: string; stance: ThemeEvidenceStance }[]
  // Rows the validator reviewed and found related to the subject but neutral to the causal claim. Keeping
  // these IDs is essential: otherwise a ledger reload cannot distinguish "classified context" from
  // "never reviewed" and silently puts the same row back into the update queue.
  context_event_ids: string[]
  expressions: {
    name_key: string
    side: Exclude<ImpactSide, 'mixed'>
    role: ThemeExpressionRole
    mechanism: string
    evidence_event_ids: string[]
  }[]
  validated_at: string
}

// The beneficiary-map 4×25 impact rubric (.claude/agents/screener/thesis-structure/03_beneficiary-map.md),
// reused verbatim so a theme's company ordering speaks the same language as the gauntlet's tiers.
export interface Impact {
  directness: number // 0–25 (25 = one-step/immediate, 15 = two-step, 5 = three+ step)
  magnitude: number // 0–25 (size of the effect)
  speed: number // 0–25 (how fast it plays out)
  reversibility: number // 0–25 (25 = structurally permanent, 5 = easily hedged/substituted)
  composite: number // sum, 0–100
}

// One member story that named a company — the sourced evidence for why it sits in a theme's order tier
// (§3: no source = no claim). Built at deep-dive read time from the theme's members, never persisted.
export interface CompanyEvidence {
  headline: string // the member headline (English translation preferred), verbatim
  event_id: string // so the UI can open that story in the reader
  score: number // the item's triage_score (0–100) — its materiality
}

// The plain-English "why is this company here" for the deep-dive: a reason read off the placement signals
// plus the member stories that named it. Attached to a ThemeCompany at read time (buildThemeDetail); not
// stored on the theme (keeps the ledger lean, §2), so it is optional on the type.
export interface CompanyWhy {
  reason: string // one plain sentence explaining the order-tier placement
  evidence: CompanyEvidence[] // up to a few member stories that named the company (may be empty)
}

export interface ThemeCompany {
  name: string
  ticker: string | null
  listing_country: string | null
  name_key: string // normName() — the join key
  order: OrderTier
  side: ImpactSide
  impact: Impact
  mention_count: number // # member items naming this company (the realness anchor)
  last_seen: string // ISO
  why?: CompanyWhy // read-time only (the deep-dive) — why this company sits in its order tier + the evidence
}

export interface ThemeSector {
  sector: string // GICS-ish label, no ticker
  order: OrderTier
  side: ImpactSide
  impact: Impact
}

export interface ThemeScores {
  freshness: number // recent flow, time-decayed
  magnitude: number // volume × member materiality/source-tier
  breadth: number // distinct companies/sectors — realness (a flash scores low)
  persistence: number // fraction of recent windows with flow (sustained vs one burst)
  composite: number // 0–100 — the rank key
}

// A compact per-member record kept on the theme (a bounded ring, newest kept) — enough for the
// deterministic scorer to compute freshness/magnitude/persistence without re-reading the firehose.
// The full event is resolved against readFeed() only on the deep-dive API call.
export interface ThemeMember {
  event_id: string
  // Canonical story-family id from the wire deduper. Optional for legacy ledger rows. The first-look
  // evidence gate uses it before normalized-headline fallback so ten wire rewrites of one story count
  // as one corroborating observation, not ten.
  dedup_group?: string
  headline: string
  headline_en?: string | null // English translation (news/lang.ts) — kept so a member older than the feed window still renders in English
  found_at: string // ISO
  score: number // the item's composite triage_score (0–100)
  tier: string // source_tier (primary_filing … unconfirmed)
  source_name?: string // exact publisher/filing source carried into the evidence projection
  url?: string // original evidence URL; optional on legacy ledger rows
  // carried so the theme's company list + order tiers can be rebuilt from its members (score.ts
  // ignores these; assign.ts/order.ts use them). Kept compact.
  companies?: CompanyGuess[]
  event_types?: string[]
  issuer_linkage?: string
  // the ISO alpha-2 country the event is ABOUT (news/geography.ts resolveCountry) — the SAME key the
  // Geography filter + archive search use, so a geo-sliced themes view stays consistent with the wire.
  // Optional: members written before this field existed lack it and are resolved lazily at read time.
  country?: string | null
  // the legacy 8-bucket market region (geo.ts) carried so the lazy country resolver can reproduce the
  // domain-region FLOOR the archive applies (resolveCountry step c) — without it a geo slice and the geo
  // Events list disagree for items whose only geography signal is their source region.
  region?: string
  // canonical commodity subject(s) the member's headline names (news/commodities.ts — 'GOLD' etc.) —
  // the key the commodity-sliced themes view filters on, exactly like `country` for the geo slice.
  // Optional: members written before this field existed are derived lazily at read time.
  commodities?: string[]
}

export interface RelatedTheme {
  theme_id: string
  name: string
  shared_company_keys: number // legacy field name: count of shared validated expression keys
  token_overlap: number // jaccard of validated causal-mechanism tokens (never raw theme keywords)
  kind: 'related' | 'opposite' // opposite = same blast radius, beneficiary vs harmed (a pair trade)
}

export interface Theme {
  theme_id: string // THM-<sha256-8 of initial slug + anchors + evidence identity> — rename-stable
  name: string // "AI data-center buildout"
  slug: string
  description: string // one plain-English line (§21)
  // membership criteria (deterministic assignment — no LLM at assign time)
  keywords: string[] // anchor topic tokens (lowercased)
  company_keys: string[] // normName keys that strongly belong
  event_type_affinity: string[] // e.g. ['product','capital_actions']
  // members — a bounded ring (newest kept, cap themesMaxMembers); carries just enough to score
  // without re-reading the firehose. The deep-dive API resolves event_id → full FeedItem.
  members: ThemeMember[]
  member_count_total: number // lifetime counter (uncapped)
  companies: ThemeCompany[]
  sectors: ThemeSector[]
  // ranking
  scores: ThemeScores
  tier: ThemeTier
  fresh_flow: number // # members added in the last freshness window (for the UI sparkline tip)
  flow_series: number[] // recent per-HOUR member counts (the sparkline data; bounded, last sparkWindows h)
  // The long-horizon DAILY accumulator (one bucket per UTC day, newest last, bounded ring) that powers
  // the "last 7d / 1m / 3m" time-window views. Maintained by score.ts (ensureDaily/rollDaily/bumpDaily);
  // optional so old ledger entries load and get seeded on the next cycle. See score.ts DAILY_WINDOWS.
  flow_daily?: number[]
  flow_daily_day?: string // UTC date (YYYY-MM-DD) of the newest flow_daily bucket
  related_themes: RelatedTheme[]
  // lifecycle
  status: ThemeStatus
  merged_into: string | null
  first_seen: string // immutable lifecycle start; evidence excerpts/eviction must never move it forward
  last_flow: string // ISO of the most recent member item
  generation: 'deterministic' | 'groq' | 'claude' // provenance of the discovery/naming
  narrative?: ThemeNarrative // absent on raw/legacy clusters; those fail closed until revalidated
  rev: number // bumped on every mutation (SSE dedup / change detection)
  // server-only: set when a self-heal shifted an LLM-named theme's identity enough that its persisted
  // name/description no longer describe the members (e.g. the strangers were purged). The next discovery
  // pass folds ≤renamePerPass flagged themes into its existing namer call. Additive; ignored by readers.
  needs_rename?: boolean
  // Fresh and automatically migrated deterministic clusters stay here until the optional validator
  // explicitly accepts or rejects them. A provider/cap/malformed-response failure therefore retries on a
  // later discovery pass even when that pass creates no new cluster.
  needs_validation?: boolean
  // A new row matched the complete validated anchor pair. The existing contract remains safe to show,
  // while the next bounded validator batch decides whether the update supports, challenges or is context.
  needs_narrative_update?: boolean
  // Exact rows awaiting the next bounded validator pass. A boolean alone lost rows beyond the prompt cap;
  // this FIFO drains across passes and keeps every arrival classifiable as support/challenge/context.
  pending_narrative_event_ids?: string[]
  // Durable queue fairness: repeated updates on two early ledger rows cannot starve later validation debt.
  validation_queued_at?: string
  validation_attempted_at?: string
}

/** Explicit invalidation for a theme that disappeared from the live index. SSE clients must consume this
 *  instead of inferring removal from the absence of a later `theme-update` event. */
export interface ThemeRemoval {
  theme_id: string
  reason: 'retired' | 'merged'
  merged_into: string | null
  rev: number
}

// A compact projection for the live SSE bus + the index list view (no member arrays).
export interface ThemeSummary {
  theme_id: string
  name: string
  description: string
  tier: ThemeTier
  composite: number
  fresh_flow: number
  flow_series: number[] // hourly (last sparkWindows h)
  flow_daily: number[] // daily (last DAILY_WINDOWS days, newest last) — drives the long time-window views
  // The durable all-arrival heat accumulator. `flow_daily` above is rebuilt from the bounded qualified
  // evidence excerpt; this separate series preserves months of observed traffic without presenting raw or
  // context rows as thesis proof.
  heat_flow_daily: number[]
  member_count: number
  first_seen: string // immutable theme lifecycle start, not the oldest currently retained evidence row
  // Keep heat's component scores visible. `composite` remains above for old clients; this additive copy
  // lets the first-look explain heat without treating it as proof that a theme is investable.
  score_components: ThemeScores
  // Raw, bounded proof — never a synthesized claim. Rows are distinct story families/headlines and
  // routine paperwork is excluded, so repetition cannot manufacture corroboration.
  evidence: ThemeEvidence[]
  narrative: Omit<ThemeNarrative, 'anchor_terms' | 'evidence' | 'expressions'> | null
  activity: ThemeActivity
  conviction: ThemeConviction
  off_core_member_count: number
  /** Authoritative, qualification-derived trade expressions. Each ticker is tied to the exact
   * narrative-supporting evidence row that proved it; downstream consumers may narrow this set but
   * must never expand it from model output or from the display ordering of top_companies. */
  qualified_expressions: ThemeQualifiedExpression[]
  // The old four fields stay intact; the additive fields expose the actual listing/centrality evidence
  // behind each expression so clients do not infer it from order alone.
  top_companies: {
    name: string
    ticker: string | null
    listing_country: string | null
    order: OrderTier
    side: ImpactSide
    mention_count: number
    impact_composite: number
    last_seen: string
  }[]
  assessment: ThemeAssessment
  related_themes: { theme_id: string; name: string; kind: 'related' | 'opposite' }[]
  last_flow: string
  rev: number
}

export interface ThemeQualifiedExpression {
  name: string
  name_key: string
  ticker: string
  listing_country: string | null
  side: Exclude<ImpactSide, 'mixed'>
  role: ThemeExpressionRole
  mechanism: string
  evidence_event_ids: string[]
}

export interface ThemeEvidence {
  event_id: string
  headline: string
  found_at: string
  score: number
  source_tier: string
  source_name: string | null
  url: string | null
  stance: ThemeEvidenceStance
}

export type ThemeAssessmentStatus = 'actionable' | 'forming' | 'context'

/** Evidence counts used by the first-look admission gate. There is deliberately no weighted aggregate:
 *  each gate is inspectable, and ordering is lexicographic (actionable → forming → context). */
export interface ThemeAssessmentMetrics {
  recent_6h_flow: number // distinct narrative-supporting rows aged 0–6h
  prior_6h_flow: number // the same measure aged >6–12h (recent − prior = visible acceleration)
  unique_evidence_count: number // distinct non-routine rows, including unconfirmed rows
  high_quality_evidence_count: number // filing/official/company/news rows (not social/unconfirmed)
  narrative_support_count: number // distinct rows carrying at least one recurring narrative token
  narrative_coherence_pct: number // narrative_support_count / unique_evidence_count × 100
  recurring_narrative_token_count: number // non-company theme tokens recurring in >=2 distinct rows
  first_order_directional_ticker_count: number // syntactically-clean ticker-linked order-1 names with raw proof; listing/liquidity unverified
  recent_24h_support_count: number
  recent_24h_challenge_count: number
  off_core_evidence_count: number
}

export interface ThemeAssessment {
  status: ThemeAssessmentStatus
  activity: ThemeActivity
  conviction: ThemeConviction
  reasons: string[] // plain facts that cleared gates
  blockers: string[] // explicit failed gates; empty only when actionable
  metrics: ThemeAssessmentMetrics
}

export interface ThemesIndex {
  generated_at: string
  /** Wall-clock time of the read-time qualification projection. `generated_at` remains the last
   * successful Themes pipeline stage, so a stopped scanner cannot look live merely because HTTP works. */
  projected_at?: string
  themes: ThemeSummary[]
  counts: { hot: number; active: number; cooling: number; parked: number; retired: number; total: number }
  history_days: number // how many days of real daily-flow history exist (caps how far the window selector can honestly reach)
}

export interface CompaniesByOrder {
  first: ThemeCompany[]
  second: ThemeCompany[]
  third: ThemeCompany[]
}

// The deep-dive payload: a theme + its ranked member events (full FeedItems) + companies grouped by order.
export interface ThemeDetail {
  theme: ThemeSummary
  scores: ThemeScores
  members: FeedItem[]
  companies_by_order: CompaniesByOrder
  sectors: ThemeSector[]
  related_themes: RelatedTheme[]
  keywords: string[]
}

// The minimal item view the themes engine needs from a triaged item / feed item (so assign/score can
// run over either a fresh TriagedItem or a backfilled FeedItem without coupling to their full shapes).
export interface ThemeItemView {
  event_id: string
  dedup_group?: string // canonical story family; persisted onto ThemeMember for evidence dedupe
  headline: string
  headline_en?: string | null // English translation (news/lang.ts) — carried onto the member so themes render in English
  found_at: string // ISO
  companies?: CompanyGuess[]
  event_types?: string[]
  issuer_linkage?: string
  triage_score?: number
  materiality_pre_score?: number
  source_tier?: string
  source_name?: string
  url?: string
  scope?: string
  region?: string // legacy 8-bucket market region (geo.ts) — a coarse floor
  country?: string | null // ISO alpha-2 the event is ABOUT (geography.ts) — persisted onto the member for geo slicing
  commodities?: string[] // canonical commodity tag(s) (news/commodities.ts) — persisted onto the member for commodity slicing
}

// One mutation line appended to screener/ledger/themes.ndjson (last-line-per-theme_id wins on rebuild).
export interface ThemeMutation {
  kind: 'theme'
  ts: string
  theme: Theme
}
