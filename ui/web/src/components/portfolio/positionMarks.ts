// What a position is worth NOW, where the feed could price it — and what the statement said where it could not.
//
// The Positions table has always been the statement's own snapshot: its mark, its value, its unrealised, as of
// the last export. That is the only basis that ties to the broker, which is why every other figure on the page
// keeps it. But the engine already prices the same holdings every time the page loads (`/api/portfolio/live`),
// and a table showing 10.24 for a holding the feed has at 9.12 is a week out of date beside a card that says so.
//
// So each row is marked at the live price where one can be had, and stays on the statement where it cannot —
// never half of each. A row is live only when every figure in it can be built from live inputs; otherwise it is
// the statement's, and says which. The two bases are never summed and never silently mixed.
import type { PortfolioLiveMark, PortfolioLiveRow, PortfolioPosition } from '../../lib/types'

export interface MarkedPosition {
  /** The price to show, in the position's own currency. */
  price: number | null
  /** Value and unrealised in the position's OWN currency, which is the unit those columns state. */
  value: number | null
  unrealised: number | null
  /** Share of the estimate's net asset value, base currency on both sides of the division. */
  weightPct: number | null
  /** True when the figures above are the live ones. False means the statement's, unchanged. */
  live: boolean
  /** The move from the statement's own mark to the live price, where both are known. */
  movePct: number | null
}

/**
 * The live row for each symbol, by upper-case symbol.
 *
 * A symbol held in two currencies is two positions and ONE quote: the engine's own price map is keyed by
 * ticker, so it cannot say which line a price belongs to. Such a symbol is dropped rather than guessed —
 * both its positions then stay on the statement, which is the honest answer rather than a price on the
 * wrong line.
 */
export function livePriceIndex(live: PortfolioLiveMark | null, positions: PortfolioPosition[]): Map<string, PortfolioLiveRow> {
  const out = new Map<string, PortfolioLiveRow>()
  if (!live || live.unavailable || !live.priced) return out
  const seen = new Map<string, number>()
  for (const p of positions) {
    const key = (p.symbol ?? '').toUpperCase()
    if (key) seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  for (const row of live.priced) {
    const key = (row.symbol ?? '').toUpperCase()
    if (!key || (seen.get(key) ?? 0) > 1) continue
    out.set(key, row)
  }
  return out
}

/**
 * One row's figures, live where they can be.
 *
 * The value is the statement's own value SCALED by the price move, not quantity × price: a bond is quoted as a
 * percentage of par and a derivative carries a multiplier, so re-deriving the value here would be wrong for
 * both, while scaling preserves whatever basis the broker used and moves only what actually moved.
 */
export function markPosition(p: PortfolioPosition, index: Map<string, PortfolioLiveRow>, navBase: number | null): MarkedPosition {
  const statement: MarkedPosition = {
    price: p.markPrice, value: p.positionValue, unrealised: p.unrealizedLocal,
    weightPct: p.percentOfNAV, live: false, movePct: null,
  }
  const row = index.get((p.symbol ?? '').toUpperCase())
  const stmtPrice = p.markPrice
  if (!row || !Number.isFinite(row.price) || stmtPrice === null || !(stmtPrice > 0) || p.positionValue === null) return statement
  const value = p.positionValue * (row.price / stmtPrice)
  // Against the statement's own cost where it states one; otherwise the unrealised it stated, moved by what
  // the value moved. Neither is available for every holding, and a row that can have neither stays as it was.
  const unrealised = p.costBasisMoney !== null ? value - p.costBasisMoney
    : p.unrealizedLocal !== null ? p.unrealizedLocal + (value - p.positionValue)
      : null
  // A holding whose statement gives NEITHER a cost nor an unrealised still gets its live price and value:
  // the server has already repriced it inside the live estimate of NAV, so leaving the row at its statement
  // value would put that holding's move into the cash residual and divide every weight by a whole that does
  // not match its parts. Unrealised is simply absent, which is what the statement says about it.
  // The weight divides two base-currency figures: this holding at the live price, over the live estimate of
  // the whole book. Without the statement's own rate, or without that estimate, it cannot be stated at all.
  const weightPct = p.fxRateToBase !== null && navBase !== null && navBase !== 0
    ? ((value * p.fxRateToBase) / navBase) * 100
    : null
  if (weightPct === null) return statement
  return { price: row.price, value, unrealised, weightPct, live: true, movePct: row.movePct }
}
