// The tile grid's detail panel: everything one tile deliberately left out.
//
// The grid trades completeness for glanceability, and this panel is the other half of that trade — the
// why, every trigger with its arithmetic, the price and its provenance, and the actions. It shows ONE
// name, which is the honest shape: a grid that tried to show fifty whys is the row list again.
import { useState } from 'react'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { ABSENT_PRICE_COPY, decisionColor, livePriceLabel, money, shortDay } from '../../lib/format'
import type { WatchRow, WatchTriggerEval } from '../../lib/types'
import { absenceReason, distanceLabel, nearestTarget } from '../../lib/watchlistView'

/** A trigger's chip state — the same three-valued vocabulary the table uses, so the two views agree. */
function chipClass(e: WatchTriggerEval): string {
  if (e.state === 'condition_met') return 'wl__trg wl__trg--met'
  if (e.due) return 'wl__trg wl__trg--due'
  if (e.state === 'not_evaluable') return 'wl__trg wl__trg--unevaluable'
  return 'wl__trg wl__trg--armed'
}

export function WatchDetail({ row }: { row: WatchRow | null }) {
  const [armed, setArmed] = useState(false)
  const openComposer = useStore((s) => s.openWatchComposer)
  const openCallFile = useStore((s) => s.openCallFile)
  const archiveWatch = useStore((s) => s.archiveWatch)
  const restoreWatch = useStore((s) => s.restoreWatch)
  const staticMode = useStore((s) => s.staticMode)
  const tickers = useStore((s) => s.tickers)
  const selectTicker = useStore((s) => s.selectTicker)
  const setResearchView = useStore((s) => s.setResearchView)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const pending = useStore((s) => s.watchlistPending) === row?.ticker

  const target = row ? nearestTarget(row) : null
  const pool = row ? tickers.find((t) => t.ticker === row.ticker) : undefined
  const lastRunAt = pool?.latestRun?.decisionDate ?? row?.engine?.decision_date ?? null
  if (!row) {
    return (
      <aside className="wdet wdet--empty">
        <div className="wdet__hint">Pick a name to see why it is on the list, what is being checked, and what to do about it.</div>
      </aside>
    )
  }

  const verdict = row.engine?.decision ?? null
  const reason = row.why || (row.engine?.size_in_trigger ? `“${row.engine.size_in_trigger}”` : '')
  const isArchived = !!row.archive && !row.resurfaced
  const absent = absenceReason(row)
  // `attachments` and `evals` are declared non-optional but arrive over the wire — and in static mode from
  // the snapshot builder, a separate program. A missing array would take the whole panel down rather than
  // degrade, so read them defensively here even though the type says they are always present.
  const firstAttachment = row.attachments?.[0]
  const thesisHref = !staticMode && row.entry_id && firstAttachment
    ? api.watchAttachmentUrl(row.entry_id, firstAttachment.attachment_id)
    : null
  // Hoisted so TypeScript narrows it for the callback below — a closure cannot narrow a property access,
  // which is the only reason the non-null assertion was there.
  const thesisPath = row.final_thesis_path
  const edit = () =>
    openComposer(
      { ticker: row.ticker, company_name: row.company_name, currency: row.currency, exchange: row.exchange,
        why: row.why, conviction: row.conviction, review_date: row.review_date, triggers: row.triggers },
      row.entry_id,
    )

  return (
    <aside className="wdet" aria-label={`Details for ${row.ticker}`}>
      <div className="wdet__head">
        <span className="wdet__sym">{row.ticker}</span>
        {verdict
          ? <span className="wl__verdict" style={{ color: decisionColor(verdict) }}>{verdict}</span>
          : <span className="wl__verdict wl__verdict--none" title="You added this — the engine has not researched it">yours</span>}
      </div>
      <div className="wdet__co">
        {row.exchange ? `${row.exchange} · ` : ''}{row.currency ?? '—'}
        {` · ${row.origin === 'engine' ? 'engine' : row.origin === 'both' ? 'engine + you' : 'you added this'}`}
        {row.conviction ? ` · conviction ${row.conviction}` : ''}
      </div>

      {/* The three numbers, each LABELLED. They used to share one unlabelled line, so nothing said which
          was the price and which was the distance — and the target appeared only inside a prose sentence.
          Every figure here is read off the structured trigger, so the panel answers "where is it, where do
          I want it, how far is that" without the reader parsing English. */}
      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Where the price stands</h4>
        <div className="wdet__facts">
          <div className="wdet__fact">
            <span className="wdet__factlabel">Price now</span>
            {row.quote ? (
              <>
                <span className="wdet__factval">{money(row.quote.currency, row.quote.price)}</span>
                <span className="wdet__factnote">{livePriceLabel(row.quote)}</span>
              </>
            ) : (
              <>
                <span className="wdet__factval wdet__factval--none">—</span>
                <span className="wdet__factnote" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : undefined}>
                  {row.quote_reason ? String(row.quote_reason).replace(/_/g, ' ') : 'no price'}
                </span>
              </>
            )}
          </div>
          <div className="wdet__fact">
            <span className="wdet__factlabel">Nearest target</span>
            {target ? (
              <>
                <span className="wdet__factval">{money(target.currency, target.value)}</span>
                <span className="wdet__factnote">{target.how}</span>
              </>
            ) : (
              <>
                <span className="wdet__factval wdet__factval--none">—</span>
                <span className="wdet__factnote">{row.evals?.some((e) => e.kind === 'event_date') ? 'a date, not a price' : 'no price target set'}</span>
              </>
            )}
          </div>
          <div className="wdet__fact">
            <span className="wdet__factlabel">Still to move</span>
            <span className={`wdet__factval${row.state === 'condition_met' ? ' wdet__factval--met' : ''}`}>{distanceLabel(row)}</span>
            <span className="wdet__factnote">{target ? 'to that target' : 'nothing measurable'}</span>
          </div>
        </div>
      </section>

      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Why you're watching</h4>
        <div className={`wdet__why${row.why ? '' : ' wl__why--engine'}`}>{reason || 'No reason recorded yet.'}</div>
      </section>

      {/* Every trigger, with the arithmetic the server computed — "not met" stays checkable rather than
          trusted (§15). The tile showed only the nearest one; this is the full set. */}
      <section className="wdet__sec">
      <h4 className="wdet__seclabel">Triggers{row.evals?.length ? ` · ${row.evals.length}` : ''}</h4>
      <div className="wdet__trigs">
        {row.evals?.length ? row.evals.map((e) => (
          <div key={e.trigger_id} className="wdet__trig">
            <span className={chipClass(e)}>
              {e.kind === 'event_date' ? 'date' : e.kind === 'price_level' ? 'level' : e.kind === 'pct_drop' ? 'drop' : 'value'}
            </span>
            <span className="wdet__trigtext">{e.detail}</span>
          </div>
        )) : (
          <button className="wl__trg wl__trg--add" onClick={edit}>+ trigger</button>
        )}
        {absent && <div className="wdet__absent">{absent}</div>}
        {row.resurfaced && (
          <div className="wdet__absent">
            Archived {row.archive?.at.slice(0, 10)} — the engine has since changed what it says, so it is back on the list.
          </div>
        )}
      </div>
      </section>

      <section className="wdet__sec">
        <h4 className="wdet__seclabel">Next look</h4>
        <div className="wdet__next">
          <span className="wdet__nextdate">{row.review_date ? shortDay(row.review_date) : 'no review date set'}</span>
          {row.engine?.next_review_text && <span className="wdet__factnote">{row.engine.next_review_text}</span>}
        </div>
      </section>

      {/* The rerun affordance the grid lost: it lived in the table row's ⋯ menu and was never carried into
          this panel. Restored WITH the staleness facts beside it, because the old button only asked "does
          this ticker have documents" — never whether anything had changed since the last run, so it would
          happily re-read an unchanged pool and reach the same thesis.
          What is NOT claimed here is a freshness verdict. The only per-ticker change stamp the client has
          (`lastChangeAt`) is an in-memory fs-watcher value that is null after any server restart, so
          "nothing new" would be a false negative most of the time. So the panel states the two DURABLE
          facts — when the engine last ran, how many documents are in the pool — and makes the scoped
          new-data analysis the primary action, which is the check that can actually answer it. */}
      {!isArchived && !staticMode && (
        <section className="wdet__sec">
          <h4 className="wdet__seclabel">Engine run</h4>
          {pool ? (
            <>
              <div className="wdet__runfacts">
                <span>{lastRunAt ? `Last run ${shortDay(lastRunAt)}` : 'Never run'}</span>
                <span>· {pool.fileCount} {pool.fileCount === 1 ? 'document' : 'documents'} in the pool</span>
              </div>
              <div className="wdet__runrow">
                <button
                  className="btn btn--mini"
                  title="Open this name in the research view, where the new-data analysis scopes which orbs the fresh evidence actually invalidates"
                  onClick={() => { setResearchView('constellation'); void selectTicker(row.ticker) }}
                >
                  Check for new data
                </button>
                <button className="btn btn--mini" onClick={() => void requestFullForSubject(row.ticker)}>Rerun everything</button>
              </div>
              <p className="wdet__runnote">
                A rerun over unchanged documents reads the same evidence and reaches the same thesis — check first.
              </p>
            </>
          ) : (
            <p className="wdet__runnote">No documents for {row.ticker} yet — a run needs something to read.</p>
          )}
        </section>
      )}

      <div className="wdet__actions">
        {isArchived ? (
          <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>
            {pending ? '…' : 'Restore'}
          </button>
        ) : (
          <>
            {thesisHref
              ? <a className="btn btn--mini" href={thesisHref} target="_blank" rel="noreferrer" title="Your write-up">Thesis</a>
              : thesisPath
                ? <button className="btn btn--mini" onClick={() => openCallFile(thesisPath, `Investment Thesis — ${row.ticker}`)}>Thesis</button>
                : null}
            <button className="btn btn--mini" onClick={edit}>Edit</button>
            {/* Two-click confirm, and the wording restates the act rather than saying "confirm". */}
            <button
              className={`btn btn--mini${armed ? ' btn--armed' : ''}`}
              disabled={pending}
              onClick={() => { if (armed) { void archiveWatch(row.ticker, row.currency, ''); setArmed(false) } else setArmed(true) }}
              onBlur={() => setArmed(false)}
            >
              {pending ? '…' : armed ? `Hide ${row.ticker}` : 'Archive'}
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
