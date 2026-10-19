import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MODEL_SIGNALS, defaultModelWeights, modelScore, modelWeights, rankModel, signalResult, UNIVERSE_URL,
  type ModelRead, type ModelRow, type ModelWeights } from '../../../../shared/universe-model'
import { api } from '../../lib/api'

const WEIGHTS_KEY = 'nsw.universeEventModel.weights.v1'
const PAGE_SIZE = 100
export function readModelWeights(): ModelWeights {
  try { return modelWeights(JSON.parse(localStorage.getItem(WEIGHTS_KEY) || 'null')) } catch { return defaultModelWeights() }
}
const date = (value: string | null) => value ? new Date(value).toLocaleString() : 'Not yet available'
const number = (value: number) => Number(value.toFixed(2)).toLocaleString()

export function ModelGrid({ rows, weights }: { rows: ModelRow[]; weights: ModelWeights }) {
  return <div className="model__scroll" tabIndex={0} aria-label="Company signals; scroll for more columns">
    <table className="model__grid">
      <caption className="sr-only">Finviz universe ranked by total event activity score, highest first. Event presence is not a bullish verdict. A dash means unavailable event coverage.</caption>
      <thead><tr><th scope="col">Company</th><th scope="col">Market price <small>USD · delayed</small></th>
        {MODEL_SIGNALS.map((signal) => <th scope="col" key={signal.id} title={signal.rule}>{signal.label}<small>{number(weights[signal.id])} pt{weights[signal.id] === 1 ? '' : 's'}</small></th>)}
        <th scope="col" aria-sort="descending">Total ↓</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.ticker}>
        <th scope="row"><a href={`https://finviz.com/quote.ashx?t=${encodeURIComponent(row.ticker)}`} target="_blank" rel="noreferrer">{row.company}</a><small>{row.ticker}</small></th>
        <td title={`Retrieved ${date(row.retrieved_at)}. Finviz does not supply an individual quote timestamp here.`}>{row.price === null ? '—' : `$${row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}<small>Retrieved {new Date(row.retrieved_at).toLocaleTimeString()}</small></td>
        {MODEL_SIGNALS.map((signal) => {
          const result = signalResult(row, signal)
          const label = result === null ? 'Unavailable' : result ? 'Present' : 'No matching report'
          const reports = row.signals?.[signal.id] || []
          return <td key={signal.id}>{result ? <details className="model__evidence"><summary className="model__signal model__signal--pass" aria-label={`${signal.label}: ${label}`} title={signal.rule}>✓</summary>
            <div><strong>{signal.label} · recent evidence</strong><small>Headline classification and issuer match are inferred. Presence does not prove a pending catalyst.</small>
              {reports.map((report) => <p key={report.id}><a href={report.url} target="_blank" rel="noreferrer">{report.headline}</a>
                <small>{report.source} · {date(report.reported_at)} · {report.source_tier.replace(/_/g, ' ')} · {report.direction}</small></p>)}</div>
          </details> : <span role="img" className={`model__signal model__signal--${result === null ? 'unknown' : 'fail'}`}
            aria-label={`${signal.label}: ${label}`} title={signal.rule}>{result === null ? '—' : '✕'}</span>}</td>
        })}
        <td className="model__total">{row.signals === null ? '—' : number(modelScore(row, weights))}<small>{row.signals === null ? 'Coverage unavailable' : 'Event activity'}</small></td>
      </tr>)}</tbody>
    </table>
  </div>
}

export function ModelView() {
  const [read, setRead] = useState<ModelRead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pending = useRef(false)
  const mounted = useRef(true)
  const [weights, setWeights] = useState(readModelWeights)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const refresh = useCallback(async () => {
    if (pending.current) return
    pending.current = true; setLoading(true)
    try {
      const result = await api.universeModel()
      if (mounted.current) { setRead(result); setError(null) }
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Could not load the Model.') }
    finally { pending.current = false; if (mounted.current) setLoading(false) }
  }, [])
  useEffect(() => {
    mounted.current = true
    void refresh()
    const visibleRefresh = () => { if (document.visibilityState === 'visible') void refresh() }
    const timer = setInterval(visibleRefresh, 15_000)
    window.addEventListener('focus', visibleRefresh)
    return () => { mounted.current = false; clearInterval(timer); window.removeEventListener('focus', visibleRefresh) }
  }, [refresh])
  const changeWeights = (next: ModelWeights) => {
    setWeights(next); setPage(0)
    try { localStorage.setItem(WEIGHTS_KEY, JSON.stringify(next)) } catch { /* usable in private browsing */ }
  }
  const ranked = useMemo(() => rankModel(read?.rows ?? [], weights).filter((r) => `${r.company} ${r.ticker}`.toLowerCase().includes(query.trim().toLowerCase())), [read?.rows, weights, query])
  const currentPage = Math.min(page, Math.max(0, Math.ceil(ranked.length / PAGE_SIZE) - 1))
  const shown = ranked.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const eventCoverage = read?.events
  return <section className="model" aria-label="Universe Model">
    <div className="model__heading"><div><h2>Model</h2><p>Companies above $2bn market cap · average daily volume above 50,000 shares</p></div>
      <a href={UNIVERSE_URL} target="_blank" rel="noreferrer">Open Finviz universe ↗</a></div>
    <div className="model__status" role="status">
      <strong>{read?.complete ? `${read.rows.length.toLocaleString()} companies` : 'Loading the full universe'}</strong>
      {read?.refreshing && <span>Refreshing · {read.fetched.toLocaleString()}{read.total ? ` / ${read.total.toLocaleString()}` : ''} retrieved</span>}
      {read?.complete && <span>{read.stale ? 'Saved data · refresh due' : 'Latest completed refresh'} · {date(read.completed_at)}</span>}
      {!read?.complete && !!read?.rows.length && <span>Partial coverage · ranking includes only retrieved companies</span>}
      <span>Free Finviz pages · delayed quotes · refresh every 30 minutes while open</span>
      <span>Event archive · checked {date(eventCoverage?.checked_at ?? null)} · {eventCoverage?.archive_days ?? 0} days with saved reports in the 90-day lookback</span>
      {eventCoverage?.latest_report_at && <span>Newest archived report · {date(eventCoverage.latest_report_at)}</span>}
    </div>
    <p className="model__note">3–6 month trade research · events reported in the past 90 days. ✓ Material event found (open for sources) · ✕ No matching report in the saved archive · — Coverage unavailable. Missing reports do not prove no event occurred. Classifications and issuer matches are inferred.</p>
    <p className="model__note">Total measures event activity, including adverse events; it is not a bullish trade score. Each category counts once, with 1 point by default. You can assign negative weights to risk signals. Routine meetings, record dates, small employee grants and price/valuation indicators are excluded. Quote timestamps are unavailable; retrieval times are shown.</p>
    {!!read?.rows.length && read.rows.every((row) => row.signals === null) && <p role="status">Event coverage is unavailable or not fresh enough to score. The existing scanner must have saved reports within the last 48 hours; dashes stay unscored.</p>}
    {(error || read?.error || eventCoverage?.error) && <div className="model__error" role="alert"><span>{error || read?.error || eventCoverage?.error}{read?.error && read.next_refresh_at && ` Next Finviz attempt after ${date(read.next_refresh_at)}.`}</span>
      <button type="button" disabled={loading} onClick={() => void refresh()}>Retry</button></div>}
    <details className="model__rules"><summary>Signal rules and weights</summary>
      <p>Weights are saved in this browser. Changing a weight immediately reorders the whole universe.</p>
      <div className="model__weights">{MODEL_SIGNALS.map((signal) => <label key={signal.id}>{signal.label}<small>{signal.rule}</small>
        <input type="number" min="-100" max="100" step="1" value={weights[signal.id]} aria-label={`${signal.label} weight`}
          onChange={(e) => { const n = e.currentTarget.valueAsNumber; if (Number.isFinite(n) && n >= -100 && n <= 100) changeWeights({ ...weights, [signal.id]: n }) }} /></label>)}</div>
      <button type="button" onClick={() => changeWeights(defaultModelWeights())}>Reset to equal weights</button>
    </details>
    <div className="model__toolbar"><label>Find a company <input type="search" value={query} placeholder="Company or ticker" onChange={(e) => { setQuery(e.target.value); setPage(0) }} /></label>
      <span>{ranked.length.toLocaleString()} matching · highest total first</span>
      <button type="button" disabled={loading} onClick={() => void refresh()}>Check for updates</button></div>
    {!read?.rows.length ? read?.error || error ? <p>No company data is available yet. Retry to check the free source.</p>
      : <div className="model__skeleton" aria-label="Loading company rows">{Array.from({ length: 8 }, (_, i) => <div key={i} />)}</div>
      : !ranked.length ? <p>No companies match “{query}”. Clear the search to see the universe.</p> : <ModelGrid rows={shown} weights={weights} />}
    {!!ranked.length && <div className="model__pages"><span>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, ranked.length)} of {ranked.length.toLocaleString()}</span>
      <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
      <button type="button" disabled={(currentPage + 1) * PAGE_SIZE >= ranked.length} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
  </section>
}
