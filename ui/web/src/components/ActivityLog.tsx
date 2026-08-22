import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { fmtAbsolute, fmtAgo, fmtCost, fmtDuration, moduleLabel } from '../lib/format'
import type { ActivityResult, ActivityRow, ResumableRunInfo, RunKind, Whoami } from '../lib/types'
import { ActivityReportMenu, type ReportMenuAnchor } from './ActivityReportMenu'
import { providerLabel } from '../lib/provider'
import { buildActivityUnits, exactResumableForActivity, type ActivityRunGroup as RunGroup } from '../lib/activityGroups'

type RangeKey = 'all' | '24h' | '7d' | '30d' | 'custom'
const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'custom', label: 'Custom' },
]
const DAY = 86_400_000

const KIND_LABEL: Record<RunKind, string> = { full: 'Full run', module: 'Module', agent: 'Orb', rerun: 'Re-run', review: 'Update', track: 'Dashboard', 'doc-intake': 'New-data read', signal: 'Event check', sweep: 'News scan', 'screener-agent': 'Screener orb', handoff: 'Send to research', conviction: 'Conviction audit', parity: 'Provider parity' }
function targetOf(r: ActivityRow): string {
  // the cheap advisory read over newly-landed documents — it writes the scoped re-run plan the
  // "New data" panel shows; it re-runs nothing itself
  if (r.kind === 'doc-intake') return 'scoped re-run plan'
  if (r.kind === 'full') return 'whole pipeline'
  if (r.kind === 'module') return moduleLabel(r.module || '—')
  if (r.kind === 'rerun') return `${r.agent || r.module || '?'} + downstream`
  if (r.kind === 'review') return 'outcome review'
  if (r.kind === 'track') return 'calls dashboard'
  if (r.kind === 'signal') return 'one event, all checks'
  if (r.kind === 'sweep') return 'fills the inbox'
  if (r.kind === 'handoff') return 'idea memo → company data folder'
  if (r.kind === 'conviction') return 'decision conviction audit'
  if (r.kind === 'parity') return 'provider parity adjudication'
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

// Which rows get an "open reports" button: a run that FINISHED with outputs (done / incomplete — never
// error, cancelled, or still in flight) AND whose kind produces a per-run report folder.
const REPORT_KINDS = new Set<string>(['signal', 'screener-agent', 'full', 'module', 'agent', 'rerun', 'review'])
const REPORT_STATUSES = new Set<string>(['done', 'incomplete'])
function hasReport(r: ActivityRow): boolean {
  return REPORT_KINDS.has(r.kind) && REPORT_STATUSES.has(r.status)
}

// Join a row to the disk-truth resumable set (GET /api/resumable): which interrupted run can it continue?
// A chained-full step (or a full row) resumes the WHOLE pipeline; a module row resumes just that module
// in its exact folder; a signal row resumes its gauntlet. Anything else (agent/rerun, or a folder that's
// finished / not today's / currently live) has no matching entry and shows no Resume affordance.
// The plain-English "N/total done" hint for a resume — modules for a full/signal, checks for a module.
function resumeHint(info: ResumableRunInfo): string {
  const noun = info.unit === 'agent' ? 'check' : 'module'
  return `Resume with the currently selected provider — ${info.doneCount}/${info.totalCount} ${noun}${info.totalCount === 1 ? '' : 's'} done, runs only the rest${info.provider ? ` (originally ${providerLabel(info.provider)})` : ''}`
}

// The label a step shows on its progress dot and in its child row's Target — the module it ran (the
// chained master step is a `rerun` on the 'master' pseudo-module; name it plainly).
function stepLabel(r: ActivityRow): string {
  if (r.module === 'master' || r.agent === 'synthesizer') return 'Master synthesis'
  if (r.kind === 'rerun') return `${moduleLabel(r.module || r.agent || '?')} re-run`
  if (r.module) return moduleLabel(r.module)
  return KIND_LABEL[r.kind]
}

// A step's dot state: filled (done), live (in flight), bad (error/incomplete/cancelled), else idle.
function dotState(s: string): 'done' | 'run' | 'bad' | 'idle' {
  if (s === 'done') return 'done'
  if (s === 'running' || s === 'starting') return 'run'
  if (s === 'error' || s === 'incomplete' || s === 'cancelled') return 'bad'
  return 'idle'
}

// A synthetic row that stands in for the whole group when driving the run-level Resume / reports menu. Its
// kind decides the routing: a research run poses as a chained 'full' (the exact resume join finds the whole-
// pipeline resume; the reports menu opens the run's final thesis / memo / every module synthesis under the
// runRoot). A screener run (its steps are signal / screener-agent) poses as 'signal' instead, so the resume
// matches the signal entry and the reports menu takes its screener branch (api.screenerRun) rather than
// dead-ending in the research branch on a screener/ path.
function groupProxyRow(g: RunGroup): ActivityRow {
  const isScreener = g.children.some((c) => c.kind === 'signal' || c.kind === 'screener-agent')
  return {
    runId: `group:${g.key}`,
    user: g.users[0] ?? 'local',
    userVia: 'local',
    kind: isScreener ? 'signal' : 'full',
    ticker: g.subjectId,
    subjectLabel: g.subjectLabel,
    swarm: g.swarm,
    chained: !isScreener,
    runRoot: g.runRoot,
    launchedAt: g.startedAt,
    status: g.status as ActivityRow['status'],
    costUsd: g.costUsd,
    durationMs: g.durationMs,
    provider: g.provider === 'claude' || g.provider === 'codex' ? g.provider : undefined,
    profileKey: g.profileKey !== 'mixed' && g.profileKey !== 'unknown' ? g.profileKey : undefined,
  }
}

// The status pill (dot + label), shared by the plain rows and the group parent so the two never drift.
// `extra` is the plain row's trailing note glyph.
function statusPill(status: string, extra?: string) {
  const tone = statusTone(status)
  return (
    <span className="apill" style={{ color: tone.color }}>
      <span className="apill__dot" style={{ background: tone.color }} />{tone.label}{extra}
    </span>
  )
}

/** HISTORY — the perpetual audit of every run ever launched: filters, runs grouped back together from their
 *  scattered steps, Resume, and the per-run reports.
 *
 *  This is the second half of the Activity dock. It renders only its own content — the shell, the title and
 *  the close button belong to the dock, which also owns the live NOW section above it. `onLoaded` reports
 *  the row/run counts up so the dock's header can summarise both halves in one line. */
export function ActivityHistory({ onLoaded }: { onLoaded?: (s: { runCount: number; allTime: number; historySince: string | null; loading: boolean }) => void }) {
  const resumableRuns = useStore((s) => s.resumableRuns)
  const resumeRun = useStore((s) => s.resumeRun)
  const launchPending = useStore((s) => s.launchPending)
  const refreshResumable = useStore((s) => s.refreshResumable)
  const [data, setData] = useState<ActivityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [whoami, setWhoami] = useState<Whoami | null>(null)
  // the per-row report chooser (manifest-driven popup), anchored to the clicked button
  const [menu, setMenu] = useState<{ row: ActivityRow; anchor: ReportMenuAnchor } | null>(null)
  // user overrides for group expansion; effective open = override ?? (a live run defaults open, a
  // finished one collapsed) — so you land watching an in-flight run complete without hand-expanding it.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const openReports = (e: MouseEvent<HTMLButtonElement>, row: ActivityRow) => {
    e.stopPropagation()
    if (menu?.row.runId === row.runId) { setMenu(null); return } // clicking the same button toggles it closed
    const r = e.currentTarget.getBoundingClientRect()
    const right = Math.max(8, window.innerWidth - r.right) // right-align under the button (it sits near the panel's right edge)
    const anchor: ReportMenuAnchor = window.innerHeight - r.bottom < 320
      ? { right, bottom: Math.max(8, window.innerHeight - r.top + 6) } // flip up near the viewport bottom
      : { right, top: r.bottom + 6 }
    setMenu({ row, anchor })
  }

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
    void refreshResumable() // keep the Resume affordances in step with the rows (cheap, independent)
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
  }, [fromTo, ticker, kind, user, status, qDebounced, refreshResumable])

  // (re)fetch on mount + whenever a filter changes, and auto-refresh every 15s so in-flight runs settle
  useEffect(() => {
    load()
    const id = setInterval(load, 15_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => { api.whoami().then(setWhoami).catch(() => {}) }, [])

  const anyFilter = !!(range !== 'all' || ticker || kind || user || status || q)
  const clearFilters = () => { setRange('all'); setFromDate(''); setToDate(''); setTicker(''); setKind(''); setUser(''); setStatus(''); setQ('') }

  const rows = data?.rows ?? []
  // Grouping is off under any filter that can split a run's rows by outcome/type/text (status / kind /
  // search) — those are applied server-side, so a group over the surviving subset would misreport
  // completeness. Range / ticker / user keep a run's rows together, so they don't disable grouping.
  const canGroup = !status && !kind && !qDebounced
  const { units, runCount } = useMemo(() => buildActivityUnits(rows, canGroup), [rows, canGroup])
  const isOpen = (g: RunGroup) => openGroups[g.key] ?? g.running
  const toggleGroup = (g: RunGroup) => setOpenGroups((m) => ({ ...m, [g.key]: !isOpen(g) }))
  // Pin a run open the first time we see it in flight, so it STAYS open when it finishes (you keep watching
  // the result) instead of auto-collapsing on the next 15s refetch. The `=== undefined` guard means this
  // only seeds a group's FIRST sighting — a manual collapse (an explicit false) is never re-opened.
  useEffect(() => {
    const seed: Record<string, boolean> = {}
    for (const u of units) if (u.kind === 'group' && u.group.running && openGroups[u.group.key] === undefined) seed[u.group.key] = true
    if (Object.keys(seed).length) setOpenGroups((m) => ({ ...m, ...seed }))
  }, [units, openGroups])
  const historySince = data?.earliest ? fmtAbsolute(data.earliest) : null
  // hand the counts to the dock header (one summary line for both halves) — after paint, never during render
  useEffect(() => { onLoaded?.({ runCount, allTime: data?.allTime ?? 0, historySince, loading: loading && !data }) }, [onLoaded, runCount, data, historySince, loading])

  // The Resume + reports (⋯) action cell, shared by plain rows and the group parent.
  const actionCell = (r: ActivityRow, resumable: ResumableRunInfo | undefined, showReport: boolean, reportLabel: string) => {
    if (!resumable && !showReport) return <span style={{ color: 'var(--text-faint)' }}>—</span>
    const resuming = !!(resumable && launchPending?.key.startsWith(`resume:${resumable.subject}:`))
    return (
      <div className="arow-actions">
        {resumable && (
          <button
            className="aresume"
            disabled={resuming}
            title={resumeHint(resumable)}
            aria-label={resumeHint(resumable)}
            onClick={(e) => { e.stopPropagation(); void resumeRun(resumable) }}
          >{resuming ? 'Resuming…' : 'Resume'}<span className="aresume__glyph" aria-hidden>▸</span></button>
        )}
        {showReport && (
          <button
            className="btn"
            style={{ height: 24, minWidth: 30, padding: '0 8px', fontSize: 16, lineHeight: 1, fontWeight: 700 }}
            aria-label={reportLabel}
            title={reportLabel}
            onClick={(e) => openReports(e, r)}
          >⋯</button>
        )}
      </div>
    )
  }

  // One flat row — a standalone run, or a single step inside a group (inGroup: indented under its run, with
  // the whole-pipeline Resume left to the parent so it isn't repeated on every module).
  const renderRow = (r: ActivityRow, inGroup = false) => {
    const raw = exactResumableForActivity(r, resumableRuns)
    // inside a group the whole-pipeline / signal resume lives on the parent — a child only offers a
    // module-level resume, so it isn't repeated on every step.
    const resumable = inGroup && (raw?.kind === 'full' || raw?.kind === 'signal') ? undefined : raw
    return (
      <tr key={r.runId} className={inGroup ? 'achild' : undefined}>
        <td title={fmtAbsolute(r.launchedAt)} style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmtAgo(r.launchedAt)}</td>
        <td className="atable__who" title={r.userVia === 'cf-access' ? 'Cloudflare Access identity' : 'local / direct access'}>{r.user}</td>
        <td><span className={`akind akind--${r.kind}`}>{KIND_LABEL[r.kind]}</span></td>
        <td className="atable__company">
          {!inGroup && <span title={companyTitle(r)} className={r.kind === 'sweep' ? 'atable__company--none' : undefined}>{companyOf(r)}</span>}
        </td>
        <td style={{ color: 'var(--text-muted)' }}>{inGroup ? stepLabel(r) : targetOf(r)}</td>
        <td title={r.note || undefined}>{statusPill(r.status, r.note ? ' ⚠' : undefined)}</td>
        <td>{r.provider ? `${providerLabel(r.provider)} · ${r.profileKey || r.executionProfile?.key || (r.model ? `${r.model}${r.reasoningLevel ? `:${r.reasoningLevel}` : ''}` : 'profile unknown')}` : 'Provider/profile unknown'}</td>
        <td className="atable__num">{r.provider === 'codex' ? 'Plan' : fmtCost(r.costUsd)}</td>
        <td className="atable__num">{fmtDuration(r.durationMs)}</td>
        <td className="atable__num">{actionCell(r, resumable, hasReport(r), 'Open reports for this run')}</td>
      </tr>
    )
  }

  // A run's parent row — the run as one unit: who/when it started, a dot per step that fills as the run
  // completes, the rolled-up status, total cost, and wall-clock duration. Click anywhere to expand the steps.
  const renderGroupBody = (g: RunGroup) => {
    const open = isOpen(g)
    const proxy = groupProxyRow(g)
    const resumable = exactResumableForActivity(proxy, resumableRuns)
    // Reconcile the rolled-up status with disk truth: a run that still has a whole-pipeline resume on disk
    // is NOT finished, even when every row present reads 'done' (e.g. all modules done but the master step
    // hasn't run yet) — show it as 'incomplete' so the pill never contradicts the Resume button beside it.
    const displayStatus = resumable && g.status === 'done' ? 'incomplete' : g.status
    const who = g.users.length > 1 ? `${g.users[0]} +${g.users.length - 1}` : g.users[0]
    const toggle = () => toggleGroup(g)
    return (
      <tbody key={g.key} className={`agroup-body${open ? ' agroup-body--open' : ''}`}>
        <tr className="agroup" onClick={toggle}>
          <td title={`Run started ${fmtAbsolute(g.startedAt)}`} style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
            <button
              className="agroup__caret"
              aria-expanded={open}
              aria-label={open ? 'Collapse run steps' : 'Expand run steps'}
              onClick={(e) => { e.stopPropagation(); toggle() }}
            >{open ? '▾' : '▸'}</button>{fmtAgo(g.startedAt)}
          </td>
          <td className="atable__who" title={g.users.join(', ')}>{who}</td>
          <td><span className={`akind ${g.isFull ? 'akind--full' : 'akind--run'}`}>{g.isFull ? 'Full run' : 'Run'}</span></td>
          <td className="atable__company"><span title={g.subjectLabel && g.subjectLabel !== g.subjectId ? g.subjectId : undefined}>{g.subjectLabel || g.subjectId}</span></td>
          <td>
            <div className="aprog" title={`${g.doneCount}/${g.totalCount} ${g.isFull ? 'modules' : 'steps'} done`}>
              <span className="aprog__dots">
                {g.children.map((c) => (
                  <span key={c.runId} className={`aprog__dot aprog__dot--${dotState(c.status)}`} title={`${stepLabel(c)} · ${statusTone(c.status).label}`} />
                ))}
              </span>
              <span className="aprog__count">{g.doneCount}/{g.totalCount}</span>
            </div>
          </td>
          <td title={g.running ? 'a step is still running' : displayStatus}>{statusPill(displayStatus)}</td>
          <td>{g.provider === 'mixed' ? `Mixed · ${g.profileKey === 'mixed' ? 'mixed profiles' : g.profileKey}` : g.provider === 'unknown' ? 'Provider/profile unknown' : `${providerLabel(g.provider)} · ${g.profileKey === 'unknown' ? 'profile unknown' : g.profileKey === 'mixed' ? 'mixed profiles' : g.profileKey}`}</td>
          <td className="atable__num">{g.provider === 'mixed' ? 'Mixed' : g.provider === 'codex' ? 'Plan' : fmtCost(g.costUsd)}</td>
          <td className="atable__num" title="wall-clock: first launch → last finish">{fmtDuration(g.durationMs)}</td>
          <td className="atable__num" onClick={(e) => e.stopPropagation()}>{actionCell(proxy, resumable, hasReport(proxy), 'Open this run’s reports')}</td>
        </tr>
        {open && g.children.map((c) => renderRow(c, true))}
      </tbody>
    )
  }

  return (
    // NOT `.activity` — that class is the sliding OVERLAY shell, still used by the chat-history browser.
    // This is a section inside the dock, so it owns its own root and only shares the inner `activity__*`
    // element styles (filters / count / body / empty), which are position-independent.
    <div className="ahistory">
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
              <option value="doc-intake">New-data read</option>
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
            {/* ONE flex item for the whole sentence — without the wrapper each text node becomes its own
                flex item and the summary breaks apart mid-phrase as the dock narrows. */}
            <span className="activity__countline">
            {loading && !data ? 'Loading…' : (
              <>
                Showing <b>{runCount}</b> {anyFilter ? 'matching ' : ''}run{runCount === 1 ? '' : 's'}
                {runCount !== rows.length ? ` · ${rows.length}${data && data.total > rows.length ? ` of ${data.total}` : ''} step${rows.length === 1 ? '' : 's'}` : (data && data.total > rows.length ? ` · ${rows.length} of ${data.total}` : '')}
                {data ? ` · ${data.allTime} total ever` : ''}
                {historySince ? ` · history since ${historySince}` : ''}
                {whoami && <> · you are <b style={{ color: 'var(--text-muted)' }}>{whoami.user}</b>{whoami.userVia === 'local' && ' (local)'}</>}
              </>
            )}
            </span>
            <button className="activity__refresh" onClick={() => { setLoading(true); load() }} title="Re-read the audit log now">Refresh ↻</button>
          </div>

          <div className="activity__body">
            {rows.length === 0 && !loading ? (
              <div className="activity__empty">{anyFilter ? 'No runs match these filters.' : 'No runs recorded yet. Launch an orb, a module, or a full run and it will appear here.'}</div>
            ) : (
              <table className="atable">
                <thead>
                  <tr>
                    <th>When</th><th>Who</th><th>Action</th><th>Company</th><th>Target</th><th>Status</th><th>Provider</th><th className="atable__num">Cost</th><th className="atable__num">Duration</th><th className="atable__num">Reports</th>
                  </tr>
                </thead>
                {units.map((u) => (u.kind === 'group' ? renderGroupBody(u.group) : <tbody key={u.row.runId}>{renderRow(u.row)}</tbody>))}
              </table>
            )}
          </div>
          {menu && <ActivityReportMenu row={menu.row} anchor={menu.anchor} onClose={() => setMenu(null)} />}
        </>
      )}
    </div>
  )
}
