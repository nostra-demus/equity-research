// One name in the tile grid.
//
// The grid's premise is that a single figure per name is enough to decide where to look, so the tile shows
// the distance to the nearest trigger and almost nothing else. What it deliberately does NOT show is the
// why-text, the verdict wording and the review date: those are the table's job and the detail panel's.
// Putting them back here would rebuild the row that made 50 names unreadable.
//
// Two rules the tile must not break. The figure carries its unit — a percent for a price trigger, days for
// a dated one — because there is no exchange rate between them (§15). And an unmeasurable name shows a
// dash with a reason on hover, never a zero: absence is a finding, not a quiet pass (§3).
import type { WatchRow } from '../../lib/types'
import { absenceReason, distanceLabel, tileBand, triggerCaption } from '../../lib/watchlistView'
import { decisionColor } from '../../lib/format'
import { shortDay } from '../../lib/format'

export function WatchTile({ row, selected, onSelect }: {
  row: WatchRow
  selected: boolean
  onSelect: (key: string) => void
}) {
  const band = tileBand(row)
  const label = distanceLabel(row)
  const absent = absenceReason(row)
  const verdict = row.engine?.decision ?? null
  // A date you have already passed is the most actionable thing on a row, so it is marked on the tile even
  // though the tile is otherwise silent about review dates.
  const reviewHot = !!row.review_date && row.review_date <= new Date().toISOString().slice(0, 10)
  const isArchived = !!row.archive && !row.resurfaced

  return (
    <button
      type="button"
      className={`wtile wtile--${band}${selected ? ' wtile--sel' : ''}${isArchived ? ' wtile--archived' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(row.listing_key)}
      title={absent ?? `${row.company_name ?? row.ticker} — ${row.evals?.[0]?.detail ?? 'no trigger set'}`}
    >
      <span className="wtile__top">
        <span className="wtile__sym">{row.ticker}</span>
        {row.origin !== 'engine' && <span className="wtile__mine" aria-label="you added this">·</span>}
        {reviewHot && <span className="wtile__hot" aria-label="review due">●</span>}
      </span>
      <span className={`wtile__big${band === 'met' ? ' wtile__big--met' : band === 'near' ? ' wtile__big--near' : ''}${label === '—' ? ' wtile__big--none' : ''}`}>
        {label}
      </span>
      {/* the trigger under the number, so the figure explains itself instead of needing a legend */}
      <span className="wtile__cap">{triggerCaption(row)}</span>
      <span className="wtile__foot">
        <span className="wtile__vdot" style={{ background: verdict ? decisionColor(verdict) : 'var(--text-faint)' }} aria-hidden />
        <span className="wtile__rev">{row.review_date ? shortDay(row.review_date) : '—'}</span>
      </span>
    </button>
  )
}
