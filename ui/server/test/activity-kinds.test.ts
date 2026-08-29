// Regression test for the Codex review finding (r3636118381): the /api/activity `kind` filter allowlist
// omitted 'doc-intake', so a ?kind=doc-intake filter was silently dropped even though doc-intake is a real,
// displayed RunKind. ACTIVITY_FILTER_KINDS is now the single, exported source the route validates against.
// Authority: the runtime rosters in ui/server/src/types.ts are the definitive sets of run kinds and statuses;
// the activity filters must use them directly so a new canonical value cannot be silently omitted.
// Run: npx tsx test/activity-kinds.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { ACTIVITY_FILTER_KINDS, ACTIVITY_FILTER_STATUSES } from '../src/activity-log'
import { RUN_KINDS, RUN_STATUSES } from '../src/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('the activity kind allowlist includes doc-intake (the reported gap)', () => {
  assert.ok(ACTIVITY_FILTER_KINDS.includes('doc-intake'), "'doc-intake' must be an accepted ?kind= filter value")
})
check('the activity kind allowlist matches the full RunKind roster in types.ts', () => {
  assert.deepEqual([...ACTIVITY_FILTER_KINDS].sort(), [...RUN_KINDS].sort(), 'every RunKind must be filterable, and no stray kind may appear')
})
check('the activity status allowlist is the canonical RunStatus roster', () => {
  assert.deepEqual([...ACTIVITY_FILTER_STATUSES].sort(), [...RUN_STATUSES].sort(), 'every RunStatus must be filterable, and no stray status may appear')
})

console.log(`\nactivity-kinds.test.ts: ${passed} passed`)
