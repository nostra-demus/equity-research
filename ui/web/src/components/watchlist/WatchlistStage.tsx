import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { WatchDetail } from './WatchDetail'
import { WatchInbox } from './WatchInbox'
import { ABSENT_PRICE_COPY, money, shortDay } from '../../lib/format'
import { NEEDS_YOU, dateParts, quoteNote, rowSignal, rowStatus, sortRows, waitingParts } from '../../lib/watchStatus'
import type { WatchRow } from '../../lib/types'

// The watchlist stage: one table of names — the ones that need you first — and one panel for the name picked.
//
// Unlike the constellation and the globe it is not a rendering of one company's swarm — it is a
// cross-company list. That is why App.tsx hides the company-scoped docks while it is showing: a document
// pool or a verdict banner belonging to whichever company happened to be selected, sitting beside a list of
// other names, would be worse than absent.
//
// Each row carries a signal — what happened to the name, in plain words, in a colour that always means the
// same thing — and what it is waiting for, in the research's own terms, under column labels that say what each
// value is. The table and the panel scroll on their own, and the messages open from the header on demand, so
// the names always get the screen.
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
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => { void load() }, [load])

  const source = showArchived ? read?.archived ?? [] : read?.rows ?? []
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const hit = (r: WatchRow) =>
      !needle ||
      r.ticker.toLowerCase().includes(needle) ||
      (r.company_name ?? '').toLowerCase().includes(needle) ||
      r.why.toLowerCase().includes(needle) ||
      r.tags.some((t) => t.includes(needle))
    return sortRows(source.filter(hit))
  }, [source, q])
  // The table's two groups: what needs you, then everything being watched quietly. Archived names are one group.
  const groups = useMemo(() => {
    if (showArchived) return rows.length ? [{ key: 'archived', label: 'Archived', rows }] : []
    return [
      { key: 'need', label: 'Needs you', rows: rows.filter((r) => NEEDS_YOU.has(rowStatus(r))) },
      { key: 'rest', label: 'Watching', rows: rows.filter((r) => !NEEDS_YOU.has(rowStatus(r))) },
    ].filter((g) => g.rows.length > 0)
  }, [rows, showArchived])
  // The panel follows the picked name while it is on screen; otherwise it shows the most urgent one, so the
  // first thing on the screen is also the first thing explained.
  const selected = useMemo(() => rows.find((r) => r.listing_key === picked) ?? rows[0] ?? null, [rows, picked])
  const needYou = rows.filter((r) => NEEDS_YOU.has(rowStatus(r))).length
  const engineCount = read?.rows.filter((r) => r.origin !== 'manual').length ?? 0
  const mineCount = read?.rows.filter((r) => r.origin !== 'engine').length ?? 0

  return (
    <div className="wl">
      <div className="wl__head">
        <div className="wl__titleblock">
          <div className="wl__title">{showArchived ? 'Archived' : 'Watchlist'}</div>
          {/* What is on the list — and, always on screen, where each half of it came from (CLAUDE.md §5). */}
          <div className="wl__count">
            {source.length} {source.length === 1 ? 'name' : 'names'}
            {!showArchived && needYou > 0 && <> · <b>{needYou} {needYou === 1 ? 'needs' : 'need'} you</b></>}
            {!showArchived && <> · {engineCount} from research · {mineCount} yours</>}
            {read && !read.quotes_enabled && (staticMode ? <> · read-only snapshot, no live prices</> : <> · prices are off in this engine</>)}
            {read?.unreadable.length ? <> · {read.unreadable.length} entr{read.unreadable.length === 1 ? 'y' : 'ies'} could not be read</> : null}
          </div>
        </div>
        <span className="wl__spacer" />
        <input
          className="fld fld--search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the watchlist"
        />
        {!showArchived && <WatchInbox onPick={setPicked} />}
        <button className="btn btn--ghost" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? '← Watchlist' : `Archived (${read?.archived.length ?? 0})`}
        </button>
        <button className="btn btn--ghost" title="Check every price now" disabled={loading} onClick={() => void load(true)}>
          {loading ? 'Checking…' : 'Refresh ↻'}
        </button>
        <button className="btn btn--amber" onClick={() => openComposer(null)} title="Add a name — including one the engine has never researched">+ Add</button>
      </div>

      <div className="wl__list">
        {staticMode && !rows.length ? (
          <div className="wl__empty">Nothing on the watchlist in this snapshot.</div>
        ) : error ? (
          <div className="wl__empty">
            Could not load the watchlist ({error}).{' '}
            <button className="btn btn--mini" onClick={() => void load(true)}>Try again</button>
          </div>
        ) : loading && !read ? (
          <div className="wlist__loading" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="winbox__skel" />)}
          </div>
        ) : !rows.length ? (
          <div className="wl__empty">
            {showArchived
              ? 'Nothing archived. Names you hide from the watchlist are kept here and can be restored.'
              : q
                ? `No names match “${q.trim()}”.`
                : 'Nothing on the watchlist yet. Research that ends in Watchlist puts a name here on its own, and you can add your own.'}
          </div>
        ) : (
          <div className="wlist">
            <div className="wlist__main">
              {/* The column labels, kept in view while the names scroll under them. Each row's own text carries its
                  labels too, so this row is for the eye only. */}
              <div className="wlist__cols" aria-hidden="true">
                <span>Status</span>
                <span>Name</span>
                <span className="wlist__num">Price</span>
                <span>Waiting for</span>
                <span className="wlist__col--date">Next date</span>
                <span />
              </div>
              {groups.map((g) => (
                <section key={g.key} className="wlist__group" aria-label={`${g.label}: ${g.rows.length}`}>
                  <h3 className="wlist__grouphead">{g.label}<span>{g.rows.length}</span></h3>
                  <ul className="wlist__rows">
                    {g.rows.map((r) => (
                      <WatchListRow key={r.listing_key} row={r} selected={selected?.listing_key === r.listing_key} onSelect={setPicked} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <WatchDetail row={selected} />
          </div>
        )}
      </div>
    </div>
  )
}

/** One name as a table row: its signal, the name, its price, what it waits for, and its next date. */
function WatchListRow({ row, selected, onSelect }: { row: WatchRow; selected: boolean; onSelect: (key: string) => void }) {
  const sig = rowSignal(row)
  const w = row.watch
  const wait = waitingParts(row)
    ?? (w?.headline ? { label: 'Now', value: w.headline } : null)
    ?? (row.why ? { label: 'Why you’re watching', value: row.why } : null)
    ?? (row.engine?.size_in_trigger ? { label: 'From the research', value: `“${row.engine.size_in_trigger}”` } : null)
  // "Review": the day to re-check this name — yours, else the research's own next review. A review price is the
  // same idea in price (re-check here, not buy), so the one word keeps one meaning.
  const date = dateParts(w?.next_date) ?? (row.review_date ? { label: 'Review', value: shortDay(row.review_date) } : null)
  const move = w?.day_move_pct
  const unread = w?.unread ?? 0
  return (
    <li>
      <button type="button" className={`wrow${selected ? ' is-sel' : ''}`} aria-pressed={selected} onClick={() => onSelect(row.listing_key)}>
        <span className="wrow__st">
          <span className={`wst wst--${sig.tone}`} title={sig.meaning}>{sig.label}</span>
        </span>
        <span className="wrow__who">
          <span className="wrow__sym">
            {row.ticker}
            {row.origin !== 'engine' && <span className="wl__mine" aria-label="you added this">·</span>}
          </span>
          <span className="wrow__co">{row.company_name ?? ''}</span>
        </span>
        <span className="wrow__px">
          {row.quote ? (
            <>
              <span className="wrow__pxval">{money(row.quote.currency, row.quote.price)}</span>
              <span className="wrow__meta">{quoteNote(row.quote, move)}</span>
            </>
          ) : (
            <span className="wrow__none" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : 'No live price for this listing.'}>no price</span>
          )}
        </span>
        <Cell parts={wait} />
        <Cell parts={date} className="wrow__cell--date" />
        {unread > 0
          ? <span className="wrow__dot" title={`${unread} unread ${unread === 1 ? 'message' : 'messages'}`} aria-label={`${unread} unread messages`} />
          : <span aria-hidden />}
      </button>
    </li>
  )
}

/** A value with its quiet label above it — or a dash, so an empty cell reads as empty rather than as a gap. */
function Cell({ parts, className = '' }: { parts: { label: string; value: string } | null; className?: string }) {
  return (
    <span className={`wrow__cell ${className}`.trim()}>
      {parts ? (
        <>
          <span className="wrow__label">{parts.label}</span>
          <span className="wrow__value" title={parts.value}>{parts.value}</span>
        </>
      ) : (
        <span className="wrow__none">—</span>
      )}
    </span>
  )
}
