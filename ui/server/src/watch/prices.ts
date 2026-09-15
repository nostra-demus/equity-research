// Our own record of each watched listing's price — one point per trading session — and the move of its home
// market over the same session.
//
// Why keep one at all: the quote feed's own "previous close" is clobbered to equal the last price on about
// half of the exchanges it covers (see the header of news/equity-quote.ts), so a day move computed from it
// reads a false 0%. The only previous close this watcher can trust is one it saw itself. So the first
// session after a name is added has no day move — an honest gap, never a zero.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fetchCnbcRows, type CnbcRow } from '../news/cnbc-quote'
import { listingCountry, type QuoteOutcome, type QuoteSubject } from '../news/equity-quote'

export const PRICE_RECORD_SCHEMA = 'watch-prices/v1' as const
const KEEP_SESSIONS = 60

export interface SessionPoint { date: string; close: number; as_of: string | null }
export interface PriceRecord { schema_version: typeof PRICE_RECORD_SCHEMA; series: Record<string, SessionPoint[]> }

export const emptyPriceRecord = (): PriceRecord => ({ schema_version: PRICE_RECORD_SCHEMA, series: {} })

export function loadPriceRecord(file: string): PriceRecord {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (j?.schema_version !== PRICE_RECORD_SCHEMA || !j.series || typeof j.series !== 'object') return emptyPriceRecord()
    const series: Record<string, SessionPoint[]> = {}
    for (const [k, v] of Object.entries<any>(j.series)) {
      if (!Array.isArray(v)) continue
      series[k] = v.filter((p) => p && typeof p.date === 'string' && Number.isFinite(p.close) && p.close > 0)
    }
    return { schema_version: PRICE_RECORD_SCHEMA, series }
  } catch {
    return emptyPriceRecord() // first run or unreadable — start empty; day moves resume next session
  }
}

export function savePriceRecord(file: string, rec: PriceRecord): void {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
    const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
    fs.writeFileSync(tmp, JSON.stringify(rec) + '\n', { mode: 0o600 })
    fs.renameSync(tmp, file)
  } catch { /* best-effort: the in-memory record still serves this process */ }
}

/**
 * The trading session a price belongs to: the calendar date of its own timestamp, in UTC. Every market the
 * watchlist covers trades inside one UTC day (Asia opens after 00:00 UTC, New York closes by 21:00 UTC), and
 * the feed stamps a settled close with its bare session date — so the UTC date IS the session.
 */
export function sessionOf(asOf: string | null, now: Date): string {
  const t = asOf ? Date.parse(asOf) : NaN
  return (Number.isFinite(t) ? new Date(t) : now).toISOString().slice(0, 10)
}

/** Record a price as its session's latest. An older session's price arriving late never rewrites history. */
export function observe(rec: PriceRecord, key: string, price: number, asOf: string | null, now: Date): void {
  if (!(price > 0)) return
  const session = sessionOf(asOf, now)
  const s = rec.series[key] ?? []
  const last = s[s.length - 1]
  if (last && last.date === session) { last.close = price; last.as_of = asOf }
  else if (!last || last.date < session) s.push({ date: session, close: price, as_of: asOf })
  else return
  rec.series[key] = s.slice(-KEEP_SESSIONS)
}

export function previousClose(rec: PriceRecord, key: string, session: string): number | null {
  const s = rec.series[key] ?? []
  for (let i = s.length - 1; i >= 0; i--) if (s[i].date < session) return s[i].close
  return null
}

/** This session's move against our own previous close, in %, to one decimal. Null until one is recorded. */
export function sessionMove(rec: PriceRecord, key: string, price: number, session: string): number | null {
  const prev = previousClose(rec, key, session)
  if (!(prev != null && prev > 0) || !(price > 0)) return null
  return Math.round((price / prev - 1) * 1000) / 10
}

// ---------- the market a listing moves with ----------

export interface MarketIndex { symbol: string; label: string }

/**
 * One broad index per home market, priced by the same keyless feed as the stocks (each verified live on
 * 2026-09-15). Generic market metadata, not company data (CLAUDE.md §26). A market not listed here gets no
 * comparison, and a big-drop message says so rather than pretending the market was flat.
 */
export const MARKET_INDEX: Record<string, MarketIndex> = {
  US: { symbol: '.SPX', label: 'S&P 500' },
  IN: { symbol: '.NSEI', label: 'Nifty 50' },
  HK: { symbol: '.HSI', label: 'Hang Seng' },
  NO: { symbol: '.OSEAX', label: 'Oslo All-Share' },
  AE: { symbol: '.DFMGI', label: 'DFM General' },
  CN: { symbol: '.SSEC', label: 'Shanghai Composite' },
}

export function marketIndexFor(exchange: string | null | undefined, currency: string | null | undefined): MarketIndex | null {
  const cc = listingCountry(exchange, currency)
  return cc ? MARKET_INDEX[cc] ?? null : null
}

/** Index levels, with the same age rule a stock price gets: a level older than `maxAgeDays` is not current. */
export async function fetchIndexLevels(
  symbols: string[],
  opts: { fetchFn?: typeof fetch; timeoutMs: number; maxAgeDays: number; now: Date },
): Promise<Map<string, { last: number; as_of: string | null }>> {
  const out = new Map<string, { last: number; as_of: string | null }>()
  if (!symbols.length) return out
  let rows: Map<string, CnbcRow> | null
  try { rows = await fetchCnbcRows(opts.fetchFn ?? fetch, symbols, opts.timeoutMs) } catch { return out }
  if (!rows) return out
  for (const sym of symbols) {
    const r = rows.get(sym)
    if (!r || !Number.isFinite(r.last) || r.last <= 0) continue
    const t = r.asOf ? Date.parse(r.asOf) : NaN
    if (!Number.isFinite(t) || opts.now.getTime() - t > opts.maxAgeDays * 86_400_000) continue
    out.set(sym, { last: r.last, as_of: r.asOf ?? null })
  }
  return out
}

// ---------- quoting a whole list ----------

export interface ListingSubject {
  key: string
  ticker: string
  currency: string | null
  exchange: string | null
  companyName: string | null
  entryPrice: number | null
}

/**
 * One batched quote call for a whole list. getQuotes keys its answer on the TICKER alone, so two listings of
 * the same ticker in one batch would collide and one could get the other currency's price. Listings are
 * grouped by ticker and quoted one round per collision depth — with distinct tickers, the normal case, that
 * is exactly one call. A listing with no currency cannot be priced safely and gets no quote.
 */
export async function quoteListings(
  subjects: ListingSubject[],
  getQuotesFn: (s: QuoteSubject[]) => Promise<Map<string, QuoteOutcome>>,
): Promise<Map<string, QuoteOutcome>> {
  const byTicker = new Map<string, ListingSubject[]>()
  const seen = new Set<string>()
  for (const s of subjects) {
    if (!s.currency || seen.has(s.key)) continue
    seen.add(s.key)
    const list = byTicker.get(s.ticker) ?? []
    list.push(s)
    byTicker.set(s.ticker, list)
  }
  const out = new Map<string, QuoteOutcome>()
  const depth = Math.max(0, ...[...byTicker.values()].map((g) => g.length))
  for (let round = 0; round < depth; round++) {
    const batch = [...byTicker.values()].map((g) => g[round]).filter(Boolean)
    if (!batch.length) continue
    const outcomes = await getQuotesFn(batch.map((b) => ({
      ticker: b.ticker, currency: b.currency, exchange: b.exchange, companyName: b.companyName, entryPrice: b.entryPrice,
    })))
    for (const b of batch) out.set(b.key, outcomes.get(b.ticker) ?? { quote: null, reason: null })
  }
  return out
}
