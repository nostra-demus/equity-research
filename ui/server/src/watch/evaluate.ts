// What one watched name says right now: its conditions, and the one status word the list shows.
//
// Pure — a plan, a price and a date go in; conditions come out. Nothing here decides who is told or how:
// whether a condition is URGENT is a fixed property of its type (URGENT_CONDITIONS below), never a model's
// opinion, so a test can prove no non-urgent type ever reaches the email sender.
import { BUY_NOW_DECISIONS, priceLine, ROLE_LABEL, type PlanDate, type PlanItem, type PlanPrice, type WatchPlan } from './plan'
import type { TriggerEval, WatchTrigger } from '../watchlist'

/** The seven words the screen uses, in priority order. */
export type StatusWord = 'warning' | 'buy_price_reached' | 'getting_close' | 'check_now' | 'coming_up' | 'cant_check' | 'waiting'

export const STATUS_RANK: Record<StatusWord, number> = {
  warning: 0, buy_price_reached: 1, getting_close: 2, check_now: 3, coming_up: 4, cant_check: 5, waiting: 6,
}
/** Each status's own label — used only where no condition names what happened more plainly (the cockpit shows a
 *  condition's own words, web/src/lib/watchStatus.ts SIGNAL; this is its STATUS_SIGNAL fallback, word for word). */
export const STATUS_LABEL: Record<StatusWord, string> = {
  warning: 'Warning',
  buy_price_reached: 'In buy zone',
  getting_close: 'Near a price',
  check_now: 'Needs a look',
  coming_up: 'Event soon',
  cant_check: 'No price',
  waiting: 'Watching',
}

export type ConditionType =
  | 'buy_price_reached' | 'look_again_reached' | 'fair_reached' | 'bad_case_broken'
  | 'near_after_big_drop' | 'getting_close' | 'big_drop'
  | 'coming_up' | 'results_out' | 'research_old'
  | 'your_level_reached' | 'your_date_due' | 'your_date_coming'
  | 'cant_check'

/**
 * The fixed list of what is urgent — a line the research (or you) drew was crossed. Everything else stays
 * in the cockpit and is never emailed. Two urgent MESSAGE types are set where they are made, as they are not
 * conditions: "research says buy now" (monitor.ts, once per buy call) and, in a later step, the research's own
 * trigger confirmed in a filing.
 */
export const URGENT_CONDITIONS: ReadonlySet<ConditionType> = new Set<ConditionType>([
  'buy_price_reached', 'look_again_reached', 'bad_case_broken', 'near_after_big_drop', 'your_level_reached',
])

/**
 * Conditions that CANNOT clear themselves, and so can be acknowledged.
 *
 * A price condition ends when the price moves; these three do not. A date that has passed stays passed, and
 * research written in June only gets younger by being re-run — so a name carrying them sat in "Needs you" for
 * ever, which is how five of ten names came to live there and the group stopped meaning anything. Saying "seen
 * it" does not make the fact untrue: the condition stays on the name, in its own words, with the day you saw
 * it. It stops deciding the status, and a NEW fact — another date passing, a new reading — is a new id, so the
 * name comes back on its own.
 */
export const ACKNOWLEDGEABLE: ReadonlySet<ConditionType> = new Set<ConditionType>([
  'results_out', 'research_old', 'your_date_due',
])

export const CONDITION_STATUS: Record<ConditionType, StatusWord> = {
  buy_price_reached: 'buy_price_reached',
  look_again_reached: 'check_now',
  fair_reached: 'check_now',
  bad_case_broken: 'warning',
  near_after_big_drop: 'getting_close',
  getting_close: 'getting_close',
  big_drop: 'check_now',
  coming_up: 'coming_up',
  results_out: 'check_now',
  research_old: 'check_now',
  your_level_reached: 'check_now',
  your_date_due: 'check_now',
  your_date_coming: 'coming_up',
  cant_check: 'cant_check',
}

export interface Thresholds {
  /** A drop this big in one session, beyond the market's own move, is a big drop. */
  bigDropPct: number
  /** Within this far above a buy or review price is "near" it. */
  nearPct: number
  /** Research this old is "getting old". */
  researchOldDays: number
  /** A date this many trading days ahead is "coming up". */
  comingUpTradingDays: number
  /** A one-session move this large is held as possibly a split or a data error, not acted on. */
  unusualJumpPct: number
}
export const DEFAULT_THRESHOLDS: Thresholds = { bigDropPct: 8, nearPct: 5, researchOldDays: 90, comingUpTradingDays: 2, unusualJumpPct: 40 }

export interface PriceFacts {
  price: number | null
  currency: string | null
  as_of: string | null
  as_of_is_close: boolean
  stale: boolean
  /** Why there is no usable price — shown as "No price". */
  reason: string | null
  /** Today's move against OUR OWN record of the previous session's last price (the feed's own previous
   *  close is unreliable on about half of exchanges — see equity-quote.ts). Null until one is recorded. */
  day_move_pct: number | null
  /** The home market's move over the same session, when its index can be priced. */
  market: { label: string; move_pct: number } | null
  session: string | null
}

export interface Condition {
  /** Stable across checks: the same fact about the same line keeps the same id. */
  id: string
  type: ConditionType
  urgent: boolean
  title: string
  detail: string
  /** The research's own words behind this condition, when there are any. */
  quote: string | null
  /** For a passed date: the research's own tests to check by hand (its deal-breakers). Kept apart from `detail`
   *  so the panel can fold them away; a message spells them out (monitor.ts toItem). */
  checklist?: string[]
  source: string | null
  /** The price line involved, for re-arming after a 3% move away. */
  line: number | null
  /** The line is reached by a RISE (your own at-or-above trigger), so it re-arms after a move back BELOW it. */
  rises?: boolean
  /** When you said you had seen this — set only for a condition that cannot clear itself (ACKNOWLEDGEABLE).
   *  A seen condition is still true and still shown; it simply stops deciding the name's status. */
  seen_at?: string | null
  /** Whether saying "seen it" is offered for this condition at all. */
  can_ack?: boolean
}

export interface NextLine {
  role: PlanPrice['role'] | 'yours'
  label: string
  text: string
  /** Signed move still needed, % of today's price. Negative = it must fall. Null without a price. */
  gap_pct: number | null
}
/** `estimated`: the research only estimates this day ("~21-Oct-2026"), so the screen marks it. */
export interface NextDate { label: string; date: string; days_to: number; estimated: boolean }

export interface NameEvaluation {
  status: StatusWord
  status_label: string
  conditions: Condition[]
  headline: string | null
  next_line: NextLine | null
  next_date: NextDate | null
}

// ---------- small helpers ----------

export function formatPrice(v: number): string {
  if (!Number.isFinite(v)) return '—'
  return Number.isInteger(v)
    ? v.toLocaleString('en-US')
    : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
export const money = (currency: string | null, v: number) => `${currency ?? ''} ${formatPrice(v)}`.trim()
const pct = (v: number) => `${Math.abs(Math.round(v * 10) / 10)}%`
const round1 = (v: number) => Math.round(v * 10) / 10

export function priceText(p: PlanPrice): string {
  return p.high != null ? `${p.currency} ${formatPrice(p.low)}–${formatPrice(p.high)}` : money(p.currency, p.low)
}

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD). Positive = ahead. */
export function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(`${from.slice(0, 10)}T00:00:00Z`)
  const b = Date.parse(`${to.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86_400_000)
}

/** Weekdays after `today` up to and including `date` (0 = today). Negative calendar days when it has passed.
 *  Exchange holidays are not known here, so this can say "2 trading days" across a holiday — the message
 *  then arrives a day early, which is the safe side to be wrong on. */
export function tradingDaysUntil(today: string, date: string): number | null {
  const d = daysBetween(today, date)
  if (d == null) return null
  if (d <= 0) return d
  let n = 0
  const start = Date.parse(`${today.slice(0, 10)}T00:00:00Z`)
  for (let i = 1; i <= d; i++) {
    const wd = new Date(start + i * 86_400_000).getUTCDay()
    if (wd !== 0 && wd !== 6) n++
  }
  return n
}

function sourceLabel(item: { source: { file: string; field: string | null } }): string {
  return item.source.field ? `${item.source.file} · ${item.source.field}` : item.source.file
}

const quoteOf = (item: { source: { quote: string | null } }) => item.source.quote

// ---------- the evaluation ----------

export interface EvaluateInput {
  plan: WatchPlan | null
  /** Conditions you have said you have seen, by id, with when you said it (monitor state). */
  seen?: Record<string, string>
  /** Your own triggers and their evaluation (watchlist.ts evaluateTrigger), for names you added. */
  triggers: WatchTrigger[]
  evals: TriggerEval[]
  facts: PriceFacts
  today: string
  thresholds?: Thresholds
}

/**
 * A window the sentence can use — "~17-Sep-2026", "late October 2026" — or nothing.
 *
 * `window` is whatever the report wrote around the day, and it is only sometimes a date phrase. On the live
 * list one is an entire table row ("| ~21-Oct-2026 (CIQ-modeled estimate, no board-meeting intimation filed) |
 * Q2 FY27 results | …") and another is a sentence about consensus, so "X was expected <window>" printed as
 * "H1 2026 interim results was expected The nearest dated, evidenced cata…". A phrase qualifies only if it is
 * short, carries a number, and has none of the punctuation that marks prose or a table; otherwise the ISO day
 * is used, and the report's own wording is still shown as the quote beneath.
 */
export function datePhrase(window: string | null | undefined): string | null {
  const text = String(window ?? '').replace(/^\s*(?:~|(?:est(?:imated)?|expected)\b\.?)\s*/i, '').trim()
  if (!text || text.length > 24 || !/\d/.test(text)) return null
  return /^[A-Za-z0-9][A-Za-z0-9 .,'/~–-]*$/.test(text) ? text : null
}

export function evaluateName(input: EvaluateInput): NameEvaluation {
  const t = input.thresholds ?? DEFAULT_THRESHOLDS
  const { plan, facts, today } = input
  const out: Condition[] = []
  const add = (c: Omit<Condition, 'urgent'>) => out.push({ ...c, urgent: URGENT_CONDITIONS.has(c.type) })

  const items: PlanItem[] = plan?.items ?? []
  const prices = items.filter((i): i is PlanPrice => i.kind === 'price')
  const dates = items.filter((i): i is PlanDate => i.kind === 'date')
  const dealBreakers = items.filter((i) => i.kind === 'deal_breaker')

  // ---- the price itself ----
  const unusual = facts.day_move_pct != null && Math.abs(facts.day_move_pct) >= t.unusualJumpPct
  let price: number | null = facts.price != null && !facts.stale ? facts.price : null
  const pricedIn = facts.currency
  if (facts.price == null || facts.stale) {
    const needsPrice = prices.length > 0 || input.triggers.some((x) => x.kind !== 'event_date')
    if (needsPrice) add({
      id: 'cant_check:price', type: 'cant_check', title: 'No usable price',
      detail: facts.stale
        ? `The newest price is not current (last checked ${facts.as_of ?? 'a while ago'}), so nothing is checked against it.`
        : `${facts.reason ?? 'No price for this listing.'}${needsPrice ? ' Price lines are not being checked.' : ''}`,
      quote: null, source: null, line: null,
    })
  } else if (unusual) {
    // A one-session jump this large is far more often a split, a units change or a wrong listing than a
    // real move. Say so, and act on nothing until the next price confirms it (the record then has a new
    // session to compare against).
    add({
      id: `cant_check:jump:${facts.session}`, type: 'cant_check', title: 'The price jumped too far to trust',
      detail: `It moved ${pct(facts.day_move_pct as number)} in one session — possibly a split or a data error. Nothing is checked until the next price confirms it.`,
      quote: null, source: null, line: null,
    })
    price = null
  }

  // ---- price lines from the research ----
  const drop = facts.day_move_pct != null && price != null
    ? round1(facts.day_move_pct - (facts.market?.move_pct ?? 0))
    : null
  const bigDrop = drop != null && drop <= -t.bigDropPct
  const dropText = drop == null ? '' : facts.market
    ? `Down ${pct(facts.day_move_pct as number)} today while the ${facts.market.label} moved ${facts.market.move_pct >= 0 ? '+' : '−'}${pct(facts.market.move_pct)}.`
    : `Down ${pct(facts.day_move_pct as number)} today (no market comparison available for this listing).`
  let lineReached = false
  let nearLine: { p: PlanPrice; line: number } | null = null

  if (price != null) {
    const actionPrice = prices.some((p) => p.role === 'buy' || p.role === 'look_again')
    for (const p of prices) {
      if (p.currency.toUpperCase() !== String(pricedIn ?? '').toUpperCase()) {
        add({
          id: `cant_check:currency:${p.id}`, type: 'cant_check', title: 'Price is in another currency',
          detail: `The research's ${ROLE_LABEL[p.role].toLowerCase()} is in ${p.currency}, but the price is in ${pricedIn}. Comparing them needs an exchange rate and date this row does not carry.`,
          quote: quoteOf(p), source: sourceLabel(p), line: null,
        })
        continue
      }
      const line = priceLine(p)
      const here = `At ${money(pricedIn, price)}`
      if (p.role === 'bad_case') {
        if (price < line) {
          add({
            id: `bad_case_broken:${p.id}`, type: 'bad_case_broken', title: 'Fell under its bad case',
            detail: `${here}, it is under the research's bad case of ${priceText(p)} (${p.source.field ?? 'scenario'}). This is not a buy signal until the research is checked again.`,
            quote: quoteOf(p), source: sourceLabel(p), line,
          })
        }
        continue
      }
      if (price <= line) {
        lineReached = true
        const type = p.role === 'buy' ? 'buy_price_reached' : p.role === 'look_again' ? 'look_again_reached' : 'fair_reached'
        add({
          id: `${type}:${p.id}`, type,
          title: p.role === 'buy' ? 'Reached its buy price' : p.role === 'look_again' ? 'Reached its review price' : 'Reached its fair price',
          detail: `${here}, it is ${p.high != null && price >= p.low ? 'inside' : 'at or under'} the research's ${ROLE_LABEL[p.role].toLowerCase()} of ${priceText(p)}.`
            + (p.role === 'look_again' ? ' The research said to re-check here, not to buy.' : '')
            + (p.role === 'fair' && !actionPrice ? ' The research gave no buy price.' : '')
            + (bigDrop ? ` ${dropText}` : ''),
          quote: quoteOf(p), source: sourceLabel(p), line,
        })
        continue
      }
      if ((p.role === 'buy' || p.role === 'look_again') && price <= line * (1 + t.nearPct / 100)) {
        if (!nearLine || line > nearLine.line) nearLine = { p, line }
      }
    }
    // The strongest line reached speaks for the price. Research often names overlapping levels (AMZN:
    // "Track at $190-200 for re-entry" beside a "$185–$200" target zone), and one price must not be both
    // "In buy zone" and "review here, not buy" in the same message.
    const REACHED: ConditionType[] = ['buy_price_reached', 'look_again_reached', 'fair_reached']
    const top = REACHED.findIndex((type) => out.some((c) => c.type === type))
    if (top >= 0) {
      const weaker = new Set(REACHED.slice(top + 1))
      for (let i = out.length - 1; i >= 0; i--) if (weaker.has(out[i].type)) out.splice(i, 1)
    }
  }

  if (nearLine && price != null) {
    const above = ((price - nearLine.line) / nearLine.line) * 100
    const what = ROLE_LABEL[nearLine.p.role].toLowerCase()
    if (bigDrop) {
      add({
        id: `near_after_big_drop:${nearLine.p.id}:${facts.session}`, type: 'near_after_big_drop',
        title: `Fell ${pct(facts.day_move_pct as number)} and is close to its ${what}`,
        detail: `${dropText} At ${money(pricedIn, price)} it is ${pct(above)} above the ${what} of ${priceText(nearLine.p)}.`,
        quote: quoteOf(nearLine.p), source: sourceLabel(nearLine.p), line: nearLine.line,
      })
    } else {
      add({
        id: `getting_close:${nearLine.p.id}`, type: 'getting_close', title: `Near its ${what}`,
        detail: `At ${money(pricedIn, price)} it is ${pct(above)} above the ${what} of ${priceText(nearLine.p)}.`,
        quote: quoteOf(nearLine.p), source: sourceLabel(nearLine.p), line: nearLine.line * (1 + t.nearPct / 100),
      })
    }
  } else if (bigDrop && !lineReached) {
    add({
      id: `big_drop:${facts.session}`, type: 'big_drop', title: `Fell ${pct(facts.day_move_pct as number)} on its own today`,
      detail: `${dropText} It is not near any price the research gave.`,
      quote: null, source: null, line: null,
    })
  }

  // ---- dates from the research ----
  const decisionDay = plan?.decision_date?.slice(0, 10) ?? null
  const checklist = dealBreakers.slice(0, 4).map((d) => (d as { text: string }).text)
  for (const d of dates) {
    if (!d.date) continue
    const td = tradingDaysUntil(today, d.date)
    if (td == null) continue
    // A day the research only estimates says so wherever it appears ("expected 21-Oct-2026"): no message claims
    // more than the research did (CLAUDE.md §3).
    const estimated = d.estimated === true
    const when = estimated ? `expected ${datePhrase(d.window) ?? d.date}` : `on ${d.date}`
    if (td >= 0 && td <= t.comingUpTradingDays) {
      // "Today" is the calendar's word: a weekend date seen on the Friday before is 0 trading days away, not today.
      const cal = daysBetween(today, d.date) ?? td
      const soon = cal === 0 ? `${d.label} — today`
        : td === 0 ? `${d.label} in ${cal} day${cal === 1 ? '' : 's'}`
          : `${d.label} in ${td} trading day${td === 1 ? '' : 's'}`
      add({
        id: `coming_up:${d.id}`, type: 'coming_up',
        title: `${soon}${estimated ? ' (expected)' : ''}`,
        detail: `${d.label} ${when}.${d.what_to_check ? ` What to look for: ${d.what_to_check}` : ''}`,
        quote: quoteOf(d), source: sourceLabel(d), line: null,
      })
    } else if (td < 0 && (!decisionDay || d.date >= decisionDay)) {
      // A date the research was waiting for has passed, and no newer research has replaced this plan
      // (a new run would have brought a new plan). Stays on until the research is run again.
      add({
        id: `results_out:${d.id}`, type: 'results_out',
        // Any dated event — results, a vote, a deadline, a maturity — so the words name the date, not "results".
        title: `${d.label}: the ${estimated ? 'expected ' : ''}date has passed`,
        detail: `${d.label} was ${when}, and no research has run since.`,
        checklist: checklist.length ? checklist : undefined,
        quote: quoteOf(d), source: sourceLabel(d), line: null,
      })
    }
  }

  // ---- the research itself ----
  if (decisionDay) {
    const age = daysBetween(decisionDay, today)
    if (age != null && age >= t.researchOldDays) {
      add({
        id: `research_old:${decisionDay}`, type: 'research_old', title: 'The research is getting old',
        detail: `It was written ${age} days ago, on ${decisionDay}.`,
        quote: null, source: null, line: null,
      })
    }
  }

  // ---- your own triggers ----
  for (const e of input.evals) {
    const trig = input.triggers.find((x) => x.trigger_id === e.trigger_id)
    if (!trig) continue
    if (trig.kind === 'event_date') {
      if (e.due) {
        add({ id: `your_date_due:${e.trigger_id}:${trig.due_date}`, type: 'your_date_due', title: 'Your date has come', detail: e.detail, quote: trig.note ?? null, source: 'your watchlist entry', line: null })
      } else if (!trig.acknowledged_at) {
        const td = tradingDaysUntil(today, trig.due_date)
        if (td != null && td >= 1 && td <= t.comingUpTradingDays) {
          add({ id: `your_date_coming:${e.trigger_id}:${trig.due_date}`, type: 'your_date_coming', title: `${trig.label} in ${td} trading day${td === 1 ? '' : 's'}`, detail: e.detail, quote: trig.note ?? null, source: 'your watchlist entry', line: null })
        }
      }
      continue
    }
    if (e.state === 'condition_met' && price != null) {
      add({
        id: `your_level_reached:${e.trigger_id}:${e.target?.value ?? ''}:${'direction' in trig ? trig.direction : 'at_or_below'}`, type: 'your_level_reached', title: 'Reached your price',
        detail: e.detail, quote: trig.note ?? null, source: 'your watchlist entry', line: e.target?.value ?? null,
        rises: 'direction' in trig && trig.direction === 'at_or_above',
      })
    }
  }

  // A buy call has had its one "buy now" message: from then on only its warnings are watched (operator
  // decision, 2026-09-15) — its own lines, dates, drops and age are no longer news. Your own triggers still are.
  if (plan && BUY_NOW_DECISIONS.has(plan.decision ?? '')) {
    const kept = new Set<ConditionType>(['bad_case_broken', 'cant_check', 'your_level_reached', 'your_date_due', 'your_date_coming'])
    for (let i = out.length - 1; i >= 0; i--) if (!kept.has(out[i].type)) out.splice(i, 1)
  }
  out.sort((a, b) => STATUS_RANK[CONDITION_STATUS[a.type]] - STATUS_RANK[CONDITION_STATUS[b.type]])
  // What you have already seen stays on the name and stops speaking for it: the status and the headline are
  // read off the conditions you have NOT seen. A name whose every standing condition is acknowledged is
  // watching again, until something new happens.
  for (const c of out) {
    c.can_ack = ACKNOWLEDGEABLE.has(c.type)
    c.seen_at = c.can_ack ? (input.seen?.[c.id] ?? null) : null
  }
  const live = out.filter((c) => !c.seen_at)
  const status: StatusWord = live.length ? CONDITION_STATUS[live[0].type] : 'waiting'
  return {
    status,
    status_label: STATUS_LABEL[status],
    conditions: out,
    headline: live[0]?.title ?? null,
    next_line: nextLine(prices, input, price, pricedIn),
    next_date: nextDate(dates, input, today),
  }
}

/** The nearest buy, look-again or fair price not yet reached — what the name is waiting for, in price. */
function nextLine(prices: PlanPrice[], input: EvaluateInput, price: number | null, pricedIn: string | null): NextLine | null {
  let best: NextLine | null = null
  let bestGap = Number.POSITIVE_INFINITY
  for (const p of prices) {
    if (p.role === 'bad_case') continue
    const line = priceLine(p)
    const sameCurrency = pricedIn != null && p.currency.toUpperCase() === pricedIn.toUpperCase()
    const gap = price != null && sameCurrency ? round1(((line - price) / price) * 100) : null
    const rank = gap == null ? 1e6 + (p.role === 'buy' ? 0 : p.role === 'look_again' ? 1 : 2) : Math.abs(gap)
    if (rank < bestGap) {
      bestGap = rank
      best = { role: p.role, label: ROLE_LABEL[p.role], text: priceText(p), gap_pct: gap }
    }
  }
  if (best) return best
  // your own price triggers, when the name has no plan price
  for (const e of input.evals) {
    if (e.target && e.gap_pct != null && Math.abs(e.gap_pct) < bestGap) {
      bestGap = Math.abs(e.gap_pct)
      best = { role: 'yours', label: 'Your price', text: money(e.target.currency, e.target.value), gap_pct: e.gap_pct }
    }
  }
  return best
}

function nextDate(dates: PlanDate[], input: EvaluateInput, today: string): NextDate | null {
  let best: NextDate | null = null
  const consider = (label: string, date: string, estimated: boolean) => {
    const d = daysBetween(today, date)
    if (d == null || d < 0) return
    if (!best || d < best.days_to) best = { label, date, days_to: d, estimated }
  }
  for (const d of dates) if (d.date) consider(d.label, d.date, d.estimated === true)
  for (const trig of input.triggers) if (trig.kind === 'event_date' && !trig.acknowledged_at) consider(trig.label, trig.due_date, false)
  return best
}
