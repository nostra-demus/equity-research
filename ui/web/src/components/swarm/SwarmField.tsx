import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, type PlacedNode } from '../../lib/layout'
import { sufficiencyColor } from '../../lib/format'
import { useStore } from '../../lib/store'
import { AgentNode } from './AgentNode'
import { CoreOrb } from './CoreOrb'
import { EdgeLayer } from './EdgeLayer'
import { AgentTooltip } from '../AgentTooltip'

export function SwarmField() {
  const graph = useStore((s) => s.graph)
  const dataStatus = useStore((s) => s.dataStatus)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const activeRun = useStore((s) => s.activeRun)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const decision = useStore((s) => s.decision)
  const coreBloom = useStore((s) => s.coreBloom)
  const nodeStatus = useStore((s) => s.nodeStatus)
  const launchModule = useStore((s) => s.launchModule)
  const openThesis = useStore((s) => s.openThesis)
  const openOutputForNode = useStore((s) => s.openOutputForNode)
  const selectNodeForRun = useStore((s) => s.selectNodeForRun)
  const selectedNodeKey = useStore((s) => s.selectedNodeKey)
  const setToast = useStore((s) => s.setToast)

  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [hover, setHover] = useState<{ node: PlacedNode; x: number; y: number } | null>(null)
  const [hoverModule, setHoverModule] = useState<string | null>(null)
  const [hoverCore, setHoverCore] = useState(false)

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

  // modules with a live (queued or running) orb — they light their edges and pulse their label,
  // so a running module reads as "alive" from the moment of launch (incl. the engine-startup phase)
  const activeModules = useMemo(() => {
    const s = new Set<string>()
    if (!activeRun) return s
    for (const [k, v] of Object.entries(nodeRuntime)) if (v.status === 'running' || v.status === 'queued') s.add(k.split('/')[0])
    return s
  }, [nodeRuntime, activeRun])

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
  const onNodeClick = (n: PlacedNode) => {
    if (nodeStatus(n.key) === 'done') return openOutputForNode(n)
    return selectNodeForRun(n)
  }

  const onClusterClick = (module: string) => {
    if (activeRun) return
    const ms = dataStatus?.modules[module]?.status
    if (ms === 'Insufficient') return setToast({ msg: `No data for ${module} — upload to Drive`, tone: 'info' })
    launchModule(module)
  }

  return (
    <div className="swarm" ref={ref} onClick={() => setHover(null)}>
      <EdgeLayer layout={layout} highlighted={highlighted} anyHover={anyHover} />

      {/* cluster labels */}
      {layout.clusters.map((c) => {
        const ms = dataStatus?.modules[c.module]?.status
        const live = activeModules.has(c.module)
        return (
          <div key={c.module} className={`cluster__label${live ? ' cluster__label--live' : ''}`} style={{ left: c.labelX, top: c.labelY }} onMouseEnter={() => setHoverModule(c.module)} onMouseLeave={() => setHoverModule(null)} onClick={(e) => { e.stopPropagation(); onClusterClick(c.module) }}>
            <div className="cluster__name">{c.module.replace(/-/g, ' ')}</div>
            {ms && <div className="cluster__status" style={{ color: sufficiencyColor(ms) }}>{ms}</div>}
            {live ? <div className="cluster__run">● running…</div> : <div className="cluster__run">▸ run module</div>}
          </div>
        )
      })}

      {/* nodes — keyed by ticker so the awaken animation replays on selection */}
      <div key={selectedTicker || 'none'}>
        {layout.nodes.map((n) => (
          <AgentNode
            key={n.key}
            node={n}
            status={nodeStatus(n.key)}
            selected={selectedNodeKey === n.key || hover?.node.key === n.key}
            delayMs={(moduleOrder.get(n.module) ?? 0) * 45 + n.layer * 50}
            onEnter={onEnter}
            onLeave={onLeave}
            onClick={onNodeClick}
          />
        ))}
      </div>

      <CoreOrb x={layout.core.x} y={layout.core.y} r={layout.core.r} decision={decision} bloom={coreBloom} armed={!!selectedTicker} onClick={() => openThesis()} onHover={setHoverCore} />

      {hover && <AgentTooltip node={hover.node} status={nodeStatus(hover.node.key)} verdict={nodeRuntime[hover.node.key]?.verdict} screenX={hover.x} screenY={hover.y} />}
    </div>
  )
}
