import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { fmtCost } from '../lib/format'

const dotColor: Record<string, string> = {
  running: 'var(--accent)',
  done: 'var(--accent)',
  failed: 'var(--bad)',
  queued: 'var(--accent-deep)',
}

const fmtElapsed = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
const runLabel = (r: { kind: string; module?: string; agent?: string }) =>
  r.kind === 'full' ? 'Full run' : r.kind === 'module' ? `${r.module} module` : r.kind === 'rerun' ? `Re-run · ${r.agent}` : r.agent || 'Agent'

export function RunStreamPanel() {
  const activeRuns = useStore((s) => s.activeRuns)
  const runStream = useStore((s) => s.runStream)
  const cancelRun = useStore((s) => s.cancelRun)
  const ticker = useStore((s) => s.selectedTicker)

  // runs for the selected company (live + just-finished), oldest first
  const runs = Object.values(activeRuns)
    .filter((r) => r.ticker === ticker)
    .sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0))
  const anyRunning = runs.some((r) => r.status === 'running' || r.status === 'starting')

  // tick once a second so each run's elapsed clock updates while anything is in progress
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!anyRunning) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [anyRunning])

  if (!runs.length && runStream.length === 0) return null

  const perRun = runs.map((run) => {
    const rows = runStream.filter((r) => r.runId === run.runId)
    const done = rows.filter((r) => r.status === 'done').length
    const total = run.plannedCount ?? rows.length
    const running = run.status === 'running' || run.status === 'starting'
    return { run, rows, done, total, running }
  })
  const aggDone = perRun.reduce((s, p) => s + p.done, 0)
  const aggTotal = perRun.reduce((s, p) => s + p.total, 0)

  return (
    <div className="sidepanel">
      <div className="sidepanel__head">
        <div>
          <div className="sidepanel__title">{runs.length ? `${runs.length} run${runs.length > 1 ? 's' : ''}` : 'Last run'}</div>
          <div className="sidepanel__meta">{ticker}{runs.length ? ` · ${aggDone}/${aggTotal} orbs` : ''}</div>
        </div>
      </div>

      <div className="sidepanel__body">
        {perRun.map(({ run, rows, done, total, running }) => {
          const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0
          const elapsedMs = run.startedAt ? now - run.startedAt : 0
          const etaLow = run.kind === 'full' ? 20 : Math.max(1, Math.ceil(total * 0.3))
          const etaHigh = run.kind === 'full' ? 40 : Math.max(2, Math.ceil(total * 0.8))
          return (
            <div key={run.runId} className="sidepanel__runcard" style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 4px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidepanel__title" style={{ fontSize: 13 }}>{runLabel(run)}</div>
                  <div className="sidepanel__meta">{done}/{total} orbs · {running ? `${fmtElapsed(elapsedMs)} · ~${etaLow}–${etaHigh} min` : run.status}</div>
                </div>
                {run.willCommitToMain && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
                <span className="runfoot__stat">{fmtCost(run.costUsd)}</span>
                {running && <button className="btn btn--danger" style={{ height: 26, padding: '0 9px', fontSize: 12 }} onClick={() => cancelRun(run.runId)}>Cancel</button>}
              </div>
              <div style={{ padding: '0 16px 6px' }}>
                <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', boxShadow: running ? '0 0 8px var(--accent-glow)' : 'none', transition: 'width 350ms ease' }} />
                </div>
              </div>
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                    <span className={`streamrow__dot${r.status === 'running' ? ' pulsedot' : ''}`} style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                    <div className="streamrow__body">
                      <div className="streamrow__name">
                        {r.name}
                        <span className="streamrow__mod">{r.module} · L{r.layer}</span>
                      </div>
                      {r.verdict && <div className="streamrow__verdict">{r.verdict}</div>}
                      {r.status === 'running' && <div className="streamrow__verdict" style={{ color: 'var(--accent)' }}>running…</div>}
                      {r.status === 'failed' && <div className="streamrow__verdict" style={{ color: 'var(--bad)' }}>failed</div>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {running && rows.length === 0 && <div className="sidepanel__empty">Starting the engine… the first orb will report in a moment.</div>}
            </div>
          )
        })}

        {/* no live/recent run object, but stream rows survived (e.g. just after a finish) */}
        {!runs.length && (
          <AnimatePresence initial={false}>
            {runStream.map((r) => (
              <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                <span className="streamrow__dot" style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                <div className="streamrow__body">
                  <div className="streamrow__name">{r.name}<span className="streamrow__mod">{r.module} · L{r.layer}</span></div>
                  {r.verdict && <div className="streamrow__verdict">{r.verdict}</div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
