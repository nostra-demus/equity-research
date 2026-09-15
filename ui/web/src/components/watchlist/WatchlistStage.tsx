import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { WatchDetail } from './WatchDetail'
import { WatchInbox } from './WatchInbox'
import { ABSENT_PRICE_COPY, livePriceLabel, money, shortDay } from '../../lib/format'
import { NEEDS_YOU, STATUS_KEY, STATUS_LABEL, STATUS_MEANING, dateWords, rowStatus, sortRows, waitingText } from '../../lib/watchStatus'
import type { WatchRow } from '../../lib/types'

// The watchlist stage: one list, the most urgent names first, and the messages about them above it.
//
// Unlike the constellation and the globe it is not a rendering of one company's swarm — it is a
// cross-company list. That is why App.tsx hides the company-scoped docks while it is showing: a document
// pool or a verdict banner belonging to whichever company happened to be selected, sitting beside a list of
// other names, would be worse than absent.
//
// Each row says, in one of seven words, where the name stands — and what it is waiting for, in the
// research's own terms. Picking a row opens everything behind that word in the panel on the right.
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
  // The panel follows the picked name while it is on screen; otherwise it shows the most urgent one, so the
  // first thing on the screen is also the first thing explained.
  const selected = useMemo(() => rows.find((r) => r.listing_key === picked) ?? rows[0] ?? null, [rows, picked])
  const needYou = rows.filter((r) => NEEDS_YOU.has(rowStatus(r))).length
  const engineCount = read?.rows.filter((r) => r.origin !== 'manual').length ?? 0
  const mineCount = read?.rows.filter((r) => r.origin !== 'engine').length ?? 0

  return (
    <div className="wl">
      <div className="wl__head">
        <div className="wl__title">{showArchived ? 'Archived' : 'Watchlist'}</div>
        <div className="wl__count">
          {source.length} {source.length === 1 ? 'name' : 'names'}
          {!showArchived && needYou > 0 && <> · <b>{needYou} {needYou === 1 ? 'needs' : 'need'} you</b></>}
        </div>
        <span className="wl__spacer" />
        <input
          className="fld fld--search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the watchlist"
        />
        <button className="btn btn--ghost" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? '← Watchlist' : `Archived (${read?.archived.length ?? 0})`}
        </button>
        <button className="btn btn--ghost" title="Check every price now" disabled={loading} onClick={() => void load(true)}>
          {loading ? 'Checking…' : 'Refresh ↻'}
        </button>
        <button className="btn btn--amber" onClick={() => openComposer(null)} title="Add a name — including one the engine has never researched">+ Add</button>
      </div>

      {/* Provenance, always on screen: where each half of the list came from (CLAUDE.md §5). */}
      <div className="wl__sub">
        {engineCount} from research · {mineCount} you added
        {read && !read.quotes_enabled && (
          staticMode
            ? <> · read-only snapshot — no live prices, so nothing is checked</>
            : <> · prices are off in this engine</>
        )}
        {read?.unreadable.length ? <> · {read.unreadable.length} entr{read.unreadable.length === 1 ? 'y' : 'ies'} could not be read</> : null}
      </div>

      {!showArchived && <WatchInbox onPick={setPicked} />}

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
            <ul className="wlist__rows" aria-label="Watched names">
              {rows.map((r) => (
                <WatchListRow key={r.listing_key} row={r} selected={selected?.listing_key === r.listing_key} onSelect={setPicked} />
              ))}
            </ul>
            <WatchDetail row={selected} />
          </div>
        )}
      </div>
    </div>
  )
}

/** One name: its word, its price, what it is waiting for, and its next date. */
function WatchListRow({ row, selected, onSelect }: { row: WatchRow; selected: boolean; onSelect: (key: string) => void }) {
  const status = rowStatus(row)
  const waiting = waitingText(row) ?? row.watch?.headline ?? (row.why || (row.engine?.size_in_trigger ? `“${row.engine.size_in_trigger}”` : ''))
  // "Review", never "look again": that phrase belongs to the look-again PRICE, and one word must mean one thing.
  const date = dateWords(row.watch?.next_date) ?? (row.review_date ? `Review · ${shortDay(row.review_date)}` : null)
  const move = row.watch?.day_move_pct
  const unread = row.watch?.unread ?? 0
  return (
    <li>
      <button type="button" className={`wrow${selected ? ' is-sel' : ''}`} aria-pressed={selected} onClick={() => onSelect(row.listing_key)}>
        <span className={`wst wst--${STATUS_KEY[status]}`} title={STATUS_MEANING[status]}>{STATUS_LABEL[status]}</span>
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
              {money(row.quote.currency, row.quote.price)}
              <span className="wrow__meta">
                {typeof move === 'number' ? `${move > 0 ? '+' : move < 0 ? '−' : ''}${Math.abs(move)}% today` : livePriceLabel(row.quote).toLowerCase()}
              </span>
            </>
          ) : (
            <span className="wrow__none" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : 'No live price for this listing.'}>no price</span>
          )}
        </span>
        <span className="wrow__wait" title={waiting || undefined}>{waiting || '—'}</span>
        <span className="wrow__date">{date ?? ''}</span>
        {unread > 0
          ? <span className="wrow__dot" title={`${unread} unread ${unread === 1 ? 'message' : 'messages'}`} aria-label={`${unread} unread messages`} />
          : <span aria-hidden />}
      </button>
    </li>
  )
}
