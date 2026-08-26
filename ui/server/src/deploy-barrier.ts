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

export function providerDeployBarrierPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, PROVIDER_DEPLOY_BARRIER_FILE)
}

export function providerDeployIntentPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, PROVIDER_DEPLOY_INTENT_FILE)
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
