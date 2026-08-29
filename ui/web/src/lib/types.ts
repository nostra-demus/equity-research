export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'
export interface NewCompanyInput {
  ticker: string
  legalName: string
  venue: 'NYSE' | 'NasdaqGS' | 'NasdaqCM' | 'NasdaqGM' | 'NSE' | 'DFM' | 'XTRA' | 'Oslo Børs' | 'SHSE' | 'HKEX' | 'LSE'
  currency: string
  identifiers: string[]
}
export type NodeStatus = 'dormant' | 'locked' | 'ready' | 'notready' | 'queued' | 'running' | 'done' | 'failed'
// engine reachability, driven by the /api/health heartbeat (lib/store). `your-network` = the visitor's
// own connection is down; `session-expired` = Cloudflare Access cookie gone (reachable but not JSON-ok).
export type HealthState = 'connecting' | 'online' | 'updating' | 'reconnecting' | 'engine-offline' | 'your-network' | 'session-expired'

// ---- shared research memory (GET /api/memory) ----
// One small, read-only projection for every cockpit. The canonical records and the full memory payloads
// stay behind the engine; this contract carries only the plain-English summary and enough proof to trace
// it back to the exact source.
export type MemoryCockpit = 'research' | 'screener' | 'commodity'
export type MemoryStatusState = 'healthy' | 'degraded' | 'unavailable'

export interface MemoryStatus {
  state: MemoryStatusState
  message: string
  event_count: number
  source_count: number
  diagnostics_count: number
  production_readiness: 'unmeasured'
}

export interface MemoryCounts {
  total: number
  research: number
  screener: number
  commodity: number
  decisions: number
  reviews: number
  corrections: number
}

export interface MemoryItem {
  event_id: string
  event_type: string
  cockpit: MemoryCockpit
  kind: string
  happened_at: string
  valid_from: string
  subject: string
  title: string
  status: string | null
  /** A true confidence value in percentage points (0..100), never a generic screener score. */
  confidence: number | null
  summary: string
  current: boolean
  source: {
    path: string
    locator: string
    sha256: string
    git_commit: string | null
  }
  lineage: {
    derived_from: string[]
    supersedes: string[]
    replaced_by: string[]
    corrected_by: string[]
  }
  proof: {
    source_verified: true
    evidence_ref_count: number
  }
}

export interface MemoryRead {
  contract_version: 'memory-ui/1'
  available: boolean
  read_only: true
  generated_at: string | null
  status: MemoryStatus
  counts: MemoryCounts
  items: MemoryItem[]
}

export interface MemoryRuntimeRead {
  contract_version: 'memory-runtime-ui/1'
  available: boolean
  read_only: true
  generated_at: string
  state: 'healthy' | 'degraded' | 'unavailable' | 'disabled'
  mode: 'off' | 'shadow' | 'enforced'
  effective_mode: 'off' | 'shadow' | 'enforced'
  controls: {
    revision: number
    updated_at: string | null
    global_disabled: boolean
    disabled_layers: Array<'episodic' | 'semantic' | 'procedural'>
    disabled_playbooks: Array<{ playbook_id: string; version: number | null; reason: string; disabled_at: string }>
    pinned_playbooks: Array<{ playbook_id: string; version: number; pinned_at: string }>
    candidate_intake_disabled: boolean
    control_sha256: string | null
  }
  counts: {
    runs: number
    task_episodes: number
    lessons: number
    playbooks: number
    candidates: number
    executions: number
    promotions: number
    quarantines: number
    packets: number
    used_items: number
    rejected_items: number
    contradicted_items: number
    deviations: number
  }
  readiness: { status: 'met' | 'failed' | 'unmeasured'; evaluated_at: string | null; report_sha256: string | null }
  slos: Array<{ name: string; status: string; target: string }>
  alerts: Array<{ code: string; severity: 'info' | 'warning' | 'critical'; message: string }>
  services: Array<{ role: string; identity: string | null; configured: boolean }>
}

// Per-source health for the Sources panel (GET /api/news/sources).
export type SourceHealth = 'healthy' | 'quiet' | 'failing' | 'idle'
export interface SourceRow {
  id?: string
  name: string
  url?: string | null
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
  repair?: { state: 'none' | 'fallback_active' | 'covered_by_peer' | 'retrying' | 'needs_attention' | 'unverified'; fallback_covered: boolean; action: string | null }
}
export interface SourcesReport {
  updated_at: string
  counts: { total: number; healthy: number; quiet: number; failing: number; idle: number }
  coverage?: { connection_coverage_pct: number; groups: { id: string; label: string; total: number; working: number; failing: number; unverified: number; covered: boolean }[]; critical_gaps: string[]; repair_active: number }
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
  // Server-stamped owner. Optional for deploy compatibility with the older research-only reader.
  swarm?: string
  subject?: string
  ticker: string
  run_root: string
  // Raw authored identity of the exact decision whose new documents were read. Never server-rebound.
  decision_fingerprint?: string
  // New-reader content identity/action gate. Optional only for deploy compatibility; any paid scoped
  // action requires positive `actionable === true` plus both valid hashes/path.
  plan_path?: string
  plan_sha256?: string
  actionable?: boolean
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
  // True iff this plan's own commands already ran (a copy `carryForwardScoped` staged, whose root has since
  // finished) — the server already empties `rerun_plan.commands` in that case, so an older client with no
  // knowledge of this field still renders the correct "nothing to re-run" state; this is metadata only.
  consumed?: boolean
}
// The scoping the intake plan applied to a "Complete the thesis" plan (client-only), so the panel can
// explain "kept N the evidence doesn't touch; re-running the affected ones" and offer the escape hatch.
export interface ThesisPlanIntake { affected: string[]; keep: string[]; scanDate: string; summary: string }

// A structured data need the run's terminal synthesizer surfaced (decision_record.json data_needs[]) —
// evidence that would improve the call's understanding, but may support, weaken, or leave it unchanged.
// Mirrors the versioned DataNeed projection the server emits (ui/server/src/data-needs.ts). The v2-only
// fields stay optional so an old engine's v1 decision record remains readable during deploy skew.
export interface DataNeedOrb {
  module: string
  agent: string
  why: string
  confidence: number
  route_status?: 'current' | 'historical'
}
export interface DataNeedImpact {
  if_supportive: string
  if_adverse: string
}
export interface DataNeedSourceLookup {
  lookup_status: 'public_link_found' | 'could_not_find'
  public_url: string | null
  checked_at: string
  lookup_note: string
  stale: boolean
  access_basis: 'https_url_public_dns'
}
export interface DataNeed {
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  priority?: number
  expected_impact?: DataNeedImpact
  entry_orbs?: DataNeedOrb[]
  filing_required: boolean
  entry_modules: string[]
  suggested_source: {
    name: string
    acquisition: string
    licensing?: string
    access?: 'public' | 'licensed' | 'restricted' | 'unknown'
    licensing_basis?: string
  }
  tier: number
  cadence: string
  next_release?: string
  // `built_by` is deliberately stronger than "connector code exists": it is present only when that
  // connector has a current, usable pool series for this subject.  During a repair the connector remains
  // visible through `connector_exists`, but the need stays open.
  built_by?: string
  connector_exists?: string
  // Server-owned outcome of a completed, targeted public-source search. Failures and interrupted searches
  // deliberately leave this absent, so the UI must never infer "Could not find" from a request error.
  source_lookup?: DataNeedSourceLookup
}
export interface DataNeedsRead {
  contract_version: 'data-needs-read/2'
  subject: string
  swarm: string
  run_root: string
  decision_fingerprint: string
  decided_at: string
  needs: DataNeed[]
  widened: string[]
  data_needs_schema_version?: '2.0'
}

// Exact selected-call manual evidence intake. Arrival is deliberately weaker than analysis: this wire
// proves only that the server staged the bytes or that the existing external-data router published a
// hash-bound payload + provenance sidecar. `IntakePlan` remains the authority on what the bytes mean.
export type DataNeedUploadStatus = 'none' | 'staged_waiting' | 'routed_provenance_verified' | 'rejected_policy' | 'failed_tampered'
export interface DataNeedUploadItem {
  request_id: string
  filename: string
  sha256: string
  staged_at: string
  routed_path?: string
  reason?: 'malformed_request' | 'tampered_request' | 'routing_failed' | 'policy_rejected'
}
export interface DataNeedUploadRead {
  contract_version: 'data-need-upload/1'
  subject: string
  swarm: string
  run_root: string
  decision_fingerprint: string
  need_id: string
  series: string
  status: DataNeedUploadStatus
  items: DataNeedUploadItem[]
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
  runRoot?: string
  decisionFingerprint?: string
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
// recent file in the pool), `health` is the FETCH/PUBLISH side (what the last sweep actually proved). A feed
// can be fresh-but-quarantined or stale-but-clean, and collapsing them would hide exactly the case worth seeing.
// Connector-v2's public outcomes.  These describe what the last sweep proved, not merely whether the
// fetch process exited zero.  Keep the legacy wire values separate: the normalizer in
// components/datalibrary/feedHealth.ts accepts them during the old-engine/new-bundle deploy window, while
// every label and severity decision in the UI operates on this exact v2 vocabulary.
export type FeedHealthState =
  | 'current'
  | 'no_new_release'
  | 'stalled'
  | 'schema_failed'
  | 'suspect'
  | 'credentials_missing'
  | 'broken'
  | 'quarantined'
  | 'manual'
  | 'no_pool'
  | 'pending'
  | 'never_run'
export type LegacyFeedHealthState = 'ok' | 'failing'
export type FeedHealthPayloadState = FeedHealthState | LegacyFeedHealthState
export interface PipelineSubjectStatus {
  subject: string
  status: 'fresh' | 'stale' | 'missing' | 'unknown'
  latestAsOf?: string
  ageDays?: number
  latestFile?: string
  projectionIntact?: boolean
  health: FeedHealthPayloadState
  fetchOutcome?: string
  lastSweepAt?: string
  lastError?: string
  ledgerIntegrityWarning?: string
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
  releaseWindowDays: number
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
  repair: { status: RepairStatus; prUrl: string | null }
  // Subject-scoped repair lifecycle. Optional only for an old-server/new-bundle deploy window; `repair`
  // remains the connector-wide compatibility projection.
  repairs?: Record<string, { status: RepairStatus; prUrl: string | null }>
}
// The one-word answer to "is this feed working?" — rolled up across its subjects, server-side.
export type PipelineVerdict = 'live' | 'attention' | 'broken' | 'unknown'
export type RepairStatus = 'none' | 'repairing' | 'pr_open' | 'verified' | 'assessed' | 'source_gone'
export interface RecommendedNeed {
  key: string
  swarm: string
  subject: string
  // Optional only during an old-server/new-client deploy window. Targeted discovery refuses to run without both.
  run_root?: string
  decision_fingerprint?: string
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  priority?: number
  expected_impact?: DataNeedImpact
  entry_orbs?: DataNeedOrb[]
  suggested_source: DataNeed['suggested_source']
  tier: number
  cadence: string
  next_release?: string
  entry_modules: string[]
  // Same split as DataNeed: `built_by` means current + usable; `connector_exists` means the code covers the
  // need but may be waiting for its first fetch, stale, broken, or under repair.  Never invite a second
  // connector build merely because the existing one is unhealthy.
  built_by?: string
  connector_exists?: string
  source_lookup?: DataNeedSourceLookup
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
  fetcher?: {
    contractVersion: 2
    // Exact service projection. A future/unknown value is an incident in the UI, never a green fallback.
    state: 'starting' | 'checking' | 'online' | 'paused_drive' | 'disabled_admin' | 'blocked_unsafe' | 'foreign_writer'
    note: string
    autoRetryArmed: boolean
    intervalMin: number
    host: string | null
    lastStartedAt: string | null
    lastProgressAt: string | null
    lastCompletedAt: string | null
    nextExpectedAt: string | null
    processedRows: number
    failedRows: number
    skippedManifests: number
  }
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
  connector_exists?: string // server-side coverage proof; blocks a duplicate build even on a stale UI read
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
  // Has the live price left the run's own scenario band? null when the record carries no usable scenario
  // prices, or on an older engine (deploy-skew: read it as "no band", never as "inside"). Leaving the band
  // does NOT prove the thesis wrong — it proves the scenario set no longer contains the present.
  band?: { low: number; high: number; state: 'inside' | 'above' | 'below'; outside_by_pct: number; note: string } | null
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
  /** Optional cross-module inputs consumed when present, but not required for scheduling. */
  readsFrom?: string[]
  exactResume?: boolean
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
  // The ARTICLE BODY's own materiality verdict (low | medium | high | critical), set on the READ path once
  // the engine has actually read the article (server news/impact-floor.ts). Absent while an item is still
  // headline-only — which is the honest difference between "read, and it is noise" and "never got behind
  // the headline". Optional: absent on every item the engine has not read, and on an older server.
  body_label?: string
  // The body verdict's OWN raw floor-lift — independent of materiality_label_floor above, which stays the
  // HEADLINE-only floor. Set only alongside body_label. Unlike the headline floor, this is NOT scaled by
  // boost_weight (server rank.ts reRankFromFactors) — it is independently-gathered evidence, not a
  // preference weight, and must survive at full strength regardless of the Overall-boost tunable.
  body_floor?: number
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
  inboxed: boolean // eligible for the inbox projection (band is pick/watch), not proof it remains in today's capped snapshot
  decision_rule_version?: string
  decision_kept?: boolean
  decision_reason_codes?: string[]
  original_triage_score?: number
  decision_rank_inputs?: {
    strong_signal_count: number
    event_priority: number
    source_rank: number
    quantified: boolean
    independent_reports: number
    original_score: number
    specific_date: boolean
    found_at: string
    ticker_present: boolean
  }
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
  // Set when this read produced a firm body-materiality verdict that changed the item's rank (server
  // news/impact-floor.ts + rank.ts) — the re-scored triage_score/band/rank_factors for THIS event_id,
  // computed the moment the read completed rather than waiting for the wire's next full load. Absent
  // when no verdict fired (nothing to rescore) or on an older server. See ui/server/src/server.ts
  // /api/news/enrich (Codex review, PR #350).
  rescored?: { rank_score: number; band: FeedItem['band']; rank_factors: RankFactors }
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
  inboxed: number // snapshot rows in the current inbox projection after merge, not this look's completed count
  note?: string
}

// The structured reason a cycle deferred items + the Haiku fallback's state (mirrors the server enums in
// ui/server/src/news/types.ts). Kept as string unions; the panel still has a generic fallback at runtime so
// a newer engine's unknown value explains that the batch is blocked rather than rendering a blank sentence.
export type DeferReason =
  | 'aborted'
  | 'usage-ledger-unavailable'
  | 'free-budget-spent'
  | 'provider-day-limit'
  | 'provider-retry-held'
  | 'groq-cooldown' // legacy summary during a rolling deploy
  | 'allowance-paced'
  | 'paced' // legacy summary during a rolling deploy
  | 'feed-cap'
  | 'feed-write-failed'
  | 'inbox-withheld'
  | 'storage-emergency'
  | 'no-scoring-provider'
  | 'batch-failed'
export type LastResortState = 'off' | 'unavailable' | 'scored' | 'usd-cap' | 'plan-quota' | 'auth-expired' | 'cooling' | 'paced' | 'available'

// One ingest cycle's outcome, streamed live over /api/news/stream as `news-cycle`. Mirrors the server's
// CycleSummary (ui/server/src/news/types.ts). Every field past `dropped` is optional so an OLDER engine
// (the ~20-30s deploy-skew window where the new bundle is served by the old server) simply renders less,
// never a wrong number.
export interface CycleSummary {
  ts: string
  completed_at?: string // result-available time; old cycle rows have only the start timestamp above
  ok: boolean
  fetched: number // raw articles pulled from the sources
  candidates: number // total queue submitted to triage: fetched-path rows plus carried backlog
  picked: number
  watched: number
  dropped: number
  inboxed?: number // snapshot rows in the current inbox projection after merge, not this look's completed count
  groq_requests?: number
  groq_tokens?: number
  local_requests?: number // batches scored by the LOCAL primary brain (unlimited / $0) — present only when it ran
  local_tokens?: number
  local_down?: boolean // the LOCAL primary brain was unreachable/failed this cycle → the scan ran on the cloud fallback
  note?: string // why a cap was hit / why items were deferred — the warning the user must see
  // end-to-end transparency (all optional — an older server simply omits them)
  fresh?: number // fetched-path items, including a source redelivery of a backlog resident
  new_arrivals?: number // unique fetched IDs absent from the backlog snapshot; authoritative new inflow
  carryover?: number // re-queued deferred-backlog items included in `candidates`
  deferred?: number // items pushed to the backlog this cycle
  backlog?: number // deferred backlog depth after this cycle
  backlog_cap?: number // active work-window size; excess raw input waits in durable overflow
  feed_unwritten?: number // queued rows whose durable firehose records did not land; no uncommitted row counts as complete
  feed_write_failed?: boolean // firehose inspection/append failed; affected work remains queued
  feed_cap_kind?: 'items' | 'bytes' // which hard daily firehose boundary refused the retryable suffix
  inbox_feed_pending?: number // inbox-eligible rows awaiting feed commit; the current capped inbox snapshot may or may not contain them
  seen_write_failed?: boolean // durable dedup receipt could not land; completed rows remain in feed recovery
  inbox_withheld?: number // inbox-eligible rows whose first-seen clock could not be PROVED — they stay queued and retry. Present only when >0
  inbox_write_failed?: boolean // the inbox projection refused outright; the wire, the summary and the backlog cleanup still ran. Present only when true
  aborted?: boolean // the wall-clock guard killed this cycle and dumped the remainder to the backlog
  defer_reason?: DeferReason
  defer_reasons?: DeferReason[] // complete ordered cause set; defer_reason remains the rolling-deploy fallback
  last_resort?: LastResortState // the Haiku fallback's state — makes "why nothing scored" honest
  sources?: Record<string, number> // raw articles per source layer this cycle (absent on a drain)
  phase?: 'fetch' | 'drain'
  feed_commit_version?: 1
}

// GET /api/bridge/status — the company-news bridge's own state. `running` means the 12h loop is really
// ticking (batch mode AND this engine won the singleton lock); when it is not, `idleReason` says why, so
// the chip never shows a bare "off" with no explanation.
export interface BridgeSubjectStatus { subject: string; notes: number; newestAt: string | null }
export interface BridgeStatus {
  mode: string
  running: boolean
  sweeping: boolean
  intervalMin: number
  subjects: BridgeSubjectStatus[]
  totalNotes: number
  lastSweepAt: string | null
  nextSweepAt: string | null
  last: { subjects: number; written: number; duplicates: number; analyses: number } | null
  idleReason: string | null
  /** the manifest exists but is unreadable/malformed right now — a real config error, reported even while
   *  `running` is otherwise true, so a bad edit never reads as a quiet, valid zero-subject sweep */
  manifestError: string | null
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
  backlog?: { count: number; cap: number; unavailable?: boolean } // durable retry depth + active work-window size; unavailable means the queue authority needs attention
  today: {
    /** Optional for rolling deploys. Unique arrivals; null when legacy cycle data cannot prove them. */
    newArrivals?: number | null
    read: number
    kept: number
    dropped: number
    cycles: number
    /** Optional for rolling deploys. Only true means every included outcome crossed the durable feed boundary. */
    durablyCommitted?: boolean
    /** Optional for rolling deploys. Started looks today with no durable completion summary. */
    incompleteCycles?: number
    /** Optional for rolling deploys. Missing-summary incidents already preserved in permanent audit. */
    recordedInterruptions?: number
    /** Optional for rolling deploys. Absent is unverified; true means the counters are lower bounds. */
    totalsLowerBound?: boolean
    /** Optional for rolling deploys. Whether today's summary partition itself was readable. */
    historyStatus?: 'complete' | 'missing' | 'unreadable' | 'unavailable'
    /** Optional for rolling deploys. Malformed daily cycle-summary rows. */
    corruptCycleRows?: number
  }
  budget: {
    requests: number; tokens: number; reqCap: number; tokenCap: number; tokenTarget?: number; paceCeiling?: number
    enabled?: boolean; unlimited?: false; spendingAllowed?: boolean; health?: TierHealth
    providerDayExhausted?: boolean; ledgerUnavailable?: boolean
    cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string
  }
  // every free OVERFLOW pool (Gemini + each OpenAI-compatible provider) — one entry per provider; the
  // cockpit renders a chip per entry, so a newly-wired key appears automatically. color = a CSS var name.
  // tokenCap is present only for TOKEN-gated providers — the chip then reads tokens (its
  // binding limit) instead of requests, so the number shown is ground truth.
  overflow?: {
    id: string; label: string; color: string; model: string; requests: number; reqCap: number; tokens: number; tokenCap?: number
    enabled?: boolean; unlimited?: boolean; spendingAllowed?: boolean; health?: TierHealth
    providerDayExhausted?: boolean; ledgerUnavailable?: boolean
    cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string
  }[]
  // the LOCAL primary brain — the unlimited $0 tier tried FIRST for every batch when enabled AND primary.
  // Absent when local is off OR demoted to a fallback (it then appears in `overflow`). The cockpit renders this
  // FIRST and prominently, showing live tokens/requests processed today — there is no cap to show.
  local?: {
    id: string; label: string; color: string; model: string; requests: number; tokens: number
    enabled?: true; unlimited?: true; spendingAllowed?: boolean; health: TierHealth
    providerDayExhausted?: boolean; cooldownRemainingMs?: number; cooldownReason?: string; nextEligibleAt?: string; ledgerUnavailable?: boolean
  }
}

// ---- full pipeline diagnostics (GET /api/news/diagnostics) — mirrors server NewsDiagnostics ----
export type TierHealth = 'healthy' | 'paced' | 'cooling' | 'budget-spent' | 'unavailable' | 'disabled'

export interface TierDiagnostics {
  id: string
  label: string
  color: string // a CSS var NAME (e.g. '--accent', '--provider-or'); the chip reads it, never a literal
  role: 'primary' | 'overflow' | 'gemini' | 'last-resort'
  order: number // routing order in the fallback chain (0 = tried first)
  enabled: boolean
  spendingAllowed?: boolean // false only when the shared news engine is off or has no active lease owner
  meter: 'requests' | 'usd'
  health: TierHealth
  providerDayExhausted?: boolean // explicit provider-day signal; usage meters remain actual engine records
  ledgerUnavailable?: boolean // durable usage record cannot be trusted; admission is closed and counters are omitted
  requestsToday?: number
  reqCap?: number
  tokensToday?: number
  tokenCap?: number
  usdToday?: number
  usdCap?: number
  callsToday?: number
  cooldownRemainingMs?: number
  cooldownReason?: string
  retryScope?: 'shared' | 'triage'
  nextEligibleAt?: string
  consecutiveFailures?: number
  // rolling-deploy compatibility for legacy, un-fingerprinted provider-access markers
  credentialRejected?: boolean
  keyEnvVar?: string // the env-var NAME holding that credential (never the value)
  quarantined?: boolean // standing key/account/model/config fault; no retry timer can repair it
  quarantineReason?: string
  quarantineScope?: 'provider' | 'workload'
  quarantinedAt?: string
  quarantineObservations?: number
  disabledReason?: string // actionable explanation for an optional tier shown while disabled
  failingForMs?: number // how long the current unbroken failure streak has run (the backoff window pins flat and stops telling you)
  lastFailureMs?: number // how long the last failing call ran — at the deadline means WE cut it off
  failuresToday?: number
  fails?: number // legacy alias; consecutive streak, never a day total
  triageAttemptsToday?: number
  triageScoredBatchesToday?: number
  lastCycleRequests?: number
  routing?: {
    actualRank: number | null
    shadowRank: number | null
    fitnessScore: number
    components: { usableBatchYield: number; usefulThroughput: number; releasedCapacityUrgency: number; failurePenalty: number; costPenalty: number }
    sampleSize: number
    eligible: boolean
    eligibilityReason: string
    explorationDue: boolean
    lastSelectedAt: string | null
    lastSuccessAt: string | null
  }
}

export type PipelineFlowCoverage = 'complete' | 'partial' | 'none'
export type PipelineFlowComparisonStatus = 'ahead' | 'equal' | 'behind' | 'unavailable'

export interface PipelineFlowMeasure {
  items: number | null
  perSecond: number | null
  measured: boolean
  coverage: PipelineFlowCoverage
  knownCycles: number
  totalCycles: number
}

export interface PipelineFlowRates {
  windowMinutes: number
  from: string
  to: string
  /** Optional only for deploy skew; the presentation fails closed while an older flow server omits it. */
  history?: {
    coverage: PipelineFlowCoverage
    requiredDates: string[]
    readDates: string[]
    missingDates: string[]
    unreadableDates: string[]
    corruptCycleRows: number
    incompleteCycles?: number
    recordedInterruptions?: number
    todayIncompleteCycles?: number
    todayRecordedInterruptions?: number
    todayTotalsLowerBound?: boolean
    todayHistoryStatus?: 'complete' | 'missing' | 'unreadable'
    todayCorruptCycleRows?: number
    gapMarkerUnreadable?: boolean
    interruptionAuditUnreadable?: boolean
  }
  inflow: PipelineFlowMeasure
  scanning: PipelineFlowMeasure
  comparison: {
    measured: boolean
    status: PipelineFlowComparisonStatus
    /** Scanning minus unique arrivals: capacity headroom or queue pressure, before expiry/cap loss. */
    scanningMinusInflowItemsPerHour: number | null
  }
}

export interface ScannerHealthFinding {
  code: string
  severity: 'warning' | 'critical'
  message: string
  action: string
  restartRecommended: boolean
}

export interface ScannerHealthVerdict {
  status: 'healthy' | 'degraded' | 'failing' | 'idle'
  code: string
  summary: string
  action: string
  restartRecommended: boolean
  findings: ScannerHealthFinding[]
}

export interface NewsDiagnostics {
  ts: string
  enabled: boolean
  running: boolean
  readOnly: boolean
  intervalMin: number
  lastCycleAt: string | null
  nextCycleAt: string | null
  /** Optional only while a new cockpit is talking to an older server during a rolling deploy. */
  health?: ScannerHealthVerdict
  /** Optional for a new cockpit talking to an older server during a rolling deploy. */
  flow?: PipelineFlowRates
  /** Optional for rolling deploys; absent means the static order remains the only proven route. */
  router?: {
    requestedMode: 'auto' | 'shadow' | 'static'
    mode: 'static' | 'shadow' | 'adaptive' | 'static-fallback'
    reason: string
    shadowStartedAt: string | null
    activatesAt: string | null
    activatedAt: string | null
    outcomeCount: number
    providerCount: number
    pendingDecisions: number
    coverageComplete: boolean
  }
  tiers: TierDiagnostics[]
  rescue?: {
    mode: 'off' | 'shadow'
    selectorVersion: string
    status: 'disabled' | 'warming' | 'ready' | 'paused_core_work' | 'directory_paused' | 'audit_unavailable'
    reason: string
    candidatesFound: number | null
    primaryCandidates: number | null
    nameCandidates: number | null
    identityChecks: number | null
    checksReleased: number | null
    verified: number | null
    identityUnresolved: number | null
    directoryUnavailable: number | null
    articleReads: number
    ideasCreated: number
    capacityMisses: number | null
    queuedForLater: number | null
    retryCooling?: number | null
    retryExhausted?: number | null
    auditHealthy: boolean
    circuitOpenUntil: string | null
    dailyCap: number
    reconciliation: {
      total: number; inboxed: number; outside_score: number; social: number; routine_filing: number
      duplicate: number; manually_blocked?: number; no_identity: number; no_signal: number; candidates: number
    } | null
  }
  // retiredToday is optional so a cockpit talking to an older server degrades cleanly (reads as absent, not 0-with-confidence)
  backlog: {
    unavailable?: boolean; count: number; unscoredCount?: number; projectionRecoveryCount?: number
    cap: number; pctOfCap: number; nearLimit: boolean; trend: 'growing' | 'shrinking' | 'flat' | null
    lostToday: number; retiredToday?: number; maxAgeHours?: number
  }
  today: {
    newArrivals?: number | null
    read: number
    kept: number
    dropped: number
    cycles: number
    /** Optional for deploy skew. Absent/false means legacy outcome counts are not durable-feed proof. */
    durablyCommitted?: boolean
    /** Optional for deploy skew. Started looks today whose durable completion summary is absent. */
    incompleteCycles?: number
    /** Optional for deploy skew. Missing-summary incidents already preserved in permanent audit. */
    recordedInterruptions?: number
    /** Optional for deploy skew. True means the numeric totals are only proven lower bounds. */
    totalsLowerBound?: boolean
    /** Optional for deploy skew. Whether today's cycle-summary partition itself was readable. */
    historyStatus?: 'complete' | 'missing' | 'unreadable' | 'unavailable'
    /** Optional for deploy skew. Malformed daily cycle-summary rows. */
    corruptCycleRows?: number
  }
  lastCycle: {
    ts: string
    phase: 'fetch' | 'drain' | null
    fetched: number
    candidates: number
    /** Optional for deploy skew; null means a legacy summary cannot prove the arrival split. */
    newArrivals?: number | null
    /** Fetched-path rows, including source redelivery of backlog residents. */
    fresh: number | null
    carryover: number | null
    picked: number
    watched: number
    dropped: number
    deferred: number | null
    aborted: boolean
    note: string | null
    deferReason: DeferReason | null
    /** Optional for deploy skew. Only true proves pick/watch/drop crossed the durable feed boundary. */
    durablyCommitted?: boolean
    lastResort: LastResortState | null
    anthropicCostUsd: number | null
    scoredBy: { id: string; label: string; requests: number }[]
  } | null
  defer: {
    active: boolean
    reason: DeferReason | null
    reasons?: DeferReason[] // optional while an older engine is serving
    plainNote: string | null
    lastResort: LastResortState | null
    blockingTiers: string[]
    retryHeldTiers?: string[] // optional while an older engine is still serving
    providerDayExhaustedTiers?: string[]
    allowanceExhaustedTiers?: string[]
    unavailableTiers?: string[]
    pacedTiers?: string[]
    needsCredentialTiers?: string[] // optional while an older engine is still serving
    quarantinedTiers?: string[] // optional while an older engine is still serving
  }
}

export interface PipelineTrendBucket {
  start: string
  end: string
  inflowPerSecond: number | null
  scanningPerSecond: number | null
  backlog: number | null
  retired: number | null
  legacyLoss: number | null
  verified: boolean
  routerMode: 'static' | 'shadow' | 'adaptive' | 'static-fallback' | null
  routerTransition: string | null
  providers: Record<string, { successes: number; failures: number; scoredItems: number; actualRank: number | null; shadowRank: number | null; health: string | null; routingChanges: number }>
}

export interface PipelineTrend {
  from: string
  to: string
  bucketMs: number
  timezone: 'UTC'
  coverage: { complete: boolean; missingPipelineDays: string[]; missingFirehoseDays: string[]; corruptRows: number; unreadableDays: string[]; truncated: boolean }
  buckets: PipelineTrendBucket[]
  providers: Array<{ id: string; contributionShare: number; usableBatchYield: number; usefulThroughput: number; releasedCapacityUtilization: number | null; failures: number; currentRank: number | null }>
}

export type PipelineAuditEvent =
  | { v: 1; kind: 'provider_decision'; ts: string; cycleId: string; decisionId: string; mode: string; actualProviderId: string | null; shadowProviderId: string | null; exploration: boolean; candidates: Array<{ id: string; eligible: boolean; reason: string; score: number; rank: number | null; actualRank?: number | null; shadowRank?: number | null; sampleSize: number; components: { usableBatchYield: number; usefulThroughput: number; releasedCapacityUrgency: number; failurePenalty: number; costPenalty: number } }> }
  | { v: 1; kind: 'provider_outcome'; ts: string; cycleId: string; decisionId: string; providerId: string; outcome: 'success' | 'failure'; failureClass: string | null; batchSize: number; scoredItems: number; networkCalls: number; tokens: number; costUsd: number; elapsedMs: number }
  | { v: 1; kind: 'provider_snapshot'; ts: string; cycleId: string; phase: string; providers: Array<{ id: string; state: string; eligible: boolean; reason: string; allowanceUsed?: number; allowanceReleased?: number; allowanceCap?: number; consecutiveFailures?: number }> }
  | { v: 1; kind: 'router_transition'; ts: string; cycleId: string; from: string; to: string; reason: string }
  | { v: 1; kind: 'cycle_interruption'; ts: string; cycleId: string; startedAt: string; reason: 'missing-summary-after-timeout' }

export interface ActiveRunLite {
  runId: string
  kind: string
  ticker: string
  module?: string
  status: string
  swarmId?: string // 'research' (default) or a SWARM.md id — lets the UI scope a run to its swarm
  unit?: string // 'ticker' | 'signal' | … (the swarm's unit of work)
  startedAt?: number // epoch ms the run started — drives the live "running Nm" elapsed readout
  provider?: import('./provider').RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  cliVersion?: string
  chainId?: string
  executionEpoch?: string
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
  idea_version?: string // immutable snapshot key; optional only for a rolling deploy from an older engine
  idea_version_started_at?: string // version epoch; distinguishes an A→B→A recurrence of the same hash
  ticker: string
  company: string | null
  exchange: string | null // the model's guess, UNVERIFIED
  direction: 'long' | 'short' | 'pair'
  pair_with: string | null
  reason: string
  why_now: string
  conviction: number // 0-100 pre-edge PROXY
  conviction_basis: 'pre_edge_proxy'
  trade_score: number
  trade_score_basis: 'evidence_gate_v1' | 'evidence_gate_v2' | 'pre_edge_proxy_legacy'
  trade_score_breakdown: { evidence: number; impact: number; specificity: number; timing: number; expression: number; corroboration: number; learning_adjustment: number } | null
  trade_readiness: 'check_now' | 'needs_data' | 'watch_only'
  missing_checks: string[]
  learning: { resolved: number; positive: number; negative: number; adjustment: number; basis: string; evidenceIds: string[] } | null
  priced_in: 'priced' | 'room' | 'unknown'
  thesis_type: string
  origin_type?: 'wire' | 'theme' | 'mixed'
  source_themes?: { theme_id: string; theme_rev: number }[]
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
  // A committed board-only row can be preserved without inventing the missing strict SurfacedIdea fields.
  // It remains visible until decay and counts in surfaced/live inventory, but is deliberately read-only.
  recovery_only?: boolean
  promotion_available?: boolean
}
// Earlier news leads are a separate, audit-only projection. They retain the card evidence needed to
// explain what surfaced, but their expired lifecycle cannot be promoted back into paid research.
export interface ArchivedBoardIdea extends Omit<BoardIdea, 'idea_version' | 'idea_version_started_at' | 'status' | 'stale' | 'promoted_signal_id'> {
  idea_version: string
  idea_version_started_at: string
  status: 'expired'
  stale: true
  promoted_signal_id: null
  archived_at: string
  archive_reason: 'expired' | 'expired_pruned' | 'historical_board_expired' | 'latest_board_current'
  audit_only: true
}
export interface IdeasArchiveSideCounts { total_count: number; shown_count: number; hidden_count: number }
export interface IdeasArchiveHealth {
  status: 'missing' | 'ok' | 'degraded' | 'unreadable'
  file_count: number
  suppression_count: number
  corrupt_count: number
  invalid_count: number
  error: string | null
}
export interface IdeasArchiveRetentionSide {
  evicted_count: number
  oldest_retained_at: string | null
}
export interface IdeasArchiveRetention extends IdeasArchiveRetentionSide {
  truncated: boolean
  side_counts: { long: IdeasArchiveRetentionSide; short: IdeasArchiveRetentionSide }
}
export interface IdeasArchive {
  schema_version: 'ideas-archive/v1'
  health: IdeasArchiveHealth
  retention: IdeasArchiveRetention
  total_count: number
  shown_count: number
  hidden_count: number
  side_counts: { long: IdeasArchiveSideCounts; short: IdeasArchiveSideCounts }
  /** Seen in board history, but not shown as expired because expiry could not be proved. */
  unconfirmed_counts?: { long: number; short: number }
  rows: ArchivedBoardIdea[]
}
// The skim's honest track record (no price / no P&L). surfaced_total is cumulative known exact occurrences
// across current, retained, withdrawn, and evicted history; live_count is current within-shelf-life rows.
// The header shows a confirmation rate only once `resolved` clears a small floor.
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
// Truth metadata for the cheap ideas preflight. `status` says whether the worker is available now;
// `outcome` says what the last attempt produced. The UI must use `last_success_at` for freshness — the
// board itself is rebuilt for many unrelated reasons, so `generated_at` is not an ideas timestamp.
export type IdeasHealthStatus = 'disabled' | 'waiting' | 'deferred' | 'running' | 'healthy' | 'degraded' | 'error'
export type IdeasHealthOutcome = 'not_run' | 'skipped' | 'success_empty' | 'success_with_ideas' | 'failed'
export type IdeasHealthReasonCode =
  | 'disabled'
  | 'never_run'
  | 'ingester_disabled'
  | 'insufficient_inputs'
  | 'min_interval'
  | 'inputs_unchanged'
  | 'missing_api_key'
  | 'provider_cooldown'
  | 'daily_budget'
  | 'paced_budget'
  | 'rate_limiter_busy'
  | 'provider_error'
  | 'internal_error'
  | 'stale_running'
  | 'stale_health'
  | 'health_corrupt'
  | 'stale_inputs'
  | 'snapshot_store_error'
  | 'write_conflict'
  | null
export type IdeaSnapshotStoreStatus = 'missing' | 'ok' | 'degraded' | 'unreadable'
export interface IdeaSnapshotStoreDiagnostics {
  status: IdeaSnapshotStoreStatus
  file_count: number
  valid_count: number
  corrupt_count: number
  invalid_count: number
  unprojectable_count: number
  error: string | null
}
export interface IdeasHealth {
  schema_version: 'ideas-health/v1'
  enabled: boolean
  status: IdeasHealthStatus
  outcome: IdeasHealthOutcome
  reason_code: IdeasHealthReasonCode
  reason: string | null
  updated_at: string
  last_attempt_at: string | null
  last_success_at: string | null
  next_eligible_at: string | null
  input_count: number
  produced_count: number
  live_count: number
  stale_count: number
  snapshot_store?: IdeaSnapshotStoreDiagnostics
}
export interface QualifiedIdeaIssue {
  code: string
  message: string
  disposition: 'research' | 'reject'
}
export interface QualifiedIdeaCandidate {
  schema_version: 'qualified-idea/v1'
  policy_version: string
  idea_id: string
  market_evidence_sha256: string
  projection_manifest_sha256: string
  run_root: string
  decision_date: string
  created_at: string
  instrument: { ticker: string; company: string; exchange: string; currency: string; direction: 'long' | 'short'; asset_type: 'equity' }
  horizon: { start: string; end: string }
  quote: { price: number; as_of: string; source: string; identity_verified: boolean; stale: boolean }
  liquidity: {
    verified: boolean; as_of: string; source: string; lookback_days: number; observed_sessions: number
    coverage_pct: number; window_start: string; window_end: string; median_daily_value_usd: number
    currency_conversion: { pair: string; rate_usd_per_currency: number; as_of: string; source: string }
  }
  market_risk: { as_of: string; source: string; lookback_days: number; ordinary_move_pct: number }
  research: {
    decision: string; integrity_status: 'verified' | 'provisional' | 'unaudited'
    data_sufficiency_score: number; edge_score: number; edge_proof: string
    hard_cap_active: boolean; hard_cap_reason: string | null
    unresolved_red_flags: { id: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; description: string }[]
    calibration_status: 'pre_data' | 'insufficient' | 'measured' | 'calibrated'
  }
  catalyst: {
    forecast_id: string; name: string; window_start: string; window_end: string; source: string
    status_at_admission: 'scheduled_unresolved'; status_as_of: string; causal_steps: string[]
    bullish_trigger: string; bearish_trigger: string
  }
  falsifier: { condition: string; metric: string; threshold: string; deadline: string; source: string }
  valuation_bridge: { source_horizon_days: number; method: string; convergence_fraction: number | null; rationale: string; source: string }
  scenarios: { scenario_id: string; label: string; probability_pct: number; price_target: number; source_price_target: number; return_pct?: number | null; conditions: string[]; source: string; joint_probability_basis?: string | null }[]
}
export interface QualifiedIdeaMetrics {
  expected_return_pct: number
  loss_probability_pct: number
  worst_case_loss_pct: number
  tail_loss_pct: number
  best_case_return_pct: number
  probability_sum_pct: number
  scenario_returns: { label: string; probability_pct: number; return_pct: number }[]
}
export interface QualifiedIdeaRanking {
  /** Runtime validation owns the policy allowlist so malformed/future payload tests remain expressible. */
  policy_version: string
  calibration_status: 'pre_data' | 'insufficient' | 'measured' | 'calibrated'
  raw_expected_return_pct: number
  positive_return_retention: number
  return_haircut_pct: number
  conservative_expected_return_pct: number
  uncapped_evidence_confidence_score: number
  evidence_confidence_cap: number
  evidence_confidence_score: number
  rationale: string
}
export interface QualifiedIdeaEvaluation {
  candidate: QualifiedIdeaCandidate
  status: 'qualified' | 'needs_research' | 'does_not_clear'
  issues: QualifiedIdeaIssue[]
  metrics: QualifiedIdeaMetrics | null
  /** Optional during a rolling server/web deploy; present on engines with conservative ranking. */
  ranking?: QualifiedIdeaRanking | null
  pareto_layer: number | null
  calibration_note: string
  admission?: { admission_id: string; admission_sha256: string; candidate_sha256: string; frozen_at: string }
}
export interface QualifiedIdeaCalibrationStats {
  outcomes: number; unique_ideas: number; unique_tickers: number
  average_predicted_positive_pct: number | null; realized_positive_pct: number | null
  positive_calibration_gap_pp: number | null; mean_brier_positive: number | null
  average_predicted_return_pct: number | null; average_realized_return_pct: number | null
  return_forecast_error_pct: number | null; mean_absolute_return_error_pct: number | null
  scenario_range_coverage_pct: number | null
  tail_loss_breach_pct: number | null; average_max_adverse_excursion_pct: number | null
  average_excess_vs_benchmark_pct: number | null; benchmark_observations: number; benchmark_coverage_pct: number | null
}
export interface QualifiedIdeasPolicy {
  horizonMinDays: number
  horizonMaxDays: number
  entryMaxSkewDays: number
  quoteMaxAgeDays: number
  liquidityMaxAgeDays: number
  liquidityLookbackMinDays: number
  liquidityMinCoveragePct: number
  marketRiskLookbackMinDays: number
  minMedianDailyValueUsd: number
  minDataSufficiency: number
  minEdgeScore: number
  minExpectedReturnPct: number
  maxTailLossPct: number
  maxWorstCaseLossPct: number
  minAdverseProbabilityPct: number
  minAdverseMovePct: number
  minAdverseVsOrdinaryMove: number
  minFavorableVsOrdinaryMove: number
  tailProbabilityPct: number
  probabilityTolerancePct: number
  returnReconciliationTolerancePct: number
}
export interface QualifiedIdeasBoard {
  schema_version: 'qualified-ideas-board/v1' | 'qualified-ideas-board/v2'
  generated_at: string
  policy_version: string
  /** Introduced in v2; optional so a v1 server remains readable during a rolling deploy. */
  ranking_policy_version?: string
  policy: QualifiedIdeasPolicy
  health: {
    status: 'pre_data' | 'healthy' | 'degraded'
    outcome: 'no_artifacts' | 'publishing' | 'none_clear' | 'qualified' | 'invalid_artifacts' | 'storage_error'
    reason: string
    artifact_count: number; assessment_count: number; parsed_count: number; invalid_count: number; incomplete_count?: number; publishing_count?: number
    not_assessable_count: number; qualified_count: number; needs_research_count: number
    does_not_clear_count: number; measured_count: number
  }
  outcome_health_state: 'valid' | 'expired' | 'unknown'
  outcome_health: null | {
    schema_version: 'qualified-idea-outcomes-health/v2'; repository_scope_sha256: string; pass_id: string; pass_sequence: number; pass_started_at: string
    status: 'pre_data' | 'healthy' | 'degraded' | 'error'
    outcome: 'no_qualified_ideas' | 'nothing_due' | 'endpoint_pending' | 'resolved' | 'history_missing' | 'admission_failed' | 'provider_failed' | 'failed'
    reason: string; updated_at: string; expires_at: string; terminal: true
    qualified_idea_count: number; admission_count: number; admission_appended_count: number
    admission_existing_count: number; admission_conflict_count: number; due_count: number
    appended_count: number; existing_count: number; unresolved_count: number; not_due_count: number; endpoint_pending_count: number
    ledger_invalid_count: number; ledger_conflict_count: number
    missing_history: string[]; missing_comparators: string[]
    provider_failures: { symbol: string; role: 'security' | 'benchmark' | 'sector'; code: string; reason: string }[]
    errors: string[]
  }
  calibration: {
    schema_version: 'qualified-idea-calibration/v2'; policy_version: string; generated_at: string
    status: 'pre_data' | 'insufficient' | 'measured'; reason: string
    minimums: { outcomes: number; unique_tickers: number; benchmark_coverage_pct: number }
    valid_outcome_count: number; invalid_outcome_count: number; conflicting_outcome_count: number
    future_outcome_count: number; excluded_nonstanding_count: number
    overall: QualifiedIdeaCalibrationStats; by_horizon: Record<string, QualifiedIdeaCalibrationStats>
    by_horizon_direction: Record<string, {
      horizon_bucket: string; direction: 'long' | 'short'; status: 'pre_data' | 'insufficient' | 'measured'
      reason: string; stats: QualifiedIdeaCalibrationStats
    }>
  }
  qualified: QualifiedIdeaEvaluation[]
  needs_research: QualifiedIdeaEvaluation[]
  does_not_clear: QualifiedIdeaEvaluation[]
  not_assessable: { assessment_id: string; run_root: string; created_at: string; ticker: string; company: string | null; gaps: string[] }[]
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
// ---- the chain lane -------------------------------------------------------------------------------
// Outside suppliers, customers, and distributors read out of the Capital IQ relationship exports in each
// company's data pool. These are research LEADS with a cited evidence chain, never ideas: the export
// proves a relationship exists, and says nothing about how big it is — so a lead carries the ANCHOR's
// verdict and which way the link transmits, and never a direction of its own.
export type SupplyChainReadiness = 'research_now' | 'needs_anchor' | 'not_directional' | 'not_investable' | 'related_party'
export type SupplyChainTransmission = 'same_direction' | 'inverse' | 'none'

export interface SupplyChainPathStep {
  name: string
  listing: string | null
  role: string | null // how this step relates to the previous one; null on the anchor itself
}

export interface SupplyChainCoverage {
  subject: string
  has_run: boolean
  latest_run: string | null
  latest_decision: string | null
  data_pool_present: boolean
}

export interface SupplyChainLead {
  lead_id: string
  anchor_ticker: string
  anchor_name: string | null
  anchor_listing: string | null
  anchor_run_root: string
  anchor_decision: string | null
  anchor_decision_date: string | null
  name: string
  listing: string | null
  exchange: string | null
  symbol: string | null
  country: string | null
  industry: string | null
  description: string | null
  order: number
  path: SupplyChainPathStep[]
  role: string
  role_kind: 'operating' | 'financing' | 'other'
  transmission: SupplyChainTransmission
  mechanism: string
  disclosed_by: 'counterparty' | 'anchor_group' | null
  source_ref: string | null
  source_file: string | null
  link_strength: number
  link_strength_components: Record<string, number>
  lead_score: number
  lead_score_basis: 'chain_evidence_v1'
  lead_score_cap: number | null
  lead_score_cap_reason: string | null
  readiness: SupplyChainReadiness
  evidence_gaps: string[]
  prior_coverage: SupplyChainCoverage | null
}

export interface SupplyChainAnchorMap {
  ticker: string
  name: string | null
  listing: string | null
  run_root: string
  decision: string | null
  decision_date: string | null
  sheets: number
  scope_notes: string[]
  relationship_rows: number
  intragroup_rows: number
  intragroup_row_share_pct: number | null
  third_party_entities: number
  listed_third_parties: number
  listed_suppliers: number
  listed_customers: number
  exchanges: string[]
  industry_clusters: Array<{ industry: string; counterparty_count: number; third_party_count: number; listed_count: number; counterparties: string[] }>
  warnings: string[]
}

export interface SupplyChainBoard {
  schema_version: 'supply-chain-board/v1'
  generated_at: string
  score_basis: 'chain_evidence_v1'
  health: {
    status: 'healthy' | 'pre_data' | 'degraded'
    outcome: 'no_exports' | 'leads' | 'none_investable' | 'storage_error' | 'invalid_artifacts'
    reason: string
    run_count: number
    graph_count: number
    invalid_count: number
    input_warning_count: number
    pool_export_count: number
    sheet_count: number
    anchors_without_export: string[]
    lead_count: number
    research_now_count: number
    third_order_count: number
  }
  anchors: SupplyChainAnchorMap[]
  leads: SupplyChainLead[]
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
  ideas_archive?: IdeasArchive // expired, audit-only news leads; absent on an older engine
  ideas_scorecard?: IdeasScorecard // the skim's honest track record (absent on an older engine)
  ideas_health?: IdeasHealth // absent on a legacy engine; the UI must not infer success from `ideas: []`
  qualified_ideas?: QualifiedIdeasBoard // full-research 3-6 month gate; never inferred from news leads
  supply_chain?: SupplyChainBoard // the chain lane: outside counterparties read from the CIQ relationship exports
  counts: Record<string, number>
  book_momentum?: BookMomentum
  live?: { runId: string; kind: string; subjectId: string; runRoot: string | null; startedAt: number }[]
  // interrupted partial runs (broken by a closed laptop / dropped connection) the cockpit auto-resumes.
  resumable?: {
    sigId: string
    headline: string
    doneCount: number
    totalCount: number
    provider?: import('./provider').RunProvider
    executionProfile?: import('./provider').ProviderExecutionProfile
    reason?: string
    resetsAt?: number // unix seconds
    supervisorIdentity?: string
    autoResumeDue?: boolean
  }[]
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
    // pool-relative POSIX path when the document sits in a SUBFOLDER of the company folder (e.g.
    // "Filings 4/annual.pdf"); absent for a top-level file. `filename` stays the basename.
    path?: string
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
export type DataScanStage = 'finding' | 'reading' | 'checking' | 'ready' | 'failed'
export interface DataScanProgress {
  scanId: string
  ticker: string
  stage: DataScanStage
  completed: number
  total: number
  currentFile: string | null
  error: string | null
  startedAt: number
  updatedAt: number
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
  // Does ANY run folder carry a usable decision record? `latestRun` cannot answer this: a partial run and
  // a decided run with a null verdict both arrive as `decision: null`. Writers that need a real dossier to
  // attach to (send-to-research) gate on this. Optional so an older engine simply omits it — treat a
  // MISSING value as unknown and let the server refuse, never as proof the run is incomplete.
  hasStandingDecision?: boolean
}

// Per-subject run summary for a NON-research swarm's subject picker (commodity GOLD/SUGAR, …) — the lean
// twin of TickerSummary. A constellation swarm has ONE run folder per subject, so there is no run history /
// file count here; just whether it has run and the routing verdict (resolved server-side via the swarm's
// self-declared verdict field). Served alongside the plain subject-name list by GET /api/swarm/subjects.
export interface SwarmSubjectSummary {
  subject: string
  hasRun: boolean
  runRoot: string | null
  // EFFECTIVE verdict/confidence — the run's own red-team cap wins over the synthesizer's original
  // call when one applies (fixes F28/F28b, extended from research to every swarm)
  verdict: string | null
  decisionDate: string | null
  confidence: number | null
  verdictIsPostMortemCapped: boolean
  confidenceIsPostReview: boolean
  lastChangeAt: number | null
}

// One row of a ticker's run history (GET /api/runs?ticker=…). Newest-first; a run with no decision record
// is a partial / single-module re-run that never became the standing verdict.
// ---- fund book (the REAL portfolio, fed by IBKR Flex exports) ----
// Deliberately separate from the engine's MODEL paper-portfolio: that answers what the research said to
// own, this answers what is actually held.
export interface PortfolioStatement {
  id: string
  filename: string
  bytes: number
  uploadedAt: string
  accountId: string | null
  fromDate: string | null
  toDate: string | null
  trades: number
  /** Row count per section, so the import screen can show WHICH reports the query returned. */
  sections: Record<string, number>
  unmodelled: string[]
}
export interface PortfolioCheck {
  name: string
  ours: number | null
  broker: number | null
  break: number | null
  tolerance: number
  ok: boolean
  detail: string
}
export interface PortfolioPosition {
  symbol: string | null
  conid: string | null
  assetCategory: string | null
  /** COMMON / ETF / ADR — the only asset-class signal the statement carries. */
  subCategory: string | null
  currency: string | null
  quantity: number | null
  markPrice: number | null
  costBasisPrice: number | null
  costBasisMoney: number | null
  positionValue: number | null
  percentOfNAV: number | null
  unrealizedLocal: number | null
  fxRateToBase: number | null
  multiplier: number | null
  /** Futures and options carry NOTIONAL, not a NAV allocation — never weight them like equity. */
  isDerivative: boolean
}
export interface PortfolioClosure {
  symbol: string | null
  currency: string | null
  /** ABSOLUTE size; the direction is in `side`. */
  quantity: number
  /** Long or short, from the opening lot's sign. */
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  openedAt: string | null
  closedAt: string | null
  holdingDays: number | null
  /** Net of commission on both legs, as the broker states it. */
  realizedLocal: number
  /** The price difference before costs, kept so the two can be shown apart. */
  grossLocal: number
  commissionLocal: number
  realizedBase: number | null
  /** Rates at each end, so the result can be split into what the STOCK did and what the CURRENCY did. */
  openFxRateToBase: number | null
  closeFxRateToBase: number | null
  /** The closing execution this lot was matched against. One sell can consume several opening lots, so
   *  this is what groups the FIFO fragments back into the single trade the operator actually placed. */
  closeTradeID: string | null
}

export interface PortfolioBook {
  accountId: string | null
  baseCurrency: string | null
  asOf: string | null
  coverage: { from: string | null; to: string | null; documents: number }
  sectionsPresent: string[]
  sectionsUnmodelled: string[]
  positions: PortfolioPosition[]
  /** Closed round trips, recovered by FIFO matching — the trade history. */
  closures: PortfolioClosure[]
  openLots: { symbol: string | null; quantity: number; price: number; openedAt: string | null }[]
  corporateActions: { type: string | null; symbol: string | null; actionDescription: string | null; dateTime: string | null }[]
  flows: { date: string | null; currency: string | null; amount: number; amountBase: number | null; description: string | null }[]
  income: { dividendsGross: number; withholdingTax: number; paymentInLieu: number; interest: number; fees: number; net: number }
  /** Income earned and already inside NAV but not yet paid out. Null where the statements cannot prove it. */
  accruals: { dividend: number | null; interest: number | null; total: number | null }
  navSeries: { date: string; total: number }[]
  twr: number | null
  reconciliation: { ok: boolean; checks: PortfolioCheck[] }
  warnings: string[]
}
export interface PortfolioPeriodReturn {
  label: string; from: string | null; to: string | null; twr: number | null; days: number
  /** What cash would have returned over the same window, and the book's margin over it. */
  hurdle: number | null; overHurdle: number | null
  benchmark: number | null; excess: number | null
  /** The book has no valued day at or before this period's start, so the window is shorter than the
   *  label implies — a "year to date" on a book that only began in April. */
  partial: boolean
}
export interface PortfolioMonthRow { month: string; book: number | null; benchmark: number | null }
export interface PortfolioBetaAlpha { beta: number | null; alpha: number | null; pairedDays: number }
export interface PortfolioDrawdown {
  depth: number | null; peakDate: string | null; troughDate: string | null; recoveredDate: string | null
  toTroughDays: number | null; underWaterDays: number | null; episodesOver3pct: number
}
export interface PortfolioRisk {
  sampleDays: number
  /** False when the sample is too short to state ratios — show blanks, not numbers. */
  sufficient: boolean
  volatility: number | null; sharpe: number | null; sortino: number | null; calmar: number | null
  drawdown: PortfolioDrawdown
}
export interface PortfolioBenchmark {
  symbol: string; benchmarkTwr: number | null; excess: number | null
  from: string | null; to: string | null
  /** Why the comparison is unavailable, when it is — never a silent blank. */
  unavailable: string | null
}
/** What the operator types into the log-a-trade form. Validated by the engine, never here: one set of
 *  rules for every caller. */
export interface PortfolioManualInput {
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  currency: string
  tradeDate: string
  commission?: number
  note?: string | null
}
export interface PortfolioManualTrade extends PortfolioManualInput {
  id: string
  commission: number
  note: string | null
  loggedAt: string
  /** Set once a statement covers this date — the broker's own record has answered for it. */
  supersededBy: { statementId: string; filename: string; from: string | null; to: string | null } | null
  signedQuantity: number
  /** In the entry's OWN currency — there is no rate for a fill the book has not seen. */
  cashEffect: number
}
/** What the LIVE entries would do to one position, stated against what the book actually holds. */
export interface PortfolioManualEffect {
  symbol: string
  currency: string
  bookQuantity: number | null
  delta: number
  provisionalQuantity: number
  cashEffect: number
  trades: number
  crossesZero: boolean
}
export interface PortfolioManualRead {
  trades: PortfolioManualTrade[]
  live: number
  superseded: number
  effects: PortfolioManualEffect[]
}

/** What the operator has declared about a holding that the statement cannot say. */
export interface PortfolioOverrides {
  /** Symbols held as cash equivalents — a T-bill ETF is cash with a ticker, and the broker's own
   *  subCategory cannot tell one from a sugar fund. */
  cashEquivalents: string[]
}

/** A named idea the book expresses. The id is the anchor assignments point at; the label is only what
 *  is shown, so renaming never orphans a trade. */
export interface PortfolioIdea {
  id: string
  label: string
}

/** Which idea each holding and each closed round trip was expressing. DECLARED, never inferred: a
 *  ticker is not an idea, so positions are keyed by symbol (one open position at a time) and closed
 *  trades by the broker's own closeTradeIDs (which cannot span two eras of the same ticker). */
/** What POST /api/portfolio/idea returns: the whole read, plus the idea it created OR already had.
 *  The id is handed back explicitly because the server is idempotent on the slug — asking for 'sugar'
 *  when 'Sugar' exists returns 'Sugar', and a label match would miss it. */
export interface PortfolioIdeaCreated extends PortfolioRead { idea: PortfolioIdea }

export interface PortfolioIdeaBook {
  ideas: PortfolioIdea[]
  assignments: {
    positions: Record<string, string>
    closures: Record<string, string>
  }
}

/** One holding re-priced at the market. */
export interface PortfolioLiveRow {
  symbol: string
  quantity: number
  statementPrice: number | null
  price: number
  value: number
  movePct: number | null
}
/** The gap between the last statement and today, priced at the market. NEVER part of the book: it is
 *  today's prices against yesterday's share counts, and it ties to nothing. */
export interface PortfolioLiveMark {
  asOf: string | null
  /** True when the prices are a settled close rather than a live tick — the UI must say which. */
  asOfIsClose: boolean
  delayed: boolean
  stale: boolean
  bookAsOf: string | null
  staleDays: number | null
  nav: number | null
  unrealised: number | null
  /** Carried from the statement unchanged: the leg this estimate cannot see moving. */
  cash: number | null
  priced: PortfolioLiveRow[]
  unpriced: string[]
  unavailable: string | null
}

export interface PortfolioPerformance {
  periods: PortfolioPeriodReturn[]
  months: PortfolioMonthRow[]
  betaAlpha: PortfolioBetaAlpha
  /** Both curves rebased to 100 at the first funded day — NAV itself cannot be plotted against an
   *  index, because a deposit would draw as performance. */
  growth: { date: string; book: number; benchmark: number | null }[]
  /** Index levels for feed days AFTER the book's last valued day, rebased exactly as `growth` is. The
   *  index is a settled close there, not an estimate — it is the BOOK's forward mark that is priced at
   *  the market. Used only where the date matches the live mark, so it is never drawn at a book day. */
  benchmarkForward: { date: string; level: number }[]
  /** ANNUALISED (XIRR) — not comparable with the cumulative period returns, and labelled as such. */
  moneyWeightedAnnualisedPct: number | null
  risk: PortfolioRisk
  benchmark: PortfolioBenchmark
  riskFreeAnnualPct: number
  /** The hurdle's as-of date and where it came from, so a ratio can be checked against its basis later
   *  rather than being read as current forever. */
  riskFreeAsOf: string
  riskFreeSource: string
  /** What the index series measures — it is a price index, so it excludes the index's own dividends. */
  benchmarkBasis: string
  feedPresent: boolean
}

export interface PortfolioRead {
  statements: PortfolioStatement[]
  /** Hand-logged fills. A SEPARATE layer from the book: nothing here reaches the reconciled figures. */
  manual: PortfolioManualRead
  overrides: PortfolioOverrides
  /** Absent on an engine that predates idea grouping — the client must positively match it rather than
   *  defaulting one in, or a deploy skew window renders an empty grouping as real (DESIGN.md §5). */
  ideas?: PortfolioIdeaBook
  book: PortfolioBook | null
  performance: PortfolioPerformance | null
  error: string | null
}
export interface PortfolioUploadResult extends PortfolioRead {
  saved: PortfolioStatement[]
  duplicates: string[]
  fileErrors: { filename: string; reason: string }[]
}

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
  kind: RunKind
  ticker: string
  swarm?: string
  module?: string
  agent?: string
  agentCount: number
  estCostUsdRange: [number, number]
  estMinutesRange: [number, number]
  estimateEvidence?: {
    source: 'comparable_completed_runs' | 'unavailable'
    provider: import('./provider').RunProvider
    profileKey: string
    durationSampleSize: number
    costSampleSize: number
  }
  willCommitToMain: boolean
  estCommits: number
  requiresTypedConfirm: boolean
  creditPreflight: { ok: boolean; reason?: string; rateLimitType?: string; checked: boolean }
  provider?: import('./provider').RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  cliVersion?: string
  // A server-minted, exact-identity receipt. Re-run controls fail closed when it is absent (including
  // when a newly deployed browser is briefly talking to an older server that ignored the query fields).
  exactDecisionBinding?: {
    contractVersion: 'exact-decision-launch/1'
    runRoot: string
    decisionFingerprint: string
    intakePlan?: {
      contractVersion: 'exact-intake-orb/1'
      planPath: string
      planSha256: string
      sourceDecisionFingerprint: string
    }
  }
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
  provider?: import('./provider').RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
}

export type SseEvent = (
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
) & { provider?: import('./provider').RunProvider; executionProfile?: import('./provider').ProviderExecutionProfile; profileKey?: string; model?: string; reasoningLevel?: string; cliVersion?: string; chainId?: string; executionEpoch?: string }

// startedAt/endedAt are SERVER timestamps (from the agent-started / agent-done SSE events), so a finished
// orb's duration (endedAt - startedAt) is clock-skew-free. startedAt is set the instant the orchestrator
// dispatches the orb — "the data reaching the orb" — which is when its live timer starts.
export interface NodeRuntime { status: NodeStatus; verdict?: string | null; outputPath?: string; runId?: string; startedAt?: number; endedAt?: number }

// ---- chat with your data (closed-book Q&A over a run's synthesized output) ----
export type ChatScope = 'run' | 'module' | 'orb' | 'wire'
export type AskMemoryMode = 'auto' | 'run' | 'news'
export interface AskMemoryMeta {
  kind: 'ask-memory'
  mode: AskMemoryMode
  reason: string
  shelves: { kind: 'run' | 'news' | 'chats' | 'calls'; label: string; count: number }[]
  newsEvidence?: NewsChatEvidence[]
}
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
  periodNote?: boolean | null     // TRUE when the question asked about a period this single-period scenario can't forecast — the disclaimer is gated on THIS, not on periodBase
  periodBase?: string | null      // the sidecar's base period when known (decorates the note); may be null while periodNote is true
  note?: string | null            // set on the first card of a multi-variable answer
}
// The driver -> TARGET hop (scripts/valuation_math.py's reprice_from_metric, via the server's chat-whatif).
// Field names mirror the server's ui/server/src/chat-whatif.ts RepricedCase/RepricedValuation EXACTLY
// (snake_case) — this payload is the raw engine JSON passed straight through the server with no camelCase
// reshaping (unlike ComputedScenario, which the server DOES reshape via shapeScenario), so the client must
// mirror the same snake_case shape rather than re-deriving one.
export interface RepricedCase {
  label: string
  probability: number | null
  responds: boolean
  why?: string | null
  level_before: number | null
  level_after: number | null
  return_before: number | null
  return_after: number | null
  multiple?: number | null
  multiple_basis?: string | null
  source?: string | null
  bridge_source?: string | null
  derivation_source?: string | null
}
export interface RepricedValuation {
  ok: boolean
  reason?: string | null
  detail?: string | null
  price?: number | null
  price_as_of?: string | null
  direction?: 'long' | 'short'
  metric_before?: number | null
  metric_after?: number | null
  cases?: RepricedCase[]
  responded?: number
  held?: string[]
  expected_return_pct_before?: number | null
  expected_return_pct_after?: number | null
  prob_weighted_target_before?: number | null
  prob_weighted_target_after?: number | null
  warnings?: string[]
}
export type ChatComputed =
  // `reprice` is the driver -> TARGET half — optional and present only when this run records per-case
  // valuation levers AND the driver's new metric value could be pushed through them (successfully OR with
  // an honest ok:false refusal the card must render, never silently drop).
  | { kind: 'scenario'; asked: string; scenario: ComputedScenario; reprice?: RepricedValuation | null }
  | { kind: 'unsupported'; asked: string; recorded: { variable: string; label?: string | null; unit?: string | null }[]; reason?: string }

// `thinking` (assistant turns) is the model's extended-thinking reasoning, streamed live while the answer
// is being worked out and kept afterwards so the thought process stays readable. `computed` (assistant
// turns) holds the engine-computed what-if card(s) for this turn — an ARRAY because a joint ask ("aluminium
// AND USD/NOK") returns one card per variable, computed separately.
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  // One completed question/answer pair shares this id. Besides exact Retry, the server uses it only as a
  // pointer into the authenticated receipt store; client-echoed computed figures are never trusted.
  turnId?: string
  thinking?: string
  computed?: ChatComputed[]
  memory?: AskMemoryMeta | NewsWireMemory
}

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
  memoryMode?: AskMemoryMode
  conversationId?: string // attaches this turn to a saved conversation (server mints one when absent)
  // Client-minted idempotency key for one question. A retry reuses it so a response whose terminal frame
  // was lost can be replayed from History instead of charging for and saving a duplicate model turn.
  turnId?: string
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
export interface CompletedChatTurn {
  conversationId: string
  turnId: string
  question: string
  answer: string
  thinking?: string
  computed?: ChatComputed[]
  memory?: AskMemoryMeta | NewsWireMemory
  sourcePath?: string
  costUsd?: number
}
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

// ---- chat with the saved Screener news wire ----
export type NewsChatWindow = '24h' | '7d' | 'history'
export interface NewsChatReceipt {
  window: NewsChatWindow
  label: string
  itemsSearched: number
  itemsMatched: number
  sourceCount: number
  evidenceCount: number
  historicalEvidenceCount: number
  coverageStart: string | null
  coverageEnd: string | null
  queryTerms: string[]
  queryTermHits: Record<string, number>
  retrievalTermHits: Record<string, number>
  expandedTerms: Record<string, string[]>
  retrievalMode: 'hybrid' | 'hybrid_neural'
  retrievalChannels: string[]
  semantic?: { status: 'active' | 'not_configured' | 'empty_index' | 'provider_error'; model: string | null; indexedItems: number; hitsUsed: number; note?: string } | null
  rerank?: { status: 'active' | 'not_configured' | 'provider_error'; model: string | null; note?: string } | null
  relationships?: { seed: string; related: string; kind: string; relation: string; mentions: number; evidenceEventIds: string[] }[]
  tradeCandidates?: { ticker: string; company: string; score: number; readiness: 'check_now' | 'needs_data' | 'watch_only'; direction: 'long' | 'short' | 'mixed' | 'unknown'; breakdown: { evidence: number; impact: number; specificity: number; timing: number; expression: number; corroboration: number; learning_adjustment: number }; missingChecks: string[]; evidenceRefs: string[] }[]
  dataStores: string[]
  coverageWarnings: string[]
  sourceHealth: { total: number; healthy: number; quiet: number; failing: number; idle: number } | null
}
export interface NewsChatEvidence { ref: string; item: FeedItem; historical: boolean; whyMatched?: string[] }
export interface NewsChatCompletedTurn {
  question: string
  answer: string
  receipt: NewsChatReceipt
  evidence: NewsChatEvidence[]
}
export interface NewsWireMemory {
  kind: 'news-wire'
  window: NewsChatWindow
  receipt: NewsChatReceipt
  evidence: NewsChatEvidence[]
}
export interface NewsChatRequest {
  window: NewsChatWindow
  model?: string
  conversationId?: string
  turnId?: string
  title?: string
  messages: ChatMessage[]
}

// ---- calls tracker (the engine's call ledger + since-the-call outcomes) ----
export interface CallTimelineEntry {
  window: string
  due_date: string | null
  status: 'done' | 'due' | 'overdue' | 'upcoming'
  review_date?: string
  review_price?: number | null
  absolute_return_pct?: number | null
  benchmark_relative_return_pct?: number | null
  thesis_status?: string | null
  decision_quality?: string | null
  thesis_delta_verdict?: string | null
  memo_delta_summary?: string | null
  forecasts_confirmed?: number
  forecasts_falsified?: number
  review_file?: string
  review_count?: number
  memo_delta_file?: string // §8 memo delta — the "what changed since the memo" markdown, when the review filed one
  stage_one_comment?: string // paste-ready 100–200-word Stage-One sheet note from the same block
  action_now?: { label: CallActionNow; reason: string; recorded: true } | null
  confidence_update?: { before: number | null; after: number | null; change_reason: string | null } | null
  next_check?: { date: string | null; label: string | null; trigger: string | null } | null
  learning?: {
    why_right_or_wrong: string | null
    error_source: string | null
    rule_for_future: string | null
    future_research_check: string | null
  } | null
  lessons?: string[]
  error_taxonomy?: string[]
  watch_items?: string[]
}
export type CallActionNow = 'Hold' | 'Add' | 'Exit' | 'Stay away' | 'Keep watching'
// AS_forecast_overdue / AW_kill_criteria_overdue (scripts/eval.py), surfaced live — see outputs.ts.
export interface OverdueItem {
  due_date: string
  description: string
}
export interface CallSummary {
  ticker: string
  company: string | null
  decision_date: string | null
  decision: string | null // post-mortem-capped when a terminal pre-mortem verdict applies (fix F28b)
  basket: string | null
  decision_is_post_mortem_capped: boolean // true when a terminal pre-mortem verdict downgraded the original call
  confidence: number | null // prefers post-red-team confidence when present (fix F28)
  confidence_is_post_review: boolean
  frozen_call?: {
    locked: true
    decision: string | null
    basket: string | null
    confidence: number | null
    decision_date: string | null
    entry_price: number | null
    currency: string | null
    source_path: string
  }
  integrity_status: 'verified' | 'provisional' | 'unaudited' // DECISION_LEDGER.md §18a truth-integrity status
  integrity_verdict: string | null // the verify-evidence report's own verdict string, when one exists
  integrity_banner: boolean // true when the finish-gate stamped final_thesis.md PROVISIONAL
  time_horizon: string | null
  entry_price: number | null
  currency: string | null
  exchange?: string | null
  expected_return_pct: number | null
  implied_target: number | null
  downside_risk_pct: number | null
  kill_criteria_count: number
  forecasts: { open: number; confirmed: number; falsified: number; expired: number; other: number }
  run_root: string
  final_thesis_path: string
  latest_thesis_status: string | null
  latest_review_summary?: string | null
  latest_review_verdict?: string | null
  latest_review_date?: string | null
  next_checkpoint: { window: string; due_date: string | null; status: string } | null
  review_count: number
  timeline: CallTimelineEntry[]
  needs_attention: { forecasts_overdue: OverdueItem[]; kill_criteria_overdue: OverdueItem[] }
}
export interface CallsScorecardHorizon {
  window: '30d' | '90d' | '180d' | '365d'
  reviewed: number
  worked: number
  failed: number
  mixed: number
  unscored: number
  average_return_pct: number | null
  average_vs_benchmark_pct: number | null
}
export interface CallsScorecard {
  assessed_calls: number
  excluded_provisional: number
  worked: number
  failed: number
  mixed: number
  unscored: number
  average_return_pct: number | null
  average_vs_benchmark_pct: number | null
  horizons: CallsScorecardHorizon[]
  confidence_check: {
    status: 'too_little_data' | 'aligned' | 'not_aligned'
    scored_calls: number
    detail: string
    bands: { label: string; calls: number; worked_pct: number | null }[]
  }
}
// ranked across ALL calls, oldest due_date first — the flattened, actionable form of every call's
// needs_attention block, for the top-of-dashboard "needs attention now" panel.
export interface NeedsAttentionRow extends OverdueItem {
  type: 'forecast' | 'kill_criteria'
  ticker: string
  company: string | null
  run_root: string
  final_thesis_path: string
}
export type CallUpdateTone = 'better' | 'worse' | 'same' | 'info'
export interface CallUpdate {
  id: string
  ticker: string
  company: string | null
  at: string | null
  kind: 'call' | 'review'
  headline: string
  detail: string | null
  tone: CallUpdateTone
  run_root: string
  source_path: string | null
}
export interface CallsResult {
  calls: CallSummary[]
  scorecard?: CallsScorecard
  dashboard: string | null
  needs_attention: NeedsAttentionRow[]
  updates: CallUpdate[]
  authority_commit?: string
}

export interface PaperPortfolioPosition {
  contract_id: number
  symbol: string
  local_symbol: string | null
  security_type: string | null
  currency: string | null
  exchange: string | null
  quantity: number
  average_cost: number | null
  market_price: number | null
  market_value: number | null
  unrealized_pnl: number | null
  realized_pnl: number | null
  portfolio_weight_pct: number | null
}
export interface PaperPortfolioTargetPosition {
  ticker: string
  decision: string
  model_weight_pct: number
  side: 'long' | 'short'
  conviction: 'low' | 'high'
  confidence: number
  currency: string
  exchange: string | null
  call_id: string
  decision_date: string
}
export interface PaperCallBlock {
  ticker: string
  decision: string
  decision_date: string | null
  reason: 'provisional' | 'unverified' | 'missing_frozen_call' | 'invalid_decision_date' | 'future_call'
    | 'superseded' | 'missing_confidence' | 'missing_price' | 'missing_currency' | 'review_exit'
    | 'review_action_missing' | 'insufficient_cash' | 'ambiguous_listing'
  detail: string
}
export interface HistoricalPaperTrade {
  trade_id: string
  ticker: string
  decision: string
  side: 'long' | 'short'
  conviction: 'low' | 'high'
  confidence: number
  target_weight_pct: number
  decision_date: string
  entry_price: number
  currency: string
  status: 'open' | 'closed'
  exit_date: string | null
  exit_price: number | null
  price_as_of: string
  current_price: number
  position_return_pct: number
  allocated_units: number
  current_value_units: number
  mark_source: 'decision' | 'review' | 'later_call'
  detail: string
}
export interface HistoricalCallState {
  call_id: string
  ticker: string
  decision: string
  decision_date: string | null
  confidence: number | null
  side: 'long' | 'short' | null
  conviction: 'low' | 'high' | null
  allocation_pct: number | null
  state: 'open' | 'closed' | 'no_position' | 'blocked'
  block_reason: PaperCallBlock['reason'] | null
  entry_price: number | null
  currency: string | null
  price_as_of: string | null
  current_price: number | null
  price_move_pct: number | null
  position_return_pct: number | null
  current_value_units: number | null
  mark_source: 'decision' | 'review' | 'later_call' | null
  current_action: string | null
  current_action_reason: string | null
  next_check_date: string | null
  next_check_label: string | null
  detail: string
}
export interface PaperOpenOrder {
  order_id: number
  contract_id: number
  symbol: string
  action: string | null
  total_quantity: number | null
  order_type: string | null
  status: string
  filled: number
  remaining: number
  average_fill_price: number | null
  nostra_managed: boolean
  can_cancel: boolean
}
export interface PaperPortfolioDifference {
  kind: 'missing_position' | 'unexpected_position' | 'weight_mismatch'
  ticker: string
  target_weight_pct: number | null
  actual_weight_pct: number | null
  detail: string
}
export interface IbkrPaperPortfolioRead {
  schema_version: 'ibkr-paper-portfolio/v2'
  broker: 'IBKR'
  mode: 'paper'
  status: 'connected' | 'disconnected' | 'disabled' | 'error'
  paper_only: true
  as_of: string
  connection: { host: 'localhost'; port: 7497; detail: string }
  account: {
    currency: string | null
    net_liquidation: number | null
    total_cash: number | null
    gross_position_value: number | null
    available_funds: number | null
    buying_power: number | null
    unrealized_pnl: number | null
    realized_pnl: number | null
    positions: PaperPortfolioPosition[]
  } | null
  open_orders: PaperOpenOrder[]
  history: {
    schema_version: 'nostra-paper-history/v2'
    available: boolean
    unit: 'normalized_nav'
    starting_value: 100
    present_value: number
    cash_value: number
    invested_value: number
    total_return_pct: number
    calls_examined: number
    non_trade_calls: number
    trade_calls: number
    open_trades: number
    closed_trades: number
    rules: {
      low_conviction_weight_pct: 5
      high_conviction_weight_pct: 10
      high_conviction_min_confidence: 75
      eligible_baskets: ['Selected', 'Short']
      provisional_calls_trade: false
    }
    call_states: HistoricalCallState[]
    trades: HistoricalPaperTrade[]
    blocked_calls: PaperCallBlock[]
    detail: string
  }
  target: {
    valid: boolean
    source_path: 'published Calls history' | null
    generated_at: string
    gross_pct: number | null
    cash_pct: number | null
    positions: PaperPortfolioTargetPosition[]
    blocked_calls: PaperCallBlock[]
    detail: string
  }
  reconciliation: {
    status: 'aligned' | 'differences' | 'unavailable' | 'blocked'
    differences: PaperPortfolioDifference[]
    detail: string
  }
  execution: {
    status: 'locked' | 'ready'
    can_execute: boolean
    automatic: {
      enabled: boolean
      last_attempt: null | {
        schema_version: 'ibkr-paper-auto-sync/v1'
        at: string
        outcome: 'orders_sent' | 'partial' | 'aligned' | 'no_order' | 'error'
        trigger: 'publication'
        run_id: string | null
        run_kind: string | null
        ticker: string | null
        publication_revision?: string | null
        order_count: number
        skipped_count: number
        detail: string
      }
    }
    low_conviction_weight_pct: 5
    high_conviction_weight_pct: 10
    high_conviction_min_confidence: 75
    detail: string
  }
}
export interface PaperExecutionResult {
  ok: true
  paper_only: true
  action: 'sync' | 'cancel' | 'close'
  detail: string
  orders: { order_id: number; ticker: string; action: 'BUY' | 'SELL'; quantity: number; status: string; detail: string }[]
  skipped: { ticker: string; reason: string }[]
}

// ---- activity / audit log ----
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'doc-intake' | 'signal' | 'sweep' | 'screener-agent' | 'handoff' | 'conviction' | 'parity'
/** Server-internal adjudication kinds are visible in Activity/SSE but have no user launch surface. */
export type LaunchableRunKind = Exclude<RunKind, 'conviction' | 'parity'>
export interface Whoami { user: string; userVia: 'cf-access' | 'local'; canDispatch?: boolean; canScanPipeline?: boolean; canBuildConnector?: boolean; canInspectProviderParity?: boolean; canLaunchProviderParity?: boolean; emailEnabled?: boolean }

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
  /** Backend execution-scoped grouping identity. Optional only for rolling deploys and legacy rows. */
  executionEpoch?: string
  /** Older/current chain alias; used when executionEpoch is absent. */
  chainId?: string
  runRoot?: string // repo-relative run folder (from the launched event) — drives the row's "open reports" menu
  module?: string
  agent?: string
  model?: string
  provider?: import('./provider').RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
  profileKey?: string
  reasoningLevel?: string
  cliVersion?: string
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
  provider?: import('./provider').RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
  reason?: string
  resetsAt?: number // unix seconds
  supervisorIdentity?: string
  autoResumeDue?: boolean
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
  doneOrbKeys: string[] // exact valid specialists the v2 resume will keep; also the launch scope CAS
  synthesisNeedsRefresh?: boolean // old 99 no longer represents the current roster / specialist dependency state
  // A completed exact-resume module whose analysis finished locally but whose final Git publication failed.
  // The heading stays actionable, but its retry is publication-only: it must never launch another paid run.
  publicationPending?: { targetRunRoot: string; fingerprint: string }
}

export interface ThesisPlan {
  moduleResumeVersion?: 2 // absent on an older server: smart heading launch must fail closed during deploy skew
  continuationReceipt?: ContinuationPlanReceipt
  /** Present only for a module-specific plan. The server, not the browser, selects and validates these saved
   * inputs; a newer UI must require this positive receipt before launching an exact module resume. */
  exactModuleScope?: { module: string; savedInputs: string[] }
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
  dataPool: { files: number; newestDate: string | null; newestMs?: number }
  preflight: LaunchPreflight // cost/time of ONLY the remaining work
  fullPreflight: LaunchPreflight // cost/time of the naive full re-run — the savings, made visible
  canCarry: boolean
}

export interface ContinuationPlanReceipt {
  version: 1
  action: 'continue' | 'complete'
  swarm: string
  subject: string
  sourceRunRoots: string[]
  targetRunRoot: string
  provider: {
    id: 'claude' | 'codex'
    model: string | null
    reasoningLevel: string | null
    profileKey: string | null
  }
  reusableOrbKeys: string[]
  payableOrbKeys: string[]
  dataPool: { files: number; newestMs: number; sha256: string }
  sourceArtifactsSha256: string
  fingerprint: string
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

export type PendingAdmissionStatus = 'waiting_for_update' | 'admitting' | 'needs_attention'
export interface PendingAdmission {
  requestId: string
  user: string
  userVia: 'cf-access' | 'local'
  ticker: string
  action: 'continue' | 'full'
  sourceRunRoot?: string
  provider: import('./provider').RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
  status: PendingAdmissionStatus
  createdAt: string
  updatedAt: string
  attention?: string
  planDifference?: {
    beforeFingerprint: string
    afterFingerprint: string
    addedPayableOrbKeys: string[]
    removedPayableOrbKeys: string[]
  }
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


// ---- watchlist (server: ui/server/src/watchlist.ts) ----

export type WatchTriggerKind = 'price_level' | 'pct_drop' | 'valuation_mos' | 'event_date'
export type WatchTriggerDirection = 'at_or_below' | 'at_or_above'
/** Three-valued on purpose: a refusal must never render as "not met". */
export type WatchEvalState = 'condition_met' | 'not_met' | 'not_evaluable'
export type WatchRowState = 'condition_met' | 'due' | 'armed' | 'not_evaluable' | 'watching'

export type WatchTrigger =
  | { kind: 'price_level'; trigger_id: string; direction: WatchTriggerDirection; level: number; currency: string; note?: string }
  | { kind: 'pct_drop'; trigger_id: string; drop_pct: number; reference: { value: number; currency: string; as_of: string | null; source: string }; note?: string }
  | { kind: 'valuation_mos'; trigger_id: string; run_root: string | null; scenario_label: string; anchor_value: number; anchor_currency: string; anchor_as_of: string | null; required_mos_pct: number; direction: WatchTriggerDirection; note?: string }
  | { kind: 'event_date'; trigger_id: string; due_date: string; label: string; acknowledged_at?: string | null; note?: string }

export interface WatchTriggerEval {
  trigger_id: string
  kind: WatchTriggerKind
  mode: 'auto' | 'reminder'
  state: WatchEvalState
  /** The arithmetic in words, so "not met" is checkable rather than trusted. */
  detail: string
  /** Signed move still needed, as a percent of the current price. Comparable across rows; the price is not. */
  gap_pct: number | null
  /** Days until a DATED trigger comes due (0 = today, negative = passed). Null for price-family triggers,
   *  as gap_pct is null for dated ones — the two units are never merged. */
  days_to?: number | null
  reason: QuoteAbsentReason | 'no_reference' | 'currency_mismatch_trigger' | 'no_anchor' | null
  /** The price this trigger fires at, computed ONCE on the server. Optional: an older engine omits it. */
  target?: { value: number; currency: string; basis: string } | null
  due?: boolean
}

export interface WatchAttachment { attachment_id: string; filename: string; bytes: number; added_at: string; added_by: string }

export interface WatchEngineRow {
  run_root: string
  decision: string | null
  decision_date: string | null
  /** The engine's own words. Displayed verbatim, never parsed into a condition. */
  size_in_trigger: string | null
  next_review: string | null
  /** The engine's prose as written — often explains WHY that date. */
  next_review_text?: string | null
  entry_price: number | null
  final_thesis_path: string | null
  fingerprint: string
}

export interface WatchRow {
  listing_key: string
  ticker: string
  company_name: string | null
  currency: string | null
  exchange: string | null
  origin: 'engine' | 'manual' | 'both'
  entry_id: string | null
  why: string
  conviction: 'high' | 'medium' | 'low' | null
  review_date: string | null
  tags: string[]
  triggers: WatchTrigger[]
  attachments: WatchAttachment[]
  assignee: TaskAssignee | null
  task_id: string | null
  engine: WatchEngineRow | null
  /** Came back because the engine changed what it says about a name you had archived. */
  resurfaced: boolean
  archive: { at: string; by: string; reason: string; muted_fingerprint: string | null; mute_scope: 'assertion' | 'listing' } | null
  quote: LiveQuote | null
  quote_reason: QuoteAbsentReason | null
  evals: WatchTriggerEval[]
  state: WatchRowState
  /** The smallest move any auto trigger still needs. Null when nothing is checkable. */
  nearest_gap_pct: number | null
  /** The closest trigger's distance carrying its own unit. Optional: an older engine omits it. */
  nearest?: { unit: 'pct' | 'days'; value: number } | null
  run_root: string | null
  final_thesis_path: string | null
  /** When you added it (null if you have never touched this engine row), and when it last changed. */
  added_at: string | null
  updated_at: string | null
  /** The engine's own call date, for a row you never touched. */
  engine_since: string | null
}

export interface WatchlistRead {
  rows: WatchRow[]
  archived: WatchRow[]
  engine_source: { file: string | null; generated_at: string | null }
  unreadable: string[]
  quotes_enabled: boolean
  as_of: string
}

export interface WatchResolveCandidate {
  symbol: string
  name: string
  exchange: string | null
  /** Already normalised to the MAJOR unit by the server — a pence quote arrives as pounds. */
  currency: string | null
  price: number | null
  as_of: string | null
  as_of_is_close: boolean
}
export interface WatchResolveRead {
  query: string
  candidates: WatchResolveCandidate[]
  reason: 'no_match' | 'directory_unavailable' | 'feed_unavailable' | 'quotes_disabled' | null
}

/** Omit over a union must DISTRIBUTE, or the four trigger shapes collapse into their common keys. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export interface WatchRowInput {
  ticker: string
  company_name?: string | null
  currency?: string | null
  exchange?: string | null
  why?: string
  conviction?: 'high' | 'medium' | 'low' | null
  review_date?: string | null
  tags?: string[]
  /** `trigger_id` is carried when editing so the server can keep a trigger's identity. */
  triggers?: (DistributiveOmit<WatchTrigger, 'trigger_id'> & { trigger_id?: string })[]
  assignee?: TaskAssignee | null
}

// ---- shared research Tasks board ----
export type TaskAssignee = 'AB' | 'NV' | 'CK'
export type TaskStage = 'idea_generation' | 'ticker_identified' | 'deep_dive' | 'final_decision'
export type TaskDecision = 'deploy' | 'reject' | 'watch'
export type TaskScope = 'ticker' | 'company_event' | 'world_event'

export interface TaskPerson { id: TaskAssignee; name: string }

export interface TaskCard {
  schema_version: 'task-card/v1'
  task_id: string
  scope: TaskScope
  ticker: string | null
  ticker_label: string | null
  subject: string
  title: string
  stage: TaskStage
  decision: TaskDecision | null
  assignee: TaskAssignee
  attachments: WatchAttachment[]
  watchlist_entry_id: string | null
  watchlist_created: boolean
  history: { at: string; by: string; action: string; detail: string }[]
  created_at: string
  created_by: string
  updated_at: string
}

export interface TaskInput {
  scope: TaskScope
  ticker?: string | null
  subject: string
  title: string
  stage: TaskStage
  decision?: TaskDecision | null
  assignee: TaskAssignee
}

export interface TasksRead {
  tasks: TaskCard[]
  people: TaskPerson[]
  unreadable: string[]
  attachments_enabled: boolean
  as_of: string
}
