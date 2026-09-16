// Every figure built from closed trades carries the qualifiers of the trades behind it. A round trip in a
// position the statements only partly cover may have been matched against the wrong opening lot, and one
// with a blank commission counts that cost as zero; the hit rate, the averages, the largest loss, the bars,
// the currency split and the NAV bridge all rest on those same figures, so each has to say so.
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { PortfolioBook, PortfolioClosure, PortfolioExecution, PortfolioManualRead, PortfolioPosition } from '../../lib/types'
import { Holdings, Trades } from './PortfolioStage'

// One FIFO lot, closed, in the shape the engine sends.
const closure = (o: Partial<PortfolioClosure>): PortfolioClosure => ({
  symbol: 'AAA', currency: 'USD', quantity: 10, side: 'long', entryPrice: 10, exitPrice: 20,
  openedAt: '2026-01-02T10:00:00', closedAt: '2026-02-02T10:00:00', holdingDays: 31,
  realizedLocal: 98, grossLocal: 100, commissionLocal: -2, realizedBase: 98,
  openFxRateToBase: 1, closeFxRateToBase: 1, closeTradeID: 'C1', costsUnknown: false, partialHistory: false, ...o,
})
const clean = closure({})
// Partial history, and in another currency so it has its own row in the currency split.
const partial = closure({
  symbol: 'BBB', currency: 'EUR', closeTradeID: 'C2', partialHistory: true, openedAt: '2026-01-05T10:00:00', closedAt: '2026-02-10T10:00:00',
  holdingDays: 36, realizedLocal: -50, grossLocal: -48, realizedBase: -60, openFxRateToBase: 1.1, closeFxRateToBase: 1.2,
})
const blankCost = closure({ symbol: 'CCC', closeTradeID: 'C3', costsUnknown: true, openedAt: '2026-01-07T10:00:00', closedAt: '2026-02-12T10:00:00', realizedLocal: 30, grossLocal: 30, commissionLocal: 0, realizedBase: 30 })

const book = (closures: PortfolioClosure[]): PortfolioBook => ({
  accountId: 'U0000000', baseCurrency: 'USD', asOf: '2026-03-31', coverage: { from: '2026-01-01', to: '2026-03-31', documents: 1 },
  sectionsPresent: [], sectionsUnmodelled: [], positions: [], closures, executions: [], openLots: [], corporateActions: [], flows: [],
  income: { dividendsGross: 0, withholdingTax: 0, paymentInLieu: 0, interest: 0, fees: 0, net: 0 },
  accruals: { dividend: null, interest: null, total: null }, navSeries: [{ date: '2026-03-31', total: 1000 }], twr: null,
  reconciliation: { ok: true, checks: [] }, warnings: [],
})
const manual: PortfolioManualRead = { trades: [], live: 0, superseded: 0, effects: [] }
const noop = () => {}
const tradesHtml = (b: PortfolioBook) => renderToStaticMarkup(createElement(Trades, {
  book: b, manual, onChanged: noop, cashEquivalents: [], importOpen: false, onImportOpen: noop, importSurface: null,
}))
const holdingsHtml = (b: PortfolioBook) => renderToStaticMarkup(createElement(Holdings, {
  book: b, perf: null, manual, cashEquivalents: [], live: null, onManage: noop, onChanged: noop,
}))

/** The element opened by `marker` that mentions `name`. Cards, bars, currency rows and bridge rows hold no
 *  nested div, so each ends at its first closing one — and never runs on into the rest of the page. */
const piece = (html: string, marker: string, name: string) => {
  const found = html.split(marker).slice(1).map((p) => p.slice(0, p.indexOf('</div>'))).find((p) => p.includes(name))
  assert.ok(found !== undefined, `nothing marked ${marker} mentions ${name}`)
  return found
}
const tags = (fragment: string) => ({ unproven: />(?:\d+ of \d+ )?unproven</.test(fragment), costUnknown: />cost unknown</.test(fragment) })
const card = (html: string, label: string) => tags(piece(html, 'fundbook__card"', `fundbook__cardlabel">${label}<`))

let passed = 0
const check = (name: string, fn: () => void) => {
  try { fn(); passed++ } catch (e) { console.error(`  FAIL ${name}`); throw e }
}

check('a book whose trades are all established carries no qualifier anywhere', () => {
  const html = tradesHtml(book([clean])) + holdingsHtml(book([clean]))
  assert.deepEqual(tags(html), { unproven: false, costUnknown: false })
})

check('every card built from the round trips carries the qualifiers of the trades behind it', () => {
  const html = tradesHtml(book([clean, partial, blankCost]))
  for (const label of ['Realised', 'Closed trades', 'Hit rate', 'Win / loss size']) {
    assert.deepEqual(card(html, label), { unproven: true, costUnknown: true }, label)
  }
  // A blank commission moves money, not dates: the hold rests on the matched lot, so only partial history reaches it.
  assert.deepEqual(card(html, 'Avg hold'), { unproven: true, costUnknown: false })
  // The largest loss is drawn from the LOSERS. Here the unproven trade is one and the blank-commission trade
  // is a winner, so only the first qualifier belongs to that figure.
  assert.deepEqual(card(html, 'Largest loss'), { unproven: true, costUnknown: false })
})

check('each bar and each currency row carries the qualifiers of its own trades, and only those', () => {
  const html = tradesHtml(book([clean, partial, blankCost]))
  const bar = (name: string) => tags(piece(html, 'fundbook__contrib"', `fundbook__contrib-label mono">${name}<`))
  assert.deepEqual([bar('AAA'), bar('BBB'), bar('CCC')],
    [{ unproven: false, costUnknown: false }, { unproven: true, costUnknown: false }, { unproven: false, costUnknown: true }])
  const fx = (ccy: string) => tags(piece(html, 'fundbook__row--fx"', `<strong class="mono">${ccy}</strong>`))
  assert.deepEqual([fx('EUR'), fx('USD')], [{ unproven: true, costUnknown: false }, { unproven: false, costUnknown: true }])
})

check('the NAV bridge carries them on realised', () => {
  const html = holdingsHtml(book([clean, partial, blankCost]))
  assert.deepEqual(tags(piece(html, 'fundbook__bridge', 'Realised on closed trades')), { unproven: true, costUnknown: true })
})

// ---- derivatives: which contract, and what its value measures ----

const execution = (o: Partial<PortfolioExecution> & { id: string; key: string }): PortfolioExecution => ({
  symbol: 'CL', currency: 'USD', executedAt: '2026-01-06T10:00:00', side: 'buy', quantity: 1, price: 70, multiplier: 1000,
  commission: -2, positionBefore: 0, positionAfter: 1, effect: 'open', openedQuantity: 1, stillOpen: 1, unmatchedQuantity: 0,
  realizedLocal: null, costsUnknown: false, inferred: false, isDerivative: true, value: 70000, partialHistory: false, openNow: true,
  assetCategory: 'FUT', ...o,
})
const fillRow = (html: string, name: string) => piece(html, 'fundbook__row fundbook__row--fills"', name)

check('each derivative fill names its contract, and the filter offers each contract on its own', () => {
  const html = tradesHtml({ ...book([]), executions: [
    execution({ id: 'F1', key: 'k:mar', expiry: '2026-03-20' }),
    execution({ id: 'F2', key: 'k:jun', expiry: '2026-06-22', executedAt: '2026-01-07T10:00:00' }),
  ] })
  assert.match(fillRow(html, '2026-03-20'), /CL<small class="fundbook__lots">2026-03-20<\/small>/)
  assert.match(fillRow(html, '2026-06-22'), /CL<small class="fundbook__lots">2026-06-22<\/small>/)
  assert.match(html, /<option value="k:mar">CL 2026-03-20 · 1 fill · held<\/option>/)
  assert.match(html, /<option value="k:jun">CL 2026-06-22 · 1 fill · held<\/option>/)
})

check('a future-style option\u2019s value is labelled premium, and a future\u2019s notional', () => {
  const html = tradesHtml({ ...book([]), executions: [
    execution({ id: 'F1', key: 'k:fut', expiry: '2026-03-20' }),
    execution({ id: 'O1', key: 'k:opt', assetCategory: 'FSOPT', expiry: '2026-03-17', strike: 75, putCall: 'C', quantity: 2, price: 3, value: 6000 }),
  ] })
  assert.match(fillRow(html, '75 C 2026-03-17'), />premium</)
  assert.doesNotMatch(fillRow(html, '75 C 2026-03-17'), />notional</)
  assert.match(fillRow(html, '>2026-03-20<'), />notional</)
})

check('a round trip names its contract too', () => {
  const html = tradesHtml(book([closure({ symbol: 'CL', key: 'k:mar', expiry: '2026-03-20', closeTradeID: 'C9' })]))
  assert.match(piece(html, 'fundbook__row fundbook__row--trades"', 'CL'), /CL<small class="fundbook__lots">2026-03-20<\/small>/)
})

check('a future-style option held names its contract, and its value is premium, not notional', () => {
  const option: PortfolioPosition = {
    symbol: 'CL', conid: null, assetCategory: 'FSOPT', subCategory: null, currency: 'USD', quantity: 2, markPrice: 3,
    costBasisPrice: 2.5, costBasisMoney: 5000, positionValue: 6000, percentOfNAV: null, unrealizedLocal: 1000,
    fxRateToBase: 1, multiplier: 1000, isDerivative: true, expiry: '2026-03-17', strike: 75, putCall: 'C',
  }
  const row = piece(holdingsHtml({ ...book([]), positions: [option] }), 'fundbook__row"', '75 C 2026-03-17')
  assert.match(row, />premium</)
  assert.doesNotMatch(row, />notional</)
})

check('unknown holdings are qualified on the fill and in the contract filter', () => {
  const html = tradesHtml({ ...book([]), executions: [execution({ id: 'U1', key: 'k:unknown',
    expiry: '2026-03-20', openNow: null, partialHistory: true, positionAfter: 0, stillOpen: 0 })] })
  assert.match(fillRow(html, '2026-03-20'), />Unknown</)
  assert.match(html, /CL 2026-03-20 · 1 fill · holding unknown<\/option>/)
  assert.match(html, /Holdings marked Unknown stay visible/)
})

check('a card is qualified by the trades ITS figure is built from, not by the whole book', () => {
  // An unproven WINNER says nothing about the largest loss, which is drawn from the losers. Tagged there, the
  // qualifier names trades that figure never counted.
  const unprovenWinner = closure({ symbol: 'WIN', closeTradeID: 'C8', partialHistory: true, realizedLocal: 80, realizedBase: 80, grossLocal: 80 })
  const cleanLoss = closure({ symbol: 'LOSS', closeTradeID: 'C9', realizedLocal: -40, realizedBase: -40, grossLocal: -40 })
  const html = tradesHtml(book([clean, unprovenWinner, cleanLoss]))
  assert.match(piece(html, 'fundbook__card"', 'fundbook__cardlabel">Hit rate<'), />1 of 3 unproven</)
  assert.deepEqual(card(html, 'Largest loss'), { unproven: false, costUnknown: false }, 'the loss is established')
  assert.match(piece(html, 'fundbook__card"', 'fundbook__cardlabel">Win / loss size<'), />1 of 3 unproven</)
})

check('a figure built from several trades says how many of them are unproven', () => {
  // A bare stamp reads the same whether one immaterial line is reconstructed or the whole book is. The real
  // book put "unproven" on a year of realised trading because of a $0.000016 currency line.
  const html = tradesHtml(book([clean, partial, blankCost]))
  assert.match(piece(html, 'fundbook__card"', 'fundbook__cardlabel">Hit rate<'), />1 of 3 unproven</)
  // One trade's own row still says only that it is unproven: there is no set behind it to count.
  assert.match(piece(html, 'fundbook__row fundbook__row--trades"', 'BBB'), />unproven</)
})

check('a currency conversion is shown as one, with no position and nothing left of it', () => {
  const html = tradesHtml({ ...book([]), executions: [execution({
    id: 'FX1', key: 'conid:14433401', symbol: 'AUD.USD', assetCategory: 'CASH', isDerivative: false, expiry: null,
    effect: 'convert', quantity: 50000, price: 0.718, value: 35900, multiplier: 1, commission: 0,
    positionBefore: 0, positionAfter: 0, openedQuantity: 0, stillOpen: 0, openNow: false,
  })] })
  const row = fillRow(html, 'AUD.USD')
  assert.match(row, />Convert</)
  assert.match(row, />USD → AUD</)
  assert.doesNotMatch(row, />Held</, 'money bought is not a holding')
  assert.equal((row.match(/>—</g) ?? []).length, 3, 'no position after it, nothing realised, and nothing left of it')
  assert.match(html, /bought money rather than a position/)
})

check('the bridge qualifier counts trades, not the FIFO lots behind them', () => {
  // One sale consuming two opening lots is two closures and ONE round trip. Counting closures made the bridge
  // say "2 of 3 unproven" of the book whose cards say "1 of 2".
  const twoLots = [
    closure({ symbol: 'DDD', closeTradeID: 'C7', partialHistory: true, quantity: 10 }),
    closure({ symbol: 'DDD', closeTradeID: 'C7', partialHistory: true, quantity: 5, entryPrice: 12 }),
  ]
  const html = holdingsHtml(book([clean, ...twoLots]))
  assert.match(piece(html, 'fundbook__bridge', 'Realised on closed trades'), />1 of 2 unproven</)
})

console.log(`PortfolioStage: ${passed} passed`)
