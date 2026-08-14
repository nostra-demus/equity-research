process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.REVIEW_DISPATCH_ENABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  __setReviewStateDirFsyncForTest,
  dispatchDueReviews,
  dueReviews,
  getReviewDispatchStatus,
  reconcileMaterialReviewEvidence,
  readDispatchState,
  startReviewLoop,
  stopReviewLoop,
  type DueReview,
  type ReviewLauncher,
} from '../src/review-dispatch'
import type { RunStatus } from '../src/types'

const dirs: string[] = []
const temp = () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-dispatch-')); dirs.push(dir); return dir }
const review = (ticker = 'TEST', date = '2026-01-01', window = '30d'): DueReview => ({
  ticker, runRoot: `analyses/${ticker}_${date}`, window,
})

async function main() {
  const real = dueReviews()
  assert.ok(Array.isArray(real))
  assert.equal(new Set(real.map((row) => `${row.runRoot}|${row.window}`)).size, real.length)
  for (const row of real) assert.match(row.runRoot, new RegExp(`^analyses/${row.ticker}_`))

  // Finished windows are reconciled independently of due discovery. This is the crash-recovery path for
  // a valid review pair that reached disk before the launcher could queue its material evidence note.
  {
    const bridged: string[] = []
    const calls = [{ ticker: 'REC', run_root: 'analyses/REC_2026-01-01', timeline: [
      { window: '30d', status: 'done' }, { window: '90d', status: 'upcoming' },
    ] }]
    const count = reconcileMaterialReviewEvidence({
      calls,
      artifacts: (_runRoot, _ticker, window) => window === '30d'
        ? [{ file: '2026-02-01_30d_decision_review.json', memoFile: '2026-02-01_30d_memo_delta.md', mtimeMs: 1, memoMtimeMs: 1 }]
        : [],
      bridge: (_guard, name) => { bridged.push(name); return '/data/REC/review-evidence/event.md' },
    })
    assert.equal(count, 1)
    assert.deepEqual(bridged, ['2026-02-01_30d_decision_review.json'])

    const continued: string[] = []
    assert.throws(() => reconcileMaterialReviewEvidence({
      calls: [...calls, { ticker: 'OTHER', run_root: 'analyses/OTHER_2026-01-01', timeline: [{ window: '30d', status: 'done' }] }],
      artifacts: () => [{ file: '2026-02-01_30d_decision_review.json', memoFile: '2026-02-01_30d_memo_delta.md', mtimeMs: 1, memoMtimeMs: 1 }],
      bridge: (guard) => {
        if (guard.ticker === 'REC') throw new Error('REC pool unavailable')
        continued.push(guard.ticker)
        return '/data/OTHER/review-evidence/event.md'
      },
    }), /REC pool unavailable/)
    assert.deepEqual(continued, ['OTHER'], 'recovery continues across stocks before reporting a problem')
  }

  // Production recovery reads the exact published review blob advertised by Calls. It must not depend on
  // the mutable checkout still materialising that run after a push/failover.
  {
    const runRoot = 'analyses/PUB_2026-01-01'
    const reviewPath = `${runRoot}/reviews/2026-02-01_30d_decision_review.json`
    const rawText = JSON.stringify({ marker: 'published-only' })
    const bridged: string[] = []
    const count = reconcileMaterialReviewEvidence({
      calls: [{ ticker: 'PUB', decision_date: '2025-12-20', run_root: runRoot, timeline: [
        { window: '30d', status: 'done', review_file: reviewPath },
      ] }],
      authority: {
        commit: 'a'.repeat(40), paths: new Set([reviewPath]),
        readRequired: (pathName) => {
          assert.equal(pathName, reviewPath)
          return Buffer.from(rawText)
        },
      },
      bridgePublished: (guard, name, body) => {
        assert.deepEqual(guard, { runRoot, ticker: 'PUB', window: '30d', decisionDate: '2025-12-20' })
        assert.equal(name, '2026-02-01_30d_decision_review.json')
        assert.equal(body, rawText)
        bridged.push(reviewPath)
        return '/data/PUB/review-evidence/hash.md'
      },
    })
    assert.equal(count, 1)
    assert.deepEqual(bridged, [reviewPath])
  }

  // Evidence reconciliation runs even when there is no due review. A transient failure is visible and
  // retries on the next pass instead of silently losing the material update.
  {
    const stateDir = temp()
    let recoveries = 0
    const input = {
      stateDir, enabled: true, discover: () => [], tickMs: 1_000,
      reconcileEvidence: () => { if (++recoveries === 1) throw new Error('pool unavailable') },
    }
    assert.equal(await dispatchDueReviews(async () => ({ runId: 'never' }), input), false)
    assert.equal(getReviewDispatchStatus(input).state, 'needs_attention')
    assert.equal(await dispatchDueReviews(async () => ({ runId: 'never' }), input), false)
    assert.equal(recoveries, 2)
    assert.equal(getReviewDispatchStatus(input).state, 'needs_attention')
    assert.match(getReviewDispatchStatus(input).message, /not running on this machine/i,
      'a successful one-off pass does not pretend the retained scheduler is running')
  }

  {
    const stateDir = temp()
    let launches = 0
    assert.equal(await dispatchDueReviews(async () => ({ runId: `independent-${++launches}` }), {
      stateDir, enabled: true, discover: () => [review('SAFE')], tickMs: 1_000,
      reconcileEvidence: () => { throw new Error('another ticker pool is unavailable') },
    }), true)
    assert.equal(launches, 1, 'one failed evidence recovery cannot stop another call\'s scheduled check')
    assert.equal(getReviewDispatchStatus({ stateDir, enabled: true }).state, 'needs_attention')
  }

  // A complete saved review is published before any second paid run. Recovery itself consumes neither
  // a launch attempt nor the daily paid-review budget, and it settles only after the callback confirms
  // that the exact artifact pair is visible through published authority.
  {
    const stateDir = temp()
    const row = review('SAVED')
    let launches = 0
    let recoveries = 0
    const input = {
      stateDir, enabled: true, discover: () => [row], tickMs: 1_000,
      recoverPublication: async (candidate: DueReview) => {
        recoveries++
        assert.deepEqual(candidate, row)
        return true
      },
    }
    assert.equal(await dispatchDueReviews(async () => ({ runId: `paid-${++launches}` }), input), false)
    const state = readDispatchState(input)!
    const job = state.jobs['analyses/SAVED_2026-01-01|30d']
    assert.equal(recoveries, 1)
    assert.equal(launches, 0, 'a locally complete review is never bought twice')
    assert.equal(state.launches_today, 0, 'publication recovery does not consume the paid daily budget')
    assert.equal(job.status, 'done')
    assert.equal(job.attempts, 0)
  }

  // A failed publication stays on the publication-only retry path. It does not call the paid launcher or
  // reserve a daily slot, even if the saved-pair detector later loses sight of the local artifact.
  {
    const stateDir = temp()
    let now = Date.parse('2026-08-14T00:00:00Z')
    let launches = 0
    let recoveries = 0
    let savedPairVisible = true
    const input = {
      stateDir, enabled: true, discover: () => [review('PENDING')], now: () => now,
      tickMs: 1_000, retryBaseMs: 1_000,
      recoverPublication: async () => {
        recoveries++
        if (savedPairVisible) throw new Error('push unavailable')
        return false
      },
    }
    const launcher: ReviewLauncher = async () => ({ runId: `paid-${++launches}` })
    assert.equal(await dispatchDueReviews(launcher, input), false)
    let state = readDispatchState(input)!
    let job = state.jobs['analyses/PENDING_2026-01-01|30d']
    assert.equal(job.status, 'retry_wait')
    assert.match(job.last_error || '', /could not be published.*retry safely/i)
    assert.equal(state.launches_today, 0)
    assert.equal(launches, 0)

    savedPairVisible = false
    now += 1_001
    assert.equal(await dispatchDueReviews(launcher, input), false)
    state = readDispatchState(input)!
    job = state.jobs['analyses/PENDING_2026-01-01|30d']
    assert.equal(recoveries, 2)
    assert.equal(job.status, 'retry_wait')
    assert.equal(state.launches_today, 0)
    assert.equal(launches, 0, 'a failed saved publication can never fall through to a paid rerun')
  }

  // Reserve before launch, one per pass, exact identity, terminal completion and restart dedupe.
  {
    const stateDir = temp()
    const rows = [review('AAA'), review('BBB')]
    const launched: DueReview[] = []
    let terminal: ((status: RunStatus) => void) | null = null
    const launcher: ReviewLauncher = async (row, onTerminal) => {
      launched.push(row); terminal = onTerminal; return { runId: `run-${launched.length}` }
    }
    assert.equal(await dispatchDueReviews(launcher, { stateDir, discover: () => rows, tickMs: 1_000 }), true)
    assert.deepEqual(launched, [rows[0]], 'one exact call/window launches per pass')
    const running = readDispatchState({ stateDir })!
    assert.equal(running.jobs['analyses/AAA_2026-01-01|30d'].status, 'running')
    assert.equal(running.launches_today, 1, 'daily slot is durably reserved before early ACK')
    assert.equal(await dispatchDueReviews(launcher, { stateDir, discover: () => [rows[0]], tickMs: 1_000 }), false)
    assert.equal(launched.length, 1, 'restart/pass replay cannot duplicate an unexpired lease')
    terminal!('done')
    let doneRecoveries = 0
    assert.equal(await dispatchDueReviews(launcher, {
      stateDir, discover: () => [rows[0]], tickMs: 1_000,
      recoverPublication: async () => { doneRecoveries++; return false },
    }), false)
    assert.equal(launched.length, 1, 'a completed exact review remains deduped after restart')
    assert.equal(doneRecoveries, 0, 'custom discovery never reopens or mutates a completed job')
  }

  // Publication reconciliation must not touch a paid review while its lease is live. Once that lease
  // expires, the same exact job is reconciled from published authority without buying another review.
  {
    const stateDir = temp()
    const row = review('LEASED')
    let now = Date.parse('2026-08-14T00:00:00Z')
    let launches = 0
    let recoveries = 0
    let published = false
    const input = {
      stateDir, enabled: true, discover: () => [row], authoritativeDiscovery: true,
      now: () => now, tickMs: 1_000, runningLeaseMs: 10_000,
      recoverPublication: async () => { recoveries++; return published },
    }
    assert.equal(await dispatchDueReviews(async () => ({ runId: `lease-${++launches}` }), input), true)
    assert.equal(recoveries, 1, 'the pre-launch saved-pair check ran once')
    assert.equal(await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), input), false)
    assert.equal(recoveries, 1, 'an unexpired running lease blocks mutating publication recovery')
    assert.equal(launches, 1)

    published = true
    now += 10_001
    assert.equal(await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), input), false)
    assert.equal(recoveries, 2, 'an expired nonterminal job is crash-reconciled exactly once')
    assert.equal(launches, 1, 'published crash recovery never starts a second paid review')
    assert.equal(readDispatchState(input)!.jobs['analyses/LEASED_2026-01-01|30d'].status, 'done')
  }

  // The daily cap defers every still-due exact window durably. Due work must remain visible in status;
  // exhausting today's allowance is never equivalent to "nothing is waiting".
  {
    const stateDir = temp()
    const rows = [review('CAPA'), review('CAPB'), review('CAPC')]
    let terminal: ((status: RunStatus) => void) | null = null
    let launches = 0
    const launcher: ReviewLauncher = async (_row, onTerminal) => {
      launches++; terminal = onTerminal; return { runId: `cap-${launches}` }
    }
    const input = {
      stateDir, enabled: true, discover: () => rows, dailyCap: 1,
      now: () => Date.parse('2026-08-14T12:00:00Z'), tickMs: 1_000,
    }
    assert.equal(await dispatchDueReviews(launcher, input), true)
    terminal!('done')
    assert.equal(await dispatchDueReviews(launcher, input), false)
    const state = readDispatchState(input)!
    assert.equal(launches, 1)
    assert.equal(state.jobs['analyses/CAPB_2026-01-01|30d'].status, 'retry_wait')
    assert.equal(state.jobs['analyses/CAPC_2026-01-01|30d'].status, 'retry_wait')
    assert.equal(state.jobs['analyses/CAPB_2026-01-01|30d'].attempts, 0, 'cap deferral is not a paid attempt')
    assert.equal(state.jobs['analyses/CAPB_2026-01-01|30d'].next_attempt_at, '2026-08-15T00:00:00.000Z')
    assert.equal(startReviewLoop(async () => ({ runId: 'never' }), {
      ...input, discover: () => [], initialDelayMs: 3_600_000,
    }), true)
    try {
      const status = getReviewDispatchStatus(input)
      assert.equal(status.state, 'checking')
      assert.equal(status.queued, 2)
      assert.match(status.message, /retry automatically/i)
    } finally { stopReviewLoop() }
  }

  // A stale production `done` row cannot suppress work that the shared Calls view still says is due.
  // It reopens as ordinary work: recovery gets one chance, then exactly one paid launch is reserved.
  {
    const stateDir = temp()
    const row = review('STALE')
    let terminal: ((status: RunStatus) => void) | null = null
    const seedLauncher: ReviewLauncher = async (_candidate, onTerminal) => {
      terminal = onTerminal
      return { runId: 'old-local-run' }
    }
    assert.equal(await dispatchDueReviews(seedLauncher, {
      stateDir, enabled: true, discover: () => [row], tickMs: 1_000,
    }), true)
    terminal!('done')

    let launches = 0
    let recoveries = 0
    const input = {
      stateDir, enabled: true, discover: () => [row], authoritativeDiscovery: true, tickMs: 1_000,
      recoverPublication: async () => { recoveries++; return false },
    }
    assert.equal(await dispatchDueReviews(async () => ({ runId: `fresh-${++launches}` }), input), true)
    const state = readDispatchState(input)!
    const job = state.jobs['analyses/STALE_2026-01-01|30d']
    assert.equal(recoveries, 1)
    assert.equal(launches, 1, 'a still-due production row starts exactly one fresh paid review')
    assert.equal(job.status, 'running')
    assert.equal(job.publication_pending, false,
      'a stale done marker is ordinary rerun work, not a publication-only retry')
    assert.equal(await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), input), false)
    assert.equal(launches, 1, 'the new unexpired lease remains deduped')
    assert.equal(recoveries, 1, 'the new unexpired lease is never passed to publication recovery')
  }

  // Subject busy is a bounded retry, not a second review in the same pass.
  {
    const stateDir = temp()
    let now = Date.parse('2026-08-14T00:00:00Z')
    let attempts = 0
    const launcher: ReviewLauncher = async () => {
      attempts++
      throw Object.assign(new Error('material rerun owns subject'), { statusCode: 409, code: 'subject_busy' })
    }
    const input = { stateDir, discover: () => [review()], now: () => now, tickMs: 1_000, retryBaseMs: 1_000 }
    assert.equal(await dispatchDueReviews(launcher, input), false)
    assert.equal(readDispatchState(input)!.jobs['analyses/TEST_2026-01-01|30d'].status, 'retry_wait')
    await dispatchDueReviews(launcher, input)
    assert.equal(attempts, 1, 'backoff prevents a busy loop')
    now += 1_001
    await dispatchDueReviews(launcher, input)
    assert.equal(attempts, 2, 'busy exact review retries after bounded backoff')
  }

  // Corrupt/partial/unreadable authority is preserved and launches nothing.
  {
    const stateDir = temp()
    const stateFile = path.join(stateDir, 'review-dispatch.json')
    const corrupt = '{"version":2,"jobs":'
    fs.writeFileSync(stateFile, corrupt)
    let launches = 0
    let discoveries = 0
    await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), {
      stateDir, discover: () => { discoveries++; return [review()] }, tickMs: 1_000,
    })
    assert.equal(discoveries, 0)
    assert.equal(launches, 0)
    assert.equal(fs.readFileSync(stateFile, 'utf8'), corrupt)
    assert.equal(getReviewDispatchStatus({ stateDir }).state, 'needs_attention')

    const partial = { version: 2, date: '2026-08-14', launches_today: 1, last_checked_at: null, next_check_at: null,
      jobs: { lost: { key: 'lost', ticker: 'TEST', status: 'done' } } }
    fs.writeFileSync(stateFile, JSON.stringify(partial))
    await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), {
      stateDir, discover: () => { discoveries++; return [review()] }, tickMs: 1_000,
    })
    assert.equal(discoveries, 0)
    assert.equal(launches, 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(stateFile, 'utf8')), partial)
  }

  // Reservation write failure must happen before launcher and leave no paid child without a ledger key.
  {
    const stateDir = temp()
    const statePath = path.join(stateDir, 'review-dispatch.json')
    fs.mkdirSync(statePath) // read gets EISDIR: authority unreadable; never rewrite or launch
    let launches = 0
    await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), {
      stateDir, discover: () => [review()], tickMs: 1_000,
    })
    assert.equal(launches, 0)
    assert.ok(fs.statSync(statePath).isDirectory(), 'unwritable authority path was preserved')
  }

  // Ad-hoc, admin and failover servers must never become paid review owners because the flag was omitted.
  {
    const stateDir = temp()
    const prior = process.env.REVIEW_DISPATCH_ENABLED
    delete process.env.REVIEW_DISPATCH_ENABLED
    try {
      assert.equal(getReviewDispatchStatus({ stateDir }).enabled, false)
      let launches = 0
      assert.equal(await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), {
        stateDir, discover: () => [review()], tickMs: 1_000,
      }), false)
      assert.equal(launches, 0)
    } finally {
      if (prior === undefined) delete process.env.REVIEW_DISPATCH_ENABLED
      else process.env.REVIEW_DISPATCH_ENABLED = prior
    }
  }

  // Once a paid review ledger has existed, deleting it must never turn the next process into a fresh owner.
  {
    const stateDir = temp()
    let launches = 0
    let terminal: ((status: RunStatus) => void) | null = null
    const row = review('USED')
    const launcher: ReviewLauncher = async (_row, onTerminal) => {
      launches++; terminal = onTerminal; return { runId: 'paid-once' }
    }
    const input = { stateDir, discover: () => [row], tickMs: 1_000, enabled: true }
    assert.equal(await dispatchDueReviews(launcher, input), true)
    terminal!('done')
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.initialized')), true)
    fs.unlinkSync(path.join(stateDir, 'review-dispatch.json'))
    assert.equal(await dispatchDueReviews(launcher, input), false)
    assert.equal(launches, 1, 'missing history after use cannot repeat the same paid review')
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.json')), false)
    assert.equal(getReviewDispatchStatus(input).state, 'needs_attention')
  }

  // A crash after the durable first-write intent but before the initial ledger rename is provably before
  // launcher admission. Restart rebuilds it, then installs the permanent post-use witness.
  {
    const stateDir = temp()
    fs.writeFileSync(path.join(stateDir, 'review-dispatch.initializing'),
      'review-dispatch-first-write-v1\n', { mode: 0o600 })
    let launches = 0
    assert.equal(await dispatchDueReviews(async () => ({ runId: `healed-${++launches}` }), {
      stateDir, enabled: true, discover: () => [review('FIRSTCUT')], tickMs: 1_000,
    }), true)
    assert.equal(launches, 1)
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.json')), true)
    assert.equal(fs.readFileSync(path.join(stateDir, 'review-dispatch.initialized'), 'utf8'),
      'review-dispatch-v2\n')
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.initializing')), false)
  }

  // Directory durability is part of reservation authority. A failed fsync stops before the launcher and
  // leaves only the recoverable first-write intent; restoring the filesystem lets the next pass heal.
  {
    const stateDir = temp()
    let launches = 0
    const previous = __setReviewStateDirFsyncForTest(() => {
      throw Object.assign(new Error('injected directory fsync failure'), { code: 'EIO' })
    })
    try {
      assert.equal(await dispatchDueReviews(async () => ({ runId: `unsafe-${++launches}` }), {
        stateDir, enabled: true, discover: () => [review('FSYNC')], tickMs: 1_000,
      }), false)
    } finally { __setReviewStateDirFsyncForTest(previous) }
    assert.equal(launches, 0, 'a non-durable reservation never reaches the paid launcher')
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.initializing')), true)
    assert.equal(fs.existsSync(path.join(stateDir, 'review-dispatch.initialized')), false)
    assert.equal(await dispatchDueReviews(async () => ({ runId: `healed-${++launches}` }), {
      stateDir, enabled: true, discover: () => [review('FSYNC')], tickMs: 1_000,
    }), true)
    assert.equal(launches, 1)
  }

  // Pin the producer order so a future simplification cannot reintroduce marker-before-ledger authority.
  {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/review-dispatch.ts'), 'utf8')
    const start = source.indexOf('function writeState(')
    const end = source.indexOf('\nfunction resetDailyBudget(', start)
    const body = source.slice(start, end)
    const intentAt = body.indexOf('ensureFirstWriteIntent(stateDir)')
    const intentSyncAt = body.indexOf('fsyncStateDir(stateDir)', intentAt)
    const renameAt = body.indexOf('fs.renameSync(temp, file)')
    const ledgerSyncAt = body.indexOf('fsyncStateDir(stateDir)', renameAt)
    const usedAt = body.indexOf('completeFirstWrite(stateDir)', ledgerSyncAt)
    assert.ok(intentAt >= 0 && intentSyncAt > intentAt && renameAt > intentSyncAt
      && ledgerSyncAt > renameAt && usedAt > ledgerSyncAt)
  }

  // A real write failure after a valid read (the state directory becomes read-only before reservation)
  // still stops before launcher. Run as `nobody` because root can write through ordinary mode bits.
  if (process.platform !== 'win32' && process.getuid?.() === 0) {
    const stateDir = temp()
    const stateFile = path.join(stateDir, 'review-dispatch.json')
    const seed = { version: 2, date: '2026-08-14', launches_today: 0,
      last_checked_at: null, next_check_at: null, jobs: {} }
    fs.writeFileSync(stateFile, JSON.stringify(seed), { mode: 0o444 })
    fs.chmodSync(stateDir, 0o555)
    const marker = path.join(os.tmpdir(), `review-launch-marker-${process.pid}-${Date.now()}`)
    const here = path.dirname(fileURLToPath(import.meta.url))
    const src = path.resolve(here, '../src/review-dispatch.ts')
    const probe = path.join(os.tmpdir(), `review-write-fail-${process.pid}-${Date.now()}.mts`)
    fs.writeFileSync(probe, [
      `process.env.REVIEW_DISPATCH_ENABLED='1'`,
      `import fs from 'node:fs'`,
      `import { dispatchDueReviews } from ${JSON.stringify(src)}`,
      `await dispatchDueReviews(async () => { fs.writeFileSync(${JSON.stringify(marker)}, 'launched'); return {runId:'bad'} }, {`,
      ` stateDir:${JSON.stringify(stateDir)}, tickMs:1000, discover:()=>[{ticker:'TEST',runRoot:'analyses/TEST_2026-01-01',window:'30d'}] })`,
      '',
    ].join('\n'))
    fs.chmodSync(probe, 0o644)
    const tsx = path.resolve(here, '../node_modules/.bin/tsx')
    const result = spawnSync(tsx, [probe], { encoding: 'utf8', uid: 65534, gid: 65534,
      env: { ...process.env, HOME: os.tmpdir(), ENGINE_ACTIVITY_LOG_DISABLED: '1' } })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.existsSync(marker), false, 'reservation write failure occurs before launcher callback')
    assert.deepEqual(JSON.parse(fs.readFileSync(stateFile, 'utf8')), seed, 'valid prior state was not corrupted')
    fs.chmodSync(stateDir, 0o755)
    fs.rmSync(probe, { force: true }); fs.rmSync(marker, { force: true })
  }

  // A non-retryable failure is held for operator attention. Even with a healthy retained scheduler,
  // status must never present this state as green/watching.
  {
    const stateDir = temp()
    assert.equal(await dispatchDueReviews(async () => {
      throw Object.assign(new Error('review configuration is invalid'), { statusCode: 400, code: 'invalid_review' })
    }, {
      stateDir, enabled: true, discover: () => [review('HELD')], tickMs: 1_000,
    }), false)
    assert.equal(readDispatchState({ stateDir })!.jobs['analyses/HELD_2026-01-01|30d'].status, 'held')
    assert.equal(startReviewLoop(async () => ({ runId: 'never' }), {
      enabled: true, stateDir, discover: () => [], initialDelayMs: 3_600_000, tickMs: 3_600_000,
    }), true)
    try {
      const status = getReviewDispatchStatus({ enabled: true, stateDir })
      assert.equal(status.state, 'needs_attention')
      assert.match(status.message, /needs attention/i)
    } finally {
      stopReviewLoop()
    }
  }

  // The loop owner is a retained kernel lease, not merely an in-process boolean. During a restart overlap,
  // a second server using the same state directory must not start; an unrelated test/state directory does
  // not collide, and the original directory can be acquired once the first process exits.
  if (process.platform !== 'win32') {
    const stateDir = temp()
    const otherStateDir = temp()
    const here = path.dirname(fileURLToPath(import.meta.url))
    const src = path.resolve(here, '../src/review-dispatch.ts')
    const tsx = path.resolve(here, '../node_modules/.bin/tsx')
    const probe = path.join(os.tmpdir(), `review-loop-owner-${process.pid}-${Date.now()}.mts`)
    fs.writeFileSync(probe, [
      `import { startReviewLoop } from ${JSON.stringify(src)}`,
      `const started = startReviewLoop(async () => ({ runId: 'never' }), {`,
      ` enabled: true, stateDir: ${JSON.stringify(stateDir)}, initialDelayMs: 3_600_000, tickMs: 3_600_000`,
      `})`,
      `process.stdout.write(started ? 'OWNER_READY\\n' : 'OWNER_FAILED\\n')`,
      `setInterval(() => {}, 1_000)`,
      '',
    ].join('\n'))
    const child = spawn(tsx, [probe], {
      env: { ...process.env, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => { output += String(chunk) })
    child.stderr.on('data', (chunk) => { output += String(chunk) })
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`child loop did not acquire lease: ${output}`)), 10_000)
        const onData = () => {
          if (!output.includes('OWNER_READY')) return
          clearTimeout(timeout)
          resolve()
        }
        child.stdout.on('data', onData)
        child.stderr.on('data', onData)
        child.once('close', (code) => {
          if (!output.includes('OWNER_READY')) {
            clearTimeout(timeout)
            reject(new Error(`child loop exited ${code}: ${output}`))
          }
        })
      })
      assert.equal(startReviewLoop(async () => ({ runId: 'unsafe-duplicate' }), {
        enabled: true, stateDir, initialDelayMs: 3_600_000, tickMs: 3_600_000,
      }), false, 'two processes cannot own the same automatic review loop')
      const failed = getReviewDispatchStatus({ enabled: true, stateDir })
      assert.equal(failed.state, 'needs_attention')
      assert.match(failed.message, /did not start on this machine/i)
      assert.equal(failed.next_check_at, null)
      assert.equal(startReviewLoop(async () => ({ runId: 'other-state' }), {
        enabled: true, stateDir: otherStateDir, initialDelayMs: 3_600_000, tickMs: 3_600_000,
      }), true, 'singleton lease identity is state-directory aware')
      assert.equal(getReviewDispatchStatus({ enabled: true, stateDir: otherStateDir }).state, 'watching',
        'green is available only while the local review owner and scheduler are retained')
      stopReviewLoop()
    } finally {
      child.kill('SIGTERM')
      await new Promise<void>((resolve) => child.once('close', () => resolve()))
      fs.rmSync(probe, { force: true })
    }
    assert.equal(startReviewLoop(async () => ({ runId: 'after-release' }), {
      enabled: true, stateDir, initialDelayMs: 3_600_000, tickMs: 3_600_000,
    }), true, 'process exit releases the review loop lease')
    assert.equal(getReviewDispatchStatus({ enabled: true, stateDir }).state, 'watching')
    stopReviewLoop()
    assert.equal(getReviewDispatchStatus({ enabled: true, stateDir }).state, 'needs_attention',
      'stopping the retained review scheduler removes green immediately')
  }

  console.log('\nreview-dispatch.test.ts: 17 checks passed')
}

main().finally(() => { for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true }) }).catch((error) => {
  console.error('FAIL', error); process.exitCode = 1
})
