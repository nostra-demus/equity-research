import type { AgentNode, SwarmGraph } from './types'
import { GLOBE, GOLDEN_ANGLE, add, cross, dot, normalize, onSphere, scale, v, type V3 } from '../components/swarm/globe/globe-consts'

// Unified research layout for the WebGL scene. Every node/edge/label carries BOTH a FLAT position (the
// constellation's columnar arrangement, in the z=0 plane) and a SPHERE position (the globe). GlobeScene
// lerps between them by a single morph value, so the flat constellation and the globe are two states of the
// SAME elements — wrapping/unwrapping is one continuous animation, no renderer swap, no breaks.
//
// Flat = the 3D analog of computeLayout() (modules in two rows of columns, agents stacked by layer,
// synthesis at the column foot, Memo at the bottom). Sphere = modules as Fibonacci-distributed regions,
// agents arc'd around each synthesis hub on the shell, Memo just below the south pole.

export interface GlobeNode extends AgentNode {
  pos: V3 // sphere position (morph = 1)
  flatPos: V3 // constellation position in the z=0 plane (morph = 0)
  r: number // orb radius (world units)
}
export interface GlobeEdge {
  id: string
  kind: 'feeds' | 'dep' | 'core'
  from: V3
  to: V3
  flatFrom: V3
  flatTo: V3
  fromKey: string
  toKey: string
  fromModule: string
  toModule: string
}
export interface ModuleAnchor {
  module: string
  center: V3 // sphere patch center (label anchor at morph = 1)
  flatLabel: V3 // label anchor at morph = 0 (above the column)
  normal: V3
  synthKey: string | null
  synthPos: V3
  dependsOn: string[]
}
export interface GlobeLayout {
  nodes: GlobeNode[]
  edges: GlobeEdge[]
  moduleAnchors: ModuleAnchor[]
  core: { pos: V3; flatPos: V3; r: number }
}

const WORLD_UP: V3 = { x: 0, y: 1, z: 0 }
const WORLD_X: V3 = { x: 1, y: 0, z: 0 }

// a tangent-plane basis at a surface point with outward normal n (degenerate near the poles → use X ref)
function tangentBasis(n: V3): { u: V3; v: V3 } {
  const ref = Math.abs(dot(n, WORLD_UP)) > 0.94 ? WORLD_X : WORLD_UP
  const u = normalize(cross(ref, n))
  const vv = cross(n, u)
  return { u, v: vv }
}

// flat (constellation) layout dims, in world units, centered on the origin in the z=0 plane
const FW = 34 // overall width
const FH = 22 // overall height
const FCOL = 1.7 // horizontal gap between agents in a layer
const FROW = 2.0 // vertical gap between layers

// Optional flat-position override: when the host (GlobeStage) knows the REAL constellation layout, it passes
// world positions (one per node key, per module label, and the core) obtained by un-projecting the
// constellation's on-screen positions onto the flat camera's z=0 plane. The morph then starts from the EXACT
// constellation, so wrapping into the globe is seamless — no intermediate "globe-flat" layout is ever shown.
export interface FlatOverride {
  node: (key: string) => V3 | undefined
  label: (module: string) => V3 | undefined
  core?: V3
}

export function computeGlobeLayout(graph: SwarmGraph, flat?: FlatOverride): GlobeLayout {
  const { R } = GLOBE
  const modules = graph.modules
  const N = Math.max(1, modules.length)

  // ---------- FLAT layout (constellation columns in the z=0 plane) ----------
  const topCount = N > 3 ? Math.floor(N / 2) : N
  const flatRows = [
    { mods: modules.slice(0, topCount), topY: FH * 0.34, padX: 0.18 },
    { mods: modules.slice(topCount), topY: -FH * 0.02, padX: 0.12 },
  ]
  const flatPosByKey = new Map<string, V3>()
  const flatAnchorByModule = new Map<string, { x: number; topY: number }>()
  for (const row of flatRows) {
    const k = row.mods.length
    row.mods.forEach((m, i) => {
      const t = k === 1 ? 0.5 : i / (k - 1)
      const anchorX = -FW / 2 + (row.padX + t * (1 - 2 * row.padX)) * FW
      flatAnchorByModule.set(m.name, { x: anchorX, topY: row.topY })
      const layerKeys = Object.keys(m.layers).map(Number).sort((a, b) => a - b)
      layerKeys.forEach((lk, li) => {
        const agents = m.layers[String(lk)] || []
        const yy = row.topY - li * FROW
        const nn = agents.length
        agents.forEach((a, j) => {
          flatPosByKey.set(a.key, { x: anchorX + (j - (nn - 1) / 2) * FCOL, y: yy, z: 0 })
        })
      })
    })
  }
  // override the column fallback with the REAL constellation positions when provided → seamless wrap
  if (flat) for (const key of [...flatPosByKey.keys()]) { const o = flat.node(key); if (o) flatPosByKey.set(key, o) }
  const flatCore: V3 = flat?.core ?? { x: 0, y: -FH * 0.5, z: 0 }

  // ---------- SPHERE layout (Fibonacci module regions) + attach flat positions ----------
  const core = { pos: v(0, -(R + GLOBE.CORE_BUMP), 0), flatPos: flatCore, r: GLOBE.R_CORE }
  const nodes: GlobeNode[] = []
  const edges: GlobeEdge[] = []
  const anchors: ModuleAnchor[] = []

  modules.forEach((m, i) => {
    let y = 1 - ((i + 0.5) / N) * (1 + GLOBE.POLE_BIAS)
    y = Math.max(GLOBE.Y_CLAMP_BOTTOM, Math.min(GLOBE.Y_CLAMP_TOP, y))
    const rAtY = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * i
    const center = scale({ x: Math.cos(theta) * rAtY, y, z: Math.sin(theta) * rAtY }, R)
    const normal = normalize(center)
    const { u: tU, v: tV } = tangentBasis(normal)

    const layerKeys = Object.keys(m.layers).map(Number).sort((a, b) => a - b)
    let synthKey: string | null = null
    let synthPos: V3 = onSphere(center, R + GLOBE.BUMP_SYNTH)

    layerKeys.forEach((lk, li) => {
      const agents = m.layers[String(lk)] || []
      const ringR = GLOBE.LAYER_GAP * (li + 1)
      const n = agents.length
      const span = Math.min(GLOBE.ARC_MAX, n * GLOBE.ARC_PER_NODE)
      agents.forEach((a: AgentNode, j) => {
        const flatPos = flatPosByKey.get(a.key) || { x: 0, y: 0, z: 0 }
        if (a.isSynthesis) {
          synthKey = a.key
          synthPos = onSphere(center, R + GLOBE.BUMP_SYNTH)
          nodes.push({ ...a, pos: synthPos, flatPos, r: GLOBE.R_SYNTH })
          return
        }
        const ang = (n === 1 ? 0 : j / (n - 1) - 0.5) * span
        const local = add(scale(tU, Math.cos(ang) * ringR), scale(tV, Math.sin(ang) * ringR))
        const pos = onSphere(add(center, local), R + GLOBE.BUMP_SURFACE)
        nodes.push({ ...a, pos, flatPos, r: GLOBE.R_AGENT })
      })
    })

    const fa = flatAnchorByModule.get(m.name) || { x: 0, topY: 0 }
    anchors.push({
      module: m.name,
      center,
      flatLabel: flat?.label(m.name) ?? { x: fa.x, y: fa.topY + 1.7, z: 0 },
      normal,
      synthKey,
      synthPos,
      dependsOn: m.dependsOn || [],
    })
  })

  const anchorByModule = new Map(anchors.map((a) => [a.module, a]))
  const flatSynth = (module: string): V3 => {
    const a = anchorByModule.get(module)
    return (a?.synthKey && flatPosByKey.get(a.synthKey)) || flatCore
  }
  const flatAnchorV = (module: string): V3 => {
    const o = flat?.label(module)
    if (o) return o
    const fa = flatAnchorByModule.get(module) || { x: 0, topY: 0 }
    return { x: fa.x, y: fa.topY, z: 0 }
  }

  for (const a of anchors) {
    // feeds: each non-synthesis agent → this module's synthesis hub (hidden until hover, like flat)
    for (const node of nodes) {
      if (node.module !== a.module || node.isSynthesis) continue
      edges.push({
        id: `feeds:${node.key}`,
        kind: 'feeds',
        from: node.pos,
        to: a.synthPos,
        flatFrom: node.flatPos,
        flatTo: a.synthKey ? flatPosByKey.get(a.synthKey) || flatAnchorV(a.module) : flatAnchorV(a.module),
        fromKey: node.key,
        toKey: a.synthKey || a.module,
        fromModule: a.module,
        toModule: a.module,
      })
    }
    // dep: upstream module synthesis → this module (arcs across the globe; flat curves between columns)
    for (const dep of a.dependsOn) {
      const src = anchorByModule.get(dep)
      if (!src) continue
      edges.push({
        id: `dep:${dep}->${a.module}`,
        kind: 'dep',
        from: src.synthPos,
        to: a.center,
        flatFrom: flatSynth(dep),
        flatTo: flatAnchorV(a.module),
        fromKey: src.synthKey || dep,
        toKey: a.synthKey || a.module,
        fromModule: dep,
        toModule: a.module,
      })
    }
    // core: this module's synthesis → the Memo node
    edges.push({
      id: `core:${a.module}`,
      kind: 'core',
      from: a.synthPos,
      to: core.pos,
      flatFrom: flatSynth(a.module),
      flatTo: flatCore,
      fromKey: a.synthKey || a.module,
      toKey: 'core',
      fromModule: a.module,
      toModule: 'core',
    })
  }

  return { nodes, edges, moduleAnchors: anchors, core }
}
