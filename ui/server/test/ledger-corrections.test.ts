// ledger-corrections.ts must apply the SAME transforms as scripts/ledger_records.py — the two
// resolvers front the same append-only correction layer (DECISION_LEDGER §4a) and any drift would
// let the cockpit Calls view and the /research:calibrate scoreboard disagree about the corrected
// board. These cases mirror ledger_records.py's selftest exactly. Run: npx tsx test/ledger-corrections.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { CORRECTIONS_SCHEMA, applyErrata, supersededTarget } from '../src/ledger-corrections'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

check('scale_fix: decimal probabilities → 0-100; already-percent untouched; original not mutated', () => {
  const rec = { forecast_ledger: [{ probability: 0.6 }, { probability: 0.55 }, { probability: 70 }] }
  const got = applyErrata(rec, {
    schema: CORRECTIONS_SCHEMA,
    errata: [{ field: 'forecast_ledger[].probability', kind: 'scale_fix' }],
  })
  assert.deepEqual(got.forecast_ledger.map((e: any) => e.probability), [60, 55, 70])
  assert.equal(rec.forecast_ledger[0].probability, 0.6, 'original must not mutate')
})

check('sign_fix: loss magnitude normalised to positive', () => {
  const got = applyErrata({ downside_risk_pct: -31.1 }, {
    schema: CORRECTIONS_SCHEMA,
    errata: [{ field: 'downside_risk_pct', kind: 'sign_fix' }],
  })
  assert.equal(got.downside_risk_pct, 31.1)
})

check('shape_fix: legacy kill_criteria / module_scores / red_flags coerced to canonical shapes', () => {
  const got = applyErrata(
    { kill_criteria: ['a plain string criterion'], module_scores: { earnings: 67 }, red_flags: ['a bare flag'] },
    {
      schema: CORRECTIONS_SCHEMA,
      errata: [
        { field: 'kill_criteria', kind: 'shape_fix' },
        { field: 'module_scores', kind: 'shape_fix' },
        { field: 'red_flags', kind: 'shape_fix' },
      ],
    },
  )
  assert.equal(got.kill_criteria[0].condition, 'a plain string criterion')
  assert.deepEqual(got.module_scores.earnings, { score: 67, verdict: null })
  assert.equal(got.red_flags[0].description, 'a bare flag')
})

check('math_reconcile / note_clear: recorded, no numeric transform', () => {
  const got = applyErrata({ expected_return_pct: -4.4 }, {
    schema: CORRECTIONS_SCHEMA,
    errata: [{ field: 'headline', kind: 'math_reconcile' }],
  })
  assert.equal(got.expected_return_pct, -4.4)
  assert.equal(got._corrections_applied[0].status, 'recorded')
})

check('unknown kind: recorded, never applied, never throws', () => {
  const got = applyErrata({ x: 1 }, { schema: CORRECTIONS_SCHEMA, errata: [{ field: 'x', kind: 'future_kind' }] })
  assert.equal(got._corrections_applied[0].status, 'unknown-kind')
  assert.equal(got.x, 1)
})

check('prototype-member kinds are unknown-kind, never applied, never throw (parity with dict.get)', () => {
  for (const kind of ['__proto__', 'hasOwnProperty', 'toString', 'constructor', 'valueOf']) {
    const got = applyErrata({ x: 1 }, { schema: CORRECTIONS_SCHEMA, errata: [{ field: 'x', kind }] })
    assert.equal(got._corrections_applied[0].status, 'unknown-kind', `${kind} must be unknown-kind`)
    assert.equal(got.x, 1, `${kind} must not mutate`)
  }
})

check('scale_fix on a BARE top-level probability field (mirrors the Python bare-field path)', () => {
  const got = applyErrata({ probability: 0.6 }, { schema: CORRECTIONS_SCHEMA, errata: [{ field: 'probability', kind: 'scale_fix' }] })
  assert.equal(got.probability, 60)
})

check('supersededTarget: reads the target, else null', () => {
  assert.equal(supersededTarget({ superseded_by: { run_root: 'analyses/EMAAR_2026-07-10' } }), 'analyses/EMAAR_2026-07-10')
  assert.equal(supersededTarget({}), null)
})

console.log(`\n${passed} checks passed`)
