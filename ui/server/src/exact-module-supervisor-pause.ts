import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import type { RunStatus } from './types'

const EXACT_MODULE_PAUSE_REASON = 'exact_module_only'

export interface ExactModuleSupervisorPause {
  /** Keep the durable pause after an admitted exact run (including a deliberate Stop). */
  keep: () => void
  /** Restore the precise pre-click resume policy when no paid child was ever started. */
  rollback: () => void
}

/** Pure terminal policy shared by the route and regression tests. */
export function settleExactModuleSupervisorPause(
  pause: ExactModuleSupervisorPause,
  status: RunStatus,
  paidChildStarted: boolean,
): void {
  if (status === 'cancelled' || paidChildStarted) pause.keep()
  else pause.rollback()
}

type MarkerName = '.interrupted' | '.aborted'
type MarkerRoot = { abs: string; real: string }
type SavedMarker = { present: false } | { present: true; raw: string; body: Record<string, unknown> }

function resolveRealMarkerRoot(runRoot: string): MarkerRoot {
  if (!runRoot || path.isAbsolute(runRoot)) throw new Error('unsafe exact-module run root')
  const abs = path.resolve(REPO_ROOT, runRoot)
  if (path.dirname(abs) !== ANALYSES_DIR) throw new Error('unsafe exact-module run root')
  let stat: fs.Stats
  try { stat = fs.lstatSync(abs) } catch { throw new Error('exact-module run root is unavailable') }
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('exact-module run root is not a real directory')
  try {
    const analysesReal = fs.realpathSync(ANALYSES_DIR)
    const real = fs.realpathSync(abs)
    // macOS canonicalizes /var -> /private/var. Compare canonical child/parent identities, not lexical
    // spellings, while the lstat above still rejects a symlink at the run-root leaf itself.
    if (path.dirname(real) !== analysesReal || path.basename(real) !== path.basename(abs)) {
      throw new Error('symlinked exact-module run root')
    }
    return { abs, real }
  } catch (error) {
    if (error instanceof Error && error.message === 'symlinked exact-module run root') throw error
    throw new Error('exact-module run root could not be resolved safely')
  }
}

function assertRootStillReal(root: MarkerRoot): void {
  const stat = fs.lstatSync(root.abs)
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(root.abs) !== root.real) {
    throw new Error('exact-module run root changed during marker update')
  }
}

const markerPath = (root: MarkerRoot, name: MarkerName) => path.join(root.abs, name)

function markerLstat(root: MarkerRoot, name: MarkerName): fs.Stats | null {
  assertRootStillReal(root)
  try {
    const stat = fs.lstatSync(markerPath(root, name))
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`unsafe ${name} marker leaf`)
    return stat
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function snapshotMarker(root: MarkerRoot, name: MarkerName): SavedMarker {
  const before = markerLstat(root, name)
  if (!before) return { present: false }
  let fd: number | null = null
  try {
    fd = fs.openSync(markerPath(root, name), fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(fd)
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`unsafe ${name} marker leaf`)
    }
    const raw = fs.readFileSync(fd, 'utf8')
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('marker is not an object')
    return { present: true, raw, body }
  } catch {
    throw new Error(`could not safely read existing ${name} marker`)
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
  }
}

function fsyncMarkerRoot(root: MarkerRoot): void {
  let fd: number | null = null
  try {
    fd = fs.openSync(root.abs, fs.constants.O_RDONLY)
    fs.fsyncSync(fd)
  } catch { /* file fsync + atomic rename remain the primary durability boundary */ }
  finally { if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ } }
}

function atomicWriteMarker(root: MarkerRoot, name: MarkerName, raw: string): void {
  markerLstat(root, name) // fail closed on an existing symlink/device/directory before any write
  const temp = path.join(root.abs, `.exact-module-marker-${process.pid}-${randomUUID()}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(temp,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600)
    fs.writeFileSync(fd, raw, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    assertRootStillReal(root)
    markerLstat(root, name) // a leaf swapped to a symlink while writing is rejected, never followed
    fs.renameSync(temp, markerPath(root, name))
    fsyncMarkerRoot(root)
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(temp) } catch { /* renamed or already absent */ }
  }
}

function atomicWriteMarkerBody(root: MarkerRoot, name: MarkerName, body: Record<string, unknown>): void {
  atomicWriteMarker(root, name, JSON.stringify({ ...body, at: new Date().toISOString() }) + '\n')
}

function safeClearMarker(root: MarkerRoot, name: MarkerName): void {
  if (!markerLstat(root, name)) return
  fs.unlinkSync(markerPath(root, name)) // unlink removes the checked leaf; it never follows its contents
  fsyncMarkerRoot(root)
}

function restoreMarker(root: MarkerRoot, name: MarkerName, saved: SavedMarker): void {
  if (saved.present) atomicWriteMarker(root, name, saved.raw)
  else safeClearMarker(root, name)
}

function markerRestored(root: MarkerRoot, name: MarkerName, saved: SavedMarker): boolean {
  try {
    const current = snapshotMarker(root, name)
    return saved.present ? current.present && current.raw === saved.raw : !current.present
  } catch {
    return false
  }
}

/**
 * Durably consume an old autonomous-full-resume signal before an exact standalone module is admitted.
 * `.aborted` is intentionally reused as the supervisor's existing restart-safe "manual control" flag:
 * the exact run is a scoped human choice, so neither success nor Stop may wake a prior full-chain plan.
 *
 * The caller may roll back only when launch fails before a paid child exists. Once a child starts (or the
 * user presses Stop), keep the pause; an explicit later full launch already clears `.aborted` itself.
 */
export function beginExactModuleSupervisorPause(
  runRoot: string,
  module: string,
): ExactModuleSupervisorPause {
  const root = resolveRealMarkerRoot(runRoot)
  // Snapshot both leaves before mutation. A pre-existing symlink/non-regular marker fails here, so neither
  // its external target nor the other run-root marker can be changed by this click.
  const interrupted = snapshotMarker(root, '.interrupted')
  const aborted = snapshotMarker(root, '.aborted')

  try {
    // Write the excluding marker first. During the two synchronous operations, a scanner can see both flags
    // but can never see an eligible `.interrupted` without `.aborted`.
    atomicWriteMarkerBody(root, '.aborted', { reason: EXACT_MODULE_PAUSE_REASON, module })
    const paused = snapshotMarker(root, '.aborted')
    if (!paused.present || paused.body.reason !== EXACT_MODULE_PAUSE_REASON || paused.body.module !== module) {
      throw new Error('could not verify exact-module pause marker')
    }
    safeClearMarker(root, '.interrupted')
    if (snapshotMarker(root, '.interrupted').present) {
      throw new Error('could not durably consume the interrupted-run marker')
    }
  } catch (error) {
    // Best-effort exact rollback. If an external actor swaps in an unsafe leaf, restoreMarker fails closed
    // without following it; the route rejects and starts no paid child.
    try { restoreMarker(root, '.aborted', aborted) } catch { /* fail closed */ }
    try { restoreMarker(root, '.interrupted', interrupted) } catch { /* fail closed */ }
    throw error
  }

  let settled = false
  return {
    keep: () => { settled = true },
    rollback: () => {
      if (settled) return
      // Restore the excluding marker first, then the eligible marker. This ordering again prevents a
      // transient eligible `.interrupted` from appearing without its prior `.aborted` policy.
      try { restoreMarker(root, '.aborted', aborted) } catch { /* checked below */ }
      try { restoreMarker(root, '.interrupted', interrupted) } catch { /* checked below */ }
      if (!markerRestored(root, '.aborted', aborted)
          || !markerRestored(root, '.interrupted', interrupted)) {
        // A partial rollback must fail closed: never leave the old `.interrupted` eligible beside a lost
        // excluding marker. The exact pause is safer than an autonomous full launch the user did not request.
        try { atomicWriteMarkerBody(root, '.aborted', { reason: EXACT_MODULE_PAUSE_REASON, module }) } catch { /* fail closed */ }
        try { safeClearMarker(root, '.interrupted') } catch { /* unsafe leaves are never followed */ }
      }
      settled = true
    },
  }
}
