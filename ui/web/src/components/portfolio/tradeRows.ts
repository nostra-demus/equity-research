// Turning FIFO bookkeeping back into trades. Extracted from the component so the arithmetic can be
// tested directly: it is a two-stage aggregation over real money, and a fold that quietly drops or
// double-counts a leg would misstate realised P&L on screen with nothing to catch it.
import type { PortfolioClosure } from '../../lib/types'

export interface TradeRowData {
  symbol: string | null
  currency: string | null
  quantity: number
  entryPrice: number
  exitPrice: number
  openedAt: string | null
  closedAt: string | null
  holdingDays: number
  grossLocal: number
  commissionLocal: number
  /** Base currency where a rate existed, local otherwise — the same figure the cards above total. */
  realized: number
  /** Broker rows behind this line: the opening lots consumed, across every exit folded into it. */
  lots: number
  /** Exits folded in. More than one means the broker split one sale into several orders. */
  fills: number
}

const baseRealised = (c: { realizedBase: number | null }): number | null => c.realizedBase

function sumBase<T>(rows: T[], value: (row: T) => number | null): { total: number; unvalued: number } {
  let total = 0
  let unvalued = 0
  for (const row of rows) {
    const v = value(row)
    if (v === null) unvalued += 1
    else total += v
  }
  return { total, unvalued }
}

export function foldRoundTrips(closures: PortfolioClosure[]): TradeRowData[] {
  const groups = new Map<string, PortfolioClosure[]>()
  closures.forEach((c, i) => {
    const key = c.closeTradeID ? `${c.symbol}|${c.closeTradeID}` : `solo|${i}`
    const list = groups.get(key)
    if (list) list.push(c); else groups.set(key, [c])
  })
  const merged: TradeRowData[] = [...groups.values()].map((lots) => {
    const qty = lots.reduce((a, c) => a + c.quantity, 0)
    // Weighted by quantity, because the lots being merged were opened at different prices — a plain
    // mean would report an entry the book never paid.
    const wAvg = (pick: (c: PortfolioClosure) => number) =>
      qty === 0 ? pick(lots[0]!) : lots.reduce((a, c) => a + pick(c) * c.quantity, 0) / qty
    const opened = lots.map((c) => c.openedAt).filter(Boolean).sort()[0] ?? null
    return {
      symbol: lots[0]!.symbol,
      currency: lots[0]!.currency,
      quantity: qty,
      entryPrice: wAvg((c) => c.entryPrice),
      exitPrice: wAvg((c) => c.exitPrice),
      openedAt: opened,
      closedAt: lots[0]!.closedAt,
      // Measured from the OLDEST lot in the group: that is how long the money was actually committed.
      holdingDays: Math.max(...lots.map((c) => c.holdingDays ?? 0)),
      grossLocal: lots.reduce((a, c) => a + c.grossLocal, 0),
      commissionLocal: lots.reduce((a, c) => a + c.commissionLocal, 0),
      realized: sumBase(lots, baseRealised).total,
      lots: lots.length,
      fills: 1,
    }
  })
  // SECOND FOLD — one line per ROUND TRIP, not per broker order. A single sale routinely leaves the
  // broker as several orders with their own trade ids, so the same position bought on one day and
  // sold on another arrived as three visually identical rows (SGOV 5 May → 30 Jul came back as 59,
  // 100 and 341 shares). Nothing is hidden: quantity, gross, costs and realised are summed, prices
  // are weighted by quantity exactly as the first fold already weights them across opening lots, and
  // the row says how many broker rows sit behind it.
  const byRoundTrip = new Map<string, TradeRowData[]>()
  for (const r of merged) {
    const key = `${r.symbol}|${r.currency}|${(r.openedAt ?? '').slice(0, 10)}|${(r.closedAt ?? '').slice(0, 10)}`
    const list = byRoundTrip.get(key)
    if (list) list.push(r); else byRoundTrip.set(key, [r])
  }
  const folded: TradeRowData[] = [...byRoundTrip.values()].map((group) => {
    if (group.length === 1) return group[0]!
    const qty = group.reduce((a, r) => a + r.quantity, 0)
    const wAvg = (pick: (r: TradeRowData) => number) =>
      qty === 0 ? pick(group[0]!) : group.reduce((a, r) => a + pick(r) * r.quantity, 0) / qty
    return {
      ...group[0]!,
      quantity: qty,
      entryPrice: wAvg((r) => r.entryPrice),
      exitPrice: wAvg((r) => r.exitPrice),
      holdingDays: Math.max(...group.map((r) => r.holdingDays)),
      grossLocal: group.reduce((a, r) => a + r.grossLocal, 0),
      commissionLocal: group.reduce((a, r) => a + r.commissionLocal, 0),
      realized: group.reduce((a, r) => a + r.realized, 0),
      lots: group.reduce((a, r) => a + r.lots, 0),
      fills: group.reduce((a, r) => a + r.fills, 0),
    }
  })
  return folded.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))
}
