import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createIbkrPaperAutoSync, isAutomaticPaperSyncRun, type PublishedResearchRun } from '../src/ibkr-paper-auto-sync'

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-auto-sync-'))
const published = (overrides: Partial<PublishedResearchRun> = {}): PublishedResearchRun => ({
  runId: 'run-1', kind: 'full', ticker: 'ACME', swarmId: 'research', willCommitToMain: true,
  publicationCompleted: true, publicationPhase: 'terminal-complete', publicationRevision: 'a'.repeat(40), ...overrides,
})

assert.equal(isAutomaticPaperSyncRun(published()), true)
assert.equal(isAutomaticPaperSyncRun(published({ kind: 'module' })), false, 'a chained module cannot trade before the master call is published')
assert.equal(isAutomaticPaperSyncRun(published({ swarmId: 'screener' })), false)
assert.equal(isAutomaticPaperSyncRun(published({ publicationPhase: 'terminal-in-progress' })), false)
assert.equal(isAutomaticPaperSyncRun(published({ publicationRevision: undefined })), false, 'a moving or unknown publication revision cannot trade')

let syncs = 0
let reconciled = false
let syncedRevision = ''
const controller = createIbkrPaperAutoSync({
  enabled: true, stateDir, now: () => new Date('2026-08-24T12:00:00Z'),
  sync: async (_key, command) => {
    syncs++
    reconciled = command.reconcilePositions
    syncedRevision = command.publishedRevision
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
assert.equal(syncedRevision, 'a'.repeat(40), 'automatic execution reads the exact verified publication, not a cached moving ref')
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

const redactedState = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-auto-sync-redacted-'))
const redacted = createIbkrPaperAutoSync({
  enabled: true, stateDir: redactedState,
  sync: async () => { throw new Error('failed while reading /Users/operator/private/paper.env') },
})
const redactedAttempt = await redacted.afterPublishedRun(published({ runId: 'run-redacted' }))
assert.doesNotMatch(String(redactedAttempt?.detail), /Users|paper\.env/)
assert.match(String(redactedAttempt?.detail), /\[PATH\]/)

const partialState = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-auto-sync-partial-'))
const partial = createIbkrPaperAutoSync({
  enabled: true, stateDir: partialState,
  sync: async () => ({
    ok: true, paper_only: true, action: 'sync', detail: 'one close accepted; one target waits',
    orders: [{ order_id: 2, ticker: 'OLD', action: 'SELL', quantity: 10, status: 'Submitted', detail: 'accepted' }],
    skipped: [{ ticker: 'ACME', reason: 'waiting for the close fill' }],
  }),
})
const partialAttempt = await partial.afterPublishedRun(published({ runId: 'run-3' }))
assert.equal(partialAttempt?.outcome, 'partial')
assert.match(String(partialAttempt?.detail), /ACME: waiting for the close fill/)

const drainable = createIbkrPaperAutoSync({
  enabled: true,
  now: () => { throw new Error('clock_failed') },
  sync: async () => ({ ok: true, paper_only: true, action: 'sync', detail: 'done', orders: [], skipped: [] }),
})
await assert.rejects(() => drainable.afterPublishedRun(published({ runId: 'run-4' })), /clock_failed/)
await drainable.drain()

const olderRevision = 'a'.repeat(40)
const newerRevision = 'b'.repeat(40)
const orderedRevisions: string[] = []
const ordered = createIbkrPaperAutoSync({
  enabled: true,
  isRevisionAncestor: async (ancestor, descendant) => ancestor === olderRevision && descendant === newerRevision,
  sync: async (_key, command) => {
    orderedRevisions.push(command.publishedRevision)
    return { ok: true, paper_only: true, action: 'sync', detail: 'aligned', orders: [], skipped: [] }
  },
})
await ordered.afterPublishedRun(published({ runId: 'run-newer', publicationRevision: newerRevision }))
const staleAttempt = await ordered.afterPublishedRun(published({ runId: 'run-older', publicationRevision: olderRevision }))
assert.deepEqual(orderedRevisions, [newerRevision], 'a late older publication cannot roll back a newer paper portfolio')
assert.equal(staleAttempt?.outcome, 'no_order')
assert.match(String(staleAttempt?.detail), /older publication was skipped/)

const launcher = fs.readFileSync(new URL('../src/launcher.ts', import.meta.url), 'utf8')
assert.match(launcher, /if \(status === 'done'\) scheduleIbkrPaperAutoSyncAfterPublication\(run\)/,
  'the single close-time success finalizer must own the automatic broker trigger')
assert.match(launcher, /await runIbkrPaperAutoSyncAfterPublication\(\{[\s\S]*publicationRevision: recoveredRevision/,
  'a crash-recovered publication must trigger the same exact-revision broker reconciliation')
const server = fs.readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8')
assert.match(server, /await drainIbkrPaperAutoSync\(\)/,
  'graceful shutdown must drain the one broker reconciliation owned by a publication')
assert.match(server, /ibkrPaperExecution\.sync\(body\.data\.idempotency_key, \{ reconcilePositions: true \}\)/,
  'Sync now retries the same full reconciliation path, including 100%-cash exits')

fs.rmSync(stateDir, { recursive: true, force: true })
fs.rmSync(failureState, { recursive: true, force: true })
fs.rmSync(redactedState, { recursive: true, force: true })
fs.rmSync(partialState, { recursive: true, force: true })
console.log('ok  only terminally published Research calls automatically reconcile IBKR Paper once')
