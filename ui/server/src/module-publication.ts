import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT, STATE_DIR } from './config'
import { buildSwarmGraph } from './roster'
import { MODULE_RE, safeSubjectSegment } from './sandbox'
import { RESEARCH_SWARM_ID } from './swarms'
import {
  quarantineExactSynthesisArtifact,
  validateAgentOutputFile,
} from '../../../scripts/agent-output-validity.mjs'

const FINGERPRINT_RE = /^sha256:[a-f0-9]{64}$/
const TARGET_ROOT_RE = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4}-\d{2}-\d{2})$/
const MARKER_VERSION = 1 as const
const MARKER_DIR = path.join(STATE_DIR, 'module-publication-pending')
const activePublicationSubjects = new Set<string>()

export interface PendingModulePublication {
  version: typeof MARKER_VERSION
  ticker: string
  module: string
  targetRunRoot: string
  fingerprint: string
  createdAt: string
}

export interface NonCleanExactModuleRecoveryScope {
  ticker: string
  module: string
  targetRunRoot: string
  synthesisOrbs: string[]
}

export type NonCleanExactModuleRecovery =
  | { disposition: 'publication-pending'; fingerprint: string }
  | { disposition: 'synthesis-quarantined' }
  | { disposition: 'recovery-failed'; reason: string }

/** In-process writer lease for the publish-only request. Public launch routes share a subject mutex, but
 * internal supervisors can call launch() directly; launcher checks this lease at both sides of its awaits. */
export function acquireModulePublicationLease(ticker: string): (() => void) | null {
  try { safeSubjectSegment(ticker) } catch { return null }
  if (activePublicationSubjects.has(ticker)) return null
  activePublicationSubjects.add(ticker)
  let released = false
  return () => {
    if (released) return
    released = true
    activePublicationSubjects.delete(ticker)
  }
}

export function modulePublicationInFlight(ticker: string): boolean {
  return activePublicationSubjects.has(ticker)
}

function exactTargetRoot(ticker: string, targetRunRoot: string): boolean {
  const match = TARGET_ROOT_RE.exec(targetRunRoot)
  if (!match || match[1] !== ticker || path.posix.normalize(targetRunRoot) !== targetRunRoot) return false
  const parsed = new Date(`${match[2]}T00:00:00.000Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === match[2]
}

function safeIdentity(ticker: string, module: string): boolean {
  try { safeSubjectSegment(ticker) } catch { return false }
  return MODULE_RE.test(module) && path.posix.basename(module) === module
}

function markerDirectory(create: boolean): string {
  if (create) fs.mkdirSync(MARKER_DIR, { recursive: true, mode: 0o700 })
  const stat = fs.lstatSync(MARKER_DIR)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('unsafe publication marker directory')
  const stateReal = fs.realpathSync(STATE_DIR)
  const markerReal = fs.realpathSync(MARKER_DIR)
  if (path.dirname(markerReal) !== stateReal) throw new Error('publication marker directory escapes state')
  return markerReal
}

function markerPath(ticker: string, module: string, createDirectory = false): string {
  if (!safeIdentity(ticker, module)) throw new Error('unsafe module publication identity')
  // Hash the two independently-validated identities instead of joining them with a delimiter: both grammars
  // admit hyphens, so `A--B` + `C` and `A` + `B--C` would otherwise collide and overwrite one receipt.
  const key = createHash('sha256').update(ticker).update('\0').update(module).digest('hex')
  return path.join(markerDirectory(createDirectory), `${key}.json`)
}

/**
 * Hash the complete, current module directory after its synthesis has landed.
 *
 * The marker is useful only if it proves the retry is publishing the exact bytes produced by the paid run.
 * Paths, modes and bytes are included; symlinks and non-file entries fail closed. The current discovered
 * synthesis filename must pass the shared mechanical validator, so a truncated or old/renamed 99 cannot
 * make an unfinished module publishable.
 */
export function captureCompletedModuleFingerprint(
  ticker: string,
  module: string,
  targetRunRoot: string,
): string | null {
  try {
    if (!safeIdentity(ticker, module) || !exactTargetRoot(ticker, targetRunRoot)) return null
    const graph = buildSwarmGraph(RESEARCH_SWARM_ID)
    const moduleNode = graph.modules.find((candidate) => candidate.name === module)
    if (!moduleNode) return null

    const rootAbs = path.join(REPO_ROOT, targetRunRoot)
    const rootStat = fs.lstatSync(rootAbs)
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) return null
    const analysesReal = fs.realpathSync(ANALYSES_DIR)
    const rootReal = fs.realpathSync(rootAbs)
    if (!rootReal.startsWith(analysesReal + path.sep)) return null

    const moduleAbs = path.join(rootAbs, module)
    const moduleStat = fs.lstatSync(moduleAbs)
    if (!moduleStat.isDirectory() || moduleStat.isSymbolicLink()) return null
    const moduleReal = fs.realpathSync(moduleAbs)
    if (path.dirname(moduleReal) !== rootReal) return null

    const syntheses = new Set(
      Object.values(moduleNode.layers).flat()
        .filter((agent) => agent.isSynthesis)
        .map((agent) => `${agent.key.split('/').at(-1)}.md`),
    )
    if (!syntheses.size) return null
    const hasCurrentSynthesis = [...syntheses].some((name) => {
      try {
        const synthesis = path.join(moduleAbs, name)
        const stat = fs.lstatSync(synthesis)
        return stat.isFile() && !stat.isSymbolicLink() && validateAgentOutputFile(synthesis).valid
      } catch { return false }
    })
    if (!hasCurrentSynthesis) return null

    const hash = createHash('sha256')
    const hashTree = (abs: string, rel: string): void => {
      const before = fs.lstatSync(abs)
      if (before.isSymbolicLink()) throw new Error('module contains a symlink')
      if (before.isDirectory()) {
        hash.update(`D\0${rel}\0${before.mode & 0o777}\0`)
        for (const entry of fs.readdirSync(abs).sort()) {
          hashTree(path.join(abs, entry), `${rel}/${entry}`)
        }
        return
      }
      if (!before.isFile()) throw new Error('module contains a non-file entry')
      const bytes = fs.readFileSync(abs)
      const after = fs.lstatSync(abs)
      if (!after.isFile() || after.isSymbolicLink() || before.dev !== after.dev || before.ino !== after.ino
          || before.size !== after.size || before.mtimeMs !== after.mtimeMs || bytes.length !== before.size) {
        throw new Error('module changed while it was fingerprinted')
      }
      hash.update(`F\0${rel}\0${before.mode & 0o777}\0${before.size}\0`)
      hash.update(bytes)
      hash.update('\0')
    }
    hashTree(moduleAbs, module)
    return `sha256:${hash.digest('hex')}`
  } catch {
    return null
  }
}

function validMarker(value: unknown): value is PendingModulePublication {
  if (!value || typeof value !== 'object') return false
  const marker = value as Partial<PendingModulePublication>
  return marker.version === MARKER_VERSION
    && typeof marker.ticker === 'string'
    && typeof marker.module === 'string'
    && typeof marker.targetRunRoot === 'string'
    && typeof marker.fingerprint === 'string'
    && typeof marker.createdAt === 'string'
    && safeIdentity(marker.ticker, marker.module)
    && exactTargetRoot(marker.ticker, marker.targetRunRoot)
    && FINGERPRINT_RE.test(marker.fingerprint)
    && Number.isFinite(Date.parse(marker.createdAt))
}

export function readPendingModulePublication(ticker: string, module: string): PendingModulePublication | null {
  try {
    const file = markerPath(ticker, module)
    const stat = fs.lstatSync(file)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 16_384) return null
    const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
    return validMarker(parsed) && parsed.ticker === ticker && parsed.module === module ? parsed : null
  } catch {
    return null
  }
}

/** Atomic, durable marker written before Git publication begins, so a process restart still offers only a
 * publish retry for the already-produced bytes. */
export function writePendingModulePublication(
  marker: Omit<PendingModulePublication, 'version' | 'createdAt'>,
): PendingModulePublication {
  if (!safeIdentity(marker.ticker, marker.module)
      || !exactTargetRoot(marker.ticker, marker.targetRunRoot)
      || !FINGERPRINT_RE.test(marker.fingerprint)) {
    throw new Error('invalid pending module publication marker')
  }
  const record: PendingModulePublication = {
    version: MARKER_VERSION,
    ...marker,
    createdAt: new Date().toISOString(),
  }
  const file = markerPath(marker.ticker, marker.module, true)
  const temp = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(temp,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600)
    fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    fs.renameSync(temp, file)
    let dirFd: number | null = null
    try {
      dirFd = fs.openSync(path.dirname(file), fs.constants.O_RDONLY)
      fs.fsyncSync(dirFd)
    } catch { /* the file fsync + atomic rename remain the primary durability boundary */ }
    finally { if (dirFd !== null) try { fs.closeSync(dirFd) } catch { /* best effort */ } }
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.rmSync(temp, { force: true }) } catch { /* best-effort cleanup after a failed atomic replace */ }
  }
  return record
}

/** Clear only the exact marker the caller proved. A stale request can never erase a newer failed publish. */
export function clearPendingModulePublication(
  ticker: string,
  module: string,
  targetRunRoot: string,
  fingerprint: string,
): boolean {
  const current = readPendingModulePublication(ticker, module)
  if (!current || current.targetRunRoot !== targetRunRoot || current.fingerprint !== fingerprint) return false
  try {
    fs.rmSync(markerPath(ticker, module), { force: true })
    return true
  } catch {
    return false
  }
}

/** Read a pending marker only while the completed on-disk bytes still match it. */
export function validPendingModulePublication(ticker: string, module: string): PendingModulePublication | null {
  const marker = readPendingModulePublication(ticker, module)
  if (!marker) return null
  const current = captureCompletedModuleFingerprint(ticker, module, marker.targetRunRoot)
  return current === marker.fingerprint ? marker : null
}

function expectedSynthesisOrbs(module: string): string[] | null {
  try {
    const node = buildSwarmGraph(RESEARCH_SWARM_ID).modules.find((candidate) => candidate.name === module)
    if (!node) return null
    const stems = Object.values(node.layers).flat()
      .filter((agent) => agent.isSynthesis)
      .map((agent) => agent.key.split('/').at(-1)!)
      .sort()
    return stems.length > 0 ? stems : null
  } catch {
    return null
  }
}

/**
 * Preserve a mechanically complete exact-module output after a NON-CLEAN child close without publishing it.
 * The caller invokes this only after the detached process group is extinct and the final filesystem sweep has
 * completed. A verified content-bound marker makes the next heading click publish-only. If that durable marker
 * cannot be created/verified, remove only the server-bound current synthesis leaves so completion must plan the
 * synthesis again; specialist evidence remains on disk. This helper never invokes Git, a model, or a launcher.
 */
export function recoverNonCleanExactModulePublication(
  scope: NonCleanExactModuleRecoveryScope,
): NonCleanExactModuleRecovery {
  const expected = expectedSynthesisOrbs(scope.module)
  const supplied = Array.isArray(scope.synthesisOrbs) ? [...scope.synthesisOrbs].sort() : []
  if (!safeIdentity(scope.ticker, scope.module) || !exactTargetRoot(scope.ticker, scope.targetRunRoot)
      || !expected || expected.join('\0') !== supplied.join('\0')) {
    return { disposition: 'recovery-failed', reason: 'invalid_exact_module_scope' }
  }

  const fingerprint = captureCompletedModuleFingerprint(
    scope.ticker, scope.module, scope.targetRunRoot,
  )
  if (fingerprint) {
    try {
      writePendingModulePublication({
        ticker: scope.ticker,
        module: scope.module,
        targetRunRoot: scope.targetRunRoot,
        fingerprint,
      })
      const pending = validPendingModulePublication(scope.ticker, scope.module)
      if (pending?.targetRunRoot === scope.targetRunRoot && pending.fingerprint === fingerprint) {
        return { disposition: 'publication-pending', fingerprint }
      }
      // Do not leave our now-unusable receipt looking actionable after falling back to a rerun.
      clearPendingModulePublication(scope.ticker, scope.module, scope.targetRunRoot, fingerprint)
    } catch {
      // Marker state is unavailable/unsafe. The exact-synthesis quarantine below is the durable fallback.
    }
  }

  const env: NodeJS.ProcessEnv = {
    NOSTRA_EXACT_MODULE_RESUME: '1',
    NOSTRA_EXACT_MODULE_RUN_ROOT: scope.targetRunRoot,
    NOSTRA_EXACT_MODULE_NAME: scope.module,
    NOSTRA_EXACT_MODULE_WRITABLE_ORBS: '',
    NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS: expected.join(','),
  }
  try {
    for (const stem of expected) {
      quarantineExactSynthesisArtifact(
        path.join(REPO_ROOT, scope.targetRunRoot, scope.module, `${stem}.md`),
        ANALYSES_DIR,
        env,
      )
    }
    return { disposition: 'synthesis-quarantined' }
  } catch {
    return { disposition: 'recovery-failed', reason: 'exact_synthesis_quarantine_failed' }
  }
}
