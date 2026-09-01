import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../lib/api'
import type { PerformanceMetricSummary, PerformanceSummary } from '../lib/performance'

const REFRESH_MS = 30_000

function reading(value: number, unit: PerformanceMetricSummary['unit']): string {
  if (unit === 'score') return value.toFixed(value < 1 ? 3 : 2)
  return value < 1_000 ? `${Math.round(value)}ms` : `${(value / 1_000).toFixed(1)}s`
}

function statusCopy(status: PerformanceSummary['status']): string {
  return status === 'good' ? 'Fast' : status === 'needs_attention' ? 'Needs attention' : 'Learning'
}

function trendCopy(metric: PerformanceMetricSummary): string {
  if (metric.trend === 'learning' || metric.changePct === null) return 'Building a recent baseline'
  if (metric.trend === 'stable') return 'Stable against the recent baseline'
  return `${Math.abs(metric.changePct).toFixed(0)}% ${metric.trend} than the recent baseline`
}

export function PerformanceStatusChip({ onOpen }: { onOpen: () => void }) {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  useEffect(() => {
    let alive = true
    const read = () => void api.performanceSummary(24).then((next) => { if (alive) setSummary(next) }).catch(() => {})
    read()
    const timer = setInterval(read, 60_000)
    return () => { alive = false; clearInterval(timer) }
  }, [])
  const status = summary?.status ?? 'learning'
  return (
    <button className={`perfchip perfchip--${status}`} onClick={onOpen} title="Cockpit speed measurements and regression budgets">
      <span className="perfchip__dot" aria-hidden />
      Speed · {statusCopy(status)}
    </button>
  )
}

export function PerformancePanel({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion()
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const load = useCallback(async () => {
    setError(false)
    try { setSummary(await api.performanceSummary(24)) }
    catch { setError(true) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    void load()
    const timer = setInterval(() => void load(), REFRESH_MS)
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => { clearInterval(timer); document.removeEventListener('keydown', key) }
  }, [load, onClose])

  const budgeted = useMemo(() => summary?.metrics.filter((metric) => metric.budget !== null) ?? [], [summary])
  const observed = useMemo(() => summary?.metrics.filter((metric) => metric.budget === null).slice(0, 8) ?? [], [summary])
  const state = summary?.status ?? 'learning'
  return (
    <motion.aside
      className="perfpanel"
      aria-label="Cockpit speed"
      initial={reducedMotion ? false : { x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      <header className="perfpanel__head">
        <div>
          <div className="perfpanel__eyebrow">Passive measurements</div>
          <h2>Cockpit speed</h2>
          <p>Measures the interface while you use it. It never starts research work.</p>
        </div>
        <div className="perfpanel__tools">
          <button className="btn btn--ghost" onClick={() => void load()}>Refresh</button>
          <button className="iconbtn" onClick={onClose} aria-label="Close cockpit speed">×</button>
        </div>
      </header>
      <div className="perfpanel__body">
        <section className={`perfpanel__verdict perfpanel__verdict--${state}`}>
          <span className="perfpanel__verdict-dot" aria-hidden />
          <div>
            <strong>{statusCopy(state)}</strong>
            <span>{summary ? `${summary.sampleCount.toLocaleString()} timing samples in the last ${summary.windowHours} hours` : 'Waiting for enough normal cockpit use'}</span>
          </div>
        </section>

        {error && <div className="perfpanel__notice">Speed history is temporarily unavailable. The cockpit itself is unaffected.</div>}
        {loading && !summary ? <div className="perfpanel__notice">Reading recent timings…</div> : null}
        {!loading && !error && budgeted.length === 0 ? (
          <div className="perfpanel__notice">Learning from normal use. A budget is judged only after enough samples exist.</div>
        ) : null}

        {budgeted.length > 0 && (
          <section className="perfpanel__section">
            <div className="perfpanel__section-head"><h3>Speed budgets</h3><span>slow experiences count, not just averages</span></div>
            <div className="perfpanel__grid">
              {budgeted.map((metric) => {
                const value = metric.budgetPercentile === 75 ? metric.p75 : metric.p95
                return (
                  <article className={`perfmetric perfmetric--${metric.status}`} key={`${metric.name}:${metric.operation ?? ''}`}>
                    <div className="perfmetric__top"><strong>{metric.label}</strong><span>{metric.status === 'needs_attention' ? 'over budget' : metric.status}</span></div>
                    <div className="perfmetric__value">{reading(value, metric.unit)} <small>p{metric.budgetPercentile}</small></div>
                    <div className="perfmetric__budget">budget {reading(metric.budget!, metric.unit)} · {metric.count} samples</div>
                    <div className="perfmetric__trend">{trendCopy(metric)}</div>
                    {metric.operation && <code>{metric.operation}</code>}
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {observed.length > 0 && (
          <section className="perfpanel__section">
            <div className="perfpanel__section-head"><h3>Observed routes</h3><span>ranked by their slow end</span></div>
            <div className="perfpanel__routes">
              {observed.map((metric) => (
                <div className="perfroute" key={`${metric.name}:${metric.operation ?? ''}`}>
                  <code>{metric.operation ?? metric.label}</code>
                  <span>p95 {reading(metric.p95, metric.unit)}</span>
                  <small>{metric.count} samples</small>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="perfpanel__privacy">
          <strong>Local and privacy-safe.</strong> Only a fixed timing category, rounded duration, route family, outcome, and timestamp are kept. No ticker, run ID, question, research content, URL query, or response body is stored. History is capped and deleted after {summary?.retentionDays ?? 14} days.
        </footer>
      </div>
    </motion.aside>
  )
}
