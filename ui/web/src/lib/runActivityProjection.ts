import type { NodeRuntime, ResumableRunInfo } from './types'

const LIVE_RUN_STATUSES = new Set(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

const normalizeIdentity = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ''

export const PAUSED_RUN_LABEL = 'Paused · waiting to resume'
export const PAUSED_RUN_HELP = 'This run is paused. Choose Complete old run to continue, or Run full to start again.'

type ActiveRunLike = {
  runId: string
  ticker: string
  swarmId?: string
  status: string
}

export interface RunActivityProjection {
  activeModules: Set<string>
  pausedModules: Set<string>
  pausedKeys: Set<string>
  waitingToResume: boolean
}

/**
 * Display-only reconciliation for the constellation.
 *
 * A stopped run can leave unfinished orbs painted `queued`/`running` in the browser while disk truth
 * already offers "Complete old run". Those orbs are saved work waiting for the user, not live work. Keep
 * the store values intact for resume/retry logic and project them as paused only when their owning run is
 * no longer active.
 */
export function projectRunActivity({
  subject,
  swarm,
  nodeRuntime,
  activeRuns,
  resumableRuns,
}: {
  subject: string | null
  swarm: string
  nodeRuntime: Record<string, NodeRuntime>
  activeRuns: Record<string, ActiveRunLike>
  resumableRuns: ResumableRunInfo[]
}): RunActivityProjection {
  const activeModules = new Set<string>()
  const pausedModules = new Set<string>()
  const pausedKeys = new Set<string>()
  if (!subject) return { activeModules, pausedModules, pausedKeys, waitingToResume: false }

  const normalizedSubject = normalizeIdentity(subject)
  const normalizedSwarm = normalizeIdentity(swarm)
  const hasSavedFullRun = resumableRuns.some((run) =>
    run.kind === 'full'
    && normalizeIdentity(run.subject) === normalizedSubject
    && normalizeIdentity(run.swarm) === normalizedSwarm)
  const liveRunIds = new Set(Object.values(activeRuns)
    .filter((run) =>
      normalizeIdentity(run.ticker) === normalizedSubject
      && normalizeIdentity(run.swarmId) === normalizedSwarm
      && LIVE_RUN_STATUSES.has(run.status))
    .map((run) => run.runId))

  for (const [key, runtime] of Object.entries(nodeRuntime)) {
    if (runtime.status !== 'queued' && runtime.status !== 'running') continue
    const module = key.split('/')[0]
    // Current engines stamp every launched orb with its run id. The permissive fallback preserves the old
    // live display during a rolling deploy if an older engine sends no id at all.
    const belongsToLiveRun = !runtime.runId || liveRunIds.has(runtime.runId)
    if (hasSavedFullRun && !belongsToLiveRun) {
      pausedKeys.add(key)
      pausedModules.add(module)
    } else {
      activeModules.add(module)
    }
  }

  return { activeModules, pausedModules, pausedKeys, waitingToResume: pausedKeys.size > 0 }
}
