import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT, STATE_DIR } from './config'
import { canonicalJsonText } from './canonical-json'
import {
  continuationPlanReceiptFingerprint,
  prepareThesisPlanPrivately,
  type PrivateThesisPlanPreparation,
  type ThesisPlan,
} from './completion'
import {
  abortProviderSpawnGate,
  createProviderSpawnGate,
  inspectProviderSpawnGate,
  type ProviderSpawnGate,
} from './provider-spawn-gate'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'

export interface PaidChildSpawnIdentity {
  runId: string
  providerAttemptId: string
  commandDigest: string
}

export interface PaidChildProcessProof {
  pid: number
  processStarted: string
  leaseSha256: string
}

export interface PreparedRunPlanTransaction {
  requestId: string
  preparation: PrivateThesisPlanPreparation
  /** Present only when startup reopened a previously-started chain. The scheduler must trust only these
   * terminally sealed module hashes when rebuilding its `done` set; a valid-looking file left by a killed
   * child is not proof of completion. */
  recoveredChainIntent?: ChainIntentJournal
  registerPaidChildAttempt(attemptId: string): void
  activate(): Promise<void>
  markPaidChildSpawning(attemptId: string, identity: PaidChildSpawnIdentity): Promise<ProviderSpawnGate>
  markPaidChildSpawnReady(attemptId: string, proof: PaidChildProcessProof): Promise<void>
  markPaidChildStarted(attemptId: string): Promise<void>
  beginChainIntent(input: ChainIntentStart): Promise<void>
  recordChainProgress(input: ChainIntentProgress): Promise<void>
  recordChainTerminal(status: 'done' | 'cancelled'): Promise<void>
  cancelChainIntent(input: ChainCancellationIdentity): Promise<void>
  /** Preserve an acknowledged exact plan outside the canonical analyses tree after a proved pre-spend
   * failure. This never authorizes a provider retry by itself; the protected record must be read,
   * revalidated, and explicitly rearmed by the supervisor under the subject lock. */
  deferPreSpendRetry(authority: PreSpendRetryAuthority): Promise<DeferredPreSpendRetryRecord>
  rollbackIfUnstarted(reason?: string, attemptId?: string): Promise<void>
}

export interface ChainIntentStart {
  chainId: string
  user: string
  userVia: 'cf-access' | 'local'
  selection: PreSpendRetryProfile
  modules: { module: string; dependsOn: string[]; synthesisOutputs: string[] }[]
  completed: { module: string; artifacts: { outputRel: string; sha256: string }[] }[]
  nextModules: string[]
}

export interface ChainIntentProgress {
  completed: { module: string; artifacts: { outputRel: string; sha256: string }[] }[]
  nextModules: string[]
  inflightModules: string[]
  masterState: 'pending' | 'ready' | 'launching' | 'running' | 'published' | 'failed'
}

export interface ChainCancellationIdentity {
  requestId: string
  chainId: string
  targetRunRoot: string
}

export interface ChainIntentJournal extends ChainIntentProgress {
  version: 1
  chainId: string
  user: string
  userVia: 'cf-access' | 'local'
  selection: PreSpendRetryProfile
  modules: ChainIntentStart['modules']
  startedAt: string
  progressAt: string
  terminalStatus: 'done' | 'cancelled' | null
  terminalAt: string | null
}

export interface RecoverableChainIntentRecord {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  reviewedPlan: ThesisPlan
  intent: ChainIntentJournal
  integritySha256: string
}

export interface CancelledChainIntentRecord {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  chainId: string
  cancelledAt: string
  integritySha256: string
}

export type PreSpendRetryReason =
  | 'technical_readiness_failed_before_spend'
  | 'provider_unavailable_before_spend'
  | 'provider_spawn_failed_before_spend'
  | 'engine_restarted_before_spend'

export interface PreSpendRetryAuthority {
  reason: PreSpendRetryReason
  /** Stable UUID used by the later paid-boundary gate. It is not a provider call and is distinct from
   * the immutable admission request id retained by the transaction. */
  recoveryRequestId: string
  provider: RunProvider
  model: string
  reasoningLevel: string | null
  profileKey: string
  executionProfile: ProviderExecutionProfile
  /** Number of bounded local readiness/spawn attempts already exhausted before deferral. */
  localAttempts: number
  /** Earliest wall-clock instant at which a supervisor may revalidate and rearm. There is no expiry. */
  notBeforeMs: number
}

export interface DeferredPreSpendRetryRecord {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  /** The complete reviewed v2 plan is retained rather than reconstructed later. It carries the exact
   * source roots, roster/payable identities, lineage, provider CAS, and frozen data-pool snapshot. */
  reviewedPlan: ThesisPlan
  preparation: Pick<PrivateThesisPlanPreparation, 'carried' | 'doneOrbKeys' | 'ranClean'>
  authority: PreSpendRetryAuthority
  deferredAt: string
  notBeforeMs: number
  rearmCount: number
  lastRearmedAt: string | null
  planSha256: string
  integritySha256: string
}

interface TransactionJournalV1 {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  status: 'prepared' | 'activating' | 'activated' | 'spawning' | 'started' | 'rolled_back'
  updatedAt: string
}

interface SpawnAttemptJournal extends PaidChildSpawnIdentity {
  attemptId: string
  gateId: string
  state: 'intent' | 'ready' | 'released'
  processProof?: PaidChildProcessProof
}

interface TransactionJournalV2 {
  version: 2
  requestId: string
  subject: string
  targetRunRoot: string
  status: 'prepared' | 'activating' | 'activated' | 'spawning' | 'started' | 'rolled_back'
  spawnAttempts: SpawnAttemptJournal[]
  updatedAt: string
}

interface TransactionJournalV3 {
  version: 3
  requestId: string
  subject: string
  targetRunRoot: string
  status:
    | 'prepared' | 'activating' | 'activated' | 'spawning' | 'started' | 'rolled_back'
    | 'deferring_pre_spend_retry' | 'waiting_pre_spend_retry' | 'rearming_pre_spend_retry'
  spawnAttempts: SpawnAttemptJournal[]
  reviewedPlan: ThesisPlan
  preparation: Pick<PrivateThesisPlanPreparation, 'carried' | 'doneOrbKeys' | 'ranClean'>
  preSpendRetry: Omit<DeferredPreSpendRetryRecord, 'integritySha256'> | null
  chainIntent: ChainIntentJournal | null
  updatedAt: string
  integritySha256: string
}

type TransactionJournal = TransactionJournalV1 | TransactionJournalV2 | TransactionJournalV3

export interface TransactionHooks {
  onStarted?: () => void | Promise<void>
  onRolledBack?: (reason: string) => void | Promise<void>
  /** Narrow internal seam for a reviewed module-only continuation. It must return the same private-root
   * preparation contract; activation/journaling/rollback remain owned by this transaction kernel. */
  prepare?: typeof prepareThesisPlanPrivately
}

export interface RearmDeferredPreSpendRetryInput {
  /** Exact record returned by list/read. Its integrity hash closes the read-to-rearm identity gap. */
  record: DeferredPreSpendRetryRecord
  /** Freshly recomputed under the subject lock from the original v2 receipt. It must be byte-exact. */
  revalidatedPlan: ThesisPlan
  /** Freshly resolved provider capability. Silent model/profile substitution is forbidden. */
  resolvedProfile: PreSpendRetryProfile
  /** Test seam only; production callers omit it. */
  nowMs?: number
}

export interface ResumeRecoverableChainIntentInput {
  record: RecoverableChainIntentRecord
  revalidatedPlan: ThesisPlan
  resolvedProfile: PreSpendRetryProfile
}

const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const RUN_ROOT = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/
const SHA256 = /^sha256:[0-9a-f]{64}$/
const PRE_SPEND_RETRY_REASONS = new Set<PreSpendRetryReason>([
  'technical_readiness_failed_before_spend',
  'provider_unavailable_before_spend',
  'provider_spawn_failed_before_spend',
  'engine_restarted_before_spend',
])

export type PreSpendRetryProfile = Pick<
  PreSpendRetryAuthority,
  'provider' | 'model' | 'reasoningLevel' | 'profileKey' | 'executionProfile'
>

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sha256Json(value: unknown): string {
  return `sha256:${crypto.createHash('sha256').update(canonicalJsonText(value)).digest('hex')}`
}

function withoutJournalIntegrity(journal: TransactionJournalV3): Omit<TransactionJournalV3, 'integritySha256'> {
  const { integritySha256: _ignored, ...unsigned } = journal
  return unsigned
}

function journalIntegrity(journal: TransactionJournalV3): string {
  return sha256Json(withoutJournalIntegrity(journal))
}

function retryRecordIntegrity(record: Omit<DeferredPreSpendRetryRecord, 'integritySha256'>): string {
  return sha256Json(record)
}

function validExecutionProfile(value: unknown, profileKey: string, model: string, reasoningLevel: string | null): value is ProviderExecutionProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const profile = value as Record<string, unknown>
  const allowed = new Set(['key', 'parentModel', 'parentReasoning', 'specialistModel', 'specialistReasoning'])
  if (Object.keys(profile).some((key) => !allowed.has(key)) || profile.key !== profileKey) return false
  for (const key of allowed) {
    if (profile[key] !== undefined && typeof profile[key] !== 'string') return false
  }
  return profile.parentModel === model
    && (profile.parentReasoning ?? null) === reasoningLevel
}

function validRetryProfile(value: unknown): value is PreSpendRetryProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const profile = value as PreSpendRetryProfile
  return (profile.provider === 'claude' || profile.provider === 'codex')
    && typeof profile.model === 'string' && profile.model.length > 0 && profile.model.length <= 200
    && (profile.reasoningLevel === null
      || (typeof profile.reasoningLevel === 'string' && profile.reasoningLevel.length <= 100))
    && typeof profile.profileKey === 'string' && profile.profileKey.length > 0 && profile.profileKey.length <= 300
    && validExecutionProfile(
      profile.executionProfile, profile.profileKey, profile.model, profile.reasoningLevel,
    )
}

function validRetryAuthority(value: unknown): value is PreSpendRetryAuthority {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const authority = value as PreSpendRetryAuthority
  return PRE_SPEND_RETRY_REASONS.has(authority.reason)
    && REQUEST_ID.test(String(authority.recoveryRequestId))
    && Number.isSafeInteger(authority.localAttempts) && authority.localAttempts >= 1
    && Number.isSafeInteger(authority.notBeforeMs) && authority.notBeforeMs >= 0
    && validRetryProfile(authority)
}

function validPreparationSnapshot(value: unknown): value is DeferredPreSpendRetryRecord['preparation'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const preparation = value as DeferredPreSpendRetryRecord['preparation']
  return Array.isArray(preparation.carried)
    && preparation.carried.every((entry) => entry && typeof entry.module === 'string'
      && RUN_ROOT.test(String(entry.from)))
    && Array.isArray(preparation.doneOrbKeys)
    && preparation.doneOrbKeys.every((key) => typeof key === 'string' && key.length > 0)
    && Array.isArray(preparation.ranClean)
    && preparation.ranClean.every((module) => typeof module === 'string' && module.length > 0)
}

function validReviewedPlan(value: unknown, subject: string, targetRunRoot: string): value is ThesisPlan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const plan = value as ThesisPlan
  const receipt = plan.continuationReceipt
  if (plan.moduleResumeVersion !== 2 || plan.swarm !== 'research' || plan.subject !== subject
      || plan.targetRunRoot !== targetRunRoot || !receipt || receipt.version !== 2
      || receipt.swarm !== plan.swarm || receipt.subject !== subject || receipt.targetRunRoot !== targetRunRoot
      || !['continue', 'complete'].includes(receipt.action) || !SHA256.test(String(receipt.fingerprint))) return false
  const { fingerprint: _fingerprint, ...payload } = receipt
  if (continuationPlanReceiptFingerprint(payload) !== receipt.fingerprint) return false
  if (!Array.isArray(receipt.sourceRunRoots) || !receipt.sourceRunRoots.every((root) => RUN_ROOT.test(root))
      || !Array.isArray(receipt.reusableOrbKeys) || !receipt.reusableOrbKeys.every((key) => typeof key === 'string')
      || !Array.isArray(receipt.payableOrbKeys) || !receipt.payableOrbKeys.every((key) => typeof key === 'string')
      || !receipt.dataPool || !Number.isSafeInteger(receipt.dataPool.files) || receipt.dataPool.files < 0
      || !Number.isFinite(receipt.dataPool.newestMs) || receipt.dataPool.newestMs < 0
      || !SHA256.test(String(receipt.dataPool.sha256))) return false
  if (!Array.isArray(plan.modules) || !Array.isArray(plan.reuse) || !Array.isArray(plan.run)
      || !Array.isArray(plan.carry) || !plan.dataPool
      || !Number.isSafeInteger(plan.dataPool.files) || plan.dataPool.files < 0
      || !Number.isFinite(plan.dataPool.newestMs) || plan.dataPool.newestMs < 0) return false
  return true
}

function validateAuthorityAgainstPlan(authority: PreSpendRetryAuthority, plan: ThesisPlan): void {
  const selected = plan.continuationReceipt.provider
  if (selected.id !== authority.provider || selected.model !== authority.model
      || selected.reasoningLevel !== authority.reasoningLevel || selected.profileKey !== authority.profileKey) {
    throw new Error('pre-spend retry provider/profile does not match the reviewed receipt')
  }
}

function validateProfileAgainstPlan(profile: PreSpendRetryProfile, plan: ThesisPlan): void {
  const selected = plan.continuationReceipt.provider
  if (selected.id !== profile.provider || selected.model !== profile.model
      || selected.reasoningLevel !== profile.reasoningLevel || selected.profileKey !== profile.profileKey) {
    throw new Error('chain provider/profile does not match the reviewed receipt')
  }
}

function chainModuleDeclarationsCanUpgrade(
  prior: ChainIntentStart['modules'],
  next: ChainIntentStart['modules'],
): boolean {
  return prior.length === next.length && prior.every((entry, index) => {
    const candidate = next[index]
    return candidate?.module === entry.module
      && canonicalJsonText(candidate.dependsOn) === canonicalJsonText(entry.dependsOn)
      && entry.synthesisOutputs.every((output) => candidate.synthesisOutputs.includes(output))
  })
}

function validChainIntent(value: unknown, plan: ThesisPlan): value is ChainIntentJournal {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const intent = value as ChainIntentJournal
  if (intent.version !== 1 || !REQUEST_ID.test(String(intent.chainId))
      || typeof intent.user !== 'string' || intent.user.length < 1 || intent.user.length > 320
      || !['cf-access', 'local'].includes(intent.userVia)
      || !validRetryProfile(intent.selection)
      || !Array.isArray(intent.modules) || !Array.isArray(intent.completed)
      || !Array.isArray(intent.nextModules) || !Array.isArray(intent.inflightModules)
      || !['pending', 'ready', 'launching', 'running', 'published', 'failed'].includes(intent.masterState)
      || typeof intent.startedAt !== 'string' || !Number.isFinite(Date.parse(intent.startedAt))
      || typeof intent.progressAt !== 'string' || !Number.isFinite(Date.parse(intent.progressAt))
      || ![null, 'done', 'cancelled'].includes(intent.terminalStatus)
      || (intent.terminalAt !== null
        && (typeof intent.terminalAt !== 'string' || !Number.isFinite(Date.parse(intent.terminalAt))))) return false
  try { validateProfileAgainstPlan(intent.selection, plan) } catch { return false }
  const moduleNames = new Set<string>()
  const outputs = new Map<string, Set<string>>()
  for (const entry of intent.modules) {
    if (!entry || typeof entry.module !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(entry.module)
        || moduleNames.has(entry.module) || !Array.isArray(entry.dependsOn)
        || !Array.isArray(entry.synthesisOutputs)) return false
    moduleNames.add(entry.module)
    const declared = new Set<string>()
    for (const output of entry.synthesisOutputs) {
      if (typeof output !== 'string' || output.includes('..') || path.isAbsolute(output)
          || !output.startsWith(`${entry.module}/`) || !output.endsWith('.md')) return false
      declared.add(output)
    }
    if (declared.size !== entry.synthesisOutputs.length) return false
    outputs.set(entry.module, declared)
  }
  if (intent.modules.some((entry) => entry.dependsOn.some((name) => !moduleNames.has(name)))) return false
  const completed = new Set<string>()
  for (const entry of intent.completed) {
    if (!entry || !moduleNames.has(entry.module) || completed.has(entry.module) || !Array.isArray(entry.artifacts)) return false
    completed.add(entry.module)
    if (entry.artifacts.length < 1 || entry.artifacts.some((artifact) =>
      !artifact || !outputs.get(entry.module)?.has(artifact.outputRel) || !SHA256.test(String(artifact.sha256)))) return false
  }
  const validModuleList = (items: string[]) => new Set(items).size === items.length
    && items.every((name) => moduleNames.has(name) && !completed.has(name))
  if (!validModuleList(intent.nextModules) || !validModuleList(intent.inflightModules)) return false
  if ((intent.terminalStatus === null) !== (intent.terminalAt === null)) return false
  return true
}

function profileOf(authority: PreSpendRetryAuthority): PreSpendRetryProfile {
  return {
    provider: authority.provider,
    model: authority.model,
    reasoningLevel: authority.reasoningLevel,
    profileKey: authority.profileKey,
    executionProfile: jsonClone(authority.executionProfile),
  }
}

function journalRoot(stateDir: string): string {
  return path.join(path.resolve(stateDir), 'run-plan-transactions')
}

function workspaceRoot(): string {
  return path.join(ANALYSES_DIR, '.run-plan-transactions')
}

function checkedRequestId(requestId: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error('invalid run-plan transaction id')
  return requestId.toLowerCase()
}

function journalDir(requestId: string, stateDir: string): string {
  return path.join(journalRoot(stateDir), checkedRequestId(requestId))
}

function workspaceDir(requestId: string): string {
  return path.join(workspaceRoot(), checkedRequestId(requestId))
}

function journalPath(directory: string): string {
  return path.join(directory, 'transaction.json')
}

async function pathEntryExists(target: string): Promise<boolean> {
  try { await fs.promises.lstat(target); return true } catch { return false }
}

async function safeDirectory(directory: string): Promise<boolean> {
  try {
    const info = await fs.promises.lstat(directory)
    return info.isDirectory() && !info.isSymbolicLink()
  } catch {
    return false
  }
}

async function ensurePrivateDirectory(directory: string, label: string): Promise<void> {
  if (await pathEntryExists(directory)) {
    if (!await safeDirectory(directory)) throw new Error(`${label} is unsafe`)
  } else {
    await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 })
    if (!await safeDirectory(directory)) throw new Error(`${label} is unsafe`)
  }
  await fs.promises.chmod(directory, 0o700)
}

async function syncDirectory(directory: string): Promise<void> {
  if (process.platform === 'win32') return
  const handle = await fs.promises.open(directory, fs.constants.O_RDONLY)
  try { await handle.sync() } finally { await handle.close() }
}

async function assertCanonicalTargetSafe(targetAbs: string): Promise<void> {
  const analysesReal = await fs.promises.realpath(ANALYSES_DIR)
  const parentReal = await fs.promises.realpath(path.dirname(targetAbs))
  if (parentReal !== analysesReal) throw new Error('run-plan target parent escaped analyses')
  if (!await pathEntryExists(targetAbs)) return
  const info = await fs.promises.lstat(targetAbs)
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('run-plan target is not a real directory')
  const targetReal = await fs.promises.realpath(targetAbs)
  if (!targetReal.startsWith(`${analysesReal}${path.sep}`)) throw new Error('run-plan target escaped analyses')
}

async function writeJournal(directory: string, journal: TransactionJournal): Promise<TransactionJournal> {
  if (!await safeDirectory(directory)) throw new Error('run-plan transaction journal directory is unsafe')
  const target = journalPath(directory)
  const staged = path.join(directory, `.transaction.${process.pid}.${crypto.randomUUID()}.tmp`)
  const updated = { ...journal, updatedAt: new Date().toISOString() } as TransactionJournal
  const next: TransactionJournal = updated.version === 3
    ? { ...updated, integritySha256: journalIntegrity(updated) }
    : updated
  const handle = await fs.promises.open(staged, 'wx', 0o600)
  try {
    await handle.writeFile(`${JSON.stringify(next, null, 2)}\n`, 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  await fs.promises.rename(staged, target)
  await syncDirectory(directory)
  return next
}

async function readJournal(directory: string): Promise<TransactionJournal | null> {
  try {
    if (!await safeDirectory(directory)) return null
    const target = journalPath(directory)
    const info = await fs.promises.lstat(target)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0) return null
    const value = JSON.parse(await fs.promises.readFile(target, 'utf8')) as TransactionJournal
    if (![1, 2, 3].includes(Number(value?.version)) || !REQUEST_ID.test(String(value.requestId))
        || !RUN_ROOT.test(String(value.targetRunRoot))
        || ![
          'prepared', 'activating', 'activated', 'spawning', 'started', 'rolled_back',
          'deferring_pre_spend_retry', 'waiting_pre_spend_retry', 'rearming_pre_spend_retry',
        ].includes(String(value.status))) return null
    if ((value.version === 2 || value.version === 3) && (!Array.isArray(value.spawnAttempts) || !value.spawnAttempts.every((attempt) =>
      typeof attempt?.attemptId === 'string' && attempt.attemptId.length > 0 && attempt.attemptId.length <= 200
      && REQUEST_ID.test(String(attempt.runId)) && REQUEST_ID.test(String(attempt.providerAttemptId))
      && REQUEST_ID.test(String(attempt.gateId)) && SHA256.test(String(attempt.commandDigest))
      && ['intent', 'ready', 'released'].includes(String(attempt.state))
      && (attempt.processProof === undefined || (
        Number.isSafeInteger(attempt.processProof.pid) && attempt.processProof.pid > 1
        && typeof attempt.processProof.processStarted === 'string' && attempt.processProof.processStarted.length > 0
        && SHA256.test(String(attempt.processProof.leaseSha256))
      ))
    ))) return null
    if (value.version === 3) {
      if (!SHA256.test(String(value.integritySha256)) || journalIntegrity(value) !== value.integritySha256
          || !validReviewedPlan(value.reviewedPlan, value.subject, value.targetRunRoot)
          || !validPreparationSnapshot(value.preparation)) return null
      if (value.preSpendRetry !== null) {
        const retry = value.preSpendRetry
        if (retry.version !== 1 || retry.requestId !== value.requestId || retry.subject !== value.subject
            || retry.targetRunRoot !== value.targetRunRoot
            || !validReviewedPlan(retry.reviewedPlan, value.subject, value.targetRunRoot)
            || canonicalJsonText(retry.reviewedPlan) !== canonicalJsonText(value.reviewedPlan)
            || !validPreparationSnapshot(retry.preparation)
            || canonicalJsonText(retry.preparation) !== canonicalJsonText(value.preparation)
            || !validRetryAuthority(retry.authority)
            || retry.notBeforeMs !== retry.authority.notBeforeMs
            || !Number.isSafeInteger(retry.rearmCount) || retry.rearmCount < 0
            || typeof retry.deferredAt !== 'string' || !Number.isFinite(Date.parse(retry.deferredAt))
            || (retry.lastRearmedAt !== null
              && (typeof retry.lastRearmedAt !== 'string' || !Number.isFinite(Date.parse(retry.lastRearmedAt))))
            || retry.planSha256 !== sha256Json(retry.reviewedPlan)) return null
        try { validateAuthorityAgainstPlan(retry.authority, retry.reviewedPlan) } catch { return null }
      } else if (['deferring_pre_spend_retry', 'waiting_pre_spend_retry', 'rearming_pre_spend_retry'].includes(value.status)) {
        return null
      }
      if (value.chainIntent !== null && !validChainIntent(value.chainIntent, value.reviewedPlan)) return null
    }
    return value
  } catch {
    return null
  }
}

async function removeTreeInside(directory: string, target: string): Promise<void> {
  const base = path.resolve(directory)
  const resolved = path.resolve(target)
  if (!resolved.startsWith(`${base}${path.sep}`)) throw new Error('transaction cleanup escaped its directory')
  if (await pathEntryExists(resolved)) await fs.promises.rm(resolved, { recursive: true, force: true })
}

type SpawnBoundary = 'unstarted' | 'released' | 'ambiguous'

function spawnBoundary(journal: TransactionJournal, stateDir: string): SpawnBoundary {
  if (journal.status === 'started') return 'released'
  if (journal.status !== 'spawning') return 'unstarted'
  // V1 wrote `spawning` both before and after execa and carried no discoverable child identity. It is
  // permanently ambiguous and therefore remains fail-closed. V2 can prove that every trampoline is still
  // gated/aborted, or that at least one gate was durably released.
  if (journal.version === 1 || journal.spawnAttempts.length === 0) return 'ambiguous'
  let result: SpawnBoundary = 'unstarted'
  for (const attempt of journal.spawnAttempts) {
    const gate = inspectProviderSpawnGate(attempt.gateId, stateDir)
    if (gate.state === 'released') {
      if (gate.intent.requestId !== journal.requestId || gate.intent.runId !== attempt.runId
          || gate.intent.attemptId !== attempt.attemptId
          || gate.intent.providerAttemptId !== attempt.providerAttemptId
          || gate.intent.runRoot !== journal.targetRunRoot
          || gate.intent.commandDigest !== attempt.commandDigest) return 'ambiguous'
      result = 'released'
      continue
    }
    if (gate.state === 'waiting' || gate.state === 'aborted') {
      if (gate.intent.requestId !== journal.requestId || gate.intent.runId !== attempt.runId
          || gate.intent.attemptId !== attempt.attemptId
          || gate.intent.providerAttemptId !== attempt.providerAttemptId
          || gate.intent.runRoot !== journal.targetRunRoot
          || gate.intent.commandDigest !== attempt.commandDigest) return 'ambiguous'
      continue
    }
    // Missing/unsafe gate state cannot prove the provider stayed blocked. Never retry it.
    return 'ambiguous'
  }
  return result
}

async function restoreUnstarted(workspace: string, journal: TransactionJournal, stateDir: string): Promise<void> {
  if (spawnBoundary(journal, stateDir) !== 'unstarted') {
    throw new Error('an attempted paid child may own this transaction; automatic rollback is unsafe')
  }
  const targetAbs = path.join(REPO_ROOT, journal.targetRunRoot)
  const backupAbs = path.join(workspace, 'previous-root')
  const preparedAbs = path.join(workspace, 'prepared-root')
  const displacedAbs = path.join(workspace, 'unstarted-root')
  const backupExists = await pathEntryExists(backupAbs)
  const preparedExists = await pathEntryExists(preparedAbs)
  const canonicalWasActivated = journal.status === 'activated' || journal.status === 'spawning'
    || (journal.status === 'activating' && (backupExists || !preparedExists))
  if (await pathEntryExists(targetAbs) && canonicalWasActivated) {
    if (await pathEntryExists(displacedAbs)) await removeTreeInside(workspace, displacedAbs)
    await fs.promises.rename(targetAbs, displacedAbs)
  }
  if (await pathEntryExists(backupAbs)) await fs.promises.rename(backupAbs, targetAbs)
  if (await pathEntryExists(displacedAbs)) await removeTreeInside(workspace, displacedAbs)
  if (await pathEntryExists(preparedAbs)) await removeTreeInside(workspace, preparedAbs)
}

/** Return an activated exact plan to its owner-only private workspace while restoring the canonical root
 * that existed before admission. The journal enters a deferring/rearming state before this function runs,
 * so every rename step is restart-idempotent. */
async function privatizePreSpendRetryTarget(
  workspace: string,
  journal: TransactionJournalV3,
  stateDir: string,
): Promise<'retained' | 'missing'> {
  if (spawnBoundary(journal, stateDir) !== 'unstarted') {
    throw new Error('a paid child may have started; pre-spend retry deferral is unsafe')
  }
  const targetAbs = path.join(REPO_ROOT, journal.targetRunRoot)
  const backupAbs = path.join(workspace, 'previous-root')
  const preparedAbs = path.join(workspace, 'prepared-root')
  await assertCanonicalTargetSafe(targetAbs)
  const targetExists = await pathEntryExists(targetAbs)
  const backupExists = await pathEntryExists(backupAbs)
  const preparedExists = await pathEntryExists(preparedAbs)

  // Layout before deferral: target=new, backup=old-or-absent, prepared=absent.
  // Layout after the first rename: target=absent, backup=old-or-absent, prepared=new.
  // Layout after restoration: target=old-or-absent, backup=absent, prepared=new.
  if (!preparedExists) {
    if (!targetExists) {
      if (backupExists) {
        await fs.promises.rename(backupAbs, targetAbs)
        await syncDirectory(path.dirname(targetAbs))
        await syncDirectory(workspace)
      }
      return 'missing'
    }
    await fs.promises.rename(targetAbs, preparedAbs)
    await syncDirectory(path.dirname(targetAbs))
    await syncDirectory(workspace)
  } else if (backupExists && targetExists) {
    throw new Error('pre-spend retry has both prior and canonical roots; refusing an ambiguous restore')
  }
  if (await pathEntryExists(backupAbs)) {
    if (await pathEntryExists(targetAbs)) throw new Error('cannot restore prior root over an existing target')
    await fs.promises.rename(backupAbs, targetAbs)
    await syncDirectory(path.dirname(targetAbs))
    await syncDirectory(workspace)
  }
  if (!await pathEntryExists(preparedAbs)) throw new Error('pre-spend retry private root was not retained')
  return 'retained'
}

export interface RunPlanTransactionRecovery {
  started: string[]
  rolledBack: string[]
  waitingPreSpendRetry: string[]
}

function abortUnreleasedSpawnAttempts(journal: TransactionJournal, stateDir: string): void {
  if (journal.version !== 2 && journal.version !== 3) return
  for (const attempt of journal.spawnAttempts) {
    try { abortProviderSpawnGate(attempt.gateId, stateDir) } catch { /* recovery retains unsafe state */ }
  }
}

/** Recover only transactions proven not to have crossed the paid-child spawn boundary, and return exact
 * request ids so the adjacent idempotency receipt is reconciled before any retry is accepted. */
export async function recoverRunPlanTransactions(stateDir: string = STATE_DIR): Promise<RunPlanTransactionRecovery> {
  const recovered: RunPlanTransactionRecovery = { started: [], rolledBack: [], waitingPreSpendRetry: [] }
  const root = journalRoot(stateDir)
  if (!await pathEntryExists(root)) return recovered
  if (!await safeDirectory(root)) throw new Error('run-plan transaction journal root is unsafe')
  for (const name of await fs.promises.readdir(root)) {
    if (!REQUEST_ID.test(name)) continue
    const journalDirectory = path.join(root, name)
    const journal = await readJournal(journalDirectory)
    if (!journal) continue
    const workspace = workspaceDir(name)
    const boundary = spawnBoundary(journal, stateDir)
    if (journal.status === 'started' || boundary === 'released' || boundary === 'ambiguous') {
      abortUnreleasedSpawnAttempts(journal, stateDir)
      if (await pathEntryExists(workspace)) {
        await removeTreeInside(workspace, path.join(workspace, 'previous-root'))
        await removeTreeInside(workspace, path.join(workspace, 'prepared-root'))
      }
      if (journal.status !== 'started') {
        await writeJournal(journalDirectory, { ...journal, status: 'started' })
      }
      recovered.started.push(journal.requestId)
      continue
    }
    if (journal.version === 3 && journal.chainIntent?.terminalStatus === 'cancelled') {
      if (await pathEntryExists(workspace)) await restoreUnstarted(workspace, journal, stateDir)
      abortUnreleasedSpawnAttempts(journal, stateDir)
      await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
      recovered.rolledBack.push(journal.requestId)
      continue
    }
    if (journal.version === 3 && journal.chainIntent?.terminalStatus === null && !journal.preSpendRetry) {
      if (!await safeDirectory(workspace)) {
        throw new Error(`full-chain transaction workspace is unsafe: ${journal.requestId}`)
      }
      const nowMs = Date.now()
      const authority: PreSpendRetryAuthority = {
        reason: 'engine_restarted_before_spend',
        recoveryRequestId: journal.chainIntent.chainId,
        ...jsonClone(journal.chainIntent.selection),
        localAttempts: 1,
        notBeforeMs: nowMs,
      }
      validateAuthorityAgainstPlan(authority, journal.reviewedPlan)
      const retry: Omit<DeferredPreSpendRetryRecord, 'integritySha256'> = {
        version: 1,
        requestId: journal.requestId,
        subject: journal.subject,
        targetRunRoot: journal.targetRunRoot,
        reviewedPlan: jsonClone(journal.reviewedPlan),
        preparation: jsonClone(journal.preparation),
        authority,
        deferredAt: new Date(nowMs).toISOString(),
        notBeforeMs: nowMs,
        rearmCount: 0,
        lastRearmedAt: null,
        planSha256: sha256Json(journal.reviewedPlan),
      }
      const deferring = await writeJournal(journalDirectory, {
        ...journal,
        status: 'deferring_pre_spend_retry',
        preSpendRetry: retry,
      }) as TransactionJournalV3
      abortUnreleasedSpawnAttempts(deferring, stateDir)
      if (await privatizePreSpendRetryTarget(workspace, deferring, stateDir) === 'missing') {
        await writeJournal(journalDirectory, { ...deferring, status: 'rolled_back' })
        recovered.rolledBack.push(journal.requestId)
        continue
      }
      await writeJournal(journalDirectory, { ...deferring, status: 'waiting_pre_spend_retry' })
      recovered.waitingPreSpendRetry.push(journal.requestId)
      continue
    }
    if (journal.version === 3 && journal.preSpendRetry) {
      if (!await safeDirectory(workspace)) {
        throw new Error(`pre-spend retry workspace is unsafe: ${journal.requestId}`)
      }
      abortUnreleasedSpawnAttempts(journal, stateDir)
      if (await privatizePreSpendRetryTarget(workspace, journal, stateDir) === 'missing') {
        await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
        recovered.rolledBack.push(journal.requestId)
        continue
      }
      if (journal.status !== 'waiting_pre_spend_retry') {
        await writeJournal(journalDirectory, { ...journal, status: 'waiting_pre_spend_retry' })
      }
      recovered.waitingPreSpendRetry.push(journal.requestId)
      continue
    }
    if (await pathEntryExists(workspace)) await restoreUnstarted(workspace, journal, stateDir)
    abortUnreleasedSpawnAttempts(journal, stateDir)
    await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
    recovered.rolledBack.push(journal.requestId)
  }
  return recovered
}

function deferredRecordFromJournal(journal: TransactionJournalV3): DeferredPreSpendRetryRecord {
  if (!journal.preSpendRetry) throw new Error('transaction has no deferred pre-spend retry')
  const unsigned = jsonClone(journal.preSpendRetry)
  return { ...unsigned, integritySha256: retryRecordIntegrity(unsigned) }
}

function assertDeferredRecordIntegrity(record: DeferredPreSpendRetryRecord): void {
  const { integritySha256, ...unsigned } = record
  if (!SHA256.test(String(integritySha256)) || retryRecordIntegrity(unsigned) !== integritySha256) {
    throw new Error('deferred pre-spend retry record was altered')
  }
}

/** Read one exact protected pre-spend retry. Unsafe/tampered state fails closed instead of disappearing. */
export async function readDeferredPreSpendRetry(
  requestId: string,
  stateDir: string = STATE_DIR,
): Promise<DeferredPreSpendRetryRecord | null> {
  const directory = journalDir(requestId, stateDir)
  if (!await pathEntryExists(directory)) return null
  const journal = await readJournal(directory)
  if (!journal) throw new Error('deferred pre-spend retry journal is unsafe or altered')
  if (journal.version !== 3 || journal.status !== 'waiting_pre_spend_retry' || !journal.preSpendRetry
      || journal.chainIntent?.terminalStatus === 'cancelled') return null
  const workspace = workspaceDir(journal.requestId)
  const preparedAbs = path.join(workspace, 'prepared-root')
  if (!await safeDirectory(workspace) || !await safeDirectory(preparedAbs)) {
    throw new Error('deferred pre-spend retry private root is unsafe or missing')
  }
  return deferredRecordFromJournal(journal)
}

/** List only retryable protected intents. A corrupt transaction is an operator-visible failure, never an
 * excuse to reconstruct current Full scope or silently drop the acknowledged request. */
export async function listDeferredPreSpendRetries(
  stateDir: string = STATE_DIR,
): Promise<DeferredPreSpendRetryRecord[]> {
  const root = journalRoot(stateDir)
  if (!await pathEntryExists(root)) return []
  if (!await safeDirectory(root)) throw new Error('run-plan transaction journal root is unsafe')
  const records: DeferredPreSpendRetryRecord[] = []
  for (const name of (await fs.promises.readdir(root)).sort()) {
    if (!REQUEST_ID.test(name)) continue
    const directory = path.join(root, name)
    const journal = await readJournal(directory)
    if (!journal) throw new Error(`run-plan transaction journal is unsafe or altered: ${name}`)
    if (journal.version !== 3 || journal.status !== 'waiting_pre_spend_retry' || !journal.preSpendRetry
        || journal.chainIntent?.terminalStatus === 'cancelled') continue
    const record = await readDeferredPreSpendRetry(name, stateDir)
    if (record) records.push(record)
  }
  return records.sort((a, b) => a.deferredAt.localeCompare(b.deferredAt) || a.requestId.localeCompare(b.requestId))
}

function chainIntentRecordFromJournal(journal: TransactionJournalV3): RecoverableChainIntentRecord {
  if (!journal.chainIntent) throw new Error('transaction has no exact full-chain intent')
  const unsigned = jsonClone({
    version: 1 as const,
    requestId: journal.requestId,
    subject: journal.subject,
    targetRunRoot: journal.targetRunRoot,
    reviewedPlan: journal.reviewedPlan,
    intent: journal.chainIntent,
  })
  return { ...unsigned, integritySha256: sha256Json(unsigned) }
}

function assertChainIntentRecordIntegrity(record: RecoverableChainIntentRecord): void {
  const { integritySha256, ...unsigned } = record
  if (!SHA256.test(String(integritySha256)) || sha256Json(unsigned) !== integritySha256) {
    throw new Error('recoverable full-chain record was altered')
  }
}

/** A started chain remains recoverable until the terminal master publishes or the user explicitly cancels. */
export async function readRecoverableChainIntent(
  requestId: string,
  stateDir: string = STATE_DIR,
): Promise<RecoverableChainIntentRecord | null> {
  const directory = journalDir(requestId, stateDir)
  if (!await pathEntryExists(directory)) return null
  const journal = await readJournal(directory)
  if (!journal) throw new Error('full-chain transaction journal is unsafe or altered')
  if (journal.version !== 3 || journal.status !== 'started' || !journal.chainIntent
      || journal.chainIntent.terminalStatus !== null) return null
  return chainIntentRecordFromJournal(journal)
}

export async function listRecoverableChainIntents(
  stateDir: string = STATE_DIR,
): Promise<RecoverableChainIntentRecord[]> {
  const root = journalRoot(stateDir)
  if (!await pathEntryExists(root)) return []
  if (!await safeDirectory(root)) throw new Error('run-plan transaction journal root is unsafe')
  const records: RecoverableChainIntentRecord[] = []
  for (const name of (await fs.promises.readdir(root)).sort()) {
    if (!REQUEST_ID.test(name)) continue
    const record = await readRecoverableChainIntent(name, stateDir)
    if (record) records.push(record)
  }
  return records.sort((a, b) => a.intent.progressAt.localeCompare(b.intent.progressAt)
    || a.requestId.localeCompare(b.requestId))
}

function cancelledChainRecordFromJournal(journal: TransactionJournalV3): CancelledChainIntentRecord {
  if (journal.chainIntent?.terminalStatus !== 'cancelled' || !journal.chainIntent.terminalAt) {
    throw new Error('transaction has no durable chain cancellation')
  }
  const unsigned = jsonClone({
    version: 1 as const,
    requestId: journal.requestId,
    subject: journal.subject,
    targetRunRoot: journal.targetRunRoot,
    chainId: journal.chainIntent.chainId,
    cancelledAt: journal.chainIntent.terminalAt,
  })
  return { ...unsigned, integritySha256: sha256Json(unsigned) }
}

/** Durable cancellation authority remains queryable after the intent leaves every automatic recovery
 * lane, so startup can suppress legacy `.interrupted` markers without trusting mutable run-root bytes. */
export async function readCancelledChainIntent(
  requestId: string,
  stateDir: string = STATE_DIR,
): Promise<CancelledChainIntentRecord | null> {
  const directory = journalDir(requestId, stateDir)
  if (!await pathEntryExists(directory)) return null
  const journal = await readJournal(directory)
  if (!journal) throw new Error('cancelled full-chain transaction journal is unsafe or altered')
  if (journal.version !== 3 || journal.chainIntent?.terminalStatus !== 'cancelled') return null
  return cancelledChainRecordFromJournal(journal)
}

export async function listCancelledChainIntents(
  stateDir: string = STATE_DIR,
): Promise<CancelledChainIntentRecord[]> {
  const root = journalRoot(stateDir)
  if (!await pathEntryExists(root)) return []
  if (!await safeDirectory(root)) throw new Error('run-plan transaction journal root is unsafe')
  const records: CancelledChainIntentRecord[] = []
  for (const name of (await fs.promises.readdir(root)).sort()) {
    if (!REQUEST_ID.test(name)) continue
    const record = await readCancelledChainIntent(name, stateDir)
    if (record) records.push(record)
  }
  return records.sort((a, b) => a.cancelledAt.localeCompare(b.cancelledAt)
    || a.requestId.localeCompare(b.requestId))
}

interface InternalOpen {
  mode: 'pre_spend_rearm' | 'chain_recovery'
  journal: TransactionJournalV3
}

async function prepareRunPlanTransactionInternal(
  requestId: string,
  subject: string,
  plan: ThesisPlan,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
  open?: InternalOpen,
): Promise<PreparedRunPlanTransaction> {
  const journals = journalRoot(stateDir)
  const workspaces = workspaceRoot()
  await ensurePrivateDirectory(journals, 'run-plan transaction journal root')
  await ensurePrivateDirectory(workspaces, 'run-plan transaction workspace root')
  const journalDirectory = journalDir(requestId, stateDir)
  const workspace = workspaceDir(requestId)
  let preparation: PrivateThesisPlanPreparation
  let journal: TransactionJournal
  const reviewedPlan = jsonClone(plan)
  if (!validReviewedPlan(reviewedPlan, subject, reviewedPlan.targetRunRoot)) {
    throw new Error('run-plan transaction received an invalid reviewed v2 plan')
  }

  if (open?.mode === 'pre_spend_rearm') {
    if (!await safeDirectory(journalDirectory) || !await safeDirectory(workspace)) {
      throw new Error('deferred pre-spend retry directories are unsafe or missing')
    }
    const current = await readJournal(journalDirectory)
    if (!current || current.version !== 3 || current.status !== 'waiting_pre_spend_retry'
        || !current.preSpendRetry || current.integritySha256 !== open.journal.integritySha256) {
      throw new Error('deferred pre-spend retry changed before rearm')
    }
    const stagingRootAbs = path.join(workspace, 'prepared-root')
    if (!await safeDirectory(stagingRootAbs)) throw new Error('deferred pre-spend retry private root is unsafe or missing')
    preparation = {
      stagingRootAbs,
      targetRunRoot: current.targetRunRoot,
      carried: jsonClone(current.preparation.carried),
      doneOrbKeys: [...current.preparation.doneOrbKeys],
      ranClean: [...current.preparation.ranClean],
    }
    const now = new Date().toISOString()
    journal = await writeJournal(journalDirectory, {
      ...current,
      status: 'rearming_pre_spend_retry',
      reviewedPlan,
      preSpendRetry: {
        ...current.preSpendRetry,
        reviewedPlan,
        rearmCount: current.preSpendRetry.rearmCount + 1,
        lastRearmedAt: now,
      },
    })
  } else if (open?.mode === 'chain_recovery') {
    if (!await safeDirectory(journalDirectory) || !await safeDirectory(workspace)) {
      throw new Error('recoverable full-chain transaction directories are unsafe or missing')
    }
    const current = await readJournal(journalDirectory)
    if (!current || current.version !== 3 || current.status !== 'started' || !current.chainIntent
        || current.chainIntent.terminalStatus !== null
        || current.integritySha256 !== open.journal.integritySha256) {
      throw new Error('recoverable full-chain intent changed before reopen')
    }
    const targetRootAbs = path.join(REPO_ROOT, current.targetRunRoot)
    if (!await safeDirectory(targetRootAbs)) throw new Error('recoverable full-chain canonical root is unsafe or missing')
    preparation = {
      stagingRootAbs: targetRootAbs,
      targetRunRoot: current.targetRunRoot,
      carried: jsonClone(current.preparation.carried),
      doneOrbKeys: [...current.preparation.doneOrbKeys],
      ranClean: [...current.preparation.ranClean],
    }
    journal = current
  } else {
    if (await pathEntryExists(journalDirectory)) {
      if (!await safeDirectory(journalDirectory)) throw new Error('run-plan transaction journal directory is unsafe')
      const prior = await readJournal(journalDirectory)
      if (!prior) throw new Error('existing run-plan transaction is unreadable')
      if (prior.version === 3 && prior.preSpendRetry) {
        throw new Error('this request is waiting for an exact pre-spend retry; use the protected rearm API')
      }
      if (prior.status === 'started' || spawnBoundary(prior, stateDir) !== 'unstarted') {
        throw new Error('this request already crossed the paid provider boundary')
      }
      if (await pathEntryExists(workspace)) await restoreUnstarted(workspace, prior, stateDir)
      abortUnreleasedSpawnAttempts(prior, stateDir)
      await fs.promises.rm(journalDirectory, { recursive: true, force: true })
      if (await pathEntryExists(workspace)) await fs.promises.rm(workspace, { recursive: true, force: true })
    }
    await fs.promises.mkdir(journalDirectory, { mode: 0o700 })
    await fs.promises.mkdir(workspace, { mode: 0o700 })
    try {
      preparation = (hooks.prepare ?? prepareThesisPlanPrivately)(subject, reviewedPlan, workspace)
    } catch (error) {
      // Preparation has not published or spent anything. Do not strand an unreadable request directory that
      // makes the same durable request permanently unrecoverable after a local staging/sanitizer failure.
      await fs.promises.rm(workspace, { recursive: true, force: true })
      await fs.promises.rm(journalDirectory, { recursive: true, force: true })
      throw error
    }
    const preparationSnapshot = jsonClone({
      carried: preparation.carried,
      doneOrbKeys: preparation.doneOrbKeys,
      ranClean: preparation.ranClean,
    })
    journal = await writeJournal(journalDirectory, {
      version: 3,
      requestId: requestId.toLowerCase(),
      subject,
      targetRunRoot: preparation.targetRunRoot,
      status: 'prepared',
      spawnAttempts: [],
      reviewedPlan,
      preparation: preparationSnapshot,
      preSpendRetry: null,
      chainIntent: null,
      updatedAt: new Date().toISOString(),
      integritySha256: `sha256:${'0'.repeat(64)}`,
    })
  }

  const targetAbs = path.join(REPO_ROOT, preparation.targetRunRoot)
  const backupAbs = path.join(workspace, 'previous-root')
  const stagingDevice = (await fs.promises.lstat(preparation.stagingRootAbs)).dev
  const targetDevice = (await fs.promises.lstat(path.dirname(targetAbs))).dev
  if (stagingDevice !== targetDevice) {
    await fs.promises.rm(workspace, { recursive: true, force: true })
    await fs.promises.rm(journalDirectory, { recursive: true, force: true })
    throw new Error('private run-plan staging is not on the atomic target filesystem')
  }
  // One Continue request can fan out into several same-wave provider children. Keep every state change
  // behind one in-process mutex and name the child that owns it: a sibling that fails before spawn must
  // never rewind the canonical root while another sibling is at (or beyond) the paid spawn boundary.
  let operation: Promise<void> = Promise.resolve()
  const pendingAttempts = new Set<string>()
  const spawningAttempts = new Set<string>()
  let paidChildStarted = open?.mode === 'chain_recovery' || journal.status === 'started'
  let rollbackClosing = false

  const attempt = (value: string): string => {
    const id = String(value || '').trim()
    if (!id || id.length > 200) throw new Error('invalid paid-child attempt id')
    return id
  }
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const result = operation.then(work, work)
    operation = result.then(() => undefined, () => undefined)
    return result
  }

  const rollback = async (reason: string, attemptId?: string): Promise<void> => {
    if (paidChildStarted || journal.status === 'started' || journal.status === 'rolled_back') return
    // A released gate is the paid boundary even if the process died before the following journal write.
    // Never restore the root or authorize another attempt from that ambiguous post-release window.
    if (spawnBoundary(journal, stateDir) !== 'unstarted') return
    if (attemptId !== undefined) {
      const id = attempt(attemptId)
      pendingAttempts.delete(id)
      spawningAttempts.delete(id)
    }
    // A no-attempt rollback is a setup-level request. It may clean up only when no admitted child can
    // still cross the boundary. An attempt-specific rollback releases only that child and lets the last
    // proved-no-child owner perform the restore.
    if (pendingAttempts.size > 0 || spawningAttempts.size > 0) return
    // Close registration synchronously before the first restore await. A later launch that was not part
    // of the admitted wave must fail before provider work instead of entering a root being rolled back.
    rollbackClosing = true
    if (journal.status === 'spawning') {
      journal = await writeJournal(journalDirectory, { ...journal, status: 'activated' })
    }
    await restoreUnstarted(workspace, journal, stateDir)
    abortUnreleasedSpawnAttempts(journal, stateDir)
    journal = await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
    await hooks.onRolledBack?.(reason)
  }

  return {
    requestId: requestId.toLowerCase(),
    preparation,
    ...(open?.mode === 'chain_recovery' && journal.version === 3 && journal.chainIntent
      ? { recoveredChainIntent: jsonClone(journal.chainIntent) }
      : {}),
    registerPaidChildAttempt(attemptId) {
      const id = attempt(attemptId)
      if (rollbackClosing || journal.status === 'rolled_back') {
        throw new Error('run-plan transaction is already rolling back')
      }
      // Deliberately synchronous: launch() invokes this before its first await, so every same-wave sibling
      // is visible before any provider-availability rejection can schedule a rollback microtask.
      pendingAttempts.add(id)
    },
    async activate() {
      return serial(async () => {
        if (journal.status === 'activated' || journal.status === 'spawning' || journal.status === 'started') return
        const rearming = journal.status === 'rearming_pre_spend_retry'
        if (journal.status !== 'prepared' && !rearming) {
          throw new Error('run-plan transaction is no longer activatable')
        }
        if (!rearming) journal = await writeJournal(journalDirectory, { ...journal, status: 'activating' })
        let movedTarget = false
        try {
          await assertCanonicalTargetSafe(targetAbs)
          if (await pathEntryExists(targetAbs)) {
            if (await pathEntryExists(backupAbs)) throw new Error('run-plan backup already exists')
            await fs.promises.rename(targetAbs, backupAbs)
            movedTarget = true
          }
          await fs.promises.rename(preparation.stagingRootAbs, targetAbs)
        } catch (error) {
          if (movedTarget && await pathEntryExists(backupAbs) && !await pathEntryExists(targetAbs)) {
            await fs.promises.rename(backupAbs, targetAbs)
          }
          throw error
        }
        journal = await writeJournal(journalDirectory, { ...journal, status: 'activated' })
      })
    },
    async markPaidChildSpawning(attemptId, identity) {
      return serial(async () => {
        const id = attempt(attemptId)
        if (!pendingAttempts.has(id)) throw new Error('unregistered paid-child attempt')
        if (journal.status !== 'activated' && journal.status !== 'spawning' && journal.status !== 'started') {
          throw new Error('paid child spawning before prepared root activation')
        }
        if (!REQUEST_ID.test(identity.runId) || !REQUEST_ID.test(identity.providerAttemptId)
            || !SHA256.test(identity.commandDigest)) throw new Error('invalid paid-child spawn identity')
        if (journal.version !== 2 && journal.version !== 3) {
          throw new Error('legacy run-plan transaction cannot create a paid child')
        }
        const existing = journal.spawnAttempts.find((entry) => entry.attemptId === id)
        if (existing) throw new Error('paid-child attempt already owns a spawn gate')
        const gate = createProviderSpawnGate({
          requestId: journal.requestId,
          runId: identity.runId,
          attemptId: id,
          providerAttemptId: identity.providerAttemptId,
          runRoot: journal.targetRunRoot,
          commandDigest: identity.commandDigest,
        }, stateDir)
        spawningAttempts.add(id)
        try {
          journal = await writeJournal(journalDirectory, {
            ...journal,
            status: journal.status === 'started' ? 'started' : 'spawning',
            spawnAttempts: [...journal.spawnAttempts, {
              attemptId: id, gateId: gate.gateId, state: 'intent', ...identity,
            }],
          }) as TransactionJournalV2 | TransactionJournalV3
        } catch (error) {
          spawningAttempts.delete(id)
          try { abortProviderSpawnGate(gate.gateId, stateDir) } catch { /* original journal failure wins */ }
          throw error
        }
        return gate
      })
    },
    async markPaidChildSpawnReady(attemptId, proof) {
      return serial(async () => {
        const id = attempt(attemptId)
        if ((journal.version !== 2 && journal.version !== 3)
            || (journal.status !== 'spawning' && journal.status !== 'started')
            || !spawningAttempts.has(id)) {
          throw new Error('paid child process proof arrived before spawn intent was sealed')
        }
        if (!Number.isSafeInteger(proof.pid) || proof.pid <= 1 || !proof.processStarted
            || !SHA256.test(proof.leaseSha256)) throw new Error('invalid paid-child process proof')
        const index = journal.spawnAttempts.findIndex((entry) => entry.attemptId === id)
        if (index < 0 || journal.spawnAttempts[index].state !== 'intent') {
          throw new Error('paid-child spawn intent is missing or already consumed')
        }
        const spawnAttempts = journal.spawnAttempts.map((entry, entryIndex) => entryIndex === index
          ? { ...entry, state: 'ready' as const, processProof: { ...proof } }
          : entry)
        journal = await writeJournal(journalDirectory, { ...journal, spawnAttempts }) as TransactionJournalV2 | TransactionJournalV3
      })
    },
    async markPaidChildStarted(attemptId) {
      return serial(async () => {
        const id = attempt(attemptId)
        if ((journal.version !== 2 && journal.version !== 3)
            || (journal.status !== 'spawning' && journal.status !== 'started')
            || !spawningAttempts.has(id)) {
          throw new Error('paid child started before spawn boundary was sealed')
        }
        const index = journal.spawnAttempts.findIndex((entry) => entry.attemptId === id)
        const owned = index >= 0 ? journal.spawnAttempts[index] : null
        const gate = owned ? inspectProviderSpawnGate(owned.gateId, stateDir) : { state: 'missing' as const }
        if (!owned || owned.state !== 'ready' || gate.state !== 'released') {
          throw new Error('paid child started before its durable spawn gate was released')
        }
        const spawnAttempts = journal.spawnAttempts.map((entry, entryIndex) => entryIndex === index
          ? { ...entry, state: 'released' as const }
          : entry)
        const firstReleasedChild = !paidChildStarted
        journal = await writeJournal(journalDirectory, {
          ...journal, status: 'started', spawnAttempts,
        }) as TransactionJournalV2 | TransactionJournalV3
        paidChildStarted = true
        pendingAttempts.delete(id)
        spawningAttempts.delete(id)
        if (firstReleasedChild) {
          await hooks.onStarted?.()
          await removeTreeInside(workspace, backupAbs)
        }
      })
    },
    async beginChainIntent(inputValue) {
      return serial(async () => {
        if (journal.version !== 3) throw new Error('legacy transaction cannot retain a full-chain intent')
        const input = jsonClone(inputValue)
        const now = new Date().toISOString()
        const candidate: ChainIntentJournal = {
          version: 1,
          chainId: input.chainId,
          user: input.user,
          userVia: input.userVia,
          selection: input.selection,
          modules: input.modules,
          completed: input.completed,
          nextModules: input.nextModules,
          inflightModules: [],
          masterState: input.completed.length === input.modules.length ? 'ready' : 'pending',
          startedAt: now,
          progressAt: now,
          terminalStatus: null,
          terminalAt: null,
        }
        if (!validChainIntent(candidate, journal.reviewedPlan)) throw new Error('invalid exact full-chain intent')
        if (journal.chainIntent) {
          const stablePrior = {
            chainId: journal.chainIntent.chainId, user: journal.chainIntent.user,
            userVia: journal.chainIntent.userVia, selection: journal.chainIntent.selection,
          }
          const stableCandidate = {
            chainId: candidate.chainId, user: candidate.user, userVia: candidate.userVia,
            selection: candidate.selection,
          }
          if (canonicalJsonText(stablePrior) !== canonicalJsonText(stableCandidate)
              || journal.chainIntent.terminalStatus !== null
              || !chainModuleDeclarationsCanUpgrade(journal.chainIntent.modules, candidate.modules)) {
            throw new Error('full-chain intent changed or is already terminal')
          }
          if (canonicalJsonText(journal.chainIntent.modules) !== canonicalJsonText(candidate.modules)) {
            journal = await writeJournal(journalDirectory, {
              ...journal,
              chainIntent: { ...journal.chainIntent, modules: candidate.modules, progressAt: now },
            }) as TransactionJournalV3
          }
          return
        }
        journal = await writeJournal(journalDirectory, { ...journal, chainIntent: candidate }) as TransactionJournalV3
      })
    },
    async recordChainProgress(inputValue) {
      return serial(async () => {
        if (journal.version !== 3 || !journal.chainIntent || journal.chainIntent.terminalStatus !== null) {
          throw new Error('no active full-chain intent owns this progress')
        }
        const input = jsonClone(inputValue)
        const candidate: ChainIntentJournal = {
          ...journal.chainIntent,
          ...input,
          progressAt: new Date().toISOString(),
        }
        if (!validChainIntent(candidate, journal.reviewedPlan)) throw new Error('invalid exact full-chain progress')
        const nextCompleted = new Map(candidate.completed.map((entry) => [entry.module, entry]))
        for (const prior of journal.chainIntent.completed) {
          const retained = nextCompleted.get(prior.module)
          if (!retained || canonicalJsonText(retained) !== canonicalJsonText(prior)) {
            throw new Error(`full-chain progress changed completed evidence for ${prior.module}`)
          }
        }
        journal = await writeJournal(journalDirectory, { ...journal, chainIntent: candidate }) as TransactionJournalV3
      })
    },
    async recordChainTerminal(status) {
      return serial(async () => {
        if (journal.version !== 3 || !journal.chainIntent) throw new Error('no full-chain intent is active')
        if (journal.chainIntent.terminalStatus !== null) {
          if (journal.chainIntent.terminalStatus === status) return
          throw new Error('full-chain intent already has a different terminal result')
        }
        if (status === 'done' && journal.chainIntent.masterState !== 'published') {
          throw new Error('full-chain intent cannot finish before terminal master publication')
        }
        const now = new Date().toISOString()
        journal = await writeJournal(journalDirectory, {
          ...journal,
          chainIntent: {
            ...journal.chainIntent,
            terminalStatus: status,
            terminalAt: now,
            progressAt: now,
          },
        }) as TransactionJournalV3
      })
    },
    async cancelChainIntent(inputValue) {
      return serial(async () => {
        const input = jsonClone(inputValue)
        if (checkedRequestId(input.requestId) !== journal.requestId
            || !REQUEST_ID.test(String(input.chainId))
            || !RUN_ROOT.test(String(input.targetRunRoot))
            || input.targetRunRoot !== journal.targetRunRoot) {
          throw new Error('full-chain cancellation identity does not match this exact transaction')
        }
        if (journal.version !== 3 || !journal.chainIntent
            || journal.chainIntent.chainId !== input.chainId) {
          throw new Error('no matching full-chain intent can be cancelled')
        }
        if (journal.chainIntent.terminalStatus !== null) {
          if (journal.chainIntent.terminalStatus === 'cancelled') return
          throw new Error('full-chain intent already has a different terminal result')
        }
        const now = new Date().toISOString()
        journal = await writeJournal(journalDirectory, {
          ...journal,
          chainIntent: {
            ...journal.chainIntent,
            terminalStatus: 'cancelled',
            terminalAt: now,
            progressAt: now,
          },
        }) as TransactionJournalV3
      })
    },
    async deferPreSpendRetry(authorityInput) {
      return serial(async () => {
        if (journal.version !== 3) throw new Error('legacy transaction cannot retain an exact pre-spend retry')
        if (paidChildStarted || journal.status === 'started' || spawnBoundary(journal, stateDir) !== 'unstarted') {
          throw new Error('a paid child may have started; pre-spend retry deferral is forbidden')
        }
        const authority = jsonClone(authorityInput)
        if (!validRetryAuthority(authority)) throw new Error('invalid pre-spend retry authority')
        validateAuthorityAgainstPlan(authority, journal.reviewedPlan)
        rollbackClosing = true
        pendingAttempts.clear()
        spawningAttempts.clear()
        const priorRetry = journal.preSpendRetry
        const retry: Omit<DeferredPreSpendRetryRecord, 'integritySha256'> = {
          version: 1,
          requestId: journal.requestId,
          subject: journal.subject,
          targetRunRoot: journal.targetRunRoot,
          reviewedPlan: jsonClone(journal.reviewedPlan),
          preparation: jsonClone(journal.preparation),
          authority,
          deferredAt: priorRetry?.deferredAt ?? new Date().toISOString(),
          notBeforeMs: authority.notBeforeMs,
          rearmCount: priorRetry?.rearmCount ?? 0,
          lastRearmedAt: priorRetry?.lastRearmedAt ?? null,
          planSha256: sha256Json(journal.reviewedPlan),
        }
        journal = await writeJournal(journalDirectory, {
          ...journal,
          status: 'deferring_pre_spend_retry',
          preSpendRetry: retry,
        }) as TransactionJournalV3
        abortUnreleasedSpawnAttempts(journal, stateDir)
        if (await privatizePreSpendRetryTarget(workspace, journal, stateDir) === 'missing') {
          throw new Error('pre-spend retry lost both canonical and private prepared roots')
        }
        journal = await writeJournal(journalDirectory, {
          ...journal,
          status: 'waiting_pre_spend_retry',
        }) as TransactionJournalV3
        return deferredRecordFromJournal(journal)
      })
    },
    async rollbackIfUnstarted(reason = 'provider child did not start', attemptId) {
      return serial(() => rollback(reason, attemptId))
    },
  }
}

export async function prepareRunPlanTransaction(
  requestId: string,
  subject: string,
  plan: ThesisPlan,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
): Promise<PreparedRunPlanTransaction> {
  return prepareRunPlanTransactionInternal(requestId, subject, plan, hooks, stateDir)
}

/** Rearm the exact private transaction only after the caller recomputes the original receipt under the
 * subject lock and freshly resolves the same provider capability. This never rebuilds current Full scope. */
export async function rearmDeferredPreSpendRetry(
  input: RearmDeferredPreSpendRetryInput,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
): Promise<PreparedRunPlanTransaction> {
  assertDeferredRecordIntegrity(input.record)
  const stored = await readDeferredPreSpendRetry(input.record.requestId, stateDir)
  if (!stored || canonicalJsonText(stored) !== canonicalJsonText(input.record)) {
    throw new Error('deferred pre-spend retry changed before revalidation completed')
  }
  const revalidatedPlan = jsonClone(input.revalidatedPlan)
  if (!validReviewedPlan(revalidatedPlan, stored.subject, stored.targetRunRoot)
      || canonicalJsonText(revalidatedPlan) !== canonicalJsonText(stored.reviewedPlan)
      || sha256Json(revalidatedPlan) !== stored.planSha256) {
    throw new Error('pre-spend retry plan changed; refusing to widen or rebuild its scope')
  }
  const resolvedProfile = jsonClone(input.resolvedProfile)
  const candidateAuthority: PreSpendRetryAuthority = {
    ...stored.authority,
    ...resolvedProfile,
  }
  if (!validRetryAuthority(candidateAuthority)
      || canonicalJsonText(resolvedProfile) !== canonicalJsonText(profileOf(stored.authority))) {
    throw new Error('pre-spend retry provider capability changed')
  }
  const nowMs = input.nowMs ?? Date.now()
  if (!Number.isSafeInteger(nowMs) || nowMs < stored.notBeforeMs) {
    throw new Error('pre-spend retry is not due yet')
  }
  const journal = await readJournal(journalDir(stored.requestId, stateDir))
  if (!journal || journal.version !== 3 || journal.status !== 'waiting_pre_spend_retry'
      || !journal.preSpendRetry) throw new Error('deferred pre-spend retry is no longer waiting')
  return prepareRunPlanTransactionInternal(
    stored.requestId,
    stored.subject,
    revalidatedPlan,
    hooks,
    stateDir,
    { mode: 'pre_spend_rearm', journal },
  )
}

/** Reopen the existing started transaction kernel for the next exact child after a server restart. The
 * canonical root stays in place; the first paid boundary remains sealed and later children get new gates. */
export async function resumeRecoverableChainIntent(
  input: ResumeRecoverableChainIntentInput,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
): Promise<PreparedRunPlanTransaction> {
  assertChainIntentRecordIntegrity(input.record)
  const stored = await readRecoverableChainIntent(input.record.requestId, stateDir)
  if (!stored || canonicalJsonText(stored) !== canonicalJsonText(input.record)) {
    throw new Error('recoverable full-chain intent changed before revalidation completed')
  }
  const revalidatedPlan = jsonClone(input.revalidatedPlan)
  if (!validReviewedPlan(revalidatedPlan, stored.subject, stored.targetRunRoot)
      || canonicalJsonText(revalidatedPlan) !== canonicalJsonText(stored.reviewedPlan)) {
    throw new Error('recoverable full-chain plan changed; refusing to widen or rebuild its scope')
  }
  const resolvedProfile = jsonClone(input.resolvedProfile)
  if (!validRetryProfile(resolvedProfile)
      || canonicalJsonText(resolvedProfile) !== canonicalJsonText(stored.intent.selection)) {
    throw new Error('recoverable full-chain provider capability changed')
  }
  const journal = await readJournal(journalDir(stored.requestId, stateDir))
  if (!journal || journal.version !== 3 || journal.status !== 'started' || !journal.chainIntent
      || journal.chainIntent.terminalStatus !== null) throw new Error('full-chain intent is no longer recoverable')
  return prepareRunPlanTransactionInternal(
    stored.requestId,
    stored.subject,
    revalidatedPlan,
    hooks,
    stateDir,
    { mode: 'chain_recovery', journal },
  )
}
