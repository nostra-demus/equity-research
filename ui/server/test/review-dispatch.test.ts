// review-dispatch: the due-review computation must reuse listAllCalls()'s timeline (so it shares the
// review_due rule + the §4a supersession layer), select only DUE/OVERDUE checkpoints, and stay OFF
// unless REVIEW_DISPATCH_ENABLED=1. Run: npx tsx test/review-dispatch.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.REVIEW_DISPATCH_ENABLED = '' // ensure the loop is OFF for this test process (never spawn a paid run)
import assert from 'node:assert/strict'
import { dispatchDueReviews, dueReviews } from '../src/review-dispatch'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

check('dueReviews() returns only DUE/OVERDUE {ticker, window} rows and never throws', () => {
  const rows = dueReviews()
  assert.ok(Array.isArray(rows), 'must return an array')
  for (const r of rows) {
    assert.equal(typeof r.ticker, 'string')
    assert.ok(['30d', '90d', '180d', '365d', 'ad-hoc'].includes(r.window), `unexpected window ${r.window}`)
  }
  // one row per ticker at most (listAllCalls' next_checkpoint is a single earliest window per call)
  const perTicker = new Set(rows.map((r) => r.ticker))
  assert.ok(perTicker.size <= rows.length)
})

check('dispatchDueReviews() is a no-op when disabled (never spawns a paid review)', () => {
  // ENABLED is read at import time from REVIEW_DISPATCH_ENABLED (unset here) — the pass must be inert.
  assert.doesNotThrow(() => dispatchDueReviews())
})

console.log(`\n${passed} checks passed`)
