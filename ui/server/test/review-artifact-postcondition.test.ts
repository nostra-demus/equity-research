process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from '../src/config'
import {
  bindScheduledReviewPostcondition,
  captureScheduledReviewGuard,
  finalizeRunOnClose,
  scheduledReviewProducedArtifact,
  validExactReviewArtifacts,
} from '../src/launcher'
import { createRun, setActiveSubjectRun } from '../src/registry'

const ticker = 'ZZRART'
const runRoot = `analyses/${ticker}_2099-01-01`
const root = path.join(ANALYSES_DIR, `${ticker}_2099-01-01`)
const reviews = path.join(root, 'reviews')

function reviewJson(name: string) {
  const memo = name.replace('_decision_review', '_memo_delta').replace(/\.json$/, '.md')
  return {
    schema_version: '1.0', ticker, original_decision_date: '2099-01-01', review_date: '2099-02-01',
    review_window: '30d', original_decision: 'Watchlist', basket: 'Watchlist', entry_price: null,
    review_price: null, absolute_return_pct: null, benchmark_return_pct: null, sector_return_pct: null,
    benchmark_relative_return_pct: null, sector_relative_return_pct: null, thesis_status: 'on-track',
    forecast_results: [], memo_delta: {
      summary: 'Nothing material changed.', thesis_delta_verdict: 'too_early',
      changed_sections: [],
      memo_delta_file: `${runRoot}/reviews/${memo}`,
    },
  }
}

function completeMemo(reviewDate = '2099-02-01', window = '30d'): string {
  return `# ${ticker} Memo Delta — ${reviewDate} (${window} review)

## 1. One-line verdict
The standing call remains unchanged after reviewing the new evidence.
## 2. What changed since the original memo
No material fact changed the original investment judgment.
## 3. Did the original thesis play out?
The thesis remains too early to confirm or falsify.
## 4. Forecasts, catalysts, risks
The next reported result remains the main checkpoint.
## 5. Section impact map
No research section needs a recommendation change today.
## 6. Stage-One sheet comment
Keep the current call and continue monitoring evidence.
## 7. Questions for management / analysts
Ask whether the operating improvement can persist next quarter.
## 8. Watch before the next checkpoint
Watch the next revenue, margin, and cash-flow update.
`
}

function writePair(name: string): void {
  const raw = reviewJson(name)
  fs.writeFileSync(path.join(reviews, name), JSON.stringify(raw, null, 2) + '\n')
  const memo = raw.memo_delta.memo_delta_file.split('/').pop()!
  fs.writeFileSync(path.join(reviews, memo), completeMemo())
}

function run() {
  return createRun({
    kind: 'review', ticker, model: 'sonnet', prompt: '', user: 'auto', userVia: 'local', runRoot,
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], expected: new Map(),
  })
}

try {
  fs.mkdirSync(reviews, { recursive: true })
  fs.writeFileSync(path.join(root, 'decision_record.json'), JSON.stringify({
    ticker, run_root: runRoot, decision_date: '2099-01-01', review_schedule: { '30d': '2099-01-31' },
  }, null, 2) + '\n')

  const malformed = '2099-02-01_30d_decision_review.json'
  fs.writeFileSync(path.join(reviews, malformed), '{"ticker":')
  assert.equal(validExactReviewArtifacts(runRoot, ticker, '30d').length, 0)

  const published = () => true
  const missingGuard = captureScheduledReviewGuard(runRoot, ticker, '30d', published)!
  assert.ok(missingGuard)
  const missing = run()
  setActiveSubjectRun(missing.runId, ticker)
  missing.status = 'running'
  bindScheduledReviewPostcondition(missing, missingGuard)
  finalizeRunOnClose(missing, { exitCode: 0 }, '')
  assert.equal(missing.status, 'incomplete', 'clean exit without a new exact artifact must retry')
  assert.equal(missing.note, 'incomplete: scheduled review wrote no valid new review artifact')

  const successGuard = captureScheduledReviewGuard(runRoot, ticker, '30d', published)!
  // Overwriting a pre-existing malformed name cannot earn this attempt success: scheduled reviews are
  // append-only and must choose the next revision name.
  writePair(malformed)
  assert.equal(scheduledReviewProducedArtifact(successGuard, Date.now()), false)

  const revision = '2099-02-01_30d_decision_review_v2.json'
  fs.writeFileSync(path.join(reviews, revision), JSON.stringify(reviewJson(revision), null, 2) + '\n')
  assert.equal(scheduledReviewProducedArtifact(successGuard, Date.now()), false,
    'JSON without its required paired memo is still incomplete')
  fs.writeFileSync(path.join(reviews, '2099-02-01_30d_memo_delta_v2.md'), 'x')
  assert.equal(scheduledReviewProducedArtifact(successGuard, Date.now()), false,
    'a one-byte memo cannot turn a partial pair into a successful paid review')
  fs.writeFileSync(path.join(reviews, '2099-02-01_30d_memo_delta_v2.md'), completeMemo())
  assert.equal(scheduledReviewProducedArtifact(successGuard, Date.now()), true)

  const succeeded = run()
  // Reproduce the actual binding order: admission snapshot first, then the child appends a new revision.
  const thirdGuard = captureScheduledReviewGuard(runRoot, ticker, '90d')
  assert.equal(thirdGuard, null, 'a window absent from the exact decision cannot be bound')
  // The pure postcondition above proves the v2 pair. A fresh run bound before v3 proves close-time wiring.
  const closeGuard = captureScheduledReviewGuard(runRoot, ticker, '30d', published)!
  bindScheduledReviewPostcondition(succeeded, closeGuard)
  setActiveSubjectRun(succeeded.runId, ticker)
  succeeded.status = 'running'
  writePair('2099-02-01_30d_decision_review_v3.json')
  finalizeRunOnClose(succeeded, { exitCode: 0 }, '')
  assert.equal(succeeded.status, 'done')

  console.log('review artifact postcondition: exact, parsed, fresh and append-only: ok')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
