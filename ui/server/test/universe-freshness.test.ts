import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import { FINVIZ_VIEWS } from '../../shared/finviz-data'
import { isModelPricesRead, isModelRead, MODEL_CLIENT_VERSION, MODEL_SCHEMA, MODEL_REFRESH_MS, UNIVERSE_URL, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { createUniverseModel, registerUniverseModel } from '../src/universe-model'
import { providerDeployIntentPath } from '../src/deploy-barrier'

const at = Date.parse('2026-10-21T04:30:00Z')
const old = new Date(at - 24 * 3600_000).toISOString()
const stamp = new Date(at).toISOString()
const rows = Array.from({ length: 21 }, (_, i): ModelRow => ({ ticker: `CO${String(i).padStart(2, '0')}`, company: `Company ${i}`, price: 10,
  currency: 'USD', retrieved_at: old, signals: null }))
const snapshot = (values = rows, completed = old): ModelRead => ({ schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL,
  rows: values, total: values.length, complete: true, refreshing: false, fetched: values.length, started_at: completed,
  completed_at: completed, next_refresh_at: null, stale: true, error: null, events: null })
const html = (url: string, selected: ModelRow[]) => {
  const q = new URL(url).searchParams
  return `<script type="application/json" data-ssr-props="screener">${JSON.stringify({
    url, screenerType: 'stocks', settings: { hasUserPremium: false }, blocks: { news: {} },
    filters: { filters: [{ key: 'sec', options: [{ value: 'technology' }] }] },
    data: { firstRow: 0, totalCount: selected.length, pageSize: FINVIZ_VIEWS.find((v) => v.code === q.get('v'))!.size,
      rows: selected.map((row, i) => ({ text: { ticker: row.ticker, company: row.company }, numbers: { order: i, price: 20 } })) },
  })}</script>`
}
const members = (url: string) => {
  const tickers = new URL(url).searchParams.get('t')?.split(',')
  return tickers ? rows.filter((row) => tickers.includes(row.ticker)) : rows
}
const parent = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(parent, { recursive: true })
const dir = await fs.mkdtemp(path.join(parent, 'freshness-'))
try {
  const file = path.join(dir, 'model.json')
  await fs.writeFile(file, JSON.stringify(snapshot()))
  let release!: () => void
  let requested!: () => void
  const lastBatch = new Promise<void>((resolve) => { requested = resolve })
  const calls: string[][] = []
  const model = createUniverseModel(file, { now: () => at, wait: async () => {}, fetchPage: async (url) => {
    const tickers = new URL(url).searchParams.get('t')?.split(',')
    if (tickers) {
      calls.push(tickers)
      if (calls.length === 2) { requested(); await new Promise<void>((resolve) => { release = resolve }) }
    }
    return html(url, members(url))
  } })
  await model.read(); await lastBatch
  const partial = await model.read()
  assert.equal(partial.complete, true)
  assert.equal(partial.completed_at, old, 'the last full pass stays separate from individual price updates')
  assert.equal(partial.rows.filter((row) => row.price === 20).length, 20, 'validated batches are visible before the final batch')
  assert.equal(partial.refresh_total, 21)
  assert.equal(partial.refresh_phase, 'prices')
  await model.read()
  assert.equal(calls.length, 2, 'parallel viewers do not create a second collector')
  let closed = false
  const stop = model.close().then(() => { closed = true })
  await new Promise(setImmediate)
  assert.equal(closed, false)
  release(); await stop
  const checkpoint = JSON.parse(await fs.readFile(file, 'utf8')) as ModelRead
  assert.equal(checkpoint.rows.filter((row) => row.price === 20).length, 20, 'shutdown saves prior successful batches and discards a late response')
  assert.equal(checkpoint.completed_at, old)
  assert.ok(isModelRead(checkpoint))

  const resumed: string[][] = []
  const restart = createUniverseModel(file, { now: () => at + 1, wait: async () => {}, fetchPage: async (url) => {
    const tickers = new URL(url).searchParams.get('t')?.split(',')
    if (tickers) resumed.push(tickers)
    return html(url, members(url))
  } })
  await restart.read(); await restart.settled()
  assert.deepEqual(resumed[0], ['CO20'], 'restart skips fresh checkpointed prices and starts with the unfinished company')
  assert.equal((await restart.read()).completed_at, new Date(at + 1).toISOString())
  await restart.close()

  await fs.writeFile(file, JSON.stringify(snapshot()))
  let quoteCalls = 0
  const fail = createUniverseModel(file, { now: () => at, wait: async () => {}, fetchPage: async (url) => {
    if (new URL(url).searchParams.has('t') && ++quoteCalls === 2) throw new Error('HTTP 500: source unavailable')
    return html(url, members(url))
  } })
  await fail.read(); await fail.settled()
  const failed = await fail.read()
  assert.match(failed.error!, /500/)
  assert.equal(failed.rows.filter((row) => row.price === 20).length, 20)
  assert.equal(JSON.parse(await fs.readFile(file, 'utf8')).rows.filter((row: ModelRow) => row.price === 20).length, 20, 'late failure retains fresh durable batches')
  await fail.close()

  // The scheduler refreshes an unopened Model, and reuses the same cooldown and shutdown boundary.
  let time = at
  let tick!: () => Promise<void>
  let cancelled = false
  let backgroundCalls = 0
  const backgroundFile = path.join(dir, 'background.json')
  const background = createUniverseModel(backgroundFile, { now: () => time, wait: async () => {},
    schedule: (run) => { tick = run; return () => { cancelled = true } }, fetchPage: async (url) => {
      backgroundCalls++
      if (time > at) throw new Error('HTTP 429: restricted')
      return html(url, members(url))
    } })
  await background.start(); await background.settled()
  const firstCalls = backgroundCalls
  assert.ok(firstCalls > 0, 'startup collects without a route read or viewer')
  assert.equal(JSON.parse(await fs.readFile(backgroundFile, 'utf8')).rows.length, 21)
  time += MODEL_REFRESH_MS
  await tick(); await background.settled()
  assert.equal(backgroundCalls, firstCalls + 1)
  await tick(); await background.settled()
  assert.equal(backgroundCalls, firstCalls + 1, 'background ticks cannot bypass a source restriction')
  await background.close(); assert.equal(cancelled, true)
  await tick(); assert.equal(backgroundCalls, firstCalls + 1, 'a stopped scheduler cannot restart the writer')

  // A pending deployment stops both lanes at the next request boundary and preserves checkpoints.
  const intent = providerDeployIntentPath(dir)
  const yieldingFile = path.join(dir, 'yielding.json')
  await fs.writeFile(yieldingFile, JSON.stringify(snapshot()))
  const yieldingCalls: string[][] = []
  let pausePrice = true
  const yielding = createUniverseModel(yieldingFile, { now: () => at, wait: async () => {
    if (pausePrice && yieldingCalls.length === 1) await fs.writeFile(intent, 'local test deployment')
  }, fetchPage: async (url) => {
    const tickers = new URL(url).searchParams.get('t')?.split(',')
    if (tickers) yieldingCalls.push(tickers)
    return html(url, members(url))
  } })
  await yielding.read(); await yielding.settled()
  assert.equal(yieldingCalls.length, 1, 'price collection yields before the next request')
  assert.equal(JSON.parse(await fs.readFile(yieldingFile, 'utf8')).rows.filter((row: ModelRow) => row.price === 20).length, 20)
  await yielding.read(); await yielding.settled()
  assert.equal(yieldingCalls.length, 1, 'route reads cannot bypass deployment priority')
  pausePrice = false; await fs.rm(intent)
  await yielding.read(); await yielding.settled()
  assert.deepEqual(yieldingCalls[1], ['CO20'], 'clearing the barrier resumes unfinished prices without a new five-minute delay')
  await yielding.close()

  const detailFile = path.join(dir, 'yielding-details.json')
  await fs.writeFile(detailFile, JSON.stringify(snapshot(rows, stamp)))
  let detailCalls = 0
  let pauseDetail = true
  let detailTick!: () => Promise<void>
  const details = createUniverseModel(detailFile, { now: () => at, schedule: (run) => { detailTick = run; return () => {} }, wait: async () => {
    if (pauseDetail && detailCalls === 1) await fs.writeFile(intent, 'local test deployment')
  }, fetchPage: async (url) => { detailCalls++; return html(url, members(url)) } })
  await details.start(); await details.settled()
  assert.equal(detailCalls, 1, 'the background detail loop yields before a second batch')
  assert.equal(JSON.parse(await fs.readFile(detailFile, 'utf8')).rows.filter((row: ModelRow) => row.finviz?.news).length, 10,
    'the completed detail batch is saved before yielding')
  await detailTick(); await details.settled(); assert.equal(detailCalls, 1)
  pauseDetail = false; await fs.rm(intent)
  await detailTick(); await details.settled(); assert.ok(detailCalls > 1)
  await details.close()

  // Quote requests use only verified saved members and a bounded batch; they never invent a source.
  await fs.writeFile(path.join(dir, 'universe-model.json'), JSON.stringify(snapshot(rows, stamp)))
  let subjects: string[] = []
  const app = Fastify()
  registerUniverseModel(app, dir, dir, '', { collector: { now: () => at, wait: async () => {}, fetchPage: async (url) => html(url, members(url)) }, quotes: async (selected) => {
    subjects = selected.map((row) => row.ticker)
    return new Map(selected.map((row) => [row.ticker, { reason: null, quote: { ticker: row.ticker, name: row.companyName ?? null,
      symbol: row.ticker, exchange: 'NASDAQ', price: 25, currency: 'USD', source: 'cnbc' as const, as_of: stamp,
      as_of_is_close: false, real_time: true, retrieved_at: stamp, delayed: false, stale: false } }]))
  } })
  try {
    const legacy = (await app.inject('/api/screener/universe-model')).json()
    assert.deepEqual(legacy.rows, [], 'an old event-presence client must clear its grid rather than mis-score current evidence')
    assert.match(legacy.error, /Reload/)
    const quote = (await app.inject('/api/screener/universe-model/quotes?tickers=CO00,UNKNOWN')).json()
    assert.ok(isModelPricesRead(quote))
    assert.deepEqual(subjects, ['CO00'], 'arbitrary request symbols cannot expand beyond saved universe membership')
    assert.equal(quote.rows[0].quote.source, 'cnbc')
    assert.equal(quote.rows[0].quote.real_time, true)
    assert.equal((await app.inject('/api/screener/universe-model/quotes?tickers=CO00,CO00')).statusCode, 400)
    assert.equal((await app.inject('/api/screener/universe-model/quotes?tickers=../../invalid')).statusCode, 400)
    const active = (await app.inject({ url: '/api/screener/universe-model', headers: { 'x-nostra-model': MODEL_CLIENT_VERSION } })).json()
    assert.equal(active.rows.length, 21)
  } finally { await app.close() }
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('universe-freshness: batch publication, durable restart, last-batch failure, background pacing, version guard and free quote route passed')
