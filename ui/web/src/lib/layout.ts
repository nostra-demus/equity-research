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
  // The vertical budget this layout actually resolved to, after compressing for the viewport. Published
  // rather than re-derived by callers: the constants are the INPUT to a solve, not the answer, so anything
  // that needs to reason about the geometry (the label's own min-height, the layout tests' collision
  // assertions) must read what was solved — not guess at what it might have been.
  metrics: {
    labelH: number; rowGap: number; topPad: number; coreGap: number
    // The height this field needs with EVERY compressible term at its floor, and whether it got it. Below
    // minHeight the content genuinely does not fit and the guarantees split: the core is still placed at
    // its seat — fully visible, painted last, never behind the dock — but the deepest band can reach it.
    // Published so the invariant tests can assert the strong guarantee exactly where it is owed, instead
    // of a magic viewport number that would drift away from the constants.
    minHeight: number; fits: boolean
  }
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

// ---- constellation vertical budget ----------------------------------------------------------------
// Every place below is derived from the real height of the thing that occupies it, top-down — not from a
// fraction of the viewport. Fractions were the bug: the master-thesis core sat at a flat H * 0.87, which
// at an ordinary browser height lands UNDERNEATH the decision dock (an absolute, bottom-anchored overlay
// on the same stage), so the Memo orb — the deliverable the whole field converges on — was simply not
// there. A fraction cannot know an overlay exists. These constants can, and the dock's height is MEASURED
// and passed in (`reserveBottom`), so the seat is right whether or not the "newer data" notice is showing
// and however the metric strip wraps.
const CORE_R = 36
const CORE_R_MIN = 24 // the core shrinks too, last and least — a smaller Memo still reads; a hidden one does not
const LAYER_GAP = 33 // between one module's layers
const LABEL_LIFT = 18 // first orb's centre → the label block's bottom edge (the label is translate(-50%,-100%))
// The label block's own height. Reserved at its LIVE size (name + status + the running timer's two lines)
// even when idle, so launching a run expands the label into space that was already set aside — the field
// must never reflow just because a module started.
const LABEL_BLOCK = 96
const TOP_PAD = 52 // stage top → label block top. Clears the view toggle (top:14px, ~30px tall).
const BAND_GAP = 30 // row-1's deepest orb → row-2's label block top
const CORE_GAP = 34 // row-2's deepest orb → the core's top edge
const CORE_PAD = 18 // the core's bottom edge → the decision dock (or the stage floor when there is none)
// Floors for the compressible gaps on a short viewport. The layer gap's floor is not a taste call: an orb
// is r=7..10, so anything under ~18px would let two rows of a module's own stack touch.
const MIN_LAYER_GAP = 18
const MIN_BAND_GAP = 14
const LABEL_MIN = 63 // the block's MEASURED idle height (name + status + the hidden timer row) — the floor

export function computeLayout(graph: SwarmGraph, W: number, H: number, reserveBottom = 0): Layout {
  if (graph.swarm?.layout === 'flow') return computeFlowLayout(graph, W, H)
  const N = graph.modules.length

  const topCount = N > 3 ? Math.floor(N / 2) : N
  const rowMods = [graph.modules.slice(0, topCount), graph.modules.slice(topCount)].filter((m) => m.length)
  const padXs = [0.2, 0.13]
  // how many layers deep the deepest module in each band runs — the band's own height in layer-gaps
  const spans = rowMods.map((mods) => Math.max(1, ...mods.map((m) => Object.keys(m.layers).length)) - 1)

  // The field cannot scroll, so on a short viewport the GAPS compress rather than the content overflowing.
  // Each compressible piece has its own floor (an orb is r≤10, so a layer gap under MIN_LAYER_GAP would let
  // a module's own stack touch itself), which means no single closed-form scale is correct — whichever
  // floor binds first changes the slope. So solve it numerically: `metrics(s)` is monotonic in s, and 24
  // bisection steps land within ~0.1px. It runs once per resize.
  const avail = Math.max(120, H - reserveBottom)
  const bands = rowMods.length
  const spanTotal = spans.reduce((a, b) => a + b, 0)
  const metrics = (s: number) => {
    const rowGap = Math.max(MIN_LAYER_GAP, LAYER_GAP * s)
    const bandGap = Math.max(MIN_BAND_GAP, BAND_GAP * s)
    const coreGap = Math.max(MIN_BAND_GAP, CORE_GAP * s)
    // The label reserve compresses too, but only down to its IDLE height: below that a running module's
    // timer would expand into the band above it. Full height first, so a launch never reflows the field.
    const label = Math.max(LABEL_MIN, LABEL_BLOCK * s)
    const coreR = Math.max(CORE_R_MIN, CORE_R * s)
    const need = TOP_PAD + bands * (label + LABEL_LIFT) + spanTotal * rowGap + (bands - 1) * bandGap + coreGap + 2 * coreR + CORE_PAD
    return { rowGap, bandGap, coreGap, label, coreR, need }
  }
  let lo = 0, hi = 1
  if (metrics(1).need > avail) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (metrics(mid).need <= avail) lo = mid; else hi = mid
    }
  } else lo = 1
  const { rowGap, bandGap, coreGap, label, coreR } = metrics(lo)
  const minHeight = metrics(0).need

  // stack the bands top-down from their own reserved heights
  const rows: { mods: typeof graph.modules; y: number; padX: number }[] = []
  let y = TOP_PAD + label + LABEL_LIFT
  rowMods.forEach((mods, i) => {
    rows.push({ mods, y, padX: padXs[i] ?? padXs[padXs.length - 1] })
    y += spans[i] * rowGap + bandGap + label + LABEL_LIFT
  })
  const contentBottom = rows.length ? rows[rows.length - 1].y + spans[spans.length - 1] * rowGap : TOP_PAD

  // Seat the core just above the dock: the funnel should converge on the Memo exactly where the decision
  // bar reporting it sits. `scale` was solved so the bands finish clear of this seat, so it is both the
  // lowest place AND a collision-free one — and on a viewport too short for even the fully-compressed
  // stack the seat still wins, because the core is the one thing that must never be hidden again.
  // `contentBottom` is what the solve protects; the layout tests assert the clearance holds.
  const core = { x: W * 0.5, y: avail - CORE_PAD - coreR, r: coreR }
  const baselineY = core.y

  const colGap = Math.min(34, Math.max(24, W / 60))

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

      clusters.push({ module: m.name, dependsOn: m.dependsOn, anchorX, anchorTopY, labelX: anchorX, labelY: anchorTopY - LABEL_LIFT, synthKey, synthX, synthY })
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

  return { nodes, clusters, core, edges, baselineY, metrics: { labelH: label, rowGap, topPad: TOP_PAD, coreGap, minHeight, fits: avail >= minHeight } }
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

  return { nodes, clusters, core, edges, baselineY: bandY, metrics: { labelH: 40, rowGap, topPad: 0, coreGap: 0, minHeight: 0, fits: true }, exits }
}
