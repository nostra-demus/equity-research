import type { AgentNode, SwarmGraph } from './types'
import { GLOBE, GOLDEN_ANGLE, add, cross, dot, normalize, onSphere, scale, v, type V3 } from '../components/swarm/globe/globe-consts'

// Spherical layout for the research swarm — the 3D analog of computeLayout() in layout.ts. Pure math:
// reuses the exact graph traversal (modules → sorted layers → agents, isSynthesis, dependsOn) and returns
// plain {x,y,z} points (no three.js), which GlobeScene lifts to THREE.Vector3.
//
// Modules become distinct REGIONS on the sphere (Fibonacci/golden-spiral distribution — even spacing for
// any N, no pole-bunching). Within a module, agents sit in the patch's tangent plane around the synthesis
// hub (layer index → ring radius → gate/specialist/synthesis read as radial depth) and are re-projected
// onto the shell so the cluster curves with the surface. The Memo/master sits just below the south pole,
// so cross-module dependency arcs and module→Memo arcs read like meridians.

export interface GlobeNode extends AgentNode {
  pos: V3 // final position on/near the sphere shell
  r: number // orb radius (world units)
}
export interface GlobeEdge {
  id: string
  kind: 'feeds' | 'dep' | 'core'
  from: V3
  to: V3
  mid: V3 // bezier control point, bowed out along the surface normal
  fromKey: string
  toKey: string
  fromModule: string
  toModule: string
}
export interface ModuleAnchor {
  module: string
  center: V3
  normal: V3
  synthKey: string | null
  synthPos: V3
  dependsOn: string[]
}
export interface GlobeLayout {
  nodes: GlobeNode[]
  edges: GlobeEdge[]
  moduleAnchors: ModuleAnchor[]
  core: { pos: V3; r: number }
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

export function computeGlobeLayout(graph: SwarmGraph): GlobeLayout {
  const { R } = GLOBE
  const modules = graph.modules
  const N = Math.max(1, modules.length)
  const core = { pos: v(0, -(R + GLOBE.CORE_BUMP), 0), r: GLOBE.R_CORE }

  const nodes: GlobeNode[] = []
  const edges: GlobeEdge[] = []
  const anchors: ModuleAnchor[] = []

  modules.forEach((m, i) => {
    // --- module region center via Fibonacci sphere (south cap reserved for the core) ---
    let y = 1 - ((i + 0.5) / N) * (1 + GLOBE.POLE_BIAS)
    y = Math.max(GLOBE.Y_CLAMP_BOTTOM, Math.min(GLOBE.Y_CLAMP_TOP, y))
    const rAtY = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * i
    const center = scale({ x: Math.cos(theta) * rAtY, y, z: Math.sin(theta) * rAtY }, R)
    const normal = normalize(center)
    const { u: tU, v: tV } = tangentBasis(normal)

    // --- place agents: synthesis at the patch hub, others on concentric arcs by layer ---
    const layerKeys = Object.keys(m.layers)
      .map(Number)
      .sort((a, b) => a - b)
    let synthKey: string | null = null
    let synthPos: V3 = onSphere(center, R + GLOBE.BUMP_SYNTH)

    layerKeys.forEach((lk, li) => {
      const agents = m.layers[String(lk)] || []
      const ringR = GLOBE.LAYER_GAP * (li + 1)
      const n = agents.length
      const span = Math.min(GLOBE.ARC_MAX, n * GLOBE.ARC_PER_NODE)
      agents.forEach((a: AgentNode, j) => {
        if (a.isSynthesis) {
          synthKey = a.key
          synthPos = onSphere(center, R + GLOBE.BUMP_SYNTH)
          nodes.push({ ...a, pos: synthPos, r: GLOBE.R_SYNTH })
          return
        }
        const ang = (n === 1 ? 0 : j / (n - 1) - 0.5) * span
        const local = add(scale(tU, Math.cos(ang) * ringR), scale(tV, Math.sin(ang) * ringR))
        const pos = onSphere(add(center, local), R + GLOBE.BUMP_SURFACE)
        nodes.push({ ...a, pos, r: GLOBE.R_AGENT })
      })
    })

    anchors.push({ module: m.name, center, normal, synthKey, synthPos, dependsOn: m.dependsOn || [] })
  })

  const anchorByModule = new Map(anchors.map((a) => [a.module, a]))
  const bowedMid = (from: V3, to: V3, bow: number): V3 => onSphere(scale(add(from, to), 0.5), R + bow)

  // --- edges (same three kinds as the flat view) ---
  for (const a of anchors) {
    // feeds: each non-synthesis agent → this module's synthesis hub (hidden until hover, like flat)
    for (const node of nodes) {
      if (node.module !== a.module || node.isSynthesis) continue
      edges.push({
        id: `feeds:${node.key}`,
        kind: 'feeds',
        from: node.pos,
        to: a.synthPos,
        mid: bowedMid(node.pos, a.synthPos, GLOBE.BUMP_SYNTH + 0.1),
        fromKey: node.key,
        toKey: a.synthKey || a.module,
        fromModule: a.module,
        toModule: a.module,
      })
    }
    // dep: upstream module synthesis → this module's center (arcs across the globe)
    for (const dep of a.dependsOn) {
      const src = anchorByModule.get(dep)
      if (!src) continue
      const chord = Math.hypot(a.center.x - src.synthPos.x, a.center.y - src.synthPos.y, a.center.z - src.synthPos.z)
      edges.push({
        id: `dep:${dep}->${a.module}`,
        kind: 'dep',
        from: src.synthPos,
        to: a.center,
        mid: bowedMid(src.synthPos, a.center, 0.12 * chord + 0.7),
        fromKey: src.synthKey || dep,
        toKey: a.synthKey || a.module,
        fromModule: dep,
        toModule: a.module,
      })
    }
    // core: this module's synthesis → the Memo node (converge at the south pole)
    const chordC = Math.hypot(a.synthPos.x - core.pos.x, a.synthPos.y - core.pos.y, a.synthPos.z - core.pos.z)
    edges.push({
      id: `core:${a.module}`,
      kind: 'core',
      from: a.synthPos,
      to: core.pos,
      mid: bowedMid(a.synthPos, core.pos, 0.08 * chordC + 0.5),
      fromKey: a.synthKey || a.module,
      toKey: 'core',
      fromModule: a.module,
      toModule: 'core',
    })
  }

  return { nodes, edges, moduleAnchors: anchors, core }
}
