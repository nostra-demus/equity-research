// One row per ROUND TRIP, folded twice: FIFO gives one closure per opening lot, and a single sale
// routinely leaves the broker as several orders. The invariant that matters is that folding is pure
// presentation — every total must survive it untouched.
// Run: npx tsx src/components/portfolio/tradeRows.test.ts
import assert from 'node:assert/strict'
import { foldRoundTrips } from './tradeRows'
import type { PortfolioClosure } from '../../lib/types'

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
    key: `k${seq}`, symbol: 'SGOV', assetCategory: 'STK', currency: 'USD',
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

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
