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
  latestRun: {
    runRoot: string
    decision: string | null
    decisionDate: string | null
    confidence: number | null
  } | null
}

// ---- runs / events ----

export type RunKind = 'full' | 'module' | 'agent' | 'rerun'
export type RunStatus = 'starting' | 'running' | 'done' | 'error' | 'cancelled'
export type AgentRunStatus = 'queued' | 'running' | 'done' | 'failed'

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
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled'; reason: string; message?: string; ts: number }

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
