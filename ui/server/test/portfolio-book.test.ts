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
// The figure is taken as a BALANCE from the daily equity summary — see the note in buildBook for why a
// change-over-a-window cannot answer "what is accrued today".
check('the accrual balance is read from the book\u2019s own last day', () => {
  const withAccruals = {
    ...doc,
    equitySummary: doc.equitySummary.map((r, i) => i === doc.equitySummary.length - 1
      ? { ...r, dividendAccruals: 12.5, interestAccruals: 24.88 }
      : { ...r, dividendAccruals: 0, interestAccruals: 0 }),
  }
  const built = buildBook([withAccruals])
  assert.equal(built.accruals.dividend, 12.5)
  assert.equal(built.accruals.interest, 24.88)
  assert.ok(Math.abs(built.accruals.total! - 37.38) < 1e-9, `total ${built.accruals.total}`)
})

check('an earlier day\u2019s balance is never presented as today\u2019s', () => {
  // The trap this replaced: a figure that was true weeks ago, printed on a bridge whose other rows are
  // current. Only the row for the book's OWN last day may answer.
  const stale = {
    ...doc,
    equitySummary: doc.equitySummary.map((r, i) => i === 0
      ? { ...r, dividendAccruals: 99, interestAccruals: 99 }
      : { ...r, dividendAccruals: null, interestAccruals: null }),
  }
  const built = buildBook([stale])
  assert.equal(built.accruals.total, null, 'no balance stated for the last day means no balance stated')
})

check('an accrual balance with a missing component is unknown, not the known part alone', () => {
  // CLAUDE.md §3 (do not hide missing data; no source = no claim) and §15 (an aggregate must be
  // reconstructable from its components). When the ending equity-summary row states one accrual
  // balance but not the other, the missing side is UNKNOWN, not zero. Publishing the present side as a
  // complete total would let the NAV bridge label the whole residual "proven accrued income" while an
  // omitted balance is still unaccounted for — so a total is withheld until BOTH sides are known.
  const oneKnown = {
    ...doc,
    equitySummary: doc.equitySummary.map((r, i) => i === doc.equitySummary.length - 1
      ? { ...r, dividendAccruals: null, interestAccruals: 24.88 }
      : { ...r, dividendAccruals: null, interestAccruals: null }),
  }
  const built = buildBook([oneKnown])
  assert.equal(built.accruals.interest, 24.88, 'the stated side is still reported')
  assert.equal(built.accruals.dividend, null, 'the missing side stays unknown, not zero')
  assert.equal(built.accruals.total, null, 'a total is withheld until BOTH balances are known')
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


// ---------- the blotter: every fill, open positions included ----------
// A round trip exists only once something is sold, so closures alone could never list a buy still held,
// nor an add to a held position. The blotter is every fill the lot engine applied, in order.

check('every fill is listed, open positions included, in the order the book applied them', () => {
  // T1–T10 are executions; T-SUM is a SUMMARY row and is not a fill.
  assert.deepEqual(book.executions.map((e) => e.id), ['T10', 'T1', 'T4', 'T2', 'T5', 'T7', 'T9', 'T3', 'T8', 'T6'])
})

check('each fill says what it did to the position', () => {
  const by = new Map(book.executions.map((e) => [e.id, e]))
  // AAA: buy 100 opens, buy 100 adds, sell 150 trims to 50.
  assert.deepEqual([by.get('T1')!.effect, by.get('T2')!.effect, by.get('T3')!.effect], ['open', 'add', 'reduce'])
  assert.deepEqual([by.get('T2')!.positionBefore, by.get('T2')!.positionAfter], [100, 200])
  assert.deepEqual([by.get('T3')!.positionBefore, by.get('T3')!.positionAfter], [200, 50])
  // DDD: a sell opens the short and a buy closes it.
  assert.deepEqual([by.get('T7')!.side, by.get('T7')!.effect, by.get('T7')!.positionAfter], ['sell', 'open', -30])
  assert.deepEqual([by.get('T8')!.side, by.get('T8')!.effect, by.get('T8')!.positionAfter], ['buy', 'close', 0])
})

check('a buy reads as held, partly sold or sold from what is still open', () => {
  const by = new Map(book.executions.map((e) => [e.id, e]))
  // The 150-share sale consumed all of T1 and half of T2, oldest first.
  assert.deepEqual([by.get('T1')!.openedQuantity, by.get('T1')!.stillOpen], [100, 0])
  assert.deepEqual([by.get('T2')!.openedQuantity, by.get('T2')!.stillOpen], [100, 50])
  assert.deepEqual([by.get('T9')!.openedQuantity, by.get('T9')!.stillOpen], [200, 200], 'EEE was never sold')
  assert.equal(by.get('T3')!.openedQuantity, 0, 'a pure sale opens nothing')
})

check('a sale carries what it realised, and the blotter ties to the round trips', () => {
  const by = new Map(book.executions.map((e) => [e.id, e]))
  assert.ok(near(by.get('T3')!.realizedLocal!, 646.5, 1e-4), `AAA sale realised ${by.get('T3')!.realizedLocal}`)
  assert.ok(near(by.get('T8')!.realizedLocal!, 148), `DDD cover realised ${by.get('T8')!.realizedLocal}`)
  assert.ok(near(by.get('T6')!.realizedLocal!, 19992), `CCC sale realised ${by.get('T6')!.realizedLocal}`)
  assert.equal(by.get('T1')!.realizedLocal, null, 'a buy realises nothing')
  const blotter = book.executions.reduce((a, e) => a + (e.realizedLocal ?? 0), 0)
  const trips = book.closures.reduce((a, c) => a + c.realizedLocal, 0)
  assert.ok(near(blotter, trips), `blotter ${blotter} vs round trips ${trips}`)
})

check('what the blotter says is open is exactly what the lots and the broker hold', () => {
  const lastByKey = new Map<string, number>()
  const stillOpenByKey = new Map<string, number>()
  for (const e of book.executions) {
    lastByKey.set(e.key, e.positionAfter)
    stillOpenByKey.set(e.key, (stillOpenByKey.get(e.key) ?? 0) + e.stillOpen)
  }
  const lotsByKey = new Map<string, number>()
  for (const l of book.openLots) lotsByKey.set(l.key, (lotsByKey.get(l.key) ?? 0) + l.quantity)
  assert.ok(lotsByKey.size > 0)
  for (const [key, held] of lotsByKey) {
    assert.ok(near(lastByKey.get(key)!, held), `${key}: the last fill leaves ${lastByKey.get(key)}, the lots hold ${held}`)
    assert.ok(near(stillOpenByKey.get(key)!, Math.abs(held)), `${key}: fills credit ${stillOpenByKey.get(key)} as open, the lots hold ${held}`)
  }
  for (const p of book.positions.filter((x) => x.quantity !== null)) {
    const last = lastByKey.get(`conid:${p.conid}`) ?? 0
    assert.ok(near(last, p.quantity!), `${p.symbol}: blotter ${last} vs broker ${p.quantity}`)
  }
})

check('a blank commission is unknown, not zero', () => {
  assert.equal(book.executions.find((e) => e.id === 'T4')!.commission, null)
  assert.equal(book.executions.find((e) => e.id === 'T1')!.commission, -1)
})

check('a C;O flip closes the long and reopens short, and the blotter says so', () => {
  const base = { ...doc.trades[0]!, symbol: 'FLP', conid: '66', levelOfDetail: 'EXECUTION', multiplier: 1, ibCommission: 0, taxes: 0, fxRateToBase: 1 }
  const { executions, closures } = runFifo([
    { ...base, tradeID: 'F1', transactionID: 'FX1', quantity: 100, tradePrice: 10, openCloseIndicator: 'O', dateTime: '2026-01-01T10:00:00' },
    { ...base, tradeID: 'F2', transactionID: 'FX2', quantity: -150, tradePrice: 12, openCloseIndicator: 'C;O', dateTime: '2026-02-01T10:00:00' },
  ])
  const flip = executions[1]!
  assert.equal(flip.effect, 'flip')
  assert.deepEqual([flip.positionBefore, flip.positionAfter], [100, -50])
  assert.deepEqual([flip.openedQuantity, flip.stillOpen], [50, 50], 'the new short is still open')
  assert.ok(near(flip.realizedLocal!, closures[0]!.realizedLocal), 'and it carries what the closing half realised')
  assert.ok(near(flip.realizedLocal!, 200), `100 x $2 with no costs = 200, got ${flip.realizedLocal}`)
  assert.equal(executions[0]!.stillOpen, 0, 'the long it closed is gone')
})

check('a close with nothing to close is listed as unmatched, not dropped', () => {
  const { executions } = runFifo([
    { ...doc.trades[0]!, tradeID: 'Z1', symbol: 'ZZZ', conid: '99', quantity: -10, tradePrice: 5, openCloseIndicator: 'C', dateTime: '2026-01-01T10:00:00', levelOfDetail: 'EXECUTION' },
  ])
  assert.equal(executions.length, 1, 'the fill still appears in the blotter')
  assert.equal(executions[0]!.effect, 'unmatched')
  assert.equal(executions[0]!.unmatchedQuantity, 10)
  assert.deepEqual([executions[0]!.positionBefore, executions[0]!.positionAfter], [0, 0])
  assert.equal(executions[0]!.realizedLocal, null)
})

check('a sale larger than the position closes what it can and reports the rest as unmatched', () => {
  const base = { ...doc.trades[0]!, symbol: 'OVR', conid: '88', levelOfDetail: 'EXECUTION', multiplier: 1 }
  const { executions } = runFifo([
    { ...base, tradeID: 'O1', transactionID: 'OX1', quantity: 5, tradePrice: 10, openCloseIndicator: 'O', dateTime: '2026-01-01T10:00:00' },
    { ...base, tradeID: 'O2', transactionID: 'OX2', quantity: -8, tradePrice: 12, openCloseIndicator: 'C', dateTime: '2026-02-01T10:00:00' },
  ])
  assert.equal(executions[1]!.effect, 'close')
  assert.equal(executions[1]!.unmatchedQuantity, 3)
})

check('with a blank open/close indicator the effect is read off the position', () => {
  const buy = { ...doc.trades[0]!, tradeID: 'B1', symbol: 'BLK', conid: '55', quantity: 100, tradePrice: 10, openCloseIndicator: null, dateTime: '2026-01-01T10:00:00', levelOfDetail: 'EXECUTION' }
  const sell = { ...buy, tradeID: 'B2', quantity: -60, tradePrice: 15, dateTime: '2026-02-01T10:00:00' }
  const { executions } = runFifo([buy, sell])
  assert.deepEqual(executions.map((e) => e.effect), ['open', 'reduce'])
  assert.equal(executions[0]!.stillOpen, 40)
})

check('a fill the broker gave no id still owns what it opened', () => {
  // TWO id-less fills in different contracts. Keyed on the missing id they would share one slot: one fill
  // would read the other's shares as its own while the other read as sold. The lot object is the only
  // identity they have.
  const base = { ...doc.trades[0]!, tradeID: null, transactionID: null, openCloseIndicator: 'O', levelOfDetail: 'EXECUTION' }
  const { executions } = runFifo([
    { ...base, symbol: 'NID', conid: '44', quantity: 7, tradePrice: 3, dateTime: '2026-01-01T10:00:00' },
    { ...base, symbol: 'NID2', conid: '45', quantity: 20, tradePrice: 4, dateTime: '2026-01-02T10:00:00' },
  ])
  assert.deepEqual(executions.map((e) => [e.id, e.symbol, e.stillOpen]), [[null, 'NID', 7], [null, 'NID2', 20]])
})

check('a restated trade appears once, as its replacement', () => {
  const pre = { ...doc.trades[0]!, tradeID: 'S-PRE', transactionID: 'SX-PRE', symbol: 'SPL', conid: '77', quantity: 100, tradePrice: 50, openCloseIndicator: 'O', dateTime: '2026-02-01T10:00:00', levelOfDetail: 'EXECUTION', origTradeID: null, origTransactionID: null }
  const post = { ...pre, tradeID: 'S-POST', transactionID: 'SX-POST', quantity: 200, tradePrice: 25, origTradeID: 'S-PRE', origTransactionID: 'SX-PRE' }
  const restated = buildBook([{ ...doc, trades: [pre, post], openPositions: [], cashTransactions: [], equitySummary: [], changeInNav: null }])
  assert.deepEqual(restated.executions.map((e) => [e.id, e.quantity]), [['S-POST', 200]])
})

check('re-importing an overlapping export does not duplicate a fill', () => {
  const twice = buildBook([doc, parseFlexXml(xml)])
  assert.deepEqual(twice.executions.map((e) => e.id), book.executions.map((e) => e.id))
})


// ---------- review follow-ups: inferred opens, blank commissions, notional exposure ----------

check('a blank-flag fill that opens from flat or across zero is marked inferred; the broker’s own flags never are', () => {
  assert.ok(book.executions.every((e) => e.inferred === false), 'every fixture fill carries an explicit O or C')
  const base = { ...doc.trades[0]!, symbol: 'BLK', conid: '55', openCloseIndicator: null, levelOfDetail: 'EXECUTION', multiplier: 1 }
  // History starting mid-position: the first sale has nothing to close. The engine opens a short, but the
  // same sale may instead have closed a long from before the statements. A guess, and flagged as one.
  const { executions: start } = runFifo([{ ...base, tradeID: 'S1', transactionID: 'SX1', quantity: -10, tradePrice: 5, dateTime: '2026-01-01T10:00:00' }])
  assert.deepEqual([start[0]!.effect, start[0]!.side, start[0]!.inferred], ['open', 'sell', true])
  const { executions: seq } = runFifo([
    { ...base, tradeID: 'B1', transactionID: 'BX1', quantity: 100, tradePrice: 10, dateTime: '2026-01-01T10:00:00' },
    { ...base, tradeID: 'B2', transactionID: 'BX2', quantity: 50, tradePrice: 11, dateTime: '2026-01-02T10:00:00' },
    { ...base, tradeID: 'B3', transactionID: 'BX3', quantity: -60, tradePrice: 12, dateTime: '2026-01-03T10:00:00' },
    { ...base, tradeID: 'B4', transactionID: 'BX4', quantity: -150, tradePrice: 13, dateTime: '2026-01-04T10:00:00' },
  ])
  // opened from flat: inferred; added to the side held: not; trimmed a held long: not; reversed past zero: inferred
  assert.deepEqual(seq.map((e) => [e.effect, e.inferred]), [['open', true], ['add', false], ['reduce', false], ['flip', true]])
  const { executions: explicit } = runFifo([{ ...base, tradeID: 'E1', transactionID: 'EX1', quantity: -10, tradePrice: 5, openCloseIndicator: 'O', dateTime: '2026-01-01T10:00:00' }])
  assert.equal(explicit[0]!.inferred, false, 'an explicit O is the broker’s word, not a guess')
})

check('a blank commission on either leg marks the realised figure as missing that cost', () => {
  const base = { ...doc.trades[0]!, symbol: 'CST', conid: '33', levelOfDetail: 'EXECUTION', multiplier: 1, taxes: 0 }
  const run = (openComm: number | null, closeComm: number | null) => runFifo([
    { ...base, tradeID: 'C1', transactionID: 'CX1', quantity: 10, tradePrice: 10, openCloseIndicator: 'O', ibCommission: openComm, dateTime: '2026-01-01T10:00:00' },
    { ...base, tradeID: 'C2', transactionID: 'CX2', quantity: -10, tradePrice: 12, openCloseIndicator: 'C', ibCommission: closeComm, dateTime: '2026-02-01T10:00:00' },
  ])
  const cases: [number | null, number | null, boolean][] = [[-1, -1, false], [null, -1, true], [-1, null, true]]
  for (const [o, c, unknown] of cases) {
    const { closures, executions } = run(o, c)
    assert.equal(closures[0]!.costsUnknown, unknown, `open ${o} / close ${c}: the round trip`)
    assert.equal(executions[1]!.costsUnknown, unknown, `open ${o} / close ${c}: the sale`)
    assert.equal(executions[0]!.costsUnknown, false, 'a buy realises nothing, so nothing is missing from it')
  }
  assert.ok(book.closures.every((c) => c.costsUnknown === false), 'every fixture round trip has both commissions')
})

check('futures fills are marked as notional exposure; stock fills are not', () => {
  const by = new Map(book.executions.map((e) => [e.id, e]))
  assert.deepEqual([by.get('T5')!.isDerivative, by.get('T6')!.isDerivative, by.get('T10')!.isDerivative], [true, true, true], 'CCC and FFF are futures')
  assert.equal(by.get('T1')!.isDerivative, false)
})


// ---------- review round 3: the blotter anchored to the broker, and what a fill was worth ----------

check('a contract whose rebuilt position disagrees with the broker snapshot has partial history', () => {
  assert.ok(book.executions.every((e) => e.partialHistory === false), 'the fixture reconciles, so every fill is established')
  // Carrying 100 AAA from before the statements: the snapshot says 150 where the fills rebuild 50. The first
  // buy reads "open" but was really an add, so every AAA fill is reconstructed, and says so.
  const carried = buildBook([{ ...doc, openPositions: doc.openPositions.map((p) => p.symbol === 'AAA' ? { ...p, position: 150 } : p) }])
  const aaa = carried.executions.filter((e) => e.symbol === 'AAA')
  assert.ok(aaa.length === 3 && aaa.every((e) => e.partialHistory), 'every fill in the carried contract')
  assert.ok(carried.executions.filter((e) => e.symbol !== 'AAA').every((e) => !e.partialHistory), 'and no other')
})

check('a sale with nothing to close marks its whole contract as partial history', () => {
  const extra = [
    { ...doc.trades[0]!, tradeID: 'Q1', transactionID: 'QX1', symbol: 'QQQ', conid: '707', quantity: 5, tradePrice: 10, openCloseIndicator: 'O', dateTime: '2026-01-06T10:00:00', levelOfDetail: 'EXECUTION' },
    { ...doc.trades[0]!, tradeID: 'Q2', transactionID: 'QX2', symbol: 'QQQ', conid: '707', quantity: -8, tradePrice: 12, openCloseIndicator: 'C', dateTime: '2026-01-07T10:00:00', levelOfDetail: 'EXECUTION' },
  ]
  const b = buildBook([{ ...doc, trades: [...doc.trades, ...extra] }])
  assert.deepEqual(b.executions.filter((e) => e.symbol === 'QQQ').map((e) => [e.effect, e.partialHistory]), [['open', true], ['close', true]])
})

check('with no snapshot to check against, a contract resting on a guess stays partial', () => {
  const blankSale = { ...doc.trades[0]!, tradeID: 'G1', transactionID: 'GX1', symbol: 'GSS', conid: '808', quantity: -10, tradePrice: 5, openCloseIndicator: null, dateTime: '2026-01-06T10:00:00', levelOfDetail: 'EXECUTION' }
  const noSnapshot = { ...doc, openPositions: [], sectionsPresent: doc.sectionsPresent.filter((x) => x !== 'OpenPositions'), trades: [...doc.trades, blankSale] }
  const b = buildBook([noSnapshot])
  const guess = b.executions.find((e) => e.id === 'G1')!
  assert.deepEqual([guess.inferred, guess.partialHistory], [true, true])
  assert.equal(b.executions.find((e) => e.id === 'T1')!.partialHistory, false, 'explicit flags need no anchor to be read')
})

check('a hole between statements leaves every fill unanchored', () => {
  const later = {
    ...doc,
    fromDate: '2028-01-01', toDate: '2028-12-31',
    trades: [], cashTransactions: [], corporateActions: [], openPositions: [],
    equitySummary: [{ reportDate: '2028-06-30', total: 500000, currency: 'USD', cash: null }],
  }
  const gapped = buildBook([doc, later as typeof doc])
  assert.ok(gapped.executions.length > 0 && gapped.executions.every((e) => e.partialHistory))
})

check('a fill is worth its broker proceeds, a future its notional, and a par-priced bond never quantity x price', () => {
  const by = new Map(book.executions.map((e) => [e.id, e]))
  assert.equal(by.get('T1')!.value, 1000, 'AAA: the broker’s own proceeds')
  assert.equal(by.get('T5')!.value, 400000, 'CCC: 2 contracts x 2,000 x 100 of exposure, although no cash moved')
  const base = { ...doc.trades[0]!, symbol: 'UST', conid: '909', assetCategory: 'BOND', multiplier: 1, openCloseIndicator: 'O', levelOfDetail: 'EXECUTION', dateTime: '2026-01-06T10:00:00' }
  const bond = (proceeds: number | null) => runFifo([{ ...base, quantity: 10000, tradePrice: 98.5, proceeds }]).executions[0]!.value
  assert.equal(bond(-9850), 9850, '10,000 face at 98.5 is 9,850, not 985,000')
  assert.equal(bond(null), null, 'without proceeds a bond cannot be valued, so it is not guessed')
  const { executions: stk } = runFifo([{ ...doc.trades[0]!, tradeID: 'P1', transactionID: 'PX1', symbol: 'PPP', conid: '910', quantity: 7, tradePrice: 3, proceeds: null, openCloseIndicator: 'O', dateTime: '2026-01-06T10:00:00', levelOfDetail: 'EXECUTION' }])
  assert.equal(stk[0]!.value, 21, 'a stock with no proceeds field falls back to quantity x price')
})


// ---------- review round 4: anchor against the snapshot the fills can actually be compared with ----------

// A Trades-only export newer than the last position snapshot: the snapshot stays the older statement's, and
// the new fills come after it. `buy` adds to a position; `snapshotAAA` overrides what the snapshot says.
const newerTradesOnly = (buyQty: number, snapshotAAA: number | null = null) => {
  const base = snapshotAAA === null ? doc
    : { ...doc, openPositions: doc.openPositions.map((p) => p.symbol === 'AAA' ? { ...p, position: snapshotAAA } : p) }
  const later = {
    ...doc,
    fromDate: '2026-01-05', toDate: '2026-06-30', whenGenerated: '20260701;120000',
    sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [],
    equitySummary: [], changeInNav: null,
    trades: [{ ...doc.trades[0]!, tradeID: 'N1', transactionID: 'NX1', quantity: buyQty, tradePrice: 20, openCloseIndicator: 'O', tradeDate: '2026-05-01', dateTime: '2026-05-01T10:00:00', levelOfDetail: 'EXECUTION' }],
  }
  return buildBook([base, later as typeof doc])
}

check('trading after the last snapshot does not make a fully covered position partial', () => {
  // The snapshot (50 AAA) matches the fills it saw; 10 more bought afterwards is new trading, not a gap.
  const b = newerTradesOnly(10)
  assert.ok(b.executions.filter((e) => e.symbol === 'AAA').every((e) => !e.partialHistory), 'AAA is anchored as of its snapshot')
})

check('a stale snapshot that happens to equal the final position cannot clear a real mismatch', () => {
  // 100 AAA carried in from before the statements: the snapshot says 150 where the fills it saw rebuild 50.
  // 100 more bought later brings the final position to 150, equal to that stale snapshot by coincidence.
  const b = newerTradesOnly(100, 150)
  assert.ok(b.executions.filter((e) => e.symbol === 'AAA').every((e) => e.partialHistory), 'still partial: the offset was there all along')
})


// ---------- review round 5: open-now anchored to the broker, unproven realised, restated fills ----------

check('the broker snapshot decides which contracts are open now, whatever the fills rebuild', () => {
  const openBy = new Map(book.executions.map((e) => [e.symbol, e.openNow]))
  assert.deepEqual(['AAA', 'BBB', 'EEE', 'FFF', 'CCC', 'DDD'].map((x) => openBy.get(x)), [true, true, true, true, false, false])
  // History starting mid-position: the broker holds 90 ZZZ, and the statements hold only a 10-share sale.
  // The fills rebuild nothing, but the broker says the position is open, and the Open positions view must.
  const zzz = { ...doc.openPositions[0]!, symbol: 'ZZZ', conid: '606', position: 90, positionValue: 900, costBasisMoney: 800 }
  const sale = { ...doc.trades[0]!, tradeID: 'Z1', transactionID: 'ZX1', symbol: 'ZZZ', conid: '606', quantity: -10, tradePrice: 10, openCloseIndicator: 'C', dateTime: '2026-01-06T10:00:00', levelOfDetail: 'EXECUTION' }
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, zzz], trades: [...doc.trades, sale] }])
  const z = b.executions.find((e) => e.id === 'Z1')!
  assert.deepEqual([z.effect, z.partialHistory, z.openNow], ['unmatched', true, true])
})

check('a sale after the snapshot that empties a position leaves it closed now', () => {
  const later = {
    ...doc, fromDate: '2026-01-05', toDate: '2026-06-30', whenGenerated: '20260701;120000',
    sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null,
    trades: [{ ...doc.trades[0]!, tradeID: 'S9', transactionID: 'SX9', quantity: -50, tradePrice: 20, openCloseIndicator: 'C', tradeDate: '2026-05-01', dateTime: '2026-05-01T10:00:00', levelOfDetail: 'EXECUTION' }],
  }
  const b = buildBook([doc, later as typeof doc])
  assert.ok(b.executions.filter((e) => e.symbol === 'AAA').every((e) => e.openNow === false), 'the snapshot 50, less the 50 sold after it')
})

check('a round trip in a contract with partial history carries the qualifier, so its realised is unproven', () => {
  assert.ok(book.closures.every((c) => c.partialHistory === false))
  const carried = buildBook([{ ...doc, openPositions: doc.openPositions.map((p) => p.symbol === 'AAA' ? { ...p, position: 150 } : p) }])
  const aaa = carried.closures.filter((c) => c.symbol === 'AAA')
  assert.ok(aaa.length > 0 && aaa.every((c) => c.partialHistory), 'FIFO may have sold the wrong lot')
  assert.ok(carried.closures.filter((c) => c.symbol !== 'AAA').every((c) => !c.partialHistory))
})

check('a newer export restating a fill the snapshot saw keeps the contract anchored', () => {
  // EEE's only fill (T9) is restated in a later Trades-only export under a new id. The snapshot saw the
  // original, so the replacement is covered through the supersession relation, and EEE still reconciles.
  const t9 = doc.trades.find((t) => t.tradeID === 'T9')!
  const later = {
    ...doc, fromDate: '2026-01-05', toDate: '2026-06-30', whenGenerated: '20260701;120000',
    sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null,
    trades: [{ ...t9, tradeID: 'T9R', transactionID: 'X9R', origTradeID: 'T9', origTransactionID: 'X9' }],
  }
  const b = buildBook([doc, later as typeof doc])
  assert.deepEqual(b.executions.filter((e) => e.symbol === 'EEE').map((e) => [e.id, e.partialHistory, e.openNow]), [['T9R', false, true]])
})


// ---------- review round 6: what the snapshot already holds is decided by the day a fill was booked ----------

// A snapshot exported without its trades, then a newer Trades-only export reaching back before it. Nothing up
// to the snapshot lists the fill, but the broker had booked it by then, so the snapshot already reflects it.
const backfilled = (fill: Record<string, unknown>) => {
  const xxx = { ...doc.openPositions[0]!, symbol: 'XXX', conid: '911', position: 10, positionValue: 100, costBasisMoney: 100 }
  const snapshot = { ...doc, trades: [], sectionsPresent: doc.sectionsPresent.filter((x) => x !== 'Trades'), openPositions: [...doc.openPositions, xxx] }
  const later = {
    ...doc, fromDate: '2025-12-01', toDate: '2026-06-30', whenGenerated: '20260701;120000',
    sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null,
    trades: [{ ...doc.trades[0]!, symbol: 'XXX', conid: '911', tradePrice: 10, tradeDate: '2026-01-02', dateTime: '2026-01-02T10:00:00', levelOfDetail: 'EXECUTION', ...fill }],
  }
  return buildBook([snapshot, later as typeof doc])
}

check('a fill before the snapshot that only a newer export carries is already in the snapshot', () => {
  // The buy rebuilds the broker's 10 exactly: established, and 10 held, not 20.
  const bought = backfilled({ tradeID: 'B1', transactionID: 'BX1', quantity: 10, openCloseIndicator: 'O' }).executions.find((e) => e.id === 'B1')!
  assert.deepEqual([bought.effect, bought.partialHistory, bought.openNow], ['open', false, true])
  // History starting mid-position: the snapshot already reflects this sale, so the broker's 10 are still held.
  const sold = backfilled({ tradeID: 'B2', transactionID: 'BX2', quantity: -10, openCloseIndicator: 'C' }).executions.find((e) => e.id === 'B2')!
  assert.deepEqual([sold.effect, sold.partialHistory, sold.openNow], ['unmatched', true, true])
})

check('a fill executed on the snapshot day but booked to the next one is after the snapshot', () => {
  // An overnight-session fill carries the next trading day as its trade date, and a statement counts it there.
  // The snapshot's own statement lists the buy of the 10 YYY it holds; a newer export sells them that evening.
  const buy = { ...doc.trades[0]!, tradeID: 'Y1', transactionID: 'YX1', symbol: 'YYY', conid: '912', quantity: 10, tradePrice: 10, openCloseIndicator: 'O', tradeDate: '2026-01-03', dateTime: '2026-01-03T10:00:00', levelOfDetail: 'EXECUTION' }
  const yyy = { ...doc.openPositions[0]!, symbol: 'YYY', conid: '912', position: 10, positionValue: 100, costBasisMoney: 100 }
  const later = {
    ...doc, fromDate: '2026-01-05', toDate: '2026-06-30', whenGenerated: '20260701;120000',
    sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null,
    trades: [{ ...buy, tradeID: 'Y2', transactionID: 'YX2', quantity: -10, openCloseIndicator: 'C', tradeDate: '2026-01-05', dateTime: '2026-01-04T21:00:00' }],
  }
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, yyy], trades: [...doc.trades, buy] }, later as typeof doc])
  assert.deepEqual(b.executions.filter((e) => e.symbol === 'YYY').map((e) => [e.id, e.tradeDate, e.partialHistory, e.openNow]),
    [['Y1', '2026-01-03', false, false], ['Y2', '2026-01-05', false, false]], 'the snapshot held 10; the sale after it closed them')
})


// ---------- review round 7: a restatement after the snapshot, and the contract behind each fill ----------

// A 2:1 split restates the buy of 100 XSP as 200. `buyXsp` is the original, as the statements first carried it.
const buyXsp = { ...doc.trades[0]!, tradeID: 'A1', transactionID: 'AX1', symbol: 'XSP', conid: '913', quantity: 100, tradePrice: 10, proceeds: -1000, openCloseIndicator: 'O', tradeDate: '2026-01-03', dateTime: '2026-01-03T10:00:00', levelOfDetail: 'EXECUTION' }
const xspHeld = (position: number) => ({ ...doc.openPositions[0]!, symbol: 'XSP', conid: '913', position, positionValue: position * 10, costBasisMoney: 1000 })
// A later Trades-only export: the split-restated buy, then a sale of the 200 after the split.
const afterSplit = (fromDate: string) => ({
  ...doc, fromDate, toDate: '2026-06-30', whenGenerated: '20260701;120000',
  sectionsPresent: ['Trades'], openPositions: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null,
  trades: [
    { ...buyXsp, tradeID: 'A2', transactionID: 'AX2', quantity: 200, tradePrice: 5, origTradeID: 'A1', origTransactionID: 'AX1' },
    { ...buyXsp, tradeID: 'A3', transactionID: 'AX3', quantity: -200, tradePrice: 6, proceeds: 1200, openCloseIndicator: 'C', tradeDate: '2026-03-10', dateTime: '2026-03-10T10:00:00' },
  ],
})
const xspFills = (b: ReturnType<typeof buildBook>) => b.executions.filter((e) => e.symbol === 'XSP').map((e) => [e.id, e.quantity, e.partialHistory, e.openNow])

check('a restatement after the snapshot rebases it, so selling the restated shares leaves nothing held', () => {
  // The snapshot's own statement lists the buy of 100 and holds 100, so it counts pre-split shares. The restated
  // 200 is the same holding: established, and the sale of the 200 after the split leaves nothing, not -100.
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, xspHeld(100)], trades: [...doc.trades, buyXsp] }, afterSplit('2026-01-05') as typeof doc])
  assert.deepEqual(xspFills(b), [['A2', 200, false, false], ['A3', 200, false, false]])
})

check('a snapshot that may already count a restatement is not rebased by it a second time', () => {
  // Only an OLDER statement lists the buy of 100. The snapshot's statement, taken after the split, holds 200 and
  // lists neither version, so nothing says it counted the old shares: it stands as the broker stated it.
  const older = { ...doc, trades: [...doc.trades, buyXsp], openPositions: [], sectionsPresent: doc.sectionsPresent.filter((x) => x !== 'OpenPositions') }
  const snapshot = {
    ...doc, fromDate: '2026-01-05', toDate: '2026-02-28', whenGenerated: '20260301;120000',
    trades: [], cashTransactions: [], corporateActions: [], equitySummary: [], changeInNav: null, openPositions: [...doc.openPositions, xspHeld(200)],
  }
  const b = buildBook([older, snapshot, afterSplit('2026-03-01') as typeof doc])
  assert.deepEqual(xspFills(b), [['A2', 200, false, false], ['A3', 200, false, false]])
})

check('a derivative fill and its round trip name the contract: expiry, strike and right travel with them', () => {
  // Two expiries of one future and an option on it, all under the symbol CL and with no conid. The engine keeps
  // three positions; the screen can only tell them apart if each fill and round trip carries what separates them.
  const cl = { ...doc.trades[0]!, conid: null, symbol: 'CL', assetCategory: 'FUT', multiplier: 1000, proceeds: 0, levelOfDetail: 'EXECUTION', tradeDate: '2026-01-06', dateTime: '2026-01-06T10:00:00', strike: null, putCall: null }
  const { executions, closures } = runFifo([
    { ...cl, tradeID: 'F1', transactionID: 'FX1', quantity: 1, tradePrice: 70, openCloseIndicator: 'O', expiry: '2026-03-20' },
    { ...cl, tradeID: 'F2', transactionID: 'FX2', quantity: 1, tradePrice: 71, openCloseIndicator: 'O', expiry: '2026-06-22' },
    { ...cl, tradeID: 'F3', transactionID: 'FX3', quantity: -1, tradePrice: 72, openCloseIndicator: 'C', expiry: '2026-03-20', tradeDate: '2026-01-07', dateTime: '2026-01-07T10:00:00' },
    { ...cl, tradeID: 'O1', transactionID: 'OX1', assetCategory: 'FSOPT', quantity: 2, tradePrice: 3, openCloseIndicator: 'O', expiry: '2026-03-17', strike: 75, putCall: 'C' },
  ])
  assert.deepEqual(executions.map((e) => [e.id, e.expiry, e.strike, e.putCall]),
    [['F1', '2026-03-20', null, null], ['F2', '2026-06-22', null, null], ['O1', '2026-03-17', 75, 'C'], ['F3', '2026-03-20', null, null]])
  assert.equal(new Set(executions.map((e) => e.key)).size, 3, 'three contracts, three positions')
  assert.deepEqual(closures.map((c) => [c.closeTradeID, c.expiry, c.strike, c.putCall]), [['F3', '2026-03-20', null, null]])
})


// ---------- snapshot uncertainty and incomplete split history ----------

check('a split rebases carried shares too, even when only a small recent buy is in history', () => {
  const recent = { ...buyXsp, quantity: 10, proceeds: -100 }
  const later = afterSplit('2026-01-05')
  later.trades[0] = { ...later.trades[0]!, quantity: 20, proceeds: -100 }
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, xspHeld(100)], trades: [...doc.trades, recent] }, later as typeof doc])
  // 90 carried + 10 bought = 100 before the split; all 200 are sold. The history remains partial.
  assert.deepEqual(xspFills(b), [['A2', 20, true, false], ['A3', 200, true, false]])
})

check('a reverse split applies once to the whole carried position across several restated fills', () => {
  const first = { ...buyXsp, quantity: 10 }
  const second = { ...buyXsp, tradeID: 'B1', transactionID: 'BX1', quantity: 20 }
  const later = afterSplit('2026-01-05')
  later.trades = [
    { ...later.trades[0]!, quantity: 5, tradePrice: 20 },
    { ...later.trades[0]!, tradeID: 'B2', transactionID: 'BX2', origTradeID: 'B1', origTransactionID: 'BX1', quantity: 10, tradePrice: 20 },
    { ...later.trades[1]!, quantity: -50 },
  ]
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, xspHeld(100)], trades: [...doc.trades, first, second] }, later as typeof doc])
  assert.ok(b.executions.filter((e) => e.symbol === 'XSP').every((e) => e.partialHistory && e.openNow === false))
})

check('conflicting restatement ratios do not assert whether a carried position is open', () => {
  const first = { ...buyXsp, quantity: 10 }
  const second = { ...buyXsp, tradeID: 'B1', transactionID: 'BX1', quantity: 10 }
  const later = afterSplit('2026-01-05')
  later.trades = [
    { ...later.trades[0]!, quantity: 20, tradePrice: 5 },
    { ...later.trades[0]!, tradeID: 'B2', transactionID: 'BX2', origTradeID: 'B1', origTransactionID: 'BX1', quantity: 30, tradePrice: 10 / 3 },
  ]
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, xspHeld(100)], trades: [...doc.trades, first, second] }, later as typeof doc])
  assert.ok(b.executions.filter((e) => e.symbol === 'XSP').every((e) => e.partialHistory && e.openNow === null))
})

const intradayBook = (generated: string | null, executedAt: string | null, quantity = 0, identified = true) => {
  const snapshot = { ...doc, fromDate: '2026-01-01', toDate: '2026-01-04', whenGenerated: generated,
    trades: [], openPositions: [xspHeld(quantity)], sectionsPresent: ['OpenPositions'],
    equitySummary: [], cashTransactions: [], corporateActions: [], changeInNav: null }
  const later = { ...snapshot, toDate: '2026-01-05', whenGenerated: '2026-01-06T10:00:00', sectionsPresent: ['Trades'], openPositions: [],
    trades: [{ ...buyXsp, tradeID: identified ? 'SAME-DAY' : null, transactionID: null, quantity: 10, tradeDate: '2026-01-04', dateTime: executedAt }] }
  return buildBook([snapshot, later]).executions[0]!
}

check('a same-day trade after snapshot generation moves the broker position, with or without an id', () => {
  for (const identified of [true, false]) {
    const fill = intradayBook('2026-01-04T10:00:00', '2026-01-04T15:00:00', 0, identified)
    assert.deepEqual([fill.partialHistory, fill.openNow], [false, true])
  }
})

check('a same-day backfill before a proven snapshot cutoff is already covered', () => {
  for (const generated of ['2026-01-04T16:00:00', '2026-01-05T10:00:00']) {
    const fill = intradayBook(generated, '2026-01-04T15:00:00', 10)
    assert.deepEqual([fill.partialHistory, fill.openNow], [false, true])
  }
})

check('missing or equal same-day times leave ordering and open state explicitly unknown', () => {
  for (const [generated, executedAt] of [
    [null, '2026-01-04T15:00:00'], ['2026-01-04T10:00:00', null],
    ['2026-01-04', '2026-01-04T15:00:00'], ['2026-01-04T10:00:00', '2026-01-04T10:00:00'],
  ]) {
    const fill = intradayBook(generated!, executedAt!, 10)
    assert.deepEqual([fill.partialHistory, fill.openNow], [true, null])
  }
})

check('a blank snapshot position remains unknown even when FIFO reconstructs a flat contract', () => {
  const close = { ...buyXsp, tradeID: 'A9', transactionID: 'AX9', quantity: -100, openCloseIndicator: 'C', tradeDate: '2026-01-04', dateTime: '2026-01-04T10:00:00' }
  const unknown = { ...xspHeld(0), position: null }
  const b = buildBook([{ ...doc, openPositions: [unknown], trades: [buyXsp, close] }])
  assert.ok(b.executions.every((e) => e.partialHistory && e.openNow === null))
  assert.equal(b.positions[0]!.quantity, null)
})

check('a closing fill supplies its known multiplier when the opening fill omitted it', () => {
  const first = { ...buyXsp, assetCategory: 'FUT', multiplier: null, quantity: 1, tradePrice: 50 }
  const last = { ...first, tradeID: 'A9', dateTime: '2026-01-04T10:00:00', multiplier: 100, quantity: -1, tradePrice: 55, openCloseIndicator: 'C' }
  const result = runFifo([first, last])
  assert.equal(result.executions[1]!.multiplier, 100)
  assert.equal(result.executions[1]!.value, 5500)
  assert.equal(result.closures[0]!.grossLocal, 500)
  const omitted = runFifo([{ ...first, multiplier: 100 }, { ...last, multiplier: null }])
  assert.equal(omitted.executions[1]!.value, 5500, 'a known opening multiplier still covers a blank close')
})

// ---------- a currency conversion, which buys money rather than a position ----------
// The real book bought AUD to pay for Australian shares. IBKR books that as a trade in a CASH contract
// (AUD.USD) while holding the AUD as cash, so its position snapshot never carries it. Through the lot engine
// it became an eleventh open position of 70,054 the broker did not hold, broke the positions check by exactly
// that, and — the contract then reading as history the snapshot cannot confirm — stamped "unproven" on every
// realised figure in the book through one 0.015-unit line realising $0.000016.
const fxBuy = {
  ...buyXsp, tradeID: 'FX1', transactionID: 'FXX1', symbol: 'AUD.USD', conid: '14433401', assetCategory: 'CASH',
  quantity: 50000, tradePrice: 0.718, proceeds: -35900, openCloseIndicator: '', ibCommission: 0, taxes: 0,
  tradeDate: '2026-01-06', dateTime: '2026-01-06T10:00:00', fifoPnlRealized: null,
}
// The sale back: the line that, as a closure, marked a year of equity round trips unproven. `fifoPnlRealized`
// is set, so the realised check would break by it if either side counted conversions.
const fxSell = {
  ...fxBuy, tradeID: 'FX2', transactionID: 'FXX2', quantity: -0.015, tradePrice: 0.719, proceeds: 0.0108,
  tradeDate: '2026-01-07', dateTime: '2026-01-07T10:00:00', fifoPnlRealized: 5,
}

check('a currency conversion opens no lot, closes nothing, and realises nothing', () => {
  const r = runFifo([fxBuy, fxSell])
  assert.deepEqual(r.lots, [], 'money bought is a cash balance, not an open position')
  assert.deepEqual(r.closures, [])
  assert.deepEqual(r.executions.map((e) => [e.symbol, e.side, e.quantity, e.effect, e.positionAfter, e.realizedLocal, e.openedQuantity]), [
    ['AUD.USD', 'buy', 50000, 'convert', 0, null, 0],
    ['AUD.USD', 'sell', 0.015, 'convert', 0, null, 0],
  ])
  assert.equal(r.warnings.some((w) => /close exceeds open quantity/.test(w)), false,
    'and a sale of money closes no lot, so it is never reported as a close with nothing behind it')
})

check('a conversion is still listed, with the money that changed hands', () => {
  const buy = runFifo([fxBuy]).executions[0]!
  assert.equal(buy.value, 35900, "the broker's own proceeds")
  assert.equal(buy.commission, 0)
  assert.equal(buy.partialHistory, false)
  assert.equal(buy.inferred, false, 'a blank open/close flag infers nothing where there is no position')
})

check('conversions leave the positions check, the round trips and their qualifiers exactly as they were', () => {
  const withFx = buildBook([{ ...doc, trades: [...doc.trades, fxBuy, fxSell] }])
  const named = (b: ReturnType<typeof buildBook>, name: string) => {
    const c = b.reconciliation.checks.find((x) => x.name === name)!
    return [c.ours, c.broker, c.break, c.ok]
  }
  assert.deepEqual(named(withFx, 'Open positions'), named(book, 'Open positions'), 'money is not an open position')
  assert.deepEqual(named(withFx, 'Realised P&L'), named(book, 'Realised P&L'), 'and is counted on neither side of realised')
  assert.equal(withFx.openLots.some((l) => l.symbol === 'AUD.USD'), false)
  assert.equal(withFx.closures.length, book.closures.length)
  assert.deepEqual(withFx.closures.map((c) => c.partialHistory), book.closures.map((c) => c.partialHistory),
    'and no equity round trip becomes unproven because a conversion sits beside it')
  assert.deepEqual(withFx.executions.filter((e) => e.effect === 'convert').map((e) => [e.id, e.partialHistory]),
    [['FX1', false], ['FX2', false]], 'the fills are listed, and nothing about them is reconstructed')
})

check('a conversion the broker realised money on is named, not silently dropped', () => {
  // It reaches no realised figure here, and the NAV bridge remainder it falls into is a residual nobody can
  // rebuild (§15) — so the broker's own number must not leave the book without a word.
  const r = runFifo([fxBuy, { ...fxSell, fifoPnlRealized: 12.34 }])
  assert.equal(r.closures.length, 0)
  assert.equal(r.warnings.length, 1)
  assert.match(r.warnings[0]!, /AUD\.USD realised 12\.34 USD per the broker/)
  assert.match(r.warnings[0]!, /in neither realised on closed trades nor the costs beside it/)
  assert.deepEqual(runFifo([fxBuy, { ...fxSell, fifoPnlRealized: null }]).warnings, [],
    'and a conversion the broker realised nothing on, at no cost, says nothing')
  // The commission is money too, and it reaches no cost total here either — so it is named on its own.
  const costed = runFifo([{ ...fxBuy, ibCommission: -2.5 }])
  assert.equal(costed.warnings.length, 1)
  assert.match(costed.warnings[0]!, /cost 2\.5 USD per the broker/)
})

check('a broker that DOES report a currency balance as a position is not a break', () => {
  // Our side stopped calling a conversion a position; a statement whose OpenPositions section carries the
  // currency would otherwise fail the same check in the opposite direction, on a book where nothing is wrong.
  const cash = { ...doc.openPositions[0]!, symbol: 'AUD.USD', conid: '14433401', assetCategory: 'CASH',
    position: 50000, positionValue: 35900, costBasisMoney: 35900 }
  const b = buildBook([{ ...doc, openPositions: [...doc.openPositions, cash], trades: [...doc.trades, fxBuy] }])
  const check5 = b.reconciliation.checks.find((c) => c.name === 'Open positions')!
  const base = book.reconciliation.checks.find((c) => c.name === 'Open positions')!
  assert.deepEqual([check5.ours, check5.broker, check5.ok], [base.ours, base.broker, base.ok])
  // And it is not published as a holding: read as an open equity position it would count as invested, and
  // cash — the statement's value less what is invested — would be short by the whole balance.
  assert.equal(b.positions.some((p) => p.symbol === 'AUD.USD'), false)
  assert.equal(b.positions.length, book.positions.length)
})

check('an FX-only period is not reported as missing trade data', () => {
  // A period where the ONLY realised activity is a conversion correctly leaves brokerRows and closures
  // empty — a conversion books no closure, and is excluded from brokerRows on purpose (see above). That
  // used to fall straight into the "no trade rows were imported" branch even though the conversion WAS
  // imported and fully accounts for the statement's own realised total.
  // The conversion must fall INSIDE the statement window ([2026-01-01, 2026-01-04]) — latestNav.realized
  // only covers that window, so the conversion it is compared against is scoped to it (see the multi-period
  // case below). fxRateToBase pins the base-currency amount so it does not depend on the fx grid.
  const convBuy = { ...fxBuy, tradeDate: '2026-01-02', dateTime: '2026-01-02T10:00:00', fxRateToBase: 1 }
  const convSell = { ...fxSell, tradeDate: '2026-01-03', dateTime: '2026-01-03T10:00:00', fxRateToBase: 1,
    fifoPnlRealized: 20786.5 }
  const fxOnlyDoc = {
    ...doc,
    trades: [convBuy, convSell],
    changeInNav: { ...doc.changeInNav!, realized: 20786.5 },
  }
  const fxOnly = buildBook([fxOnlyDoc])
  const realised = fxOnly.reconciliation.checks.find((c) => c.name === 'Realised P&L')
  assert.equal(realised, undefined,
    'nothing is left to compare once the conversion explains the whole realised total — not a false break')

  // The same FX activity must read the same way whether or not something unrelated also traded that
  // period — the inconsistency codex flagged: an unrelated non-CASH row used to bypass the false-alarm
  // branch entirely, so an otherwise-identical period reconciled differently depending on it.
  const withOther = buildBook([{ ...fxOnlyDoc, trades: [...fxOnlyDoc.trades, buyXsp] }])
  const realisedWithOther = withOther.reconciliation.checks.find((c) => c.name === 'Realised P&L')
  assert.equal(realisedWithOther?.ok ?? true, true, 'an unrelated open trade must not surface the same break')

  // MULTI-PERIOD: conversions from an earlier statement must not be folded into the latest window's
  // total. `conversionRows` is drawn from the whole merged import, but latestNav.realized covers only the
  // newest window — so an unscoped sum adds the prior-period conversion (5000) to the latest one (20786.5)
  // and no longer matches the newest realised, raising a false "no trade rows" break on a period that is
  // in fact fully explained by its own conversion. Scoping conversions to [fromDate, toDate] fixes it.
  const priorConv = { ...fxBuy, tradeID: 'FX0', transactionID: 'FXX0', tradeDate: '2025-12-15',
    dateTime: '2025-12-15T10:00:00', fxRateToBase: 1, fifoPnlRealized: 5000 }
  const priorDoc = { ...doc, fromDate: '2025-12-01', toDate: '2025-12-31',
    whenGenerated: '2025-12-31T00:00:00', trades: [priorConv], openPositions: [], equitySummary: [],
    cashTransactions: [], changeInNav: null }
  const multi = buildBook([priorDoc, fxOnlyDoc])
  const realisedMulti = multi.reconciliation.checks.find((c) => c.name === 'Realised P&L')
  assert.equal(realisedMulti, undefined,
    'a prior-period conversion must not fold into the latest window and manufacture a false break')

  // A period that is genuinely missing its trade detail — no conversion, no other row — must still be
  // caught: this fix narrows the false alarm, it does not remove the check.
  const noTrades = buildBook([{ ...doc, trades: [], openPositions: [] }])
  const stillCaught = noTrades.reconciliation.checks.find((c) => c.name === 'Realised P&L')!
  assert.equal(stillCaught.ok, false, 'a real gap — no trades at all, conversion or otherwise — still fails')
})

check('an overnight conversion booked across the statement boundary still counts by its trade date', () => {
  // The broker can execute a conversion late on the last day of one period and book (tradeDate) it into
  // the next — an overnight session, same as the OpenPositions snapshot logic above already documents.
  // Keying window membership off dateTime first put such a fill in the WRONG window: executed
  // 2025-12-31 23:30 but booked 2026-01-01, it fell outside a January-only statement even though the
  // broker's own period counts it as January's.
  const convBuy = { ...fxBuy, tradeDate: '2026-01-02', dateTime: '2026-01-02T10:00:00', fxRateToBase: 1 }
  const convSell = {
    ...fxSell, dateTime: '2025-12-31T23:30:00', tradeDate: '2026-01-01', fxRateToBase: 1,
    fifoPnlRealized: 20786.5,
  }
  const straddleDoc = {
    ...doc,
    trades: [convBuy, convSell],
    changeInNav: { ...doc.changeInNav!, realized: 20786.5 },
  }
  const straddle = buildBook([straddleDoc])
  const realised = straddle.reconciliation.checks.find((c) => c.name === 'Realised P&L')
  assert.equal(realised, undefined,
    'the conversion is booked (tradeDate) into the January window and fully accounts for the realised ' +
    'total, so no "no trade rows were imported" break should fire even though it executed the prior evening')
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
