// Layer 3 of the ingestion stack: India exchange primary-disclosure JSON APIs (NSE + BSE). Unlike
// GDELT (news) and RSS (press), this reads the exchanges THEMSELVES — corporate announcements and
// board-meeting intimations that companies file with NSE/BSE, the highest-signal India source (every
// material disclosure lands here first, ahead of the press). Neither exposes RSS, so each needs a
// small bespoke JSON adapter; both map to the same approved source ("BSE / NSE Exchange Filing").
//
// Access notes (verified live): NSE wants a browser UA + accept:json + referer, and primes a session
// cookie from its homepage on the odd 401/403. BSE wants the AnnSubCategoryGetData endpoint with EMPTY
// dates (a date range returns "No Record Found!") + a referer; no cookie needed. Dependency-free and
// resilient: a failing endpoint degrades to fewer items + a log line, never an error. Items still pass
// the approved-domains firewall on their nseindia.com / bseindia.com link domain.

import type { RawArticle } from '../types'

export interface NseOptions {
  baseUrl: string // NSE base, e.g. https://www.nseindia.com (also the cookie-prime homepage)
  lookbackHours: number // drop rows older than this (the APIs return a backlog; seen-cache dedups the rest)
  timeoutMs: number
  userAgent?: string
}

export interface NseDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

/** Normalize the date shapes NSE/BSE emit to ISO 8601 with the IST offset. Handles
 *  "2026-06-13 15:52:46", "2026-06-13T16:40:07.747" (BSE, fractional secs), "13-Jun-2026 15:52:46",
 *  and "18-Jun-2026". */
export function nseDate(s: string | null | undefined): string | null {
  const t = (s || '').trim()
  if (!t) return null
  let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/.exec(t)
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+05:30`
  m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/.exec(t)
  if (m) {
    const mon = MONTHS[m[2].toLowerCase()]
    if (!mon) return null
    const dd = m[1].padStart(2, '0')
    const hh = m[4] || '00', mi = m[5] || '00', ss = m[6] || '00'
    return `${m[3]}-${mon}-${dd}T${hh}:${mi}:${ss}+05:30`
  }
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function httpOr(v: any): string | null {
  return typeof v === 'string' && /^https?:\/\//i.test(v.trim()) ? v.trim() : null
}
const enc = (v: any) => encodeURIComponent(String(v ?? '').trim())
// BSE SQL-escapes apostrophes as '' in its JSON text — collapse them; never legitimate in a headline.
const clean = (s: string) => s.replace(/''/g, "'").replace(/\s+/g, ' ').trim()

interface Endpoint {
  key: string
  url: string // absolute
  rowsPath: '' | 'data' | 'Table' // where the array lives in the JSON body
  headers?: Record<string, string> // extra per-endpoint request headers
  primeOn401?: boolean // prime a session cookie from baseUrl on a 401/403, then retry (NSE)
  toArticle: (row: any) => { title: string; url: string; date: string | null } | null
}

const NSE = 'https://www.nseindia.com'
const BSE_REF = { referer: 'https://www.bseindia.com/corporates/ann.html', origin: 'https://www.bseindia.com' }

// The cleanest, highest-value endpoints per exchange. Circulars/derivatives/operational feeds are
// intentionally omitted as exchange noise.
const ENDPOINTS: Endpoint[] = [
  {
    key: 'nse-announcements',
    url: `${NSE}/api/corporate-announcements?index=equities`,
    rowsPath: '',
    primeOn401: true,
    toArticle: (r) => {
      const company = String(r.sm_name || r.symbol || '').trim()
      const text = String(r.attchmntText || r.desc || '').trim()
      if (!company && !text) return null
      const title = clean(`${company}${company && text ? ': ' : ''}${text}`)
      const url = httpOr(r.attchmntFile) || `${NSE}/companies-listing/corporate-filings-announcements?symbol=${enc(r.symbol)}&seq=${enc(r.seq_id)}`
      return { title, url, date: nseDate(r.sort_date || r.an_dt) }
    },
  },
  {
    key: 'nse-board-meetings',
    url: `${NSE}/api/corporate-board-meetings?index=equities`,
    rowsPath: '',
    primeOn401: true,
    toArticle: (r) => {
      const company = String(r.sm_name || r.bm_symbol || '').trim()
      const purpose = String(r.bm_purpose || r.bm_desc || '').trim()
      if (!company) return null
      const title = clean(`${company}: board meeting ${r.bm_date || ''}${purpose ? ' — ' + purpose : ''}`)
      const url = httpOr(r.attachment) || `${NSE}/companies-listing/corporate-filings-board-meetings?symbol=${enc(r.bm_symbol)}&dt=${enc(r.bm_date)}`
      return { title, url, date: nseDate(r.bm_timestamp || r.bm_date) }
    },
  },
  {
    key: 'bse-announcements',
    // EMPTY dates = "latest" (a date range returns No Record Found!); AnnSubCategoryGetData is the
    // endpoint that actually returns rows. strType=C (company), strSearch=P, subcategory=-1 (all).
    url: 'https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=-1&strPrevDate=&strToDate=&strSearch=P&strscrip=&strType=C&subcategory=-1',
    rowsPath: 'Table',
    headers: BSE_REF,
    toArticle: (r) => {
      const company = String(r.SLONGNAME || '').trim()
      const text = String(r.HEADLINE || r.NEWSSUB || '').trim()
      if (!company && !text) return null
      const title = clean(`${company}${company && text ? ': ' : ''}${text}`)
      const att = typeof r.ATTACHMENTNAME === 'string' && r.ATTACHMENTNAME.trim() ? r.ATTACHMENTNAME.trim() : ''
      const url = att
        ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${enc(att)}`
        : (httpOr(r.NSURL) ? `${r.NSURL}#${enc(r.NEWSID)}` : `https://www.bseindia.com/corporates/ann.html#${enc(r.NEWSID)}`)
      return { title, url, date: nseDate(r.News_submission_dt || r.DT_TM || r.NEWS_DT) }
    },
  },
]

function rowsOf(j: any, path: '' | 'data' | 'Table'): any[] {
  if (path === '') return Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : []
  const v = j?.[path]
  return Array.isArray(v) ? v : []
}

/**
 * Pull recent NSE + BSE corporate disclosures as RawArticles tagged via:'nse'. Never throws. Each
 * endpoint is isolated; NSE primes a cookie + retries on a 401/403. Deduped by URL across endpoints.
 */
export async function fetchNse(opts: NseOptions, deps: NseDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = deps.now || (() => new Date())
  const log = deps.log || (() => {})
  const ua = opts.userAgent || BROWSER_UA
  const base = opts.baseUrl.replace(/\/+$/, '')
  const oldestMs = now().getTime() - opts.lookbackHours * 3600_000
  let cookie = ''

  const apiFetch = async (ep: Endpoint): Promise<any | null> => {
    const headers = (): Record<string, string> => {
      const h: Record<string, string> = { 'user-agent': ua, accept: 'application/json, text/plain, */*', referer: base + '/', ...(ep.headers || {}) }
      if (cookie) h.cookie = cookie
      return h
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        let res = await fetchFn(ep.url, { headers: headers(), signal: ctrl.signal })
        if (ep.primeOn401 && (res.status === 401 || res.status === 403) && !cookie) {
          try {
            const home = await fetchFn(base + '/', { headers: { 'user-agent': ua, accept: 'text/html' }, signal: ctrl.signal })
            const sc = (home.headers as any).getSetCookie?.() as string[] | undefined
            if (sc?.length) cookie = sc.map((c) => c.split(';')[0]).join('; ')
          } catch {
            /* priming is best-effort */
          }
          res = await fetchFn(ep.url, { headers: headers(), signal: ctrl.signal })
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        try {
          return JSON.parse(text)
        } catch {
          throw new Error('non-JSON body')
        }
      } catch (e: any) {
        if (attempt === 3) {
          log(`nse ${ep.key}: ${e?.name === 'AbortError' ? 'timeout' : e?.message || e}, gave up`)
          return null
        }
        await sleep(1200 * attempt)
      } finally {
        clearTimeout(timer)
      }
    }
    return null
  }

  const out: RawArticle[] = []
  const seen = new Set<string>()
  for (let i = 0; i < ENDPOINTS.length; i++) {
    const ep = ENDPOINTS[i]
    const json = await apiFetch(ep)
    if (json) {
      for (const row of rowsOf(json, ep.rowsPath)) {
        const a = ep.toArticle(row)
        if (!a || !a.title || a.title.length < 8 || !/^https?:\/\//i.test(a.url)) continue
        const d = a.date ? new Date(a.date) : null
        const fresh = !d || Number.isNaN(d.getTime()) || d.getTime() >= oldestMs
        if (!fresh) continue
        if (seen.has(a.url)) continue
        seen.add(a.url)
        let domain: string
        try {
          domain = new URL(a.url).hostname
        } catch {
          continue
        }
        out.push({
          title: a.title.slice(0, 500),
          url: a.url,
          domain,
          seendate: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d{3}Z$/, 'Z') : now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
          via: 'nse',
        })
      }
    }
    if (i < ENDPOINTS.length - 1) await sleep(800) // be polite to the shared exchange hosts
  }
  return out
}
