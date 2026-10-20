import { useEffect, useState } from 'react'
import { FINVIZ_VIEWS, FINVIZ_DATA_REFRESH_MS, finvizField, type FinvizDataRead, type FinvizViewId } from '../../../../shared/finviz-data'
import { api } from '../../lib/api'

const number = (value: number | null) => value === null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 4 })

export function FinvizCompanyData({ ticker, company }: { ticker: string; company: string }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<FinvizViewId>('overview')
  const [read, setRead] = useState<FinvizDataRead | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    let alive = true
    let pending = false
    const refresh = async () => {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try { const result = await api.universeModelData(ticker, company); if (alive) { setRead(result); setError(null) } }
      catch (e) { if (alive) setError(e instanceof Error ? e.message : 'Finviz data unavailable.') }
      finally { pending = false }
    }
    void refresh()
    const timer = setInterval(() => void refresh(), 15_000)
    return () => { alive = false; clearInterval(timer) }
  }, [open, ticker, company])
  const snapshot = read?.rows[0]?.views[view]
  const fields = snapshot ? [...Object.entries(snapshot.text), ...Object.entries(snapshot.numbers)]
    .filter(([key]) => !['ticker', 'company'].includes(key)) : []
  return <details className="model-dialog__data" onToggle={(e) => setOpen(e.currentTarget.open)}>
    <summary>Finviz data</summary>
    {open && <>
      <label>View <select aria-label="Finviz data view" value={view} onChange={(e) => setView(e.target.value as FinvizViewId)}>
        {FINVIZ_VIEWS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select></label>
      {(error || read?.error) && <p role="alert">{error || read?.error}</p>}
      {!snapshot ? <p role="status">{error || read?.error ? 'Saved data unavailable.' : !read ? 'Loading saved data…'
        : !read.rows.length ? 'Company absent from the current universe.'
          : read.refreshing ? 'Collection in progress…' : 'This view has not been collected yet.'}</p> : <>
        <p className="model-dialog__meta">Retrieved {new Date(snapshot.retrieved_at).toLocaleString()}{Date.now() - Date.parse(snapshot.retrieved_at) >= FINVIZ_DATA_REFRESH_MS ? ' · refresh due' : ''}<br />Third-party data · unverified · quotes delayed</p>
        <dl className="model-dialog__fields">{fields.map(([key, value]) => {
          const field = finvizField(key)
          return <div key={key}><dt>{field.label}</dt><dd>{typeof value === 'number' || value === null ? number(value) : value}{value !== null && field.unit && <small>{field.unit}</small>}</dd></div>
        })}
          {snapshot.range52w && <div><dt>52-week range</dt><dd>{number(snapshot.range52w.low)} – {number(snapshot.range52w.high)}<small>USD</small></dd></div>}
        </dl>
        {!!snapshot.news?.length && <div className="model-dialog__section"><h3>Headlines · unverified</h3>{snapshot.news.map((news, i) => <p key={i}><a href={news.url} target="_blank" rel="noreferrer">{news.title} ↗</a><small>{news.channel} · {news.date.replace('T', ' ')} · Finviz local time; timezone unspecified</small></p>)}</div>}
        <a href={snapshot.source_url} target="_blank" rel="noreferrer">View on Finviz ↗</a>
      </>}
    </>}
  </details>
}
