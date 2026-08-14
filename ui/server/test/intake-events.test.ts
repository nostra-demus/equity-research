// Published server-authored outcome receipts are the sole shared source for automatic intake
// notifications. This starts with an empty process-local state directory, like a static/failover host.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-events-repo-'))
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-events-state-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = stateDir
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD'

execFileSync('git', ['-C', repo, 'init', '-q'])
execFileSync('git', ['-C', repo, 'config', 'user.email', 'intake-events@example.invalid'])
execFileSync('git', ['-C', repo, 'config', 'user.name', 'Intake Events Test'])

const canonical = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}
const write = (rel: string, body: string) => {
  const file = path.join(repo, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
}
const fingerprint = (runRoot: string, decision: unknown) =>
  `sha256:${createHash('sha256').update(`${runRoot}\n${canonical(decision)}`).digest('hex')}`
const hash = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const scannedAt = new Date(Date.now() - 5_000).toISOString()
const { stageAutomaticIntakeOutcomeReceipt } = await import('../src/intake-outcome-receipt')

function seedCall(ticker: string, date: string, verdict: 'note_only' | 'insufficient' | 'scoped_rerun') {
  const runRoot = `analyses/${ticker}_${date}`
  const decision = {
    ticker,
    company_name: `${ticker} Company`,
    decision_date: date,
    decision: 'Watchlist',
    confidence_score: 50,
    expected_return_pct: 5,
  }
  const decisionFingerprint = fingerprint(runRoot, decision)
  write(`${runRoot}/decision_record.json`, JSON.stringify(decision, null, 2) + '\n')
  write(`${runRoot}/final_thesis.md`, `# ${ticker} thesis\n`)
  const evidencePath = `data/${ticker}/${verdict === 'insufficient' ? 'filing.pdf' : 'news.txt'}`
  const commands = verdict === 'scoped_rerun'
    ? [{ command: '/research:rerun evidence', module: 'business-model', agent: 'business-model-analyst', cascade_modules: [], triggered_by: [evidencePath] }]
    : []
  const plan = {
    schema_version: '1.1', swarm: 'research', subject: ticker, ticker, run_root: runRoot,
    decision_fingerprint: decisionFingerprint,
    scan_date: scannedAt.slice(0, 10), scanned_at: scannedAt,
    evidence_files: [{ path: evidencePath, arrival_ms: Date.parse(scannedAt) - 1 }],
    new_docs: verdict === 'insufficient' ? [{ path: evidencePath }] : [],
    rerun_plan: {
      materiality_gate: 60,
      entry_orbs: commands.map((row) => ({ module: row.module, agent: row.agent })),
      commands,
      note_only: verdict === 'note_only' ? [{ path: evidencePath, reason: 'No material change.' }] : [],
    },
    verdict,
    summary: 'Finished automatically.',
  }
  const planPath = `${runRoot}/intake/${date}_intake_plan.json`
  write(planPath, JSON.stringify(plan, null, 2) + '\n')
  const planSha256 = hash(canonical(plan))
  const planView: any = {
    ...plan,
    plan_path: planPath,
    plan_sha256: planSha256,
    actionable: true,
    coverage_complete: true,
    analyzed_at: scannedAt,
    widened: [],
    pool_current: true,
    consumed: false,
  }
  return { runRoot, decisionFingerprint, plan, planView }
}

const note = seedCall('NOTE', '2026-08-11', 'note_only')
const gap = seedCall('GAP', '2026-08-12', 'insufficient')
const scoped = seedCall('SCOPE', '2026-08-10', 'scoped_rerun')
for (const seeded of [note, gap, scoped]) {
  stageAutomaticIntakeOutcomeReceipt({
    ticker: seeded.plan.ticker,
    swarm: 'research',
    runRoot: seeded.runRoot,
    decisionFingerprint: seeded.decisionFingerprint,
    poolNewestMs: Date.parse(scannedAt) - 1,
    plan: seeded.planView,
  }, { repoRoot: repo })
}

// A committed transport copy is still raw plan material and cannot emit another event. Its source hash
// intentionally stays unchanged because the staging flag is excluded from plan identity.
write(
  `${note.runRoot}/intake/2026-08-11_intake_plan_v2.json`,
  JSON.stringify({ ...note.plan, staged_for_scoped_rerun: true }, null, 2) + '\n',
)

// Even a superficially terminal raw plan — malformed or otherwise — has no notification authority.
const rawOnly = seedCall('RAWONLY', '2026-08-09', 'note_only')
write(`${rawOnly.runRoot}/intake/2026-08-09_intake_plan.json`, '{"schema_version":"broken"\n')

execFileSync('git', ['-C', repo, 'add', '--', 'analyses'])
execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'published calls and intake outcome receipts'])

const { listAllCalls } = await import('../src/outputs')
const { listAutomaticIntakeOutcomes } = await import('../src/auto-intake-status')

assert.deepEqual(fs.readdirSync(stateDir), [], 'the failover starts with no private notification history')
assert.deepEqual(listAutomaticIntakeOutcomes(), [], 'there are no process-local outcomes to rescue the test')

const first = listAllCalls()
const checks = first.updates.filter((update) => update.kind === 'data_check')
assert.equal(checks.length, 3, 'only the three strict published receipts emit')
assert.equal(checks.find((update) => update.ticker === 'NOTE')?.headline,
  'Checked new data. The call did not change.')
assert.equal(checks.find((update) => update.ticker === 'GAP')?.headline,
  'Checked new data. There was not enough proof to change the call.')
assert.equal(checks.find((update) => update.ticker === 'SCOPE')?.headline,
  'Checked new data. The call is being updated.')
assert.equal(checks.some((update) => update.ticker === 'RAWONLY'), false,
  'malformed published raw plan JSON cannot become a success notification')
assert.equal(checks.filter((update) => update.ticker === 'NOTE').length, 1,
  'a staged raw plan copy cannot duplicate its source receipt')

const second = listAllCalls().updates.filter((update) => update.kind === 'data_check')
assert.deepEqual(second, checks, 'a fresh/static projection is deterministic without writing local state')
assert.deepEqual(fs.readdirSync(stateDir), [], 'reading shared history does not create machine-local authority')

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(stateDir, { recursive: true, force: true })
console.log('ok  published strict intake receipts survive empty-state failover; raw plans never emit')
