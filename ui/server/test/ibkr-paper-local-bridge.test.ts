import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { paperTargetFingerprint, runLocalPaperBridge } from '../src/ibkr-paper-local-bridge'
import type { PaperExecutionResult } from '../src/ibkr-paper-execution'
import type { CallPolicyTarget } from '../src/paper-call-ledger'

const revisionA = 'a'.repeat(40)
const revisionB = 'b'.repeat(40)
const baseTarget: CallPolicyTarget = {
  valid: true, source_path: 'published Calls history', generated_at: '2026-08-25T00:00:00.000Z',
  gross_pct: 5, cash_pct: 95,
  positions: [{
    ticker: 'AMZN', decision: 'Starter Position Only', side: 'long', conviction: 'low', confidence: 70,
    model_weight_pct: 5, currency: 'USD', exchange: 'NASDAQ', call_id: 'call-amzn', decision_date: '2026-08-25',
  }],
  blocked_calls: [], detail: 'one target',
}

const aligned: PaperExecutionResult = {
  ok: true, paper_only: true, action: 'sync', detail: 'aligned', orders: [], skipped: [],
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-'))
let syncs = 0
let result: PaperExecutionResult = {
  ok: true, paper_only: true, action: 'sync', detail: 'phase one',
  orders: [{ order_id: 1, ticker: 'AMZN', action: 'BUY', quantity: 5, status: 'Submitted', detail: 'submitted' }],
  skipped: [{ ticker: 'MSFT', reason: 'waiting for the first risk-reducing phase' }],
}
let revision = revisionA
let target = structuredClone(baseTarget)
const run = () => runLocalPaperBridge({
  enabled: true, operatorAuthorized: true, stateDir: root,
  revision: () => revision, target: async () => target,
  sync: async (_key, command) => {
    syncs++
    assert.equal(command.reconcilePositions, true)
    assert.equal(command.publishedRevision, revision)
    return result
  },
  now: () => new Date('2026-08-25T00:00:00.000Z'),
})

assert.equal((await run())?.outcome, 'pending')
assert.equal(syncs, 1)
result = aligned
assert.equal((await run())?.outcome, 'aligned', 'pending phases retry until the exact target is aligned')
assert.equal(syncs, 2)
assert.equal((await run())?.outcome, 'aligned')
assert.equal(syncs, 2, 'an aligned target stays untouched so a manual close remains cash')

const submittedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-submitted-'))
let submittedSyncs = 0
for (let index = 0; index < 2; index++) {
  const submittedAttempt = await runLocalPaperBridge({
    enabled: true, operatorAuthorized: true, stateDir: submittedRoot,
    revision: () => revisionA, target: async () => baseTarget,
    sync: async () => {
      submittedSyncs++
      return { ...aligned, detail: 'accepted', orders: [{
        order_id: 9, ticker: 'AMZN', action: 'BUY', quantity: 5, status: 'Submitted', detail: 'submitted',
      }] }
    },
  })
  assert.equal(submittedAttempt?.outcome, 'submitted')
}
assert.equal(submittedSyncs, 1, 'an accepted complete intent is not recreated after an operator cancels it')

target = { ...structuredClone(baseTarget), positions: [{ ...baseTarget.positions[0], confidence: 80, conviction: 'high', model_weight_pct: 10 }] }
revision = revisionB
assert.equal((await run())?.outcome, 'aligned')
assert.equal(syncs, 3, 'a target-changing published review or call reconciles again')

assert.equal(paperTargetFingerprint({ ...baseTarget, generated_at: '2099-01-01T00:00:00.000Z' }), paperTargetFingerprint(baseTarget),
  'volatile projection timestamps do not create trades')

const blockedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-blocked-'))
let blockedSyncs = 0
const blockedResult: PaperExecutionResult = {
  ok: true, paper_only: true, action: 'sync', detail: 'waiting', orders: [],
  skipped: [{ ticker: 'AMZN', reason: 'TWS order is pending' }],
}
for (let index = 0; index < 2; index++) {
  const attempt = await runLocalPaperBridge({
    enabled: true, operatorAuthorized: true, stateDir: blockedRoot,
    revision: () => revisionA, target: async () => baseTarget,
    sync: async () => { blockedSyncs++; return blockedResult },
  })
  assert.equal(attempt?.outcome, 'blocked')
  assert.match(attempt?.detail || '', /AMZN: TWS order is pending/)
}
assert.equal(blockedSyncs, 2, 'a waiting phase is retried from a fresh broker snapshot')

const errorRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-error-'))
const errorAttempt = await runLocalPaperBridge({
  enabled: true, operatorAuthorized: true, stateDir: errorRoot,
  revision: () => revisionA, target: async () => baseTarget,
  sync: async () => { throw new Error('failed at C:/Program Files/Nostra/private/paper.env') },
})
assert.equal(errorAttempt?.outcome, 'error')
assert.doesNotMatch(errorAttempt?.detail || '', /Program Files|Nostra|paper\.env/)
assert.match(errorAttempt?.detail || '', /\[PATH\]/)

let unauthorizedSyncs = 0
const unauthorized = await runLocalPaperBridge({
  enabled: true, operatorAuthorized: false, stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-auth-')),
  revision: () => revisionA, target: async () => baseTarget,
  sync: async () => { unauthorizedSyncs++; return aligned },
})
assert.equal(unauthorized?.outcome, 'error')
assert.equal(unauthorizedSyncs, 0)
assert.equal(await runLocalPaperBridge({
  enabled: false, operatorAuthorized: true, stateDir: root,
  revision: () => { throw new Error('must not run') }, target: async () => baseTarget,
  sync: async () => aligned,
}), null)

assert.equal(fs.statSync(path.join(root, 'latest.json')).mode & 0o777, 0o600)
console.log('ibkr-paper-local-bridge.test.ts: 13 passed')
