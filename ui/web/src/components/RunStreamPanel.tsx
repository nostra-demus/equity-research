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
  if (!activeRun && runStream.length === 0) return null

  const doneCount = runStream.filter((r) => r.status === 'done').length
  const label = activeRun ? (activeRun.kind === 'full' ? 'Full run' : activeRun.kind === 'module' ? `${activeRun.module} module` : activeRun.agent) : 'Last run'

  return (
    <div className="sidepanel">
      <div className="sidepanel__head">
        <div>
          <div className="sidepanel__title">{label}</div>
          <div className="sidepanel__meta">{ticker} · {activeRun ? activeRun.status : 'finished'}</div>
        </div>
        {activeRun?.willCommitToMain && <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
      </div>
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
        {runStream.length === 0 && <div className="sidepanel__empty">Waiting for the first agent to report…</div>}
      </div>
      <div className="runfoot">
        <span className="runfoot__stat">{doneCount} done</span>
        <span className="runfoot__stat">·</span>
        <span className="runfoot__stat">{fmtCost(activeRun?.costUsd)}</span>
        <div style={{ flex: 1 }} />
        {activeRun && activeRun.status === 'running' && <button className="btn btn--danger" style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={cancelRun}>Cancel</button>}
      </div>
    </div>
  )
}
