import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { acquireProviderRunDeployLease, providerDeployBarrierPath } from '../src/deploy-barrier'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../src/singleton-lock'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-deploy-barrier-'))
try {
  const firstRun = acquireProviderRunDeployLease(root)
  const secondRun = acquireProviderRunDeployLease(root)
  const exclusive = () => acquireRetainedFlockSync(providerDeployBarrierPath(root), {
    mode: 'exclusive', waitMs: 0, busyMessage: 'active run',
  })

  assert.throws(exclusive, (error: any) => error?.code === 'EBUSY',
    'one or more shared run leases must exclude deploy')
  firstRun()
  assert.throws(exclusive, (error: any) => error?.code === 'EBUSY',
    'deploy remains excluded until the last concurrent run releases')
  secondRun()

  const deploy = exclusive()
  assert.throws(() => acquireProviderRunDeployLease(root), (error: any) =>
    error?.code === 'deployment_in_progress' && error?.statusCode === 503,
  'an admitted deployment excludes a new provider run before spend')
  releaseRetainedFlock(deploy)

  const afterDeploy = acquireProviderRunDeployLease(root)
  afterDeploy()
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('deploy-barrier.test.ts: shared runs and exclusive deploy are race-free')
