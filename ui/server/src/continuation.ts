import { launch, type LaunchParams } from './launcher'
import { listResumableRuns, type ResumableRunInfo } from './resumable'
import type { RunProvider } from './providers/types'

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
  const candidate = exactContinuationCandidate(intent, deps.resumable())
  if (!candidate) {
    const error: any = new Error('The saved run changed before Continue. Refresh and review the remaining work; no run was started.')
    error.statusCode = 409
    error.body = { code: 'saved_run_changed' }
    throw error
  }
  return deps.launch({
    kind: candidate.kind,
    ticker: candidate.subject,
    module: candidate.module,
    provider: intent.provider,
    model: intent.model,
    reasoningLevel: intent.reasoningLevel,
    expectedProfileKey: intent.expectedProfileKey,
    user: intent.user,
    userVia: intent.userVia,
    // Use only the identity re-read from the server-owned saved-run inventory. The request value is a lookup
    // key, never a filesystem authority.
    runRoot: candidate.runRoot,
    continuation: true,
  })
}
