process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ideasHealthLivenessMs, initializeIdeasHealth, inspectPersistedIdeasHealth, readIdeasHealth, readPersistedIdeasHealth, updateIdeasHealth } from '../src/news/ideas/ideas-health'
import { callGroqForIdeaPass, ideaGroqTokenBound, runIdeaPass, type IdeaPassConfig } from '../src/news/ideas/run-idea-pass'
import { ideaId, readTopSweep, topNHash, writePassState } from '../src/news/ideas/ideas-store'
import { Budget, NON_BINDING_DAILY_TOKEN_CAP, readCooldownUntil } from '../src/news/triage/budget'
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
assert.equal(failedFetches, 1, 'the operational chain probes a provider once, then waits for the next eligible pass')
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
  sleep: async () => { throw new Error('retry helper failed') },
})
assert.equal(adapterGuard?.ok, false)
assert.equal(adapterGuard?.failureKind, 'contract')
assert.match(adapterGuard?.note || '', /unexpected adapter failure/)
assert.equal(readCooldownUntil(adapterGuardState, 'groq'), 0, 'an internal Ideas adapter bug cannot cool shared Groq')
assert.ok(readCooldownUntil(adapterGuardState, 'ideas:groq') > adapterGuardAt)
assert.equal(
  Budget.load(adapterGuardState, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, adapterGuardAt, 'groq-budget.json').tokens,
  ideaGroqTokenBound(adapterGuardRows, cfg.groqMaxTokens),
  'an escaped adapter failure is charged at one full conservative attempt',
)

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

for (const root of [thin, noKeyRoot, okRoot, failedRoot, crashRoot, fallbackRoot, transientRoot, adapterGuardRoot, contractRoot, requestRoot, cappedRoot, localRoot, slowLocalRoot, raceRoot, deadlineRoot, staleRoot, staleSweepRoot, staleRowsRoot, localVetoRoot, brokenStoreRoot, invalidStoreRoot, missingProducedRoot]) fs.rmSync(root, { recursive: true, force: true })
console.log('\n1 ideas-health test file passed')
