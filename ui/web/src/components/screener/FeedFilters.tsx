// The shared filter bar for scanner output — full-size on the News wire, compact on the Idea
// board's Inbox lane. Pure client-side filtering (the data volumes are tiny); the matching helper
// is exported so both views filter identically.

import { ALL_THEMES, plainBand, plainLinkage, plainRegion, plainSize, plainTheme } from '../../lib/plain'
import { GICS_SECTORS, gicsOf, gicsSubSectorsFor } from '../../lib/gics'

export interface FeedFilterState {
  themes: Set<string>
  region: string // '' = all — LEGACY 8-bucket region (still used by the full "watch live" wire)
  country: string // '' = all — ISO alpha-2; the leaf of the rail's Continent → Country geography drill-down
  geoRegion: string // '' = all — a continent group; the branch of the geography drill-down
  source: string // '' = all
  band: string // '' = all | pick | watch | drop
  size: string // '' = all
  linkage: string // '' = all
  gicsSector: string // '' = all — a GICS sector (the 11 top-level industries)
  gicsSubSector: string // '' = all — a sub-sector within gicsSector (only meaningful when a sector is picked)
  text: string
}

export const emptyFilters = (): FeedFilterState => ({ themes: new Set(), region: '', country: '', geoRegion: '', source: '', band: '', size: '', linkage: '', gicsSector: '', gicsSubSector: '', text: '' })

export const filtersActive = (f: FeedFilterState): boolean =>
  f.themes.size > 0 || !!f.region || !!f.country || !!f.geoRegion || !!f.source || !!f.band || !!f.size || !!f.linkage || !!f.gicsSector || !!f.gicsSubSector || !!f.text.trim()

// The structured filter that triggers ARCHIVE search (the whole-history, server-side read) — everything
// except the legacy `region` (which only narrows the live wire). When none of these is set, the rail
// stays in LIVE mode (the 2-day SSE wire). Mirrors the server-side dimensions in news/feed-filter.ts
// (hasAnyFilter) — including `band`, so a kept/dropped-only filter also searches the whole archive.
export const archiveFiltersActive = (f: FeedFilterState): boolean =>
  f.themes.size > 0 || !!f.country || !!f.geoRegion || !!f.source || !!f.band || !!f.size || !!f.linkage || !!f.gicsSector || !!f.gicsSubSector || !!f.text.trim()

// A tailored empty-wire line when a GICS filter is active and nothing shows. GICS tags are matched from
// the headline, so a thinly-covered sector reads empty even on a busy wire — say so, instead of the
// generic "nothing matches" which can't tell "no such news" from "nothing got tagged". Null when no GICS
// filter is set (the caller falls back to its generic message). Caller gates this on the wire being non-empty.
export const gicsEmptyMessage = (f: FeedFilterState): string | null => {
  if (!f.gicsSector && !f.gicsSubSector) return null
  const label = `${f.gicsSector}${f.gicsSubSector ? ` → ${f.gicsSubSector}` : ''}`
  return `Nothing here matches ${label} right now — GICS tags are read from the headline, so a quiet corner of the market can read empty even when the rest of the wire is busy.`
}

// The minimal shape both FeedItem and BoardInboxRow satisfy.
export interface Filterable {
  headline: string
  headline_en?: string | null // English translation (server news/lang.ts) — searched alongside the original
  source_name?: string
  region?: string
  band?: string
  triage_score?: number | null
  event_types?: string[]
  size_bucket?: string
  issuer_linkage?: string
  companies?: { name: string; ticker: string | null }[]
}

export function matchesFilters(it: Filterable, f: FeedFilterState): boolean {
  if (f.themes.size > 0 && !(it.event_types || []).some((t) => f.themes.has(t))) return false
  if (f.region && (it.region || '') !== f.region) return false
  if (f.source && (it.source_name || '') !== f.source) return false
  if (f.band) {
    const band = it.band || (typeof it.triage_score === 'number' ? (it.triage_score >= 70 ? 'pick' : it.triage_score >= 40 ? 'watch' : 'drop') : '')
    if (band !== f.band) return false
  }
  if (f.size && (it.size_bucket || 'unknown') !== f.size) return false
  if (f.linkage && (it.issuer_linkage || '') !== f.linkage) return false
  // GICS: classify lazily — only when a sector/sub-sector filter is actually set (keeps the common,
  // unfiltered path free of any work over a multi-thousand-item archive).
  if (f.gicsSector || f.gicsSubSector) {
    const g = gicsOf(it)
    if (f.gicsSector && !g.sectors.has(f.gicsSector)) return false
    if (f.gicsSubSector && !g.subSectors.has(f.gicsSubSector)) return false
  }
  if (f.text.trim()) {
    const q = f.text.trim().toLowerCase()
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

const REGIONS = ['US', 'IN', 'JP', 'GB', 'CN', 'KR', 'GLOBAL', 'OTHER']
const SIZES = ['mega', 'large', 'mid', 'small', 'unknown']
const LINKAGES = ['primary', 'secondary', 'sector', 'macro']
const BANDS = ['pick', 'watch', 'drop']

export function FeedFilters({
  value,
  onChange,
  sources,
  compact = false,
}: {
  value: FeedFilterState
  onChange: (f: FeedFilterState) => void
  sources: string[] // distinct source names present in the data
  compact?: boolean // the rail variant: themes + text + size (no band/source/linkage; region lives in the rail's own Geography dropdown)
}) {
  const set = (patch: Partial<FeedFilterState>) => onChange({ ...value, ...patch })
  const toggleTheme = (t: string) => {
    const themes = new Set(value.themes)
    if (themes.has(t)) themes.delete(t)
    else themes.add(t)
    set({ themes })
  }
  return (
    <div className={`ffilters${compact ? ' ffilters--compact' : ''}`}>
      <div className="ffilters__themes">
        {ALL_THEMES.map((t) => (
          <button key={t} className={`chip ffilters__theme${value.themes.has(t) ? ' ffilters__theme--on' : ''}`} onClick={() => toggleTheme(t)} title="Show only this theme (click again to clear)">
            {plainTheme(t)}
          </button>
        ))}
      </div>
      <div className="ffilters__row">
        <input className="ffilters__text" value={value.text} placeholder="search headline or company…" onChange={(e) => set({ text: e.target.value })} />
        {!compact && (
          <select className="ffilters__sel" value={value.band} onChange={(e) => set({ band: e.target.value })} title="Kept or dropped">
            <option value="">kept + dropped</option>
            {BANDS.map((b) => (
              <option key={b} value={b}>
                {plainBand(b)}
              </option>
            ))}
          </select>
        )}
        {!compact && (
          <select className="ffilters__sel" value={value.region} onChange={(e) => set({ region: e.target.value })} title="Region">
            <option value="">all regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {plainRegion(r)}
              </option>
            ))}
          </select>
        )}
        {!compact && (
          <select className="ffilters__sel" value={value.source} onChange={(e) => set({ source: e.target.value })} title="Source">
            <option value="">all sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {/* GICS sector → sub-sector drill-down. Picking a sector unlocks its sub-sectors; changing the
            sector clears the sub-sector so the pair is never inconsistent. */}
        <select
          className="ffilters__sel"
          value={value.gicsSector}
          onChange={(e) => set({ gicsSector: e.target.value, gicsSubSector: '' })}
          title="GICS sector — the 11 standard industry groups"
        >
          <option value="">any sector</option>
          {GICS_SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="ffilters__sel"
          value={value.gicsSubSector}
          onChange={(e) => set({ gicsSubSector: e.target.value })}
          disabled={!value.gicsSector}
          title={value.gicsSector ? `Sub-sector within ${value.gicsSector}` : 'Pick a sector first to narrow by sub-sector'}
        >
          <option value="">{value.gicsSector ? 'all sub-sectors' : 'sub-sector…'}</option>
          {gicsSubSectorsFor(value.gicsSector).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="ffilters__sel" value={value.size} onChange={(e) => set({ size: e.target.value })} title="Guessed company size">
          <option value="">any size</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {plainSize(s)}
            </option>
          ))}
        </select>
        {!compact && (
          <select className="ffilters__sel" value={value.linkage} onChange={(e) => set({ linkage: e.target.value })} title="Who the news hits">
            <option value="">any target</option>
            {LINKAGES.map((l) => (
              <option key={l} value={l}>
                {plainLinkage(l)}
              </option>
            ))}
          </select>
        )}
        {filtersActive(value) && (
          <button className="btn btn--ghost ffilters__clear" onClick={() => onChange(emptyFilters())}>
            clear
          </button>
        )}
      </div>
    </div>
  )
}
