// Watch plans (src/watch/plan.ts): the checks that decide whether an item a model read out of a research
// report is kept. Each case is a way a plausible-looking item can be wrong — a quote that is not in the
// report, a number that is not in its quote, a "buy" the sentence never said, a price named only to say not
// to buy at it — plus the real sentences from the committed research, which must pass.
// Run: npx tsx test/watch-plan.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  badCase, currencyConflict, datesIn, hasNumber, negatedAt, numbersIn, parseReaderJson, quoteFound, recordItems,
  risingAt, saysBuy, validateReaderOutput,
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
  assert.equal(saysBuy(BG), false, 're-rating to Starter is a review price, not a buy instruction')
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

check('a "buy" the sentence does not say is shown as a review price, and says so', () => {
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
  assert.match(why, /not a buy, review or fair price/)
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
  assert.equal(b.window, 'Q3 FY27 ~Jan-2027')
  assert.ok(r.left_out.some((l) => /exact day is not written/.test(l.why)))
})

check('waiting-for and news items need a verbatim quote too', () => {
  const r = validateReaderOutput({
    waiting_for: [{ text: 'net adds turn positive for 2 consecutive quarters', quote: 'net adds turn positive for 2 consecutive quarters', file: 'final_thesis.md' }],
    news: [
      { topic: 'Layoffs', quote: 'Watch for layoffs announced at the AGM.', file: 'final_thesis.md' },
      { topic: 'Rating cut', quote: 'A downgrade would matter a great deal.', file: 'final_thesis.md' },
    ],
  }, ctx('INR', 1784.6))
  assert.equal(r.items.filter((i) => i.kind === 'waiting_for').length, 1)
  assert.equal(r.items.filter((i) => i.kind === 'news').length, 1)
})

// Verbatim from the committed AMZN report (final_thesis.md — its entry levels, a fair-value line, and three
// events whose timing a model restated in its own words on the first real read).
const AMZN_ZONE = '- **Target entry zone:** $185–$200 (at or below the $210 base fair value, giving a modest positive margin of safety)'
const AMZN_CONVICTION = '- **Conviction entry:** Below $185 provides a genuine margin of safety and moves the risk/reward above 1.0x'
const AMZN_MORE = [
  AMZN_ZONE, AMZN_CONVICTION,
  'Margin of safety -13.5% = ((210 - 238.34) / 210) × 100 from base-case fair value $210.',
  'CFO committed to Q3 2026 commercial launch; cost capitalization begins Q4, removing ~$1B/quarter drag.',
  'FTC investigations into fulfillment practices and Prime are active with no disclosed hearing date or decision deadline.',
  'Globalstar close expected 2027 subject to regulatory approvals.',
].join('\n')
const amznCtx = { sources: new Map([['final_thesis.md', AMZN_MORE]]), currency: 'USD', entryPrice: 238.34 }

check('buy: an entry level the research labels as one is a buy, however the label is emphasised', () => {
  assert.equal(saysBuy('Conviction entry: Below $185 provides a genuine margin of safety'), true)
  assert.equal(saysBuy(AMZN_CONVICTION), true)
  assert.equal(saysBuy('**Conviction entry**: Below $185'), true)
  assert.equal(saysBuy(AMZN_ZONE), true)
  assert.equal(saysBuy('No entry: the setup is balanced at $150'), false)
  assert.equal(saysBuy('high barriers to entry protect the $50bn franchise'), false)
})

check('a fair value beside a price to act at is left out, with the reason; on its own it is kept', () => {
  const both = validateReaderOutput({
    prices: [
      { role: 'buy', low: 185, high: null, quote: 'Conviction entry: Below $185 provides a genuine margin of safety', file: 'final_thesis.md' },
      { role: 'fair', low: 210, high: null, quote: 'from base-case fair value $210.', file: 'final_thesis.md' },
    ],
  }, amznCtx)
  assert.deepEqual(both.items.map((i: any) => `${i.role}:${i.low}`), ['buy:185'])
  assert.match(both.left_out.map((l) => l.why).join(' | '), /price to act at/)
  const alone = validateReaderOutput({ prices: [{ role: 'fair', low: 210, high: null, quote: 'from base-case fair value $210.', file: 'final_thesis.md' }] }, amznCtx)
  assert.deepEqual(alone.items.map((i: any) => `${i.role}:${i.low}`), ['fair:210'])
})

check('a fair value the stock was already under when the research was written is not a line to wait for', () => {
  // Verbatim from the committed UBER report: the research saw the gap and still said wait for events.
  const quote = 'Base-case fair value $74.77/share vs. $68.18 price (8.82% margin of safety).'
  const uber = { sources: new Map([['final_thesis.md', quote]]), currency: 'USD', entryPrice: 68.18 }
  const r = validateReaderOutput({ prices: [{ role: 'fair', low: 74.77, high: null, quote, file: 'final_thesis.md' }] }, uber)
  assert.equal(r.items.length, 0)
  assert.match(r.left_out[0].why, /already under it when the research was written/)
  // ORCL's fair value sat BELOW its price, so reaching it is news.
  const orcl = 'Base-case fair value: $133.77/share (13.1% below the $153.94 current price).'
  const o = validateReaderOutput({ prices: [{ role: 'fair', low: 133.77, high: null, quote: orcl, file: 'final_thesis.md' }] }, { sources: new Map([['final_thesis.md', orcl]]), currency: 'USD', entryPrice: 153.94 })
  assert.deepEqual(o.items.map((i: any) => `${i.role}:${i.low}`), ['fair:133.77'])
})

check('a price the research ties to the stock RISING past it is left out — every line here is reached by a fall', () => {
  // Verbatim from the committed BG report: above ~$115 moves the call toward Avoid; below ~$100 is a review price.
  const rise = 'A confirmed pool price materially above ~$115 with no change in earnings power (moves the call from Watchlist toward Avoid).'
  const fall = "Re-rate to 'Starter Position Only' only on a pool-confirmed price below ~$100, or on a clean post-Viterra FY2026 cash-conversion print."
  const r = validateReaderOutput({
    prices: [
      { role: 'look_again', low: 115, high: null, quote: rise, file: 'final_thesis.md' },
      { role: 'look_again', low: 100, high: null, quote: fall, file: 'final_thesis.md' },
    ],
  }, { sources: new Map([['final_thesis.md', `${rise}\n${fall}`]]), currency: 'USD', entryPrice: null })
  assert.deepEqual(r.items.map((i: any) => `${i.role}:${i.low}`), ['look_again:100'])
  assert.match(r.left_out[0].why, /rising past it/)
  assert.equal(risingAt('Track at $190-200 for re-entry (>12% margin of safety on base fair value $210).', 210), false)
  assert.equal(risingAt('If the stock reaches $115 or above, move to Avoid', 115), true, 'the direction can follow the number')
  assert.equal(risingAt('A price of $115+ moves the call toward Avoid', 115), true)
  assert.equal(risingAt('Buy at $115 or below', 115), false)
})

check('one line, one price: a level the research states twice is kept once, the strongest role first', () => {
  // The real AMZN reads: its thesis zone and its record's re-entry range both trigger at $200.
  const sources = new Map([['final_thesis.md', `${AMZN_MORE}\n${AMZN}`]])
  const r = validateReaderOutput({
    prices: [
      { role: 'look_again', low: 185, high: 200, quote: '$185–$200 (at or below the $210 base fair value', file: 'final_thesis.md' },
      { role: 'buy', low: 185, high: 200, quote: '**Target entry zone:** $185–$200 (at or below the $210 base fair value', file: 'final_thesis.md' },
      { role: 'buy', low: 185, high: null, quote: 'Conviction entry: Below $185 provides a genuine margin of safety', file: 'final_thesis.md' },
      { role: 'buy', low: 190, high: 200, quote: 'Track at $190-200 for re-entry', file: 'final_thesis.md' },
    ],
  }, { sources, currency: 'USD', entryPrice: 238.34 })
  assert.deepEqual(r.items.map((i: any) => `${i.role}:${i.low}-${i.high}`), ['buy:185-200', 'buy:185-null'])
  assert.equal(r.left_out.filter((l) => /same line as the buy price 185–200 already kept/.test(l.why)).length, 2)
  assert.ok(r.left_out.some((l) => l.what === 'review price 185–200'), 'a left-out price names its role in words, never the internal key')
})

check("a date's timing is shown only in words its quote writes", () => {
  const r = validateReaderOutput({
    dates: [
      { label: 'FTC decision', date: null, window: '~2026–2027 (no fixed date)', what_to_check: null, quote: 'FTC investigations into fulfillment practices and Prime are active with no disclosed hearing date or decision deadline.', file: 'final_thesis.md' },
      { label: 'Leo launch', date: null, window: '~Q3 2026 (July–September 2026)', what_to_check: null, quote: 'CFO committed to Q3 2026 commercial launch', file: 'final_thesis.md' },
      { label: 'Globalstar close', date: null, window: '~2027 (expected close)', what_to_check: null, quote: 'Globalstar close expected 2027 subject to regulatory approvals.', file: 'final_thesis.md' },
    ],
  }, amznCtx)
  const dates = r.items.filter((i) => i.kind === 'date')
  assert.equal(dates.length, 3)
  assert.equal(dates[0].window, 'FTC investigations into fulfillment practices and Prime are active with no disclosed hearing date or decision deadline.')
  assert.equal(dates[1].label, 'Research event', 'an unsupported proper name is not invented')
  assert.equal(dates[1].window, 'CFO committed to Q3 2026 commercial launch')
  assert.equal(dates[2].window, 'Globalstar close expected 2027 subject to regulatory approvals.')
  assert.equal(r.left_out.filter((l) => /timing is not written/.test(l.why)).length, 2)
})

check('a day the research only estimates is still the day to watch — kept with its own words', () => {
  // Verbatim from the committed INDIAMART, EMAAR and HAIER reports; the real reads returned these as windows.
  const sources = new Map([['final_thesis.md', [
    'Nearest dated catalyst (one line): Q2 FY27 (Jul–Sep 2026) results, CIQ-modeled at ~21-Oct-2026 — no NSE/BSE board-meeting intimation filed yet as of 14-Aug-2026',
    'Track the Q2 2026 print (est. 10 Aug) for the Dubai demand signal',
    'the nearest one that can actually move the stock is the H1 2026 interim results due 2026-08-27/28, about two weeks from today',
    'Q3 FY27 ~Jan-2027',
    // UBER: the model gave the exact day — but its quote calls it an estimate. NHY: a plain dated result.
    'The nearest dated catalyst is Q3 FY2026 earnings, estimated November 3, 2026, which tests whether a four-quarter EBITDA-guidance-beat streak survives',
    "Nearest dated catalyst (one line): Second-quarter (FQ2) 2026 results, 22-Jul-2026 — three days from this report's date",
    // HAIER: a window holding an exact, contractual end date — watched on that day, and never called an estimate.
    '| Through 2027-03-26 | CNY 6,000mn buyback (24.8% complete as of Jun-2026) | Self-limiting capital-return program |',
  ].join('\n')]])
  const r = validateReaderOutput({
    dates: [
      { label: 'Q2 FY27 results', date: null, window: '~21-Oct-2026', what_to_check: null, quote: 'Q2 FY27 (Jul–Sep 2026) results, CIQ-modeled at ~21-Oct-2026 — no NSE/BSE board-meeting intimation filed yet as of 14-Aug-2026', file: 'final_thesis.md' },
      { label: 'Q2 2026 print', date: null, window: 'est. 10 Aug', what_to_check: null, quote: 'Track the Q2 2026 print (est. 10 Aug) for the Dubai demand signal', file: 'final_thesis.md' },
      { label: 'H1 2026 interim results', date: null, window: '2026-08-27/28', what_to_check: null, quote: 'the H1 2026 interim results due 2026-08-27/28, about two weeks from today', file: 'final_thesis.md' },
      { label: 'Q3 FY27 results', date: null, window: '~Jan-2027', what_to_check: null, quote: 'Q3 FY27 ~Jan-2027', file: 'final_thesis.md' },
      { label: 'Q3 FY2026 earnings', date: '2026-11-03', window: null, what_to_check: null, quote: 'Q3 FY2026 earnings, estimated November 3, 2026, which tests whether a four-quarter EBITDA-guidance-beat streak survives', file: 'final_thesis.md' },
      { label: 'FQ2 2026 results', date: '2026-07-22', window: null, what_to_check: null, quote: "Second-quarter (FQ2) 2026 results, 22-Jul-2026 — three days from this report's date", file: 'final_thesis.md' },
      { label: 'CNY 6,000mn buyback', date: null, window: 'Through 2027-03-26', what_to_check: null, quote: '| Through 2027-03-26 | CNY 6,000mn buyback (24.8% complete as of Jun-2026) |', file: 'final_thesis.md' },
    ],
  }, { sources, currency: 'INR', entryPrice: null })
  assert.deepEqual(r.items.map((i: any) => [i.label, i.date, i.estimated]), [
    ['Research event', '2026-10-21', true],
    ['Q2 2026 print', '2026-08-10', true],
    ['H1 2026 interim results', '2026-08-27', true],
    ['Research event', null, false],
    ['Q3 FY2026 earnings', '2026-11-03', true],
    ['Research event', '2026-07-22', false],
    ['CNY 6,000mn buyback', '2027-03-26', false],
  ])
  for (const item of r.items) if (item.kind === 'date' && item.window) assert.equal(item.window, item.source.quote,
    'a window retains the original source statement and its qualifiers')
})

check("the model's JSON is read fenced or bare, and anything else is refused", () => {
  assert.deepEqual(parseReaderJson('Here:\n```json\n{"prices": []}\n```'), { prices: [] })
  assert.equal(parseReaderJson('no json here'), null)
  assert.equal(parseReaderJson('[1,2]'), null)
})

check("supporting words must be in their own quote, including metric, direction and qualifiers", () => {
  const fullQuote = 'Q2 FY27 results on 21-Oct-2026 will show whether EBITDA margin holds near 35.35%.'
  const thesis = fullQuote + ' We would change our view if net adds turn positive for 2 consecutive quarters. Watch for a guidance cut. Revenue grew 12%.'
  const r = validateReaderOutput({
    dates: [
      { label: 'Results', date: '2026-10-21', what_to_check: 'whether EBITDA margin holds near 35.35%', quote: fullQuote, file: 'final_thesis.md' },
      { label: 'Unsupported metric', date: '2026-10-21', what_to_check: 'whether margin falls below 12%', quote: fullQuote, file: 'final_thesis.md' },
      { label: 'Unsupported words', date: '2026-10-21', what_to_check: 'management resigns', quote: fullQuote, file: 'final_thesis.md' },
      { label: 'Wrong excerpt', date: '2026-10-21', what_to_check: 'whether EBITDA margin holds near 35.35%', quote: 'Q2 FY27 results on 21-Oct-2026', file: 'final_thesis.md' },
    ],
    waiting_for: [
      { text: 'net adds turn positive for 2 consecutive quarters', quote: 'net adds turn positive for 2 consecutive quarters', file: 'final_thesis.md' },
      { text: 'net adds turn negative for 2 consecutive quarters', quote: 'net adds turn positive for 2 consecutive quarters', file: 'final_thesis.md' },
    ],
    news: [
      { topic: 'a guidance cut', quote: 'Watch for a guidance cut.', file: 'final_thesis.md' },
      { topic: 'an accounting fraud', quote: 'Watch for a guidance cut.', file: 'final_thesis.md' },
    ],
  }, { sources: new Map([['final_thesis.md', thesis]]), currency: 'INR', entryPrice: null })
  const dates = r.items.filter((i) => i.kind === 'date')
  assert.deepEqual(dates.map((d) => d.what_to_check), ['whether EBITDA margin holds near 35.35%', null, null])
  assert.equal(r.items.filter((i) => i.kind === 'waiting_for').length, 1)
  assert.equal(r.items.filter((i) => i.kind === 'news').length, 1)
  assert.ok(r.left_out.filter((l) => /not in the cited quote/.test(l.why)).length >= 5)
})

check('avoid and without instructions never become urgent review-price lines', () => {
  for (const quote of ['Avoid buying at $100.', 'Proceed without buying at $100.', 'Do not initiate at $100.', 'Never accumulate at $100.', 'Avoid **buying** at $100.']) {
    const r = validateReaderOutput({ prices: [{ role: 'buy', low: 100, high: null, quote, file: 'final_thesis.md' }] },
      { sources: new Map([['final_thesis.md', quote]]), currency: 'USD', entryPrice: null })
    assert.equal(r.items.length, 0, quote)
    assert.match(r.left_out[0].why, /not to buy/)
  }
  assert.equal(negatedAt('Avoid buying at $100. Revisit at $90.', 90), false)
})

check('a model excerpt cannot cut source negation or reverse timing constraints', () => {
  const prohibited = 'Do not buy at $80 before earnings are checked.'
  const p = validateReaderOutput({ prices: [{ role: 'buy', low: 80, high: null,
    quote: 'buy at $80 before earnings are checked.', file: 'final_thesis.md' }] },
    { sources: new Map([['final_thesis.md', prohibited]]), currency: 'USD', entryPrice: 100 })
  assert.equal(p.items.length, 0)
  assert.match(p.left_out[0].why, /negation/)
  const timing = 'Approval is not expected before January 2027.'
  const maturity = 'The bond maturity is expected on October 23, 2026.'
  const d = validateReaderOutput({ dates: [
    { label: 'Approval', date: null, window: 'before January 2027', quote: timing, file: 'final_thesis.md' },
    { label: 'Dividend payment confirmed', date: '2026-10-23', quote: maturity, file: 'final_thesis.md' },
  ] }, { sources: new Map([['final_thesis.md', timing + '\n' + maturity]]), currency: 'USD', entryPrice: 100 })
  const dates = d.items.filter((i) => i.kind === 'date')
  assert.equal(dates[0].window, timing)
  assert.equal(dates[1].label, 'Research event')
  assert.equal(dates[1].estimated, true)
})

check('source currency cannot be sliced away by the model quote', () => {
  const text = 'Consider HK$80 for re-entry after results.'
  const r = validateReaderOutput({ prices: [{ role: 'look_again', low: 80, high: null,
    quote: '$80 for re-entry after results.', file: 'final_thesis.md' }] },
    { sources: new Map([['final_thesis.md', text]]), currency: 'USD', entryPrice: 100 })
  assert.equal(r.items.length, 0)
  assert.match(r.left_out[0].why, /HKD/)
})

check('an exact earliest date and its negation never become an expected event date', () => {
  const quote = 'Approval is not expected before October 23, 2026.'
  const r = validateReaderOutput({ dates: [{ label: 'Approval expected', date: '2026-10-23',
    window: 'before October 23, 2026', quote, file: 'final_thesis.md' }] },
    { sources: new Map([['final_thesis.md', quote]]), currency: 'USD', entryPrice: 100 })
  const date = r.items.find((i) => i.kind === 'date')!
  assert.equal(date.label, 'Research event')
  assert.equal(date.date, null, 'an earliest bound does not claim the event occurs that day')
  assert.equal(date.window, quote)
  const estimatedQuote = 'Approval is expected on October 23, 2026, subject to a vote.'
  const e = validateReaderOutput({ dates: [{ label: 'Approval', date: '2026-10-23',
    window: 'October 23, 2026', quote: estimatedQuote, file: 'final_thesis.md' }] },
    { sources: new Map([['final_thesis.md', estimatedQuote]]), currency: 'USD', entryPrice: 100 })
  const estimated = e.items.find((i) => i.kind === 'date')!
  assert.equal(estimated.date, '2026-10-23')
  assert.equal(estimated.window, estimatedQuote)
  assert.equal(estimated.estimated, true)
})

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
