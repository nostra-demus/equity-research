import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { WatchRowCard } from './WatchRow'

// The watchlist stage: which names am I waiting on, and has the price got there yet.
//
// Unlike the constellation and the globe it is not a rendering of one company's swarm — it is a
// cross-company list, the first this stage has had. That is why App.tsx hides the company-scoped docks
// while it is showing: a document pool or a verdict banner belonging to whichever company happened to be
// selected, sitting beside a list of other names, would be worse than absent.
export function WatchlistStage() {
  const read = useStore((s) => s.watchlist)
  const loading = useStore((s) => s.watchlistLoading)
  const error = useStore((s) => s.watchlistError)
  const load = useStore((s) => s.loadWatchlist)
  const showArchived = useStore((s) => s.watchlistShowArchived)
  const setShowArchived = useStore((s) => s.setWatchlistShowArchived)
  const staticMode = useStore((s) => s.staticMode)
  const openComposer = useStore((s) => s.openWatchComposer)
  const [q, setQ] = useState('')
  const [origin, setOrigin] = useState<'all' | 'engine' | 'manual'>('all')

  useEffect(() => { void load() }, [load])

  const source = showArchived ? read?.archived ?? [] : read?.rows ?? []
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return source.filter((r) => {
      if (origin === 'engine' && r.origin === 'manual') return false
      if (origin === 'manual' && r.origin === 'engine') return false
      if (!needle) return true
      return (
        r.ticker.toLowerCase().includes(needle) ||
        (r.company_name ?? '').toLowerCase().includes(needle) ||
        r.why.toLowerCase().includes(needle) ||
        r.tags.some((t) => t.includes(needle))
      )
    })
  }, [source, q, origin])

  const met = read?.rows.filter((r) => r.state === 'condition_met').length ?? 0
  const engineCount = read?.rows.filter((r) => r.origin !== 'manual').length ?? 0
  const mineCount = read?.rows.filter((r) => r.origin !== 'engine').length ?? 0

  return (
    <div className="wl">
      <div className="wl__head">
        <div className="wl__title">{showArchived ? 'Archived' : 'Watchlist'}</div>
        <div className="wl__count">
          {source.length} {source.length === 1 ? 'name' : 'names'}
          {!showArchived && met > 0 && <> · <b>{met} {met === 1 ? 'condition' : 'conditions'} met</b></>}
        </div>
        <span className="wl__spacer" />
        <input
          className="fld fld--search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the watchlist"
        />
        <div className="seg" role="group" aria-label="Where the name came from">
          {(['all', 'engine', 'manual'] as const).map((o) => (
            <button key={o} className={`seg__btn${origin === o ? ' seg__btn--on' : ''}`} onClick={() => setOrigin(o)}>
              {o === 'all' ? 'All' : o === 'engine' ? 'Engine' : 'Mine'}
            </button>
          ))}
        </div>
        <button className="btn btn--ghost" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? '← Watchlist' : `Archived (${read?.archived.length ?? 0})`}
        </button>
        <button className="btn btn--ghost" title="Re-check every price now" disabled={loading} onClick={() => void load(true)}>
          {loading ? 'Checking…' : 'Refresh ↻'}
        </button>
        <button className="btn btn--amber" onClick={() => openComposer(null)} title="Add a name — including one the engine has never researched">+ Add</button>
      </div>

      {/* Provenance, always on screen: which engine artifact this half of the list came from, and how
          the two halves split (CLAUDE.md §5 — a figure carries where it came from). */}
      <div className="wl__sub">
        {read?.engine_source.generated_at
          ? <>From the {read.engine_source.generated_at} model portfolio · {engineCount} from the engine, {mineCount} you added</>
          : <>No model portfolio found — showing what you have added</>}
        {read && !read.quotes_enabled && <> · prices are off in this engine</>}
        {read?.unreadable.length ? <> · {read.unreadable.length} entr{read.unreadable.length === 1 ? 'y' : 'ies'} could not be read</> : null}
      </div>

      <div className="wl__list">
        {staticMode ? (
          <div className="wl__empty">The watchlist lives on the live engine. This is the read-only showcase.</div>
        ) : error ? (
          <div className="wl__empty">{error}</div>
        ) : loading && !read ? (
          <div className="wl__empty">Loading the watchlist…</div>
        ) : !rows.length ? (
          <div className="wl__empty">
            {showArchived
              ? 'Nothing archived. Names you hide from the watchlist are kept here and can be restored.'
              : q || origin !== 'all'
                ? 'No names match these filters.'
                : 'Nothing on the watchlist yet. Names the engine holds no position in appear here automatically, and you can add your own.'}
          </div>
        ) : (
          rows.map((r) => <WatchRowCard key={r.listing_key} row={r} />)
        )}
      </div>
    </div>
  )
}
