import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import { FINVIZ_VIEWS, FINVIZ_DATA_REFRESH_MS, finvizField, isFinvizDataRead } from '../../shared/finviz-data'
import { MODEL_REFRESH_MS, MODEL_SCHEMA, UNIVERSE_URL, isModelRead, type ModelRead } from '../../shared/universe-model'
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
  model.close()

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
  resumed.close()

  time = Date.parse(read.next_refresh_at!)
  failView = ''; wrongCompany = true
  const identity = createUniverseModel(file, { now: () => time, wait: async () => {}, fetchPage })
  await identity.read(); await identity.settled()
  const refused = await identity.read()
  assert.match(refused.data!.error!, /match every requested company/)
  assert.equal(refused.rows[0].finviz!.technical!.text.company, 'Company Inc')
  identity.close()

  // Serve the same durable data to a future engine consumer and to a company popup, without
  // attaching all metrics/headlines to every 15-second grid poll or performing any new analysis.
  const row = { ...parsed, finviz: Object.fromEntries(FINVIZ_VIEWS.map((view) => [view.id,
    parseFinvizPage(html(page(view.id === 'tickers' ? finvizUniverseUrl(0) : finvizPageUrl(0, ['CO'], view.id))), 0, new Date().toISOString(), view.id === 'tickers' ? undefined : ['CO']).rows[0].finviz![view.id]])) }
  const complete: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: [row], total: 1, complete: true, refreshing: false, fetched: 1,
    started_at: new Date().toISOString(), completed_at: new Date().toISOString(), next_refresh_at: null, stale: false, error: null, events: null }
  await fs.writeFile(file, JSON.stringify(complete))
  const app = Fastify()
  registerUniverseModel(app, dir, dir, '')
  try {
    const grid = (await app.inject('/api/screener/universe-model')).json()
    assert.equal(grid.rows[0].finviz, undefined)
    assert.equal(grid.data.captured, 8)
    const data = (await app.inject('/api/screener/universe-model/data?ticker=CO&company=Company%20Inc')).json()
    assert.ok(isFinvizDataRead(data))
    assert.equal(Object.keys(data.rows[0].views).length, 8)
    assert.equal((await app.inject('/api/screener/universe-model/data?ticker=CO&company=Other')).json().rows.length, 0)
    assert.equal((await app.inject('/api/screener/universe-model/data')).json().rows.length, 1)
  } finally { await app.close() }
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('finviz-data: raw units, missingness, free-only scope, incremental refresh, identity, backoff, restart and API passed')
