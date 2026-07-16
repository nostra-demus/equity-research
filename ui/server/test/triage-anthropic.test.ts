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
function mockRes(opts: { ok?: boolean; status?: number; json?: any; text?: string; retryAfter?: string }): any {
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    headers: { get: (k: string) => (k.toLowerCase() === 'retry-after' ? opts.retryAfter ?? null : null) },
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
})

// ---- prose-wrapped JSON still parses (no JSON mode on the Messages API) ----
await check('parses JSON even when the model wraps it in prose (braceSlice fallback)', async () => {
  const body = {
    content: [{ type: 'text', text: 'Here you go:\n{"items":[{"i":0,"materiality_pre_score":55}]}\nThanks!' }],
    usage: { input_tokens: 100, output_tokens: 50 },
    stop_reason: 'end_turn',
  }
  const fetchFn = (async () => mockRes({ json: body })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k' }, fetchFn, noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 55)
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
  const fetchFn = (async () => { calls++; return mockRes({ ok: false, status: 429, text: 'rate limited', retryAfter: '1' }) }) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k', maxAttempts: 2 }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(calls, 2) // one retry
  assert.equal(r.byIndex.size, 0) // nothing scored → caller defers, never scores zero
  assert.match(r.note || '', /HTTP 429/)
})

// ---- a max_tokens truncation is deterministic → ok:false, not a half-parsed batch ----
await check('output truncated at max_tokens returns ok:false (deterministic, do not half-parse)', async () => {
  const body = { content: [{ type: 'text', text: '{"items":[{"i":0,' }], usage: { input_tokens: 100, output_tokens: 2400 }, stop_reason: 'max_tokens' }
  const fetchFn = (async () => mockRes({ json: body })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'k' }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.equal(r.byIndex.size, 0)
  assert.match(r.note || '', /truncated at max_tokens/)
})

// ---- a terminal 4xx (bad key / no credits) carries an HTTP 4xx note so the caller can exhaust the day ----
await check('terminal 401 returns a note the caller matches to exhaust the daily budget', async () => {
  const fetchFn = (async () => mockRes({ ok: false, status: 401, text: 'invalid x-api-key' })) as unknown as typeof fetch
  const r = await triageBatchAnthropic(items, { model: 'm', baseUrl: 'b', apiKey: 'bad', maxAttempts: 1 }, fetchFn, noSleep)
  assert.equal(r.ok, false)
  assert.match(r.note || '', /HTTP 401/)
  assert.ok(/HTTP (400|401|402|403|404|413)/.test(r.note || ''), 'note must match the runCycle 4xx-exhaust regex')
})

// ---- defaults: the tier is ON, on the SUBSCRIPTION backend (no key), bounded by a $5/day ceiling. The
// metered `api` path this file tests is opt-in and must never arm itself off a stray ANTHROPIC_API_KEY. ----
await check('config defaults: tier ON, subscription backend, no API key needed, $5/day ceiling', () => {
  assert.equal(NEWS.anthropicFallbackEnabled, true)
  assert.equal(NEWS.anthropicFallbackMode, 'subscription')
  assert.equal(NEWS.anthropicApiKey, '') // api mode is opt-in — never defaults to ANTHROPIC_API_KEY/themes key
  assert.equal(NEWS.anthropicDailyUsd, 5)
  assert.equal(NEWS.anthropicModel, 'claude-haiku-4-5')
})

console.log(`\n${passed} checks passed`)
