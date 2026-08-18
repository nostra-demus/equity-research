import { useState } from 'react'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { ABSENT_PRICE_COPY, livePriceLabel, money, shortDay } from '../../lib/format'
import type { WatchRow as Row, WatchTriggerEval } from '../../lib/types'

const ORIGIN_LABEL: Record<Row['origin'], string> = { engine: 'engine', manual: 'you', both: 'engine + you' }

const STATE_LABEL: Record<Row['state'], string> = {
  condition_met: 'condition met',
  due: 'due',
  armed: 'armed',
  not_evaluable: 'not evaluable',
  watching: 'watching',
}

/** The shortest true thing about a trigger. The full arithmetic rides in the hover. */
function chipText(e: WatchTriggerEval): string {
  if (e.state === 'condition_met') return 'met'
  if (e.due) return 'due'
  if (e.state === 'not_evaluable') return e.reason ? String(e.reason).replace(/_/g, ' ') : 'not evaluable'
  return e.kind === 'price_level' ? 'level' : e.kind === 'pct_drop' ? 'drop' : e.kind === 'valuation_mos' ? 'value' : 'date'
}

/**
 * One row of the watchlist, as a GRID row rather than a card.
 *
 * A card per name reads fine at three names and badly at thirty: the eye cannot compare a price in one
 * card against a price in the next when they sit at different heights. Fixed columns with tabular
 * numerals make the list scannable, which is what a list you check every morning has to be.
 */
export function WatchRowCard({ row }: { row: Row }) {
  const [armed, setArmed] = useState(false)
  const archiveWatch = useStore((s) => s.archiveWatch)
  const restoreWatch = useStore((s) => s.restoreWatch)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const anyRunForTicker = useStore((s) => s.anyRunForTicker)
  const openThesis = useStore((s) => s.openThesis)
  const openComposer = useStore((s) => s.openWatchComposer)
  const pending = useStore((s) => s.watchlistPending) === row.ticker
  const running = anyRunForTicker(row.ticker)
  const isArchived = !!row.archive

  const stateClass = row.state === 'condition_met' ? ' wl__row--met' : row.state === 'due' ? ' wl__row--due' : ''
  const reason = row.why || (row.engine?.size_in_trigger ? `“${row.engine.size_in_trigger}”` : 'No reason recorded yet.')

  // Editing needs an entry file. A pure engine row has none until you touch it — so "Edit" on one opens
  // the composer prefilled from what the engine knows, and saving creates the file.
  const edit = () =>
    openComposer(
      {
        ticker: row.ticker,
        company_name: row.company_name,
        currency: row.currency,
        exchange: row.exchange,
        why: row.why,
        conviction: row.conviction,
        review_date: row.review_date,
        tags: row.tags,
        triggers: row.triggers,
      },
      row.entry_id,
    )

  return (
    <div className={`wl__grid wl__row${stateClass}${isArchived ? ' wl__row--archived' : ''}`}>
      <div className="wl__c wl__c--name">
        <div className="sym">{row.ticker}</div>
        <div className="wl__sub2">{row.company_name || '—'}</div>
        <span className={`wl__origin wl__origin--${row.origin}`}>{ORIGIN_LABEL[row.origin]}</span>
      </div>

      <div className="wl__c wl__c--why">
        <div className={`wl__why${row.why ? '' : ' wl__why--engine'}`} title={reason}>{reason}</div>
        <div className="wl__chips">
          {row.evals.map((e) => (
            <span
              key={e.trigger_id}
              className={`wl__trg ${e.state === 'condition_met' ? 'wl__trg--met' : e.due ? 'wl__trg--due' : e.state === 'not_evaluable' ? 'wl__trg--unevaluable' : 'wl__trg--armed'}`}
              title={e.detail}
            >
              {chipText(e)}
            </span>
          ))}
          {!row.evals.length && !isArchived && <span className="wl__trg wl__trg--unevaluable" title="Nothing is being checked against the price yet. Edit the row to add a trigger.">no trigger</span>}
          {row.resurfaced && <span className="wl__trg wl__trg--resurfaced" title={`Archived ${row.archive?.at.slice(0, 10)}. The engine has since changed what it says.`}>engine changed</span>}
          {row.tags.map((t) => <span key={t} className="wl__trg">{t}</span>)}
        </div>
      </div>

      <div className="wl__c wl__c--price">
        {row.quote ? (
          <>
            <div className="wl__price">{money(row.quote.currency, row.quote.price)}</div>
            <div className="wl__meta" title={`${row.quote.name || row.quote.ticker}${row.quote.exchange ? ` · ${row.quote.exchange}` : ''} (${row.quote.symbol})`}>
              {livePriceLabel(row.quote).toLowerCase()}{row.quote.delayed ? ' · delayed' : ''}{row.quote.stale ? ' · not current' : ''}
            </div>
          </>
        ) : (
          <>
            <div className="wl__price wl__price--absent" title={row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : 'No live price for this listing.'}>—</div>
            <div className="wl__meta">{row.quote_reason ? String(row.quote_reason).replace(/_/g, ' ') : 'no price'}</div>
          </>
        )}
      </div>

      <div className="wl__c wl__c--state">
        <span className={`wl__state wl__state--${row.state}`}>{STATE_LABEL[row.state]}</span>
      </div>

      {/* How old this is, and when you said you would look again — both matter when the list is read
          months after it was written. */}
      <div className="wl__c wl__c--dates">
        <div className="wl__meta">{row.added_at ? `added ${shortDay(row.added_at.slice(0, 10))}` : row.engine_since ? `engine ${shortDay(row.engine_since)}` : '—'}</div>
        <div className="wl__meta" title={row.engine?.next_review_text ?? undefined}>{row.review_date ? `review ${shortDay(row.review_date)}` : 'no review set'}</div>
      </div>

      <div className="wl__c wl__c--act">
        {isArchived ? (
          <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>
            {pending ? '…' : 'Restore'}
          </button>
        ) : (
          <>
            <button className="btn btn--mini" onClick={edit} title="Change the reason, the triggers, the review date">Edit</button>
            <button
              className="btn btn--mini"
              disabled={running}
              title={running ? 'A run is already in flight for this company' : `Run the full pipeline on ${row.ticker}`}
              onClick={() => void requestFullForSubject(row.ticker)}
            >
              {running ? 'running…' : 'Run ▸'}
            </button>
            {(row.final_thesis_path || row.attachments.length > 0) && (
              row.attachments.length && row.entry_id ? (
                <a className="btn btn--mini" href={api.watchAttachmentUrl(row.entry_id, row.attachments[0].attachment_id)} target="_blank" rel="noreferrer" title="Your write-up">Thesis</a>
              ) : (
                <button className="btn btn--mini" onClick={openThesis} title="The engine's own thesis for this run">Thesis</button>
              )
            )}
            <button
              className={`btn btn--mini${armed ? ' btn--armed' : ''}`}
              disabled={pending}
              title={armed ? 'Click again to archive' : 'Hide from the list — kept in the archive, restorable'}
              onClick={() => { if (!armed) { setArmed(true); return } setArmed(false); void archiveWatch(row.ticker, row.currency, '') }}
              onBlur={() => setArmed(false)}
            >
              {armed ? 'sure?' : 'Archive'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
