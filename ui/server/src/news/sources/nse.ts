// Layer 3 of the ingestion stack: the NSE India primary-disclosure JSON API. Unlike GDELT (news) and
// RSS (press), this reads the exchange ITSELF — corporate announcements and board-meeting intimations
// that companies file with NSE, the highest-signal India source (every material disclosure lands here
// first, ahead of the press). No public RSS exists for it, so it needs a small bespoke adapter.
//
// Access: a plain browser User-Agent + an accept:json + a referer is enough (verified live); on the
// odd 401/403 NSE wants a session cookie, so we prime one from the homepage and retry once. Dependency-
// free, resilient by construction (a failing endpoint degrades to fewer items + a log line, never an
// error), and the items still pass the approved-domains firewall on their nseindia.com link domain.

import type { RawArticle } from '../types'

export interface NseOptions {
  baseUrl: string // https://www.nseindia.com
  lookbackHours: number // drop rows older than this (NSE returns the day's backlog; seen-cache dedups the rest)
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

/** Normalize the date shapes NSE emits to ISO 8601 (UTC-naive → keep as IST offset +05:30).
 *  Handles "2026-06-13 15:52:46" (sort_date), "13-Jun-2026 15:52:46" and "18-Jun-2026". */
export function nseDate(s: string | null | undefined): string | null {
  const t = (s || '').trim()
  if (!t) return null
  let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(t)
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
const clean = (s: string) => s.replace(/\s+/g, ' ').trim()

interface Endpoint {
  key: string
  path: string
  toArticle: (row: any, base: string) => { title: string; url: string; date: string | null } | null
}

// Only the two cleanest, highest-value endpoints: company disclosures and board-meeting intimations.
// Both carry a company name, a stable nseindia.com link, and a timestamp. Circulars/derivatives are
// exchange-operational noise and intentionally omitted.
const ENDPOINTS: Endpoint[] = [
  {
    key: 'announcements',
    path: '/api/corporate-announcements?index=equities',
    toArticle: (r, base) => {
      const company = String(r.sm_name || r.symbol || '').trim()
      const text = String(r.attchmntText || r.desc || '').trim()
      if (!company && !text) return null
      const title = clean(`${company}${company && text ? ': ' : ''}${text}`)
      const url = httpOr(r.attchmntFile) || `${base}/companies-listing/corporate-filings-announcements?symbol=${enc(r.symbol)}&seq=${enc(r.seq_id)}`
      return { title, url, date: nseDate(r.sort_date || r.an_dt) }
    },
  },
  {
    key: 'board-meetings',
    path: '/api/corporate-board-meetings?index=equities',
    toArticle: (r, base) => {
      const company = String(r.sm_name || r.bm_symbol || '').trim()
      const purpose = String(r.bm_purpose || r.bm_desc || '').trim()
      if (!company) return null
      const title = clean(`${company}: board meeting ${r.bm_date || ''}${purpose ? ' — ' + purpose : ''}`)
      const url = httpOr(r.attachment) || `${base}/companies-listing/corporate-filings-board-meetings?symbol=${enc(r.bm_symbol)}&dt=${enc(r.bm_date)}`
      return { title, url, date: nseDate(r.bm_timestamp || r.bm_date) }
    },
  },
]

function rowsOf(j: any): any[] {
  if (Array.isArray(j)) return j
  if (Array.isArray(j?.data)) return j.data
  return []
}

/**
 * Pull recent NSE corporate disclosures and return them as RawArticles tagged via:'nse'. Never throws.
 * Each endpoint is isolated; a 401/403 triggers a one-time cookie prime + retry. Deduped by URL.
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

  const apiFetch = async (url: string): Promise<any | null> => {
    const headers = (): Record<string, string> => {
      const h: Record<string, string> = { 'user-agent': ua, accept: 'application/json, text/plain, */*', referer: base + '/' }
      if (cookie) h.cookie = cookie
      return h
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        let res = await fetchFn(url, { headers: headers(), signal: ctrl.signal })
        if ((res.status === 401 || res.status === 403) && !cookie) {
          // prime a session cookie from the homepage, then retry once
          try {
            const home = await fetchFn(base + '/', { headers: { 'user-agent': ua, accept: 'text/html' }, signal: ctrl.signal })
            const sc = (home.headers as any).getSetCookie?.() as string[] | undefined
            if (sc?.length) cookie = sc.map((c) => c.split(';')[0]).join('; ')
          } catch {
            /* priming is best-effort */
          }
          res = await fetchFn(url, { headers: headers(), signal: ctrl.signal })
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
          log(`nse ${url.replace(base, '')}: ${e?.name === 'AbortError' ? 'timeout' : e?.message || e}, gave up`)
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
    const json = await apiFetch(base + ep.path)
    if (json) {
      for (const row of rowsOf(json)) {
        const a = ep.toArticle(row, base)
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
    if (i < ENDPOINTS.length - 1) await sleep(800) // be polite to the shared NSE host
  }
  return out
}
