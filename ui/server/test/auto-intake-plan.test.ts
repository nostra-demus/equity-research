import assert from 'node:assert/strict'
import { automaticIntakeOwnerKey, intakePlanCoversAutomaticPool, intakePlanSafelyAccountsForPool, type IntakePlan } from '../src/intake'

const plan = (input: Partial<IntakePlan>): IntakePlan => ({
  schema_version: 'test', swarm: 'research', subject: 'TEST', ticker: 'TEST',
  run_root: 'analyses/TEST_2026-08-14', decision_fingerprint: `sha256:${'a'.repeat(64)}`,
  plan_path: 'analyses/TEST_2026-08-14/intake/plan.json', plan_sha256: `sha256:${'b'.repeat(64)}`,
  actionable: true, scan_date: '2026-08-14', scanned_at: '2026-08-14T00:00:00Z',
  new_docs: [], rerun_plan: { materiality_gate: 65, entry_orbs: [], commands: [], note_only: [] },
  verdict: 'note_only', summary: 'checked', analyzed_at: '2026-08-14T00:00:01Z', widened: [],
  evidence_files: [], coverage_complete: true, pool_current: true, consumed: false, ...input,
})

assert.equal(intakePlanSafelyAccountsForPool(plan({ actionable: true })), true,
  'a committed safe note-only/scoped plan may advance the pool watermark')
assert.equal(intakePlanSafelyAccountsForPool(plan({ actionable: false, consumed: true })), true,
  'a safely consumed exact plan already accounted for the pool')
assert.equal(intakePlanSafelyAccountsForPool(plan({ actionable: false, consumed: false })), false,
  'an uncommitted or stale plan never swallows a document landing')
assert.equal(intakePlanSafelyAccountsForPool(plan({ widened: ['unsafe orb was dropped'] })), false,
  'a widened plan must be re-scoped rather than treated as settled')

const oldOwner = { swarm: 'research', subject: 'TEST', runRoot: 'analyses/TEST_2026-08-14', decisionFingerprint: `sha256:${'a'.repeat(64)}` }
const newOwner = { ...oldOwner, runRoot: 'analyses/TEST_2026-08-15', decisionFingerprint: `sha256:${'c'.repeat(64)}` }
assert.notEqual(automaticIntakeOwnerKey(oldOwner), automaticIntakeOwnerKey(newOwner),
  'the same ticker on a new standing call has an independent pool watermark')
assert.equal(intakePlanCoversAutomaticPool(plan({}), oldOwner, Date.parse('2026-08-14T00:00:00Z')), true)
assert.equal(intakePlanCoversAutomaticPool(plan({}), newOwner, Date.parse('2026-08-14T00:00:00Z')), false,
  'plan B against the old call cannot settle the same pool bytes against the new call')

console.log('automatic intake accepts only safe settled plans: ok')
