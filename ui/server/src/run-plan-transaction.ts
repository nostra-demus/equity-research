import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT, STATE_DIR } from './config'
import { prepareThesisPlanPrivately, type PrivateThesisPlanPreparation, type ThesisPlan } from './completion'

export interface PreparedRunPlanTransaction {
  requestId: string
  preparation: PrivateThesisPlanPreparation
  activate(): Promise<void>
  markPaidChildSpawning(): Promise<void>
  markPaidChildStarted(): Promise<void>
  rollbackIfUnstarted(reason?: string): Promise<void>
}

interface TransactionJournal {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  status: 'prepared' | 'activating' | 'activated' | 'spawning' | 'started' | 'rolled_back'
  updatedAt: string
}

interface TransactionHooks {
  onStarted?: () => void | Promise<void>
  onRolledBack?: (reason: string) => void | Promise<void>
}

const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const RUN_ROOT = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/

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
  const next = { ...journal, updatedAt: new Date().toISOString() }
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
    if (value?.version !== 1 || !REQUEST_ID.test(String(value.requestId)) || !RUN_ROOT.test(String(value.targetRunRoot))
        || !['prepared', 'activating', 'activated', 'spawning', 'started', 'rolled_back'].includes(String(value.status))) return null
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

async function restoreUnstarted(workspace: string, journal: TransactionJournal): Promise<void> {
  if (journal.status === 'spawning' || journal.status === 'started') {
    throw new Error('an attempted paid child may own this transaction; automatic rollback is unsafe')
  }
  const targetAbs = path.join(REPO_ROOT, journal.targetRunRoot)
  const backupAbs = path.join(workspace, 'previous-root')
  const preparedAbs = path.join(workspace, 'prepared-root')
  const displacedAbs = path.join(workspace, 'unstarted-root')
  const backupExists = await pathEntryExists(backupAbs)
  const preparedExists = await pathEntryExists(preparedAbs)
  const canonicalWasActivated = journal.status === 'activated'
    || (journal.status === 'activating' && (backupExists || !preparedExists))
  if (await pathEntryExists(targetAbs) && canonicalWasActivated) {
    if (await pathEntryExists(displacedAbs)) await removeTreeInside(workspace, displacedAbs)
    await fs.promises.rename(targetAbs, displacedAbs)
  }
  if (await pathEntryExists(backupAbs)) await fs.promises.rename(backupAbs, targetAbs)
  if (await pathEntryExists(displacedAbs)) await removeTreeInside(workspace, displacedAbs)
  if (await pathEntryExists(preparedAbs)) await removeTreeInside(workspace, preparedAbs)
}

export interface RunPlanTransactionRecovery {
  started: string[]
  rolledBack: string[]
}

/** Recover only transactions proven not to have crossed the paid-child spawn boundary, and return exact
 * request ids so the adjacent idempotency receipt is reconciled before any retry is accepted. */
export async function recoverRunPlanTransactions(stateDir: string = STATE_DIR): Promise<RunPlanTransactionRecovery> {
  const recovered: RunPlanTransactionRecovery = { started: [], rolledBack: [] }
  const root = journalRoot(stateDir)
  if (!await pathEntryExists(root)) return recovered
  if (!await safeDirectory(root)) throw new Error('run-plan transaction journal root is unsafe')
  for (const name of await fs.promises.readdir(root)) {
    if (!REQUEST_ID.test(name)) continue
    const journalDirectory = path.join(root, name)
    const journal = await readJournal(journalDirectory)
    if (!journal) continue
    const workspace = workspaceDir(name)
    if (journal.status === 'started') {
      if (await pathEntryExists(workspace)) {
        await removeTreeInside(workspace, path.join(workspace, 'previous-root'))
        await removeTreeInside(workspace, path.join(workspace, 'prepared-root'))
      }
      recovered.started.push(journal.requestId)
      continue
    }
    if (journal.status === 'spawning') {
      recovered.started.push(journal.requestId)
      continue
    }
    if (await pathEntryExists(workspace)) await restoreUnstarted(workspace, journal)
    await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
    recovered.rolledBack.push(journal.requestId)
  }
  return recovered
}

export async function prepareRunPlanTransaction(
  requestId: string,
  subject: string,
  plan: ThesisPlan,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
): Promise<PreparedRunPlanTransaction> {
  const journals = journalRoot(stateDir)
  const workspaces = workspaceRoot()
  await ensurePrivateDirectory(journals, 'run-plan transaction journal root')
  await ensurePrivateDirectory(workspaces, 'run-plan transaction workspace root')
  const journalDirectory = journalDir(requestId, stateDir)
  const workspace = workspaceDir(requestId)
  if (await pathEntryExists(journalDirectory)) {
    if (!await safeDirectory(journalDirectory)) throw new Error('run-plan transaction journal directory is unsafe')
    const prior = await readJournal(journalDirectory)
    if (!prior) throw new Error('existing run-plan transaction is unreadable')
    if (prior.status === 'started' || prior.status === 'spawning') {
      throw new Error('this request already crossed the paid provider boundary')
    }
    if (await pathEntryExists(workspace)) await restoreUnstarted(workspace, prior)
    await fs.promises.rm(journalDirectory, { recursive: true, force: true })
    if (await pathEntryExists(workspace)) await fs.promises.rm(workspace, { recursive: true, force: true })
  }
  await fs.promises.mkdir(journalDirectory, { mode: 0o700 })
  await fs.promises.mkdir(workspace, { mode: 0o700 })

  const preparation = prepareThesisPlanPrivately(subject, plan, workspace)
  let journal: TransactionJournal = await writeJournal(journalDirectory, {
    version: 1,
    requestId: requestId.toLowerCase(),
    subject,
    targetRunRoot: preparation.targetRunRoot,
    status: 'prepared',
    updatedAt: new Date().toISOString(),
  })

  const targetAbs = path.join(REPO_ROOT, preparation.targetRunRoot)
  const backupAbs = path.join(workspace, 'previous-root')
  const stagingDevice = (await fs.promises.lstat(preparation.stagingRootAbs)).dev
  const targetDevice = (await fs.promises.lstat(path.dirname(targetAbs))).dev
  if (stagingDevice !== targetDevice) {
    await fs.promises.rm(workspace, { recursive: true, force: true })
    await fs.promises.rm(journalDirectory, { recursive: true, force: true })
    throw new Error('private run-plan staging is not on the atomic target filesystem')
  }
  let started = false

  return {
    requestId: requestId.toLowerCase(),
    preparation,
    async activate() {
      if (journal.status === 'activated' || journal.status === 'spawning' || journal.status === 'started') return
      if (journal.status !== 'prepared') throw new Error('run-plan transaction is no longer activatable')
      journal = await writeJournal(journalDirectory, { ...journal, status: 'activating' })
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
    },
    async markPaidChildSpawning() {
      if (journal.status === 'spawning' || journal.status === 'started') return
      if (journal.status !== 'activated') throw new Error('paid child spawning before prepared root activation')
      journal = await writeJournal(journalDirectory, { ...journal, status: 'spawning' })
    },
    async markPaidChildStarted() {
      if (started || journal.status === 'started') return
      if (journal.status !== 'spawning') throw new Error('paid child started before spawn boundary was sealed')
      journal = await writeJournal(journalDirectory, { ...journal, status: 'started' })
      started = true
      await hooks.onStarted?.()
      await removeTreeInside(workspace, backupAbs)
    },
    async rollbackIfUnstarted(reason = 'provider child did not start') {
      if (started || journal.status === 'started' || journal.status === 'rolled_back') return
      if (journal.status === 'spawning') journal = { ...journal, status: 'activated' }
      await restoreUnstarted(workspace, journal)
      journal = await writeJournal(journalDirectory, { ...journal, status: 'rolled_back' })
      await hooks.onRolledBack?.(reason)
    },
  }
}
