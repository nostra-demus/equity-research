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
export interface SwarmMeta { id: string; label: string; color: string; unit: string; order: number; layout: string }

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
  region: string
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
export interface ArticleCompany { name: string; ticker: string | null; role: CompanyRole; listing_country?: string | null; exchange?: string | null }
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
export interface EventEnrichment {
  event_id: string
  ok: boolean
  fetched_at: string
  note?: string
  summary?: string // regex fallback when the article-body read is unavailable
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
  // read-quality flags from the server: `complete` = the best obtainable read (rich brief, SEC parse, filing
  // floor, or retries exhausted). A degraded read (complete falsy) self-heals — reopening the event re-fires
  // the read instead of freezing a useless dek for hours. See ui/server/src/news/enrich.ts.
  complete?: boolean
  degraded?: boolean
  read_attempts?: number
  // set when the publisher blocked the direct read and the story was pieced together from OTHER outlets
  // reporting the same event (secondary-wire corroboration, NOT a direct read — labelled honestly).
  corroborated?: { count: number; domains: string[] }
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

export interface NewsStatus {
  enabled: boolean
  running: boolean
  intervalMin: number
  model: string
  rssEnabled: boolean
  lastCycleAt: string | null
  nextCycleAt: string | null
  lastNote: string | null
  today: { read: number; kept: number; dropped: number; cycles: number }
  budget: { requests: number; tokens: number; reqCap: number; tokenCap: number; tokenTarget?: number; paceCeiling?: number }
  // every free OVERFLOW pool (Gemini + each OpenAI-compatible provider) — one entry per provider; the
  // cockpit renders a chip per entry, so a newly-wired key appears automatically. color = a CSS var name.
  // tokenCap is present only for TOKEN-gated providers (Cerebras) — the chip then reads tokens (its
  // binding limit) instead of requests, so the number shown is ground truth.
  overflow?: { id: string; label: string; color: string; model: string; requests: number; reqCap: number; tokens: number; tokenCap?: number }[]
}

export interface ActiveRunLite {
  runId: string
  kind: string
  ticker: string
  module?: string
  status: string
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
}
export interface BoardCandidate { candidate_id: string; ticker: string; company_name: string; side: string; exposure_score: number; handed_off?: boolean }

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
export interface ScreenerBoard {
  generated_at: string | null
  inbox: BoardInboxRow[]
  signals: BoardSignal[]
  theses: BoardThesis[]
  handoffs: BoardHandoff[]
  counts: Record<string, number>
  book_momentum?: BookMomentum
  live?: { runId: string; kind: string; subjectId: string; runRoot: string | null; startedAt: number }[]
  // interrupted partial runs (broken by a closed laptop / dropped connection) the cockpit auto-resumes.
  resumable?: { sigId: string; headline: string; doneCount: number; totalCount: number }[]
}

// ---- live-book filter + sort (the Recent-runs drawer) ----
// Defined here (not in BookFilters.tsx) so the store can hold this state without a
// component→store→component import cycle. Helpers + the predicate live in BookFilters.tsx.
export type BookSort = 'rank' | 'edge' | 'velocity' | 'checkpoint' | 'proven' | 'newest'
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
  files: { filename: string; type: string; periodHint: string | null; ageMonths: number | null; confidence: string; sheets?: { name: string; rows: number; cols: number; cells: number }[] }[]
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
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatRequest {
  ticker?: string
  runRoot?: string
  scope: ChatScope
  module?: string
  orbPath?: string
  model?: string
  style?: ChatStyle
  messages: ChatMessage[]
}
export interface ChatScopes {
  ticker: string
  runRoot: string | null
  run: { present: boolean }
  modules: { module: string; label: string; present: boolean }[]
  orbs: { module: string; path: string; title: string; present: boolean }[]
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
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'signal' | 'sweep' | 'screener-agent' | 'handoff'
export interface Whoami { user: string; userVia: 'cf-access' | 'local' }
export interface ActivityRow {
  runId: string
  user: string
  userVia: 'cf-access' | 'local'
  kind: RunKind
  ticker: string // the run's subject id: a ticker for research, a SIG-… id (or thesisId::TICKER) for swarm runs
  subjectLabel?: string // human-readable Company-column label when the raw ticker is an opaque subject id
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
