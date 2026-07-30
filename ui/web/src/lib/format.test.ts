// fmtMinutes — the one minutes/hours/days ladder shared by the countdown (resetIn) and by plain spans
// such as the news bridge's sweep interval. It exists because the bridge chip rounded straight to hours
// and printed "sweeping every 0h" / "next 0h" for any cadence under half an hour — which is exactly what
// an operator sets (the 15m clamp floor) when they shorten the interval to watch a sweep happen.
// Run: npx tsx src/lib/format.test.ts
import assert from 'node:assert/strict'
import { fmtMinutes, resetIn } from './format'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('a sub-hour span reads in MINUTES — never the "0h" the bridge chip used to print', () => {
  assert.equal(fmtMinutes(15), '15m')   // BRIDGE_INTERVAL_MIN's clamp floor
  assert.equal(fmtMinutes(29), '29m')   // Math.round(29/60) === 0 — the old bug's worst case
  assert.equal(fmtMinutes(59), '59m')
})

check('a span never rounds away to nothing — the floor is 1m, not 0m', () => {
  assert.equal(fmtMinutes(0), '1m')
  assert.equal(fmtMinutes(0.4), '1m')
})

check('hours once an hour is reached, days past two', () => {
  assert.equal(fmtMinutes(60), '1h')
  assert.equal(fmtMinutes(12 * 60), '12h')     // the bridge's shipped 12h cadence
  assert.equal(fmtMinutes(47 * 60), '47h')
  assert.equal(fmtMinutes(48 * 60), '2d')
  assert.equal(fmtMinutes(7 * 24 * 60), '7d')  // BRIDGE_INTERVAL_MIN's clamp ceiling
})

check('resetIn still measures from a timestamp and keeps its "now" case', () => {
  const now = Date.now()
  assert.equal(resetIn(undefined), null)
  assert.equal(resetIn(0), null)                                  // falsy epoch → no countdown
  assert.equal(resetIn(Math.floor((now - 5_000) / 1000)), 'now')  // already elapsed
  assert.equal(resetIn(Math.floor((now + 20 * 60_000) / 1000)), '20m')
  assert.equal(resetIn(Math.floor((now + 3 * 3_600_000) / 1000)), '3h')
})

check('resetIn and fmtMinutes agree — one ladder, not two', () => {
  // Values deliberately kept off the .5-unit rounding boundaries. resetIn takes epoch SECONDS, so building
  // its argument loses up to 999ms: an exact 90 minutes arrives as 89.99 and rounds to '1h', while
  // fmtMinutes(90) sees 1.5 hours exactly and rounds to '2h'. That is the input's precision, not two
  // different ladders — asserting on a boundary would only make this test flaky.
  for (const mins of [1, 15, 45, 100, 60 * 5, 60 * 50, 60 * 24 * 5]) {
    assert.equal(resetIn(Math.floor((Date.now() + mins * 60_000) / 1000)), fmtMinutes(mins), `${mins}m`)
  }
})

// Caller-side floor: a `return` or throw above any group would silently skip it (same guard the other
// suites use). Bump deliberately when adding a check — never leave it stale-low.
const EXPECTED_CHECKS = 5
assert.ok(passed >= EXPECTED_CHECKS,
  `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS} — something above here is short-circuiting`)
console.log(`format.test.ts: ${passed} checks passed`)
