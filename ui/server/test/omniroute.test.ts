process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { buildOmniRouteProvider, buildOverflowProviders, type OverflowProvider } from '../src/config'
import { runIngestCycle } from '../src/news/runCycle'
import { armCooldown, resetBudgetMemory, resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import type { NewsItem } from '../src/news/types'

let passed = 0
let failed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (error: any) {
    failed++
    console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`)
  }
}

const AT_ISO = '2026-08-21T00:00:00Z'
const AT = Date.parse(AT_ISO)
const noSleep = async () => {}
const tmp = (prefix: string) => fs.mkdtempSync(path.join(os.tmpdir(), prefix))

function goodTriage(itemCount = 1) {
  return {
    usage: { total_tokens: 200 * itemCount },
    choices: [{
      finish_reason: 'stop',
      message: {
        content: JSON.stringify({
          items: Array.from({ length: itemCount }, (_, i) => ({
            i,
            relevance: 'material',
            materiality_pre_score: 84,
            event_materiality_label: 'high',
            event_direction: 'positive',
            event_types: ['macro_sector'],
            issuer_linkage: 'macro',
            why: 'A 50 bps policy move changes funding costs.',
            companies: [],
            size_bucket: 'unknown',
            headline_en: null,
            headline_lang: null,
            event_region: 'GLOBAL',
          })),
        }),
      },
    }],
  }
}

function backlogItem(id: string): NewsItem {
  return {
    event_id: `EVT-${id}`,
    headline: 'Central bank cuts its policy rate 50 bps in an unexpected decision',
    url: `https://reuters.com/${id}`,
    domain: 'reuters.com',
    source_name: 'Reuters',
    region: 'GLOBAL',
    input_nature: 'news_headline',
    found_at: AT_ISO,
    deferred_at: AT_ISO,
    dedup_status: 'new',
    via: 'gdelt',
  }
}

function writeBacklog(stateDir: string, id: string, count = 1): void {
  fs.mkdirSync(stateDir, { recursive: true })
  const items = Array.from({ length: count }, (_, index) => backlogItem(`${id}-${index}`))
  fs.writeFileSync(path.join(stateDir, 'news-deferred.json'), `${JSON.stringify(items)}\n`)
}

function configFor(overflowProviders: OverflowProvider[], triageBatch = 1) {
  return {
    groqApiKey: '',
    localProvider: null,
    overflowProviders,
    geminiApiKey: '',
    geminiEnabled: false,
    anthropicFallbackEnabled: false,
    rssEnabled: false,
    nseEnabled: false,
    exchangeIntlEnabled: false,
    govDataEnabled: false,
    redditEnabled: false,
    themesEnabled: false,
    retrievalEmbeddingEnabled: false,
    triageBatch,
    freeProviderPaceFloorFrac: 1,
  } as any
}

function openAiProvider(id: string, baseUrl: string, routeClass: OverflowProvider['routeClass'], patch: Partial<OverflowProvider> = {}): OverflowProvider {
  return {
    id,
    label: id,
    color: '--test',
    apiKey: 'test-key',
    baseUrl,
    model: 'test-model',
    dailyReqCap: 10,
    rpm: 60_000,
    maxTokens: 900,
    budgetFile: `${id}-budget.json`,
    routeClass,
    ...patch,
  }
}

const providerEnvKeys = [
  'NEWS_OMNIROUTE_ENABLED',
  'NEWS_OMNIROUTE_API_KEY',
  'NEWS_OMNIROUTE_BASE_URL',
  'NEWS_OMNIROUTE_MODEL',
  'NEWS_OMNIROUTE_DAILY_REQ_CAP',
  'NEWS_OMNIROUTE_RPM',
  'NEWS_OMNIROUTE_MAX_TOKENS',
  'NEWS_OMNIROUTE_TIMEOUT_MS',
  'NEWS_OMNIROUTE_MAX_ATTEMPTS',
  'NEWS_CEREBRAS_ENABLED',
  'NEWS_MISTRAL_ENABLED',
  'NEWS_OPENROUTER_ENABLED',
  'NEWS_NVIDIA_ENABLED',
  'NEWS_LOCAL_ENABLED',
] as const

function withProviderEnv<T>(patch: Partial<Record<(typeof providerEnvKeys)[number], string>>, fn: () => T): T {
  const previous = new Map<string, string | undefined>()
  for (const key of providerEnvKeys) previous.set(key, process.env[key])
  try {
    for (const key of providerEnvKeys) delete process.env[key]
    Object.assign(process.env, {
      NEWS_CEREBRAS_ENABLED: '0',
      NEWS_MISTRAL_ENABLED: '0',
      NEWS_OPENROUTER_ENABLED: '0',
      NEWS_NVIDIA_ENABLED: '0',
      NEWS_LOCAL_ENABLED: '0',
      ...patch,
    })
    return fn()
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

await check('OmniRoute stays off by default while its exported descriptor remains self-describing', () => {
  withProviderEnv({}, () => {
    assert.equal(buildOverflowProviders().some((provider) => provider.id === 'omniroute'), false)
    const descriptor = buildOmniRouteProvider()
    assert.equal(descriptor.id, 'omniroute')
    assert.equal(descriptor.routeClass, 'aggregate-fallback')
    assert.equal(descriptor.model, 'auto/coding:free', 'the zero-config default is the proven aggregate free 12-row route')
    assert.equal(descriptor.maxTokens, 7_000)
    assert.equal(descriptor.timeoutMs, 75_000)
    assert.deepEqual(descriptor.extraBody, { stream: false, reasoning_effort: 'none' })
    assert.equal(descriptor.keyEnvVar, undefined, 'a keyless daemon has no operator credential to repair')
  })
  withProviderEnv({ NEWS_OMNIROUTE_API_KEY: 'configured-secret' }, () => {
    assert.equal(buildOmniRouteProvider().keyEnvVar, 'NEWS_OMNIROUTE_API_KEY')
  })
})

await check('configured OmniRoute scores a production 12-item chat/completions POST end to end', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp('omniroute-http-root-')
  const state = path.join(root, '.state')
  const requests: Array<{ method?: string; url?: string; authorization?: string; body: any }> = []
  const server = createServer((request, response) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    request.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      requests.push({
        method: request.method,
        url: request.url,
        authorization: request.headers.authorization,
        body,
      })
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(goodTriage(12)))
    })
  })
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const address = server.address() as AddressInfo
    const baseUrl = `http://127.0.0.1:${address.port}/v1`
    const providers = withProviderEnv({
      NEWS_OMNIROUTE_ENABLED: '1',
      NEWS_OMNIROUTE_BASE_URL: baseUrl,
      NEWS_OMNIROUTE_RPM: '60000',
      NEWS_OMNIROUTE_DAILY_REQ_CAP: '100',
      NEWS_OMNIROUTE_TIMEOUT_MS: '5000',
    }, () => buildOverflowProviders())
    assert.deepEqual(providers.map((provider) => provider.id), ['omniroute'])
    assert.equal(providers[0].routeClass, 'aggregate-fallback')

    writeBacklog(state, 'http', 12)
    const summary = await runIngestCycle({
      repoRoot: root,
      stateDir: state,
      config: configFor(providers, 12),
      skipFetch: true,
      // This wrapper deliberately crosses the real loopback socket. Source fetch is skipped, so every call
      // that reaches it is provider traffic rather than a Response-shaped test double.
      fetchFn: ((input: string | URL | Request, init?: RequestInit) => fetch(input, init)) as typeof fetch,
      sleep: noSleep,
      now: () => new Date(AT),
    })

    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, 'POST')
    assert.equal(requests[0].url, '/v1/chat/completions')
    assert.equal(requests[0].body.model, 'auto/coding:free')
    assert.equal(requests[0].body.max_tokens, 7_000)
    assert.equal(requests[0].body.stream, false, 'OmniRoute must return one JSON document, not an SSE stream')
    assert.equal(requests[0].body.reasoning_effort, 'none', 'the proven route must reserve output for scorer JSON')
    assert.match(requests[0].body.messages?.[1]?.content || '', /^Score these 12 headlines:/,
      'the loopback must exercise the production 12-item request contract')
    assert.match(requests[0].authorization || '', /^Bearer /)
    assert.equal(summary.candidates, 12)
    assert.equal(summary.carryover, 12)
    assert.equal(summary.picked, 12, 'all 12 scorer indexes must survive parsing and attribution')
    assert.equal(summary.watched, 0)
    assert.equal(summary.dropped, 0)
    assert.equal(summary.overflow_requests, 1)
    assert.equal(summary.overflow_tokens, 2_400)
    assert.equal(summary.provider_attempts?.omniroute, 1)
    assert.equal(summary.provider_scored_batches?.omniroute, 1,
      'HTTP 200 only counts as scored after a non-empty, complete scorer row parses')
    assert.equal(summary.deferred ?? 0, 0)
    assert.equal(summary.backlog, 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(state, 'news-deferred.json'), 'utf8')), [])
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    fs.rmSync(root, { recursive: true, force: true })
  }
})

type DirectState = 'eligible' | 'paced' | 'capped' | 'cooling' | 'fails'

async function runDirectState(stateName: DirectState): Promise<{ directCalls: number; aggregateCalls: number; summary: Awaited<ReturnType<typeof runIngestCycle>> }> {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp(`omniroute-${stateName}-root-`)
  const stateDir = path.join(root, '.state')
  fs.mkdirSync(stateDir, { recursive: true })
  writeBacklog(stateDir, stateName)
  const direct = openAiProvider('direct', 'https://direct.test/v1', 'direct', {
    paceFloorFrac: stateName === 'paced' ? 0 : 1,
  })
  const aggregate = openAiProvider('omniroute', 'https://omniroute.test/v1', 'aggregate-fallback', {
    dailyReqCap: 100,
    paceFloorFrac: 1,
  })
  if (stateName === 'paced' || stateName === 'capped') {
    const requests = stateName === 'paced' ? 1 : direct.dailyReqCap
    fs.writeFileSync(path.join(stateDir, direct.budgetFile), JSON.stringify({ date: AT_ISO.slice(0, 10), requests, tokens: 0 }))
  }
  if (stateName === 'cooling') armCooldown(stateDir, AT, 60_000, direct.id, 60_000, 'availability')

  let directCalls = 0
  let aggregateCalls = 0
  const fetchFn = (async (input: string | URL | Request) => {
    const url = String(input)
    if (url.includes('direct.test')) {
      directCalls++
      if (stateName === 'fails') return new Response('upstream unavailable', { status: 503 })
      return new Response(JSON.stringify(goodTriage()), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('omniroute.test')) {
      aggregateCalls++
      return new Response(JSON.stringify(goodTriage()), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    throw new Error(`unexpected request: ${url}`)
  }) as typeof fetch

  try {
    const summary = await runIngestCycle({
      repoRoot: root,
      stateDir,
      config: configFor([direct, aggregate]),
      skipFetch: true,
      fetchFn,
      sleep: noSleep,
      now: () => new Date(AT),
    })
    return { directCalls, aggregateCalls, summary }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

await check('an eligible direct provider scores before OmniRoute', async () => {
  const result = await runDirectState('eligible')
  assert.equal(result.directCalls, 1)
  assert.equal(result.aggregateCalls, 0)
  assert.equal(result.summary.provider_attempts?.direct, 1)
  assert.equal(result.summary.provider_attempts?.omniroute, undefined)
  assert.equal(result.summary.picked, 1)
})

for (const stateName of ['paced', 'capped', 'cooling', 'fails'] as const) {
  await check(`a ${stateName} direct route falls through to OmniRoute in the same batch`, async () => {
    const result = await runDirectState(stateName)
    assert.equal(result.aggregateCalls, 1)
    assert.equal(result.summary.provider_attempts?.omniroute, 1)
    assert.equal(result.summary.provider_scored_batches?.omniroute, 1)
    assert.equal(result.summary.picked, 1)
    assert.equal(result.summary.deferred ?? 0, 0)
    if (stateName === 'fails') {
      assert.equal(result.directCalls, 1)
      assert.equal(result.summary.provider_attempts?.direct, 1)
    } else {
      assert.equal(result.directCalls, 0)
    }
  })
}

await check('aggregate fallback preserves the same-batch unusable-response retry cap', async () => {
  resetSharedLimiters(); resetBudgetMemory(); resetCooldownMemory()
  const root = tmp('omniroute-contract-cap-root-')
  const stateDir = path.join(root, '.state')
  writeBacklog(stateDir, 'contract-cap')
  const first = openAiProvider('direct-a', 'https://direct-a.test/v1', 'direct', { paceFloorFrac: 1 })
  const second = openAiProvider('direct-b', 'https://direct-b.test/v1', 'direct', { paceFloorFrac: 1 })
  const aggregate = openAiProvider('omniroute', 'https://omniroute.test/v1', 'aggregate-fallback', { paceFloorFrac: 1 })
  let directCalls = 0
  let aggregateCalls = 0
  const incomplete = {
    usage: { total_tokens: 10 },
    choices: [{ message: { content: '{"items":[]}' } }],
  }
  const fetchFn = (async (input: string | URL | Request) => {
    const url = String(input)
    if (url.includes('direct-')) {
      directCalls++
      return new Response(JSON.stringify(incomplete), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('omniroute.test')) {
      aggregateCalls++
      return new Response(JSON.stringify(goodTriage()), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    throw new Error(`unexpected request: ${url}`)
  }) as typeof fetch
  try {
    const summary = await runIngestCycle({
      repoRoot: root,
      stateDir,
      config: { ...configFor([first, second, aggregate]), contractRetriesPerBatch: 1 },
      skipFetch: true,
      fetchFn,
      sleep: noSleep,
      now: () => new Date(AT),
    })
    assert.equal(directCalls, 2, 'one original offer plus the configured one cross-model retry')
    assert.equal(aggregateCalls, 0, 'the aggregate cannot bypass the unusable-response retry ceiling')
    assert.equal(summary.picked + summary.watched + summary.dropped, 0)
    assert.equal(summary.deferred, 1)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

console.log(`\n${passed}/${passed + failed} OmniRoute tests passed${failed ? ` — ${failed} FAILED` : ''}`)
process.exitCode = failed ? 1 : 0
