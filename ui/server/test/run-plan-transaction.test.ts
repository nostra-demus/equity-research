process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { thesisPlan } from '../src/completion'
import { prepareRunPlanTransaction, recoverRunPlanTransactions } from '../src/run-plan-transaction'

const stateParent = path.join(REPO_ROOT, '.run-plan-transaction-tests')
fs.mkdirSync(stateParent, { recursive: true })
const state = fs.mkdtempSync(path.join(stateParent, 'state-'))
const selection = { provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default', expectedProfileKey: 'claude:sonnet:default' }
const createdTargets: string[] = []

function freshPlan(subject: string) {
  const plan = thesisPlan(subject, 'research', [], undefined, selection)
  createdTargets.push(path.join(REPO_ROOT, plan.targetRunRoot))
  return plan
}

try {
  const absentPlan = freshPlan('ZZTXNA')
  const absent = prepareRunPlanTransaction(crypto.randomUUID(), 'ZZTXNA', absentPlan, {}, state)
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'private prepare creates no fake run root')
  absent.activate()
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), true)
  absent.rollbackIfUnstarted('fixture pre-spawn failure')
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'pre-spawn rollback removes a new root')

  const existingPlan = freshPlan('ZZTXNB')
  const existingTarget = path.join(REPO_ROOT, existingPlan.targetRunRoot)
  fs.mkdirSync(existingTarget, { recursive: true })
  fs.writeFileSync(path.join(existingTarget, 'original.txt'), 'original\n')
  const existing = prepareRunPlanTransaction(crypto.randomUUID(), 'ZZTXNB', existingPlan, {}, state)
  fs.writeFileSync(path.join(existing.preparation.stagingRootAbs, 'new.txt'), 'new\n')
  existing.activate()
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), true)
  existing.rollbackIfUnstarted('fixture admission failure')
  assert.equal(fs.readFileSync(path.join(existingTarget, 'original.txt'), 'utf8'), 'original\n')
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), false, 'rollback restores the byte-identical prior root')

  const startedPlan = freshPlan('ZZTXNC')
  const startedTarget = path.join(REPO_ROOT, startedPlan.targetRunRoot)
  const startedRequest = crypto.randomUUID()
  const started = prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state)
  fs.writeFileSync(path.join(started.preparation.stagingRootAbs, 'started.txt'), 'paid child owns this root\n')
  started.activate()
  started.markPaidChildStarted()
  started.rollbackIfUnstarted('must be ignored')
  recoverRunPlanTransactions(state)
  assert.equal(fs.readFileSync(path.join(startedTarget, 'started.txt'), 'utf8'), 'paid child owns this root\n')
  assert.throws(
    () => prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state),
    /already started/,
    'a started request can never prepare a second attempt',
  )

  const crashPlan = freshPlan('ZZTXND')
  const crashTarget = path.join(REPO_ROOT, crashPlan.targetRunRoot)
  const crash = prepareRunPlanTransaction(crypto.randomUUID(), 'ZZTXND', crashPlan, {}, state)
  crash.activate()
  recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(crashTarget), false, 'restart recovery removes an activated root with no paid child')

  console.log('run-plan transaction: private prepare, atomic activation, rollback, start sealing, and crash recovery passed')
} finally {
  for (const target of createdTargets) fs.rmSync(target, { recursive: true, force: true })
  fs.rmSync(stateParent, { recursive: true, force: true })
}
