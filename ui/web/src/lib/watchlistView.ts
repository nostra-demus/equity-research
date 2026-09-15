// The detail panel's reading rules for a name's own triggers, kept pure so they can be tested without a DOM
// and stated once rather than re-derived in every component.
//
// A distance is only honest with its unit: a price trigger's distance is a percentage of today's price, a
// dated trigger's is a count of days, and there is no exchange rate between them. So nothing here ever
// returns a bare number — a distance travels with its unit or it does not travel.
import type { WatchTrigger, WatchRow, WatchTriggerEval } from './types'

export interface Distance { unit: 'pct' | 'days'; value: number }

/**
 * The row's nearest distance. Prefers the server's unit-tagged `nearest`; falls back to the older
 * percent-only field so a bundle newer than its engine still shows price gaps rather than blanks.
 */
export function rowDistance(row: WatchRow): Distance | null {
  // A value that is not a finite number is not a distance. Both fields arrive over the wire (and from the
  // snapshot builder, which is a separate program), so a null, a string or a NaN is reachable without
  // anyone writing a bug here — and it must become an honest absence, rendered as "—" with a reason.
  const n = row.nearest
  if (n && (n.unit === 'pct' || n.unit === 'days') && Number.isFinite(n.value)) return { unit: n.unit, value: n.value }
  if (Number.isFinite(row.nearest_gap_pct as number)) return { unit: 'pct', value: row.nearest_gap_pct as number }
  return null
}

/**
 * The price a trigger actually fires at, in its own currency — the number the panel labels "target".
 *
 * Read off the STRUCTURED trigger, never off the eval's prose sentence: `price_level` states its level
 * outright, and `pct_drop` fires at a fixed fraction of a reference frozen at save time, so both are exact
 * rather than parsed. A dated trigger has no price and says so; a valuation trigger's anchor is a value, not
 * a price a quote can be compared to, so it is left to the eval line rather than mislabelled as a target.
 */
export function triggerTarget(t: WatchTrigger): { value: number; currency: string; how: string } | null {
  if (t.kind === 'price_level') {
    return { value: t.level, currency: t.currency, how: t.direction === 'at_or_below' ? 'at or below' : 'at or above' }
  }
  if (t.kind === 'pct_drop') {
    // the reference crosses the wire (and is rebuilt by the snapshot builder), so a missing or
    // non-numeric one is reachable without a bug here — and it must be an absence, not a NaN target
    if (!t.reference || !Number.isFinite(t.reference.value)) return null
    // Rounded to 2dp exactly as the server rounds it. Unrounded, 364.25 × 0.9 = 327.825 rendered as
    // "327.82" here while the server's own r2 gave "327.83" — the same quantity, two values, three
    // centimetres apart on one panel (§15). This path is only a fallback for an engine that predates
    // `eval.target`; when the server sends the number, that is what is shown.
    return { value: Math.round(t.reference.value * (1 - t.drop_pct / 100) * 100) / 100, currency: t.reference.currency, how: `−${t.drop_pct}% from ${t.reference.value}` }
  }
  return null
}

/**
 * The nearest PRICE-family trigger eval — the one both the target and the "still to move" distance are read
 * off, so they can never name two different triggers.
 *
 * `!= null` lets a NaN through, and a NaN difference makes the comparator inconsistent — which V8 does not
 * error on, it just returns an arbitrary order. Require a finite number instead of merely a present one, so
 * the "nearest" trigger is actually the nearest rather than whichever the sort happened to leave. A dated
 * trigger has a null `gap_pct` (its distance is days, not a price move) and is excluded here on purpose.
 */
function nearestPriceEval(row: WatchRow): WatchTriggerEval | null {
  const scored = (row.evals ?? [])
    .filter((e) => Number.isFinite(e.gap_pct as number))
    .sort((a, b) => Math.abs(a.gap_pct as number) - Math.abs(b.gap_pct as number))
  return scored[0] ?? null
}

/** The nearest trigger's target — the one the "still to move" figure is measured against. */
export function nearestTarget(row: WatchRow): { value: number; currency: string; how: string } | null {
  const first = nearestPriceEval(row)
  if (!first) return null
  // Prefer the server's own figure: it is the number the trigger was evaluated against, so the panel and
  // the trigger line can never quote two different prices for one threshold.
  if (first.target) return { value: first.target.value, currency: first.target.currency, how: first.target.basis }
  const t = (row.triggers ?? []).find((x) => x.trigger_id === first.trigger_id)
  return t ? triggerTarget(t) : null
}

/**
 * "Still to move" — the distance to the SAME trigger `nearestTarget` names, so the panel's target and its
 * distance can never describe two different triggers.
 *
 * The trap this closes: `distanceLabel`/`rowDistance` read `row.nearest`, which the server ranks across
 * units (a price gap AND a day-count together), so on a row carrying both a price alert and a nearer dated
 * trigger it returns the DATE — while `nearestTarget` returns the PRICE target. Pairing the two then reads
 * "2d — to that target", a day-count mislabelled as movement to a price (§15). This measures against the
 * nearest price target when there is one, and degrades honestly otherwise.
 */
export function stillToMove(row: WatchRow): { label: string; caption: string } {
  if (row.state === 'condition_met') return { label: 'FIRED', caption: 'already there' }
  const first = nearestPriceEval(row)
  if (first && nearestTarget(row)) {
    const g = first.gap_pct as number
    const sign = g > 0 ? '+' : g < 0 ? '−' : ''
    return { label: `${sign}${Math.abs(g)}%`, caption: 'to that target' }
  }
  // No price target: the nearest thing is a date (show its day-distance) or nothing at all.
  const d = rowDistance(row)
  if (d?.unit === 'days') return { label: distanceLabel(row), caption: 'until it comes due' }
  if (d) return { label: distanceLabel(row), caption: 'to the nearest trigger' }
  return { label: '—', caption: 'nothing measurable' }
}

/**
 * A distance in words: `FIRED` for a met condition, `today` for a date that has arrived, `8d` for a date
 * ahead, a signed percent for a price gap, and `—` when nothing is measurable. An overdue date reads as its
 * own words rather than a negative day count, because "−3d" invites being read as a distance still to travel
 * when it is the opposite.
 */
export function distanceLabel(row: WatchRow): string {
  if (row.state === 'condition_met') return 'FIRED'
  const d = rowDistance(row)
  if (!d) return '—'
  if (d.unit === 'days') {
    if (d.value === 0) return 'today'
    return d.value < 0 ? `${Math.abs(d.value)}d late` : `${d.value}d`
  }
  return `${d.value > 0 ? '+' : d.value < 0 ? '−' : ''}${Math.abs(d.value)}%`
}

/** The plain-English reason a row shows no distance, taken from the trigger that could not be evaluated. */
export function absenceReason(row: WatchRow): string | null {
  if (rowDistance(row)) return null
  if (!row.evals?.length) return 'No trigger set — reminder only.'
  const e: WatchTriggerEval | undefined = row.evals.find((x: WatchTriggerEval) => x.state === 'not_evaluable')
  return e?.detail ?? 'Nothing on this row can be checked against a price.'
}
