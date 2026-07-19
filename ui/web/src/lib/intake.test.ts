// intakeResting / intakeHeadline — the CLIENT safety gate for the "no new data" affirmative (run:
// npx tsx src/lib/intake.test.ts; ui-web CI `npm test` runs it). These pure helpers are the only place the
// "never falsely claim nothing-new" rule is enforced client-side, so this file pins every branch —
// especially that an old server which omits `pool_current` (undefined) NEVER yields the affirmative, and
// that a plan carrying re-run work never reads as a resting "nothing new". A regression to a truthy check
// or `!== false` fails here.
import assert from 'node:assert'
import { intakeHeadline, intakeResting } from './intake'
import type { IntakeNewDoc, IntakePlan, IntakeRerunCommand } from './types'

const plan = (over: Partial<IntakePlan>): IntakePlan => ({
  schema_version: '1.0', ticker: 'T', run_root: 'analyses/T_2026-01-01', scan_date: '2026-01-01',
  new_docs: [], rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
  verdict: 'note_only', summary: '', analyzed_at: '2026-01-01T00:00:00Z', widened: [],
  ...over,
})
const doc = (): IntakeNewDoc => ({ path: 'data/T/x.pdf', claims_summary: 'c', materiality_score: 10, impact_direction: 'neutral', entry_orbs: [] })
const cmd = (): IntakeRerunCommand => ({ command: '/research:rerun m a T', module: 'm', agent: 'a', cascade_modules: [], triggered_by: [] })

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }

// ---- intakeResting: the safety gate ----
check('null plan → null', () => assert.equal(intakeResting(null), null))
check('empty plan + pool_current true → up-to-date', () => assert.equal(intakeResting(plan({ pool_current: true })), 'up-to-date'))
check('empty plan + pool_current false → recheck', () => assert.equal(intakeResting(plan({ pool_current: false })), 'recheck'))
// THE deploy-skew guard: an old server omits pool_current (undefined) → must NOT affirm "no new data".
check('empty plan + pool_current UNDEFINED → null (positive-match only; no false affirmative)', () => assert.equal(intakeResting(plan({})), null))
check('new docs present → null even with pool_current true (there IS new data to show)', () =>
  assert.equal(intakeResting(plan({ new_docs: [doc()], pool_current: true })), null))
// the degenerate cmds-without-docs guard: never a resting "nothing new" while re-run work is outstanding.
check('commands present, empty new_docs → null', () =>
  assert.equal(intakeResting(plan({ rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [cmd()], note_only: [] }, pool_current: true })), null))

// ---- intakeHeadline: shares the gate; only the wording differs ----
check('headline up-to-date affirms "read and considered"', () => {
  const h = intakeHeadline(plan({ pool_current: true }))
  assert.ok(/no new data/i.test(h) && /read and considered/i.test(h), h)
})
check('headline recheck prompts re-analyze, never "no new data"', () => {
  const h = intakeHeadline(plan({ pool_current: false }))
  assert.ok(/re-analyze/i.test(h) && !/no new data/i.test(h), h)
})
check('headline undefined pool_current → neutral, does NOT over-claim "read and considered"', () => {
  const h = intakeHeadline(plan({}))
  assert.ok(!/read and considered/i.test(h), h)
})

console.log(`intake.test.ts: ${passed} assertions passed`)
