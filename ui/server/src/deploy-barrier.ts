import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { acquireRetainedFlockSync, releaseRetainedFlock } from './singleton-lock'

/**
 * One stable kernel barrier shared by every cockpit run and the production deployer.
 *
 * Runs retain shared leases for their whole logical lifetime. deploy.sh must acquire
 * the exclusive side before it mutates the checkout or restarts the server. The
 * kernel, rather than a status poll, therefore closes the admission-vs-restart race.
 */
export const PROVIDER_DEPLOY_BARRIER_FILE = 'provider-deploy-barrier.flock'
export const PROVIDER_DEPLOY_INTENT_FILE = 'provider-deploy-pending'
export const DEPLOYMENT_STATUS_FILE = 'deployment-status.json'

export type DeploymentStatus = {
  schemaVersion: 1
  status: 'current' | 'pending'
  targetSha: string
  deployedSha: string | null
  authorizedCodeSha: string | null
  pendingSince: number | null
  checkedAt: number
  reason: 'observed' | 'dirty_nondata' | 'ci_not_green' | 'authorization_ready' | 'deploying'
    | 'deployed' | 'local_diverged' | 'build_failed' | 'audit_pending'
}

const SHA = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/
const DEPLOYMENT_REASONS = new Set<DeploymentStatus['reason']>([
  'observed', 'dirty_nondata', 'ci_not_green', 'authorization_ready', 'deploying',
  'deployed', 'local_diverged', 'build_failed', 'audit_pending',
])

export function providerDeployBarrierPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, PROVIDER_DEPLOY_BARRIER_FILE)
}

export function providerDeployIntentPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, PROVIDER_DEPLOY_INTENT_FILE)
}

export function deploymentStatusPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, DEPLOYMENT_STATUS_FILE)
}

/** Read the deployer's small owner-only observation. Invalid/stale-shaped bytes are never guessed. */
export function readDeploymentStatus(stateDir = STATE_DIR): DeploymentStatus | null {
  const statusPath = deploymentStatusPath(stateDir)
  let descriptor: number | null = null
  try {
    const named = fs.lstatSync(statusPath)
    if (!named.isFile() || named.isSymbolicLink() || named.size > 16 * 1024 || (named.mode & 0o077) !== 0) return null
    const uid = typeof process.getuid === 'function' ? process.getuid() : named.uid
    if (named.uid !== uid || named.nlink !== 1) return null
    descriptor = fs.openSync(statusPath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(descriptor)
    if (opened.dev !== named.dev || opened.ino !== named.ino || opened.uid !== uid || opened.nlink !== 1) return null
    const value = JSON.parse(fs.readFileSync(descriptor, 'utf8')) as Partial<DeploymentStatus>
    const nullableSha = (candidate: unknown) => candidate === null || (typeof candidate === 'string' && SHA.test(candidate))
    const pendingSinceValid = value.status === 'pending'
      ? typeof value.pendingSince === 'number' && Number.isSafeInteger(value.pendingSince) && value.pendingSince > 0
      : value.pendingSince === null
    if (value.schemaVersion !== 1 || (value.status !== 'current' && value.status !== 'pending')
      || typeof value.targetSha !== 'string' || !SHA.test(value.targetSha)
      || !nullableSha(value.deployedSha) || !nullableSha(value.authorizedCodeSha)
      || !pendingSinceValid || typeof value.checkedAt !== 'number' || !Number.isSafeInteger(value.checkedAt)
      || value.checkedAt <= 0 || typeof value.reason !== 'string'
      || !DEPLOYMENT_REASONS.has(value.reason as DeploymentStatus['reason'])) return null
    if (value.status === 'current' && value.deployedSha !== value.targetSha) return null
    if (value.status === 'pending' && value.deployedSha === value.targetSha) return null
    return value as DeploymentStatus
  } catch {
    return null
  } finally {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch {}
  }
}

/**
 * A deployment intent is a writer-priority turnstile, not a completion receipt.
 *
 * deploy.sh publishes this owner-only file before it tries the exclusive lifecycle flock. Existing shared
 * leases may finish, but every later run admission fails closed until the deployer owns the flock and clears
 * the intent on exit. Checking both before and after the shared acquisition closes the check/acquire race:
 * a deploy intent created between the two checks cannot leave a new reader stranded ahead of the writer.
 */
export function providerDeployPending(stateDir = STATE_DIR): boolean {
  try { fs.lstatSync(providerDeployIntentPath(stateDir)); return true }
  catch (error: any) { return error?.code !== 'ENOENT' }
}

function deploymentInProgressError(): Error & { statusCode: number; code: string; body: { code: string } } {
  return Object.assign(
    new Error('A reviewed engine deployment is pending. Retry the run after the cockpit reconnects.'),
    { statusCode: 503, code: 'deployment_in_progress', body: { code: 'deployment_in_progress' } },
  )
}

export function acquireProviderRunDeployLease(
  stateDir = STATE_DIR,
  intentPending: () => boolean = () => providerDeployPending(stateDir),
): () => void {
  if (intentPending()) throw deploymentInProgressError()
  let descriptor: number
  try {
    descriptor = acquireRetainedFlockSync(providerDeployBarrierPath(stateDir), {
      mode: 'shared',
      waitMs: 0,
      busyMessage: 'A reviewed engine deployment is in progress. Retry the run after the cockpit reconnects.',
    })
  } catch (error: any) {
    if (error?.code === 'EBUSY') {
      error.statusCode = 503
      error.code = 'deployment_in_progress'
      error.body = { code: 'deployment_in_progress' }
    }
    throw error
  }
  // Writer intent can land after the first check but before this shared flock. Release immediately so the
  // pending deployment observes a draining reader set rather than being starved by this new admission.
  if (intentPending()) {
    releaseRetainedFlock(descriptor)
    throw deploymentInProgressError()
  }
  let released = false
  return () => {
    if (released) return
    released = true
    releaseRetainedFlock(descriptor)
  }
}

/** Retain the shared side for an entire async provider/scanner lifecycle, including every awaited
 * persistence step. The finally boundary is the contract: a rejection cannot strand deployment, while a
 * live promise cannot be restarted out from under its durable completion receipt. */
export async function withProviderRunDeployLease<T>(stateDir: string, run: () => Promise<T>): Promise<T> {
  const release = acquireProviderRunDeployLease(stateDir)
  try { return await run() }
  finally { release() }
}
