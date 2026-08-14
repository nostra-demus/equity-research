// Durable publication boundary for canonical news-Ideas data. The pass writes locally under the shared
// repository mutation lock; this module records that publication is pending, then delegates the exact
// data-only commit/push to commit-run.sh. It never runs on a code/developer branch.

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../../singleton-lock'

const execFileAsync = promisify(execFile)
const PENDING_FILE = 'ideas-publish-pending.json'
const PENDING_LOCK_FILE = 'ideas-publish-pending.lock'
const PUBLISH_TIMEOUT_MS = 20 * 60_000
const DATA_PATHS = [
  'screener/ledger/ideas.ndjson',
  'screener/ledger/ideas_feedback.ndjson',
  'screener/ledger/ideas',
  'screener/ledger/ideas_archive',
  'screener/board/index.json',
] as const

export type IdeasPublishFailure = 'unsafe_branch' | 'git_unavailable' | 'commit_failed'
export type IdeasPublishResult =
  | { status: 'not_applicable' | 'clean' | 'published'; pending: false }
  | { status: 'failed'; pending: true; reason: IdeasPublishFailure }

export interface IdeasPublishCommandResult { stdout: string; stderr: string; exitCode: number }
export type IdeasPublishCommand = (
  executable: string,
  args: string[],
  options: { cwd: string; timeoutMs: number },
) => Promise<IdeasPublishCommandResult>

export interface IdeasPublisherOptions {
  command?: IdeasPublishCommand
  nowMs?: number
  /** Rebuild the derived board from canonical stores before any pending/dirty batch can be committed. */
  beforePublish?: () => Promise<void>
}

const defaultCommand: IdeasPublishCommand = async (executable, args, options) => {
  try {
    const result = await execFileAsync(executable, args, {
      cwd: options.cwd, timeout: options.timeoutMs, maxBuffer: 512_000, encoding: 'utf8',
    })
    return { stdout: String(result.stdout || ''), stderr: String(result.stderr || ''), exitCode: 0 }
  } catch (error: any) {
    return {
      stdout: String(error?.stdout || ''), stderr: String(error?.stderr || error?.message || ''),
      exitCode: Number.isInteger(error?.code) ? error.code : 1,
    }
  }
}

function fsyncDirectory(dir: string): void {
  // Directory fsync is POSIX-only durability (makes a rename/link into `dir` crash-safe). Windows has no
  // directory file descriptors: fs.openSync(dir, 'r') raises EPERM there, and fs.fsyncSync on a directory
  // handle is unsupported. Skip rather than crash the publish path on that platform.
  if (process.platform === 'win32') return
  const fd = fs.openSync(dir, 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

function pendingPath(stateDir: string): string { return path.join(stateDir, PENDING_FILE) }

interface IdeasPublishPending {
  schema_version: 'ideas-publish-pending/v2'
  pending_since: string
  target_sha: string | null
  generation: string
}

function readPending(stateDir: string): IdeasPublishPending | null {
  try {
    const value = JSON.parse(fs.readFileSync(pendingPath(stateDir), 'utf8'))
    if (!(value?.schema_version === 'ideas-publish-pending/v1'
        || value?.schema_version === 'ideas-publish-pending/v2')
      || !Number.isFinite(Date.parse(value.pending_since))
      || !(value.target_sha === null || /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value.target_sha))) return null
    // A rollout may encounter the original v1 marker. Its deterministic sentinel lets an in-flight
    // publisher compare-clear it, while any new mutation upgrades it to a unique v2 generation.
    const generation = value.schema_version === 'ideas-publish-pending/v1'
      ? 'legacy-v1'
      : value.generation
    if (typeof generation !== 'string' || !/^[a-z0-9-]{1,64}$/.test(generation)) return null
    return {
      schema_version: 'ideas-publish-pending/v2',
      pending_since: value.pending_since,
      target_sha: value.target_sha,
      generation,
    }
  } catch { return null }
}

function writePendingUnlocked(stateDir: string, value: IdeasPublishPending): void {
  fs.mkdirSync(stateDir, { recursive: true })
  const fp = pendingPath(stateDir)
  const tmp = `${fp}.tmp.${process.pid}.${randomUUID()}`
  let fd: number | null = null
  try {
    fd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(fd, JSON.stringify(value) + '\n')
    fs.fsyncSync(fd)
    fs.closeSync(fd); fd = null
    fs.renameSync(tmp, fp)
    fsyncDirectory(stateDir)
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(tmp) } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  }
}

function withPendingLock<T>(stateDir: string, fn: () => T): T {
  fs.mkdirSync(stateDir, { recursive: true })
  const fd = acquireRetainedFlockSync(path.join(stateDir, PENDING_LOCK_FILE), {
    waitMs: 5_000,
    pollMs: 10,
    busyMessage: 'ideas publication marker is busy',
  })
  try { return fn() } finally { releaseRetainedFlock(fd) }
}

/** Mark before a mutation batch. A dirty-worktree bootstrap also recovers a crash before this marker. */
export function markIdeasPublicationPending(stateDir: string, nowMs = Date.now()): void {
  withPendingLock(stateDir, () => {
    const current = readPending(stateDir)
    if (fs.existsSync(pendingPath(stateDir)) && !current) {
      throw new Error('ideas publication marker is invalid')
    }
    writePendingUnlocked(stateDir, {
      schema_version: 'ideas-publish-pending/v2',
      pending_since: current?.pending_since || new Date(nowMs).toISOString(),
      // A new mutation is not covered by an older commit. A clean retry can recover HEAD if the
      // mutation ultimately makes no byte change; otherwise the next pass commits the new dirt.
      target_sha: null,
      generation: randomUUID(),
    })
  })
}

function rememberPendingCommit(stateDir: string, output: string, expectedGeneration: string): void {
  const sha = /(?:^|\n)COMMIT_SHA=([a-f0-9]{40}|[a-f0-9]{64})(?:\n|$)/.exec(output)?.[1]
  if (!sha) return
  withPendingLock(stateDir, () => {
    const current = readPending(stateDir)
    if (!current) throw new Error('ideas publication marker is missing or invalid')
    // A later mutation owns a newer generation. Never overwrite its null target with an older commit.
    if (current.generation !== expectedGeneration) return
    writePendingUnlocked(stateDir, { ...current, target_sha: sha })
  })
}

function outputCommitSha(output: string): string | null {
  return /(?:^|\n)COMMIT_SHA=([a-f0-9]{40}|[a-f0-9]{64})(?:\n|$)/.exec(output)?.[1] || null
}

async function provePublished(command: IdeasPublishCommand, repoRoot: string, sha: string): Promise<boolean> {
  const fetched = await commandOk(command, 'git', ['-C', repoRoot, 'fetch', '--quiet', 'origin', 'main'], repoRoot)
  if (fetched.exitCode !== 0) return false
  const contained = await commandOk(command, 'git', ['-C', repoRoot, 'merge-base', '--is-ancestor', sha, 'origin/main'], repoRoot)
  return contained.exitCode === 0
}

/** Route every ambiguous clean/NOOP state through the authenticated, repository-locked push helper. */
async function retryAndProvePendingCommit(
  command: IdeasPublishCommand,
  repoRoot: string,
  stateDir: string,
  targetSha: string,
  expectedGeneration: string,
): Promise<boolean> {
  const script = path.join(repoRoot, 'scripts', 'commit-run.sh')
  if (!fs.existsSync(script)) return false
  const retried = await commandOk(command, 'bash', [script, '--retry-push', targetSha], repoRoot)
  const output = `${retried.stdout}\n${retried.stderr}`
  if (retried.exitCode !== 0) {
    rememberPendingCommit(stateDir, output, expectedGeneration)
    return false
  }
  const resultingSha = outputCommitSha(output) || targetSha
  if (!(await provePublished(command, repoRoot, resultingSha))) {
    rememberPendingCommit(stateDir, `COMMIT_SHA=${resultingSha}\n`, expectedGeneration)
    return false
  }
  return true
}

function clearPendingIfGeneration(stateDir: string, expectedGeneration: string): boolean {
  return withPendingLock(stateDir, () => {
    const current = readPending(stateDir)
    if (!current || current.generation !== expectedGeneration) return false
    try {
      fs.unlinkSync(pendingPath(stateDir))
      fsyncDirectory(stateDir)
    } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
    return true
  })
}

async function commandOk(command: IdeasPublishCommand, executable: string, args: string[], repoRoot: string): Promise<IdeasPublishCommandResult> {
  return command(executable, args, { cwd: repoRoot, timeoutMs: PUBLISH_TIMEOUT_MS })
}

async function existingDataPathspecs(repoRoot: string, command: IdeasPublishCommand): Promise<string[] | null> {
  const paths: string[] = []
  for (const rel of DATA_PATHS) {
    if (fs.existsSync(path.join(repoRoot, rel))) { paths.push(rel); continue }
    // Include a missing directory/file only when Git knows a tracked descendant. That captures deletions
    // without passing a never-created ideas_archive/ pathspec that makes `git add` abort the whole commit.
    const tracked = await commandOk(command, 'git', ['-C', repoRoot, 'ls-files', '--', rel], repoRoot)
    if (tracked.exitCode !== 0) return null
    if (tracked.stdout.trim()) paths.push(rel)
  }
  return paths
}

/** Retry pending/dirty publication. A clean temp directory is deliberately a no-op for unit callers. */
export async function publishPendingIdeas(
  repoRoot: string,
  stateDir: string,
  options: IdeasPublisherOptions = {},
): Promise<IdeasPublishResult> {
  const command = options.command || defaultCommand
  if (!options.command && !fs.existsSync(path.join(repoRoot, '.git'))) return { status: 'not_applicable', pending: false }

  const paths = await existingDataPathspecs(repoRoot, command)
  if (paths === null) return { status: 'failed', pending: true, reason: 'git_unavailable' }
  let pendingRecord = readPending(stateDir)
  if (fs.existsSync(pendingPath(stateDir)) && !pendingRecord) {
    return { status: 'failed', pending: true, reason: 'commit_failed' }
  }
  const status = paths.length
    ? await commandOk(command, 'git', ['-C', repoRoot, 'status', '--porcelain=v1', '--untracked-files=all', '--', ...paths], repoRoot)
    : { stdout: '', stderr: '', exitCode: 0 }
  if (status.exitCode !== 0) {
    if (pendingRecord) return { status: 'failed', pending: true, reason: 'git_unavailable' }
    markIdeasPublicationPending(stateDir, options.nowMs)
    return { status: 'failed', pending: true, reason: 'git_unavailable' }
  }
  const initiallyDirty = Boolean(status.stdout.trim())
  if (!pendingRecord && initiallyDirty) {
    markIdeasPublicationPending(stateDir, options.nowMs)
    pendingRecord = readPending(stateDir)
    if (!pendingRecord) return { status: 'failed', pending: true, reason: 'commit_failed' }
  }
  if (!pendingRecord) return { status: 'clean', pending: false }
  const publishGeneration = pendingRecord.generation
  try { await options.beforePublish?.() }
  catch { return { status: 'failed', pending: true, reason: 'commit_failed' } }
  const refreshedStatus = paths.length
    ? await commandOk(command, 'git', ['-C', repoRoot, 'status', '--porcelain=v1', '--untracked-files=all', '--', ...paths], repoRoot)
    : { stdout: '', stderr: '', exitCode: 0 }
  if (refreshedStatus.exitCode !== 0) return { status: 'failed', pending: true, reason: 'git_unavailable' }
  const dirty = Boolean(refreshedStatus.stdout.trim())

  // commit-run.sh pushes HEAD:main, so it is safe only from the production data-stream checkout itself.
  const branch = await commandOk(command, 'git', ['-C', repoRoot, 'symbolic-ref', '--quiet', 'HEAD'], repoRoot)
  if (branch.exitCode !== 0 || branch.stdout.trim() !== 'refs/heads/main') {
    return { status: 'failed', pending: true, reason: 'unsafe_branch' }
  }
  if (!dirty) {
    const head = pendingRecord?.target_sha || (await commandOk(command, 'git', ['-C', repoRoot, 'rev-parse', 'HEAD'], repoRoot)).stdout.trim()
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(head)) return { status: 'failed', pending: true, reason: 'git_unavailable' }
    if (!(await retryAndProvePendingCommit(command, repoRoot, stateDir, head, publishGeneration))) {
      return { status: 'failed', pending: true, reason: 'commit_failed' }
    }
    if (!clearPendingIfGeneration(stateDir, publishGeneration)) {
      return { status: 'failed', pending: true, reason: 'commit_failed' }
    }
    return { status: 'published', pending: false }
  }
  const script = path.join(repoRoot, 'scripts', 'commit-run.sh')
  if (!fs.existsSync(script)) return { status: 'failed', pending: true, reason: 'commit_failed' }
  const committed = await commandOk(command, 'bash', [
    script, 'Publish news idea lifecycle', '--', ...paths,
  ], repoRoot)
  if (committed.exitCode !== 0) {
    rememberPendingCommit(stateDir, `${committed.stdout}\n${committed.stderr}`, publishGeneration)
    return { status: 'failed', pending: true, reason: 'commit_failed' }
  }
  if (/^(?:|\s*NOOP=1\s*)$/.test(committed.stdout)) {
    // The status -> commit-run interval is intentionally outside the Git flock. A concurrent sweep can
    // commit the same Ideas paths and then fail its push, making our commit-run report NOOP on a clean but
    // still-local HEAD. Resolve that exact HEAD and retry/prove it; NOOP alone is never publication proof.
    const head = (await commandOk(command, 'git', ['-C', repoRoot, 'rev-parse', 'HEAD'], repoRoot)).stdout.trim()
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(head)) return { status: 'failed', pending: true, reason: 'git_unavailable' }
    if (!(await retryAndProvePendingCommit(command, repoRoot, stateDir, head, publishGeneration))) {
      return { status: 'failed', pending: true, reason: 'commit_failed' }
    }
    if (!clearPendingIfGeneration(stateDir, publishGeneration)) {
      return { status: 'failed', pending: true, reason: 'commit_failed' }
    }
    return { status: 'published', pending: false }
  }
  const resultingSha = outputCommitSha(`${committed.stdout}\n${committed.stderr}`)
  if (!resultingSha || !(await provePublished(command, repoRoot, resultingSha))) {
    if (resultingSha) rememberPendingCommit(stateDir, `COMMIT_SHA=${resultingSha}\n`, publishGeneration)
    return { status: 'failed', pending: true, reason: 'commit_failed' }
  }
  if (!clearPendingIfGeneration(stateDir, publishGeneration)) {
    return { status: 'failed', pending: true, reason: 'commit_failed' }
  }
  return { status: 'published', pending: false }
}
