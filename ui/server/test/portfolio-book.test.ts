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
  const aligned = alignFlowsToNavDates([{ date: '2026-05-09', amount: 1000, amountBase: 1000 }], nav)
  assert.equal(aligned.get('2026-05-11'), 1000, 'the Saturday flow must land on Monday')
  assert.equal(aligned.size, 1)
  // and with it aligned, the day is flat rather than a doubling
  assert.ok(near(computeTwr(nav, aligned)!, 0, 1e-9), 'a pure deposit is not performance')
})

check('a flow after the last valued day has nowhere to land and is ignored', () => {
  const nav = [{ date: '2026-05-08', total: 1000 }, { date: '2026-05-11', total: 2000 }]
  const aligned = alignFlowsToNavDates([{ date: '2026-06-01', amount: 500, amountBase: 500 }], nav)
  assert.equal(aligned.size, 0)
})

check('a flow with no base-currency value is EXCLUDED, exactly as the warning says', () => {
  // buildBook warns that an unconvertible flow "is excluded from the return calculation". Landing the
  // raw local amount instead would put, say, 90,000 INR into a USD chain as if it were 90,000 USD —
  // wrong by the exchange rate, and wrong in the direction that says the opposite of the warning.
  const nav = [{ date: '2026-05-08', total: 1000 }, { date: '2026-05-11', total: 1000 }]
  const aligned = alignFlowsToNavDates([{ date: '2026-05-11', amount: 90_000, amountBase: null }], nav)
  assert.equal(aligned.size, 0, 'an unvalued flow must not reach the return chain')
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
  assert.equal(book.reconciliation.checks.length, 10)
})

check('the book verifies NAV, return, realised P&L, positions and cash', () => {
  const names = book.reconciliation.checks.map((c) => c.name)
  for (const n of ['Net asset value', 'NAV bridge', 'Time-weighted return', 'Realised P&L',
                   'Open positions', 'Capital flows', 'Dividends', 'Withholding tax',
                   'Interest', 'Fees']) {
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
  // The grid must be dated on or before the row it values — a rate from after the fact is refused, see
  // the "never taken from AFTER the date it is valuing" case below.
  const withRates = buildBook([{ ...doc, cashTransactions: [eur], conversionRates: [{ reportDate: '2026-01-02', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1 }] }])
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

// ---------- honest reconciliation on the awkward books ----------

const openingBuy = {
  ...doc.trades[0]!,
  tradeID: 'OPEN1', transactionID: 'OPEN1', origTradeID: null, origTransactionID: null,
  symbol: 'ZZZ', conid: '9001', currency: 'USD', assetCategory: 'STK',
  quantity: 10, tradePrice: 5, multiplier: 1, fxRateToBase: 1,
  // The attribute IBKR really does stamp on an opening execution.
  fifoPnlRealized: 0, openCloseIndicator: 'O', ibCommission: 0, taxes: 0,
  levelOfDetail: 'EXECUTION',
}

check('an opening-only account is not accused of a broken history', () => {
  // fifoPnlRealized="0" rides along on OPENING rows too. Counting those as evidence that something was
  // closed made a brand-new account — buys only, nothing sold — fail its realised-P&L check outright.
  const built = buildBook([{ ...doc, trades: [openingBuy] }])
  const realised = built.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(realised, 'the check must still run')
  assert.ok(realised.ok, `nothing was closed, so nothing is unmatched: ${realised.detail}`)
})

check('an EMPTY position snapshot is compared against, not skipped', () => {
  // The broker says the account is flat and our lots say 10 shares are held. Requiring at least one
  // broker row before checking would certify exactly the book that disagrees most.
  const built = buildBook([{ ...doc, trades: [openingBuy], openPositions: [] }])
  const positions = built.reconciliation.checks.find((c) => c.name === 'Open positions')
  assert.ok(positions, 'an empty OpenPositions section is a statement of fact, not a missing section')
  assert.equal(positions!.ok, false, 'flat at the broker vs 10 held in our lots is a break')
  assert.ok(near(positions!.break!, 10))
})

check('a base-currency closure with no row-level FX rate is valued at 1, not left unconvertible', () => {
  // IBKR omits fxRateToBase on a trade already in the base currency. Reading the blank as "cannot be
  // valued" made a single-currency book refuse to compare realised P&L at all.
  const built = buildBook([{ ...doc, trades: doc.trades.map((t) => ({ ...t, fxRateToBase: null })) }])
  assert.ok(built.closures.length > 0)
  assert.ok(built.closures.every((c) => c.realizedBase !== null), 'a USD close in a USD book is convertible')
  const realised = built.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(realised.ok, realised.detail)
})

check('a bought option is NAV, not notional exposure', () => {
  // A futures contract is margin against notional. An option's marked premium is a real asset sitting
  // inside NAV, so flagging it notional strikes its value out of the invested total.
  const template = doc.openPositions.find((p) => !p.levelOfDetail || p.levelOfDetail.toUpperCase() === 'SUMMARY')!
  const built = buildBook([{
    ...doc,
    openPositions: [
      { ...template, symbol: 'OPT1', conid: '9100', assetCategory: 'OPT' },
      { ...template, symbol: 'FUT1', conid: '9101', assetCategory: 'FUT' },
    ],
  }])
  assert.equal(built.positions.find((p) => p.symbol === 'OPT1')!.isDerivative, false)
  assert.equal(built.positions.find((p) => p.symbol === 'FUT1')!.isDerivative, true)
})

check('two exports ending on the same day are ordered by when they were generated', () => {
  // A correction re-exported the same range: same toDate, different content. Without the tie-break the
  // order is whatever the store listed, so the STALE file could win the point-in-time snapshot.
  const template = doc.openPositions.find((p) => !p.levelOfDetail || p.levelOfDetail.toUpperCase() === 'SUMMARY')!
  const stale = { ...doc, whenGenerated: '2026-01-05T10:00:00', openPositions: [{ ...template, symbol: 'STALE', conid: '9200' }] }
  const fresh = { ...doc, whenGenerated: '2026-01-06T10:00:00', openPositions: [{ ...template, symbol: 'FRESH', conid: '9201' }] }
  // The stale one is passed LAST — only whenGenerated can move it back.
  const built = buildBook([fresh, stale])
  assert.ok(built.positions.some((p) => p.symbol === 'FRESH'), 'the later-generated export owns the snapshot')
  assert.ok(!built.positions.some((p) => p.symbol === 'STALE'))
})

check('a rate is never taken from AFTER the date it is valuing', () => {
  // The grid's oldest row is June; the dividend settled in January. Falling back to the newest rate in
  // the series would value it at a rate struck five months later and call the result a fact.
  const january = {
    ...doc.cashTransactions[0]!, transactionID: 'FXEARLY', currency: 'EUR', amount: 1000,
    fxRateToBase: null, type: 'Dividends', dateTime: '2026-01-02T00:00:00', settleDate: '2026-01-02',
  }
  const built = buildBook([{
    ...doc, cashTransactions: [january],
    conversionRates: [{ reportDate: '2026-06-30', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.5 }],
  }])
  assert.equal(built.income.dividendsGross, 0, 'a June rate cannot value a January dividend')
  assert.ok(built.warnings.some((w) => /could not be valued/.test(w)), 'the exclusion must be reported')
})

// ---------- review fixes ----------
check('a CLOSED_LOT row sharing a tradeID never evicts the execution it belongs to', () => {
  // IBKR can emit CLOSED_LOT and SUMMARY rows alongside the EXECUTION they came from, ALL carrying the
  // same tradeID. On an id-only dedupe key the last one written wins — and since both the FIFO run and
  // the realised-P&L check keep only EXECUTION rows, a lot row winning makes the fill vanish from the
  // book AND from the check that exists to catch a missing fill.
  const execution = doc.trades.find((t) => t.tradeID)!
  const lot = { ...execution, levelOfDetail: 'CLOSED_LOT', quantity: 1, fifoPnlRealized: 0 }
  const built = buildBook([{ ...doc, trades: [...doc.trades, lot] }])
  const plain = buildBook([doc])
  assert.equal(built.closures.length, plain.closures.length, 'the lot row must not change the round trips')
  assert.deepEqual(
    built.positions.map((p) => p.symbol).sort(), plain.positions.map((p) => p.symbol).sort(),
    'nor the positions',
  )
  assert.equal(built.reconciliation.ok, true, 'and the book must still reconcile')
})

check('two contracts that differ only by expiry keep separate FIFO queues', () => {
  // Without conid, a bare symbol merges instruments that merely share a ticker. Expiry was already
  // NAMED in the fallback key, but trade rows never carried it — so it always resolved to '' on the
  // trade side, merging two futures expiries and mismatching against the position-side key that had it.
  const base = doc.trades.find((t) => t.tradeID)!
  const mar = {
    ...base, tradeID: 'FUTM', conid: null, symbol: 'ESZ', assetCategory: 'FUT', expiry: '2026-03-20',
    quantity: 2, tradePrice: 5000, multiplier: 50, buySell: 'BUY', openCloseIndicator: 'O',
    fifoPnlRealized: 0, origTradeID: null, origTransactionID: null, transactionID: 'FUTM',
  }
  // DIFFERENT PRICES are what make this test discriminate. Same-priced lots leave the same quantity open
  // either way, so a merged queue would pass. March at 5,000 and June at 5,200 do not:
  //   separate queues -> the June sell closes JUNE (entry 5,200, a loss) and March stays open at 5,000
  //   one merged queue -> FIFO closes MARCH first (entry 5,000, a gain) and June stays open at 5,200
  const jun = { ...mar, tradeID: 'FUTJ', transactionID: 'FUTJ', expiry: '2026-06-19', tradePrice: 5200 }
  const junClose = {
    ...jun, tradeID: 'FUTJC', transactionID: 'FUTJC', quantity: -2, tradePrice: 5100,
    buySell: 'SELL', openCloseIndicator: 'C',
  }
  const { lots, closures } = runFifo([mar, jun, junClose])
  assert.equal(closures.length, 1, 'the June sell closes exactly one lot')
  assert.equal(closures[0]!.entryPrice, 5200, 'it must close the JUNE lot, not the older March one')
  assert.ok(closures[0]!.grossLocal < 0, 'closing June at 5,100 against 5,200 is a loss')
  assert.equal(lots.length, 1)
  assert.equal(lots[0]!.price, 5000, 'and March is what is left open')
})

check('dividend and withholding checks still run when the book spans several exports', () => {
  // They used to be switched off whenever more than one export was loaded — the NORMAL state of a book
  // assembled a year per query. Two checks silently vanished while the badge still read "Reconciled".
  const first = { ...doc, whenGenerated: '2026-01-05T00:00:00' }
  const second = { ...doc, whenGenerated: '2026-01-06T00:00:00' }
  const built = buildBook([first, second])
  const names = built.reconciliation.checks.map((c) => c.name)
  assert.ok(names.includes('Dividends'), 'the dividend check must survive a second document')
  assert.ok(names.includes('Withholding tax'), 'and so must withholding')
  assert.equal(built.reconciliation.ok, true, 'and both must pass on a coherent pair')
})

check('the windowed income check compares the statement\u2019s own window, not every document', () => {
  // An older export whose income falls OUTSIDE the newest statement's window must not be added to the
  // side being compared against that statement's own total.
  const older = {
    ...doc,
    fromDate: '2025-12-01', toDate: '2025-12-31', whenGenerated: '2026-01-01T00:00:00',
    changeInNav: null,
    trades: [], openPositions: [], equitySummary: [],
    cashTransactions: doc.cashTransactions.map((c) => ({
      ...c, transactionID: `OLD-${c.transactionID}`, dateTime: '2025-12-15;202500', settleDate: '2025-12-15',
    })),
  }
  const built = buildBook([older, { ...doc, whenGenerated: '2026-01-06T00:00:00' }])
  const dividends = built.reconciliation.checks.find((c) => c.name === 'Dividends')!
  assert.equal(dividends.ok, true, 'December income must not be counted against a January statement')
  assert.ok(built.income.dividendsGross > dividends.ours!, 'while the all-documents total does include it')
})

// ---------- review fixes ----------
check('a Trades-only newest export does not empty the holdings NOR drop the check that would catch it', () => {
  // A statement with no OpenPositions section is a normal thing to run. Taking the snapshot from the
  // newest document regardless left the Holdings tab blank — and the position check was gated on that
  // same document, so it silently skipped itself and the badge still read "Reconciled".
  const tradesOnly = {
    ...doc,
    whenGenerated: '2026-02-01T00:00:00',
    fromDate: '2026-01-05', toDate: '2026-01-20',
    openPositions: [],
    equitySummary: [], changeInNav: null,
    sectionsPresent: doc.sectionsPresent.filter((n) => n !== 'OpenPositions'),
    trades: [], cashTransactions: [], corporateActions: [],
  }
  const built = buildBook([{ ...doc, whenGenerated: '2026-01-05T00:00:00' }, tradesOnly])
  assert.equal(built.positions.length, 4, 'the newest snapshot that EXISTS is the one to show')
  assert.ok(built.reconciliation.checks.some((c) => c.name === 'Open positions'), 'and the check must still run')
  assert.ok(built.warnings.some((w) => /no OpenPositions section/.test(w)), 'with the staleness said out loud')
})

check('the return check holds when a second export widens the merged NAV series', () => {
  // A guard on the window slice itself: with several overlapping exports the merged series spans more
  // than the newest statement's own period, so the comparison is made over THAT period. (Whether the
  // slice should also open on the day BEFORE it is an open question — see the note at the check.)
  const built = buildBook([doc])
  const twr = built.reconciliation.checks.find((c) => c.name === 'Time-weighted return')!
  assert.equal(twr.ok, true, twr.detail)
  // A second, older document widens the merged NAV series past the newest statement's window, which is
  // exactly the case the window slice exists for.
  const older = { ...doc, whenGenerated: '2026-01-01T00:00:00', changeInNav: null }
  const pair = buildBook([older, { ...doc, whenGenerated: '2026-01-06T00:00:00' }])
  const twr2 = pair.reconciliation.checks.find((c) => c.name === 'Time-weighted return')!
  assert.equal(twr2.ok, true, twr2.detail)
})

check('a position and a trade in the SAME contract produce the same key without a conid', () => {
  // The fallback key names expiry, strike and right. The trade side carried them and the position side
  // did not, so the two halves of one key disagreed and check 5 broke on every conid-less derivative.
  const base = doc.trades.find((t) => t.tradeID)!
  const fut = {
    ...base, tradeID: 'FUTK', transactionID: 'FUTK', conid: null, symbol: 'ESZ', assetCategory: 'FUT',
    expiry: '2026-03-20', strike: null, putCall: null, quantity: 2, tradePrice: 5000, multiplier: 50,
    buySell: 'BUY', openCloseIndicator: 'O', fifoPnlRealized: 0, origTradeID: null, origTransactionID: null,
  }
  const snapshot = {
    ...doc.openPositions[0]!, conid: null, symbol: 'ESZ', assetCategory: 'FUT', expiry: '2026-03-20',
    strike: null, putCall: null, position: 2, multiplier: 50, currency: 'USD',
  }
  const built = buildBook([{ ...doc, trades: [fut], openPositions: [snapshot], cashTransactions: [], corporateActions: [] }])
  const held = built.reconciliation.checks.find((c) => c.name === 'Open positions')!
  assert.equal(held.break, 0, `the two sides must agree: ${held.detail}`)
})

// ---------- accruals ----------
// Income EARNED but not yet PAID sits inside the broker's ending value and in no cash transaction, so
// capital + realised + unrealised + paid income lands short of NAV by exactly that much. The real book
// was short $24.88 while the four rows were printed under a bold "Net asset value" they did not make.
check('accrued-but-unpaid income is carried, so the NAV bridge can close', () => {
  const withAccruals = {
    ...doc,
    changeInNav: {
      ...(doc.changeInNav ?? ({} as any)),
      changeInDividendAccruals: 12.5,
      changeInInterestAccruals: 24.88,
    },
  }
  const built = buildBook([withAccruals])
  assert.equal(built.accruals.dividend, 12.5)
  assert.equal(built.accruals.interest, 24.88)
  assert.ok(Math.abs(built.accruals.total! - 37.38) < 1e-9, `total ${built.accruals.total}`)
})

check('an export that does not reach back to the book\u2019s start cannot prove the balance', () => {
  // The statement states the CHANGE over its own window. That equals the BALANCE only when the window
  // covers the whole life of the book; from a later export it is a change on top of an unknown opening
  // balance, and the honest answer is null — the bridge then says "not explained" rather than printing
  // a number under a label it cannot support.
  const early = {
    ...doc,
    fromDate: '2025-12-01', toDate: '2025-12-31', whenGenerated: '2025-12-31T00:00:00',
    changeInNav: null, trades: [], openPositions: [], equitySummary: [], cashTransactions: [], corporateActions: [],
  }
  const later = {
    ...doc,
    whenGenerated: '2026-01-06T00:00:00',
    changeInNav: { ...(doc.changeInNav ?? ({} as any)), changeInDividendAccruals: 1, changeInInterestAccruals: 2 },
  }
  const built = buildBook([early, later])
  assert.equal(built.accruals.total, null, 'the newest window starts after the book does')
  assert.equal(built.accruals.interest, null)
})

// ---------- the reconciliation FLOOR ----------
// Six of the checks read from ChangeInNAV. When it is absent they add nothing, and `every(...)` over
// whatever survived returned true — so the badge read "Reconciled" on a book with no broker evidence for
// NAV, return, flows or income. These fix that class of failure: a check that cannot run must fail.

check('a statement with no Change in NAV section cannot reconcile', () => {
  const noNav = buildBook([{ ...doc, changeInNav: null }])
  assert.equal(noNav.reconciliation.ok, false, 'six of eight checks cannot run — the book is not verified')
  const floor = noNav.reconciliation.checks.find((c) => c.name === 'Statement summary')!
  assert.ok(floor, 'the absence must be recorded as a check, not vanish')
  assert.equal(floor.ok, false)
})

check('a statement reporting realised money with no trade rows cannot reconcile', () => {
  // The Flex query was run with the Trades section unticked: the entire closed-trade history is missing
  // and every remaining check can still pass.
  const noTrades = buildBook([{ ...doc, trades: [], openPositions: [] }])
  const realised = noTrades.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.ok(realised, 'the check must exist rather than being skipped')
  assert.equal(realised.ok, false)
  assert.equal(noTrades.reconciliation.ok, false)
})

check('an unknown NAV bridge component is not treated as zero', () => {
  // A blank attribute means UNKNOWN. Dropping it and summing the rest let the identity pass by luck.
  const holed = buildBook([{ ...doc, changeInNav: { ...doc.changeInNav!, mtm: null } }])
  const bridge = holed.reconciliation.checks.find((c) => c.name === 'NAV bridge')!
  assert.equal(bridge.ok, false)
  assert.equal(bridge.ours, null, 'an incomplete bridge is un-evaluated, not a partial sum')
})

// ---------- coverage ----------

check('a hole between statements withholds the all-history return and fails the book', () => {
  // Import 2026 and 2028 without 2027 and the chain joins the last NAV of one to the first of the other
  // as a single step, counting every deposit made in between as performance.
  const later = {
    ...doc,
    fromDate: '2028-01-01', toDate: '2028-12-31',
    trades: [], cashTransactions: [], corporateActions: [], openPositions: [],
    equitySummary: [{ reportDate: '2028-06-30', total: 500000, currency: 'USD', cash: null }],
  }
  const gapped = buildBook([doc, later as typeof doc])
  assert.equal(gapped.twr, null, 'a return chained across a hole is a different number, not a rough one')
  assert.equal(gapped.coverage.gaps.length, 1)
  const cov = gapped.reconciliation.checks.find((c) => c.name === 'Coverage')!
  assert.ok(cov && !cov.ok, 'the hole must be a failing check, not only a warning')
  assert.ok(gapped.warnings.some((w) => w.includes('no statement covers')), 'and the operator is told which dates')
})

check('two abutting statements are not a gap', () => {
  // The fixture ends 2026-01-04, so the next statement opening on the 5th leaves no uncovered day.
  const next = {
    ...doc,
    fromDate: '2026-01-05', toDate: '2026-01-31',
    trades: [], cashTransactions: [], corporateActions: [], openPositions: [],
    equitySummary: [{ reportDate: '2026-01-31', total: 120000, currency: 'USD', cash: null }],
  }
  assert.equal(buildBook([doc, next as typeof doc]).coverage.gaps.length, 0)
})

// ---------- identity and currency ----------

check('a statement that does not name its account is refused', () => {
  // Filtering the missing identity out left the set at size 1, so an unidentifiable export merged into
  // a book labelled with the known account.
  const anonymous = { ...doc, accountId: null, accountIds: [] }
  assert.throws(() => buildBook([doc, anonymous]), /do not name an account/)
})

check('two reporting currencies are refused rather than chained', () => {
  // EquitySummaryInBase totals are in the document's OWN base. Merging a EUR series into a USD one turns
  // the switch itself into a daily return.
  const inEuros = {
    ...doc,
    changeInNav: { ...doc.changeInNav!, currency: 'EUR' },
    equitySummary: doc.equitySummary.map((r) => ({ ...r, currency: 'EUR' })),
  }
  assert.throws(() => buildBook([doc, inEuros]), /base currencies/)
})

check('BASE_SUMMARY is a reporting label, not a currency', () => {
  // Taken literally it matched nothing in the rate grid — not even the base itself — so every closure,
  // flow and income row became unconvertible and the header read "Reported in BASE_SUMMARY".
  const sentinel = buildBook([{ ...doc, changeInNav: { ...doc.changeInNav!, currency: 'BASE_SUMMARY' } }])
  assert.equal(sentinel.baseCurrency, 'USD', 'the real currency comes from the daily NAV rows instead')
  assert.ok(sentinel.closures.every((c) => c.realizedBase !== null), 'and base-currency closures still value')
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
