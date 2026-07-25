// The shared filter bar for scanner output — full-size on the News wire, compact on the Idea
// board's Inbox lane. Pure client-side filtering (the data volumes are tiny); the matching helper
// is exported so both views filter identically.

import { ALL_THEMES, plainBand, plainLinkage, plainRegion, plainSize, plainTheme } from '../../lib/plain'
import { GICS_SECTORS, gicsOf, gicsSubSectorsFor } from '../../lib/gics'
import type { CompanyFacet, SymbolGroup } from '../../lib/api'
import { companyNameMatches, nameOccurs, pickTickerSet, tickerHitAny } from '../../lib/symbology'
import { CompanyFilter, resolveKeywordCompanies, type CompanyPick } from './CompanyFilter'

export type { CompanyPick } from './CompanyFilter'
// re-exported so a surface gets the whole filter vocabulary (predicate + the keyword's ticker reading) from
// one module, the way it already gets matchesFilters/archiveFiltersActive
export { resolveKeywordCompanies }
// nameOccurs moved to lib/symbology (shared with the company clause helpers); re-exported for compat.
export { nameOccurs }

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
  company: CompanyPick | null // null = all — a specific company picked by ticker (see CompanyFilter); matches by ticker OR name
  text: string
}

export const emptyFilters = (): FeedFilterState => ({ themes: new Set(), region: '', country: '', geoRegion: '', source: '', band: '', size: '', linkage: '', gicsSector: '', gicsSubSector: '', company: null, text: '' })

export const filtersActive = (f: FeedFilterState): boolean =>
  f.themes.size > 0 || !!f.region || !!f.country || !!f.geoRegion || !!f.source || !!f.band || !!f.size || !!f.linkage || !!f.gicsSector || !!f.gicsSubSector || !!f.company || !!f.text.trim()

// The structured filter that triggers ARCHIVE search (the whole-history, server-side read) — everything
// except the legacy `region` (which only narrows the live wire). When none of these is set, the rail
// stays in LIVE mode (the 2-day SSE wire). Mirrors the server-side dimensions in news/feed-filter.ts
// (hasAnyFilter) — including `band`, so a kept/dropped-only filter also searches the whole archive.
export const archiveFiltersActive = (f: FeedFilterState): boolean =>
  f.themes.size > 0 || !!f.country || !!f.geoRegion || !!f.source || !!f.band || !!f.size || !!f.linkage || !!f.gicsSector || !!f.gicsSubSector || !!f.company || !!f.text.trim()

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
  companies?: { name: string; ticker: string | null; listing_country?: string | null }[]
}

// Is the pick-a-company clause actually ON? Ticker OR name OR a non-empty alias list (name OR ticker
// aliases) — an alias-only pick must still activate the clause rather than silently no-op (lockstep with
// the server's companyClauseSet, ui/server/src/news/feed-filter.ts — Codex review, PR #319).
export function companyClauseSet(company: CompanyPick | null | undefined): boolean {
  return !!(company && (company.ticker || company.name || company.aliases?.length || company.tickerAliases?.length))
}

// Do a picked company's definite listing_country and an item's OWN definite listing_country for its ticker
// tag DISAGREE? Only a genuine, evidenced conflict counts (both sides non-null and different) — unknown on
// either side is never a mismatch. Lockstep with the server's listingConflicts (feed-filter.ts). Tells apart
// two different issuers reusing the same ticker letters on different exchanges (Codex review, PR #319).
export function listingConflicts(picked: string | null | undefined, itemCountry: string | null | undefined): boolean {
  return !!picked && !!itemCountry && picked !== itemCountry
}

// The item's searchable blob: headline + its English translation + every tagged company's name and ticker.
// One definition, so the company clause and the free-text clause can never drift apart on what they read.
const blobOf = (it: Filterable): string =>
  `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()

// Does the item satisfy a company clause? Any of the pick's ticker spellings (the picked symbol + its
// cross-listing tickerAliases; exact or exchange-suffix-equivalent), each hit still subject to the
// listing-country conflict guard — OR the company named whole-word (legal-suffix-tolerant) under its picked
// name or any name alias. Twin of the server's matchesCompany (feed-filter.ts); shared here by the
// pick-a-company clause and the keyword-read-as-a-ticker clause so both mean exactly the same thing.
export function companyMatches(it: Filterable, company: CompanyPick): boolean {
  const picks = pickTickerSet({ ticker: company.ticker, aliases: company.tickerAliases })
  const tickerHit = picks.length > 0 && (it.companies || []).some((c) => tickerHitAny(c.ticker, picks) && !listingConflicts(company.listingCountry, c.listing_country))
  const names = [company.name, ...(company.aliases || [])].filter((s): s is string => !!s)
  return tickerHit || names.some((n) => companyNameMatches(blobOf(it), n))
}

// The LIVE-window twin of the server's matchesFeedFilters (ui/server/src/news/feed-filter.ts) — keep the
// clauses in lockstep. The server's wire clauses (scope / commodities / wireScope) intentionally have no
// twin HERE: on the live rail those are applied by lib/wire.ts (itemOnWire + the subject chips), and in
// archive mode the server applies them — one owner per surface, no double-filtering.
//
// `textAs` is the ticker→company reading of the typed keyword (CompanyFilter.resolveKeywordCompanies),
// derived by the surface that owns the company facet and passed in rather than stored on the filter state,
// because it is DERIVED from `f.text` — never something the user set. It rides into the archive query as the
// `textAs` param, so this predicate and the server's agree on the same widened text clause. Absent (an older
// caller, or the facet not loaded yet) simply means the pre-existing literal-substring behaviour.
export function matchesFilters(it: Filterable, f: FeedFilterState, textAs: CompanyPick[] = []): boolean {
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
  // Pick-a-company (the ticker autofill): the item passes when it is tagged with ANY of the pick's ticker
  // spellings — the picked symbol + its cross-listing tickerAliases, exact or exchange-suffix-equivalent
  // (a pick of the ADR NHYDY carries Oslo's NHY.OL, so the tag NHY still hits), each hit still subject to
  // the listing-country conflict guard — OR its headline/company blob NAMES the company (whole-word,
  // legal-suffix-tolerant) under its picked name or any known name alias. Any clause alone qualifies, so a
  // picked suggestion has strictly ≥ the recall of typing just the name. The gate + helpers (lib/symbology)
  // mirror the server's matchesFeedFilters company clause exactly.
  if (companyClauseSet(f.company) && !companyMatches(it, f.company!)) return false
  if (f.text.trim()) {
    const q = f.text.trim().toLowerCase()
    // literal substring OR — when the keyword is really a ticker — the company that symbol names
    if (!blobOf(it).includes(q) && !textAs.some((c) => companyClauseSet(c) && companyMatches(it, c))) return false
  }
  return true
}

/** The one-line, plain-English note a surface shows when a typed keyword was read as a ticker — so the extra
 *  results are never unexplained magic ("why is Prime Day news showing for AMZN?"). Null when nothing was
 *  read that way. */
export function keywordReadAsNote(text: string, textAs: CompanyPick[]): string | null {
  const typed = text.trim()
  if (!typed || !textAs.length) return null
  const names = textAs.map((c) => (c.ticker && c.name ? `${c.name} (${c.ticker})` : c.name || c.ticker || '')).filter(Boolean)
  return `Read “${typed}” as a ticker — also showing news about ${names.join(' and ')}, however it is spelled.`
}

const REGIONS = ['US', 'IN', 'JP', 'GB', 'CN', 'KR', 'GLOBAL', 'OTHER']
const SIZES = ['mega', 'large', 'mid', 'small', 'unknown']
const LINKAGES = ['primary', 'secondary', 'sector', 'macro']
const BANDS = ['pick', 'watch', 'drop']

export function FeedFilters({
  value,
  onChange,
  sources,
  companies = [],
  searchSymbols,
  compact = false,
}: {
  value: FeedFilterState
  onChange: (f: FeedFilterState) => void
  sources: string[] // distinct source names present in the data
  companies?: CompanyFacet[] // distinct companies on the wire (archive facet) — the ticker autofill's suggestions
  searchSymbols?: (q: string) => Promise<SymbolGroup[]> // the global "any ticker, any country" directory (api.symbolSearch) — injected by the live surfaces
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
        {/* Pick a company by ticker (autofill) — the reliable "filter by company" path: type a ticker or
            name, pick the suggestion, and every item tagged with that ticker OR named in the headline comes
            back. Sits first so it's the obvious company filter; the free-text box beside it still searches
            headlines. */}
        <CompanyFilter value={value.company} onChange={(company) => set({ company })} options={companies} searchSymbols={searchSymbols} />
        <input
          className="ffilters__text"
          value={value.text}
          placeholder="search headline, company or ticker…"
          title="Search the words in a headline. Type a ticker (AMZN) and it is read as that company, so you get its news however the headline spells it."
          onChange={(e) => set({ text: e.target.value })}
        />
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
