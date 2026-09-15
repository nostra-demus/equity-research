// How the armed watchlist's words are shown: the seven status words, what each name is waiting for, and
// what happened to each message's email. Pure, so the rules are tested without a DOM (watchStatus.test.ts).
import type { WatchMessage, WatchPlanItem, WatchPlanView, WatchRow, WatchStatusWord } from './types'

export const STATUS_ORDER: readonly WatchStatusWord[] = ['warning', 'buy_price_reached', 'getting_close', 'check_now', 'coming_up', 'cant_check', 'waiting']

export const STATUS_LABEL: Record<WatchStatusWord, string> = {
  warning: 'Warning',
  buy_price_reached: 'Buy price reached',
  getting_close: 'Getting close',
  check_now: 'Check now',
  coming_up: 'Coming up',
  cant_check: "Can't check",
  waiting: 'Waiting',
}

/** What each word means, for its hover — the same sentence everywhere the word appears. */
export const STATUS_MEANING: Record<WatchStatusWord, string> = {
  warning: 'A line the research drew was broken — its bad case or a deal-breaker. Not a buy signal.',
  buy_price_reached: 'The price is at or under the buy price the research gave.',
  getting_close: 'Within 5% of a buy or look-again price.',
  check_now: 'Something needs a look: a look-again price reached, results that are out, research getting old.',
  coming_up: 'A date the research named is two trading days away or less.',
  cant_check: 'There is no trustworthy price right now, so nothing is being checked against it.',
  waiting: 'Nothing needs you yet.',
}

/** The words that mean a person should look now. */
export const NEEDS_YOU: ReadonlySet<WatchStatusWord> = new Set<WatchStatusWord>(['warning', 'buy_price_reached', 'getting_close', 'check_now'])

/** Short class suffix per word — the only place the words map to styling. */
export const STATUS_KEY: Record<WatchStatusWord, string> = {
  warning: 'warn', buy_price_reached: 'buy', getting_close: 'close', check_now: 'check', coming_up: 'soon', cant_check: 'cant', waiting: 'wait',
}

export function isStatusWord(v: unknown): v is WatchStatusWord {
  return typeof v === 'string' && (STATUS_ORDER as readonly string[]).includes(v)
}

/**
 * The word the list shows. The server's own word when it sent one (a positive match, DESIGN.md §5). An older
 * engine or the static showcase gets the nearest honest word from the row's own trigger state — and never
 * "Buy price reached", which only a buy price the research itself gave may earn.
 */
export function rowStatus(row: WatchRow): WatchStatusWord {
  if (row.watch && isStatusWord(row.watch.status)) return row.watch.status
  if (row.state === 'condition_met' || row.state === 'due') return 'check_now'
  if (row.state === 'not_evaluable') return 'cant_check'
  return 'waiting'
}

export const statusRank = (s: WatchStatusWord): number => STATUS_ORDER.indexOf(s)

/** Most urgent first; within a word, the name nearest its line; then by ticker, so the list never shuffles. */
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
  buy: 'Buy price', look_again: 'Look-again price', fair: 'Fair price', bad_case: 'Bad case',
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

/** What a name is waiting for, in one line: its nearest price, else what the research is waiting to see. */
export function waitingText(row: WatchRow): string | null {
  const w = row.watch
  if (!w) return null
  if (w.next_line) {
    const g = gapWords(w.next_line.gap_pct)
    return `${w.next_line.label} ${w.next_line.text}${g ? ` · ${g}` : ''}`
  }
  for (const i of w.plan?.items ?? []) if (i.kind === 'waiting_for') return `Waiting for: ${i.text}`
  if (BUY_CALLS.has(w.plan?.decision ?? '')) return 'Research says buy — only its warnings are watched'
  return null
}

/** Buy calls, as the server names them (watch/plan.ts BUY_NOW_DECISIONS): after one "buy now" message only
 *  their warnings are watched, so the row says so instead of showing nothing to wait for. */
const BUY_CALLS = new Set(['Strong Buy', 'Buy', 'Starter Position Only'])

export function shortDate(iso: string): string {
  const t = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(t)) return iso
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function dateWords(d: { label: string; date: string; days_to: number; estimated?: boolean } | null | undefined): string | null {
  if (!d) return null
  const when = d.days_to === 0 ? 'today' : d.days_to === 1 ? 'tomorrow' : `in ${d.days_to} days`
  // A day the research only estimates is marked, as the research wrote it ("~21-Oct-2026").
  return `${d.label} · ${d.estimated ? '~' : ''}${shortDate(d.date)} · ${when}`
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

/** A message's word, for its chip. Summaries and system notes have none. */
export function messageStatus(m: WatchMessage): WatchStatusWord | null {
  return isStatusWord(m.status) ? m.status : null
}
