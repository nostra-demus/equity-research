// One row per ROUND TRIP, folded twice: FIFO gives one closure per opening lot, and a single sale
// routinely leaves the broker as several orders. The invariant that matters is that folding is pure
// presentation — every total must survive it untouched.
// Run: npx tsx src/components/portfolio/tradeRows.test.ts
import assert from 'node:assert/strict'
import { fillAction, fillRows, fillStatus, fillSummary, fillSymbols, filterFills, fillsOutsideBase, foldRoundTrips, groupByIdea } from './tradeRows'
import type { PortfolioClosure, PortfolioExecution, PortfolioIdeaBook } from '../../lib/types'

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

let seq = 0
function closure(o: Partial<PortfolioClosure> & { quantity: number; realizedBase: number }): PortfolioClosure {
  seq += 1
  return {
    key: `k${seq}`, symbol: 'SGOV', assetCategory: 'STK', currency: 'USD', side: 'long',
    entryPrice: 100, exitPrice: 101, openedAt: '2026-05-04', closedAt: '2026-08-21',
    holdingDays: 109, realizedLocal: o.realizedBase, grossLocal: o.realizedBase, commissionLocal: 0,
    openFxRateToBase: 1, closeFxRateToBase: 1, closeTradeID: `t${seq}`,
    ...o,
  } as PortfolioClosure
}

check('one sale split across broker orders becomes one row, with every total preserved', () => {
  // The real book's SGOV 5 May -> 21 Aug: three exits of 100/200/200 that read as three identical rows.
  const cs = [
    closure({ quantity: 100, realizedBase: 19.47, grossLocal: 20.7, commissionLocal: -1.23, closeTradeID: 'a' }),
    closure({ quantity: 200, realizedBase: 38.95, grossLocal: 41.4, commissionLocal: -2.45, closeTradeID: 'b' }),
    closure({ quantity: 200, realizedBase: 38.95, grossLocal: 41.4, commissionLocal: -2.45, closeTradeID: 'c' }),
  ]
  const rows = foldRoundTrips(cs)
  assert.equal(rows.length, 1)
  assert.equal(rows[0]!.quantity, 500)
  assert.equal(rows[0]!.fills, 3, 'and it says how many orders are behind it')
  assert.equal(rows[0]!.lots, 3)
  assert.ok(near(rows[0]!.realized, 97.37), `realised ${rows[0]!.realized}`)
  assert.ok(near(rows[0]!.grossLocal, 103.5))
  assert.ok(near(rows[0]!.commissionLocal, -6.13))
})

check('folding never moves the money: the summed total is identical either way', () => {
  const cs = [
    closure({ quantity: 100, realizedBase: 19.47, closeTradeID: 'a' }),
    closure({ quantity: 200, realizedBase: -38.95, closeTradeID: 'b' }),
    closure({ quantity: 50, realizedBase: 12.5, symbol: 'CANE', openedAt: '2026-08-07', closeTradeID: 'c' }),
    closure({ quantity: 7, realizedBase: 3.25, symbol: 'GLDM', closedAt: '2026-06-22', closeTradeID: 'd' }),
  ]
  const before = cs.reduce((a, c) => a + (c.realizedBase ?? 0), 0)
  const after = foldRoundTrips(cs).reduce((a, r) => a + r.realized, 0)
  assert.ok(near(before, after), `${before} vs ${after}`)
})

check('prices are weighted by quantity, never averaged flat', () => {
  const cs = [
    closure({ quantity: 900, realizedBase: 0, entryPrice: 10, exitPrice: 11, closeTradeID: 'a' }),
    closure({ quantity: 100, realizedBase: 0, entryPrice: 20, exitPrice: 21, closeTradeID: 'b' }),
  ]
  const [row] = foldRoundTrips(cs)
  assert.ok(near(row!.entryPrice, 11), `entry ${row!.entryPrice}`)   // flat mean would say 15
  assert.ok(near(row!.exitPrice, 12), `exit ${row!.exitPrice}`)
})

check('different round trips stay apart — a shared close date is not a shared trade', () => {
  const cs = [
    closure({ quantity: 10, realizedBase: 1, openedAt: '2026-05-04', closeTradeID: 'a' }),
    closure({ quantity: 10, realizedBase: 1, openedAt: '2026-06-01', closeTradeID: 'b' }),
    closure({ quantity: 10, realizedBase: 1, symbol: 'CANE', openedAt: '2026-05-04', closeTradeID: 'c' }),
  ]
  assert.equal(foldRoundTrips(cs).length, 3)
})

check('a closure the statement could not put a rate on is counted as unvalued, not as zero', () => {
  const cs = [
    closure({ quantity: 10, realizedBase: 25, closeTradeID: 'a' }),
    { ...closure({ quantity: 10, realizedBase: 0, closeTradeID: 'b' }), realizedBase: null } as PortfolioClosure,
  ]
  const [row] = foldRoundTrips(cs)
  assert.ok(near(row!.realized, 25), 'the unrated leg must not be added in as a zero-valued win')
})

check('one unknown leg makes the folded row unknown, not partially right', () => {
  // Both rules come from the first fold and have to survive the second: a missing timestamp read as
  // 0 days presented a months-long position as a same-day trade, and commission summed across
  // currencies put francs into a dollar total. Folding must not quietly recover either.
  const cs = [
    closure({ quantity: 100, realizedBase: 10, closeTradeID: 'a' }),
    { ...closure({ quantity: 100, realizedBase: 10, closeTradeID: 'b' }), holdingDays: null } as PortfolioClosure,
  ]
  assert.equal(foldRoundTrips(cs)[0]!.holdingDays, null)

  const fx = [
    closure({ quantity: 100, realizedBase: 10, commissionLocal: -2, closeTradeID: 'c' }),
    { ...closure({ quantity: 100, realizedBase: 10, commissionLocal: -2, closeTradeID: 'd' }), closeFxRateToBase: null } as PortfolioClosure,
  ]
  assert.equal(foldRoundTrips(fx)[0]!.commissionBase, null)

  // …and when every leg IS rated, the base figure is the sum.
  const ok = [
    closure({ quantity: 100, realizedBase: 10, commissionLocal: -2, closeTradeID: 'e' }),
    closure({ quantity: 100, realizedBase: 10, commissionLocal: -3, closeTradeID: 'f' }),
  ]
  assert.ok(near(foldRoundTrips(ok)[0]!.commissionBase!, -5))
})

check('a long and a short over the same two days are two trades, not one double-sized one', () => {
  // `quantity` is absolute, so without the side in the key these looked identical and folded into a
  // 200-share row priced at the average of two trades that offset each other.
  const cs = [
    closure({ quantity: 100, realizedBase: 40, entryPrice: 10, exitPrice: 11, closeTradeID: 'a' }),
    { ...closure({ quantity: 100, realizedBase: -40, entryPrice: 11, exitPrice: 10, closeTradeID: 'b' }), side: 'short' } as PortfolioClosure,
  ]
  const rows = foldRoundTrips(cs)
  assert.equal(rows.length, 2)
  assert.deepEqual(rows.map((r) => r.side).sort(), ['long', 'short'])
  assert.ok(rows.every((r) => r.quantity === 100), 'neither row may carry the other\u2019s size')
})

check('two round trips inside one day stay two rows', () => {
  // A repeat is indistinguishable from one sale split across orders, so folding them would undercount
  // trades and hide the loser inside the winner — the miscount this fold exists to correct, reversed.
  const cs = [
    closure({ quantity: 100, realizedBase: 50, openedAt: '2026-08-07', closedAt: '2026-08-07', closeTradeID: 'a' }),
    closure({ quantity: 100, realizedBase: -30, openedAt: '2026-08-07', closedAt: '2026-08-07', closeTradeID: 'b' }),
  ]
  const rows = foldRoundTrips(cs)
  assert.equal(rows.length, 2, 'a same-day round trip keeps its own row')
  assert.ok(rows.some((r) => r.realized > 0) && rows.some((r) => r.realized < 0), 'and the loser stays visible')
})

// ---- grouping the blotter by IDEA -------------------------------------------------------------

function ideaBook(ideas: [string, string][], closures: Record<string, string>): PortfolioIdeaBook {
  return { ideas: ideas.map(([id, label]) => ({ id, label })), assignments: { positions: {}, closures } }
}

check('a row carries the broker trade ids that identify it', () => {
  // Without these the row has no stable identity and could only be keyed on its symbol — the very
  // thing that would let this year's label reach next year's trades.
  const rows = foldRoundTrips([
    closure({ quantity: 100, realizedBase: 10, closeTradeID: 'a' }),
    closure({ quantity: 200, realizedBase: 20, closeTradeID: 'b' }),
  ])
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0]!.closeTradeIDs.sort(), ['a', 'b'])
})

check('two sugar vehicles fold into one idea, with realised preserved', () => {
  // The case the feature exists for. CANE +3,703.48 and SUGAl +3,004.97 are one bet worth +6,708.45.
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, openedAt: '2026-05-26', closedAt: '2026-08-21', closeTradeID: 'cane1' }),
    closure({ symbol: 'SUGAl', quantity: 50, realizedBase: 3004.97, openedAt: '2026-05-26', closedAt: '2026-08-12', closeTradeID: 'suga1' }),
  ])
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { cane1: 'sugar', suga1: 'sugar' }))
  assert.equal(groups.length, 1)
  assert.equal(groups[0]!.label, 'Sugar')
  assert.ok(near(groups[0]!.realized, 6708.45, 1e-6), 'realised survives the third fold untouched')
  assert.deepEqual(groups[0]!.symbols, ['CANE', 'SUGAl'])
  assert.equal(groups[0]!.trades, 2)
  assert.equal(groups[0]!.firstClosed, '2026-08-12')
  assert.equal(groups[0]!.lastClosed, '2026-08-21')
})

check('the same ticker in two eras stays two ideas', () => {
  // AMZN traded this year for one reason and next year for another. Keyed on the broker ids, the two
  // never merge — which is exactly why the assignment is not keyed on the symbol.
  const rows = foldRoundTrips([
    closure({ symbol: 'AMZN', quantity: 10, realizedBase: 7124.11, openedAt: '2026-05-14', closedAt: '2026-07-31', closeTradeID: 'now' }),
    closure({ symbol: 'AMZN', quantity: 10, realizedBase: -500, openedAt: '2027-03-01', closedAt: '2027-06-01', closeTradeID: 'later' }),
  ])
  const groups = groupByIdea(rows, ideaBook(
    [['consumer', 'Consumer recovery'], ['capex', 'AI capex']],
    { now: 'consumer', later: 'capex' },
  ))
  assert.equal(groups.length, 2)
  const consumer = groups.find((g) => g.label === 'Consumer recovery')!
  const capex = groups.find((g) => g.label === 'AI capex')!
  assert.ok(near(consumer.realized, 7124.11, 1e-6))
  assert.ok(near(capex.realized, -500, 1e-6))
})

check('unlabelled trades land in Unassigned, and it sorts last', () => {
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, closeTradeID: 'cane1' }),
    closure({ symbol: 'GOOG', quantity: 10, realizedBase: 25, closedAt: '2026-08-14', closeTradeID: 'goog1' }),
  ])
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { cane1: 'sugar' }))
  assert.equal(groups.length, 2)
  assert.equal(groups[0]!.label, 'Sugar')
  assert.equal(groups[1]!.label, 'Unassigned', 'the to-do bucket sits at the bottom, never hidden')
  assert.equal(groups[1]!.ideaId, null)
})

check('a row whose legs were labelled differently is reported, not filed under one', () => {
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'x' }),
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'y' }),
  ])
  assert.equal(rows.length, 1, 'one round trip, two broker ids')
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar'], ['gold', 'Gold']], { x: 'sugar', y: 'gold' }))
  assert.equal(groups.length, 1)
  assert.equal(groups[0]!.label, 'Split across ideas')
})

check('a labelled row that grows an unlabelled leg keeps its idea', () => {
  // The regression this pins: statements arrive in pieces, so a round trip labelled while it held one
  // broker id routinely grows a second on the next import. Reading an UNLABELLED leg as a split would
  // move an already-labelled trade out of its idea's realised total with nobody having touched it.
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'x' }),
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'later' }),
  ])
  assert.equal(rows.length, 1, 'one round trip, two broker ids')
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { x: 'sugar' }))
  assert.equal(groups.length, 1)
  assert.equal(groups[0]!.label, 'Sugar', 'still the sugar bet, not "Split across ideas"')
  assert.equal(groups[0]!.realized, 20)
})

check('an engine with no idea support yields one honest Unassigned row', () => {
  // DESIGN.md §5 deploy skew: the new field is absent for 15-30s after a deploy. Absent must read as
  // "feature off", never as "every trade is unassigned and that is the answer".
  const rows = foldRoundTrips([closure({ quantity: 100, realizedBase: 10, closeTradeID: 'a' })])
  const groups = groupByIdea(rows, undefined)
  assert.equal(groups.length, 1)
  assert.equal(groups[0]!.ideaId, null)
  assert.equal(groups[0]!.label, 'Unassigned')
})

check('a trade the broker gave no id is counted as unlabellable', () => {
  const rows = foldRoundTrips([
    closure({ symbol: 'V', quantity: 10, realizedBase: 5, closeTradeID: null as unknown as string }),
  ])
  const groups = groupByIdea(rows, ideaBook([], {}))
  assert.equal(groups[0]!.unlabellable, 1, 'a stuck row is visible, not silently unassigned forever')
})

check('grouping never changes the blotter total', () => {
  // The whole safety property: this is presentation. If the sum moves, the fold is wrong.
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, closeTradeID: 'a' }),
    closure({ symbol: 'SUGAl', quantity: 50, realizedBase: 3004.97, closeTradeID: 'b' }),
    closure({ symbol: 'GLDM', quantity: 20, realizedBase: -1300.61, closedAt: '2026-08-07', closeTradeID: 'c' }),
    closure({ symbol: 'AMZN', quantity: 10, realizedBase: 7124.11, closedAt: '2026-07-31', closeTradeID: 'd' }),
  ])
  const blotter = rows.reduce((a, r) => a + r.realized, 0)
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { a: 'sugar', b: 'sugar' }))
  const grouped = groups.reduce((a, g) => a + g.realized, 0)
  assert.ok(near(blotter, grouped, 1e-9), `blotter ${blotter} vs grouped ${grouped}`)
})

check('a declared cash equivalent gets its own bucket, not Unassigned', () => {
  // SGOV is where the book WAITS. The Holdings exposure block already excludes it for that reason;
  // filing its closures under Unassigned asked the operator to answer a question they had answered.
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, closeTradeID: 'cane1' }),
    closure({ symbol: 'SGOV', quantity: 500, realizedBase: 458.66, closeTradeID: 'sgov1' }),
    closure({ symbol: 'AMZN', quantity: 10, realizedBase: 7124.11, closedAt: '2026-07-31', closeTradeID: 'amzn1' }),
  ])
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { cane1: 'sugar' }), ['SGOV'])
  const cash = groups.find((g) => g.isCash)
  assert.ok(cash, 'a cash bucket exists')
  assert.equal(cash!.label, 'Cash equivalent')
  assert.deepEqual(cash!.symbols, ['SGOV'])
  assert.ok(near(cash!.realized, 458.66, 1e-6))
  const unassigned = groups.find((g) => g.label === 'Unassigned')
  assert.deepEqual(unassigned!.symbols, ['AMZN'], 'and SGOV is no longer sitting in Unassigned')
})

check('an EXPLICIT label on a past trade beats today\'s cash declaration', () => {
  // The cash declaration describes what the symbol is doing NOW; it is not a statement about every
  // trade ever done in it. A past SGOV rates trade the operator deliberately labelled was being
  // overridden by today's parked-cash declaration — the implicit word beating the explicit one.
  const rows = foldRoundTrips([closure({ symbol: 'SGOV', quantity: 500, realizedBase: 458.66, closeTradeID: 's1' })])
  const groups = groupByIdea(rows, ideaBook([['rates', 'Rates']], { s1: 'rates' }), ['sgov'])
  assert.equal(groups.length, 1)
  assert.equal(groups[0]!.isCash, false)
  assert.equal(groups[0]!.label, 'Rates')
})

check('an UNLABELLED trade in a cash symbol still lands in the cash bucket', () => {
  // Which is what stops SGOV reading as an unfinished job on the blotter.
  const rows = foldRoundTrips([closure({ symbol: 'SGOV', quantity: 500, realizedBase: 458.66, closeTradeID: 's1' })])
  const groups = groupByIdea(rows, ideaBook([], {}), ['SGOV'])
  assert.equal(groups[0]!.isCash, true)
  assert.equal(groups[0]!.label, 'Cash equivalent')
})

check('with no cash declared, nothing changes', () => {
  const rows = foldRoundTrips([closure({ symbol: 'SGOV', quantity: 500, realizedBase: 458.66, closeTradeID: 's1' })])
  const groups = groupByIdea(rows, ideaBook([], {}))
  assert.equal(groups[0]!.isCash, false)
  assert.equal(groups[0]!.label, 'Unassigned')
})

check('grouping still never changes the blotter total, cash bucket included', () => {
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, closeTradeID: 'a' }),
    closure({ symbol: 'SUGAl', quantity: 50, realizedBase: 3004.97, closeTradeID: 'b' }),
    closure({ symbol: 'SGOV', quantity: 500, realizedBase: 458.66, closeTradeID: 'c' }),
    closure({ symbol: 'AMZN', quantity: 10, realizedBase: 7124.11, closedAt: '2026-07-31', closeTradeID: 'd' }),
  ])
  const blotter = rows.reduce((a, r) => a + r.realized, 0)
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { a: 'sugar', b: 'sugar' }), ['SGOV'])
  const grouped = groups.reduce((a, g) => a + g.realized, 0)
  assert.ok(near(blotter, grouped, 1e-9), `blotter ${blotter} vs grouped ${grouped}`)
})

check('an idea whose legs could not all be valued says the total is partial', () => {
  // sumBase already skipped the unconvertible leg; the count it returned was thrown away, so a split
  // exit with one missing rate published a believable, understated idea result with nothing saying so.
  const rows = foldRoundTrips([
    closure({ symbol: 'CANE', quantity: 100, realizedBase: 3703.48, closeTradeID: 'a' }),
    closure({ symbol: 'CANE', quantity: 50, realizedBase: null as unknown as number, closeFxRateToBase: null, closeTradeID: 'b' }),
  ])
  const groups = groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { a: 'sugar', b: 'sugar' }))
  const sugar = groups.find((g) => g.label === 'Sugar')!
  assert.ok(sugar.unvalued > 0, 'the unvalued leg is counted, not silently dropped')
  assert.ok(near(sugar.realized, 3703.48, 1e-6), 'and the total is the convertible part only')
})

check('a fully valued idea reports no missing legs', () => {
  const rows = foldRoundTrips([closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'a' })])
  assert.equal(groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { a: 'sugar' }))[0]!.unvalued, 0)
})

// ---------- every fill: the blotter ----------
// A round trip exists only once something is sold, so the round-trip table could never show a buy still
// held. These pin how the screen reads the fills the engine sends.
function fill(o: Partial<PortfolioExecution> & { id: string; executedAt: string }): PortfolioExecution {
  return {
    key: 'conid:1', symbol: 'GLDM', currency: 'USD', side: 'buy', quantity: 10, price: 50, multiplier: 1,
    commission: -1, positionBefore: 0, positionAfter: 10, effect: 'open', openedQuantity: 10, stillOpen: 10,
    unmatchedQuantity: 0, realizedLocal: null, costsUnknown: false, inferred: false, isDerivative: false,
    ...o,
  }
}

check('every fill is listed newest first, the buys still held included', () => {
  const rows = fillRows([
    fill({ id: 'a', executedAt: '2026-05-15T10:00:00' }),
    fill({ id: 'b', executedAt: '2026-06-02T10:00:00', effect: 'add', positionBefore: 10, positionAfter: 15, quantity: 5, openedQuantity: 5, stillOpen: 5 }),
  ])
  assert.deepEqual(rows.map((r) => r.id), ['b', 'a'])
  assert.ok(rows.every((r) => r.current), 'both built the position still held')
})

check('open positions keeps only the fills since the name last went flat', () => {
  // Bought in May, sold out in July, bought again in August: only August is part of what is held.
  const rows = fillRows([
    fill({ id: 'may', symbol: 'SGOV', key: 'conid:2', executedAt: '2026-05-11T10:00:00', quantity: 100, positionAfter: 100, openedQuantity: 100, stillOpen: 0 }),
    fill({ id: 'jul', symbol: 'SGOV', key: 'conid:2', executedAt: '2026-07-30T10:00:00', side: 'sell', effect: 'close', quantity: 100, positionBefore: 100, positionAfter: 0, openedQuantity: 0, stillOpen: 0, realizedLocal: 97.37 }),
    fill({ id: 'aug', symbol: 'SGOV', key: 'conid:2', executedAt: '2026-08-04T10:00:00', quantity: 50, positionAfter: 50, openedQuantity: 50, stillOpen: 50 }),
  ])
  assert.deepEqual(filterFills(rows, 'open', null).map((r) => r.id), ['aug'])
  assert.deepEqual(filterFills(rows, 'all', null).map((r) => r.id), ['aug', 'jul', 'may'])
})

check('a name sold out completely has nothing under open positions', () => {
  const rows = fillRows([
    fill({ id: 'buy', symbol: 'CANE', key: 'conid:3', executedAt: '2026-08-07T10:00:00' }),
    fill({ id: 'sell', symbol: 'CANE', key: 'conid:3', executedAt: '2026-08-20T10:00:00', side: 'sell', effect: 'close', positionBefore: 10, positionAfter: 0, openedQuantity: 0, stillOpen: 0 }),
  ])
  assert.equal(filterFills(rows, 'open', null).length, 0)
})

check('a short still open is an open position, and reads as one', () => {
  const rows = fillRows([fill({ id: 's', symbol: 'DDD', key: 'conid:4', executedAt: '2026-02-12T10:00:00', side: 'sell', positionAfter: -30, quantity: 30, openedQuantity: 30, stillOpen: 30 })])
  assert.equal(rows[0]!.current, true)
  assert.equal(fillAction(rows[0]!), 'opened short')
})

check('two contracts sharing a symbol keep separate histories', () => {
  // A symbol is not a contract: two futures expiries share a root. The flat one's fills are history.
  const rows = fillRows([
    fill({ id: 'mar', symbol: 'CL', key: 'conid:10', executedAt: '2026-01-05T10:00:00' }),
    fill({ id: 'marx', symbol: 'CL', key: 'conid:10', executedAt: '2026-02-05T10:00:00', side: 'sell', effect: 'close', positionBefore: 10, positionAfter: 0, openedQuantity: 0, stillOpen: 0 }),
    fill({ id: 'jun', symbol: 'CL', key: 'conid:11', executedAt: '2026-02-06T10:00:00' }),
  ])
  assert.deepEqual(filterFills(rows, 'open', 'CL').map((r) => r.id), ['jun'])
})

check('the name filter and the scope compose', () => {
  const rows = fillRows([
    fill({ id: 'g', executedAt: '2026-05-15T10:00:00' }),
    fill({ id: 'n', symbol: 'NHYDY', key: 'conid:5', executedAt: '2026-07-22T10:00:00' }),
  ])
  assert.deepEqual(filterFills(rows, 'all', 'NHYDY').map((r) => r.id), ['n'])
  assert.deepEqual(filterFills(rows, 'open', 'GLDM').map((r) => r.id), ['g'])
})

check('a buy reads as held, partly sold or sold from what is still open', () => {
  assert.equal(fillStatus({ openedQuantity: 100, stillOpen: 100 }), 'held')
  assert.equal(fillStatus({ openedQuantity: 100, stillOpen: 50 }), 'part')
  assert.equal(fillStatus({ openedQuantity: 100, stillOpen: 0 }), 'sold')
  assert.equal(fillStatus({ openedQuantity: 0, stillOpen: 0 }), null, 'a pure sale has no remainder to report')
})

check('the action words follow what the fill did', () => {
  const at = '2026-01-01T10:00:00'
  assert.equal(fillAction(fill({ id: '1', executedAt: at })), 'opened')
  assert.equal(fillAction(fill({ id: '2', executedAt: at, effect: 'add' })), 'added')
  assert.equal(fillAction(fill({ id: '3', executedAt: at, side: 'sell', effect: 'reduce' })), 'trimmed')
  assert.equal(fillAction(fill({ id: '4', executedAt: at, side: 'sell', effect: 'close' })), 'closed')
  assert.equal(fillAction(fill({ id: '5', executedAt: at, side: 'sell', effect: 'flip', positionAfter: -50 })), 'reversed to short')
  assert.equal(fillAction(fill({ id: '6', executedAt: at, side: 'sell', effect: 'unmatched', positionAfter: 0 })), 'no open lot')
})

check('the summary counts exactly the rows shown', () => {
  const rows = fillRows([
    fill({ id: 'o', executedAt: '2026-05-15T10:00:00' }),
    fill({ id: 'a1', executedAt: '2026-06-01T10:00:00', effect: 'add', positionBefore: 10, positionAfter: 20 }),
    fill({ id: 'a2', executedAt: '2026-06-02T10:00:00', effect: 'add', positionBefore: 20, positionAfter: 30 }),
    fill({ id: 't', executedAt: '2026-06-03T10:00:00', side: 'sell', effect: 'reduce', positionBefore: 30, positionAfter: 25, openedQuantity: 0, stillOpen: 0 }),
  ])
  assert.deepEqual(fillSummary(rows), { fills: 4, buys: 3, sells: 1, adds: 2, positions: 1, inferred: 0, costsUnknown: 0 })
})

check('the name list marks which names are still held', () => {
  const rows = fillRows([
    fill({ id: 'g', executedAt: '2026-05-15T10:00:00' }),
    fill({ id: 'c1', symbol: 'CANE', key: 'conid:3', executedAt: '2026-08-07T10:00:00' }),
    fill({ id: 'c2', symbol: 'CANE', key: 'conid:3', executedAt: '2026-08-20T10:00:00', side: 'sell', effect: 'close', positionBefore: 10, positionAfter: 0, openedQuantity: 0, stillOpen: 0 }),
  ])
  assert.deepEqual(fillSymbols(rows), [{ symbol: 'CANE', fills: 2, held: false }, { symbol: 'GLDM', fills: 1, held: true }])
})

check('a flip starts a new position: the long it closed is history', () => {
  // Buy 100, then one C;O sale of 150: the long is closed and a 50 short opened in the same fill. Nothing
  // leaves the position at zero, so "last went flat" alone kept the closed long's buy under open positions.
  const rows = fillRows([
    fill({ id: 'long', executedAt: '2026-01-01T10:00:00', quantity: 100, positionAfter: 100, openedQuantity: 100, stillOpen: 0 }),
    fill({ id: 'flip', executedAt: '2026-02-01T10:00:00', side: 'sell', effect: 'flip', quantity: 150, positionBefore: 100, positionAfter: -50, openedQuantity: 50, stillOpen: 50, realizedLocal: 200 }),
  ])
  assert.deepEqual(filterFills(rows, 'open', null).map((r) => r.id), ['flip'])
})

check('fills after a flip belong to the new position, and closing it leaves nothing open', () => {
  const held = [
    fill({ id: 'long', executedAt: '2026-01-01T10:00:00', quantity: 100, positionAfter: 100, openedQuantity: 100, stillOpen: 0 }),
    fill({ id: 'flip', executedAt: '2026-02-01T10:00:00', side: 'sell', effect: 'flip', quantity: 150, positionBefore: 100, positionAfter: -50, openedQuantity: 50, stillOpen: 50 }),
    fill({ id: 'add', executedAt: '2026-02-10T10:00:00', side: 'sell', effect: 'add', quantity: 30, positionBefore: -50, positionAfter: -80, openedQuantity: 30, stillOpen: 30 }),
  ]
  assert.deepEqual(filterFills(fillRows(held), 'open', null).map((r) => r.id), ['add', 'flip'])
  const covered = [...held, fill({ id: 'cover', executedAt: '2026-03-01T10:00:00', effect: 'close', quantity: 80, positionBefore: -80, positionAfter: 0, openedQuantity: 0, stillOpen: 0 })]
  assert.equal(filterFills(fillRows(covered), 'open', null).length, 0)
})

check('a flip back from short to long resets the same way', () => {
  const rows = fillRows([
    fill({ id: 'short', executedAt: '2026-01-01T10:00:00', side: 'sell', quantity: 30, positionAfter: -30, openedQuantity: 30, stillOpen: 0 }),
    fill({ id: 'back', executedAt: '2026-02-01T10:00:00', effect: 'flip', quantity: 50, positionBefore: -30, positionAfter: 20, openedQuantity: 20, stillOpen: 20 }),
  ])
  assert.deepEqual(filterFills(rows, 'open', null).map((r) => r.id), ['back'])
})

check('the blotter says its figures are in the trade’s currency whenever that is not the base', () => {
  const at = '2026-01-01T10:00:00'
  // The miss this pins: a single-currency EUR book on a USD base showed local realised with no note,
  // because the note fired only when the fills themselves spanned two currencies.
  assert.equal(fillsOutsideBase([fill({ id: 'e', executedAt: at, currency: 'EUR' })], 'USD'), true)
  assert.equal(fillsOutsideBase([fill({ id: 'u', executedAt: at })], 'USD'), false, 'figures already in the base need no note')
  assert.equal(fillsOutsideBase([fill({ id: 'u', executedAt: at }), fill({ id: 'e', executedAt: at, currency: 'EUR' })], 'USD'), true)
  assert.equal(fillsOutsideBase([fill({ id: 'u', executedAt: at })], null), true, 'an unknown base cannot be claimed')
})

check('the summary counts inferred fills and sales missing a commission', () => {
  const rows = fillRows([
    fill({ id: 'guess', executedAt: '2026-01-01T10:00:00', side: 'sell', positionAfter: -10, inferred: true }),
    fill({ id: 'cost', executedAt: '2026-01-02T10:00:00', effect: 'close', positionBefore: -10, positionAfter: 0, openedQuantity: 0, stillOpen: 0, realizedLocal: 5, costsUnknown: true }),
  ])
  const s = fillSummary(rows)
  assert.deepEqual([s.inferred, s.costsUnknown], [1, 1])
})

check('a round trip with a blank commission on any leg says realised is missing a cost', () => {
  // Two orders of one sale fold into one row; the broker gave no commission on one of them.
  const rows = foldRoundTrips([
    closure({ quantity: 100, realizedBase: 19.47, closeTradeID: 'a', costsUnknown: true }),
    closure({ quantity: 200, realizedBase: 38.95, closeTradeID: 'b', costsUnknown: false }),
  ])
  assert.equal(rows.length, 1)
  assert.equal(rows[0]!.costsUnknown, 1)
  // An engine that predates the field sends nothing, and the row then makes no claim (DESIGN.md §5).
  assert.equal(foldRoundTrips([closure({ quantity: 50, realizedBase: 5, closeTradeID: 'c' })])[0]!.costsUnknown, 0)
})

check('an idea whose trades include a blank commission carries the count', () => {
  const rows = foldRoundTrips([closure({ symbol: 'CANE', quantity: 100, realizedBase: 10, closeTradeID: 'a', costsUnknown: true })])
  assert.equal(groupByIdea(rows, ideaBook([['sugar', 'Sugar']], { a: 'sugar' }))[0]!.costsUnknown, 1)
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
