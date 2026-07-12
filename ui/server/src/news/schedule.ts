// FORWARD-EVENT overlay — the wire's §17 catalyst axis, the free/tractable slice of Capital IQ's Events
// tree (Earnings Release Date, AGM, Ex-Dividend Date, Analyst/Investor Day, End of Lock-up Period, Index
// Constituent Add/Drop). The screener firehose is REACTIVE — it sees news that already happened. But many
// wire items are themselves ANNOUNCEMENTS of a SCHEDULED, upcoming corporate event ("Board to meet on
// Oct 28 to consider results", "Notice of AGM", "ex-dividend date set"). This module flags those, so the
// cockpit can surface a forward "what's coming" read derived entirely from what companies have already
// disclosed — no paid earnings/econ-calendar feed required.
//
// Design mirrors news/scope.ts + news/topics.ts: DETERMINISTIC, dependency-free, derived on read from the
// headline with the same boundary-safe matcher, so the WHOLE backlog is tagged at zero token cost. It
// flags the KIND of scheduled event, NOT a parsed date — the date sits in the headline the reader sees,
// and parsing arbitrary multi-format / multi-language dates off a title is error-prone (a wrong date on a
// chip is worse than none). A full date-SORTED calendar is a separate feature that needs a real calendar
// data source; this is the honest, free, reactive-to-forward projection of the firehose.
//
// NOTE (scope): this is the tractable subset. It does NOT cover scheduled MACRO releases (FOMC/CPI/jobs)
// — those have known agency schedules but need a curated calendar source, a deliberate follow-up.

import { hasTerm } from './scope'

export type ScheduledEventKind =
  | 'results_date'
  | 'shareholder_meeting'
  | 'ex_dividend'
  | 'investor_day'
  | 'lockup_expiry'
  | 'index_change'

export interface ScheduledEventDef {
  id: ScheduledEventKind
  /** short chip label — prefixed with a 📅 by the UI, so keep it a bare noun */
  label: string
  /** one plain sentence: why a buy-side reader cares (CLAUDE.md §21) */
  meaning: string
}

export const SCHEDULED_EVENTS: Record<ScheduledEventKind, ScheduledEventDef> = {
  results_date: { id: 'results_date', label: 'Results date', meaning: 'The company has set a date to report earnings — a scheduled, market-moving event to watch.' },
  shareholder_meeting: { id: 'shareholder_meeting', label: 'AGM / EGM', meaning: 'An upcoming shareholder meeting (annual or extraordinary) — votes on the board, pay, and key resolutions.' },
  ex_dividend: { id: 'ex_dividend', label: 'Ex-dividend', meaning: 'An ex-dividend or record date — buy before it to receive the payout; the price typically drops by the dividend on the day.' },
  investor_day: { id: 'investor_day', label: 'Investor day', meaning: 'A scheduled investor / analyst / capital-markets day — where management often resets guidance and strategy.' },
  lockup_expiry: { id: 'lockup_expiry', label: 'Lock-up expiry', meaning: 'A share lock-up is ending — insiders/early holders can start selling, a potential supply overhang.' },
  index_change: { id: 'index_change', label: 'Index change', meaning: 'A scheduled index add/drop — forced buying or selling by index funds around the effective date (a flow event).' },
}

export const SCHEDULED_EVENT_ORDER: ScheduledEventKind[] = [
  'results_date', 'shareholder_meeting', 'ex_dividend', 'investor_day', 'lockup_expiry', 'index_change',
]

// Boundary-safe lexicons (news/scope.ts hasTerm). The hard part is telling a FORWARD announcement from the
// event itself — a "reported Q3 results" (past) must NOT tag results_date. So results_date / index_change
// anchor on SCHEDULING language (to report / to consider / set for / to join …), while the inherently-
// forward nouns (ex-dividend date, record date, lock-up expiry, AGM notice, investor day) are safe on
// their own because a headline naming them is almost always about the upcoming instance.
const SCHEDULE_TERMS: Record<ScheduledEventKind, string[]> = {
  results_date: [
    'to report results', 'to announce results', 'to release results', 'to declare results',
    'to consider results', 'to consider and approve', 'board meeting to consider', 'will report results',
    'will announce results', 'results date', 'earnings date', 'to post results', 'scheduled to report',
    'to report earnings', 'to announce earnings', 'earnings call scheduled', 'to release earnings',
    'q1 results on', 'q2 results on', 'q3 results on', 'q4 results on',
  ],
  shareholder_meeting: [
    'annual general meeting', 'extraordinary general meeting', 'general meeting', 'agm', 'egm',
    'shareholder meeting', 'shareholders meeting', 'notice of agm', 'to hold agm', 'agm date',
    'annual meeting of shareholders', 'special meeting of shareholders',
  ],
  ex_dividend: [
    'ex-dividend', 'ex dividend', 'ex-dividend date', 'ex-date', 'record date', 'goes ex-dividend',
    'trades ex-dividend', 'ex-div',
  ],
  investor_day: [
    'investor day', 'analyst day', 'capital markets day', 'capital-markets day', 'investor conference',
    'analyst meet', 'analyst and investor day', 'investor briefing',
  ],
  lockup_expiry: [
    'lock-up expir', 'lockup expir', 'lock-up period', 'lockup period', 'end of lock-up',
    'end of lockup', 'lock-up release', 'lock-up ends', 'lockup ends',
  ],
  index_change: [
    'index inclusion', 'added to the index', 'removed from the index', 'index rebalance', 'index reshuffle',
    'to join the s&p', 'to join the nifty', 'to join the ftse', 'index constituent', 'index reconstitution',
    'added to the s&p', 'dropped from the', 'to be added to the',
  ],
}

/** Flag the scheduled/forward corporate event(s) a headline announces (0+; usually 0 or 1). Scans the
 *  English translation when present, like scope.ts/topics.ts. Deterministic, order-stable, zero-cost. */
export function deriveScheduledEvents(it: { headline?: string | null; headline_en?: string | null }): ScheduledEventKind[] {
  const raw = (it.headline_en && it.headline_en.trim()) || it.headline || ''
  const hay = ' ' + String(raw).toLowerCase() + ' '
  const out: ScheduledEventKind[] = []
  for (const id of SCHEDULED_EVENT_ORDER) {
    if (SCHEDULE_TERMS[id].some((t) => hasTerm(hay, t))) out.push(id)
  }
  return out
}

/** The plain label for a scheduled-event kind (falls back to the id). */
export function scheduledEventLabel(id: string): string {
  return (SCHEDULED_EVENTS as Record<string, ScheduledEventDef>)[id]?.label ?? id
}
