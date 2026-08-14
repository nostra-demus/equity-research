process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-outcome-receipt-repo-'))
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-outcome-receipt-state-'))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_STATE_DIR = stateDir
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD'

const runRoot = 'analyses/ACME_2026-08-01'
fs.mkdirSync(path.join(repo, runRoot, 'intake'), { recursive: true })
const decisionFingerprint = `sha256:${'a'.repeat(64)}`
const planSha256 = `sha256:${'b'.repeat(64)}`
const planPath = `${runRoot}/intake/2026-08-14_intake_plan.json`
const checkedAt = '2026-08-14T04:00:00.000Z'
const plan: any = {
  schema_version: '1.1', swarm: 'research', subject: 'ACME', ticker: 'ACME', run_root: runRoot,
  decision_fingerprint: decisionFingerprint, plan_path: planPath, plan_sha256: planSha256,
  actionable: true, scan_date: '2026-08-14', scanned_at: checkedAt,
  evidence_files: [
    { path: 'data/ACME/filing.pdf', arrival_ms: 1_765_000_000_000 },
    { path: 'data/ACME/channel-check.txt', arrival_ms: 1_765_000_000_100 },
  ],
  coverage_complete: true, new_docs: [],
  rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
  verdict: 'note_only', summary: '  No   material\nchange.  ', analyzed_at: checkedAt,
  widened: [], pool_current: true, consumed: false,
}

const {
  automaticIntakeOutcomeEventId,
  parseAutomaticIntakeOutcomeReceipt,
  publishAutomaticIntakeOutcomeReceipt,
  publishPendingAutomaticIntakeOutcomeReceipts,
  stageAutomaticIntakeOutcomeReceipt,
} = await import('../src/intake-outcome-receipt')
const { canonicalJsonText: canonical } = await import('../src/canonical-json')
const { recordAutomaticIntakeOutcome } = await import('../src/auto-intake-status')

const poolNewestMs = Date.parse(checkedAt) - 1
const input = { ticker: 'ACME', swarm: 'research', runRoot, decisionFingerprint, poolNewestMs, plan }
const staged = stageAutomaticIntakeOutcomeReceipt(input, { repoRoot: repo, now: Date.parse(checkedAt) + 1 })
assert.equal(staged.receipt.summary, 'No material change.', 'prompt whitespace is normalized before publication')
assert.equal(staged.receipt.evidence_file_count, 2)
assert.match(staged.receipt.evidence_coverage_digest, /^sha256:[a-f0-9]{64}$/)
assert.equal(staged.receipt.event_id, automaticIntakeOutcomeEventId({
  ticker: 'ACME', runRoot, planPath, planSha256, decisionFingerprint,
}))
assert.equal(parseAutomaticIntakeOutcomeReceipt(staged.bytes, staged.repoPath, Date.parse(checkedAt) + 1)?.receipt_id,
  staged.receipt.receipt_id)

const localId = recordAutomaticIntakeOutcome({
  ticker: 'ACME', runRoot, planPath, planSha256, decisionFingerprint,
  verdict: 'note_only', summary: plan.summary,
}, stateDir, Date.parse(checkedAt) + 1)
assert.equal(localId, staged.receipt.event_id,
  'local recovery history and the shared receipt use one stable event identity')

const second = stageAutomaticIntakeOutcomeReceipt(input, { repoRoot: repo, now: Date.parse(checkedAt) + 1 })
assert.equal(second.repoPath, staged.repoPath)
assert.ok(second.bytes.equals(staged.bytes), 're-staging exact proof is idempotent')

const receiptFile = path.join(repo, ...staged.repoPath.split('/'))
fs.writeFileSync(receiptFile, '{}\n')
assert.throws(() => stageAutomaticIntakeOutcomeReceipt(input, { repoRoot: repo, now: Date.parse(checkedAt) + 1 }),
  /identity already has different bytes/, 'append-only identity cannot be overwritten')
fs.writeFileSync(receiptFile, staged.bytes)

assert.equal(parseAutomaticIntakeOutcomeReceipt(Buffer.from('{"schema_version":"bad"}\n'), staged.repoPath), null,
  'a malformed receipt is never shared authority')
const tampered = JSON.parse(staged.bytes.toString('utf8'))
tampered.summary = 'A different claim under the same identity.'
assert.equal(parseAutomaticIntakeOutcomeReceipt(
  Buffer.from(`${canonical(tampered)}\n`), staged.repoPath, Date.parse(checkedAt) + 1,
), null, 'changing any attested field without its self-hash is rejected')

const impossiblePool = JSON.parse(staged.bytes.toString('utf8'))
impossiblePool.pool_newest_ms = Date.parse(checkedAt) + 1
impossiblePool.pool_fingerprint = `sha256:${createHash('sha256')
  .update(`${impossiblePool.owner_key}\0${impossiblePool.pool_newest_ms}`).digest('hex')}`
delete impossiblePool.receipt_id
impossiblePool.receipt_id = `sha256:${createHash('sha256').update(canonical(impossiblePool)).digest('hex')}`
const impossiblePath = `${runRoot}/intake/outcomes/${impossiblePool.receipt_id.slice(7)}.json`
assert.equal(parseAutomaticIntakeOutcomeReceipt(
  Buffer.from(`${canonical(impossiblePool)}\n`), impossiblePath, Date.parse(checkedAt) + 2,
), null, 'a self-consistent receipt cannot claim a pool watermark after its strict scan witness')
assert.throws(() => stageAutomaticIntakeOutcomeReceipt({
  ...input, plan: { ...plan, coverage_complete: false },
}, { repoRoot: repo, now: Date.parse(checkedAt) + 1 }), /lacks strict plan proof/,
'a raw plan without the strict coverage proof cannot mint a receipt')

let published = false
let commitAttempts = 0
let savedPublishAttempts = 0
let candidates: string[] = []
const savedCommit = 'c'.repeat(40)
const deps = {
  isPublished: () => published,
  candidates: () => candidates,
  commitBytes: (commit: string) => commit === savedCommit ? staged.bytes : null,
  publishSaved: async () => { savedPublishAttempts++; published = true },
  commit: async () => { commitAttempts++; throw new Error('push unavailable') },
}
await assert.rejects(
  publishAutomaticIntakeOutcomeReceipt(staged, { repoRoot: repo, deps }),
  /push unavailable/,
)
assert.ok(fs.readFileSync(receiptFile).equals(staged.bytes),
  'a failed publication leaves the exact append-only receipt as its durable pending journal')
assert.equal(commitAttempts, 1)

// A later reconciliation finds the already-saved exact data commit and publishes only its receipt. There
// is intentionally no launcher/model callback in this API, so publication recovery cannot buy intake.
candidates = [savedCommit]
await publishAutomaticIntakeOutcomeReceipt(staged, { repoRoot: repo, deps })
assert.equal(savedPublishAttempts, 1)
assert.equal(commitAttempts, 1, 'saved-receipt recovery does not run another commit or paid intake path')

// Plan v2 can replace v1 before v1's pre-commit publication retry. Recovery must discover the journal,
// not the current plan, and must never let the newer receipt jump ahead of the older completed input.
const checkedAt2 = '2026-08-14T04:00:01.000Z'
const plan2 = {
  ...plan,
  plan_path: `${runRoot}/intake/2026-08-14_intake_plan_v2.json`,
  plan_sha256: `sha256:${'d'.repeat(64)}`,
  scanned_at: checkedAt2,
  analyzed_at: checkedAt2,
  summary: 'Second settled plan.',
}
const staged2 = stageAutomaticIntakeOutcomeReceipt({
  ticker: 'ACME', swarm: 'research', runRoot, decisionFingerprint,
  poolNewestMs: Date.parse(checkedAt2) - 1, plan: plan2,
}, { repoRoot: repo, now: Date.parse(checkedAt2) + 1 })
const replayOrder: string[] = []
const replayPublished = new Set<string>()
let failOldestOnce = true
const replayDeps = {
  isPublished: (repoPath: string) => replayPublished.has(repoPath),
  candidates: () => [],
  commitBytes: () => null,
  publishSaved: async () => { throw new Error('unexpected saved-commit replay') },
  commit: async (_message: string, repoPaths: string[]) => {
    replayOrder.push(repoPaths[0])
    if (failOldestOnce) { failOldestOnce = false; throw new Error('precommit publication unavailable') }
    replayPublished.add(repoPaths[0])
  },
}
await assert.rejects(publishPendingAutomaticIntakeOutcomeReceipts(
  { ticker: 'ACME', runRoot }, { repoRoot: repo, now: Date.parse(checkedAt2) + 1, deps: replayDeps },
), /precommit publication unavailable/)
assert.deepEqual(replayOrder, [staged.repoPath],
  'a failed older receipt stops the pass before a replacing newer plan can jump the queue')
assert.equal(await publishPendingAutomaticIntakeOutcomeReceipts(
  { ticker: 'ACME', runRoot }, { repoRoot: repo, now: Date.parse(checkedAt2) + 1, deps: replayDeps },
), 2)
assert.deepEqual(replayOrder, [staged.repoPath, staged.repoPath, staged2.repoPath],
  'retry discovers v1 without consulting the current v2 plan, then publishes both oldest-first')

fs.rmSync(repo, { recursive: true, force: true })
fs.rmSync(stateDir, { recursive: true, force: true })
console.log('ok  strict automatic-intake outcome receipts are append-only, stable and publication-retryable')
