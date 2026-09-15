// How the armed watchlist's words are shown: the signal on each name and message, what each name is waiting
// for, and what happened to each message's email. Pure, so the rules are tested without a DOM (watchStatus.test.ts).
import type { WatchMessage, WatchPlanItem, WatchPlanView, WatchRow, WatchStatusWord } from './types'

export const STATUS_ORDER: readonly WatchStatusWord[] = ['warning', 'buy_price_reached', 'getting_close', 'check_now', 'coming_up', 'cant_check', 'waiting']

/** The statuses that mean a person should look now — the table's "Needs you" group. */
export const NEEDS_YOU: ReadonlySet<WatchStatusWord> = new Set<WatchStatusWord>(['warning', 'buy_price_reached', 'getting_close', 'check_now'])

export function isStatusWord(v: unknown): v is WatchStatusWord {
  return typeof v === 'string' && (STATUS_ORDER as readonly string[]).includes(v)
}

// ── the signal: what happened, in plain words, in a colour that always means the same thing ────────────────
// Red is danger, green a buy, amber "look at this", blue a heads-up, grey nothing to do — and a hollow grey is
// "no price, so nothing can be checked". The words name what happened, never a category the reader has to
// decode; the colour says what kind of thing it is.

export type SignalTone = 'red' | 'green' | 'amber' | 'blue' | 'grey' | 'off'
export interface Signal { label: string; tone: SignalTone; meaning: string }

/** By what happened — a condition on a name, or an item in a message. */
const SIGNAL: Record<string, Signal> = {
  bad_case_broken: { label: 'Below bad case', tone: 'red', meaning: 'The price fell under the research’s bad case. Re-check the research before anything else — this is not a buy signal.' },
  buy_price_reached: { label: 'In buy zone', tone: 'green', meaning: 'The price is at or inside the buy price the research gave.' },
  research_buy_now: { label: 'Research says buy', tone: 'green', meaning: 'New research ends in a buy call. From here on only its warnings are watched.' },
  near_after_big_drop: { label: 'Sharp drop', tone: 'amber', meaning: 'It fell 8% or more on its own today and is now close to a price the research gave.' },
  big_drop: { label: 'Sharp drop', tone: 'amber', meaning: 'It fell 8% or more on its own today — more than its market did.' },
  look_again_reached: { label: 'At review price', tone: 'amber', meaning: 'The price reached the research’s review price: the research said to re-check here, not to buy.' },
  fair_reached: { label: 'At fair value', tone: 'amber', meaning: 'The price reached the research’s fair value. The research gave no buy price.' },
  getting_close: { label: 'Near a price', tone: 'amber', meaning: 'Within 5% of a buy or review price.' },
  results_out: { label: 'Event passed', tone: 'amber', meaning: 'A date the research was waiting for has passed, and no new research has run — check what happened.' },
  research_old: { label: 'Research old', tone: 'amber', meaning: 'The research is more than 90 days old.' },
  your_level_reached: { label: 'Your alert hit', tone: 'amber', meaning: 'A price you set was reached.' },
  your_date_due: { label: 'Your date is due', tone: 'amber', meaning: 'A date you set has come.' },
  setup_failed: { label: 'Setup failed', tone: 'amber', meaning: 'Its research could not be read, so only its bad case and deal-breakers are watched.' },
  coming_up: { label: 'Event soon', tone: 'blue', meaning: 'A date the research named is two trading days away or less.' },
  your_date_coming: { label: 'Your date soon', tone: 'blue', meaning: 'A date you set is two trading days away or less.' },
  now_watching: { label: 'Now watching', tone: 'blue', meaning: 'Its research was read, and its prices and dates are being watched.' },
  cant_check: { label: 'No price', tone: 'off', meaning: 'There is no trustworthy price right now, so its price lines are not being checked.' },
  removed: { label: 'Removed', tone: 'grey', meaning: 'It came off the watchlist.' },
  cockpit_was_off: { label: 'Checks paused', tone: 'grey', meaning: 'The cockpit was off, so nothing was checked for a while.' },
  email_test: { label: 'Test email', tone: 'grey', meaning: 'The one test email sent when watchlist email was switched on.' },
}
const WATCHING: Signal = { label: 'Watching', tone: 'grey', meaning: 'Nothing has happened yet — its prices and dates are being watched.' }

/** An engine that sends no conditions (an older one, or the snapshot) still gets an honest signal from its
 *  status — and never "In buy zone", which only a buy price the research gave may earn (see rowStatus). */
const STATUS_SIGNAL: Record<WatchStatusWord, Signal> = {
  warning: { label: 'Warning', tone: 'red', meaning: 'A line the research drew was broken — its bad case or a deal-breaker. Not a buy signal.' },
  buy_price_reached: SIGNAL.buy_price_reached,
  getting_close: SIGNAL.getting_close,
  check_now: { label: 'Needs a look', tone: 'amber', meaning: 'Something about this name needs a look.' },
  coming_up: SIGNAL.coming_up,
  cant_check: SIGNAL.cant_check,
  waiting: WATCHING,
}

/** "Near buy price" or "Near review price" — saying which, so nobody has to open the name to find out. The line is
 *  the plan item the condition names (its id is `getting_close:<item id>`), else the one its title names — an
 *  older engine called the review price the "look-again price". */
function near(title: string, item?: WatchPlanItem): Signal {
  const role = item?.kind === 'price' ? item.role
    : /buy price/i.test(title) ? 'buy' : /review price|look-again price/i.test(title) ? 'look_again' : null
  const s = SIGNAL.getting_close
  return { ...s, label: role === 'buy' ? 'Near buy price' : role === 'look_again' ? 'Near review price' : s.label }
}

/** A name's signal: the thing that happened to it that matters most (its leading condition), else "Watching". */
export function rowSignal(row: WatchRow): Signal {
  const lead = row.watch?.conditions?.[0]
  if (lead?.type === 'getting_close') {
    const itemId = lead.id.slice(lead.id.indexOf(':') + 1)
    return near(lead.title, (row.watch?.plan?.items ?? []).find((i) => i.id === itemId))
  }
  return (lead && SIGNAL[lead.type]) || STATUS_SIGNAL[rowStatus(row)]
}

/** A message's signal: its leading item's. The first-day summary is a summary. */
export function messageSignal(m: WatchMessage): Signal {
  if (m.kind === 'summary') return { label: 'Summary', tone: 'grey', meaning: 'What was already true when the watchlist was switched on.' }
  const lead = m.items[0]
  if (lead?.type === 'getting_close') return near(lead.title)
  return (lead && SIGNAL[lead.type]) || (isStatusWord(m.status) ? STATUS_SIGNAL[m.status] : { label: 'Note', tone: 'grey', meaning: '' })
}

/**
 * The status a name is ranked and grouped by. The server's own when it sent one (a positive match, DESIGN.md §5).
 * An older engine or the static showcase gets the nearest honest status from the row's own trigger state — and
 * never 'buy_price_reached', which only a buy price the research itself gave may earn.
 */
export function rowStatus(row: WatchRow): WatchStatusWord {
  if (row.watch && isStatusWord(row.watch.status)) return row.watch.status
  if (row.state === 'condition_met' || row.state === 'due') return 'check_now'
  if (row.state === 'not_evaluable') return 'cant_check'
  return 'waiting'
}

export const statusRank = (s: WatchStatusWord): number => STATUS_ORDER.indexOf(s)

/** Most urgent first; within a status, the name nearest its line; then by ticker, so the list never shuffles. */
export function sortRows(rows: WatchRow[]): WatchRow[] {
  const gap = (r: WatchRow) => {
    const g = r.watch?.next_line?.gap_pct
    return typeof g === 'number' && Number.isFinite(g) ? Math.abs(g) : Number.POSITIVE_INFINITY
  }
  return [...rows].sort((a, b) =>
    statusRank(rowStatus(a)) - statusRank(rowStatus(b)) || gap(a) - gap(b) || a.ticker.localeCompare(b.ticker))
}

export function formatPrice(v: number): string {
  if (!Number.isFinite(v)) return '—'
  return Number.isInteger(v)
    ? v.toLocaleString('en-US')
    : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const ROLE_LABEL: Record<Extract<WatchPlanItem, { kind: 'price' }>['role'], string> = {
  buy: 'Buy price', look_again: 'Review price', fair: 'Fair price', bad_case: 'Bad case',
}

export function priceItemText(i: Extract<WatchPlanItem, { kind: 'price' }>): string {
  return i.high != null ? `${i.currency} ${formatPrice(i.low)}–${formatPrice(i.high)}` : `${i.currency} ${formatPrice(i.low)}`
}

/** The move the price still needs, in words — "must fall 4.2%" — so nobody has to decode a sign. */
export function gapWords(gap: number | null | undefined): string | null {
  if (typeof gap !== 'number' || !Number.isFinite(gap)) return null
  const a = Math.abs(Math.round(gap * 10) / 10)
  if (a === 0) return 'at it'
  return gap < 0 ? `must fall ${a}%` : `${a}% under it`
}

/** What a price is, beside it: today's move, else live or last close — and always whether it is delayed or no
 *  longer current, so a number is never shown as fresher than it is. */
export function quoteNote(q: { as_of_is_close: boolean; delayed?: boolean; stale?: boolean }, movePct?: number | null): string {
  const head = typeof movePct === 'number' && Number.isFinite(movePct) && !q.stale
    ? `${movePct > 0 ? '+' : movePct < 0 ? '−' : ''}${Math.abs(movePct)}% today`
    : q.as_of_is_close ? 'last close' : 'price now'
  return [head, q.delayed ? 'delayed' : null, q.stale ? 'not current' : null].filter(Boolean).join(' · ')
}

/** What a name is waiting for, as a label and the value that answers it — its nearest price, else what the
 *  research is waiting to see. The table shows the value, with its label quiet above it. */
export function waitingParts(row: WatchRow): { label: string; value: string } | null {
  const w = row.watch
  if (!w) return null
  if (w.next_line) {
    const g = gapWords(w.next_line.gap_pct)
    return { label: w.next_line.label, value: `${w.next_line.text}${g ? ` · ${g}` : ''}` }
  }
  for (const i of w.plan?.items ?? []) if (i.kind === 'waiting_for') return { label: 'Waiting to see', value: i.text }
  if (BUY_CALLS.has(w.plan?.decision ?? '')) return { label: 'Research says buy', value: 'only its warnings are watched' }
  return null
}

/** The next date as a label and the value under it: "Q2 FY27 results" over "~21 Oct · in 36 days". A day the
 *  research only estimates is marked, as the research wrote it ("~21-Oct-2026"). */
export function dateParts(d: { label: string; date: string; days_to: number; estimated?: boolean } | null | undefined): { label: string; value: string } | null {
  if (!d) return null
  const when = d.days_to === 0 ? 'today' : d.days_to === 1 ? 'tomorrow' : `in ${d.days_to} days`
  return { label: d.label, value: `${d.estimated === true ? '~' : ''}${shortDate(d.date)} · ${when}` }
}

/** Buy calls, as the server names them (watch/plan.ts BUY_NOW_DECISIONS): after one "buy now" message only
 *  their warnings are watched, so the row says so instead of showing nothing to wait for. */
const BUY_CALLS = new Set(['Strong Buy', 'Buy', 'Starter Position Only'])

export function shortDate(iso: string): string {
  const t = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(t)) return iso
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** The next date in one line, for the detail panel: "Q2 FY27 results · ~21 Oct · in 36 days". */
export function dateWords(d: { label: string; date: string; days_to: number; estimated?: boolean } | null | undefined): string | null {
  const p = dateParts(d)
  return p ? `${p.label} · ${p.value}` : null
}

/** Where the name's watch plan stands, in words. */
export function planStateWords(p: WatchPlanView | null | undefined): string | null {
  if (!p) return null
  if (p.state === 'ready') {
    const when = p.decision_date ? ` of ${shortDate(p.decision_date)}` : ''
    return `Set up from its research${when}${p.reader?.model ? ` · read once by ${p.reader.model}` : ''}`
  }
  if (p.state === 'reading') return 'Reading the research now…'
  if (p.state === 'waiting') return p.detail || 'Waiting to read the research.'
  return p.detail
}

/** What happened to a message's email, in words — including why most messages are never emailed. */
export function emailWords(m: WatchMessage): string {
  const e = m.email
  switch (e.state) {
    case 'not_urgent': return 'Not emailed — only urgent messages are'
    case 'pending': return 'Email going out'
    case 'sent': return e.sent_at ? `Emailed ${new Date(e.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Emailed'
    case 'failed': return `Email failed — ${e.detail || 'will try again'}`
    case 'off': return 'Not emailed — email is not set up'
    case 'paused': return 'Not emailed — email is paused for this name'
    case 'skipped': return `Not emailed — ${(e.detail || 'handled in the cockpit').replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}`
  }
}
