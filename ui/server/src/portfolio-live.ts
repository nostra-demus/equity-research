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
import { isQuoteEligibleCategory, statementMinorUnitDivisor } from '../../shared/live-pricing'

export interface LivePricedRow {
  symbol: string
  quantity: number
  /** The statement's own mark, so the move since it can be shown. */
  statementPrice: number | null
  price: number
  /** Base-currency value at the live price, using the statement's rate (see the note on fx below). */
  value: number
  movePct: number | null
  /** THIS row's own quote date and close/live status — a cross-market book can mix trading days and
   *  live-vs-close rows in one estimate, so a caller must not assume the mark's aggregate `asOf` and
   *  `asOfIsClose` (latest date, worst case) describe every row alike. */
  asOf: string | null
  asOfIsClose: boolean
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
  // re-marking it here would add its face value to the estimate. A bought OPTION is deliberately not a
  // derivative by that test (its premium is a real NAV asset) — but its broker symbol is commonly the
  // UNDERLYING ticker, so a plain equity-style quote lookup would price the option at the STOCK's price.
  // Excluded here for the same reason a future is: not because it carries no value, but because this
  // symbol-only lane cannot price it. Its statement value is folded into cash below, same as a derivative's.
  const holdings = book.positions.filter((p) =>
    !p.isDerivative && isQuoteEligibleCategory(p.assetCategory) && p.symbol && p.quantity !== null)
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

  // A symbol held by more than one position (two currency lines, or two lots) cannot be priced from a
  // ticker-keyed quote map — it cannot say which line a price belongs to. The blotter drops such a symbol
  // (positionMarks.ts livePriceIndex, `seen !== 1`) and shows BOTH lines on the statement, so this estimate
  // — the whole the blotter's weights and cash residual divide by — must carry those lines on the SAME
  // statement basis. Pricing them here would push their move into the displayed cash residual, and for two
  // currency lines would value one line at the OTHER currency's price (CLAUDE.md §15: a holding's move must
  // not be absorbed into the cash residual; NAV = invested + cash must hold on one basis).
  const heldCount = new Map<string, number>()
  for (const p of holdings) {
    const k = p.symbol!.toUpperCase()
    heldCount.set(k, (heldCount.get(k) ?? 0) + 1)
  }

  for (const p of holdings) {
    if ((heldCount.get(p.symbol!.toUpperCase()) ?? 0) !== 1) {
      // Carried at its STATEMENT value on both sides of the cash identity (added to holdingsValue AND
      // statementValue, so `cash = nav - statementValue` is unchanged and NAV keeps its statement value),
      // with its cost so `unrealised` stays the statement's own. Never entered into `priced`: it is
      // deliberately not live-priced, exactly as the blotter shows it.
      const dupRate = p.fxRateToBase
      if (dupRate !== null && p.positionValue !== null && Number.isFinite(p.positionValue)) {
        holdingsValue += p.positionValue * dupRate
        statementValue += p.positionValue * dupRate
        costBasis += (p.costBasisMoney ?? 0) * dupRate
      } else {
        unpriced.push(p.symbol!)
      }
      continue
    }
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
    // SCALED FROM THE STATEMENT'S OWN VALUE where it has one, not re-derived. A bond or bill is quoted as a
    // percentage of par, so quantity × price overstates it about a hundredfold — the same reason the blotter
    // refuses that formula for PAR_PRICED rows — and scaling preserves whatever basis the broker used while
    // moving only what moved. Without a stated value or mark there is nothing to scale, and the ordinary
    // formula stands.
    //
    // ALIGNED TO ONE UNIT before it is used as the scale's denominator. A London Stock Exchange holding is
    // imported with its per-share price in PENCE while its own position value is in POUNDS — both under one
    // currency code of "GBP" — while the live price above is already normalised to pounds (resolveUnits in
    // news/equity-quote.ts). Dividing the live price by the raw pence mark would scale the value by ~100x.
    const stmt = p.markPrice
    const alignedStmt = stmt !== null
      ? stmt / statementMinorUnitDivisor(p.assetCategory, p.positionValue, stmt, p.quantity, p.multiplier)
      : null
    const value = p.positionValue !== null && alignedStmt !== null && alignedStmt > 0
      ? p.positionValue * (price / alignedStmt) * rate
      : price * p.quantity! * rate * (p.multiplier || 1)
    const rowAsOfRaw = q?.quote?.as_of ?? null
    priced.push({
      symbol: p.symbol!,
      quantity: p.quantity!,
      statementPrice: stmt,
      price,
      value,
      movePct: alignedStmt !== null && alignedStmt > 0 ? (price / alignedStmt - 1) * 100 : null,
      asOf: rowAsOfRaw ? rowAsOfRaw.slice(0, 10) : null,
      asOfIsClose: !!q?.quote?.as_of_is_close,
    })
    holdingsValue += value
    statementValue += (p.positionValue ?? 0) * rate
    costBasis += (p.costBasisMoney ?? 0) * rate
    if (rowAsOfRaw) {
      const d = rowAsOfRaw.slice(0, 10)
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
