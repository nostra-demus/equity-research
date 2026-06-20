import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { fmtAbsolute, fmtAgo, fmtCost, fmtDuration, moduleLabel } from '../lib/format'
import type { ActivityResult, ActivityRow, RunKind, Whoami } from '../lib/types'

type RangeKey = 'all' | '24h' | '7d' | '30d' | 'custom'
const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'custom', label: 'Custom' },
]
const DAY = 86_400_000

const KIND_LABEL: Record<RunKind, string> = { full: 'Full run', module: 'Module', agent: 'Orb', rerun: 'Re-run', review: 'Update', track: 'Dashboard', signal: 'Event check', sweep: 'News scan', 'screener-agent': 'Screener orb', handoff: 'Send to research' }
function targetOf(r: ActivityRow): string {
  if (r.kind === 'full') return 'whole pipeline'
  if (r.kind === 'module') return moduleLabel(r.module || '—')
  if (r.kind === 'rerun') return `${r.agent || r.module || '?'} + downstream`
  if (r.kind === 'review') return 'outcome review'
  if (r.kind === 'track') return 'calls dashboard'
  if (r.kind === 'signal') return 'one event, all checks'
  if (r.kind === 'sweep') return 'fills the inbox'
  if (r.kind === 'handoff') return 'idea memo → company data folder'
  return `${moduleLabel(r.module || '')} › ${r.agent || '?'}`
}
// The Company column: research runs carry a real ticker; swarm runs carry an opaque subject id that
// the server resolves to a readable label (the company/headline a SIG-… event concerns). A sweep is a
// market-wide scan, not about one company, so it shows a dash.
function companyOf(r: ActivityRow): string {
  if (r.kind === 'sweep') return '—'
  return r.subjectLabel || r.ticker
}
// Hover reveals the underlying subject id (the audit anchor) whenever we've replaced it with a label.
function companyTitle(r: ActivityRow): string | undefined {
  if (r.kind === 'sweep') return 'Market-wide news scan'
  if (r.subjectLabel && r.subjectLabel !== r.ticker) return r.ticker
  return undefined
}
function statusTone(s: string): { color: string; label: string } {
  switch (s) {
    case 'done': return { color: 'var(--accent-bright)', label: 'done' }
    case 'running': case 'starting': return { color: 'var(--accent-bright)', label: 'running' }
    case 'error': return { color: 'var(--bad)', label: 'error' }
    case 'incomplete': return { color: 'var(--bad)', label: 'incomplete' }
    case 'cancelled': return { color: 'var(--text-faint)', label: 'cancelled' }
    default: return { color: 'var(--text-muted)', label: s }
  }
}

export function ActivityLog() {
  const close = useStore((s) => s.closeActivity)
  const [data, setData] = useState<ActivityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [whoami, setWhoami] = useState<Whoami | null>(null)

  // filters
  const [range, setRange] = useState<RangeKey>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [ticker, setTicker] = useState('')
  const [kind, setKind] = useState('')
  const [user, setUser] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const staticMode = isStatic()

  const fromTo = useMemo<{ from?: number; to?: number }>(() => {
    if (range === 'custom') {
      const from = fromDate ? new Date(fromDate + 'T00:00:00').getTime() : undefined
      const to = toDate ? new Date(toDate + 'T23:59:59').getTime() : undefined
      return { from, to }
    }
    if (range === 'all') return {}
    const days = range === '24h' ? 1 : range === '7d' ? 7 : 30
    return { from: Date.now() - days * DAY }
  }, [range, fromDate, toDate])

  // debounce the free-text search so each keystroke doesn't refetch
  const [qDebounced, setQDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  // single guarded fetch path shared by the auto-refresh interval, the filter effects, AND the manual
  // Refresh button — so a slow/stale response (whatever triggered it) can never overwrite newer data or
  // setState after unmount. reqGen wins among concurrent loads; `mounted` guards post-unmount writes.
  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const load = useCallback(async () => {
    const gen = ++reqGen.current
    try {
      const res = await api.activity({
        from: fromTo.from,
        to: fromTo.to,
        ticker: ticker || undefined,
        kind: (kind as RunKind) || undefined,
        user: user || undefined,
        status: status || undefined,
        q: qDebounced || undefined,
        limit: 1000,
      })
      if (mounted.current && gen === reqGen.current) setData(res)
    } catch {
      if (mounted.current && gen === reqGen.current) setData({ rows: [], total: 0, allTime: 0, users: [], tickers: [], earliest: null })
    } finally {
      if (mounted.current && gen === reqGen.current) setLoading(false)
    }
  }, [fromTo, ticker, kind, user, status, qDebounced])

  // (re)fetch on mount + whenever a filter changes, and auto-refresh every 15s so in-flight runs settle
  useEffect(() => {
    load()
    const id = setInterval(load, 15_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => { api.whoami().then(setWhoami).catch(() => {}) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const anyFilter = !!(range !== 'all' || ticker || kind || user || status || q)
  const clearFilters = () => { setRange('all'); setFromDate(''); setToDate(''); setTicker(''); setKind(''); setUser(''); setStatus(''); setQ('') }

  const rows = data?.rows ?? []
  const historySince = data?.earliest ? fmtAbsolute(data.earliest) : null

  return (
    <motion.div className="activity" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="activity__head">
        <div style={{ minWidth: 0 }}>
          <div className="activity__title">Activity log</div>
          <div className="activity__sub">
            Perpetual audit of every run launched from the cockpit
            {whoami && <> · signed in as <b style={{ color: 'var(--text-muted)' }}>{whoami.user}</b>{whoami.userVia === 'local' && ' (local)'}</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <button className="btn" style={{ height: 30 }} onClick={() => { setLoading(true); load() }}>Refresh ↻</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {staticMode ? (
        <div className="activity__empty">The activity log lives on the live engine. This is the read-only showcase.</div>
      ) : (
        <>
          <div className="activity__filters">
            <div className="seg" role="group" aria-label="Time range">
              {RANGES.map((r) => (
                <button key={r.key} className={`seg__btn${range === r.key ? ' seg__btn--on' : ''}`} onClick={() => setRange(r.key)}>{r.label}</button>
              ))}
            </div>
            {range === 'custom' && (
              <div className="activity__custom">
                <input type="date" className="fld fld--date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} aria-label="From date" />
                <span style={{ color: 'var(--text-faint)' }}>→</span>
                <input type="date" className="fld fld--date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} aria-label="To date" />
              </div>
            )}
            <select className="fld" value={ticker} onChange={(e) => setTicker(e.target.value)} aria-label="Company">
              <option value="">All companies</option>
              {(data?.tickers ?? []).map((t) => <option key={t} value={t}>{data?.tickerLabels?.[t] ?? t}</option>)}
            </select>
            <select className="fld" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type">
              <option value="">All types</option>
              <option value="full">Full run</option>
              <option value="module">Module</option>
              <option value="agent">Orb</option>
              <option value="rerun">Re-run</option>
              <option value="review">Update</option>
              <option value="track">Dashboard</option>
            </select>
            {(data?.users.length ?? 0) > 1 && (
              <select className="fld" value={user} onChange={(e) => setUser(e.target.value)} aria-label="User">
                <option value="">All users</option>
                {(data?.users ?? []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
            <select className="fld" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="">Any status</option>
              <option value="done">Done</option>
              <option value="running">Running</option>
              <option value="error">Error</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input className="fld fld--search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            {anyFilter && <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={clearFilters}>Clear</button>}
          </div>

          <div className="activity__count">
            {loading && !data ? 'Loading…' : (
              <>
                Showing <b>{rows.length}</b>{data && data.total > rows.length ? ` of ${data.total}` : ''} {anyFilter ? 'matching' : ''} run{rows.length === 1 ? '' : 's'}
                {data ? ` · ${data.allTime} total ever` : ''}
                {historySince ? ` · history since ${historySince}` : ''}
              </>
            )}
          </div>

          <div className="activity__body">
            {rows.length === 0 && !loading ? (
              <div className="activity__empty">{anyFilter ? 'No runs match these filters.' : 'No runs recorded yet. Launch an orb, a module, or a full run and it will appear here.'}</div>
            ) : (
              <table className="atable">
                <thead>
                  <tr>
                    <th>When</th><th>Who</th><th>Action</th><th>Company</th><th>Target</th><th>Status</th><th className="atable__num">Cost</th><th className="atable__num">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const tone = statusTone(r.status)
                    return (
                      <tr key={r.runId}>
                        <td title={fmtAbsolute(r.launchedAt)} style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmtAgo(r.launchedAt)}</td>
                        <td className="atable__who" title={r.userVia === 'cf-access' ? 'Cloudflare Access identity' : 'local / direct access'}>{r.user}</td>
                        <td><span className={`akind akind--${r.kind}`}>{KIND_LABEL[r.kind]}</span></td>
                        <td className="atable__company"><span title={companyTitle(r)} className={r.kind === 'sweep' ? 'atable__company--none' : undefined}>{companyOf(r)}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{targetOf(r)}</td>
                        <td title={r.note || undefined}><span className="apill" style={{ color: tone.color }}><span className="apill__dot" style={{ background: tone.color }} />{tone.label}{r.note ? ' ⚠' : ''}</span></td>
                        <td className="atable__num">{fmtCost(r.costUsd)}</td>
                        <td className="atable__num">{fmtDuration(r.durationMs)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
