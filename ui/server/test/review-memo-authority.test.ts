process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'review-memo-authority-repo-'))
const state = fs.mkdtempSync(path.join(os.tmpdir(), 'review-memo-authority-state-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = state
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD'

execFileSync('git', ['-C', repo, 'init', '-q'])
execFileSync('git', ['-C', repo, 'config', 'user.email', 'review-memo@example.invalid'])
execFileSync('git', ['-C', repo, 'config', 'user.name', 'Review Memo Test'])

const ticker = 'LEGACY'
const runRoot = `analyses/${ticker}_2026-08-01`
const reviewDate = '2026-08-13'
const window = '30d'
const reviewName = `${reviewDate}_${window}_decision_review.json`
const memoName = `${reviewDate}_${window}_memo_delta.md`
const write = (rel: string, body: string) => {
  const file = path.join(repo, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
}

write(`${runRoot}/decision_record.json`, JSON.stringify({
  ticker, run_root: runRoot, company_name: 'Legacy Co', decision_date: '2026-08-01',
  decision: 'Watchlist', confidence_score: 50, review_schedule: { [window]: reviewDate },
}, null, 2) + '\n')
write(`${runRoot}/final_thesis.md`, '# Legacy thesis\n')
write(`${runRoot}/reviews/${reviewName}`, JSON.stringify({
  schema_version: '1.0', ticker, original_decision_date: '2026-08-01', review_date: reviewDate,
  review_window: window, original_decision: 'Watchlist', basket: 'Watchlist', entry_price: null,
  review_price: null, absolute_return_pct: null, benchmark_return_pct: null, sector_return_pct: null,
  benchmark_relative_return_pct: null, sector_relative_return_pct: null, thesis_status: 'on-track',
  forecast_results: [], memo_delta: {
    summary: 'No material change.', thesis_delta_verdict: 'too_early', changed_sections: [],
    memo_delta_file: `${runRoot}/reviews/${memoName}`,
  },
}, null, 2) + '\n')
write(`${runRoot}/reviews/${memoName}`, 'x')
execFileSync('git', ['-C', repo, 'add', '--', 'analyses'])
execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'partial review memo'])

const { listAllCalls } = await import('../src/outputs')
const { scheduledReviewAuthority } = await import('../src/launcher')
const { validAuthoritativeReviewMemo, validCompleteReviewMemo } = await import('../src/review-artifact')
const identity = { ticker, reviewDate, window }

assert.equal(validCompleteReviewMemo(Buffer.from('x'), identity), false)
assert.equal(validAuthoritativeReviewMemo(Buffer.from('x'), identity), false)
const outlineOnly = `# ${ticker} Memo Delta — ${reviewDate} (${window} review)\n\n${[
  '## 1. One-line verdict',
  '## 2. What changed since the original memo',
  '## 3. Did the original thesis play out?',
  '## 4. Forecasts, catalysts, risks',
  '## 5. Section impact map',
  '## 6. Stage-One sheet comment',
  '## 7. Questions for management / analysts',
  '## 8. Watch before the next checkpoint',
].join('\n\n')}\n`
assert.equal(validCompleteReviewMemo(Buffer.from(outlineOnly), identity), false,
  'the current exact headings without section bodies are not a completed memo')
assert.equal(validAuthoritativeReviewMemo(Buffer.from(outlineOnly), identity), false,
  'published authority also rejects a crash-truncated outline')
let call: any = listAllCalls().calls.find((row: any) => row.run_root === runRoot)
assert.equal(call.review_count, 0, 'Calls cannot turn a one-byte published memo into a completed review')
assert.notEqual(call.timeline.find((row: any) => row.window === window)?.status, 'done')
assert.equal(scheduledReviewAuthority(runRoot, ticker, window, '2026-08-14'), 'due',
  'shared launcher authority also keeps the checkpoint due')

const legacyMemo = `# ${ticker} Memo Delta — ${reviewDate} (${window} review)

## 1. Historical verdict
The standing call remains unchanged after reviewing all available evidence.
## 2. Evidence delta
No new fact changes the original investment judgment today.
## 3. Thesis progress
The thesis remains early and is not yet falsified.
## 4. Historical scoring gap
This legitimate old template included an additional analytical section.
## 5. Forecast and risk review
The next reported result remains the binding checkpoint.
## 6. Section map
No core research section needs to be rerun now.
## 7. Stage-One comment
Keep the current call and continue monitoring evidence.
## 8. Questions
Ask whether the recent operating improvement can persist.
## 9. Next checkpoint
Watch the next revenue, margin, and cash-flow update.
`
write(`${runRoot}/reviews/${memoName}`, legacyMemo)
execFileSync('git', ['-C', repo, 'add', '--', `${runRoot}/reviews/${memoName}`])
execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'complete legacy review memo'])

assert.equal(validCompleteReviewMemo(Buffer.from(legacyMemo), identity), false,
  'legacy history is not mislabeled as a current strict prompt output')
assert.equal(validAuthoritativeReviewMemo(Buffer.from(legacyMemo), identity), true,
  'the compatibility witness preserves a substantive ordered nine-section memo')
call = listAllCalls().calls.find((row: any) => row.run_root === runRoot)
assert.equal(call.review_count, 1)
assert.equal(call.timeline.find((row: any) => row.window === window)?.status, 'done')
assert.equal(scheduledReviewAuthority(runRoot, ticker, window, '2026-08-14'), 'settled')

const publishedRef = process.env.ENGINE_PUBLISHED_GIT_REF
process.env.ENGINE_PUBLISHED_GIT_REF = 'refs/heads/temporarily-unreadable'
assert.equal(scheduledReviewAuthority(runRoot, ticker, window, '2026-08-14'), 'unavailable',
  'an unreadable shared ref is never reinterpreted as permission to buy a duplicate review')
process.env.ENGINE_PUBLISHED_GIT_REF = publishedRef

// Calls remains a pure published-Git projection after local review materialization disappears.
fs.rmSync(path.join(repo, 'analyses'), { recursive: true, force: true })
call = listAllCalls().calls.find((row: any) => row.run_root === runRoot)
assert.equal(call.review_count, 1)
assert.equal(call.timeline.find((row: any) => row.window === window)?.status, 'done')
assert.equal(scheduledReviewAuthority(runRoot, ticker, window, '2026-08-14'), 'settled',
  'the paid launch boundary reads the pinned published pair even when the local checkout is de-materialized')

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(state, { recursive: true, force: true })
console.log('review memo authority rejects fragments and preserves complete legacy history: ok')
