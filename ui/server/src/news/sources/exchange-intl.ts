// Layer 3 (international) of the ingestion stack: non-India exchange primary-disclosure JSON APIs.
// Like nse.ts reads NSE/BSE, this reads the exchanges THEMSELVES — the company announcements issuers
// file with the Hong Kong (HKEXnews) and Australian (ASX) markets, the highest-signal source for those
// regions (every material disclosure lands here first, ahead of the press). Neither exposes RSS, so
// each needs a small bespoke JSON adapter. Items pass the approved-domains firewall on their
// hkexnews.hk / asx.com.au link domain (NOT the API host — ASX's API sits on a shared CDN).
//
// Resilient by design (mirrors fetchNse): a failing endpoint degrades to fewer items + a log line,
// never an error; results are deduped by URL and freshness-filtered against the look-back window.

import type { RawArticle } from '../types'

export interface ExchangeIntlOptions {
  lookbackHours: number // drop rows older than this (the seen-cache dedups the rest)
  timeoutMs: number
  userAgent?: string
  hkexBaseUrl?: string // default https://www1.hkexnews.hk
  asxBaseUrl?: string // default https://asx.api.markitdigital.com
}

export interface ExchangeIntlDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const clean = (s: string) => String(s ?? '').replace(/<br\s*\/?>(?=.)/gi, ' ').replace(/\s+/g, ' ').trim()
const yyyymmdd = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`

/** Parse HKEX's "dd/mm/yyyy hh:mm" (Hong Kong local, UTC+08) to ISO. */
export function hkexDate(s: string | null | undefined): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec((s || '').trim())
  if (!m) return null
  const [, dd, mm, yyyy, hh = '00', mi = '00'] = m
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${hh.padStart(2, '0')}:${mi}:00+08:00`
}

// fetch JSON with up to 3 tries + backoff; never throws (returns null on give-up). Mirrors fetchNse.apiFetch.
async function getJson(
  url: string, opts: ExchangeIntlOptions, deps: Required<Pick<ExchangeIntlDeps, 'fetchFn' | 'sleep' | 'log'>>, label: string,
): Promise<any | null> {
  const ua = opts.userAgent || BROWSER_UA
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
    try {
      const res = await deps.fetchFn(url, { headers: { 'user-agent': ua, accept: 'application/json, text/plain, */*' }, signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      try { return JSON.parse(text) } catch { throw new Error('non-JSON body') }
    } catch (e: any) {
      if (attempt === 3) { deps.log(`${label}: ${e?.name === 'AbortError' ? 'timeout' : e?.message || e}, gave up`); return null }
      await deps.sleep(1200 * attempt)
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

function pushFresh(out: RawArticle[], seen: Set<string>, oldestMs: number, now: Date, a: { title: string; url: string; date: string | null; via: 'asx' | 'hkex' }): void {
  if (!a.title || a.title.length < 8 || !/^https?:\/\//i.test(a.url) || seen.has(a.url)) return
  const d = a.date ? new Date(a.date) : null
  if (d && !Number.isNaN(d.getTime()) && d.getTime() < oldestMs) return // older than the window
  let domain: string
  try { domain = new URL(a.url).hostname } catch { return }
  seen.add(a.url)
  out.push({
    title: a.title.slice(0, 500),
    url: a.url,
    domain,
    seendate: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d{3}Z$/, 'Z') : now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    via: a.via,
  })
}

// ASX admin/noise announcement types that waste triage budget — never carry a thesis.
const ASX_NOISE = new Set(['End of Day', 'Daily Buy Back', 'Daily share buy-back notice'])

/** Australian Securities Exchange — market-wide company announcements (latest ~25, price-sensitive flagged). */
export async function fetchAsx(opts: ExchangeIntlOptions, deps: Required<Pick<ExchangeIntlDeps, 'fetchFn' | 'sleep' | 'log'>>, now: Date, out: RawArticle[], seen: Set<string>, oldestMs: number): Promise<void> {
  const base = (opts.asxBaseUrl || 'https://asx.api.markitdigital.com').replace(/\/+$/, '')
  const j = await getJson(`${base}/asx-research/1.0/markets/announcements`, opts, deps, 'asx announcements')
  const items: any[] = Array.isArray(j?.data?.items) ? j.data.items : []
  for (const r of items) {
    const symbol = String(r?.symbol || '').trim()
    const headline = clean(r?.headline || (Array.isArray(r?.announcementTypes) ? r.announcementTypes.join(', ') : ''))
    const docKey = String(r?.documentKey || '').trim()
    if (!symbol || !headline || ASX_NOISE.has(headline)) continue
    const ps = r?.isPriceSensitive ? ' [price-sensitive]' : ''
    const url = `https://www.asx.com.au/markets/trade-our-cash-market/announcements.${encodeURIComponent(symbol)}?key=${encodeURIComponent(docKey || headline)}`
    pushFresh(out, seen, oldestMs, now, { title: `${symbol}: ${headline}${ps}`, url, date: typeof r?.date === 'string' ? r.date : null, via: 'asx' })
  }
}

/** HKEXnews — Hong Kong Main Board (SEHK) listed-company filings over the look-back window. */
export async function fetchHkex(opts: ExchangeIntlOptions, deps: Required<Pick<ExchangeIntlDeps, 'fetchFn' | 'sleep' | 'log'>>, now: Date, out: RawArticle[], seen: Set<string>, oldestMs: number): Promise<void> {
  const base = (opts.hkexBaseUrl || 'https://www1.hkexnews.hk').replace(/\/+$/, '')
  const from = yyyymmdd(new Date(now.getTime() - Math.max(1, opts.lookbackHours) * 3600_000))
  const to = yyyymmdd(now)
  const url = `${base}/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=-1&documentType=-1&fromDate=${from}&toDate=${to}&title=&searchType=1&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=100&lang=en`
  const j = await getJson(url, opts, deps, 'hkex titleSearch')
  // body is { result: "<json-string>" } — the result value is itself JSON (an array of rows)
  let rows: any[] = []
  try {
    const inner = typeof j?.result === 'string' ? JSON.parse(j.result) : j?.result
    rows = Array.isArray(inner) ? inner : Array.isArray(inner?.result) ? inner.result : []
  } catch { rows = [] }
  for (const r of rows) {
    const name = clean(r?.STOCK_NAME || '')
    const code = String(r?.STOCK_CODE || '').trim()
    const title = clean(r?.TITLE || r?.LONG_TEXT || r?.SHORT_TEXT || '')
    const link = String(r?.FILE_LINK || '').trim()
    if (!title || !link) continue
    const full = `${name}${code ? ` (${code})` : ''}: ${title}`
    const fileUrl = /^https?:\/\//i.test(link) ? link : `${base}${link.startsWith('/') ? '' : '/'}${link}`
    pushFresh(out, seen, oldestMs, now, { title: full, url: fileUrl, date: hkexDate(r?.DATE_TIME), via: 'hkex' })
  }
}

/**
 * Pull recent HK + AU exchange disclosures as RawArticles. Never throws. Each market is isolated, so
 * one failing never blocks the other or the cycle. Deduped by URL, freshness-filtered to lookbackHours.
 */
export async function fetchExchangeIntl(opts: ExchangeIntlOptions, deps: ExchangeIntlDeps = {}): Promise<RawArticle[]> {
  const d = {
    fetchFn: deps.fetchFn || fetch,
    sleep: deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms))),
    log: deps.log || (() => {}),
  }
  const now = (deps.now || (() => new Date()))()
  const oldestMs = now.getTime() - opts.lookbackHours * 3600_000
  const out: RawArticle[] = []
  const seen = new Set<string>()
  // sequential + a polite gap so we never hammer either exchange host
  await fetchHkex(opts, d, now, out, seen, oldestMs)
  await d.sleep(600)
  await fetchAsx(opts, d, now, out, seen, oldestMs)
  return out
}
