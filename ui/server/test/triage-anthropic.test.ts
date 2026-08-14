// The metered Anthropic-Haiku last-resort triage tier (news/triage/anthropic.ts). It is the ONLY paid
// brain, so it must be fail-soft in exactly the same way the free brains are: on any non-2xx / truncation /
// non-JSON / missing-key it returns ok:false so the caller DEFERS the batch (never scores it zero), it
// reports the metered spend it made (costUsd) from the usage block, and it coerces model rows through the
// shared coerceTriage so downstream can't tell which brain scored a batch. This proves all of that, plus
// the off-by-default config invariant (§28 / the "spends no Claude money by default" guarantee).
// Run: npx tsx test/triage-anthropic.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { triageBatchAnthropic } from '../src/news/triage/anthropic'
import type { NewsItem } from '../src/news/types'
import { NEWS } from '../src/config'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const items = [
  { headline: 'Acme cuts FY guidance 20%', source_name: 'NSE', region: 'IN' },
  { headline: 'Local weather stays mild', source_name: 'Blog', region: 'US' },
] as unknown as NewsItem[]

const noSleep = async () => {}

/** Minimal Response-like object matching what the adapter reads. */
function mockRes(opts: { ok?: boolean; status?: number; json?: any; text?: string; retryAfter?: string; headers?: Record<string, string> }): any {
  const headers = Object.fromEntries(Object.entries(opts.headers || {}).map(([k, v]) => [k.toLowerCase(), v]))
  if (opts.retryAfter != null) headers['retry-after'] = opts.retryAfter
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    text: async () => opts.text ?? '',
    json: async () => opts.json ?? {},
  }
}

// ---- happy path: JSON items parse, byIndex coerced, costUsd computed from usage ----
await check('happy path scores every index, coerces rows, and reports metered costUsd from usage', async () => {
  const body = {
    content: [{ type: 'text', text: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 82, issuer_linkage: 'primary', why: 'FY guidance cut 20%', event_types: ['guidance_change'] },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: 3 },
    ] }) }],
    usage: { input_tokens: 1000, output_tokens: 2000 },
    stop_reason: 'end_turn',
  }
  let calls = 0
  const fetchFn = (async () => { calls++; return mockRes({ json: body }) }) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'claude-haiku-4-5', baseUrl: 'https://api.anthropic.com', apiKey: 'sk-test', inPricePerMTok: 1.0, outPricePerMTok: 5.0 }, fetchFn, noSleep)
  assert.equal(r.ok, true)
  assert.equal(calls, 1)
  assert.equal(r.byIndex.size, 2)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 82)
  assert.equal(r.byIndex.get(0)!.issuer_linkage, 'primary')
  assert.equal(r.byIndex.get(1)!.materiality_pre_score, 3)
  assert.equal(r.tokens, 3000)
  // cost = (1000 * 1.0 + 2000 * 5.0) / 1e6 = 0.011
  assert.ok(Math.abs(r.costUsd - 0.011) < 1e-9, `costUsd ${r.costUsd}`)
  assert.equal(r.costUsdKnown, true)
})

await check('a valid response without usage is scored but never represented as a known $0 call', async () => {
  const body = {
    content: [{ type: 'text', text: JSON.stringify({ items: [
      { i: 0, materiality_pre_score: 82 }, { i: 1, materiality_pre_score: 3 },
    ] }) }],
    stop_reason: 'end_turn',
  }
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
    (async () => mockRes({ json: body })) as unknown as typeof fetch, noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 1)
  assert.equal(r.costUsd, 0, 'no invented exact cost is reported')
  assert.equal(r.costUsdKnown, false, 'the caller must retain its conservative pre-call reservation')
})

await check('a valid nonempty response with zero-total usage retains the conservative cost bound', async () => {
  const body = {
    content: [{ type: 'text', text: JSON.stringify({ items: [
      { i: 0, materiality_pre_score: 82 }, { i: 1, materiality_pre_score: 3 },
    ] }) }],
    usage: { input_tokens: 0, output_tokens: 0 },
    stop_reason: 'end_turn',
  }
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
    (async () => mockRes({ json: body })) as unknown as typeof fetch, noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 1)
  assert.equal(r.costUsd, 0, 'unusable telemetry does not invent an exact charge')
  assert.equal(r.costUsdKnown, false, 'zero-total telemetry cannot prove a dispatched request was free')
})

// ---- prose-wrapped JSON still parses (no JSON mode on the Messages API) ----
await check('parses JSON even when the model wraps it in prose (braceSlice fallback)', async () => {
  const body = {
    content: [{ type: 'text', text: 'Here you go:\n{"items":[{"i":0,"materiality_pre_score":55},{"i":1,"materiality_pre_score":0}]}\nThanks!' }],
    usage: { input_tokens: 100, output_tokens: 50 },
    stop_reason: 'end_turn',
  }
  const fetchFn = (async () => mockRes({ json: body })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k' }, fetchFn, noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 55)
})

await check('empty, partial, duplicate, and out-of-range coverage is a contract failure, never a partial score', async () => {
  const cases = [
    { label: 'empty', rows: [] },
    { label: 'partial', rows: [{ i: 0, materiality_pre_score: 82 }] },
    { label: 'duplicate', rows: [{ i: 0, materiality_pre_score: 82 }, { i: 0, materiality_pre_score: 0 }] },
    { label: 'out-of-range', rows: [{ i: 0, materiality_pre_score: 82 }, { i: 2, materiality_pre_score: 0 }] },
  ]
  for (const c of cases) {
    const body = {
      content: [{ type: 'text', text: JSON.stringify({ items: c.rows }) }],
      usage: { input_tokens: 100, output_tokens: 50 }, stop_reason: 'end_turn',
    }
    const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
      (async () => mockRes({ json: body })) as unknown as typeof fetch, noSleep)
    assert.equal(r.ok, false, `${c.label} coverage cannot be a scored success`)
    assert.equal(r.failureKind, 'contract')
    assert.equal(r.byIndex.size, 0, 'no partial rows escape downstream')
  }
})

await check('503 Retry-After is preserved exactly for the outer Anthropic retry policy', async () => {
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
    (async () => mockRes({ ok: false, status: 503, text: 'private account detail', retryAfter: '17' })) as unknown as typeof fetch, noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.rate?.retryAfterMs, 17_000)
  assert.equal(r.failureKind, 'availability')
  assert.equal(r.httpStatus, 503)
  assert.equal(r.dailyLimit, undefined)
  assert.equal(r.note, 'anthropic HTTP 503 — service unavailable')
  assert.doesNotMatch(r.note || '', /private account detail/)
})

// ---- no key → ok:false, no network call (never scores zero, and never accidentally bills) ----
await check('missing key returns ok:false without calling fetch', async () => {
  let calls = 0
  const fetchFn = (async () => { calls++; return mockRes({}) }) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: '' }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(calls, 0)
  assert.equal(r.costUsd, 0)
  assert.match(r.note || '', /NEWS_ANTHROPIC_FALLBACK_API_KEY/)
})

// ---- 429 → ok:false (defer), retried up to maxAttempts, terminal note carries the status ----
await check('429 defers the batch (ok:false) after retrying, honouring retry-after', async () => {
  let calls = 0
  const fetchFn = (async () => { calls++; return mockRes({ ok: false, status: 429, text: 'private account detail', retryAfter: '1500' }) }) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2 }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(calls, 2) // one retry
  assert.equal(r.byIndex.size, 0) // nothing scored → caller defers, never scores zero
  assert.equal(r.failureKind, 'rate_limit')
  assert.equal(r.httpStatus, 429)
  assert.equal(r.dailyLimit, undefined, 'a generic Anthropic 429 is not proof the whole provider day is spent')
  assert.equal(r.rate?.retryAfterMs, 1_500_000, 'the provider-supplied 25-minute reopening clock survives both attempts')
  assert.equal(r.note, 'anthropic HTTP 429 — rate limited')
  assert.doesNotMatch(r.note || '', /private account detail/)
})

await check('an explicit requests-day zero is typed as daily exhaustion and is never retried', async () => {
  let calls = 0
  const fetchFn = (async () => {
    calls++
    return mockRes({
      ok: false, status: 429, text: 'private quota detail', retryAfter: '1500',
      headers: { 'x-ratelimit-remaining-requests-day': '0' },
    })
  }) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2 }, fetchFn, noSleep)
  assert.equal(calls, 1, 'a spent day cannot recover from an immediate in-call retry')
  assert.equal(r.failureKind, 'rate_limit')
  assert.equal(r.httpStatus, 429)
  assert.equal(r.dailyLimit, true)
  assert.equal(r.rate?.retryAfterMs, 1_500_000)
  assert.equal(r.note, 'anthropic HTTP 429 — daily quota reached')
})

await check('an already-aborted parent starts no paid request and performs no retry sleep', async () => {
  const controller = new AbortController()
  controller.abort(new DOMException('cycle ended', 'AbortError'))
  let calls = 0
  let sleeps = 0
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2, signal: controller.signal },
    (async () => { calls++; throw new Error('fetch must not run') }) as unknown as typeof fetch,
    async () => { sleeps++ })
  assert.equal(r.ok, false)
  assert.equal(r.requests, 0)
  assert.equal(r.costUsdKnown, true, 'pre-dispatch cancellation proves exact zero spend')
  assert.equal(calls, 0)
  assert.equal(sleeps, 0)
  assert.equal(r.timedOut, true)
  assert.match(r.note || '', /cycle aborted/)
})

await check('an in-flight parent abort stops immediately and counts the fetch exactly once', async () => {
  const controller = new AbortController()
  let calls = 0
  let sleeps = 0
  let entered!: () => void
  const fetchEntered = new Promise<void>((resolve) => { entered = resolve })
  const fetchFn = (async (_input: any, init?: RequestInit) => {
    calls++
    entered()
    const signal = init?.signal as AbortSignal
    return await new Promise((_resolve, reject) => {
      if (signal.aborted) return reject(signal.reason)
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    })
  }) as unknown as typeof fetch
  const pending = triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2, signal: controller.signal }, fetchFn, async () => { sleeps++ })
  await fetchEntered
  controller.abort(new DOMException('cycle ended', 'AbortError'))
  const r = await pending
  assert.equal(r.ok, false)
  assert.equal(r.requests, 1, 'one fetch invocation is one request, not the old catch-side double count')
  assert.equal(calls, 1, 'the aborted request is never retried')
  assert.equal(sleeps, 0, 'parent cancellation never pays retry backoff')
  assert.equal(r.timedOut, true)
  assert.equal(r.costUsdKnown, false, 'in-flight cancellation cannot prove provider cost')
})

await check('thrown network attempts are counted once each', async () => {
  let calls = 0
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2 },
    (async () => { calls++; throw new Error('socket closed') }) as unknown as typeof fetch, noSleep)
  assert.equal(r.ok, false)
  assert.equal(calls, 2)
  assert.equal(r.requests, 2, 'two fetch attempts must not be reported as four requests')
  assert.equal(r.failureKind, 'availability')
  assert.equal(r.timedOut, undefined)
  assert.equal(r.costUsdKnown, false, 'a dispatched network-uncertain request is not a known $0 call')
})

await check('an attempt timeout is typed availability but marked workload-local', async () => {
  const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' })
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
    (async () => { throw timeout }) as unknown as typeof fetch, noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.failureKind, 'availability')
  assert.equal(r.timedOut, true)
})

// ---- a max_tokens truncation is deterministic → ok:false, not a half-parsed batch ----
await check('output truncated at max_tokens returns ok:false (deterministic, do not half-parse)', async () => {
  const body = { content: [{ type: 'text', text: '{"items":[{"i":0,' }], usage: { input_tokens: 100, output_tokens: 2400 }, stop_reason: 'max_tokens' }
  const fetchFn = (async () => mockRes({ json: body })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k' }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.byIndex.size, 0)
  assert.equal(r.failureKind, 'contract')
  assert.match(r.note || '', /truncated at max_tokens/)
})

// Access failures are provider-wide routing evidence, while other 4xx responses are request-shape failures.
// Both preserve an explicit Retry-After; runCycle decides the persisted cooldown scope from these fields.
await check('401 access failure and 400 request failure retain typed status and exact Retry-After', async () => {
  const fetchFn = (async () => mockRes({ ok: false, status: 401, text: 'private invalid-key detail', retryAfter: '7' })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'bad', maxAttempts: 1 }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.failureKind, 'request')
  assert.equal(r.httpStatus, 401)
  assert.equal(r.rate?.retryAfterMs, 7_000)
  assert.equal(r.dailyLimit, undefined)
  assert.equal(r.note, 'anthropic HTTP 401 — authentication rejected')
  assert.doesNotMatch(r.note || '', /private invalid-key detail/)

  const request = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 1 },
    (async () => mockRes({ ok: false, status: 400, text: 'private malformed-request detail', retryAfter: '11' })) as unknown as typeof fetch, noSleep)
  assert.equal(request.failureKind, 'request')
  assert.equal(request.httpStatus, 400)
  assert.equal(request.rate?.retryAfterMs, 11_000)
  assert.equal(request.dailyLimit, undefined)
  assert.equal(request.note, 'anthropic HTTP 400 — request rejected')
})

// ---- defaults: the tier is ON, on the SUBSCRIPTION backend (no key), bounded by a $50/day ceiling. The
// metered `api` path this file tests is opt-in and must never arm itself off a stray ANTHROPIC_API_KEY. ----
await check('config defaults: tier ON, subscription backend, no API key needed, $50/day ceiling', () => {
  assert.equal(NEWS.anthropicFallbackEnabled, true)
  assert.equal(NEWS.anthropicFallbackMode, 'subscription')
  assert.equal(NEWS.anthropicApiKey, '') // api mode is opt-in — never defaults to ANTHROPIC_API_KEY/themes key
  assert.equal(NEWS.anthropicDailyUsd, 50) // raised 5 → 50 (2026-07-21): $5 stopped the last-resort after ~a dozen batches on Groq-outage days
  // this metered backend addresses the model by its Messages-API id; the SUBSCRIPTION backend uses the CLI
  // alias ('haiku') instead — conflating the two silently ran the wrong model (see triage-claude-cli.test.ts)
  assert.equal(NEWS.anthropicApiModel, 'claude-haiku-4-5')
})

console.log(`\n${passed} checks passed`)
