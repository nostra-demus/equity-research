// The News wire — a live view of EVERYTHING the auto-scanner reads: each item as it's scored,
// its theme tags, the company it's guessed to be about, and whether it was kept for the Inbox or
// dropped (and why). Backfills from disk (restart-proof) and streams new items over SSE the moment
// a cycle scores them. A drop here is a result, not a failure — most news should die at this stage.

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { groupByDedup, type StoryGroup } from '../../lib/dedup'
import { displayHeadline, originalHeadline, plainBand, plainSize, plainTheme } from '../../lib/plain'
import { dayDividerLabel, dayKeyLocal, hhmmLocal } from '../../lib/format'
import { useStore } from '../../lib/store'
import type { FeedItem, NewsStatus } from '../../lib/types'
import { api, type ArchiveQuery, type CompanyFacet, type SearchCursor } from '../../lib/api'
import { archiveFiltersActive, emptyFilters, FeedFilters, gicsEmptyMessage, matchesFilters, type FeedFilterState } from './FeedFilters'
import { PulseMap } from './PulseMap'
import { ScanStatus } from './ScanStatus'

// a friendly label for a YYYY-MM-DD archive day — e.g. "11 Jun 2026" (mirrors EventRail's dateLabel)
const dateLabel = (d?: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')

// Time-travel windows over the on-disk news archive. 2 = the live view (SSE keeps appending); the rest
// pull a historical snapshot (newest items in range) from the daily firehose files. 370 ≈ "all".
const FEED_WINDOWS: { d: number; label: string }[] = [
  { d: 2, label: 'Live · 2d' },
  { d: 14, label: '14 days' },
  { d: 30, label: '1 month' },
  { d: 90, label: '3 months' },
  { d: 180, label: '6 months' },
  { d: 370, label: 'All' },
]

// compact 405000 → "405k", 14 → "14"
const kfmt = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : `${Math.round(n)}`)

// A historical look-back window can hold up to ~6,000 items; painting all of them on every filter
// toggle is what made the wire feel slow. We render in PAGE-sized chunks and reveal the next chunk as a
// bottom sentinel scrolls into view, so a filter click only ever paints ~PAGE rows — independent of how
// deep the archive in range is — while every row stays reachable by scrolling.
const PAGE = 60

// A small daily-budget pool readout: a label, a fill bar, used/cap. The fill animates with a GPU transform
// (scaleX) so the poll-driven update never triggers layout. `color` is a CSS var name (per provider), so a
// newly-wired provider gets its own colour with no code change. `active` tints the border (overflow firing).
function BudgetChip({ label, used, cap, unit, color, active, title }: { label: string; used: number; cap: number; unit: string; color: string; active?: boolean; title: string }) {
  const frac = cap > 0 ? Math.min(1, Math.max(0, used / cap)) : 0
  const c = `var(${color})`
  return (
    <span className="poolchip" style={active ? { borderColor: `color-mix(in srgb, ${c} 40%, var(--hairline))` } : undefined} title={title}>
      <span className="poolchip__label" style={{ color: c }}>{label}</span>
      <span className="poolchip__bar" aria-hidden><span className="poolchip__fill" style={{ transform: `scaleX(${frac})`, background: c }} /></span>
      <span className="poolchip__val mono">{kfmt(used)}<span className="poolchip__sep">/</span>{kfmt(cap)}<span className="poolchip__unit"> {unit}</span></span>
    </span>
  )
}

// The LOCAL primary brain — rendered FIRST and prominently. It is the unlimited, $0 tier that scores the WHOLE
// scan ahead of every cloud/paid tier, so there is no cap to meter: we show the live tokens + requests it has
// processed today (updates every cycle over SSE). When the box is unreachable it flips to a clear "offline"
// warning — the scan is then burning capped cloud/paid budget and the operator needs to bring the box back.
function LocalPrimaryChip({ local }: { local: NonNullable<NewsStatus['local']> }) {
  const c = `var(${local.color})`
  const down = local.health === 'cooling' || (local.cooldownRemainingMs ?? 0) > 0
  return (
    <span
      className={`poolchip poolchip--local${down ? ' is-down' : ''}`}
      title={down
        ? `Local primary brain (${local.model}) is UNREACHABLE right now — the box is asleep or offline, so the scan is running on the capped cloud fallback. Bring it back and it resumes carrying the whole scan, unlimited and $0.`
        : `Local primary brain (${local.model}) — the unlimited, $0 model that scores the WHOLE scan first, ahead of every cloud and paid tier. No daily cap, no ceiling. Today: ${local.tokens.toLocaleString()} tokens over ${local.requests.toLocaleString()} requests.`}
    >
      <span className="poolchip__dot" data-tone={down ? 'bad' : 'live'} aria-hidden />
      <span className="poolchip__label" style={{ color: c }}>Local · primary brain</span>
      {down ? (
        <span className="poolchip__val poolchip__val--down mono">offline — check the box</span>
      ) : (
        <span className="poolchip__val mono">
          <b className="poolchip__big" style={{ color: c }}>{kfmt(local.tokens)}</b><span className="poolchip__unit"> tok</span>
          <span className="poolchip__sep">·</span>{kfmt(local.requests)}<span className="poolchip__unit"> req today</span>
          <span className="poolchip__inf" title="no daily cap — unlimited, 24×7">∞</span>
        </span>
      )}
    </span>
  )
}

// Pick the BINDING dimension for a provider's budget chip — whichever of requests-vs-cap or tokens-vs-cap is
// closer to its cap — so the bar tells the truth. A provider can be gated on EITHER limit, and which one bites
// varies by day: a flaky Groq day burns the daily REQUEST cap on retries while token use stays tiny (13k/13k
// requests, 14k/500k tokens), so a fixed "always show tokens" bar would read ~3% full while the provider is
// actually out. Compares against the HARD caps; when tokens bind, displays against the paced target if given.
function bindingDim(b: { requests: number; reqCap: number; tokens: number; tokenCap?: number; tokenTarget?: number }): { used: number; cap: number; unit: string } {
  const reqFrac = b.reqCap > 0 ? b.requests / b.reqCap : 0
  const tokFrac = b.tokenCap && b.tokenCap > 0 ? b.tokens / b.tokenCap : -1 // no token cap ⇒ request-gated only
  if (tokFrac > reqFrac) return { used: b.tokens, cap: b.tokenTarget || b.tokenCap!, unit: 'tok' }
  return { used: b.requests, cap: b.reqCap, unit: 'req' }
}

function ScorePill({ score }: { score: number }) {
  const tone = score >= 70 ? 'var(--live)' : score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)'
  return (
    <span className="pcard__chip pcard__chip--num wire__score" style={{ color: tone, borderColor: tone }} title={`Quick score ${score} out of 100 — a first read by the free scanner, not the full check`}>
      {score}
    </span>
  )
}

function CompanyChip({ it }: { it: FeedItem }) {
  const c = it.companies?.[0]
  if (!c) return null
  const label = [c.name, c.ticker, it.size_bucket && it.size_bucket !== 'unknown' ? plainSize(it.size_bucket) : null].filter(Boolean).join(' · ')
  return (
    <span className="pcard__chip wire__company" title="Guessed by the quick scanner from the headline alone — check before relying on it">
      best guess: {label}
      {it.companies.length > 1 ? ` +${it.companies.length - 1}` : ''}
    </span>
  )
}

function WireRow({ group }: { group: StoryGroup }) {
  const it = group.rep
  const origHl = originalHeadline(it)
  const kept = it.band !== 'drop'
  const otherSources = group.sources.slice(1)
  return (
    <div className={`wire__row${kept ? '' : ' wire__row--dropped'}`}>
      <span className="wire__time mono">{hhmmLocal(it.ts)}</span>
      <ScorePill score={it.triage_score} />
      <span className={`pcard__chip wire__band${kept ? ' wire__band--kept' : ''}`} title={it.triage_reason || undefined}>
        {plainBand(it.band)}
      </span>
      <div className="wire__main">
        <a className="wire__headline" href={it.url} target="_blank" rel="noreferrer" title={origHl ? `original: ${origHl}` : it.url}>
          {displayHeadline(it)}
        </a>
        <div className="wire__meta">
          <span>{it.source_name}</span>
          {it.via === 'rss' && <span className="pcard__chip wire__via">RSS</span>}
          {origHl && <span className="pcard__chip wire__via" title={`Translated to English — original: ${origHl}`}>EN</span>}
          {it.region && <span>{it.region}</span>}
          {otherSources.length > 0 && (
            <span className="pcard__chip wire__dups" title={`Same story also reported by: ${otherSources.join(', ')}`}>
              +{otherSources.length} {otherSources.length === 1 ? 'source' : 'sources'}
            </span>
          )}
          {it.event_types.map((t) => (
            <span key={t} className="pcard__chip wire__theme">
              {plainTheme(t)}
            </span>
          ))}
          <CompanyChip it={it} />
        </div>
        {it.triage_reason && <div className="wire__why">{it.triage_reason}</div>}
      </div>
    </div>
  )
}

interface ArchiveState {
  results: FeedItem[]
  loading: boolean
  loadingMore: boolean
  cursor: SearchCursor | null
  scannedThrough: string | null
  exhausted: boolean
}
const EMPTY_ARCHIVE: ArchiveState = { results: [], loading: false, loadingMore: false, cursor: null, scannedThrough: null, exhausted: false }

export function LiveFeed() {
  const close = useStore((s) => s.closeNewsFeed)
  const liveItems = useStore((s) => s.newsItems)
  const status = useStore((s) => s.newsStatus)
  const refreshStatus = useStore((s) => s.refreshNewsStatus)
  const refreshFeed = useStore((s) => s.refreshNewsFeed)
  const feedWindowDays = useStore((s) => s.feedWindowDays)
  const setFeedWindow = useStore((s) => s.setFeedWindow)
  const feedWindowLoading = useStore((s) => s.feedWindowLoading)
  const [filters, setFilters] = useState<FeedFilterState>(emptyFilters())
  // wire order: 'newest' keeps the chronological stream (default — the wire is a firehose by nature); 'score'
  // floats the highest quick-score items to the top so the most material news is a glance, not a scroll.
  const [sortMode, setSortMode] = useState<'newest' | 'score'>('newest')
  // list = the chronological/score wire; map = the same filtered firehose as a geographic PULSE (glow = serious × recent).
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const selectEvent = useStore((s) => s.scSelectEvent)
  // a slow clock for the map's recency decay — refreshed each minute so old blooms fade without thrashing render.
  const [nowTick, setNowTick] = useState(() => Date.now())
  // Company autofill options — the whole-archive company facet (every tagged company + mention count), so the
  // ticker picker spans all history, not just the loaded window. Fetched once; [] on an old server (facet absent).
  const [companyFacets, setCompanyFacets] = useState<CompanyFacet[]>([])
  useEffect(() => {
    let alive = true
    api.newsFacets({}).then((f) => { if (alive) setCompanyFacets(f.companies || []) }).catch(() => {})
    return () => { alive = false }
  }, [])

  // keep the "last look Xm ago" line honest while the panel is open
  useEffect(() => {
    const id = setInterval(() => { void refreshStatus(); setNowTick(Date.now()) }, 60_000)
    return () => clearInterval(id)
  }, [refreshStatus])

  // ARCHIVE MODE: any structured filter (geography / sector / theme / size / source / band / linkage /
  // text) flips the wire from the loaded time-window snapshot to a server-side search over the WHOLE
  // since-inception archive — same escalation EventRail already does, but kept in LOCAL state here
  // (rather than the shared store's sc* archive fields) because EventRail stays mounted underneath this
  // overlay and would otherwise clobber/be clobbered by a concurrently-active filter on the other view.
  const archiveMode = archiveFiltersActive(filters)
  const archiveQuery = useMemo<ArchiveQuery>(() => ({
    themes: filters.themes.size ? [...filters.themes] : undefined,
    country: filters.country || undefined,
    geoRegion: filters.geoRegion || undefined,
    source: filters.source || undefined,
    band: filters.band || undefined,
    size: filters.size || undefined,
    linkage: filters.linkage || undefined,
    gicsSector: filters.gicsSector || undefined,
    gicsSubSector: filters.gicsSubSector || undefined,
    companyTicker: filters.company?.ticker || undefined,
    companyName: filters.company?.name || undefined,
    companyAliases: filters.company?.aliases?.length ? filters.company.aliases : undefined,
    companyTickerAliases: filters.company?.tickerAliases?.length ? filters.company.tickerAliases : undefined,
    companyListingCountry: filters.company?.listingCountry || undefined,
    text: filters.text.trim() || undefined,
  }), [filters])
  const archiveKey = JSON.stringify(archiveQuery)
  const [archive, setArchive] = useState<ArchiveState>(EMPTY_ARCHIVE)
  // A monotonic token: every new page-1 search bumps it; a page load captures it and, after its await,
  // discards its result if the token has moved on (the filter changed mid-flight). This is the LOCAL-state
  // mirror of the store's module-level `archiveToken` guard (scRunArchiveSearch / scLoadMoreArchive) that
  // EventRail relies on — without it, a slow page from the OLD filter appends into (and hands its cursor
  // to) the NEW filter's results, so the new filter resumes paging from the old cursor and skips matches.
  const searchSeq = useRef(0)
  // fire the search when the filter changes (debounced so typing in the search box doesn't spam the
  // server); an empty/cleared filter returns the view to the loaded-window snapshot.
  useEffect(() => {
    if (!archiveMode) { searchSeq.current++; setArchive(EMPTY_ARCHIVE); return }
    const seq = ++searchSeq.current
    let cancelled = false
    setArchive((a) => ({ ...a, loading: true }))
    const id = setTimeout(async () => {
      try {
        const res = await api.newsSearch(archiveQuery, { limit: 60 })
        if (cancelled || seq !== searchSeq.current) return
        setArchive({ results: res.items, loading: false, loadingMore: false, cursor: res.nextCursor, scannedThrough: res.scannedThroughDate, exhausted: res.exhausted })
      } catch {
        // A newer search superseded this one → let it own the state; don't clobber it.
        if (cancelled || seq !== searchSeq.current) return
        // Mirror the store's failure path (scRunArchiveSearch catch): drop the (now stale) snapshot and
        // cursor and mark exhausted, so the wire doesn't keep rendering the PRIOR query's page and the next
        // scroll can't page the NEW query from the old cursor.
        setArchive({ ...EMPTY_ARCHIVE, exhausted: true })
      }
    }, 220)
    return () => { cancelled = true; clearTimeout(id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveMode, archiveKey])
  const loadMoreArchive = async () => {
    if (!archive.cursor || archive.loadingMore) return
    const seq = searchSeq.current
    setArchive((a) => ({ ...a, loadingMore: true }))
    try {
      const res = await api.newsSearch(archiveQuery, { cursor: archive.cursor, limit: 60 })
      if (seq !== searchSeq.current) return // the filter changed mid-page — discard this page (mirrors scLoadMoreArchive)
      setArchive((a) => {
        const seen = new Set(a.results.map((i) => i.event_id))
        const fresh = res.items.filter((i) => !seen.has(i.event_id))
        return { results: [...a.results, ...fresh], cursor: res.nextCursor, scannedThrough: res.scannedThroughDate, exhausted: res.exhausted, loading: false, loadingMore: false }
      })
    } catch {
      if (seq !== searchSeq.current) return
      setArchive((a) => ({ ...a, loadingMore: false }))
    }
  }

  // The "refresh" button. In LIVE mode it re-pulls the wire + heals the stream (store.refreshNewsFeed). In
  // ARCHIVE mode the visible list is `archive.results`, which store.refreshNewsFeed does NOT touch — so a
  // refresh there used to be a silent no-op. Re-run the SAME archive query inline (the debounced effect only
  // fires on a query CHANGE, so we can't lean on it here), guarded by the same monotonic seq as page loads
  // so a slow in-flight page can't clobber this fresh result.
  const refresh = async () => {
    if (archiveMode) {
      const seq = ++searchSeq.current
      setArchive((a) => ({ ...a, loading: true }))
      try {
        const res = await api.newsSearch(archiveQuery, { limit: 60 })
        if (seq !== searchSeq.current) return
        setArchive({ results: res.items, loading: false, loadingMore: false, cursor: res.nextCursor, scannedThrough: res.scannedThroughDate, exhausted: res.exhausted })
      } catch {
        if (seq !== searchSeq.current) return
        setArchive({ ...EMPTY_ARCHIVE, exhausted: true })
      }
      return
    }
    await refreshFeed()
  }

  // the rendered set: the archive matches (already server-filtered) in archive mode, the loaded window otherwise
  const items = archiveMode ? archive.results : liveItems

  const sources = useMemo(() => [...new Set(liveItems.map((i) => i.source_name).filter(Boolean))].sort(), [liveItems])
  // filter first, then collapse near-duplicate stories so the wire shows one row per story (newest-first).
  // Re-applying matchesFilters on top of already server-filtered archive results is redundant but harmless
  // (defense in depth, same pattern EventRail uses) — keeps one code path instead of special-casing.
  const visibleGroups = useMemo(() => groupByDedup(items.filter((i) => matchesFilters(i, filters))), [items, filters])
  // priority ordering, opt-in: reorder the deduped stories by the representative item's quick score (same length,
  // so paging/sentinel logic below is unaffected). 'newest' returns the untouched chronological order.
  const orderedGroups = useMemo(() => (
    sortMode === 'score' ? [...visibleGroups].sort((a, b) => (b.rep.triage_score ?? 0) - (a.rep.triage_score ?? 0)) : visibleGroups
  ), [visibleGroups, sortMode])
  // flat filtered items for the pulse map — it counts individual events, not deduped stories
  const mapItems = useMemo(() => items.filter((i) => matchesFilters(i, filters)), [items, filters])

  // Incremental render: show the first `shownCount` stories, grow as a bottom sentinel scrolls into
  // view, and snap back to the top + first page whenever the filtered set changes (a filter toggle or a
  // new look-back window). This is what keeps a filter click snappy on a multi-thousand-item archive.
  const listRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [shownCount, setShownCount] = useState(PAGE)
  // Reset to the first page DURING render whenever the filter set, look-back window, or archive-mode
  // switch changes — NOT in a post-render effect. Otherwise the first render after a filter toggle still
  // slices the old (large) shownCount over the NEW filtered set, mapping thousands of rows before
  // snapping back to PAGE — the exact slow filter-click this incremental view exists to avoid. `items` is
  // deliberately excluded so a live SSE append (or an archive page load) never yanks the scroll back to top.
  const [pagedFor, setPagedFor] = useState<{ f: FeedFilterState; w: number; a: boolean; s: 'newest' | 'score' }>({ f: filters, w: feedWindowDays, a: archiveMode, s: sortMode })
  if (pagedFor.f !== filters || pagedFor.w !== feedWindowDays || pagedFor.a !== archiveMode || pagedFor.s !== sortMode) {
    setPagedFor({ f: filters, w: feedWindowDays, a: archiveMode, s: sortMode })
    setShownCount(PAGE)
  }
  useEffect(() => { listRef.current?.scrollTo?.({ top: 0 }) }, [filters, feedWindowDays, sortMode])
  const shown = useMemo(() => orderedGroups.slice(0, shownCount), [orderedGroups, shownCount])
  const hasMore = shownCount < visibleGroups.length
  // The bottom sentinel does double duty: in archive mode it pulls the next SERVER page (via the cursor)
  // once the already-fetched results are all revealed; otherwise it just reveals more of what's loaded.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        if (archiveMode && archive.cursor && shownCount >= visibleGroups.length) { void loadMoreArchive(); return }
        setShownCount((c) => Math.min(c + PAGE, visibleGroups.length))
      },
      { root: listRef.current, rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGroups.length, hasMore, archiveMode, archive.cursor, shownCount])

  return (
    <motion.div className="pipeline wire" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="pipeline__head">
        <div>
          <div className="pipeline__title">News wire — everything the scanner read</div>
          <ScanStatus variant="panel" />
          {status?.enabled && status.budget && (
            <div className="pipeline__pools">
              {/* LOCAL primary brain FIRST and prominent — the unlimited $0 tier that carries the whole scan.
                  When present, Groq + every overflow pool below are relabelled as its FALLBACK. */}
              {status.local && <LocalPrimaryChip local={status.local} />}
              {(() => {
                // show whichever limit is actually biting (requests OR tokens) — Groq has both a daily request
                // cap and a paced token budget, and either can max out first.
                const g = bindingDim(status.budget)
                return (
                  <BudgetChip
                    label={status.local ? 'Groq · fallback' : 'Groq'}
                    used={g.used}
                    cap={g.cap}
                    unit={g.unit}
                    color="--accent"
                    title={`${status.local ? 'FALLBACK — used only when the local primary brain is down. ' : ''}Groq free-tier daily budget. Requests: ${status.budget.requests}/${status.budget.reqCap}. Tokens: ${kfmt(status.budget.tokens)}/${kfmt(status.budget.tokenCap)}${status.budget.tokenTarget ? ` (paced target ${kfmt(status.budget.tokenTarget)})` : ''}. The bar shows whichever is closer to its cap — when either is reached, triage flows to the free pools or defers to the next cycle.`}
                  />
                )
              })()}
              {(status.overflow || []).map((o) => {
                // Show the BINDING limit — a provider can max its request cap before its token cap (e.g. a bad
                // Groq day burns requests on retries), so a fixed "always tokens" bar would look nearly empty
                // while the provider is out. bindingDim picks requests or tokens by whichever is closer to cap.
                const d = bindingDim(o)
                return (
                  <BudgetChip
                    key={o.id}
                    label={`${o.label} ${status.local ? 'fallback' : 'overflow'}`}
                    used={d.used}
                    cap={d.cap}
                    unit={d.unit}
                    color={o.color}
                    active={o.requests > 0 || o.tokens > 0}
                    title={`${status.local ? 'FALLBACK — used only when the local primary brain is down. ' : ''}Free-tier overflow (${o.model}) — picks up triage when the tier above is paced or capped, so the day's throughput is every free pool combined. Requests: ${o.requests}/${o.reqCap}${o.tokenCap ? ` · Tokens: ${kfmt(o.tokens)}/${kfmt(o.tokenCap)}` : ''}. The bar shows whichever is closer to its cap.`}
                  />
                )
              })}
            </div>
          )}
        </div>
        <div className="pipeline__tools">
          <button className="btn btn--ghost" onClick={() => void refresh()} disabled={feedWindowLoading}>
            {feedWindowLoading ? 'refreshing…' : 'refresh'}
          </button>
          <button className="btn btn--ghost" onClick={close}>
            ✕
          </button>
        </div>
      </div>

      {/* A structured filter supersedes the manual look-back window: it searches the WHOLE archive
          instead (same escalation EventRail already does), so the window chips only make sense — and
          only appear — when no such filter is active. */}
      {archiveMode ? (
        <div className="wirewindow" role="group" aria-label="Archive search status">
          <span className="wirewindow__note" aria-live="polite">
            {archive.loading
              ? 'Searching all history…'
              : archive.scannedThrough
                ? `Searched all history back to ${dateLabel(archive.scannedThrough)}${archive.exhausted ? '' : ' (more loads as you scroll)'}`
                : 'Searching the whole archive — not just the loaded window.'}
          </span>
        </div>
      ) : (
        <div className="wirewindow" role="group" aria-label="Time window">
          <span className="wirewindow__label">Look back</span>
          {FEED_WINDOWS.map((w) => (
            <button
              key={w.d}
              type="button"
              className={`wirewindow__chip${feedWindowDays === w.d ? ' is-active' : ''}`}
              onClick={() => { if (feedWindowDays !== w.d) void setFeedWindow(w.d) }}
              disabled={feedWindowLoading}
            >
              {w.label}
            </button>
          ))}
          <span className="wirewindow__note">
            {feedWindowLoading ? 'loading…' : feedWindowDays > 2 ? `historical · newest ${items.length.toLocaleString()} in range` : `live · ${items.length.toLocaleString()} loaded`}
          </span>
        </div>
      )}

      <FeedFilters value={filters} onChange={setFilters} sources={sources} companies={companyFacets} searchSymbols={api.symbolSearch} />

      <div className="wirewindow" role="group" aria-label="Wire view">
        <span className="wirewindow__label">View</span>
        <button type="button" className={`wirewindow__chip${viewMode === 'list' ? ' is-active' : ''}`} onClick={() => setViewMode('list')}>List</button>
        <button type="button" className={`wirewindow__chip${viewMode === 'map' ? ' is-active' : ''}`} onClick={() => setViewMode('map')} title="See the same news as a geographic pulse — glow shows where the serious, recent stories are">Pulse map</button>
        {viewMode === 'map' && <span className="wirewindow__note">glow = how serious &amp; recent · click a bloom to read</span>}
      </div>

      {viewMode === 'list' && (
        <div className="wirewindow" role="group" aria-label="Sort order">
          <span className="wirewindow__label">Sort</span>
          <button type="button" className={`wirewindow__chip${sortMode === 'newest' ? ' is-active' : ''}`} onClick={() => setSortMode('newest')}>Newest first</button>
          <button type="button" className={`wirewindow__chip${sortMode === 'score' ? ' is-active' : ''}`} onClick={() => setSortMode('score')} title="Float the highest quick-score items to the top">Top score</button>
          {sortMode === 'score' && <span className="wirewindow__note">highest quick-score first — the most material news up top</span>}
        </div>
      )}

      {viewMode === 'map' ? (
        <PulseMap items={mapItems} now={nowTick} onSelect={(it) => { selectEvent(it); close() }} />
      ) : (
      <div className="wire__list" ref={listRef}>
        {shown.map((g, i) => {
          // a sticky date divider whenever the calendar day changes — so a list that only shows HH:MM
          // stays legible across a 14-day (or longer) window as you scroll. Date by the group's NEWEST
          // member (members[0] is newest-first) — that's what sets its scroll position; g.rep is the
          // highest-tier source, which can be older and would mis-date a story that spans midnight.
          const gTs = g.members[0]?.ts ?? g.rep.ts
          const prevTs = i > 0 ? (shown[i - 1].members[0]?.ts ?? shown[i - 1].rep.ts) : ''
          const showDay = sortMode === 'newest' && (i === 0 || dayKeyLocal(gTs) !== dayKeyLocal(prevTs))
          const dayLabel = showDay ? dayDividerLabel(gTs) : ''
          return (
            <Fragment key={g.group}>
              {dayLabel && (
                <div className="wire__daydiv">
                  <span>{dayLabel}</span>
                </div>
              )}
              <WireRow group={g} />
            </Fragment>
          )
        })}
        {/* Render the sentinel whenever more can be revealed — either more of the already-fetched page
            (hasMore) OR another server page remains (archive mode with a live cursor), even if every
            fetched result so far is already shown. Gating only on hasMore would strand archive paging
            the moment the local reveal caught up to the current page — the exact "false nothing while
            more archive remains" bug this view exists to avoid. */}
        {(hasMore || (archiveMode && !!archive.cursor)) && (
          <div ref={sentinelRef} className="wire__more">
            {archiveMode && !hasMore
              ? archive.loadingMore ? 'loading more of all history…' : 'scanning deeper into the whole archive…'
              : `showing ${shown.length.toLocaleString()} of ${visibleGroups.length.toLocaleString()} — scroll for more`}
          </div>
        )}
        {!visibleGroups.length && !(archiveMode && archive.cursor) && (
          <div className="plane__empty wire__empty">
            {archiveMode
              ? archive.loading
                ? 'Searching all history…'
                : `Searched all history${archive.scannedThrough ? ` back to ${dateLabel(archive.scannedThrough)}` : ''} — genuinely nothing matches these filters. This is the WHOLE archive, not just the loaded window.`
              : items.length
                ? gicsEmptyMessage(filters) || 'Nothing matches these filters — clear them to see everything again.'
                : status?.enabled
                  ? `Nothing read yet today. The scanner looks every ${status.intervalMin} minutes; items appear here the moment they are scored.`
                  : 'The auto-scan is off, so there is nothing to show. It needs a free Groq key in the engine.'}
          </div>
        )}
      </div>
      )}
    </motion.div>
  )
}
