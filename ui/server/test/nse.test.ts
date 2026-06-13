// NSE layer (Layer 3 of the news ingestion): the NSE India primary-disclosure JSON adapter. Tests the
// date normalizer, row→RawArticle mapping for both endpoints, the lookback filter, per-endpoint
// failure isolation, and the 401 → cookie-prime → retry path. All with mocked fetch, no network.
// Run: npx tsx test/nse.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { fetchNse, nseDate } from '../src/news/sources/nse'

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
const now = () => new Date('2026-06-13T12:00:00Z')

// minimal Response-like shape the adapter consumes
function res(status: number, body: any, setCookie?: string[]) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    headers: { get: () => null, getSetCookie: () => setCookie || [] },
  }
}

const ANNOUNCE = [
  { sm_name: 'Asian Paints Limited', symbol: 'ASIANPAINT', desc: 'Copy of Newspaper Publication', attchmntText: 'Newspaper Publication regarding Notice of 80th AGM', attchmntFile: 'https://nsearchives.nseindia.com/corporate/ASIANPAINT_x.pdf', sort_date: '2026-06-13 11:52:46', seq_id: 1 },
  { sm_name: 'NoAttach Ltd', symbol: 'NOATT', attchmntText: 'Board approved buyback of equity shares', sort_date: '2026-06-13 10:00:00', seq_id: 42 }, // no attchmntFile → constructed URL
  { sm_name: 'Stale Corp', symbol: 'STALE', attchmntText: 'Old filing from days ago', attchmntFile: 'https://nsearchives.nseindia.com/corporate/STALE.pdf', sort_date: '2026-06-01 09:00:00', seq_id: 7 }, // older than lookback
]
const BOARD = [
  { sm_name: 'Diamond Power Infrastructure Limited', bm_symbol: 'DIACABS', bm_date: '18-Jun-2026', bm_purpose: 'Board Meeting Intimation', bm_timestamp: '12-Jun-2026 23:09:32', attachment: 'https://nsearchives.nseindia.com/corporate/xbrl/DIACABS_BM.xml' },
]
const BSE_ROWS = [
  { SLONGNAME: 'Janus Corporation Ltd', HEADLINE: 'Declaration under Reg 31(4) of SEBI (SAST) Regulations', ATTACHMENTNAME: 'abc-123.pdf', News_submission_dt: '2026-06-13T11:40:07', NEWSID: 'nid1' },
  { SLONGNAME: 'TextOnly Ltd', NEWSSUB: 'TextOnly Ltd - 500001 - Some company update', ATTACHMENTNAME: '', NSURL: 'https://www.bseindia.com/stock-share-price/textonly/txt/500001/', NEWSID: 'nid2', DT_TM: '2026-06-13T10:00:00.123' },
  { SLONGNAME: 'Stale BSE Co', HEADLINE: 'Old filing', ATTACHMENTNAME: 'old.pdf', News_submission_dt: '2026-06-01T09:00:00', NEWSID: 'nid3' }, // dropped by lookback
]

await check('nseDate: parses NSE/BSE date shapes (incl. fractional secs) to ISO with IST offset', () => {
  assert.equal(nseDate('2026-06-13 15:52:46'), '2026-06-13T15:52:46+05:30')
  assert.equal(nseDate('2026-06-13T16:40:07.747'), '2026-06-13T16:40:07+05:30') // BSE fractional secs
  assert.equal(nseDate('13-Jun-2026 15:52:46'), '2026-06-13T15:52:46+05:30')
  assert.equal(nseDate('18-Jun-2026'), '2026-06-18T00:00:00+05:30')
  assert.equal(nseDate('garbage'), null)
  assert.equal(nseDate(''), null)
})

await check('fetchNse: BSE rows → RawArticles (via:nse, bseindia.com), PDF + NSURL#id urls', async () => {
  const fetchFn = (async (url: string) => {
    if (url.includes('AnnSubCategoryGetData')) return res(200, { Table: BSE_ROWS })
    return res(200, []) // NSE endpoints empty
  }) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 2) // Janus + TextOnly; Stale dropped by lookback
  assert.ok(arts.every((a) => a.via === 'nse'))
  const janus = arts.find((a) => a.title.startsWith('Janus Corporation Ltd'))!
  assert.equal(janus.url, 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/abc-123.pdf')
  assert.equal(janus.domain, 'www.bseindia.com') // firewall matches bseindia.com on the dot boundary
  const textonly = arts.find((a) => a.title.startsWith('TextOnly Ltd'))!
  assert.equal(textonly.url, 'https://www.bseindia.com/stock-share-price/textonly/txt/500001/#nid2') // NSURL + #NEWSID
})

await check('fetchNse: maps announcements + board meetings to RawArticles tagged via:nse', async () => {
  const fetchFn = (async (url: string) => {
    if (url.includes('corporate-announcements')) return res(200, ANNOUNCE)
    if (url.includes('corporate-board-meetings')) return res(200, BOARD)
    return res(404, '')
  }) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  // ASIANPAINT + NOATT from announcements (STALE dropped by lookback) + DIACABS board meeting = 3
  assert.equal(arts.length, 3)
  assert.ok(arts.every((a) => a.via === 'nse'))
  const ap = arts.find((a) => a.url.includes('ASIANPAINT'))!
  assert.ok(ap.title.startsWith('Asian Paints Limited: Newspaper Publication'))
  assert.equal(ap.domain, 'nsearchives.nseindia.com') // firewall matches nseindia.com on the dot boundary
  assert.ok(ap.seendate.startsWith('2026-06-13T'))
})

await check('fetchNse: a row without an attachment gets a constructed nseindia.com URL (firewall-passable)', async () => {
  const fetchFn = (async (url: string) => (url.includes('announcements') ? res(200, [ANNOUNCE[1]]) : res(200, []))) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 1)
  assert.ok(/^https:\/\/www\.nseindia\.com\//.test(arts[0].url))
  assert.equal(new URL(arts[0].url).hostname, 'www.nseindia.com')
})

await check('fetchNse: lookback drops rows older than the window', async () => {
  const fetchFn = (async (url: string) => (url.includes('announcements') ? res(200, [ANNOUNCE[2]]) : res(200, []))) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 0) // STALE is 12 days old
})

await check('fetchNse: one failing endpoint is isolated — the other still yields', async () => {
  const fetchFn = (async (url: string) => {
    if (url.includes('announcements')) return res(500, 'boom')
    return res(200, BOARD)
  }) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  assert.equal(arts.length, 1) // board meeting survived the announcements failure
  assert.equal(arts[0].domain, 'nsearchives.nseindia.com')
})

await check('fetchNse: a 401 triggers a cookie prime from the homepage, then a successful retry', async () => {
  let sawCookieOnRetry = false
  let apiCalls = 0
  const fetchFn = (async (url: string, init: any) => {
    if (url === 'https://www.nseindia.com/') return res(200, '<html/>', ['nsit=abc; Path=/', 'bm_sv=def; Path=/'])
    if (url.includes('announcements')) {
      apiCalls++
      if (apiCalls === 1) return res(401, '') // first call unauthorized
      sawCookieOnRetry = init?.headers?.cookie === 'nsit=abc; bm_sv=def'
      return res(200, [ANNOUNCE[0]])
    }
    return res(200, [])
  }) as unknown as typeof fetch
  const arts = await fetchNse({ baseUrl: 'https://www.nseindia.com', lookbackHours: 24, timeoutMs: 2000 }, { fetchFn, sleep: noSleep, now })
  assert.equal(sawCookieOnRetry, true) // primed cookie was sent on the retry
  assert.equal(arts.length, 1)
})

console.log(`\n${passed} checks passed`)
