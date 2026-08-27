// Turning FIFO bookkeeping back into trades. Extracted from the component so the arithmetic can be
// tested directly: it is a two-stage aggregation over real money, and a fold that quietly drops or
// double-counts a leg would misstate realised P&L on screen with nothing to catch it.
import type { PortfolioClosure, PortfolioIdeaBook } from '../../lib/types'

export interface TradeRowData {
  symbol: string | null
  currency: string | null
  /** Long or short. Keyed on, because `quantity` is absolute and cannot tell the two apart. */
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  exitPrice: number
  openedAt: string | null
  closedAt: string | null
  /** Null when any lot in the trade carried no timestamp — an unknown hold is not a same-day one. */
  holdingDays: number | null
  grossLocal: number
  commissionLocal: number
  /** Commission in the BASE currency, or null when a lot closed with no rate. The local figures cannot
   *  be added across currencies: summed straight, francs went into a dollar total. */
  commissionBase: number | null
  /** Base currency where a rate existed, local otherwise — the same figure the cards above total. */
  realized: number
  /** Broker rows behind this line: the opening lots consumed, across every exit folded into it. */
  lots: number
  /** Exits folded in. More than one means the broker split one sale into several orders. */
  fills: number
  /** Every broker closeTradeID behind this row. This is the row's STABLE identity: an idea assignment
   *  is written against these, not against the symbol, so labelling this year's AMZN cannot relabel
   *  next year's. Empty when the broker gave no id — such a row cannot be labelled at all, which is
   *  reported rather than papered over with a positional key that moves on the next import. */
  closeTradeIDs: string[]
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
      side: lots[0]!.side,
      quantity: qty,
      entryPrice: wAvg((c) => c.entryPrice),
      exitPrice: wAvg((c) => c.exitPrice),
      openedAt: opened,
      closedAt: lots[0]!.closedAt,
      // Measured from the OLDEST lot in the group: that is how long the money was actually committed.
      // One lot with no timestamp makes the whole group unknown — reading a missing date as 0 days
      // presented a position held for months as a same-day trade and dragged the average hold down.
      holdingDays: lots.some((c) => c.holdingDays === null) ? null : Math.max(...lots.map((c) => c.holdingDays!)),
      grossLocal: lots.reduce((a, c) => a + c.grossLocal, 0),
      commissionLocal: lots.reduce((a, c) => a + c.commissionLocal, 0),
      commissionBase: lots.some((c) => c.closeFxRateToBase === null)
        ? null
        : lots.reduce((a, c) => a + c.commissionLocal * c.closeFxRateToBase!, 0),
      realized: sumBase(lots, baseRealised).total,
      lots: lots.length,
      fills: 1,
      closeTradeIDs: [...new Set(lots.map((c) => c.closeTradeID).filter((v): v is string => !!v))],
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
    const opened = (r.openedAt ?? '').slice(0, 10)
    const closed = (r.closedAt ?? '').slice(0, 10)
    // TWO THINGS THE KEY HAS TO SEPARATE, because folding either would invent a position:
    //
    // SIDE. `quantity` is absolute, so a long and a short in the same name over the same two days look
    // identical to a key built from symbol and dates — they folded into one row of twice the size,
    // priced at a quantity-weighted average of two trades that offset each other.
    //
    // DAY TRADES. Opened and closed the same day, a name can be traded round more than once, and a
    // repeat is indistinguishable from one sale split across orders. Merging them would undercount
    // trades and hide a loser inside a winner's row — the same miscount this fold exists to correct,
    // pointing the other way. So a same-day round trip keeps its own row; only the multi-day case,
    // where the duplicate rows actually appeared, folds.
    const key = opened !== '' && opened === closed
      ? `daytrade|${r.symbol}|${r.currency}|${r.side}|${opened}|${byRoundTrip.size}`
      : `${r.symbol}|${r.currency}|${r.side}|${opened}|${closed}`
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
      // Both carry the first fold's rule outward: one unknown leg makes the folded row unknown too,
      // rather than quietly reporting the known part as if it were the whole.
      holdingDays: group.some((r) => r.holdingDays === null) ? null : Math.max(...group.map((r) => r.holdingDays!)),
      grossLocal: group.reduce((a, r) => a + r.grossLocal, 0),
      commissionLocal: group.reduce((a, r) => a + r.commissionLocal, 0),
      commissionBase: group.some((r) => r.commissionBase === null)
        ? null
        : group.reduce((a, r) => a + r.commissionBase!, 0),
      realized: group.reduce((a, r) => a + r.realized, 0),
      lots: group.reduce((a, r) => a + r.lots, 0),
      fills: group.reduce((a, r) => a + r.fills, 0),
      closeTradeIDs: [...new Set(group.flatMap((r) => r.closeTradeIDs))],
    }
  })
  return folded.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))
}

// ---------------------------------------------------------------------------------------------
// Grouping the blotter by IDEA — the question the per-symbol view cannot answer.
//
// In the real book CANE (+3,703.48) and SUGAl (+3,004.97) are one sugar bet worth +6,708.45, and they
// never appear together. This folds them. It is a THIRD fold layered on top of foldRoundTrips, and it
// deliberately does not touch that function's keys: the round-trip arithmetic is already tested and a
// grouping question must not be able to change a realised figure.

export interface IdeaGroupRow {
  /** Null is the honest Unassigned bucket — rendered, never folded away. */
  ideaId: string | null
  label: string
  symbols: string[]
  realized: number
  trades: number
  /** Rows the operator cannot label because the broker gave no trade id. Surfaced so a stuck row is
   *  visible rather than looking like one nobody got round to. */
  unlabellable: number
  /** True for the declared-cash bucket. Cash equivalents are already answered — SGOV is where the book
   *  WAITS, not a view it holds — so filing them under Unassigned read as an unfinished job. */
  isCash: boolean
  firstClosed: string | null
  lastClosed: string | null
}

/** The idea a closed round trip carries, read from the broker ids behind it. ONE implementation, used
 *  by every panel that asks the question, so the grouping, the attribution bars and the row picker
 *  cannot drift into disagreeing about which bucket a trade is in.
 *
 *  `split` is true only when the legs carry TWO DIFFERENT declared ideas — the operator really did
 *  label them apart, and filing the row under one of them would misreport it. A leg carrying NO label
 *  is not a disagreement: statements arrive in pieces, so a round trip labelled while it held one
 *  broker id routinely grows a second on the next import, and reading that as a split would drop an
 *  already-labelled trade out of its idea's realised total with nobody having touched it. */
export function ideaOfRow(
  closeTradeIDs: string[], assigned: Record<string, string>,
): { id: string | null; split: boolean } {
  const found = new Set<string>()
  for (const t of closeTradeIDs) { const v = assigned[t]; if (v) found.add(v) }
  if (found.size > 1) return { id: null, split: true }
  return { id: found.size === 1 ? [...found][0]! : null, split: false }
}

/** Fold closed round trips into one row per idea. `ideas` absent (an engine that predates the feature)
 *  yields a single Unassigned row rather than an empty screen — DESIGN.md §5, fail closed.
 *
 *  `cashEquivalents` are the symbols the operator has ALREADY declared to be cash. They get their own
 *  bucket rather than landing in Unassigned: the Holdings exposure block excludes them for exactly the
 *  same reason, and a book that answered "SGOV is cash" should not then be asked again on another tab. */
export function groupByIdea(
  rows: TradeRowData[], ideas: PortfolioIdeaBook | undefined, cashEquivalents: string[] = [],
): IdeaGroupRow[] {
  const labels = new Map((ideas?.ideas ?? []).map((i) => [i.id, i.label]))
  const assigned = ideas?.assignments?.closures ?? {}
  const cash = new Set(cashEquivalents.map((s) => s.trim().toUpperCase()))
  const out = new Map<string, IdeaGroupRow>()

  for (const r of rows) {
    // A declared cash equivalent short-circuits: it is answered, and an explicit idea on it would be
    // the operator contradicting their own declaration — so the declaration wins and says so.
    if (cash.has((r.symbol ?? '').toUpperCase())) {
      const g = out.get('\u0000cash') ?? {
        ideaId: null, label: 'Cash equivalent', symbols: [], realized: 0, trades: 0, unlabellable: 0,
        firstClosed: null, lastClosed: null, isCash: true,
      }
      if (r.symbol && !g.symbols.includes(r.symbol)) g.symbols.push(r.symbol)
      g.realized += r.realized
      g.trades += 1
      const cl = (r.closedAt ?? '').slice(0, 10)
      if (cl) {
        if (!g.firstClosed || cl < g.firstClosed) g.firstClosed = cl
        if (!g.lastClosed || cl > g.lastClosed) g.lastClosed = cl
      }
      out.set('\u0000cash', g)
      continue
    }
    // A row whose legs were labelled differently is NOT quietly filed under one of them: that
    // disagreement is something the operator actually did, and hiding it would misreport the row.
    const { id: declared, split } = ideaOfRow(r.closeTradeIDs, assigned)
    const id = split ? '\u0000mixed' : declared
    const key = id ?? '\u0000none'
    const label = split ? 'Split across ideas' : (declared ? (labels.get(declared) ?? declared) : 'Unassigned')

    const g = out.get(key) ?? {
      ideaId: split ? null : id, label, symbols: [], realized: 0, trades: 0, unlabellable: 0,
      firstClosed: null, lastClosed: null, isCash: false,
    }
    if (r.symbol && !g.symbols.includes(r.symbol)) g.symbols.push(r.symbol)
    g.realized += r.realized
    g.trades += 1
    if (r.closeTradeIDs.length === 0) g.unlabellable += 1
    const closed = (r.closedAt ?? '').slice(0, 10)
    if (closed) {
      if (!g.firstClosed || closed < g.firstClosed) g.firstClosed = closed
      if (!g.lastClosed || closed > g.lastClosed) g.lastClosed = closed
    }
    out.set(key, g)
  }

  for (const g of out.values()) g.symbols.sort()
  // Named ideas first by size of result, then the two honest buckets last — Unassigned is a to-do
  // list, so it belongs at the bottom where it can be worked through, not interleaved by P&L.
  const named = [...out.values()].filter((g) => g.ideaId !== null)
  const rest = [...out.values()].filter((g) => g.ideaId === null)
  named.sort((a, b) => b.realized - a.realized)
  rest.sort((a, b) => a.label.localeCompare(b.label))
  return [...named, ...rest]
}
