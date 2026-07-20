// The Data Library's filter bar — FeedFilters pattern: exported state shape + pure matchers so the
// list filters identically wherever it's computed; controlled component (parent owns value+onChange).
// Pure client-side (the pipeline list is tiny). NO swarm or connector id appears here (§26 — the
// server-side datalibrary-purity guard scans this tree).
import { CADENCE_LABEL } from '../../lib/labels'
import type { PipelineEntry, RecommendedNeed } from '../../lib/types'

export interface DlFilterState {
  kind: string // '' = all | wired | recommended — set by the funnel seg, not the filter bar
  subject: string // '' = all
  status: string // '' = all | fresh | stale | missing | unknown — WIRED rows only (see matcher note)
  cadence: string // '' = all
  tier: string // '' = all — compared as String(tier)
  text: string // free text over series + provider (suggested-source name for recommended rows)
}

export const emptyDlFilters = (): DlFilterState => ({ kind: '', subject: '', status: '', cadence: '', tier: '', text: '' })

export const dlFiltersActive = (f: DlFilterState): boolean =>
  !!f.kind || !!f.subject || !!f.status || !!f.cadence || !!f.tier || !!f.text.trim()

export function matchesDlPipeline(row: PipelineEntry, f: DlFilterState): boolean {
  if (f.kind === 'recommended') return false
  if (f.subject && !row.subjects.includes(f.subject)) return false
  if (f.status && !row.statuses.some((s) => s.status === f.status)) return false
  if (f.cadence && row.cadence !== f.cadence) return false
  if (f.tier && String(row.tier) !== f.tier) return false
  if (f.text.trim()) {
    const q = f.text.trim().toLowerCase()
    if (!`${row.series} ${row.provider}`.toLowerCase().includes(q)) return false
  }
  return true
}

// A set STATUS filter excludes recommended rows: freshness is undefined for a need that has no
// pipeline yet — showing unwired needs under "stale" would fake a signal (pinned by dlFilters.test.ts).
export function matchesDlRecommended(row: RecommendedNeed, f: DlFilterState): boolean {
  if (f.kind === 'wired') return false
  if (f.status) return false
  if (f.subject && row.subject !== f.subject) return false
  if (f.cadence && row.cadence !== f.cadence) return false
  if (f.tier && String(row.tier) !== f.tier) return false
  if (f.text.trim()) {
    const q = f.text.trim().toLowerCase()
    if (!`${row.series} ${row.suggested_source.name}`.toLowerCase().includes(q)) return false
  }
  return true
}

export function DataLibraryFilters({ value, onChange, subjects, cadences, tiers }: {
  value: DlFilterState
  onChange: (f: DlFilterState) => void
  subjects: string[]
  cadences: string[]
  tiers: string[]
}) {
  const set = (patch: Partial<DlFilterState>) => onChange({ ...value, ...patch })
  return (
    <div className="ffilters datalib__filters">
      <select className="ffilters__sel" value={value.subject} onChange={(e) => set({ subject: e.target.value })} aria-label="Filter by subject">
        <option value="">all subjects</option>
        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="ffilters__sel" value={value.status} onChange={(e) => set({ status: e.target.value })} aria-label="Filter by freshness" title="Freshness applies to wired pipelines — a not-yet-wired recommendation has none">
        <option value="">any freshness</option>
        <option value="fresh">fresh</option>
        <option value="stale">stale</option>
        <option value="missing">missing</option>
        <option value="unknown">unknown</option>
      </select>
      <select className="ffilters__sel" value={value.cadence} onChange={(e) => set({ cadence: e.target.value })} aria-label="Filter by cadence">
        <option value="">any cadence</option>
        {cadences.map((c) => <option key={c} value={c}>{CADENCE_LABEL[c] ?? c}</option>)}
      </select>
      <select className="ffilters__sel" value={value.tier} onChange={(e) => set({ tier: e.target.value })} aria-label="Filter by source tier">
        <option value="">any tier</option>
        {tiers.map((t) => <option key={t} value={t}>tier {t}</option>)}
      </select>
      <input className="ffilters__text" value={value.text} placeholder="search series / provider…"
        onChange={(e) => set({ text: e.target.value })} aria-label="Search pipelines" />
      {dlFiltersActive(value) && (
        <button className="btn btn--ghost" onClick={() => onChange(emptyDlFilters())} title="Clear every filter">clear</button>
      )}
    </div>
  )
}
