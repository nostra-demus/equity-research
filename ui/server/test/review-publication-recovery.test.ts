import assert from 'node:assert/strict'
import { recoverSavedReviewPublication } from '../src/review-publication-recovery'

const review = { ticker: 'TEST', runRoot: 'analyses/TEST_2026-08-13', window: '30d' }
const artifact = {
  file: '2026-09-12_30d_decision_review.json',
  memoFile: '2026-09-12_30d_memo_delta.md',
  mtimeMs: 1,
  memoMtimeMs: 1,
}
const paths = [
  `${review.runRoot}/reviews/${artifact.file}`,
  `${review.runRoot}/reviews/${artifact.memoFile}`,
]
const commit = 'd'.repeat(40)
const rawReview = {
  schema_version: '1.0', ticker: review.ticker, original_decision_date: '2026-08-13', review_date: '2026-09-12',
  review_window: review.window, original_decision: 'Watchlist', basket: 'Watchlist', entry_price: null,
  review_price: null, absolute_return_pct: null, benchmark_return_pct: null, sector_return_pct: null,
  benchmark_relative_return_pct: null, sector_relative_return_pct: null, thesis_status: 'on-track',
  forecast_results: [], memo_delta: {
    summary: 'Nothing material changed.', thesis_delta_verdict: 'too_early', changed_sections: [],
    memo_delta_file: paths[1],
  },
}
const saved = new Map([
  [`${review.runRoot}/decision_record.json`, Buffer.from(JSON.stringify({
    ticker: review.ticker, run_root: review.runRoot, decision_date: '2026-08-13', review_schedule: { '30d': '2026-09-12' },
  }))],
  [paths[0], Buffer.from(JSON.stringify(rawReview))],
  [paths[1], Buffer.from(`# TEST Memo Delta — 2026-09-12 (30d review)

## 1. One-line verdict
The standing call remains unchanged after this scheduled evidence review.
## 2. What changed since the original memo
No new fact changes the original investment judgment today.
## 3. Did the original thesis play out?
The thesis remains too early to confirm or falsify.
## 4. Forecasts, catalysts, risks
The next reported result remains the binding checkpoint.
## 5. Section impact map
No core research section needs a recommendation change now.
## 6. Stage-One sheet comment
Keep the current call and continue monitoring new evidence.
## 7. Questions for management / analysts
Ask whether the recent operating improvement can persist next quarter.
## 8. Watch before the next checkpoint
Watch the next revenue, margin, and cash-flow update.
`)],
])
const savedDeps = {
  candidates: () => [commit],
  changedPaths: () => paths,
  commitBytes: (_commit: string, repoPath: string) => saved.get(repoPath) ?? null,
}

{
  let settled = false
  let publishes = 0
  const recovered = await recoverSavedReviewPublication(review, {
    authority: () => settled ? 'settled' : 'due',
    ...savedDeps,
    publish: async (_message, actual, sourceCommit) => {
      publishes++
      assert.deepEqual(actual, paths)
      assert.equal(sourceCommit, commit)
      settled = true
    },
  })
  assert.equal(recovered, true)
  assert.equal(publishes, 1)
}

{
  let publishes = 0
  const recovered = await recoverSavedReviewPublication(review, {
    authority: () => publishes ? 'settled' : 'due',
    // The saved commit may also contain another company's pair; the review-only commit finder returns it,
    // while recovery still reads and publishes only this exact validated pair.
    ...savedDeps,
    publish: async (_message, actual) => { publishes++; assert.deepEqual(actual, paths) },
  })
  assert.equal(recovered, true)
  assert.equal(publishes, 1, 'one requested pair recovers from a valid multi-review data commit')
}

{
  let publishes = 0
  let committed = false
  let settled = false
  assert.equal(await recoverSavedReviewPublication(review, {
    authority: () => settled ? 'settled' : 'due',
    candidates: () => committed ? [commit] : [], commitBytes: (_commit, repoPath) => saved.get(repoPath) ?? null,
    changedPaths: () => paths,
    localArtifact: () => ({ paths }),
    commit: async (_message, actual) => { assert.deepEqual(actual, paths); committed = true },
    publish: async () => { publishes++; settled = true },
  }), true)
  assert.equal(publishes, 1, 'a complete pre-commit pair is committed and published without another paid review')
}

{
  let launches = 0
  await assert.rejects(() => recoverSavedReviewPublication(review, {
    authority: () => 'due', candidates: () => [], commitBytes: () => null,
    changedPaths: () => [], localArtifact: () => ({ paths }),
    commit: async () => { throw new Error('commit failed before creating an immutable candidate') },
    publish: async () => { launches++ },
  }), /could not be committed safely/)
  assert.equal(launches, 0, 'a complete local pair remains publication-pending when its commit cannot be proved')
}

{
  let publishes = 0
  assert.equal(await recoverSavedReviewPublication(review, {
    authority: () => 'due',
    candidates: () => [commit], commitBytes: () => null,
    changedPaths: () => paths,
    localArtifact: () => null,
    publish: async () => { publishes++ },
  }), false)
  assert.equal(publishes, 0, 'no valid saved pair falls through to the normal paid review path')
}

{
  let publishes = 0
  await assert.rejects(() => recoverSavedReviewPublication(review, {
    authority: () => 'unavailable', candidates: () => [], commitBytes: () => null,
    changedPaths: () => [], localArtifact: () => null,
    publish: async () => { publishes++ },
  }), (error: any) => error?.code === 'REVIEW_AUTHORITY_UNAVAILABLE')
  assert.equal(publishes, 0, 'unreadable shared authority can never authorize another paid review')
}

{
  let reads = 0
  await assert.rejects(() => recoverSavedReviewPublication(review, {
    authority: () => ++reads === 1 ? 'due' : 'unavailable',
    candidates: () => [], commitBytes: () => null, changedPaths: () => [], localArtifact: () => null,
    publish: async () => {},
  }), (error: any) => error?.code === 'REVIEW_AUTHORITY_UNAVAILABLE')
  assert.equal(reads, 2, 'authority is rechecked after saved/local probes before returning paid permission')
}

{
  const partial = new Map(saved)
  partial.set(paths[1], Buffer.from('x'))
  let publishes = 0
  assert.equal(await recoverSavedReviewPublication(review, {
    authority: () => 'due', candidates: () => [commit], changedPaths: () => paths,
    commitBytes: (_commit, repoPath) => partial.get(repoPath) ?? null,
    localArtifact: () => null,
    publish: async () => { publishes++ },
  }), false)
  assert.equal(publishes, 0, 'a one-byte saved memo cannot settle or publish an immutable review pair')
}

{
  const legacy = new Map(saved)
  legacy.set(paths[1], Buffer.from(`# TEST Memo Delta — 2026-09-12 (30d review)

## 1. Verdict from the historical template
The call remains unchanged after reviewing all available evidence.
## 2. Evidence delta
No new fact changes the core investment judgment today.
## 3. Thesis progress
The thesis remains early and is not yet falsified.
## 4. Historical scoring gap
The old template included this additional analytical section.
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
`))
  let settled = false
  assert.equal(await recoverSavedReviewPublication(review, {
    authority: () => settled ? 'settled' : 'due', candidates: () => [commit], changedPaths: () => paths,
    commitBytes: (_commit, repoPath) => legacy.get(repoPath) ?? null,
    localArtifact: () => null,
    publish: async () => { settled = true },
  }), true, 'a complete nine-section legacy memo remains valid saved authority')
}

{
  await assert.rejects(() => recoverSavedReviewPublication(review, {
    authority: () => 'due', ...savedDeps,
    publish: async () => {},
  }), /still not available/)
}

console.log('review-publication-recovery.test.ts: all assertions passed')
