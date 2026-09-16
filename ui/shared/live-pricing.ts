// Rules for pricing a HELD POSITION at the market that must agree wherever they are asked — the server's
// own live estimate (ui/server/src/portfolio-live.ts) and the client's per-row mark
// (ui/web/src/components/portfolio/positionMarks.ts). Splitting this logic into two copies would let the
// two silently drift the moment either side is changed alone (CLAUDE.md §2 — reuse before adding).

/**
 * False for a category a plain equity-style quote must never be applied to, even though it is not a
 * margin derivative (`isDerivative`) and so is not excluded on that test.
 *
 * A bought OPTION is a real NAV asset — unlike a future, its premium is not notional, which is exactly
 * why `isDerivative` is deliberately false for it (see isDerivativeCategory in portfolio.ts). But its
 * broker symbol is commonly just the UNDERLYING ticker, with the contract's own terms (strike, expiry,
 * putCall) carried in separate fields. A symbol-only quote lookup for such a position is not a quote of
 * the option at all — it is the underlying share price standing in for a completely different
 * instrument's premium, which can be tens of times the option's own value in either direction.
 */
export function isQuoteEligibleCategory(assetCategory: string | null | undefined): boolean {
  return (assetCategory ?? '').toUpperCase() !== 'OPT'
}

/**
 * The factor by which a statement's own per-share price must be divided before it can be compared with a
 * live quote, or 1 when nothing suggests it needs to be.
 *
 * A statement's own numbers must reconcile at one scale: value = price × quantity × multiplier. Some
 * venues break that reconciliation by ~100x — a London Stock Exchange holding is imported with its price
 * in PENCE while its own position value is in POUNDS, both under one currency code of "GBP" (IBKR's own
 * export does not distinguish GBP from pence the way `resolveUnits`, in news/equity-quote.ts, distinguishes
 * a live quote's self-declared "GBp"). A live price is always normalised to the major unit before it
 * reaches either caller of this function, so comparing it against a statement price still in the minor
 * unit silently scales the answer by 100 in whichever direction is wrong.
 *
 * This detects the mismatch from the statement's OWN numbers rather than guessing from a currency code
 * the statement does not reliably carry.
 */
export function statementMinorUnitDivisor(
  positionValue: number | null | undefined,
  markPrice: number | null | undefined,
  quantity: number | null | undefined,
  multiplier: number | null | undefined,
): number {
  if (positionValue == null || markPrice == null || quantity == null) return 1
  if (!Number.isFinite(positionValue) || !Number.isFinite(markPrice) || markPrice === 0) return 1
  if (!Number.isFinite(quantity) || quantity === 0) return 1
  const mult = multiplier != null && Number.isFinite(multiplier) && multiplier !== 0 ? multiplier : 1
  const implied = positionValue / (markPrice * quantity * mult)
  // A hundred-times mismatch, with real slack either side for FX and rounding — wide enough to catch the
  // actual pattern, narrow enough that a genuine ~5x move between the statement and today (exactly what
  // live pricing exists to show) is never mistaken for a units error.
  return implied > 0.005 && implied < 0.02 ? 100 : 1
}
