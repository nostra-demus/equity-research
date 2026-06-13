import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, type PlacedNode } from '../../lib/layout'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, orbClass, scopeTiming, type ScopeOrb } from '../../lib/eta'
import { plainRoute, plainStage } from '../../lib/plain'
import { useStore } from '../../lib/store'
import { AgentNode } from '../swarm/AgentNode'
import { EdgeLayer } from '../swarm/EdgeLayer'
import { AgentTooltip } from '../AgentTooltip'
import { Switchyard } from './Switchyard'

// The screener stage: the gauntlet as a left-to-right flow constellation. Reuses the research
// swarm's orb/edge components and ETA machinery wholesale — only the semantics differ: the unit is
// a SIGNAL, modules are pipeline stages gated by routing, and the terminal is the routing
// switchyard (not a Memo core). Cyan comes free from the [data-swarm] token scope.
export function ScreenerField() {
  const graph = useStore((s) => s.scGraph)
  const runtime = useStore((s) => s.scRuntime)
  const selectedSignal = useStore((s) => s.scSelectedSignal)
  const routed = useStore((s) => s.scRouted)
  const board = useStore((s) => s.scBoard)
  const nodeStatus = useStore((s) => s.scNodeStatus)
  const openScreenerOutput = useStore((s) => s.openScreenerOutput)
  const openPipeline = useStore((s) => s.openPipeline)
  const openSignalIntake = useStore((s) => s.openSignalIntake)
  const selectedNodeKey = useStore((s) => s.selectedNodeKey)
  const nodesByKey = useStore((s) => s.scNodesByKey)
  const cancelRun = useStore((s) => s.cancelRun)
  const continueSignal = useStore((s) => s.continueSignal)
  const now = useStore((s) => s.now)
  const setNow = useStore((s) => s.setNow)

  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [hover, setHover] = useState<{ node: PlacedNode; x: number; y: number } | null>(null)
  const [hoverModule, setHoverModule] = useState<string | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ w: Math.max(640, width), h: Math.max(480, height) })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(() => (graph ? computeLayout(graph, size.w, size.h) : null), [graph, size.w, size.h])
  const moduleOrder = useMemo(() => new Map((graph?.modules || []).map((m, i) => [m.name, i])), [graph])

  const classOf = useMemo(() => new Map((layout?.nodes ?? []).map((n) => [n.key, orbClass(n)])), [layout])
  const exp = useMemo(() => expectedDurations(collectSamples(runtime, (k) => classOf.get(k) ?? 'specialist')), [runtime, classOf])

  const activeModules = useMemo(() => {
    const s = new Set<string>()
    for (const [k, v] of Object.entries(runtime)) if (v.status === 'running' || v.status === 'queued') s.add(k.split('/')[0])
    return s
  }, [runtime])

  const anyLive = activeModules.size > 0

  // the runId of the live gauntlet (the running/queued orbs all carry it) — what the Stop button cancels
  const liveRunId = useMemo(() => {
    for (const v of Object.values(runtime)) if ((v.status === 'running' || v.status === 'queued') && v.runId) return v.runId
    return null
  }, [runtime])

  // resumable = a signal that's stopped mid-gauntlet (some orbs done, not all) and did NOT end at a real
  // terminal gate (a PARK/LOG/watchlist exit is a complete result, not a stop). Drives the Continue button.
  const resumable = useMemo(() => {
    if (!selectedSignal || anyLive) return false
    const total = nodesByKey.size
    if (!total) return false
    let done = 0
    for (const v of Object.values(runtime)) if (v.status === 'done') done++
    if (done === 0 || done >= total) return false
    const endedAtGate = Object.entries(routed).some(([k, r]) => k !== '__thesis__' && r.terminal)
    return !endedAtGate
  }, [selectedSignal, anyLive, runtime, routed, nodesByKey])

  useEffect(() => {
    if (!anyLive) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [anyLive, setNow])

  const highlighted = useMemo(() => {
    const s = new Set<string>()
    const key = hover?.node.key
    const hasHover = !!key || !!hoverModule
    for (const e of layout?.edges ?? []) {
      if (key && (e.fromKey === key || e.toKey === key)) s.add(e.id)
      if (hoverModule && (e.fromModule === hoverModule || e.toModule === hoverModule)) s.add(e.id)
      if (!hasHover && activeModules.size && (activeModules.has(e.fromModule) || activeModules.has(e.toModule))) s.add(e.id)
    }
    // the taken exit rail stays lit once the thesis routed
    const thesisRoute = routed['__thesis__']?.route
    if (thesisRoute) {
      const exitId = thesisRoute === 'provisional' ? 'provisional' : thesisRoute === 'full_machine' ? 'full_machine' : 'watchlist'
      s.add(`exit:${exitId}`)
    }
    return s
  }, [hover, hoverModule, activeModules, layout, routed])
  const anyHover = !!(hover || hoverModule)

  if (!graph || !layout) return <div className="swarm" ref={ref} />

  const onEnter = (n: PlacedNode) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ node: n, x: rect.left + n.x, y: rect.top + n.y })
  }

  // the signal parked on the stage = a SIGNAL RUN (a gauntlet pass), NOT the live wire on the left.
  // surface what it actually is so the tie-up is unmistakable: which news, from where, when it ran,
  // its outcome, and whether it's running now or a finished past result.
  const sig = board?.signals.find((s) => s.signal_id === selectedSignal)
  const sigWhen = sig?.processed_at ? new Date(sig.processed_at) : null
  const sigDate = sigWhen && !isNaN(sigWhen.getTime()) ? sigWhen.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return (
    <div className="swarm" ref={ref} onClick={() => setHover(null)}>
      <EdgeLayer layout={layout} highlighted={highlighted} anyHover={anyHover} />

      {/* the signal under the gauntlet (or the empty-state invitation) */}
      <div className="scsignal" style={{ left: size.w * 0.5, top: size.h * 0.055 }}>
        {selectedSignal ? (
          <>
            <div className={`scsignal__state${anyLive ? ' scsignal__state--live' : ''}`}>
              {anyLive ? (
                <><span className="scsignal__pulse" aria-hidden />Running the checks now</>
              ) : (
                'Most recent check'
              )}
            </div>
            {sig?.headline && <div className="scsignal__headline">{sig.headline}</div>}
            <div className="scsignal__meta">
              {sig?.source_name && <span className="scsignal__src">{sig.source_name}</span>}
              {sigDate && <span>{sigDate}</span>}
              {sig?.status && <span className="scsignal__outcome">{plainRoute(sig.status)}</span>}
            </div>
            {!anyLive && !resumable && (
              <div className="scsignal__hint">Not the live wire on the left — open an event to run a new check.</div>
            )}
            {resumable && (
              <div className="scsignal__hint">Stopped partway — your finished checks are saved.</div>
            )}
            {(anyLive && liveRunId) || resumable ? (
              <div className="scsignal__actions">
                {anyLive && liveRunId && (
                  <button type="button" className="scsignal__act scsignal__act--stop" onClick={() => void cancelRun(liveRunId)} title="Stop the run — finished checks are saved so you can continue later">
                    <span className="scsignal__act-glyph" aria-hidden>■</span> Stop
                  </button>
                )}
                {resumable && (
                  <button type="button" className="scsignal__act scsignal__act--continue" onClick={() => void continueSignal(selectedSignal)} title="Resume from where it stopped — reuses the finished checks, runs only the rest">
                    Continue <span className="scsignal__act-glyph" aria-hidden>▸</span>
                  </button>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <button className="btn btn--amber" onClick={openSignalIntake}>Check a news event ▸</button>
        )}
      </div>

      {/* stage labels with routing state */}
      {layout.clusters.map((c) => {
        const live = activeModules.has(c.module)
        const r = routed[c.module]
        const mt = live
          ? scopeTiming(
              layout.nodes
                .filter((n) => n.module === c.module)
                .map<ScopeOrb>((n) => ({ startedAt: runtime[n.key]?.startedAt, endedAt: runtime[n.key]?.endedAt, status: nodeStatus(n.key), cls: orbClass(n) })),
              exp,
              now,
            )
          : null
        return (
          <div key={c.module} className={`cluster__label${live ? ' cluster__label--live' : ''}`} style={{ left: c.labelX, top: c.labelY }} onMouseEnter={() => setHoverModule(c.module)} onMouseLeave={() => setHoverModule(null)}>
            <div className="cluster__name">{plainStage(c.module)}</div>
            {live && mt ? (
              <div className="cluster__timer">
                <div className="cluster__timer-line">
                  <span className="cluster__timer-dot">●</span> {mt.done}/{mt.total}
                  {mt.started ? (
                    <>
                      {' · '}{fmtClock(mt.elapsedMs)}
                      {mt.etaRemainingMs != null && <span className="cluster__timer-eta">{' · '}{fmtEtaLeft(mt.etaRemainingMs)}</span>}
                    </>
                  ) : (
                    <span className="cluster__timer-eta">{' · '}starting…</span>
                  )}
                </div>
                <div className="cluster__flow"><div className="cluster__flow-fill" style={{ ['--frac' as any]: mt.total ? mt.done / mt.total : 0 }} /></div>
              </div>
            ) : r ? (
              <div className={`cluster__route${r.terminal ? ' cluster__route--terminal' : ''}`}>{plainRoute(r.route)}</div>
            ) : (
              <div className="cluster__status" style={{ color: 'var(--text-faint)' }}>{selectedSignal ? 'waiting' : 'idle'}</div>
            )}
          </div>
        )
      })}

      {/* orbs — keyed by signal so the awaken animation replays per signal */}
      <div key={selectedSignal || 'none'}>
        {layout.nodes.map((n) => {
          const st = nodeStatus(n.key)
          const running = st === 'running'
          return (
            <AgentNode
              key={n.key}
              node={n}
              status={st}
              selected={selectedNodeKey === n.key || hover?.node.key === n.key}
              delayMs={(moduleOrder.get(n.module) ?? 0) * 45 + n.layer * 50}
              tStart={running ? runtime[n.key]?.startedAt : undefined}
              tExpected={running ? expectedFor(orbClass(n), exp) : undefined}
              tNow={running ? now : undefined}
              onEnter={onEnter}
              onLeave={() => setHover(null)}
              onClick={(node) => openScreenerOutput(node)}
            />
          )
        })}
      </div>

      <Switchyard layout={layout} routed={routed} onClick={openPipeline} />

      {hover && <AgentTooltip node={hover.node} status={nodeStatus(hover.node.key)} verdict={runtime[hover.node.key]?.verdict} startedAt={runtime[hover.node.key]?.startedAt} endedAt={runtime[hover.node.key]?.endedAt} expectedMs={expectedFor(orbClass(hover.node), exp)} now={now} screenX={hover.x} screenY={hover.y} />}
    </div>
  )
}
