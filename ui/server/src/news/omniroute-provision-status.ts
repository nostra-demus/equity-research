import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const OMNIROUTE_DISABLED_REASON = 'Provisioning pending · the deploy agent retries installation and the complete 12-item scorer smoke automatically; OmniRoute enables only after that proof passes'

const MAX_MARKER_BYTES = 160
const MAX_RETRY_MS = 86_400_000
const CLOCK_SKEW_MS = 5 * 60_000

const REASON_COPY: Readonly<Record<string, string>> = {
  'private-env-disable-failed': 'the engine could not safely disable the route before repair',
  'effective-descriptor-invalid': 'the reviewed route descriptor did not validate',
  'stale-service-removal-failed': 'the stale supervised service could not be removed safely',
  'package-provision-failed': 'the pinned OmniRoute package could not be installed',
  'installed-package-failed-version-proof': 'the installed OmniRoute binary did not match the pinned version',
  'service-install-failed': 'the supervised loopback service could not be installed',
  'post-install-contract-failed': 'the installed service did not match the reviewed contract',
  'loopback-service-health-failed': 'the supervised loopback service did not become healthy',
  'no-log-client-key-provision-failed': 'the private no-body client could not be provisioned safely',
  'authenticated-model-catalog-failed': 'the required model was absent from the authenticated catalog',
  'scorer-smoke-contract-failed': 'the two-pass 12-item scorer proof returned an unusable result',
  'scorer-body-persistence-proof-failed': 'the no-body persistence proof did not pass',
  'service-changed-during-scorer-smoke': 'the supervised service changed during the scorer proof',
  'descriptor-changed-during-scorer-smoke': 'the route descriptor changed during the scorer proof',
  'health-marker-stage-failed': 'the verified health marker could not be staged safely',
  'private-env-enable-failed': 'the private engine flag could not be enabled safely',
  'engine-health-failed-after-enable': 'the engine did not recover cleanly after enablement',
  'service-health-failed-after-enable': 'the loopback service failed its post-enable health check',
  'health-marker-publish-failed': 'the verified health marker could not be published safely',
}

const ROLLBACK_REASONS = new Set([
  'private-env-enable-failed',
  'engine-health-failed-after-enable',
  'service-health-failed-after-enable',
  'health-marker-publish-failed',
])

export interface OmniRouteRetryMarker {
  retryAtMs: number
  reason: string
}

function publicReason(reason: string): string | null {
  const exact = REASON_COPY[reason]
  if (exact) return exact
  const http = /^scorer-smoke-([1-5][0-9]{2}|failed)$/.exec(reason)
  if (http) return http[1] === 'failed'
    ? 'the production scorer proof failed before a safe HTTP status was available'
    : `the production scorer proof failed with HTTP ${http[1]}`
  for (const suffix of ['-disable-failed', '-engine-recovery-failed'] as const) {
    if (!reason.endsWith(suffix)) continue
    const base = reason.slice(0, -suffix.length)
    if (!ROLLBACK_REASONS.has(base)) return null
    const rollback = suffix === '-disable-failed'
      ? 'the safe disable rollback also failed'
      : 'the engine did not recover cleanly after the safe rollback'
    return `${REASON_COPY[base]}; ${rollback}`
  }
  return null
}

/** Parse only the deploy script's one-line, non-secret retry contract. Unsupported reasons fail closed. */
export function parseOmniRouteRetryMarker(raw: string): OmniRouteRetryMarker | null {
  if (Buffer.byteLength(raw, 'utf8') > MAX_MARKER_BYTES) return null
  const match = /^([1-9][0-9]{9}) ([a-z0-9]+(?:-[a-z0-9]+)*)\n?$/.exec(raw)
  if (!match || !publicReason(match[2])) return null
  const epochSeconds = Number(match[1])
  if (!Number.isSafeInteger(epochSeconds)) return null
  return { retryAtMs: epochSeconds * 1000, reason: match[2] }
}

function readRetryMarker(homeDir: string): OmniRouteRetryMarker | null {
  const markerPath = path.join(homeDir, '.nostra-ops', '.omniroute-retry')
  const parentPath = path.dirname(markerPath)
  let fd: number | null = null
  try {
    const parent = fs.lstatSync(parentPath)
    const before = fs.lstatSync(markerPath)
    const uid = typeof process.getuid === 'function' ? process.getuid() : before.uid
    if (!parent.isDirectory() || parent.isSymbolicLink() || parent.uid !== uid || (parent.mode & 0o022) !== 0
        || !before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.uid !== uid
        || (before.mode & 0o077) !== 0 || before.size < 1 || before.size > MAX_MARKER_BYTES) return null
    fd = fs.openSync(markerPath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(fd)
    const sameFile = (candidate: fs.Stats): boolean => candidate.isFile() && !candidate.isSymbolicLink()
      && candidate.dev === opened.dev && candidate.ino === opened.ino && candidate.size === opened.size
      && candidate.mtimeMs === opened.mtimeMs && candidate.ctimeMs === opened.ctimeMs
      && candidate.mode === opened.mode && candidate.uid === uid && candidate.nlink === 1
      && (candidate.mode & 0o077) === 0
    if (!sameFile(before) || !sameFile(opened)) return null
    const bytes = Buffer.alloc(opened.size)
    if (fs.readSync(fd, bytes, 0, opened.size, 0) !== opened.size) return null
    const after = fs.fstatSync(fd)
    const named = fs.lstatSync(markerPath)
    const parentAfter = fs.lstatSync(parentPath)
    if (!sameFile(after) || !sameFile(named)
        || !parentAfter.isDirectory() || parentAfter.isSymbolicLink()
        || parentAfter.dev !== parent.dev || parentAfter.ino !== parent.ino || parentAfter.uid !== parent.uid
        || parentAfter.mode !== parent.mode || parentAfter.mtimeMs !== parent.mtimeMs
        || parentAfter.ctimeMs !== parent.ctimeMs || parentAfter.nlink !== parent.nlink
        || parentAfter.uid !== uid || (parentAfter.mode & 0o022) !== 0) return null
    return parseOmniRouteRetryMarker(bytes.toString('utf8'))
  } catch {
    return null
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* read-only diagnostics must never throw */ }
  }
}

function utcMinute(atMs: number): string {
  return new Date(atMs).toISOString().replace('T', ' ').replace(/:\d{2}\.000Z$/, ' UTC')
}

/** Add only a bounded, allowlisted status. Missing, unsafe, and rolling-deploy markers stay generic. */
export function omniRouteDisabledReason(homeDir = os.homedir(), nowMs = Date.now()): string {
  const marker = readRetryMarker(homeDir)
  if (!marker) return OMNIROUTE_DISABLED_REASON
  const waitMs = marker.retryAtMs - nowMs
  if (waitMs > MAX_RETRY_MS + CLOCK_SKEW_MS) return OMNIROUTE_DISABLED_REASON
  const reason = publicReason(marker.reason)
  if (!reason) return OMNIROUTE_DISABLED_REASON
  const status = waitMs > 0
    ? `next automatic retry at ${utcMinute(marker.retryAtMs)} (in ${Math.max(1, Math.ceil(waitMs / 60_000))}m)`
    : `automatic retry has been eligible since ${utcMinute(marker.retryAtMs)}; the deploy agent may be stalled or a retry may be in progress`
  return `${OMNIROUTE_DISABLED_REASON}. Last recorded deploy status: ${reason}; ${status}.`
}
