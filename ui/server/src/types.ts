import type { ProviderExecutionProfile, RunProvider } from './providers/types'

export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'

export interface MemoryProfile {
  version: 1
  task: string
  episodicScope: 'exact-listing'
  semanticTopics: string[]
  procedureTags: string[]
  crossCompany: boolean
  permittedSourceTiers: number[]
  permittedClassifications: Array<'public' | 'internal'>
  maxContextTokens: number
}

export interface AgentNode {
  key: string // "<module>/<NN>_<name>"
  module: string
  nn: string
  name: string // subagent_type
  slug: string
  layer: number
  failFast: boolean
  description: string
  tools: string[]
  requiredUpstream: string[] // run-root-relative paths (e.g. "business-model/08_competitive-map.md")
  soloRunnable: boolean
  isSynthesis: boolean
  /** Closed, self-declared query authority for the production memory compiler. */
  memoryProfile?: MemoryProfile
}

export interface ResearchMemoryIdentity {
  legalName: string
  venue: string
  currency: string
  ticker: string
  identifiers: string[]
}

export interface ResearchMemoryRuntimeBinding {
  mode: 'off' | 'shadow' | 'enforced'
  logicalRunId: string
  status: 'off' | 'preparing' | 'verified' | 'unavailable' | 'blocked' | 'finalized'
  receiptId?: string
  receiptSha256?: string
  receiptPath?: string
  projectionPath?: string
  authorizationId?: string
  authorizationSha256?: string
  authorizationPath?: string
  expectedTaskCount: number
  finalizeOnClose: boolean
  startedAt: string
  error?: string
}

export interface ModuleNode {
  name: string
  order: number
  dependsOn: string[]
  /** Optional cross-module reads. They affect staged input provenance for a module-only run, but never block
   * scheduling or create downstream invalidation when absent. Self-declared as `reads_from` on the 99. */
  readsFrom?: string[]
  /** The module command honors the immutable-root/current-input contract for smart partial heading runs. */
  exactResume?: boolean
  layers: Record<string, AgentNode[]>
  agentCount: number
  depsComplete?: boolean // ticker-specific (graphForTicker only): are this module's dependsOn synthesis outputs on disk?
  missingDeps?: string[] // the dependsOn modules whose synthesis is not yet present
  dataReadiness?: DataReadinessDecl // optional, self-declared in the module's 00-triage frontmatter
  swarmId?: string // omitted for research (back-compat: the default /api/swarm payload is byte-stable)
  moduleDir?: string // repo-relative module folder (nested for swarms); omitted for research
}

export interface SwarmGraph {
  modules: ModuleNode[]
  masterSynthesizer: { name: string; description: string; memoryProfile?: MemoryProfile }
  totals: { modules: number; agents: number; specialists: number; synthesis: number }
  // present ONLY for non-research swarms (research stays byte-identical for existing clients)
  swarm?: { id: string; label: string; color: string; unit: string; layout: string; order: number }
}

// ---- swarms (CLAUDE.md §26 "Swarms": self-describing, zero-touch) ----
// Parsed from .claude/agents/<swarm>/SWARM.md frontmatter. The research swarm is grandfathered
// as a synthetic manifest (no SWARM.md on disk) so every code path can be swarm-agnostic.
export interface SwarmRoutingContract {
  verdictField: string // the labelled line to grep in synthesis outputs (e.g. "Routing")
  terminal: string[] // routing values that STOP the pipeline (valid outcomes, not errors)
  continue: string[] // routing values that let the next module run
}

// A swarm's OPTIONAL self-declared news-wire capability (`wire:` in SWARM.md front-matter). Presence
// turns the shared wire surface on for that swarm (CLAUDE.md §26: the manifest declares, the engine
// interprets generically — no swarm id is ever hardcoded). The screener's wire is the grandfathered
// implicit default of its 'flow' layout; research declares nothing. Absent on /api/swarms => the
// client renders that swarm exactly as before (deploy-skew fail-closed).
export interface SwarmWireDecl {
  eventScope?: string // pre-filter the swarm's feed/search/facets/themes to this scope (news/scope.ts ScopeId)
  groupBy?: string // 'subject' => the rail groups + filters by the swarm's canonical subjects
  subjectField?: string // the FeedItem field carrying the canonical subject id (e.g. 'commodity' -> 'GOLD')
  pulse?: string // repo-relative pulse-source config (frameworks/...); presence enables /api/swarm/pulse
  defaultView?: string // rail landing tab ('themes' | 'ranked' | 'latest')
}

export interface SwarmManifest {
  id: string
  label: string
  color: string
  unit: string // 'ticker' | 'signal' | future units
  order: number
  layout: string // 'constellation' | 'flow' | future layouts (UI hint only)
  commandNs: string // slash-command namespace, e.g. 'screener' -> /screener:*
  dir: string // absolute path to the swarm's agents root
  runsRoot: string // repo-relative folder that holds run folders (e.g. 'screener/runs' / 'analyses')
  runRootTemplate: string // e.g. 'screener/runs/{SIG_ID}' / 'analyses/{TICKER}_{DATE}'
  placeholder: string // the subject token inside the template (e.g. 'SIG_ID' / 'TICKER')
  // Run-root-relative JSON artifacts whose terminal author owns the published decision. The runtime
  // stamps provenance into every declared file, so a newly discovered swarm needs no engine wiring.
  decisionArtifacts?: string[]
  ledgerRoot?: string
  boardIndex?: string
  inboxRoot?: string
  schemasRoot?: string
  /** Optional slash-command basename for one tracked outcome review (for example `review`). */
  reviewCommand?: string
  /** Trusted repo-relative deterministic calibration script run by the supervisor after review publication. */
  calibrator?: string
  /** Exact research-data directory owned by that calibrator's generated summaries. */
  calibrationRoot?: string
  // repo-relative markdown whose `## <NAME>` headings enumerate this swarm's subjects (so the cockpit
  // subject picker can list a not-yet-run subject). Generic: the engine reads it from the manifest, so
  // no subject/swarm name is hardcoded (CLAUDE.md §26). Absent for research/screener.
  subjectsSource?: string
  routing?: SwarmRoutingContract // absent for research (it uses triage Sufficiency semantics)
  wire?: SwarmWireDecl // absent unless the swarm declares a news-wire capability (see SwarmWireDecl)
  /** Optional server-side decision-memory shelf. A swarm opts in from its manifest; absent means none. */
  decisionMemory?: string
}

// ---- data-status ----

export type FileType =
  | 'annual_filing'
  | 'quarterly_filing'
  | 'transcript'
  | 'sell_side_earnings_note' // a broker "Earnings Call Insight/Summary" — a verdict-bearing transcript PROXY, NOT a verbatim transcript
  | 'investor_deck'
  | 'consensus_estimates'
  | 'multiples_export'
  | 'peer_comps'
  | 'ownership_insider'
  | 'proxy_comp'
  | 'financials'
  | 'guidance'
  // a Capital IQ Suppliers / Customers export — the only pool document that NAMES the company's
  // counterparties. Readiness-NEUTRAL by design (no rule keys on it): it enriches the value-chain and
  // customer reads and feeds the Ideas board's chain lane, but it can never fill a filing slot.
  | 'business_relationships'
  | 'user_note'
  // externally ingested research under data/<TICKER>/external/ (frameworks/EXTERNAL_DATA.md):
  // alt-data panels, expert calls, channel checks, broker notes, paid-API pulls. Deliberately ONE
  // readiness-NEUTRAL type — no readiness rule keys on it, so an expert-call "transcript" can never
  // fill the earnings transcript slot; the granular kind lives in `external.sourceType`.
  | 'external_data'
  | 'other'

// A readiness rule token. Either a top-level FileType, OR an `external:<sourceType>` token that matches a
// document under data/<TICKER>/external/ carrying that granular source_type (frameworks/EXTERNAL_DATA.md) —
// external files are all typed the readiness-NEUTRAL 'external_data', so a module whose evidence lives in
// external/ (e.g. competitive-intel's `external:peer_transcript` competitor calls) declares the external
// token to see them, and a subject-side 'transcript' can no longer masquerade as that evidence.
export type ReadinessToken = FileType | `external:${string}`

// A module's OPTIONAL self-declared data-readiness rule (in its 00-triage frontmatter as
// `data_readiness:`). Lets a NEW module get a tailored readiness verdict with zero central edits —
// the engine interprets this generically (data-status.ts evalDecl). Absent => generic fallback.
export interface DataReadinessDecl {
  required?: ReadinessToken[] // any missing => Insufficient
  sufficient?: ReadinessToken[] // all present (and all required) => Sufficient; else Partial
  caps?: Partial<Record<ReadinessToken, string>> // Partial-state note shown when that token is missing
}

export interface WorkbookSheet {
  name: string
  rows: number
  cols: number
  cells: number // populated (non-empty) cells
}

export interface ClassifiedFile {
  filename: string
  // pool-relative POSIX path when the document sits in a SUBFOLDER of the company folder (e.g.
  // "Filings 4/annual.pdf"); absent for a top-level file. `filename` stays the basename so
  // classification and every name-regex behave identically whether nested or not. Mirrors
  // extract_pool.py's manifest, which keeps `file` as the basename and adds `path` when nested so
  // duplicate basenames across subfolders stay distinguishable — the cockpit now lists the SAME
  // recursive pool the research orbs read (extract_pool.py walks the whole tree).
  path?: string
  ext: string
  sizeBytes: number
  mtime: string
  type: FileType
  periodHint: string | null
  ageMonths: number | null
  confidence: 'high' | 'medium' | 'low'
  basis: 'filename' | 'content' | 'extension'
  // present for multi-tab workbooks (.xls/.xlsx/.xlsm): one entry per tab, so the
  // cockpit shows every sheet instead of one opaque file. Read via extract_pool.py.
  sheets?: WorkbookSheet[]
  // present for files under data/<TICKER>/external/ — provenance from the document's
  // `.source.json` sidecar (or path-derived: provider = folder name). frameworks/EXTERNAL_DATA.md.
  external?: {
    provider?: string
    sourceType?: string // alt_data_panel | expert_call | channel_check | broker_research | ...
    tier?: number // CLAUDE.md §4 tier the provenance maps to
    asOf?: string
    license?: string
  }
  // present for a routed wire-event note (data/<T>/screener_event_<EVT>.md, research-bridge.ts): the
  // news HEADLINE to show instead of the opaque machine filename, plus a hover line (source · when).
  displayName?: string
  note?: string
}

export interface ModuleReadiness {
  status: Sufficiency
  reasons: string[]
  caps: string[]
}

// A sub-category a vendor export bundles in (estimates / multiples / peers / financials), so the
// UI can say "covers estimates · multiples" instead of listing each as its own absent row.
export interface CoverageSub {
  key: string
  label: string
  present: boolean
}

// One SOURCE-DOCUMENT group — what a human actually uploads (annual report, interim, transcript,
// vendor export, ...), not an internal FileType. Presence is detected tab/content-aware: a group can
// be satisfied by a file of a matching type OR a workbook TAB whose name matches (so a vendor
// workbook's "Multiples" tab counts even though the file classified as 'financials'). Drives both
// the populated coverage panel and the empty-state upload guide.
export interface CoverageGroup {
  key: string
  label: string
  tier: 'critical' | 'core' | 'recommended' | 'optional' // how much a gap costs (drives ordering + the chip)
  helps: string // precise: how much / how recent to upload + the consequence if absent
  present: boolean
  via: 'file' | 'tab' | null // how it was satisfied (null when absent)
  filename: string | null // the file that satisfies it (named, so "which document" is answered)
  sheet: string | null // the tab that satisfies it, when via === 'tab'
  ageMonths: number | null
  stale: boolean // present but older than this group's freshness threshold
  covers?: CoverageSub[] // sub-facets a group bundles (e.g. governance: board · shareholding · insider)
}

export interface DataStatus {
  ticker: string
  hasAnyData: boolean
  fileCount: number
  files: ClassifiedFile[]
  recentByType: Record<string, { filename: string; ageMonths: number | null } | undefined>
  modules: Record<string, ModuleReadiness>
  coverage: CoverageGroup[]
  overallReady: boolean
  dataDir: string
  ts: number
}

// One canonical, reconnectable view of a company's deterministic data scan. The scan happens before
// any provider is chosen or paid work starts, so this contract is shared by Claude and Codex.
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
  // usable as a ticker symbol? A Drive folder named "TATA MOTORS" is listed but can't be loaded/run
  // (no spaces allowed) — the cockpit surfaces this instead of silently failing.
  valid: boolean
  invalidReason?: string
  suggestedTicker?: string
  // live Google-Drive-sync signal: files are materializing from the cloud right now
  syncing: boolean
  lastChangeAt: number | null
  latestRun: {
    runRoot: string
    decision: string | null
    decisionDate: string | null
    confidence: number | null
  } | null
  // how many analyses/ run folders this ticker has — drives the "N runs" affordance + run-history expander
  runCount: number
  // a run folder NEWER than latestRun has no decision record yet — it would otherwise shadow the standing
  // run, so the cockpit surfaces the standing (complete) run and flags that a partial re-run has landed since
  hasNewerPartial: boolean
}

// Per-subject run summary for a NON-research swarm's subject picker (e.g. commodity GOLD/SUGAR). The
// research swarm uses the richer TickerSummary (multiple dated runs, file counts, sync/validity); a
// constellation swarm has ONE run folder per subject (its run root IS its identity), so this is its lean
// twin: has-it-run, the resolved routing verdict, and when. Verdict is resolved generically via the
// swarm's self-declared routing verdict field (SWARM.md), so no swarm/subject name is hardcoded (§26).
export interface SwarmSubjectSummary {
  subject: string
  // a run folder exists on disk (the subject has been run at least once)
  hasRun: boolean
  // the subject's run root, repo-relative (e.g. "commodity/runs/GOLD"), or null when never run
  runRoot: string | null
  // the routing verdict from decision_record.json (e.g. "Hold"), resolved via the swarm's verdict field;
  // null when there is no run, no decision record yet, or the record carries no verdict.
  // EFFECTIVE, not original: when the run's own red-team (pre-mortem) capped the call, the cap is what
  // shows here (fix F28b, extended to every swarm) — the original stays in the record for audit.
  verdict: string | null
  decisionDate: string | null
  // effective confidence — the post-red-team score when the record carries one (fix F28), else the original
  confidence: number | null
  // true when the displayed verdict is the pre-mortem's cap rather than the synthesizer's own call
  verdictIsPostMortemCapped: boolean
  // true when the displayed confidence is the post-red-team score rather than the synthesizer's own
  confidenceIsPostReview: boolean
  // mtime of the decision record (or the run folder as a fallback) — drives the "N ago" readout
  lastChangeAt: number | null
}

// ---- runs / events ----

// 'review' files an append-only outcome review (/research:review-decisions); 'track' rebuilds the
// calls-tracker dashboard (/research:track). Both are dep-free, lightweight, cross-/single-ticker.
// Screener swarm kinds: 'signal' runs one signal through the gauntlet (subject = SIG id), 'sweep'
// fills the inbox (no subject), 'screener-agent' re-runs one orb in a signal run, 'handoff' seeds
// a ticker's data pool from a locked thesis (idempotent; never launches the research run itself).
// 'doc-intake' is an advisory research kind (like 'review'/'track'): it reads the docs that landed
// since the last run and writes a SCOPED rerun plan (frameworks/INTAKE.md) — it launches no run.
export const RUN_KINDS = [
  'full', 'module', 'agent', 'rerun', 'review', 'track', 'doc-intake',
  'signal', 'sweep', 'screener-agent', 'handoff', 'conviction', 'parity',
] as const
export type RunKind = typeof RUN_KINDS[number]
// 'incomplete' = the process exited cleanly but a full/rerun didn't produce its final deliverables
// (thesis/decision) — almost always budget/turn truncation. Distinct from 'error' (a real failure).
// 'readiness-checking' / 'awaiting-readiness-decision' are PRE-SPAWN states: the deterministic
// data-readiness gate runs before any `claude` CLI is spawned (run.child is still null). A run
// only reaches 'running' once the gate passes clean or the user proceeds/overrides.
export const RUN_STATUSES = [
  'starting', 'readiness-checking', 'awaiting-readiness-decision',
  'running', 'done', 'error', 'cancelled', 'incomplete',
] as const
export type RunStatus = typeof RUN_STATUSES[number]
export type AgentRunStatus = 'queued' | 'running' | 'done' | 'failed'

// ---- data-readiness gate (pre-spawn; deterministic, no LLM) ----
export type ReadinessSeverity = 'blocker' | 'degrade' | 'info'

export interface ReadinessIssue {
  code: string                 // 'zero_files' | 'zero_usable_data' | 'extraction_failed' | 'missing_dependency'
                               // | 'empty_file' | 'entity_disagreement' | 'no_price_source' | 'module_insufficient' | ...
  severity: ReadinessSeverity
  message: string              // plain English
  evidence?: string            // diagnostic detail (manifest error, entity pairings, …)
  file?: string
  module?: string              // for module-scoped issues (§26)
  suggestedFix?: string
  affectedModules?: string[]
  capIfProceeded?: string      // the cap that binds if the user proceeds anyway
}

/**
 * Parser-free observation of the physical company-data pool.
 *
 * `empty` is a positive, complete directory-walk proof that no non-empty user
 * payload exists (the directory has no input files, or every input is zero
 * bytes). `unknown` means the walk could not complete (Drive hydration,
 * permissions, a concurrent rename, etc.) and must never be treated as
 * absence. Counts on an unknown observation are diagnostic partial counts only.
 */
export interface PhysicalPoolPresence {
  state: 'empty' | 'nonempty' | 'unknown'
  fileCount: number
  nonEmptyFileCount: number
  reason?: string
}

export interface ReadinessReport {
  ticker: string
  kind: RunKind
  module?: string              // single-module variant
  overall: 'clean' | 'degraded' | 'blocked'   // blocked if any blocker; degraded if any degrade; else clean
  fileCount: number
  usableCount: number
  // Optional only for rolling compatibility with already-persisted Activity
  // events. Every newly generated report carries this explicit proof object.
  physicalPool?: PhysicalPoolPresence
  /** Immutable extractor generation admitted by a successful pre-spend check. Legacy/technical reports
   * may omit it, but a non-empty full chain fails before provider spend when it is absent. */
  frozenPool?: {
    dataPath: string
    outDir: string
    generationDigest: string
    /** Exact immutable directory produced and verified by the extractor. */
    generationDir: string
    /** Only evidence tree exposed to the provider for this chain. */
    evidenceRoot: string
  }
  entities: { file: string; entity: string }[]   // surface-and-confirm (compared against the ticker by the UI)
  issues: ReadinessIssue[]
  ts: number
}

export interface ReadinessDecision {
  action: 'proceed' | 'override' | 'recheck' | 'cancel'
  user: string
  acknowledgedText?: string    // required typed acknowledgment when blockers are overridden
  ts: number
}

// ---- admission control (dependency-aware concurrency) ----
// Discriminated rejection so the client can branch the toast (info vs bad) and explain precisely.
export type AdmissionRejection =
  | { code: 'target_conflict'; httpStatus: 409; conflictRunId: string; conflictTargets: string[]; conflictModules: string[] }
  | { code: 'exclusivity'; httpStatus: 409; blockingRunId: string; blockingKind: RunKind }
  | {
      code: 'dependency_conflict'
      httpStatus: 409
      conflictRunId: string
      reason: 'module-scope-writer' | 'module-ancestry' | 'upstream-file-in-flight'
      detail: { requestedModule?: string; conflictModule?: string; relation?: 'ancestor' | 'descendant'; conflictFiles?: string[] }
    }
  | { code: 'upstream_incomplete'; httpStatus: 400; missing: string[] }
  | { code: 'capacity'; httpStatus: 429; activeCount: number; cap: number }

export type AdmissionDecision = { ok: true } | ({ ok: false } & AdmissionRejection)

export interface AgentRunState {
  key: string
  module: string
  name: string
  layer: number
  status: AgentRunStatus
  verdict?: string
  outputPath?: string
}

// ONE orchestrator tool call, as the cockpit reads it: the tool plus WHAT it acted on — the file
// read, the pattern searched, the agent dispatched. `target` is source-honest: a repo-relative path
// (never an absolute machine path), a Bash step's own description, a search's query. Absent when the
// tool's input carries nothing worth naming. See activityTarget() in stream-parser.ts.
export interface RunActivity {
  tool: string
  target?: string
  ts: number
}

export type SseEvent = (
  | { type: 'run-started'; runId: string; kind: RunKind; ticker: string; runRoot: string | null; sessionId?: string; willCommitToMain: boolean; continuation?: boolean; swarm?: string; provider: RunProvider; executionProfile: ProviderExecutionProfile; profileKey: string; model: string; reasoningLevel?: string; cliVersion?: string; ts: number }
  | { type: 'agent-started'; runId: string; module: string; agentKey: string; name: string; layer: number; ts: number }
  | { type: 'agent-done'; runId: string; agentKey: string; module: string; name: string; layer: number; outputPath: string; verdict: string | null; bytes: number; ts: number }
  | { type: 'agent-failed'; runId: string; agentKey: string; module: string; name: string; layer: number; reason: string; ts: number }
  | { type: 'layer-advanced'; runId: string; module: string; toLayer: number; doneCount: number; expectedCount: number; ts: number }
  | { type: 'module-done'; runId: string; module: string; status: 'completed' | 'aborted'; reason?: string; verdict?: string | null; ts: number }
  // swarm-routing contract event (SWARM.md `routing:`): a module's synthesis (or terminal gate)
  // declared its Routing value. `terminal` mirrors the manifest's terminal list; the cockpit's
  // switchyard lights the taken exit from this. Research runs never emit it.
  | { type: 'module-routed'; runId: string; module: string; route: string; terminal: boolean; nextModule: string | null; ts: number }
  | { type: 'cost-tick'; runId: string; costUsdSoFar?: number; rateLimit?: { ok: boolean; reason?: string }; ts: number }
  | { type: 'run-done'; runId: string; status: 'done'; costUsd?: number; durationMs?: number; numTurns?: number; finalThesisPath?: string | null; decisionRecordPath?: string | null; ts: number }
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled' | 'incomplete'; reason: string; message?: string; ts: number }
  | { type: 'readiness-checking'; runId: string; ticker: string; kind: RunKind; ts: number }
  | { type: 'readiness-report'; runId: string; report: ReadinessReport; ts: number }
  | { type: 'readiness-blocked'; runId: string; report: ReadinessReport; ts: number }
  | { type: 'readiness-resolved'; runId: string; action: ReadinessDecision['action']; ts: number }
  // TRANSIENT liveness pulse — sent every few seconds per in-flight run so quiet stretches between
  // agent events never look like a hang. Emitted via emitTransient (NOT recorded in eventLog, never
  // replayed): it is ambient state, not history. lastStdoutAt = when the engine child last produced
  // output; lastActivity = the orchestrator's most recent tool call (what the system is DOING now).
  | { type: 'run-heartbeat'; runId: string; status: RunStatus; elapsedMs: number; agentsDone: number; agentsTotal: number; provider: RunProvider; executionProfile: ProviderExecutionProfile; profileKey: string; model: string; reasoningLevel?: string; costUsd?: number; lastStdoutAt?: number; lastActivity?: RunActivity; ts: number }
  // TRANSIENT, one per orchestrator tool call — the step-by-step "what is it reading RIGHT NOW" feed.
  // The 3s heartbeat carries only the LATEST call, so a run that reads five documents between two
  // pulses shows four of them to nobody; this event is what makes the feed complete. Not recorded in
  // eventLog (a long run would bloat every new subscriber's replay) — registry keeps a bounded ring
  // and replays THAT on subscribe, so a client attaching mid-run still sees the steps it missed.
  | { type: 'run-activity'; runId: string; tool: string; target?: string; provider: RunProvider; executionProfile: ProviderExecutionProfile; ts: number }
) & {
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
  chainId?: string
  executionEpoch?: string
}

export interface CreditPreflight {
  ok: boolean
  checked: boolean
  reason?: string
  status?: string // allowed | allowed_warning | rejected | blocked
  rateLimitType?: string // five_hour | seven_day | ...
  utilization?: number // 0..1
  resetsAt?: number // unix seconds
  isUsingOverage?: boolean
  windows?: Record<string, { utilization?: number; resetsAt?: number; status?: string; isUsingOverage?: boolean }>
}

export interface LaunchPreflight {
  kind: RunKind
  ticker: string // research: the ticker; swarm runs: the subject id (SIG-… / sweep / handoff key)
  provider: RunProvider
  executionProfile: ProviderExecutionProfile
  profileKey: string
  model: string
  reasoningLevel?: string
  swarm?: string // omitted for research
  module?: string
  agent?: string
  agentCount: number
  estCostUsdRange: [number, number]
  estMinutesRange: [number, number]
  estimateEvidence: {
    source: 'comparable_completed_runs' | 'unavailable'
    provider: RunProvider
    profileKey: string
    durationSampleSize: number
    costSampleSize: number
  }
  willCommitToMain: boolean
  estCommits: number
  requiresTypedConfirm: boolean
  creditPreflight: CreditPreflight
  // Present only when /api/launch/estimate verified the immutable identity of a selected completed
  // decision. A new browser requires this versioned echo before it exposes any paid re-run action;
  // an older server may ignore the query fields, but cannot accidentally mint this receipt.
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
