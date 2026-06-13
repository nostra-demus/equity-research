import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { fmtCost } from '../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, fmtSpan, orbClass, orbProgress, scopeTiming, type ScopeOrb } from '../lib/eta'

const dotColor: Record<string, string> = {
  running: 'var(--accent)',
  done: 'var(--accent)',
  failed: 'var(--bad)',
  queued: 'var(--accent-deep)',
}

const runLabel = (r: { kind: string; module?: string; agent?: string }) =>
  r.kind === 'full' ? 'Full run' : r.kind === 'module' ? `${r.module} module` : r.kind === 'rerun' ? `Re-run · ${r.agent}` : r.agent || 'Agent'

export function RunStreamPanel() {
  const activeRuns = useStore((s) => s.activeRuns)
  const runStream = useStore((s) => s.runStream)
  const cancelRun = useStore((s) => s.cancelRun)
  const ticker = useStore((s) => s.selectedTicker)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const now = useStore((s) => s.now) // the shared 1s clock owned by SwarmField; ticks only while orbs run

  // run-adaptive expected duration per orb class (gate / specialist / synthesis), learned from finished orbs
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => { const n = nodesByKey.get(k); return n ? orbClass(n) : 'specialist' })), [nodeRuntime, nodesByKey])

  // runs for the selected company (live + just-finished), oldest first
  const runs = Object.values(activeRuns)
    .filter((r) => r.ticker === ticker)
    .sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0))

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
          // honest run ETA: progress-projection once an orb has finished; the launch-time range until then
          const runOrbs: ScopeOrb[] = Object.entries(nodeRuntime)
            .filter(([, rt]) => rt.runId === run.runId)
            .map(([k, rt]) => { const n = nodesByKey.get(k); return { startedAt: rt.startedAt, endedAt: rt.endedAt, status: rt.status, cls: n ? orbClass(n) : 'specialist' } })
          const rt = scopeTiming(runOrbs, exp, now)
          const etaLow = run.kind === 'full' ? 20 : Math.max(1, Math.ceil(total * 0.3))
          const etaHigh = run.kind === 'full' ? 40 : Math.max(2, Math.ceil(total * 0.8))
          const etaText = rt.fraction > 0 && rt.etaRemainingMs != null ? fmtEtaLeft(rt.etaRemainingMs) : `~${etaLow}–${etaHigh} min`
          return (
            <div key={run.runId} className="sidepanel__runcard" style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 4px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidepanel__title" style={{ fontSize: 13 }}>{runLabel(run)}</div>
                  <div className="sidepanel__meta">{done}/{total} orbs · {running ? `${fmtClock(elapsedMs)} · ${etaText}` : run.status}</div>
                </div>
                {run.willCommitToMain && <span className="chip" style={{ color: 'var(--accent-bright)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
                <span className="runfoot__stat">{fmtCost(run.costUsd)}</span>
                {running && <button className="btn btn--danger" style={{ height: 26, padding: '0 9px', fontSize: 12 }} onClick={() => cancelRun(run.runId)}>Cancel</button>}
              </div>
              <div style={{ padding: '0 16px 6px' }}>
                <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', transformOrigin: 'left', transform: `scaleX(${pct / 100})`, background: 'var(--accent)', boxShadow: running ? '0 0 8px var(--accent-glow)' : 'none', transition: 'transform 350ms var(--ease)' }} />
                </div>
              </div>
              <AnimatePresence initial={false}>
                {rows.map((r) => {
                  const nrt = nodeRuntime[r.key]
                  const dur = nrt?.startedAt && nrt?.endedAt && nrt.endedAt > nrt.startedAt ? fmtSpan(nrt.endedAt - nrt.startedAt) : null
                  const liveElapsed = nrt?.startedAt ? fmtClock(Math.max(0, now - nrt.startedAt)) : null
                  const liveLeft = nrt?.startedAt ? fmtEtaLeft(orbProgress(nrt.startedAt, expectedFor((() => { const n = nodesByKey.get(r.key); return n ? orbClass(n) : 'specialist' })(), exp), now).remainingMs) : null
                  return (
                    <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                      <span className={`streamrow__dot${r.status === 'running' ? ' pulsedot' : ''}`} style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                      <div className="streamrow__body">
                        <div className="streamrow__name">
                          {r.name}
                          <span className="streamrow__mod">{r.module} · L{r.layer}</span>
                        </div>
                        {r.verdict && (
                          <div className="streamrow__verdict">{r.verdict}{r.status === 'done' && dur && <span className="streamrow__dur"> · {dur}</span>}</div>
                        )}
                        {r.status === 'done' && !r.verdict && dur && <div className="streamrow__verdict streamrow__dur">{dur}</div>}
                        {r.status === 'running' && <div className="streamrow__verdict" style={{ color: 'var(--accent-bright)' }}>running{liveElapsed ? ` · ${liveElapsed}` : ''}{liveLeft ? ` · ${liveLeft}` : ''}</div>}
                        {r.status === 'failed' && <div className="streamrow__verdict" style={{ color: 'var(--bad)' }}>failed</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {running && rows.length === 0 && <div className="sidepanel__empty">Starting the engine… the first orb will report in a moment.</div>}
            </div>
          )
        })}

        {/* no live/recent run object, but stream rows survived (e.g. just after a finish) */}
        {!runs.length && (
          <AnimatePresence initial={false}>
            {runStream.map((r) => {
              const nrt = nodeRuntime[r.key]
              const dur = nrt?.startedAt && nrt?.endedAt && nrt.endedAt > nrt.startedAt ? fmtSpan(nrt.endedAt - nrt.startedAt) : null
              return (
                <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                  <span className="streamrow__dot" style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                  <div className="streamrow__body">
                    <div className="streamrow__name">{r.name}<span className="streamrow__mod">{r.module} · L{r.layer}</span></div>
                    {r.verdict && <div className="streamrow__verdict">{r.verdict}{dur && <span className="streamrow__dur"> · {dur}</span>}</div>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
