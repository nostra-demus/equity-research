// Legacy filename retained so the test runner still exercises the new terminal retry contract.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.REVIEW_DISPATCH_ENABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { dispatchDueReviews, readDispatchState, type ReviewLauncher } from '../src/review-dispatch'

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-dispatch-terminal-'))
let terminal: ((status: any) => void) | null = null
let launches = 0
const launcher: ReviewLauncher = async (_review, onTerminal) => {
  launches++; terminal = onTerminal; return { runId: `run-${launches}` }
}
const due = { ticker: 'TEST', runRoot: 'analyses/TEST_2026-01-01', window: '30d' }

try {
  await dispatchDueReviews(launcher, { stateDir, discover: () => [due], tickMs: 1_000, retryBaseMs: 1_000 })
  terminal!('error')
  const failed = readDispatchState({ stateDir })!
  assert.equal(failed.jobs['analyses/TEST_2026-01-01|30d'].status, 'retry_wait')
  assert.equal(failed.launches_today, 1, 'failed terminal keeps its durable launch history')
  console.log('\nreview-dispatch-rollback.test.ts: terminal retry check passed')
} finally {
  fs.rmSync(stateDir, { recursive: true, force: true })
}
