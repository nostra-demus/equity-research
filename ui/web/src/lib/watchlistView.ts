// The tile grid's reading rules, kept pure so they can be tested without a DOM and stated once rather
// than re-derived in every component that draws a tile.
//
// The grid's whole premise is that one number per name is enough to decide where to look. That only holds
// if the number is honest about its unit: a price trigger's distance is a percentage of today's price, a
// dated trigger's is a count of days, and there is no exchange rate between them. So nothing here ever
// returns a bare number — a distance travels with its unit or it does not travel.
import type { WatchRow, WatchTriggerEval } from './types'

/** A price trigger this close, or a date this near, is "near" — the equivalence is a judgment, made once. */
export const NEAR_PCT = 5
export const NEAR_DAYS = 7

export type TileBand = 'met' | 'due' | 'near' | 'waiting' | 'noeval'

export interface Distance { unit: 'pct' | 'days'; value: number }

/**
 * The distance the tile prints. Prefers the server's unit-tagged `nearest`; falls back to the older
 * percent-only field so a bundle newer than its engine still shows price gaps rather than blanks.
 */
export function rowDistance(row: WatchRow): Distance | null {
  if (row.nearest && (row.nearest.unit === 'pct' || row.nearest.unit === 'days')) return row.nearest
  if (row.nearest_gap_pct != null) return { unit: 'pct', value: row.nearest_gap_pct }
  return null
}

/**
 * Which urgency block a name belongs in. Bands — not the raw numbers — are what let percent-distanced and
 * day-distanced names share one grid: "near" means within 5% OR within 7 days, and both halves of that
 * sentence are equally true.
 *
 * A dated trigger is never `met`: it comes due and a human clears it, which is why a due date reaching 0
 * lands in `due` rather than `met` (the server draws the same distinction).
 */
export function tileBand(row: WatchRow): TileBand {
  if (row.state === 'condition_met') return 'met'
  if (row.state === 'due') return 'due'
  const d = rowDistance(row)
  if (!d) return row.state === 'not_evaluable' ? 'noeval' : 'waiting'
  if (d.unit === 'days') return d.value <= NEAR_DAYS ? 'near' : 'waiting'
  return Math.abs(d.value) <= NEAR_PCT ? 'near' : 'waiting'
}

/**
 * A single 0-and-up scale used ONLY to order tiles. 0 = there already, 1 = exactly at the near threshold
 * in whichever unit applies. It is never displayed: a number that has quietly mixed percent and days is
 * not a fact about anything, and printing it would invite exactly the comparison the units forbid (§15).
 */
export function urgencyRank(row: WatchRow): number {
  const band = tileBand(row)
  if (band === 'met') return 0
  if (band === 'due') return 0.01
  const d = rowDistance(row)
  if (!d) return Number.POSITIVE_INFINITY
  return d.unit === 'days' ? Math.max(0, d.value) / NEAR_DAYS : Math.abs(d.value) / NEAR_PCT
}

/** Fired first, then nearest, then everything unmeasurable — ties broken by ticker so the grid is stable. */
export function sortForGrid(rows: WatchRow[]): WatchRow[] {
  return [...rows].sort((a, b) => {
    const ra = urgencyRank(a), rb = urgencyRank(b)
    if (ra !== rb) return ra - rb
    return a.ticker.localeCompare(b.ticker)
  })
}

/**
 * What the tile prints, big. `FIRED` for a met condition, `today` for a date that has arrived, `8d` for a
 * date ahead, a signed percent for a price gap, and `—` when nothing is measurable. An overdue date reads
 * as its own words rather than a negative day count, because "−3d" invites being read as a distance still
 * to travel when it is the opposite.
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

/** The plain-English reason a tile shows no number, taken from the trigger that could not be evaluated. */
export function absenceReason(row: WatchRow): string | null {
  if (rowDistance(row)) return null
  if (!row.evals.length) return 'No trigger set — reminder only.'
  const e: WatchTriggerEval | undefined = row.evals.find((x: WatchTriggerEval) => x.state === 'not_evaluable')
  return e?.detail ?? 'Nothing on this row can be checked against a price.'
}

/** The one-line trigger caption under the number, so the figure explains itself rather than needing a key. */
export function triggerCaption(row: WatchRow): string {
  if (!row.evals.length) return 'no trigger'
  let best: WatchTriggerEval | null = null
  let bestRank = Number.POSITIVE_INFINITY
  for (const e of row.evals) {
    const r = e.state === 'condition_met' ? 0
      : e.days_to != null ? (e.days_to <= 0 ? 0 : e.days_to / NEAR_DAYS)
        : e.gap_pct != null ? Math.abs(e.gap_pct) / NEAR_PCT
          : Number.POSITIVE_INFINITY
    if (r < bestRank) { best = e; bestRank = r }
  }
  const e = best ?? row.evals[0]
  return e.kind === 'event_date' ? 'date'
    : e.kind === 'price_level' ? 'price level'
      : e.kind === 'pct_drop' ? 'drop from ref'
        : 'margin of safety'
}
