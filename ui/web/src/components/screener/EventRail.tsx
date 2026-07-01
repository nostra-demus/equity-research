// The persistent left rail of the Screener stage: a live, ranked list of everything the auto-scanner
// reads. New items stream in over SSE the moment a cycle scores them (and backfill from disk on mount,
// so it survives a reload). Three ways to read the wire:
//   • Ranked     — the events worth a look, sorted by score (what's most important right now).
//   • Latest     — the SAME good events, newest-first: a live stream where each fresh item glows in at
//                  the top the moment it's detected ("something new just landed").
//   • Everything — the raw firehose, newest first (includes the low-signal tail).
// A SCOPE filter splits the wire into what a buy-side reader can act on — company-specific names vs broad
// macro/sector/commodity/policy context. The same story reworded or carried by several outlets collapses
// into ONE row (server dedup) with a "+N · also …" expander; multi-source corroboration nudges its rank.
// Click a row to read the whole event; set aside the ones not worth a check.

import { useEffect, useMemo, useRef, useState } from 'react'
import { groupByDedup, type StoryGroup } from '../../lib/dedup'
import { displayHeadline, originalHeadline, plainSize, plainTheme } from '../../lib/plain'
import { BROAD_SCOPES, COMPANY_SCOPES, familyOf, isCompanyNameClient, SCOPES, scopeLabel, scopeOf, type ScopeId } from '../../lib/scope'
import { hhmmLocal } from '../../lib/format'
import { extractCommodities, extractSectors } from '../../lib/taxonomy'
import { useStore } from '../../lib/store'
import type { FeedItem } from '../../lib/types'
import { archiveFiltersActive, emptyFilters, FeedFilters, filtersActive, gicsEmptyMessage, matchesFilters, type FeedFilterState } from './FeedFilters'
import type { ArchiveQuery } from '../../lib/api'

// a multi-select dropdown for a broad scope with dynamic sub-values (Sector, Commodity). "All X" =
// the whole scope; specific picks narrow to those. Closes on outside-click / Escape.
type SubSel = { all: boolean; picks: Set<string> }
const subActive = (s: SubSel) => s.all || s.picks.size > 0
function ScopeDropdown({ label, total, options, sel, onChange, open, onOpen, display }: { label: string; total: number; options: [string, number][]; sel: SubSel; onChange: (s: SubSel) => void; open: boolean; onOpen: (o: boolean) => void; display?: (name: string) => string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open, onOpen])
  const active = subActive(sel)
  const toggleAll = () => onChange(sel.all ? { all: false, picks: sel.picks } : { all: true, picks: new Set() })
  const togglePick = (name: string) => {
    const picks = new Set(sel.picks)
    picks.has(name) ? picks.delete(name) : picks.add(name)
    onChange({ all: false, picks })
  }
  return (
    <div className="evscope__dropwrap" ref={ref}>
      <button type="button" className={`evscope__chip evscope__chip--broad evscope__chip--drop${active ? ' evscope__chip--on' : ''}`} onClick={() => onOpen(!open)} aria-expanded={open} aria-haspopup="listbox" title={`${label} — pick specific ${label.toLowerCase()}s, or all`}>
        {active && <span className="evscope__tick" aria-hidden>✓</span>}
        {label}
        <span className="evscope__n">{sel.picks.size || total}</span>
        <span className={`evscope__dropcaret${open ? ' evscope__dropcaret--open' : ''}`} aria-hidden>▾</span>
      </button>
      {open && (
        <div className="evscope__menu" role="listbox">
          <button type="button" className={`evscope__opt${sel.all ? ' evscope__opt--on' : ''}`} onClick={toggleAll}>
            <span className="evscope__optcheck" aria-hidden>{sel.all ? '✓' : ''}</span>
            <span className="evscope__optlabel">All {label.toLowerCase()}</span>
            <span className="evscope__optn">{total}</span>
          </button>
          {options.length > 0 && <div className="evscope__menudiv" aria-hidden />}
          {options.map(([name, n]) => (
            <button key={name} type="button" className={`evscope__opt${sel.picks.has(name) ? ' evscope__opt--on' : ''}`} onClick={() => togglePick(name)}>
              <span className="evscope__optcheck" aria-hidden>{sel.picks.has(name) ? '✓' : ''}</span>
              <span className="evscope__optlabel">{display ? display(name) : name}</span>
              <span className="evscope__optn">{n}</span>
            </button>
          ))}
          {!options.length && <div className="evscope__optempty">No specific {label.toLowerCase()} named on the wire yet.</div>}
        </div>
      )}
    </div>
  )
}

type View = 'ranked' | 'latest' | 'all'

const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)
// a friendly label for a YYYY-MM-DD archive day — e.g. "11 Jun 2026"
const dateLabel = (d?: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')
const inGroup = (sel: FeedItem | null, g: StoryGroup) => !!sel && g.members.some((m) => m.event_id === sel.event_id && m.ts === sel.ts)

function ScopeChip({ it }: { it: FeedItem }) {
  const s = scopeOf(it)
  if (s === 'unknown') return null
  const fam = familyOf(s)
  return (
    <span className={`evrow__scope evrow__scope--${fam}`} title={SCOPES[s].meaning}>
      {scopeLabel(s)}
    </span>
  )
}

function EventRow({ group, selected, shelved, fresh, onPick, onShelve }: { group: StoryGroup; selected: boolean; shelved: boolean; fresh: boolean; onPick: (it: FeedItem) => void; onShelve: (id: string) => void }) {
  const it = group.rep
  const [expanded, setExpanded] = useState(false)
  const origHl = originalHeadline(it) // source-language original, only when an English translation is shown
  const kept = it.band !== 'drop'
  const tone = it.triage_score >= 70 ? 'var(--live)' : it.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  const company = (it.companies || []).find((c) => isCompanyNameClient(c.name)) // skip a country/agency guess
  const companyLabel = company ? [company.name, company.ticker].filter(Boolean).join(' · ') : null
  const otherSources = group.sources.slice(1)
  const dupLabel = otherSources.length
    ? `+${otherSources.length} · also ${otherSources.slice(0, 2).join(', ')}${otherSources.length > 2 ? '…' : ''}`
    : group.others.length
      ? `+${group.others.length} more`
      : ''
  return (
    <div className={`evrow${selected ? ' evrow--on' : ''}${kept ? '' : ' evrow--dropped'}${shelved ? ' evrow--shelved' : ''}${fresh ? ' evrow--fresh' : ''}`}>
      {fresh && <span className="evrow__glow" aria-hidden />}
      <button type="button" className="evrow__hit" onClick={() => onPick(it)} title={[displayHeadline(it), origHl && `original: ${origHl}`].filter(Boolean).join('\n')}>
        <span className="evrow__rail" aria-hidden style={{ background: tone }} />
        <span className="evrow__top">
          <span className="evrow__score mono" style={{ color: tone, borderColor: tone }}>
            {it.triage_score}
          </span>
          <span className="evrow__time mono">{hhmmLocal(it.ts)}</span>
          <span className="evrow__src">{it.source_name}</span>
          {it.via === 'rss' && <span className="evrow__tag evrow__tag--rss">RSS</span>}
          {origHl && <span className="evrow__tag evrow__tag--xlate" title={`Translated to English — original: ${origHl}`}>EN</span>}
        </span>
        <span className="evrow__headline">{displayHeadline(it)}</span>
        <span className="evrow__meta">
          <ScopeChip it={it} />
          {it.event_types.slice(0, 2).map((t) => (
            <span key={t} className="evrow__tag evrow__tag--theme">
              {plainTheme(t)}
            </span>
          ))}
          {companyLabel && (
            <span className="evrow__company">
              {companyLabel}
              {it.size_bucket && it.size_bucket !== 'unknown' ? ` · ${plainSize(it.size_bucket)}` : ''}
            </span>
          )}
          {it.region && <span className="evrow__region">{it.region}</span>}
        </span>
      </button>
      <button
        type="button"
        className="evrow__shelve"
        onClick={(e) => { e.stopPropagation(); onShelve(it.event_id) }}
        title={shelved ? 'Bring this back to the wire' : 'Set aside — hide it from the wire'}
        aria-label={shelved ? 'Un-shelve event' : 'Set event aside'}
      >
        {shelved ? '↩' : '⌄'}
      </button>
      {group.others.length > 0 && (
        <button type="button" className={`evrow__dups${expanded ? ' evrow__dups--open' : ''}`} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} title="The same story from other sources — click to expand">
          <span className="evrow__dups-label">{dupLabel}</span>
          <span className="evrow__dups-caret" aria-hidden>▾</span>
        </button>
      )}
      {expanded && (
        <ul className="evrow__duplist">
          {group.others.map((m) => (
            <li key={`${m.event_id}-${m.ts}`}>
              <button type="button" className="evrow__dup" onClick={() => onPick(m)} title={[displayHeadline(m), originalHeadline(m) && `original: ${originalHeadline(m)}`].filter(Boolean).join('\n')}>
                <span className="evrow__dup-score mono">{m.triage_score}</span>
                <span className="evrow__dup-src">{m.source_name}</span>
                <span className="evrow__dup-hl">{displayHeadline(m)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function EventRail() {
  const liveItems = useStore((s) => s.newsItems)
  const freshEvents = useStore((s) => s.freshEvents)
  const status = useStore((s) => s.newsStatus)
  const streamOnline = useStore((s) => s.newsStreamOnline)
  const selected = useStore((s) => s.scSelectedEvent)
  const ensure = useStore((s) => s.scEnsureNewsStream)
  const refreshStatus = useStore((s) => s.refreshNewsStatus)
  const pick = useStore((s) => s.scSelectEvent)
  const shelvedEvents = useStore((s) => s.shelvedEvents)
  const toggleShelve = useStore((s) => s.toggleShelve)
  const themesOpen = useStore((s) => s.themesView !== null)
  const openThemes = useStore((s) => s.openThemes)
  const closeThemes = useStore((s) => s.closeThemes)
  const globeOpen = useStore((s) => s.scGlobeView)
  const openGlobe = useStore((s) => s.openGlobe)
  const openNewsFeed = useStore((s) => s.openNewsFeed)
  const openSources = useStore((s) => s.openSources)
  const runSweep = useStore((s) => s.runSweep)
  const staticMode = useStore((s) => s.staticMode)
  // archive search — the whole-history, server-filtered read the rail switches to when a filter is set
  const archiveResults = useStore((s) => s.scArchiveResults)
  const archiveLoading = useStore((s) => s.scArchiveLoading)
  const archiveLoadingMore = useStore((s) => s.scArchiveLoadingMore)
  const archiveCursor = useStore((s) => s.scArchiveCursor)
  const archiveScannedThrough = useStore((s) => s.scArchiveScannedThrough)
  const archiveExhausted = useStore((s) => s.scArchiveExhausted)
  const facets = useStore((s) => s.scFacets)
  const runArchiveSearch = useStore((s) => s.scRunArchiveSearch)
  const loadMoreArchive = useStore((s) => s.scLoadMoreArchive)
  const loadFacets = useStore((s) => s.scLoadFacets)
  const [view, setView] = useState<View>('ranked')
  // multi-select: empty = show everything; otherwise show the UNION of the picked scopes
  const [scopeFilter, setScopeFilter] = useState<Set<ScopeId>>(new Set())
  const [showShelved, setShowShelved] = useState(false)
  // the secondary filters (theme / search / sector / size) — now always visible
  const [filters, setFilters] = useState<FeedFilterState>(emptyFilters())
  // collapse toggle for the secondary filters — COLLAPSED by default; opens only if you've opened it before (per browser)
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => { try { return localStorage.getItem('nsw.filtersOpen') === '1' } catch { return false } })
  const toggleFilters = () => setFiltersOpen((v) => { const n = !v; try { localStorage.setItem('nsw.filtersOpen', n ? '1' : '0') } catch {} return n })
  const refineCount = filters.themes.size + (filters.country || filters.geoRegion ? 1 : 0) + (filters.size ? 1 : 0) + (filters.gicsSector ? 1 : 0) + (filters.gicsSubSector ? 1 : 0) + (filters.text.trim() ? 1 : 0)
  // Sector & Commodity drill into specific sub-values (dynamic multi-select); openDrop = which menu is open
  const [sectorSel, setSectorSel] = useState<SubSel>({ all: false, picks: new Set() })
  const [commSel, setCommSel] = useState<SubSel>({ all: false, picks: new Set() })
  const [openDrop, setOpenDrop] = useState<'sector' | 'commodity' | null>(null)
  const [armScan, setArmScan] = useState(false) // two-click arm for the paid top-up sweep
  const clearBroad = () => { setScopeFilter(new Set()); setSectorSel({ all: false, picks: new Set() }); setCommSel({ all: false, picks: new Set() }) }
  const broadActive = scopeFilter.size > 0 || subActive(sectorSel) || subActive(commSel)
  const toggleScope = (s: ScopeId) => {
    const next = new Set(scopeFilter)
    next.has(s) ? next.delete(s) : next.add(s)
    setScopeFilter(next)
  }
  const closeGlobe = useStore((s) => s.closeGlobe)
  const pickView = (v: View) => { setView(v); if (themesOpen) closeThemes(); if (globeOpen) closeGlobe() }

  // ARCHIVE MODE: any structured filter (geography / sector / theme / size / text) flips the rail from the
  // live 2-day SSE wire to a server-side search over the WHOLE since-inception archive — so a sparse
  // filter finds matches buried deep in history instead of falsely reading "nothing".
  const archiveMode = archiveFiltersActive(filters)
  const archiveQuery = useMemo<ArchiveQuery>(() => ({
    themes: filters.themes.size ? [...filters.themes] : undefined,
    country: filters.country || undefined,
    geoRegion: filters.geoRegion || undefined,
    size: filters.size || undefined,
    gicsSector: filters.gicsSector || undefined,
    gicsSubSector: filters.gicsSubSector || undefined,
    text: filters.text.trim() || undefined,
  }), [filters])
  const archiveKey = JSON.stringify(archiveQuery)
  // fire the search when the filter changes (debounced so typing in the search box doesn't spam the server);
  // an empty filter returns the rail to LIVE mode. The store guards against a stale slow response winning.
  useEffect(() => {
    const id = setTimeout(() => { void runArchiveSearch(archiveMode ? archiveQuery : {}) }, 220)
    return () => clearTimeout(id)
  }, [archiveKey, archiveMode, archiveQuery, runArchiveSearch])
  // populate the Geography dropdown from the ARCHIVE (every country that has any archived match), not the
  // loaded window — so "United Arab Emirates" appears even when nothing is in the last two days.
  useEffect(() => { void loadFacets({}) }, [loadFacets])

  // the rendered set: the archive matches in archive mode, the live wire otherwise
  const items = archiveMode ? archiveResults : liveItems

  // archive paging: pull the next page when a bottom sentinel scrolls into view (same pattern as the
  // full wire). Only armed in archive mode while there is a next cursor.
  const listRef = useRef<HTMLDivElement | null>(null)
  const moreRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = moreRef.current
    if (!el || !archiveMode || !archiveCursor) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) void loadMoreArchive() }, { root: listRef.current, rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [archiveMode, archiveCursor, archiveLoadingMore, loadMoreArchive])

  // backfill + attach the live stream the moment the rail mounts (self-healing if scInit raced)
  useEffect(() => {
    void ensure()
  }, [ensure])

  // keep the "last look Xm ago" line honest while the rail is open
  useEffect(() => {
    const id = setInterval(() => void refreshStatus(), 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  // number of distinct kept STORIES (after story-collapse) — what the "Ranked" / "Latest" segments count
  const keptCount = useMemo(() => groupByDedup(items.filter((i) => i.band !== 'drop')).length, [items])

  // the wire, collapsed into one entry per story, sorted by the current view. Ranked → corroboration-
  // boosted score (a multi-source story rises); Latest & Everything → newest-first (the live stream).
  const groups = useMemo(() => {
    const inBand = view === 'all' ? items : items.filter((i) => i.band !== 'drop')
    const gs = groupByDedup(inBand)
    if (view === 'ranked') gs.sort((a, b) => b.effectiveScore - a.effectiveScore || (a.rep.ts < b.rep.ts ? 1 : -1))
    else gs.sort((a, b) => (a.rep.ts < b.rep.ts ? 1 : -1)) // latest + everything: newest first
    return gs
  }, [items, view])

  // story groups minus the ones the user set aside (the rep carries the group's shelved state)
  const baseGroups = useMemo(() => (showShelved ? groups : groups.filter((g) => !shelvedEvents.has(g.rep.event_id))), [groups, shelvedEvents, showShelved])

  // the Refine layer applied: theme / region / size / text, ON TOP of the (scope-independent) base.
  // Counts and the company/broad split below run on this refined set, so the scope chips always show
  // what is actually available under the current refine.
  const refined = useMemo(() => baseGroups.filter((g) => matchesFilters(g.rep, filters)), [baseGroups, filters])

  // per-scope counts over the refined set — drive the filter chips + the at-a-glance split
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const g of refined) c[scopeOf(g.rep)] = (c[scopeOf(g.rep)] || 0) + 1
    return c
  }, [refined])
  const companyTotal = COMPANY_SCOPES.reduce((n, s) => n + (counts[s] || 0), 0)
  const broadTotal = BROAD_SCOPES.reduce((n, s) => n + (counts[s] || 0), 0)

  // dynamic sub-value lists for the Sector / Commodity dropdowns — only what's actually shown, with counts
  const sectorOptions = useMemo(() => {
    const c: Record<string, number> = {}
    for (const g of refined) if (scopeOf(g.rep) === 'sector') for (const x of extractSectors(displayHeadline(g.rep))) c[x] = (c[x] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1]) as [string, number][]
  }, [refined])
  const commodityOptions = useMemo(() => {
    const c: Record<string, number> = {}
    for (const g of refined) if (scopeOf(g.rep) === 'commodity') for (const x of extractCommodities(displayHeadline(g.rep))) c[x] = (c[x] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1]) as [string, number][]
  }, [refined])

  // the Continent → Country geography options come from the ARCHIVE facets (counts across ALL history),
  // narrowed to the picked continent when one is set — so the menu reflects the archive, not the 2-day
  // window. This is what makes "United Arab Emirates" appear even when nothing landed in the last two days.
  const countryOptions = useMemo(() => (facets?.countries || []).filter((c) => !filters.geoRegion || c.parent === filters.geoRegion), [facets, filters.geoRegion])
  const countryParent = (cc: string) => facets?.countries.find((c) => c.key === cc)?.parent || ''
  const setGeo = (patch: Partial<Pick<FeedFilterState, 'country' | 'geoRegion'>>) => setFilters({ ...filters, country: '', geoRegion: '', ...patch })
  const countryLabel = filters.country ? facets?.countries.find((c) => c.key === filters.country)?.label || filters.country : ''
  // a plain-English summary of the active filter, for the honest "nothing matches X" archive line
  const filterSummary = [filters.gicsSubSector || filters.gicsSector, countryLabel || filters.geoRegion, filters.text.trim() ? `“${filters.text.trim()}”` : ''].filter(Boolean).join(' · ')

  // the broad filter: a UNION of the picked scope chips + the Sector/Commodity sub-selections, applied on
  // top of the refined set
  const visibleGroups = useMemo(() => {
    if (!broadActive) return refined
    return refined.filter((g) => {
      const sc = scopeOf(g.rep)
      if (scopeFilter.has(sc)) return true
      if (sc === 'sector' && (sectorSel.all || extractSectors(displayHeadline(g.rep)).some((x) => sectorSel.picks.has(x)))) return true
      if (sc === 'commodity' && (commSel.all || extractCommodities(displayHeadline(g.rep)).some((x) => commSel.picks.has(x)))) return true
      return false
    })
  }, [refined, scopeFilter, sectorSel, commSel, broadActive])
  const isFresh = (g: StoryGroup) => g.members.some((m) => freshEvents.has(m.event_id))

  const shelvedInBand = useMemo(() => groups.reduce((n, g) => n + (shelvedEvents.has(g.rep.event_id) ? 1 : 0), 0), [groups, shelvedEvents])

  // The GICS-specific empty line applies ONLY when GICS is the sole structured narrower: if the scope chips
  // (broadActive) also narrowed, the empty list may be theirs, so we fall through to the generic line
  // rather than wrongly blaming GICS. In archive mode an empty list is reported honestly below instead.
  const gicsEmptyLine = !archiveMode && items.length && !broadActive ? gicsEmptyMessage(filters) : null

  const ago = agoMin(status?.lastCycleAt)
  // The config truth (`status.enabled`) is checked first so "Auto-scan off" is never confused with offline.
  // Only when we have no status yet does the live-stream flag decide: an OPEN wire reads "Connected…"
  // (the status fetch just hasn't landed), and only a genuinely unreachable wire reads "connecting…".
  const statusLine = status
    ? status.enabled
      ? `Watching · last look ${ago != null ? `${ago}m ago` : 'soon'}`
      : 'Auto-scan off — add a free Groq key to watch the wire'
    : streamOnline
      ? 'Connected · waiting for the next scan…'
      : 'connecting to the scanner…'
  const today = status?.today

  const scopeChip = (s: ScopeId) => {
    const n = counts[s] || 0
    const on = scopeFilter.has(s)
    if (!n && !on) return null
    const fam = familyOf(s)
    return (
      <button
        key={s}
        type="button"
        className={`evscope__chip evscope__chip--${fam}${on ? ' evscope__chip--on' : ''}`}
        onClick={() => toggleScope(s)}
        title={`${SCOPES[s].meaning}${on ? ' · tap to remove' : ' · tap to add'}`}
        aria-pressed={on}
      >
        {on && <span className="evscope__tick" aria-hidden>✓</span>}
        {SCOPES[s].label}
        <span className="evscope__n">{n}</span>
      </button>
    )
  }

  return (
    <aside className="evrail">
      <header className="evrail__head">
        <div className="evrail__titlerow">
          <span className="evrail__title">Events</span>
          <span className={`evrail__dot${status?.enabled ? ' evrail__dot--live' : ''}`} aria-hidden />
        </div>
        <div className="evrail__status">{statusLine}</div>
        {today && status?.enabled && (
          <div className="evrail__today" title="What the automatic scan did today: how many it read, how many it kept for you, how many it dropped as not worth it">
            today {today.read} read · {today.kept} kept · {today.dropped} dropped
          </div>
        )}
        {status?.enabled && (
          <div className="evrail__scan">
            <button type="button" className="evrail__scanbtn" onClick={() => void openNewsFeed()} title="The live wire — everything the scanner read today, kept and dropped, with the reason for each">
              watch live ▸
            </button>
            <button type="button" className="evrail__scanbtn" onClick={openSources} title="Every source we pull from — when its data last arrived and whether it's healthy, quiet, failing or idle">
              sources ▸
            </button>
            {!staticMode && (
              <button
                type="button"
                className={`evrail__scanbtn${armScan ? ' evrail__scanbtn--armed' : ''}`}
                onClick={() => {
                  if (!armScan) {
                    setArmScan(true)
                    setTimeout(() => setArmScan(false), 4000)
                    return
                  }
                  setArmScan(false)
                  void runSweep()
                }}
                title="A manual top-up scan by the paid engine (~$2–12). Usually unnecessary — the free auto-scan runs every 15 minutes."
              >
                {armScan ? 'yes, scan now · ~$2–12 ▸' : 'scan now ▸'}
              </button>
            )}
          </div>
        )}
        <div className="evrail__seg" role="radiogroup" aria-label="How to view the wire">
          <button type="button" role="radio" aria-checked={themesOpen} className={`evrail__segbtn${themesOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => void openThemes('map')} title="The wire clustered into living investment themes">
            Themes
          </button>
          <button type="button" role="radio" aria-checked={globeOpen} className={`evrail__segbtn${globeOpen ? ' evrail__segbtn--on' : ''}`} onClick={openGlobe} title="The wire plotted on a geography globe — where in the world events are concentrated">
            Globe
          </button>
          <button type="button" role="radio" aria-checked={view === 'ranked' && !themesOpen && !globeOpen} className={`evrail__segbtn${view === 'ranked' && !themesOpen && !globeOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => pickView('ranked')} title="The events worth a look, most important first">
            Ranked{keptCount ? ` · ${keptCount}` : ''}
          </button>
          <button type="button" role="radio" aria-checked={view === 'latest' && !themesOpen && !globeOpen} className={`evrail__segbtn${view === 'latest' && !themesOpen && !globeOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => pickView('latest')} title="The same events, newest first — a live stream as news lands">
            {status?.enabled && <span className="evrail__segpulse" aria-hidden />}
            Latest
          </button>
          <button type="button" role="radio" aria-checked={view === 'all' && !themesOpen && !globeOpen} className={`evrail__segbtn${view === 'all' && !themesOpen && !globeOpen ? ' evrail__segbtn--on' : ''}`} onClick={() => pickView('all')} title={`The full firehose, newest first${items.length ? ` (${items.length})` : ''} — includes the low-signal tail`}>
            Everything
          </button>
        </div>

        {/* SCOPE filter — tap to add/remove (multi-select); company-specific vs broad context */}
        <div className="evscope" role="group" aria-label="Filter by what the event is about — tap to add or remove">
          <button type="button" className={`evscope__chip evscope__chip--all${!broadActive ? ' evscope__chip--on' : ''}`} onClick={clearBroad} aria-pressed={!broadActive} title="Show every category">
            {!broadActive && <span className="evscope__tick" aria-hidden>✓</span>}
            All<span className="evscope__n">{refined.length}</span>
          </button>
          {(companyTotal > 0 || COMPANY_SCOPES.some((s) => scopeFilter.has(s))) && (
            <span className="evscope__group" title="A specific listed company is in play — a potential single-stock idea">
              {COMPANY_SCOPES.map(scopeChip)}
            </span>
          )}
          {companyTotal > 0 && (broadTotal > 0 || broadActive) && <span className="evscope__div" aria-hidden />}
          {(broadTotal > 0 || broadActive) && (
            <span className="evscope__group" title="Broad — sector, macro, commodity or policy context, not one company">
              {((counts.sector || 0) > 0 || subActive(sectorSel)) && (
                <ScopeDropdown label="Sector" total={counts.sector || 0} options={sectorOptions} sel={sectorSel} onChange={setSectorSel} open={openDrop === 'sector'} onOpen={(o) => setOpenDrop(o ? 'sector' : null)} />
              )}
              {scopeChip('macro')}
              {((counts.commodity || 0) > 0 || subActive(commSel)) && (
                <ScopeDropdown label="Commodity" total={counts.commodity || 0} options={commodityOptions} sel={commSel} onChange={setCommSel} open={openDrop === 'commodity'} onOpen={(o) => setOpenDrop(o ? 'commodity' : null)} />
              )}
              {scopeChip('policy')}
            </span>
          )}
        </div>
        {scopeFilter.size === 1 && <div className="evscope__meaning">{SCOPES[[...scopeFilter][0]].meaning}</div>}
        {scopeFilter.size > 1 && <div className="evscope__meaning">Showing {scopeFilter.size} categories together — tap All to reset.</div>}

        {/* GEOGRAPHY — country-level, Continent → Country, fed by the ARCHIVE facets (every country with any
            archived match, with counts), NOT the loaded window. Picking either flips the rail to a
            whole-history search, so "Aerospace & Defense in the United Arab Emirates" actually returns. */}
        <div className="evscope evscope--geo" role="group" aria-label="Filter by geography — the country the event is about">
          <span className="evscope__dim" aria-hidden>Where</span>
          <select
            className="ffilters__sel"
            value={filters.geoRegion}
            onChange={(e) => setGeo({ geoRegion: e.target.value })}
            title="Continent / region — narrows the country list below"
          >
            <option value="">any continent</option>
            {(facets?.regions || []).map((r) => (
              <option key={r.key} value={r.key}>{r.label} · {r.count}</option>
            ))}
          </select>
          <select
            className="ffilters__sel"
            value={filters.country}
            onChange={(e) => { const cc = e.target.value; setGeo({ country: cc, geoRegion: cc ? countryParent(cc) || filters.geoRegion : filters.geoRegion }) }}
            disabled={!facets}
            title={facets ? 'Country — every country that has any archived match' : 'loading the archive’s countries…'}
          >
            <option value="">{filters.geoRegion ? `all of ${filters.geoRegion}` : 'any country'}</option>
            {countryOptions.map((c) => (
              <option key={c.key} value={c.key}>{c.label} · {c.count}</option>
            ))}
          </select>
        </div>
        {/* honest scope line: in archive mode say plainly that we are reading ALL history, and how far back */}
        {archiveMode && (
          <div className="evscope__meaning evrail__archline" aria-live="polite">
            {archiveLoading
              ? 'Searching all history…'
              : archiveScannedThrough
                ? `Searched all history back to ${dateLabel(archiveScannedThrough)}${archiveExhausted ? '' : ' (more loads as you scroll)'}`
                : 'Searching the whole archive — not just the last two days.'}
          </div>
        )}

        {/* secondary filters — collapsible (remembers your choice); badge shows the active count when hidden */}
        <div className="evrefine">
          <button
            type="button"
            className={`evrefine__toggle${filtersOpen ? ' evrefine__toggle--on' : ''}${!filtersOpen && refineCount ? ' evrefine__toggle--active' : ''}`}
            onClick={toggleFilters}
            aria-expanded={filtersOpen}
            title={filtersOpen ? 'Collapse the news-type / sector / size / search filters' : 'Show the news-type / sector / size / search filters'}
          >
            <span className="evrefine__label">Filters</span>
            {!filtersOpen && refineCount > 0 && <span className="evrefine__badge">{refineCount}</span>}
            <span className="evrefine__caret" aria-hidden>▾</span>
          </button>
          {!filtersOpen && filtersActive(filters) && (
            <button type="button" className="evrefine__clear" onClick={() => setFilters(emptyFilters())} title="Clear the filters">clear</button>
          )}
        </div>
        {filtersOpen && (
          <div className="evrail__filters">
            <FeedFilters value={filters} onChange={setFilters} sources={[]} compact />
          </div>
        )}
      </header>

      <div className="evrail__list" ref={listRef}>
        {visibleGroups.map((g) => (
          <EventRow key={g.group} group={g} selected={inGroup(selected, g)} shelved={shelvedEvents.has(g.rep.event_id)} fresh={isFresh(g)} onPick={pick} onShelve={toggleShelve} />
        ))}
        {/* Render the paging sentinel whenever a next cursor remains — even when THIS page filtered to zero
            visible rows (e.g. a page of all band='drop' items hidden in Ranked/Latest). Gating it on
            visibleGroups.length stalled paging: the IntersectionObserver had no element to observe, so the
            buried kept matches on later pages were unreachable and the empty-state below falsely claimed
            "genuinely nothing matches" while more archive remained to scan. */}
        {archiveMode && archiveCursor && (
          <div ref={moreRef} className="evrail__more">{archiveLoadingMore ? 'loading more of all history…' : 'scanning deeper into the whole archive…'}</div>
        )}
        {!visibleGroups.length && !(archiveMode && archiveCursor) && (
          <div className="evrail__empty">
            {archiveMode
              ? archiveLoading
                ? 'Searching all history…'
                : `Searched all history${archiveScannedThrough ? ` back to ${dateLabel(archiveScannedThrough)}` : ''} — genuinely nothing matches ${filterSummary || 'these filters'}. This is the WHOLE archive, not just the last two days.`
              : gicsEmptyLine
              ? gicsEmptyLine
              : broadActive || filtersActive(filters)
              ? 'Nothing matches these filters right now — tap All or clear the filters to see the rest.'
              : items.length
                ? view === 'ranked'
                  ? 'Nothing ranked yet — switch to Everything to see the full wire.'
                  : 'Nothing here yet — new events appear the moment the scanner scores them.'
                : status?.enabled
                  ? 'Nothing read yet. New events appear here the moment the scanner scores them.'
                  : 'The auto-scan is off, so the wire is quiet. You can still check an event yourself from the top bar.'}
          </div>
        )}
        {shelvedInBand > 0 && (
          <button type="button" className="evrail__shelfline" onClick={() => setShowShelved((v) => !v)}>
            {showShelved ? `Hide ${shelvedInBand} set aside` : `Show ${shelvedInBand} set aside`}
          </button>
        )}
      </div>
    </aside>
  )
}
