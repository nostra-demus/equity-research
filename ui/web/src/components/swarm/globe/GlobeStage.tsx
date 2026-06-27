import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '../../../lib/store'
import { computeGlobeLayout, type GlobeNode } from '../../../lib/globe-layout'
import { GlobeScene } from './GlobeScene'
import { useGlobeColors } from './useGlobeColors'
import { useNodeInteractions } from '../useNodeInteractions'
import { AgentTooltip } from '../../AgentTooltip'
import { ModuleReportPopup } from '../ModuleReportPopup'

// The lazy-loaded host for the 3D globe — this file pulls in three.js (via @react-three/fiber), so it (and
// GlobeScene) are the chunk that only downloads when the globe is opened. It owns the <Canvas> plus the DOM
// overlays (hover tooltip, module-tier popup) and wires the scene to the SAME store state + click actions
// the flat view uses (useNodeInteractions), so a 3D-node click behaves exactly like a flat-node click.

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function GlobeStage() {
  const graph = useStore((s) => s.graph)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const nodeStatus = useStore((s) => s.nodeStatus)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const dataStatus = useStore((s) => s.dataStatus)
  const now = useStore((s) => s.now)
  const setNow = useStore((s) => s.setNow)
  const researchView = useStore((s) => s.researchView)
  const colors = useGlobeColors()
  const { onNodeClick, onClusterClick, openThesis, modulePop, setModulePop } = useNodeInteractions()
  const morphTarget = researchView === 'globe' ? 1 : 0
  const [hover, setHover] = useState<{ node: GlobeNode; x: number; y: number } | null>(null)
  const reducedMotion = useMemo(prefersReduced, [])

  // the shared 1s clock (same as SwarmField) — ticks only while a run is live, so the tooltip's elapsed/ETA
  // line and any time-based readouts stay current. Smooth orb pulses use the render clock, not this.
  const anyLive = useMemo(() => Object.values(nodeRuntime).some((v) => v.status === 'running' || v.status === 'queued'), [nodeRuntime])
  useEffect(() => {
    if (!anyLive) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [anyLive, setNow])

  // R3F measures its container once on mount; mounting inside Suspense races the layout flush and can leave
  // the canvas stuck at its 300×150 fallback (a real resize is needed to clear it). So gate the <Canvas> on
  // our OWN ResizeObserver: mount it only once the container has a real size, and feed that size as explicit
  // pixels — the canvas then mounts into a settled, sized box and stays responsive as the stage resizes.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setSize((p) => (p && p.w === r.width && p.h === r.height ? p : { w: r.width, h: r.height }))
    }
    measure() // synchronous, post-commit pre-paint — gets the real size immediately (no mount race)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // R3F's own measure can come up stale from the lazy/Suspense mount (StrictMode double-mounts it in dev),
  // leaving the drawing buffer at its 300×150 fallback until a real window 'resize'. Poll a resize every
  // ~150ms until R3F snaps the canvas to the real size (buffer width > the 300 fallback), then stop — this
  // rides out the StrictMode settle without a Canvas remount/flash. Self-terminating + idempotent.
  useEffect(() => {
    if (!size) return
    let tries = 0
    const id = setInterval(() => {
      window.dispatchEvent(new Event('resize'))
      const c = wrapRef.current?.querySelector('canvas')
      if ((c && c.width > 320) || ++tries > 14) clearInterval(id)
    }, 150)
    return () => clearInterval(id)
  }, [size])

  const layout = useMemo(() => (graph ? computeGlobeLayout(graph) : null), [graph])
  // mirror SwarmField: nothing renders until a company is selected (an empty globe would mislead)
  if (!graph || !layout || !selectedTicker) return <div className="globe" ref={wrapRef} />

  return (
    <div className="globe" ref={wrapRef}>
      {size && (
      <Canvas flat dpr={[1, 2]} style={{ width: size.w, height: size.h }} camera={{ position: [0, 3, 27], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={[colors.bg.getHex()]} />
        <GlobeScene
          layout={layout}
          nodeStatus={nodeStatus}
          colors={colors}
          reducedMotion={reducedMotion}
          morphTarget={morphTarget}
          dataStatus={dataStatus}
          hoverKey={hover?.node.key ?? null}
          onHover={(n, x, y) => setHover(n ? { node: n, x, y } : null)}
          onPick={(n, x, y) => onNodeClick(n, () => ({ cx: x, top: y - 14 }))}
          onCoreClick={openThesis}
          onClusterClick={onClusterClick}
        />
      </Canvas>
      )}
      {hover && (
        <AgentTooltip
          node={hover.node}
          status={nodeStatus(hover.node.key)}
          verdict={nodeRuntime[hover.node.key]?.verdict}
          startedAt={nodeRuntime[hover.node.key]?.startedAt}
          endedAt={nodeRuntime[hover.node.key]?.endedAt}
          now={now}
          screenX={hover.x}
          screenY={hover.y}
        />
      )}
      {modulePop && <ModuleReportPopup module={modulePop.module} cx={modulePop.cx} top={modulePop.top} onClose={() => setModulePop(null)} />}
    </div>
  )
}
