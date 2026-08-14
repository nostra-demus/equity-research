import { createHash, randomBytes } from 'node:crypto'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { canonicalJsonText } from './canonical-json'
import { REPO_ROOT } from './config'
import {
  localCommitBytes,
  localSavedResearchCommits,
  publishResearchPaths,
  publishedBytesEqual,
} from './git-publication'
import type { IntakePlan } from './intake'

const execFileAsync = promisify(execFile)

export const AUTOMATIC_INTAKE_OUTCOME_RECEIPT_VERSION = 'automatic-intake-outcome-receipt/1' as const
export const AUTOMATIC_INTAKE_OUTCOME_DIRECTORY = 'outcomes' as const

export type AutomaticIntakeOutcomeVerdict = 'note_only' | 'scoped_rerun' | 'insufficient'

export interface AutomaticIntakeOutcomeReceipt {
  schema_version: typeof AUTOMATIC_INTAKE_OUTCOME_RECEIPT_VERSION
  /** Full self-hash of every remaining canonical receipt field. */
  receipt_id: string
  /** Compact Calls identity, aligned with the legacy process-local recovery event. */
  event_id: string
  swarm: 'research'
  ticker: string
  run_root: string
  owner_key: string
  decision_fingerprint: string
  pool_newest_ms: number
  pool_fingerprint: string
  plan_path: string
  plan_sha256: string
  checked_at: string
  verdict: AutomaticIntakeOutcomeVerdict
  summary: string
  evidence_coverage_digest: string
  evidence_file_count: number
}

export interface StagedAutomaticIntakeOutcomeReceipt {
  receipt: AutomaticIntakeOutcomeReceipt
  repoPath: string
  bytes: Buffer
}

export interface AutomaticIntakeOutcomeReceiptInput {
  ticker: string
  swarm: string
  runRoot: string
  decisionFingerprint: string
  poolNewestMs: number
  plan: IntakePlan
}

interface PublicationDeps {
  isPublished: (repoPath: string, bytes: Buffer, repoRoot: string) => boolean
  candidates: (repoPaths: string[], repoRoot: string) => string[]
  commitBytes: (commit: string, repoPath: string, repoRoot: string) => Buffer | null
  publishSaved: (message: string, repoPaths: string[], sourceCommit: string, repoRoot: string) => Promise<void>
  commit: (message: string, repoPaths: string[], repoRoot: string) => Promise<void>
}

const RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/
const PLAN_RE = /^\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json$/
const SHA_RE = /^sha256:[a-f0-9]{64}$/
const CANONICAL_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const RECEIPT_KEYS = new Set([
  'schema_version', 'receipt_id', 'event_id', 'swarm', 'ticker', 'run_root', 'owner_key',
  'decision_fingerprint', 'pool_newest_ms', 'pool_fingerprint', 'plan_path', 'plan_sha256', 'checked_at', 'verdict', 'summary',
  'evidence_coverage_digest', 'evidence_file_count',
])

const sha256 = (value: string | Buffer): string =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`

/** Stable across machines and deliberately identical to auto-intake-status.ts's local outcome id. */
export function automaticIntakeOutcomeEventId(input: {
  ticker: string
  runRoot: string
  planPath: string
  planSha256: string
  decisionFingerprint: string
}): string {
  return sha256(`${input.ticker}\0${input.runRoot}\0${input.planPath}\0${input.planSha256}\0${input.decisionFingerprint}`)
    .slice(7, 31)
}

function ownerKey(input: Pick<AutomaticIntakeOutcomeReceiptInput, 'swarm' | 'ticker' | 'runRoot' | 'decisionFingerprint'>): string {
  return sha256(`${input.swarm}\0${input.ticker}\0${input.runRoot}\0${input.decisionFingerprint}`)
}

function poolFingerprint(owner: string, newestMs: number): string {
  return sha256(`${owner}\0${newestMs}`)
}

function normalizedVerdict(plan: IntakePlan): AutomaticIntakeOutcomeVerdict {
  if (plan.rerun_plan.commands.length > 0) return 'scoped_rerun'
  return plan.verdict === 'insufficient' ? 'insufficient' : 'note_only'
}

function normalizedSummary(value: unknown, verdict: AutomaticIntakeOutcomeVerdict): string {
  const normalized = typeof value === 'string'
    ? [...value.trim().replace(/\s+/g, ' ')].slice(0, 800).join('')
    : ''
  if (normalized) return normalized
  if (verdict === 'note_only') return 'Checked new data. The call did not change.'
  if (verdict === 'scoped_rerun') return 'Checked new data. The call is being updated.'
  return 'Checked new data. There was not enough proof to change the call.'
}

function exactKeys(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value)
  return keys.length === RECEIPT_KEYS.size && keys.every((key) => RECEIPT_KEYS.has(key))
}

function strictPlanReceipt(input: AutomaticIntakeOutcomeReceiptInput, now: number): AutomaticIntakeOutcomeReceipt | null {
  const run = RUN_RE.exec(input.runRoot)
  const plan = input.plan
  const newestMs = Math.floor(input.poolNewestMs)
  if (input.swarm !== 'research' || !run || run[1] !== input.ticker
      || plan.swarm !== input.swarm || plan.subject !== input.ticker || plan.ticker !== input.ticker
      || plan.run_root !== input.runRoot || plan.decision_fingerprint !== input.decisionFingerprint
      || !SHA_RE.test(input.decisionFingerprint) || !SHA_RE.test(plan.plan_sha256)
      || !plan.plan_path.startsWith(`${input.runRoot}/intake/`)
      || path.posix.dirname(plan.plan_path) !== `${input.runRoot}/intake`
      || !PLAN_RE.test(path.posix.basename(plan.plan_path))
      || !Number.isSafeInteger(newestMs) || newestMs <= 0
      // Keep this guard byte-for-byte aligned with intakePlanSafelyAccountsForPool(). The server calls
      // this only after that exported predicate succeeds; repeating its compact proof here prevents a
      // future caller from minting a shared success receipt from an audit-readable unsafe plan.
      || plan.coverage_complete !== true || plan.widened.length !== 0
      || (plan.actionable !== true && plan.consumed !== true)
      || !Array.isArray(plan.evidence_files) || !Array.isArray(plan.rerun_plan?.commands)) return null

  const scannedMs = typeof plan.scanned_at === 'string' ? Date.parse(plan.scanned_at) : NaN
  if (!Number.isFinite(scannedMs) || scannedMs > now || newestMs > scannedMs) return null
  const checkedAt = new Date(scannedMs).toISOString()
  if (!CANONICAL_UTC_RE.test(checkedAt)) return null

  const seenEvidence = new Set<string>()
  for (const row of plan.evidence_files) {
    if (!row || typeof row.path !== 'string' || !row.path.startsWith(`data/${input.ticker}/`)
        || path.posix.normalize(row.path) !== row.path || row.path.includes('\\')
        || !Number.isSafeInteger(row.arrival_ms) || row.arrival_ms < 0 || seenEvidence.has(row.path)) return null
    seenEvidence.add(row.path)
  }
  const evidenceDigest = sha256(canonicalJsonText(plan.evidence_files))
  const eventId = automaticIntakeOutcomeEventId({
    ticker: input.ticker,
    runRoot: input.runRoot,
    planPath: plan.plan_path,
    planSha256: plan.plan_sha256,
    decisionFingerprint: input.decisionFingerprint,
  })
  const verdict = normalizedVerdict(plan)
  const owner = ownerKey(input)
  const payload: Omit<AutomaticIntakeOutcomeReceipt, 'receipt_id'> = {
    schema_version: AUTOMATIC_INTAKE_OUTCOME_RECEIPT_VERSION,
    event_id: eventId,
    swarm: 'research',
    ticker: input.ticker,
    run_root: input.runRoot,
    owner_key: owner,
    decision_fingerprint: input.decisionFingerprint,
    pool_newest_ms: newestMs,
    pool_fingerprint: poolFingerprint(owner, newestMs),
    plan_path: plan.plan_path,
    plan_sha256: plan.plan_sha256,
    checked_at: checkedAt,
    verdict,
    summary: normalizedSummary(plan.summary, verdict),
    evidence_coverage_digest: evidenceDigest,
    evidence_file_count: plan.evidence_files.length,
  }
  return { ...payload, receipt_id: sha256(canonicalJsonText(payload)) }
}

export function automaticIntakeOutcomeReceiptRepoPath(receipt: AutomaticIntakeOutcomeReceipt): string {
  return `${receipt.run_root}/intake/${AUTOMATIC_INTAKE_OUTCOME_DIRECTORY}/${receipt.receipt_id.slice(7)}.json`
}

/** Parse only a server-authored receipt. This function never reads or reinterprets its raw intake plan. */
export function parseAutomaticIntakeOutcomeReceipt(
  bytes: Buffer,
  repoPath: string,
  now = Date.now(),
): AutomaticIntakeOutcomeReceipt | null {
  if (bytes.length < 2 || bytes.length > 64 * 1024) return null
  let raw: any
  try { raw = JSON.parse(bytes.toString('utf8')) } catch { return null }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !exactKeys(raw)
      || raw.schema_version !== AUTOMATIC_INTAKE_OUTCOME_RECEIPT_VERSION
      || !SHA_RE.test(raw.receipt_id) || !/^[a-f0-9]{24}$/.test(raw.event_id)
      || raw.swarm !== 'research' || !RUN_RE.test(raw.run_root)
      || RUN_RE.exec(raw.run_root)?.[1] !== raw.ticker
      || !SHA_RE.test(raw.owner_key) || !SHA_RE.test(raw.decision_fingerprint)
      || !Number.isSafeInteger(raw.pool_newest_ms) || raw.pool_newest_ms <= 0
      || !SHA_RE.test(raw.pool_fingerprint)
      || typeof raw.plan_path !== 'string' || !raw.plan_path.startsWith(`${raw.run_root}/intake/`)
      || path.posix.dirname(raw.plan_path) !== `${raw.run_root}/intake`
      || !PLAN_RE.test(path.posix.basename(raw.plan_path)) || !SHA_RE.test(raw.plan_sha256)
      || typeof raw.checked_at !== 'string' || !CANONICAL_UTC_RE.test(raw.checked_at)
      || !Number.isFinite(Date.parse(raw.checked_at)) || Date.parse(raw.checked_at) > now
      || raw.pool_newest_ms > Date.parse(raw.checked_at)
      || !['note_only', 'scoped_rerun', 'insufficient'].includes(raw.verdict)
      || typeof raw.summary !== 'string' || !raw.summary || [...raw.summary].length > 800
      || normalizedSummary(raw.summary, raw.verdict) !== raw.summary
      || !SHA_RE.test(raw.evidence_coverage_digest)
      || !Number.isSafeInteger(raw.evidence_file_count) || raw.evidence_file_count < 0
      || automaticIntakeOutcomeReceiptRepoPath(raw) !== repoPath) return null
  if (!Buffer.from(`${canonicalJsonText(raw)}\n`, 'utf8').equals(bytes)) return null
  const expectedEventId = automaticIntakeOutcomeEventId({
    ticker: raw.ticker,
    runRoot: raw.run_root,
    planPath: raw.plan_path,
    planSha256: raw.plan_sha256,
    decisionFingerprint: raw.decision_fingerprint,
  })
  const expectedOwner = ownerKey({
    swarm: raw.swarm,
    ticker: raw.ticker,
    runRoot: raw.run_root,
    decisionFingerprint: raw.decision_fingerprint,
  } as AutomaticIntakeOutcomeReceiptInput)
  const payload = { ...raw }
  delete payload.receipt_id
  if (raw.receipt_id !== sha256(canonicalJsonText(payload)) || raw.event_id !== expectedEventId
      || raw.owner_key !== expectedOwner
      || raw.pool_fingerprint !== poolFingerprint(expectedOwner, raw.pool_newest_ms)) return null
  return raw as AutomaticIntakeOutcomeReceipt
}

function containedOutcomeDirectory(runRoot: string, repoRoot: string, create: boolean): string | null {
  const realRepo = fs.realpathSync(repoRoot)
  const run = path.join(realRepo, ...runRoot.split('/'))
  const runStat = fs.lstatSync(run)
  if (!runStat.isDirectory() || runStat.isSymbolicLink() || fs.realpathSync(run) !== run) {
    throw new Error('automatic intake outcome run is unsafe')
  }
  const intake = path.join(run, 'intake')
  let intakeStat: fs.Stats
  try { intakeStat = fs.lstatSync(intake) } catch (error: any) {
    if (error?.code === 'ENOENT' && !create) return null
    throw error
  }
  if (!intakeStat.isDirectory() || intakeStat.isSymbolicLink() || fs.realpathSync(intake) !== intake) {
    throw new Error('automatic intake outcome directory is unsafe')
  }
  const outcomes = path.join(intake, AUTOMATIC_INTAKE_OUTCOME_DIRECTORY)
  if (create) {
    try { fs.mkdirSync(outcomes, { mode: 0o700 }) } catch (error: any) {
      if (error?.code !== 'EEXIST') throw error
    }
  } else {
    try { fs.lstatSync(outcomes) } catch (error: any) {
      if (error?.code === 'ENOENT') return null
      throw error
    }
  }
  const outcomeStat = fs.lstatSync(outcomes)
  if (!outcomeStat.isDirectory() || outcomeStat.isSymbolicLink() || fs.realpathSync(outcomes) !== outcomes
      || path.dirname(outcomes) !== intake) throw new Error('automatic intake outcome directory is unsafe')
  return outcomes
}

/** Atomically materialize one immutable receipt. Existing identical bytes are an idempotent success. */
export function stageAutomaticIntakeOutcomeReceipt(
  input: AutomaticIntakeOutcomeReceiptInput,
  options: { repoRoot?: string; now?: number } = {},
): StagedAutomaticIntakeOutcomeReceipt {
  const repoRoot = options.repoRoot ?? REPO_ROOT
  const receipt = strictPlanReceipt(input, options.now ?? Date.now())
  if (!receipt) throw new Error('automatic intake outcome lacks strict plan proof')
  const repoPath = automaticIntakeOutcomeReceiptRepoPath(receipt)
  const bytes = Buffer.from(`${canonicalJsonText(receipt)}\n`, 'utf8')
  const dir = containedOutcomeDirectory(input.runRoot, repoRoot, true)!
  const destination = path.join(dir, `${receipt.receipt_id.slice(7)}.json`)
  try {
    const existing = fs.lstatSync(destination)
    if (!existing.isFile() || existing.isSymbolicLink() || !fs.readFileSync(destination).equals(bytes)) {
      throw new Error('automatic intake outcome identity already has different bytes')
    }
    return { receipt, repoPath, bytes }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }

  const temp = path.join(dir, `.${receipt.event_id}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, bytes)
    fs.fsyncSync(fd)
    fs.closeSync(fd); fd = null
    try { fs.linkSync(temp, destination) } catch (error: any) {
      if (error?.code !== 'EEXIST') throw error
      const existing = fs.lstatSync(destination)
      if (!existing.isFile() || existing.isSymbolicLink() || !fs.readFileSync(destination).equals(bytes)) {
        throw new Error('automatic intake outcome identity already has different bytes')
      }
    }
    let dirFd: number | null = null
    try { dirFd = fs.openSync(dir, 'r'); fs.fsyncSync(dirFd) } finally { if (dirFd !== null) fs.closeSync(dirFd) }
  } finally {
    if (fd !== null) fs.closeSync(fd)
    try { fs.unlinkSync(temp) } catch {}
  }
  return { receipt, repoPath, bytes }
}

/**
 * Enumerate the append-only local journal independently of whichever intake plan is current now. A newer
 * plan can replace the plan that produced an unpublished receipt; scanning these immutable artifacts is
 * what keeps that older completed check recoverable without rerunning its model work.
 */
export function listLocalAutomaticIntakeOutcomeReceipts(
  input: { ticker: string; runRoot: string },
  options: { repoRoot?: string; now?: number } = {},
): StagedAutomaticIntakeOutcomeReceipt[] {
  const run = RUN_RE.exec(input.runRoot)
  if (!run || run[1] !== input.ticker) throw new Error('automatic intake outcome run is unsafe')
  const repoRoot = options.repoRoot ?? REPO_ROOT
  const dir = containedOutcomeDirectory(input.runRoot, repoRoot, false)
  if (!dir) return []
  const rows: StagedAutomaticIntakeOutcomeReceipt[] = []
  for (const name of fs.readdirSync(dir)) {
    // A SIGKILL can leave the private pre-link temp behind. It was never receipt authority and cannot
    // emit or publish; every other unknown entry poisons the append-only journal instead of being skipped.
    if (/^\.[a-f0-9]{24}\.\d+\.[a-f0-9]{12}\.tmp$/.test(name)) continue
    if (!/^[a-f0-9]{64}\.json$/.test(name)) throw new Error('automatic intake outcome journal is unsafe')
    const file = path.join(dir, name)
    const stat = fs.lstatSync(file)
    if (!stat.isFile() || stat.isSymbolicLink() || fs.realpathSync(file) !== file || path.dirname(file) !== dir
        || stat.size < 2 || stat.size > 64 * 1024) throw new Error('automatic intake outcome journal is unsafe')
    const bytes = fs.readFileSync(file)
    const repoPath = `${input.runRoot}/intake/${AUTOMATIC_INTAKE_OUTCOME_DIRECTORY}/${name}`
    const receipt = parseAutomaticIntakeOutcomeReceipt(bytes, repoPath, options.now ?? Date.now())
    if (!receipt || receipt.ticker !== input.ticker || receipt.run_root !== input.runRoot) {
      throw new Error('automatic intake outcome journal is damaged')
    }
    rows.push({ receipt, repoPath, bytes })
  }
  return rows.sort((a, b) => a.receipt.pool_newest_ms - b.receipt.pool_newest_ms
    || a.receipt.checked_at.localeCompare(b.receipt.checked_at)
    || a.receipt.receipt_id.localeCompare(b.receipt.receipt_id))
}

let commitRunner: PublicationDeps['commit'] = async (message, repoPaths, repoRoot) => {
  const script = path.join(repoRoot, 'scripts', 'commit-run.sh')
  await execFileAsync('bash', [script, message, '--', ...repoPaths], {
    cwd: repoRoot,
    timeout: 20 * 60_000,
    maxBuffer: 4 * 1024 * 1024,
  })
}

/** Deterministic test seam for a publication failure after the append-only receipt is durable. */
export function __setAutomaticIntakeOutcomeCommitRunner(next: PublicationDeps['commit']): PublicationDeps['commit'] {
  const previous = commitRunner
  commitRunner = next
  return previous
}

function productionPublicationDeps(): PublicationDeps {
  return {
    isPublished: (repoPath, bytes, repoRoot) => publishedBytesEqual(repoPath, bytes, repoRoot),
    candidates: localSavedResearchCommits,
    commitBytes: localCommitBytes,
    publishSaved: publishResearchPaths,
    commit: commitRunner,
  }
}

/**
 * Publish a staged receipt without any model work. If commit-run saved but could not push the receipt,
 * a later call replays that exact local commit through the path-confined publication helper. The receipt
 * file itself is the durable pending journal when no commit was made yet.
 */
export async function publishAutomaticIntakeOutcomeReceipt(
  staged: StagedAutomaticIntakeOutcomeReceipt,
  options: { repoRoot?: string; deps?: PublicationDeps } = {},
): Promise<void> {
  const repoRoot = options.repoRoot ?? REPO_ROOT
  const deps = options.deps ?? productionPublicationDeps()
  if (deps.isPublished(staged.repoPath, staged.bytes, repoRoot)) return

  const publishSavedCandidate = async (): Promise<boolean> => {
    for (const commit of deps.candidates([staged.repoPath], repoRoot)) {
      const committed = deps.commitBytes(commit, staged.repoPath, repoRoot)
      if (!committed?.equals(staged.bytes)) continue
      await deps.publishSaved(
        `Publish automatic intake outcome for ${staged.receipt.ticker}`,
        [staged.repoPath],
        commit,
        repoRoot,
      )
      if (!deps.isPublished(staged.repoPath, staged.bytes, repoRoot)) {
        throw new Error('automatic intake outcome publication was not visible in shared Git')
      }
      return true
    }
    return false
  }
  if (await publishSavedCandidate()) return

  let commitError: unknown = null
  try {
    await deps.commit(
      `Record automatic intake outcome for ${staged.receipt.ticker}`,
      [staged.repoPath],
      repoRoot,
    )
  } catch (error) { commitError = error }
  if (deps.isPublished(staged.repoPath, staged.bytes, repoRoot)) return
  // commit-run can fail only after it made a safe local data commit (for example a push outage). Recover
  // that exact commit immediately when possible; otherwise the unchanged receipt remains retryable.
  if (await publishSavedCandidate()) return
  throw commitError instanceof Error
    ? commitError
    : new Error('automatic intake outcome is waiting to be published')
}

/** Replay every locally durable outcome oldest-first, regardless of the latest plan version. */
export async function publishPendingAutomaticIntakeOutcomeReceipts(
  input: { ticker: string; runRoot: string },
  options: { repoRoot?: string; now?: number; deps?: PublicationDeps } = {},
): Promise<number> {
  const rows = listLocalAutomaticIntakeOutcomeReceipts(input, options)
  for (const row of rows) await publishAutomaticIntakeOutcomeReceipt(row, options)
  return rows.length
}

export async function ensureAutomaticIntakeOutcomeReceiptPublished(
  input: AutomaticIntakeOutcomeReceiptInput,
  options: { repoRoot?: string; now?: number; deps?: PublicationDeps } = {},
): Promise<StagedAutomaticIntakeOutcomeReceipt> {
  const staged = stageAutomaticIntakeOutcomeReceipt(input, options)
  await publishAutomaticIntakeOutcomeReceipt(staged, options)
  return staged
}
