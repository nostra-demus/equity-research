export type Sufficiency = 'Sufficient' | 'Partial' | 'Insufficient'
export type NodeStatus = 'dormant' | 'locked' | 'ready' | 'notready' | 'queued' | 'running' | 'done' | 'failed'

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
  | { type: 'run-error'; runId: string; status: 'error' | 'cancelled'; reason: string; message?: string; ts: number }

export interface NodeRuntime { status: NodeStatus; verdict?: string | null; outputPath?: string; runId?: string }

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
