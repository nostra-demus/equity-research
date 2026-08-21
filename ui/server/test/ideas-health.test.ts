process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ideasHealthLivenessMs, initializeIdeasHealth, inspectPersistedIdeasHealth, readIdeasHealth, readPersistedIdeasHealth, updateIdeasHealth } from '../src/news/ideas/ideas-health'
import { callGroqForIdeaPass, chunkIdeaRows, ideaGroqTokenBound, runIdeaPass, type IdeaPassConfig } from '../src/news/ideas/run-idea-pass'
import { ideaId, readIdeaById, readPassState, readTopSweep, topNEffectHash, topNHash, writePassState } from '../src/news/ideas/ideas-store'
import { armCooldown, Budget, NON_BINDING_DAILY_TOKEN_CAP, getSharedGeminiLimiter, getSharedLimiter, readCooldownUntil, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import type { OverflowProvider } from '../src/config'
import { validIdeaSnapshot } from './ideas-fixture'

const NOW = Date.parse('2026-08-03T12:00:00Z')
const cfg: IdeaPassConfig = {
  topN: 12, shelfLifeHrs: 36, inputMaxAgeHrs: 36, minIntervalSec: 900, refreshSec: 3600,
  groqApiKey: 'test-key', groqBaseUrl: 'https://example.test/v1', groqModel: 'test-model', groqMaxTokens: 500,
  groqDailyReqCap: 100, groqDailyTokenCap: 1_000_000, groqDailyTokenTarget: 1_000_000,
  groqPaceFloorFrac: 1, groqRpm: 28, groqTpm: 1_000_000,
  llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
}

function testProvider(id: string, baseUrl: string, patch: Partial<OverflowProvider> = {}): OverflowProvider {
  return {
    id, label: id, color: '--provider-test', apiKey: `${id}-key`, baseUrl, model: `${id}-model`,
    dailyReqCap: 10, rpm: 0, maxTokens: 500, maxAttempts: 1, budgetFile: `${id}-budget.json`,
    ...patch,
  }
}

function rootWithRows(n: number, foundAt = '2026-08-03T10:00:00Z', updatedAt = '2026-08-03T11:00:00Z'): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-health-'))
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  const rows = Array.from({ length: n }, (_, i) => ({
    headline: `Company ${i} files a material update`, url: `https://example.test/${i}`, source_name: 'Exchange',
    found_at: foundAt, triage_score: 90 - i, companies: [{ name: `Company ${i}`, ticker: `T${i}`, listing_country: 'US' }],
  }))
  fs.writeFileSync(path.join(inbox, '2026-08-03_sweep.json'), JSON.stringify({ updated_at: updatedAt, rows }))
  return root
}

const thin = rootWithRows(1)
const thinState = path.join(thin, '.state')
const missingHealth = path.join(thin, '.missing-health')
assert.equal(readIdeasHealth(missingHealth, thin, true, NOW).status, 'error', 'a missing heartbeat cannot refresh itself on every read')
assert.equal(initializeIdeasHealth(missingHealth, thin, NOW)?.status, 'waiting')
assert.equal(readIdeasHealth(missingHealth, thin, true, NOW).status, 'waiting', 'an actual persisted startup heartbeat is distinct from a missing record')
assert.equal(initializeIdeasHealth(missingHealth, thin, NOW + 1), null, 'startup initialization never overwrites a prior lifecycle record')
const insufficient = await runIdeaPass({ repoRoot: thin, stateDir: thinState, config: cfg, refreshBoard: async () => {}, now: () => NOW, persistHealth: true })
assert.equal(insufficient.reason_code, 'insufficient_inputs')
assert.equal(readIdeasHealth(thinState, thin, true, NOW).status, 'waiting')

const noKeyRoot = rootWithRows(2)
const noKeyState = path.join(noKeyRoot, '.state')
const noKey = await runIdeaPass({ repoRoot: noKeyRoot, stateDir: noKeyState, config: { ...cfg, groqApiKey: '' }, refreshBoard: async () => {}, now: () => NOW, persistHealth: true })
assert.equal(noKey.reason_code, 'missing_api_key')
const noKeyHealth = readIdeasHealth(noKeyState, noKeyRoot, true, NOW)
assert.equal(noKeyHealth.status, 'error')
assert.equal(noKeyHealth.last_attempt_at, null, 'eligibility failures are not provider attempts')

// A damaged usage ledger is not a spent allowance. Ideas fails closed and tells the operator which simple
// record needs attention instead of falsely reporting that the provider's daily limit was used.
const corruptBudgetRoot = rootWithRows(2)
const corruptBudgetState = path.join(corruptBudgetRoot, '.state')
fs.mkdirSync(corruptBudgetState, { recursive: true })
fs.writeFileSync(path.join(corruptBudgetState, 'groq-budget.json'), '{bad-json')
let corruptBudgetFetches = 0
const corruptBudget = await runIdeaPass({
  repoRoot: corruptBudgetRoot, stateDir: corruptBudgetState, config: cfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: (async () => {
    corruptBudgetFetches++
    return new Response('{}', { status: 500 })
  }) as typeof fetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(corruptBudget.reason_code, 'internal_error')
assert.match(corruptBudget.note || '', /Groq usage record needs attention/)
assert.doesNotMatch(corruptBudget.note || '', /budget is exhausted/)
assert.equal(corruptBudgetFetches, 0)
assert.equal(readPassState(corruptBudgetState)?.in_flight, undefined, 'the no-I/O path clears its prepared marker')
assert.equal(readIdeasHealth(corruptBudgetState, corruptBudgetRoot, true, NOW).reason_code, 'internal_error')

const okRoot = rootWithRows(2)
const okState = path.join(okRoot, '.state')
let fetches = 0
const fetchFn = (async () => {
  fetches++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const success = await runIdeaPass({ repoRoot: okRoot, stateDir: okState, config: cfg, refreshBoard: async () => {}, now: () => NOW, fetchFn, sleep: async () => {}, persistHealth: true })
assert.equal(success.ran, true)
assert.equal(success.produced, 0)
assert.equal(fetches, 1)

// ideas-pass.json is paid-work authority. Corrupt bytes must never be read as a fresh first run, because
// that would resend the same envelope and replace the only evidence of prior coverage.
resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
const corruptPassRoot = rootWithRows(2)
const corruptPassState = path.join(corruptPassRoot, '.state')
let corruptPassFetches = 0
const corruptPassFetch = (async () => {
  corruptPassFetches++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
await runIdeaPass({
  repoRoot: corruptPassRoot, stateDir: corruptPassState, config: cfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: corruptPassFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(corruptPassFetches, 1)
const corruptPassFile = path.join(corruptPassState, 'ideas-pass.json')
fs.writeFileSync(corruptPassFile, '{bad-json')
const corruptPassRetry = await runIdeaPass({
  repoRoot: corruptPassRoot, stateDir: corruptPassState, config: cfg, refreshBoard: async () => {},
  now: () => NOW + cfg.minIntervalSec * 1000 + 1, fetchFn: corruptPassFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(corruptPassRetry.reason_code, 'internal_error')
assert.equal(corruptPassFetches, 1, 'the corrupt progress record blocks repeat provider spend')
assert.equal(fs.readFileSync(corruptPassFile, 'utf8'), '{bad-json', 'the damaged authority is preserved for repair')
assert.match(corruptPassRetry.note || '', /progress record needs attention/i)
resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()

// Deleting the progress authority after a provider attempt is the same safety failure as corrupting it.
// The health record proves work was sent, so a restart must not treat ENOENT as a fresh first run.
const missingPassRoot = rootWithRows(2)
const missingPassState = path.join(missingPassRoot, '.state')
let missingPassFetches = 0
const missingPassFetch = (async () => {
  missingPassFetches++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
await runIdeaPass({
  repoRoot: missingPassRoot, stateDir: missingPassState, config: cfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: missingPassFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(missingPassFetches, 1)
const missingPassFile = path.join(missingPassState, 'ideas-pass.json')
fs.unlinkSync(missingPassFile)
resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
const missingPassRetry = await runIdeaPass({
  repoRoot: missingPassRoot, stateDir: missingPassState, config: cfg, refreshBoard: async () => {},
  now: () => NOW + cfg.minIntervalSec * 1000 + 1, fetchFn: missingPassFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(missingPassRetry.reason_code, 'internal_error')
assert.equal(missingPassFetches, 1, 'a missing-after-use progress record blocks repeat provider spend')
assert.equal(fs.existsSync(missingPassFile), false, 'the missing authority is not silently recreated')
assert.match(missingPassRetry.note || '', /progress record needs attention/i)
resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()

const failedRoot = rootWithRows(2)
const failedState = path.join(failedRoot, '.state')
const FAIL_NOW = NOW + 60_000
let failedFetches = 0
const failedFetch = (async () => {
  failedFetches++
  return new Response('provider unavailable', { status: 503 })
}) as typeof fetch
const providerFailure = await runIdeaPass({ repoRoot: failedRoot, stateDir: failedState, config: cfg, refreshBoard: async () => {}, now: () => FAIL_NOW, fetchFn: failedFetch, sleep: async () => {}, persistHealth: true })
assert.equal(providerFailure.reason_code, 'provider_error')
const terminalFailure = readIdeasHealth(failedState, failedRoot, true, FAIL_NOW)
assert.equal(terminalFailure.outcome, 'failed')
const failureThrottle = await runIdeaPass({ repoRoot: failedRoot, stateDir: failedState, config: cfg, refreshBoard: async () => {}, now: () => FAIL_NOW + 60_000, fetchFn: failedFetch, sleep: async () => {}, persistHealth: true })
assert.equal(failureThrottle.reason_code, 'min_interval')
const stillFailed = readIdeasHealth(failedState, failedRoot, true, FAIL_NOW + 60_000)
assert.equal(stillFailed.outcome, 'failed', 'a throttle is not a recovery event')
assert.equal(stillFailed.reason_code, 'provider_error', 'the terminal provider failure stays visible until a real retry')
assert.equal(failedFetches, 1, 'the operational chain probes a provider once, then waits for the next eligible pass')
const healthy = readIdeasHealth(okState, okRoot, true, NOW)
assert.equal(healthy.status, 'healthy')
assert.equal(healthy.outcome, 'success_empty', 'a valid empty provider response is success, not a failure or a qualified rejection')
assert.ok(healthy.last_attempt_at)
assert.ok(healthy.last_success_at)

// The configured topN is a provider-call bound, not a visibility cap. Thirteen current candidates are
// covered as two comparative chunks; the rank-13 row is neither dropped nor sent alone. A completed first
// chunk is checkpointed. Even after provider capacity is absent beyond the heartbeat interval, the next
// eligible pass resumes at the second without re-billing the first.
const coverageRoot = rootWithRows(13)
const coverageState = path.join(coverageRoot, '.state')
resetSharedLimiters()
const projectedCoverage = readTopSweep(coverageRoot, cfg.topN, {
  nowMs: NOW, maxAgeMs: cfg.inputMaxAgeHrs! * 3_600_000, allEligible: true,
}).rows
assert.equal(projectedCoverage.length, 13)
const coverageChunks = chunkIdeaRows(projectedCoverage, cfg.topN)
assert.deepEqual(coverageChunks.map((chunk) => chunk.length), [11, 2])
assert.deepEqual(new Set(coverageChunks.flat().map((row) => row.event_id)), new Set(projectedCoverage.map((row) => row.event_id)))
let coverageFetches = 0
const coveragePrompts: string[] = []
const coverageFetch = (async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  coverageFetches++
  const body = JSON.parse(String(init?.body || '{}'))
  coveragePrompts.push(String(body?.messages?.[1]?.content || ''))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
await runIdeaPass({
  repoRoot: coverageRoot, stateDir: coverageState, config: cfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: coverageFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(coverageFetches, 1)
assert.equal(readPassState(coverageState)?.completed_chunks?.length, 1)
const coveragePaused = await runIdeaPass({
  repoRoot: coverageRoot, stateDir: coverageState, config: { ...cfg, groqApiKey: '' },
  refreshBoard: async () => {}, now: () => NOW + cfg.minIntervalSec * 1000 + 1,
  fetchFn: coverageFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(coveragePaused.reason_code, 'missing_api_key')
assert.equal(coverageFetches, 1, 'the simulated capacity pause sends no request')
assert.equal(readPassState(coverageState)?.completed_chunks?.length, 1)
await runIdeaPass({
  repoRoot: coverageRoot, stateDir: coverageState, config: cfg, refreshBoard: async () => {},
  now: () => NOW + cfg.refreshSec * 1000 + 1,
  fetchFn: coverageFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(coverageFetches, 2, 'the post-refresh pass runs only the unfinished rank tail')
assert.equal(readPassState(coverageState)?.completed_chunks?.length, 2)
assert.ok(coveragePrompts[1].includes('Company 12 files a material update'), 'rank 13 reaches a provider')
assert.ok(!coveragePrompts[1].includes('Company 0 files a material update'), 'the completed first chunk is not re-sent')
resetSharedLimiters()

// Stable input identities, not positional chunk numbers, drive resume. A new rank-one row arriving after
// chunk one completes is appended behind the unfinished queue, so it cannot repeatedly push rank five and
// every lower row into a never-reached chunk.
const churnRoot = rootWithRows(9)
const churnState = path.join(churnRoot, '.state')
const churnCfg = { ...cfg, topN: 4 }
const churnRows = readTopSweep(churnRoot, churnCfg.topN, {
  nowMs: NOW, maxAgeMs: churnCfg.inputMaxAgeHrs! * 3_600_000, allEligible: true,
}).rows
const churnChunks = chunkIdeaRows(churnRows, churnCfg.topN)
assert.ok(churnChunks.length >= 2)
const nextUnfinishedHeadline = churnChunks[1][0].headline
const churnPrompts: string[] = []
const churnFetch = (async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  const body = JSON.parse(String(init?.body || '{}'))
  churnPrompts.push(String(body?.messages?.[1]?.content || ''))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
await runIdeaPass({
  repoRoot: churnRoot, stateDir: churnState, config: churnCfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: churnFetch, sleep: async () => {}, persistHealth: true,
})
const churnSweepPath = path.join(churnRoot, 'screener', 'inbox', '2026-08-03_sweep.json')
const churnSweep = JSON.parse(fs.readFileSync(churnSweepPath, 'utf8'))
churnSweep.updated_at = '2026-08-03T11:30:00Z'
churnSweep.rows.unshift({
  headline: 'Brand New Top Company files a material update', url: 'https://example.test/brand-new-top',
  source_name: 'Exchange', found_at: '2026-08-03T11:00:00Z', triage_score: 99,
  companies: [{ name: 'Brand New Top Company', ticker: 'BNT', listing_country: 'US' }],
})
fs.writeFileSync(churnSweepPath, JSON.stringify(churnSweep))
await runIdeaPass({
  repoRoot: churnRoot, stateDir: churnState, config: churnCfg, refreshBoard: async () => {},
  now: () => NOW + churnCfg.minIntervalSec * 1000 + 1, fetchFn: churnFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(churnPrompts.length, 2)
assert.ok(churnPrompts[1].includes(nextUnfinishedHeadline), 'the original unfinished queue advances after a new top row arrives')
assert.ok(!churnPrompts[1].includes('Brand New Top Company'), 'the new top row cannot jump ahead of unfinished coverage')
churnSweep.rows.unshift({
  headline: 'Second New Top Company files a material update', url: 'https://example.test/second-new-top',
  source_name: 'Exchange', found_at: '2026-08-03T11:05:00Z', triage_score: 100,
  companies: [{ name: 'Second New Top Company', ticker: 'SNT', listing_country: 'US' }],
})
fs.writeFileSync(churnSweepPath, JSON.stringify(churnSweep))
await runIdeaPass({
  repoRoot: churnRoot, stateDir: churnState, config: churnCfg, refreshBoard: async () => {},
  now: () => NOW + 2 * (churnCfg.minIntervalSec * 1000 + 1), fetchFn: churnFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(churnPrompts.length, 3)
assert.ok(churnPrompts[2].includes(churnRows.at(-1)!.headline), 'repeated new top rows still cannot starve the original tail')
resetSharedLimiters()

// A provider call is never made unless its progress record is readable and can be written. Replacing the
// file with a directory makes the authority unavailable and proves chunk zero is not charged.
const checkpointRoot = rootWithRows(2)
const checkpointState = path.join(checkpointRoot, '.state')
fs.mkdirSync(path.join(checkpointState, 'ideas-pass.json'), { recursive: true })
let checkpointFetches = 0
const checkpointFailure = await runIdeaPass({
  repoRoot: checkpointRoot, stateDir: checkpointState, config: cfg, refreshBoard: async () => {},
  now: () => NOW, fetchFn: (async () => {
    checkpointFetches++
    return new Response('{}', { status: 500 })
  }) as typeof fetch, sleep: async () => {}, persistHealth: false,
})
assert.equal(checkpointFailure.reason_code, 'internal_error')
assert.match(checkpointFailure.note || '', /progress record needs attention/)
assert.equal(checkpointFetches, 0, 'an unwritable progress store fails before provider dispatch')
const checkpointRetry = await runIdeaPass({
  repoRoot: checkpointRoot, stateDir: checkpointState, config: cfg, refreshBoard: async () => {},
  now: () => NOW + cfg.minIntervalSec * 1000 + 1, fetchFn: (async () => {
    checkpointFetches++
    return new Response('{}', { status: 500 })
  }) as typeof fetch, sleep: async () => {}, persistHealth: false,
})
assert.equal(checkpointRetry.reason_code, 'internal_error')
assert.equal(checkpointFetches, 0, 'repeated eligible passes cannot rebill chunk zero while its checkpoint is unwritable')

// A crash after the prepared marker but before dispatch authorization is safe to retry: no reservation or I/O
// started. Failing exactly that second rename leaves phase=prepared, and restart must not skip the rows.
const terminalCheckpointRoot = rootWithRows(2)
const terminalCheckpointState = path.join(terminalCheckpointRoot, '.state')
let terminalCheckpointFetches = 0
const originalRenameSync = fs.renameSync
let passCheckpointRenames = 0
let terminalCheckpointFailure
try {
  ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
    if (String(to) === path.join(terminalCheckpointState, 'ideas-pass.json') && ++passCheckpointRenames === 2) {
      throw Object.assign(new Error('simulated pre-dispatch crash'), { code: 'EIO' })
    }
    return originalRenameSync(from, to)
  }
  terminalCheckpointFailure = await runIdeaPass({
    repoRoot: terminalCheckpointRoot, stateDir: terminalCheckpointState, config: cfg, refreshBoard: async () => {},
    now: () => NOW, fetchFn: (async () => {
      terminalCheckpointFetches++
      return new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
        usage: { total_tokens: 50 },
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch, sleep: async () => {}, persistHealth: true,
  })
} finally {
  ;(fs as any).renameSync = originalRenameSync
}
assert.equal(terminalCheckpointFailure?.reason_code, 'internal_error')
assert.equal(terminalCheckpointFetches, 0, 'the failed authorization marker stops before provider I/O')
assert.equal(readPassState(terminalCheckpointState)?.in_flight?.phase, 'prepared')
assert.equal(Budget.load(terminalCheckpointState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW, 'groq-budget.json').requests, 0, 'a failed authorization checkpoint happens before reservation')
const terminalCheckpointRecovery = await runIdeaPass({
  repoRoot: terminalCheckpointRoot, stateDir: terminalCheckpointState, config: cfg, refreshBoard: async () => {},
  now: () => NOW + 60_001, fetchFn: (async () => {
    terminalCheckpointFetches++
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 50 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(terminalCheckpointRecovery.ran, true, 'a prepared-only crash retries instead of losing the input')
assert.equal(terminalCheckpointFetches, 1)
assert.equal(Budget.load(terminalCheckpointState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + 60_001, 'groq-budget.json').requests, 1)
resetSharedLimiters()

// The exact envelope becomes dispatch-authorized before Budget.tryReserve. If the process dies immediately
// after the durable reservation, restart quarantines those rows instead of retrying them and double-counting
// the same work. The later chunk still runs and is the only new ledger request.
const reservationCrashRoot = rootWithRows(5)
const reservationCrashState = path.join(reservationCrashRoot, '.state')
const reservationCrashCfg = { ...cfg, topN: 3 }
const reservationCrashRows = readTopSweep(reservationCrashRoot, reservationCrashCfg.topN, {
  nowMs: NOW, maxAgeMs: reservationCrashCfg.inputMaxAgeHrs! * 3_600_000, allEligible: true,
}).rows
const reservationCrashChunks = chunkIdeaRows(reservationCrashRows, reservationCrashCfg.topN)
let reservationCrashProviderCalls = 0
const reservationCrashPrompts: string[] = []
const reservationCrashFetch = (async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  reservationCrashProviderCalls++
  const body = JSON.parse(String(init?.body || '{}'))
  reservationCrashPrompts.push(String(body?.messages?.[1]?.content || ''))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const originalTryReserve = Budget.prototype.tryReserve
let injectedReservationCrash = false
let reservationCrashFirst
try {
  Budget.prototype.tryReserve = function (...args: Parameters<Budget['tryReserve']>) {
    const reservation = originalTryReserve.apply(this, args)
    if (reservation && !injectedReservationCrash) {
      injectedReservationCrash = true
      throw new Error('simulated process death after provider-budget reservation')
    }
    return reservation
  }
  reservationCrashFirst = await runIdeaPass({
    repoRoot: reservationCrashRoot, stateDir: reservationCrashState, config: reservationCrashCfg,
    refreshBoard: async () => {}, now: () => NOW,
    fetchFn: reservationCrashFetch, sleep: async () => {}, persistHealth: true,
  })
} finally {
  Budget.prototype.tryReserve = originalTryReserve
}
assert.equal(reservationCrashFirst?.reason_code, 'internal_error')
assert.equal(reservationCrashProviderCalls, 0)
assert.equal(readPassState(reservationCrashState)?.in_flight?.phase, 'authorized',
  'the crash cannot leave a retryable prepared marker beside the reservation')
assert.equal(Budget.load(reservationCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW, 'groq-budget.json').requests, 1)
const reservationCrashRecovery = await runIdeaPass({
  repoRoot: reservationCrashRoot, stateDir: reservationCrashState, config: reservationCrashCfg,
  refreshBoard: async () => {}, now: () => NOW + reservationCrashCfg.minIntervalSec * 1000 + 1,
  fetchFn: reservationCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(reservationCrashRecovery.ran, true, 'the unrelated later chunk keeps moving')
assert.equal(reservationCrashProviderCalls, 1, 'the dispatch-authorized envelope is never retried')
assert.ok(reservationCrashPrompts[0].includes(reservationCrashChunks[1][0].headline))
assert.ok(!reservationCrashPrompts[0].includes(reservationCrashChunks[0][0].headline))
assert.deepEqual(readPassState(reservationCrashState)?.uncertain_input_keys?.length, 3)
assert.equal(Budget.load(reservationCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + reservationCrashCfg.minIntervalSec * 1000 + 1, 'groq-budget.json').requests, 2,
  'only the original reservation and the later real request remain; there is no retry reservation')
resetSharedLimiters()

// A process can die after the dispatched marker reaches disk but before a response is checkpointed. With
// no provider idempotency key, only that exact envelope is set aside. It is never called complete or sent
// again, while later and newly arriving rows keep moving through the queue.
const dispatchedCrashRoot = rootWithRows(5)
const dispatchedCrashCfg = { ...cfg, topN: 3 }
const dispatchedCrashState = path.join(dispatchedCrashRoot, '.state')
const dispatchedCrashRows = readTopSweep(dispatchedCrashRoot, dispatchedCrashCfg.topN, {
  nowMs: NOW, maxAgeMs: dispatchedCrashCfg.inputMaxAgeHrs! * 3_600_000, allEligible: true,
}).rows
const dispatchedCrashChunks = chunkIdeaRows(dispatchedCrashRows, dispatchedCrashCfg.topN)
assert.deepEqual(dispatchedCrashChunks.map((chunk) => chunk.length), [3, 2])
const dispatchedCrashKeys = dispatchedCrashRows.map((row) => `${topNHash([row])}:${topNEffectHash([row])}`)
const dispatchedEnvelopeKeys = dispatchedCrashChunks[0].map((row) => `${topNHash([row])}:${topNEffectHash([row])}`)
writePassState(dispatchedCrashState, {
  hash: topNHash(dispatchedCrashRows), effect_hash: topNEffectHash(dispatchedCrashRows), ran_at_ms: NOW,
  coverage_order: dispatchedCrashKeys, completed_chunks: [], completed_input_keys: [],
  completed_idea_ids: [], completed_idea_claims: [],
  in_flight: {
    chunk: { hash: topNHash(dispatchedCrashChunks[0]), effect_hash: topNEffectHash(dispatchedCrashChunks[0]) },
    input_keys: dispatchedEnvelopeKeys, started_at_ms: NOW, phase: 'dispatched', attempt_id: 'crash:groq',
    snapshot_revisions: [],
  },
})
updateIdeasHealth(dispatchedCrashState, {
  enabled: true, status: 'running', outcome: 'not_run', reason_code: null,
  reason: 'Groq is reading the current ranked lead set.', last_attempt_at: new Date(NOW).toISOString(),
  last_success_at: null, next_eligible_at: null, input_count: 5, produced_count: 0,
}, NOW)
const dispatchedCrashBudget = Budget.load(dispatchedCrashState, cfg.groqDailyReqCap,
  cfg.groqDailyTokenCap, NOW, 'groq-budget.json')
const dispatchedCrashReservation = dispatchedCrashBudget.tryReserve(50, undefined, NOW)
assert.ok(dispatchedCrashReservation)
dispatchedCrashBudget.reconcile(dispatchedCrashReservation, 1, 50)
let dispatchedCrashFetches = 0
const dispatchedCrashPrompts: string[] = []
const dispatchedCrashFetch = (async (_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
  dispatchedCrashFetches++
  const body = JSON.parse(String(init?.body || '{}'))
  dispatchedCrashPrompts.push(String(body?.messages?.[1]?.content || ''))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const dispatchedCrashHeld = await runIdeaPass({
  repoRoot: dispatchedCrashRoot, stateDir: dispatchedCrashState, config: dispatchedCrashCfg, refreshBoard: async () => {},
  now: () => NOW + 60_000, fetchFn: dispatchedCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(dispatchedCrashHeld.reason_code, 'stale_running')
assert.equal(dispatchedCrashFetches, 0, 'an ambiguous dispatched request is not repeated immediately')
const quarantinedState = readPassState(dispatchedCrashState)
assert.equal(quarantinedState?.in_flight, undefined, 'the global marker is converted into a row-scoped quarantine')
assert.deepEqual(quarantinedState?.uncertain_input_keys, dispatchedEnvelopeKeys)
assert.deepEqual(quarantinedState?.completed_input_keys, [], 'uncertain rows are not called completed')
assert.equal(Budget.load(dispatchedCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + 60_000, 'groq-budget.json').requests, 1, 'recovery never reserves or charges the uncertain envelope again')
const heldHealth = readIdeasHealth(dispatchedCrashState, dispatchedCrashRoot, true, NOW + 60_000)
assert.match(heldHealth.reason || '', /set aside/)
assert.match(heldHealth.reason || '', /Check provider use and saved ideas/)
const dispatchedCrashRetry = await runIdeaPass({
  repoRoot: dispatchedCrashRoot, stateDir: dispatchedCrashState, config: dispatchedCrashCfg, refreshBoard: async () => {},
  now: () => NOW + dispatchedCrashCfg.minIntervalSec * 1000 + 1,
  fetchFn: dispatchedCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(dispatchedCrashRetry.ran, true, 'the later chunk still runs after row-scoped quarantine')
assert.equal(dispatchedCrashFetches, 1)
assert.equal(Budget.load(dispatchedCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + dispatchedCrashCfg.minIntervalSec * 1000 + 1, 'groq-budget.json').requests, 2,
  'only the later chunk adds one request')
assert.ok(dispatchedCrashPrompts[0].includes('Company 3 files a material update'))
assert.ok(dispatchedCrashPrompts[0].includes('Company 4 files a material update'))
assert.ok(!dispatchedCrashPrompts[0].includes('Company 0 files a material update'), 'the uncertain envelope is not repeated')
assert.deepEqual(readPassState(dispatchedCrashState)?.completed_input_keys?.sort(), dispatchedCrashKeys.slice(3).sort(),
  'only the later successful rows are completed')
assert.equal(readIdeasHealth(dispatchedCrashState, dispatchedCrashRoot, true,
  NOW + dispatchedCrashCfg.minIntervalSec * 1000 + 1).status, 'degraded')
const dispatchedCrashSweepPath = path.join(dispatchedCrashRoot, 'screener', 'inbox', '2026-08-03_sweep.json')
const dispatchedCrashSweep = JSON.parse(fs.readFileSync(dispatchedCrashSweepPath, 'utf8'))
dispatchedCrashSweep.updated_at = '2026-08-03T11:30:00Z'
dispatchedCrashSweep.rows.unshift({
  headline: 'New Arrival files a material update', url: 'https://example.test/new-arrival',
  source_name: 'Exchange', found_at: '2026-08-03T11:15:00Z', triage_score: 99,
  companies: [{ name: 'New Arrival', ticker: 'NEW', listing_country: 'US' }],
})
fs.writeFileSync(dispatchedCrashSweepPath, JSON.stringify(dispatchedCrashSweep))
const dispatchedCrashNewRow = await runIdeaPass({
  repoRoot: dispatchedCrashRoot, stateDir: dispatchedCrashState, config: dispatchedCrashCfg, refreshBoard: async () => {},
  now: () => NOW + 2 * (dispatchedCrashCfg.minIntervalSec * 1000 + 1),
  fetchFn: dispatchedCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(dispatchedCrashNewRow.ran, true, 'a newly arriving row also moves past the quarantine')
assert.equal(dispatchedCrashFetches, 2)
assert.equal(Budget.load(dispatchedCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + 2 * (dispatchedCrashCfg.minIntervalSec * 1000 + 1), 'groq-budget.json').requests, 3,
  'only the newly arrived row adds the next request')
assert.ok(dispatchedCrashPrompts[1].includes('New Arrival files a material update'))
assert.ok(!dispatchedCrashPrompts[1].includes('Company 0 files a material update'))
assert.deepEqual(readPassState(dispatchedCrashState)?.uncertain_input_keys, dispatchedEnvelopeKeys,
  'new work cannot clear or complete an unrelated uncertain envelope')
dispatchedCrashSweep.updated_at = '2026-08-03T11:40:00Z'
dispatchedCrashSweep.rows = dispatchedCrashSweep.rows.filter((row: { headline: string }) => (
  row.headline !== 'Company 0 files a material update'
))
fs.writeFileSync(dispatchedCrashSweepPath, JSON.stringify(dispatchedCrashSweep))
const dispatchedCrashRemoval = await runIdeaPass({
  repoRoot: dispatchedCrashRoot, stateDir: dispatchedCrashState, config: dispatchedCrashCfg, refreshBoard: async () => {},
  now: () => NOW + 3 * (dispatchedCrashCfg.minIntervalSec * 1000 + 1),
  fetchFn: dispatchedCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(dispatchedCrashRemoval.reason_code, 'stale_running')
assert.equal(dispatchedCrashFetches, 2, 'removing one uncertain row does not re-send its peers')
assert.deepEqual(readPassState(dispatchedCrashState)?.uncertain_input_keys, dispatchedEnvelopeKeys.slice(1),
  'removing one uncertain row clears only its own exact key')
assert.equal(Budget.load(dispatchedCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  NOW + 3 * (dispatchedCrashCfg.minIntervalSec * 1000 + 1), 'groq-budget.json').requests, 3)
const dispatchedCrashHeartbeatAt = NOW
  + 2 * (dispatchedCrashCfg.minIntervalSec * 1000 + 1)
  + dispatchedCrashCfg.refreshSec * 1000 + 1
const dispatchedCrashHeartbeat = await runIdeaPass({
  repoRoot: dispatchedCrashRoot, stateDir: dispatchedCrashState, config: dispatchedCrashCfg,
  refreshBoard: async () => {}, now: () => dispatchedCrashHeartbeatAt,
  fetchFn: dispatchedCrashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(dispatchedCrashHeartbeat.ran, true,
  'visible quarantine health does not suppress the hourly refresh of safe rows')
assert.equal(dispatchedCrashFetches, 3)
assert.ok(dispatchedCrashPrompts[2].includes('New Arrival files a material update'))
assert.ok(dispatchedCrashPrompts[2].includes('Company 3 files a material update'))
assert.ok(dispatchedCrashPrompts[2].includes('Company 4 files a material update'))
assert.ok(!dispatchedCrashPrompts[2].includes('Company 1 files a material update'))
assert.ok(!dispatchedCrashPrompts[2].includes('Company 2 files a material update'))
assert.deepEqual(readPassState(dispatchedCrashState)?.uncertain_input_keys, dispatchedEnvelopeKeys.slice(1))
assert.equal(readIdeasHealth(dispatchedCrashState, dispatchedCrashRoot, true, dispatchedCrashHeartbeatAt).status, 'degraded')
assert.equal(Budget.load(dispatchedCrashState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap,
  dispatchedCrashHeartbeatAt, 'groq-budget.json').requests, 4,
  'only the safe heartbeat adds a request; quarantined rows still add none')
resetSharedLimiters()

// The ranked queue is strongest first. If a later chunk repeats the same ticker+direction, completing
// that chunk must not replace the reason and source set already admitted from the stronger first chunk.
const duplicateRoot = rootWithRows(5)
const duplicateState = path.join(duplicateRoot, '.state')
const duplicateCfg = { ...cfg, topN: 3 }
let duplicateProviderCalls = 0
const duplicateFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (new URL(String(input)).hostname === 'query1.finance.yahoo.com') {
    return new Response(JSON.stringify({
      quotes: [{ quoteType: 'EQUITY', symbol: 'ACME', longname: 'Acme Corp', exchDisp: 'NYSE' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  duplicateProviderCalls++
  const first = duplicateProviderCalls === 1
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [{
      src: [0, 1], ticker: 'ACME', company: 'Acme Corp', exchange: 'NYSE', direction: 'long',
      reason: first ? 'Higher-ranked evidence supports the call' : 'Lower-ranked evidence repeats the call',
      why_now: first ? 'The strongest source was published today' : 'A weaker source was also published today',
      conviction: first ? 80 : 60, priced_in: 'room', thesis_type: 'company_specific',
    }] }) } }], usage: { total_tokens: 80 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
let duplicateCheckpointRenames = 0
let duplicateFirst
const duplicateOriginalRename = fs.renameSync
try {
  ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
    if (String(to) === path.join(duplicateState, 'ideas-pass.json') && ++duplicateCheckpointRenames === 4) {
      throw Object.assign(new Error('simulated final marker-removal crash'), { code: 'EIO' })
    }
    return duplicateOriginalRename(from, to)
  }
  duplicateFirst = await runIdeaPass({
    repoRoot: duplicateRoot, stateDir: duplicateState, config: duplicateCfg, refreshBoard: async () => {},
    now: () => NOW, fetchFn: duplicateFetch, sleep: async () => {}, persistHealth: true,
  })
} finally {
  ;(fs as any).renameSync = duplicateOriginalRename
}
assert.equal(duplicateFirst?.reason_code, 'internal_error', 'the simulated crash interrupts final marker removal')
assert.equal(readPassState(duplicateState)?.in_flight?.phase, 'persisted', 'result, claims, and coverage are durable first')
const firstDuplicateSnapshot = readIdeaById(duplicateRoot, ideaId('ACME', 'long'))
assert.equal(firstDuplicateSnapshot?.reason, 'Higher-ranked evidence supports the call')
const duplicateSweepPath = path.join(duplicateRoot, 'screener', 'inbox', '2026-08-03_sweep.json')
const duplicateSweep = JSON.parse(fs.readFileSync(duplicateSweepPath, 'utf8'))
duplicateSweep.updated_at = '2026-08-03T11:30:00Z'
duplicateSweep.rows = duplicateSweep.rows.filter((row: { headline: string }) => row.headline !== 'Company 2 files a material update')
fs.writeFileSync(duplicateSweepPath, JSON.stringify(duplicateSweep))
const duplicateLocalRecovery = await runIdeaPass({
  repoRoot: duplicateRoot, stateDir: duplicateState, config: duplicateCfg, refreshBoard: async () => {},
  now: () => NOW + 60_000, fetchFn: duplicateFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(duplicateLocalRecovery.reason_code, 'min_interval')
assert.equal(duplicateProviderCalls, 1, 'a persisted result finishes its terminal checkpoint locally')
assert.equal(readPassState(duplicateState)?.in_flight, undefined)
const duplicateSecond = await runIdeaPass({
  repoRoot: duplicateRoot, stateDir: duplicateState, config: duplicateCfg, refreshBoard: async () => {},
  now: () => NOW + duplicateCfg.minIntervalSec * 1000 + 1,
  fetchFn: duplicateFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(duplicateSecond.ran, true)
assert.equal(duplicateSecond.produced, 0, 'local recovery keeps the stronger first claim')
assert.equal(readPassState(duplicateState)?.completed_idea_claims?.[0]?.input_keys.length, 2,
  'the persisted call is bound only to its two selected source rows')
assert.equal(duplicateProviderCalls, 2, 'persisted recovery calls only the later unfinished chunk')
const preservedDuplicateSnapshot = readIdeaById(duplicateRoot, ideaId('ACME', 'long'))
assert.equal(preservedDuplicateSnapshot?.reason, 'Higher-ranked evidence supports the call',
  'deleting unrelated row 2 cannot unlock the stronger idea for a lower-ranked overwrite')
assert.deepEqual(preservedDuplicateSnapshot?.source_event_ids, firstDuplicateSnapshot?.source_event_ids)
resetSharedLimiters()

// If the provider result and snapshot are saved but the first result checkpoint itself fails, recovery
// preserves the demonstrably new snapshot's first-occurrence claim and quarantines that envelope. It may
// continue the later chunk, but it still cannot retry or call the ambiguous request successful.
const resultCheckpointRoot = rootWithRows(5)
const resultCheckpointState = path.join(resultCheckpointRoot, '.state')
const resultCheckpointCfg = { ...cfg, topN: 3 }
let resultCheckpointFetches = 0
const resultCheckpointFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (new URL(String(input)).hostname === 'query1.finance.yahoo.com') {
    return new Response(JSON.stringify({
      quotes: [{ quoteType: 'EQUITY', symbol: 'ACME', longname: 'Acme Corp', exchDisp: 'NYSE' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  resultCheckpointFetches++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [{
      src: [0, 1], ticker: 'ACME', company: 'Acme Corp', exchange: 'NYSE', direction: 'long',
      reason: 'Higher-ranked evidence supports the blocked call', why_now: 'The strongest source was published today',
      conviction: 80, priced_in: 'room', thesis_type: 'company_specific',
    }] }) } }], usage: { total_tokens: 80 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
let resultCheckpointRenames = 0
const resultCheckpointOriginalRename = fs.renameSync
let resultCheckpointFirst
try {
  ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
    if (String(to) === path.join(resultCheckpointState, 'ideas-pass.json') && ++resultCheckpointRenames === 3) {
      throw Object.assign(new Error('simulated result-checkpoint crash'), { code: 'EIO' })
    }
    return resultCheckpointOriginalRename(from, to)
  }
  resultCheckpointFirst = await runIdeaPass({
    repoRoot: resultCheckpointRoot, stateDir: resultCheckpointState, config: resultCheckpointCfg,
    refreshBoard: async () => {}, now: () => NOW,
    fetchFn: resultCheckpointFetch, sleep: async () => {}, persistHealth: true,
  })
} finally {
  ;(fs as any).renameSync = resultCheckpointOriginalRename
}
assert.equal(resultCheckpointFirst?.reason_code, 'internal_error')
assert.equal(readPassState(resultCheckpointState)?.in_flight?.phase, 'authorized')
assert.equal(readIdeaById(resultCheckpointRoot, ideaId('ACME', 'long'))?.reason,
  'Higher-ranked evidence supports the blocked call')
const resultCheckpointSweepPath = path.join(resultCheckpointRoot, 'screener', 'inbox', '2026-08-03_sweep.json')
const resultCheckpointSweep = JSON.parse(fs.readFileSync(resultCheckpointSweepPath, 'utf8'))
resultCheckpointSweep.rows = resultCheckpointSweep.rows.filter((row: { headline: string }) => (
  row.headline !== 'Company 2 files a material update'
))
fs.writeFileSync(resultCheckpointSweepPath, JSON.stringify(resultCheckpointSweep))
const resultCheckpointRecovery = await runIdeaPass({
  repoRoot: resultCheckpointRoot, stateDir: resultCheckpointState, config: resultCheckpointCfg,
  refreshBoard: async () => {}, now: () => NOW + resultCheckpointCfg.minIntervalSec * 1000 + 1,
  fetchFn: resultCheckpointFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(resultCheckpointRecovery.ran, true, 'the later chunk continues after the ambiguous envelope is isolated')
assert.equal(resultCheckpointFetches, 2, 'only the later chunk is sent; the ambiguous request is never sent again')
const resultCheckpointRecoveredState = readPassState(resultCheckpointState)
assert.equal(resultCheckpointRecoveredState?.in_flight, undefined)
assert.equal(resultCheckpointRecoveredState?.uncertain_input_keys?.length, 2,
  'only the two still-current rows from the dispatched envelope stay uncertain after unrelated removal')
assert.ok(resultCheckpointRecoveredState?.completed_input_keys?.every((key) => (
  !resultCheckpointRecoveredState.uncertain_input_keys?.includes(key)
)), 'quarantined rows are never called completed')
assert.equal(resultCheckpointRecoveredState?.completed_idea_claims?.[0]?.idea_id, ideaId('ACME', 'long'))
assert.equal(resultCheckpointRecoveredState?.completed_idea_claims?.[0]?.input_keys.length, 2,
  'snapshot recovery keeps only the actual support rows despite unrelated row removal')
resultCheckpointSweep.updated_at = '2026-08-03T11:40:00Z'
resultCheckpointSweep.rows = resultCheckpointSweep.rows.filter((row: { headline: string }) => (
  row.headline !== 'Company 0 files a material update'
))
fs.writeFileSync(resultCheckpointSweepPath, JSON.stringify(resultCheckpointSweep))
const resultCheckpointSupportRemoval = await runIdeaPass({
  repoRoot: resultCheckpointRoot, stateDir: resultCheckpointState, config: resultCheckpointCfg,
  refreshBoard: async () => {}, now: () => NOW + 2 * (resultCheckpointCfg.minIntervalSec * 1000 + 1),
  fetchFn: resultCheckpointFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(resultCheckpointSupportRemoval.reason_code, 'stale_running')
assert.equal(resultCheckpointFetches, 2)
assert.deepEqual(readPassState(resultCheckpointState)?.completed_idea_claims, [],
  'removing one of the idea own support rows releases only that source-scoped claim')
resetSharedLimiters()

const throttled = await runIdeaPass({ repoRoot: okRoot, stateDir: okState, config: cfg, refreshBoard: async () => {}, now: () => NOW + 60_000, fetchFn, sleep: async () => {}, persistHealth: true })
assert.equal(throttled.reason_code, 'min_interval')
const waiting = readIdeasHealth(okState, okRoot, true, NOW + 60_000)
assert.equal(waiting.status, 'waiting')
assert.equal(waiting.last_success_at, healthy.last_success_at, 'skip transitions preserve the last real success')
assert.equal(fetches, 1)

// Simulate a crash after the provider returned and ideas-pass.json was stamped, but before the health
// record could be completed. The surviving `running` record must remain visible as a failed attempt while
// the hard interval drains, then unchanged input must retry immediately instead of being treated as a
// valid cached empty result until the one-hour refresh.
const crashRoot = rootWithRows(2)
const crashState = path.join(crashRoot, '.state')
const crashAt = NOW
const crashRows = readTopSweep(crashRoot, cfg.topN, {
  nowMs: crashAt,
  maxAgeMs: cfg.inputMaxAgeHrs! * 3_600_000,
}).rows
writePassState(crashState, { hash: topNHash(crashRows), ran_at_ms: crashAt })
updateIdeasHealth(crashState, {
  enabled: true, status: 'running', outcome: 'not_run', reason_code: null,
  reason: 'The provider is reading the current ranked lead set.',
  last_attempt_at: new Date(crashAt).toISOString(), last_success_at: null, next_eligible_at: null,
  input_count: crashRows.length, produced_count: 0,
}, crashAt)
let crashRetryFetches = 0
const crashFetch = (async () => {
  crashRetryFetches++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const crashThrottle = await runIdeaPass({
  repoRoot: crashRoot, stateDir: crashState, config: cfg, refreshBoard: async () => {},
  now: () => crashAt + 60_000, fetchFn: crashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(crashThrottle.reason_code, 'stale_running')
assert.equal(crashRetryFetches, 0, 'an abandoned attempt still honors the provider minimum interval')
const crashed = readIdeasHealth(crashState, crashRoot, true, crashAt + 60_000)
assert.equal(crashed.status, 'error')
assert.equal(crashed.outcome, 'failed')
assert.equal(crashed.reason_code, 'stale_running', 'the crash is not overwritten by a waiting/min_interval transition')
assert.equal(crashed.last_success_at, null, 'an unfinished pass is never a cached empty success')
const retryAt = crashAt + cfg.minIntervalSec * 1000 + 1
const crashRetry = await runIdeaPass({
  repoRoot: crashRoot, stateDir: crashState, config: cfg, refreshBoard: async () => {},
  now: () => retryAt, fetchFn: crashFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(crashRetry.ran, true, 'unchanged input retries as soon as the minimum interval permits')
assert.equal(crashRetryFetches, 1)
const recoveredCrash = readIdeasHealth(crashState, crashRoot, true, retryAt)
assert.equal(recoveredCrash.status, 'healthy')
assert.equal(recoveredCrash.outcome, 'success_empty')
assert.equal(recoveredCrash.last_success_at, new Date(retryAt).toISOString())

// The production failure this guards: Groq can be at its daily cap while an existing overflow tier still
// has room. The same canonical budget files must route the pass onward; a literal [] is a real success and
// must stop the chain instead of shopping for a provider willing to invent an idea.
const fallbackRoot = rootWithRows(2)
const fallbackState = path.join(fallbackRoot, '.state')
Budget.load(fallbackState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, NOW, 'groq-budget.json').exhaust()
const nearCap = testProvider('ideas-near-cap', 'https://cerebras.test/v1', {
  label: 'Cerebras', dailyTokenCap: 100,
})
const mistral = testProvider('ideas-fallback', 'https://mistral.test/v1', { label: 'Mistral' })
const later = testProvider('ideas-later', 'https://later.test/v1', { label: 'Later provider' })
const fallbackUrls: string[] = []
const fallbackFetch = (async (input: Parameters<typeof fetch>[0]) => {
  fallbackUrls.push(String(input))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const fallbackAt = NOW + 30 * 60_000
const fallback = await runIdeaPass({
  repoRoot: fallbackRoot, stateDir: fallbackState,
  config: { ...cfg, overflowProviders: [nearCap, mistral, later] }, refreshBoard: async () => {},
  now: () => fallbackAt, fetchFn: fallbackFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(fallback.ran, true)
assert.equal(fallback.produced, 0)
assert.deepEqual(fallbackUrls, ['https://mistral.test/v1/chat/completions'], 'valid empty stops at the first eligible fallback')
assert.equal(Budget.load(fallbackState, 10, 100, fallbackAt, nearCap.budgetFile).requests, 0, 'a token-gated near-cap tier is skipped without a request')
assert.equal(Budget.load(fallbackState, 10, NON_BINDING_DAILY_TOKEN_CAP, fallbackAt, mistral.budgetFile).requests, 1)
assert.equal(Budget.load(fallbackState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, fallbackAt, 'groq-budget.json').remainingRequests, 0)
const fallbackHealth = readIdeasHealth(fallbackState, fallbackRoot, true, fallbackAt)
assert.equal(fallbackHealth.status, 'healthy')
assert.equal(fallbackHealth.outcome, 'success_empty')
assert.match(fallbackHealth.reason || '', /Mistral completed successfully/)

// Finite overflow is one reset-clock pool, not a fixed chain. Both providers are admissible at 18:00,
// but the second is further behind its released daily target and must receive this Ideas call first.
const fairRoot = rootWithRows(2)
const fairState = path.join(fairRoot, '.state')
const fairAt = Date.parse('2026-08-03T18:00:00Z')
const fairFirst = testProvider('ideas-fair-first', 'https://fair-first.test/v1', { label: 'First', dailyReqCap: 100 })
const fairBehind = testProvider('ideas-fair-behind', 'https://fair-behind.test/v1', { label: 'Behind', dailyReqCap: 100 })
Budget.load(fairState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, fairAt, 'groq-budget.json').exhaust()
const fairFirstBudget = Budget.load(fairState, 100, NON_BINDING_DAILY_TOKEN_CAP, fairAt, fairFirst.budgetFile)
fairFirstBudget.record(50, 0); fairFirstBudget.save()
const fairBehindBudget = Budget.load(fairState, 100, NON_BINDING_DAILY_TOKEN_CAP, fairAt, fairBehind.budgetFile)
fairBehindBudget.record(10, 0); fairBehindBudget.save()
const fairUrls: string[] = []
const fair = await runIdeaPass({
  repoRoot: fairRoot, stateDir: fairState,
  config: { ...cfg, freeProviderPaceFloorFrac: 0.06, overflowProviders: [fairFirst, fairBehind] },
  refreshBoard: async () => {}, now: () => fairAt, persistHealth: true, sleep: async () => {},
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    fairUrls.push(String(input))
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(fair.ran, true)
assert.deepEqual(fairUrls, ['https://fair-behind.test/v1/chat/completions'], 'config order is only a tie-break; allowance deficit chooses the provider')
assert.equal(fairFirstBudget.requests, 50)
assert.equal(fairBehindBudget.requests, 11)

// Aggregate routers have a separate semantic class: even when OmniRoute is further behind its daily clock,
// every direct provider must be tried first. A direct failure may then fall through to the aggregate route.
const aggregateRouteRoot = rootWithRows(2)
const aggregateRouteState = path.join(aggregateRouteRoot, '.state')
const aggregateRouteAt = Date.parse('2026-08-03T18:00:00Z')
const aggregateRoute = testProvider('ideas-aggregate-route', 'https://aggregate.test/v1', {
  label: 'Aggregate Route', dailyReqCap: 100, routeClass: 'aggregate-fallback',
})
const directRoute = testProvider('ideas-direct-route', 'https://direct.test/v1', {
  label: 'Direct Route', dailyReqCap: 100, routeClass: 'direct',
})
Budget.load(aggregateRouteState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, aggregateRouteAt, 'groq-budget.json').exhaust()
const directRouteBudget = Budget.load(aggregateRouteState, 100, NON_BINDING_DAILY_TOKEN_CAP, aggregateRouteAt, directRoute.budgetFile)
directRouteBudget.record(50, 0); directRouteBudget.save()
const aggregateRouteUrls: string[] = []
const aggregateFallback = await runIdeaPass({
  repoRoot: aggregateRouteRoot, stateDir: aggregateRouteState,
  config: { ...cfg, overflowProviders: [aggregateRoute, directRoute] },
  refreshBoard: async () => {}, now: () => aggregateRouteAt, persistHealth: true, sleep: async () => {},
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    aggregateRouteUrls.push(String(input))
    if (String(input).startsWith('https://direct.test')) return new Response('{}', { status: 503 })
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(aggregateFallback.ran, true)
assert.deepEqual(aggregateRouteUrls, [
  'https://direct.test/v1/chat/completions',
  'https://aggregate.test/v1/chat/completions',
], 'aggregate deficit never leapfrogs direct capacity, but remains reachable after direct failure')
assert.equal(Budget.load(aggregateRouteState, 100, NON_BINDING_DAILY_TOKEN_CAP, aggregateRouteAt, aggregateRoute.budgetFile).requests, 1)

// Gemini's native generateContent pool participates in the SAME reset-clock selector. Each model has its
// own Pacific-day ledger, while all models share one minute limiter. This is the production gap that left
// healthy Gemini allowance unused and the Ideas board stale when the OpenAI-compatible tiers were held.
resetSharedLimiters()
const geminiRoot = rootWithRows(2)
const geminiState = path.join(geminiRoot, '.state')
const geminiAt = Date.parse('2026-08-03T18:00:00Z')
const geminiModels = [{ model: 'gemini-a', dailyReqCap: 10 }, { model: 'gemini-b', dailyReqCap: 10 }]
const geminiDayTz = 'America/Los_Angeles'
const geminiA = Budget.load(geminiState, 10, 5_000_000, geminiAt, 'gemini-budget-gemini-a.json', geminiDayTz)
geminiA.record(4, 100); geminiA.save()
const geminiUrls: string[] = []
const geminiOnly = await runIdeaPass({
  repoRoot: geminiRoot, stateDir: geminiState,
  config: {
    ...cfg, groqApiKey: '', overflowProviders: [], geminiEnabled: true, geminiApiKey: 'gemini-key',
    geminiBaseUrl: 'https://gemini.test/v1beta', geminiModels, geminiMaxTokens: 500,
    geminiDailyTokenCap: 5_000_000, geminiDayTz, geminiRpm: 0, geminiTpm: 0,
  },
  refreshBoard: async () => {}, now: () => geminiAt, sleep: async () => {}, persistHealth: true,
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    geminiUrls.push(String(input))
    return new Response(JSON.stringify({
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ ideas: [] }) }] } }],
      usageMetadata: { totalTokenCount: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(geminiOnly.ran, true)
assert.deepEqual(geminiUrls, ['https://gemini.test/v1beta/models/gemini-b:generateContent'], 'the model furthest behind its released Pacific-day target is selected')
assert.equal(geminiA.requests, 4)
assert.equal(Budget.load(geminiState, 10, 5_000_000, geminiAt, 'gemini-budget-gemini-b.json', geminiDayTz).requests, 1)
assert.match(readIdeasHealth(geminiState, geminiRoot, true, geminiAt).reason || '', /Gemini · gemini-b completed successfully/)

const geminiFallbackRoot = rootWithRows(2)
const geminiFallbackState = path.join(geminiFallbackRoot, '.state')
const geminiFallbackUrls: string[] = []
const geminiFallback = await runIdeaPass({
  repoRoot: geminiFallbackRoot, stateDir: geminiFallbackState,
  config: {
    ...cfg, groqApiKey: '', overflowProviders: [], geminiEnabled: true, geminiApiKey: 'gemini-key',
    geminiBaseUrl: 'https://gemini.test/v1beta', geminiModels, geminiMaxTokens: 500,
    geminiDailyTokenCap: 5_000_000, geminiDayTz, geminiRpm: 0, geminiTpm: 0,
  },
  refreshBoard: async () => {}, now: () => geminiAt, sleep: async () => {}, persistHealth: true,
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    const url = String(input)
    geminiFallbackUrls.push(url)
    if (url.includes('/gemini-a:')) {
      return new Response(JSON.stringify({ error: { details: [{ violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }] }] } }), { status: 429 })
    }
    return new Response(JSON.stringify({
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ ideas: [] }) }] } }],
      usageMetadata: { totalTokenCount: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(geminiFallback.ran, true)
assert.deepEqual(geminiFallbackUrls, [
  'https://gemini.test/v1beta/models/gemini-a:generateContent',
  'https://gemini.test/v1beta/models/gemini-b:generateContent',
], 'one model daily-limit signal moves the same pass to the next model')
const exhaustedGemini = Budget.load(geminiFallbackState, 10, 5_000_000, geminiAt, 'gemini-budget-gemini-a.json', geminiDayTz)
assert.equal(exhaustedGemini.providerDayExhausted, true)
assert.equal(exhaustedGemini.requests, 1, 'provider-day closure retains the real call count')
assert.equal(Budget.load(geminiFallbackState, 10, 5_000_000, geminiAt, 'gemini-budget-gemini-b.json', geminiDayTz).requests, 1)

resetSharedLimiters()
const geminiLimiterRoot = rootWithRows(2)
const geminiLimiterState = path.join(geminiLimiterRoot, '.state')
const geminiLimiterAt = geminiAt + 60_000
await getSharedGeminiLimiter(60, 0).acquire(100, async () => {}, () => geminiLimiterAt)
let geminiLimiterFetches = 0
const geminiBusy = await runIdeaPass({
  repoRoot: geminiLimiterRoot, stateDir: geminiLimiterState,
  config: {
    ...cfg, groqApiKey: '', overflowProviders: [], limiterWaitMs: 0,
    geminiEnabled: true, geminiApiKey: 'gemini-key', geminiBaseUrl: 'https://gemini.test/v1beta',
    geminiModels: [{ model: 'gemini-shared', dailyReqCap: 10 }], geminiMaxTokens: 500,
    geminiDailyTokenCap: 5_000_000, geminiDayTz, geminiRpm: 60, geminiTpm: 0,
  },
  refreshBoard: async () => {}, now: () => geminiLimiterAt, sleep: async () => {}, persistHealth: true,
  fetchFn: (async () => { geminiLimiterFetches++; throw new Error('shared minute window must gate this call') }) as unknown as typeof fetch,
})
assert.equal(geminiBusy.reason_code, 'rate_limiter_busy')
assert.equal(geminiLimiterFetches, 0, 'Ideas shares Gemini minute admission with title triage instead of opening a private lane')
resetSharedLimiters()

const pacedRoot = rootWithRows(2)
const pacedState = path.join(pacedRoot, '.state')
const pacedAt = Date.parse('2026-08-04T00:15:00Z')
const pacedFirst = testProvider('ideas-paced-first', 'https://paced-first.test/v1', { label: 'Paced first', dailyReqCap: 100 })
const pacedLater = testProvider('ideas-paced-later', 'https://paced-later.test/v1', { label: 'Paced later', dailyReqCap: 100 })
Budget.load(pacedState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, pacedAt, 'groq-budget.json').exhaust()
const pacedFirstBudget = Budget.load(pacedState, 100, NON_BINDING_DAILY_TOKEN_CAP, pacedAt, pacedFirst.budgetFile)
pacedFirstBudget.record(6, 0); pacedFirstBudget.save() // exactly the configured 6% start-of-day release
const pacedUrls: string[] = []
const paced = await runIdeaPass({
  repoRoot: pacedRoot, stateDir: pacedState,
  config: { ...cfg, freeProviderPaceFloorFrac: 0.06, overflowProviders: [pacedFirst, pacedLater] },
  refreshBoard: async () => {}, now: () => pacedAt, persistHealth: true, sleep: async () => {},
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    pacedUrls.push(String(input))
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(paced.ran, true)
assert.deepEqual(pacedUrls, ['https://paced-later.test/v1/chat/completions'], 'an ahead-of-clock tier cannot fixed-order drain past its released allowance')
assert.equal(pacedFirstBudget.requests, 6)

// A transient primary failure falls through in the SAME pass. Only availability failures arm the shared
// provider cooldown; the fallback success remains the health verdict.
const transientRoot = rootWithRows(2)
const transientState = path.join(transientRoot, '.state')
const transientAt = NOW + 32 * 60_000
const transientFallback = testProvider('ideas-after-groq', 'https://fallback.test/v1', { label: 'Fallback' })
let groqFailures = 0
let transientFallbackCalls = 0
const transientFetch = (async (input: Parameters<typeof fetch>[0]) => {
  if (String(input).startsWith(cfg.groqBaseUrl)) {
    groqFailures++
    return new Response('temporarily unavailable', { status: 503 })
  }
  transientFallbackCalls++
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
    usage: { total_tokens: 50 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const transient = await runIdeaPass({
  repoRoot: transientRoot, stateDir: transientState,
  config: { ...cfg, overflowProviders: [transientFallback] }, refreshBoard: async () => {},
  now: () => transientAt, fetchFn: transientFetch, sleep: async () => {}, persistHealth: true,
})
assert.equal(transient.ran, true)
assert.equal(groqFailures, 1, 'the operational chain gives each tier one bounded probe before falling through')
assert.equal(transientFallbackCalls, 1)
assert.ok(readCooldownUntil(transientState, 'groq') > transientAt, 'availability failure cools shared Groq')
assert.equal(readIdeasHealth(transientState, transientRoot, true, transientAt).outcome, 'success_empty')

// Retry-After is an exact provider clock, not an input to the generic exponential breaker. A 503 can carry
// it too; the same batch must fall through immediately while every workload shares only that exact hold.
const retryRoot = rootWithRows(2)
const retryState = path.join(retryRoot, '.state')
const retryAfterAt = NOW + 32 * 60_000 + 30_000
const retryProvider = testProvider('ideas-retry-after', 'https://retry-after.test/v1', { label: 'Retry provider' })
const retryFallback = testProvider('ideas-after-retry', 'https://after-retry.test/v1', { label: 'Retry fallback' })
const retryUrls: string[] = []
const retryAfterResult = await runIdeaPass({
  repoRoot: retryRoot, stateDir: retryState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [retryProvider, retryFallback] },
  refreshBoard: async () => {}, now: () => retryAfterAt, sleep: async () => {}, persistHealth: true,
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    retryUrls.push(String(input))
    if (String(input).startsWith(retryProvider.baseUrl)) {
      return new Response('private account detail', { status: 503, headers: { 'retry-after': '25' } })
    }
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
})
assert.equal(retryAfterResult.ran, true)
assert.deepEqual(retryUrls, [
  'https://retry-after.test/v1/chat/completions',
  'https://after-retry.test/v1/chat/completions',
])
assert.equal(readCooldownUntil(retryState, retryProvider.id), retryAfterAt + 25_000, 'shared hold ends on the exact Retry-After clock')
assert.equal(readCooldownUntil(retryState, `ideas:${retryProvider.id}`), 0)
assert.doesNotMatch(readIdeasHealth(retryState, retryRoot, true, retryAfterAt).reason || '', /private account detail/)

// The adapter itself is supposed to be fail-soft. Keep a second boundary anyway: if a future retry helper
// unexpectedly throws, Ideas fails closed, charges conservatively, and never crashes or cools shared Groq.
const adapterGuardRoot = rootWithRows(2)
const adapterGuardState = path.join(adapterGuardRoot, '.state')
const adapterGuardAt = NOW + 33 * 60_000
const adapterGuardRows = readTopSweep(adapterGuardRoot, cfg.topN, {
  nowMs: adapterGuardAt, maxAgeMs: cfg.inputMaxAgeHrs! * 3_600_000,
}).rows
const adapterGuard = await callGroqForIdeaPass(adapterGuardRows, {
  repoRoot: adapterGuardRoot, stateDir: adapterGuardState, config: cfg, refreshBoard: async () => {},
  now: () => adapterGuardAt,
  fetchFn: (async () => new Response('temporarily unavailable', { status: 503 })) as typeof fetch,
  sleep: async () => { throw new Error('acct-secret-from-provider retry helper failed') },
})
assert.equal(adapterGuard?.ok, false)
assert.equal(adapterGuard?.failureKind, 'contract')
assert.match(adapterGuard?.note || '', /unexpected adapter failure/)
assert.doesNotMatch(adapterGuard?.note || '', /acct-secret-from-provider/)
assert.equal(readCooldownUntil(adapterGuardState, 'groq'), 0, 'an internal Ideas adapter bug cannot cool shared Groq')
assert.ok(readCooldownUntil(adapterGuardState, 'ideas:groq') > adapterGuardAt)
assert.equal(
  Budget.load(adapterGuardState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, adapterGuardAt, 'groq-budget.json').tokens,
  ideaGroqTokenBound(adapterGuardRows, cfg.groqMaxTokens),
  'an escaped adapter failure is charged at one full conservative attempt',
)

// A shared hold can start while Ideas waits for the minute limiter. The live recheck must stop before
// the durable dispatch marker, daily reservation, or provider request.
resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
const postLimiterRoot = rootWithRows(2)
const postLimiterState = path.join(postLimiterRoot, '.state')
const postLimiterRows = readTopSweep(postLimiterRoot, cfg.topN, {
  nowMs: NOW, maxAgeMs: cfg.inputMaxAgeHrs! * 3_600_000,
}).rows
const postLimiter = getSharedLimiter(cfg.groqRpm, cfg.groqTpm)
const originalPostLimiterAcquire = postLimiter.acquire.bind(postLimiter)
let postLimiterFetches = 0
postLimiter.acquire = (async () => {
  armCooldown(postLimiterState, NOW, 60_000, 'groq', 60_000, 'availability')
  return true
}) as typeof postLimiter.acquire
try {
  const postLimiterResult = await callGroqForIdeaPass(postLimiterRows, {
    repoRoot: postLimiterRoot, stateDir: postLimiterState, config: cfg, refreshBoard: async () => {},
    now: () => NOW, fetchFn: (async () => {
      postLimiterFetches++
      return new Response('{}', { status: 200 })
    }) as typeof fetch, sleep: async () => {},
  })
  assert.equal(postLimiterResult, null)
  assert.equal(postLimiterFetches, 0)
  assert.equal(fs.existsSync(path.join(postLimiterState, 'groq-budget.json')), false)
  assert.ok(readCooldownUntil(postLimiterState, 'groq') > NOW)
} finally {
  postLimiter.acquire = originalPostLimiterAcquire
  resetBudgetMemory(); resetCooldownMemory(); resetSharedLimiters()
}

// Bad Ideas JSON is workload-specific: charge the real request, then cool only `ideas:<provider>`. It must
// never exhaust the shared ledger or mark the provider unhealthy for core news triage.
const contractRoot = rootWithRows(2)
const contractState = path.join(contractRoot, '.state')
const contractAt = NOW + 34 * 60_000
const contractProvider = testProvider('ideas-contract', 'https://contract.test/v1', { label: 'Contract provider' })
const contractResult = await runIdeaPass({
  repoRoot: contractRoot, stateDir: contractState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [contractProvider] }, refreshBoard: async () => {},
  now: () => contractAt,
  fetchFn: (async () => new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: '{"wrong":[]}' } }], usage: { total_tokens: 25 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch,
  sleep: async () => {}, persistHealth: true,
})
assert.equal(contractResult.reason_code, 'provider_error')
assert.equal(readCooldownUntil(contractState, 'ideas-contract'), 0, 'Ideas schema drift cannot cool shared triage')
assert.ok(readCooldownUntil(contractState, 'ideas:ideas-contract') > contractAt)
const contractBudget = Budget.load(contractState, 10, NON_BINDING_DAILY_TOKEN_CAP, contractAt, contractProvider.budgetFile)
assert.equal(contractBudget.requests, 1)
assert.equal(contractBudget.remainingRequests, 9, 'contract drift charges one call but does not poison the day')

const requestRoot = rootWithRows(2)
const requestState = path.join(requestRoot, '.state')
const requestAt = NOW + 35 * 60_000
const requestProvider = testProvider('ideas-request-shape', 'https://request.test/v1', { label: 'Request provider' })
await runIdeaPass({
  repoRoot: requestRoot, stateDir: requestState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [requestProvider] }, refreshBoard: async () => {}, now: () => requestAt,
  fetchFn: (async () => new Response('Ideas payload rejected', { status: 400 })) as typeof fetch,
  sleep: async () => {}, persistHealth: true,
})
assert.equal(readCooldownUntil(requestState, 'ideas-request-shape'), 0, 'Ideas HTTP 400 cannot cool shared triage')
assert.ok(readCooldownUntil(requestState, 'ideas:ideas-request-shape') > requestAt)
assert.equal(Budget.load(requestState, 10, NON_BINDING_DAILY_TOKEN_CAP, requestAt, requestProvider.budgetFile).remainingRequests, 9)

const requestRetryRoot = rootWithRows(2)
const requestRetryState = path.join(requestRetryRoot, '.state')
const requestRetryAt = requestAt + 1_000
const requestRetryProvider = testProvider('ideas-request-retry', 'https://request-retry.test/v1', { label: 'Request retry provider' })
await runIdeaPass({
  repoRoot: requestRetryRoot, stateDir: requestRetryState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [requestRetryProvider] },
  refreshBoard: async () => {}, now: () => requestRetryAt, sleep: async () => {}, persistHealth: true,
  fetchFn: (async () => new Response('acct-secret-400', {
    status: 400, headers: { 'retry-after': '25' },
  })) as typeof fetch,
})
assert.equal(readCooldownUntil(requestRetryState, requestRetryProvider.id), 0, 'request-shape Retry-After is not provider-wide evidence')
assert.ok(readCooldownUntil(requestRetryState, `ideas:${requestRetryProvider.id}`) > requestRetryAt)
assert.doesNotMatch(readIdeasHealth(requestRetryState, requestRetryRoot, true, requestRetryAt).reason || '', /acct-secret-400/)

// No provider attempt means no false success or attempt timestamp. The UI must say deferred with the
// per-tier reasons instead of claiming that the wire genuinely cleared no ideas.
const cappedRoot = rootWithRows(2)
const cappedState = path.join(cappedRoot, '.state')
const cappedAt = NOW + 36 * 60_000
const cappedProvider = testProvider('ideas-capped', 'https://capped.test/v1', { label: 'Capped provider' })
Budget.load(cappedState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, cappedAt, 'groq-budget.json').exhaust()
Budget.load(cappedState, cappedProvider.dailyReqCap, NON_BINDING_DAILY_TOKEN_CAP, cappedAt, cappedProvider.budgetFile).exhaust()
let cappedFetches = 0
const capped = await runIdeaPass({
  repoRoot: cappedRoot, stateDir: cappedState,
  config: { ...cfg, overflowProviders: [cappedProvider] }, refreshBoard: async () => {}, now: () => cappedAt,
  fetchFn: (async () => { cappedFetches++; throw new Error('must not call') }) as typeof fetch, persistHealth: true,
})
assert.equal(capped.reason_code, 'daily_budget')
assert.equal(cappedFetches, 0)
const cappedHealth = readIdeasHealth(cappedState, cappedRoot, true, cappedAt)
assert.equal(cappedHealth.status, 'deferred')
assert.equal(cappedHealth.outcome, 'skipped')
assert.equal(cappedHealth.last_attempt_at, null)
assert.match(cappedHealth.reason || '', /Groq.+exhausted.+Capped provider.+exhausted/)

// A configured local primary is registry-driven and stays ahead of Groq. Its unlimited ledger is still
// charged for observability, and no cloud request is made after a valid local result.
const localRoot = rootWithRows(2)
const localState = path.join(localRoot, '.state')
const localAt = NOW + 38 * 60_000
const localProvider = testProvider('local', 'https://local.test/v1', {
  label: 'Local', apiKey: 'local', dailyReqCap: 100_000_000, budgetFile: 'local-budget.json',
})
const localUrls: string[] = []
const local = await runIdeaPass({
  repoRoot: localRoot, stateDir: localState,
  config: { ...cfg, localProvider, overflowProviders: [] }, refreshBoard: async () => {}, now: () => localAt,
  fetchFn: (async (input: Parameters<typeof fetch>[0]) => {
    localUrls.push(String(input))
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }], usage: { total_tokens: 20 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
  sleep: async () => {}, persistHealth: true,
})
assert.equal(local.ran, true)
assert.deepEqual(localUrls, ['https://local.test/v1/chat/completions'])
assert.equal(Budget.load(localState, localProvider.dailyReqCap, NON_BINDING_DAILY_TOKEN_CAP, localAt, localProvider.budgetFile).requests, 1)
assert.match(readIdeasHealth(localState, localRoot, true, localAt).reason || '', /Local completed successfully/)

// Ideas may give a deliberately slow local tier less time than core triage so fallbacks remain reachable.
// That workload-local deadline must never arm Local's shared cooldown and sideline the ordinary news loop.
const slowLocalRoot = rootWithRows(2)
const slowLocalState = path.join(slowLocalRoot, '.state')
const slowLocalAt = NOW + 39 * 60_000
const slowLocal = testProvider('local', 'https://slow-local.test/v1', {
  label: 'Local', apiKey: 'local', timeoutMs: 1_000, dailyReqCap: 100_000_000, budgetFile: 'local-budget.json',
})
const afterSlowLocal = testProvider('after-slow-local', 'https://after-local.test/v1', { label: 'Cloud fallback' })
const slowLocalUrls: string[] = []
const slowLocalResult = await runIdeaPass({
  repoRoot: slowLocalRoot, stateDir: slowLocalState,
  config: {
    ...cfg, groqApiKey: '', localProvider: slowLocal, overflowProviders: [afterSlowLocal],
    providerAttemptTimeoutMs: 20, providerChainTimeoutMs: 500,
  },
  refreshBoard: async () => {}, now: () => slowLocalAt, sleep: async () => {}, persistHealth: true,
  fetchFn: ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    slowLocalUrls.push(String(input))
    if (!String(input).startsWith(slowLocal.baseUrl)) {
      return Promise.resolve(new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
        usage: { total_tokens: 20 },
      }), { status: 200, headers: { 'content-type': 'application/json' } }))
    }
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal
      // AbortSignal.timeout uses an unref'd timer, so keep the process alive until the expected abort.
      const hold = setTimeout(() => reject(new Error('Ideas attempt timeout did not fire')), 1_000)
      const abort = () => { clearTimeout(hold); reject(signal?.reason || new DOMException('aborted', 'AbortError')) }
      if (signal?.aborted) abort()
      else signal?.addEventListener('abort', abort, { once: true })
    })
  }) as typeof fetch,
})
assert.equal(slowLocalResult.ran, true)
assert.deepEqual(slowLocalUrls, ['https://slow-local.test/v1/chat/completions', 'https://after-local.test/v1/chat/completions'])
assert.equal(readCooldownUntil(slowLocalState, 'local'), 0, 'Ideas latency policy cannot cool Local for core triage')
assert.ok(readCooldownUntil(slowLocalState, 'ideas:local') > slowLocalAt, 'the short timeout is remembered only by Ideas')
assert.match(readIdeasHealth(slowLocalState, slowLocalRoot, true, slowLocalAt).reason || '', /Cloud fallback completed successfully/)

// A timeout at the provider's own configured deadline is still specific to the richer Ideas request. It
// must not idle core title triage/chat/themes, even when no shorter outer Ideas deadline caused it.
const providerTimeoutRoot = rootWithRows(2)
const providerTimeoutState = path.join(providerTimeoutRoot, '.state')
const providerTimeoutAt = NOW + 39 * 60_000 + 30_000
const providerTimeout = testProvider('ideas-provider-timeout', 'https://provider-timeout.test/v1', {
  label: 'Timed Ideas provider', timeoutMs: 20,
})
await runIdeaPass({
  repoRoot: providerTimeoutRoot, stateDir: providerTimeoutState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [providerTimeout], providerAttemptTimeoutMs: 1_000, providerChainTimeoutMs: 2_000 },
  refreshBoard: async () => {}, now: () => providerTimeoutAt, sleep: async () => {}, persistHealth: true,
  fetchFn: ((_input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal
    const hold = setTimeout(() => reject(new Error('provider timeout did not fire')), 1_000)
    const abort = () => { clearTimeout(hold); reject(signal?.reason || new DOMException('aborted', 'AbortError')) }
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })) as typeof fetch,
})
assert.equal(readCooldownUntil(providerTimeoutState, providerTimeout.id), 0, 'Ideas provider timeout cannot cool shared triage')
assert.ok(readCooldownUntil(providerTimeoutState, `ideas:${providerTimeout.id}`) > providerTimeoutAt)

// The same provider budget object is the atomic admission boundary for every caller. Even two accidental
// concurrent Ideas passes cannot collectively exceed a one-request overflow cap.
const raceRoot = rootWithRows(2)
const raceState = path.join(raceRoot, '.state')
const raceAt = NOW + 40 * 60_000
const raceProvider = testProvider('ideas-race', 'https://race.test/v1', { dailyReqCap: 1 })
let raceFetches = 0
const raceFetch = (async () => {
  raceFetches++
  await new Promise<void>((resolve) => setTimeout(resolve, 20))
  return new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }], usage: { total_tokens: 10 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch
const raceDeps = {
  repoRoot: raceRoot, stateDir: raceState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [raceProvider] }, refreshBoard: async () => {},
  now: () => raceAt, fetchFn: raceFetch, sleep: async () => {}, persistHealth: true,
}
const raceResults = await Promise.all([runIdeaPass(raceDeps), runIdeaPass(raceDeps)])
assert.equal(raceFetches, 1)
assert.equal(raceResults.filter((r) => r.ran).length, 1)
assert.equal(Budget.load(raceState, 1, NON_BINDING_DAILY_TOKEN_CAP, raceAt, raceProvider.budgetFile).requests, 1)

// The full sequential walk is bounded below the health stale-running threshold. Cancelling on that global
// guard is not a provider outage and therefore must not poison its shared cooldown.
const deadlineRoot = rootWithRows(2)
const deadlineState = path.join(deadlineRoot, '.state')
const deadlineAt = NOW + 42 * 60_000
const deadlineProvider = testProvider('ideas-deadline', 'https://deadline.test/v1')
const deadline = await runIdeaPass({
  repoRoot: deadlineRoot, stateDir: deadlineState,
  config: { ...cfg, groqApiKey: '', overflowProviders: [deadlineProvider], providerChainTimeoutMs: 20 },
  refreshBoard: async () => {}, now: () => deadlineAt, sleep: async () => {}, persistHealth: true,
  fetchFn: ((_: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal
    // Keep one referenced test timer alive because AbortSignal.timeout deliberately uses an unref'd timer.
    const hold = setTimeout(() => reject(new Error('deadline signal did not fire')), 1_000)
    const abort = () => {
      clearTimeout(hold)
      reject(signal?.reason || new DOMException('aborted', 'AbortError'))
    }
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })) as typeof fetch,
})
assert.equal(deadline.reason_code, 'provider_error')
assert.equal(readCooldownUntil(deadlineState, 'ideas-deadline'), 0)
assert.equal(readIdeasHealth(deadlineState, deadlineRoot, true, deadlineAt).outcome, 'failed')

const expiredHealth = readIdeasHealth(okState, okRoot, true, NOW + 60_000 + 2 * 60 * 60_000 + 1)
assert.equal(expiredHealth.reason_code, 'stale_health', 'a stopped scheduler cannot retain a perpetual healthy/waiting certificate')
const slowLoopLiveness = ideasHealthLivenessMs(3 * 60 * 60_000)
assert.equal(slowLoopLiveness, 6 * 60 * 60_000)
assert.equal(
  readIdeasHealth(okState, okRoot, true, NOW + 60_000 + 3 * 60 * 60_000, slowLoopLiveness).status,
  'waiting',
  'a configured three-hour producer cannot expire before its next pass',
)
assert.equal(
  readIdeasHealth(okState, okRoot, true, NOW + 60_000 + slowLoopLiveness + 1, slowLoopLiveness).reason_code,
  'stale_health',
)

const disabled = readIdeasHealth(okState, okRoot, false, NOW)
assert.equal(disabled.status, 'disabled')
assert.equal(disabled.enabled, false)
updateIdeasHealth(okState, {
  enabled: false, status: 'disabled', outcome: 'not_run', reason_code: 'disabled', reason: 'kill switch',
}, NOW)
const reenabled = readIdeasHealth(okState, okRoot, true, NOW + 1)
assert.equal(reenabled.enabled, true)
assert.equal(reenabled.status, 'waiting', 'removing the kill switch cannot leave a contradictory persisted disabled state')

const staleRoot = rootWithRows(0)
const staleState = path.join(staleRoot, '.state')
updateIdeasHealth(staleState, {
  enabled: true, status: 'running', outcome: 'not_run', reason_code: null, reason: 'running',
  last_attempt_at: new Date(NOW - 180_000).toISOString(), last_success_at: null, next_eligible_at: null,
  input_count: 2, produced_count: 0,
}, NOW - 180_000)
const stale = readIdeasHealth(staleState, staleRoot, true, NOW)
assert.equal(stale.status, 'error')
assert.equal(stale.reason_code, 'stale_running')

const corruptState = path.join(staleRoot, '.corrupt-state')
fs.mkdirSync(corruptState, { recursive: true })
fs.writeFileSync(path.join(corruptState, 'ideas-health.json'), JSON.stringify({
  schema_version: 'ideas-health/v1', enabled: true, status: 'healthy', outcome: 'success_empty',
  reason_code: null, reason: null, updated_at: new Date(NOW).toISOString(), last_attempt_at: null,
  last_success_at: 'not-a-date', next_eligible_at: null, input_count: 2, produced_count: 0,
  live_count: 0, stale_count: 0,
}))
assert.equal(readPersistedIdeasHealth(corruptState), null, 'corrupt optional timestamps cannot masquerade as healthy runtime state')
assert.equal(inspectPersistedIdeasHealth(corruptState).status, 'corrupt')
assert.equal(readIdeasHealth(corruptState, staleRoot, true, NOW).reason_code, 'health_corrupt', 'corrupt health differs from a never-run/missing health file')

const staleSweepRoot = rootWithRows(2, '2026-08-01T20:00:00Z', '2026-08-01T20:00:00Z')
const staleSweepState = path.join(staleSweepRoot, '.state')
let staleFetches = 0
const staleResult = await runIdeaPass({
  repoRoot: staleSweepRoot, stateDir: staleSweepState, config: cfg, refreshBoard: async () => {}, now: () => NOW,
  fetchFn: (async () => { staleFetches++; throw new Error('must not call') }) as typeof fetch, persistHealth: true,
})
assert.equal(staleResult.reason_code, 'stale_inputs')
assert.equal(staleFetches, 0, 'an old sweep cannot be re-dated into a fresh lead')

const staleRowsRoot = rootWithRows(2, '2026-08-01T20:00:00Z', '2026-08-03T11:00:00Z')
const staleRowsState = path.join(staleRowsRoot, '.state')
const staleRows = await runIdeaPass({ repoRoot: staleRowsRoot, stateDir: staleRowsState, config: cfg, refreshBoard: async () => {}, now: () => NOW, persistHealth: true })
assert.equal(staleRows.reason_code, 'stale_inputs', 'a fresh sweep wrapper cannot launder old found_at timestamps')

// A readable adjacent partition can still preserve a human veto when its wrapper/action clock is bad.
// That local integrity defect must fail closed for the matching story without pausing the complete current
// wire: after filtering the alias, two unrelated rows remain and production should spend exactly one call.
const localVetoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-health-local-veto-'))
const localVetoState = path.join(localVetoRoot, '.state')
const localVetoInbox = path.join(localVetoRoot, 'screener', 'inbox')
const localVetoAt = Date.parse('2026-08-04T06:05:00Z')
fs.mkdirSync(localVetoInbox, { recursive: true })
fs.writeFileSync(path.join(localVetoInbox, '2026-08-03_sweep.json'), JSON.stringify({
  updated_at: 'not-a-clock',
  rows: [{
    headline: 'Regulator approves Acme product', url: 'https://news.test/acme-approval',
    dedup_group: 'STORY-acme-approval', found_at: '2026-08-03T23:58:00Z', triage_score: 90,
    consumed: true, consumed_at: 'not-a-clock',
  }],
}))
fs.writeFileSync(path.join(localVetoInbox, '2026-08-04_sweep.json'), JSON.stringify({
  updated_at: '2026-08-04T06:04:30Z',
  rows: [
    {
      headline: 'Regulator withdraws Acme product approval', url: 'https://copy.test/acme-approval',
      dedup_group: 'STORY-acme-approval', found_at: '2026-08-04T06:04:00Z', triage_score: 100,
    },
    {
      headline: 'Bravo files a material exchange update', url: 'https://exchange.test/bravo',
      found_at: '2026-08-04T06:03:00Z', triage_score: 92,
    },
    {
      headline: 'Charlie wins a material customer contract', url: 'https://exchange.test/charlie',
      found_at: '2026-08-04T06:02:00Z', triage_score: 91,
    },
  ],
}))
let localVetoFetches = 0
let localVetoRequestBody = ''
const localVetoPass = await runIdeaPass({
  repoRoot: localVetoRoot, stateDir: localVetoState,
  // 36h deliberately puts the malformed prior-day file inside the positive-candidate partition scan.
  // Because that readable file contains only human-state rows, it must remain a local veto warning and
  // cannot pause the two unrelated current leads.
  config: { ...cfg, inputMaxAgeHrs: 36 }, refreshBoard: async () => {}, now: () => localVetoAt,
  fetchFn: (async (_input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    localVetoFetches++
    localVetoRequestBody = String(init?.body || '')
    return new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ideas: [] }) } }],
      usage: { total_tokens: 50 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch,
  sleep: async () => {}, persistHealth: true,
})
assert.equal(localVetoPass.ran, true, JSON.stringify(localVetoPass))
assert.equal(localVetoPass.produced, 0)
assert.equal(localVetoFetches, 1, 'a readable local human-state warning cannot skip the provider pass')
assert.doesNotMatch(localVetoRequestBody, /Acme product approval/, 'the invalid-clock veto remains closed for its matching story')
assert.match(localVetoRequestBody, /Bravo files a material exchange update/)
assert.match(localVetoRequestBody, /Charlie wins a material customer contract/)
const localVetoHealth = readIdeasHealth(localVetoState, localVetoRoot, true, localVetoAt)
assert.equal(localVetoHealth.status, 'healthy')
assert.equal(localVetoHealth.outcome, 'success_empty')
assert.equal(localVetoHealth.input_count, 2, 'only the two unrelated current rows reach the provider')

const degradedRoot = rootWithRows(2)
const degradedState = path.join(degradedRoot, '.state')
fs.writeFileSync(path.join(degradedRoot, 'screener', 'inbox', '2026-08-02_sweep.json'), '{')
const themeLead = validIdeaSnapshot('THEMEKEEP', 'long', {
  origin_type: 'theme',
  source_themes: [{
    theme_id: 'THM-a1b2c3d4', theme_rev: 1,
    evidence_event_ids: validIdeaSnapshot('THEMEKEEP').source_event_ids,
    why_now_event_id: validIdeaSnapshot('THEMEKEEP').source_event_ids[0],
  }],
  decay_at: '2026-08-04T17:00:00Z',
})
const degradedIdeasDir = path.join(degradedRoot, 'screener', 'ledger', 'ideas')
fs.mkdirSync(degradedIdeasDir, { recursive: true })
fs.writeFileSync(path.join(degradedIdeasDir, `${themeLead.idea_id}.json`), JSON.stringify(themeLead))
let degradedRefreshes = 0
const degradedPass = await runIdeaPass({
  repoRoot: degradedRoot, stateDir: degradedState, config: cfg,
  refreshBoard: async () => { degradedRefreshes++ }, now: () => NOW, persistHealth: true,
})
assert.equal(degradedPass.reason_code, 'stale_inputs')
assert.equal(degradedRefreshes, 0)
assert.ok(fs.existsSync(path.join(degradedIdeasDir, `${themeLead.idea_id}.json`)), 'an incomplete degraded source set cannot retire a valid live Theme idea')

const brokenStoreRoot = rootWithRows(0)
const brokenStoreState = path.join(brokenStoreRoot, '.state')
const ideasDir = path.join(brokenStoreRoot, 'screener', 'ledger', 'ideas')
fs.mkdirSync(ideasDir, { recursive: true })
fs.writeFileSync(path.join(ideasDir, 'broken.json'), '{')
updateIdeasHealth(brokenStoreState, {
  enabled: true, status: 'healthy', outcome: 'success_empty', reason_code: null, reason: 'ok',
  last_attempt_at: new Date(NOW).toISOString(), last_success_at: new Date(NOW).toISOString(), produced_count: 0,
}, NOW)
const brokenStore = readIdeasHealth(brokenStoreState, brokenStoreRoot, true, NOW)
assert.equal(brokenStore.status, 'degraded')
assert.equal(brokenStore.reason_code, 'snapshot_store_error')
assert.equal(brokenStore.snapshot_store.corrupt_count, 1)

const invalidStoreRoot = rootWithRows(0)
const invalidStoreState = path.join(invalidStoreRoot, '.state')
const invalidIdeasDir = path.join(invalidStoreRoot, 'screener', 'ledger', 'ideas')
fs.mkdirSync(invalidIdeasDir, { recursive: true })
const invalidId = ideaId('INVALID', 'long')
fs.writeFileSync(path.join(invalidIdeasDir, `${invalidId}.json`), JSON.stringify(validIdeaSnapshot('INVALID', 'long', { trade_score: 101 })))
updateIdeasHealth(invalidStoreState, {
  enabled: true, status: 'healthy', outcome: 'success_empty', reason_code: null, reason: 'ok',
  last_attempt_at: new Date(NOW).toISOString(), last_success_at: new Date(NOW).toISOString(), produced_count: 0,
}, NOW)
const invalidStore = readIdeasHealth(invalidStoreState, invalidStoreRoot, true, NOW)
assert.equal(invalidStore.status, 'degraded')
assert.equal(invalidStore.reason_code, 'snapshot_store_error')
assert.equal(invalidStore.live_count, 0, 'invalid persisted leads never become live')
assert.equal(invalidStore.snapshot_store.invalid_count, 1)
updateIdeasHealth(invalidStoreState, {
  enabled: true, status: 'healthy', outcome: 'success_with_ideas', reason_code: null, reason: 'persisted one',
  last_attempt_at: new Date(NOW).toISOString(), last_success_at: new Date(NOW).toISOString(), produced_count: 1,
}, NOW)
const invalidProduced = readIdeasHealth(invalidStoreState, invalidStoreRoot, true, NOW)
assert.equal(invalidProduced.status, 'error')
assert.equal(invalidProduced.outcome, 'failed', 'a corrupt sole snapshot cannot remain success_with_ideas')
assert.equal(invalidProduced.produced_count, 0)

const missingProducedRoot = rootWithRows(0)
const missingProducedState = path.join(missingProducedRoot, '.state')
updateIdeasHealth(missingProducedState, {
  enabled: true, status: 'healthy', outcome: 'success_with_ideas', reason_code: null, reason: 'persisted one',
  last_attempt_at: new Date(NOW).toISOString(), last_success_at: new Date(NOW).toISOString(), produced_count: 1,
}, NOW)
const missingProduced = readIdeasHealth(missingProducedState, missingProducedRoot, true, NOW)
assert.equal(missingProduced.status, 'error')
assert.equal(missingProduced.outcome, 'failed')
assert.equal(missingProduced.reason_code, 'snapshot_store_error', 'success_with_ideas must reconcile to an actually projectable snapshot')

for (const root of [thin, noKeyRoot, okRoot, coverageRoot, failedRoot, crashRoot, fallbackRoot, fairRoot, aggregateRouteRoot, geminiRoot, geminiFallbackRoot, geminiLimiterRoot, pacedRoot, transientRoot, retryRoot, adapterGuardRoot, contractRoot, requestRoot, requestRetryRoot, cappedRoot, localRoot, slowLocalRoot, raceRoot, deadlineRoot, staleRoot, staleSweepRoot, staleRowsRoot, localVetoRoot, brokenStoreRoot, invalidStoreRoot, missingProducedRoot]) fs.rmSync(root, { recursive: true, force: true })
console.log('\n1 ideas-health test file passed')
