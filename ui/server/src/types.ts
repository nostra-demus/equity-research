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
}

export interface SwarmGraph {
  modules: ModuleNode[]
  masterSynthesizer: { name: string; description: string }
  totals: { modules: number; agents: number; specialists: number; synthesis: number }
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

export interface DataStatus {
  ticker: string
  hasAnyData: boolean
  fileCount: number
  files: ClassifiedFile[]
  recentByType: Record<string, { filename: string; ageMonths: number | null } | undefined>
  modules: Record<string, ModuleReadiness>
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
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track'
// 'incomplete' = the process exited cleanly but a full/rerun didn't produce its final deliverables
// (thesis/decision) — almost always budget/turn truncation. Distinct from 'error' (a real failure).
export type RunStatus = 'starting' | 'running' | 'done' | 'error' | 'cancelled' | 'incomplete'
export type AgentRunStatus = 'queued' | 'running' | 'done' | 'failed'

// ---- admission control (dependency-aware concurrency) ----
// Discriminated rejection so the client can branch the toast (info vs bad) and explain precisely.
export type AdmissionRejection =
  | { code: 'target_conflict'; httpStatus: 409; conflictRunId: string; conflictTargets: string[] }
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
  | { type: 'run-started'; runId: string; kind: RunKind; ticker: string; runRoot: string | null; sessionId?: string; willCommitToMain: boolean; ts: number }
  | { type: 'agent-started'; runId: string; module: string; agentKey: string; name: string; layer: number; ts: number }
  | { type: 'agent-done'; runId: string; agentKey: string; module: string; name: string; layer: number; outputPath: string; verdict: string | null; bytes: number; ts: number }
  | { type: 'agent-failed'; runId: string; agentKey: string; module: string; name: string; layer: number; reason: string; ts: number }
  | { type: 'layer-advanced'; runId: string; module: string; toLayer: number; doneCount: number; expectedCount: number; ts: number }
  | { type: 'module-done'; runId: string; module: string; status: 'completed' | 'aborted'; reason?: string; verdict?: string | null; ts: number }
  | { type: 'cost-tick'; runId: string; costUsdSoFar?: number; rateLimit?: { ok: boolean; reason?: string }; ts: number }
  | { type: 'run-done'; runId: string; status: 'done'; costUsd?: number; durationMs?: number; numTurns?: number; finalThesisPath?: string | null; decisionRecordPath?: string | null; ts: number }
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled' | 'incomplete'; reason: string; message?: string; ts: number }

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
  ticker: string
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
