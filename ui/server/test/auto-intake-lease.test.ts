import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  claimAutomaticIntakeLease,
  completeAutomaticIntakeLease,
  getAutomaticIntakeStatus,
  retryAutomaticIntakeLease,
  settleAutomaticIntakeIdentity,
  type AutomaticIntakeLeaseIdentity,
} from '../src/auto-intake-status'

const at = Date.parse('2026-08-14T00:00:00Z')
const leaseMs = 1_000
const identity: AutomaticIntakeLeaseIdentity = {
  ticker: 'LEASE',
  swarm: 'research',
  runRoot: 'analyses/LEASE_2026-08-13',
  decisionFingerprint: `sha256:${'a'.repeat(64)}`,
  poolNewestMs: 1_786_665_600_123,
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-intake-lease-'))
const corruptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-intake-lease-corrupt-'))
const missingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-intake-lease-missing-'))
const unwritableDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-intake-lease-unwritable-'))
try {
  const first = claimAutomaticIntakeLease(identity, { stateDir: dir, now: at, leaseMs })
  assert.equal(first.status, 'claimed')
  if (first.status !== 'claimed') throw new Error('first lease was not claimed')

  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'automatic-intake-status.json'), 'utf8'))
  const savedJob = saved.jobs.LEASE
  assert.deepEqual(savedJob.owner, {
    swarm: 'research',
    subject: 'LEASE',
    run_root: identity.runRoot,
    decision_fingerprint: identity.decisionFingerprint,
  }, 'the exact standing-call owner is durable before dispatch')
  assert.equal(savedJob.pool_newest_ms, identity.poolNewestMs)
  assert.match(savedJob.pool_fingerprint, /^sha256:[a-f0-9]{64}$/)
  assert.equal(savedJob.lease_id, first.lease.leaseId)
  assert.equal(savedJob.lease_expires_at, first.lease.leaseExpiresAt)

  const overlap = claimAutomaticIntakeLease(identity, { stateDir: dir, now: at + 1, leaseMs })
  assert.deepEqual(overlap, { status: 'busy', leaseExpiresAt: first.lease.leaseExpiresAt },
    'an overlapping pass cannot admit the same paid input')

  // A separate Node process has no in-memory watermark. It still sees the durable lease and abstains.
  const moduleUrl = pathToFileURL(path.join(process.cwd(), 'src', 'auto-intake-status.ts')).href
  const childCode = `
    import { claimAutomaticIntakeLease } from ${JSON.stringify(moduleUrl)};
    const identity = JSON.parse(process.env.LEASE_TEST_IDENTITY);
    const out = claimAutomaticIntakeLease(identity, {
      stateDir: process.env.LEASE_TEST_DIR,
      now: Number(process.env.LEASE_TEST_NOW),
      leaseMs: Number(process.env.LEASE_TEST_MS),
    });
    console.log(JSON.stringify(out));
  `
  const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', childCode], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      LEASE_TEST_IDENTITY: JSON.stringify(identity),
      LEASE_TEST_DIR: dir,
      LEASE_TEST_NOW: String(at + 2),
      LEASE_TEST_MS: String(leaseMs),
    },
  })
  assert.equal(child.status, 0, child.stderr)
  assert.equal(JSON.parse(child.stdout.trim()).status, 'busy',
    'a restart/second process cannot duplicate an unexpired paid intake')

  const replacement = claimAutomaticIntakeLease(identity, { stateDir: dir, now: at + leaseMs + 1, leaseMs })
  assert.equal(replacement.status, 'claimed', 'expiry safely admits a retry of the exact input')
  if (replacement.status !== 'claimed') throw new Error('replacement lease was not claimed')
  assert.notEqual(replacement.lease.leaseId, first.lease.leaseId)
  assert.equal(completeAutomaticIntakeLease(first.lease, dir, at + leaseMs + 2), false,
    'the expired attempt callback cannot clear its replacement')
  assert.equal(retryAutomaticIntakeLease(first.lease, at + 5_000, dir, at + leaseMs + 2), false,
    'the expired attempt callback cannot put its replacement into retry')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + leaseMs + 2 }).running, 1)

  assert.equal(retryAutomaticIntakeLease(replacement.lease, at + 5_000, dir, at + leaseMs + 3), true)
  assert.equal(completeAutomaticIntakeLease(replacement.lease, dir, at + leaseMs + 4), false,
    'retry retires the attempt token, so a duplicated terminal callback is inert')
  assert.equal(claimAutomaticIntakeLease(identity, {
    stateDir: dir, now: at + leaseMs + 5, leaseMs,
  }).status, 'retry_wait', 'the same exact input honors its durable retry time')

  const newerPool = { ...identity, poolNewestMs: identity.poolNewestMs + 1 }
  const newer = claimAutomaticIntakeLease(newerPool, { stateDir: dir, now: at + leaseMs + 5, leaseMs })
  assert.equal(newer.status, 'claimed', 'new evidence may replace a known-ended retry without waiting')
  if (newer.status !== 'claimed') throw new Error('newer pool lease was not claimed')
  assert.equal(settleAutomaticIntakeIdentity(identity, dir, at + leaseMs + 6), false,
    'old exact-plan reconciliation cannot clear a newer pool lease')
  assert.equal(completeAutomaticIntakeLease(newer.lease, dir, at + leaseMs + 7), true)
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: dir, now: at + leaseMs + 7 }).running, 0)

  const corruptFile = path.join(corruptDir, 'automatic-intake-status.json')
  fs.writeFileSync(corruptFile, '{bad')
  assert.equal(claimAutomaticIntakeLease(identity, { stateDir: corruptDir, now: at, leaseMs }).status, 'unavailable')
  assert.equal(fs.readFileSync(corruptFile, 'utf8'), '{bad', 'corrupt authority is never overwritten to reopen admission')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: corruptDir, now: at }).state, 'needs_attention')
  const malformedSchema = JSON.stringify({
    version: 1, updated_at: '0', last_checked_at: null, jobs: {}, events: {},
  })
  fs.writeFileSync(corruptFile, malformedSchema)
  assert.equal(claimAutomaticIntakeLease(identity, { stateDir: corruptDir, now: at, leaseMs }).status, 'unavailable')
  assert.equal(fs.readFileSync(corruptFile, 'utf8'), malformedSchema,
    'schema-corrupt authority is retained byte-for-byte and cannot reopen admission')

  const used = claimAutomaticIntakeLease(identity, { stateDir: missingDir, now: at, leaseMs })
  assert.equal(used.status, 'claimed')
  fs.unlinkSync(path.join(missingDir, 'automatic-intake-status.json'))
  assert.equal(claimAutomaticIntakeLease(identity, { stateDir: missingDir, now: at + 1, leaseMs }).status, 'unavailable')
  assert.equal(fs.existsSync(path.join(missingDir, 'automatic-intake-status.json')), false,
    'missing-after-use authority is not recreated as a fresh paid-work ledger')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: missingDir, now: at + 1 }).state, 'needs_attention')

  const validEmpty = {
    version: 1, updated_at: new Date(at).toISOString(), last_checked_at: null, jobs: {}, events: {},
  }
  fs.writeFileSync(path.join(unwritableDir, 'automatic-intake-status.json'), JSON.stringify(validEmpty))
  fs.mkdirSync(path.join(unwritableDir, 'automatic-intake-status.flock'))
  assert.equal(claimAutomaticIntakeLease(identity, { stateDir: unwritableDir, now: at, leaseMs }).status, 'unavailable')
  assert.equal(getAutomaticIntakeStatus({ enabled: true, stateDir: unwritableDir, now: at }).state, 'needs_attention',
    'a mutation-lock/write failure remains visible even though the old ledger is still readable')

  // server.ts owns process startup, so pin its narrow dispatch ordering without importing the live server.
  const server = fs.readFileSync(path.join(process.cwd(), 'src', 'server.ts'), 'utf8')
  const fireStart = server.indexOf('async function fireAutoIntake(')
  const fireEnd = server.indexOf('\nfunction discoverAutomaticCallPlans(', fireStart)
  assert.ok(fireStart >= 0 && fireEnd > fireStart)
  const fire = server.slice(fireStart, fireEnd)
  const pendingReplayAt = fire.indexOf('publishPendingAutomaticIntakeOutcomeReceipts(')
  const subjectLockAt = fire.indexOf('withSubjectLock(')
  const claimAt = fire.indexOf('claimAutomaticIntakeLease(leaseIdentity)')
  const launchAt = fire.indexOf("await launch({ kind: 'doc-intake'")
  assert.ok(pendingReplayAt >= 0 && subjectLockAt > pendingReplayAt && claimAt > subjectLockAt,
    'append-only pending receipts replay before the current plan, mutation lock, or any paid admission')
  assert.match(fire.slice(pendingReplayAt, subjectLockAt), /catch \{[\s\S]*retry without running another check[\s\S]*return/,
    'pending publication failure visibly stops the pass before doc-intake')
  assert.ok(claimAt >= 0 && launchAt > claimAt,
    'the exact durable lease is persisted immediately before any paid launch')
  assert.match(fire, /completeAutomaticIntakeLease\(lease\)/,
    'terminal success is fenced by the exact attempt token')
  assert.match(fire, /retryAutomaticIntakeLease\(lease,/,
    'terminal failure is fenced by the exact attempt token')
  const terminalStart = fire.indexOf('const terminalRetry =')
  const terminalEnd = fire.indexOf("await launch({ kind: 'doc-intake'", terminalStart)
  const terminal = fire.slice(terminalStart, terminalEnd)
  const receiptStageAt = terminal.indexOf('stageResearchOutcome(provedPlan)')
  const receiptPublishAt = terminal.indexOf('publishAutomaticIntakeOutcomeReceipt(staged)')
  const receiptCompleteAt = terminal.indexOf('completeAutomaticIntakeLease(lease)')
  assert.ok(receiptStageAt >= 0 && receiptPublishAt > receiptStageAt && receiptCompleteAt > receiptPublishAt,
    'terminal success stages and shares its exact receipt before clearing the paid lease')
  assert.match(terminal, /\.catch\(\(\) => receiptPublicationFailed\(lease\)\)/,
    'receipt publication failure retains an identity-bound retry instead of completing the paid input')
  const coveredPlanStart = fire.indexOf('const existingPlan =')
  const planRecoveryStart = fire.indexOf('// The intake command may have finished', coveredPlanStart)
  const coveredPlan = fire.slice(coveredPlanStart, planRecoveryStart)
  assert.equal((coveredPlan.match(/publishAutomaticIntakeOutcomeReceipt\(staged\)/g) || []).length, 2,
    'both restart/already-known strict-plan branches publish a receipt and return before paid admission')
  assert.equal((coveredPlan.match(/\.catch\(\(\) => receiptPublicationFailed\(\)\)/g) || []).length, 2,
    'both strict-plan branches remain publication-only retries when sharing fails')
  assert.doesNotMatch(fire.slice(0, claimAt), /markAutomaticIntakeChecking\(/,
    'a fail-open best-effort status write is not mistaken for paid admission')
  assert.match(server, /const AUTO_INTAKE_ON = process\.env\.INTAKE_AUTO_ANALYZE === '1'/,
    'paid document intake remains exact opt-in and default-off')
  const reconcileStart = server.indexOf('function reconcileIntakeAfterRestart(')
  const reconcileEnd = server.indexOf('\nfunction startIntakeReconciler(', reconcileStart)
  const reconcile = server.slice(reconcileStart, reconcileEnd)
  assert.match(reconcile, /swarmSubjects\(swarm\.id\)/,
    'restart recovery enumerates non-research swarm subjects instead of abandoning their durable leases')
  assert.match(reconcile, /intakePoolAuthorityAvailable\(subject, owner\.swarm\)/,
    'every restarted subject retains its exact owner-specific company-folder authority check')

  console.log('automatic intake paid admission is durable, exact and stale-callback safe: ok')
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.rmSync(corruptDir, { recursive: true, force: true })
  fs.rmSync(missingDir, { recursive: true, force: true })
  fs.rmSync(unwritableDir, { recursive: true, force: true })
}
