// ledger-corrections.ts must apply the SAME transforms as scripts/ledger_records.py — the two
// resolvers front the same append-only correction layer (DECISION_LEDGER §4a) and any drift would
// let the cockpit Calls view and the /research:calibrate scoreboard disagree about the corrected
// board. These cases mirror ledger_records.py's selftest exactly. Run: npx tsx test/ledger-corrections.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CORRECTIONS_SCHEMA, applyErrata, supersededTarget, resolveIntegrityStatus, resolveDisplayFields } from '../src/ledger-corrections'

function withTmpDir(fn: (td: string) => void) {
  const td = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-integrity-'))
  try {
    fn(td)
  } finally {
    fs.rmSync(td, { recursive: true, force: true })
  }
}

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

// resolveIntegrityStatus — mirrors scripts/ledger_records.py's resolve_integrity_status() selftest
// case-for-case (DECISION_LEDGER.md §18a); this fixture is what keeps the two resolvers from drifting.

check('resolveIntegrityStatus: no final_thesis.md, no verification_report -> unaudited, never throws', () => {
  withTmpDir((td) => {
    const r = resolveIntegrityStatus(td)
    assert.deepEqual(r, { status: 'unaudited', verdict: null, integrity_score: null, banner: false, report_file: null })
  })
})

check('resolveIntegrityStatus: Clean verification_report, no banner -> verified', () => {
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), '# TICKER — Investment Dossier\n\nbody\n')
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: 'Clean', integrity_score: 96 }))
    const r = resolveIntegrityStatus(td)
    assert.equal(r.status, 'verified')
    assert.equal(r.integrity_score, 96)
  })
})

check('resolveIntegrityStatus: Material issues verdict, no banner -> provisional (fail-closed)', () => {
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), '# TICKER — Investment Dossier\n\nbody\n')
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: 'Material issues', integrity_score: 55 }))
    assert.equal(resolveIntegrityStatus(td).status, 'provisional')
  })
})

check('resolveIntegrityStatus: PROVISIONAL banner overrides a Clean verify-evidence verdict', () => {
  withTmpDir((td) => {
    fs.writeFileSync(
      path.join(td, 'final_thesis.md'),
      '> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> scenario math broken\n\n# TICKER — Investment Dossier\n',
    )
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: 'Clean', integrity_score: 100 }))
    const r = resolveIntegrityStatus(td)
    assert.equal(r.status, 'provisional')
    assert.equal(r.banner, true)
  })
})

check('resolveIntegrityStatus: versioned reports — the LATEST version wins (_v2 over base)', () => {
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), '# TICKER — Investment Dossier\n')
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: 'Material issues' }))
    fs.writeFileSync(path.join(td, 'verification_report_v2.json'), JSON.stringify({ verdict: 'Clean' }))
    const r = resolveIntegrityStatus(td)
    assert.equal(r.status, 'verified')
    assert.equal(r.report_file, 'verification_report_v2.json')
  })
})

check('resolveIntegrityStatus: incidental whitespace around the verdict still classifies as verified', () => {
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), '# TICKER — Investment Dossier\n')
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: 'Minor issues ', integrity_score: 88 }))
    assert.equal(resolveIntegrityStatus(td).status, 'verified')
  })
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), '# TICKER — Investment Dossier\n')
    fs.writeFileSync(path.join(td, 'verification_report.json'), JSON.stringify({ verdict: '  Clean\n', integrity_score: 91 }))
    assert.equal(resolveIntegrityStatus(td).status, 'verified')
  })
})

check('resolveIntegrityStatus: non-UTF-8 final_thesis.md resolves without raising', () => {
  withTmpDir((td) => {
    fs.writeFileSync(path.join(td, 'final_thesis.md'), Buffer.from([0x23, 0x20, 0x54, 0xff, 0xfe, 0x0a]))
    const r = resolveIntegrityStatus(td)
    assert.equal(r.status, 'unaudited')
    assert.equal(r.banner, false)
  })
})

check('resolveIntegrityStatus: PROVISIONAL banner still detected under non-UTF-8 noise', () => {
  withTmpDir((td) => {
    fs.writeFileSync(
      path.join(td, 'final_thesis.md'),
      Buffer.concat([Buffer.from([0xff]), Buffer.from('> PROVISIONAL — the automated finish-gate found an integrity issue\n'), Buffer.from([0xfe])]),
    )
    const r = resolveIntegrityStatus(td)
    assert.equal(r.status, 'provisional')
    assert.equal(r.banner, true)
  })
})

// resolveDisplayFields — mirrors track.md's read-time preference for the post-mortem rating cap
// (fix F28b) and the post-review confidence (fix F28) over the synthesizer's original fields.

check('resolveDisplayFields: no post-mortem fields -> passes the original decision/basket/confidence through', () => {
  const r = resolveDisplayFields({ decision: 'Buy', basket: 'Selected', confidence_score: 70 })
  assert.deepEqual(r, { decision: 'Buy', basket: 'Selected', decisionIsPostMortemCapped: false, confidence: 70, confidenceIsPostReview: false })
})

check('resolveDisplayFields: terminal pre-mortem cap -> post_mortem_decision/basket win, flagged as capped', () => {
  const r = resolveDisplayFields({ decision: 'Strong Buy', basket: 'Selected', post_mortem_decision: 'Watchlist', post_mortem_basket: 'Watchlist', confidence_score: 65 })
  assert.equal(r.decision, 'Watchlist')
  assert.equal(r.basket, 'Watchlist')
  assert.equal(r.decisionIsPostMortemCapped, true)
})

check('resolveDisplayFields: post_mortem_decision equal to decision (already-conservative pre-mortem) -> not flagged as capped', () => {
  const r = resolveDisplayFields({ decision: 'Watchlist', basket: 'Watchlist', post_mortem_decision: 'Watchlist', post_mortem_basket: 'Watchlist' })
  assert.equal(r.decisionIsPostMortemCapped, false)
})

check('resolveDisplayFields: post_review_confidence_score preferred over confidence_score when present', () => {
  const r = resolveDisplayFields({ decision: 'Buy', confidence_score: 70, post_review_confidence_score: 62 })
  assert.equal(r.confidence, 62)
  assert.equal(r.confidenceIsPostReview, true)
})

// An empty-string post_mortem_decision falls back to the original decision on read (the truthiness
// guard on `decision`), so the ⚠ CAPPED flag must stay FALSE — the displayed decision is the uncapped
// original. The flag has to track the displayed value; flagging capped while showing the original is a
// false positive that puts a CAPPED badge on an un-downgraded call.
check('resolveDisplayFields: empty-string post_mortem_decision -> shows original decision, NOT flagged as capped', () => {
  const r = resolveDisplayFields({ decision: 'Strong Buy', basket: 'Selected', post_mortem_decision: '', post_mortem_basket: '', confidence_score: 70 })
  assert.equal(r.decision, 'Strong Buy')
  assert.equal(r.basket, 'Selected')
  assert.equal(r.decisionIsPostMortemCapped, false)
})

console.log(`\n${passed} checks passed`)
