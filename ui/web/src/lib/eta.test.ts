// Regression test for the Codex review finding (r3636118389): a doc-intake run plans zero orbs, so the
// RunStreamPanel's non-orb branch (which special-cased only 'sweep') still rendered "0/0 orbs" + a synthetic
// orb ETA for a new-data read. isOrblessRun now classifies BOTH sweep and doc-intake as orbless, so the
// panel shows a reading/elapsed status instead. Authority: the RunKind semantics in ui/server/src/types.ts —
// 'sweep' (market scan) and 'doc-intake' (advisory new-data read) both dispatch a single cheap command with
// no planned module/agent orbs, unlike full/module/agent/rerun. Run: npx tsx src/lib/eta.test.ts
import assert from 'node:assert/strict'
import { isOrblessRun } from './eta'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('isOrblessRun is true for the two zero-orb kinds (sweep, doc-intake)', () => {
  assert.equal(isOrblessRun('sweep'), true)
  assert.equal(isOrblessRun('doc-intake'), true, 'the reported gap: a doc-intake run must be treated as orbless, not "0/0 orbs"')
})
check('isOrblessRun is false for the orb-planning run kinds', () => {
  assert.equal(isOrblessRun('full'), false)
  assert.equal(isOrblessRun('module'), false)
  assert.equal(isOrblessRun('agent'), false)
  assert.equal(isOrblessRun('rerun'), false)
})

console.log(`\neta.test.ts: ${passed} passed`)
