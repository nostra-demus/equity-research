import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { decisionColor } from '../lib/format'
import type { CallSummary, CallTimelineEntry, CallsResult } from '../lib/types'

// every call the engine has made + what's happened since (price / thesis / forecasts), with the
// due/overdue review checkpoints. Reuses the ActivityLog modal shell + table styles.

function statusColor(s: string): string {
  switch (s) {
    case 'overdue': return 'var(--bad)'
    case 'due': return 'var(--accent-bright)'
    case 'done': return 'var(--accent)'
    default: return 'var(--text-muted)' // upcoming
  }
}
function thesisColor(s?: string | null): string {
  switch ((s || '').toLowerCase()) {
    case 'confirmed': case 'on-track': return 'var(--accent)'
    case 'at-risk': return 'var(--accent-bright)'
    case 'broken': return 'var(--bad)'
    default: return 'var(--text-muted)'
  }
}
const dash = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
function ret(v?: number | null): string {
  return typeof v !== 'number' ? '—' : v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`
}
function targetOf(c: CallSummary): string {
  if (c.implied_target == null) return ret(c.expected_return_pct)
  return `${ret(c.expected_return_pct)} → ${(c.currency || '').trim()} ${c.implied_target}`
}

export function CallsTracker() {
  const close = useStore((s) => s.closeCalls)
  const updateCall = useStore((s) => s.updateCall)
  const fileDueReview = useStore((s) => s.fileDueReview)
  const refreshDashboard = useStore((s) => s.refreshDashboard)
  const openCallFile = useStore((s) => s.openCallFile)
  const setToast = useStore((s) => s.setToast)
  const anyRunForTicker = useStore((s) => s.anyRunForTicker)
  const [data, setData] = useState<CallsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Set<string>>(new Set()) // expanded run_roots
  const staticMode = isStatic()

  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const load = useCallback(async () => {
    const gen = ++reqGen.current
    try {
      const res = await api.calls()
      if (mounted.current && gen === reqGen.current) setData(res)
    } catch {
      if (mounted.current && gen === reqGen.current) setData({ calls: [], dashboard: null })
    } finally {
      if (mounted.current && gen === reqGen.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
    const id = setInterval(load, 15_000) // settle in newly-filed reviews / dashboards
    return () => clearInterval(id)
  }, [load])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const toggle = (rr: string) => setOpen((s) => { const n = new Set(s); n.has(rr) ? n.delete(rr) : n.add(rr); return n })
  const calls = data?.calls ?? []

  return (
    <motion.div className="activity" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="activity__head">
        <div style={{ minWidth: 0 }}>
          <div className="activity__title">Calls tracker</div>
          <div className="activity__sub">Every call the engine has made and what's happened since — click a call for its timeline</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {!staticMode && <button className="btn btn--ghost" style={{ height: 30 }} onClick={() => refreshDashboard()} title="Regenerate the downloadable markdown/JSON dashboard (/research:track)">Rebuild ↻</button>}
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={() => data?.dashboard ? openCallFile(data.dashboard, 'Calls dashboard') : setToast({ msg: 'No dashboard yet — Rebuild to generate one', tone: 'info' })} title="Open the latest committed markdown dashboard">Dashboard ↧</button>
          <button className="btn" style={{ height: 30 }} onClick={() => { setLoading(true); load() }}>Refresh</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      <div className="activity__count">
        {loading && !data ? 'Loading…' : <>Tracking <b>{calls.length}</b> call{calls.length === 1 ? '' : 's'}{staticMode ? ' · read-only showcase' : ''}</>}
      </div>

      <div className="activity__body">
        {calls.length === 0 && !loading ? (
          <div className="activity__empty">No calls yet. Run the full pipeline on a company and its verdict appears here to track over time.</div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Company</th><th>Called</th><th>Verdict</th><th>Horizon</th><th>Entry → target</th><th>Latest status</th><th>Next checkpoint</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => {
                const isOpen = open.has(c.run_root)
                const nc = c.next_checkpoint
                const busy = anyRunForTicker(c.ticker)
                return (
                  <CallRows
                    key={c.run_root}
                    c={c}
                    isOpen={isOpen}
                    busy={busy}
                    staticMode={staticMode}
                    onToggle={() => toggle(c.run_root)}
                    onUpdate={() => updateCall(c.ticker)}
                    onFileDue={(w) => fileDueReview(c.ticker, w)}
                    onOpen={openCallFile}
                    nc={nc}
                  />
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}

function CallRows({ c, isOpen, busy, staticMode, onToggle, onUpdate, onFileDue, onOpen, nc }: {
  c: CallSummary
  isOpen: boolean
  busy: boolean
  staticMode: boolean
  onToggle: () => void
  onUpdate: () => void
  onFileDue: (window: string) => void
  onOpen: (path: string, title: string) => void
  nc: CallSummary['next_checkpoint']
}) {
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: 'pointer' }}>
        <td style={{ fontWeight: 600 }}>{isOpen ? '▾ ' : '▸ '}{dash(c.company)} <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>{c.ticker}</span></td>
        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{dash(c.decision_date)}</td>
        <td><span style={{ color: decisionColor(c.decision || ''), fontWeight: 600 }}>{dash(c.decision)}</span></td>
        <td style={{ color: 'var(--text-muted)' }}>{dash(c.time_horizon)}</td>
        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(c.currency || '').trim()} {dash(c.entry_price)} · {targetOf(c)}</td>
        <td><span style={{ color: thesisColor(c.latest_thesis_status) }}>{c.latest_thesis_status ? c.latest_thesis_status : <span style={{ color: 'var(--text-faint)' }}>awaiting review</span>}</span></td>
        <td style={{ whiteSpace: 'nowrap' }}>{nc ? <span style={{ color: statusColor(nc.status) }}>{nc.window} · {nc.status} {dash(nc.due_date)}</span> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} style={{ background: 'var(--surface-1)', padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={onUpdate} disabled={staticMode || busy} title="Fetch the latest price and re-check forecasts/risks now (files an ad-hoc review)">{busy ? 'Update running…' : 'Update now'}</button>
              <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={() => onOpen(c.final_thesis_path, `Investment Thesis — ${c.ticker}`)}>Thesis</button>
              {nc && (nc.status === 'due' || nc.status === 'overdue') && (
                <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={() => onFileDue(nc.window)} disabled={staticMode || busy} title={`File the ${nc.window} review`}>File {nc.window} review</button>
              )}
              <span style={{ color: 'var(--text-faint)', fontSize: 12, alignSelf: 'center' }}>
                downside {ret(c.downside_risk_pct)} · {c.kill_criteria_count} kill criteria · forecasts {c.forecasts.confirmed}✓/{c.forecasts.falsified}✗ of {c.forecasts.open + c.forecasts.confirmed + c.forecasts.falsified + c.forecasts.expired + c.forecasts.other}
              </span>
            </div>
            <table className="atable" style={{ margin: 0 }}>
              <thead>
                <tr><th>Window</th><th>Due</th><th>Status</th><th>Reviewed</th><th>Price</th><th>Return</th><th>Thesis</th><th>Forecasts ✓/✗</th><th></th></tr>
              </thead>
              <tbody>
                {c.timeline.length === 0 ? (
                  <tr><td colSpan={9} style={{ color: 'var(--text-faint)' }}>No review schedule on this call.</td></tr>
                ) : c.timeline.map((t: CallTimelineEntry, i) => (
                  <tr key={t.window + '-' + (t.due_date || t.review_date || i)}>
                    <td style={{ fontWeight: 600 }}>{t.window}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dash(t.due_date)}</td>
                    <td><span style={{ color: statusColor(t.status) }}>{t.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dash(t.review_date)}</td>
                    <td>{dash(t.review_price)}</td>
                    <td style={{ color: typeof t.absolute_return_pct === 'number' ? (t.absolute_return_pct >= 0 ? 'var(--accent)' : 'var(--bad)') : 'var(--text-faint)' }}>{ret(t.absolute_return_pct)}</td>
                    <td><span style={{ color: thesisColor(t.thesis_status) }}>{dash(t.thesis_status)}</span></td>
                    <td>{t.status === 'done' ? `${dash(t.forecasts_confirmed)}/${dash(t.forecasts_falsified)}` : '—'}</td>
                    <td>{t.review_file && <button className="btn btn--ghost" style={{ height: 24, fontSize: 11 }} onClick={() => onOpen(t.review_file!, `${c.ticker} ${t.window} review`)}>View</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}
