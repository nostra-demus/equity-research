// Watch plans (src/watch/plan.ts): the checks that decide whether an item a model read out of a research
// report is kept. Each case is a way a plausible-looking item can be wrong — a quote that is not in the
// report, a number that is not in its quote, a "buy" the sentence never said, a price named only to say not
// to buy at it — plus the real sentences from the committed research, which must pass.
// Run: npx tsx test/watch-plan.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  badCase, currencyConflict, datesIn, hasNumber, negatedAt, numbersIn, parseReaderJson, quoteFound, recordItems,
  saysBuy, validateReaderOutput,
} from '../src/watch/plan'

let passed = 0
function check(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

// Verbatim from the committed decision records.
const AMZN = 'No new position. Track at $190-200 for re-entry (>12% margin of safety on base fair value $210). July 31 Q2 2026 earnings is the first real test of D&A billing-lag hypothesis.'
const ORCL = 'No new position. Do not buy at $153.94 (no margin of safety against the $133.77 base case). Do not short into the 2026-09-04 print'
const INDIAMART = 'Do not initiate today. Track paying-supplier net additions at the next two prints (Q2 FY27 ~21-Oct-2026, Q3 FY27 ~Jan-2027); revisit if price falls toward the ₹1,699 base fair value or below, or if net adds turn positive for 2 consecutive quarters.'
const BG = "Do not buy at the indicative ~$123. Track. Re-rate to 'Starter Position Only' only on a pool-confirmed price below ~$100, or on a clean post-Viterra FY2026 cash-conversion print."

check('numbers: ranges, grouped thousands and decimals are read as written', () => {
  assert.deepEqual(numbersIn('Track at $190-200 for re-entry'), [190, 200])
  assert.ok(hasNumber('revisit toward the ₹1,699 base fair value', 1699))
  assert.ok(hasNumber('No position at AED 12.20.', 12.2))
  assert.ok(hasNumber('the NOK 70-82 weighted fair-value band', 82))
  assert.ok(!hasNumber('the NOK 70-82 band', 76), 'a number between two written numbers is not written')
})

check('dates: every form the research writes, and no day where it wrote only a month', () => {
  assert.deepEqual(datesIn('Revisit after the 2026-08-27/28 H1 2026 print.'), ['2026-08-27', '2026-08-28'])
  assert.deepEqual(datesIn(INDIAMART), ['2026-10-21'])
  assert.deepEqual(datesIn('Track the Q3 FY2026 print (Nov-03-2026)'), ['2026-11-03'])
  assert.deepEqual(datesIn('Revisit after the Oct-23-2026 FQ4 print'), ['2026-10-23'])
  assert.deepEqual(datesIn(AMZN), ['2026-07-31'])
  assert.deepEqual(datesIn('Track the Q2 2026 print (est. 10 Aug) for the Dubai demand signal'), ['2026-08-10'])
  assert.deepEqual(datesIn('TMF Holdings merger passes AGM (June 29, 2026)'), ['2026-06-29'])
  assert.deepEqual(datesIn('results ~Jan-2027 and again ~Late-Apr-2027'), [])
  assert.deepEqual(datesIn('31-Feb-2026'), [], 'a day that does not exist is not a date')
})

check('buy: only a sentence that says buy, and never a negated one', () => {
  assert.equal(saysBuy(AMZN), true)
  assert.equal(saysBuy(ORCL), false)
  assert.equal(saysBuy(INDIAMART), false)
  assert.equal(saysBuy(BG), false, 're-rating to Starter is a look-again, not a buy instruction')
  assert.equal(saysBuy('The engine rates it a Strong Buy.'), false, 'a rating label is not a price to buy at')
  assert.equal(saysBuy('Accumulate below $50.'), true)
})

check('a price named only to say not to buy at it', () => {
  assert.equal(negatedAt(ORCL, 153.94), true)
  assert.equal(negatedAt(ORCL, 133.77), false)
  assert.equal(negatedAt(AMZN, 190), false)
})

check("currency: a quote priced in another currency is not this listing's price", () => {
  assert.equal(currencyConflict('Track at $190-200 for re-entry', 'USD'), null)
  assert.equal(currencyConflict('revisit toward the ₹1,699 base fair value', 'INR'), null)
  assert.equal(currencyConflict('the H-share at HK$21', 'CNY'), 'HKD')
  assert.equal(currencyConflict('below ~$100', 'INR'), 'USD')
  assert.equal(currencyConflict('a Hong Kong listing below $50', 'HKD'), null, 'a bare $ on a dollar listing is its own dollar')
  assert.equal(currencyConflict('the NOK 70-82 band', 'NOK'), null)
  assert.equal(currencyConflict('toward 1,699', 'INR'), null)
})

check('bad case: the highest bear-type price BELOW the call price, chosen by price not label', () => {
  const smpl = [
    { label: 'bull', price_target: 21.98 }, { label: 'base', price_target: 15.27 },
    { label: 'bear_operating', price_target: 8.42 }, { label: 'bear_structural', price_target: 13.09 },
  ]
  assert.deepEqual(badCase(smpl, 11.33), { label: 'bear_operating', price: 8.42 })
  assert.deepEqual(badCase([{ label: 'bear_cyclical', price_target: 94.62 }, { label: 'bear_structural', price_target: 31.44 }], 153.94), { label: 'bear_cyclical', price: 94.62 })
  assert.deepEqual(badCase([{ label: 'bear', price_target: 146 }, { label: 'tail_structural_avoid_ruin', price_target: 4 }], null), { label: 'bear', price: 146 })
  assert.equal(badCase([{ label: 'base', price_target: 100 }], 120), null)
  assert.equal(badCase(undefined, 10), null)
})

check("the record's own fields become items with no model: the bad case and every kill criterion", () => {
  const items = recordItems({
    entry_price: 11.33,
    scenarios: [{ label: 'bear_operating', price_target: 8.42 }],
    kill_criteria: ['A plain one', { criterion: 'An object one', monitor: 'The 10-Q' }, { condition: 'A condition one', monitor_via: 'NSE filings' }, ''],
  }, 'USD')
  const prices = items.filter((i) => i.kind === 'price') as any[]
  const deals = items.filter((i) => i.kind === 'deal_breaker') as any[]
  assert.equal(prices.length, 1)
  assert.equal(prices[0].role, 'bad_case')
  assert.equal(prices[0].low, 8.42)
  assert.equal(prices[0].source.field, 'scenario "bear_operating"')
  assert.equal(deals.length, 3)
  assert.equal(deals[1].check_where, 'The 10-Q')
  assert.equal(deals[2].text, 'A condition one')
  assert.equal(recordItems({ entry_price: 10, scenarios: [{ label: 'bear', price_target: 8 }] }, null).filter((i) => i.kind === 'price').length, 0,
    'with no currency a bad case cannot be priced, so none is set')
})

check('quote matching forgives punctuation and wrapping, never a changed word', () => {
  const src = 'The **catalyst** is “July 31”.\nTrack at $190–200 for\nre-entry (>12% margin).'
  assert.ok(quoteFound(src, 'Track at $190-200 for re-entry'))
  assert.ok(quoteFound(src, 'The catalyst is "July 31"'))
  assert.ok(!quoteFound(src, 'Track at $180-200 for re-entry'))
  assert.ok(quoteFound(src, 'The catalyst is … for re-entry'), 'an ellipsis may join two verbatim parts in order')
  assert.ok(!quoteFound(src, 're-entry'), 'a fragment this short proves nothing')
})

const THESIS = [AMZN, ORCL, INDIAMART, 'It traded at $238.34 on the day.', 'The H-share was last at HK$23.10.', 'Watch for layoffs announced at the AGM.'].join('\n\n')
const ctx = (currency: string | null, entry: number | null) => ({ sources: new Map([['final_thesis.md', THESIS]]), currency, entryPrice: entry })

check('a buy price the sentence really says is kept as a buy price', () => {
  const r = validateReaderOutput({ prices: [{ role: 'buy', low: 190, high: 200, quote: 'Track at $190-200 for re-entry', file: 'final_thesis.md' }] }, ctx('USD', 238.34))
  assert.equal(r.items.length, 1)
  const p = r.items[0] as any
  assert.equal(p.role, 'buy')
  assert.equal(p.low, 190)
  assert.equal(p.high, 200)
  assert.equal(p.currency, 'USD')
  assert.equal(p.note, null)
})

check('a "buy" the sentence does not say is shown as a look-again price, and says so', () => {
  const r = validateReaderOutput({ prices: [{ role: 'buy', low: 1699, high: null, quote: 'revisit if price falls toward the ₹1,699 base fair value or below', file: 'final_thesis.md' }] }, ctx('INR', 1784.6))
  const p = r.items[0] as any
  assert.equal(p.role, 'look_again')
  assert.match(p.note, /does not say buy/)
})

check('every way a price is refused is listed with its reason', () => {
  const r = validateReaderOutput({
    prices: [
      { role: 'buy', low: 190, high: 200, quote: 'Track at $190-200 for a re-entry', file: 'final_thesis.md' },
      { role: 'buy', low: 180, high: 200, quote: 'Track at $190-200 for re-entry', file: 'final_thesis.md' },
      { role: 'look_again', low: 153.94, high: null, quote: 'Do not buy at $153.94', file: 'final_thesis.md' },
      { role: 'look_again', low: 238.34, high: null, quote: 'It traded at $238.34 on the day.', file: 'final_thesis.md' },
      { role: 'fair', low: 23.1, high: null, quote: 'The H-share was last at HK$23.10.', file: 'final_thesis.md' },
      { role: 'buy', low: 190, high: 200, quote: 'Track at $190-200 for re-entry', file: 'memo.md' },
      { role: 'bull', low: 247, high: null, quote: 'Track at $190-200 for re-entry', file: 'final_thesis.md' },
    ],
  }, ctx('USD', 238.34))
  assert.equal(r.items.length, 0)
  const why = r.left_out.map((l) => l.why).join(' | ')
  assert.match(why, /not in the research word for word/)
  assert.match(why, /not written in its quote/)
  assert.match(why, /not to buy at it/)
  assert.match(why, /price when the research was written/)
  assert.match(why, /HKD/)
  assert.match(why, /not read/)
  assert.match(why, /not a buy, look-again or fair price/)
})

check('a date keeps its day only when the quote writes that day', () => {
  const r = validateReaderOutput({
    dates: [
      { label: 'Q2 FY27 results', date: '2026-10-21', window: null, what_to_check: 'paying-supplier net additions', quote: 'Q2 FY27 ~21-Oct-2026', file: 'final_thesis.md' },
      { label: 'Q3 FY27 results', date: '2027-01-20', window: '~Jan-2027', what_to_check: null, quote: 'Q3 FY27 ~Jan-2027', file: 'final_thesis.md' },
    ],
  }, ctx('INR', 1784.6))
  const [a, b] = r.items as any[]
  assert.equal(a.date, '2026-10-21')
  assert.equal(b.date, null)
  assert.equal(b.window, '~Jan-2027')
  assert.match(r.left_out[0].why, /exact day is not written/)
})

check('waiting-for and news items need a verbatim quote too', () => {
  const r = validateReaderOutput({
    waiting_for: [{ text: 'net adds positive two quarters running', quote: 'net adds turn positive for 2 consecutive quarters', file: 'final_thesis.md' }],
    news: [
      { topic: 'Layoffs', quote: 'Watch for layoffs announced at the AGM.', file: 'final_thesis.md' },
      { topic: 'Rating cut', quote: 'A downgrade would matter a great deal.', file: 'final_thesis.md' },
    ],
  }, ctx('INR', 1784.6))
  assert.equal(r.items.filter((i) => i.kind === 'waiting_for').length, 1)
  assert.equal(r.items.filter((i) => i.kind === 'news').length, 1)
})

check("the model's JSON is read fenced or bare, and anything else is refused", () => {
  assert.deepEqual(parseReaderJson('Here:\n```json\n{"prices": []}\n```'), { prices: [] })
  assert.equal(parseReaderJson('no json here'), null)
  assert.equal(parseReaderJson('[1,2]'), null)
})

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
