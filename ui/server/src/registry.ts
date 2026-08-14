import { randomUUID } from 'node:crypto'
import type { ResultPromise } from 'execa'
import { logFinish } from './activity-log'
import type { AgentRunState, ReadinessDecision, ReadinessReport, RunActivity, RunKind, RunStatus, SseEvent } from './types'

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
  selectedDecisionRunRoot?: string // immutable call authorizing a staged/scoped launch
  selectedDecisionFingerprint?: string // exact-call CAS, rechecked before a paid child starts
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
  onTerminal?: (status: RunStatus) => void // headless orchestration hook; fires once with the real outcome
  chained?: boolean // this run is a step of a chained full run — cancelling it must also halt the chain
  startedAt: number
  endedAt?: number
  costUsd?: number
  numTurns?: number
  durationMs?: number
  lastStdoutAt?: number // when the engine child last wrote ANY stdout — the "engine is alive" signal
  lastActivity?: RunActivity // the orchestrator's most recent tool call (heartbeat payload)
  activity: RunActivity[] // bounded ring of recent tool calls — replayed on subscribe (see ACTIVITY_RING)
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
const activeRunsBySubject = new Map<string, Set<string>>() // `${swarmId}\0${subjectId}` -> in-flight runIds

// A subject name is only unique inside its owning swarm. Research GOLD and commodity GOLD are different
// units, with different run roots and different command namespaces; treating the bare label as the lock
// identity made either one block the other. Keep the default for old research callers, but make every new
// registry/admission path carry the owner explicitly.
const subjectRunKey = (subjectId: string, swarmId = 'research'): string => `${swarmId}\0${subjectId}`

// A run is IN FLIGHT — holds its subject claim + a concurrency slot — from launch through completion,
// INCLUDING the pre-spawn gate pause. A run parked at readiness-checking / awaiting-readiness-decision
// is fully committed to its write targets and will spawn the moment the user decides, so admission
// (exclusivity, disjoint-write, the global cap) and the active-runs view MUST treat it as live. This is
// the single source of truth for "in flight"; never re-list these statuses inline (they drift).
export const IN_FLIGHT_STATUSES = new Set<RunStatus>(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

// All currently-live runs for a subject, self-healing any stale/ended ids.
export function inFlightRunsForSubject(subjectId: string, swarmId = 'research'): RunState[] {
  const key = subjectRunKey(subjectId, swarmId)
  const ids = activeRunsBySubject.get(key)
  if (!ids) return []
  const live: RunState[] = []
  for (const id of [...ids]) {
    const r = runs.get(id)
    if (r && IN_FLIGHT_STATUSES.has(r.status)) live.push(r)
    else ids.delete(id) // self-heal a stale entry
  }
  if (ids.size === 0) activeRunsBySubject.delete(key)
  return live
}

// Back-compat alias (research callers/tests): a ticker IS the research subject.
export function inFlightRunsForTicker(ticker: string): RunState[] {
  return inFlightRunsForSubject(ticker)
}

export function setActiveSubjectRun(runId: string, subjectId: string, swarmId = runs.get(runId)?.swarmId ?? 'research') {
  const key = subjectRunKey(subjectId, swarmId)
  let ids = activeRunsBySubject.get(key)
  if (!ids) {
    ids = new Set<string>()
    activeRunsBySubject.set(key, ids)
  }
  ids.add(runId)
}

// Back-compat alias (research callers/tests).
export function setActiveTickerRun(runId: string, ticker: string) {
  setActiveSubjectRun(runId, ticker)
}

export function createRun(
  init: Omit<RunState, 'runId' | 'eventLog' | 'subscribers' | 'agents' | 'expected' | 'toolUseToAgent' | 'child' | 'status' | 'startedAt' | 'subjectId' | 'swarmId' | 'unit' | 'activity'> &
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
    activity: [],
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

/** Send to live subscribers WITHOUT recording in eventLog — for transient/ambient events (heartbeats)
 *  that would otherwise bloat the replay backlog every new subscriber receives. */
export function emitTransient(run: RunState, event: SseEvent) {
  for (const c of run.subscribers) {
    try {
      c.send(event)
    } catch {
      run.subscribers.delete(c)
    }
  }
}

// ---- orchestrator activity ring ----
// run-activity is transient (out of eventLog: a long run makes thousands of tool calls, and every one
// would land in every new subscriber's replay). But a client that attaches a beat after launch — which
// is EVERY client, since the run spawns before the cockpit can subscribe — would then miss the opening
// steps and show a feed that starts in the middle. So keep the recent tail here and replay it on
// subscribe: enough to reconstruct what a document-intake run has read, nowhere near a full run's log.
const ACTIVITY_RING = 80

export function recordActivity(run: RunState, entry: RunActivity) {
  run.activity.push(entry)
  if (run.activity.length > ACTIVITY_RING) run.activity.splice(0, run.activity.length - ACTIVITY_RING)
}

// ---- run heartbeat pump ----
// Every in-flight run pulses a transient run-heartbeat so the cockpit can show "the engine is alive,
// doing X, for Ys" between agent events — the anti-"is it stuck?" signal. 3s keeps the ambient labels
// ("2s ago") honest without meaningful load; unref() so the interval never holds the process open.
const HEARTBEAT_MS = 3_000
const heartbeatTimer = setInterval(() => {
  const now = Date.now()
  for (const run of runs.values()) {
    if (!IN_FLIGHT_STATUSES.has(run.status) || !run.subscribers.size) continue
    const agents = [...run.agents.values()]
    emitTransient(run, {
      type: 'run-heartbeat',
      runId: run.runId,
      status: run.status,
      elapsedMs: now - run.startedAt,
      agentsDone: agents.filter((a) => a.status === 'done').length,
      agentsTotal: agents.length,
      costUsd: run.costUsd,
      lastStdoutAt: run.lastStdoutAt,
      lastActivity: run.lastActivity,
      ts: now,
    })
  }
}, HEARTBEAT_MS)
heartbeatTimer.unref()

export function subscribe(run: RunState, client: SseClient) {
  // replay backlog, then live
  for (const e of run.eventLog) client.send(e)
  // …then the activity tail (kept out of eventLog — see ACTIVITY_RING), so a client attaching mid-run
  // sees the steps that ran before it connected instead of a feed that starts mid-thought.
  for (const a of run.activity) client.send({ type: 'run-activity', runId: run.runId, tool: a.tool, target: a.target, ts: a.ts })
  run.subscribers.add(client)
}

export function unsubscribe(run: RunState, client: SseClient) {
  run.subscribers.delete(client)
}

export function finishRun(run: RunState, status: RunStatus) {
  run.status = status
  run.endedAt = Date.now()
  const key = subjectRunKey(run.subjectId, run.swarmId)
  const ids = activeRunsBySubject.get(key)
  if (ids) {
    ids.delete(run.runId)
    if (ids.size === 0) activeRunsBySubject.delete(key)
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
      swarm: run.swarmId,
      chained: run.chained,
      // the authoritative run folder rides the finished event too: a row folded from a finish-only
      // event (its launched line lost) could otherwise never open its reports
      runRoot: run.runRoot ?? undefined,
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
    try {
      run.onTerminal?.(status)
    } catch {}
  }
  void Promise.resolve(run.closeWatcher?.()).catch(() => {})
}
