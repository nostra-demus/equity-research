// Calls is a projection of published Git, not the mutable checkout. A doer may have dirty/private bytes;
// a fresh or static host may have no materialized analyses tree at all. Both must show the same call,
// completed review and intake notification from the configured shared ref.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'calls-published-authority-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'calls-published-state-'))
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD' // static snapshot mode: the checked-out commit is authority

execFileSync('git', ['-C', repo, 'init', '-q'])
execFileSync('git', ['-C', repo, 'config', 'user.email', 'calls-authority@example.invalid'])
execFileSync('git', ['-C', repo, 'config', 'user.name', 'Calls Authority Test'])

const write = (rel: string, body: string): void => {
  const file = path.join(repo, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
}
const canonical = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

const runRoot = 'analyses/ACME_2026-08-01'
const decision = {
  ticker: 'ACME', company_name: 'Acme Corp', decision_date: '2026-08-01', decision: 'Buy',
  basket: 'Selected', confidence_score: 72, expected_return_pct: 15, review_schedule: { '30d': '2026-08-13' },
}
write(`${runRoot}/decision_record.json`, JSON.stringify(decision, null, 2) + '\n')
write(`${runRoot}/final_thesis.md`, '# ACME\n\nPROVISIONAL — the automated finish-gate found a gap.\n')
write(`${runRoot}/verification_report_v2.json`, JSON.stringify({ verdict: 'Clean', integrity_score: 99 }) + '\n')

const reviewName = '2026-08-13_30d_decision_review.json'
const memoName = '2026-08-13_30d_memo_delta.md'
write(`${runRoot}/reviews/${memoName}`, `# ACME Memo Delta — 2026-08-13 (30d review)

## 1. One-line verdict
The evidence improved and the standing call remains intact.
## 2. What changed since the original memo
The latest evidence improved the operating picture.
## 3. Did the original thesis play out?
The thesis is progressing but remains early.
## 4. Forecasts, catalysts, risks
The next reported result remains the key checkpoint.
## 5. Section impact map
The evidence changes the operating section only.
## 6. Stage-One sheet comment
Keep the current call and watch the next result.
## 7. Questions for management / analysts
Ask whether the improvement can persist.
## 8. Watch before the next checkpoint
Watch the next reported revenue and margin update.
`)
write(`${runRoot}/reviews/${reviewName}`, JSON.stringify({
  schema_version: '1.0', ticker: 'ACME', original_decision_date: '2026-08-01', review_date: '2026-08-13',
  review_window: '30d', original_decision: 'Buy', basket: 'Selected', entry_price: null, review_price: 115,
  absolute_return_pct: 15, benchmark_return_pct: 2, sector_return_pct: 3,
  benchmark_relative_return_pct: 13, sector_relative_return_pct: 12, thesis_status: 'confirmed',
  forecast_results: [], memo_delta: {
    summary: 'The evidence improved.', thesis_delta_verdict: 'strengthened', changed_sections: [],
    memo_delta_file: `${runRoot}/reviews/${memoName}`,
  },
}, null, 2) + '\n')

const decisionFingerprint = `sha256:${createHash('sha256')
  .update(`${runRoot}\n${canonical(decision)}`, 'utf8').digest('hex')}`
const scannedAt = new Date(Date.now() - 5_000).toISOString()
const intakePlan = {
  schema_version: '1.1', swarm: 'research', subject: 'ACME', ticker: 'ACME', run_root: runRoot,
  decision_fingerprint: decisionFingerprint,
  scan_date: scannedAt.slice(0, 10), scanned_at: scannedAt,
  evidence_files: [{ path: 'data/ACME/news.txt', arrival_ms: Date.parse(scannedAt) - 1 }], new_docs: [],
  rerun_plan: {
    materiality_gate: 60, entry_orbs: [], commands: [],
    note_only: [{ path: 'data/ACME/news.txt', reason: 'No material change.' }],
  },
  verdict: 'note_only', summary: 'Finished automatically.',
}
const intakePlanPath = `${runRoot}/intake/2026-08-13_intake_plan.json`
write(intakePlanPath, JSON.stringify(intakePlan, null, 2) + '\n')
const intakePlanSha256 = `sha256:${createHash('sha256').update(canonical(intakePlan)).digest('hex')}`
const { stageAutomaticIntakeOutcomeReceipt } = await import('../src/intake-outcome-receipt')
stageAutomaticIntakeOutcomeReceipt({
  ticker: 'ACME', swarm: 'research', runRoot, decisionFingerprint,
  poolNewestMs: Date.parse(scannedAt) - 1,
  plan: {
    ...intakePlan,
    plan_path: intakePlanPath,
    plan_sha256: intakePlanSha256,
    actionable: true,
    coverage_complete: true,
    analyzed_at: scannedAt,
    widened: [],
    pool_current: true,
    consumed: false,
  } as any,
}, { repoRoot: repo })
write('analyses/tracking/2026-08-13_calls_tracker.md', '# Calls tracker\n')

execFileSync('git', ['-C', repo, 'add', '--', 'analyses'])
execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'published Calls authority'])

const { isPublishedCallsArtifactPath, listAllCalls, readPublishedCallsMarkdown } = await import('../src/outputs')
const { publishedTreePaths } = await import('../src/git-publication')
const publishedText = (rel: string): string => execFileSync('git', ['-C', repo, 'show', `HEAD:${rel}`], { encoding: 'utf8' })

// Poison the live checkout: remove every published review/intake/dashboard, replace the published call's
// terminal bytes, and add a private call. None of this may change the shared projection.
fs.rmSync(path.join(repo, 'analyses'), { recursive: true, force: true })
write(`${runRoot}/decision_record.json`, JSON.stringify({ ...decision, decision: 'Avoid' }) + '\n')
write(`${runRoot}/final_thesis.md`, '# dirty local thesis without the published integrity banner\n')
write('analyses/LOCAL_2026-08-14/decision_record.json', JSON.stringify({
  ticker: 'LOCAL', decision_date: '2026-08-14', decision: 'Strong Buy', review_schedule: {},
}) + '\n')
write('analyses/LOCAL_2026-08-14/final_thesis.md', '# private\n')

const dirty = listAllCalls()
assert.deepEqual(dirty.calls.map((call: any) => call.run_root), [runRoot], 'private local calls are not enumerated')
assert.equal(dirty.calls[0].decision, 'Buy', 'the decision blob comes from published Git, not dirty disk')
assert.equal(dirty.calls[0].integrity_status, 'provisional', 'the published thesis banner survives a poisoned local thesis')
assert.equal(dirty.calls[0].review_count, 1, 'a locally absent published review remains completed')
assert.equal(dirty.calls[0].timeline.find((row: any) => row.window === '30d')?.status, 'done',
  'local review absence never reinterprets a published checkpoint as due')
assert.equal(dirty.dashboard, 'analyses/tracking/2026-08-13_calls_tracker.md')
assert.equal(dirty.updates.filter((row: any) => row.kind === 'review').length, 1)
assert.equal(dirty.updates.filter((row: any) => row.kind === 'data_check').length, 1,
  'a locally absent published outcome receipt still emits its shared notification')

for (const rel of [
  `${runRoot}/final_thesis.md`,
  `${runRoot}/reviews/${reviewName}`,
  `${runRoot}/reviews/${memoName}`,
  intakePlanPath,
  'analyses/tracking/2026-08-13_calls_tracker.md',
]) {
  assert.equal(isPublishedCallsArtifactPath(rel), true, `${rel} is an admitted Calls artifact`)
  assert.deepEqual(readPublishedCallsMarkdown(rel), { path: rel, markdown: publishedText(rel) },
    'Calls click-through bytes come exactly from published Git even when local bytes are dirty or absent')
}
for (const rel of [
  `${runRoot}/decision_record.json`,
  `${runRoot}/intake/outcomes/${'a'.repeat(64)}.json`,
  `${runRoot}/corrections.json`,
  `${runRoot}/../secrets.md`,
  'analyses/tracking/2026-08-13_calls_tracker.json',
]) {
  assert.equal(isPublishedCallsArtifactPath(rel), false, `${rel} is outside the narrow Calls artifact reader`)
  assert.throws(() => readPublishedCallsMarkdown(rel), (error: any) => error?.code === 'INVALID_CALLS_ARTIFACT_PATH')
}

// A fresh/static materialization with no analyses directory projects byte-for-byte the same result.
fs.rmSync(path.join(repo, 'analyses'), { recursive: true, force: true })
assert.deepEqual(listAllCalls(), dirty)
assert.equal(readPublishedCallsMarkdown(`${runRoot}/final_thesis.md`).markdown,
  publishedText(`${runRoot}/final_thesis.md`), 'a de-materialized static host still opens the published thesis')

const previousRef = process.env.ENGINE_PUBLISHED_GIT_REF
process.env.ENGINE_PUBLISHED_GIT_REF = 'refs/heads/does-not-exist'
assert.throws(() => publishedTreePaths('analyses'), (error: any) => error?.code === 'CALLS_AUTHORITY_UNAVAILABLE',
  'an invalid shared ref is an explicit authority failure, never an empty history')
process.env.ENGINE_PUBLISHED_GIT_REF = previousRef

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(process.env.ENGINE_STATE_DIR!, { recursive: true, force: true })
console.log('ok  Calls decisions, reviews and intake events come only from the positively verified published tree')
