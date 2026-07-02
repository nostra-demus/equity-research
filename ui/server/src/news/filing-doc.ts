// The filing-document read — fetch the ACTUAL disclosure, not the page around it. Exchange filing
// events link to viewer/interstitial pages (the ASX announcements page serves a terms-of-use dialog;
// HKEX/NSE/BSE link straight to PDFs the HTML reader can't open), so the old reader either leaked the
// interstitial text as "the story" or fell to the headline floor — while the primary source (§4 tier 1-2:
// the filing itself) sat one fetch away. This module resolves the event URL to the real document, fetches
// it with hard byte/time bounds, and extracts its text (news/pdf-text.ts) so the LLM read can lead with
// the announcement's own words.
//
// SSRF posture mirrors enrich.isSafeFetchUrl: https-only, no userinfo, default port, and the host must
// be either an approved news-source domain (sources/approved-domains.ts) or the one document CDN the
// resolution itself derives (the ASX/markitdigital research gateway — the exact host the asx.com.au
// viewer loads its PDFs from). Redirects are re-validated per hop. Never throws.

import { lookupSource } from './sources/approved-domains'
import { extractPdfText, looksLikePdf } from './pdf-text'

// The ASX announcement viewer (www.asx.com.au/markets/trade-our-cash-market/announcements.<SYM>?key=<docKey>)
// is an app shell behind a terms interstitial; the document itself is served by the ASX research gateway
// keyed by the SAME documentKey the adapter put in the URL (sources/exchange-intl.ts).
const ASX_DOC_HOST = 'cdn-api.markitdigital.com'
const ASX_DOC_BASE = `https://${ASX_DOC_HOST}/apiman-gateway/ASX/asx-research/1.0/file/`
// documentKey shape from the ASX announcements API, e.g. "2924-03106938-6A1332187" — validated strictly
// so a crafted key can never smuggle a path or query into the doc URL.
const ASX_DOC_KEY_RE = /^[0-9]{3,6}-[0-9]{6,12}-[0-9A-Z]{6,16}$/i

export interface FilingDocRef {
  docUrl: string
  kind: 'asx' | 'pdf'
}

/** Resolve an event's stored URL to the real disclosure document, when one is derivable. */
export function resolveFilingDocUrl(rawUrl: string): FilingDocRef | null {
  let u: URL
  try { u = new URL(String(rawUrl || '')) } catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  const host = u.hostname.toLowerCase()
  if (/(^|\.)asx\.com\.au$/.test(host) && /\/announcements\.[A-Z0-9]{1,6}$/i.test(u.pathname)) {
    const key = (u.searchParams.get('key') || '').trim()
    if (ASX_DOC_KEY_RE.test(key)) return { docUrl: `${ASX_DOC_BASE}${encodeURIComponent(key)}`, kind: 'asx' }
    return null // the adapter falls back to key=<headline> when the API omitted documentKey — not a doc
  }
  if (/\.pdf(?:[?#]|$)/i.test(u.pathname + u.search) && lookupSource(host)) return { docUrl: u.toString(), kind: 'pdf' }
  return null
}

/** SSRF gate for document fetches: approved-source domains plus the derived ASX doc CDN. Exported for tests. */
export function isSafeDocUrl(raw: string): boolean {
  let u: URL
  try { u = new URL(raw) } catch { return false }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
  if (u.username || u.password) return false
  if (u.port && u.port !== '80' && u.port !== '443') return false
  const host = u.hostname.toLowerCase()
  if (!host || host.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false
  return host === ASX_DOC_HOST || !!lookupSource(host)
}

export interface FilingDocText {
  ok: boolean
  text?: string
  note?: string
}

const DOC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
// PDF page furniture that isn't disclosure text — the ASX side-watermark and page numbers
const DOC_FURNITURE_RE = /^(?:for personal use only|page(?:\s+\d+(?:\s+of\s+\d+)?)?|\d{1,3})$/i

export interface FetchFilingDocDeps {
  fetchFn?: typeof fetch
  timeoutMs?: number // whole-fetch ceiling (default 8000)
  maxBytes?: number // refuse documents larger than this (default 10 MB)
}

/**
 * Fetch a filing document and extract its text. Bounded (bytes + wall clock), redirect hops
 * re-validated, never throws. `ok:false` carries a plain note for the honest degrade path.
 */
export async function fetchFilingDocText(docUrl: string, deps: FetchFilingDocDeps = {}): Promise<FilingDocText> {
  const fetchFn = deps.fetchFn || fetch
  const timeoutMs = deps.timeoutMs ?? 8000
  const maxBytes = deps.maxBytes ?? 10_000_000
  let current = docUrl
  for (let hop = 0; hop < 3; hop++) {
    if (!isSafeDocUrl(current)) return { ok: false, note: 'filing document is not on an approved host' }
    let res: Response
    try {
      res = await fetchFn(current, {
        headers: { 'user-agent': DOC_UA, accept: 'application/pdf,application/octet-stream,*/*;q=0.8' },
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'manual',
      })
    } catch (e: any) {
      return { ok: false, note: e?.name === 'TimeoutError' ? 'filing document timed out' : 'could not reach the filing document' }
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return { ok: false, note: `filing document returned HTTP ${res.status}` }
      try { current = new URL(loc, current).toString() } catch { return { ok: false, note: 'bad filing-document redirect' } }
      continue
    }
    if (!res.ok) return { ok: false, note: `filing document returned HTTP ${res.status}` }
    const len = Number(res.headers.get('content-length'))
    if (Number.isFinite(len) && len > maxBytes) return { ok: false, note: 'filing document too large' }
    let buf: Buffer
    try { buf = Buffer.from(await res.arrayBuffer()) } catch { return { ok: false, note: 'could not read the filing document' } }
    if (buf.length > maxBytes) return { ok: false, note: 'filing document too large' }
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (!/pdf|octet-stream/.test(ct) && !looksLikePdf(buf)) return { ok: false, note: 'filing document is not a PDF' }
    if (!looksLikePdf(buf)) return { ok: false, note: 'filing document is not a readable PDF' }
    const raw = extractPdfText(buf)
    if (!raw) return { ok: false, note: 'filing document carries no extractable text (a scanned or protected PDF)' }
    // strip page furniture; the disclosure prose is what the read needs
    const text = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !DOC_FURNITURE_RE.test(l))
      .join('\n')
    const letters = (text.match(/[A-Za-z]/g) || []).length
    if (letters < 120) return { ok: false, note: 'filing document text too thin to read' }
    return { ok: true, text }
  }
  return { ok: false, note: 'too many filing-document redirects' }
}
