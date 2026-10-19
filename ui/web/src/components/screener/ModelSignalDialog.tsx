import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MODEL_SIGNALS, modelScore, signalResult, type ModelEvent, type ModelEventRead, type ModelRow, type ModelSignal, type ModelWeights } from '../../../../shared/universe-model'
import { api } from '../../lib/api'
import { roleLabel } from '../../lib/scope'

const date = (value: string) => new Date(value).toLocaleString()
const status = (result: boolean | null) => result === null ? 'Coverage unavailable' : result ? 'Material event found' : 'No matching archived report'
const mark = (result: boolean | null) => result === null ? '—' : result ? '✓' : '✕'
export type ModelSelection = { row: ModelRow; signal: ModelSignal | null }

function EventEvidence({ event, row }: { event: ModelEvent; row: ModelRow }) {
  const [read, setRead] = useState<ModelEventRead | null>(null)
  const [loading, setLoading] = useState(!!event.source_event_id)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    if (!event.source_event_id) return
    setLoading(true); setError(false)
    void api.universeModelEvidence(event.source_event_id, row.ticker, row.company)
      .then((result) => { if (alive) setRead(result) })
      .catch(() => { if (alive) setError(true) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [event.source_event_id, row.ticker, row.company, attempt])
  const analysis = read?.analysis
  const provenance = analysis?.provenance
  return <article className="model-dialog__event">
    <h3>What happened</h3>
    <p className="model-dialog__headline">{event.headline}</p>
    <p className="model-dialog__meta">{event.source} · Reported {date(event.reported_at)} · {event.source_tier.replace(/_/g, ' ')}</p>
    {event.excerpt && <p>{event.excerpt}<small>Source excerpt</small></p>}
    <a href={event.url} target="_blank" rel="noreferrer">Open original source ↗</a>
    {event.classification_reason && <div className="model-dialog__section"><h3>Why this signal matched</h3><p>{event.classification_reason}</p><small>Saved scanner assessment · inferred from the report</small></div>}
    <div className="model-dialog__section">
      <h3>Impact on {row.company}</h3>
      {loading && !analysis ? <div className="model-dialog__loading" role="status"><span /><span /><small>Looking for saved article analysis…</small></div>
        : analysis?.effects.length ? <>
          {analysis.company_role && <p>Company role: {roleLabel(analysis.company_role)}</p>}
          {analysis.effects.map((effect, i) => <div key={i} className="model-dialog__effect"><strong>{effect.side === 'beneficiary' ? 'Potential benefit' : 'Potential risk'} · saved inference</strong>
            <p>{effect.mechanism}</p>{(effect.magnitude || effect.horizon) && <small>{[effect.magnitude, effect.horizon].filter(Boolean).join(' · ')}</small>}</div>)}
        </> : <p>Company-specific financial impact is not proven from the saved analysis. The tick records an event report, not a verified benefit or a price forecast.</p>}
      {!loading && <small>Event classification: {event.direction} · inferred at event level; it may differ for an acquirer, target or other party.</small>}
      {error && <div role="alert"><p>The saved analysis could not be loaded. The source report remains available.</p><button type="button" onClick={() => setAttempt((n) => n + 1)}>Retry saved analysis</button></div>}
    </div>
    {analysis && <>
      <p className="model-dialog__meta">Saved article read · {date(analysis.read_at)} · analysis may be outdated</p>
      {provenance && provenance.kind !== 'original' && <p className="model-dialog__provenance">
        {provenance.kind === 'alternate' ? 'Read from another outlet' : provenance.kind === 'filing_doc' ? 'Read from the filing document' : 'Pieced together from other outlets'}
        {provenance.label && ` · ${provenance.label}`}{provenance.url && <> · <a href={provenance.url} target="_blank" rel="noreferrer">Source actually read ↗</a></>}
      </p>}
      {!!analysis.story.length && <div className="model-dialog__section"><h3>Saved article summary</h3><ul>{analysis.story.map((point, i) => <li key={i}>{point}</li>)}</ul></div>}
      {analysis.event_assessment && <div className="model-dialog__section"><h3>Event-level assessment · saved inference</h3><p>{analysis.event_assessment}</p><small>This describes the event overall; it is not necessarily the effect on {row.company}.</small></div>}
      {analysis.watch_item && <div className="model-dialog__section"><h3>What to watch</h3><p>{analysis.watch_item}</p><small>Saved at the article-read date; current completion and catalyst timing need verification.</small></div>}
    </>}
  </article>
}

function SignalEvidence({ row, signal, weight }: { row: ModelRow; signal: ModelSignal; weight: number }) {
  const [reportIndex, setReportIndex] = useState(0)
  const reports = row.signals?.[signal.id] || []
  const result = signalResult(row, signal)
  const report = reports[reportIndex] || reports[0]
  return <>
    <p className="model-dialog__rule">{signal.rule}</p>
    <p className="model-dialog__status"><strong>{mark(result)} {status(result)}</strong><span>{result === null ? 'Unscored' : `${result ? weight : 0} points in total`}</span></p>
    {report ? <>
      {reports.length > 1 && <label className="model-dialog__reports">Recent report <select value={reportIndex} onChange={(e) => setReportIndex(Number(e.target.value))} aria-label="Recent signal report">
        {reports.map((r, i) => <option value={i} key={r.id}>{i + 1}. {r.headline}</option>)}
      </select></label>}
      <EventEvidence key={report.source_event_id || report.id} event={report} row={row} />
    </> : <p>{result === null
      ? 'Coverage is unavailable or the issuer match is uncertain. No conclusion about this signal can be drawn.'
      : 'No qualifying high or critical materiality report matched this company and signal in the saved 90-day archive. This does not prove that no event occurred.'}</p>}
  </>
}

export function ModelSignalDialog({ selection, weights, onSelect, onClose }: {
  selection: ModelSelection; weights: ModelWeights; onSelect: (signal: ModelSignal | null) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const { row, signal } = selection
  const previousSignal = useRef(signal?.id)
  const close = useCallback(() => ref.current?.close(), [])
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    // The hidden Events reader may also listen for Escape. Close only this top-level dialog.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); dialog.close(); return }
      if (e.key !== 'Tab') return
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]')]
        .filter((el) => el.getClientRects().length > 0)
      const first = controls[0]; const last = controls[controls.length - 1]
      const active = document.activeElement
      const target = e.shiftKey && (active === first || active === heading.current) ? last : !e.shiftKey && active === last ? first : null
      if (target) { e.preventDefault(); e.stopImmediatePropagation(); target.focus() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => { window.removeEventListener('keydown', onKey, true); if (dialog.open) dialog.close() }
  }, [])
  useEffect(() => {
    if (previousSignal.current !== signal?.id) { heading.current?.focus(); previousSignal.current = signal?.id }
  }, [signal?.id])
  return createPortal(<dialog ref={ref} className="model-dialog" aria-labelledby={titleId} onClose={() => { if (ref.current && !ref.current.open) onClose() }} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
    <div className="model-dialog__panel">
      <header className="model-dialog__head"><div><small>{row.company} · {row.ticker}</small><h2 ref={heading} tabIndex={-1} id={titleId}>{signal?.label || 'Company signals'}</h2></div>
        <button type="button" aria-label="Close signal details" onClick={close}>✕</button></header>
      <div className="model-dialog__body">
        {signal ? <><button type="button" className="model-dialog__back" onClick={() => onSelect(null)}>← All company signals</button>
          <SignalEvidence key={signal.id} row={row} signal={signal} weight={weights[signal.id]} /></>
          : <><p>{row.signals === null ? 'Event coverage unavailable' : `Total event activity: ${modelScore(row, weights)} points`}. Select a signal to see the company’s event and supporting reports.</p>
            <div className="model-dialog__signals">{MODEL_SIGNALS.map((s) => { const result = signalResult(row, s); return <button type="button" key={s.id} onClick={() => onSelect(s)}>
              <span>{mark(result)} {s.label}</span><small>{status(result)} · {result === null ? 'unscored' : `${result ? weights[s.id] : 0} pts`}</small>
            </button> })}</div></>}
      </div>
      <footer className="model-dialog__foot"><small>Saved reports and analysis · no new paid calls on open</small><a href={`https://finviz.com/quote.ashx?t=${encodeURIComponent(row.ticker)}`} target="_blank" rel="noreferrer">Company on Finviz ↗</a></footer>
    </div>
  </dialog>, document.querySelector('.app') || document.body)
}
