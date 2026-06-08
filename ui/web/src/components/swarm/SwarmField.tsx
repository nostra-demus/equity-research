import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, type PlacedNode } from '../../lib/layout'
import { sufficiencyColor } from '../../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, orbClass, scopeTiming, type ScopeOrb } from '../../lib/eta'
import { useStore } from '../../lib/store'
import { AgentNode } from './AgentNode'
import { CoreOrb } from './CoreOrb'
import { ModuleReportPopup } from './ModuleReportPopup'
import { EdgeLayer } from './EdgeLayer'
import { AgentTooltip } from '../AgentTooltip'

export function SwarmField() {
  const graph = useStore((s) => s.graph)
  const dataStatus = useStore((s) => s.dataStatus)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const decision = useStore((s) => s.decision)
  const coreBloom = useStore((s) => s.coreBloom)
  const nodeStatus = useStore((s) => s.nodeStatus)
  const launchModule = useStore((s) => s.launchModule)
  const openThesis = useStore((s) => s.openThesis)
  const openOutputForNode = useStore((s) => s.openOutputForNode)
  const moduleReports = useStore((s) => s.moduleReports)
  const selectNodeForRun = useStore((s) => s.selectNodeForRun)
  const selectedNodeKey = useStore((s) => s.selectedNodeKey)
  const setToast = useStore((s) => s.setToast)
  const now = useStore((s) => s.now)
  const setNow = useStore((s) => s.setNow)

  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [hover, setHover] = useState<{ node: PlacedNode; x: number; y: number } | null>(null)
  const [hoverModule, setHoverModule] = useState<string | null>(null)
  const [hoverCore, setHoverCore] = useState(false)
  const [modulePop, setModulePop] = useState<{ module: string; cx: number; top: number } | null>(null)

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
  const moduleByName = useMemo(() => new Map((graph?.modules || []).map((m) => [m.name, m])), [graph])

  // each orb's runtime class (gate / specialist / synthesis), and the run-adaptive expected duration per
  // class learned from orbs that have already finished this session (seeded until the first one lands)
  const classOf = useMemo(() => new Map((layout?.nodes ?? []).map((n) => [n.key, orbClass(n)])), [layout])
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => classOf.get(k) ?? 'specialist')), [nodeRuntime, classOf])

  // modules with a live (queued or running) orb — they light their edges and pulse their label,
  // so a running module reads as "alive" from the moment of launch (incl. the engine-startup phase)
  const activeModules = useMemo(() => {
    const s = new Set<string>()
    for (const [k, v] of Object.entries(nodeRuntime)) if (v.status === 'running' || v.status === 'queued') s.add(k.split('/')[0])
    return s
  }, [nodeRuntime])

  // the single shared 1s clock that drives every live timer (orb fill, ring sweep, module triad, panel,
  // tooltip). Runs ONLY while a module has a queued/running orb, so an idle constellation never re-renders.
  const anyLive = activeModules.size > 0
  useEffect(() => {
    if (!anyLive) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [anyLive, setNow])

  // which edges light up: hovered node's flows, hovered module's flows, the Memo's inbound arrows, or (idle) running modules
  const highlighted = useMemo(() => {
    const s = new Set<string>()
    const key = hover?.node.key
    const hasHover = !!key || !!hoverModule || hoverCore
    for (const e of layout?.edges ?? []) {
      if (key && (e.fromKey === key || e.toKey === key)) s.add(e.id)
      if (hoverModule && (e.fromModule === hoverModule || e.toModule === hoverModule)) s.add(e.id)
      if (hoverCore && e.kind === 'core') s.add(e.id) // every arrow flowing into the Memo
      if (!hasHover && activeModules.size && (activeModules.has(e.fromModule) || activeModules.has(e.toModule))) s.add(e.id)
    }
    return s
  }, [hover, hoverModule, hoverCore, activeModules, layout])
  const anyHover = !!(hover || hoverModule || hoverCore)

  if (!graph || !layout) return <div className="swarm" ref={ref} />

  const onEnter = (n: PlacedNode) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ node: n, x: rect.left + n.x, y: rect.top + n.y })
  }
  const onLeave = () => setHover(null)

  // click any orb -> select it and open the side panel. Done -> its output (with Re-run);
  // not-yet-run -> a pending panel whose button runs/re-runs it. The panel owns the action.
  // A finished module-synthesis orb opens the module's 3-tier chooser (synthesis / memo / dossier)
  // when more than one tier exists — the module-level mirror of the Memo orb's run-level popup.
  const onNodeClick = (n: PlacedNode) => {
    if (nodeStatus(n.key) !== 'done') return selectNodeForRun(n)
    if (n.isSynthesis) {
      const r = moduleReports[n.module]
      const tierCount = [r?.synthesis, r?.memo, r?.dossier].filter(Boolean).length
      if (tierCount > 1) {
        const rect = ref.current?.getBoundingClientRect()
        if (rect) return setModulePop({ module: n.module, cx: rect.left + n.x, top: rect.top + n.y - 14 })
      }
    }
    return openOutputForNode(n)
  }

  const onClusterClick = (module: string) => {
    const ms = dataStatus?.modules[module]?.status
    if (ms === 'Insufficient') return setToast({ msg: `No data for ${module} — upload to Drive`, tone: 'info' })
    const mod = moduleByName.get(module)
    if (mod?.depsComplete === false) return setToast({ msg: `${module} needs ${mod.missingDeps?.join(', ') || 'upstream'} complete first`, tone: 'info' })
    launchModule(module) // launchModule also guards if this module is already in flight; the server is authoritative
  }

  return (
    <div className="swarm" ref={ref} onClick={() => setHover(null)}>
      <EdgeLayer layout={layout} highlighted={highlighted} anyHover={anyHover} />

      {/* cluster labels */}
      {layout.clusters.map((c) => {
        const ms = dataStatus?.modules[c.module]?.status
        const live = activeModules.has(c.module)
        const mod = moduleByName.get(c.module)
        const depLocked = mod?.depsComplete === false
        const miss = mod?.missingDeps?.join(', ')
        // live module timer: elapsed since the first orb here started + honest progress-projection ETA
        const mt = live
          ? scopeTiming(
              layout.nodes
                .filter((n) => n.module === c.module)
                .map<ScopeOrb>((n) => ({ startedAt: nodeRuntime[n.key]?.startedAt, endedAt: nodeRuntime[n.key]?.endedAt, status: nodeStatus(n.key), cls: orbClass(n) })),
              exp,
              now,
            )
          : null
        return (
          <div key={c.module} className={`cluster__label${live ? ' cluster__label--live' : ''}`} style={{ left: c.labelX, top: c.labelY }} onMouseEnter={() => setHoverModule(c.module)} onMouseLeave={() => setHoverModule(null)} onClick={(e) => { e.stopPropagation(); onClusterClick(c.module) }}>
            <div className="cluster__name">{c.module.replace(/-/g, ' ')}</div>
            {ms && <div className="cluster__status" style={{ color: sufficiencyColor(ms) }}>{ms}</div>}
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
            ) : depLocked ? (
              <div className="cluster__run" style={{ color: 'var(--text-faint)' }} title={`Needs ${miss} complete first`}>🔒 needs {miss}</div>
            ) : (
              <div className="cluster__run">▸ run module</div>
            )}
          </div>
        )
      })}

      {/* nodes — keyed by ticker so the awaken animation replays on selection */}
      <div key={selectedTicker || 'none'}>
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
              tStart={running ? nodeRuntime[n.key]?.startedAt : undefined}
              tExpected={running ? expectedFor(orbClass(n), exp) : undefined}
              tNow={running ? now : undefined}
              onEnter={onEnter}
              onLeave={onLeave}
              onClick={onNodeClick}
            />
          )
        })}
      </div>

      <CoreOrb x={layout.core.x} y={layout.core.y} r={layout.core.r} decision={decision} bloom={coreBloom} armed={!!selectedTicker} onClick={() => openThesis()} onHover={setHoverCore} />

      {modulePop && <ModuleReportPopup module={modulePop.module} cx={modulePop.cx} top={modulePop.top} onClose={() => setModulePop(null)} />}

      {hover && <AgentTooltip node={hover.node} status={nodeStatus(hover.node.key)} verdict={nodeRuntime[hover.node.key]?.verdict} startedAt={nodeRuntime[hover.node.key]?.startedAt} endedAt={nodeRuntime[hover.node.key]?.endedAt} expectedMs={expectedFor(orbClass(hover.node), exp)} now={now} screenX={hover.x} screenY={hover.y} />}
    </div>
  )
}
