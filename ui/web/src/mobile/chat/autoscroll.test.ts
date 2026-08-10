// The 96px stick band: inside it the thread follows the stream; above it the user is reading scrollback
// and must never be yanked down. Run: npx tsx src/mobile/chat/autoscroll.test.ts
import assert from 'node:assert/strict'
import { STICK_THRESHOLD_PX, shouldStick } from './autoscroll'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('the band is 96px — wider than desktop, sized for touch momentum', () => {
  assert.equal(STICK_THRESHOLD_PX, 96)
})

check('at the bottom, and anywhere inside the band, the thread sticks', () => {
  assert.ok(shouldStick(904, 1600, 696))   // exactly at the bottom (gap 0)
  assert.ok(shouldStick(809, 1600, 696))   // gap 95
  assert.ok(shouldStick(808, 1600, 696))   // gap 96 — the boundary is inclusive
})

check('one pixel above the band, it stops sticking', () => {
  assert.ok(!shouldStick(807, 1600, 696))  // gap 97
  assert.ok(!shouldStick(0, 1600, 696))    // deep in scrollback
})

check('a thread shorter than the viewport always sticks', () => {
  assert.ok(shouldStick(0, 400, 696))
})

const EXPECTED_CHECKS = 4
assert.ok(passed >= EXPECTED_CHECKS, `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS}`)
console.log(`\nautoscroll.test.ts: ${passed} checks passed`)
