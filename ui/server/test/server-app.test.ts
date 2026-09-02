// Real in-memory route proof for the import-safe Fastify factory. Building an app must not claim the
// production singleton, install process handlers, open a port, recover provider children, or start a
// scheduler. Those effects belong only to BuiltServerApp.start().
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const signalCounts = () => ({
  sigterm: process.listenerCount('SIGTERM'),
  sigint: process.listenerCount('SIGINT'),
  uncaught: process.listenerCount('uncaughtException'),
  rejected: process.listenerCount('unhandledRejection'),
})

const before = signalCounts()
const { buildApp, startBootAdmissionSchedulers } = await import('../src/server')
const { DATA_DIR, REPO_ROOT } = await import('../src/config')
const { createRun } = await import('../src/registry')
const first = await buildApp()
const second = await buildApp()

assert.notEqual(first.app, second.app, 'buildApp returns an isolated Fastify instance')
assert.deepEqual(signalCounts(), before, 'building route apps installs no process handlers')

const bootAdmissionOrder: string[] = []
let releaseRecovery!: () => void
const recoveryReady = new Promise<void>((resolve) => { releaseRecovery = resolve })
const bootSchedulers = startBootAdmissionSchedulers({
  reconcilePaidRecovery: async () => {
    bootAdmissionOrder.push('paid-recovery-started')
    await recoveryReady
    bootAdmissionOrder.push('paid-recovery-registered')
  },
  startPendingDrain: () => { bootAdmissionOrder.push('pending-drain-started') },
})
await new Promise<void>((resolve) => setImmediate(resolve))
assert.deepEqual(bootAdmissionOrder, ['paid-recovery-started'],
  'boot cannot enable pending admissions while protected paid recovery is still reconciling')
releaseRecovery()
await bootSchedulers
assert.deepEqual(bootAdmissionOrder, [
  'paid-recovery-started', 'paid-recovery-registered', 'pending-drain-started',
], 'paid recovery registers before any queued post-update admission can spend')

const health = await first.app.inject({ method: 'GET', url: '/api/health' })
assert.equal(health.statusCode, 200)
assert.equal(health.headers['cache-control'], 'no-store')
assert.equal(health.json().ok, true)
assert.equal(health.json().deployment, null, 'health exposes no guessed deployment state before the watcher reports one')

const scanProgress = await first.app.inject({ method: 'GET', url: '/api/data-status/NU/progress' })
assert.equal(scanProgress.statusCode, 200)
assert.equal(scanProgress.json().progress, null, 'progress reads never start a scan')
const scanResult = await first.app.inject({ method: 'GET', url: '/api/data-status/NU/result' })
assert.equal(scanResult.statusCode, 202)
assert.equal(scanResult.json().status, 'not_started')

const activity = await first.app.inject({ method: 'GET', url: '/api/activity?status=readiness-checking' })
assert.equal(activity.statusCode, 200, 'canonical pre-spawn statuses are accepted by the real route')
assert.ok(Array.isArray(activity.json().rows))

const readinessOwner = createRun({
  kind: 'module', ticker: 'ZZSNAPSHOT', module: 'business-model', provider: 'claude', model: 'haiku',
  reasoningLevel: 'default', profileKey: 'claude:haiku:default',
  executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
  prompt: 'x', user: 'local', userVia: 'local', runRoot: null, willCommitToMain: false,
  writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], chainId: 'snapshot-chain', chained: true,
})
readinessOwner.status = 'awaiting-readiness-decision'
readinessOwner.publicationPhase = 'terminal-in-progress'
readinessOwner.readiness = {
  ticker: readinessOwner.ticker, kind: 'full', overall: 'blocked', fileCount: 0, usableCount: 0,
  physicalPool: { state: 'empty', fileCount: 0, nonEmptyFileCount: 0 },
  entities: [], issues: [{ code: 'zero_files', severity: 'blocker', message: 'No data files found.' }],
  ts: Date.now(),
}
const ownerSnapshot = await first.app.inject({ method: 'GET', url: `/api/runs/${readinessOwner.runId}` })
assert.equal(ownerSnapshot.statusCode, 200)
assert.equal(ownerSnapshot.json().readiness.issues[0].code, 'zero_files', 'refresh restores the exact actionable gate')
assert.equal(ownerSnapshot.json().publicationPhase, 'terminal-in-progress', 'refresh restores the backend-owned save/publish phase')
const activeSnapshot = await first.app.inject({ method: 'GET', url: '/api/runs' })
assert.equal(activeSnapshot.json().active.find((run: any) => run.runId === readinessOwner.runId)?.publicationPhase,
  'terminal-in-progress', 'polling carries the same save/publish phase as the exact snapshot')
const emptyProceed = await first.app.inject({
  method: 'POST', url: `/api/runs/${readinessOwner.runId}/readiness-decision`, payload: { action: 'proceed' },
})
assert.equal(emptyProceed.statusCode, 409, 'the real API cannot proceed through a physically empty chain')
const emptyOverride = await first.app.inject({
  method: 'POST', url: `/api/runs/${readinessOwner.runId}/readiness-decision`,
  payload: { action: 'override', acknowledgedText: readinessOwner.ticker },
})
assert.equal(emptyOverride.statusCode, 409, 'the real API cannot typed-override a physically empty chain')

const readinessSibling = createRun({
  kind: 'module', ticker: 'ZZSNAPSHOT', module: 'earnings', provider: 'claude', model: 'haiku',
  reasoningLevel: 'default', profileKey: 'claude:haiku:default',
  executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
  prompt: 'x', user: 'local', userVia: 'local', runRoot: null, willCommitToMain: false,
  writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], chainId: 'snapshot-chain', chained: true,
})
readinessSibling.status = 'readiness-checking'
readinessSibling.readiness = readinessOwner.readiness
const siblingSnapshot = await first.app.inject({ method: 'GET', url: `/api/runs/${readinessSibling.runId}` })
assert.equal(siblingSnapshot.statusCode, 200)
assert.equal(siblingSnapshot.json().readiness, undefined, 'refresh never invents a second chain decision owner')

const unreceiptedContinue = await first.app.inject({
  method: 'POST', url: '/api/thesis-plan/run',
  payload: {
    ticker: 'KAR', reuse: [], swarm: 'research', provider: 'claude',
    sourceRunRoot: 'analyses/KAR_2026-08-27',
  },
})
assert.equal(unreceiptedContinue.statusCode, 400, 'Continue fails closed when request id/plan receipt are absent')
assert.equal(unreceiptedContinue.json().error, 'invalid body')

// A generic completion receipt that proposes bytes from any dated root is not one exact Continue action.
// Reject it before provider probing, Activity, or target-root preparation instead of mixing generations.
const crossRootTicker = 'ZZEXACTSRC'
const crossRootData = path.join(DATA_DIR, crossRootTicker)
fs.mkdirSync(crossRootData, { recursive: true })
const targetRunRoot = `analyses/${crossRootTicker}_2099-01-02`
const crossRoot = await first.app.inject({
  method: 'POST', url: '/api/thesis-plan/run',
  payload: {
    ticker: crossRootTicker, reuse: ['business-model'], swarm: 'research', provider: 'claude',
    requestId: crypto.randomUUID(),
    continuationReceipt: {
      version: 2, action: 'complete', swarm: 'research', subject: crossRootTicker,
      sourceRunRoots: [`analyses/${crossRootTicker}_2099-01-01`], targetRunRoot,
      provider: { id: 'claude', model: null, reasoningLevel: null, profileKey: null },
      reusableOrbKeys: [], payableOrbKeys: ['master/synthesizer'],
      dataPool: { files: 1, newestMs: 1, sha256: `sha256:${'a'.repeat(64)}` },
      evidenceGenerationDigest: null, reusableArtifacts: [],
      reusableArtifactsSha256: `sha256:${'b'.repeat(64)}`,
      verifiedLineageSha256: `sha256:${'e'.repeat(64)}`,
      sourceArtifactsSha256: `sha256:${'c'.repeat(64)}`,
      fingerprint: `sha256:${'d'.repeat(64)}`,
    },
  },
})
assert.equal(crossRoot.statusCode, 409)
assert.equal(crossRoot.json().code, 'exact_source_required')
assert.equal(fs.existsSync(path.join(REPO_ROOT, targetRunRoot)), false, 'rejection creates no visible run root')
fs.rmSync(crossRootData, { recursive: true, force: true })

await first.app.close()
await second.app.close()

console.log('server-app.test.ts: isolated factory + real injected routes passed')
