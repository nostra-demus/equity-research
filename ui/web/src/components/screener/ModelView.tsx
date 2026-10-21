import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MODEL_PRICE_REFRESH_MS, MODEL_REFRESH_MS, MODEL_SIGNALS, modelTotal, rankModel, signalResult, UNIVERSE_URL,
  type ModelPricesRead, type ModelRead, type ModelRow } from '../../../../shared/universe-model'
import { api } from '../../lib/api'
import { ModelSignalDialog, type ModelSelection } from './ModelSignalDialog'

const PAGE_SIZE = 100
const date = (value: string | null) => value ? new Date(value).toLocaleString() : 'Not yet available'

export function modelPriceView(row: ModelRow, prices?: ModelPricesRead | null, unavailable = false, now = Date.now()) {
  const quote = prices?.rows.find((entry) => entry.ticker === row.ticker && entry.company === row.company)?.quote
  if (!quote) return { price: row.price, label: `${now - Date.parse(row.retrieved_at) >= MODEL_REFRESH_MS ? 'Saved · ' : ''}Finviz · delayed`,
    time: date(row.retrieved_at), title: `Retrieved ${date(row.retrieved_at)}. Finviz does not supply an individual quote timestamp here.` }
  const age = quote.as_of ? now - Date.parse(quote.as_of) : Infinity
  const saved = unavailable || quote.stale || now - Date.parse(quote.retrieved_at) > 3 * MODEL_PRICE_REFRESH_MS
  const state = !quote.as_of ? 'Time unavailable' : quote.as_of_is_close ? 'Last close' : quote.delayed ? 'Delayed'
    : quote.real_time === true && age >= -60_000 && age <= 90_000 && !saved ? 'Live' : 'Latest trade'
  const time = quote.as_of_is_close && quote.as_of ? quote.as_of.slice(0, 10) : date(quote.as_of)
  return { price: quote.price, label: `${saved ? 'Saved · ' : ''}CNBC · ${state}`, time,
    title: `${quote.symbol} · ${state} · market time ${time}. Retrieved ${date(quote.retrieved_at)}.` }
}

export function ModelGrid({ rows, prices, priceError = false }: { rows: ModelRow[]; prices?: ModelPricesRead | null; priceError?: boolean }) {
  const [selection, setSelection] = useState<ModelSelection | null>(null)
  return <><div className="model__scroll" tabIndex={0} aria-label="Company signals; scroll for more columns">
    <table className="model__grid">
      <caption className="sr-only">Finviz universe ranked by favorable company signals, highest first. Each green signal counts once. A dash means company impact is unassessed or coverage is unavailable.</caption>
      <thead><tr><th scope="col">Company</th><th scope="col">Market price <small>USD</small></th>
        {MODEL_SIGNALS.map((signal) => <th scope="col" key={signal.id} title={signal.rule}>{signal.label}</th>)}
        <th scope="col" aria-sort="descending">Total ↓</th></tr></thead>
      <tbody>{rows.map((row) => { const price = modelPriceView(row, prices, priceError); return <tr key={row.ticker}>
        <th scope="row"><button type="button" className="model__company" aria-haspopup="dialog" onClick={() => setSelection({ row, signal: null })}>{row.company}</button><small>{row.ticker}</small></th>
        <td title={price.title}>{price.price === null ? '—' : `$${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}<small>{price.label}</small><small>{price.time}</small></td>
        {MODEL_SIGNALS.map((signal) => {
          const result = signalResult(row, signal)
          const label = result === null ? 'Unassessed' : result ? 'Favorable impact' : 'No favorable signal'
          return <td key={signal.id}><button type="button" aria-haspopup="dialog" className={`model__signal model__signal--${result === null ? 'unknown' : result ? 'pass' : 'fail'}`}
            aria-label={`${signal.label}: ${label}`} title={signal.rule} onClick={() => setSelection({ row, signal })}>{result === null ? '—' : result ? '✓' : '✕'}</button></td>
        })}
        <td className="model__total">{modelTotal(row) ?? '—'}<small>{row.signals === null ? 'Coverage unavailable' : 'Green ticks'}</small></td>
      </tr> })}</tbody>
    </table>
  </div>{selection && <ModelSignalDialog key={JSON.stringify([selection.row.ticker, selection.row.company])} selection={selection} onSelect={(signal) => setSelection({ row: selection.row, signal })} onClose={() => setSelection(null)} />}</>
}

export function ModelView() {
  const [read, setRead] = useState<ModelRead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState<ModelPricesRead | null>(null)
  const [priceError, setPriceError] = useState(false)
  const pending = useRef(false)
  const mounted = useRef(true)
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
  const ranked = useMemo(() => {
    const text = query.trim().toLowerCase()
    return rankModel((read?.rows ?? []).filter((r) => `${r.company} ${r.ticker}`.toLowerCase().includes(text)))
  }, [read?.rows, query])
  const currentPage = Math.min(page, Math.max(0, Math.ceil(ranked.length / PAGE_SIZE) - 1))
  const shown = ranked.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const priceCompanies = JSON.stringify(shown.map(({ ticker, company }) => ({ ticker, company })))
  useEffect(() => {
    const companies = JSON.parse(priceCompanies) as { ticker: string; company: string }[]
    if (!companies.length) return
    let alive = true
    let controller: AbortController | null = null
    const tick = async () => {
      if (controller || document.visibilityState !== 'visible') return
      controller = new AbortController()
      try {
        const result = await api.universeModelPrices(companies, controller.signal)
        if (alive) { setPrices(result); setPriceError(!result.rows.some((row) => row.quote)) }
      } catch { if (alive) setPriceError(true) }
      finally { controller = null }
    }
    void tick()
    const timer = setInterval(() => void tick(), MODEL_PRICE_REFRESH_MS)
    window.addEventListener('focus', tick)
    return () => { alive = false; controller?.abort(); clearInterval(timer); window.removeEventListener('focus', tick) }
  }, [priceCompanies])
  const eventCoverage = read?.events
  return <section className="model" aria-label="Universe Model">
    <div className="model__heading"><div><h2>Model</h2><p>Market cap &gt; $2bn · average volume &gt; 50k</p></div>
      <a href={UNIVERSE_URL} target="_blank" rel="noreferrer">Open Finviz universe ↗</a></div>
    <div className="model__status" role="status">
      <strong>{read?.rows.length ? `${read.rows.length.toLocaleString()} companies` : 'Loading companies…'}</strong>
      {read?.refreshing && <span>{read.refresh_phase === 'membership' ? 'Universe' : 'Finviz'} refreshing · {read.fetched.toLocaleString()}{read.refresh_total ? ` / ${read.refresh_total.toLocaleString()}` : ''} checked</span>}
      {read?.complete && <span>{read.stale ? 'Universe refresh due' : 'Universe updated'} · {date(read.completed_at)}</span>}
      {!read?.complete && !!read?.rows.length && <span>Partial coverage</span>}
      <span>Prices · every {MODEL_PRICE_REFRESH_MS / 1000}s</span>
    </div>
    <p className="model__note">✓ Favorable · ✕ No favorable signal · — Unassessed · Total = green ticks</p>
    {!!read?.rows.length && read.rows.every((row) => row.signals === null) && <p role="status">Event coverage unavailable · signals unscored.</p>}
    {(error || read?.error || read?.data?.error || eventCoverage?.error) && <div className="model__error" role="alert"><span>{error || read?.error || read?.data?.error || eventCoverage?.error}{(read?.error || read?.data?.error) && read?.next_refresh_at && ` Retry after ${date(read.next_refresh_at)}.`}</span>
      {read?.error?.startsWith('Model updated.') ? <button type="button" onClick={() => window.location.reload()}>Reload</button>
        : <button type="button" disabled={loading} onClick={() => void refresh()}>Retry</button>}</div>}
    {priceError && !!shown.length && <p role="status">Price feed unavailable · saved prices shown.</p>}
    <details className="model__rules"><summary>Data & coverage</summary>
      <p>Finviz universe and company data refresh in the background. Free Finviz prices are delayed. Visible prices use the existing CNBC feed every {MODEL_PRICE_REFRESH_MS / 1000}s, with its market timestamp and delivery status.</p>
      <p>Company data · {read?.data ? `${read.data.captured.toLocaleString()} / ${read.data.expected.toLocaleString()} views collected${read.data.refreshing ? ' · collecting' : ''}` : 'awaiting collection'} · hourly refresh target between price checks. Open a company for details.</p>
      {read?.data?.error && <p role="alert">{read.data.error}</p>}
      {!read?.complete && <p>Partial coverage · only retrieved companies are ranked.</p>}
      <p>Event archive · {eventCoverage?.reports_scanned ? `checked ${date(eventCoverage.checked_at)}` : eventCoverage?.refreshing ? 'loading saved reports' : 'coverage unavailable'} · {eventCoverage?.archive_days ?? 0} days covered in the 90-day window.</p>
      {eventCoverage?.latest_report_at && <p>Latest report · {date(eventCoverage.latest_report_at)}</p>}
      <p>Company impact uses saved engine assessments only. Opening this grid never starts analysis.</p>
    </details>
    <details className="model__rules"><summary>Signal rules</summary>
      <p>Each category checks up to three recent material reports in 90 days. Green requires company-specific benefits in every report, with no adverse or mixed effects. Unassessed reports show a dash. Assessments are inferred, may be outdated, and do not prove a catalyst is still pending.</p>
      <div className="model__rules-list">{MODEL_SIGNALS.map((signal) => <div key={signal.id}>{signal.label}<small>{signal.rule}</small></div>)}</div>
    </details>
    <div className="model__toolbar"><label>Find a company <input type="search" value={query} placeholder="Company or ticker" onChange={(e) => { setQuery(e.target.value); setPage(0) }} /></label>
      <span>{ranked.length.toLocaleString()} matching · highest total first</span>
      <button type="button" disabled={loading} onClick={() => void refresh()}>Check for updates</button></div>
    {!read?.rows.length ? read?.error || error ? <p>No company data is available yet. Retry to check the free source.</p>
      : <div className="model__skeleton" aria-label="Loading company rows">{Array.from({ length: 8 }, (_, i) => <div key={i} />)}</div>
      : !ranked.length ? <p>No companies match “{query}”. Clear the search to see the universe.</p> : <ModelGrid rows={shown} prices={prices} priceError={priceError} />}
    {!!ranked.length && <div className="model__pages"><span>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, ranked.length)} of {ranked.length.toLocaleString()}</span>
      <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
      <button type="button" disabled={(currentPage + 1) * PAGE_SIZE >= ranked.length} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
  </section>
}
