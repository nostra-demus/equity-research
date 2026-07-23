// Regression test for the Codex review finding (r3636118381): the /api/activity `kind` filter allowlist
// omitted 'doc-intake', so a ?kind=doc-intake filter was silently dropped even though doc-intake is a real,
// displayed RunKind. ACTIVITY_FILTER_KINDS is now the single, exported source the route validates against.
// Authority: the RunKind union in ui/server/src/types.ts is the definitive set of run kinds — the activity
// filter must accept every one of them, or that kind's rows can never be filtered to. Pinned to that union,
// not derived from the code under test. Run: npx tsx test/activity-kinds.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { ACTIVITY_FILTER_KINDS } from '../src/activity-log'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// The RunKind union, transcribed from ui/server/src/types.ts (the authority).
const RUN_KINDS = ['full', 'module', 'agent', 'rerun', 'review', 'track', 'doc-intake', 'signal', 'sweep', 'screener-agent', 'handoff']

check('the activity kind allowlist includes doc-intake (the reported gap)', () => {
  assert.ok(ACTIVITY_FILTER_KINDS.includes('doc-intake'), "'doc-intake' must be an accepted ?kind= filter value")
})
check('the activity kind allowlist matches the full RunKind roster in types.ts', () => {
  assert.deepEqual([...ACTIVITY_FILTER_KINDS].sort(), [...RUN_KINDS].sort(), 'every RunKind must be filterable, and no stray kind may appear')
})

console.log(`\nactivity-kinds.test.ts: ${passed} passed`)
