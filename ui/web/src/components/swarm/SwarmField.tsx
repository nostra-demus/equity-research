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
  const launchAgent = useStore((s) => s.launchAgent)
  const launchModule = useStore((s) => s.launchModule)
  const requestFull = useStore((s) => s.requestFull)
  const requestFullDisabled = !!activeRun
  const openOutputForNode = useStore((s) => s.openOutputForNode)
  const setToast = useStore((s) => s.setToast)

  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 760 })
  const [hover, setHover] = useState<{ node: PlacedNode; x: number; y: number } | null>(null)

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

  const activeModules = useMemo(() => {
    const s = new Set<string>()
    if (!activeRun) return s
    for (const [k, v] of Object.entries(nodeRuntime)) if (v.status === 'running') s.add(k.split('/')[0])
    return s
  }, [nodeRuntime, activeRun])

  if (!graph || !layout) return <div className="swarm" ref={ref} />

  const onEnter = (n: PlacedNode) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ node: n, x: rect.left + n.x, y: rect.top + n.y })
  }
  const onLeave = () => setHover(null)

  const onNodeClick = (n: PlacedNode) => {
    const status = nodeStatus(n.key)
    if (status === 'done') return openOutputForNode(n)
    if (activeRun) return
    if (status === 'ready' || status === 'failed') return launchAgent(n)
    if (status === 'notready') return setToast({ msg: `${n.name} needs upstream — run the ${n.module} module`, tone: 'info' })
    if (status === 'locked') return setToast({ msg: `No data for ${n.module} — upload to Drive`, tone: 'info' })
  }

  const onClusterClick = (module: string) => {
    if (activeRun) return
    const ms = dataStatus?.modules[module]?.status
    if (ms === 'Insufficient') return setToast({ msg: `No data for ${module} — upload to Drive`, tone: 'info' })
    launchModule(module)
  }

  return (
    <div className="swarm" ref={ref} onClick={() => setHover(null)}>
      <EdgeLayer layout={layout} activeModules={activeModules} />

      {/* cluster labels */}
      {layout.clusters.map((c) => {
        const ms = dataStatus?.modules[c.module]?.status
        return (
          <div key={c.module} className="cluster__label" style={{ left: c.labelX, top: c.labelY }} onClick={(e) => { e.stopPropagation(); onClusterClick(c.module) }}>
            <div className="cluster__name">{c.module.replace(/-/g, ' ')}</div>
            {ms && <div className="cluster__status" style={{ color: sufficiencyColor(ms) }}>{ms}</div>}
            <div className="cluster__run">▸ run module</div>
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
            selected={hover?.node.key === n.key}
            delayMs={(moduleOrder.get(n.module) ?? 0) * 45 + n.layer * 50}
            onEnter={onEnter}
            onLeave={onLeave}
            onClick={onNodeClick}
          />
        ))}
      </div>

      <CoreOrb x={layout.core.x} y={layout.core.y} r={layout.core.r} decision={decision} bloom={coreBloom} armed={!!selectedTicker} onClick={() => !requestFullDisabled && requestFull()} />

      {hover && <AgentTooltip node={hover.node} status={nodeStatus(hover.node.key)} verdict={nodeRuntime[hover.node.key]?.verdict} screenX={hover.x} screenY={hover.y} />}
    </div>
  )
}
