// One row per ROUND TRIP, folded twice: FIFO gives one closure per opening lot, and a single sale
// routinely leaves the broker as several orders. The invariant that matters is that folding is pure
// presentation — every total must survive it untouched.
// Run: npx tsx src/components/portfolio/tradeRows.test.ts
import assert from 'node:assert/strict'
import { foldRoundTrips, groupByIdea } from './tradeRows'
import type { PortfolioClosure, PortfolioIdeaBook } from '../../lib/types'

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

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
