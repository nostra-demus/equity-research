import { useCallback, useEffect, useRef, useState } from 'react'
import type { DiscoveryCard, DiscoveryPage, IdeaLane } from '../../../../shared/ideas-workspace'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { ArchivedBoardIdea, BoardIdea, SupplyChainLead } from '../../lib/types'
import { NewsLeadCard } from './BestIdeasView'
import { ChainCard } from './ChainLane'
import { usePersonalScope } from '../../lib/personalScope'
import { ReadingAnchor } from '../../lib/ReadingAnchor'

const TABS: { id: IdeaLane; label: string }[] = [
  { id: 'events', label: 'Events' }, { id: 'long', label: 'Long' }, { id: 'short', label: 'Short' },
  { id: 'chain', label: 'Chain' }, { id: 'archives', label: 'Idea archives' },
]
const FILTER_KEY = 'ideas.listing-exclusions.v1'
export function readListingExclusions(storage?: Pick<Storage, 'getItem'>): string[] {
  try {
    const raw = storage?.getItem(FILTER_KEY)
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((m) => m === 'HK' || m === 'IN')) return [...new Set(parsed)]
    }
  } catch { /* unavailable storage uses the requested defaults */ }
  return ['HK', 'IN']
}

export function EventsCard({ card }: { card: DiscoveryCard }) {
  const event = card.event!
  const [reportsOpen, setReportsOpen] = useState(() => event.reports.length === 1)
  return <article className="bidea discovery-event">
    <div className="bidea__head"><strong>{event.title}</strong></div>
    <div className="bidea__tags">{[...event.regions, ...event.topics].map((tag) => <span className="bidea__tag" key={tag}>{tag.replace(/_/g, ' ')}</span>)}</div>
    <p><span className="discovery-label">Latest reported change</span>{event.latest_change}</p>
    {event.implications.length > 0 ? <div><span className="discovery-label">Why it could matter · inference</span>
      <ul>{event.implications.map((step, i) => <li key={i}>{step}</li>)}</ul></div>
      : <p className="discovery-muted">Economic effects have not been assessed yet. Showing the source reports.</p>}
    <p className="discovery-muted">{event.independent_stories} distinct {event.independent_stories === 1 ? 'story' : 'stories'} · Updated <time dateTime={card.updated_at}>{new Date(card.updated_at).toLocaleString()}</time></p>
    <details open={reportsOpen} onToggle={(e) => setReportsOpen(e.currentTarget.open)}>
      <summary>Sources and developments · {event.reports.length} reports</summary>
      <ol className="discovery-reports">{event.reports.map((report) => <li key={report.event_id}>
        <a href={report.url} target="_blank" rel="noreferrer">{report.headline}</a>
        <small>{report.publisher} · {report.time_basis === 'observed' ? 'Observed locally ' : ''}<time dateTime={report.at}>{new Date(report.at).toLocaleString()}</time>
          {report.stance === 'challenges' ? ' · Challenges the earlier story' : ' · Reported, unverified'}</small>
      </li>)}</ol>
    </details>
  </article>
}

export function IdeasWorkspace() {
  const staticMode = useStore((s) => s.staticMode)
  const lane = useStore((s) => s.ideasLane)
  const personal = usePersonalScope(lane !== 'events')
  const matches = useCallback((card: DiscoveryCard) => card.kind === 'event' || (card.kind === 'chain'
    ? personal.company(String(card.payload.symbol || ''), String(card.payload.name || ''), card.listings.long)
    : personal.company(String(card.payload.ticker || ''), String(card.payload.company || ''), card.listings.long)
      || (!!card.payload.pair_with && personal.company(String(card.payload.pair_with), '', card.listings.short))), [personal])
  const setLane = useStore((s) => s.setIdeasLane)
  const [hidden, setHidden] = useState<string[]>(() => (() => { try { return readListingExclusions(window.localStorage) } catch { return ['HK', 'IN'] } })())
  const [kind, setKind] = useState('all')
  const [page, setPage] = useState<DiscoveryPage | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [undo, setUndo] = useState<DiscoveryCard | null>(null)
  const count = useRef(30)
  const pageDepth = useRef(1)
  const sequence = useRef(0)
  const pending = useRef(false)
  const mounted = useRef(true)
  const hideKey = [...hidden].sort().join(',')
  const viewKey = JSON.stringify([lane, hideKey, kind, personal.scope])
  const [previousView, setPreviousView] = useState(viewKey)
  const viewport = useRef<HTMLDivElement>(null)
  const pageRef = useRef(page)
  pageRef.current = page
  const [arrivals, setArrivals] = useState<Set<string>>(new Set())

  // Reset an explicit view before React commits it, so old results never flash under new filters.
  if (previousView !== viewKey) {
    setPreviousView(viewKey)
    count.current = 30
    pageDepth.current = 1
    pageRef.current = null
    sequence.current++
    setPage(null)
    setLoading(true)
    setError(null)
    setUndo(null)
    setArrivals(new Set())
  }

  const load = useCallback(async (refresh = false, more = false, background = false) => {
    const seq = ++sequence.current
    pending.current = true
    setLoading(true)
    setLoadingMore(more)
    try {
      let next = await api.ideasWorkspace(lane, hideKey, kind, '0', refresh)
      if (seq !== sequence.current || !mounted.current) return
      const rows = [...next.rows]
      const previousKeys = new Set(pageRef.current?.rows.map((row) => row.key))
      // Keep every mounted card across arrivals and re-ranking, including the one being read.
      // Reaching the end proves a removed card's absence instead of retaining a stale card.
      const remaining = new Set(pageRef.current?.rows.filter(matches).map((row) => row.key))
      for (const row of rows) remaining.delete(row.key)
      const target = count.current
      const cursors = new Set<string>(['0'])
      // An externally archived card cannot be recovered. Bound automatic scans; Retry / Show more
      // can reconcile the full result on demand while a limited poll retains the last good view.
      const maxPages = background ? Math.max(pageDepth.current, Math.ceil(Math.max(target, previousKeys.size) / 30)) + 4 : Infinity
      while (next.next_cursor && (rows.filter(matches).length < target || remaining.size > 0)) {
        if (cursors.size >= maxPages) throw new Error('Could not update every loaded card. Retry to check the full list.')
        if (cursors.has(next.next_cursor)) throw new Error('The next page did not advance. Please retry.')
        cursors.add(next.next_cursor)
        next = await api.ideasWorkspace(lane, hideKey, kind, next.next_cursor)
        if (seq !== sequence.current || !mounted.current) return
        if (!next.rows.length && next.next_cursor) throw new Error('The next page was empty. Please retry.')
        rows.push(...next.rows)
        for (const row of next.rows) remaining.delete(row.key)
      }
      if (seq !== sequence.current || !mounted.current) return
      pageDepth.current = cursors.size
      // Retain prior keys and the requested window, not incidental padding from the last API page.
      // Otherwise each single prepend mounts another full page and eventually defeats pagination.
      let matched = 0
      const kept = rows.filter((row) => matches(row) && (++matched <= target || previousKeys.has(row.key)))
      // Show more refetches from the head; unread page padding still means more is available.
      const hasMore = next.next_cursor || (kept.length < rows.filter(matches).length ? '0' : null)
      setArrivals(viewport.current && viewport.current.scrollTop <= 1 && previousKeys.size
        ? new Set(kept.filter((row) => !previousKeys.has(row.key)).map((row) => row.key)) : new Set())
      setPage({ ...next, next_cursor: hasMore, rows: [...new Map(kept.map((r) => [r.key, r])).values()] })
      setError(null)
    } catch (e: any) {
      if (seq === sequence.current && mounted.current) setError(e?.message || 'Could not load ideas. Please retry.')
    } finally {
      if (seq === sequence.current && mounted.current) { pending.current = false; setLoading(false); setLoadingMore(false) }
    }
  }, [lane, hideKey, kind, matches])

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current++ } }, [])
  useEffect(() => {
    void load(false, false, !!pageRef.current)
    const refreshVisible = () => { if (document.visibilityState === 'visible' && !pending.current) void load(false, false, true) }
    const timer = setInterval(refreshVisible, 30_000)
    document.addEventListener('visibilitychange', refreshVisible)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refreshVisible); sequence.current++ }
  }, [load, viewKey])

  const changeHidden = (markets: string[]) => {
    setHidden(markets)
    try { window.localStorage.setItem(FILTER_KEY, JSON.stringify(markets)) } catch { /* the controls still work */ }
  }
  const loadRef = useRef(load)
  loadRef.current = load
  const visibleRows = page?.rows.filter(matches) || []

  const file = async (card: DiscoveryCard, action: 'archive' | 'restore') => {
    if (busy) return
    setBusy(card.key)
    setError(null)
    try {
      const { card: updated } = await api.fileIdeaCard(card, action, crypto.randomUUID())
      if (!mounted.current) return
      setUndo(action === 'archive' ? updated : null)
      setPage((p) => p ? { ...p, rows: p.rows.filter((r) => r.key !== card.key), total: Math.max(0, p.total - 1) } : p)
      await loadRef.current()
    } catch (e: any) { if (mounted.current) setError(e?.message || 'Could not save the filing action. Please retry.') }
    finally { if (mounted.current) setBusy(null) }
  }

  return <ReadingAnchor viewport={viewport} view={viewKey}><div className="bideas discovery" ref={viewport}>
    <div className="bideas__tabs discovery-tabs" role="tablist" aria-label="Idea lane">
      {TABS.map((tab, index) => <button type="button" key={tab.id} id={`ideas-${tab.id}-tab`} role="tab"
        aria-selected={lane === tab.id} aria-controls={`ideas-${tab.id}-panel`} tabIndex={lane === tab.id ? 0 : -1}
        className={`bideas__tab${lane === tab.id ? ' bideas__tab--on' : ''}`} onClick={() => setLane(tab.id)}
        onKeyDown={(e) => {
          const next = e.key === 'ArrowRight' ? (index + 1) % TABS.length : e.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : null
          if (next === null) return
          e.preventDefault(); setLane(TABS[next].id); document.getElementById(`ideas-${TABS[next].id}-tab`)?.focus()
        }}>{tab.label}</button>)}
    </div>
    <div className="discovery-filters" role="group" aria-label="Listing market exclusions">
      {([['HK', 'Hong Kong'], ['IN', 'India']] as const).map(([market, label]) => <label key={market}>
        <input type="checkbox" checked={hidden.includes(market)} onChange={(e) => changeHidden(e.target.checked ? [...hidden, market] : hidden.filter((m) => m !== market))} />Hide {label} listings
      </label>)}
      <button type="button" onClick={() => changeHidden([])}>Show all markets</button>
      {lane === 'events' && <small>Company cards only · global events stay visible</small>}
    </div>
    {undo && <div className="discovery-notice" role="status">Saved to Idea archives. <button type="button" disabled={!!busy} onClick={() => void file(undo, 'restore')}>Undo</button><button type="button" aria-label="Dismiss undo notice" onClick={() => setUndo(null)}>×</button></div>}
    {error && <div className="bideas__fetch bideas__fetch--bad" role="alert">{error} {page && 'Showing the last loaded cards.'}<button type="button" disabled={loading} onClick={() => void load()}>Retry</button></div>}
    <section role="tabpanel" id={`ideas-${lane}-panel`} aria-labelledby={`ideas-${lane}-tab`} aria-busy={!page && loading}>
      <header className="bideas__sectionhead"><div><h2>{lane === 'events' ? 'Developing events' : lane === 'archives' ? 'Idea archives' : `${lane === 'chain' ? 'Chain' : lane === 'long' ? 'Long' : 'Short'} ideas to research`}</h2>
        <p>{lane === 'events' ? 'Follow what is changing and form your own research ideas.' : lane === 'archives' ? 'Filed ideas and earlier expired records, with their sources preserved.' : 'Choose an idea to investigate. These leads have not been rated as investments.'}</p></div>
        {page && <span>{personal.scope === 'universe' ? `${page.total} shown` : `${visibleRows.length}${page.next_cursor ? '+' : ''} matching ${personal.label.toLowerCase()}`}{page.hidden ? ` · ${page.hidden} hidden by market` : ''}</span>}
      </header>
      {lane === 'archives' && <label className="discovery-kind">Type <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Archive type"><option value="all">All</option><option value="idea">Long and Short</option><option value="event">Events</option><option value="chain">Chain</option></select></label>}
      {staticMode && <p className="discovery-muted">Saved snapshot · connect the engine for live Events and archive actions.</p>}
      {page?.notices.length ? <details className="discovery-health"><summary>Saved-data status</summary>{page.notices.map((notice) => <p key={notice}>{notice}</p>)}</details> : null}
      {!page && loading ? <div className="bideas__list"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div> : null}
      {page && visibleRows.length === 0 && <p className="bideas__queueempty">{personal.scope !== 'universe' ? `No cards match your ${personal.label.toLowerCase()} and market filters. Choose Universe to see other companies.` : page.hidden ? 'No cards match these market filters.' : lane === 'archives' ? 'No archived cards yet.' : lane === 'events' ? 'No developing events are available yet.' : 'No ideas in this view yet.'}</p>}
      <div className="bideas__list">{visibleRows.map((card) => {
        const side = lane === 'short' ? 'short' : lane === 'long' ? 'long' : card.sides.find((s) => !card.listings[s] || !hidden.includes(card.listings[s]!)) || 'long'
        const expired = card.expired || (card.kind === 'idea' && card.payload.status !== 'promoted'
          && (!Number.isFinite(Date.parse(String(card.payload.decay_at))) || Date.parse(String(card.payload.decay_at)) <= Date.now()))
        const filed = card.archive_reason !== null || expired
        return <div className={`discovery-card${arrivals.has(card.key) ? ' discovery-card--new' : ''}`} key={card.key} data-reading-key={card.key}>
          <div className="discovery-card-actions">
            <small>{card.kind !== 'event' && (card.listings[side] ? `Listing: ${card.listings[side]}` : 'Listing unknown')}
              {filed && ` · ${card.archive_reason === 'manual' ? 'Archived' : 'Expired'} ${card.archived_at ? new Date(card.archived_at).toLocaleDateString() : ''}`}</small>
            {!staticMode && (card.archive_reason === 'manual' ? <button type="button" disabled={!!busy} onClick={() => void file(card, 'restore')}>{busy === card.key ? 'Restoring…' : 'Restore'}</button>
              : !filed ? <button type="button" disabled={!!busy} onClick={() => void file(card, 'archive')}>{busy === card.key ? 'Archiving…' : 'Archive'}</button> : null)}
          </div>
          {card.kind === 'event' && card.event ? <EventsCard card={card} /> : card.kind === 'chain' ? <ChainCard lead={card.payload as unknown as SupplyChainLead} filed={filed} />
            : expired ? <NewsLeadCard idea={card.payload as unknown as ArchivedBoardIdea} side={side} auditOnly timelineStatus="expired" />
              : <NewsLeadCard idea={card.payload as unknown as BoardIdea} side={side} filed={filed} onAction={() => loadRef.current(true)} timelineStatus={card.payload.status === 'promoted' ? 'promoted' : 'current'} />}
        </div>
      })}</div>
      {page?.next_cursor && <button type="button" className="discovery-more" disabled={loadingMore} onClick={() => { count.current = Math.max(count.current, visibleRows.length) + 30; void load(false, true) }}>{loadingMore ? 'Loading…' : 'Show more'}</button>}
    </section>
  </div></ReadingAnchor>
}
