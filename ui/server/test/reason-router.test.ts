// Shared-provider discipline for the free-text feedback reason router. No real network.
// Run: npx tsx test/reason-router.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.GROQ_API_KEY = 'test-key'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const { routeReason } = await import('../src/news/triage/reason-router')
const {
  Budget,
  armCooldown,
  getSharedLimiter,
  readCooldownUntil,
  resetBudgetMemory,
  resetCooldownMemory,
  resetSharedLimiters,
} = await import('../src/news/triage/budget')

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error: any) {
    console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`)
    process.exitCode = 1
  }
}

const AT = Date.parse('2026-08-13T12:00:00Z')
const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'reason-router-'))
const config = {
  groqApiKey: 'key',
  groqBaseUrl: 'https://groq.test',
  groqModel: 'model',
  groqRpm: 1_000_000,
  groqTpm: 1_000_000_000,
  groqDailyReqCap: 100,
  groqDailyTokenCap: 1_000_000,
  groqDailyTokenTarget: 1_000_000,
  groqPaceFloorFrac: 1,
  llmCooldownMs: 5_000,
  llmCooldownMaxMs: 60_000,
}
const opts = (stateDir: string, over: Record<string, unknown> = {}) => ({
  stateDir,
  now: () => AT,
  config: { ...config, ...over },
})
const success = (scope = 'macro', confidence = 0.9, tokens = 33) => new Response(JSON.stringify({
  choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ scope, confidence }) } }],
  usage: { total_tokens: tokens },
}), { status: 200, headers: { 'content-type': 'application/json' } })

function reset(): void {
  resetBudgetMemory()
  resetCooldownMemory()
  resetSharedLimiters()
}

await check('replica gate returns the keyword route without budget, limiter, health, or provider activity', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const out = await routeReason('the central bank raised rates', (async () => { calls++; return success() }) as typeof fetch, {
    ...opts(stateDir),
    providerSpendingAllowed: false,
  })
  assert.equal(out.via, 'keyword')
  assert.equal(calls, 0)
  assert.equal(fs.existsSync(path.join(stateDir, 'groq-budget.json')), false)
  assert.equal(readCooldownUntil(stateDir, 'groq'), 0)
  assert.equal(readCooldownUntil(stateDir, 'reason-router:groq'), 0)
})

await check('hard daily request cap returns the keyword route without a provider call', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const out = await routeReason('the central bank raised rates', (async () => { calls++; return success() }) as typeof fetch, opts(stateDir, { groqDailyReqCap: 0 }))
  assert.equal(out.via, 'keyword')
  assert.equal(calls, 0)
})

await check('reset-clock pacing releases one complete call, then preserves the later allowance', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const midnight = Date.parse('2026-08-13T00:00:00Z')
  const routeOpts = {
    ...opts(stateDir, { groqDailyTokenTarget: 100_000, groqPaceFloorFrac: 0 }),
    now: () => midnight,
  }
  const fetchFn = (async () => { calls++; return success() }) as typeof fetch
  const first = await routeReason('the central bank raised rates', fetchFn, routeOpts)
  const paced = await routeReason('inflation is still too high', fetchFn, routeOpts)
  assert.equal(first.via, 'llm', 'one indivisible call is released at the reset boundary')
  assert.equal(paced.via, 'keyword', 'the next call waits for the cumulative reset-clock allowance')
  assert.equal(calls, 1)
  const budget = Budget.load(stateDir, 100, 1_000_000, midnight, 'groq-budget.json')
  assert.equal(budget.requests, 1)
  assert.equal(budget.tokens, 33)
})

await check('400 Retry-After is exact, router-scoped, and prevents a repeated probe', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const rejected = (async () => {
    calls++
    return new Response('sensitive upstream body', { status: 400, headers: { 'retry-after': '7' } })
  }) as typeof fetch
  const first = await routeReason('this company item is noise', rejected, opts(stateDir))
  assert.equal(first.via, 'keyword')
  assert.equal(readCooldownUntil(stateDir, 'reason-router:groq'), AT + 7_000)
  assert.equal(readCooldownUntil(stateDir, 'groq'), 0)
  assert.equal(
    await getSharedLimiter(config.groqRpm, config.groqTpm).acquire(1, async () => {}, () => AT, 10),
    true,
    'a request-scoped Retry-After must not leak into the shared provider limiter',
  )
  await routeReason('a second company item is noise', rejected, opts(stateDir))
  assert.equal(calls, 1)
})

await check('sub-second and zero Retry-After values remain exact', async () => {
  reset()
  const stateDir = dir()
  await routeReason('some vague note', (async () => new Response('', {
    status: 503, headers: { 'retry-after': '0.25' },
  })) as typeof fetch, opts(stateDir))
  assert.equal(readCooldownUntil(stateDir, 'groq'), AT + 250)

  reset()
  const zeroDir = dir()
  await routeReason('some vague note', (async () => new Response('', {
    status: 503, headers: { 'retry-after': '0' },
  })) as typeof fetch, opts(zeroDir))
  assert.equal(readCooldownUntil(zeroDir, 'groq'), 0, 'retry-now must not become a generic five-minute hold')
})

await check('503 Retry-After is exact and shared, without reading or surfacing its body', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const outage = (async () => {
    calls++
    return new Response('secret account and balance', { status: 503, headers: { 'retry-after': '9' } })
  }) as typeof fetch
  const first = await routeReason('some vague note', outage, opts(stateDir))
  assert.equal(first.via, 'keyword')
  assert.doesNotMatch(JSON.stringify(first), /secret|account|balance/)
  assert.equal(readCooldownUntil(stateDir, 'groq'), AT + 9_000)
  assert.equal(readCooldownUntil(stateDir, 'reason-router:groq'), 0)
  await routeReason('another vague note', outage, opts(stateDir))
  assert.equal(calls, 1)
})

await check('access and network failures are shared; malformed/timeout failures remain scoped', async () => {
  for (const scenario of ['access', 'network', 'contract', 'timeout'] as const) {
    reset()
    const stateDir = dir()
    const fetchFn = (async () => {
      if (scenario === 'access') return new Response('private', { status: 401 })
      if (scenario === 'network') throw new Error('sensitive DNS detail')
      if (scenario === 'timeout') throw new DOMException('internal timeout', 'AbortError')
      return new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: 'not-json-sensitive' } }], usage: { total_tokens: 10 },
      }), { status: 200 })
    }) as typeof fetch
    const out = await routeReason('some vague note', fetchFn, opts(stateDir))
    assert.equal(out.via, 'keyword')
    const shared = readCooldownUntil(stateDir, 'groq')
    const scoped = readCooldownUntil(stateDir, 'reason-router:groq')
    if (scenario === 'access') {
      assert.equal(shared, 0, 'terminal access faults use quarantine, never a retry timer')
      assert.equal(scoped, 0)
      assert.equal(fs.existsSync(path.join(stateDir, 'provider-groq-quarantine.json')), true)
    } else if (scenario === 'network') {
      assert.ok(shared > AT, `${scenario} must hold the provider`)
      assert.equal(scoped, 0)
    } else {
      assert.equal(shared, 0)
      assert.ok(scoped > AT, `${scenario} must hold only this workload`)
    }
  }
})

await check('terminal access faults make the next route zero-call and a changed key reopens it', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const rejected = (async () => {
    calls++
    return new Response(JSON.stringify({ error: { type: 'auth_error', message: 'secret account detail' } }), { status: 401 })
  }) as typeof fetch
  await routeReason('some vague note', rejected, opts(stateDir))
  await routeReason('another vague note', rejected, opts(stateDir))
  assert.equal(calls, 1, 'the matching standing fault is rejected before limiter, budget, or fetch')
  assert.equal(readCooldownUntil(stateDir, 'groq'), 0)

  const repaired = await routeReason('the central bank raised rates', (async () => { calls++; return success() }) as typeof fetch, opts(stateDir, { groqApiKey: 'rotated-key' }))
  assert.equal(repaired.via, 'llm', 'key rotation changes the exact provider fingerprint and reopens the route')
  assert.equal(calls, 2)
})

await check('only an explicit Groq day-limit signal closes the daily ledger', async () => {
  reset()
  const stateDir = dir()
  let calls = 0
  const exhausted = (async () => {
    calls++
    return new Response('private', { status: 429, headers: { 'x-ratelimit-remaining-requests': '0', 'retry-after': '60' } })
  }) as typeof fetch
  await routeReason('some vague note', exhausted, opts(stateDir))
  const budget = Budget.load(stateDir, 100, 1_000_000, AT, 'groq-budget.json')
  assert.equal(budget.providerDayExhausted, true)
  assert.equal(budget.requests, 1)
  assert.equal(readCooldownUntil(stateDir, 'groq'), 0, 'daily exhaustion is a ledger state, not a fake retry hold')
  await routeReason('another vague note', exhausted, opts(stateDir))
  assert.equal(calls, 1)
})

await check('valid response charges actual usage and clears stale shared and scoped holds', async () => {
  reset()
  const stateDir = dir()
  armCooldown(stateDir, AT - 10_000, 1_000, 'groq', 1_000, 'availability')
  armCooldown(stateDir, AT - 10_000, 1_000, 'reason-router:groq', 1_000, 'reason-router-contract')
  const out = await routeReason('the central bank raised rates', (async () => success('macro', 0.91, 37)) as typeof fetch, opts(stateDir))
  assert.deepEqual(out, { scope: 'macro', confidence: 0.91, via: 'llm' })
  assert.equal(readCooldownUntil(stateDir, 'groq'), 0)
  assert.equal(readCooldownUntil(stateDir, 'reason-router:groq'), 0)
  const budget = Budget.load(stateDir, 100, 1_000_000, AT, 'groq-budget.json')
  assert.equal(budget.requests, 1)
  assert.equal(budget.tokens, 37)
})

await check('a provider hold armed while the shared limiter waits blocks dispatch', async () => {
  reset()
  const stateDir = dir()
  const limiter = getSharedLimiter(config.groqRpm, config.groqTpm)
  const originalAcquire = limiter.acquire.bind(limiter)
  ;(limiter as any).acquire = async () => {
    armCooldown(stateDir, AT, 60_000, 'groq', 60_000, 'availability')
    return true
  }
  let calls = 0
  try {
    const out = await routeReason('the central bank raised rates', (async () => { calls++; return success() }) as typeof fetch, opts(stateDir))
    assert.equal(out.via, 'keyword')
    assert.equal(calls, 0, 'the stale pre-limiter health snapshot cannot dispatch through a live hold')
    assert.equal(fs.existsSync(path.join(stateDir, 'groq-budget.json')), false, 'no provider reservation was charged')
  } finally {
    ;(limiter as any).acquire = originalAcquire
  }
})

await check('invalid provider token telemetry retains the conservative reservation', async () => {
  for (const reported of [-1, 1.5, '37', null] as const) {
    reset()
    const stateDir = dir()
    const response = new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ scope: 'macro', confidence: 0.91 }) } }],
      usage: { total_tokens: reported },
    }), { status: 200, headers: { 'content-type': 'application/json' } })
    const out = await routeReason('the central bank raised rates', (async () => response) as typeof fetch, opts(stateDir))
    assert.equal(out.via, 'llm')
    const budget = Budget.load(stateDir, 100, 1_000_000, AT, 'groq-budget.json')
    assert.ok(budget.tokens > 37, `${String(reported)} is not credible positive integer telemetry`)
  }
})

await check('caller abort is safe before and during I/O, with no retry hold', async () => {
  reset()
  const beforeDir = dir()
  const before = new AbortController(); before.abort()
  let beforeCalls = 0
  await routeReason('some vague note', (async () => { beforeCalls++; return success() }) as typeof fetch, { ...opts(beforeDir), signal: before.signal })
  assert.equal(beforeCalls, 0)

  reset()
  const duringDir = dir()
  const during = new AbortController()
  let duringCalls = 0
  const abortedFetch = (async () => {
    duringCalls++
    during.abort()
    throw new DOMException('caller left', 'AbortError')
  }) as typeof fetch
  const out = await routeReason('some vague note', abortedFetch, { ...opts(duringDir), signal: during.signal })
  assert.equal(out.via, 'keyword')
  assert.equal(duringCalls, 1)
  assert.equal(readCooldownUntil(duringDir, 'groq'), 0)
  assert.equal(readCooldownUntil(duringDir, 'reason-router:groq'), 0)
  const budget = Budget.load(duringDir, 100, 1_000_000, AT, 'groq-budget.json')
  assert.equal(budget.requests, 1, 'a request already handed to fetch remains conservatively charged')
  assert.ok(budget.tokens > 0)
})

// Regression: the caller's AbortSignal must reach the shared limiter as acquire()'s 5th argument, so a
// caller queued behind another in-flight acquire on the SHARED limiter cancels immediately instead of
// waiting out LIMITER_WAIT_MS on the FIFO queue node. Every other acquire() call site forwards the signal
// (runCycle.ts, chat-provider.ts); reason-router must too. Pinned to that convention, not to code behaviour.
await check('caller AbortSignal is forwarded to the shared limiter (queued-caller cancellation)', async () => {
  reset()
  const stateDir = dir()
  const limiter = getSharedLimiter(config.groqRpm, config.groqTpm)
  const originalAcquire = limiter.acquire.bind(limiter)
  let seenSignal: AbortSignal | 'MISSING' = 'MISSING'
  ;(limiter as any).acquire = (
    est: number,
    sleep: (ms: number) => Promise<void>,
    nowFn: () => number,
    maxWait?: number,
    signal?: AbortSignal,
  ) => {
    seenSignal = signal ?? 'MISSING'
    return originalAcquire(est, sleep, nowFn, maxWait, signal)
  }
  const ac = new AbortController()
  try {
    const out = await routeReason(
      'the central bank raised rates',
      (async () => success()) as typeof fetch,
      { ...opts(stateDir), signal: ac.signal },
    )
    assert.equal(out.via, 'llm')
  } finally {
    ;(limiter as any).acquire = originalAcquire
  }
  assert.equal(seenSignal, ac.signal, 'reason-router must forward opts.signal as acquire()\'s 5th argument')
})

console.log(`\nreason-router.test: ${passed} checks passed`)
