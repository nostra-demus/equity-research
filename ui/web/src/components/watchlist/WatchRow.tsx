import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { ABSENT_PRICE_COPY, decisionColor, livePriceLabel, livePriceTitle, money, shortDay } from '../../lib/format'
import type { WatchRow as Row } from '../../lib/types'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** A review date is not decoration — it is the date you said you would look again. Past due outranks
 *  soon, which outranks a date that is simply set. */
function reviewTone(date: string | null): 'overdue' | 'today' | 'soon' | 'set' | 'none' {
  if (!date) return 'none'
  const today = todayISO()
  if (date < today) return 'overdue'
  if (date === today) return 'today'
  const soon = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
  return date <= soon ? 'soon' : 'set'
}

/** The shortest true thing about a trigger; the arithmetic rides in the hover. */
function chipText(kind: string, state: string, due?: boolean, reason?: string | null): string {
  if (state === 'condition_met') return 'met'
  if (due) return 'due'
  if (state === 'not_evaluable') return reason ? String(reason).replace(/_/g, ' ') : 'not checkable'
  return kind === 'price_level' ? 'level' : kind === 'pct_drop' ? 'drop' : kind === 'valuation_mos' ? 'value' : 'date'
}

/**
 * One row of the watchlist, on the app's standard .atable — the same table the activity log and the
 * screener's candidates use, rather than a bespoke grid.
 *
 * The columns are chosen from what actually varies. The engine's VERDICT does (Watchlist / Avoid /
 * Short Candidate) and is the most consequential thing on the row: one of these names is a short and two
 * are names the engine says to avoid, which a reader must not mistake for thirteen things to buy.
 * Conviction, origin and roll-up state do not vary yet, so they are marks and hovers rather than columns.
 */
export function WatchRowCard({ row }: { row: Row }) {
  const [menu, setMenu] = useState(false)
  const [armed, setArmed] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const archiveWatch = useStore((s) => s.archiveWatch)
  const restoreWatch = useStore((s) => s.restoreWatch)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const anyRunForTicker = useStore((s) => s.anyRunForTicker)
  const tickers = useStore((s) => s.tickers)
  const openCallFile = useStore((s) => s.openCallFile)
  const openComposer = useStore((s) => s.openWatchComposer)
  const staticMode = useStore((s) => s.staticMode)
  const pending = useStore((s) => s.watchlistPending) === row.ticker
  const running = anyRunForTicker(row.ticker)
  // A RESURFACED row still carries its old `archive` record (mergeWatchlist never clears it — the record
  // is what lets a SECOND archive re-mute cleanly), but the server already decided it belongs in the
  // active list because the engine's assertion changed since the mute. Rendering it as archived anyway —
  // Restore-only, no Thesis/Edit/Run/Archive — hid every action on exactly the row §8 exists to surface.
  const isArchived = !!row.archive && !row.resurfaced

  useEffect(() => {
    if (!menu) return
    const away = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) { setMenu(false); setArmed(false) } }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setArmed(false) } }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [menu])

  const verdict = row.engine?.decision ?? null
  const reason = row.why || (row.engine?.size_in_trigger ? `“${row.engine.size_in_trigger}”` : '')
  // A manual watchlist name is a supported core use case that has never been researched — no data/<TICKER>
  // folder at all. "Run the full pipeline" reached all the way to a launch-time rejection for one, after
  // the person had already picked it and confirmed; check pool membership up front and route it through
  // Edit (which reaches the same add-a-company flow the composer's own lookup uses) instead.
  const inPool = tickers.some((t) => t.ticker === row.ticker)
  const edit = () =>
    openComposer(
      { ticker: row.ticker, company_name: row.company_name, currency: row.currency, exchange: row.exchange,
        why: row.why, conviction: row.conviction, review_date: row.review_date, triggers: row.triggers },
      row.entry_id,
    )

  // Never in static mode: the showcase has no backend to serve the file from, so the link would only 404.
  const thesisHref = !staticMode && row.entry_id && row.attachments.length ? api.watchAttachmentUrl(row.entry_id, row.attachments[0].attachment_id) : null
  const rowClass = row.state === 'condition_met' ? 'wl__tr--met' : row.state === 'due' ? 'wl__tr--due' : ''

  return (
    <tr className={`${rowClass}${isArchived ? ' wl__tr--archived' : ''}`}>
      <td className="wl__td--name">
        <div
          className="sym"
          title={[row.company_name, row.added_at ? `added ${shortDay(row.added_at.slice(0, 10))}` : row.engine_since ? `engine call ${shortDay(row.engine_since)}` : null,
                  row.origin === 'engine' ? 'from the engine' : row.origin === 'manual' ? 'you added this' : 'engine, with your notes on top',
                  row.conviction ? `conviction: ${row.conviction}` : null].filter(Boolean).join(' · ')}
        >
          {row.ticker}
          {/* a mark, not a column: origin only distinguishes anything once you have your own names */}
          {row.origin !== 'engine' && <span className="wl__mine" aria-label="you added this">·</span>}
        </div>
        <div className="wl__co" title={row.company_name ?? undefined}>{row.company_name || '—'}</div>
      </td>

      <td>
        {verdict
          ? <span className="wl__verdict" style={{ color: decisionColor(verdict) }} title={`The engine's own call on ${row.ticker}`}>{verdict}</span>
          : <span className="wl__verdict wl__verdict--none" title="You added this — the engine has not researched it">yours</span>}
      </td>

      <td className="wl__td--why">
        <div className={`wl__why${row.why ? '' : ' wl__why--engine'}`} title={reason || undefined}>{reason || 'No reason recorded yet.'}</div>
        <div className="wl__chips">
          {row.evals.map((e) => (
            <span
              key={e.trigger_id}
              className={`wl__trg ${e.state === 'condition_met' ? 'wl__trg--met' : e.due ? 'wl__trg--due' : e.state === 'not_evaluable' ? 'wl__trg--unevaluable' : 'wl__trg--armed'}`}
              title={e.detail}
            >
              {chipText(e.kind, e.state, e.due, e.reason)}
            </span>
          ))}
          {!row.evals.length && !isArchived && (
            <button className="wl__trg wl__trg--add" onClick={edit} title="Nothing is being checked against the price yet">+ trigger</button>
          )}
          {row.resurfaced && <span className="wl__trg wl__trg--resurfaced" title={`Archived ${row.archive?.at.slice(0, 10)}. The engine has since changed what it says.`}>engine changed</span>}
        </div>
      </td>

      <td className="atable__num">
        {row.quote ? (
          <>
            <div className="wl__price">{money(row.quote.currency, row.quote.price)}</div>
            {/* livePriceTitle, the same tooltip the decision banner uses — names the as-of date/time (or
                which close it is) and the feed that answered (CLAUDE.md §5: a web-sourced number carries
                its date and source). The identity-only title this used to build left a watchlist price
                looking like a bare, undated number next to the banner's fully-dated one. */}
            <div className="wl__meta" title={livePriceTitle(row.quote, null)}>
              {livePriceLabel(row.quote).toLowerCase()}{row.quote.delayed ? ' · delayed' : ''}{row.quote.stale ? ' · not current' : ''}
            </div>
          </>
        ) : (
          <>
            <div className="wl__price wl__price--absent" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : 'No live price for this listing.'}>—</div>
            <div className="wl__meta">{row.quote_reason ? String(row.quote_reason).replace(/_/g, ' ') : 'no price'}</div>
          </>
        )}
      </td>

      {/* The one number that IS comparable down the column — six currencies sit in the price column. */}
      <td className="atable__num">
        {row.state === 'condition_met'
          ? <span className="wl__gap wl__gap--met">met</span>
          : row.nearest_gap_pct != null
            ? <span className="wl__gap" title="How far the price still has to move for the nearest trigger to fire">{row.nearest_gap_pct > 0 ? '+' : ''}{row.nearest_gap_pct}%</span>
            : <span className="wl__gap wl__gap--none" title="No trigger is being checked against the price">—</span>}
      </td>

      <td className="atable__num">
        {(() => {
          const tone = reviewTone(row.review_date)
          const label = tone === 'overdue' ? 'was due' : tone === 'today' ? 'due today' : null
          return (
            <span
              className={`wl__review wl__review--${tone}`}
              title={row.engine?.next_review_text ?? (row.review_date ? `You said you would look again on ${row.review_date}` : undefined)}
            >
              {row.review_date ? shortDay(row.review_date) : '—'}
              {label && <span className="wl__reviewnote">{label}</span>}
            </span>
          )
        })()}
      </td>

      <td className="atable__num">
        <div className="wl__act" ref={wrap}>
          {isArchived ? (
            <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>{pending ? '…' : 'Restore'}</button>
          ) : (
            <>
              {/* Reading the case comes before changing it — Thesis first, then Edit. */}
              {thesisHref ? (
                <a className="btn btn--mini" href={thesisHref} target="_blank" rel="noreferrer" title="Your write-up">Thesis</a>
              ) : row.final_thesis_path ? (
                // Opened by the ROW's own path, never the shared openThesis() action — that action reads
                // the globally-selected company/run, which is normally a DIFFERENT company than the row
                // being clicked in this cross-company list, and would open the wrong thesis (or nothing).
                <button className="btn btn--mini" onClick={() => openCallFile(row.final_thesis_path!, `Investment Thesis — ${row.ticker}`)} title="The engine's own thesis for this run">Thesis</button>
              ) : null}
              <button className="btn btn--mini" onClick={edit} title="Change the reason, the triggers or the review date">Edit</button>
              <button className="btn btn--mini wl__more" aria-label={`More actions for ${row.ticker}`} aria-expanded={menu} onClick={() => setMenu(!menu)}>⋯</button>
              {menu && (
                <div className="wl__menu" role="menu">
                  {inPool ? (
                    <button className="wl__opt" role="menuitem" disabled={running} onClick={() => { setMenu(false); void requestFullForSubject(row.ticker) }}>
                      {running ? 'Run in flight…' : `Run the full pipeline on ${row.ticker}`}
                    </button>
                  ) : (
                    <button className="wl__opt" role="menuitem" disabled title={`${row.ticker} has no documents yet — add some before a run can be launched`}>
                      No documents for {row.ticker} yet
                    </button>
                  )}
                  {/* Armed confirm, worded like the rest of the app: the second click restates the act. */}
                  <button
                    className={`wl__opt wl__opt--danger${armed ? ' wl__opt--armed' : ''}`}
                    role="menuitem"
                    disabled={pending}
                    onClick={() => {
                      if (!armed) { setArmed(true); return }
                      setArmed(false); setMenu(false)
                      void archiveWatch(row.ticker, row.currency, '')
                    }}
                  >
                    {armed ? `yes — archive ${row.ticker} ▸` : 'Archive this name'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
