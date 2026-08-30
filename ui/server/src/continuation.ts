import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  continuationPlanReceiptMatches, prepareExactModuleContinuationPrivately,
  thesisPlanForRequest, thesisPlanForScopeGuard,
  type ContinuationPlanReceipt, type ThesisPlan,
} from './completion'
import { clearChainedReadiness, launch, type LaunchParams } from './launcher'
import { getRun, listRuns } from './registry'
import { listResumableRuns, type ResumableRunInfo } from './resumable'
import { buildSwarmGraph } from './roster'
import type { RunProvider } from './providers/types'
import {
  prepareRunPlanTransaction,
  type PreparedRunPlanTransaction,
} from './run-plan-transaction'
import {
  claimRunPlanRequest, markRunPlanAdmitted, markRunPlanFailedBeforeStart, markRunPlanStarted,
  type RunPlanRequestClaim,
} from './run-plan-admission'

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
  /** Internal scoped launch controls for an exact module continuation. Filesystem/provider/root authority
   * remains canonical below; callers cannot override those bindings through this object. */
  launchOptions?: Pick<LaunchParams,
    'deferModuleMemo' | 'exactModuleResume' | 'exactModuleInputs' | 'exactModuleRunRoot'
    | 'exactModuleWritableOrbs' | 'exactModuleSynthesisOrbs' | 'preSpawnGuard' | 'terminalGuard'
    | 'onTerminal'>
  /** Internal-only private preparation override for an exact module. The shared admission kernel still owns
   * the durable request claim, journal, atomic activation, paid boundary, and rollback. */
  prepareTransaction?: ExactContinuationAdmissionDeps['prepare']
}

export interface ExactContinuationDeps {
  resumable: () => ResumableRunInfo[]
  launch: (params: LaunchParams) => ReturnType<typeof launch>
}

/** One-child exact module Continues borrow the full-chain frozen-readiness coordinator. Its state owns an
 * external evidence capability, so it must be released at the launcher's true terminal boundary on every
 * outcome. Compose rather than replace any route observer; cleanup is fail-safe even if that observer throws. */
export function exactModuleContinuationOnTerminal(
  chainId: string,
  observer?: LaunchParams['onTerminal'],
): NonNullable<LaunchParams['onTerminal']> {
  return (status) => {
    try { observer?.(status) } finally { clearChainedReadiness(chainId) }
  }
}

export interface ReviewedExactContinuation {
  requestId: string
  continuationReceipt: ContinuationPlanReceipt
  reuse: string[]
  /** Exact paid/read capability reviewed for a one-module continuation. This is kept with the v2 receipt so
   * a restarted headless supervisor cannot reinterpret a module interruption as Full or silently widen its
   * writable orb set after roster/artifact drift. */
  exactModule?: ExactModuleContinuationScope
}

export interface ExactModuleContinuationScope {
  module: string
  savedInputs: string[]
  doneOrbKeys: string[]
  writableOrbs: string[]
  synthesisOrbs: string[]
}

export interface ExactContinuationAdmissionResult {
  response: Record<string, unknown>
  replay: boolean
}

export interface ExactContinuationAdmissionDeps extends ExactContinuationDeps {
  plan: typeof thesisPlanForRequest
  receiptMatches: typeof continuationPlanReceiptMatches
  claim: (intent: {
    requestId: string; planFingerprint: string; user: string; subject: string
  }) => Promise<RunPlanRequestClaim>
  prepare: (
    requestId: string,
    subject: string,
    plan: ThesisPlan,
    hooks: { onStarted: () => Promise<void>; onRolledBack: (reason: string) => Promise<void> },
  ) => Promise<PreparedRunPlanTransaction>
  markAdmitted: (requestId: string, runId: string, response: Record<string, unknown>) => Promise<unknown>
  markStarted: (requestId: string) => Promise<unknown>
  markFailed: (requestId: string, reason: string) => Promise<unknown>
}

const defaultDeps: ExactContinuationDeps = {
  resumable: listResumableRuns,
  launch,
}

const defaultAdmissionDeps: ExactContinuationAdmissionDeps = {
  ...defaultDeps,
  plan: thesisPlanForRequest,
  receiptMatches: continuationPlanReceiptMatches,
  claim: claimRunPlanRequest,
  prepare: prepareRunPlanTransaction,
  markAdmitted: markRunPlanAdmitted,
  markStarted: markRunPlanStarted,
  markFailed: markRunPlanFailedBeforeStart,
}

function continuationError(code: string, message: string, statusCode = 409): Error & {
  code: string; statusCode: number; body: { code: string }
} {
  return Object.assign(new Error(message), { code, statusCode, body: { code } })
}

/** One stable UUID-shaped request identity for one supervisor-sealed interruption. A later paid child gets
 * a different protected interruption id, while a process restart derives this exact same id and therefore
 * replays the durable request claim instead of spending twice. */
export function automaticContinuationRequestId(runRoot: string, interruptionId: string): string {
  const digest = Buffer.from(createHash('sha256')
    .update('nostra-headless-exact-continuation\0', 'utf8')
    .update(runRoot, 'utf8')
    .update('\0', 'utf8')
    .update(interruptionId, 'utf8')
    .digest().subarray(0, 16))
  // RFC 4122 v5/variant bits. The bytes are a deterministic SHA-256 namespace digest rather than UUIDv5's
  // SHA-1, but the ordinary request validator intentionally accepts every standards-shaped UUID version.
  digest[6] = (digest[6]! & 0x0f) | 0x50
  digest[8] = (digest[8]! & 0x3f) | 0x80
  const hex = digest.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
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
  if (!intent.preparedRunPlanTransaction) {
    throw continuationError(
      'continuation_transaction_required',
      'Continue requires an exact receipt-checked prepared transaction. Nothing was started.',
    )
  }
  const candidate = exactContinuationCandidate(intent, deps.resumable())
  if (!candidate) {
    const error: any = new Error('The saved run changed before Continue. Refresh and review the remaining work; no run was started.')
    error.statusCode = 409
    error.body = { code: 'saved_run_changed' }
    throw error
  }
  const exactModuleChainId = candidate.kind === 'module'
    ? intent.preparedRunPlanTransaction.requestId
    : undefined
  const exactModuleOnTerminal = exactModuleChainId
    ? exactModuleContinuationOnTerminal(exactModuleChainId, intent.launchOptions?.onTerminal)
    : intent.launchOptions?.onTerminal
  try {
    return await deps.launch({
      ...intent.launchOptions,
      ...(exactModuleOnTerminal ? { onTerminal: exactModuleOnTerminal } : {}),
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
    // A standalone exact module still belongs to one logical frozen continuation. Mark it as a one-child
    // chain so readiness loads the retained generation once, auto-continues every non-empty degraded result,
    // and can never fall back to the standalone live-data/human-decision path. The durable request id makes
    // this identity restart-stable and shared with the at-most-once admission claim.
    ...(candidate.kind === 'module' ? {
      chained: true,
      chainId: intent.preparedRunPlanTransaction.requestId,
    } : {}),
    // Continue is evidence-generation preserving by definition. A missing frozen receipt must fail before
    // readiness/provider spend; it may never fall back to a fresh read of the live data pool.
    requireExistingFrozenPoolReceipt: true,
      preparedRunPlanTransaction: intent.preparedRunPlanTransaction,
    })
  } catch (error) {
    // A synchronous/pre-ACK launch failure has no tracked RunState whose terminal callback can fire. No paid
    // child exists, so release the borrowed frozen-readiness capability here; transaction rollback remains
    // owned by the admission service above this boundary.
    if (exactModuleChainId) clearChainedReadiness(exactModuleChainId)
    throw error
  }
}

function selectionOf(intent: ExactContinuationIntent) {
  return {
    provider: intent.provider,
    model: intent.model,
    reasoningLevel: intent.reasoningLevel,
    expectedProfileKey: intent.expectedProfileKey,
  }
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

/** Derive the exact one-module filesystem/provider capability from the discovered roster and the reviewed
 * plan. The planner's counts alone are never authority: every reusable and payable orb identity is bound. */
export function exactModuleContinuationScope(
  plan: ThesisPlan,
  moduleName: string,
): ExactModuleContinuationScope {
  const node = buildSwarmGraph('research').modules.find((candidate) => candidate.name === moduleName)
  const entry = plan.modules.find((candidate) => candidate.module === moduleName)
  if (!node || node.exactResume !== true || !entry || !entry.runnable || entry.blockedBy.length > 0
      || !plan.run.includes(moduleName) || plan.exactModuleScope?.module !== moduleName) {
    throw continuationError(
      'module_scope_changed',
      'The exact saved module is no longer runnable with its reviewed inputs. Nothing was started.',
    )
  }
  const doneOrbKeys = [...entry.doneOrbKeys].sort()
  const done = new Set(doneOrbKeys)
  const agents = Object.values(node.layers).flat()
  const writableOrbs = agents
    .filter((agent) => !agent.isSynthesis && !done.has(agent.key))
    .map((agent) => agent.key.split('/').at(-1)!)
    .sort()
  const synthesisOrbs = agents
    .filter((agent) => agent.isSynthesis)
    .map((agent) => agent.key.split('/').at(-1)!)
    .sort()
  if (synthesisOrbs.length < 1
      || writableOrbs.length + synthesisOrbs.length !== entry.willRunAgents) {
    throw continuationError(
      'module_scope_changed',
      'The exact saved module orb roster changed. Nothing was started.',
    )
  }
  return {
    module: moduleName,
    savedInputs: [...plan.exactModuleScope.savedInputs].sort(),
    doneOrbKeys,
    writableOrbs,
    synthesisOrbs,
  }
}

function sameExactModuleScope(
  left: ExactModuleContinuationScope | undefined,
  right: ExactModuleContinuationScope | undefined,
): boolean {
  return !!left && !!right && left.module === right.module
    && sameStrings(left.savedInputs, right.savedInputs)
    && sameStrings(left.doneOrbKeys, right.doneOrbKeys)
    && sameStrings(left.writableOrbs, right.writableOrbs)
    && sameStrings(left.synthesisOrbs, right.synthesisOrbs)
}

/** Build the headless supervisor's reviewed v2 receipt before it enters the subject lock. This is only a
 * proposal: `admitExactSavedRunContinuation` rebuilds it under the lock immediately before the durable
 * claim and rejects every difference. */
export async function reviewExactSavedRunContinuation(
  intent: ExactContinuationIntent & { requestId: string },
  deps: Pick<ExactContinuationAdmissionDeps, 'resumable' | 'plan'> = defaultAdmissionDeps,
): Promise<ReviewedExactContinuation> {
  const candidate = exactContinuationCandidate(intent, deps.resumable())
  if (!candidate) {
    throw continuationError(
      'saved_run_changed',
      'The saved run changed before Continue. Nothing was started.',
    )
  }
  const plan = await deps.plan(
    candidate.subject,
    undefined,
    undefined,
    candidate.kind === 'module' ? candidate.module : undefined,
    selectionOf(intent),
    { continuationRunRoot: candidate.runRoot },
  )
  if (plan.complete) {
    throw continuationError('already_complete', 'This saved run is already complete. Nothing was started.')
  }
  if (plan.continuationReceipt.action !== 'continue'
      || plan.continuationReceipt.targetRunRoot !== candidate.runRoot) {
    throw continuationError('plan_changed', 'Continue did not resolve to the exact saved run. Nothing was started.')
  }
  const exactModule = candidate.kind === 'module' && candidate.module
    ? exactModuleContinuationScope(plan, candidate.module)
    : undefined
  return {
    requestId: intent.requestId,
    continuationReceipt: plan.continuationReceipt,
    reuse: [...plan.reuse],
    ...(exactModule ? { exactModule } : {}),
  }
}

/**
 * Exact continuation admission shared by browser/headless callers that already own the research subject lock.
 * The reviewed receipt is recomputed from disk, then one durable request claim owns one privately sanitized
 * root transaction. No caller can reach the launcher without that transaction, and no changed plan is allowed
 * to widen into a Full run.
 */
export async function admitExactSavedRunContinuation(
  intent: ExactContinuationIntent & { reviewed: ReviewedExactContinuation },
  deps: ExactContinuationAdmissionDeps = defaultAdmissionDeps,
): Promise<ExactContinuationAdmissionResult> {
  const user = intent.user ?? 'auto'
  const candidate = exactContinuationCandidate(intent, deps.resumable())
  if (!candidate) {
    throw continuationError('plan_changed', 'The exact saved run changed. Nothing was started.')
  }
  const plan = await deps.plan(
    candidate.subject,
    undefined,
    candidate.kind === 'module' ? undefined : intent.reviewed.reuse,
    candidate.kind === 'module' ? candidate.module : undefined,
    selectionOf(intent),
    { continuationRunRoot: candidate.runRoot },
  )
  if (!deps.receiptMatches(intent.reviewed.continuationReceipt, plan.continuationReceipt)
      || plan.continuationReceipt.action !== 'continue'
      || plan.targetRunRoot !== candidate.runRoot) {
    throw continuationError(
      'plan_changed',
      'The reviewed continuation plan changed. Nothing was started.',
    )
  }
  if (plan.complete) {
    throw continuationError('already_complete', 'This saved run is already complete. Nothing was started.')
  }
  const exactModule = candidate.kind === 'module' && candidate.module
    ? exactModuleContinuationScope(plan, candidate.module)
    : undefined
  if (candidate.kind === 'module' && !sameExactModuleScope(intent.reviewed.exactModule, exactModule)) {
    throw continuationError(
      'module_scope_changed',
      'The reviewed exact module inputs or payable orbs changed. Nothing was started.',
    )
  }

  const claim = await deps.claim({
    requestId: intent.reviewed.requestId,
    planFingerprint: plan.continuationReceipt.fingerprint,
    user,
    subject: candidate.subject,
  })
  if (claim.kind === 'conflict') {
    throw continuationError('request_reused', 'This request id belongs to a different reviewed plan.')
  }
  if (claim.kind === 'in_progress') {
    throw continuationError('request_in_progress', 'This exact Continue request is already being admitted.')
  }
  if (claim.kind === 'replay') {
    if (!claim.record.response) {
      throw continuationError(
        'request_in_progress',
        'This exact Continue request already crossed the paid-provider boundary and will not be retried.',
      )
    }
    return { response: claim.record.response, replay: true }
  }

  let transaction: PreparedRunPlanTransaction
  try {
    const prepare = intent.prepareTransaction ?? (exactModule && candidate.module
      ? async (requestId: string, subject: string, reviewedPlan: ThesisPlan, hooks: {
          onStarted: () => Promise<void>; onRolledBack: (reason: string) => Promise<void>
        }) => prepareRunPlanTransaction(requestId, subject, reviewedPlan, {
          ...hooks,
          prepare: (preparedSubject, preparedPlan, transactionDir) => {
            const prepared = prepareExactModuleContinuationPrivately(
              preparedSubject, candidate.module!, preparedPlan, transactionDir,
            )
            fs.writeFileSync(
              path.join(prepared.stagingRootAbs, '.aborted'),
              `${JSON.stringify({
                reason: 'exact_module_only', module: candidate.module, at: new Date().toISOString(),
              })}\n`,
              { encoding: 'utf8', mode: 0o600, flag: 'wx' },
            )
            return prepared
          },
        })
      : deps.prepare)
    transaction = await prepare(intent.reviewed.requestId, candidate.subject, plan, {
      onStarted: async () => { await deps.markStarted(intent.reviewed.requestId) },
      onRolledBack: async (reason) => { await deps.markFailed(intent.reviewed.requestId, reason) },
    })
  } catch (error: any) {
    try { await deps.markFailed(intent.reviewed.requestId, String(error?.message || error)) } catch {}
    throw Object.assign(
      new Error(`Could not prepare the saved work safely: ${String(error?.message || error)}`),
      { statusCode: 500, body: { code: 'continuation_prepare_failed' } },
    )
  }

  try {
    let admittedRunId: string | null = null
    const exactLaunchOptions: ExactContinuationIntent['launchOptions'] = exactModule && candidate.module
      ? {
          deferModuleMemo: true,
          exactModuleResume: true,
          exactModuleInputs: [...exactModule.savedInputs],
          exactModuleRunRoot: candidate.runRoot,
          exactModuleWritableOrbs: [...exactModule.writableOrbs],
          exactModuleSynthesisOrbs: [...exactModule.synthesisOrbs],
          preSpawnGuard: () => {
            try {
              const current = thesisPlanForScopeGuard(
                candidate.subject,
                undefined,
                undefined,
                candidate.module,
                selectionOf(intent),
                { continuationRunRoot: candidate.runRoot },
              )
              const currentScope = exactModuleContinuationScope(current, candidate.module!)
              return current.targetRunRoot === candidate.runRoot
                  && sameExactModuleScope(exactModule, currentScope)
                ? { ok: true as const }
                : {
                    ok: false as const,
                    reason: 'module_scope_changed',
                    message: 'The exact saved module changed before the engine started. Nothing was started.',
                  }
            } catch {
              return {
                ok: false as const,
                reason: 'module_scope_changed',
                message: 'The exact saved module changed before the engine started. Nothing was started.',
              }
            }
          },
          terminalGuard: async () => {
            const active = (admittedRunId ? getRun(admittedRunId) : undefined)
              ?? listRuns().find((run) => run.chainId === intent.reviewed.requestId
                && run.runRoot === candidate.runRoot && run.module === candidate.module)
            return active?.publicationCompleted === true
                && active.runRoot === candidate.runRoot && active.module === candidate.module
              ? { ok: true as const }
              : {
                  ok: false as const,
                  reason: 'module_publish_failed',
                  message: 'The exact module did not finish verified publication.',
                }
          },
        }
      : undefined
    const supplied = intent.launchOptions
    if (exactModule && supplied && (
      supplied.exactModuleResume !== true
      || supplied.exactModuleRunRoot !== candidate.runRoot
      || !sameStrings([...(supplied.exactModuleInputs ?? [])].sort(), exactModule.savedInputs)
      || !sameStrings([...(supplied.exactModuleWritableOrbs ?? [])].sort(), exactModule.writableOrbs)
      || !sameStrings([...(supplied.exactModuleSynthesisOrbs ?? [])].sort(), exactModule.synthesisOrbs)
    )) {
      throw continuationError('module_scope_changed', 'The exact module launch capability changed. Nothing was started.')
    }
    const launched = await continueExactSavedRun({
      ...intent,
      subject: candidate.subject,
      runRoot: candidate.runRoot,
      kind: candidate.kind === 'module' ? 'module' : 'full',
      module: candidate.module,
      preparedRunPlanTransaction: transaction,
      ...(exactModule ? {
        launchOptions: supplied ?? exactLaunchOptions,
      } : {}),
    }, deps)
    admittedRunId = launched.runId
    const response: Record<string, unknown> = {
      ...launched,
      requestId: intent.reviewed.requestId,
      planFingerprint: plan.continuationReceipt.fingerprint,
      carried: transaction.preparation.carried,
      reused: plan.reuse,
      willRun: plan.run,
      preparedDoneOrbKeys: transaction.preparation.doneOrbKeys,
      ranClean: transaction.preparation.ranClean,
    }
    await deps.markAdmitted(intent.reviewed.requestId, launched.runId, response)
    return { response, replay: false }
  } catch (error: any) {
    try { await transaction.rollbackIfUnstarted(String(error?.message || error)) } catch {}
    throw error
  }
}
