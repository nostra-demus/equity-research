import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { fmtCost } from '../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, fmtSpan, orbClass, orbProgress, scopeTiming, type ScopeOrb } from '../lib/eta'
import { Spin } from './Spin'

const dotColor: Record<string, string> = {
  running: 'var(--accent)',
  done: 'var(--accent)',
  failed: 'var(--bad)',
  queued: 'var(--accent-deep)',
  skipped: 'var(--neutral)', // incremental-rerun prune — terminal but nothing re-written; never pulses
}

const runLabel = (r: { kind: string; module?: string; agent?: string }) =>
  r.kind === 'full' ? 'Full run' : r.kind === 'sweep' ? 'News scan' : r.kind === 'module' ? `${r.module} module` : r.kind === 'rerun' ? `Re-run · ${r.agent}` : r.agent || 'Agent'

// every in-flight server status (incl. the pre-spawn gate phases the early-acked launch surfaces)
const LIVEISH = new Set(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

// what the system is doing right now, in plain words — from the run's server status
const PHASE_LABEL: Record<string, string> = {
  starting: 'Starting the engine…',
  'readiness-checking': 'Checking the data pool…',
  'awaiting-readiness-decision': 'Paused — waiting for your data-check decision',
}

// plain-English gloss for the orchestrator's tool calls (heartbeat lastActivity)
const TOOL_GLOSS: Record<string, string> = {
  Task: 'dispatching an orb',
  Read: 'reading outputs',
  Write: 'writing a file',
  Edit: 'editing a file',
  Bash: 'running pipeline steps',
  Glob: 'scanning the run folder',
  Grep: 'searching outputs',
  WebSearch: 'searching the news',
  WebFetch: 'reading a source',
}

export function RunStreamPanel() {
  const activeRuns = useStore((s) => s.activeRuns)
  const runStream = useStore((s) => s.runStream)
  const cancelRun = useStore((s) => s.cancelRun)
  const dismissRunStream = useStore((s) => s.dismissRunStream)
  const runPanelDismissed = useStore((s) => s.runPanelDismissed)
  const reopenRunStream = useStore((s) => s.reopenRunStream)
  const ticker = useStore((s) => s.selectedTicker)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const scSelectedSignal = useStore((s) => s.scSelectedSignal)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const now = useStore((s) => s.now) // the shared 1s clock owned by SwarmField; ticks only while orbs run
  const launchPending = useStore((s) => s.launchPending)
  const stoppingRuns = useStore((s) => s.stoppingRuns)

  // run-adaptive expected duration per orb class (gate / specialist / synthesis), learned from finished orbs
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => { const n = nodesByKey.get(k); return n ? orbClass(n) : 'specialist' })), [nodeRuntime, nodesByKey])

  // runs for the current scope (live + just-finished), oldest first. Research keys on the selected company;
  // the screener's unit of work is a signal or a sweep, whose `ticker` is a SIG- id or the literal 'sweep' —
  // filtering those by the research `selectedTicker` hid a running scan entirely (the "no visibility" gap).
  const runs = Object.values(activeRuns)
    .filter((r) => (activeSwarm === 'screener' ? r.ticker === 'sweep' || r.ticker.startsWith('SIG-') : r.ticker === ticker))
    .sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0))

  // a launch is pending server-ack for THIS subject — show the panel with a starting banner in the
  // same frame as the click, so the stage is never silent while the request is in flight
  const pendingHere = launchPending && (launchPending.ticker === ticker || activeSwarm !== 'research')
  // is anything actually in flight right now? drives close-button visibility + auto-reopen
  const anyLive = runs.some((r) => LIVEISH.has(r.status)) || !!pendingHere
  // A new live run supersedes a prior manual close, so the panel returns to show progress — and stays visible
  // after it finishes, because the flag is cleared now (while live), not on the finish transition.
  useEffect(() => { if (anyLive && runPanelDismissed) reopenRunStream() }, [anyLive, runPanelDismissed, reopenRunStream])
  if (!runs.length && runStream.length === 0 && !pendingHere) return null
  // user closed it and nothing is live → stay hidden until a new run starts or they reopen it from the top bar
  if (runPanelDismissed && !anyLive) return null

  // The panel is shared across swarms; its scope label must follow the active swarm — not the
  // research-side selectedTicker, which would otherwise leak a stale ticker (e.g. "BG") into the
  // screener view, where the unit of work is a signal, not a company.
  const scope = activeSwarm === 'screener' ? (scSelectedSignal ? `Screener · ${scSelectedSignal}` : 'Screener') : ticker

  const perRun = runs.map((run) => {
    const rows = runStream.filter((r) => r.runId === run.runId)
    // 'skipped' (incremental-rerun prune) is terminal for progress: it counts toward done/total so the
    // bar and ETA collapse the moment the cascade is cut — and is surfaced separately ("K skipped").
    const skipped = rows.filter((r) => r.status === 'skipped').length
    const done = rows.filter((r) => r.status === 'done').length + skipped
    const total = run.plannedCount ?? rows.length
    // every in-flight status counts as live — including the pre-spawn gate phases the early-acked
    // launch now surfaces (a gate-parked run must keep its card, its Cancel, and its progress bar)
    const running = run.status === 'running' || run.status === 'starting' || run.status === 'readiness-checking' || run.status === 'awaiting-readiness-decision'
    return { run, rows, done, total, skipped, running }
  })
  const aggDone = perRun.reduce((s, p) => s + p.done, 0)
  const aggTotal = perRun.reduce((s, p) => s + p.total, 0)

  return (
    <div className="sidepanel">
      <div className="sidepanel__head">
        <div>
          <div className="sidepanel__title">{runs.length ? `${runs.length} run${runs.length > 1 ? 's' : ''}` : 'Last run'}</div>
          <div className="sidepanel__meta">{scope}{runs.length && aggTotal ? ` · ${aggDone}/${aggTotal} orbs` : ''}</div>
        </div>
        {/* close the panel — allowed whenever nothing is live (a live run keeps the panel pinned so progress
            stays visible; reopen it any time from the top-bar "Runs" button) */}
        {!anyLive && (
          <button type="button" className="sidepanel__close" onClick={dismissRunStream} aria-label="Close run panel" title="Close — reopen from “Runs” in the top bar">✕</button>
        )}
      </div>

      <div className="sidepanel__body">
        {/* click→ack window: the launch was fired and the server hasn't answered yet */}
        {pendingHere && !runs.some((r) => LIVEISH.has(r.status)) && (
          <div className="sidepanel__empty" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spin /> {launchPending!.label}
          </div>
        )}
        {perRun.map(({ run, rows, done, total, skipped, running }) => {
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
                  <div className="sidepanel__meta">
                    {PHASE_LABEL[run.status]
                      ? PHASE_LABEL[run.status] + (running ? ` · ${fmtClock(elapsedMs)}` : '')
                      : run.kind === 'sweep'
                        // a sweep has no orbs — a "0/0 orbs" line would read as broken. Show the clock (and,
                        // once done, the plain status) instead; the heartbeat line below carries the live detail.
                        ? (running ? `scanning · ${fmtClock(elapsedMs)}` : run.status)
                        : `${done}/${total} orbs${skipped ? ` · ${skipped} skipped` : ''} · ${running ? `${fmtClock(elapsedMs)} · ${etaText}` : run.status}`}
                  </div>
                </div>
                {run.willCommitToMain && <span className="chip" style={{ color: 'var(--accent-bright)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
                <span className="runfoot__stat">{fmtCost(run.costUsd)}</span>
                {running && (stoppingRuns[run.runId]
                  ? <button className="btn" style={{ height: 26, padding: '0 9px', fontSize: 12 }} disabled><Spin /> Stopping…</button>
                  : <button className="btn btn--danger" style={{ height: 26, padding: '0 9px', fontSize: 12 }} onClick={() => cancelRun(run.runId)}>Cancel</button>)}
              </div>
              {/* live heartbeat: what the engine is doing + when it last spoke — the anti-"is it stuck?" line */}
              {run.status === 'running' && (run.lastActivity || run.lastStdoutAt) && (() => {
                const quietMs = run.lastStdoutAt ? Math.max(0, now - run.lastStdoutAt) : null
                const stale = quietMs != null && quietMs > 45_000
                const doing = run.lastActivity ? (TOOL_GLOSS[run.lastActivity.tool] || `using ${run.lastActivity.tool}`) : null
                return (
                  <div className="sidepanel__meta" style={{ padding: '0 16px 4px', color: stale ? 'var(--warn, #d8a656)' : 'var(--text-faint)' }}>
                    {stale
                      ? `quiet for ${fmtClock(quietMs!)} — the model is thinking; Cancel is always live`
                      : `engine active${doing ? ` · ${doing}` : ''}${quietMs != null ? ` · ${quietMs < 3000 ? 'just now' : fmtClock(quietMs) + ' ago'}` : ''}`}
                  </div>
                )
              })()}
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
                        {r.status === 'skipped' && !r.verdict && <div className="streamrow__verdict streamrow__dur">skipped — upstream decision surface unchanged</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {running && rows.length === 0 && (
                <div className="sidepanel__empty">
                  {run.status === 'readiness-checking' ? 'Checking the data pool — extracting and validating every file. The run starts the moment it passes.'
                    : run.status === 'awaiting-readiness-decision' ? 'The data check needs your decision — see the panel that opened.'
                    : 'Starting the engine… the first orb will report in a moment.'}
                </div>
              )}
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
