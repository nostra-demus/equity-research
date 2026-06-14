// Intl-exchange layer (Layer 3, non-India): HKEXnews + ASX primary-disclosure JSON adapters. Tests the
// HKEX double-parse (result is a JSON STRING), the HK date normalizer, ASX row→RawArticle mapping +
// price-sensitive flag + noise filter, the lookback freshness filter, and per-market failure isolation.
// All with mocked fetch, no network. Run: npx tsx test/exchange-intl.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { fetchExchangeIntl, hkexDate } from '../src/news/sources/exchange-intl'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const noSleep = async () => {}
const now = () => new Date('2026-06-14T12:00:00Z')

function res(status: number, body: any) {
  return { ok: status >= 200 && status < 300, status, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) }
}

// HKEX rows (the inner array, which the API delivers as a JSON STRING in the `result` field)
const HKEX_ROWS = [
  { STOCK_NAME: 'VIGONVITA-B', STOCK_CODE: '02630', TITLE: 'REVISED PROXY FORM FOR THE AGM\nON JUNE 30, 2026', DATE_TIME: '14/06/2026 19:57', FILE_LINK: '/listedco/listconews/sehk/2026/0614/2026061400465.pdf' },
  { STOCK_NAME: 'Stale Co', STOCK_CODE: '00001', TITLE: 'Old announcement long ago', DATE_TIME: '01/06/2026 09:00', FILE_LINK: '/listedco/old.pdf' }, // older than lookback → dropped
  { STOCK_NAME: 'NoLink Co', STOCK_CODE: '00002', TITLE: 'Has no file link', DATE_TIME: '14/06/2026 10:00', FILE_LINK: '' }, // no link → dropped
]
const ASX_ITEMS = [
  { symbol: 'BHP', headline: 'Quarterly Production Report', date: '2026-06-14T09:30:00.000Z', isPriceSensitive: true, documentKey: 'k-1' },
  { symbol: 'CBA', headline: 'End of Day', date: '2026-06-14T09:30:00.000Z', isPriceSensitive: false, documentKey: 'k-2' }, // noise → dropped
]

function mkFetch(opts: { hkex?: any; asx?: any; hkexStatus?: number; asxStatus?: number } = {}) {
  return (async (url: string) => {
    if (url.includes('titleSearchServlet')) return res(opts.hkexStatus ?? 200, opts.hkex ?? { result: JSON.stringify(HKEX_ROWS) })
    if (url.includes('markets/announcements')) return res(opts.asxStatus ?? 200, opts.asx ?? { data: { items: ASX_ITEMS } })
    return res(404, '')
  }) as unknown as typeof fetch
}

await check('hkexDate: dd/mm/yyyy hh:mm → ISO with +08:00; junk → null', () => {
  assert.equal(hkexDate('14/06/2026 19:57'), '2026-06-14T19:57:00+08:00')
  assert.equal(hkexDate('1/6/2026'), '2026-06-01T00:00:00+08:00')
  assert.equal(hkexDate('garbage'), null)
  assert.equal(hkexDate(''), null)
})

await check('fetchExchangeIntl: HKEX double-parse → RawArticles (via:hkex, hkexnews.hk), lookback + no-link drops', async () => {
  const out = await fetchExchangeIntl({ lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: mkFetch(), sleep: noSleep, now })
  const hk = out.filter((a) => a.via === 'hkex')
  assert.equal(hk.length, 1, 'only the fresh, linked HKEX row survives')
  assert.match(hk[0].title, /VIGONVITA-B \(02630\): REVISED PROXY FORM/)
  assert.equal(new URL(hk[0].url).hostname, 'www1.hkexnews.hk')
  assert.ok(hk[0].title.indexOf('\n') === -1, 'newlines collapsed')
})

await check('fetchExchangeIntl: ASX → RawArticles (via:asx, asx.com.au), price-sensitive flag, noise dropped', async () => {
  const out = await fetchExchangeIntl({ lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: mkFetch(), sleep: noSleep, now })
  const asx = out.filter((a) => a.via === 'asx')
  assert.equal(asx.length, 1, 'the "End of Day" noise row is filtered, BHP survives')
  assert.match(asx[0].title, /BHP: Quarterly Production Report \[price-sensitive\]/)
  assert.equal(new URL(asx[0].url).hostname, 'www.asx.com.au')
})

await check('fetchExchangeIntl: a failing market never blocks the other (isolation, never throws)', async () => {
  const out = await fetchExchangeIntl({ lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: mkFetch({ hkexStatus: 500 }), sleep: noSleep, now })
  assert.equal(out.filter((a) => a.via === 'hkex').length, 0, 'HKEX 500 → no HK items')
  assert.equal(out.filter((a) => a.via === 'asx').length, 1, 'ASX still delivers')
})

await check('fetchExchangeIntl: malformed HKEX result string degrades to empty, never throws', async () => {
  const out = await fetchExchangeIntl({ lookbackHours: 24, timeoutMs: 5000 }, { fetchFn: mkFetch({ hkex: { result: 'not-json{' } }), sleep: noSleep, now })
  assert.equal(out.filter((a) => a.via === 'hkex').length, 0)
})

console.log(`\n${passed} checks passed`)
