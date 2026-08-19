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
import { absenceReason, distanceLabel } from '../../lib/watchlistView'

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
  const pending = useStore((s) => s.watchlistPending) === row?.ticker

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
  const thesisHref = !staticMode && row.entry_id && row.attachments.length
    ? api.watchAttachmentUrl(row.entry_id, row.attachments[0].attachment_id)
    : null
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
        {row.company_name || '—'}
        {row.exchange ? ` · ${row.exchange}` : ''}{row.currency ? ` · ${row.currency}` : ''}
      </div>

      <div className="wdet__pricerow">
        {row.quote ? (
          <>
            <span className="wl__price">{money(row.quote.currency, row.quote.price)}</span>
            <span className="wdet__meta">{livePriceLabel(row.quote)}</span>
          </>
        ) : (
          <span className="wl__price wl__price--absent" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : undefined}>
            — {row.quote_reason ? String(row.quote_reason).replace(/_/g, ' ') : 'no price'}
          </span>
        )}
        <span className={`wdet__dist${row.state === 'condition_met' ? ' wdet__dist--met' : ''}`}>{distanceLabel(row)}</span>
      </div>

      <div className={`wdet__why${row.why ? '' : ' wl__why--engine'}`}>{reason || 'No reason recorded yet.'}</div>

      {/* Every trigger, with the arithmetic the server computed — "not met" stays checkable rather than
          trusted (§15). The tile showed only the nearest one; this is the full set. */}
      <div className="wdet__trigs">
        {row.evals.length ? row.evals.map((e) => (
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

      <div className="wdet__facts">
        <span>Review {row.review_date ? shortDay(row.review_date) : '—'}</span>
        <span>· conviction {row.conviction}</span>
        <span>· {row.origin === 'engine' ? 'engine' : row.origin === 'both' ? 'engine + you' : 'you added this'}</span>
      </div>

      <div className="wdet__actions">
        {isArchived ? (
          <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>
            {pending ? '…' : 'Restore'}
          </button>
        ) : (
          <>
            {thesisHref
              ? <a className="btn btn--mini" href={thesisHref} target="_blank" rel="noreferrer" title="Your write-up">Thesis</a>
              : row.final_thesis_path
                ? <button className="btn btn--mini" onClick={() => openCallFile(row.final_thesis_path!, `Investment Thesis — ${row.ticker}`)}>Thesis</button>
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
