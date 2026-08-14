// subject-lock.ts — the in-process per-key mutex `thesis-plan/run` uses to close the concurrent-carry race.
// Run: npx tsx test/subject-lock.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from '../src/subject-lock'

function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void } {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

// ---- 5. intake analysis and scoped staging share one swarm-qualified mutation namespace -------------
{
  const gate = deferred<void>()
  const key = subjectMutationLockKey('research', 'GOLD')
  const intake = withSubjectLock(key, async () => { await gate.promise; return 'intake' })
  await assert.rejects(() => withSubjectLock(subjectMutationLockKey('research', 'GOLD'), async () => 'scoped'), SubjectBusyError,
    'doc-intake and scoped staging for one call must never interleave')
  const commodity = await withSubjectLock(subjectMutationLockKey('commodity', 'GOLD'), async () => 'commodity')
  assert.equal(commodity, 'commodity', 'same label in a different swarm remains independent')
  gate.resolve()
  assert.equal(await intake, 'intake')
  console.log('✅ one call shares one mutation lock; cross-swarm labels stay independent')
}

// ---- 6. the landing watcher joins that namespace and advances dedupe only after proven terminal success
// server.ts owns process startup/background loops, so importing it would start the real server. Pin the
// wiring statically here, while the deterministic held-lock case above proves the interleaving behavior.
{
  const serverSource = fs.readFileSync(path.join(process.cwd(), 'src/server.ts'), 'utf8')
  const start = serverSource.indexOf('async function fireAutoIntake(')
  const end = serverSource.indexOf('\nfunction broadcastData(', start)
  assert.ok(start >= 0 && end > start, 'auto-intake implementation remains discoverable for its lock contract')
  const auto = serverSource.slice(start, end)
  assert.match(auto, /withSubjectLock\(subjectMutationLockKey\(initialOwner\.swarm, ticker\)/,
    'automatic landing analysis must use the shared swarm-qualified subject mutation lock')
  assert.match(auto, /intakeOwner: owner/,
    'automatic landing analysis must carry the unique-owner proof to the final process boundary')
  assert.match(auto, /const terminalRetry = \(status: RunStatus\)/,
    'automatic landing dedupe must be driven by the real terminal outcome, not early launch ACK')
  for (const [label, pattern] of [
    ['a successful terminal run', /status === 'done'/],
    ['the same decision fingerprint', /terminalPlan\.decision_fingerprint === owner\.decisionFingerprint/],
    ['a newly-authored plan', /terminalPlan\.analyzed_at !== priorPlanAnalyzedAt/],
    ['a scan at or after the landing', /Math\.floor\(Number\(newest\)\) <= scannedAtMs/],
    ['an unchanged final pool watermark', /terminalNewest === newest/],
  ] as const) {
    assert.match(auto, pattern, `terminal success must prove ${label} before deduping`)
  }
  assert.doesNotMatch(auto, /terminalPlan\.pool_current === true/,
    'normal post-run documents make the run-date floor stale; auto-intake must use the precise scan witness instead')
  const afterLaunch = auto.slice(auto.indexOf('await launch('))
  assert.doesNotMatch(afterLaunch, /autoIntakeLastNewest\.set\(/,
    'the early launch ACK path must not advance the landing dedupe watermark')
  console.log('✅ automatic landing analysis joins the shared lock and dedupes only proven terminal success')
}

// ---- 7. exact automatic recovery promotes a complete audit trio before any model launch --------------
{
  const serverSource = fs.readFileSync(path.join(process.cwd(), 'src/server.ts'), 'utf8')
  const start = serverSource.indexOf('async function executeExactIntakePlan(')
  const end = serverSource.indexOf('\napp.post(\'/api/intake-plan/run-exact\'', start)
  assert.ok(start >= 0 && end > start)
  const exact = serverSource.slice(start, end)
  const lockAt = exact.indexOf('withSubjectLock(')
  const promoteAt = exact.indexOf('promoteAuditedAutomaticCallToProjectionSeal(recovery)')
  const recoveryLaunchAt = exact.indexOf("kind: 'full', ticker, user, userVia", promoteAt)
  assert.ok(lockAt >= 0 && promoteAt > lockAt && recoveryLaunchAt > promoteAt,
    'the canonical audit promotion must run under the subject lock before exact-root model recovery')
  assert.match(exact.slice(promoteAt, recoveryLaunchAt), /recoveryStage = inspectAutomaticCallRecoveryWorktree\(recovery\)/,
    'successful promotion must refresh the recovery stage before launch')
  console.log('✅ a complete exact audit trio is promoted model-free before automatic recovery launches')
}

// ---- 1. a second call for the SAME key while the first is in flight is rejected, not interleaved -------
{
  const gate = deferred<void>()
  let firstStarted = false
  let firstFinished = false

  const first = withSubjectLock('AMZN', async () => {
    firstStarted = true
    await gate.promise
    firstFinished = true
    return 'first'
  })

  // The first call's synchronous prefix (check-and-set) has already run by the time `withSubjectLock`
  // returns a pending promise, so a second call issued right away must see the key held.
  assert.ok(firstStarted, 'first call entered its critical section synchronously')
  await assert.rejects(() => withSubjectLock('AMZN', async () => 'second'), SubjectBusyError, 'a concurrent call for the same key is rejected')

  gate.resolve()
  const result = await first
  assert.equal(result, 'first')
  assert.ok(firstFinished)
  console.log('✅ concurrent calls for the same key never interleave — the second is rejected outright')
}

// ---- 2. the key is released once the holder settles, and a later call can then acquire it --------------
{
  await withSubjectLock('MSFT', async () => 'done')
  const second = await withSubjectLock('MSFT', async () => 'also fine')
  assert.equal(second, 'also fine')
  console.log('✅ the lock releases on success — a later call for the same key succeeds')
}

// ---- 3. the key releases even when the holder THROWS — a failure must never wedge the lock forever ------
{
  await assert.rejects(() => withSubjectLock('TSLA', async () => { throw new Error('boom') }), /boom/)
  const after = await withSubjectLock('TSLA', async () => 'recovered')
  assert.equal(after, 'recovered', 'a thrown error releases the lock — it does not wedge the key forever')
  console.log('✅ a thrown error still releases the lock')
}

// ---- 4. different keys never contend with each other ----------------------------------------------------
{
  const gate = deferred<void>()
  const a = withSubjectLock('GOOG', async () => { await gate.promise; return 'a' })
  const b = await withSubjectLock('NFLX', async () => 'b') // different key — must not be rejected
  assert.equal(b, 'b')
  gate.resolve()
  assert.equal(await a, 'a')
  console.log('✅ distinct keys never block one another')
}
