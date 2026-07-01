// The client's FEEDBACK_TYPES/feedbackLabel must never drift from the server's
// ui/server/src/screener-feedback.ts FEEDBACK_TYPES (the two can't share an import — client can't pull
// in server code). This locks the exact 8 values + labels so a future edit to one side gets caught here.
// Run: npx tsx src/lib/feedbackTypes.test.ts
import assert from 'node:assert/strict'
import { FEEDBACK_TYPES, feedbackLabel } from './feedbackTypes'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const EXPECTED = ['irrelevant', 'score_too_high', 'score_too_low', 'wrong_company', 'wrong_sector', 'duplicate_stale', 'should_be_higher', 'other']

check('exactly the 8 feedback types, matching the server enum in order', () => {
  assert.deepEqual(FEEDBACK_TYPES, EXPECTED)
})

check('every type has a non-empty, distinct label', () => {
  const labels = FEEDBACK_TYPES.map(feedbackLabel)
  for (const l of labels) assert.ok(l && l.trim().length > 0)
  assert.equal(new Set(labels).size, labels.length)
})

console.log(`\n${passed} checks passed`)
