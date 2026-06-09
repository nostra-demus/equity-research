export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'
export type NodeStatus = 'dormant' | 'locked' | 'ready' | 'notready' | 'queued' | 'running' | 'done' | 'failed'
// engine reachability, driven by the /api/health heartbeat (lib/store). `your-network` = the visitor's
// own connection is down; `session-expired` = Cloudflare Access cookie gone (reachable but not JSON-ok).
export type HealthState = 'connecting' | 'online' | 'reconnecting' | 'engine-offline' | 'your-network' | 'session-expired'

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
}

export interface ModuleReadiness { status: Sufficiency; reasons: string[]; caps: string[] }
export interface DataStatus {
  ticker: string
  hasAnyData: boolean
  fileCount: number
  files: { filename: string; type: string; periodHint: string | null; ageMonths: number | null; confidence: string; sheets?: { name: string; rows: number; cols: number; cells: number }[] }[]
  recentByType: Record<string, { filename: string; ageMonths: number | null } | undefined>
  modules: Record<string, ModuleReadiness>
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

export interface LaunchPreflight {
  kind: 'full' | 'module' | 'agent' | 'rerun'
  ticker: string
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

export type SseEvent =
  | { type: 'run-started'; runId: string; kind: string; ticker: string; runRoot: string | null; willCommitToMain: boolean; ts: number }
  | { type: 'agent-started'; runId: string; module: string; agentKey: string; name: string; layer: number; ts: number }
  | { type: 'agent-done'; runId: string; agentKey: string; module: string; name: string; layer: number; outputPath: string; verdict: string | null; bytes: number; ts: number }
  | { type: 'agent-failed'; runId: string; agentKey: string; module: string; name: string; layer: number; reason: string; ts: number }
  | { type: 'layer-advanced'; runId: string; module: string; toLayer: number; doneCount: number; expectedCount: number; ts: number }
  | { type: 'module-done'; runId: string; module: string; status: 'completed' | 'aborted'; reason?: string; verdict?: string | null; ts: number }
  | { type: 'cost-tick'; runId: string; costUsdSoFar?: number; rateLimit?: { ok: boolean; reason?: string }; ts: number }
  | { type: 'run-done'; runId: string; status: 'done'; costUsd?: number; durationMs?: number; numTurns?: number; finalThesisPath?: string | null; decisionRecordPath?: string | null; ts: number }
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled' | 'incomplete'; reason: string; message?: string; ts: number }

// startedAt/endedAt are SERVER timestamps (from the agent-started / agent-done SSE events), so a finished
// orb's duration (endedAt - startedAt) is clock-skew-free. startedAt is set the instant the orchestrator
// dispatches the orb — "the data reaching the orb" — which is when its live timer starts.
export interface NodeRuntime { status: NodeStatus; verdict?: string | null; outputPath?: string; runId?: string; startedAt?: number; endedAt?: number }

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
export type RunKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track'
export interface Whoami { user: string; userVia: 'cf-access' | 'local' }
export interface ActivityRow {
  runId: string
  user: string
  userVia: 'cf-access' | 'local'
  kind: RunKind
  ticker: string
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
