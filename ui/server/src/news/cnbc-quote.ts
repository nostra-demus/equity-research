// The shared CNBC restQuote transport — ONE keyless quote lane, used by both market-data consumers:
// the commodity pulse (news/commodity-pulse.ts, futures symbols like @GC.1) and the equity quote lane
// (news/equity-quote.ts, listed shares like AMZN / HCG-IN / NHY-NO). It exists so the URL shape, the
// browser-UA requirement, the comma-thousands number parsing and the fetch hygiene live in exactly ONE
// place instead of being copy-pasted per consumer (CLAUDE.md §2 — reuse before adding).
//
// Why CNBC (live-verified 2026-07-11 for futures, 2026-07-23 for equities): stooq's CSV quote endpoint
// 404s for every symbol and its history endpoint sits behind a JavaScript proof-of-work wall; Yahoo's v8
// chart API (query1 AND query2) fingerprints the TLS client and 429s every Node HTTP stack — undici
// fetch, node:https, cookie bootstrap, any UA — while letting curl through, so a Node server can never
// rely on it. CNBC's restQuote answers keylessly from Node, batches every symbol in ONE call, and covers
// equities worldwide (US, NSE India, Oslo, LSE, HK, Tokyo …) alongside futures.
//
// Security posture: the HOST is hardcoded here and is never configurable. Callers supply SYMBOLS only.
//
// Honest absence is the contract throughout: a row CNBC cannot price (an unknown symbol, a dead futures
// contract) yields NO entry rather than a faked or zero price (CLAUDE.md §3).

// The one host this module ever talks to.
const CNBC_HOST = 'https://quote.cnbc.com'

// CNBC's WAF INTERMITTENTLY 403s non-browser UAs (verified live 2026-07-11: the same batch URL answered
// 200 with a Mozilla UA and 403 with a plain/descriptive one minutes apart), so every CNBC call presents
// a browser-ish UA. Exported because commodity-pulse passes it explicitly through its own fetch helper.
export const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/**
 * CNBC quote REST service: ONE batch call for every symbol, pipe-joined then URL-encoded (verified live
 * from Node — keyless, no TLS fingerprinting). A bogus symbol mixed into a good batch is tolerated: it
 * comes back as an un-priced row and is simply dropped by the parser. The host is hardcoded.
 */
export function buildCnbcQuoteUrl(symbols: string[]): string {
  return `${CNBC_HOST}/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(symbols.join('|'))}&requestMethod=itv&noform=1&partnerId=2&fund=1&output=json`
}

/** Every field either consumer needs off a CNBC row. Absent/unusable values are null, never guessed. */
export interface CnbcRow {
  symbol: string
  last: number
  prevClose: number | null
  /** `last_time` normalized to ISO UTC, or null when CNBC sent nothing parseable. */
  asOf: string | null
  /**
   * True when `last_time` was a BARE date ("2026-07-22") rather than a full timestamp
   * ("2026-07-23T09:52:29.000+0500"). CNBC uses the bare form for a settled session, so this is the
   * difference between "trading now" and "that day's close" — a caller must not print a bare date as an
   * intraday time (CLAUDE.md §5: a figure carries the date it is actually as-of).
   */
  dateOnly: boolean
  name: string | null
  /**
   * `currencyCode` VERBATIM — deliberately not upper-cased. The case is load-bearing: some venues
   * signal a minor unit by case alone ("GBp" is pence, "GBP" is pounds — a factor of 100). Upper-casing
   * here would silently destroy that distinction and hand the caller a price 100x too large, so
   * normalisation is left to whoever knows the unit rules.
   */
  currency: string | null
  exchange: string | null
  /** `curmktstatus` — REG_MKT / PRE_MKT / POST_MKT / CLOSED and similar. Verbatim, never interpreted here. */
  marketStatus: string | null
  /** CNBC's own `realTime` flag ("true"/"false") — false means an exchange-delayed feed. */
  realTime: boolean | null
}

/** CNBC sends numbers as STRINGS with comma thousands separators ("4,128.90"). Null unless finite. */
function num(v: unknown): number | null {
  if (v == null) return null
  const s = String(v).replace(/,/g, '').trim()
  if (!s) return null
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : null
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

/**
 * Parse a CNBC restQuote batch response into a symbol → row map, carrying every field the callers need.
 *
 * Rows live under FormattedQuoteResult.FormattedQuote (an array, or a bare object for a single symbol).
 * A row whose `last` is missing or non-numeric gets NO entry — that covers both an unknown equity ticker
 * (CNBC answers with `code: 1`/`code: 3` and no price) and a dead futures contract (@ALI.1 "Aluminium
 * COMEX Nov'20"). The caller then omits that subject entirely: honest absence, never a faked number.
 *
 * `change_pct` is deliberately NOT read from CNBC — callers recompute it from last/prevClose so the
 * displayed move always reconciles with the two prices shown beside it (CLAUDE.md §15).
 */
export function parseCnbcRows(json: unknown): Map<string, CnbcRow> {
  const out = new Map<string, CnbcRow>()
  const raw = (json as any)?.FormattedQuoteResult?.FormattedQuote
  const rows: any[] = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : []
  for (const r of rows) {
    const symbol = typeof r?.symbol === 'string' ? r.symbol.trim().toUpperCase() : ''
    const last = num(r?.last)
    if (!symbol || last === null) continue
    const rawTime = str(r?.last_time)
    const t = rawTime ? Date.parse(rawTime) : NaN
    const rt = str(r?.realTime)
    out.set(symbol, {
      symbol,
      last,
      prevClose: num(r?.previous_day_closing),
      asOf: Number.isFinite(t) ? new Date(t).toISOString() : null,
      dateOnly: !!rawTime && /^\d{4}-\d{2}-\d{2}$/.test(rawTime),
      name: str(r?.name),
      currency: str(r?.currencyCode), // verbatim — see the field doc; case carries the minor unit
      exchange: str(r?.exchange),
      marketStatus: str(r?.curmktstatus)?.toUpperCase() ?? null,
      realTime: rt === null ? null : rt.toLowerCase() === 'true',
    })
  }
  return out
}

/**
 * Fetch a CNBC batch and return the parsed rows, or null when the WHOLE call failed (network, HTTP
 * error, non-JSON body, or a 200 carrying nothing usable — a shape change or a block page). Null means
 * "keep whatever you had and report stale"; an empty-but-non-null map cannot happen, so a caller never
 * mistakes a blocked request for "every symbol is gone".
 *
 * Aborts on `timeoutMs`, retries once, and never throws.
 */
export async function fetchCnbcRows(
  fetchFn: typeof fetch,
  symbols: string[],
  timeoutMs: number,
): Promise<Map<string, CnbcRow> | null> {
  if (!symbols.length) return null
  const url = buildCnbcQuoteUrl(symbols)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { headers: { 'user-agent': BROWSER_UA, accept: '*/*' }, signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = parseCnbcRows(JSON.parse(await res.text()))
      // A 200 with zero usable rows is indistinguishable from a block page / shape change, so it is
      // treated as a FAILED batch (keep previous data) rather than "all symbols vanished".
      if (!rows.size) throw new Error('no usable rows')
      return rows
    } catch {
      if (attempt === 2) return null
      await new Promise((r) => setTimeout(r, 500))
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}
