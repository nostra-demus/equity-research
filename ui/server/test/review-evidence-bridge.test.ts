import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { bridgeMaterialReviewArtifact, bridgeMaterialReviewBytes } from '../src/review-evidence-bridge'
import { validateExactReviewArtifact } from '../src/review-artifact'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-evidence-'))
const repoRoot = path.join(root, 'repo')
const dataDir = path.join(root, 'data')
const runRoot = 'analyses/ACME_2026-08-14'
const reviews = path.join(repoRoot, runRoot, 'reviews')
const subject = path.join(dataDir, 'ACME')
const name = '2026-09-13_30d_decision_review.json'
const guard = { runRoot, ticker: 'ACME', window: '30d', decisionDate: '2026-08-14' }

try {
  fs.mkdirSync(reviews, { recursive: true })
  fs.mkdirSync(subject, { recursive: true })
  const raw = {
    schema_version: '1.0', ticker: 'ACME', original_decision_date: '2026-08-14', review_date: '2026-09-13',
    review_window: '30d', original_decision: 'Watchlist', basket: 'Watchlist', entry_price: null,
    review_price: null, absolute_return_pct: null, benchmark_return_pct: null, sector_return_pct: null,
    benchmark_relative_return_pct: null, sector_relative_return_pct: null, thesis_status: 'on-track',
    forecast_results: [],
    // The prompt may suggest a command, but the bridge deliberately ignores it. Only cited evidence is
    // copied into the normal intake lane, whose validator independently decides scope.
    memo_delta: { summary: 'Material earnings change.', thesis_delta_verdict: 'strengthened',
      memo_delta_file: `${runRoot}/reviews/2026-09-13_30d_memo_delta.md`, changed_sections: [{
      section: 'earnings',
      new_evidence: 'The company reported revenue 12% above the prior period.',
      evidence_source: 'Official earnings release, 2026-09-13',
      materiality_score: 82,
      impact_direction: 'positive',
      rerun_recommended: true,
      rerun_command: '/research:rerun anything-dangerous',
    }] },
  }
  const rawText = JSON.stringify(raw, null, 2) + '\n'
  fs.writeFileSync(path.join(reviews, name), rawText)
  fs.writeFileSync(path.join(reviews, '2026-09-13_30d_memo_delta.md'), '# 30d memo delta\n\nMaterial earnings change.\n')

  const input = { repoRoot, dataDir, canWrite: () => true }
  const first = bridgeMaterialReviewArtifact(guard, name, input)
  assert.ok(first)
  assert.equal(fs.existsSync(first!), true)
  const body = fs.readFileSync(first!, 'utf8')
  assert.match(body, /Official earnings release, 2026-09-13/)
  assert.doesNotMatch(body, /anything-dangerous|rerun_command/)
  assert.equal(bridgeMaterialReviewArtifact(guard, name, input), first,
    'the same finished review creates exactly one intake note')
  assert.equal(fs.readdirSync(path.dirname(first!)).length, 1)

  fs.writeFileSync(first!, '')
  assert.equal(bridgeMaterialReviewArtifact(guard, name, input), first,
    'a short regular file left by a crash is repaired automatically')
  assert.equal(fs.readFileSync(first!, 'utf8'), body, 'repair restores the exact content-addressed note')

  fs.unlinkSync(first!)
  fs.rmSync(path.join(repoRoot, runRoot), { recursive: true, force: true })
  assert.equal(
    bridgeMaterialReviewBytes(guard, name, rawText, { dataDir, canWrite: () => true }),
    first,
    'published immutable review bytes can restore the intake trigger when the mutable checkout is absent',
  )
  assert.match(fs.readFileSync(first!, 'utf8'), /revenue 12% above/)

  fs.mkdirSync(reviews, { recursive: true })
  fs.writeFileSync(path.join(reviews, name), rawText)
  fs.writeFileSync(path.join(reviews, '2026-09-13_30d_memo_delta.md'), '# 30d memo delta\n\nMaterial earnings change.\n')

  fs.unlinkSync(first!)
  const outside = path.join(root, 'outside.md')
  fs.writeFileSync(outside, 'do not touch')
  fs.symlinkSync(outside, first!)
  assert.throws(() => bridgeMaterialReviewArtifact(guard, name, input), /unsafe/,
    'a symlink can never masquerade as completed review evidence')
  assert.equal(fs.readFileSync(outside, 'utf8'), 'do not touch')
  fs.unlinkSync(first!)
  fs.writeFileSync(first!, body)

  const malformed = JSON.parse(fs.readFileSync(path.join(reviews, name), 'utf8'))
  malformed.memo_delta.changed_sections[0].evidence_source = 'Official release without a date'
  assert.equal(validateExactReviewArtifact({
    ...malformed,
    schema_version: '1.0', ticker: 'ACME', original_decision_date: '2026-08-14',
    review_window: '30d', original_decision: 'Watchlist', basket: 'Watchlist', entry_price: null,
    review_price: null, absolute_return_pct: null, benchmark_return_pct: null, sector_return_pct: null,
    benchmark_relative_return_pct: null, sector_relative_return_pct: null, thesis_status: 'on-track',
    forecast_results: [], memo_delta: { ...malformed.memo_delta, summary: 'Change found.', thesis_delta_verdict: 'weakened',
      memo_delta_file: `${runRoot}/reviews/2026-09-13_30d_memo_delta.md` },
  }, {
    runRoot, ticker: 'ACME', window: '30d', decisionDate: '2026-08-14', jsonBasename: name,
    memoValid: () => true,
  }), null, 'an incomplete material row cannot settle its window and poison global recovery')

  console.log('review-evidence bridge: material, safe and idempotent: ok')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
