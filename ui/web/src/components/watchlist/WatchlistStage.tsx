import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { WatchRowCard } from './WatchRow'
import { WatchTile } from './WatchTile'
import { WatchDetail } from './WatchDetail'
import { sortForGrid, tileBand, type TileBand } from '../../lib/watchlistView'

// The watchlist stage: which names am I waiting on, and has the price got there yet.
//
// Unlike the constellation and the globe it is not a rendering of one company's swarm — it is a
// cross-company list, the first this stage has had. That is why App.tsx hides the company-scoped docks
// while it is showing: a document pool or a verdict banner belonging to whichever company happened to be
// selected, sitting beside a list of other names, would be worse than absent.
type SortKey = 'name' | 'verdict' | 'gap' | 'review'

/** A header cell that sorts. Ascending first, then descending, then back to the default order. */
function SortTh({ id, sort, setSort, children, num, title }: {
  id: SortKey
  sort: { key: SortKey | null; dir: 1 | -1 }
  setSort: (s: { key: SortKey | null; dir: 1 | -1 }) => void
  children: React.ReactNode
  num?: boolean
  title?: string
}) {
  const on = sort.key === id
  return (
    <th className={num ? 'atable__num' : undefined} title={title}>
      <button
        className={`wl__sort${on ? ' wl__sort--on' : ''}`}
        onClick={() => setSort(on && sort.dir === 1 ? { key: id, dir: -1 } : on ? { key: null, dir: 1 } : { key: id, dir: 1 })}
        aria-label={`Sort by ${id}`}
      >
        {children}{on && <span className="wl__caret">{sort.dir === 1 ? '▲' : '▼'}</span>}
      </button>
    </th>
  )
}

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
  const [sort, setSort] = useState<{ key: SortKey | null; dir: 1 | -1 }>({ key: null, dir: 1 })
  const layout = useStore((s) => s.watchlistLayout)
  const setLayout = useStore((s) => s.setWatchlistLayout)
  const [picked, setPicked] = useState<string | null>(null)

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

  const sorted = useMemo(() => {
    if (!sort.key) return rows // the server's own order: anything actionable first
    const k = sort.key
    // A verdict is not alphabetical — it is an ordered scale from "own it" to "do not".
    const VERDICT_RANK: Record<string, number> = { 'Strong Buy': 0, Buy: 1, 'Starter Position Only': 2, Watchlist: 3, 'Pair Trade / Hedge Required': 4, Avoid: 5, 'Short Candidate': 6 }
    const val = (r: typeof rows[number]) =>
      k === 'name' ? r.ticker
      : k === 'verdict' ? String(VERDICT_RANK[String(r.engine?.decision)] ?? 9).padStart(2, '0')
      : k === 'gap' ? (r.nearest_gap_pct == null ? Infinity : Math.abs(r.nearest_gap_pct))
      : (r.review_date ?? '9999-12-31')
    return [...rows].sort((a, b) => {
      const av = val(a), bv = val(b)
      if (av === bv) return a.ticker.localeCompare(b.ticker)
      return (av < bv ? -1 : 1) * sort.dir
    })
  }, [rows, sort])

  // Conditions met, not rows — a row can carry several simultaneously met triggers, matching the same
  // total the cross-view badge (ViewToggle) computes from watchlistMetCount.
  // The grid's own order: fired first, then nearest in whichever unit applies, then the unmeasurable.
  // Deliberately not the table's sort — a grid you have to sort before it tells you anything is a table.
  const gridRows = useMemo(() => sortForGrid(rows), [rows])
  // Keep the selection pointing at a name that is still on screen. A filter change or a refresh that drops
  // the selected row would otherwise leave the panel showing a name the grid no longer contains.
  const selected = useMemo(
    () => gridRows.find((r) => r.listing_key === picked) ?? null,
    [gridRows, picked],
  )
  const bandCounts = useMemo(() => {
    const c: Record<TileBand, number> = { met: 0, due: 0, near: 0, waiting: 0, noeval: 0 }
    for (const r of gridRows) c[tileBand(r)]++
    return c
  }, [gridRows])

  const met = read?.rows.reduce((n, r) => n + r.evals.filter((e) => e.state === 'condition_met').length, 0) ?? 0
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
        <div className="seg" role="group" aria-label="How to show the list">
          {(['grid', 'table'] as const).map((l) => (
            <button
              key={l}
              className={`seg__btn${layout === l ? ' seg__btn--on' : ''}`}
              onClick={() => setLayout(l)}
              title={l === 'grid' ? 'One tile per name — the whole list at a glance' : 'The full table — every column, and where you edit'}
            >
              {l === 'grid' ? 'Grid' : 'Table'}
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
        {/* WHO is on the list comes from the standing calls ledger, not the sizing file — sizing only
            DECORATES an engine row with its trigger prose. Naming the sizing file as the source of the
            whole engine half could point at a dated artifact that never actually contained some of the
            names shown (a scoped `/research:size TICKER` run, or one older than a standing call). */}
        {engineCount} from the engine
        {read?.engine_source.generated_at
          ? <> (trigger notes from the {read.engine_source.generated_at} model portfolio)</>
          : <> (no model portfolio found, so no trigger notes)</>}
        {' '}· {mineCount} you added
        {read && !read.quotes_enabled && (
          staticMode
            // The showcase can show WHAT you are waiting for, but not whether it has happened — that
            // needs a live price. Saying so is better than a column of dashes with no explanation.
            ? <> · read-only snapshot — no live prices, so nothing is evaluated</>
            : <> · prices are off in this engine</>
        )}
        {read?.unreadable.length ? <> · {read.unreadable.length} entr{read.unreadable.length === 1 ? 'y' : 'ies'} could not be read</> : null}
      </div>

      {/* The grid replaces words with position and colour, so it owes the reader a key. The counts double
          as the answer to "is anything hot?" without scanning a single tile. */}
      {layout === 'grid' && !!gridRows.length && (
        <div className="wgrid__legend">
          <span className="wgrid__key wgrid__key--met">{bandCounts.met} fired</span>
          <span className="wgrid__key wgrid__key--due">{bandCounts.due} review due</span>
          <span className="wgrid__key wgrid__key--near">{bandCounts.near} near</span>
          <span className="wgrid__key">{bandCounts.waiting} waiting</span>
          {bandCounts.noeval > 0 && <span className="wgrid__key wgrid__key--noeval">{bandCounts.noeval} not evaluable</span>}
          <span className="wgrid__note">
            distance to the nearest trigger — <b>%</b> the price must move, <b>days</b> until a date. The two units are never mixed.
          </span>
        </div>
      )}

      <div className="wl__list">
        {staticMode && !rows.length ? (
          <div className="wl__empty">Nothing on the watchlist in this snapshot.</div>
        ) : error ? (
          <div className="wl__empty">{error}</div>
        ) : loading && !read ? (
          <div className="wl__empty">Loading the watchlist…</div>
        ) : !sorted.length ? (
          <div className="wl__empty">
            {showArchived
              ? 'Nothing archived. Names you hide from the watchlist are kept here and can be restored.'
              : q || origin !== 'all'
                ? 'No names match these filters.'
                : 'Nothing on the watchlist yet. Names the engine holds no position in appear here automatically, and you can add your own.'}
          </div>
        ) : layout === 'grid' ? (
          <div className="wgrid">
            <div className="wgrid__tiles" role="list">
              {gridRows.map((r) => (
                <WatchTile key={r.listing_key} row={r} selected={r.listing_key === picked} onSelect={setPicked} />
              ))}
            </div>
            <WatchDetail row={selected} />
          </div>
        ) : (
          <table className="atable wl__table">
            <thead>
              <tr>
                <SortTh id="name" sort={sort} setSort={setSort}>Name</SortTh>
                <SortTh id="verdict" sort={sort} setSort={setSort}>Verdict</SortTh>
                <th>Why / triggers</th>
                <th className="atable__num">Price</th>
                <SortTh id="gap" sort={sort} setSort={setSort} num title="How far the price still has to move for the nearest trigger to fire">To trigger</SortTh>
                <SortTh id="review" sort={sort} setSort={setSort} num>Review</SortTh>
                <th className="atable__num">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => <WatchRowCard key={r.listing_key} row={r} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
