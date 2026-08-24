import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createIbkrPaperAutoSync, isAutomaticPaperSyncRun, type PublishedResearchRun } from '../src/ibkr-paper-auto-sync'

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-auto-sync-'))
const published = (overrides: Partial<PublishedResearchRun> = {}): PublishedResearchRun => ({
  runId: 'run-1', kind: 'full', ticker: 'ACME', swarmId: 'research', willCommitToMain: true,
  publicationCompleted: true, publicationPhase: 'terminal-complete', ...overrides,
})

assert.equal(isAutomaticPaperSyncRun(published()), true)
assert.equal(isAutomaticPaperSyncRun(published({ kind: 'module' })), false, 'a chained module cannot trade before the master call is published')
assert.equal(isAutomaticPaperSyncRun(published({ swarmId: 'screener' })), false)
assert.equal(isAutomaticPaperSyncRun(published({ publicationPhase: 'terminal-in-progress' })), false)

let syncs = 0
let reconciled = false
const controller = createIbkrPaperAutoSync({
  enabled: true, stateDir, now: () => new Date('2026-08-24T12:00:00Z'),
  sync: async (_key, command) => {
    syncs++
    reconciled = command.reconcilePositions
    return { ok: true, paper_only: true, action: 'sync', detail: 'one accepted', orders: [
      { order_id: 1, ticker: 'ACME', action: 'BUY', quantity: 10, status: 'Submitted', detail: 'accepted' },
    ], skipped: [] }
  },
})

await controller.afterPublishedRun(published({ kind: 'module' }))
await controller.afterPublishedRun(published())
await controller.afterPublishedRun(published())
assert.equal(syncs, 1, 'one publication can schedule only one broker reconciliation')
assert.equal(reconciled, true)
assert.deepEqual(controller.read(), {
  enabled: true,
  last_attempt: {
    schema_version: 'ibkr-paper-auto-sync/v1', at: '2026-08-24T12:00:00.000Z', outcome: 'orders_sent', trigger: 'publication',
    run_id: 'run-1', run_kind: 'full', ticker: 'ACME', order_count: 1, skipped_count: 0, detail: 'one accepted',
  },
})
assert.equal(fs.readFileSync(path.join(stateDir, 'ibkr-paper', 'automatic-sync.jsonl'), 'utf8').trim().split('\n').length, 1,
  'automatic executions keep an append-only local audit in addition to the latest dashboard state')

const failureState = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-auto-sync-failure-'))
const failure = createIbkrPaperAutoSync({
  enabled: true, stateDir: failureState,
  sync: async () => { throw new Error('paper_connect_failed') },
})
const attempt = await failure.afterPublishedRun(published({ runId: 'run-2', kind: 'review' }))
assert.equal(attempt?.outcome, 'error')
assert.match(String(attempt?.detail), /paper_connect_failed/)

const launcher = fs.readFileSync(new URL('../src/launcher.ts', import.meta.url), 'utf8')
assert.match(launcher, /if \(status === 'done'\) scheduleIbkrPaperAutoSyncAfterPublication\(run\)/,
  'the single close-time success finalizer must own the automatic broker trigger')

fs.rmSync(stateDir, { recursive: true, force: true })
fs.rmSync(failureState, { recursive: true, force: true })
console.log('ok  only terminally published Research calls automatically reconcile IBKR Paper once')
