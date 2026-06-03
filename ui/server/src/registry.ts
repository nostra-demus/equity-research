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
  agents: Map<string, AgentRunState>
  expected: Map<string, ExpectedAgent>
  toolUseToAgent: Map<string, string> // tool_use_id -> agentKey
  eventLog: SseEvent[]
  subscribers: Set<SseClient>
  closeWatcher?: () => Promise<void> | void
}

const runs = new Map<string, RunState>()
let activeWriteRunId: string | null = null

export function isWriteBusy(): RunState | null {
  if (!activeWriteRunId) return null
  const r = runs.get(activeWriteRunId)
  if (r && (r.status === 'starting' || r.status === 'running')) return r
  activeWriteRunId = null
  return null
}

export function setActiveWrite(runId: string) {
  activeWriteRunId = runId
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
  if (activeWriteRunId === run.runId) activeWriteRunId = null
  void Promise.resolve(run.closeWatcher?.()).catch(() => {})
}
