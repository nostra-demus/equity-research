import { randomUUID } from 'node:crypto'
import type { ResultPromise } from 'execa'
import { logFinish } from './activity-log'
import type { AgentRunState, ReadinessDecision, ReadinessReport, ResearchMemoryIdentity, ResearchMemoryRuntimeBinding, RunActivity, RunKind, RunStatus, SseEvent } from './types'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'
import type { OutputLineageAttempt } from './evidence-lineage'

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
  provider: RunProvider
  executionProfile: ProviderExecutionProfile
  profileKey: string
  model: string
  reasoningLevel?: string
  cliVersion?: string
  availabilityProofId?: string
  /** Opaque capability accepted only by the local supervisor publication route. */
  publicationToken?: string
  /** One publication epoch; chained steps share their chain id, stable-root runs never share epochs. */
  provenanceEpoch?: string
  /** Exact paid provider process inside the logical run. Rotated for each automatic continuation. */
  providerAttemptId?: string
  /** Immutable pool generation supplied to this exact provider process, absent for standalone work. */
  evidenceGenerationDigest?: string
  /** Supervisor-only pre-spawn bytes used to settle reusable-output lineage after process-group death. */
  outputLineageAttempt?: OutputLineageAttempt
  /** Canonical supervisor-owned rows. Provider children never receive or mutate this array. */
  executionAttempts?: Array<Record<string, unknown>>
  currentExecutionAttempts?: Array<Record<string, unknown>>
  /** Protected rows captured before an interrupted selection is replaced by a recovery admission. */
  protectedPriorExecutionAttempts?: Array<Record<string, unknown>>
  /** Run-root-relative decision artifact hashes captured immediately before the provider starts. */
  publicationBaselines?: Record<string, string | null>
  /** Retained evidence exists but its pre-provider identity cannot be proven. */
  priorExecutionUnobserved?: boolean
  /** Supervisor-verified provider-parity binding captured before this process was spawned. */
  parityPrelaunchBinding?: Record<string, unknown>
  /** Admission came through the operator-only frozen canary route; set before readiness/spawn begins. */
  parityCanary?: boolean
  /** Frozen child role. Only `final` is a decision author and must complete supervisor publication. */
  parityCanaryStage?: 'module' | 'final'
  /** This terminal canary repairs a supervisor-authorized same-root interruption. */
  parityCanaryContinuation?: boolean
  /** Set only after the live supervisor verifies the terminal parity receipt and bound canaries. */
  parityVerificationCompleted?: boolean
  parityVerificationReceiptPath?: string
  parityVerificationReceiptSha256?: string
  /** Supervisor-owned three-layer memory snapshot. Raw packet content never enters public run state. */
  memoryRuntime?: ResearchMemoryRuntimeBinding
  /** Exact launch identity; absent in enforced mode blocks before provider spend. */
  memoryIdentity?: ResearchMemoryIdentity
  publicationRequested?: boolean
  publicationCompleted?: boolean
  publicationError?: string
  publicationPhase?: 'open' | 'archive-in-progress' | 'archive-sealed' | 'terminal-in-progress' | 'terminal-complete' | 'terminal-failed' | 'parity-attested'
  /** Exact supervisor-verified commit containing the decision used by post-publication consumers. */
  publicationRevision?: string
  /** Synchronous supervisor-owned integrity check for the per-run publication capability transport. */
  publicationTransportVerify?: () => void
  /** Exact supervisor-stamped terminal bytes; close/adjudication fail if the child changes them later. */
  publicationArtifactHashes?: Record<string, string>
  /** Protected immutable copies retained until the whole detached provider group has drained. */
  publicationSnapshot?: {
    directory: string
    entries: Array<{ path: string; snapshot: string; sha256: string }>
  }
  /** Additional supervisor-created immutable files which the terminal commit must include exactly. */
  supervisorPublicationArtifacts?: string[]
  /** Commodity archive/top-record bytes sealed by the supervisor archive phase and rechecked at commit. */
  commodityArchiveBinding?: {
    decisionId: string
    topRecord: string
    topRecordSha256: string
    archiveArtifactHashes: Record<string, string>
  }
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
  /** Internal transactional-admission rollback. Fires only when a run becomes terminal before a provider
   *  child ever exists; never serialized or exposed through the API. */
  onNoChildTerminal?: (status: RunStatus) => void
  chained?: boolean // this run is a step of a chained full run — cancelling it must also halt the chain
  /** This run continues one exact saved root. Kept on the supervisor-owned run identity so every UI
   * reconnect can distinguish "Complete old run" from a fresh Full without inferring from orb counts. */
  continuation?: boolean
  /** Immutable id shared by every step of one chained full run. Cancellation is scoped to this id. */
  chainId?: string
  startedAt: number
  endedAt?: number
  costUsd?: number
  numTurns?: number
  // The CLI's own final `result` verdict, captured on EVERY result (clean or error) — see activity-log.
  cliResult?: { subtype?: string; isError?: boolean; apiErrorStatus?: number }
  /** Last provider-authored text, retained only as a bounded terminal diagnostic on failure. */
  lastProviderMessage?: string
  /** Structured provider failure observed before process close; admission remains held until tree exit. */
  streamFailure?: { reason: string; message: string }
  /** Detached provider process-group identity while a terminal kill is being drained. */
  processGroupPid?: number
  processGroupKillRequested?: boolean
  durationMs?: number
  lastStdoutAt?: number // when the engine child last wrote ANY stdout — the "engine is alive" signal
  lastActivity?: RunActivity // the orchestrator's most recent tool call (heartbeat payload)
  activity: RunActivity[] // bounded ring of recent tool calls — replayed on subscribe (see ACTIVITY_RING)
  sessionId?: string
  resumeSessionId?: string
  /** Number of fresh Codex processes added inside this one admitted logical run. Zero/absent is the first. */
  automaticContinuationCount?: number
  /** Sorted canonical done-orb keys observed at the prior Codex process boundary. */
  automaticContinuationCheckpoint?: string
  /** Pre-first-process hashes for every declared terminal output in this admitted logical Codex run. */
  automaticContinuationBaselines?: Record<string, string | null>
  /** Consecutive clean Codex process boundaries with no newly completed canonical output. */
  automaticContinuationStagnantTurns?: number
  /** The prior process already authored every declared decision artifact; later processes publish only. */
  automaticContinuationRetainsDecisionAuthor?: boolean
  /** Metrics already accumulated before the currently running continuation process. */
  automaticContinuationMetricBase?: { costUsd: number; numTurns: number; durationMs: number }
  willCommitToMain: boolean
  writeTargetsAbs: string[] // absolute paths this run writes — D2 disjointness
  coveredModules: string[] // modules this run writes into — D2b / D3
  readDepsAbs: string[] // absolute requiredUpstream read paths (agent runs) — D4b; [] otherwise
  agents: Map<string, AgentRunState>
  expected: Map<string, ExpectedAgent>
  toolUseToAgent: Map<string, string> // tool_use_id -> agentKey
  /** Native Codex child-thread identity -> canonical orb. Telemetry is advisory; files remain truth. */
  nativeThreadToAgent: Map<string, string>
  /** Last native child status when Codex exposes it (the public exec stream may omit lifecycle rows). */
  nativeAgentStates: Map<string, string>
  eventLog: SseEvent[]
  subscribers: Set<SseClient>
  closeWatcher?: () => Promise<void> | void
  /** Shared kernel lease that prevents a production deploy/restart during this run. */
  releaseDeployBarrier?: () => void
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

// These are the active DISPLAY/heartbeat phases, including the pre-spawn gate pause. A run parked at
// readiness-checking / awaiting-readiness-decision is fully committed to its targets. Subject/admission
// ownership lasts slightly longer: Cancel changes status before the process group closes, so that safety
// boundary uses endedAt === undefined (see inFlightRunsForSubject) and never releases on status alone.
export const IN_FLIGHT_STATUSES = new Set<RunStatus>(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

// All currently-live runs for a subject, self-healing any stale/ended ids. `endedAt` — not the display
// status — is the release proof: cancel marks a running child "cancelled" immediately, but that process
// group can keep flushing/committing until close finalization sets endedAt.
export function inFlightRunsForSubject(subjectId: string, swarmId = 'research'): RunState[] {
  const key = subjectRunKey(subjectId, swarmId)
  const ids = activeRunsBySubject.get(key)
  if (!ids) return []
  const live: RunState[] = []
  for (const id of [...ids]) {
    const r = runs.get(id)
    if (r && r.endedAt === undefined) live.push(r)
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
  init: Omit<RunState, 'runId' | 'eventLog' | 'subscribers' | 'agents' | 'expected' | 'toolUseToAgent' | 'nativeThreadToAgent' | 'nativeAgentStates' | 'child' | 'status' | 'startedAt' | 'subjectId' | 'swarmId' | 'unit' | 'activity'> &
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
    nativeThreadToAgent: new Map(),
    nativeAgentStates: new Map(),
    eventLog: [],
    activity: [],
    subscribers: new Set(),
    ...init,
    providerAttemptId: init.providerAttemptId ?? runId,
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
  const wireEvent = {
    ...event, provider: run.provider, executionProfile: run.executionProfile,
    chainId: run.chainId, executionEpoch: run.provenanceEpoch,
  } as SseEvent
  run.eventLog.push(wireEvent)
  for (const c of run.subscribers) {
    try {
      c.send(wireEvent)
    } catch {
      run.subscribers.delete(c)
    }
  }
}

/** Send to live subscribers WITHOUT recording in eventLog — for transient/ambient events (heartbeats)
 *  that would otherwise bloat the replay backlog every new subscriber receives. */
export function emitTransient(run: RunState, event: SseEvent) {
  const wireEvent = {
    ...event, provider: run.provider, executionProfile: run.executionProfile,
    chainId: run.chainId, executionEpoch: run.provenanceEpoch,
  } as SseEvent
  for (const c of run.subscribers) {
    try {
      c.send(wireEvent)
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
      provider: run.provider,
      executionProfile: run.executionProfile,
      profileKey: run.profileKey,
      model: run.model,
      reasoningLevel: run.reasoningLevel,
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
  for (const a of run.activity) client.send({
    type: 'run-activity', runId: run.runId, tool: a.tool, target: a.target,
    provider: run.provider, executionProfile: run.executionProfile,
    chainId: run.chainId, executionEpoch: run.provenanceEpoch, ts: a.ts,
  })
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
      chainId: run.chainId,
      executionEpoch: run.provenanceEpoch,
      // the authoritative run folder rides the finished event too: a row folded from a finish-only
      // event (its launched line lost) could otherwise never open its reports
      runRoot: run.runRoot ?? undefined,
      module: run.module,
      agent: run.agent,
      provider: run.provider,
      executionProfile: run.executionProfile,
      profileKey: run.profileKey,
      model: run.model,
      reasoningLevel: run.reasoningLevel,
      cliVersion: run.cliVersion,
      status,
      costUsd: run.costUsd,
      durationMs: run.durationMs ?? (run.endedAt - run.startedAt),
      numTurns: run.numTurns,
      note: run.note,
      sessionId: run.sessionId,
      cliResult: run.cliResult,
    })
    // advance a chained full run to its next step (fires once, inside the finishLogged guard)
    if (!run.child) {
      try { run.onNoChildTerminal?.(status) } catch {}
    }
    try {
      run.onFinish?.(status)
    } catch {}
    try {
      run.onTerminal?.(status)
    } catch {}
  }
  const releaseDeployBarrier = run.releaseDeployBarrier
  run.releaseDeployBarrier = undefined
  try { releaseDeployBarrier?.() } catch {}
  void Promise.resolve(run.closeWatcher?.()).catch(() => {})
}
