// The armed watchlist's words as the screen shows them (watchStatus.ts). What must hold: the server's word is
// used only when it is one of the seven (an older engine never gets a guessed word, and never "Buy price
// reached"), the list orders most urgent first without shuffling, and a distance or an email outcome is
// said in words rather than left as a sign or a code to decode.
// Run: npx tsx src/lib/watchStatus.test.ts
import assert from 'node:assert/strict'
import type { WatchMessage, WatchRow } from './types'
import { dateParts, dateWords, emailWords, gapWords, priceItemText, rowStatus, sortRows, waitingParts } from './watchStatus'

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

check("the server's word is used only when it is one of the seven", () => {
  assert.equal(rowStatus(row('A', { watch: watch('buy_price_reached') })), 'buy_price_reached')
  assert.equal(rowStatus(row('A', { watch: watch('bogus'), state: 'armed' })), 'waiting')
})

check('without the server\'s word, a met trigger is "Check now" — never "Buy price reached"', () => {
  assert.equal(rowStatus(row('A', { state: 'condition_met' })), 'check_now')
  assert.equal(rowStatus(row('A', { state: 'due' })), 'check_now')
  assert.equal(rowStatus(row('A', { state: 'not_evaluable' })), 'cant_check')
  assert.equal(rowStatus(row('A')), 'waiting')
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

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
