export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'
export type NodeStatus = 'dormant' | 'locked' | 'ready' | 'notready' | 'queued' | 'running' | 'done' | 'failed'
// engine reachability, driven by the /api/health heartbeat (lib/store). `your-network` = the visitor's
// own connection is down; `session-expired` = Cloudflare Access cookie gone (reachable but not JSON-ok).
export type HealthState = 'connecting' | 'online' | 'reconnecting' | 'engine-offline' | 'your-network' | 'session-expired'

// Per-source health for the Sources panel (GET /api/news/sources).
export type SourceHealth = 'healthy' | 'quiet' | 'failing' | 'idle'
export interface SourceRow {
  name: string
  region: string
  feed_type: string
  via: string
  health: SourceHealth
  last_data_at: string | null
  items_24h: number
  items_7d: number
  fetch_status: 'ok' | 'unchanged' | 'empty' | 'error' | null
  last_error: string | null
  last_ok_at: string | null
}
export interface SourcesReport {
  updated_at: string
  counts: { total: number; healthy: number; quiet: number; failing: number; idle: number }
  sources: SourceRow[]
}

export interface AgentNode {
  key: string
  module: string
  nn: string
  name: string
  slug: string
  layer: number
  failFast: boolean
  description: string
  tools: string[]
  requiredUpstream: string[]
  soloRunnable: boolean
  isSynthesis: boolean
}

// ---- document intake (the scoped rerun plan, frameworks/INTAKE.md) ----
// Mirrors the server's readIntakePlan() shape. The plan is ADVISORY guidance over the staleness floor —
// it never claims a module is fresh; it only narrows which orbs a rerun needs to touch.
export interface IntakeEntryOrb { module: string; agent: string; why: string; confidence: number }
export interface IntakeNewDoc {
  path: string
  sha256?: string | null
  provider?: string | null
  source_type?: string | null
  tier?: number | null
  as_of?: string | null
  claims_summary: string
  materiality_score: number
  impact_direction: string
  entry_orbs: IntakeEntryOrb[]
}
export interface IntakeRerunCommand { command: string; module: string; agent: string; cascade_modules: string[]; triggered_by: string[] }
export interface IntakeRerunPlan {
  materiality_gate: number
  entry_orbs: { module: string; agent: string }[]
  commands: IntakeRerunCommand[]
  note_only: { path: string; reason: string }[]
}
export interface IntakePlan {
  schema_version: string
  ticker: string
  run_root: string
  scan_date: string
  scanned_at?: string
  watermark?: string
  new_docs: IntakeNewDoc[]
  rerun_plan: IntakeRerunPlan
  verdict: 'scoped_rerun' | 'note_only' | 'insufficient'
  summary: string
  analyzed_at: string
  widened: string[]
  // Server-stamped (intake.ts): true iff the analysis provably accounts for the whole current pool.
  // OPTIONAL on purpose — an older server omits it, and the affirmative "no new data" state must require
  // `=== true` (a positive match), never treat an absent field as current (deploy-skew fail-closed).
  pool_current?: boolean
}
// The scoping the intake plan applied to a "Complete the thesis" plan (client-only), so the panel can
// explain "kept N the evidence doesn't touch; re-running the affected ones" and offer the escape hatch.
export interface ThesisPlanIntake { affected: string[]; keep: string[]; scanDate: string; summary: string }

// A structured data need the run's terminal synthesizer surfaced (decision_record.json data_needs[]) —
// an external series whose absence caps conviction, so a durable connector can be built to feed it in.
// Mirrors the DataNeed the server reader emits (ui/server/src/data-needs.ts).
export interface DataNeed {
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  filing_required: boolean
  entry_modules: string[]
  suggested_source: { name: string; acquisition: string; licensing?: string }
  tier: number
  cadence: string
  next_release?: string
  built_by?: string // a .claude/connectors/<id> whose `satisfies` covers this need_id — the loop is closed
}
export interface DataNeedsRead {
  subject: string
  swarm: string
  run_root: string
  decided_at: string
  needs: DataNeed[]
  widened: string[]
}

// ---- data pipeline: add a source → live relevance scan → build a connector → open a PR ----
// (server: pipeline-store.ts / pipeline-scan.ts / connector-dispatch.ts)
export type PipelineSourceKind = 'api' | 'scrape' | 'web' | 'file'
export type PipelineStatus = 'new' | 'scanning' | 'scanned' | 'building' | 'pr_open' | 'assessed' | 'done' | 'wontfix'
export type ScanRelevance = 'exact' | 'partial' | 'none'
export interface ScanVerdict {
  relevance: ScanRelevance
  confidence: number
  series: string
  matched_need_ids: string[]
  entry_modules: string[]
  acquisition: string
  tier: number
  cadence: string
  host: string
  endpoint_hint: string
  verdict_note: string
  buildable: boolean
}
export interface PipelineView {
  pipeline_id: string
  subject: string
  swarm: string
  need_id: string | null
  series_hint: string
  source_url: string
  source_kind: PipelineSourceKind
  sample: string
  note: string
  user_id: string
  submitted_at: string
  status: PipelineStatus
  verdict: ScanVerdict | null
  pr_url: string | null
  connector_id: string | null // the connector the build authored — the join to its live feed health
  last_note: string
  last_update_at: string
}
export interface AddPipelineSourceInput {
  need_id?: string | null
  source_url: string
  source_kind?: PipelineSourceKind
  series_hint?: string
  sample?: string
  note?: string
}

// ---- the Data Library read (server: pipelines.ts / GET /api/pipelines) ----
// Mirrors the server reader exactly: snake_case fields are preserved from the data_needs contract,
// camelCase for manifest-derived fields. The whole read is fail-closed server-side (malformed
// manifests dropped + audited in `widened`); a pool-less host serves poolAvailable:false + 'unknown'.
// Two independent facts about the same feed, deliberately kept apart: `status` is the FILE side (is there a
// recent file in the pool), `health` is the FETCH side (did the last sweep of the source succeed). A feed can
// be fresh-but-broken or stale-but-healthy, and collapsing them would hide exactly the case worth seeing.
export type FeedHealthState = 'ok' | 'failing' | 'broken' | 'no_pool' | 'manual' | 'pending' | 'never_run'
export interface PipelineSubjectStatus {
  subject: string
  status: 'fresh' | 'stale' | 'missing' | 'unknown'
  latestAsOf?: string
  ageDays?: number
  latestFile?: string
  health: FeedHealthState
  lastSweepAt?: string
  lastError?: string
  failStreak: number
}
export interface PipelineHelp {
  swarm: string
  subject: string
  need_id: string
  series: string
  why_it_caps: string
  entry_modules: string[]
}
export interface PipelineEntry {
  id: string
  series: string
  provider: string
  acquisition: string
  sourceType: string
  tier: number
  tierCorrected?: boolean
  license?: string
  hostAllowlist: string[]
  cadence: string
  stalenessSlaDays: number
  entry: string
  verify: string
  outputPath: string
  outputSchema?: unknown
  subjects: string[]
  satisfies: string[]
  helps: PipelineHelp[]
  statuses: PipelineSubjectStatus[]
  verdict: PipelineVerdict
  verdictNote: string
  repair: { status: 'none' | 'repairing' | 'pr_open' | 'assessed'; prUrl: string | null }
}
// The one-word answer to "is this feed working?" — rolled up across its subjects, server-side.
export type PipelineVerdict = 'live' | 'attention' | 'broken' | 'unknown'
export interface RecommendedNeed {
  key: string
  swarm: string
  subject: string
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  suggested_source: { name: string; acquisition: string; licensing?: string }
  tier: number
  cadence: string
  next_release?: string
  entry_modules: string[]
}
export interface PipelinesRead {
  generatedAt: string
  poolAvailable: boolean
  pipelines: PipelineEntry[]
  recommended: RecommendedNeed[]
  widened: string[]
  runner?: RunnerStatus // absent from an older engine mid-deploy (§5) — the header falls back to silence
}
// What is keeping the feeds alive on this host. `lastFetchSweepAt` is empirical (the newest row in the fetch
// ledger), so it stays truthful whether or not the scheduled fetcher is installed here.
export interface RunnerStatus {
  watchdogOn: boolean
  autoRepairOn: boolean
  pollIntervalMin: number
  lastFetchSweepAt: string | null
}

// ---- find feeds → build them → watch it happen (server: pipeline-discover.ts + the build stream) ----
// A candidate the deep search found. It is already persisted as an ordinary pipeline source carrying this
// verdict, so `pipeline_id` can be handed straight to the build route.
export interface DiscoveredFeed {
  pipeline_id: string
  source_url: string
  why: string
  verdict: ScanVerdict
  building: boolean // the one-click path already sent this one to the build engine
}
// One thing the coding agent did, as it happens.
export interface BuildStep {
  tool: string // a tool name, or 'say' for a line of the agent's own prose
  target: string
}

// ---- "What changed since the last version" (server: what-changed.ts / run-diff.ts) ----
// The diff is computed SERVER-side and arrives finished. Never re-derive it in a selector: a
// constructing zustand selector returns a fresh reference on every store write (the getSnapshot loop),
// and two surfaces computing the same diff twice could disagree about the call.
export type ChangeVerdict = 'identical' | 'call_held' | 'anchors_moved' | 'call_changed'
export type ChangeTone = 'better' | 'worse' | 'flat' | 'neutral'
export type ChangePolarity = 'higher_better' | 'lower_better' | 'neutral' | 'categorical' | 'structural' | 'ambiguous'

export interface AnchorDelta {
  field: string
  label: string
  prev: string | number | null
  cur: string | number | null
  present: { prev: boolean; cur: boolean }
  moved: boolean
  direction: 'up' | 'down' | 'flat' | 'changed'
  polarity: ChangePolarity
  tone: ChangeTone
  note?: string
}
export interface ListDelta {
  field: string
  label: string
  prevCount: number
  curCount: number
  added: string[]
  removed: string[]
  reworded: { key: string; prev: string; cur: string }[]
  moved: boolean
  note?: string
}
export interface ModuleDelta {
  module: string
  prevScore: number | null
  curScore: number | null
  scoreMoved: boolean
  scoreReadable: boolean
  verdictChanged: boolean
}
export interface RecordDiff {
  verdict: ChangeVerdict
  headline: string
  subline: string
  anchors: AnchorDelta[]
  anchorsMoved: boolean
  lists: ListDelta[]
  modules: ModuleDelta[]
  prose: { field: string; label: string }[]
  evidenceCount: number
  wordingCount: number
  belowCount: number
  tailSummary: string // THE one user-facing count sentence — render verbatim, never re-derive
  hasInverted: boolean
}
export interface VersionRef {
  rev: string
  shortRev: string
  date: string
  subject: string
  pathAtRev: string
  uncommitted?: true
}
export interface WhatChangedCompared {
  state: 'compared'
  runRoot: string
  prev: VersionRef
  cur: VersionRef
  versionsFound: number
  renamedFrom?: string
  diff: RecordDiff
  memo: { state: 'unchanged' | 'changed' | 'added' | 'unknown'; note?: string }
}
export interface WhatChangedNone {
  state: 'first_version' | 'no_history'
  runRoot: string
  cur: VersionRef | null
  reason: 'first_version' | 'untracked' | 'not_committed' | 'no_repo' | 'prior_unreadable' | 'unavailable'
  detail: string
  versionsFound: number
}
export type WhatChangedRead = WhatChangedCompared | WhatChangedNone

// ---- live market price (/api/quote) ----
// The decision banner's call is priced on its decision date; this is where the price is NOW. Every
// field mirrors ui/server/src/news/equity-quote.ts exactly. The whole read is nullable and every
// consumer must gate on a POSITIVE match (DESIGN.md §5 deploy skew): an engine 15-30s older than the
// bundle 404s /api/quote, so `quote` arrives absent and the live cells simply do not render.

export interface LiveQuote {
  ticker: string
  /** The quote-service symbol that matched — shown in the tooltip so the identity is verifiable. */
  symbol: string
  name: string | null
  exchange: string | null
  currency: string
  price: number
  as_of: string | null
  /** The timestamp is a settled session, i.e. the last close rather than a live tick. */
  as_of_is_close: boolean
  /** The feed is exchange-delayed — so nothing on screen may claim to be real-time. */
  delayed: boolean
  source: 'cnbc'
  /** A real price, but not a fresh one: the last refresh failed. */
  stale: boolean
}

/** Why there is no price. Mirrors the server's AbsentReason so absence can be explained, not left blank. */
export type QuoteAbsentReason =
  | 'no_currency' | 'unknown_symbol' | 'currency_mismatch'
  | 'name_mismatch' | 'stale_feed' | 'implausible_price' | 'feed_unavailable'

/** The frozen call re-based onto the live price. The engine's own numbers are returned unchanged. */
export interface CallVsLive {
  entry_price: number
  entry_price_timestamp: string | null
  live_price: number
  currency: string
  move_since_call_pct: number
  implied_target: number
  expected_return_pct: number
  live_expected_return_pct: number
  expected_return_delta_pp: number
}

export interface QuoteRead {
  ticker: string | null
  quote: LiveQuote | null
  call: CallVsLive | null
  reason: QuoteAbsentReason | null
}

export interface ModuleNode {
  name: string
  order: number
  dependsOn: string[]
  layers: Record<string, AgentNode[]>
  agentCount: number
  depsComplete?: boolean // ticker graph only: are this module's dependsOn syntheses on disk?
  missingDeps?: string[]
}
export interface SwarmGraph {
  modules: ModuleNode[]
  masterSynthesizer: { name: string; description: string }
  totals: { modules: number; agents: number; specialists: number; synthesis: number }
  // present only for non-research swarms (the research payload is unchanged)
  swarm?: { id: string; label: string; color: string; unit: string; layout: string; order: number }
}

// ---- swarms (the cockpit can host multiple — research is the grandfathered default) ----
// verdictField: the swarm's self-declared routing verdict key (SWARM.md) for reading its decision
// record generically; absent for research (whose records use `decision`) and on older engines.
// A swarm's self-declared news-wire capability (SWARM.md `wire:` block, surfaced by /api/swarms).
// ABSENT on old servers (deploy skew) and for swarms that declare none — every consumer must gate on
// positive presence (`meta.wire` set), never default the surface on (ui/web/DESIGN.md, deploy-skew rule).
export interface SwarmWireMeta {
  eventScope?: string // pre-filter the swarm's wire to this scope bucket (e.g. 'commodity')
  groupBy?: string // 'subject' => the rail groups + filters by the swarm's canonical subjects
  subjectField?: string // the FeedItem field carrying the canonical subject id (e.g. 'commodity')
  pulse?: string // repo-relative pulse config path — truthy => /api/swarm/pulse is available
  defaultView?: string // rail landing tab ('themes' | 'ranked' | 'latest')
}
export interface SwarmMeta { id: string; label: string; color: string; unit: string; order: number; layout: string; verdictField?: string; wire?: SwarmWireMeta }

// ---- screener board (the canonical pipeline state the Pipeline panel renders) ----
export interface BoardInboxRow {
  inbox_id: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (server news/lang.ts)
  url?: string
  source_name: string
  input_nature?: string
  found_at: string
  prelim_note?: string
  dedup_status?: string
  consumed?: boolean
  launched_signal_id?: string | null
  // additive: the autonomous news ingester's cheap pre-triage (absent on manual-sweep rows)
  triage_score?: number | null
  triage_reason?: string
  region?: string
  relevance?: string
  materiality_pre_score?: number | null
  event_types?: string[]
  issuer_linkage?: string
  companies?: CompanyGuess[]
  size_bucket?: string
  // additive: human state (cockpit dismiss/restore)
  dismissed?: boolean
  dismissed_at?: string
  dismissed_by?: string
}

// A company the cheap scanner GUESSED from a headline — never verified extraction.
export interface CompanyGuess {
  name: string
  ticker: string | null
  listing_country: string | null
}

// The per-component build-up behind triage_score (ui/server/src/news/rank.ts). The Groq title-read is
// the anchor (`materiality`); the rest are deterministic §4-hierarchy adjustments, summed then clamped
// to 0–100. Persisted on every firehose item so the cockpit can show the WHY, not just the number.
export interface RankFactors {
  materiality: number // the Groq title read (0–100) — the anchor
  source_tier: number // §4 source-hierarchy bonus (filing > official > company > news > rumour)
  scope: number // company-specific vs broad/macro bonus
  event: number // strongest event-type bonus
  size: number // company-size bonus
  recency: number // freshness bonus
  materiality_label_floor: number // floor-correction when event_materiality_label outranks the raw score (absent on pre-field items)
  quantified: number // bonus when the headline pairs a quantified figure with an impact keyword (absent on pre-field items)
  boost_weight?: number // global multiplier applied to the summed adjustments for THIS score (1 = none); absent on pre-field items
  scope_id: string // which scope won (single_name / sector / macro …)
  source_tier_id: string // which §4 tier won (primary_filing / news …)
}

// One triaged item on the live news wire (a firehose kind:"item" record).
export interface FeedItem {
  kind: 'item'
  ts: string
  event_id: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (server news/lang.ts); absent/null when the original is English
  headline_lang?: string | null // source language named (e.g. "Finnish") — for the "original · X" affordance
  url: string
  domain: string
  source_name: string
  via: 'gdelt' | 'rss' | 'nse' | 'hkex' | 'asx' | 'gov' | 'reddit'
  region: string // legacy 8-bucket region (US/IN/JP/GB/CN/KR/GLOBAL/OTHER) — kept for back-compat
  country?: string | null // ISO 3166-1 alpha-2 (news/geography.ts) — the country-level Geography filter's key
  input_nature: string
  triage_score: number
  band: 'pick' | 'watch' | 'drop'
  triage_reason: string
  relevance: string
  event_types: string[]
  issuer_linkage: string
  companies: CompanyGuess[]
  size_bucket: string
  scope?: string // derived company-vs-broad bucket (news/scope.ts) — present on every served item
  source_tier?: string // derived §4 source tier (Filing / Official data / Company / News / Unconfirmed)
  commodity?: string // canonical commodity subject (server news/commodities.ts, e.g. 'GOLD') — ABSENT on old servers / non-commodity items; consumers fall back to the client extractor (lib/wire.ts)
  commodities?: string[] // all canonical commodity subjects the headline names (≤4), same absence rule
  topics?: string[] // CapIQ-style subject topics the headline names (server news/topics.ts — 'artificial_intelligence', 'cybersecurity', …); [] when none, ABSENT on old servers (deploy-skew: treat undefined as none)
  scheduled_events?: string[] // forward/scheduled corporate events this headline announces (server news/schedule.ts — 'results_date', 'ex_dividend', …); same absence rule
  event_materiality_label?: string // low / medium / high / critical — re-derived from the boosted triage_score, never contradicts it
  event_direction?: string // positive / negative / mixed / neutral / unknown — informational only, never scored
  event_scope?: string // company_specific / sector / commodity / macro / geopolitical / regulatory / generic_media
  rank_factors?: RankFactors // the per-component score build-up — present on every firehose item (drives "Why this score")
  dedup_status: string
  dedup_group?: string // story-cluster id (news/dedup.ts) — the wire shows one row per group
  inboxed: boolean
}

// ---- on-demand event enrichment (GET /api/news/enrich) ----
export interface PriorCoverage {
  ticker: string
  kind: 'data_pool' | 'analysis'
  detail: string
  path?: string
}
export interface SecFiling {
  form: string
  form_label?: string
  form_meaning?: string // one plain-English sentence: what this form IS
  routine?: boolean // a high-volume filing that rarely moves the stock on its own
  items: { code: string; label: string }[]
  filer?: string
  period?: string
  filed?: string
}
export interface RelatedEvent {
  event_id: string
  ts: string
  headline: string
  headline_en?: string | null // English translation of a non-English headline (server news/lang.ts)
  source_name: string
  triage_score: number
  scope?: string
}
export type CompanyRole = 'subject' | 'acquirer' | 'target' | 'forecaster' | 'mentioned'
export type PartyOrder = 'first' | 'second'
// public = the firm has tradable listed equity; private = privately held (PE/family-owned, a fund, an unlisted
// subsidiary), so not directly investable; unknown = the read couldn't tell. Optional so a ≤12h-old cached
// enrichment (produced before the field existed) still renders — the client derives/defaults it.
export type ListingStatus = 'public' | 'private' | 'unknown'
export interface ArticleCompany { name: string; ticker: string | null; role: CompanyRole; listing_status?: ListingStatus; listing_country?: string | null; exchange?: string | null }
// A gainer / exposed party with its transmission read. `mechanism` is the live field; `basis` is kept
// optional so a ≤12h-old cached enrichment (produced before the upgrade) still renders its blurb.
export interface ArticleParty {
  name: string
  named_in_article: boolean
  ticker?: string | null
  listing?: string | null // exchange/country anchor — the investability cue
  mechanism?: string // HOW the event hits this party's economics (the transmission)
  basis?: string // legacy field name for mechanism (back-compat with cached briefs)
  magnitude?: string | null // rough size where the body supports it
  horizon?: string | null // when it bites
  order?: PartyOrder | null // first = directly hit; second = downstream/substitute
}
// Does this event move earnings / guidance / valuation / the thesis / risk / a portfolio decision — the
// structured, quantified sibling of `gist` (which just states what happened). Mirrors the server shape in
// ui/server/src/news/triage/groq.ts (this repo hand-duplicates enrichment types between server and client).
export type ImpactDirection = 'positive' | 'negative' | 'mixed' | 'neutral' | 'unknown'
export type ImpactMagnitude = 'low' | 'medium' | 'high' | 'critical'
export type AffectedMetric =
  | 'revenue' | 'ebitda' | 'pat_net_income' | 'eps' | 'cash_flow' | 'debt' | 'capex'
  | 'commodity_price' | 'valuation_multiple' | 'regulatory_risk' | 'thesis_quality'
export interface NewsImpact {
  impact_direction: ImpactDirection
  impact_magnitude: ImpactMagnitude
  affected_metric: AffectedMetric[] // multi-select — a profit warning often hits revenue+PAT+EPS at once
  quantified_impact_available: boolean
  extracted_numbers: string[] // verbatim figures pulled from the body
  quick_dirty_calculation: string // "" when not computable — the reader shows "insufficient data for valuation impact" instead
  why_it_matters: string // ties the metric change to earnings/guidance/valuation/thesis/risk/a portfolio decision
  analyst_takeaway: string // the one-line takeaway
  confidence: number // 0-100
}
export interface EventEnrichment {
  event_id: string
  ok: boolean
  fetched_at: string
  note?: string
  summary?: string // regex fallback when the article-body read is unavailable
  // English rendering of a NON-ENGLISH `summary` (server enrich.ts, from the read's `story` synopsis) — set
  // only for a foreign-language item so THE STORY reads in English; the original stays in `summary` beneath.
  summary_en?: string | null
  summary_lang?: string | null // the source language named (e.g. "Spanish"), for the "original · X" label
  published?: string
  sec?: SecFiling
  prior_coverage: PriorCoverage[]
  related: RelatedEvent[]
  // the article-body read (one Groq pass)
  gist?: string[]
  market_angle?: string // the single market-moving thread + transmission to asset prices (the "so what")
  companies?: ArticleCompany[]
  beneficiaries?: ArticleParty[]
  exposed?: ArticleParty[]
  whats_priced?: string // the obvious read the market likely already holds
  the_edge?: string // a non-obvious angle the body supports — absent if none
  watch_item?: string // the single next data point / number that confirms or kills the read
  theme?: string
  news_impact?: NewsImpact // does this move earnings/guidance/valuation/thesis/risk/a portfolio decision — direction, size, numbers, confidence
  // read-quality flags from the server: `complete` = the best obtainable read (rich brief, SEC parse, filing
  // floor, or retries exhausted). A degraded read (complete falsy) self-heals — reopening the event re-fires
  // the read instead of freezing a useless dek for hours. See ui/server/src/news/enrich.ts.
  complete?: boolean
  degraded?: boolean
  read_attempts?: number
  // set when the publisher blocked the direct read and the story was pieced together from OTHER outlets
  // reporting the same event (secondary-wire corroboration, NOT a direct read — labelled honestly).
  corroborated?: { count: number; domains: string[] }
  // provenance when the story was NOT read from the original page: the filing document itself (the
  // exchange PDF the event announces — a better source than the page), or another approved outlet
  // carrying the same story (used when the original blocked the read). Labelled honestly in the reader.
  read_from?: { kind: 'filing_doc' | 'alternate'; url?: string; domain?: string; source_name?: string }
}

// ---- screener wire → research data bridge (ui/server/src/research-bridge.ts) ----
// A tracked subject this event has already been routed to (a note in its data/<TICKER>/ pool).
export interface EventResearchLink {
  ticker: string
  path: string
}

// ---- screener card feedback (ui/server/src/screener-feedback.ts is the source of truth) ----
export type FeedbackType = 'irrelevant' | 'score_too_high' | 'score_too_low' | 'wrong_company' | 'wrong_sector' | 'duplicate_stale' | 'should_be_higher' | 'relevant' | 'other'
export interface FeedbackSubmitInput {
  event_id: string
  feedback_type: FeedbackType
  feedback_reason?: string
  current_score?: number | null
  event_title?: string
  source?: string
  company_name?: string
  company_ticker?: string
  sector_theme?: string
  score_breakdown?: Record<string, unknown> | null
}
export interface FeedbackRecord {
  feedback_id: string
  kind: 'feedback' | 'feedback_undo'
  event_id: string
  undoes?: string
  user_id: string
  current_score: number | null
  feedback_type: FeedbackType | null
  feedback_reason: string
  event_title: string
  source: string
  company_name: string | null
  company_ticker: string | null
  sector_theme: string | null
  score_breakdown: Record<string, unknown> | null
  submitted_at: string
}
export interface FeedbackSummary {
  total: number
  active_total: number
  by_type: Record<FeedbackType, number>
  top_reasons: { reason: string; count: number }[]
  clustered_reasons: { scope: string; count: number; sample_reasons: string[] }[]
  generated_at: string
}

// AUTO-TUNE — the automatic feedback→weights loop's audit + controls (rank-weights-audit.ts).
export interface WeightDelta {
  dimension: string
  category: string
  before: number
  after: number
}
export interface WeightChange {
  v: 1
  change_id: string
  ts: string
  actor: string
  kind: 'apply' | 'revert'
  reverts?: string
  status?: string
  deltas: WeightDelta[]
  evidence_feedback_ids?: string[]
  backtest?: { holdout_evaluable: number; directional_improvement: number | null; passes: boolean | null } | null
  tuner_generated_at?: string
  note?: string
  reverted?: boolean
}
export interface AutotuneState {
  paused: boolean
  pins: string[] // "dimension:category"
  daily: { date: string; count: number }
}
export interface RankWeightChanges {
  changes: WeightChange[]
  autotune: AutotuneState
}

export interface NewsCycle {
  ts: string
  ok: boolean
  fetched: number
  candidates: number
  picked: number
  watched: number
  dropped: number
  inboxed: number
  note?: string
}

// The structured reason a cycle deferred items + the Haiku fallback's state (mirrors the server enums in
// ui/server/src/news/types.ts). Kept as string unions so an older server sending an unknown value degrades
// to the raw note rather than crashing the panel.
export type DeferReason = 'aborted' | 'free-budget-spent' | 'groq-cooldown' | 'paced' | 'batch-failed'
export type LastResortState = 'off' | 'scored' | 'usd-cap' | 'plan-quota' | 'cooling' | 'available'

// One ingest cycle's outcome, streamed live over /api/news/stream as `news-cycle`. Mirrors the server's
// CycleSummary (ui/server/src/news/types.ts). Every field past `dropped` is optional so an OLDER engine
// (the ~20-30s deploy-skew window where the new bundle is served by the old server) simply renders less,
// never a wrong number.
export interface CycleSummary {
  ts: string
  ok: boolean
  fetched: number // raw articles pulled from the sources
  candidates: number // new, on-list, not-already-seen items sent to triage
  picked: number
  watched: number
  dropped: number
  inboxed?: number
  groq_requests?: number
  groq_tokens?: number
  note?: string // why a cap was hit / why items were deferred — the warning the user must see
  // end-to-end transparency (all optional — an older server simply omits them)
  fresh?: number // genuinely new items this cycle (candidates = fresh + carryover)
  carryover?: number // re-queued deferred-backlog items included in `candidates`
  deferred?: number // items pushed to the backlog this cycle
  backlog?: number // deferred backlog depth after this cycle
  backlog_cap?: number // the loss boundary; backlog past this is silently dropped
  aborted?: boolean // the wall-clock guard killed this cycle and dumped the remainder to the backlog
  defer_reason?: DeferReason
  last_resort?: LastResortState // the Haiku fallback's state — makes "why nothing scored" honest
  sources?: Record<string, number> // raw articles per source layer this cycle (absent on a drain)
  phase?: 'fetch' | 'drain'
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
  readOnly?: boolean // another engine owns the ingester → this one serves but never scans (optional: deploy-skew)
  backlog?: { count: number; cap: number } // deferred spillover depth + its loss boundary (optional: deploy-skew)
  today: { read: number; kept: number; dropped: number; cycles: number }
  budget: { requests: number; tokens: number; reqCap: number; tokenCap: number; tokenTarget?: number; paceCeiling?: number }
  // every free OVERFLOW pool (Gemini + each OpenAI-compatible provider) — one entry per provider; the
  // cockpit renders a chip per entry, so a newly-wired key appears automatically. color = a CSS var name.
  // tokenCap is present only for TOKEN-gated providers (Cerebras) — the chip then reads tokens (its
  // binding limit) instead of requests, so the number shown is ground truth.
  overflow?: { id: string; label: string; color: string; model: string; requests: number; reqCap: number; tokens: number; tokenCap?: number }[]
}

// ---- full pipeline diagnostics (GET /api/news/diagnostics) — mirrors server NewsDiagnostics ----
export type TierHealth = 'healthy' | 'paced' | 'cooling' | 'budget-spent' | 'disabled'

export interface TierDiagnostics {
  id: string
  label: string
  color: string // a CSS var NAME (e.g. '--accent', '--provider-cb'); the chip reads it, never a literal
  role: 'primary' | 'overflow' | 'gemini' | 'last-resort'
  order: number // routing order in the fallback chain (0 = tried first)
  enabled: boolean
  meter: 'requests' | 'usd'
  health: TierHealth
  requestsToday?: number
  reqCap?: number
  tokensToday?: number
  tokenCap?: number
  usdToday?: number
  usdCap?: number
  callsToday?: number
  cooldownRemainingMs?: number
  fails?: number
  lastCycleRequests?: number
}

export interface NewsDiagnostics {
  ts: string
  enabled: boolean
  running: boolean
  readOnly: boolean
  intervalMin: number
  lastCycleAt: string | null
  nextCycleAt: string | null
  tiers: TierDiagnostics[]
  backlog: { count: number; cap: number; pctOfCap: number; nearLimit: boolean; trend: 'growing' | 'shrinking' | 'flat' | null; lostToday: number }
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
    scoredBy: { id: string; label: string; requests: number }[]
  } | null
  defer: {
    active: boolean
    reason: DeferReason | null
    plainNote: string | null
    lastResort: LastResortState | null
    blockingTiers: string[]
  }
}

export interface ActiveRunLite {
  runId: string
  kind: string
  ticker: string
  module?: string
  status: string
  swarmId?: string // 'research' (default) or a SWARM.md id — lets the UI scope a run to its swarm
  unit?: string // 'ticker' | 'signal' | … (the swarm's unit of work)
  startedAt?: number // epoch ms the run started — drives the live "running Nm" elapsed readout
}
export interface BoardSignal {
  signal_id: string
  event_id?: string
  headline: string
  headline_en?: string | null // English translation of a non-Latin headline (from the wire) — render via displayHeadline()
  source_name?: string
  source_grade?: string
  processed_at?: string
  run_root?: string
  materiality_score?: number | null
  novelty_score?: number | null
  pair_label?: string | null
  action?: string | null
  status: string
  status_reason?: string
  thesis_id?: string | null
  // additive: the scanner's event-type tags (the ALL_THEMES vocabulary) + named issuers, carried
  // through from the event ledger so the live book can filter by theme. Optional → older board JSON
  // (generated before the passthrough) still type-checks, and the theme filter self-activates once present.
  event_types?: string[]
  issuers?: string[]
  // additive human view-state: the human soft-hid this idea from the live book (a `signal_hide` override).
  // The board filters it into a restorable "Hidden" tray. Optional → older board JSON still type-checks.
  hidden?: boolean
}
export interface BoardCandidate {
  candidate_id: string; ticker: string; company_name: string; side: string; exposure_score: number; handed_off?: boolean
  // additive: the news-impact sizing gap (NEWS_IMPACT.md) carried onto the board so the live book can sort by
  // mispricing. gap_read = priced | underpriced_candidate | re_rate_to_judge | not_applicable. Optional → older
  // board JSON still type-checks and the Mispricing rail self-activates once the rebuild carries it.
  gap_read?: string | null; implied_move_pct?: number | null; observed_move_pct?: number | null
}

// ---- Phase 3 conviction loop (the live book) ----
export type ConvictionState = 'watching' | 'provisional' | 'strong' | 'confirmed' | 'fading' | 'handed_off' | 'falsified_discarded' | 'expired_unproven'
export type TrajectoryEnum = 'accelerating' | 'steady' | 'stalling' | 'decaying'
export interface BoardConviction {
  state: ConvictionState
  sell_side_rating: string
  edge_locked: number
  edge_score_live: number
  conviction: number
  upgrade_velocity: number // edge points / 30 days (signed) — the "rate of upgrade"
  trajectory_enum: TrajectoryEnum
  rank_score: number
  proximity_pct: number
  progress_confirmed: number
  progress_total: number
  validated: boolean // false = never checked yet; cannot masquerade as a confirmed climber
  trajectory: { at: string; edge: number }[]
  next_checkpoint: { checkpoint_id: string; metric_name: string; kind: string; due_at: string | null } | null
  stale: boolean
  insufficient: boolean
  archived: boolean
  plain_note?: string
}
export interface BookMomentum {
  live_count: number
  upgrading_count: number
  decaying_count: number
  mean_upgrade_velocity: number
  confirmed_count: number
  fading_count: number
  stale_count: number
  archived_count: number
}
export interface ConvictionCheckpoint {
  checkpoint_id: string
  thesis_id: string
  kind: string
  metric_name: string
  threshold?: number | string | null
  unit?: string
  due_at: string | null
  status: string
  can_kill?: boolean
  predicted_prob?: number | null
  created_at?: string // later than the thesis lock = a newly-added check (slots in by date, tagged "new")
}
export interface ConvictionEventRow {
  row_type: 'conviction_event' | 'validation_result'
  thesis_id: string
  at?: string
  checked_at?: string
  kind?: string
  verdict?: string
  from_state?: string
  to_state?: string
  edge_score_live?: number
  observed_value?: string | number | null
  sell_side_rating?: string
  plain_note?: string
  narrative?: string
  triggering_checkpoint_id?: string | null
  checkpoint_id?: string
}
export interface ConvictionDetail {
  state: BoardConviction | null
  checkpoints: ConvictionCheckpoint[]
  events: ConvictionEventRow[]
}
export interface BoardThesis {
  thesis_id: string
  signal_id: string
  headline?: string
  headline_en?: string | null // English translation of a non-Latin headline (from the wire) — render via displayHeadline()
  status: string
  status_reason?: string
  routing_reason?: string
  next_action?: string
  edge_score?: number | null
  horizon?: string | null
  falsification_sentence?: string | null
  convergence_trigger?: string | null
  trigger_date_range?: string | null
  locked?: boolean
  run_root?: string
  candidate_count?: number
  candidates?: BoardCandidate[]
  // additive: human override (the engine's own `status` above is never altered)
  effective_status?: string
  override?: { from_status: string; to_status: string; reason: string; moved_by: string; moved_at: string } | null
  override_stale?: boolean
  // additive: Phase 3 live-book snapshot (engine-owned, separate from the override above)
  conviction?: BoardConviction | null
}
export interface BoardHandoff { handoff_id: string; thesis_id: string; ticker: string; handed_off_at: string; seeded_path: string }
// The PM skim's surfaced ideas (news/ideas → board.ideas). A cheap free-LLM pass over the ranked wire
// top-N names the best 1-2 tradable stock ideas; the "Best ideas" tab renders these. `conviction` is a
// PRE-EDGE proxy (conviction_basis pins that), never the locked edge score.
export interface BoardIdeaPriorCoverage { has_run: boolean; latest_run: string | null; latest_decision: string | null; data_pool_present: boolean }
export interface BoardIdea {
  idea_id: string
  ticker: string
  company: string | null
  exchange: string | null // the model's guess, UNVERIFIED
  direction: 'long' | 'short' | 'pair'
  pair_with: string | null
  reason: string
  why_now: string
  conviction: number // 0-100 pre-edge PROXY
  conviction_basis: 'pre_edge_proxy'
  priced_in: 'priced' | 'room' | 'unknown'
  thesis_type: string
  source_event_ids: string[]
  source_headlines: string[]
  source_url: string | null
  source_name: string | null
  materiality_max: number
  newest_source_at: string
  prior_coverage: BoardIdeaPriorCoverage | null
  surfaced_at: string
  updated_at: string
  decay_at: string
  status: 'live' | 'promoted'
  promoted_signal_id: string | null
  feedback: 'up' | 'down' | null // the human's latest 👍/👎 (self-grading loop); null = no vote
  stale: boolean
}
// The skim's honest track record (no price / no P&L) — surfaced/run counts, how the deep machine graded the
// runs, and the vote tally. The header shows a confirmation rate only once `resolved` clears a small floor.
export interface IdeasScorecard {
  surfaced_total: number
  live_count: number
  promoted_total: number
  machine_confirmed: number
  machine_passed: number
  machine_pending: number
  resolved: number
  up_votes: number
  down_votes: number
}
// Run-state of a wire event's signal (GET /api/screener/signal-state) — drives the reader's "Run the checks"
// split button + badge. A pure read of the run folder + live registry; never a launch.
export interface SignalState {
  sigId: string
  state: 'never' | 'running' | 'parked' | 'logged' | 'watchlist' | 'partial' | 'complete'
  running: boolean
  runningModule?: string | null
  materiality?: number | null
  routing?: string | null
  locked?: boolean
  hasCandidates?: boolean
  doneModules?: string[]
}
export interface ScreenerBoard {
  generated_at: string | null
  inbox: BoardInboxRow[]
  signals: BoardSignal[]
  theses: BoardThesis[]
  handoffs: BoardHandoff[]
  // The PM skim's surfaced ideas. Optional: an engine build before this feature emits no `ideas` key, so
  // the cockpit fails closed — the "Best ideas" tab only shows when the server positively sends the array.
  ideas?: BoardIdea[]
  ideas_scorecard?: IdeasScorecard // the skim's honest track record (absent on an older engine)
  counts: Record<string, number>
  book_momentum?: BookMomentum
  live?: { runId: string; kind: string; subjectId: string; runRoot: string | null; startedAt: number }[]
  // interrupted partial runs (broken by a closed laptop / dropped connection) the cockpit auto-resumes.
  resumable?: { sigId: string; headline: string; doneCount: number; totalCount: number }[]
}

// ---- live-book filter + sort (the Recent-runs drawer) ----
// Defined here (not in BookFilters.tsx) so the store can hold this state without a
// component→store→component import cycle. Helpers + the predicate live in BookFilters.tsx.
export type BookSort = 'rank' | 'edge' | 'velocity' | 'materiality' | 'novelty' | 'underradar' | 'mispricing' | 'checkpoint' | 'proven' | 'newest'
export interface BookFilterState {
  stage: string // '' = all | watching | provisional | full_machine | handed_off
  themes: Set<string> // event_types, OR-matched (self-activates once the board carries them)
  climbing: boolean
  cooling: boolean // mutually exclusive with climbing
  proven: boolean // has at least one confirmed proof point
  strong: boolean // edge_score_live >= 80
  needsAttention: boolean // stale | needs-a-source | next checkpoint overdue
  hasCompanies: boolean // candidate_count > 0
  horizon: string // '' | short | medium | long (bucketed)
  checkpoint: string // '' | overdue | soon (<=7d) | month (<=30d)
  source: string // '' = all
  text: string
}

export interface SignalIntakeInput {
  headline: string
  source_url?: string
  source_name?: string
  input_nature?: string
  body_text?: string
  human_prompt_note?: string
  override_promote?: boolean
}

export interface ModuleReadiness { status: Sufficiency; reasons: string[]; caps: string[] }
// A sub-category a vendor export bundles in (estimates / multiples / peers / financials).
export interface CoverageSub { key: string; label: string; present: boolean }
// One source-document group — what a human uploads, detected tab/content-aware (see server data-status.ts).
export interface CoverageGroup {
  key: string
  label: string
  tier: 'critical' | 'core' | 'recommended' | 'optional'
  helps: string
  present: boolean
  via: 'file' | 'tab' | null
  filename: string | null
  sheet: string | null
  ageMonths: number | null
  stale: boolean
  covers?: CoverageSub[]
}
export interface DataStatus {
  ticker: string
  hasAnyData: boolean
  fileCount: number
  files: {
    filename: string
    type: string
    periodHint: string | null
    ageMonths: number | null
    confidence: string
    sheets?: { name: string; rows: number; cols: number; cells: number }[]
    // present for externally ingested docs under data/<T>/external/ (frameworks/EXTERNAL_DATA.md)
    external?: { provider?: string; sourceType?: string; tier?: number; asOf?: string; license?: string }
    // present for a routed wire-event note (screener_event_<EVT>.md): the news HEADLINE to display
    // instead of the machine filename, plus a hover line (source · when · event id)
    displayName?: string
    note?: string
  }[]
  recentByType: Record<string, { filename: string; ageMonths: number | null } | undefined>
  modules: Record<string, ModuleReadiness>
  coverage: CoverageGroup[]
  overallReady: boolean
  dataDir: string
}
export interface TickerSummary {
  ticker: string
  fileCount: number
  hasAnyData: boolean
  valid: boolean
  invalidReason?: string
  suggestedTicker?: string
  syncing: boolean
  lastChangeAt: number | null
  latestRun: { runRoot: string; decision: string | null; decisionDate: string | null; confidence: number | null } | null
  // how many analyses/ run folders this ticker has — drives the "N runs" affordance + run-history expander
  runCount: number
  // a run folder NEWER than latestRun has no decision record yet — the verdict shown is from the last
  // completed run; the picker flags that a partial re-run has landed since (see RunHistoryEntry)
  hasNewerPartial: boolean
}

// Per-subject run summary for a NON-research swarm's subject picker (commodity GOLD/SUGAR, …) — the lean
// twin of TickerSummary. A constellation swarm has ONE run folder per subject, so there is no run history /
// file count here; just whether it has run and the routing verdict (resolved server-side via the swarm's
// self-declared verdict field). Served alongside the plain subject-name list by GET /api/swarm/subjects.
export interface SwarmSubjectSummary {
  subject: string
  hasRun: boolean
  runRoot: string | null
  verdict: string | null
  decisionDate: string | null
  confidence: number | null
  lastChangeAt: number | null
}

// One row of a ticker's run history (GET /api/runs?ticker=…). Newest-first; a run with no decision record
// is a partial / single-module re-run that never became the standing verdict.
export interface RunHistoryEntry {
  runRoot: string
  date: string
  decision: string | null
  confidence: number | null
  decisionDate: string | null
  modules: string[]
  hasDecisionRecord: boolean
  hasDossier: boolean
  hasFinalThesis: boolean
}

// ---- in-app upload (POST /api/tickers/:ticker/files) — per-file result ----
export interface UploadResult { ok: boolean; written: string[]; errors: { filename: string; reason: string }[] }

// ---- screener intake intensity (GET /api/screener/intensity) — time-windowed aggregates for the ThemeMap ----
export type IntensityWindow = 'scan' | '1h' | '4h' | 'day' | '7d'
export interface IntensityStats {
  window: IntensityWindow
  from: string | null
  to: string
  scans: number
  totalFetched: number
  ratePerSec: number
  byTier: Record<string, number>
  hourly: { t: string; fetched: number }[]
}

export interface LaunchPreflight {
  kind: 'full' | 'module' | 'agent' | 'rerun' | 'signal' | 'sweep' | 'screener-agent' | 'handoff'
  ticker: string
  swarm?: string
  module?: string
  agent?: string
  agentCount: number
  estCostUsdRange: [number, number]
  estMinutesRange: [number, number]
  willCommitToMain: boolean
  estCommits: number
  requiresTypedConfirm: boolean
  creditPreflight: { ok: boolean; reason?: string; rateLimitType?: string; checked: boolean }
}

// ---- pre-flight data-readiness gate (mirrors ui/server/src/types.ts) ----
export type ReadinessSeverity = 'blocker' | 'degrade' | 'info'
export interface ReadinessIssue {
  code: string
  severity: ReadinessSeverity
  message: string
  evidence?: string
  file?: string
  module?: string
  suggestedFix?: string
  affectedModules?: string[]
  capIfProceeded?: string
}
export interface ReadinessReport {
  ticker: string
  kind: string
  module?: string
  overall: 'clean' | 'degraded' | 'blocked'
  fileCount: number
  usableCount: number
  entities: { file: string; entity: string }[]
  issues: ReadinessIssue[]
  ts: number
}

// One orchestrator tool call: the tool plus WHAT it acted on — the file read, the pattern searched, the
// agent dispatched. `target` is repo-relative and already trimmed server-side; absent when the tool's
// input names nothing worth showing (an old server sends no target at all — render the tool alone).
export interface RunActivity {
  tool: string
  target?: string
  ts: number
}

export type SseEvent =
  | { type: 'run-started'; runId: string; kind: string; ticker: string; runRoot: string | null; willCommitToMain: boolean; ts: number }
  | { type: 'agent-started'; runId: string; module: string; agentKey: string; name: string; layer: number; ts: number }
  | { type: 'agent-done'; runId: string; agentKey: string; module: string; name: string; layer: number; outputPath: string; verdict: string | null; bytes: number; ts: number }
  | { type: 'agent-failed'; runId: string; agentKey: string; module: string; name: string; layer: number; reason: string; ts: number }
  | { type: 'layer-advanced'; runId: string; module: string; toLayer: number; doneCount: number; expectedCount: number; ts: number }
  | { type: 'module-done'; runId: string; module: string; status: 'completed' | 'aborted'; reason?: string; verdict?: string | null; ts: number }
  | { type: 'module-routed'; runId: string; module: string; route: string; terminal: boolean; nextModule: string | null; ts: number }
  | { type: 'cost-tick'; runId: string; costUsdSoFar?: number; rateLimit?: { ok: boolean; reason?: string }; ts: number }
  | { type: 'run-done'; runId: string; status: 'done'; costUsd?: number; durationMs?: number; numTurns?: number; finalThesisPath?: string | null; decisionRecordPath?: string | null; ts: number }
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled' | 'incomplete'; reason: string; message?: string; ts: number }
  // transient liveness pulse (~3s per in-flight run; never replayed) — status/progress/cost between
  // agent events plus the engine's last output time and latest tool call ("what is it doing right now")
  | { type: 'run-heartbeat'; runId: string; status: string; elapsedMs: number; agentsDone: number; agentsTotal: number; costUsd?: number; lastStdoutAt?: number; lastActivity?: RunActivity; ts: number }
  // one per orchestrator tool call — the step-by-step feed behind "New data"'s live reading list. The
  // heartbeat only carries the LATEST call, so it alone would skip documents read between two pulses.
  // The server replays a bounded tail on subscribe, so attaching mid-run still shows the earlier steps.
  | { type: 'run-activity'; runId: string; tool: string; target?: string; ts: number }
  | { type: 'readiness-checking'; runId: string; ticker: string; kind: string; ts: number }
  | { type: 'readiness-report'; runId: string; report: ReadinessReport; ts: number }
  | { type: 'readiness-blocked'; runId: string; report: ReadinessReport; ts: number }
  | { type: 'readiness-resolved'; runId: string; action: string; ts: number }

// startedAt/endedAt are SERVER timestamps (from the agent-started / agent-done SSE events), so a finished
// orb's duration (endedAt - startedAt) is clock-skew-free. startedAt is set the instant the orchestrator
// dispatches the orb — "the data reaching the orb" — which is when its live timer starts.
export interface NodeRuntime { status: NodeStatus; verdict?: string | null; outputPath?: string; runId?: string; startedAt?: number; endedAt?: number }

// ---- chat with your data (closed-book Q&A over a run's synthesized output) ----
export type ChatScope = 'run' | 'module' | 'orb'
export type ChatStyle = 'simple' | 'analyst' | 'detailed' // narration style — HOW the answer is phrased
// A deterministic what-if result the engine computed for this turn (scripts/sensitivity_math.py, via the
// server's chat-whatif). It is DISPLAYED verbatim as a card — the numbers are the engine's, never the
// model's — while the assistant text narrates around it. `scenario` mirrors the engine's output shape.
export interface ComputedScenario {
  variable: string
  label?: string | null
  unit?: string | null
  delta: number
  coefficient: number
  impactMetric?: string | null
  impact: number
  baseValue?: number | null
  newValue?: number | null
  baseMarginPct?: number | null
  newMarginPct?: number | null
  marginChangeBps?: number | null
  withinDisclosedRange?: boolean | null
  rangeNote?: string | null
  confidence?: string | null
  basis?: string | null
  source?: string | null
  nonLinearity?: string | null
  // how the move was derived: 'delta' (a move), 'level' (from a target level), 'reverse' (solved for the input)
  mode?: 'delta' | 'level' | 'reverse' | null
  resolvedDelta?: number | null   // the move the engine resolved (== delta for 'delta' mode)
  targetLevel?: number | null     // level mode: the variable level the user gave
  variableBase?: number | null    // level mode: the variable's recorded current level
  solvedVariableLevel?: number | null // reverse mode: the variable level the target implies
  targetValue?: number | null     // reverse mode: the base-metric value targeted
  targetMarginPct?: number | null // reverse mode: the margin % targeted
  neededImpact?: number | null    // reverse mode: the base-metric change required
  marginBasis?: string | null     // 'revenue_constant' → margin computed at unchanged revenue
  metricNote?: string | null      // coefficient on a metric ≠ base metric (level/margin withheld)
  periodBase?: string | null      // set when the question asked about a period this single-period scenario can't forecast — the sidecar's base period (canned card note)
  note?: string | null            // set on the first card of a multi-variable answer
}
export type ChatComputed =
  | { kind: 'scenario'; asked: string; scenario: ComputedScenario }
  | { kind: 'unsupported'; asked: string; recorded: { variable: string; label?: string | null; unit?: string | null }[]; reason?: string }

// `thinking` (assistant turns) is the model's extended-thinking reasoning, streamed live while the answer
// is being worked out and kept afterwards so the thought process stays readable. `computed` (assistant
// turns) holds the engine-computed what-if card(s) for this turn — an ARRAY because a joint ask ("aluminium
// AND USD/NOK") returns one card per variable, computed separately.
export interface ChatMessage { role: 'user' | 'assistant'; content: string; thinking?: string; computed?: ChatComputed[] }

// What an in-flight chat turn is doing RIGHT NOW — drives the panel's live working state. Every stage is
// tied to a real event, never a fabricated progress guess:
//   sending   -> the request left the browser
//   context   -> the server confirmed the scope + assembled the closed-book context (chat-meta arrived)
//   starting  -> the server is spawning the engine CLI (chat-status: starting)
//   connected -> the CLI session initialized; the model is consuming the context (chat-status: connected)
//   modeling  -> a quantified what-if is being computed by the engine (chat-status: modeling)
//   thinking  -> an extended-thinking block is streaming (chat-status: thinking + chat-thinking deltas)
//   writing   -> the visible answer is streaming (chat-status: writing / first chat-token)
export type ChatWorkStage = 'sending' | 'context' | 'modeling' | 'starting' | 'connected' | 'thinking' | 'writing'
export interface ChatWork { stage: ChatWorkStage; model?: string; startedAt: number; stageAt: number }
export interface ChatRequest {
  ticker?: string
  runRoot?: string
  // constellation swarm (e.g. commodity): its subject resolves the run folder server-side
  swarm?: string
  subject?: string
  scope: ChatScope
  module?: string
  orbPath?: string
  orbKey?: string // stable orb node key — persisted so a saved orb conversation can be reopened
  model?: string
  style?: ChatStyle
  conversationId?: string // attaches this turn to a saved conversation (server mints one when absent)
  title?: string // the panel's header title, stored so history rows read as a name
  messages: ChatMessage[]
}
export interface ChatScopes {
  ticker: string
  runRoot: string | null
  run: { present: boolean }
  modules: { module: string; label: string; present: boolean }[]
  orbs: { module: string; path: string; title: string; present: boolean }[]
}

// ---- saved chat history (persisted Ask conversations) ----
// A summary row for the history browser (no transcript); mirrors the server's ConversationSummary.
export interface ChatConversationSummary {
  id: string
  user: string
  userVia: 'cf-access' | 'local'
  swarm: string
  subject: string
  scope: ChatScope
  module?: string
  orbKey?: string
  title: string
  model?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  costUsd: number
  preview: string
  lastPreview: string
}
export interface StoredChatMessage extends ChatMessage { ts: number; sourcePath?: string; costUsd?: number }
// The full conversation returned by GET /api/chats/:id — drives "continue chatting".
export interface ChatConversationDetail {
  v: 1
  id: string
  user: string
  userVia: 'cf-access' | 'local'
  swarm: string
  subject: string
  scope: ChatScope
  module?: string
  orbPath?: string
  orbKey?: string
  runRoot?: string
  title: string
  model?: string
  style?: ChatStyle
  createdAt: number
  updatedAt: number
  costUsd: number
  messages: StoredChatMessage[]
}
export interface ChatListResult {
  conversations: ChatConversationSummary[]
  total: number
  allTime: number
  users: string[]
  subjects: string[]
  earliest: number | null
}
export interface ChatListQuery {
  user?: string
  subject?: string
  swarm?: string
  scope?: ChatScope
  q?: string
  from?: number
  to?: number
  limit?: number
}

// ---- calls tracker (the engine's call ledger + since-the-call outcomes) ----
export interface CallTimelineEntry {
  window: string
  due_date: string | null
  status: 'done' | 'due' | 'overdue' | 'upcoming'
  review_date?: string
  review_price?: number | null
  absolute_return_pct?: number | null
  thesis_status?: string | null
  forecasts_confirmed?: number
  forecasts_falsified?: number
  review_file?: string
  review_count?: number
  memo_delta_file?: string // §8 memo delta — the "what changed since the memo" markdown, when the review filed one
  stage_one_comment?: string // paste-ready 100–200-word Stage-One sheet note from the same block
}
export interface CallSummary {
  ticker: string
  company: string | null
  decision_date: string | null
  decision: string | null
  basket: string | null
  confidence: number | null
  time_horizon: string | null
  entry_price: number | null
  currency: string | null
  expected_return_pct: number | null
  implied_target: number | null
  downside_risk_pct: number | null
  kill_criteria_count: number
  forecasts: { open: number; confirmed: number; falsified: number; expired: number; other: number }
  run_root: string
  final_thesis_path: string
  latest_thesis_status: string | null
  next_checkpoint: { window: string; due_date: string | null; status: string } | null
  review_count: number
  timeline: CallTimelineEntry[]
}
export interface CallsResult {
  calls: CallSummary[]
  dashboard: string | null
}

// ---- activity / audit log ----
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'doc-intake' | 'signal' | 'sweep' | 'screener-agent' | 'handoff'
export interface Whoami { user: string; userVia: 'cf-access' | 'local'; canDispatch?: boolean; canScanPipeline?: boolean; canBuildConnector?: boolean; emailEnabled?: boolean }

// ---- cockpit-wide product feedback (server: feedback-store.ts) ----
export type CockpitFeedbackCategory = 'bug' | 'ui' | 'idea' | 'research_quality' | 'other'
export type CockpitFeedbackStatus = 'new' | 'triaged' | 'dispatched' | 'pr_open' | 'assessed' | 'done' | 'wontfix'
export interface CockpitFeedbackView {
  feedback_id: string
  text: string
  category: CockpitFeedbackCategory
  images: string[]
  url: string
  user_id: string
  submitted_at: string
  status: CockpitFeedbackStatus
  pr_url: string | null
  note: string
  last_update_at: string
  // Latest reporter-notification attempt for this item (resolution email), or null if none yet.
  notified: { at: string; ok: boolean; recipient: string; channel: 'email' } | null
}
export interface ActivityRow {
  runId: string
  user: string
  userVia: 'cf-access' | 'local'
  kind: RunKind
  ticker: string // the run's subject id: a ticker for research, a SIG-… id (or thesisId::TICKER) for swarm runs
  subjectLabel?: string // human-readable Company-column label when the raw ticker is an opaque subject id
  swarm?: string // swarm id (from the launched event) — routes a Resume relaunch to the right swarm
  chained?: boolean // this run was a step of a chained full run — Resume continues the whole pipeline
  runRoot?: string // repo-relative run folder (from the launched event) — drives the row's "open reports" menu
  module?: string
  agent?: string
  model?: string
  launchedAt: number
  finishedAt?: number
  status: NodeStatus | 'starting' | 'cancelled' | 'error' | 'done' | 'running' | 'incomplete'
  costUsd?: number
  durationMs?: number
  numTurns?: number
  note?: string
}

// One run the cockpit can resume right now (GET /api/resumable). The Activity log and orb view join
// their rows/subjects against this set to decide where to show a "Resume" affordance.
export interface ResumableRunInfo {
  swarm: string
  subject: string // ticker / SIG id / commodity name — the launch subject
  runRoot: string // repo-relative run folder
  kind: RunKind // 'full' | 'module' | 'signal' — the launch kind that continues this unit
  module?: string // present for a module-level resume
  doneCount: number
  totalCount: number
  unit: 'module' | 'agent' // whether the counts are modules-done (full/signal) or agents-done (module)
  label?: string // human label (e.g. the signal headline) when the raw subject id isn't the best name
}
// ---- "Complete the thesis" (GET /api/thesis-plan) ----
// What still stands between this subject and a final thesis, and what already exists on disk — possibly in
// an OLDER dated run folder — that must therefore NOT be paid for a second time. Mirrors the server's
// `ThesisPlan` in ui/server/src/completion.ts.
export type ModuleState = 'done' | 'stale' | 'partial' | 'missing'

export interface ModulePlanEntry {
  module: string
  state: ModuleState
  sourceRunRoot?: string // the folder holding this module's newest outputs
  sourceDate?: string // that folder's run vintage (YYYY-MM-DD)
  inTargetRoot: boolean // already in the run root a completion writes into (nothing to carry)
  doneAgents: number // orbs the pipeline will REUSE (validity-checked, not counted by filename)
  totalAgents: number
  staleReason?: string // plain-English "why this needs re-running", shown verbatim (also set for `partial`)
  blockedBy: string[] // ancestors of this module that are themselves in `run` — it can't launch until they do
  runnable: boolean // this module can be launched on its own now (in `run`, and nothing upstream is)
  willRunAgents: number // orbs that would actually execute if it ran now (total minus reused-on-resume)
}

export interface ThesisPlan {
  swarm: string
  subject: string
  targetRunRoot: string
  complete: boolean
  finalReportPath: string | null
  modules: ModulePlanEntry[]
  reusable: string[] // every module with a finished synthesis on disk — what MAY be reused (incl. stale)
  // modules the run CANNOT rebuild: their synthesis already sits in the target run root, so both full-run
  // paths skip them. Always inside `reuse`. Their rows must not offer a toggle that the launcher would ignore.
  mustReuse: string[]
  reuse: string[] // what this plan DOES reuse (carried, never re-run). Default = the `done` set + mustReuse.
  run: string[] // actually runs — the exact complement of `reuse`
  carry: { module: string; from: string; date: string | null }[]
  master: { state: 'ready' | 'blocked' | 'done'; blockedBy: string[] }
  dataPool: { files: number; newestDate: string | null }
  preflight: LaunchPreflight // cost/time of ONLY the remaining work
  fullPreflight: LaunchPreflight // cost/time of the naive full re-run — the savings, made visible
  canCarry: boolean
}

export interface ActivityQuery {
  from?: number
  to?: number
  ticker?: string
  kind?: RunKind
  user?: string
  status?: string
  q?: string
  limit?: number
}
export interface ActivityResult {
  rows: ActivityRow[]
  total: number
  allTime: number
  users: string[]
  tickers: string[]
  tickerLabels?: Record<string, string> // subject id -> readable label (for the rows/dropdown that have one)
  earliest: number | null
}

export interface UsageWindow { utilization?: number; resetsAt?: number; status?: string; isUsingOverage?: boolean }
export interface Usage {
  ok: boolean
  checked: boolean
  reason?: string
  status?: string
  rateLimitType?: string
  utilization?: number
  resetsAt?: number
  isUsingOverage?: boolean
  windows?: Record<string, UsageWindow>
}
