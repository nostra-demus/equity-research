// Guard for the Activity dock's initial-width clamp (Gemini review, PR #385, `medium`).
// Run: npx tsx src/lib/dockWidth.test.ts
//
// The pre-fix readStoredWidth returned the persisted value UNCLAMPED, so a width saved on a large monitor
// painted past the viewport ceiling on the first render when the app was next opened on a smaller screen
// (clamping only happened later, on a resize or a drag). resolveInitialWidth now clamps on read.
import assert from 'node:assert/strict'
import { MIN_W, MAX_FRACTION, DEFAULT_W, clampWidthPx, resolveInitialWidth } from './dockWidth'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('clampWidthPx clamps to the viewport ceiling and the floor', () => {
  assert.equal(clampWidthPx(1200, 800), Math.round(800 * MAX_FRACTION)) // 576 — above ceiling → clamped
  assert.equal(clampWidthPx(500, 2000), 500)                            // within range → unchanged
  assert.equal(clampWidthPx(100, 2000), MIN_W)                          // below floor → MIN_W
})

// THE BUG: a stored width wider than the current viewport's ceiling must be clamped ON READ. Pre-fix this
// returned 1200 (unclamped); the ceiling at 800px wide is round(800*0.72)=576.
check('a stored width wider than the viewport ceiling is clamped on read (the mount bug)', () => {
  assert.equal(resolveInitialWidth('1200', 800), 576)
})

check('a valid in-range stored width is used as-is', () => {
  assert.equal(resolveInitialWidth('500', 2000), 500)
})

check('absent / non-numeric / non-positive stored width falls back to the default', () => {
  assert.equal(resolveInitialWidth(null, 800), DEFAULT_W)
  assert.equal(resolveInitialWidth('', 800), DEFAULT_W)
  assert.equal(resolveInitialWidth('abc', 800), DEFAULT_W)
  assert.equal(resolveInitialWidth('0', 800), DEFAULT_W)
  assert.equal(resolveInitialWidth('-50', 800), DEFAULT_W)
})

console.log(`dockWidth: ${passed} checks passed`)
