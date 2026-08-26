// The gap between the last statement and today, priced at the market.
//
// WHY THIS IS A SEPARATE READ, AND A SEPARATE NUMBER. Every figure in the book ties to the broker —
// eight reconciliation checks say so on every screen, and that is the only reason the rest is worth
// reading. A live mark cannot tie to anything: it is today's prices against yesterday's share counts.
// So it never enters the book, the return, or a single check. It is an estimate shown beside them,
// exactly as a hand-logged fill is.
//
// WHAT IT CAN AND CANNOT SEE:
//  · CAN: what the holdings are worth now, and therefore roughly what the book is worth now.
//  · CANNOT: cash. Dividends received, interest accrued and fees charged since the statement are
//    unknown until the next export — and on a book parked in T-bills that is most of the balance, so
//    the cash leg is carried forward frozen and labelled with the date it belongs to.
//  · CANNOT: trades placed since the statement. That is what the hand-logged layer is for, and it is
//    provisional for the same reason.
//
// IT IS ONE OBSERVATION, NOT A CURVE. There is no daily price history for the gap — the market feed
// carries the benchmark, not the holdings — so this yields today's point and nothing in between. The
// chart draws the hop to it dashed rather than solid, because a straight line across three weeks of
// missing days would be an interpolation wearing the clothes of data.

import type { Book } from './portfolio'
import { getQuotes, type QuoteDeps } from './news/equity-quote'

export interface LivePricedRow {
  symbol: string
  quantity: number
  /** The statement's own mark, so the move since it can be shown. */
  statementPrice: number | null
  price: number
  /** Base-currency value at the live price, using the statement's rate (see the note on fx below). */
  value: number
  movePct: number | null
}

export interface LiveMark {
  /** The date the prices belong to. */
  asOf: string | null
  /** TRUE when the prices are a settled close rather than a live tick. The quote layer is explicit that
   *  calling a close a live price is a defect, so this travels with the number and the UI says which it
   *  is — "last close" or "delayed", never "real-time". */
  asOfIsClose: boolean
  /** The feed is exchange-delayed. Surfaced, never hidden. */
  delayed: boolean
  /** At least one price was served from cache past its TTL: real, but not fresh. */
  stale: boolean
  /** The last day the BOOK is reconciled to. */
  bookAsOf: string | null
  /** Calendar days between the two — how far ahead of the statement this estimate reaches. */
  staleDays: number | null
  /** Estimated NAV: live holdings plus the statement's cash. */
  nav: number | null
  /** Estimated unrealised, against the statement's own cost basis. */
  unrealised: number | null
  /** The cash leg, carried from the statement unchanged, with the date it belongs to. */
  cash: number | null
  priced: LivePricedRow[]
  /** Holdings no price could be found for — named, never silently dropped from the total. */
  unpriced: string[]
  /** Set when no estimate can be made at all, with the reason. */
  unavailable: string | null
}

const EMPTY: LiveMark = {
  asOf: null, asOfIsClose: true, delayed: true, stale: false,
  bookAsOf: null, staleDays: null, nav: null, unrealised: null, cash: null,
  priced: [], unpriced: [], unavailable: 'no book to mark',
}

function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const a = Date.parse(`${from}T00:00:00Z`), b = Date.parse(`${to}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86_400_000)
}

/** Price the open positions at the market and estimate what the book is worth now. */
export async function liveMark(book: Book | null, deps: QuoteDeps = {}): Promise<LiveMark> {
  if (!book) return EMPTY
  const bookAsOf = book.asOf
  const nav = book.navSeries.length ? book.navSeries[book.navSeries.length - 1]!.total : null
  // Derivatives are excluded: a future's notional is exposure against margin, not a share of NAV, and
  // re-marking it here would add its face value to the estimate.
  const holdings = book.positions.filter((p) => !p.isDerivative && p.symbol && p.quantity !== null)
  if (holdings.length === 0 || nav === null) {
    return { ...EMPTY, bookAsOf, unavailable: 'the book holds no priceable positions' }
  }

  let outcomes: Awaited<ReturnType<typeof getQuotes>>
  try {
    outcomes = await getQuotes(holdings.map((p) => ({ ticker: p.symbol!, currency: p.currency ?? 'USD' })), deps)
  } catch {
    return { ...EMPTY, bookAsOf, unavailable: 'the price feed could not be reached' }
  }

  const priced: LivePricedRow[] = []
  const unpriced: string[] = []
  let holdingsValue = 0
  let statementValue = 0
  let costBasis = 0
  let asOf: string | null = null
  let asOfIsClose = false
  let delayed = false
  let stale = false

  for (const p of holdings) {
    const q = outcomes.get(p.symbol!.toUpperCase()) ?? outcomes.get(p.symbol!)
    const price = q?.quote?.price ?? null
    // THE STATEMENT'S OWN RATE, because there is no live one. It is the same rate the reconciled
    // figures use, so the estimate moves with the PRICE only — which is what it claims to measure. A
    // holding with no rate is left out and named, never added at one-for-one.
    const rate = p.fxRateToBase
    if (price === null || !Number.isFinite(price) || rate === null) {
      unpriced.push(p.symbol!)
      continue
    }
    const value = price * p.quantity! * rate * (p.multiplier || 1)
    const stmt = p.markPrice
    priced.push({
      symbol: p.symbol!,
      quantity: p.quantity!,
      statementPrice: stmt,
      price,
      value,
      movePct: stmt !== null && stmt > 0 ? (price / stmt - 1) * 100 : null,
    })
    holdingsValue += value
    statementValue += (p.positionValue ?? 0) * rate
    costBasis += (p.costBasisMoney ?? 0) * rate
    const at = q?.quote?.as_of ?? null
    if (at) {
      const d = at.slice(0, 10)
      if (asOf === null || d > asOf) asOf = d
    }
    // Worst case across the holdings: if ANY leg is a close, delayed or stale, the whole estimate is.
    if (q?.quote?.as_of_is_close) asOfIsClose = true
    if (q?.quote?.delayed) delayed = true
    if (q?.quote?.stale) stale = true
  }

  if (priced.length === 0) {
    return { ...EMPTY, bookAsOf, unpriced, unavailable: 'no holding could be priced' }
  }

  // Cash is whatever the statement said was not in these positions. Frozen, and labelled as of the
  // statement's own date — it is the leg this estimate cannot see moving.
  const cash = nav - statementValue
  return {
    asOf,
    asOfIsClose,
    delayed,
    stale,
    bookAsOf,
    staleDays: daysBetween(bookAsOf, asOf),
    nav: cash + holdingsValue,
    unrealised: holdingsValue - costBasis,
    cash,
    priced: priced.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
    unpriced,
    unavailable: null,
  }
}
