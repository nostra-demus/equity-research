// Automatic Calls orchestration: durable exact-plan dedupe, crash retry, fail-closed rescoping and
// same-day queueing. No real research process is launched.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.CALL_UPDATE_AUTO_ENABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  automaticCallPlanKey,
  getAutomaticCallUpdateStatus,
  reconcileAutomaticCallUpdates,
  startAutomaticCallUpdateLoop,
  stopAutomaticCallUpdateLoop,
  type AutomaticCallPlan,
} from '../src/call-update-loop'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../src/singleton-lock'
import type { RunStatus } from '../src/types'

function fixturePlan(suffix = 'a'): AutomaticCallPlan {
  const fingerprint = `sha256:${suffix.repeat(64)}`
  const planSha = `sha256:${suffix.repeat(64)}`
  const base = { ticker: 'TEST', runRoot: 'analyses/TEST_2026-08-13', planSha256: planSha, decisionFingerprint: fingerprint }
  return {
    ...base,
    key: automaticCallPlanKey(base),
    targetRunRoot: 'analyses/TEST_2026-08-14',
    input: {
      ticker: 'TEST', swarm: 'research', runRoot: base.runRoot,
      decisionFingerprint: fingerprint,
      planPath: `analyses/TEST_2026-08-13/intake/plan-${suffix}.json`,
      planSha256: planSha,
      sourceDecisionFingerprint: fingerprint,
    },
  }
}

const tempDirs: string[] = []
function tempState(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'call-update-loop-'))
  tempDirs.push(dir)
  return dir
}

async function main() {
  {
    const stateDir = tempState()
    const plan = fixturePlan('a')
    let launches = 0
    let paidLaunches = 0
    let actionable = true
    let terminal: ((status: RunStatus) => void) | null = null
    const deps = {
      discover: () => actionable ? [plan, plan] : [], // duplicate projection must not duplicate spending
      execute: async (_plan: AutomaticCallPlan, onTerminal: (status: RunStatus) => void) => {
        launches++
        if (!actionable) return { runId: 'publish-run-1', durable: true }
        paidLaunches++
        terminal = onTerminal
        return { runId: 'run-1' }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 1, 'an immutable plan launches once even when discovery returns it twice')
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'needs_attention',
      'a one-off reconciliation does not pretend the automatic watcher is running')
    terminal!('done')
    actionable = false // committed result consumed the exact source plan
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 2, 'the old job gets one publication-only reconciliation')
    assert.equal(paidLaunches, 1, 'a durably consumed plan never launches paid research twice')
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'needs_attention')
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(stateDir, 'automatic-call-updates.json'), 'utf8')),
      'the atomic state file is always complete JSON')
  }

  {
    const stateDir = tempState()
    const planB = { ...fixturePlan('b'), targetRunRoot: 'analyses/TEST_2026-08-14' }
    const planA = fixturePlan('a')
    let nowMs = Date.parse('2026-08-14T12:00:00Z')
    let visible: AutomaticCallPlan[] = [planB]
    let terminalB: ((status: RunStatus) => void) | null = null
    let recoveries = 0
    let launchesA = 0
    const deps = {
      now: () => nowMs,
      discover: () => visible,
      execute: async (plan: AutomaticCallPlan, onTerminal: (status: RunStatus) => void) => {
        if (plan.key === planB.key && !terminalB) {
          terminalB = onTerminal
          // Simulate a process dying before the launch ACK can return its target. Discovery already put
          // that exact target in the durable job, so midnight recovery does not depend on this response.
          return { runId: 'paid-b' }
        }
        if (plan.key === planB.key) {
          recoveries++
          assert.equal(plan.targetRunRoot, 'analyses/TEST_2026-08-14',
            'publication retry keeps yesterday\'s exact target instead of recomputing today\'s folder')
          if (recoveries === 1) throw Object.assign(new Error('temporary push outage'), { statusCode: 503 })
          return { runId: 'publish-b', durable: true }
        }
        launchesA++
        return { runId: 'paid-a' }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    terminalB!('done')
    visible = [planA]
    // Simulate a crash after the publication-only queue was durably written but before execute() began.
    const stateFile = path.join(stateDir, 'automatic-call-updates.json')
    const crashed = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
    crashed.jobs[planB.key].status = 'queued'
    crashed.jobs[planB.key].publication_pending = true
    fs.writeFileSync(stateFile, JSON.stringify(crashed, null, 2) + '\n')
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(recoveries, 1, 'a queued publication phase survives a restart and tries plan B first')
    assert.equal(launchesA, 0, 'a temporary publication error never starts newer paid plan A')
    nowMs += 2_001
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(recoveries, 2, 'the absent saved result keeps retrying after a temporary push failure')
    assert.equal(launchesA, 0, 'publishing B never calls newer plan A complete or spends on it in the same pass')
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(launchesA, 1, 'newer plan A remains independently queued after B is safely shared')
  }

  {
    const stateDir = tempState()
    const planB = fixturePlan('b')
    const planA = fixturePlan('a')
    let visible: AutomaticCallPlan[] = [planB]
    let terminalB: ((status: RunStatus) => void) | null = null
    let recovered = 0
    const deps = {
      discover: () => visible,
      execute: async (plan: AutomaticCallPlan, terminal: (status: RunStatus) => void) => {
        if (!terminalB) {
          terminalB = terminal
          return { runId: 'paid-b', targetRunRoot: planB.targetRunRoot }
        }
        assert.equal(plan.key, planB.key, 'an incomplete already-paid target recovers before a replacement plan')
        assert.equal(plan.targetRunRoot, planB.targetRunRoot)
        recovered++
        return { runId: 'recover-b', durable: true }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    terminalB!('incomplete')
    visible = [planA]
    const stateFile = path.join(stateDir, 'automatic-call-updates.json')
    const waiting = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
    waiting.jobs[planB.key].next_attempt_at = null
    fs.writeFileSync(stateFile, JSON.stringify(waiting, null, 2) + '\n')
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(recovered, 1,
      'an incomplete target remains a durable exact recovery phase after its source plan is replaced')
  }

  {
    const stateDir = tempState()
    let nowMs = Date.parse('2026-08-14T23:59:58Z')
    let visible = { ...fixturePlan('c'), targetRunRoot: 'analyses/TEST_2026-08-14' }
    let calls = 0
    const deps = {
      now: () => nowMs,
      discover: () => [visible],
      execute: async (plan: AutomaticCallPlan) => {
        calls++
        if (calls === 1) return { runId: 'paid-before-midnight' }
        assert.equal(plan.targetRunRoot, 'analyses/TEST_2026-08-14',
          'the saved target wins when the same source plan is rediscovered after midnight')
        return { runId: 'publish-yesterday', durable: true }
      },
    }
    await reconcileAutomaticCallUpdates(deps, {
      stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000,
    })
    // The process died before its terminal callback. After the lease and midnight, fresh discovery points
    // at today's folder, but recovery must try the already-paid yesterday target before any new model run.
    nowMs += 3_000
    visible = { ...visible, targetRunRoot: 'analyses/TEST_2026-08-15' }
    await reconcileAutomaticCallUpdates(deps, {
      stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000,
    })
    assert.equal(calls, 2, 'an expired pre-terminal attempt gets one publication recovery, not a new paid target')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('e')
    let launches = 0
    let terminal: ((status: RunStatus) => void) | null = null
    const deps = {
      discover: () => [plan],
      execute: async (_plan: AutomaticCallPlan, onTerminal: (status: RunStatus) => void) => {
        launches++
        terminal = onTerminal
        return { runId: `uncommitted-${launches}` }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    terminal!('done')
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 2,
      'a local terminal result that leaves the exact committed plan actionable is retried, not retired forever')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('b')
    let nowMs = Date.parse('2026-08-14T00:00:00Z')
    let launches = 0
    const deps = {
      now: () => nowMs,
      discover: () => [plan],
      execute: async () => ({ runId: `run-${++launches}` }),
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000 })
    assert.equal(launches, 1)
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000 })
    assert.equal(launches, 1, 'an unexpired running lease blocks a duplicate after an early ACK')
    nowMs += 1_001
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000 })
    assert.equal(launches, 2, 'an orphaned launch is retried after its durable lease expires')
  }

  {
    const stateDir = tempState()
    const planB = fixturePlan('b')
    const planA = fixturePlan('a')
    let nowMs = Date.parse('2026-08-14T00:00:00Z')
    let visible: AutomaticCallPlan[] = [planB]
    let callsB = 0
    let callsA = 0
    const deps = {
      now: () => nowMs,
      discover: () => visible,
      execute: async (plan: AutomaticCallPlan) => {
        if (plan.key === planB.key) {
          callsB++
          if (callsB === 1) return { runId: 'orphan-b', targetRunRoot: planB.targetRunRoot }
          throw Object.assign(new Error('the exact source plan was superseded before any result existed'), {
            statusCode: 409, code: 'no_plan',
          })
        }
        callsA++
        return { runId: 'current-a', durable: true }
      },
      requestAnalysis: () => {},
    }
    await reconcileAutomaticCallUpdates(deps, {
      stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000,
    })
    visible = [planA]
    nowMs += 1_001
    await reconcileAutomaticCallUpdates(deps, {
      stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000,
    })
    assert.equal(callsB, 2, 'the expired early ACK gets one exact recovery probe')
    await reconcileAutomaticCallUpdates(deps, {
      stateDir, enabled: true, intervalMs: 1_000, runningLeaseMs: 1_000,
    })
    assert.equal(callsA, 1, 'a target-only superseded ghost cannot block the current plan')
    const saved = JSON.parse(fs.readFileSync(path.join(stateDir, 'automatic-call-updates.json'), 'utf8'))
    assert.equal(saved.jobs[planB.key].status, 'done')
    assert.equal(saved.jobs[planB.key].publication_pending, false)
    assert.equal(saved.jobs[planB.key].active, false,
      'the empty superseded attempt is retired instead of resurrecting Needs attention forever')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('c')
    let launches = 0
    let rescope = 0
    const deps = {
      discover: () => [plan],
      requestAnalysis: () => { rescope++ },
      execute: async () => {
        launches++
        throw Object.assign(new Error('a document landed after this plan'), { statusCode: 409, code: 'plan_stale' })
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 1, 'a stale plan is held, never weakened and retried unchanged')
    assert.equal(rescope, 1, 'the cheap analysis is requested to produce a new immutable plan key')
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'needs_attention')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('e')
    let executions = 0
    await reconcileAutomaticCallUpdates({
      discover: () => [plan],
      execute: async () => {
        executions++
        throw Object.assign(new Error('exact staged authority does not match'), {
          statusCode: 503, code: 'publication_recovery_unsafe',
        })
      },
      requestAnalysis: () => {},
    }, { stateDir, enabled: true, intervalMs: 1_000 })
    await reconcileAutomaticCallUpdates({
      discover: () => [plan],
      execute: async () => { executions++; return { runId: 'must-not-run' } },
      requestAnalysis: () => {},
    }, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(executions, 1, 'a deterministic unsafe publication authority is held, not retried as a generic 503')
    const saved = JSON.parse(fs.readFileSync(path.join(stateDir, 'automatic-call-updates.json'), 'utf8'))
    assert.equal(saved.jobs[plan.key].status, 'held')
    assert.equal(saved.jobs[plan.key].next_attempt_at, null)
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('d')
    let nowMs = Date.parse('2026-08-14T00:00:00Z')
    let launches = 0
    const deps = {
      now: () => nowMs,
      discover: () => [plan],
      execute: async () => {
        launches++
        if (launches === 1) throw Object.assign(new Error('today has an incomplete shell'), { statusCode: 409, code: 'run_incomplete' })
        return { runId: 'safe-next-day-run' }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    nowMs += 1_001
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(launches, 2, 'an incomplete same-day shell retries after the safe target becomes available')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('d')
    let nowMs = Date.parse('2026-08-14T00:00:00Z')
    let launches = 0
    const deps = {
      now: () => nowMs,
      discover: () => [plan],
      execute: async () => {
        launches++
        throw Object.assign(new Error('today is sealed'), { statusCode: 409, code: 'same_day_complete_queued' })
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(launches, 1)
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(launches, 1, 'a second same-day event stays queued instead of overwriting the sealed call')
    nowMs += 1_001
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000, retryBaseMs: 1_000 })
    assert.equal(launches, 2, 'the durable same-day queue retries when the safe-run boundary can change')
  }

  {
    const stateDir = tempState()
    const status = getAutomaticCallUpdateStatus({ stateDir, enabled: false })
    assert.deepEqual(
      Object.keys(status).sort(),
      ['enabled', 'last_checked_at', 'message', 'next_check_at', 'queued', 'running', 'state'].sort(),
      'GET /api/calls receives a small stable plain-English automation status shape',
    )
    assert.equal(status.enabled, false)
  }

  {
    const stateDir = tempState()
    const deps = { discover: () => [], execute: async () => ({ runId: 'never' }) }
    assert.match(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).message, /not running on this machine/i)

    // Hold the exact lock through another open-file description. An enabled flag alone must not produce
    // a green status when startup loses the singleton race.
    const blocker = acquireRetainedFlockSync(path.join(stateDir, 'automatic-call-updates.lock'), {
      waitMs: 0,
      busyMessage: 'test blocker busy',
    })
    try {
      assert.equal(startAutomaticCallUpdateLoop(deps, {
        stateDir, enabled: true, initialDelayMs: 3_600_000, intervalMs: 3_600_000,
      }), false)
      const failed = getAutomaticCallUpdateStatus({ stateDir, enabled: true })
      assert.equal(failed.state, 'needs_attention')
      assert.match(failed.message, /did not start on this machine/i)
      assert.equal(failed.next_check_at, null)
    } finally {
      releaseRetainedFlock(blocker)
    }

    assert.equal(startAutomaticCallUpdateLoop(deps, {
      stateDir, enabled: true, initialDelayMs: 3_600_000, intervalMs: 3_600_000,
    }), true)
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'watching',
      'green is available only while this process retains the owner and scheduler')
    assert.equal(startAutomaticCallUpdateLoop(deps, {
      stateDir, enabled: true, initialDelayMs: 3_600_000, intervalMs: 3_600_000,
    }), false, 'a duplicate start does not disturb the healthy local owner')
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'watching')
    stopAutomaticCallUpdateLoop()
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'needs_attention',
      'stopping the retained scheduler removes green immediately')
  }

  {
    const stateDir = tempState()
    const prior = process.env.CALL_UPDATE_AUTO_ENABLED
    delete process.env.CALL_UPDATE_AUTO_ENABLED
    try {
      assert.equal(getAutomaticCallUpdateStatus({ stateDir }).enabled, false,
        'an unset flag is safely off on admin, failover and ad-hoc servers')
    } finally {
      if (prior === undefined) delete process.env.CALL_UPDATE_AUTO_ENABLED
      else process.env.CALL_UPDATE_AUTO_ENABLED = prior
    }
  }

  {
    const stateDir = tempState()
    const stateFile = path.join(stateDir, 'automatic-call-updates.json')
    const corrupt = '{"version":1,"jobs":{"lost-paid-key":'
    fs.writeFileSync(stateFile, corrupt)
    let launches = 0
    let discovery = 0
    await reconcileAutomaticCallUpdates({
      discover: () => { discovery++; return [fixturePlan('e')] },
      execute: async () => ({ runId: `unsafe-${++launches}` }),
    }, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(discovery, 0, 'corrupt authority stops before plan discovery')
    assert.equal(launches, 0, 'corrupt authority can never reopen and launch a paid key')
    assert.equal(fs.readFileSync(stateFile, 'utf8'), corrupt, 'corrupt bytes are preserved for recovery, never overwritten')
    const status = getAutomaticCallUpdateStatus({ stateDir, enabled: true })
    assert.equal(status.state, 'needs_attention')
    assert.match(status.message, /saved history cannot be read safely/i)

    // A partially-valid job must fail the whole file; silently dropping just that row is the same duplicate
    // launch bug under a different truncation point.
    const partial = {
      version: 1,
      updated_at: new Date().toISOString(),
      last_checked_at: null,
      next_check_at: null,
      jobs: { 'paid-key': { key: 'paid-key', ticker: 'TEST', status: 'done' } },
    }
    fs.writeFileSync(stateFile, JSON.stringify(partial))
    await reconcileAutomaticCallUpdates({
      discover: () => { discovery++; return [fixturePlan('f')] },
      execute: async () => ({ runId: `unsafe-${++launches}` }),
    }, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(discovery, 0)
    assert.equal(launches, 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(stateFile, 'utf8')), partial, 'partial job schema is preserved and fails closed')
  }

  {
    const stateDir = tempState()
    const plan = fixturePlan('f')
    let launches = 0
    let terminal: ((status: RunStatus) => void) | null = null
    const deps = {
      discover: () => [plan],
      execute: async (_plan: AutomaticCallPlan, onTerminal: (status: RunStatus) => void) => {
        launches++; terminal = onTerminal; return { runId: 'paid-once' }
      },
    }
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    terminal!('done')
    assert.equal(launches, 1)
    assert.equal(fs.existsSync(path.join(stateDir, 'automatic-call-updates.initialized')), true)
    fs.unlinkSync(path.join(stateDir, 'automatic-call-updates.json'))
    await reconcileAutomaticCallUpdates(deps, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 1, 'missing history after use cannot reopen and repeat a paid exact plan')
    assert.equal(fs.existsSync(path.join(stateDir, 'automatic-call-updates.json')), false, 'missing authority is preserved for recovery')
    assert.equal(getAutomaticCallUpdateStatus({ stateDir, enabled: true }).state, 'needs_attention')
  }

  {
    // A crash after the durable first-write intent but before the initial ledger rename is provably before
    // any paid launch. Restart self-heals it; the permanent used witness then protects every later loss.
    const stateDir = tempState()
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, 'automatic-call-updates.initializing'),
      'automatic-call-updates-first-write-v1\n', { mode: 0o600 })
    let launches = 0
    await reconcileAutomaticCallUpdates({
      discover: () => [fixturePlan('e')],
      execute: async () => { launches++; return { runId: 'after-first-write-crash' } },
    }, { stateDir, enabled: true, intervalMs: 1_000 })
    assert.equal(launches, 1, 'a producer-created pre-admission crash cut needs no manual ledger repair')
    assert.equal(fs.existsSync(path.join(stateDir, 'automatic-call-updates.json')), true)
    assert.equal(fs.readFileSync(path.join(stateDir, 'automatic-call-updates.initialized'), 'utf8'),
      'automatic-call-updates-v1\n')
    assert.equal(fs.existsSync(path.join(stateDir, 'automatic-call-updates.initializing')), false)
  }

  {
    // Pin the first-use durability order: recoverable intent precedes the ledger; the permanent used
    // witness follows the durable rename. A later missing ledger still fails closed.
    const source = fs.readFileSync(path.join(process.cwd(), 'src/call-update-loop.ts'), 'utf8')
    const start = source.indexOf('function writeState(')
    const end = source.indexOf('\nfunction normalizedOptions(', start)
    const body = source.slice(start, end)
    const intentAt = body.indexOf('ensureFirstWriteIntent(stateDir)')
    const intentSyncAt = body.indexOf('fsyncStateDir(stateDir)', intentAt)
    const renameAt = body.indexOf('fs.renameSync(tmp, file)')
    const ledgerSyncAt = body.indexOf('fsyncStateDir(stateDir)', renameAt)
    const usedAt = body.indexOf('completeFirstWrite(stateDir)', ledgerSyncAt)
    assert.ok(intentAt >= 0 && intentSyncAt > intentAt && renameAt > intentSyncAt
      && ledgerSyncAt > renameAt && usedAt > ledgerSyncAt,
    'the recoverable intent is durable before the first ledger, and the permanent witness follows its sync')
  }

  console.log('\ncall-update-loop.test.ts: 13 checks passed')
}

main().finally(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true })
}).catch((error) => {
  console.error('FAIL', error)
  process.exitCode = 1
})
