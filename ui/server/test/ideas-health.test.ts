process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ideasHealthLivenessMs, initializeIdeasHealth, inspectPersistedIdeasHealth, readIdeasHealth, readPersistedIdeasHealth, updateIdeasHealth } from '../src/news/ideas/ideas-health'
import { runIdeaPass, type IdeaPassConfig } from '../src/news/ideas/run-idea-pass'
import { ideaId, readTopSweep, topNHash, writePassState } from '../src/news/ideas/ideas-store'
import { validIdeaSnapshot } from './ideas-fixture'

const NOW = Date.parse('2026-08-03T12:00:00Z')
const cfg: IdeaPassConfig = {
  topN: 12, shelfLifeHrs: 36, inputMaxAgeHrs: 36, minIntervalSec: 900, refreshSec: 3600,
  groqApiKey: 'test-key', groqBaseUrl: 'https://example.test/v1', groqModel: 'test-model', groqMaxTokens: 500,
  groqDailyReqCap: 100, groqDailyTokenCap: 1_000_000, groqDailyTokenTarget: 1_000_000,
  groqPaceFloorFrac: 1, groqRpm: 28, groqTpm: 1_000_000,
  llmCooldownMs: 1_000, llmCooldownMaxMs: 10_000, limiterWaitMs: 0,
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
assert.equal(failedFetches, 2, 'the provider made its bounded attempts only on the first pass')
const healthy = readIdeasHealth(okState, okRoot, true, NOW)
assert.equal(healthy.status, 'healthy')
assert.equal(healthy.outcome, 'success_empty', 'a valid empty provider response is success, not a failure or a qualified rejection')
assert.ok(healthy.last_attempt_at)
assert.ok(healthy.last_success_at)

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

for (const root of [thin, noKeyRoot, okRoot, failedRoot, crashRoot, staleRoot, staleSweepRoot, staleRowsRoot, brokenStoreRoot, invalidStoreRoot, missingProducedRoot]) fs.rmSync(root, { recursive: true, force: true })
console.log('\n1 ideas-health test file passed')
