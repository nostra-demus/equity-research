import { randomUUID } from 'node:crypto'
import type { ResultPromise } from 'execa'
import type { AgentRunState, RunKind, RunStatus, SseEvent } from './types'

export interface SseClient {
  id: string
  send: (event: SseEvent) => void
}

export interface ExpectedAgent {
  key: string
  module: string
  name: string
  layer: number
  outputRel: string // run-root-relative, e.g. "business-model/09_moat.md"
}

export interface RunState {
  runId: string
  kind: RunKind
  ticker: string
  module?: string
  agent?: string
  model: string
  prompt: string
  runRoot: string | null // repo-relative, resolved on run-started
  child: ResultPromise | null
  status: RunStatus
  startedAt: number
  endedAt?: number
  costUsd?: number
  numTurns?: number
  durationMs?: number
  sessionId?: string
  willCommitToMain: boolean
  writeTargetsAbs: string[] // absolute paths this run writes — D2 disjointness
  coveredModules: string[] // modules this run writes into — D2b / D3
  readDepsAbs: string[] // absolute requiredUpstream read paths (agent runs) — D4b; [] otherwise
  agents: Map<string, AgentRunState>
  expected: Map<string, ExpectedAgent>
  toolUseToAgent: Map<string, string> // tool_use_id -> agentKey
  eventLog: SseEvent[]
  subscribers: Set<SseClient>
  closeWatcher?: () => Promise<void> | void
}

const runs = new Map<string, RunState>()
// Dependency-aware admission (admission.ts) governs same-ticker concurrency; this map just tracks
// the in-flight run ids per ticker. Different tickers always run concurrently.
const activeRunsByTicker = new Map<string, Set<string>>() // ticker -> set of in-flight runIds

// All currently-live runs for a ticker (starting|running), self-healing any stale/ended ids.
export function inFlightRunsForTicker(ticker: string): RunState[] {
  const ids = activeRunsByTicker.get(ticker)
  if (!ids) return []
  const live: RunState[] = []
  for (const id of [...ids]) {
    const r = runs.get(id)
    if (r && (r.status === 'starting' || r.status === 'running')) live.push(r)
    else ids.delete(id) // self-heal a stale entry
  }
  if (ids.size === 0) activeRunsByTicker.delete(ticker)
  return live
}

export function setActiveTickerRun(runId: string, ticker: string) {
  let ids = activeRunsByTicker.get(ticker)
  if (!ids) {
    ids = new Set<string>()
    activeRunsByTicker.set(ticker, ids)
  }
  ids.add(runId)
}

export function createRun(init: Omit<RunState, 'runId' | 'eventLog' | 'subscribers' | 'agents' | 'expected' | 'toolUseToAgent' | 'child' | 'status' | 'startedAt'> & Partial<Pick<RunState, 'expected' | 'agents'>>): RunState {
  const runId = randomUUID()
  const run: RunState = {
    runId,
    child: null,
    status: 'starting',
    startedAt: Date.now(),
    agents: init.agents ?? new Map(),
    expected: init.expected ?? new Map(),
    toolUseToAgent: new Map(),
    eventLog: [],
    subscribers: new Set(),
    ...init,
  }
  runs.set(runId, run)
  return run
}

export function getRun(runId: string): RunState | undefined {
  return runs.get(runId)
}

export function listRuns(): RunState[] {
  return [...runs.values()].sort((a, b) => b.startedAt - a.startedAt)
}

export function emit(run: RunState, event: SseEvent) {
  run.eventLog.push(event)
  for (const c of run.subscribers) {
    try {
      c.send(event)
    } catch {
      run.subscribers.delete(c)
    }
  }
}

export function subscribe(run: RunState, client: SseClient) {
  // replay backlog, then live
  for (const e of run.eventLog) client.send(e)
  run.subscribers.add(client)
}

export function unsubscribe(run: RunState, client: SseClient) {
  run.subscribers.delete(client)
}

export function finishRun(run: RunState, status: RunStatus) {
  run.status = status
  run.endedAt = Date.now()
  const ids = activeRunsByTicker.get(run.ticker)
  if (ids) {
    ids.delete(run.runId)
    if (ids.size === 0) activeRunsByTicker.delete(run.ticker)
  }
  void Promise.resolve(run.closeWatcher?.()).catch(() => {})
}
