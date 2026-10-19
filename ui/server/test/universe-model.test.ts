import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createUniverseModel, finvizPageUrl, finvizUniverseUrl, parseFinvizPage, parseFinvizSectors } from '../src/universe-model'
import { MODEL_REFRESH_MS, isModelRead } from '../../shared/universe-model'
import { addUniverseEvent, createUniverseEventsReader, readUniverseEvents, universeCompanyKey, type UniverseEventIndex } from '../src/universe-events'
import { scanDayItems } from '../src/news/feed'
import type { FeedItem } from '../src/news/types'

const at = '2026-10-19T15:00:00.000Z'
const props = (offset = 0, total = 3) => ({ screenerType: 'stocks', url: finvizPageUrl(offset), filters: { filters: [{ key: 'sec', options: [
  { value: '', label: 'Any' }, { value: 'technology', label: 'Technology' }, { value: 'financial', label: 'Financial' },
  { value: 'utilities', label: 'Utilities' }, { value: 'modal', label: 'Custom', isEliteOnly: true },
] }] }, data: {
  totalCount: total, firstRow: offset, pageSize: 2,
  rows: Array.from({ length: Math.min(2, total - offset) }, (_, i) => ({ text: { ticker: `CO${offset + i}`, company: `Company ${offset + i}` },
    numbers: { order: offset + i, price: 12.5, forwardPE: 12, roe: 18, debtEq: 0, epsYoY: -5, sma50: 4 } })),
} })
const html = (value: unknown) => `<script type="application/json" data-ssr-props="island">${JSON.stringify(value)}</script>`
const page = parseFinvizPage(html(props()), 0, at)
assert.equal(page.rows[0].signals, null, 'Finviz supplies membership and price, never invented events')
assert.equal(page.rows[0].retrieved_at, at)
assert.equal(new URL(finvizPageUrl(20)).searchParams.get('r'), '21')
assert.equal(new URL(finvizPageUrl(20)).searchParams.has('preset'), false)
assert.equal(new URL(finvizPageUrl(0, ['CO0'])).searchParams.get('v'), '111', 'quotes use the normal free Overview')
assert.equal(new URL(finvizPageUrl(0, ['CO0'])).searchParams.has('c'), false, 'no custom/Elite columns')
assert.deepEqual(parseFinvizSectors(html(props())), ['technology', 'financial', 'utilities'], 'only public sector options are requested')
assert.throws(() => parseFinvizSectors(html({ ...props(), filters: null })), /unavailable/)
const duplicateSectors = props(); duplicateSectors.filters.filters[0].options.push({ value: 'technology', label: 'Duplicate' })
assert.throws(() => parseFinvizSectors(html(duplicateSectors)), /changed/)
assert.throws(() => parseFinvizPage('<html>Access denied</html>', 0, at), /expected free screener/)
assert.throws(() => parseFinvizPage(html(props(2)), 0, at), /expected free screener/)
assert.throws(() => parseFinvizPage(html({ ...props(), url: '/screener/stocks?f=cap_small' }), 0, at), /expected free screener/)
assert.throws(() => parseFinvizPage(html(props()), 0, at, undefined, 'technology'), /expected free screener/, 'a partition cannot return the broad universe')
const bad = props(); bad.data.rows[0].text.company = ''
assert.throws(() => parseFinvizPage(html(bad), 0, at), /invalid company/)

const index: UniverseEventIndex = { coverage: { checked_at: at, from: '2026-07-21T15:00:00Z', to: at,
  archive_days: 20, reports_scanned: 0, latest_report_at: null, refreshing: false, error: null }, companies: {} }
const event = { event_id: 'EVT-1', headline: 'Company zero raises guidance', url: 'https://example.test/filing', source_name: 'Issuer filing',
  source_tier: 'primary_filing', found_at: at, event_types: ['guidance_change'], event_direction: 'positive',
  event_materiality_label: 'high', relevance: 'material', issuer_linkage: 'primary', companies: [{ ticker: 'CO0', name: 'Company zero Inc', listing_country: 'US' }],
  snippet: '<b>Revenue</b> guidance increased.', triage_reason: 'Material outlook revision.' } as FeedItem
addUniverseEvent(index, event); addUniverseEvent(index, event)
const key = universeCompanyKey('CO0', 'Company zero Corp')
assert.equal(index.companies[key].guidance?.length, 1, 'duplicates cannot add points or evidence')
assert.equal(index.companies[key].guidance?.[0].source_event_id, 'EVT-1', 'cache reads use the exact source event, never its story-group ID')
assert.equal(index.companies[key].guidance?.[0].excerpt, 'Revenue guidance increased.')
assert.equal(index.companies[key].guidance?.[0].classification_reason, 'Material outlook revision.')
const groupedIndex: UniverseEventIndex = { coverage: { ...index.coverage }, companies: {} }
addUniverseEvent(groupedIndex, { ...event, dedup_group: 'STORY-1' })
assert.equal(groupedIndex.companies[key].guidance?.[0].id, 'STORY-1')
assert.equal(groupedIndex.companies[key].guidance?.[0].source_event_id, 'EVT-1')
const foreignIndex: UniverseEventIndex = { coverage: { ...index.coverage }, companies: { ...index.companies } }
addUniverseEvent(foreignIndex, { ...event, event_id: 'EVT-2', url: 'https://example.test/two', companies: [{ ticker: 'CO0', name: 'Company zero Inc', listing_country: 'IN' }] })
assert.equal(Object.keys(index.companies).length, 1, 'foreign ticker collisions are not issuer matches')
assert.equal(foreignIndex.companies[key].guidance?.length, 1, 'foreign tags never supply US evidence')
const foreignReader = createUniverseEventsReader('', '', async () => foreignIndex)
foreignReader(page.rows, Date.parse(at)); await new Promise(setImmediate)
assert.equal(foreignReader([{ ...page.rows[0], company: 'Company zero Ltd' }], Date.parse(at)).rows[0].signals, null, 'country conflicts cannot become asserted negatives or US matches')
addUniverseEvent(index, { ...event, event_id: 'EVT-old', found_at: '2026-01-01T00:00:00Z' })
addUniverseEvent(index, { ...event, event_id: 'EVT-low', event_types: ['commercial'], event_materiality_label: 'low', triage_score: 80 })
addUniverseEvent(index, { ...event, event_id: 'EVT-legacy', event_types: ['commercial'], found_at: undefined })
assert.equal(index.companies[key].contracts, undefined)
addUniverseEvent(index, { ...event, event_id: 'EVT-legacy-score', event_types: ['operations'], event_materiality_label: undefined, triage_score: 80 })
assert.equal(index.companies[key].operations?.length, 1, 'legacy rows use the persisted triage priority')
let indexCalls = 0
const reader = createUniverseEventsReader('', '', async () => { indexCalls++; return index })
const subject = { ...page.rows[0], company: 'Company zero Ltd' }
assert.equal(reader([subject], Date.parse(at)).rows[0].signals, null)
await new Promise(setImmediate)
assert.equal(reader([subject], Date.parse(at)).rows[0].signals?.guidance?.length, 1)
assert.equal(reader([{ ...subject, company: 'Different company' }], Date.parse(at)).rows[0].signals, null, 'ambiguous issuer identity is unavailable, not a false negative')
assert.equal(indexCalls, 1)
assert.equal(reader([subject], Date.parse(at) + 49 * 3600000).rows[0].signals, null, 'stale ingestion cannot prove absent events')
let scans = 0
let stamp = 'stable'
const io = { dates: () => ['2026-10-19'], stamp: () => stamp, scan: (...args: Parameters<typeof scanDayItems>) => {
  scans++; args[4]?.(event)
  args[4]?.({ ...event, event_id: 'EVT-midnight', url: 'https://example.test/midnight', event_types: ['commercial'], found_at: '2026-10-18T23:50:00Z' })
  args[4]?.({ ...event, event_id: 'EVT-future', url: 'https://example.test/future', event_types: ['product'], found_at: '2026-10-19T15:01:00Z' })
  args[4]?.({ ...event, event_id: 'EVT-foreign-future', url: 'https://example.test/foreign-future', found_at: '2026-10-19T15:01:00Z', companies: [{ ticker: 'ADR', name: 'Issuer ADR', listing_country: 'IN' }] })
  assert.equal(args[3]?.strict, true)
  return { status: 'read' as const, lines: 1, complete: true, next: null }
} }
const cachedEvents = await readUniverseEvents('fixture-cache', '', at, io)
assert.equal(cachedEvents.companies[key].contracts?.[0].id, 'EVT-midnight', 'source date can precede the ingestion partition')
assert.equal(cachedEvents.companies[key].product, undefined, 'future source timestamps cannot score early')
assert.equal(Object.keys(cachedEvents.companies).some((key) => key.startsWith('ADR|')), false, 'future country conflicts cannot mute current coverage')
await readUniverseEvents('fixture-cache', '', at, io)
assert.equal(scans, 1, 'unchanged archived days are never reparsed for each one-minute refresh')
const later = await readUniverseEvents('fixture-cache', '', '2026-10-19T15:02:00Z', io)
assert.equal(later.companies[key].product?.[0].id, 'EVT-future', 'source-time windows advance without reparsing a stable partition')
assert.equal(Object.keys(later.companies).some((key) => key.startsWith('ADR|')), true, 'country conflicts retain their source-time window')
assert.equal(scans, 1)
stamp = 'appended'
await readUniverseEvents('fixture-cache', '', at, io)
assert.equal(scans, 2, 'only a changing partition is rebuilt')
await assert.rejects(readUniverseEvents('fixture-unreadable', '', at, { ...io,
  scan: () => ({ status: 'unreadable', lines: 0, complete: true, next: null }) }), /incomplete/)
let stampReads = 0
await assert.rejects(readUniverseEvents('fixture-changing', '', at, { ...io,
  stamp: () => ++stampReads === 1 ? 'before' : 'after' }), /changed during the scan/, 'a concurrent append cannot publish a partial negative')

const fixtures = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(fixtures, { recursive: true })
const dir = await fs.mkdtemp(path.join(fixtures, 'run-'))
try {
  const inbox = path.join(dir, 'screener/inbox')
  await fs.mkdir(inbox, { recursive: true })
  await fs.writeFile(path.join(inbox, '2026-10-19_firehose.ndjson'), '{corrupt}\n')
  assert.equal(scanDayItems(dir, '2026-10-19', '', { strict: true }).status, 'unreadable', 'strict projections preserve corrupt-shard truth')
  assert.equal(scanDayItems(dir, '2026-10-19', '').status, 'read', 'legacy display reads retain their fail-soft contract')
  let time = Date.parse(at)
  let calls = 0
  let fail = false
  let repeat = false
  let changeTotal = false
  let changeMembers = false
  let membershipPages = 0
  const file = path.join(dir, 'model.json')
  const fixturePage = (url: string) => {
    const offset = Number(new URL(url).searchParams.get('r')) - 1
    assert.equal(offset, 0, 'normal screens use small disjoint sector partitions, not blocked deep pagination')
    const tickers = new URL(url).searchParams.get('t')?.split(',')
    if (tickers) {
      const value = props(0, tickers.length)
      value.url = url
      value.data.pageSize = 20
      value.data.rows = tickers.map((ticker, i) => ({ text: { ticker, company: `Company ${ticker.slice(2)}` }, numbers: { order: i, price: 12.5 } as any }))
      return html(value)
    }
    const sector = new URL(url).searchParams.get('f')?.split(',').find((f) => f.startsWith('sec_'))?.slice(4)
    if (fail && sector === 'financial') throw new Error('HTTP 429: access restricted')
    const value = props()
    value.url = url
    if (sector) {
      membershipPages++
      const indices = sector === 'technology' ? [0, 1] : sector === 'financial' ? [2] : []
      value.data.totalCount = indices.length
      value.data.rows = indices.map((n, i) => ({ ...props(n).data.rows[0], numbers: { ...props(n).data.rows[0].numbers, order: i } }))
      if (repeat && sector === 'financial') value.data.rows[0].text.ticker = 'CO0'
      if (changeTotal && membershipPages > 3 && sector === 'technology') value.data.totalCount++
      if (changeMembers && membershipPages > 3) value.data.rows.forEach((row, i) => {
        row.text.ticker = `CO${i + 1}`; row.text.company = `Company ${i + 1}`
      })
    }
    return html(value)
  }
  const model = createUniverseModel(file, { now: () => time, wait: async (ms) => { assert.equal(ms, 2000) }, fetchPage: async (url) => {
    calls++
    return fixturePage(url)
  } })
  const first = await model.read()
  assert.equal(first.refreshing, true)
  assert.equal(first.complete, false)
  await model.read(); await model.read()
  await model.settled()
  assert.equal(calls, 9, 'simultaneous readers share two sector passes, two whole-screen checks and one price batch')
  const ready = await model.read()
  assert.ok(isModelRead(ready))
  assert.equal(ready.complete, true)
  assert.equal(ready.rows.length, 3)
  const frozen = await fs.readFile(file, 'utf8')
  await model.read(); assert.equal(calls, 9, 'check-updates does not bypass TTL')
  fail = true; time += MODEL_REFRESH_MS
  const during = await model.read()
  assert.equal(during.rows.length, 3, 'retain the complete grid during refresh')
  assert.equal(during.stale, true)
  await model.settled()
  const failed = await model.read()
  assert.equal(failed.complete, true)
  assert.equal(failed.stale, true)
  assert.match(failed.error!, /429/)
  assert.equal(await fs.readFile(file, 'utf8'), frozen, 'failed refresh cannot overwrite disk data')
  const backoffCalls = calls; await model.read(); assert.equal(calls, backoffCalls)
  assert.equal(Date.parse(failed.next_refresh_at!) - time, 30 * 60_000, 'source failures retain the 30-minute cooldown')
  fail = false; repeat = true; time = Date.parse(failed.next_refresh_at!)
  await model.read(); await model.settled()
  assert.match((await model.read()).error!, /repeated/)
  repeat = false; changeTotal = true; membershipPages = 0; time = Date.parse((await model.read()).next_refresh_at!)
  await model.read(); await model.settled()
  assert.match((await model.read()).error!, /membership changed/)
  changeTotal = false; changeMembers = true; membershipPages = 0; time = Date.parse((await model.read()).next_refresh_at!)
  await model.read(); await model.settled()
  assert.match((await model.read()).error!, /membership changed during verification/)
  assert.equal(await fs.readFile(file, 'utf8'), frozen, 'same-size membership shifts cannot replace the complete snapshot')
  model.close()
  const reloaded = createUniverseModel(file, { now: () => Date.parse(at) + 1000, fetchPage: async () => { throw new Error('must use disk') } })
  assert.equal((await reloaded.read()).rows.length, 3)
  reloaded.close()
  const partial = createUniverseModel(path.join(dir, 'new.json'), { now: () => time, wait: async () => {}, fetchPage: async (url) => {
    if (new URL(url).searchParams.get('f')?.includes('sec_financial')) throw new Error('HTTP 403')
    return fixturePage(url)
  } })
  await partial.read(); await partial.settled()
  const incomplete = await partial.read()
  assert.equal(incomplete.complete, false)
  assert.equal(incomplete.rows.length, 2)
  assert.match(incomplete.error!, /403/)
  assert.ok(isModelRead(incomplete))
  assert.equal(await fs.stat(path.join(dir, 'new.json')).catch(() => null), null)
  partial.close()

  // The old broad-screen cursor failed after 1,000 names. Ordinary free sector screens plus
  // normal Overview quote batches must cover a larger universe without ever requesting that cursor.
  let bigCalls = 0
  const big = createUniverseModel(path.join(dir, 'big.json'), { now: () => time, wait: async () => {}, fetchPage: async (url) => {
    bigCalls++
    const q = new URL(url).searchParams
    assert.equal(q.get('r'), '1')
    assert.equal(q.has('c'), false)
    const selected = q.get('t')?.split(',')
    const sector = q.get('f')?.split(',').find((f) => f.startsWith('sec_'))?.slice(4)
    const ids = selected ? selected.map((t) => Number(t.slice(2))) : sector === 'technology'
      ? Array.from({ length: 500 }, (_, i) => i) : sector === 'financial'
        ? Array.from({ length: 501 }, (_, i) => i + 500) : sector ? [] : Array.from({ length: 1000 }, (_, i) => i)
    const value = props()
    value.url = url
    value.data.totalCount = selected ? selected.length : sector ? ids.length : 1001
    value.data.pageSize = selected ? 20 : 1000
    value.data.rows = ids.map((id, i) => ({ text: { ticker: `CO${id}`, company: `Company ${id}` }, numbers: { ...props().data.rows[0].numbers, order: i } }))
    return html(value)
  } })
  await big.read(); await big.settled()
  const completeBig = await big.read()
  assert.equal(completeBig.error, null)
  assert.equal(completeBig.complete, true)
  assert.equal(completeBig.rows.length, 1001)
  assert.equal(completeBig.rows.filter((r) => r.price === 12.5).length, 1001)
  assert.equal(bigCalls, 59, 'two catalog-driven partition passes, whole-screen checks, and 51 normal quote batches')
  big.close()
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('universe-model: pagination, scope, concurrency, persistence and bounded failure passed')
