import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
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

const suiteRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-local-bridge-suite-'))
const cleanup = () => fs.rmSync(suiteRoot, { recursive: true, force: true })
process.once('exit', cleanup)
const stateDir = (name: string) => {
  const directory = path.join(suiteRoot, name)
  fs.mkdirSync(directory, { recursive: true })
  return directory
}

const root = stateDir('phase-retry')
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

const submittedRoot = stateDir('submitted')
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
const alternatePosition = {
  ...baseTarget.positions[0], ticker: 'MSFT', call_id: 'call-msft', decision_date: '2026-08-24',
}
const blockedA = { ticker: 'NVDA', decision: 'Watchlist', decision_date: '2026-08-23', reason: 'not actionable' }
const blockedB = { ticker: 'TSLA', decision: 'Avoid', decision_date: '2026-08-22', reason: 'risk cap' }
const orderedTarget = {
  ...baseTarget,
  positions: [baseTarget.positions[0], alternatePosition],
  blocked_calls: [blockedA, blockedB],
}
assert.equal(
  paperTargetFingerprint(orderedTarget),
  paperTargetFingerprint({ ...orderedTarget, positions: [...orderedTarget.positions].reverse(), blocked_calls: [...orderedTarget.blocked_calls].reverse() }),
  'position and blocked-call input order cannot change the cross-machine fingerprint',
)

const blockedRoot = stateDir('blocked')
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

const errorRoot = stateDir('error')
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
  enabled: true, operatorAuthorized: false, stateDir: stateDir('unauthorized'),
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

const fakeHome = stateDir('stale-lock-home')
const fakeProd = stateDir('stale-lock-prod')
const fakeServer = path.join(fakeProd, 'ui/server')
const fakeTsx = path.join(fakeServer, 'node_modules/.bin/tsx')
const fakeDeploy = path.join(fakeHome, '.nostra-ops/deploy.sh')
const fakeConfig = path.join(fakeHome, '.config/nostra-engine/paper.env')
const fakeNode = path.join(suiteRoot, 'fake-node.sh')
const marker = path.join(suiteRoot, 'bridge-ran')
const staleLock = path.join(fakeHome, 'Library/Application Support/nostradamus/ibkr-paper-local-bridge/run.lock')
fs.mkdirSync(path.dirname(fakeTsx), { recursive: true })
fs.mkdirSync(path.dirname(fakeDeploy), { recursive: true })
fs.mkdirSync(path.dirname(fakeConfig), { recursive: true })
fs.mkdirSync(staleLock, { recursive: true })
fs.writeFileSync(fakeTsx, '#!/bin/bash\n: > "$BRIDGE_TEST_MARKER"\n', { mode: 0o700 })
fs.writeFileSync(fakeDeploy, '#!/bin/bash\nexit 0\n', { mode: 0o700 })
fs.writeFileSync(fakeConfig, 'ENGINE_IBKR_PAPER_EXECUTION=1\nENGINE_IBKR_PAPER_AUTO_SYNC=1\n', { mode: 0o600 })
fs.writeFileSync(fakeNode, '#!/bin/bash\nexit 0\n', { mode: 0o700 })
fs.writeFileSync(path.join(staleLock, 'owner'), '99999999\nMon Jan  1 00:00:00 2001\n/stale/bridge.sh\n')
const wrapper = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/ops/ibkr-paper-bridge.sh')
const staleRecovery = spawnSync('/bin/bash', [wrapper], {
  encoding: 'utf8',
  env: { ...process.env, HOME: fakeHome, ENGINE_REPO_ROOT: fakeProd, NODE_BIN: fakeNode, BRIDGE_TEST_MARKER: marker },
})
assert.equal(staleRecovery.status, 0, staleRecovery.stderr)
assert.equal(fs.existsSync(marker), true, 'a stale crash lock does not permanently stop the bridge')
assert.equal(fs.existsSync(staleLock), false, 'the replacement lock is released after the run')

cleanup()
console.log('ibkr-paper-local-bridge.test.ts: 15 passed')
