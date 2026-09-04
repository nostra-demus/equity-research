// ledger-corrections.ts must apply the SAME transforms as scripts/ledger_records.py — the two
// resolvers front the same append-only correction layer (DECISION_LEDGER §4a) and any drift would
// let the cockpit Calls view and the /research:calibrate scoreboard disagree about the corrected
// board. These cases mirror ledger_records.py's selftest exactly. Run: npx tsx test/ledger-corrections.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CORRECTIONS_SCHEMA, applyErrata, supersededTarget, resolveIntegrityStatus, resolveDisplayFields,
  validSupersessionTarget } from '../src/ledger-corrections'

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

check('metadata_recovery: overlays validated omitted metadata without mutating or overriding', () => {
  const attemptId = '01a05e44-5728-7c00-9710-6f570eabfd10'
  const projection = {
    schema_version: '1.0', source: 'cockpit_runtime', coverage: 'cockpit_top_level_processes',
    provider_mode: 'partially_observed', profile_key: 'codex|gpt-test:max',
    decision_author: { attempt_id: attemptId, provider: 'codex', model: 'gpt-test', reasoning_level: 'max', attribution: 'recorded' },
    contributors: [{ provider: 'codex', model: 'gpt-test', reasoning_level: 'max', attribution: 'recorded', scopes: ['synthesizer'] }],
    cli_versions: {},
  }
  const metadata_recovery = {
    reason: 'omitted', evidence: 'runtime transcript', post_review_confidence_score: 47, confidence_haircut: 6,
    execution_provenance: projection,
    runtime_evidence: { source: 'codex_task_runtime', attempts: [{ attempt_id: attemptId, attribution: 'recorded' }] },
  }
  const frozen = { confidence_score: 53 }
  const got = applyErrata(frozen, { schema: CORRECTIONS_SCHEMA, metadata_recovery })
  assert.equal(got.post_review_confidence_score, 47)
  assert.deepEqual(got.execution_provenance, projection)
  assert.equal((frozen as any).execution_provenance, undefined)
  const existing = applyErrata({ ...frozen, post_review_confidence_score: 50 },
    { schema: CORRECTIONS_SCHEMA, metadata_recovery })
  assert.equal(existing.post_review_confidence_score, 50)
})

check('validSupersessionTarget: requires complete, same-ticker, newer publication', () => {
  withTmpDir((td) => {
    const source = path.join(td, 'TICK_2026-08-31')
    const target = path.join(td, 'TICK_2026-09-01')
    fs.mkdirSync(source); fs.mkdirSync(target)
    fs.writeFileSync(path.join(source, 'decision_record.json'), JSON.stringify({ ticker: 'TICK', decision_date: '2026-08-31' }))
    fs.writeFileSync(path.join(target, 'decision_record.json'), JSON.stringify({
      ticker: 'TICK', decision_date: '2026-09-01', run_root: target,
      final_thesis_path: path.join(target, 'final_thesis.md'), execution_provenance: { source: 'cockpit_runtime' },
    }))
    for (const name of ['final_thesis.md', 'memo.md', 'audit_dossier.md']) {
      fs.writeFileSync(path.join(target, name), 'x'.repeat(1025))
    }
    assert.equal(validSupersessionTarget(source, target, target), true)
    const record = JSON.parse(fs.readFileSync(path.join(target, 'decision_record.json'), 'utf8'))
    record.ticker = 'OTHER'
    fs.writeFileSync(path.join(target, 'decision_record.json'), JSON.stringify(record))
    assert.equal(validSupersessionTarget(source, target, target), false)
    record.ticker = 'TICK'
    record.decision_date = '2026-07-10'
    delete record.execution_provenance
    fs.writeFileSync(path.join(source, 'decision_record.json'), JSON.stringify({ ticker: 'TICK', decision_date: '2026-07-03' }))
    fs.writeFileSync(path.join(target, 'decision_record.json'), JSON.stringify(record))
    assert.equal(validSupersessionTarget(source, target, target), true, 'pre-rollout target remains valid')
  })
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

// ── swarm-generic cap (§26) ────────────────────────────────────────────────────────────────────────
// The same F28/F28b preference has to hold for a NON-research swarm, whose record names its verdict
// something else. Commodity is the live case: `action` / `confidence`, capped by
// scripts/commodity_pre_mortem_haircut.py into `post_mortem_action` / `post_review_confidence_score`.
// The GOLD run is why this exists — its pre_mortem.json said "Does not survive — downgrade" (Trim, 40)
// while every cockpit surface still rendered the original Hold / 52.

check('resolveDisplayFields: commodity shape — post_mortem_action caps `action`, post-review caps `confidence`', () => {
  const r = resolveDisplayFields(
    { action: 'Hold', confidence: 52, post_mortem_action: 'Trim', post_review_confidence_score: 40, confidence_haircut: 12 },
    { verdictField: 'action' },
  )
  assert.equal(r.decision, 'Trim')
  assert.equal(r.decisionIsPostMortemCapped, true)
  assert.equal(r.confidence, 40)
  assert.equal(r.confidenceIsPostReview, true)
})

check('resolveDisplayFields: SWARM.md may capitalize the verdict field ("Action") — the lowercase record key still resolves', () => {
  const r = resolveDisplayFields(
    { action: 'Hold', confidence: 52, post_mortem_action: 'Trim', post_review_confidence_score: 40 },
    { verdictField: 'Action' },
  )
  assert.equal(r.decision, 'Trim')
  assert.equal(r.decisionIsPostMortemCapped, true)
})

check('resolveDisplayFields: commodity record with NO pre-mortem yet -> original action/confidence, nothing flagged', () => {
  const r = resolveDisplayFields({ action: 'Hold', confidence: 52 }, { verdictField: 'action' })
  assert.equal(r.decision, 'Hold')
  assert.equal(r.decisionIsPostMortemCapped, false)
  assert.equal(r.confidence, 52)
  assert.equal(r.confidenceIsPostReview, false)
})

// A pre-mortem that finds the call already conservative writes the SAME action back (the helper's
// "clean survival" path). Displaying it is right; badging it CAPPED is a false positive.
check('resolveDisplayFields: commodity clean survival (post_mortem_action == action) -> not flagged as capped', () => {
  const r = resolveDisplayFields(
    { action: 'Avoid', confidence: 61, post_mortem_action: 'Avoid', post_review_confidence_score: 61 },
    { verdictField: 'action' },
  )
  assert.equal(r.decision, 'Avoid')
  assert.equal(r.decisionIsPostMortemCapped, false)
})

// Without a verdictField the resolver must not silently start reading some other swarm's key — it falls
// back to research's `decision` and finds nothing, rather than guessing (the fail-closed rule the rest of
// the swarm plumbing follows during a deploy-skew window).
check('resolveDisplayFields: no verdictField -> fails closed to the research `decision` shape, never guesses `action`', () => {
  const r = resolveDisplayFields({ action: 'Hold', confidence: 52, post_mortem_action: 'Trim' })
  assert.equal(r.decision, null)
  assert.equal(r.decisionIsPostMortemCapped, false)
  // confidence is shape-agnostic (research `confidence_score` OR commodity `confidence`), so it still reads
  assert.equal(r.confidence, 52)
})

// Research records must be byte-identical to the pre-change behaviour when no opts are passed — the
// generalization is additive, not a re-route of the lane that already worked.
check('resolveDisplayFields: research call is unchanged by the generalization (no opts, `decision` wins)', () => {
  const r = resolveDisplayFields({ decision: 'Strong Buy', basket: 'Selected', post_mortem_decision: 'Watchlist', post_mortem_basket: 'Watchlist', confidence_score: 65, post_review_confidence_score: 49 })
  assert.deepEqual(r, { decision: 'Watchlist', basket: 'Watchlist', decisionIsPostMortemCapped: true, confidence: 49, confidenceIsPostReview: true })
})

console.log(`\n${passed} checks passed`)
