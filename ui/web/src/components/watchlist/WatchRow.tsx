import { useState } from 'react'
import { useStore } from '../../lib/store'
import { ABSENT_PRICE_COPY, livePriceLabel, money, priceQualifier } from '../../lib/format'
import type { WatchRow as Row, WatchTriggerEval } from '../../lib/types'

const ORIGIN_LABEL: Record<Row['origin'], string> = { engine: 'engine', manual: 'you', both: 'engine + you' }

const CHIP_STATE: Record<string, string> = {
  condition_met: 'wl__trg--met',
  due: 'wl__trg--due',
  not_met: 'wl__trg--armed',
  not_evaluable: 'wl__trg--unevaluable',
}

/** One trigger, with the arithmetic it just did in the hover text — so "not met" is checkable. */
function TriggerChip({ e }: { e: WatchTriggerEval }) {
  const cls = e.due ? CHIP_STATE.due : CHIP_STATE[e.state]
  const label =
    e.state === 'condition_met' ? 'condition met'
    : e.due ? 'due'
    : e.state === 'not_evaluable' ? 'not evaluable'
    : e.mode === 'reminder' ? 'reminder'
    : 'armed'
  return <span className={`wl__trg ${cls}`} title={e.detail}>{label} · {e.detail}</span>
}

/**
 * The live price, or an honest absence. Never a number the feed did not stand behind: an unmatched
 * listing shows a dash and the reason, because a price from a same-named security elsewhere would be
 * showing the wrong company.
 */
function PriceCell({ row }: { row: Row }) {
  if (!row.quote) {
    const why = row.quote_reason ? ABSENT_PRICE_COPY[row.quote_reason] : 'No live price for this listing.'
    return (
      <>
        <div className="wl__price wl__price--absent" title={why}>—</div>
        <div className="wl__meta">{row.quote_reason ? row.quote_reason.replace(/_/g, ' ') : 'no price'}</div>
      </>
    )
  }
  const q = row.quote
  return (
    <>
      <div className="wl__price">{money(q.currency, q.price)}</div>
      <div className="wl__meta" title={`${q.name || q.ticker}${q.exchange ? ` · ${q.exchange}` : ''} (${q.symbol})`}>
        {livePriceLabel(q).toLowerCase()}{priceQualifier(q, null) ?? ''}{q.delayed ? ' · delayed' : ''}
      </div>
    </>
  )
}

export function WatchRowCard({ row }: { row: Row }) {
  const [armed, setArmed] = useState(false)
  const archiveWatch = useStore((s) => s.archiveWatch)
  const restoreWatch = useStore((s) => s.restoreWatch)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  const anyRunForTicker = useStore((s) => s.anyRunForTicker)
  const openCalls = useStore((s) => s.openCalls)
  const pending = useStore((s) => s.watchlistPending) === row.ticker
  const running = anyRunForTicker(row.ticker)
  const isArchived = !!row.archive

  const stateClass =
    row.state === 'condition_met' ? ' wl__row--met' : row.state === 'due' ? ' wl__row--due' : ''

  return (
    <div className={`wl__row${stateClass}${isArchived ? ' wl__row--archived' : ''}`}>
      <div className="wl__sym">
        <div className="sym">{row.ticker}</div>
        <span className={`wl__origin wl__origin--${row.origin}`}>{ORIGIN_LABEL[row.origin]}</span>
      </div>

      <div className="wl__mid">
        {row.why
          ? <div className="wl__why">{row.why}</div>
          : row.engine?.size_in_trigger
            // The engine's own words, verbatim. Never parsed into a condition — see watchlist.ts.
            ? <div className="wl__why wl__why--engine" title="The engine's own wording. Add a trigger to have it checked against the price.">“{row.engine.size_in_trigger}”</div>
            : <div className="wl__why wl__why--engine">No reason recorded yet.</div>}

        <div className="wl__triggers">
          {row.evals.map((e) => <TriggerChip key={e.trigger_id} e={e} />)}
          {!row.evals.length && !isArchived && (
            <span className="wl__trg wl__trg--unevaluable">reminder only — no trigger yet</span>
          )}
          {row.resurfaced && (
            <span className="wl__trg wl__trg--resurfaced" title={`You archived this on ${row.archive?.at.slice(0, 10)}. The engine has since changed what it says about it.`}>
              the engine changed its view
            </span>
          )}
          {row.review_date && <span className="wl__trg">review {row.review_date}</span>}
          {row.attachments.map((a) => <span key={a.attachment_id} className="wl__trg">{a.filename}</span>)}
          {row.tags.map((t) => <span key={t} className="wl__trg">{t}</span>)}
        </div>
      </div>

      <div className="wl__end">
        <PriceCell row={row} />
        <div className="wl__rowbtns">
          {isArchived ? (
            <button className="btn btn--mini" disabled={pending} onClick={() => void restoreWatch(row.ticker, row.currency)}>
              {pending ? '…' : 'Restore'}
            </button>
          ) : (
            <>
              <button
                className="btn btn--mini"
                disabled={running}
                title={running ? 'A run is already in flight for this company' : `Run the full pipeline on ${row.ticker}`}
                onClick={() => void requestFullForSubject(row.ticker)}
              >
                {running ? 'running…' : 'Run full ▸'}
              </button>
              {row.run_root && (
                <button className="btn btn--mini" title="The engine's own call and what has happened since" onClick={openCalls}>Calls</button>
              )}
              {/* Two clicks: the first arms, the second archives — the same confirm the stop-everything
                  control uses, because this hides a row and should not happen on a stray click. */}
              <button
                className={`btn btn--mini${armed ? ' btn--armed' : ' btn--danger'}`}
                disabled={pending}
                title={armed ? 'Click again to archive' : 'Hide this from the list — it stays in the archive and can be restored'}
                onClick={() => {
                  if (!armed) { setArmed(true); return }
                  setArmed(false)
                  void archiveWatch(row.ticker, row.currency, '')
                }}
                onBlur={() => setArmed(false)}
              >
                {armed ? 'yes — archive ▸' : 'Archive'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
