// The batch-review keyboard map. The L -> score_too_high mapping is the one a future reader could
// plausibly "fix" backwards (the mnemonic reads "Low" but the type name reads "too High") — locked here.
// Run: npx tsx src/lib/reviewKeymap.test.ts
import assert from 'node:assert/strict'
import { KEY_TO_FEEDBACK, SKIP_KEY } from './reviewKeymap'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('I -> irrelevant', () => assert.equal(KEY_TO_FEEDBACK.i, 'irrelevant'))
check('H -> should_be_higher', () => assert.equal(KEY_TO_FEEDBACK.h, 'should_be_higher'))
check('L -> score_too_high (the score should go LOWER, not score_too_low)', () => assert.equal(KEY_TO_FEEDBACK.l, 'score_too_high'))
check('D -> duplicate_stale', () => assert.equal(KEY_TO_FEEDBACK.d, 'duplicate_stale'))
check('exactly 4 mapped keys — no stray entries', () => assert.deepEqual(Object.keys(KEY_TO_FEEDBACK).sort(), ['d', 'h', 'i', 'l']))
check('"s" (skip) is never a feedback-type key — it must stay a pure client-side advance', () => {
  assert.equal('s' in KEY_TO_FEEDBACK, false)
  assert.equal(SKIP_KEY, 's')
})

console.log(`\n${passed} checks passed`)
