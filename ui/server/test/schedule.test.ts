// Tests for the FORWARD-EVENT overlay (news/schedule.ts) + its feed-filter wiring. The whole point is
// telling a FORWARD, scheduled-event announcement ("board to meet on Oct 28 to consider results", "notice
// of AGM", "ex-dividend date") apart from the event itself ("reported Q3 results") — so results_date /
// index_change anchor on scheduling language, while the inherently-forward nouns (ex-dividend, lock-up,
// AGM, investor day) are safe on their own.
import assert from 'node:assert'
import {
  deriveScheduledEventEvidence, deriveScheduledEvents, SCHEDULED_EVENTS, SCHEDULED_EVENT_ORDER, scheduledEventLabel,
} from '../src/news/schedule'
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

check('dated catalyst evidence is source-bound, complete, valid, and translation cannot invent its date', () => {
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon to report earnings on August 6, 2026' }),
    ['results_date on 2026-08-06'],
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon earnings date for Q2 2026 is August 6, 2026' }),
    ['results_date on 2026-08-06'],
    'a complete calendar day outranks the reporting quarter for the same event',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon earnings date for Q2 2026 on 2026-08-06' }),
    ['results_date on 2026-08-06'],
    'an ISO calendar day also outranks the reporting quarter for the same event',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon earnings date for Q2 2026 is August 6, 2026, AGM announced' }),
    ['results_date on 2026-08-06'],
    'an adjacent undated event cannot steal the exact day or inherit the leftover quarter',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon earnings date for Q2 2026, AGM on August 6, 2026' }),
    ['results_date on Q2 2026', 'shareholder_meeting on 2026-08-06'],
    'a separately dated adjacent event keeps its own exact day',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Acme AGM scheduled for 06/08/2026' }),
    ['shareholder_meeting on 06/08/2026'],
  )
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon to report earnings after the close' }), [], 'a category is not a date')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon to report earnings on 2026-02-30' }), [], 'an impossible date is rejected')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon says no earnings date within 30 days' }), [], 'a negated window is rejected')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon to report earnings tomorrow' }), [], 'an unanchored relative window is not timeless evidence')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon to report earnings in 2 days' }), [], 'a numeric relative window is not persisted without a source-time anchor')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon to report earnings on 2026-09-09 cancelled' }), [], 'a trailing cancellation invalidates the date')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09 postponed' }), [], 'a trailing postponement invalidates the date')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09 but later cancelled' }), [], 'a trailing status clause invalidates the date')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09; later cancelled' }), [], 'a semicolon cannot hide an immediate cancellation')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09. The event was cancelled' }), [], 'a period cannot hide an immediate cancellation')
  assert.deepEqual(deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09. It has since been postponed' }), [], 'an immediate cross-sentence postponement invalidates the date')
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon AGM on 2026-09-09; Investor day on 2026-10-10 cancelled' }),
    ['shareholder_meeting on 2026-09-09'],
    'a separately named cancelled event cannot invalidate the prior live event',
  )
  for (const headline of [
    'Amazon AGM on 2026-09-09 has since been postponed',
    'Amazon AGM on 2026-09-09 will be postponed',
    'Amazon AGM on 2026-09-09 was rescheduled',
    'Amazon AGM on 2026-09-09 moved to 2026-10-10',
    'Amazon AGM cancellation on 2026-09-09',
    'Amazon postpones AGM scheduled for 2026-09-09',
    'Amazon delays AGM from 2026-09-09',
    'Amazon reschedules AGM previously set for 2026-09-09',
    'Amazon withdraws notice of AGM for 2026-09-09',
    'Amazon moved AGM from 2026-09-09',
    'Amazon moved the AGM from 2026-09-09',
    'Amazon moves its AGM from 2026-09-09',
    'Amazon moved AGM from 2026-09-09 to 2026-10-10',
    'Amazon AGM shifted from 2026-09-09',
    'Amazon defers AGM scheduled for 2026-09-09',
    'Amazon AGM on 2026-09-09 pushed back',
    'Amazon AGM on 2026-09-09 pushed-back',
    'Amazon puts off AGM scheduled for 2026-09-09',
    'Amazon puts-off AGM scheduled for 2026-09-09',
    'Amazon AGM on 2026-09-09 adjourned',
    'Amazon scraps AGM scheduled for 2026-09-09',
    'Amazon AGM on 2026-09-09 suspended',
    'Amazon AGM on 2026-09-09 called-off',
    'Amazon denies AGM on 2026-09-09',
    'Amazon denied the AGM would be held on 2026-09-09',
    'Amazon rules out AGM on 2026-09-09',
    'Amazon ruled out AGM on 2026-09-09',
    'Amazon changes AGM date from 2026-09-09 to 2026-10-10',
    'Amazon AGM date changed from 2026-09-09 to 2026-10-10',
    'Amazon revises AGM date from 2026-09-09 to 2026-10-10',
    'Amazon AGM date revised from 2026-09-09 to 2026-10-10',
    'Amazon may hold AGM on 2026-09-09',
    'Amazon might hold AGM on 2026-09-09',
    'Amazon could hold AGM on 2026-09-09',
    'Amazon will possibly hold AGM on 2026-09-09',
    'Amazon potentially holds AGM on 2026-09-09',
    'Amazon tentative AGM on 2026-09-09',
    'Amazon AGM date unconfirmed for 2026-09-09',
    'Amazon AGM on 2026-09-09?',
    'Amazon AGM on 2026-09-09？',
  ]) {
    assert.deepEqual(
      deriveScheduledEventEvidence({ headline }),
      [],
      `${headline}: a revised, cancelled, delayed, or withdrawn schedule is not a live catalyst`,
    )
  }
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon AGM scheduled for 2026-09-09' }),
    ['shareholder_meeting on 2026-09-09'],
    'an unrevised schedule remains valid',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon AGM scheduled for 2026/09/09' }),
    ['shareholder_meeting on 2026-09-09'],
    'a complete year-first slash date is normalized without losing its source-bound catalyst',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'S&P announces index constituent changes effective September 20, 2026' }),
    ['index_change on 2026-09-20'],
    'ordinary index-change wording is not mistaken for a schedule revision',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Acme index change effective on September 8, 2026' }),
    ['index_change on 2026-09-08'],
    'the explicit singular index-change term remains source-bound dated evidence',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Company held AGM and set analyst target price for September 30, 2026' }),
    [],
    'a completed AGM cannot steal an unrelated analyst-target date later in the same clause',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Company will hold AGM on September 30, 2026' }),
    ['shareholder_meeting on 2026-09-30'],
    'the past-event guard retains an explicitly forward AGM',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Acme moves ex-dividend on September 20, 2026' }),
    ['ex_dividend on 2026-09-20'],
    'ordinary forward-event use of moves is not mistaken for retiming',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'S&P moves index rebalance from September 20, 2026 to October 1, 2026' }),
    [],
    'an explicit move from one complete date to another remains a rejected revision',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon AGM scheduled for 2026-09-09. Investor day on 2026-10-10' }),
    ['shareholder_meeting on 2026-09-09', 'investor_day on 2026-10-10'],
    'separate unrevised clauses keep their own live dates',
  )
  for (const headline of [
    'Amazon denies acquisition rumors. AGM on 2026-09-09',
    'Amazon rules out layoffs; AGM on 2026-09-09',
    'Amazon changed its CEO. AGM on 2026-09-09',
    'Amazon revises guidance. AGM on 2026-09-09',
    'Amazon may refinance debt. AGM confirmed for 2026-09-09',
    'Amazon could raise guidance; AGM confirmed for 2026-09-09',
    'Amazon tentative product launch. AGM confirmed for 2026-09-09',
    'Amazon reports unconfirmed acquisition rumor. AGM confirmed for 2026-09-09',
  ]) {
    assert.deepEqual(
      deriveScheduledEventEvidence({ headline }),
      ['shareholder_meeting on 2026-09-09'],
      `${headline}: unrelated text in a separate clause cannot suppress the live AGM`,
    )
  }
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon AGM scheduled for May 9, 2026' }),
    ['shareholder_meeting on 2026-05-09'],
    'the month May is not mistaken for the uncertainty modal',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon to report earnings on 2026-08-06, AGM on 2026-09-09' }),
    ['results_date on 2026-08-06', 'shareholder_meeting on 2026-09-09'],
    'nearby events bind one-to-one to their own nearest dates',
  )
  // Regression (§17 Catalyst Discipline): a revision/uncertainty word about a DIFFERENT fact in a
  // separate comma- or spaced-dash segment must NOT veto a source-proven dated catalyst. Before the
  // segment-scoping fix, "changes"/"revises" (about the CFO or guidance) leaked across the comma and
  // discarded the AGM date, wrongly charging the missing-catalyst penalty.
  for (const headline of [
    'Amazon changes CFO, AGM confirmed for 2026-09-09',
    'Amazon changes CFO - AGM confirmed for 2026-09-09',
    'Amazon revises guidance, AGM confirmed for 2026-09-09',
  ]) {
    assert.deepEqual(
      deriveScheduledEventEvidence({ headline }),
      ['shareholder_meeting on 2026-09-09'],
      `${headline}: an unrelated revision in another segment cannot suppress the live AGM`,
    )
  }
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon postpones AGM, now due 2026-09-09' }),
    [],
    'a revision bound to the AGM itself still fails closed even across a comma',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'On 2026-08-06, Amazon will report results' }),
    ['results_date on 2026-08-06'],
    'a genuinely nearest leading date remains supported',
  )
  const translated = {
    headline: 'アマゾン株主総会は2026-09-09に開催',
    headline_en: 'Amazon AGM confirmed for 2026-09-09',
  }
  assert.ok(
    deriveScheduledEvents(translated).includes('shareholder_meeting'),
    'translation remains available to discovery and visible calendar chips',
  )
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: translated.headline }),
    [],
    'model-authored translation is display-only and cannot create timing evidence',
  )
  for (const headline_en of [
    'Amazon AGM confirmed for 2026-09-09',
    'Amazon AGM confirmed for 2026-10-10',
    'Amazon earnings confirmed for 2026-09-09',
  ]) {
    assert.deepEqual(
      deriveScheduledEventEvidence({ headline: translated.headline, headline_en } as any),
      [],
      'even an untyped runtime caller cannot give translated copy scoring authority',
    )
  }
  assert.deepEqual(
    deriveScheduledEventEvidence({ headline: 'Amazon earnings date announced' }),
    [],
    'a source headline without a date remains unproven even when display translation supplies one',
  )
  for (const headline of [
    'AGM cancelled — 株主総会 2026-09-09',
    'AGM postponed — 株主総会 2026-09-09',
    'AGM not confirmed — 株主総会 2026-09-09',
    '株主総会は延期 2026-09-09',
    '株主総会は未定 2026-09-09',
    '株主総会は開催しない 2026-09-09',
    '株主総会は2026-09-09に開催予定なし',
    '株主総会は2026-09-09に開催予定か？',
    '株主総会は2026-09-09に開催予定の可能性',
    '股东大会可能于2026-09-09召开',
    'assemblée générale non confirmée le 2026-09-09',
    'hauptversammlung nicht geplant für 2026-09-09',
  ]) {
    assert.deepEqual(
      deriveScheduledEventEvidence({ headline }),
      [],
      `${headline}: untranslated or ambiguous grammar cannot receive deterministic timing evidence`,
    )
  }
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
