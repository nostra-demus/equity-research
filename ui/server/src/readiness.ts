// Pre-flight data-readiness GATE — deterministic, no LLM (the pre-spawn check).
//
// Joins TWO truth sources, both already canonical in the engine:
//   1. extraction + entity truth  -> .claude/tools/extract_pool.py --readiness-json
//      (zero/empty/unreadable files; mixed-entity pool — the PV-vs-CV incident)
//   2. file-type + §26 module readiness -> analyzeTicker() in data-status.ts
//      (which modules are Insufficient, what caps bind — no-price, missing statements, …)
// It NEVER spawns `claude` and NEVER reads document content semantically — the FY/period/
// jurisdiction correctness stays with the in-run 00_*-data-triage agents (the "during-run" layer).

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execa } from 'execa'
import { DATA_DIR, REPO_ROOT } from './config'
import { analyzeTicker } from './data-status'
import type {
  ModuleReadiness,
  PhysicalPoolPresence,
  ReadinessReport,
  ReadinessIssue,
  ReadinessSeverity,
  RunKind,
} from './types'

interface PyIssue {
  code: string
  severity: ReadinessSeverity
  message: string
  // Python's optional values serialize as JSON null. Keep that wire shape
  // explicit, then normalize it before it reaches the canonical TS report.
  evidence?: string | null
  file?: string | null
}
interface PyReadiness {
  data_path: string
  generation_digest: string
  file_count: number
  usable_count: number
  issues: PyIssue[]
  entities: { file: string; entity: string }[]
}

interface ParsedPyReadiness {
  report: PyReadiness
  ignoredDiagnosticLines: number
}

function frozenEvidencePaths(outDir: string, generationDigest: string): {
  generationDir: string
  evidenceRoot: string
} {
  const generationDir = path.join(outDir, '.extract-generations', generationDigest)
  const manifestPath = path.join(generationDir, 'manifest.json')
  let manifest: Record<string, unknown>
  try {
    const manifestStat = fs.lstatSync(manifestPath)
    if (manifestStat.isSymbolicLink() || !manifestStat.isFile()) throw new Error('not a plain file')
    const parsed: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    manifest = parsed as Record<string, unknown>
  } catch (error) {
    throw new Error(`verified readiness generation has no readable manifest: ${String(error)}`)
  }
  const generation = manifest.generation
  const generationRecord = generation && typeof generation === 'object' && !Array.isArray(generation)
    ? generation as Record<string, unknown> : null
  const rawPrefix = generationRecord?.raw_prefix
  if (generationRecord?.digest !== generationDigest
      || generationRecord.schema_version !== 'pool-generation/v2'
      || typeof rawPrefix !== 'string'
      || path.isAbsolute(rawPrefix)
      || rawPrefix.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('verified readiness generation has no valid immutable raw evidence root')
  }
  let evidenceRoot = generationDir
  for (const part of rawPrefix.split('/')) {
    evidenceRoot = path.join(evidenceRoot, part)
    let stat: fs.Stats
    try { stat = fs.lstatSync(evidenceRoot) } catch {
      throw new Error('verified readiness generation raw evidence root is unavailable')
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error('verified readiness generation raw evidence root is not a plain directory')
    }
  }
  return { generationDir, evidenceRoot }
}

// suggested-fix hints by issue code (shown in the panel; only the user-fixable ones get "Fix & re-check")
const FIX_HINT: Record<string, string> = {
  check_failed: 'Try the check once more. If it returns, the checker needs repair; your files were not judged bad.',
  zero_files: 'Add the company\'s filings to the data folder, then re-check.',
  zero_usable_data: 'Re-upload readable files (PDF/XLSX/HTML), then re-check.',
  // The pool sits on a Google Drive mount, so a read can fail for reasons that have nothing to do
  // with the file: a sync pass touching it, or Drive hydrating a streamed placeholder. The
  // extractor now retries both, so a rejection that still reaches here is usually a real problem —
  // but "re-check" stays the first step, because re-exporting a perfectly good file is wasted work.
  extraction_failed: 'Re-check first (a Google Drive sync blip clears on retry). If it persists, '
    + 're-export or re-upload this file; if a dependency is missing, run setup-tools.sh.',
  missing_dependency: 'Run .claude/tools/setup-tools.sh to install the extractor dependency, then re-check.',
  empty_file: 'Replace the empty file with the real export, then re-check.',
  entity_disagreement: 'The pool appears to mix companies — remove the wrong-entity files, then re-check.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isPyReadiness(value: unknown): value is PyReadiness {
  if (!isRecord(value)
      || typeof value.data_path !== 'string'
      || typeof value.generation_digest !== 'string'
      || !/^[a-f0-9]{64}$/.test(value.generation_digest)
      || !Number.isInteger(value.file_count) || Number(value.file_count) < 0
      || !Number.isInteger(value.usable_count) || Number(value.usable_count) < 0
      || Number(value.usable_count) > Number(value.file_count)
      || !Array.isArray(value.issues)
      || !Array.isArray(value.entities)) return false
  const issuesOk = value.issues.every((issue) => isRecord(issue)
    && typeof issue.code === 'string'
    && ['blocker', 'degrade', 'info'].includes(String(issue.severity))
    && typeof issue.message === 'string'
    && (issue.evidence == null || typeof issue.evidence === 'string')
    && (issue.file == null || typeof issue.file === 'string'))
  const entitiesOk = value.entities.every((entity) => isRecord(entity)
    && typeof entity.file === 'string' && typeof entity.entity === 'string')
  return issuesOk && entitiesOk
}

/**
 * Parse the extractor's stdout protocol. Current extractors promise one JSON
 * document. The line fallback keeps a rolling deployment compatible with an
 * older/noisy extractor, but accepts exactly one schema-valid report — never
 * an arbitrary JSON log line and never an ambiguous pair of reports.
 */
export function parseReadinessStdout(stdout: string | Buffer): ParsedPyReadiness {
  const text = stdout.toString().trim()
  if (!text) throw new Error('readiness extractor returned empty stdout')
  try {
    const direct: unknown = JSON.parse(text)
    if (!isPyReadiness(direct)) throw new Error('readiness JSON did not match the required schema')
    return { report: direct, ignoredDiagnosticLines: 0 }
  } catch (directError) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const reports: PyReadiness[] = []
    for (const line of lines) {
      try {
        const candidate: unknown = JSON.parse(line)
        if (isPyReadiness(candidate)) reports.push(candidate)
      } catch { /* ordinary parser diagnostics are not JSON */ }
    }
    if (reports.length === 1) {
      return { report: reports[0], ignoredDiagnosticLines: Math.max(0, lines.length - 1) }
    }
    const reason = directError instanceof Error ? directError.message : String(directError)
    throw new Error(`invalid readiness extractor protocol (${reports.length} valid reports; ${reason})`)
  }
}

// A fresh pool is fully snapshotted and extracted before admission, including provider-neutral OCR of
// image-only/scanned files. Python deliberately uses no partial OCR budget: the generation admitted here
// is the evidence every later child receives. Keep one bounded supervisor wall-clock for genuine hangs,
// but make the default realistic for a large first load; completed generations are cached thereafter.
const READINESS_TIMEOUT_MS = Math.max(60_000, Number(process.env.READINESS_TIMEOUT_MS) || 30 * 60_000)
const READINESS_RETRY_ATTEMPTS = Math.max(1, Math.min(3, Number(process.env.READINESS_RETRY_ATTEMPTS) || 3))
const READINESS_RETRY_DELAY_MS = Math.max(25, Number(process.env.READINESS_RETRY_DELAY_MS) || 250)
const READINESS_PROCESS_TERM_MS = Math.max(100, Number(process.env.READINESS_PROCESS_TERM_MS) || 2_000)

export class ReadinessCancelledError extends Error {
  constructor(message = 'readiness check cancelled') {
    super(message)
    this.name = 'ReadinessCancelledError'
  }
}

export function isReadinessCancelledError(error: unknown): error is ReadinessCancelledError {
  return error instanceof ReadinessCancelledError
}

function groupAlive(pid: number | undefined): boolean {
  if (!pid) return false
  try { process.kill(-pid, 0); return true } catch (error: any) { return error?.code === 'EPERM' }
}

async function stopProcessGroup(pid: number | undefined): Promise<void> {
  if (!pid || !groupAlive(pid)) return
  try { process.kill(-pid, 'SIGTERM') } catch { /* exited between proof and signal */ }
  const termDeadline = Date.now() + READINESS_PROCESS_TERM_MS
  while (groupAlive(pid) && Date.now() < termDeadline) {
    await new Promise<void>((resolve) => setTimeout(resolve, 25))
  }
  if (groupAlive(pid)) {
    try { process.kill(-pid, 'SIGKILL') } catch { /* exited between proof and signal */ }
  }
  // This process writes the shared extraction generation. Never tell admission that it is gone until
  // the whole detached group is actually extinct; a fixed timeout followed by lock release would reopen
  // the exact concurrent-writer race cancellation is meant to close.
  while (groupAlive(pid)) await new Promise<void>((resolve) => setTimeout(resolve, 25))
}

async function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new ReadinessCancelledError()
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(done, ms)
    const onAbort = () => done(new ReadinessCancelledError())
    function done(error?: Error) {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve()
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

interface ReadinessProcessOptions {
  signal?: AbortSignal
  timeoutMs: number
  env?: NodeJS.ProcessEnv
}

/** One detached checker attempt. Cancellation/timeout owns and drains the whole process group, including
 * converter/OCR descendants, before this promise settles. Exported only as a deterministic regression seam. */
export async function runReadinessProcess(
  command: string,
  args: string[],
  options: ReadinessProcessOptions,
): Promise<{ stdout: string; stderr: string }> {
  if (options.signal?.aborted) throw new ReadinessCancelledError()
  const child = execa(command, args, {
    env: options.env,
    extendEnv: options.env === undefined,
    maxBuffer: 32_000_000,
    reject: false,
    detached: true,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  })
  let timedOut = false
  let stop: Promise<void> | null = null
  const requestStop = () => {
    stop ??= stopProcessGroup(child.pid)
    return stop
  }
  const onAbort = () => { void requestStop() }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  const timer = setTimeout(() => {
    timedOut = true
    void requestStop()
  }, options.timeoutMs)
  try {
    const result = await child
    if (stop) await stop
    if (options.signal?.aborted) throw new ReadinessCancelledError()
    if (timedOut) throw new Error(`readiness extractor timed out after ${options.timeoutMs}ms`)
    if (result.failed || result.exitCode !== 0) {
      const error: any = new Error(`readiness extractor exited ${result.exitCode ?? 'without a status'}`)
      error.stderr = result.stderr
      throw error
    }
    return { stdout: result.stdout, stderr: result.stderr }
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onAbort)
    // A clean leader is not allowed to orphan a converter that still owns an output lock.
    if (groupAlive(child.pid)) await requestStop()
  }
}

export type PoolPresence = PhysicalPoolPresence

export interface PoolPresenceIO {
  realpathSync(target: string): string
  lstatSync(target: string): fs.Stats
  readdirSync(target: string): fs.Dirent[]
}

const poolPresenceIO: PoolPresenceIO = {
  realpathSync: (target) => fs.realpathSync(target),
  lstatSync: (target) => fs.lstatSync(target),
  readdirSync: (target) => fs.readdirSync(target, { withFileTypes: true }),
}

/**
 * Cheap, parser-free proof of whether a pool is actually empty.
 *
 * The full extractor is intentionally strict and may fail for a technical reason. That failure must not
 * be presented as "no data" when real user files are plainly present. This walk mirrors the extractor's
 * safety boundary: the configured root may itself be a Drive symlink, descendant symlinks are ignored,
 * engine output folders are excluded, and metadata/hidden files are not treated as research inputs.
 */
export function inspectPoolPresence(dataDir: string, io: PoolPresenceIO = poolPresenceIO): PoolPresence {
  let realRoot: string
  try {
    realRoot = io.realpathSync(dataDir)
  } catch {
    return { state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'root_realpath_failed' }
  }
  try {
    const root = io.lstatSync(realRoot)
    if (!root.isDirectory() || root.isSymbolicLink()) {
      return { state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'root_is_not_a_real_directory' }
    }
  } catch {
    return { state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'root_stat_failed' }
  }

  let fileCount = 0
  let nonEmptyFileCount = 0
  let failureReason: string | undefined
  const visit = (directory: string): boolean => {
    let entries: fs.Dirent[]
    try {
      entries = io.readdirSync(directory)
    } catch {
      failureReason = 'directory_read_failed'
      return false
    }
    // The marker makes the whole directory engine output. It is read from the
    // same complete directory snapshot; existsSync would silently turn an I/O
    // error into "marker absent" and weaken the proof.
    if (entries.some((entry) => entry.name === '.nostradamus_output')) return true
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === '_pool_extracts') continue
      const absolute = path.join(directory, entry.name)
      let info: fs.Stats
      try {
        info = io.lstatSync(absolute)
      } catch {
        // A concurrent rename, Drive hydration fault, or permission error makes
        // the entire walk incomplete. Partial counts must never prove empty.
        failureReason = 'entry_stat_failed'
        return false
      }
      if (info.isSymbolicLink()) continue
      if (info.isDirectory()) {
        if (!visit(absolute)) return false
        continue
      }
      if (!info.isFile() || info.nlink !== 1 || entry.name.endsWith('.source.json')) continue
      fileCount++
      if (info.size > 0) nonEmptyFileCount++
    }
    return true
  }
  const complete = visit(realRoot)
  if (!complete) {
    return { state: 'unknown', fileCount, nonEmptyFileCount, reason: failureReason ?? 'pool_walk_failed' }
  }
  return {
    state: nonEmptyFileCount === 0 ? 'empty' : 'nonempty',
    fileCount,
    nonEmptyFileCount,
  }
}

// ASYNC on purpose: extract_pool extracts every file in the pool (the bulk of the gate's cost — seconds
// on a cached pool, potentially many minutes on a large first load). execFileSync would block the whole
// Node event loop for that
// time, freezing every other request (SSE, /api/runs, and crucially a cancel POST). execFile yields.
async function runPhaseAPython(
  dataDir: string,
  outDir: string,
  force: boolean,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<PyReadiness> {
  if (signal?.aborted) throw new ReadinessCancelledError()
  const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
  const args = [script, '--readiness-json', dataDir, outDir]
  if (force) args.push('--force')
  const { stdout } = await runReadinessProcess('python3', args, {
    timeoutMs,
    signal,
    // readiness_summary owns the complete-extraction contract (ocr_budget_s=0). Do not inject a
    // smaller environment budget that could publish a partial generation as admission evidence.
    env: { ...process.env },
  })
  const parsed = parseReadinessStdout(stdout)
  if (path.resolve(parsed.report.data_path) !== path.resolve(dataDir)) {
    throw new Error('readiness extractor returned a report for a different data path')
  }
  if (parsed.ignoredDiagnosticLines > 0) {
    console.warn(`[readiness] ignored ${parsed.ignoredDiagnosticLines} non-protocol stdout line(s); accepted one schema-valid report`)
  }
  return parsed.report
}

export interface ReadinessTechnicalAttemptIO {
  extract(dataDir: string, outDir: string, force: boolean, timeoutMs: number, signal?: AbortSignal): Promise<PyReadiness>
  verifyFrozenGeneration(outDir: string, generationDigest: string): { generationDir: string; evidenceRoot: string }
  inspectFrozenPresence(evidenceRoot: string): PhysicalPoolPresence
  classifyExact(ticker: string, evidenceRoot: string): Promise<Record<string, ModuleReadiness>>
  now(): number
}

interface SuccessfulTechnicalAttempt {
  py: PyReadiness
  frozenPaths: { generationDir: string; evidenceRoot: string }
  physicalPool: PhysicalPoolPresence
  modules: Record<string, ModuleReadiness> | null
}

const readinessTechnicalIO: ReadinessTechnicalAttemptIO = {
  extract: runPhaseAPython,
  verifyFrozenGeneration: frozenEvidencePaths,
  inspectFrozenPresence: (evidenceRoot) => inspectPoolPresence(evidenceRoot),
  classifyExact: async (ticker, evidenceRoot) => (await analyzeTicker(
    ticker,
    undefined,
    { exactDataDir: evidenceRoot },
  )).modules,
  now: () => Date.now(),
}

function readinessTechnicalFailure(
  ticker: string,
  kind: RunKind,
  module: string | undefined,
  attempts: number,
  reason: string,
): ReadinessReport {
  const physicalPool: PhysicalPoolPresence = {
    state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'safe_snapshot_check_failed',
  }
  return finalize(ticker, kind, module, [{
    code: 'check_failed', severity: 'blocker',
    message: 'The automatic data check could not verify one safe frozen snapshot. No provider was started.',
    evidence: `Technical check failed after ${attempts} bounded attempt(s): ${reason}`,
    suggestedFix: FIX_HINT.check_failed,
  }], 0, 0, [], physicalPool)
}

// §26 module readiness scoped by run kind (exported for testing):
//   full   -> every module; an Insufficient module is a DEGRADE (the other modules still run)
//   module -> the target module only; an Insufficient target is a BLOCKER (the run is pointless)
//   agent / rerun -> [] (a re-run isn't recomputing module sufficiency, so don't gate on it)
// Partial just runs capped — that's normal, not a gate concern (the in-run triage carries those caps).
export function moduleReadinessIssues(
  kind: RunKind, module: string | undefined, modules: Record<string, ModuleReadiness>,
): ReadinessIssue[] {
  if (kind !== 'full' && kind !== 'module') return []
  const scope = kind === 'module' && module ? [module] : Object.keys(modules)
  const out: ReadinessIssue[] = []
  for (const m of scope) {
    const mod = modules[m]
    if (!mod || mod.status !== 'Insufficient') continue
    out.push({
      code: 'module_insufficient', severity: kind === 'module' ? 'blocker' : 'degrade', module: m,
      message: `${m}: insufficient data — ${mod.reasons.join('; ') || 'required inputs missing'}.`,
      affectedModules: [m],
      capIfProceeded: mod.caps.join('; ') || `${m} will fail-fast or run capped`,
      suggestedFix: 'Add the missing document type for this module, then re-check.',
    })
  }
  return out
}

/**
 * Run the deterministic pre-flight readiness check for a ticker.
 * @param outDir where extract_pool caches its manifest/extracts (the run's _pool_extracts at launch;
 *               a stable temp cache for the read-only endpoint). force re-reads a just-fixed pool.
 */
export async function runReadiness(
  ticker: string,
  kind: RunKind = 'full',
  module?: string,
  opts: {
    outDir?: string
    force?: boolean
    signal?: AbortSignal
    /** Deterministic regression seam. Production always uses the immutable-snapshot implementations above. */
    technicalIO?: Partial<ReadinessTechnicalAttemptIO>
  } = {},
): Promise<ReadinessReport> {
  const dataDir = path.join(DATA_DIR, ticker)
  const outDir = opts.outDir ?? path.join(os.tmpdir(), 'nostra-readiness', ticker)
  const issues: ReadinessIssue[] = []

  const io: ReadinessTechnicalAttemptIO = { ...readinessTechnicalIO, ...opts.technicalIO }
  const deadline = io.now() + READINESS_TIMEOUT_MS
  let successful: SuccessfulTechnicalAttempt | null = null
  let attempts = 0
  let lastFailure: unknown = new Error('readiness deadline elapsed')
  for (let attempt = 1; attempt <= READINESS_RETRY_ATTEMPTS; attempt++) {
    if (opts.signal?.aborted) throw new ReadinessCancelledError()
    const remainingMs = deadline - io.now()
    if (remainingMs <= 0) break
    attempts = attempt
    try {
      // One attempt is the whole technical transaction. A cached extraction is not enough: its protected
      // manifest, immutable physical walk, and exact-generation classification must all agree before the
      // attempt is successful. Every retry starts again at extraction under the SAME wall-clock deadline.
      const py = await io.extract(dataDir, outDir, opts.force ?? false, remainingMs, opts.signal)
      if (opts.signal?.aborted) throw new ReadinessCancelledError()
      if (io.now() >= deadline) throw new Error('readiness deadline elapsed after extraction')
      const frozenPaths = io.verifyFrozenGeneration(path.resolve(outDir), py.generation_digest)
      if (io.now() >= deadline) throw new Error('readiness deadline elapsed during frozen-generation verification')
      const physicalPool = io.inspectFrozenPresence(frozenPaths.evidenceRoot)
      if (physicalPool.state === 'unknown') {
        throw new Error(`immutable physical snapshot is unknown (${physicalPool.reason ?? 'incomplete walk'})`)
      }
      if (py.file_count !== physicalPool.fileCount) {
        throw new Error(`extractor/immutable-presence disagreement (${py.file_count} vs ${physicalPool.fileCount})`)
      }
      const modules = py.file_count > 0 && (kind === 'full' || kind === 'module')
        ? await io.classifyExact(ticker, frozenPaths.evidenceRoot)
        : null
      if (opts.signal?.aborted) throw new ReadinessCancelledError()
      if (io.now() >= deadline) throw new Error('readiness deadline elapsed during exact classification')
      successful = { py, frozenPaths, physicalPool, modules }
      break
    } catch (error: any) {
      if (opts.signal?.aborted || isReadinessCancelledError(error)) throw new ReadinessCancelledError()
      lastFailure = error
      console.warn(
        `[readiness] safe-snapshot attempt ${attempt}/${READINESS_RETRY_ATTEMPTS} failed for ${dataDir}:`,
        error?.shortMessage || error?.message || String(error),
        error?.stderr ? `\n  stderr(tail): ${String(error.stderr).slice(-600)}` : '',
      )
      const retryDelay = READINESS_RETRY_DELAY_MS * attempt
      if (attempt < READINESS_RETRY_ATTEMPTS && io.now() + retryDelay < deadline) {
        await abortableDelay(retryDelay, opts.signal)
      }
    }
  }
  if (!successful) {
    const reason = lastFailure instanceof Error ? lastFailure.message : String(lastFailure)
    return readinessTechnicalFailure(ticker, kind, module, attempts, reason.slice(0, 300))
  }

  const { py, frozenPaths, physicalPool, modules } = successful
  for (const i of py.issues) {
    issues.push({
      code: i.code,
      severity: i.severity,
      message: i.message,
      ...(typeof i.evidence === 'string' ? { evidence: i.evidence } : {}),
      ...(typeof i.file === 'string' ? { file: i.file } : {}),
      suggestedFix: FIX_HINT[i.code],
    })
  }

  // (2) file-type + §26 module readiness, scoped by kind (see moduleReadinessIssues). Only when files
  // exist and the kind recomputes module sufficiency (full/module) — agent/rerun skip the analyzeTicker I/O.
  if (modules) issues.push(...moduleReadinessIssues(kind, module, modules))

  return finalize(
    ticker,
    kind,
    module,
    issues,
    py.file_count,
    py.usable_count,
    py.entities,
    physicalPool,
    (() => {
      const exactOutDir = path.resolve(outDir)
      return {
        dataPath: path.resolve(dataDir),
        outDir: exactOutDir,
        generationDigest: py.generation_digest,
        generationDir: frozenPaths.generationDir,
        evidenceRoot: frozenPaths.evidenceRoot,
      }
    })(),
  )
}

function finalize(
  ticker: string, kind: RunKind, module: string | undefined,
  issues: ReadinessIssue[], fileCount: number, usableCount: number,
  entities: { file: string; entity: string }[],
  physicalPool: PhysicalPoolPresence,
  frozenPool?: ReadinessReport['frozenPool'],
): ReadinessReport {
  const overall: ReadinessReport['overall'] =
    issues.some((i) => i.severity === 'blocker') ? 'blocked'
    : issues.some((i) => i.severity === 'degrade') ? 'degraded'
    : 'clean'
  return { ticker, kind, module, overall, fileCount, usableCount, physicalPool, frozenPool, entities, issues, ts: Date.now() }
}
