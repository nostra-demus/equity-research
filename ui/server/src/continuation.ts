import { launch, type LaunchParams } from './launcher'
import { listResumableRuns, type ResumableRunInfo } from './resumable'
import type { RunProvider } from './providers/types'
import type { PreparedRunPlanTransaction } from './run-plan-transaction'

export interface ExactContinuationIntent {
  swarm: 'research'
  subject: string
  runRoot: string
  kind: 'full' | 'module'
  module?: string
  provider: RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
  user?: string
  userVia?: 'cf-access' | 'local'
  /** Internal only: the receipt-checked private tree for this exact continuation attempt. */
  preparedRunPlanTransaction?: PreparedRunPlanTransaction
}

export interface ExactContinuationDeps {
  resumable: () => ResumableRunInfo[]
  launch: (params: LaunchParams) => ReturnType<typeof launch>
}

const defaultDeps: ExactContinuationDeps = {
  resumable: listResumableRuns,
  launch,
}

export function exactContinuationCandidate(
  intent: Pick<ExactContinuationIntent, 'swarm' | 'subject' | 'runRoot' | 'kind' | 'module'>,
  runs: readonly ResumableRunInfo[],
): ResumableRunInfo | null {
  const subject = intent.subject.trim().toUpperCase()
  return runs.find((candidate) => candidate.swarm === intent.swarm
    && candidate.subject.trim().toUpperCase() === subject
    && candidate.runRoot === intent.runRoot
    && candidate.kind === intent.kind
    && (intent.kind !== 'module' || candidate.module === intent.module)) ?? null
}

/**
 * One provider-neutral continuation boundary for browser and headless callers. It positively re-resolves the
 * saved identity immediately before launch, then carries the exact root into the launcher. There is no
 * fallback to today's root and no conversion from module to full.
 */
export async function continueExactSavedRun(
  intent: ExactContinuationIntent,
  deps: ExactContinuationDeps = defaultDeps,
): ReturnType<typeof launch> {
  if (!exactContinuationCandidate(intent, deps.resumable())) {
    const error: any = new Error('The saved run changed before Continue. Refresh and review the remaining work; no run was started.')
    error.statusCode = 409
    error.body = { code: 'saved_run_changed' }
    throw error
  }
  return deps.launch({
    kind: intent.kind,
    ticker: intent.subject,
    module: intent.module,
    provider: intent.provider,
    model: intent.model,
    reasoningLevel: intent.reasoningLevel,
    expectedProfileKey: intent.expectedProfileKey,
    user: intent.user,
    userVia: intent.userVia,
    runRoot: intent.runRoot,
    continuation: true,
    ...(intent.preparedRunPlanTransaction
      ? { preparedRunPlanTransaction: intent.preparedRunPlanTransaction }
      : {}),
  })
}
