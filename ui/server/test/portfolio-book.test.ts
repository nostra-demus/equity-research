// The book: FIFO matching, capital flows, income, time-weighted return, and the reconciliation that
// proves the whole thing against the statement. Every expected number below is hand-computable from
// test/fixtures/flex-sample.xml — see that file's header for the arithmetic.
// Run: npx tsx test/portfolio-book.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFlexXml } from '../src/portfolio-import'
import { buildBook, computeTwr, runFifo } from '../src/portfolio'

const here = path.dirname(fileURLToPath(import.meta.url))
const xml = fs.readFileSync(path.join(here, 'fixtures', 'flex-sample.xml'), 'utf8')
const doc = parseFlexXml(xml)
const book = buildBook([doc])

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

// ---------- FIFO ----------
check('a sell across two lots produces two closures, oldest lot first', () => {
  const aaa = book.closures.filter((c) => c.symbol === 'AAA')
  assert.equal(aaa.length, 2)
  assert.equal(aaa[0]!.quantity, 100)
  assert.equal(aaa[0]!.entryPrice, 10)
  assert.ok(near(aaa[0]!.realizedLocal, 500), `expected 500, got ${aaa[0]!.realizedLocal}`)
  assert.equal(aaa[1]!.quantity, 50)
  assert.equal(aaa[1]!.entryPrice, 12)
  assert.ok(near(aaa[1]!.realizedLocal, 150), `expected 150, got ${aaa[1]!.realizedLocal}`)
})

check('the unclosed remainder stays open as a lot', () => {
  const aaa = book.openLots.filter((l) => l.symbol === 'AAA')
  assert.equal(aaa.length, 1)
  assert.equal(aaa[0]!.quantity, 50)
  assert.equal(aaa[0]!.price, 12)
})

check('a futures closure applies the contract multiplier', () => {
  const ccc = book.closures.find((c) => c.symbol === 'CCC')!
  assert.ok(near(ccc.realizedLocal, 20000), `2 lots x 100 x $100 = 20000, got ${ccc.realizedLocal}`)
})

check('a SHORT round trip realises a gain when it is bought back lower', () => {
  const ddd = book.closures.find((c) => c.symbol === 'DDD')!
  assert.equal(ddd.entryPrice, 50)
  assert.equal(ddd.exitPrice, 45)
  assert.ok(near(ddd.realizedLocal, 150), `sold 50 bought 45 on 30 = +150, got ${ddd.realizedLocal}`)
})

check('holding period is measured open to close', () => {
  const aaa = book.closures.find((c) => c.symbol === 'AAA')!
  assert.equal(aaa.holdingDays, 59) // 2026-01-05 → 2026-03-05
})

check('a SUMMARY row is ignored so fills are never double counted', () => {
  // T-SUM would add a phantom 50-share AAA lot if summary rows were treated as fills.
  const aaaLots = book.openLots.filter((l) => l.symbol === 'AAA')
  assert.equal(aaaLots.length, 1, 'a summary row leaked into the lot engine')
})

check('a non-base closure converts at the closing trade’s own fx rate', () => {
  const { closures } = runFifo([
    { ...doc.trades[0]!, tradeID: 'E1', symbol: 'EUX', conid: '9', currency: 'EUR', quantity: 10, tradePrice: 100, openCloseIndicator: 'O', fxRateToBase: 1.1, dateTime: '2026-01-01T10:00:00', multiplier: 1, levelOfDetail: 'EXECUTION' },
    { ...doc.trades[0]!, tradeID: 'E2', symbol: 'EUX', conid: '9', currency: 'EUR', quantity: -10, tradePrice: 110, openCloseIndicator: 'C', fxRateToBase: 1.2, dateTime: '2026-02-01T10:00:00', multiplier: 1, levelOfDetail: 'EXECUTION' },
  ])
  assert.equal(closures.length, 1)
  assert.ok(near(closures[0]!.realizedLocal, 100), 'local gain is 10 x 10 = 100')
  assert.ok(near(closures[0]!.realizedBase!, 120), 'base gain uses the CLOSING rate: 100 x 1.2 = 120')
})

check('a close with no matching lot warns instead of inventing a position', () => {
  const { closures, warnings } = runFifo([
    { ...doc.trades[0]!, tradeID: 'Z1', symbol: 'ZZZ', conid: '99', quantity: -10, tradePrice: 5, openCloseIndicator: 'C', dateTime: '2026-01-01T10:00:00', levelOfDetail: 'EXECUTION' },
  ])
  assert.equal(closures.length, 0)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0]!, /history may start after this position was opened/)
})

// ---------- returns ----------
check('time-weighted return removes the effect of capital flows', () => {
  assert.ok(book.twr !== null)
  assert.ok(near(book.twr!, 10, 1e-9), `expected exactly 10%, got ${book.twr}`)
})

check('TWR ignores a day whose opening base is zero rather than returning Infinity', () => {
  const twr = computeTwr(
    [{ date: '2026-01-01', total: 0 }, { date: '2026-01-02', total: 5000 }, { date: '2026-01-03', total: 5500 }],
    new Map([['2026-01-02', 5000]]),
  )
  assert.ok(twr !== null && Number.isFinite(twr))
  assert.ok(near(twr, 10, 1e-9), `only the second day counts: +10%, got ${twr}`)
})

check('a series too short to have a return says so instead of guessing', () => {
  assert.equal(computeTwr([{ date: '2026-01-01', total: 100 }], new Map()), null)
  assert.equal(computeTwr([], new Map()), null)
})

// ---------- flows and income ----------
check('capital flows are separated from income', () => {
  assert.equal(book.flows.length, 2)
  const net = book.flows.reduce((a, f) => a + f.amount, 0)
  assert.ok(near(net, 5000), `10000 in, 5000 out, got ${net}`)
})

check('withholding tax is its own line, not folded into dividends', () => {
  assert.ok(near(book.income.dividendsGross, 1000), `gross dividends, got ${book.income.dividendsGross}`)
  assert.ok(near(book.income.withholdingTax, -150))
  assert.ok(near(book.income.paymentInLieu, 50), 'payment-in-lieu must not be read as a dividend')
  assert.ok(near(book.income.interest, 200))
  assert.ok(near(book.income.fees, -25))
  assert.ok(near(book.income.net, 1075), `1000 + 50 + 200 - 150 - 25 = 1075, got ${book.income.net}`)
})

// ---------- positions ----------
check('positions come through with the broker’s own weight', () => {
  assert.equal(book.positions.length, 3)
  const aaa = book.positions.find((p) => p.symbol === 'AAA')!
  assert.equal(aaa.percentOfNAV, 0.69)
  assert.equal(aaa.unrealizedLocal, 200)
})

check('a future is flagged as a derivative so its notional is never weighted like equity', () => {
  const fff = book.positions.find((p) => p.symbol === 'FFF')!
  assert.equal(fff.isDerivative, true)
  const aaa = book.positions.find((p) => p.symbol === 'AAA')!
  assert.equal(aaa.isDerivative, false)
})

// ---------- reconciliation ----------
check('every reconciliation check passes on a coherent statement', () => {
  const failed = book.reconciliation.checks.filter((c) => !c.ok)
  assert.equal(failed.length, 0, `failing: ${failed.map((f) => `${f.name} break=${f.break}`).join('; ')}`)
  assert.equal(book.reconciliation.ok, true)
  assert.equal(book.reconciliation.checks.length, 4)
})

check('NAV, the NAV bridge, TWR and realised P&L are each checked', () => {
  const names = book.reconciliation.checks.map((c) => c.name)
  for (const n of ['Net asset value', 'NAV bridge', 'Time-weighted return', 'Realised P&L']) {
    assert.ok(names.includes(n), `missing check: ${n}`)
  }
})

check('our FIFO total agrees with the statement’s own realised P&L', () => {
  const realised = book.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(near(realised.ours!, 20800), `500 + 150 + 20000 + 150 = 20800, got ${realised.ours}`)
  assert.ok(near(realised.broker!, 20800))
  assert.ok(near(realised.break!, 0))
})

check('a tampered NAV is caught, not absorbed', () => {
  const broken = parseFlexXml(xml.replace('endingValue="116000"', 'endingValue="118000"'))
  const b = buildBook([broken])
  assert.equal(b.reconciliation.ok, false)
  const nav = b.reconciliation.checks.find((c) => c.name === 'Net asset value')!
  assert.equal(nav.ok, false)
  assert.ok(near(nav.break!, -2000), `the break is reported, got ${nav.break}`)
})

// ---------- idempotency ----------
check('re-importing an overlapping document changes nothing', () => {
  const once = buildBook([doc])
  const twice = buildBook([doc, parseFlexXml(xml)])
  assert.equal(twice.closures.length, once.closures.length, 'closures double-counted')
  assert.equal(twice.openLots.length, once.openLots.length, 'lots double-counted')
  assert.equal(twice.flows.length, once.flows.length, 'capital flows double-counted')
  assert.ok(near(twice.income.net, once.income.net), 'income double-counted')
  assert.equal(twice.navSeries.length, once.navSeries.length, 'NAV series double-counted')
  assert.ok(near(twice.twr!, once.twr!), 'return changed on re-import')
})

check('the book reports what the query actually contained', () => {
  assert.equal(book.accountId, 'U0000000')
  assert.equal(book.baseCurrency, 'USD')
  assert.equal(book.asOf, '2026-01-04')
  assert.equal(book.coverage.documents, 1)
  assert.equal(book.sectionsPresent.length, 8)
  assert.equal(book.corporateActions.length, 1)
  assert.equal(book.warnings.length, 0)
})

check('a book cannot be built from nothing', () => {
  assert.throws(() => buildBook([]), /no Flex documents/)
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
