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
  kind: 'dep' | 'core' | 'feeds'
  fromKey: string
  toKey: string
  fromModule: string
  toModule: string
}
export interface Layout {
  nodes: PlacedNode[]
  clusters: PlacedCluster[]
  core: { x: number; y: number; r: number }
  edges: PlacedEdge[]
  baselineY: number
  // flow layouts (screener): the routing switchyard's exit rails, fanning out of the core slot.
  exits?: { id: string; label: string; x: number; y: number }[]
}

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const my = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
}
// pull the (x2,y2) endpoint back along the chord so an arrowhead sits just off the target node
function shorten(x1: number, y1: number, x2: number, y2: number, gap: number): [number, number] {
  const dx = x2 - x1, dy = y2 - y1
  const L = Math.hypot(dx, dy) || 1
  return [x2 - (dx / L) * gap, y2 - (dy / L) * gap]
}

export function computeLayout(graph: SwarmGraph, W: number, H: number): Layout {
  if (graph.swarm?.layout === 'flow') return computeFlowLayout(graph, W, H)
  const N = graph.modules.length
  const core = { x: W * 0.5, y: H * 0.87, r: 36 }
  const baselineY = core.y

  const topCount = N > 3 ? Math.floor(N / 2) : N
  const rows: { mods: typeof graph.modules; y: number; padX: number }[] = []
  rows.push({ mods: graph.modules.slice(0, topCount), y: H * 0.13, padX: 0.2 })
  if (topCount < N) rows.push({ mods: graph.modules.slice(topCount), y: H * 0.46, padX: 0.13 })

  const colGap = Math.min(34, Math.max(24, W / 60))
  const rowGap = 33

  const nodes: PlacedNode[] = []
  const clusters: PlacedCluster[] = []

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
          if (a.isSynthesis) {
            synthKey = a.key
            synthX = x
            synthY = y
          }
        })
      })

      clusters.push({ module: m.name, dependsOn: m.dependsOn, anchorX, anchorTopY, labelX: anchorX, labelY: anchorTopY - 18, synthKey, synthX, synthY })
    }
  }

  const clusterByName = new Map(clusters.map((c) => [c.module, c]))
  const edges: PlacedEdge[] = []

  for (const c of clusters) {
    // intra-module data flow: each specialist feeds the module's synthesis (revealed on hover)
    if (c.synthKey) {
      for (const n of nodes) {
        if (n.module !== c.module || n.isSynthesis) continue
        const [ex, ey] = shorten(n.x, n.y, c.synthX, c.synthY, 12)
        edges.push({ id: `feed:${n.key}`, kind: 'feeds', fromKey: n.key, toKey: c.synthKey, fromModule: c.module, toModule: c.module, d: curve(n.x, n.y + n.r, ex, ey) })
      }
    }
    // cross-module dependency: dep's synthesis output flows into this module
    for (const dep of c.dependsOn) {
      const src = clusterByName.get(dep)
      if (!src) continue
      edges.push({ id: `dep:${dep}->${c.module}`, kind: 'dep', fromKey: src.synthKey || '', toKey: '', fromModule: dep, toModule: c.module, d: curve(src.synthX, src.synthY, c.anchorX, c.anchorTopY - 10) })
    }
    // module synthesis -> master thesis core
    if (c.synthKey) {
      const [ex, ey] = shorten(c.synthX, c.synthY, core.x, core.y, core.r + 7)
      edges.push({ id: `core:${c.module}`, kind: 'core', fromKey: c.synthKey, toKey: 'core', fromModule: c.module, toModule: 'master', d: curve(c.synthX, c.synthY, ex, ey) })
    }
  }

  return { nodes, clusters, core, edges, baselineY }
}

// horizontal-flow curve (left-to-right pipelines): control points bow along X, not Y
function hcurve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

// FLOW layout (swarm manifest `layout: flow`, e.g. the screener gauntlet): modules march left -> right
// in dependency order, each module's layers stack downward, and the terminal is not a Memo core but a
// routing SWITCHYARD whose three exit rails (watchlist / provisional / full machine) fan out rightward.
// The taken rail is lit by the cockpit from the thesis status / module-routed events.
function computeFlowLayout(graph: SwarmGraph, W: number, H: number): Layout {
  const N = Math.max(1, graph.modules.length)
  const padL = 0.10
  const padR = 0.22 // room for the switchyard + exit rails on the right
  const colGap = Math.min(34, Math.max(24, W / 60))
  const rowGap = 33
  // Reserve the top band for the run-status header (.scsignal): an absolute overlay at 0.055H down,
  // ~211px tall at most (2-line headline + meta + hint + the Stop/Continue actions row). The deepest
  // module's stack-half ADDS to minBandY and SUBTRACTS at the label, so it cancels: the deepest label
  // always lands at 0.055H + RESERVE - 34, giving a fixed gap of (RESERVE - 34 - headerHeight) ≈ 55px
  // to the header — independent of stage size AND stack depth. Bulletproof; no fixed-fraction guess.
  const maxLayers = Math.max(1, ...graph.modules.map((m) => Object.keys(m.layers).length))
  const HEADER_RESERVE = 300 // header max-height (~211 incl. Stop/Continue) + label offset (34) + ~55px clearance
  const minBandY = H * 0.055 + HEADER_RESERVE + ((maxLayers - 1) * rowGap) / 2
  const bandY = Math.max(H * 0.40, minBandY) // the pipeline's spine, pushed down to clear the header
  const core = { x: W * (1 - padR) + 56, y: bandY, r: 26 } // the switchyard occupies the core slot

  const nodes: PlacedNode[] = []
  const clusters: PlacedCluster[] = []

  graph.modules.forEach((m, i) => {
    const t = N === 1 ? 0.5 : i / (N - 1)
    const anchorX = W * (padL + t * (1 - padL - padR))
    const layerKeys = Object.keys(m.layers).map(Number).sort((a, b) => a - b)
    // center each module's layer stack on the spine so the pipeline reads as one horizontal band
    const anchorTopY = bandY - ((layerKeys.length - 1) * rowGap) / 2
    let synthKey: string | null = null
    let synthX = anchorX
    let synthY = anchorTopY
    layerKeys.forEach((lk, li) => {
      const agents = m.layers[String(lk)]
      const y = anchorTopY + li * rowGap
      const n = agents.length
      agents.forEach((a, j) => {
        const x = anchorX + (j - (n - 1) / 2) * colGap
        const r = a.isSynthesis ? 10 : 7
        const placed: PlacedNode = { ...a, x, y, r }
        nodes.push(placed)
        if (a.isSynthesis) {
          synthKey = a.key
          synthX = x
          synthY = y
        }
      })
    })
    clusters.push({ module: m.name, dependsOn: m.dependsOn, anchorX, anchorTopY, labelX: anchorX, labelY: anchorTopY - 34, synthKey, synthX, synthY })
  })

  const clusterByName = new Map(clusters.map((c) => [c.module, c]))
  const edges: PlacedEdge[] = []
  for (const c of clusters) {
    if (c.synthKey) {
      for (const n of nodes) {
        if (n.module !== c.module || n.isSynthesis) continue
        const [ex, ey] = shorten(n.x, n.y, c.synthX, c.synthY, 12)
        edges.push({ id: `feed:${n.key}`, kind: 'feeds', fromKey: n.key, toKey: c.synthKey, fromModule: c.module, toModule: c.module, d: curve(n.x, n.y + n.r, ex, ey) })
      }
    }
    // dependency rails run horizontally: upstream synthesis -> this module's left flank
    for (const dep of c.dependsOn) {
      const src = clusterByName.get(dep)
      if (!src) continue
      const [ex, ey] = shorten(src.synthX, src.synthY, c.anchorX - colGap * 1.2, bandY, 10)
      edges.push({ id: `dep:${dep}->${c.module}`, kind: 'dep', fromKey: src.synthKey || '', toKey: '', fromModule: dep, toModule: c.module, d: hcurve(src.synthX, src.synthY, ex, ey) })
    }
  }
  // the LAST module's synthesis feeds the switchyard
  const last = clusters[clusters.length - 1]
  if (last?.synthKey) {
    const [ex, ey] = shorten(last.synthX, last.synthY, core.x, core.y, core.r + 7)
    edges.push({ id: `core:${last.module}`, kind: 'core', fromKey: last.synthKey, toKey: 'core', fromModule: last.module, toModule: 'master', d: hcurve(last.synthX, last.synthY, ex, ey) })
  }

  // three exit rails fanning rightward out of the switchyard
  const exits = [
    { id: 'watchlist', label: 'watch', x: core.x + 92, y: core.y - 64 },
    { id: 'provisional', label: 'early idea', x: core.x + 104, y: core.y },
    { id: 'full_machine', label: 'strong idea', x: core.x + 92, y: core.y + 64 },
  ].map((e) => ({ ...e, x: Math.min(e.x, W - 56) }))
  for (const e of exits) {
    const [ex, ey] = shorten(core.x, core.y, e.x, e.y, 16)
    edges.push({ id: `exit:${e.id}`, kind: 'core', fromKey: 'core', toKey: `exit:${e.id}`, fromModule: 'master', toModule: e.id, d: hcurve(core.x + core.r, core.y, ex, ey) })
  }

  return { nodes, clusters, core, edges, baselineY: bandY, exits }
}
