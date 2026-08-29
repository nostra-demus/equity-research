process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from '../src/config'
import { thesisPlan } from '../src/completion'
import { prepareRunPlanTransaction, recoverRunPlanTransactions } from '../src/run-plan-transaction'

const stateParent = path.join(REPO_ROOT, '.run-plan-transaction-tests')
fs.mkdirSync(stateParent, { recursive: true })
const state = fs.mkdtempSync(path.join(stateParent, 'state-'))
const selection = { provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default', expectedProfileKey: 'claude:sonnet:default' }
const createdTargets: string[] = []
const createdRequests: string[] = []

function newRequestId(): string {
  const requestId = crypto.randomUUID()
  createdRequests.push(requestId)
  return requestId
}

function freshPlan(subject: string) {
  const plan = thesisPlan(subject, 'research', [], undefined, selection)
  createdTargets.push(path.join(REPO_ROOT, plan.targetRunRoot))
  return plan
}

try {
  const absentPlan = freshPlan('ZZTXNA')
  const absent = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNA', absentPlan, {}, state)
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'private prepare creates no fake run root')
  await absent.activate()
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), true)
  await absent.rollbackIfUnstarted('fixture pre-spawn failure')
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'pre-spawn rollback removes a new root')

  const existingPlan = freshPlan('ZZTXNB')
  const existingTarget = path.join(REPO_ROOT, existingPlan.targetRunRoot)
  fs.mkdirSync(existingTarget, { recursive: true })
  fs.writeFileSync(path.join(existingTarget, 'original.txt'), 'original\n')
  const existing = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNB', existingPlan, {}, state)
  fs.writeFileSync(path.join(existing.preparation.stagingRootAbs, 'new.txt'), 'new\n')
  await existing.activate()
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), true)
  await existing.rollbackIfUnstarted('fixture admission failure')
  assert.equal(fs.readFileSync(path.join(existingTarget, 'original.txt'), 'utf8'), 'original\n')
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), false, 'rollback restores the byte-identical prior root')

  const startedPlan = freshPlan('ZZTXNC')
  const startedTarget = path.join(REPO_ROOT, startedPlan.targetRunRoot)
  const startedRequest = newRequestId()
  const started = await prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state)
  fs.writeFileSync(path.join(started.preparation.stagingRootAbs, 'started.txt'), 'paid child owns this root\n')
  await started.activate()
  await started.markPaidChildSpawning()
  await started.markPaidChildStarted()
  await started.rollbackIfUnstarted('must be ignored')
  await recoverRunPlanTransactions(state)
  assert.equal(fs.readFileSync(path.join(startedTarget, 'started.txt'), 'utf8'), 'paid child owns this root\n')
  await assert.rejects(
    prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state),
    /already crossed the paid provider boundary/,
    'a started request can never prepare a second attempt',
  )

  const crashPlan = freshPlan('ZZTXND')
  const crashTarget = path.join(REPO_ROOT, crashPlan.targetRunRoot)
  const crash = await prepareRunPlanTransaction(newRequestId(), 'ZZTXND', crashPlan, {}, state)
  await crash.activate()
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(crashTarget), false, 'restart recovery removes an activated root with no paid child')

  const spawningPlan = freshPlan('ZZTXNE')
  const spawningTarget = path.join(REPO_ROOT, spawningPlan.targetRunRoot)
  const spawningRequest = newRequestId()
  const spawning = await prepareRunPlanTransaction(spawningRequest, 'ZZTXNE', spawningPlan, {}, state)
  await spawning.activate()
  await spawning.markPaidChildSpawning()
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(spawningTarget), true, 'restart never rolls back a root a detached child may own')
  await assert.rejects(
    prepareRunPlanTransaction(spawningRequest, 'ZZTXNE', spawningPlan, {}, state),
    /already crossed the paid provider boundary/,
  )

  const failedSpawnPlan = freshPlan('ZZTXNF')
  const failedSpawnTarget = path.join(REPO_ROOT, failedSpawnPlan.targetRunRoot)
  const failedSpawn = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNF', failedSpawnPlan, {}, state)
  await failedSpawn.activate()
  await failedSpawn.markPaidChildSpawning()
  await failedSpawn.rollbackIfUnstarted('spawn synchronously failed and no child exists')
  assert.equal(fs.existsSync(failedSpawnTarget), false, 'a proved no-child spawn failure rolls back atomically')

  console.log('run-plan transaction: private prepare, atomic activation, rollback, start sealing, and crash recovery passed')
} finally {
  for (const target of createdTargets) fs.rmSync(target, { recursive: true, force: true })
  for (const requestId of createdRequests) {
    fs.rmSync(path.join(ANALYSES_DIR, '.run-plan-transactions', requestId), { recursive: true, force: true })
  }
  fs.rmSync(stateParent, { recursive: true, force: true })
}
