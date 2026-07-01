export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'

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
}

export interface ModuleNode {
  name: string
  order: number
  dependsOn: string[]
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
  masterSynthesizer: { name: string; description: string }
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
  ledgerRoot?: string
  boardIndex?: string
  inboxRoot?: string
  schemasRoot?: string
  // repo-relative markdown whose `## <NAME>` headings enumerate this swarm's subjects (so the cockpit
  // subject picker can list a not-yet-run subject). Generic: the engine reads it from the manifest, so
  // no subject/swarm name is hardcoded (CLAUDE.md §26). Absent for research/screener.
  subjectsSource?: string
  routing?: SwarmRoutingContract // absent for research (it uses triage Sufficiency semantics)
}

// ---- data-status ----

export type FileType =
  | 'annual_filing'
  | 'quarterly_filing'
  | 'transcript'
  | 'investor_deck'
  | 'consensus_estimates'
  | 'multiples_export'
  | 'peer_comps'
  | 'ownership_insider'
  | 'proxy_comp'
  | 'financials'
  | 'guidance'
  | 'user_note'
  | 'other'

// A module's OPTIONAL self-declared data-readiness rule (in its 00-triage frontmatter as
// `data_readiness:`). Lets a NEW module get a tailored readiness verdict with zero central edits —
// the engine interprets this generically (data-status.ts evalDecl). Absent => generic fallback.
export interface DataReadinessDecl {
  required?: FileType[] // any missing => Insufficient
  sufficient?: FileType[] // all present (and all required) => Sufficient; else Partial
  caps?: Partial<Record<FileType, string>> // Partial-state note shown when that type is missing
}

export interface WorkbookSheet {
  name: string
  rows: number
  cols: number
  cells: number // populated (non-empty) cells
}

export interface ClassifiedFile {
  filename: string
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
}

// ---- runs / events ----

// 'review' files an append-only outcome review (/research:review-decisions); 'track' rebuilds the
// calls-tracker dashboard (/research:track). Both are dep-free, lightweight, cross-/single-ticker.
// Screener swarm kinds: 'signal' runs one signal through the gauntlet (subject = SIG id), 'sweep'
// fills the inbox (no subject), 'screener-agent' re-runs one orb in a signal run, 'handoff' seeds
// a ticker's data pool from a locked thesis (idempotent; never launches the research run itself).
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'signal' | 'sweep' | 'screener-agent' | 'handoff'
// 'incomplete' = the process exited cleanly but a full/rerun didn't produce its final deliverables
// (thesis/decision) — almost always budget/turn truncation. Distinct from 'error' (a real failure).
// 'readiness-checking' / 'awaiting-readiness-decision' are PRE-SPAWN states: the deterministic
// data-readiness gate runs before any `claude` CLI is spawned (run.child is still null). A run
// only reaches 'running' once the gate passes clean or the user proceeds/overrides.
export type RunStatus =
  | 'starting' | 'readiness-checking' | 'awaiting-readiness-decision'
  | 'running' | 'done' | 'error' | 'cancelled' | 'incomplete'
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

export interface ReadinessReport {
  ticker: string
  kind: RunKind
  module?: string              // single-module variant
  overall: 'clean' | 'degraded' | 'blocked'   // blocked if any blocker; degraded if any degrade; else clean
  fileCount: number
  usableCount: number
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

export type SseEvent =
  | { type: 'run-started'; runId: string; kind: RunKind; ticker: string; runRoot: string | null; sessionId?: string; willCommitToMain: boolean; swarm?: string; ts: number }
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
  swarm?: string // omitted for research
  module?: string
  agent?: string
  agentCount: number
  estCostUsdRange: [number, number]
  estMinutesRange: [number, number]
  willCommitToMain: boolean
  estCommits: number
  requiresTypedConfirm: boolean
  creditPreflight: CreditPreflight
}
