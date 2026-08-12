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

interface SourceBoundWindow {
  index: number
  end: number
  value: string
  granularity: 'day' | 'quarter'
}

interface SourceBoundTerm {
  id: ScheduledEventKind
  index: number
  end: number
}

const MONTH_NUMBER: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
}
const MONTH_WORD = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'
const NEGATED_WINDOW = /\b(?:no|not|none|without|cancelled|canceled|postponed|withdrawn|called\s+off|no\s+longer)\b/i
const TRAILING_NEGATED_WINDOW = /^\s*(?:[,:;.!?\-|–—]\s*)?(?:but\s+)?(?:later\s*,?\s+|now\s+)?(?:(?:it|the\s+(?:event|meeting))\s+)?(?:(?:which\s+)?(?:is|was|has(?:\s+(?:now|since))?\s+been)\s+)?(?:now\s+|later\s+)?(?:no|not|none|without|cancell?(?:ation|ed)|postponed|withdrawn|called[\s-]+off|no\s+longer)\b/i
// A headline that describes cancelling, delaying, withdrawing, or moving an event is evidence that an
// older schedule changed, not proof that either printed date is still live. Reject the whole punctuation-
// bounded clause. This intentionally covers the action before the event ("postpones AGM ..."), a noun
// ("AGM cancellation ..."), and status text after the old date ("has since been postponed"). Rescheduled
// and moved headlines remain fail-closed even when they print a replacement date: this parser cannot prove
// which of multiple dates is now operative without source-time/state semantics.
const CLAUSE_REVISES_SCHEDULE = new RegExp(
  String.raw`\b(?:cancell?(?:ation(?:s)?|ed|ing|s)?|postpon(?:e|es|ed|ement(?:s)?|ing)|delay(?:s|ed|ing)?|defer(?:s|red|ring|ral(?:s)?|ment(?:s)?)?|reschedul(?:e|es|ed|ing)|withdraw(?:s|n|ing|al(?:s)?)?|withdrew|mov(?:e|es|ed|ing)|shift(?:s|ed|ing)?|push(?:es|ed|ing)?[\s-]+back|put(?:s|ting)?[\s-]+off|adjourn(?:s|ed|ing|ment(?:s)?)?|scrap(?:s|ped|ping)?|suspend(?:s|ed|ing|ion(?:s)?)?|call(?:s|ed|ing)?[\s-]+off|den(?:y|ies|ied|ying)|rul(?:e|es|ed|ing)[\s-]+out|chang(?:e|es|ed|ing)|revis(?:e|es|ed|ing|ion(?:s)?)|no\s+longer)\b`,
  'i',
)
// A complete date does not make a merely possible/tentative event proven. Keep `may` contextual because
// it is also a month name: "May 9, 2026" must remain a valid date, while "may hold AGM" must not score.
const CLAUSE_UNCERTAIN_SCHEDULE = new RegExp(
  String.raw`\b(?:might|could|possibly|potentially|tentative(?:ly)?|unconfirmed)\b|\bmay\s+(?:(?:still|now)\s+)?(?:be|hold|take|occur|happen|meet|convene|schedule|report|announce|release|declare|consider|join|host|set|start|end|expire|trade|go)\b`,
  'i',
)
const CLAUSE_SEPARATORS = ['.', ';', '!', '?', '|', '\n'] as const
// Commas and spaced dashes are NOT clause separators — they keep one headline as a single clause — but
// they DO separate independent facts. The schedule-revision/uncertainty test is scoped to the segment
// that actually contains the event↔date binding, so an unrelated fact sharing the headline ("Amazon
// changes CFO, AGM confirmed for 2026-09-09") cannot veto a source-proven date. A bare "-" is never a
// break: it lives inside ISO dates (2026-09-09) and hyphenated words; only a spaced dash breaks a segment.
const SEGMENT_BREAKS = [',', ' - ', ' – ', ' — '] as const

function validCalendarDay(year: number, month: number, day: number): boolean {
  if (![year, month, day].every(Number.isInteger) || year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return false
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Extract only explicit date/window text that literally appears in one source headline. This is
 * deliberately separate from `deriveScheduledEvents`: category chips may be inferred from words such as
 * "earnings date", but the trade scorer needs stronger proof. We accept a complete calendar date or a
 * year-bound quarter. Relative phrases such as "tomorrow" are deliberately rejected: without retaining
 * and applying their source-time base they become timeless future claims. We never infer a missing year
 * from the ingest clock and never read `headline_en`, because that translation is model-authored copy. */
function sourceBoundWindows(headline: string): SourceBoundWindow[] {
  const found: SourceBoundWindow[] = []
  const push = (match: RegExpMatchArray, value: string, granularity: SourceBoundWindow['granularity'] = 'day'): void => {
    const index = match.index ?? -1
    if (index >= 0) found.push({ index, end: index + match[0].length, value, granularity })
  }

  for (const match of headline.matchAll(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g)) {
    const [, year, month, day] = match
    if (validCalendarDay(Number(year), Number(month), Number(day))) push(match, isoDay(Number(year), Number(month), Number(day)))
  }
  for (const match of headline.matchAll(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/g)) {
    const [, first, second, year] = match
    const a = Number(first), b = Number(second), y = Number(year)
    // The source may use DD/MM or MM/DD. Preserve the literal token; admission only needs proof that at
    // least one common ordering is a real calendar day. Do not silently choose one interpretation here.
    if (validCalendarDay(y, a, b) || validCalendarDay(y, b, a)) push(match, match[0])
  }

  const monthFirst = new RegExp(`\\b(${MONTH_WORD})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(20\\d{2})\\b`, 'gi')
  for (const match of headline.matchAll(monthFirst)) {
    const month = MONTH_NUMBER[String(match[1]).toLowerCase()]
    const day = Number(match[2]), year = Number(match[3])
    if (validCalendarDay(year, month, day)) push(match, isoDay(year, month, day))
  }
  const dayFirst = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_WORD}),?\\s+(20\\d{2})\\b`, 'gi')
  for (const match of headline.matchAll(dayFirst)) {
    const day = Number(match[1]), month = MONTH_NUMBER[String(match[2]).toLowerCase()], year = Number(match[3])
    if (validCalendarDay(year, month, day)) push(match, isoDay(year, month, day))
  }
  for (const match of headline.matchAll(/\bQ([1-4])\s*(20\d{2})\b/gi)) push(match, `Q${match[1]} ${match[2]}`, 'quarter')
  return found.sort((a, b) => a.index - b.index || a.end - b.end)
}

function termIndexes(hay: string, term: string): number[] {
  const out: number[] = []
  for (let from = 0; from < hay.length;) {
    const index = hay.indexOf(term, from)
    if (index < 0) break
    const before = index === 0 ? ' ' : hay[index - 1]
    const after = index + term.length >= hay.length ? ' ' : hay[index + term.length]
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) out.push(index)
    from = index + 1
  }
  return out
}

/** Find every lexicon hit, collapsing nested aliases for the same event (for example "notice of AGM"
 * and its inner "AGM") to one term. This prevents a single date being consumed twice by synonyms. */
function sourceBoundTerms(lower: string, kinds: ScheduledEventKind[]): SourceBoundTerm[] {
  const out: SourceBoundTerm[] = []
  for (const id of kinds) {
    const matches = SCHEDULE_TERMS[id]
      .flatMap((term) => termIndexes(lower, term).map((index) => ({ id, index, end: index + term.length })))
      .sort((a, b) => a.index - b.index || b.end - a.end)
    const collapsed: SourceBoundTerm[] = []
    for (const match of matches) {
      if (collapsed.some((prior) => match.index < prior.end && match.end > prior.index)) continue
      collapsed.push(match)
    }
    out.push(...collapsed)
  }
  return out.sort((a, b) => a.index - b.index || a.end - b.end || a.id.localeCompare(b.id))
}

function clauseBounds(lower: string, index: number): { start: number; end: number } {
  const start = Math.max(...CLAUSE_SEPARATORS.map((separator) => lower.lastIndexOf(separator, index))) + 1
  const later = CLAUSE_SEPARATORS
    .map((separator) => lower.indexOf(separator, index))
    .filter((at) => at >= 0)
  return { start, end: later.length ? Math.min(...later) : lower.length }
}

function bindingIsNegated(
  lower: string,
  term: SourceBoundTerm,
  window: SourceBoundWindow,
  clause: { start: number; end: number },
): boolean {
  // Scope the revise/uncertainty scan to the comma/dash-delimited SEGMENT that holds the event↔date
  // binding. Testing the whole punctuation-bounded clause let an unrelated fact in another segment
  // ("Amazon changes CFO, AGM confirmed for <date>") veto a source-proven date via a word like "changes".
  const bindStart = Math.min(term.index, window.index)
  const bindEnd = Math.max(term.end, window.end)
  let segStart = clause.start
  let segEnd = clause.end
  for (const brk of SEGMENT_BREAKS) {
    const left = lower.lastIndexOf(brk, bindStart)
    if (left >= clause.start && left + brk.length <= bindStart && left + brk.length > segStart) segStart = left + brk.length
    const right = lower.indexOf(brk, bindEnd)
    if (right >= bindEnd && right < segEnd) segEnd = right
  }
  const segText = lower.slice(segStart, segEnd)
  if (CLAUSE_REVISES_SCHEDULE.test(segText) || CLAUSE_UNCERTAIN_SCHEDULE.test(segText)) return true
  const relationStartAt = bindStart
  const priorComma = lower.lastIndexOf(',', relationStartAt)
  const relationStart = Math.max(clause.start, priorComma + 1, relationStartAt - 64)
  const relationEnd = Math.max(term.end, window.end)
  if (NEGATED_WINDOW.test(lower.slice(relationStart, relationEnd))) return true
  // A cancellation normally follows the date ("earnings on Sep 9 cancelled"). Keep this check anchored
  // to the immediate suffix, but allow one punctuation boundary ("Sep 9. It was cancelled"). A later,
  // separately named event starts with its own noun and therefore cannot cancel the earlier pair.
  const immediateTail = lower.slice(window.end, Math.min(lower.length, window.end + 96))
  return TRAILING_NEGATED_WINDOW.test(immediateTail)
}

/** Source-bound catalyst evidence for the Ideas scorer. Every returned value is deterministically tied
 * to BOTH a forward-event term and a valid date/window in the same source-headline clause. Category-only,
 * malformed, translated, and negated claims return no evidence, so model prose can never manufacture the
 * scorer's timing points. */
export function deriveScheduledEventEvidence(it: { headline?: string | null; headline_en?: string | null }): string[] {
  const raw = typeof it.headline === 'string' ? it.headline.trim() : ''
  if (!raw) return []
  const lower = raw.toLowerCase()
  const windows = sourceBoundWindows(raw)
  if (!windows.length) return []
  const kinds = deriveScheduledEvents({ headline: raw })
  const terms = sourceBoundTerms(lower, kinds)
  if (!terms.length) return []
  const candidates = terms.flatMap((term) => {
    const clause = clauseBounds(lower, term.index)
    return windows
      .filter((window) => window.index >= clause.start && window.end <= clause.end)
      .map((window) => {
        const distance = Math.max(0, term.index - window.end, window.index - term.end)
        // Headlines overwhelmingly name EVENT then DATE. Make a preceding date more expensive than any
        // permitted forward gap, while still allowing "On X, earnings ..." when no closer event owns X.
        // This stops the next undated event in "earnings on X, AGM announced" from stealing X.
        const directionPenalty = window.end <= term.index ? 64 : 0
        return { term, window, clause, distance, relationRank: distance + directionPenalty }
      })
      .filter((candidate) => candidate.distance <= 64)
  }).sort((a, b) => (
    a.relationRank - b.relationRank || a.distance - b.distance || a.term.index - b.term.index
    || a.window.index - b.window.index || a.term.id.localeCompare(b.term.id)
  ))

  // First give each source window exactly one nearest/local owner. Only then let each event choose among
  // the windows it actually owns, preferring an exact day to a year-bound quarter. This two-stage binding
  // prevents an unchosen quarter/date from falling through to an adjacent undated event.
  const ownerByWindow = new Map<SourceBoundWindow, (typeof candidates)[number]>()
  for (const candidate of candidates) {
    if (!ownerByWindow.has(candidate.window)) ownerByWindow.set(candidate.window, candidate)
  }
  const ownedByTerm = new Map<SourceBoundTerm, Array<(typeof candidates)[number]>>()
  for (const candidate of ownerByWindow.values()) {
    const owned = ownedByTerm.get(candidate.term) || []
    owned.push(candidate)
    ownedByTerm.set(candidate.term, owned)
  }

  const bound: { term: SourceBoundTerm; value: string }[] = []
  for (const [term, owned] of ownedByTerm) {
    const candidate = owned.sort((a, b) => (
      Number(a.window.granularity === 'quarter') - Number(b.window.granularity === 'quarter')
      || a.relationRank - b.relationRank || a.distance - b.distance || a.window.index - b.window.index
    ))[0]
    if (!candidate) continue
    if (bindingIsNegated(lower, candidate.term, candidate.window, candidate.clause)) continue
    bound.push({ term, value: `${term.id} on ${candidate.window.value}` })
  }
  const sourceOrdered = bound
    .sort((a, b) => a.term.index - b.term.index || a.term.end - b.term.end || a.value.localeCompare(b.value))
    .map((item) => item.value)
  return [...new Set(sourceOrdered)].slice(0, 8)
}

/** The plain label for a scheduled-event kind (falls back to the id). */
export function scheduledEventLabel(id: string): string {
  return (SCHEDULED_EVENTS as Record<string, ScheduledEventDef>)[id]?.label ?? id
}
