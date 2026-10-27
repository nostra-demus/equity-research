import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import { FINVIZ_VIEWS, FINVIZ_DATA_REFRESH_MS, finvizField, isFinvizDataRead } from '../../shared/finviz-data'
import { MODEL_CLIENT_VERSION, MODEL_REFRESH_MS, MODEL_SCHEMA, UNIVERSE_URL, isModelRead, type ModelRead } from '../../shared/universe-model'
import { createUniverseModel, finvizPageUrl, finvizUniverseUrl, parseFinvizPage, registerUniverseModel } from '../src/universe-model'

const at = Date.now()
const stamp = new Date(at).toISOString()
const html = (value: unknown) => `<script type="application/json" data-ssr-props="screener">${JSON.stringify(value)}</script>`
const page = (url: string) => {
  const q = new URL(url).searchParams
  return { url, screenerType: 'stocks', settings: { hasUserPremium: false },
    filters: { filters: [{ key: 'sec', options: [{ value: 'technology' }] }] },
    data: { firstRow: 0, totalCount: 1, pageSize: FINVIZ_VIEWS.find((v) => v.code === q.get('v'))!.size,
      rows: [{ text: { ticker: 'CO', company: 'Company Inc', country: 'USA', earningsDate: '2026-11-02T16:30:00' },
        numbers: { order: 0, price: 25, marketCap: 2500, sharesOutstanding2: 100, roe: -5.5, debtEq: 0, forwardPE: null, futureMetric: 7 },
        range52w: { low: 10, high: 30 } }] },
    blocks: { news: { CO: [{ title: 'Reported acquisition', url: 'https://example.test/report', date: '2026-10-19T15:00:00', channel: 'Publisher' }] } } }
}
const newsUrl = finvizPageUrl(0, ['CO'], 'news')
const parsed = parseFinvizPage(html(page(newsUrl)), 0, stamp, ['CO']).rows[0]
assert.equal(parsed.finviz!.news!.numbers.marketCap, 2500, 'provider millions must not silently become dollars')
assert.equal(parsed.finviz!.news!.numbers.sharesOutstanding2, 100)
assert.equal(parsed.finviz!.news!.numbers.debtEq, 0, 'real zero is retained')
assert.equal(parsed.finviz!.news!.numbers.forwardPE, null, 'missing stays missing')
assert.equal(parsed.finviz!.news!.numbers.futureMetric, 7, 'new scalar provider fields are not discarded')
assert.equal(parsed.finviz!.news!.numbers.order, undefined, 'pagination is not an issuer metric')
assert.equal(parsed.finviz!.news!.text.earningsDate, '2026-11-02T16:30:00', 'no invented UTC offset')
assert.equal(parsed.finviz!.news!.news![0].title, 'Reported acquisition')
assert.equal(parsed.signals, null, 'aggregated Finviz headlines alone cannot earn a favorable signal')
assert.equal(finvizField('marketCap').unit, 'USD millions')
assert.match(finvizField('futureMetric').unit, /unverified/)
assert.match(finvizField('earningsDate').unit, /timezone unspecified/)
for (const change of [
  { url: `${newsUrl}&c=all` }, { settings: { hasUserPremium: true } },
  { url: newsUrl.replace('/screener/stocks', '/export/screener') },
]) assert.throws(() => parseFinvizPage(html({ ...page(newsUrl), ...change }), 0, stamp, ['CO']), /expected free screener/)
const bad = page(newsUrl); (bad.data.rows[0].numbers as any).roe = '12%'
assert.throws(() => parseFinvizPage(html(bad), 0, stamp, ['CO']), /invalid structured data/)
const unsafe = page(newsUrl); unsafe.blocks.news.CO[0].url = 'javascript:alert(1)'
assert.throws(() => parseFinvizPage(html(unsafe), 0, stamp, ['CO']), /invalid structured data/)
const internalNews = page(newsUrl)
internalNews.blocks.news.CO.push({ ...internalNews.blocks.news.CO[0], title: 'Finviz-hosted report', url: '/news/401719/reported-acquisition' })
const normalizedNews = parseFinvizPage(html(internalNews), 0, stamp, ['CO']).rows[0].finviz!.news!.news!
assert.equal(normalizedNews[0].url, 'https://example.test/report', 'external news URLs retain their source')
assert.equal(normalizedNews[1].url, 'https://finviz.com/news/401719/reported-acquisition', 'ordinary Finviz-relative headlines normalize to the provider origin')
for (const url of [String.raw`/\example.test/article`, '//example.test/article', '/\t/example.test/article', '/\n/example.test/article', '//']) {
  const malformed = page(newsUrl); malformed.blocks.news.CO[0].url = url
  assert.throws(() => parseFinvizPage(html(malformed), 0, stamp, ['CO']), /invalid structured data/, 'relative URLs cannot escape the Finviz origin')
}
for (const value of [{}, null]) {
  const emptyNews = page(newsUrl); (emptyNews.blocks.news as any).CO = value
  assert.throws(() => parseFinvizPage(html(emptyNews), 0, stamp, ['CO']), /headlines are unavailable/)
}
const missingNews = page(newsUrl); delete (missingNews.blocks.news as any).CO
assert.deepEqual(parseFinvizPage(html(missingNews), 0, stamp, ['CO']).rows[0].finviz!.news!.news, [], 'an absent ticker key represents no headlines')
assert.throws(() => parseFinvizPage(html({ ...page(newsUrl), blocks: null }), 0, stamp, ['CO']), /headlines are unavailable/, 'a missing news block cannot masquerade as zero headlines')

const fixtures = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(fixtures, { recursive: true })
const dir = await fs.mkdtemp(path.join(fixtures, 'data-'))
try {
  let time = at
  let failView = ''
  let wrongCompany = false
  let calls: string[] = []
  const fetchPage = async (url: string) => {
    calls.push(url)
    if (new URL(url).searchParams.get('v') === failView) throw new Error('HTTP 429: restricted')
    const value = page(url)
    if (wrongCompany && new URL(url).searchParams.get('v') === '351') value.data.rows[0].text.company = 'Other issuer'
    return html(value)
  }
  const file = path.join(dir, 'universe-model.json')
  const model = createUniverseModel(file, { now: () => time, wait: async () => {}, fetchPage })
  await model.read(); await model.settled()
  let read = await model.read()
  assert.ok(isModelRead(read))
  assert.equal(read.data!.captured, FINVIZ_VIEWS.length)
  assert.equal(read.data!.expected, FINVIZ_VIEWS.length)
  assert.equal(read.rows[0].finviz!.news!.news!.length, 1)
  assert.equal(read.rows[0].price, 25)
  assert.equal(read.data!.error, null)
  assert.equal(new Set(calls.filter((url) => new URL(url).searchParams.has('t')).map((url) => new URL(url).searchParams.get('v'))).size, 7)
  const before = calls.length
  await model.read(); await model.settled()
  assert.equal(calls.length, before, 'fresh additional views cause no network requests')

  // Expiring prices alone uses an existing standard table to get a fresh price and data together.
  time += MODEL_REFRESH_MS
  await model.read(); await model.settled()
  const quote = calls.slice(before).find((url) => new URL(url).searchParams.has('t'))!
  assert.equal(new URL(quote).searchParams.get('v'), '111')
  time += MODEL_REFRESH_MS
  const next = calls.length
  await model.read(); await model.settled()
  assert.notEqual(new URL(calls.slice(next).find((url) => new URL(url).searchParams.has('t'))!).searchParams.get('v'), '111', 'oldest price-bearing view rotates without another quote request')
  await model.close()

  // A restarted collector retains all previously captured views without refetching while fresh.
  const resumed = createUniverseModel(file, { now: () => time + 1, wait: async () => {}, fetchPage })
  calls = []; read = await resumed.read(); await resumed.settled()
  assert.equal(calls.length, 0)
  assert.equal(read.rows[0].finviz!.news!.numbers.marketCap, 2500)

  time += FINVIZ_DATA_REFRESH_MS
  failView = '351'
  await resumed.read(); await resumed.settled()
  read = await resumed.read()
  assert.match(read.data!.error!, /429/)
  assert.equal(read.rows[0].finviz!.technical!.retrieved_at, stamp, 'restriction preserves last good view with its original timestamp')
  const blocked = calls.length
  await resumed.read(); await resumed.settled()
  assert.equal(calls.length, blocked, 'a blocked detail view also pauses price requests; no workaround view')
  await resumed.close()
  const stillBlocked = createUniverseModel(file, { now: () => time, wait: async () => {}, fetchPage })
  const restoredPause = await stillBlocked.read(); await stillBlocked.settled()
  assert.equal(calls.length, blocked, 'restarting cannot bypass a persisted source restriction')
  assert.match(restoredPause.error!, /429/)
  await stillBlocked.close()

  const emptyFile = path.join(dir, 'first-load.json')
  let coldCalls = 0
  const coldDeps = { now: () => time, wait: async () => {}, fetchPage: async () => { coldCalls++; throw new Error('HTTP 403') } }
  const cold = createUniverseModel(emptyFile, coldDeps)
  await cold.read(); await cold.settled(); await cold.close()
  const coldRestart = createUniverseModel(emptyFile, coldDeps)
  await coldRestart.read(); await coldRestart.settled(); await coldRestart.close()
  assert.equal(coldCalls, 1, 'a first-load restriction survives restart even without a complete grid')

  time = Date.parse(read.next_refresh_at!)
  failView = ''; wrongCompany = true
  const identity = createUniverseModel(file, { now: () => time, wait: async () => {}, fetchPage })
  await identity.read(); await identity.settled()
  const refused = await identity.read()
  assert.match(refused.data!.error!, /match every requested company/)
  assert.equal(refused.rows[0].finviz!.technical!.text.company, 'Company Inc')
  await identity.close()

  // Serve the same durable data to a future engine consumer and to a company popup, without
  // attaching all metrics/headlines to every 15-second grid poll or performing any new analysis.
  const row = { ...parsed, finviz: Object.fromEntries(FINVIZ_VIEWS.map((view) => [view.id,
    parseFinvizPage(html(page(view.id === 'tickers' ? finvizUniverseUrl(0) : finvizPageUrl(0, ['CO'], view.id))), 0, new Date().toISOString(), view.id === 'tickers' ? undefined : ['CO']).rows[0].finviz![view.id]])) }
  const complete: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: [row], total: 1, complete: true, refreshing: false, fetched: 1,
    started_at: new Date().toISOString(), completed_at: new Date().toISOString(), next_refresh_at: null, stale: false, error: null, events: null }
  await fs.writeFile(file, JSON.stringify(complete))

  // A request that finishes across the quote deadline cannot bypass the inter-request gap.
  const handoffFile = path.join(dir, 'handoff.json')
  const handoffRow = structuredClone(row)
  handoffRow.finviz.technical.retrieved_at = new Date(at - FINVIZ_DATA_REFRESH_MS).toISOString()
  await fs.writeFile(handoffFile, JSON.stringify({ ...complete, rows: [handoffRow], completed_at: stamp }))
  let handoffTime = at + MODEL_REFRESH_MS - 2100
  const starts: number[] = []
  const handoff = createUniverseModel(handoffFile, { now: () => handoffTime, wait: async (ms) => { handoffTime += ms }, fetchPage: async (url) => {
    starts.push(handoffTime)
    if (new URL(url).searchParams.get('v') === '351') handoffTime += 200
    return html(page(url))
  } })
  await handoff.read(); await handoff.settled()
  await handoff.read(); await handoff.settled()
  assert.ok(starts.length > 1)
  assert.ok(starts.slice(1).every((start, i) => start - starts[i] >= 2000), 'all lane handoffs preserve request pacing')
  await handoff.close()

  const closingFile = path.join(dir, 'closing.json')
  const closingRow = structuredClone(row)
  delete closingRow.finviz.technical
  await fs.writeFile(closingFile, JSON.stringify({ ...complete, rows: [closingRow] }))
  let release!: (html: string) => void
  let requested!: () => void
  const inFlight = new Promise<void>((resolve) => { requested = resolve })
  const closing = createUniverseModel(closingFile, { now: () => at, wait: async () => {}, fetchPage: async () => {
    requested(); return new Promise<string>((resolve) => { release = resolve })
  } })
  await closing.read(); await inFlight
  let stopped = false
  const stop = closing.close().then(() => { stopped = true })
  await new Promise(setImmediate)
  assert.equal(stopped, false, 'shutdown waits for the single writer to settle')
  release(html(page(finvizPageUrl(0, ['CO'], 'technical'))))
  await stop
  assert.equal(JSON.parse(await fs.readFile(closingFile, 'utf8')).rows[0].finviz.technical, undefined, 'a response arriving after close is discarded before publication')
  await fs.writeFile(closingFile, JSON.stringify({ ...complete, rows: [{ ...closingRow, price: 99 }] }))
  await closing.settled()
  assert.equal(JSON.parse(await fs.readFile(closingFile, 'utf8')).rows[0].price, 99, 'an old collector cannot overwrite its replacement after shutdown settles')

  const app = Fastify()
  registerUniverseModel(app, dir, dir, '')
  try {
    const grid = (await app.inject({ url: '/api/screener/universe-model', headers: { 'x-nostra-model': MODEL_CLIENT_VERSION } })).json()
    assert.equal(grid.rows[0].finviz, undefined)
    assert.equal(grid.data.captured, 8)
    const data = (await app.inject('/api/screener/universe-model/data?ticker=CO&company=Company%20Inc')).json()
    assert.ok(isFinvizDataRead(data))
    assert.equal(data.fields!.marketCap.unit, 'USD millions', 'the engine data endpoint carries units as well as raw numbers')
    assert.match(data.fields!.futureMetric.unit, /unverified/)
    assert.equal(data.fields!['range52w.low'].unit, 'USD')
    assert.equal(Object.keys(data.rows[0].views).length, 8)
    assert.equal((await app.inject('/api/screener/universe-model/data?ticker=CO&company=Other')).json().rows.length, 0)
    assert.equal((await app.inject('/api/screener/universe-model/data')).json().rows.length, 1)
  } finally { await app.close() }
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('finviz-data: raw units, missingness, free-only scope, incremental refresh, identity, backoff, restart and API passed')
