import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  acquireProviderRunDeployLease, deploymentStatusPath, providerDeployBarrierPath, providerDeployIntentPath,
  readDeploymentStatus,
  withProviderRunDeployLease,
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

  const target = 'a'.repeat(40)
  const deployed = 'b'.repeat(40)
  fs.writeFileSync(deploymentStatusPath(root), JSON.stringify({
    schemaVersion: 1, status: 'pending', targetSha: target, deployedSha: deployed,
    authorizedCodeSha: null, pendingSince: 1, checkedAt: 2, reason: 'ci_not_green',
  }) + '\n', { mode: 0o600 })
  assert.deepEqual(await readDeploymentStatus(root), {
    schemaVersion: 1, status: 'pending', targetSha: target, deployedSha: deployed,
    authorizedCodeSha: null, pendingSince: 1, checkedAt: 2, reason: 'ci_not_green',
  }, 'the health path reads the exact durable deployment-lag observation')
  fs.chmodSync(deploymentStatusPath(root), 0o644)
  assert.equal(await readDeploymentStatus(root), null, 'unsafe deployment status permissions fail closed')
  fs.unlinkSync(deploymentStatusPath(root))
  fs.symlinkSync('/dev/null', deploymentStatusPath(root))
  assert.equal(await readDeploymentStatus(root), null, 'deployment status never follows a symlink')
  fs.unlinkSync(deploymentStatusPath(root))

  const incumbent = acquireProviderRunDeployLease(root)
  fs.writeFileSync(providerDeployIntentPath(root), 'a'.repeat(40) + ' 1\n', { mode: 0o600 })
  assert.throws(() => acquireProviderRunDeployLease(root), (error: any) =>
    error?.code === 'deployment_in_progress' && error?.statusCode === 503,
  'a published writer intent must stop new scanner admissions before they take a shared lease')
  let invokedWhilePending = false
  await assert.rejects(
    withProviderRunDeployLease(root, async () => { invokedWhilePending = true }),
    (error: any) => error?.code === 'deployment_in_progress',
  )
  assert.equal(invokedWhilePending, false, 'pending deployment must refuse provider work before its callback')
  assert.throws(exclusive, (error: any) => error?.code === 'EBUSY',
    'writer intent drains but never interrupts the provider lifecycle that was already admitted')
  incumbent()
  const prioritizedWriter = exclusive()
  releaseRetainedFlock(prioritizedWriter)
  fs.unlinkSync(providerDeployIntentPath(root))

  let intentChecks = 0
  assert.throws(
    () => acquireProviderRunDeployLease(root, () => ++intentChecks === 2),
    (error: any) => error?.code === 'deployment_in_progress',
    'a writer intent published during shared acquisition must release the raced reader immediately',
  )
  const afterIntentRace = exclusive()
  releaseRetainedFlock(afterIntentRace)

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

console.log('deploy-barrier.test.ts: shared runs, writer intent, and exclusive deploy are race-free')
