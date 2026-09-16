// The Positions table's two bases: today's price where the feed reached the holding, the statement's where it
// did not — and never half of each in one row.
// Run: npx tsx src/components/portfolio/positionMarks.test.ts
import assert from 'node:assert/strict'
import { livePriceIndex, markPosition } from './positionMarks'
import type { PortfolioLiveMark, PortfolioLiveRow, PortfolioPosition } from '../../lib/types'

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
const near = (a: number | null, b: number, eps = 1e-9) => a !== null && Math.abs(a - b) < eps

const pos = (o: Partial<PortfolioPosition> & { symbol: string }): PortfolioPosition => ({
  conid: '1', assetCategory: 'STK', subCategory: null, expiry: null, strike: null, putCall: null,
  currency: 'USD', quantity: 100, markPrice: 50, costBasisPrice: 40, costBasisMoney: 4000,
  positionValue: 5000, percentOfNAV: 5, unrealizedLocal: 1000, fxRateToBase: 1, multiplier: 1,
  isDerivative: false, ...o,
} as PortfolioPosition)
const priced = (o: Partial<PortfolioLiveRow> & { symbol: string }): PortfolioLiveRow =>
  ({ quantity: 100, statementPrice: 50, price: 55, value: 5500, movePct: 10, ...o })
const mark = (rows: PortfolioLiveRow[], nav: number | null = 100_000): PortfolioLiveMark => ({
  asOf: '2026-09-16', asOfIsClose: true, delayed: true, stale: false, bookAsOf: '2026-09-09', staleDays: 7,
  nav, unrealised: null, cash: null, priced: rows, unpriced: [], unavailable: null,
})

check('a holding the feed priced is shown at the market, with the move since the statement', () => {
  const p = pos({ symbol: 'GOOG' })
  const m = markPosition(p, livePriceIndex(mark([priced({ symbol: 'GOOG' })]), [p]), 100_000)
  assert.equal(m.live, true)
  assert.equal(m.price, 55)
  assert.ok(near(m.value, 5500), 'the statement value moved by the price move')
  assert.ok(near(m.unrealised, 1500), 'against the statement’s own cost of 4000')
  assert.ok(near(m.weightPct, 5.5), '5500 of a 100,000 estimate')
  assert.equal(m.movePct, 10)
})

check('the value is the statement’s own, scaled — never quantity × price', () => {
  // A bond quoted at a percentage of par: 100 × 99.5 is 9,950, and the broker's own value is 99,500. Re-deriving
  // it here would be a hundredfold error; scaling the broker's figure by the move cannot be.
  const bond = pos({ symbol: 'T', assetCategory: 'BOND', markPrice: 99.5, positionValue: 99_500, costBasisMoney: 98_000, quantity: 1000 })
  const m = markPosition(bond, livePriceIndex(mark([priced({ symbol: 'T', statementPrice: 99.5, price: 100.5 })]), [bond]), 1_000_000)
  assert.ok(near(m.value!, 99_500 * (100.5 / 99.5)), `expected the scaled value, got ${m.value}`)
  assert.ok(near(m.unrealised!, 99_500 * (100.5 / 99.5) - 98_000))
})

check('a holding the feed could not price stays exactly as the statement stated it', () => {
  const p = pos({ symbol: 'EMAAR' })
  const m = markPosition(p, livePriceIndex(mark([priced({ symbol: 'GOOG' })]), [p]), 100_000)
  assert.deepEqual([m.live, m.price, m.value, m.unrealised, m.weightPct], [false, 50, 5000, 1000, 5])
})

check('one symbol held in two currencies is never priced from a quote that cannot say which line it is', () => {
  // The engine's price map is keyed by ticker, so two listings of one symbol share a quote. Both stay on the
  // statement rather than one of them taking a price that may belong to the other.
  const usd = pos({ symbol: 'SHEL', currency: 'USD', conid: '10' })
  const gbp = pos({ symbol: 'SHEL', currency: 'GBP', conid: '11', markPrice: 2500, positionValue: 250_000 })
  const index = livePriceIndex(mark([priced({ symbol: 'SHEL' })]), [usd, gbp])
  assert.equal(index.size, 0)
  assert.equal(markPosition(usd, index, 100_000).live, false)
  assert.equal(markPosition(gbp, index, 100_000).live, false)
})

check('no feed, an unavailable estimate, or no net asset value: the statement, unchanged', () => {
  const p = pos({ symbol: 'GOOG' })
  const none = markPosition(p, livePriceIndex(null, [p]), null)
  const off = markPosition(p, livePriceIndex({ ...mark([priced({ symbol: 'GOOG' })]), unavailable: 'the price feed could not be reached' }, [p]), null)
  const noNav = markPosition(p, livePriceIndex(mark([priced({ symbol: 'GOOG' })], null), [p]), null)
  assert.deepEqual([none.live, off.live, noNav.live], [false, false, false])
  assert.equal(noNav.price, 50, 'and it is the statement’s mark, not a live price beside a statement weight')
})

check('without a cost basis the statement’s own unrealised is carried by what the value moved', () => {
  const p = pos({ symbol: 'GOOG', costBasisMoney: null })
  const m = markPosition(p, livePriceIndex(mark([priced({ symbol: 'GOOG' })]), [p]), 100_000)
  assert.equal(m.live, true)
  assert.ok(near(m.unrealised, 1000 + 500), 'the statement’s 1000 plus the 500 the value moved')
})

check('without the statement’s own rate the row stays whole, on the statement', () => {
  const p = pos({ symbol: 'KAR', currency: 'AUD', fxRateToBase: null })
  const m = markPosition(p, livePriceIndex(mark([priced({ symbol: 'KAR' })]), [p]), 100_000)
  assert.equal(m.live, false, 'a live value with a statement weight would be two bases in one row')
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
