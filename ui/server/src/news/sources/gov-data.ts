// Layer 3 (US regulatory JSON) of the ingestion stack: keyless openFDA APIs — drug recalls, device
// recalls, and 510(k) device clearances. These are primary regulatory actions (biotech/pharma/medtech
// catalysts) that have NO usable RSS, only JSON, so like nse.ts / exchange-intl.ts they need a small
// adapter. Items carry a stable, unique, firewall-passing fda.gov URL so they pass Gate 0 and dedup
// cleanly. Resilient: a failing endpoint degrades to fewer items + a log line, never an error.

import type { RawArticle } from '../types'

export interface GovDataOptions {
  lookbackDays: number // drop rows whose report/decision date is older than this (seen-cache dedups the rest)
  timeoutMs: number
  perEndpoint?: number // rows pulled per endpoint (sort=desc) — default 50
  fdaBaseUrl?: string // default https://api.fda.gov
}

export interface GovDataDeps {
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

const clean = (s: any) => String(s ?? '').replace(/\s+/g, ' ').trim()
// openFDA dates: "20260603" (YYYYMMDD) or "2026-05-30" (YYYY-MM-DD) → ISO midnight UTC.
export function fdaDate(s: any): string | null {
  const t = clean(s)
  let m = /^(\d{4})(\d{2})(\d{2})$/.exec(t) || /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}T00:00:00Z`
}

interface Endpoint {
  key: string
  path: string // appended to fdaBaseUrl; carries its own sort=…:desc
  toArticle: (row: any) => { title: string; url: string; date: string | null } | null
}

// The high-signal openFDA surfaces. drug/device ENFORCEMENT = recalls; device/510k = new clearances.
// (drug approvals are already covered by the Drugs.com + DailyMed RSS feeds; CFTC COT is intentionally
// NOT wired — ~200 low-signal market rows/week.)
const ENDPOINTS: Endpoint[] = [
  {
    key: 'fda-drug-recall',
    path: '/drug/enforcement.json?sort=report_date:desc',
    toArticle: (r) => {
      const firm = clean(r.recalling_firm), prod = clean(r.product_description), why = clean(r.reason_for_recall)
      const num = clean(r.recall_number)
      if (!firm || !prod || !num) return null
      const cls = clean(r.classification)
      const title = `FDA drug recall${cls ? ` (${cls})` : ''} — ${firm}: ${prod.slice(0, 160)}${why ? ` — ${why.slice(0, 120)}` : ''}`
      return { title, url: `https://api.fda.gov/drug/enforcement.json?search=recall_number.exact:%22${encodeURIComponent(num)}%22`, date: fdaDate(r.report_date) }
    },
  },
  {
    key: 'fda-device-recall',
    path: '/device/enforcement.json?sort=report_date:desc',
    toArticle: (r) => {
      const firm = clean(r.recalling_firm), prod = clean(r.product_description), why = clean(r.reason_for_recall)
      const num = clean(r.recall_number)
      if (!firm || !prod || !num) return null
      const cls = clean(r.classification)
      const title = `FDA device recall${cls ? ` (${cls})` : ''} — ${firm}: ${prod.slice(0, 160)}${why ? ` — ${why.slice(0, 120)}` : ''}`
      return { title, url: `https://api.fda.gov/device/enforcement.json?search=recall_number.exact:%22${encodeURIComponent(num)}%22`, date: fdaDate(r.report_date) }
    },
  },
  {
    key: 'fda-device-510k',
    path: '/device/510k.json?sort=decision_date:desc',
    toArticle: (r) => {
      const applicant = clean(r.applicant), device = clean(r.device_name), k = clean(r.k_number)
      if (!applicant || !device || !k) return null
      const title = `FDA 510(k) clearance — ${applicant}: ${device.slice(0, 180)}`
      // a real human page on accessdata.fda.gov (endsWith fda.gov → firewall-covered)
      return { title, url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${encodeURIComponent(k)}`, date: fdaDate(r.decision_date) }
    },
  },
]

/**
 * Pull recent openFDA regulatory actions as RawArticles (via:'gov'). Never throws. Each endpoint is
 * isolated; rows older than lookbackDays or already seen are skipped; deduped by URL.
 */
export async function fetchGovData(opts: GovDataOptions, deps: GovDataDeps = {}): Promise<RawArticle[]> {
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = (deps.now || (() => new Date()))()
  const log = deps.log || (() => {})
  const base = (opts.fdaBaseUrl || 'https://api.fda.gov').replace(/\/+$/, '')
  const limit = opts.perEndpoint ?? 50
  const oldestMs = now.getTime() - opts.lookbackDays * 86_400_000
  const out: RawArticle[] = []
  const seen = new Set<string>()

  for (let i = 0; i < ENDPOINTS.length; i++) {
    const ep = ENDPOINTS[i]
    const url = `${base}${ep.path}&limit=${limit}`
    let rows: any[] = []
    for (let attempt = 1; attempt <= 3; attempt++) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
      try {
        const res = await fetchFn(url, { headers: { 'user-agent': 'nostra-demus-screener/1.0 (ceekay@muns.io)', accept: 'application/json' }, signal: ctrl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j: any = await res.json()
        rows = Array.isArray(j?.results) ? j.results : []
        break
      } catch (e: any) {
        if (attempt === 3) { log(`gov ${ep.key}: ${e?.name === 'AbortError' ? 'timeout' : e?.message || e}, gave up`); rows = [] }
        else await sleep(1000 * attempt)
      } finally {
        clearTimeout(timer)
      }
    }
    for (const row of rows) {
      const a = ep.toArticle(row)
      if (!a || !a.title || a.title.length < 12 || !/^https?:\/\//i.test(a.url) || seen.has(a.url)) continue
      const d = a.date ? new Date(a.date) : null
      if (d && !Number.isNaN(d.getTime()) && d.getTime() < oldestMs) continue
      seen.add(a.url)
      let domain: string
      try { domain = new URL(a.url).hostname } catch { continue }
      out.push({
        title: a.title.slice(0, 500),
        url: a.url,
        domain,
        seendate: d && !Number.isNaN(d.getTime()) ? d.toISOString().replace(/\.\d{3}Z$/, 'Z') : now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        via: 'gov',
      })
    }
    if (i < ENDPOINTS.length - 1) await sleep(400)
  }
  return out
}
