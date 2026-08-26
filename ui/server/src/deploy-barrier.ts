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

export function providerDeployBarrierPath(stateDir = STATE_DIR): string {
  return path.join(stateDir, PROVIDER_DEPLOY_BARRIER_FILE)
}

export function acquireProviderRunDeployLease(stateDir = STATE_DIR): () => void {
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
  let released = false
  return () => {
    if (released) return
    released = true
    releaseRetainedFlock(descriptor)
  }
}
