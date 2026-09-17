// The armed watchlist's words as the screen shows them (watchStatus.ts). What must hold: a name's signal says
// what happened in plain words, in a colour that always means the same thing (red danger, green a buy, amber
// look at this, blue a heads-up, grey nothing to do); an older engine never gets a guessed buy; the list orders
// most urgent first without shuffling; and a distance or an email outcome is said in words rather than left as
// a sign or a code to decode.
// Run: npx tsx src/lib/watchStatus.test.ts
import assert from 'node:assert/strict'
import type { WatchMessage, WatchRow } from './types'
import { shortDay } from './format'
import { dateParts, dateWords, emailWords, gapWords, hasResearchPrice, messageSignal, priceItemText, quoteNote, rowSignal, rowStatus, shortDate, sortRows, waitingParts } from './watchStatus'

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

const row = (ticker: string, over: Partial<WatchRow> = {}): WatchRow => ({
  listing_key: `${ticker}|USD`, ticker, company_name: null, currency: 'USD', exchange: null, origin: 'engine', entry_id: null,
  why: '', conviction: null, review_date: null, tags: [], triggers: [], attachments: [], assignee: null, task_id: null,
  engine: null, resurfaced: false, archive: null, quote: null, quote_reason: null, evals: [], state: 'watching',
  nearest_gap_pct: null, run_root: null, final_thesis_path: null, added_at: null, updated_at: null, engine_since: null,
  ...over,
})
const watch = (status: any, gap: number | null = null): WatchRow['watch'] => ({
  status, status_label: '', headline: null, conditions: [],
  next_line: gap == null ? null : { role: 'buy', label: 'Buy price', text: 'USD 190–200', gap_pct: gap },
  next_date: null, day_move_pct: null, market: null, plan: null, email_paused: false, unread: 0,
})
const pick = (s: { label: string; tone: string }) => [s.label, s.tone]

check("the server's word is used only when it is one of the seven", () => {
  assert.equal(rowStatus(row('A', { watch: watch('buy_price_reached') })), 'buy_price_reached')
  assert.equal(rowStatus(row('A', { watch: watch('bogus'), state: 'armed' })), 'waiting')
})

check('without the server\'s word, a met trigger needs a look — never a buy it did not earn', () => {
  assert.equal(rowStatus(row('A', { state: 'condition_met' })), 'check_now')
  assert.equal(rowStatus(row('A', { state: 'due' })), 'check_now')
  assert.equal(rowStatus(row('A', { state: 'not_evaluable' })), 'cant_check')
  assert.equal(rowStatus(row('A')), 'waiting')
})

check('a signal says what happened, in a colour that always means the same', () => {
  const lead = (type: string, status: string, title = '') => row('A', {
    watch: { ...watch(status)!, conditions: [{ id: type, type, urgent: false, title, detail: '', quote: null, source: null }] },
  })
  assert.deepEqual(pick(rowSignal(lead('bad_case_broken', 'warning'))), ['Below bad case', 'red'])
  assert.deepEqual(pick(rowSignal(lead('buy_price_reached', 'buy_price_reached'))), ['In buy zone', 'green'])
  assert.deepEqual(pick(rowSignal(lead('getting_close', 'getting_close', 'Near its buy price'))), ['Near buy price', 'amber'])
  assert.deepEqual(pick(rowSignal(lead('getting_close', 'getting_close', 'Near its review price'))), ['Near review price', 'amber'])
  assert.deepEqual(pick(rowSignal(lead('getting_close', 'getting_close', 'Getting close to its look-again price'))), ['Near review price', 'amber'], "an older engine's words")
  assert.deepEqual(pick(rowSignal(lead('look_again_reached', 'check_now'))), ['At review price', 'amber'])
  assert.deepEqual(pick(rowSignal(lead('results_out', 'check_now'))), ['Event passed', 'amber'])
  assert.deepEqual(pick(rowSignal(lead('coming_up', 'coming_up'))), ['Event soon', 'blue'])
  assert.deepEqual(pick(rowSignal(lead('cant_check', 'cant_check'))), ['No price', 'off'])
  assert.deepEqual(pick(rowSignal(row('A', { watch: watch('waiting') }))), ['Watching', 'grey'])
})

check('one spelling of a date, and an instant is the reader\'s own day', () => {
  // shortDate used to format on its own ("16 Sept") beside shortDay ("16 Sep") — the same month two ways in
  // one panel, and one heading that switched between them depending on which field carried the date.
  assert.equal(shortDate('2026-09-16'), shortDay('2026-09-16'))
  assert.equal(shortDate('2026-09-16'), '16 Sep')
  // An instant is not a day until a timezone says so. Formatted in UTC, an acknowledgement made at 02:00 IST
  // read as the day before for the person who made it.
  const iso = new Date(2026, 8, 17, 2, 0, 0).toISOString()
  assert.equal(shortDay(iso), '17 Sep', 'the day the reader was on when they clicked')
  assert.equal(shortDay('not a date'), 'not a date', 'and anything unparseable comes back untouched')
})

check('a condition you have seen stops speaking for the name, and the next live one takes over', () => {
  const cond = (type: string, seen_at: string | null) => ({ id: type, type, urgent: false, title: '', detail: '', quote: null, source: null, can_ack: true, seen_at })
  // Caught in the live preview: BG's only condition was acknowledged, the server moved it to 'waiting' and the
  // list sorted it with the quiet names — while its chip still read "Research old" over the Watching group.
  const seen = row('A', { watch: { ...watch('waiting')!, conditions: [cond('research_old', '2026-09-17T09:15:48Z')] } })
  assert.deepEqual(pick(rowSignal(seen)), ['Watching', 'grey'], 'the chip agrees with the group the name sits in')
  const both = row('A', { watch: { ...watch('check_now')!, conditions: [cond('research_old', '2026-09-17T09:15:48Z'), cond('results_out', null)] } })
  assert.deepEqual(pick(rowSignal(both)), ['Event passed', 'amber'], 'and names whatever is still unanswered')
})

check('"near" names the line its plan item is, whatever the words say', () => {
  const r = row('A', {
    watch: {
      ...watch('getting_close')!,
      conditions: [{ id: 'getting_close:p-look', type: 'getting_close', urgent: false, title: 'Near a line', detail: '', quote: null, source: null }],
      plan: {
        state: 'ready', detail: '', run_root: 'analyses/A_2026-09-10', decision: 'Watchlist', decision_date: '2026-09-10', left_out: [], reader: null,
        items: [{ kind: 'price', id: 'p-look', role: 'look_again', low: 70, high: 82, currency: 'NOK', source: { file: 'f', quote: null, field: null }, note: null }],
      },
    },
  })
  assert.deepEqual(pick(rowSignal(r)), ['Near review price', 'amber'])
})

check('an engine that sends no conditions still gets an honest signal — never a buy it did not earn', () => {
  assert.deepEqual(pick(rowSignal(row('A', { state: 'condition_met' }))), ['Needs a look', 'amber'])
  assert.deepEqual(pick(rowSignal(row('A', { state: 'not_evaluable' }))), ['No price', 'off'])
  assert.deepEqual(pick(rowSignal(row('A'))), ['Watching', 'grey'])
})

check("a message's signal is its leading item's; the first-day summary is a summary", () => {
  const msg = (kind: WatchMessage['kind'], type: string, title: string): WatchMessage => ({
    id: 'WM-1', kind, listing_key: 'A|USD', ticker: 'A', company_name: null, status: null, title, urgent: false,
    items: [{ id: 'i', type, urgent: false, title, detail: '', quote: null, source: null, at: '' }],
    created_at: '', updated_at: '', read_at: null, read_by: null, deleted_at: null, feedback: null,
    email: { state: 'not_urgent', sent_items: [], attempts: 0, last_attempt_at: null, sent_at: null, detail: '' },
  })
  assert.deepEqual(pick(messageSignal(msg('name', 'research_buy_now', 'Research says buy now'))), ['Research says buy', 'green'])
  assert.deepEqual(pick(messageSignal(msg('name', 'getting_close', 'Near its buy price'))), ['Near buy price', 'amber'])
  assert.deepEqual(pick(messageSignal(msg('name', 'getting_close', 'Getting close to its look-again price'))), ['Near review price', 'amber'], 'a message kept from before the rename')
  assert.deepEqual(pick(messageSignal(msg('name', 'bad_case_broken', 'Fell under its bad case'))), ['Below bad case', 'red'])
  assert.deepEqual(pick(messageSignal(msg('summary', 'already_there', 'Switched on'))), ['Summary', 'grey'])
})

check('most urgent first, then nearest its line, then by ticker', () => {
  const rows = [
    row('ZZZ', { watch: watch('waiting', -3) }),
    row('BBB', { watch: watch('check_now') }),
    row('AAA', { watch: watch('waiting', -20) }),
    row('WWW', { watch: watch('warning') }),
    row('CCC', { watch: watch('waiting', -3) }),
  ]
  assert.deepEqual(sortRows(rows).map((r) => r.ticker), ['WWW', 'BBB', 'CCC', 'ZZZ', 'AAA'])
})

check('a distance is said in words, never left as a sign', () => {
  assert.equal(gapWords(-4.23), 'must fall 4.2%')
  assert.equal(gapWords(0), 'at it')
  assert.equal(gapWords(3), '3% under it')
  assert.equal(gapWords(null), null)
  assert.equal(gapWords(Number.NaN), null)
})

check('what a name waits for, and when its next date is — each a label and the value that answers it', () => {
  assert.deepEqual(waitingParts(row('A', { watch: watch('waiting', -13) })), { label: 'Buy price', value: 'USD 190–200 · must fall 13%' })
  assert.equal(waitingParts(row('A')), null)
  const buyCall = row('A', { watch: { ...watch('waiting')!, plan: { state: 'ready', detail: '', run_root: 'analyses/A_2026-09-10', decision: 'Buy', decision_date: '2026-09-10', items: [], left_out: [], reader: null } } })
  assert.deepEqual(waitingParts(buyCall), { label: 'Research says buy', value: 'only its warnings are watched' })
  assert.deepEqual(dateParts({ label: 'Q2 FY27 results', date: '2026-10-21', days_to: 36, estimated: true }), { label: 'Q2 FY27 results', value: '~21 Oct · in 36 days' })
  assert.equal(dateParts(null), null)
  assert.equal(dateWords({ label: 'Q3 results', date: '2026-11-03', days_to: 0 }), 'Q3 results · 3 Nov · today')
  assert.equal(dateWords({ label: 'Q3 results', date: '2026-11-03', days_to: 12 }), 'Q3 results · 3 Nov · in 12 days')
  assert.equal(dateWords({ label: 'Q2 FY27 results', date: '2026-10-21', days_to: 36, estimated: true }), 'Q2 FY27 results · ~21 Oct · in 36 days', 'an estimated day is marked, as the research wrote it')
})

check('a price range keeps its currency and an en dash', () => {
  assert.equal(priceItemText({ kind: 'price', id: 'x', role: 'look_again', low: 70, high: 82, currency: 'NOK', source: { file: 'f', quote: null, field: null }, note: null }), 'NOK 70–82')
  assert.equal(priceItemText({ kind: 'price', id: 'y', role: 'look_again', low: 1699, high: null, currency: 'INR', source: { file: 'f', quote: null, field: null }, note: null }), 'INR 1,699')
})

check('every email outcome says why, including the messages never emailed', () => {
  const m = (state: WatchMessage['email']['state'], detail = ''): WatchMessage => ({
    id: 'WM-1', kind: 'name', listing_key: 'A|USD', ticker: 'A', company_name: null, status: 'check_now', title: 't', urgent: false,
    items: [], created_at: '', updated_at: '', read_at: null, read_by: null, deleted_at: null, feedback: null,
    email: { state, sent_items: [], attempts: 0, last_attempt_at: null, sent_at: null, detail },
  })
  assert.equal(emailWords(m('not_urgent')), 'Not emailed — only urgent messages are')
  assert.equal(emailWords(m('off')), 'Not emailed — email is not set up')
  assert.equal(emailWords(m('paused')), 'Not emailed — email is paused for this name')
  assert.equal(emailWords(m('skipped', 'Read in the cockpit before it was emailed.')), 'Not emailed — read in the cockpit before it was emailed')
  assert.match(emailWords(m('failed', 'HTTP 500')), /HTTP 500/)
})

check('a price always says how fresh it is', () => {
  assert.equal(quoteNote({ as_of_is_close: false, delayed: true, stale: false }, -2.1), '−2.1% today · delayed')
  assert.equal(quoteNote({ as_of_is_close: true, delayed: false, stale: false }, null), 'last close')
  assert.equal(quoteNote({ as_of_is_close: false, delayed: false, stale: true }, 3), 'price now · not current', 'a stale price never shows a move')
})

check('a ready plan without an action price keeps scenario targets available', () => {
  const p: any = { state: 'ready', items: [] }
  assert.equal(hasResearchPrice(null), false)
  assert.equal(hasResearchPrice(p), false)
  p.items = [{ kind: 'date' }, { kind: 'deal_breaker' }, { kind: 'price', role: 'bad_case' }]
  assert.equal(hasResearchPrice(p), false)
  for (const role of ['buy', 'look_again', 'fair']) {
    assert.equal(hasResearchPrice({ ...p, items: [{ kind: 'price', role }] } as any), true)
  }
})

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
