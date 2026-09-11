// Every figure built from closed trades carries the qualifiers of the trades behind it. A round trip in a
// position the statements only partly cover may have been matched against the wrong opening lot, and one
// with a blank commission counts that cost as zero; the hit rate, the averages, the largest loss, the bars,
// the currency split and the NAV bridge all rest on those same figures, so each has to say so.
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { PortfolioBook, PortfolioClosure, PortfolioManualRead } from '../../lib/types'
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
const tags = (fragment: string) => ({ unproven: />unproven</.test(fragment), costUnknown: />cost unknown</.test(fragment) })
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
  for (const label of ['Realised', 'Closed trades', 'Hit rate', 'Win / loss size', 'Largest loss']) {
    assert.deepEqual(card(html, label), { unproven: true, costUnknown: true }, label)
  }
  // A blank commission moves money, not dates: the hold rests on the matched lot, so only partial history reaches it.
  assert.deepEqual(card(html, 'Avg hold'), { unproven: true, costUnknown: false })
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

console.log(`PortfolioStage: ${passed} passed`)
