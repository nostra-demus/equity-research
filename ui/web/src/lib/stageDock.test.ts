// Guard for setStageDockH's idempotency (Gemini review, PR #375, `high`). Run: npx tsx src/lib/stageDock.test.ts
//
// The pre-fix setter guarded with the UN-clamped rounded input:
//     if (Math.round(h) !== Math.round(get().stageDockH)) set({ stageDockH: Math.max(0, Math.round(h)) })
// The stored height is clamped to >= 0, so a NEGATIVE input rounds negative, never equals the clamped-to-0
// stored value, and the guard passes forever — the store is re-written (and the whole field re-rendered)
// every layout pass: a render loop. The fix compares the value it is about to STORE.
import assert from 'node:assert/strict'
import { roundDockH, stageDockHUpdate } from './stageDock'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('roundDockH rounds and clamps a normal measured height', () => {
  assert.equal(roundDockH(211.6), 212)
  assert.equal(roundDockH(0), 0)
  assert.equal(roundDockH(148.4), 148)
})

check('roundDockH clamps a negative to 0 (a dock is never negative)', () => {
  assert.equal(roundDockH(-5), 0)
  assert.equal(roundDockH(-0.4), 0)
})

// THE BUG: negative input while stored height is 0. Pre-fix guard (Math.round(-5) !== 0) was TRUE, so it
// wrote 0 redundantly every pass. The invariant: when the clamped height equals the stored height, write
// NOTHING. Authority: idempotency — the guard must compare the value it stores (clamped), not the raw input.
check('negative input at stored 0 writes nothing (the render-loop case)', () => {
  assert.equal(stageDockHUpdate(-5, 0), null)
  assert.equal(stageDockHUpdate(-0.4, 0), null)
})

check('an unchanged (already-clamped) height writes nothing — idempotent', () => {
  assert.equal(stageDockHUpdate(212, 212), null)
  assert.equal(stageDockHUpdate(212.3, 212), null) // rounds to the same stored value → no write
  assert.equal(stageDockHUpdate(0, 0), null)
})

check('a genuinely changed height returns the value to store', () => {
  assert.equal(stageDockHUpdate(211.6, 0), 212)
  assert.equal(stageDockHUpdate(0, 212), 0)
  assert.equal(stageDockHUpdate(149, 212), 149)
})

// The idempotency property in general: whatever stageDockHUpdate decides to store, feeding it straight back
// writes nothing. This is exactly what the pre-fix guard broke for negative inputs.
check('storing then re-feeding the stored value is always a no-op', () => {
  for (const h of [-10, -0.5, 0, 0.4, 148.4, 211.6, 999]) {
    const stored = roundDockH(h)
    assert.equal(stageDockHUpdate(h, stored), null, `h=${h} should not re-write its own stored value`)
  }
})

console.log(`stageDock: ${passed} checks passed`)
