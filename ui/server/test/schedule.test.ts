// Tests for the FORWARD-EVENT overlay (news/schedule.ts) + its feed-filter wiring. The whole point is
// telling a FORWARD, scheduled-event announcement ("board to meet on Oct 28 to consider results", "notice
// of AGM", "ex-dividend date") apart from the event itself ("reported Q3 results") — so results_date /
// index_change anchor on scheduling language, while the inherently-forward nouns (ex-dividend, lock-up,
// AGM, investor day) are safe on their own.
import assert from 'node:assert'
import { deriveScheduledEvents, SCHEDULED_EVENTS, SCHEDULED_EVENT_ORDER, scheduledEventLabel } from '../src/news/schedule'
import { matchesFeedFilters, parseFeedFilterQuery, hasAnyFilter } from '../src/news/feed-filter'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e) { console.error(`  ✗   ${name}\n      ${(e as Error).message}`); process.exitCode = 1 }
}
const sched = (headline: string, headline_en?: string) => deriveScheduledEvents({ headline, headline_en })

// ---- flags the forward events ----
check('flags the scheduled/forward corporate events', () => {
  assert.ok(sched('Reliance to report Q2 results on Oct 28').includes('results_date'))
  assert.ok(sched('Infosys board meeting to consider and approve the quarterly financial results').includes('results_date'))
  assert.ok(sched('Acme Corp issues notice of AGM for June 15').includes('shareholder_meeting'))
  assert.ok(sched('Widgets Inc goes ex-dividend on Friday; record date Thursday').includes('ex_dividend'))
  assert.ok(sched('MegaTech to host capital markets day next month').includes('investor_day'))
  assert.ok(sched('180-day lock-up period expires next week for the IPO').includes('lockup_expiry'))
  assert.ok(sched('Stock to join the S&P 500 effective before the open Monday').includes('index_change'))
})

// ---- the hard part: a PAST event must NOT be flagged as a forward date ----
check('a past-tense report is NOT flagged as a forward results date', () => {
  assert.deepEqual(sched('Reliance reported Q2 results, profit up 12%'), [], 'a past results print is not a forward "results date"')
  assert.deepEqual(sched('Company posted record annual profit'), [], 'a results recap is not a scheduled event')
  // but the scheduling framing IS caught
  assert.ok(sched('Company to report earnings after the close').includes('results_date'))
})

// ---- multilabel + empty + order-stable + foreign-language ----
check('multilabel, empty, order-stable, and foreign-language via the translation', () => {
  const t = sched('AGM notice: ex-dividend date and results date all announced')
  assert.ok(t.includes('results_date') && t.includes('shareholder_meeting') && t.includes('ex_dividend'))
  assert.deepEqual(t, SCHEDULED_EVENT_ORDER.filter((k) => t.includes(k)), 'order follows SCHEDULED_EVENT_ORDER')
  assert.deepEqual(sched('Retailer opens 20 new stores this quarter'), [])
  assert.ok(sched('Hauptversammlung am 15. Juni', 'Annual general meeting on June 15').includes('shareholder_meeting'))
})

// ---- metadata integrity ----
check('every kind has a def + label; ORDER is complete and unique', () => {
  assert.equal(SCHEDULED_EVENT_ORDER.length, Object.keys(SCHEDULED_EVENTS).length)
  assert.equal(new Set(SCHEDULED_EVENT_ORDER).size, SCHEDULED_EVENT_ORDER.length)
  for (const id of SCHEDULED_EVENT_ORDER) {
    assert.ok(SCHEDULED_EVENTS[id] && SCHEDULED_EVENTS[id].label && SCHEDULED_EVENTS[id].meaning)
    assert.equal(scheduledEventLabel(id), SCHEDULED_EVENTS[id].label)
  }
  assert.equal(scheduledEventLabel('nope'), 'nope', 'unknown id falls back to itself')
})

// ---- filter wiring ----
check('the feed filter matches, parses, and flags the scheduledEvents dimension', () => {
  const it = { headline: 'Board to consider results on October 28', event_types: [], companies: [] } as unknown as FeedItem
  assert.ok(matchesFeedFilters(it, { scheduledEvents: ['results_date'] }), 'a results-date item matches the filter (lazy derive, no it.scheduled_events)')
  assert.ok(!matchesFeedFilters(it, { scheduledEvents: ['ex_dividend'] }), 'the same item does NOT match ex_dividend')
  assert.deepEqual(parseFeedFilterQuery({ scheduledEvents: 'Results_Date, ex_dividend ' }).scheduledEvents, ['results_date', 'ex_dividend'])
  assert.equal(parseFeedFilterQuery({}).scheduledEvents, undefined)
  assert.ok(hasAnyFilter({ scheduledEvents: ['results_date'] }))
  assert.ok(!hasAnyFilter({ scheduledEvents: [] }))
})

console.log(`\n${passed} checks passed`)
