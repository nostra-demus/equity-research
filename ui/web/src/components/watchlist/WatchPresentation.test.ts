import assert from 'node:assert/strict'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WatchDetail } from './WatchDetail'
import { WatchPlanSection } from './WatchPlan'
import { WatchInbox } from './WatchInbox'
import { useStore } from '../../lib/store'
import type { WatchRow } from '../../lib/types'

const risk = 'Customer loss ends the thesis.'
const row = { watch: { plan: { state: 'ready', items: [{ kind: 'deal_breaker', id: 'kill', text: risk,
  check_where: 'Annual report', source: { file: 'decision_record.json', field: 'kill_criteria[0]', quote: null } }],
  left_out: [], reader: { detail: 'Read.' } } } } as unknown as WatchRow
const planHtml = renderToStaticMarkup(createElement(WatchPlanSection, { row }))
assert.ok(planHtml.includes(risk))
assert.ok(planHtml.includes('decision_record.json · kill_criteria[0]'), 'the material risk names its stored provenance')

const original = React.useSyncExternalStore
;(React as any).useSyncExternalStore = (_subscribe: unknown, snapshot: () => unknown) => snapshot()
try {
  useStore.setState({ staticMode: false, watchMessages: { enabled: true, messages: [], unread: 0 } as any,
    watchMessagesError: 'Network unavailable' })
  const staleHtml = renderToStaticMarkup(createElement(WatchInbox, { onPick: () => {} }))
  assert.ok(staleHtml.includes('Messages, refresh failed'), 'staleness is visible even while the inbox is closed')
  useStore.setState({ watchMessagesError: null })
  const freshHtml = renderToStaticMarkup(createElement(WatchInbox, { onPick: () => {} }))
  assert.ok(!freshHtml.includes('refresh failed'), 'a successful refresh clears the qualifier')
} finally {
  ;(React as any).useSyncExternalStore = original
}

// ---- the detail panel across the shapes the live list actually holds ----
//
// Every one of these was measured on the live cockpit before it was changed: a research name whose panel ran
// to 2,507px, a name with nothing set up whose panel was 746px of empty labelled blocks, and the sections
// that rendered on all ten names whether or not they had anything to say.
;(React as any).useSyncExternalStore = (_subscribe: unknown, snapshot: () => unknown) => snapshot()
try {
  useStore.setState({ staticMode: false, tickers: [], watchMessages: null, watchlistPending: null } as any)
  const detail = (over: Partial<WatchRow>) => renderToStaticMarkup(createElement(WatchDetail, {
    row: {
      listing_key: 'ZZZ|USD', ticker: 'ZZZ', company_name: 'Zed Inc', currency: 'USD', exchange: 'NYSE',
      origin: 'manual', entry_id: 'WL-1', why: '', conviction: null, review_date: null, tags: [], triggers: [],
      attachments: [], assignee: null, task_id: null, engine: null, resurfaced: false, archive: null,
      quote: { ticker: 'ZZZ', symbol: 'ZZZ', name: 'Zed', exchange: 'NYSE', currency: 'USD', price: 13.81,
        as_of: '2026-09-16T00:00:00.000Z', as_of_is_close: true, delayed: false, source: 'cnbc', stale: false },
      quote_reason: null, evals: [], state: 'watching', nearest_gap_pct: null, nearest: null, run_root: null,
      final_thesis_path: null, added_at: null, updated_at: null, engine_since: null,
      watch: { status: 'waiting', status_label: 'Watching', headline: null, conditions: [], next_line: null,
        next_date: null, day_move_pct: null, market: null, plan: null, email_paused: false, unread: 0 },
      ...over,
    } as unknown as WatchRow,
  }))

  const bare = detail({})
  assert.ok(bare.includes('Nothing else set up yet.'), 'a name with nothing set up says so once')
  assert.ok(!bare.includes('No reason recorded yet'), 'and not in an empty labelled section')
  assert.ok(!bare.includes('Next date'), 'nor a date heading with no date under it')
  assert.ok(!bare.includes('Engine run'), 'nor a rerun panel for research that was never run')
  assert.ok(!bare.includes('Nearest target'), 'nor two dashes where a target would be')
  assert.ok(bare.includes('13.81'), 'the price is still there, on one line')
  // NU on the live list: a review date of your own and nothing else. The date keeps its section; the rest of
  // the name is still empty, and says so once instead of through three more labelled blocks.
  const onlyDate = detail({ review_date: '2026-10-01' })
  assert.ok(onlyDate.includes('Nothing else set up yet.'), 'a review date does not make a name set up')
  assert.ok(onlyDate.includes('Next date'), 'while the date it does have keeps its heading')
  assert.ok(!onlyDate.includes('+ your own trigger'), 'and one call to action, not two')

  // A passed date, with "seen it" beside it and the research's words folded rather than printed.
  const passed = detail({
    watch: { status: 'check_now', status_label: 'Needs a look', headline: 'FQ1 earnings: the date has passed',
      conditions: [{ id: 'results_out:d1', type: 'results_out', urgent: false, title: 'FQ1 earnings: the date has passed',
        detail: 'FQ1 earnings was on 2026-09-04, and no research has run since.', quote: 'FQ1 on 2026-09-04',
        source: 'final_thesis.md', can_ack: true, seen_at: null }],
      next_line: null, next_date: null, day_move_pct: null, market: null, plan: null, email_paused: false, unread: 0 },
  } as Partial<WatchRow>)
  assert.ok(passed.includes('Seen it'), 'a date that cannot pass again can be acknowledged')
  assert.ok(passed.includes('own words'), 'its quote sits behind a disclosure')
  assert.ok(passed.indexOf('FQ1 on 2026-09-04') > passed.indexOf('<details'), 'and inside it, not above it')

  // Once seen, it leaves the head of the panel and lives under its own count.
  const seen = detail({
    watch: { status: 'waiting', status_label: 'Watching', headline: null,
      conditions: [{ id: 'results_out:d1', type: 'results_out', urgent: false, title: 'FQ1 earnings: the date has passed',
        detail: 'FQ1 earnings was on 2026-09-04, and no research has run since.', quote: null, source: null,
        can_ack: true, seen_at: '2026-09-16T09:00:00Z' }],
      next_line: null, next_date: null, day_move_pct: null, market: null, plan: null, email_paused: false, unread: 0 },
  } as Partial<WatchRow>)
  assert.ok(seen.includes('Seen · 1'), 'it is counted, not hidden')
  // Caught in the live preview: seen_at is an instant, and the date-only formatter handed it back untouched,
  // so the panel read "Seen 2026-09-16T09:00:00Z." to a person.
  assert.ok(/Seen \d+ [A-Z][a-z]{2}\./.test(seen), 'and dated in words, not as a machine stamp')
  assert.ok(!seen.includes('T09:00:00'), 'never the raw instant')
  assert.ok(seen.includes('Undo'), 'and can be brought back')
  assert.ok(!seen.includes('What this means'), 'while nothing still asks for attention')

  // A MISSING PRICE SAYS WHY IT IS MISSING. The one-line branch printed absenceReason(row) here — a sentence
  // about TRIGGERS — so NVO on the live list read "No trigger set — reminder only." in the price slot, twice
  // on one panel, while the real reason was reachable only by hovering.
  const noPrice = detail({ quote: null, quote_reason: 'no_currency' } as Partial<WatchRow>)
  assert.ok(noPrice.includes('no currency'), 'the price slot names the price reason')
  assert.ok(!noPrice.includes('No trigger set'), 'not the trigger reason')
  const notQuoted = detail({ quote: null, quote_reason: 'not_quoted' } as Partial<WatchRow>)
  assert.ok(notQuoted.includes('not quoted'), 'including the one this branch was written for')

  // NOTHING SET UP is a fact the watcher has to have answered for. `watch` is absent when the watcher is off
  // and always in the static snapshot; reading that as "this name is empty" printed "Nothing else set up
  // yet." over a researched name with a decision, a thesis and a run root.
  const noWatcher = detail({ watch: undefined } as unknown as Partial<WatchRow>)
  assert.ok(!noWatcher.includes('Nothing else set up yet.'), 'an absent watcher is not an empty name')
  const researched = detail({
    engine: { decision: 'Watchlist', decision_date: '2026-08-01', size_in_trigger: null, next_review: null,
      next_review_text: null, entry_price: null } as any,
    run_root: 'analyses/ZZZ_2026-08-01',
  } as Partial<WatchRow>)
  assert.ok(!researched.includes('Nothing else set up yet.'), 'nor is a name the engine has researched')

  // The engine changing its mind about a name you archived is the one thing this note says.
  const back = detail({ resurfaced: true, archive: { at: '2026-08-02T00:00:00Z', note: '' } } as unknown as Partial<WatchRow>)
  assert.ok(back.includes('back on the list'), 'a resurfaced name always says so')

  // Your own reason shows; the research quote that used to stand in for one does not.
  assert.ok(detail({ why: 'Sugar cycle turning' }).includes('Sugar cycle turning'))
  assert.ok(!detail({ engine: { size_in_trigger: 'Re-rate only below $100' } } as Partial<WatchRow>).includes('Re-rate only below $100'),
    "the research's size-in trigger is not shown as your reason")
} finally {
  ;(React as any).useSyncExternalStore = original
}

console.log('watch presentation: provenance and failed-refresh qualifiers verified')
