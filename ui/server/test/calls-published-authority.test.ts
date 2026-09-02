// Calls is a projection of published Git, not the mutable checkout. A doer may have dirty/private bytes;
// a fresh or static host may have no materialized analyses tree at all. Both must show the same calls.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'calls-published-authority-'))
const state = fs.mkdtempSync(path.join(os.tmpdir(), 'calls-published-state-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = state
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD'

execFileSync('git', ['-C', repo, 'init', '-q'])
execFileSync('git', ['-C', repo, 'config', 'user.email', 'calls-authority@example.invalid'])
execFileSync('git', ['-C', repo, 'config', 'user.name', 'Calls Authority Test'])

const write = (rel: string, body: string): void => {
  const file = path.join(repo, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
}

const olderRoot = 'analyses/ACME_2026-08-01'
const newerRoot = 'analyses/ACME_2026-08-10'
const olderDecision = {
  ticker: 'ACME', company_name: 'Acme Corp', decision_date: '2026-08-01', decision: 'Watchlist',
  confidence_score: 58, expected_return_pct: 5, review_schedule: { '30d': '2026-08-13' },
}
const newerDecision = {
  ticker: 'ACME', company_name: 'Acme Corp', decision_date: '2026-08-10', decision: 'Buy',
  confidence_score: 72, post_review_confidence_score: 76, expected_return_pct: 18, review_schedule: {},
}
write(`${olderRoot}/decision_record.json`, JSON.stringify(olderDecision, null, 2) + '\n')
write(`${olderRoot}/final_thesis.md`, '# ACME — original published thesis\n')
write(`${olderRoot}/verification_report_v2.json`, '{"verdict":"Clean","integrity_score":1e400}\n')
write(`${newerRoot}/decision_record.json`, JSON.stringify(newerDecision, null, 2) + '\n')
write(`${newerRoot}/final_thesis.md`, '# ACME — newer published thesis\n')
const supersededRoot = 'analyses/DUP_2026-08-05'
const supersedingRoot = 'analyses/DUP_2026-08-11'
write(`${supersededRoot}/decision_record.json`, JSON.stringify({
  ticker: 'DUP', decision_date: '2026-08-05', decision: 'Buy', basket: 'Selected',
  confidence_score: 82, entry_price: 100, currency: 'USD', review_schedule: {},
}, null, 2) + '\n')
write(`${supersededRoot}/final_thesis.md`, '# DUP — corrected-away call retained for audit\n')
write(`${supersededRoot}/corrections.json`, JSON.stringify({
  schema: 'corrections/v1', superseded_by: { run_root: supersedingRoot, reason: 'Test correction', date: '2026-08-11' }, errata: [],
}, null, 2) + '\n')
write(`${supersedingRoot}/decision_record.json`, JSON.stringify({
  ticker: 'DUP', decision_date: '2026-08-11', decision: 'Avoid', basket: 'Rejected',
  confidence_score: 47, run_root: supersedingRoot,
  final_thesis_path: `${supersedingRoot}/final_thesis.md`, review_schedule: {},
}, null, 2) + '\n')
write(`${supersedingRoot}/final_thesis.md`, '# DUP — corrected call\n' + 'x'.repeat(1100))
write(`${supersedingRoot}/memo.md`, '# DUP — corrected memo\n' + 'x'.repeat(1100))
write(`${supersedingRoot}/audit_dossier.md`, '# DUP — corrected audit\n' + 'x'.repeat(1100))

const reviewName = '2026-08-13_30d_decision_review.json'
const memoName = '2026-08-13_30d_memo_delta.md'
write(`${olderRoot}/reviews/${memoName}`, '# ACME memo delta\n\nThe operating evidence improved.\n')
write(`${olderRoot}/reviews/${reviewName}`, JSON.stringify({
  review_window: '30d', review_date: '2026-08-13', review_price: 110,
  absolute_return_pct: 10, benchmark_relative_return_pct: 6.5,
  thesis_status: 'confirmed', decision_quality: 'skill',
  action_now: { label: 'Hold', reason: 'The thesis remains supported.' },
  confidence_update: { before: 58, after: 64, change_reason: 'The named test passed.' },
  next_check: { date: '2026-09-30', label: 'Q3 results and margin check', trigger: 'Margin stays above 20%' },
  learning: { why_right_or_wrong: 'The call worked because the named test passed.', error_source: '', rule_for_future: 'Keep the dated test.', future_research_check: 'Recheck Q3 margin.' },
  lessons: ['Use the dated threshold.'], error_taxonomy: [],
  forecast_results: [{ status: 'confirmed' }],
  memo_delta: {
    summary: 'The operating evidence improved.', thesis_delta_verdict: 'strengthened',
    watch_items: ['Q3 results and margin check'],
    memo_delta_file: `${olderRoot}/reviews/${memoName}`,
  },
}, null, 2) + '\n')
const publishedReview = JSON.parse(fs.readFileSync(path.join(repo, `${olderRoot}/reviews/${reviewName}`), 'utf8'))
const reviewV2Name = '2026-08-13_30d_decision_review_v2.json'
const reviewV10Name = '2026-08-13_30d_decision_review_v10.json'
write(`${olderRoot}/reviews/${reviewV2Name}`, JSON.stringify({ ...publishedReview, review_price: 109 }, null, 2) + '\n')
write(`${olderRoot}/reviews/${reviewV10Name}`, JSON.stringify(publishedReview, null, 2) + '\n')
write(`${olderRoot}/reviews/2026-08-13_30d_decision_review_backup.json`, '{}\n')

// A decision record by itself is not a completed, publishable call.
write('analyses/HALF_2026-08-12/decision_record.json', JSON.stringify({
  ticker: 'HALF', decision_date: '2026-08-12', decision: 'Strong Buy',
}) + '\n')
write('analyses/tracking/2026-08-13_calls_tracker.md', '# Calls tracker\n')
write('analyses/manual copy (1).md', '# unrelated unsafe filename\n')

execFileSync('git', ['-C', repo, 'add', '--', 'analyses'])
execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'published Calls authority'])
const publishedCommit = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const publishedText = (rel: string): string => execFileSync(
  'git', ['-C', repo, 'show', `HEAD:${rel}`], { encoding: 'utf8' },
)

const {
  isPublishedCallsArtifactPath, listAllCalls, publishedIntegrityStatus, readPublishedCallsMarkdown, structuredReviewFields,
} = await import('../src/outputs')
const { publishedTreeAuthority, publishedTreePaths } = await import('../src/published-git')

assert.doesNotMatch(fs.readFileSync(new URL('../src/published-git.ts', import.meta.url), 'utf8'),
  /\b(?:execFileSync|execSync|spawnSync)\b/,
  'published Calls Git reads must never block the server event loop with a synchronous child process')

const malformedStructured = structuredReviewFields({
  action_now: { label: 'Add', reason: ' ' },
  next_check: { date: '2026-02-30', label: 'Impossible calendar check' },
}, {})
assert.equal(malformedStructured.action_now, null, 'an action without an evidence reason is not published')
assert.equal(malformedStructured.next_check?.date, null, 'an impossible regex-shaped date remains unproven')

// Poison mutable disk after the commit: replace a shared decision, remove its review, and add a private call.
fs.rmSync(path.join(repo, 'analyses'), { recursive: true, force: true })
write(`${olderRoot}/decision_record.json`, JSON.stringify({ ...olderDecision, decision: 'Avoid' }) + '\n')
write(`${olderRoot}/final_thesis.md`, '# dirty local thesis\n')
write('analyses/LOCAL_2026-08-14/decision_record.json', JSON.stringify({
  ticker: 'LOCAL', decision_date: '2026-08-14', decision: 'Strong Buy', review_schedule: {},
}) + '\n')
write('analyses/LOCAL_2026-08-14/final_thesis.md', '# private\n')

const dirty = await listAllCalls()
assert.deepEqual(dirty.calls.map((call: any) => call.run_root), [supersedingRoot, newerRoot, olderRoot],
  'only complete calls in published Git are enumerated; unrelated unsafe names are skipped')
assert.equal(dirty.calls.find((call: any) => call.run_root === olderRoot)?.decision, 'Watchlist',
  'the decision comes from published Git, not dirty disk')
assert.equal(dirty.calls.find((call: any) => call.run_root === newerRoot)?.frozen_call.confidence, 76,
  'the decision-time pre-mortem confidence haircut is frozen ahead of the mutable display confidence')
assert.ok(!dirty.calls.some((call: any) => call.run_root === supersededRoot),
  'a corrected-away call is not part of the standing Calls set')
assert.equal(dirty.history_calls.find((call: any) => call.run_root === supersededRoot)?.superseded, true,
  'a corrected-away call remains in append-only history so the replay cannot erase what Nostra said')
assert.deepEqual(dirty.calls.find((call: any) => call.run_root === olderRoot)?.frozen_call, {
  locked: true, decision: 'Watchlist', basket: null, confidence: 58, decision_date: '2026-08-01',
  entry_price: null, currency: null, source_path: `${olderRoot}/decision_record.json`,
}, 'the original decision-time state is frozen separately from every later review')
assert.equal(dirty.calls.find((call: any) => call.run_root === olderRoot)?.integrity_status, 'verified',
  'published verification survives a poisoned local thesis')
const integrityAuthority = await publishedTreeAuthority('analyses', repo, publishedCommit)
await integrityAuthority.loadRequired([`${olderRoot}/final_thesis.md`, `${olderRoot}/verification_report_v2.json`])
assert.equal(publishedIntegrityStatus(olderRoot, integrityAuthority).integrity_score,
  null, 'an overflowing JSON number never propagates as an infinite integrity score')
assert.equal(dirty.calls.find((call: any) => call.run_root === olderRoot)?.review_count, 3,
  'a locally absent published review remains completed')
assert.equal(dirty.calls.find((call: any) => call.run_root === olderRoot)
  ?.timeline.find((row: any) => row.window === '30d')?.status, 'done')
assert.deepEqual(
  dirty.calls.find((call: any) => call.run_root === olderRoot)?.timeline.find((row: any) => row.window === '30d'),
  {
    window: '30d', due_date: '2026-08-13', status: 'done', review_date: '2026-08-13',
    review_price: 110, absolute_return_pct: 10, benchmark_relative_return_pct: 6.5,
    thesis_status: 'confirmed', decision_quality: 'skill', forecasts_confirmed: 1,
    forecasts_falsified: 0, review_file: `${olderRoot}/reviews/${reviewV10Name}`, review_count: 3,
    memo_delta_file: `${olderRoot}/reviews/${memoName}`,
    memo_delta_summary: 'The operating evidence improved.', thesis_delta_verdict: 'strengthened',
    action_now: { label: 'Hold', reason: 'The thesis remains supported.', recorded: true },
    confidence_update: { before: 58, after: 64, change_reason: 'The named test passed.' },
    next_check: { date: '2026-09-30', label: 'Q3 results and margin check', trigger: 'Margin stays above 20%' },
    learning: { why_right_or_wrong: 'The call worked because the named test passed.', error_source: null, rule_for_future: 'Keep the dated test.', future_research_check: 'Recheck Q3 margin.' },
    lessons: ['Use the dated threshold.'], watch_items: ['Q3 results and margin check'],
  },
  'the published checkpoint carries the scorecard result, benchmark delta, and plain-English evidence',
)
assert.equal(dirty.scorecard.worked, 1)
assert.equal(dirty.scorecard.failed, 0)
assert.equal(dirty.scorecard.excluded_provisional, 0)
assert.equal(dirty.scorecard.horizons.find((row: any) => row.window === '30d')?.average_vs_benchmark_pct, null,
  'a Watchlist process outcome is scored, but its stock move is not treated as a held position return')
assert.equal(dirty.scorecard.confidence_check.status, 'too_little_data')
assert.equal(dirty.dashboard, 'analyses/tracking/2026-08-13_calls_tracker.md')
assert.equal(dirty.authority_commit, publishedCommit)
assert.equal(dirty.updates.filter((row: any) => row.kind === 'review').length, 1)
assert.ok(dirty.updates.some((row: any) => row.kind === 'call' && row.headline.includes('Watchlist → Buy')),
  'consecutive published calls create a durable call-change update')

for (const rel of [
  `${olderRoot}/final_thesis.md`,
  `${olderRoot}/reviews/${reviewName}`,
  `${olderRoot}/reviews/${memoName}`,
  'analyses/tracking/2026-08-13_calls_tracker.md',
]) {
  assert.equal(isPublishedCallsArtifactPath(rel), true, `${rel} is an admitted Calls artifact`)
  assert.deepEqual(await readPublishedCallsMarkdown(rel), { path: rel, markdown: publishedText(rel) },
    'click-through bytes come exactly from published Git')
}
for (const rel of [
  `${olderRoot}/decision_record.json`,
  `${olderRoot}/corrections.json`,
  `${olderRoot}/../secrets.md`,
  'analyses/tracking/2026-08-13_calls_tracker.json',
]) {
  assert.equal(isPublishedCallsArtifactPath(rel), false, `${rel} is outside the narrow artifact reader`)
  await assert.rejects(() => readPublishedCallsMarkdown(rel),
    (error: any) => error?.code === 'INVALID_CALLS_ARTIFACT_PATH')
}

// A static materialization with no analyses directory projects byte-for-byte the same result.
fs.rmSync(path.join(repo, 'analyses'), { recursive: true, force: true })
assert.deepEqual(await listAllCalls(await publishedTreeAuthority('analyses', repo, publishedCommit)), dirty)
assert.equal((await readPublishedCallsMarkdown(`${olderRoot}/final_thesis.md`)).markdown,
  publishedText(`${olderRoot}/final_thesis.md`))

const previousRef = process.env.ENGINE_PUBLISHED_GIT_REF
process.env.ENGINE_PUBLISHED_GIT_REF = 'refs/heads/does-not-exist'
await assert.rejects(() => publishedTreePaths('analyses'),
  (error: any) => error?.code === 'CALLS_AUTHORITY_UNAVAILABLE' && error?.statusCode === 503,
  'an invalid shared ref is an explicit authority failure, never an empty history')
process.env.ENGINE_PUBLISHED_GIT_REF = previousRef

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(state, { recursive: true, force: true })
console.log('ok  Calls decisions, reviews and artifacts come only from the verified published tree')
