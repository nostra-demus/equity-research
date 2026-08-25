// The book: FIFO matching, capital flows, income, time-weighted return, and the reconciliation that
// proves the whole thing against the statement. Every expected number below is hand-computable from
// test/fixtures/flex-sample.xml — see that file's header for the arithmetic.
// Run: npx tsx test/portfolio-book.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFlexXml } from '../src/portfolio-import'
import { alignFlowsToNavDates, buildBook, computeTwr, runFifo } from '../src/portfolio'

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
  assert.ok(near(aaa[0]!.grossLocal, 500), `gross 500, got ${aaa[0]!.grossLocal}`)
  // net of this lot's whole opening commission (-1) plus 100/150 of the closing commission (-2)
  assert.ok(near(aaa[0]!.realizedLocal, 497.666666, 1e-4), `expected 497.6667, got ${aaa[0]!.realizedLocal}`)
  assert.equal(aaa[1]!.quantity, 50)
  assert.equal(aaa[1]!.entryPrice, 12)
  assert.ok(near(aaa[1]!.grossLocal, 150), `gross 150, got ${aaa[1]!.grossLocal}`)
  // half the second lot's opening commission (-0.5) plus 50/150 of the closing commission (-0.6667)
  assert.ok(near(aaa[1]!.realizedLocal, 148.833333, 1e-4), `expected 148.8333, got ${aaa[1]!.realizedLocal}`)
})

check('the unclosed remainder stays open as a lot', () => {
  const aaa = book.openLots.filter((l) => l.symbol === 'AAA')
  assert.equal(aaa.length, 1)
  assert.equal(aaa[0]!.quantity, 50)
  assert.equal(aaa[0]!.price, 12)
})

check('a futures closure applies the contract multiplier', () => {
  const ccc = book.closures.find((c) => c.symbol === 'CCC')!
  assert.ok(near(ccc.grossLocal, 20000), `2 lots x 100 x $100 = 20000 gross, got ${ccc.grossLocal}`)
  assert.ok(near(ccc.realizedLocal, 19992), `net of -4 each leg = 19992, got ${ccc.realizedLocal}`)
})

check('a SHORT round trip realises a gain when it is bought back lower', () => {
  const ddd = book.closures.find((c) => c.symbol === 'DDD')!
  assert.equal(ddd.entryPrice, 50)
  assert.equal(ddd.exitPrice, 45)
  assert.ok(near(ddd.grossLocal, 150), `sold 50 bought 45 on 30 = +150 gross, got ${ddd.grossLocal}`)
  assert.ok(near(ddd.realizedLocal, 148), `net of -1 each leg = 148, got ${ddd.realizedLocal}`)
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
  assert.ok(near(closures[0]!.grossLocal, 100), 'local gross gain is 10 x 10 = 100')
  assert.ok(near(closures[0]!.realizedLocal, 98), 'net of -1 commission on each leg')
  assert.ok(near(closures[0]!.realizedBase!, 117.6), 'base uses the CLOSING rate: 98 x 1.2 = 117.6')
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

check('commission is netted on BOTH legs, matching how the broker states realised P&L', () => {
  // Found on a real statement: gross-only left a break of exactly the closing commission plus the
  // opening lot's apportioned share. Each closure now carries the split so it can be shown apart.
  for (const c of book.closures) {
    assert.ok(near(c.realizedLocal, c.grossLocal + c.commissionLocal, 1e-6), `${c.symbol} does not split cleanly`)
    assert.ok(c.commissionLocal <= 0, 'commission is a cost, never a credit')
  }
  const totalComm = book.closures.reduce((a, c) => a + c.commissionLocal, 0)
  assert.ok(near(totalComm, -13.5, 1e-4), `-2.3333 -1.1667 -8 -2 = -13.5, got ${totalComm}`)
})

check('a flow on a non-trading day lands on the next valued day, not the floor', () => {
  // The real-statement bug: a Saturday deposit matched no NAV row, was silently dropped, and Monday's
  // jump then read as a +99% day — over 100 percentage points of phantom return.
  const nav = [{ date: '2026-05-08', total: 1000 }, { date: '2026-05-11', total: 2000 }]
  const aligned = alignFlowsToNavDates([{ date: '2026-05-09', amount: 1000, amountBase: null }], nav)
  assert.equal(aligned.get('2026-05-11'), 1000, 'the Saturday flow must land on Monday')
  assert.equal(aligned.size, 1)
  // and with it aligned, the day is flat rather than a doubling
  assert.ok(near(computeTwr(nav, aligned)!, 0, 1e-9), 'a pure deposit is not performance')
})

check('a flow after the last valued day has nowhere to land and is ignored', () => {
  const nav = [{ date: '2026-05-08', total: 1000 }, { date: '2026-05-11', total: 2000 }]
  const aligned = alignFlowsToNavDates([{ date: '2026-06-01', amount: 500, amountBase: null }], nav)
  assert.equal(aligned.size, 0)
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
  assert.equal(book.positions.length, 4)
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
  assert.equal(book.reconciliation.checks.length, 8)
})

check('the book verifies NAV, return, realised P&L, positions and cash', () => {
  const names = book.reconciliation.checks.map((c) => c.name)
  for (const n of ['Net asset value', 'NAV bridge', 'Time-weighted return', 'Realised P&L',
                   'Open positions', 'Capital flows', 'Dividends', 'Withholding tax']) {
    assert.ok(names.includes(n), `missing check: ${n}`)
  }
})

check('derived lots are checked against the broker position snapshot', () => {
  // Catches a history that starts after a position was opened, which nothing else would notice.
  const short = buildBook([{ ...doc, trades: doc.trades.filter((t) => t.symbol !== 'EEE') }])
  const positions = short.reconciliation.checks.find((c) => c.name === 'Open positions')!
  assert.equal(positions.ok, false, 'a position with no opening trade must break the check')
  assert.ok(near(positions.break!, 200), `the missing 200 shares should be the break, got ${positions.break}`)
})

check('a check that cannot be evaluated fails the book rather than being skipped', () => {
  // Every close missing its opening lot leaves no realised P&L of our own; certifying on the other
  // checks would let "reconciles" mean "the checks we happened to run passed".
  const closesOnly = doc.trades.filter((t) => (t.openCloseIndicator ?? '').includes('C'))
  const b = buildBook([{ ...doc, trades: closesOnly, openPositions: [] }])
  const realised = b.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.equal(realised.ok, false)
  assert.match(realised.detail, /starts too late|could not be evaluated/)
  assert.equal(b.reconciliation.ok, false)
})

check('a book may not mix two accounts', () => {
  const other = { ...doc, accountId: 'U9999999', accountIds: ['U9999999'] }
  assert.throws(() => buildBook([doc, other]), /span 2 accounts/)
})

check('our FIFO total agrees with the statement’s own realised P&L', () => {
  const realised = book.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(near(realised.ours!, 20786.5, 1e-4), `net of commission on both legs = 20786.50, got ${realised.ours}`)
  assert.ok(near(realised.broker!, 20786.5, 1e-4))
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

// ---------- regressions from code review ----------
check('re-importing an overlapping export still RECONCILES (not just equal counts)', () => {
  // The realised check summed the raw union of trades while closures came from the deduped set, so a
  // second copy doubled the broker side and a healthy book reported a huge break.
  const twice = buildBook([doc, parseFlexXml(xml)])
  assert.equal(twice.reconciliation.ok, true, twice.reconciliation.checks.filter((c) => !c.ok).map((c) => `${c.name} break=${c.break}`).join('; '))
  const realised = twice.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(near(realised.broker!, 20786.5, 1e-4), `broker side must not double, got ${realised.broker}`)
})

check('a restated trade supersedes the original instead of stacking on it', () => {
  // A corporate action emits a NEW tradeID whose origTradeID names the row it replaces. Keyed dedup
  // keeps both, so a 2:1 split left 300 shares where 200 are held.
  const pre = { ...doc.trades[0]!, tradeID: 'S-PRE', transactionID: 'SX-PRE', symbol: 'SPL', conid: '77', quantity: 100, tradePrice: 50, openCloseIndicator: 'O', dateTime: '2026-02-01T10:00:00', levelOfDetail: 'EXECUTION', origTradeID: null, origTransactionID: null }
  const post = { ...pre, tradeID: 'S-POST', transactionID: 'SX-POST', quantity: 200, tradePrice: 25, origTradeID: 'S-PRE', origTransactionID: 'SX-PRE' }
  const book2 = buildBook([{ ...doc, trades: [pre, post], openPositions: [], cashTransactions: [], equitySummary: [], changeInNav: null }])
  const spl = book2.openLots.filter((l) => l.symbol === 'SPL')
  assert.equal(spl.length, 1, 'the pre-restatement trade must not survive alongside its replacement')
  assert.equal(spl[0]!.quantity, 200, `expected the restated 200 shares, got ${spl[0]!.quantity}`)
})

check('a cash row with no transaction id still dedups on re-import', () => {
  const anon = { ...doc.cashTransactions[5]!, transactionID: null }
  const one = buildBook([{ ...doc, cashTransactions: [anon] }])
  const two = buildBook([{ ...doc, cashTransactions: [anon] }, { ...doc, cashTransactions: [{ ...anon }] }])
  assert.equal(two.flows.length, one.flows.length, 'an id-less flow duplicated on re-import')
})

check('the newest statement is chosen by date, not by argument order', () => {
  const older = parseFlexXml(xml.replace('toDate="20260104"', 'toDate="20260103"'))
  const newestFirst = buildBook([doc, older])
  const oldestFirst = buildBook([older, doc])
  assert.equal(newestFirst.reconciliation.ok, oldestFirst.reconciliation.ok)
  assert.equal(newestFirst.reconciliation.ok, true, 'argument order must not create a break')
})

check('a blank open/close indicator is inferred, not assumed to open', () => {
  // IBKR leaves this empty for several asset classes; assuming "open" turned a sell against a long
  // into a phantom short lot with no closure and no warning.
  const buy = { ...doc.trades[0]!, tradeID: 'B1', symbol: 'BLK', conid: '55', quantity: 100, tradePrice: 10, openCloseIndicator: null, dateTime: '2026-01-01T10:00:00', levelOfDetail: 'EXECUTION' }
  const sell = { ...buy, tradeID: 'B2', quantity: -60, tradePrice: 15, dateTime: '2026-02-01T10:00:00' }
  const { lots, closures, warnings } = runFifo([buy, sell])
  assert.equal(closures.length, 1, 'the sell must close against the long, not open a short')
  assert.equal(closures[0]!.quantity, 60)
  assert.equal(lots.length, 1)
  assert.equal(lots[0]!.quantity, 40, 'the unsold remainder stays long')
  assert.equal(warnings.length, 0)
})

check('a withdrawal larger than the book does not produce a wild return', () => {
  const twr = computeTwr(
    [{ date: '2026-01-01', total: 1000 }, { date: '2026-01-02', total: 100 }],
    new Map([['2026-01-02', -2000]]), // base goes negative
  )
  assert.equal(twr, null, 'a negative opening base has no meaningful return')
})

check('a foreign amount is never counted as base currency without a rate', () => {
  const eur = { ...doc.cashTransactions[0]!, transactionID: 'FX1', currency: 'EUR', amount: 1000, fxRateToBase: null, type: 'Dividends' }
  // no ConversionRates for EUR->USD: the row must be excluded and reported, not added at face value
  const noRates = buildBook([{ ...doc, cashTransactions: [eur], conversionRates: [] }])
  assert.equal(noRates.income.dividendsGross, 0, 'an unvaluable dividend must not enter income')
  assert.ok(noRates.warnings.some((w) => /could not be valued/.test(w)), 'the exclusion must be reported')
  // with the statement's own rate grid present, it converts
  const withRates = buildBook([{ ...doc, cashTransactions: [eur], conversionRates: [{ reportDate: '2026-02-15', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1 }] }])
  assert.ok(near(withRates.income.dividendsGross, 1100), `1000 EUR at 1.1 = 1100, got ${withRates.income.dividendsGross}`)
})

check('the book reports what the query actually contained', () => {
  assert.equal(book.accountId, 'U0000000')
  assert.equal(book.baseCurrency, 'USD')
  assert.equal(book.asOf, '2026-01-04')
  assert.equal(book.coverage.documents, 1)
  assert.equal(book.sectionsPresent.length, 7)
  assert.ok(book.sectionsUnmodelled.includes('SecuritiesInfo'), 'an unread section must be reported')
  assert.equal(book.corporateActions.length, 1)
  assert.equal(book.warnings.length, 0)
})

check('a book cannot be built from nothing', () => {
  assert.throws(() => buildBook([]), /no Flex documents/)
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
