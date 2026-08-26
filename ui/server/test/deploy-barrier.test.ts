import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  acquireProviderRunDeployLease, providerDeployBarrierPath, withProviderRunDeployLease,
} from '../src/deploy-barrier'
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

  let finishAsync!: () => void
  let enteredAsync!: () => void
  const entered = new Promise<void>((resolve) => { enteredAsync = resolve })
  const finish = new Promise<void>((resolve) => { finishAsync = resolve })
  const inFlight = withProviderRunDeployLease(root, async () => {
    enteredAsync()
    await finish
    return 42
  })
  await entered
  assert.throws(exclusive, (error: any) => error?.code === 'EBUSY',
    'the async scanner lifecycle retains its shared deploy lease until every awaited step settles')
  finishAsync()
  assert.equal(await inFlight, 42)
  const afterAsync = exclusive()
  releaseRetainedFlock(afterAsync)

  await assert.rejects(
    withProviderRunDeployLease(root, async () => { throw new Error('scanner failed') }),
    /scanner failed/,
  )
  const afterRejectedAsync = exclusive()
  releaseRetainedFlock(afterRejectedAsync)
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('deploy-barrier.test.ts: shared runs and exclusive deploy are race-free')
