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
import { isQuoteEligibleCategory, statementMinorUnitDivisor } from '../../../../shared/live-pricing'

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
  /** THIS row's own quote date and close/live status, null/false when not live. Never the mark's
   *  aggregate — a cross-market book can price two rows on two different days in one page load. */
  asOf: string | null
  asOfIsClose: boolean
}

/**
 * The live row for each symbol, by upper-case symbol.
 *
 * A symbol held in two currencies is two positions and ONE quote: the engine's own price map is keyed by
 * ticker, so it cannot say which line a price belongs to. Such a symbol is dropped rather than guessed —
 * both its positions then stay on the statement, which is the honest answer rather than a price on the
 * wrong line.
 *
 * `statementDay`, when given, rejects each row on its OWN quote date, not the mark's aggregate `asOf` —
 * a cross-market response can hold one row newer than the statement and another cached or prior-close row
 * that is not, and the newer row alone can make the caller's aggregate `live.asOf > statementDay` check
 * pass. Filtering here, before either row is looked up, is what stops the older row from overwriting an
 * already-current statement mark once the aggregate gate has already let the mark through.
 */
export function livePriceIndex(
  live: PortfolioLiveMark | null, positions: PortfolioPosition[], statementDay: string | null = null,
): Map<string, PortfolioLiveRow> {
  const out = new Map<string, PortfolioLiveRow>()
  if (!live || live.unavailable || !live.priced) return out
  const seen = new Map<string, number>()
  for (const p of positions) {
    // Only a position `/api/portfolio/live` could actually have quoted counts against a symbol here. A
    // future or option sharing an equity's broker symbol is never in `live.priced` (the server excludes
    // both, for different reasons — see portfolio-live.ts), so counting it here would drop an otherwise
    // unambiguous equity quote for a collision that was never real.
    if (!p.isDerivative && isQuoteEligibleCategory(p.assetCategory)) {
      const key = (p.symbol ?? '').toUpperCase()
      if (key) seen.set(key, (seen.get(key) ?? 0) + 1)
    }
  }
  for (const row of live.priced) {
    const key = (row.symbol ?? '').toUpperCase()
    // Exactly one quote-eligible position held this symbol. Zero means nothing here holds it (an unheld
    // or already-excluded symbol); more than one means it is genuinely ambiguous which line the quote
    // belongs to — both stay on the statement rather than guessing.
    if (!key || seen.get(key) !== 1) continue
    // THIS row's own date against the statement it would reprice — never the mark's aggregate, which is
    // only the latest date across every row and so can pass while an individual row is not actually
    // newer. A row with no date of its own cannot be proven newer, so it is refused the same way.
    if (statementDay !== null && (row.asOf === null || row.asOf <= statementDay)) continue
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
    weightPct: p.percentOfNAV, live: false, movePct: null, asOf: null, asOfIsClose: false,
  }
  // An OPTION never takes a quote by symbol, full stop — even where `index` happens to hold a row under
  // its own broker symbol (an equity of the same ticker the option is written on). `livePriceIndex`
  // already keeps such a row out of the ambiguity count so the EQUITY is not penalised for the option
  // sharing its symbol; this is the other half — the option itself must not turn around and read that
  // same equity row as if it were a quote of the option.
  if (!isQuoteEligibleCategory(p.assetCategory)) return statement
  const row = index.get((p.symbol ?? '').toUpperCase())
  const stmtPrice = p.markPrice
  const positionValue = p.positionValue
  // Every one of these numbers came off a statement export or a live feed response — external data this
  // function does not control the shape of. A NaN or an Infinity slipping past a bare `!= null` check
  // would propagate silently into a displayed value, an unrealised figure or a weight; Number.isFinite
  // catches both while still admitting the ordinary case (§3: no source, no claim — including a claim
  // built on a number that is not actually one).
  if (!row || !Number.isFinite(row.price) || stmtPrice === null || !Number.isFinite(stmtPrice) || !(stmtPrice > 0)
    || positionValue === null || !Number.isFinite(positionValue)) return statement
  // ALIGNED TO ONE UNIT before the two prices are compared as a ratio — see statementMinorUnitDivisor.
  const alignedStmtPrice = stmtPrice / statementMinorUnitDivisor(p.assetCategory, positionValue, stmtPrice, p.quantity, p.multiplier)
  const value = positionValue * (row.price / alignedStmtPrice)
  const costBasisMoney = p.costBasisMoney
  const unrealizedLocal = p.unrealizedLocal
  // Against the statement's own cost where it states one; otherwise the unrealised it stated, moved by what
  // the value moved. Neither is available for every holding, and a row that can have neither stays as it was.
  const unrealised = costBasisMoney !== null && Number.isFinite(costBasisMoney) ? value - costBasisMoney
    : unrealizedLocal !== null && Number.isFinite(unrealizedLocal) ? unrealizedLocal + (value - positionValue)
      : null
  // A holding whose statement gives NEITHER a cost nor an unrealised still gets its live price and value:
  // the server has already repriced it inside the live estimate of NAV, so leaving the row at its statement
  // value would put that holding's move into the cash residual and divide every weight by a whole that does
  // not match its parts. Unrealised is simply absent, which is what the statement says about it.
  // The weight divides two base-currency figures: this holding at the live price, over the live estimate of
  // the whole book. Without the statement's own rate, or without that estimate, it cannot be stated at all.
  const fxRateToBase = p.fxRateToBase
  const weightPct = fxRateToBase !== null && Number.isFinite(fxRateToBase) && navBase !== null && Number.isFinite(navBase) && navBase !== 0
    ? ((value * fxRateToBase) / navBase) * 100
    : null
  if (weightPct === null) return statement
  return { price: row.price, value, unrealised, weightPct, live: true, movePct: row.movePct, asOf: row.asOf, asOfIsClose: row.asOfIsClose }
}
