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

export function RunStreamPanel() {
  const activeRun = useStore((s) => s.activeRun)
  const runStream = useStore((s) => s.runStream)
  const cancelRun = useStore((s) => s.cancelRun)
  const ticker = useStore((s) => s.selectedTicker)

  // tick once a second so the elapsed clock updates live while a run is in progress
  const [now, setNow] = useState(() => Date.now())
  const running = activeRun?.status === 'running'
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running, activeRun?.runId])

  if (!activeRun && runStream.length === 0) return null

  const doneCount = runStream.filter((r) => r.status === 'done').length
  const total = activeRun?.plannedCount ?? runStream.length
  const pct = total ? Math.min(100, Math.round((doneCount / total) * 100)) : 0
  const label = activeRun ? (activeRun.kind === 'full' ? 'Full run' : activeRun.kind === 'module' ? `${activeRun.module} module` : activeRun.kind === 'rerun' ? `Re-run · ${activeRun.agent}` : activeRun.agent) : 'Last run'

  const elapsedMs = activeRun?.startedAt ? now - activeRun.startedAt : 0
  const elapsed = `${Math.floor(elapsedMs / 60000)}:${String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}`
  const etaLow = activeRun?.kind === 'full' ? 20 : Math.max(1, Math.ceil(total * 0.3))
  const etaHigh = activeRun?.kind === 'full' ? 40 : Math.max(2, Math.ceil(total * 0.8))

  return (
    <div className="sidepanel">
      <div className="sidepanel__head">
        <div>
          <div className="sidepanel__title">{label}</div>
          <div className="sidepanel__meta">{ticker} · {activeRun ? activeRun.status : 'finished'}</div>
        </div>
        {activeRun?.willCommitToMain && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
      </div>

      {activeRun && (
        <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
            <span>{doneCount}/{total} orbs done</span>
            <span>{running ? `${elapsed} · ~${etaLow}–${etaHigh} min` : activeRun.status}</span>
          </div>
          <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', boxShadow: running ? '0 0 8px var(--accent-glow)' : 'none', transition: 'width 350ms ease' }} />
          </div>
        </div>
      )}

      <div className="sidepanel__body">
        <AnimatePresence initial={false}>
          {runStream.map((r) => (
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
        {activeRun && runStream.length === 0 && <div className="sidepanel__empty">Starting the engine… the first orb will report in a moment.</div>}
      </div>
      <div className="runfoot">
        <span className="runfoot__stat">{fmtCost(activeRun?.costUsd)}</span>
        <div style={{ flex: 1 }} />
        {activeRun && activeRun.status === 'running' && <button className="btn btn--danger" style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={cancelRun}>Cancel</button>}
      </div>
    </div>
  )
}
