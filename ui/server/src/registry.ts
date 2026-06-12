import { randomUUID } from 'node:crypto'
import type { ResultPromise } from 'execa'
import { logFinish } from './activity-log'
import type { AgentRunState, ReadinessDecision, ReadinessReport, RunKind, RunStatus, SseEvent } from './types'

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
  // The run's SUBJECT is the concurrency/routing key (RunSubject generalization): for research
  // runs subjectId === ticker; for swarm runs it is the swarm's unit id (e.g. a SIG-… signal id).
  // `ticker` is kept as the display/compat field — research consumers (activity log, calls list,
  // run snapshots) read it unchanged; swarm runs set it to the subjectId label.
  subjectId: string
  swarmId: string // 'research' (default) or a SWARM.md id
  unit: string // 'ticker' | 'signal' | …
  ticker: string
  module?: string
  agent?: string
  model: string
  prompt: string
  user: string // who launched it — authenticated email (Cloudflare Access) or "local"
  userVia: 'cf-access' | 'local'
  runRoot: string | null // repo-relative, resolved on run-started
  child: ResultPromise | null
  status: RunStatus
  note?: string // optional finish note (e.g. why a run ended incomplete) — surfaced in the activity log
  finishLogged?: boolean // guards the activity-log finish write against double-fire
  readiness?: ReadinessReport // pre-spawn data-readiness gate result (deterministic, no LLM)
  readinessDecision?: ReadinessDecision // the user's gate decision (proceed / override / recheck / cancel)
  deferredSpawn?: () => Promise<void> // set when the gate BLOCKS — spawns the engine once the user proceeds
  cancelRequested?: boolean // cancel arrived while status was 'running' but the child wasn't up yet (the
  // proceedSpawn->spawnEngine buildArgs window); spawnEngine honors it and bails before creating the child.
  // (The running-child cancel + SIGKILL fallback gate on endedAt — see finalizeRunOnClose / cancel().)
  onFinish?: (status: RunStatus) => void // chained full run: advance to the next step when this one ends
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
// Dependency-aware admission (admission.ts) governs same-subject concurrency; this map just tracks
// the in-flight run ids per SUBJECT (research: the ticker; swarms: the unit id, e.g. a SIG id).
// Different subjects always run concurrently.
const activeRunsBySubject = new Map<string, Set<string>>() // subjectId -> set of in-flight runIds

// A run is IN FLIGHT — holds its subject claim + a concurrency slot — from launch through completion,
// INCLUDING the pre-spawn gate pause. A run parked at readiness-checking / awaiting-readiness-decision
// is fully committed to its write targets and will spawn the moment the user decides, so admission
// (exclusivity, disjoint-write, the global cap) and the active-runs view MUST treat it as live. This is
// the single source of truth for "in flight"; never re-list these statuses inline (they drift).
export const IN_FLIGHT_STATUSES = new Set<RunStatus>(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

// All currently-live runs for a subject, self-healing any stale/ended ids.
export function inFlightRunsForSubject(subjectId: string): RunState[] {
  const ids = activeRunsBySubject.get(subjectId)
  if (!ids) return []
  const live: RunState[] = []
  for (const id of [...ids]) {
    const r = runs.get(id)
    if (r && IN_FLIGHT_STATUSES.has(r.status)) live.push(r)
    else ids.delete(id) // self-heal a stale entry
  }
  if (ids.size === 0) activeRunsBySubject.delete(subjectId)
  return live
}

// Back-compat alias (research callers/tests): a ticker IS the research subject.
export function inFlightRunsForTicker(ticker: string): RunState[] {
  return inFlightRunsForSubject(ticker)
}

export function setActiveSubjectRun(runId: string, subjectId: string) {
  let ids = activeRunsBySubject.get(subjectId)
  if (!ids) {
    ids = new Set<string>()
    activeRunsBySubject.set(subjectId, ids)
  }
  ids.add(runId)
}

// Back-compat alias (research callers/tests).
export function setActiveTickerRun(runId: string, ticker: string) {
  setActiveSubjectRun(runId, ticker)
}

export function createRun(
  init: Omit<RunState, 'runId' | 'eventLog' | 'subscribers' | 'agents' | 'expected' | 'toolUseToAgent' | 'child' | 'status' | 'startedAt' | 'subjectId' | 'swarmId' | 'unit'> &
    Partial<Pick<RunState, 'expected' | 'agents' | 'subjectId' | 'swarmId' | 'unit'>>,
): RunState {
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
    // RunSubject defaults AFTER the spread so an omitted/undefined field can never shadow them:
    // existing research call sites pass only `ticker` and stay correct.
    subjectId: init.subjectId ?? init.ticker,
    swarmId: init.swarmId ?? 'research',
    unit: init.unit ?? 'ticker',
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
  const ids = activeRunsBySubject.get(run.subjectId)
  if (ids) {
    ids.delete(run.runId)
    if (ids.size === 0) activeRunsBySubject.delete(run.subjectId)
  }
  // append the perpetual audit record once (finishRun can be reached from both the stream parser and
  // the process-close handler; the guard makes the write idempotent)
  if (!run.finishLogged) {
    run.finishLogged = true
    logFinish({
      runId: run.runId,
      user: run.user,
      userVia: run.userVia,
      kind: run.kind,
      ticker: run.ticker,
      module: run.module,
      agent: run.agent,
      model: run.model,
      status,
      costUsd: run.costUsd,
      durationMs: run.durationMs ?? (run.endedAt - run.startedAt),
      numTurns: run.numTurns,
      note: run.note,
    })
    // advance a chained full run to its next step (fires once, inside the finishLogged guard)
    try {
      run.onFinish?.(status)
    } catch {}
  }
  void Promise.resolve(run.closeWatcher?.()).catch(() => {})
}
