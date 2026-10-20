import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MODEL_SIGNALS, modelTotal, signalResult, type ModelEvent, type ModelEventRead, type ModelRow, type ModelSignal } from '../../../../shared/universe-model'
import { api } from '../../lib/api'
import { roleLabel } from '../../lib/scope'
import { FinvizCompanyData } from './FinvizCompanyData'

const date = (value: string) => new Date(value).toLocaleString()
const status = (result: boolean | null) => result === null ? 'Impact unassessed' : result ? 'Favorable impact · inferred' : 'No favorable signal'
const mark = (result: boolean | null) => result === null ? '—' : result ? '✓' : '✕'
export type ModelSelection = { row: ModelRow; signal: ModelSignal | null }

function EventEvidence({ event, row, signal }: { event: ModelEvent; row: ModelRow; signal: ModelSignal }) {
  const hasAssessment = event.assessment !== undefined
  const [read, setRead] = useState<ModelEventRead | null>(null)
  const [loading, setLoading] = useState(!hasAssessment && !!event.source_event_id)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    if (hasAssessment || !event.source_event_id) return
    setLoading(true); setError(false)
    void api.universeModelEvidence(event.source_event_id, row.ticker, row.company)
      .then((result) => { if (alive) setRead(result) })
      .catch(() => { if (alive) setError(true) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [hasAssessment, event.source_event_id, row.ticker, row.company, attempt])
  const analysis = hasAssessment ? event.assessment : read?.analysis
  const provenance = analysis?.provenance
  return <article className="model-dialog__event">
    <p className="model-dialog__headline">{event.headline}</p>
    <p className="model-dialog__meta">{event.source} · {date(event.reported_at)} · {event.source_tier.replace(/_/g, ' ')}</p>
    <a href={event.url} target="_blank" rel="noreferrer">Open original source ↗</a>
    <div className="model-dialog__section">
      <h3>Company impact</h3>
      {loading && !analysis ? <div className="model-dialog__loading" role="status"><span /><span /><small>Loading saved analysis…</small></div>
        : analysis?.effects.length ? <>
          {analysis.company_role && <p>Company role: {roleLabel(analysis.company_role)}</p>}
          {analysis.effects.map((effect, i) => <div key={i} className="model-dialog__effect"><strong>{effect.side === 'beneficiary' ? 'Potential benefit' : 'Potential risk'} · inferred</strong>
            <p>{effect.mechanism}</p>{(effect.magnitude || effect.horizon) && <small>{[effect.magnitude, effect.horizon].filter(Boolean).join(' · ')}</small>}</div>)}
        </> : <p>Company impact not proven from saved analysis.</p>}
      {analysis && <small>Saved {date(analysis.read_at)} · may be outdated</small>}
      {provenance && provenance.kind !== 'original' && <p className="model-dialog__meta">
        {provenance.kind === 'alternate' ? 'Alternate source' : provenance.kind === 'filing_doc' ? 'Filing source' : 'Secondary synthesis'}
        {provenance.label && ` · ${provenance.label}`}{provenance.url && <> · <a href={provenance.url} target="_blank" rel="noreferrer">Source actually read ↗</a></>}
      </p>}
      {error && <div role="alert"><p>Saved analysis unavailable.</p><button type="button" onClick={() => setAttempt((n) => n + 1)}>Retry saved analysis</button></div>}
    </div>
    {analysis?.watch_item && <div className="model-dialog__section"><h3>What to watch</h3><p>{analysis.watch_item}</p><small>As of {date(analysis.read_at)} · timing unverified</small></div>}
    <details className="model-dialog__section"><summary>Evidence & context</summary>
      <p className="model-dialog__rule">{signal.rule}</p>
      {event.excerpt && <><h3>Source excerpt</h3><p>{event.excerpt}</p></>}
      {event.classification_reason && <><h3>Signal match · inferred</h3><p>{event.classification_reason}</p></>}
      <small>Event direction: {event.direction} · inferred, not company-specific</small>
      {!!analysis?.story.length && <div className="model-dialog__section"><h3>Article summary</h3><ul>{analysis.story.map((point, i) => <li key={i}>{point}</li>)}</ul></div>}
      {analysis?.event_assessment && <div className="model-dialog__section"><h3>Event context · inferred, not company-specific</h3><p>{analysis.event_assessment}</p></div>}
    </details>
  </article>
}

function SignalEvidence({ row, signal }: { row: ModelRow; signal: ModelSignal }) {
  const [reportIndex, setReportIndex] = useState(0)
  const reports = row.signals?.[signal.id] || []
  const result = signalResult(row, signal)
  const report = reports[reportIndex] || reports[0]
  return <>
    <p className="model-dialog__status"><strong>{mark(result)} {status(result)}</strong></p>
    {report ? <>
      {reports.length > 1 && <label className="model-dialog__reports">Recent report <select value={reportIndex} onChange={(e) => setReportIndex(Number(e.target.value))} aria-label="Recent signal report">
        {reports.map((r, i) => <option value={i} key={r.id}>{i + 1}. {r.headline}</option>)}
      </select></label>}
      <EventEvidence key={report.source_event_id || report.id} event={report} row={row} signal={signal} />
    </> : <p>{result === null
      ? 'Company impact or coverage unavailable. Unscored.'
      : 'No favorable signal in the retained 90-day reports. An event may still have occurred.'}</p>}
  </>
}

export function ModelSignalDialog({ selection, onSelect, onClose }: {
  selection: ModelSelection; onSelect: (signal: ModelSignal | null) => void; onClose: () => void
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
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], select:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]')]
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
          <SignalEvidence key={signal.id} row={row} signal={signal} /></>
          : <><FinvizCompanyData ticker={row.ticker} company={row.company} /><p>{row.signals === null ? 'Coverage unavailable' : `Total: ${modelTotal(row)} green ticks`}</p>
            <div className="model-dialog__signals">{MODEL_SIGNALS.map((s) => { const result = signalResult(row, s); return <button type="button" key={s.id} onClick={() => onSelect(s)}>
              <span>{mark(result)} {s.label}</span><small>{status(result)}</small>
            </button> })}</div></>}
      </div>
      <footer className="model-dialog__foot"><a href={`https://finviz.com/quote.ashx?t=${encodeURIComponent(row.ticker)}`} target="_blank" rel="noreferrer">Company on Finviz ↗</a></footer>
    </div>
  </dialog>, document.querySelector('.app') || document.body)
}
