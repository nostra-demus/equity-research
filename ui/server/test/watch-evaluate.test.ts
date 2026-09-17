// What a watched name says right now (src/watch/evaluate.ts). The cases that matter are the ones where a
// wrong word misleads: "In buy zone" on a price the research only said to review, a big drop
// that was really the whole market, a warning drowned out by a buy signal, a price compared across two
// currencies, and a stale or implausible price acted on as if it were real.
// Run: npx tsx test/watch-evaluate.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { CONDITION_STATUS, URGENT_CONDITIONS, datePhrase, evaluateName, tradingDaysUntil, type PriceFacts } from '../src/watch/evaluate'
import type { PlanItem, WatchPlan } from '../src/watch/plan'
import { evaluateTrigger, type WatchTrigger } from '../src/watchlist'
import type { LiveQuote } from '../src/news/equity-quote'

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

const TODAY = '2026-09-15' // a Tuesday
const src = (quote: string) => ({ file: 'final_thesis.md', quote, field: null })
function plan(items: PlanItem[], over: Partial<WatchPlan> = {}): WatchPlan {
  return {
    schema_version: 'watch-plan/v1', listing_key: 'AMZN|USD', ticker: 'AMZN', company_name: 'Amazon.com', currency: 'USD',
    exchange: 'NasdaqGS', origin: 'research', run_root: 'analyses/AMZN_2026-07-10', decision: 'Watchlist',
    decision_date: '2026-07-10', entry_price: 238.34, entry_price_as_of: '2026-07-01', sources: [], source_digest: 'x',
    reader: { status: 'ok', model: 'opus', cost_usd: 0.3, at: null, detail: '' }, items, left_out: [],
    created_at: '2026-07-10T00:00:00Z', ...over,
  }
}
const buy: PlanItem = { kind: 'price', id: 'p-buy', role: 'buy', low: 190, high: 200, currency: 'USD', source: src('Track at $190-200 for re-entry'), note: null }
const bad: PlanItem = { kind: 'price', id: 'p-bad', role: 'bad_case', low: 146, high: null, currency: 'USD', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }
function facts(price: number | null, over: Partial<PriceFacts> = {}): PriceFacts {
  return {
    price, currency: 'USD', as_of: '2026-09-15T15:00:00Z', as_of_is_close: false, stale: false,
    reason: price == null ? 'No price for this listing yet.' : null, day_move_pct: null, market: null, session: '2026-09-15', ...over,
  }
}
const run = (items: PlanItem[], f: PriceFacts, planOver: Partial<WatchPlan> = {}, today = TODAY) =>
  evaluateName({ plan: plan(items, planOver), triggers: [], evals: [], facts: f, today })
const types = (e: ReturnType<typeof run>) => e.conditions.map((c) => c.type)

check('inside the buy range: "In buy zone", urgent', () => {
  const e = run([buy, bad], facts(199.5))
  assert.equal(e.status, 'buy_price_reached')
  assert.equal(e.conditions[0].type, 'buy_price_reached')
  assert.equal(e.conditions[0].urgent, true)
  assert.match(e.conditions[0].detail, /inside/)
  assert.equal(e.conditions[0].quote, 'Track at $190-200 for re-entry')
})

check('within 5% above the line: "Near buy price", not urgent', () => {
  const e = run([buy], facts(205))
  assert.equal(e.status, 'getting_close')
  assert.deepEqual(types(e), ['getting_close'])
  assert.equal(e.conditions[0].urgent, false)
})

check('far away: "Watching", with the signed distance to the line', () => {
  const e = run([buy], facts(230))
  assert.equal(e.status, 'waiting')
  assert.equal(e.conditions.length, 0)
  assert.equal(e.next_line?.gap_pct, -13)
  assert.equal(e.next_line?.label, 'Buy price')
})

check('a big drop of its own that lands near the line is urgent', () => {
  const e = run([buy], facts(205, { day_move_pct: -9, market: { label: 'S&P 500', move_pct: -0.5 } }))
  assert.deepEqual(types(e), ['near_after_big_drop'])
  assert.equal(e.conditions[0].urgent, true)
  assert.equal(e.status, 'getting_close')
  assert.match(e.conditions[0].detail, /S&P 500/)
})

check('a fall the whole market shared is not a big drop', () => {
  const e = run([buy], facts(205, { day_move_pct: -9, market: { label: 'S&P 500', move_pct: -4 } }))
  assert.deepEqual(types(e), ['getting_close'])
})

check('with no market to compare, the raw move counts and the message says so', () => {
  const e = run([buy], facts(205, { day_move_pct: -9, market: null }))
  assert.deepEqual(types(e), ['near_after_big_drop'])
  assert.match(e.conditions[0].detail, /no market comparison/)
})

check('a big drop far from every price: "Sharp drop", not urgent', () => {
  const e = run([buy], facts(230, { day_move_pct: -12, market: { label: 'S&P 500', move_pct: 0.2 } }))
  assert.deepEqual(types(e), ['big_drop'])
  assert.equal(e.conditions[0].urgent, false)
  assert.equal(e.status, 'check_now')
})

check('under the bad case is a Warning, and it leads even beside a buy price', () => {
  const e = run([buy, bad], facts(140))
  assert.equal(e.status, 'warning')
  assert.equal(e.conditions[0].type, 'bad_case_broken')
  assert.ok(types(e).includes('buy_price_reached'))
  assert.match(e.conditions[0].detail, /not a buy signal/)
})

check('a review price reached is "At review price" — never "In buy zone" — and urgent', () => {
  const look: PlanItem = { kind: 'price', id: 'p-look', role: 'look_again', low: 1699, high: null, currency: 'INR', source: src('revisit if price falls toward the ₹1,699 base fair value'), note: null }
  const e = run([look], facts(1666.5, { currency: 'INR' }), { currency: 'INR', listing_key: 'INDIAMART|INR' })
  assert.deepEqual(types(e), ['look_again_reached'])
  assert.equal(e.status, 'check_now')
  assert.equal(e.conditions[0].urgent, true)
  assert.match(e.conditions[0].detail, /not to buy/)
})

check('a fair price reached is only information', () => {
  const fair: PlanItem = { kind: 'price', id: 'p-fair', role: 'fair', low: 133.77, high: null, currency: 'USD', source: src('no margin of safety against the $133.77 base case'), note: null }
  const e = run([fair], facts(130))
  assert.deepEqual(types(e), ['fair_reached'])
  assert.equal(e.conditions[0].urgent, false)
})

check('one price, one instruction: a buy price reached silences a review or fair line at the same price', () => {
  // AMZN's report names "Track at $190-200 for re-entry" AND a "$185–$200" target zone; a model may keep both.
  const zone: PlanItem = { kind: 'price', id: 'p-zone', role: 'look_again', low: 185, high: 200, currency: 'USD', source: src('$185–$200 (at or below the $210 base fair value'), note: null }
  const fair: PlanItem = { kind: 'price', id: 'p-fair', role: 'fair', low: 210, high: null, currency: 'USD', source: src('from base-case fair value $210.'), note: null }
  const e = run([buy, zone, fair], facts(199))
  assert.deepEqual(types(e), ['buy_price_reached'])
  assert.ok(!/not to buy/.test(e.conditions.map((c) => c.detail).join(' ')))
  // Between the buy line and the fair value only the fair line is reached — it must not claim there is no buy price.
  const f = run([buy, fair], facts(205))
  assert.ok(types(f).includes('fair_reached'))
  assert.ok(!/gave no buy price/.test(f.conditions.find((c) => c.type === 'fair_reached')!.detail))
})

check('a buy call is watched for its warnings only — its research lines, dates, drops and age are no longer news', () => {
  const look: PlanItem = { kind: 'price', id: 'p-look', role: 'look_again', low: 200, high: null, currency: 'USD', source: src('revisit toward $200'), note: null }
  const soon: PlanItem = { kind: 'date', id: 'd-soon', label: 'Q3 results', date: '2026-09-16', window: null, what_to_check: null, source: src('results on 2026-09-16') }
  const buyCall = { decision: 'Buy', decision_date: '2026-01-02' }
  const calm = run([buy, look, bad, soon], facts(199, { day_move_pct: -12, market: { label: 'S&P 500', move_pct: 0 } }), buyCall)
  assert.deepEqual(types(calm), [], 'a buy line, a review line, a big drop, a date and old research all stay quiet')
  assert.equal(calm.status, 'waiting')
  const broken = run([buy, bad], facts(140), buyCall)
  assert.deepEqual(types(broken), ['bad_case_broken'])
  assert.equal(broken.status, 'warning')
})

check('a line in one currency is never compared with a price in another', () => {
  const e = run([buy], facts(199.5, { currency: 'CNY' }))
  assert.ok(!types(e).includes('buy_price_reached'))
  assert.equal(e.status, 'cant_check')
  assert.match(e.conditions[0].detail, /exchange rate/)
})

check('no price, or a stale one: "No price", and nothing is checked against it', () => {
  assert.equal(run([buy], facts(null)).status, 'cant_check')
  const stale = run([buy, bad], facts(140, { stale: true }))
  assert.deepEqual(types(stale), ['cant_check'])
})

check('a one-session jump of 40% or more is held, not acted on', () => {
  const e = run([buy, bad], facts(120, { day_move_pct: -45 }))
  assert.deepEqual(types(e), ['cant_check'])
  assert.match(e.conditions[0].detail, /split or a data error/)
})

check('dates: coming up within two trading days; out once passed, if after the research', () => {
  const soon: PlanItem = { kind: 'date', id: 'd-soon', label: 'Q3 results', date: '2026-09-17', window: null, what_to_check: 'AWS margin', source: src('results on 2026-09-17 matter') }
  const out: PlanItem = { kind: 'date', id: 'd-out', label: 'Q2 results', date: '2026-07-31', window: null, what_to_check: null, source: src('July 31 Q2 2026 earnings') }
  const before: PlanItem = { kind: 'date', id: 'd-old', label: 'Q1 results', date: '2026-05-01', window: null, what_to_check: null, source: src('the 2026-05-01 print') }
  const deal: PlanItem = { kind: 'deal_breaker', id: 'k1', text: 'AWS margin under 30%', check_where: null, source: { file: 'decision_record.json', quote: null, field: 'kill_criteria[0]' } }
  const e = run([soon, out, before, deal], facts(230))
  assert.deepEqual(types(e).sort(), ['coming_up', 'results_out'])
  const res = e.conditions.find((c) => c.type === 'results_out')!
  assert.deepEqual(res.checklist, ['AWS margin under 30%'], "the research's tests travel as a list, apart from the detail")
  assert.doesNotMatch(res.detail, /AWS margin/)
  assert.equal(e.next_date?.date, '2026-09-17')
})

check('a day the research only estimates says "expected", before and after', () => {
  const soon: PlanItem = { kind: 'date', id: 'd-est', label: 'Q2 FY27 results', date: '2026-09-17', window: '~17-Sep-2026', estimated: true, what_to_check: null, source: src('results CIQ-modeled at ~17-Sep-2026') }
  const gone: PlanItem = { kind: 'date', id: 'd-gone', label: 'Q2 2026 print', date: '2026-08-10', window: 'est. 10 Aug', estimated: true, what_to_check: null, source: src('Track the Q2 2026 print (est. 10 Aug) for the Dubai demand signal') }
  const e = run([soon, gone], facts(230))
  const up = e.conditions.find((c) => c.type === 'coming_up')!
  assert.match(up.title, /\(expected\)$/)
  assert.match(up.detail, /expected 17-Sep-2026/)
  const out = e.conditions.find((c) => c.type === 'results_out')!
  assert.equal(out.title, 'Q2 2026 print: the expected date has passed')
  assert.match(out.detail, /was expected 10 Aug/)
  assert.equal(e.next_date?.estimated, true)
  // An estimated day with no window words of its own (UBER: "estimated November 3, 2026") still says expected.
  const quoted: PlanItem = { kind: 'date', id: 'd-q', label: 'Q3 FY2026 earnings', date: '2026-09-16', window: null, estimated: true, what_to_check: null, source: src('Q3 FY2026 earnings, estimated September 16, 2026') }
  assert.match(run([quoted], facts(230)).conditions.find((c) => c.type === 'coming_up')!.detail, /expected 2026-09-16/)
})

check('research older than 90 days is "Research old"', () => {
  const e = run([buy], facts(230), { decision_date: '2026-06-01' })
  assert.deepEqual(types(e), ['research_old'])
})

check('your own triggers: your price reached is urgent; your date is information', () => {
  const quote: LiveQuote = { ticker: 'V', symbol: 'V', name: 'Visa', exchange: 'NYSE', currency: 'USD', price: 49, as_of: '2026-09-15T15:00:00Z', as_of_is_close: false, delayed: true, source: 'cnbc', stale: false }
  const triggers: WatchTrigger[] = [
    { kind: 'price_level', trigger_id: 'T1', direction: 'at_or_below', level: 50, currency: 'USD' },
    { kind: 'event_date', trigger_id: 'T2', due_date: '2026-09-14', label: 'Look again' },
  ]
  const evals = triggers.map((tr) => evaluateTrigger(tr, { quote, quoteReason: null, today: TODAY }))
  const e = evaluateName({ plan: null, triggers, evals, facts: facts(49), today: TODAY })
  const byType = new Map(e.conditions.map((c) => [c.type, c]))
  assert.equal(byType.get('your_level_reached')?.urgent, true)
  assert.equal(byType.get('your_date_due')?.urgent, false)
})

check('the fixed urgent list — exactly the crossed lines, nothing else', () => {
  assert.deepEqual([...URGENT_CONDITIONS].sort(), ['bad_case_broken', 'buy_price_reached', 'look_again_reached', 'near_after_big_drop', 'your_level_reached'])
  const informational = Object.keys(CONDITION_STATUS).filter((k) => !URGENT_CONDITIONS.has(k as any)).sort()
  assert.deepEqual(informational, ['big_drop', 'cant_check', 'coming_up', 'fair_reached', 'getting_close', 'research_old', 'results_out', 'your_date_coming', 'your_date_due'])
})

check('trading days skip weekends', () => {
  assert.equal(tradingDaysUntil('2026-09-18', '2026-09-22'), 2)
  assert.equal(tradingDaysUntil(TODAY, TODAY), 0)
  assert.equal(tradingDaysUntil(TODAY, '2026-09-14'), -1)
})

check('a weekend date seen on the Friday before is not "today"', () => {
  const agm: PlanItem = { kind: 'date', id: 'd-agm', label: 'FY2026 AGM', date: '2026-09-19', window: null, what_to_check: null, source: src('the AGM on 2026-09-19') }
  const friday = run([agm], facts(230), {}, '2026-09-18')
  assert.equal(friday.conditions.find((c) => c.type === 'coming_up')!.title, 'FY2026 AGM in 1 day')
  const saturday = run([agm], facts(230), {}, '2026-09-19')
  assert.equal(saturday.conditions.find((c) => c.type === 'coming_up')!.title, 'FY2026 AGM — today')
})

check('your own at-or-above price is marked as reached by a rise, so it re-arms the other way', () => {
  const quote: LiveQuote = { ticker: 'V', symbol: 'V', name: 'Visa', exchange: 'NYSE', currency: 'USD', price: 401, as_of: '2026-09-15T15:00:00Z', as_of_is_close: false, delayed: true, source: 'cnbc', stale: false }
  const triggers: WatchTrigger[] = [{ kind: 'price_level', trigger_id: 'T1', direction: 'at_or_above', level: 400, currency: 'USD' }]
  const evals = triggers.map((tr) => evaluateTrigger(tr, { quote, quoteReason: null, today: TODAY }))
  const e = evaluateName({ plan: null, triggers, evals, facts: facts(401), today: TODAY })
  const c = e.conditions.find((x) => x.type === 'your_level_reached')!
  assert.equal(c.rises, true)
  assert.equal(c.line, 400)
})

check('a catalyst on the research day stays eligible after that day passes', () => {
  const date: PlanItem = { kind: 'date', id: 'same-day', label: 'Results', date: TODAY, window: null,
    what_to_check: null, source: src('Results on 2026-09-15') }
  assert.ok(types(run([date], facts(100), { decision_date: TODAY })).includes('coming_up'))
  assert.ok(types(run([date], facts(100), { decision_date: TODAY }, '2026-09-16')).includes('results_out'))
  assert.ok(!types(run([date], facts(100), { decision_date: '2026-09-16' }, '2026-09-16')).includes('results_out'))
})

check('date-only research and manual triggers remain checkable without a quote', () => {
  const date: PlanItem = { kind: 'date', id: 'd-only', label: 'Results', date: TODAY, window: null,
    what_to_check: null, source: src('Results on 2026-09-15') }
  for (const stale of [false, true]) {
    const ev = run([date], facts(null, { stale }))
    assert.ok(!types(ev).includes('cant_check'))
    assert.equal(ev.status, 'coming_up')
  }
  const trigger: WatchTrigger = { kind: 'event_date', trigger_id: 'manual-date', due_date: TODAY, label: 'Meeting', acknowledged_at: null }
  const ev = evaluateName({ plan: null, triggers: [trigger], evals: [evaluateTrigger(trigger, { quote: null, quoteReason: 'unknown_symbol', today: TODAY })], facts: facts(null), today: TODAY })
  assert.ok(!ev.conditions.some((c) => c.type === 'cant_check'))
  assert.ok(types(run([buy], facts(null))).includes('cant_check'), 'price-dependent plans still warn')
})

check('editing a manual threshold changes its message identity within a grouping window', () => {
  const trigger: WatchTrigger = { kind: 'price_level', trigger_id: 'editable', direction: 'at_or_below', level: 100, currency: 'USD' }
  const quote: LiveQuote = { ticker: 'A', symbol: 'A', name: 'A', exchange: 'NYSE', currency: 'USD', price: 89,
    as_of: '2026-09-15T15:00:00Z', as_of_is_close: false, delayed: false, source: 'cnbc', stale: false }
  const evalFor = (t: WatchTrigger) => evaluateName({ plan: null, triggers: [t],
    evals: [evaluateTrigger(t, { quote, quoteReason: null, today: TODAY })], facts: facts(89), today: TODAY })
  const old = evalFor(trigger).conditions.find((c) => c.type === 'your_level_reached')!
  const edited = evalFor({ ...trigger, level: 90 }).conditions.find((c) => c.type === 'your_level_reached')!
  assert.notEqual(old.id, edited.id, 'grouping cannot discard the edited crossing as a duplicate item')
})

check('a passed date you have seen stops speaking for the name, and stays on it', () => {
  // Five of ten names on the live list sat in "Needs you" for ever: a date that has passed cannot pass again,
  // and research written in June only gets younger by being re-run. Saying "seen it" does not make either
  // untrue — it stops them deciding the status.
  const past: PlanItem = { kind: 'date', id: 'd-past', label: 'FQ1 earnings', date: '2026-09-04', window: null, estimated: false, what_to_check: null, source: src('FQ1 FY2027 earnings release on 2026-09-04') }
  const later: PlanItem = { kind: 'date', id: 'd-later', label: 'Proxy filed', date: '2026-09-10', window: null, estimated: false, what_to_check: null, source: src('the 2026 DEF 14A, due 2026-09-10') }
  const input = { plan: plan([past, later]), triggers: [], evals: [], facts: facts(210), today: TODAY }
  const before = evaluateName(input)
  assert.equal(before.status, 'check_now')
  assert.deepEqual(before.conditions.map((c) => [c.id, c.can_ack, c.seen_at]),
    [['results_out:d-past', true, null], ['results_out:d-later', true, null]])

  // Seeing ONE leaves the other speaking.
  const one = evaluateName({ ...input, seen: { 'results_out:d-past': '2026-09-15T09:00:00Z' } })
  assert.equal(one.status, 'check_now')
  assert.match(one.headline!, /Proxy filed/, 'the headline is the condition still unseen')
  assert.equal(one.conditions.length, 2, 'and the seen one is still on the name')
  assert.equal(one.conditions.find((c) => c.id === 'results_out:d-past')!.seen_at, '2026-09-15T09:00:00Z')

  // Seeing both leaves the name watching again.
  const both = evaluateName({ ...input, seen: { 'results_out:d-past': 'x', 'results_out:d-later': 'y' } })
  assert.equal(both.status, 'waiting')
  assert.equal(both.headline, null)
  assert.equal(both.conditions.length, 2, 'nothing was hidden — only silenced')
})

check('a price condition can never be acknowledged — it clears itself when the price moves', () => {
  const e = evaluateName({ plan: plan([buy, bad]), triggers: [], evals: [], facts: facts(195), today: TODAY,
    seen: { 'buy_price_reached:p-buy': '2026-09-15T09:00:00Z' } })
  const buyCond = e.conditions.find((c) => c.type === 'buy_price_reached')!
  assert.equal(buyCond.can_ack, false)
  assert.equal(buyCond.seen_at, null, 'a seen mark on a self-clearing condition is ignored')
  assert.equal(e.status, 'buy_price_reached', 'so it still speaks for the name')
})

check('a date window is used only where it reads as one', () => {
  // Verbatim from the live list: the report's own window is a table row and a sentence about consensus, and
  // "X was expected <window>" printed them as the date.
  assert.equal(datePhrase('~21-Oct-2026'), '21-Oct-2026')
  assert.equal(datePhrase('late October 2026'), 'late October 2026')
  assert.equal(datePhrase('| ~21-Oct-2026 (CIQ-modeled estimate, no board-meeting intimation filed) |'), null)
  assert.equal(datePhrase('The nearest dated, evidenced catalyst window'), null)
  assert.equal(datePhrase('FY2026 EPS consensus (CNY 2.13 as of 2026-09-01)'), null)
  const prose: PlanItem = { kind: 'date', id: 'd-prose', label: 'H1 2026 interim results', date: '2026-09-10', window: 'The nearest dated, evidenced catalyst window', estimated: true, what_to_check: null, source: src('H1 2026 interim results, expected around 2026-09-10') }
  const e = evaluateName({ plan: plan([prose]), triggers: [], evals: [], facts: facts(210), today: TODAY })
  assert.equal(e.conditions[0]!.detail, 'H1 2026 interim results was expected 2026-09-10, and no research has run since.')
})

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
