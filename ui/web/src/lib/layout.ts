import type { AgentNode, SwarmGraph } from './types'

export interface PlacedNode extends AgentNode {
  x: number
  y: number
  r: number
}
export interface PlacedCluster {
  module: string
  dependsOn: string[]
  anchorX: number
  anchorTopY: number
  labelX: number
  labelY: number
  synthKey: string | null
  synthX: number
  synthY: number
  status?: string
}
export interface PlacedEdge {
  id: string
  d: string
  kind: 'dep' | 'core'
  from: string
  to: string
}
export interface Layout {
  nodes: PlacedNode[]
  clusters: PlacedCluster[]
  core: { x: number; y: number; r: number }
  edges: PlacedEdge[]
  baselineY: number
}

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const my = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
}

export function computeLayout(graph: SwarmGraph, W: number, H: number): Layout {
  const N = graph.modules.length
  const core = { x: W * 0.5, y: H * 0.87, r: 36 }
  const baselineY = core.y

  // split modules into two rows (roots up top), preserving topo order
  const topCount = N > 3 ? Math.floor(N / 2) : N
  const rows: { mods: typeof graph.modules; y: number; padX: number }[] = []
  rows.push({ mods: graph.modules.slice(0, topCount), y: H * 0.13, padX: 0.2 })
  if (topCount < N) rows.push({ mods: graph.modules.slice(topCount), y: H * 0.46, padX: 0.13 })

  const colGap = Math.min(34, Math.max(24, W / 60))
  const rowGap = 33

  const nodes: PlacedNode[] = []
  const clusters: PlacedCluster[] = []
  const nodeByKey = new Map<string, PlacedNode>()

  for (const row of rows) {
    const k = row.mods.length
    for (let i = 0; i < k; i++) {
      const m = row.mods[i]
      const t = k === 1 ? 0.5 : i / (k - 1)
      const anchorX = W * (row.padX + t * (1 - 2 * row.padX))
      const anchorTopY = row.y

      const layerKeys = Object.keys(m.layers).map(Number).sort((a, b) => a - b)
      let synthKey: string | null = null
      let synthX = anchorX
      let synthY = anchorTopY
      layerKeys.forEach((lk, li) => {
        const agents = m.layers[String(lk)]
        const y = anchorTopY + li * rowGap
        const n = agents.length
        agents.forEach((a, j) => {
          const x = anchorX + (j - (n - 1) / 2) * colGap
          const r = a.isSynthesis ? 10 : a.failFast ? 7 : 7
          const placed: PlacedNode = { ...a, x, y, r }
          nodes.push(placed)
          nodeByKey.set(a.key, placed)
          if (a.isSynthesis) {
            synthKey = a.key
            synthX = x
            synthY = y
          }
        })
      })

      clusters.push({
        module: m.name,
        dependsOn: m.dependsOn,
        anchorX,
        anchorTopY,
        labelX: anchorX,
        labelY: anchorTopY - 18,
        synthKey,
        synthX,
        synthY,
      })
    }
  }

  const clusterByName = new Map(clusters.map((c) => [c.module, c]))
  const edges: PlacedEdge[] = []

  for (const c of clusters) {
    // dependency edges: dep.synthesis -> this cluster top anchor
    for (const dep of c.dependsOn) {
      const src = clusterByName.get(dep)
      if (!src) continue
      edges.push({ id: `dep:${dep}->${c.module}`, kind: 'dep', from: src.synthKey || dep, to: c.module, d: curve(src.synthX, src.synthY, c.anchorX, c.anchorTopY - 8) })
    }
    // module synthesis -> core
    edges.push({ id: `core:${c.module}`, kind: 'core', from: c.synthKey || c.module, to: 'core', d: curve(c.synthX, c.synthY, core.x, core.y - core.r * 0.7) })
  }

  return { nodes, clusters, core, edges, baselineY }
}
