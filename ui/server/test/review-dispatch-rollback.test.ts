// review-dispatch: a tracked-launch admission failure must not burn the daily budget or the run/window.
// The dispatcher now inherits a supervisor-sealed provider profile and delegates to the common launcher;
// it never spawns a bare Claude binary. This test pins the equivalent asynchronous rejection boundary.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'review-dispatch-rb-'))
process.env.ENGINE_STATE_DIR = SANDBOX

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const {
    __setReviewSelectionResolver, readDispatchState, setTrackedReviewLauncher, spawnReview,
  } = await import('../src/review-dispatch')

  const ticker = `ZZRVRB${String(process.pid).slice(-6)}`.slice(0, 15)
  const runRoot = `analyses/${ticker}_2099-01-01`
  const restoreResolver = __setReviewSelectionResolver(() => ({
    provider: 'claude', model: 'sonnet', reasoningLevel: 'default', profileKey: 'claude|sonnet:default',
    executionProfile: { key: 'claude|sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
  }))

  let rejectLaunch!: (error: Error) => void
  const admission = new Promise<void>((_resolve, reject) => { rejectLaunch = reject })
  setTrackedReviewLauncher(async () => admission)
  assert.equal(spawnReview(runRoot, '30d', ticker), true,
    'a trusted selection is handed to the common tracked launcher')
  assert.equal(spawnReview(runRoot, '30d', ticker), false,
    'the same run/window stays in-flight while launcher admission is pending')
  assert.deepEqual(readDispatchState(), { date: new Date().toISOString().slice(0, 10), fired: 0, keys: [] },
    'a pending admission is not recorded as spent')

  rejectLaunch(new Error('provider unavailable'))
  let retryAccepted = false
  setTrackedReviewLauncher(async () => { throw new Error('still unavailable') })
  for (let i = 0; i < 40 && !retryAccepted; i++) {
    await delay(25)
    retryAccepted = spawnReview(runRoot, '30d', ticker)
  }
  assert.equal(retryAccepted, true, 'the same run/window becomes retryable after asynchronous rejection')
  assert.equal(readDispatchState().fired, 0,
    'an asynchronous common-launcher rejection leaves the daily budget retryable')

  setTrackedReviewLauncher(null)
  __setReviewSelectionResolver(restoreResolver)
  fs.rmSync(SANDBOX, { recursive: true, force: true })
  console.log('\n5 checks passed')
}

main().catch((error) => {
  try { fs.rmSync(SANDBOX, { recursive: true, force: true }) } catch { /* ignore */ }
  console.error('FAIL', error?.message || error)
  process.exitCode = 1
})
