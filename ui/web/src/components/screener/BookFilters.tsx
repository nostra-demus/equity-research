// The live-book filter + sort bar (the Recent-runs drawer). Pure client-side — the book is a handful
// of rows — modelled on FeedFilters so both surfaces filter with the same idiom. The filter STATE
// (BookFilterState/BookSort) lives in types.ts so the Zustand store can hold it without an import
// cycle; the helpers, the predicate, and the comparator live here next to the component that uses them.

import type { BoardSignal, BoardThesis, BookFilterState, BookSort } from '../../lib/types'
import { ALL_THEMES, horizonBucket, plainTheme } from '../../lib/plain'
import { daysUntil } from './ConvictionCard'

// One live-book row: a checked event (signal) joined to its thesis (if it produced one).
export interface BookRow {
  s: BoardSignal
  t?: BoardThesis
}

export const emptyBookFilters = (): BookFilterState => ({
  stage: '', themes: new Set(),
  climbing: false, cooling: false, proven: false, strong: false, needsAttention: false, hasCompanies: false,
  horizon: '', checkpoint: '', source: '', text: '',
})

export const bookFiltersActive = (f: BookFilterState): boolean =>
  !!f.stage || f.themes.size > 0 || f.climbing || f.cooling || f.proven || f.strong || f.needsAttention || f.hasCompanies ||
  !!f.horizon || !!f.checkpoint || !!f.source || !!f.text.trim()

// Normalise an effective status into one of the four funnel stages (watching is the residual bucket).
export function stageOf(row: BookRow): string {
  const eff = row.t?.effective_status || row.t?.status || row.s.status || ''
  if (eff.startsWith('watchlist') || eff === 'watching') return 'watching'
  if (eff === 'provisional' || eff === 'full_machine' || eff === 'handed_off') return eff
  return eff
}

// The whole filter predicate over a joined row. Used for live AND archived rows.
export function matchesBookFilters(row: BookRow, f: BookFilterState): boolean {
  const { s, t } = row
  const c = t?.conviction
  if (f.stage && stageOf(row) !== f.stage) return false
  if (f.themes.size > 0 && !(s.event_types || []).some((e) => f.themes.has(e))) return false
  if (f.climbing && !(c?.validated && c.upgrade_velocity > 0)) return false
  if (f.cooling && !(c?.validated && c.upgrade_velocity < 0)) return false
  if (f.proven && !((c?.progress_confirmed ?? 0) > 0)) return false
  if (f.strong && !((c?.edge_score_live ?? t?.edge_score ?? 0) >= 80)) return false
  if (f.needsAttention) {
    const overdue = c?.next_checkpoint?.due_at ? (daysUntil(c.next_checkpoint.due_at) ?? 1) < 0 : false
    if (!(c?.stale || c?.insufficient || overdue)) return false
  }
  if (f.hasCompanies && !((t?.candidate_count ?? 0) > 0)) return false
  if (f.horizon && horizonBucket(t?.horizon) !== f.horizon) return false
  if (f.checkpoint) {
    const d = daysUntil(c?.next_checkpoint?.due_at ?? null)
    if (d == null) return false
    if (f.checkpoint === 'overdue' && !(d < 0)) return false
    if (f.checkpoint === 'soon' && !(d >= 0 && d <= 7)) return false
    if (f.checkpoint === 'month' && !(d >= 0 && d <= 30)) return false
  }
  if (f.source && (s.source_name || '') !== f.source) return false
  if (f.text.trim()) {
    const q = f.text.trim().toLowerCase()
    const hay = `${s.headline} ${(t?.candidates || []).map((cand) => `${cand.company_name} ${cand.ticker}`).join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

// The sort comparator. Missing keys always fall to the bottom (a not-yet-tested row has no rank/
// velocity); every mode shares a stable tie-break (rank → newest → id) so rows don't jitter on the
// 30s board refresh. `rank` reproduces the panel's original default order.
export function bookComparator(sort: BookSort): (a: BookRow, b: BookRow) => number {
  const procOf = (r: BookRow) => r.s.processed_at || ''
  const tiebreak = (a: BookRow, b: BookRow): number => {
    const ra = a.t?.conviction?.rank_score, rb = b.t?.conviction?.rank_score
    if (ra != null && rb != null && ra !== rb) return rb - ra
    if (ra != null && rb == null) return -1
    if (rb != null && ra == null) return 1
    const pa = procOf(a), pb = procOf(b)
    if (pa !== pb) return pa < pb ? 1 : -1
    return (a.s.signal_id || '') < (b.s.signal_id || '') ? 1 : -1
  }
  if (sort === 'newest') {
    return (a, b) => { const pa = procOf(a), pb = procOf(b); return pa !== pb ? (pa < pb ? 1 : -1) : tiebreak(a, b) }
  }
  if (sort === 'checkpoint') {
    const due = (r: BookRow) => { const d = r.t?.conviction?.next_checkpoint?.due_at; const t = d ? new Date(d).getTime() : NaN; return isNaN(t) ? Infinity : t }
    return (a, b) => { const da = due(a), db = due(b); return da !== db ? da - db : tiebreak(a, b) }
  }
  const key = (r: BookRow): number => {
    const c = r.t?.conviction
    switch (sort) {
      case 'edge': { const v = c?.edge_score_live ?? r.t?.edge_score; return v == null ? -Infinity : v }
      case 'velocity': return !c || !c.validated ? -Infinity : c.upgrade_velocity
      case 'proven': { const v = c?.proximity_pct; return v == null ? -Infinity : v }
      case 'rank':
      default: { const v = c?.rank_score; return v == null ? -Infinity : v }
    }
  }
  return (a, b) => { const ka = key(a), kb = key(b); return ka !== kb ? kb - ka : tiebreak(a, b) }
}

const CHIPS: { key: 'climbing' | 'cooling' | 'proven' | 'strong' | 'needsAttention' | 'hasCompanies'; label: string; title: string }[] = [
  { key: 'climbing', label: 'Climbing', title: 'Idea strength rising on the last check' },
  { key: 'cooling', label: 'Cooling', title: 'Idea strength falling on the last check' },
  { key: 'proven', label: 'Has proof', title: 'At least one proof point has come back our way' },
  { key: 'strong', label: 'Strong ≥80', title: 'Idea strength of 80 or higher' },
  { key: 'needsAttention', label: 'Needs attention', title: 'A check is overdue, frozen, or waiting on a source' },
  { key: 'hasCompanies', label: 'Has companies', title: 'At least one company has been named' },
]
const SORTS: { key: BookSort; label: string }[] = [
  { key: 'rank', label: 'Conviction' },
  { key: 'edge', label: 'Strongest idea' },
  { key: 'velocity', label: 'Climbing fastest' },
  { key: 'checkpoint', label: 'Next check soonest' },
  { key: 'proven', label: 'Most proven' },
  { key: 'newest', label: 'Newest checked' },
]
const HORIZONS: { key: string; label: string }[] = [
  { key: 'short', label: 'days–weeks' },
  { key: 'medium', label: 'weeks–3 months' },
  { key: 'long', label: '3 months+' },
]
const CHECKPOINTS: { key: string; label: string }[] = [
  { key: 'overdue', label: 'check overdue' },
  { key: 'soon', label: 'due ≤ 7 days' },
  { key: 'month', label: 'due ≤ 30 days' },
]

export function BookFilters({
  value, onChange, sort, onSortChange, sources, themesAvailable,
}: {
  value: BookFilterState
  onChange: (f: BookFilterState) => void
  sort: BookSort
  onSortChange: (s: BookSort) => void
  sources: string[]
  themesAvailable: boolean
}) {
  const set = (patch: Partial<BookFilterState>) => onChange({ ...value, ...patch })
  const toggleChip = (key: (typeof CHIPS)[number]['key']) => {
    if (key === 'climbing') return set({ climbing: !value.climbing, cooling: false })
    if (key === 'cooling') return set({ cooling: !value.cooling, climbing: false })
    set({ [key]: !value[key] } as Partial<BookFilterState>)
  }
  const toggleTheme = (t: string) => {
    const themes = new Set(value.themes)
    themes.has(t) ? themes.delete(t) : themes.add(t)
    set({ themes })
  }
  return (
    <div className="ffilters ffilters--book">
      {themesAvailable && (
        <div className="ffilters__themes">
          {ALL_THEMES.map((t) => (
            <button key={t} className={`chip ffilters__theme${value.themes.has(t) ? ' ffilters__theme--on' : ''}`} onClick={() => toggleTheme(t)} title="Show only this theme (click again to clear)">
              {plainTheme(t)}
            </button>
          ))}
        </div>
      )}
      <div className="ffilters__row">
        {CHIPS.map((ch) => (
          <button key={ch.key} className={`chip ffilters__theme${value[ch.key] ? ' ffilters__theme--on' : ''}`} onClick={() => toggleChip(ch.key)} title={ch.title}>
            {ch.label}
          </button>
        ))}
      </div>
      <div className="ffilters__row">
        <span className="ffilters__lead">Sort</span>
        <select className="ffilters__sel" value={sort} onChange={(e) => onSortChange(e.target.value as BookSort)} title="Order the ideas by">
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select className="ffilters__sel" value={value.horizon} onChange={(e) => set({ horizon: e.target.value })} title="Time horizon of the idea">
          <option value="">any horizon</option>
          {HORIZONS.map((h) => (
            <option key={h.key} value={h.key}>{h.label}</option>
          ))}
        </select>
        <select className="ffilters__sel" value={value.checkpoint} onChange={(e) => set({ checkpoint: e.target.value })} title="When the next proof point is due">
          <option value="">any next check</option>
          {CHECKPOINTS.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        {sources.length > 1 && (
          <select className="ffilters__sel" value={value.source} onChange={(e) => set({ source: e.target.value })} title="News source">
            <option value="">all sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <input className="ffilters__text" value={value.text} placeholder="search headline or company…" onChange={(e) => set({ text: e.target.value })} />
        {bookFiltersActive(value) && (
          <button className="btn btn--ghost ffilters__clear" onClick={() => onChange(emptyBookFilters())}>
            clear
          </button>
        )}
      </div>
    </div>
  )
}
