import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from './config'
import { prepareThesisPlanPrivately, type PrivateThesisPlanPreparation, type ThesisPlan } from './completion'

export interface PreparedRunPlanTransaction {
  requestId: string
  preparation: PrivateThesisPlanPreparation
  activate(): void
  markPaidChildStarted(): void
  rollbackIfUnstarted(reason?: string): void
}

interface TransactionJournal {
  version: 1
  requestId: string
  subject: string
  targetRunRoot: string
  status: 'prepared' | 'activating' | 'activated' | 'started' | 'rolled_back'
  updatedAt: string
}

interface TransactionHooks {
  onStarted?: () => void
  onRolledBack?: (reason: string) => void
}

const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const RUN_ROOT = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/

function transactionsRoot(stateDir: string): string {
  return path.join(path.resolve(stateDir), 'run-plan-transactions')
}

function transactionDir(requestId: string, stateDir: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error('invalid run-plan transaction id')
  return path.join(transactionsRoot(stateDir), requestId.toLowerCase())
}

function journalPath(directory: string): string {
  return path.join(directory, 'transaction.json')
}

function safeDirectory(directory: string): boolean {
  try {
    const info = fs.lstatSync(directory)
    return info.isDirectory() && !info.isSymbolicLink()
  } catch {
    return false
  }
}

function pathEntryExists(target: string): boolean {
  try { fs.lstatSync(target); return true } catch { return false }
}

function ensurePrivateDirectory(directory: string, label: string): void {
  if (pathEntryExists(directory)) {
    if (!safeDirectory(directory)) throw new Error(`${label} is unsafe`)
  } else {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
    if (!safeDirectory(directory)) throw new Error(`${label} is unsafe`)
  }
  fs.chmodSync(directory, 0o700)
}

function assertCanonicalTargetSafe(targetAbs: string): void {
  const analysesReal = fs.realpathSync(path.join(REPO_ROOT, 'analyses'))
  const parentReal = fs.realpathSync(path.dirname(targetAbs))
  if (parentReal !== analysesReal) throw new Error('run-plan target parent escaped analyses')
  if (!pathEntryExists(targetAbs)) return
  const info = fs.lstatSync(targetAbs)
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('run-plan target is not a real directory')
  const targetReal = fs.realpathSync(targetAbs)
  if (!targetReal.startsWith(`${analysesReal}${path.sep}`)) throw new Error('run-plan target escaped analyses')
}

function writeJournal(directory: string, journal: TransactionJournal): void {
  if (!safeDirectory(directory)) throw new Error('run-plan transaction directory is unsafe')
  const target = journalPath(directory)
  const staged = path.join(directory, `.transaction.${process.pid}.${crypto.randomUUID()}.tmp`)
  const fd = fs.openSync(staged, 'wx', 0o600)
  try {
    fs.writeFileSync(fd, `${JSON.stringify({ ...journal, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fd)
  } finally {
    fs.closeSync(fd)
  }
  fs.renameSync(staged, target)
}

function readJournal(directory: string): TransactionJournal | null {
  try {
    if (!safeDirectory(directory)) return null
    const target = journalPath(directory)
    const info = fs.lstatSync(target)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0) return null
    const value = JSON.parse(fs.readFileSync(target, 'utf8')) as TransactionJournal
    if (value?.version !== 1 || !REQUEST_ID.test(String(value.requestId)) || !RUN_ROOT.test(String(value.targetRunRoot))
        || !['prepared', 'activating', 'activated', 'started', 'rolled_back'].includes(String(value.status))) return null
    return value
  } catch {
    return null
  }
}

function removeTreeInside(directory: string, target: string): void {
  const base = path.resolve(directory)
  const resolved = path.resolve(target)
  if (!resolved.startsWith(`${base}${path.sep}`)) throw new Error('transaction cleanup escaped its directory')
  if (pathEntryExists(resolved)) fs.rmSync(resolved, { recursive: true, force: true })
}

function restoreUnstarted(directory: string, journal: TransactionJournal): void {
  const targetAbs = path.join(REPO_ROOT, journal.targetRunRoot)
  const backupAbs = path.join(directory, 'previous-root')
  const preparedAbs = path.join(directory, 'prepared-root')
  const displacedAbs = path.join(directory, 'unstarted-root')

  const backupExists = fs.existsSync(backupAbs)
  const preparedExists = fs.existsSync(preparedAbs)
  // `activating` is journaled before the first rename. With neither a backup nor a consumed prepared root,
  // the canonical target is still the untouched original and must not be displaced.
  const canonicalWasActivated = journal.status === 'activated'
    || (journal.status === 'activating' && (backupExists || !preparedExists))
  if (pathEntryExists(targetAbs) && canonicalWasActivated) {
    if (pathEntryExists(displacedAbs)) removeTreeInside(directory, displacedAbs)
    fs.renameSync(targetAbs, displacedAbs)
  }
  if (pathEntryExists(backupAbs)) fs.renameSync(backupAbs, targetAbs)
  if (pathEntryExists(displacedAbs)) removeTreeInside(directory, displacedAbs)
  if (pathEntryExists(preparedAbs)) removeTreeInside(directory, preparedAbs)
}

/** Recover only transactions whose paid child was never durably marked started. */
export function recoverRunPlanTransactions(stateDir: string = STATE_DIR): void {
  const root = transactionsRoot(stateDir)
  if (!fs.existsSync(root)) return
  if (!safeDirectory(root)) throw new Error('run-plan transaction root is unsafe')
  for (const name of fs.readdirSync(root)) {
    if (!REQUEST_ID.test(name)) continue
    const directory = path.join(root, name)
    const journal = readJournal(directory)
    if (!journal) continue
    if (journal.status === 'started') {
      removeTreeInside(directory, path.join(directory, 'previous-root'))
      removeTreeInside(directory, path.join(directory, 'prepared-root'))
      continue
    }
    restoreUnstarted(directory, journal)
    writeJournal(directory, { ...journal, status: 'rolled_back' })
  }
}

export function prepareRunPlanTransaction(
  requestId: string,
  subject: string,
  plan: ThesisPlan,
  hooks: TransactionHooks = {},
  stateDir: string = STATE_DIR,
): PreparedRunPlanTransaction {
  const root = transactionsRoot(stateDir)
  ensurePrivateDirectory(root, 'run-plan transaction root')
  const directory = transactionDir(requestId, stateDir)
  if (pathEntryExists(directory)) {
    if (!safeDirectory(directory)) throw new Error('run-plan transaction directory is unsafe')
    const prior = readJournal(directory)
    if (!prior) throw new Error('existing run-plan transaction is unreadable')
    if (prior.status === 'started') throw new Error('this request already started a paid provider child')
    restoreUnstarted(directory, prior)
    fs.rmSync(directory, { recursive: true, force: true })
  }
  fs.mkdirSync(directory, { mode: 0o700 })
  const preparation = prepareThesisPlanPrivately(subject, plan, directory)
  let journal: TransactionJournal = {
    version: 1,
    requestId: requestId.toLowerCase(),
    subject,
    targetRunRoot: preparation.targetRunRoot,
    status: 'prepared',
    updatedAt: new Date().toISOString(),
  }
  writeJournal(directory, journal)

  const targetAbs = path.join(REPO_ROOT, preparation.targetRunRoot)
  const backupAbs = path.join(directory, 'previous-root')
  const stagingDevice = fs.lstatSync(preparation.stagingRootAbs).dev
  const targetDevice = fs.lstatSync(path.dirname(targetAbs)).dev
  if (stagingDevice !== targetDevice) {
    fs.rmSync(directory, { recursive: true, force: true })
    throw new Error('private run-plan staging is not on the atomic target filesystem')
  }
  let started = false

  return {
    requestId: requestId.toLowerCase(),
    preparation,
    activate() {
      if (journal.status === 'activated' || journal.status === 'started') return
      if (journal.status !== 'prepared') throw new Error('run-plan transaction is no longer activatable')
      journal = { ...journal, status: 'activating' }
      writeJournal(directory, journal)
      let movedTarget = false
      try {
        assertCanonicalTargetSafe(targetAbs)
        if (pathEntryExists(targetAbs)) {
          if (pathEntryExists(backupAbs)) throw new Error('run-plan backup already exists')
          fs.renameSync(targetAbs, backupAbs)
          movedTarget = true
        }
        fs.renameSync(preparation.stagingRootAbs, targetAbs)
      } catch (error) {
        if (movedTarget && pathEntryExists(backupAbs) && !pathEntryExists(targetAbs)) fs.renameSync(backupAbs, targetAbs)
        throw error
      }
      journal = { ...journal, status: 'activated' }
      writeJournal(directory, journal)
    },
    markPaidChildStarted() {
      if (started || journal.status === 'started') return
      if (journal.status !== 'activated') throw new Error('paid child started before prepared root activation')
      started = true
      journal = { ...journal, status: 'started' }
      writeJournal(directory, journal)
      hooks.onStarted?.()
      removeTreeInside(directory, backupAbs)
    },
    rollbackIfUnstarted(reason = 'provider child did not start') {
      if (started || journal.status === 'started' || journal.status === 'rolled_back') return
      restoreUnstarted(directory, journal)
      journal = { ...journal, status: 'rolled_back' }
      writeJournal(directory, journal)
      hooks.onRolledBack?.(reason)
    },
  }
}
