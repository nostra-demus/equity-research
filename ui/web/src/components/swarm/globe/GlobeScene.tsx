import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color, DoubleSide, type Group, type Mesh, type PerspectiveCamera, type ShaderMaterial, Vector3 } from 'three'
import { Html, OrbitControls } from '@react-three/drei'
import type { GlobeEdge, GlobeLayout, GlobeNode } from '../../../lib/globe-layout'
import type { PlacedNode } from '../../../lib/layout'
import type { DataStatus, NodeStatus } from '../../../lib/types'
import { GLOBE } from './globe-consts'
import { sufficiencyColor } from '../../../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, orbClass, scopeTiming, type ScopeOrb } from '../../../lib/eta'
import { useStore } from '../../../lib/store'
import { AgentNode } from '../AgentNode'
import { CoreOrb } from '../CoreOrb'
import type { GlobeColors } from './useGlobeColors'

// THE 3D research globe. It is a SECOND renderer over the same store state — NOT a reimplementation of the
// constellation. The orbs and the Memo are the EXACT same DOM components the flat view uses (AgentNode,
// CoreOrb), rendered as camera-facing billboards (drei <Html>) at 3D positions, so they look identical and
// carry every behaviour for free: ring/core/glow/status, the running water-fill + sweep, hover, selected,
// and click-to-run. Module labels reuse the same .cluster__* markup (name / status / live timer / dep-lock /
// run). Only the connections differ — they must arc around a sphere, so they are WebGL lines (MorphEdges).
// A single `morph` value (0 = flat columns, 1 = sphere) lerps every position so entering/leaving the globe
// is a smooth wrap/unwrap that the App crossfades against the constellation.

const MORPH_DUR = GLOBE.WRAP_SECONDS // seconds for the wrap / unwrap — shared with App's crossfade so the exit lasts the full unwrap
const FLAT_CAM = new Vector3(0, 0, GLOBE.FLAT_CAM_Z)
const SPHERE_CAM = new Vector3(0, 2.5, 27)
const FLAT_FOV = GLOBE.FLAT_FOV // shared with GlobeStage's un-project so the flat layout overlays the constellation exactly
const SPHERE_FOV = 45
const TMP_A = new Vector3()
const TMP_B = new Vector3()
const TMP_P = new Vector3()

const v3 = (p: { x: number; y: number; z: number }) => new Vector3(p.x, p.y, p.z)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// DOM orb pixel radius — matches the constellation exactly (computeLayout: agent 7, synthesis 10)
const orbPx = (n: GlobeNode) => (n.isSynthesis ? 13 : 9)

// surface-hugging great-circle arc between two shell points (never enters the interior)
function arcPoints(from: V3In, to: V3In, bow: number, segs: number): Vector3[] {
  const a = v3(from)
  const b = v3(to)
  const ra = a.length() || 1
  const rb = b.length() || 1
  const da = a.clone().normalize()
  const db = b.clone().normalize()
  const omega = Math.acos(Math.max(-1, Math.min(1, da.dot(db))))
  const sinO = Math.sin(omega)
  const out: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const dir = sinO < 1e-4 ? da.clone() : da.clone().multiplyScalar(Math.sin((1 - t) * omega) / sinO).add(db.clone().multiplyScalar(Math.sin(t * omega) / sinO))
    out.push(dir.normalize().multiplyScalar(ra + (rb - ra) * t + bow * Math.sin(Math.PI * t)))
  }
  return out
}
type V3In = { x: number; y: number; z: number }

function flatLine(from: V3In, to: V3In, segs: number): Vector3[] {
  const a = v3(from), b = v3(to)
  const out: Vector3[] = []
  for (let i = 0; i <= segs; i++) out.push(a.clone().lerp(b, i / segs))
  return out
}

function edgeBow(e: GlobeEdge): number {
  const chord = Math.hypot(e.to.x - e.from.x, e.to.y - e.from.y, e.to.z - e.from.z)
  if (e.kind === 'feeds') return 0.25
  if (e.kind === 'core') return 0.4 + 0.06 * chord
  return 0.6 + 0.1 * chord
}

// ---- morphing, flowing, dashed edge RIBBONS — thick, directional, one draw call per set ----
// WebGL lines are stuck at 1px, so each edge is a camera-facing RIBBON: every segment is a quad whose two
// side-vertices are pushed perpendicular to the screen-projected segment direction (in view space) by a
// world-space half-width, giving a genuinely thick, prominent stroke that still always faces the camera.
const EDGE_VERT = 'attribute vec3 aOther; attribute float aSide; attribute float aT; uniform float uHalf; varying float vT; void main(){ vT = aT; vec4 pv = modelViewMatrix * vec4(position, 1.0); vec4 ov = modelViewMatrix * vec4(aOther, 1.0); vec2 d = ov.xy - pv.xy; float L = length(d); vec2 dir = L > 1e-5 ? d / L : vec2(1.0, 0.0); vec2 perp = vec2(-dir.y, dir.x); pv.xy += perp * aSide * uHalf; gl_Position = projectionMatrix * pv; }'
// Each dash is a directional COMET, not a symmetric tick: alpha ramps from a faint tail (source side) to a
// bright sharp head (toward the target), so the flow direction is obvious from SHAPE, not just motion. Many
// short dashes (high uDashes) + the marching uTime read as a "stream of arrows" pointing the way data flows.
const EDGE_FRAG = 'uniform vec3 uColor; uniform float uTime; uniform float uDashes; uniform float uDuty; uniform float uOpacity; uniform float uSpeed; varying float vT; void main(){ float f = fract(vT * uDashes - uTime * uSpeed); if (f > uDuty) discard; float a = f / uDuty; a = a * a; gl_FragColor = vec4(uColor, uOpacity * (0.08 + 0.92 * a)); }'
const K_SEG = 40 // samples per edge — denser so the short comet dashes stay smooth on the curved arcs
const DASHES = 30 // dashes per edge — short, arrow-like streaks (was 16 long dashes)

function MorphEdges({ edges, color, opacity, speed, width, morphRef }: { edges: GlobeEdge[]; color: Color; opacity: number; speed: number; width: number; morphRef: { current: number }; }) {
  const ref = useRef<Mesh>(null)
  // Each segment → 2 triangles (6 verts). Per vertex: its own centerline point (`position`, morphed), the
  // segment's OTHER endpoint (`aOther`, morphed — gives the screen direction), a side (±1), and the dash
  // param aT. flat/sphere copies of both endpoints are lerped on the CPU each frame, like the old line set.
  const { posBuf, otherBuf, flatA, sphereA, flatB, sphereB, side, aT, count } = useMemo(() => {
    const flatPts: Vector3[][] = edges.map((e) => flatLine(e.flatFrom, e.flatTo, K_SEG))
    const sphPts: Vector3[][] = edges.map((e) => arcPoints(e.from, e.to, edgeBow(e), K_SEG))
    const verts = edges.length * K_SEG * 6
    const flatA = new Float32Array(verts * 3), sphereA = new Float32Array(verts * 3)
    const flatB = new Float32Array(verts * 3), sphereB = new Float32Array(verts * 3)
    const side = new Float32Array(verts), aT = new Float32Array(verts)
    let o = 0
    const put = (fp: Vector3[], sp: Vector3[], iThis: number, iOther: number, sd: number) => {
      flatA[o * 3] = fp[iThis].x; flatA[o * 3 + 1] = fp[iThis].y; flatA[o * 3 + 2] = fp[iThis].z
      sphereA[o * 3] = sp[iThis].x; sphereA[o * 3 + 1] = sp[iThis].y; sphereA[o * 3 + 2] = sp[iThis].z
      flatB[o * 3] = fp[iOther].x; flatB[o * 3 + 1] = fp[iOther].y; flatB[o * 3 + 2] = fp[iOther].z
      sphereB[o * 3] = sp[iOther].x; sphereB[o * 3 + 1] = sp[iOther].y; sphereB[o * 3 + 2] = sp[iOther].z
      side[o] = sd; aT[o] = iThis / K_SEG; o++
    }
    edges.forEach((_e, ei) => {
      const fp = flatPts[ei], sp = sphPts[ei]
      for (let s = 0; s < K_SEG; s++) {
        const a = s, b = s + 1
        put(fp, sp, a, b, -1); put(fp, sp, b, a, -1); put(fp, sp, b, a, 1) // tri 1
        put(fp, sp, a, b, -1); put(fp, sp, b, a, 1); put(fp, sp, a, b, 1) // tri 2
      }
    })
    return { posBuf: new Float32Array(verts * 3), otherBuf: new Float32Array(verts * 3), flatA, sphereA, flatB, sphereB, side, aT, count: verts }
  }, [edges])

  useFrame((state) => {
    const m = ref.current
    if (!m) return
    const mat = m.material as ShaderMaterial
    mat.uniforms.uTime.value = state.clock.elapsedTime
    const e = easeInOut(morphRef.current)
    const g = m.geometry
    const pos = g.attributes.position.array as Float32Array
    const oth = g.attributes.aOther.array as Float32Array
    for (let i = 0; i < pos.length; i++) {
      pos[i] = flatA[i] + (sphereA[i] - flatA[i]) * e
      oth[i] = flatB[i] + (sphereB[i] - flatB[i]) * e
    }
    g.attributes.position.needsUpdate = true
    g.attributes.aOther.needsUpdate = true
  })

  const uniforms = useMemo(() => ({ uColor: { value: color.clone() }, uTime: { value: 0 }, uDashes: { value: DASHES }, uDuty: { value: 0.5 }, uOpacity: { value: opacity }, uSpeed: { value: speed }, uHalf: { value: width / 2 } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (uniforms.uColor.value as Color).copy(color); uniforms.uOpacity.value = opacity; uniforms.uSpeed.value = speed; uniforms.uHalf.value = width / 2 }, [color, opacity, speed, width, uniforms])

  if (!edges.length) return null
  return (
    <mesh ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posBuf, 3]} count={count} />
        <bufferAttribute attach="attributes-aOther" args={[otherBuf, 3]} count={count} />
        <bufferAttribute attach="attributes-aSide" args={[side, 1]} count={count} />
        <bufferAttribute attach="attributes-aT" args={[aT, 1]} count={count} />
      </bufferGeometry>
      <shaderMaterial vertexShader={EDGE_VERT} fragmentShader={EDGE_FRAG} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} />
    </mesh>
  )
}

// fresnel atmosphere rim so the globe reads as a lit sphere (esp. dark mode); fades out as it flattens
const ATMO_VERT = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const ATMO_FRAG = 'uniform vec3 uColor; uniform float uM; varying vec3 vN; void main(){ float i = clamp(pow(0.55 - dot(vN, vec3(0.0,0.0,1.0)), 4.2), 0.0, 1.0); gl_FragColor = vec4(uColor * i, i * 0.55 * uM); }'

// CONTINENTS painted directly on the globe shell: each module sits on its own soft island. For every
// fragment we take the angle to the nearest module center (unit dirs in uCenters) over its island radius —
// inside that radius is land, with a feathered, slightly wobbly coastline (a faint warm rim). One shader on
// the existing shell mesh, so the landmasses hug the surface perfectly and cost no extra geometry.
const CONT_VERT = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const CONT_FRAG = [
  'uniform vec3 uOcean; uniform vec3 uLand; uniform vec3 uCoast; uniform vec3 uCenters[16]; uniform int uCount; uniform float uRadius;',
  'varying vec3 vDir;',
  'void main(){',
  '  vec3 d = normalize(vDir);',
  '  float best = 9.0;',
  '  for (int i = 0; i < 16; i++) { if (i >= uCount) break; float a = acos(clamp(dot(d, uCenters[i]), -1.0, 1.0)); best = min(best, a / uRadius); }',
  '  best += 0.04 * sin(d.x * 9.0) * cos(d.y * 7.0 + 1.3) * sin(d.z * 8.0);', // organic coastline wobble
  '  float land = 1.0 - smoothstep(0.9, 1.0, best);', // calm, slightly-lighter land with a soft-but-defined edge
  '  float coast = smoothstep(0.86, 0.96, best) - smoothstep(0.96, 1.02, best);', // THIN coastline rim only
  '  vec3 col = mix(uOcean, uLand, land) + uCoast * coast * 0.28;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n')

export function GlobeScene({
  layout,
  nodeStatus,
  colors,
  reducedMotion,
  morphTarget,
  dataStatus,
  hoverKey,
  onHover,
  onNodeClick,
  onClusterClick,
  openThesis,
}: {
  layout: GlobeLayout
  nodeStatus: (key: string) => NodeStatus
  colors: GlobeColors
  reducedMotion: boolean
  morphTarget: number // 0 = flat, 1 = sphere
  dataStatus: DataStatus | null
  hoverKey: string | null
  onHover: (n: GlobeNode | null, clientX: number, clientY: number) => void
  onNodeClick: (n: GlobeNode, anchor?: () => { cx: number; top: number } | null) => void
  onClusterClick: (module: string) => void
  openThesis: () => void
}) {
  const nodes = layout.nodes
  // same store state the flat view derives orb status / timers / decision from — no duplication of meaning
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const selectedNodeKey = useStore((s) => s.selectedNodeKey)
  const decision = useStore((s) => s.decision)
  const coreBloom = useStore((s) => s.coreBloom)
  const now = useStore((s) => s.now)
  const graph = useStore((s) => s.graph)
  const { camera, size } = useThree()

  const moduleByName = useMemo(() => new Map((graph?.modules || []).map((m) => [m.name, m])), [graph])
  const classOf = useMemo(() => new Map(nodes.map((n) => [n.key, orbClass(n)])), [nodes])
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => classOf.get(k) ?? 'specialist')), [nodeRuntime, classOf])
  const statusSig = nodes.map((n) => nodeStatus(n.key)).join('')
  const statuses = useMemo(() => nodes.map((n) => nodeStatus(n.key)), [nodes, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps
  const activeModules = useMemo(() => {
    const s = new Set<string>()
    for (const [k, v] of Object.entries(nodeRuntime)) if (v.status === 'running' || v.status === 'queued') s.add(k.split('/')[0])
    return s
  }, [nodeRuntime])

  // refs for the per-frame morph
  const orbRefs = useRef<(Group | null)[]>([])
  const labelRefs = useRef<(Group | null)[]>([])
  const coreRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const shellRef = useRef<Mesh>(null!) // solid sphere — orbs occlude against it so back-of-globe orbs hide
  const atmoMat = useRef<ShaderMaterial>(null)
  const controlsRef = useRef<any>(null)

  // ---- morph driver state ----
  // Two-renderer mode: the globe MOUNTS when you switch to it, so it always begins FLAT (morph 0) and wraps
  // in to the sphere; on exit (morphTarget→0, while AnimatePresence holds it) it unwraps. Reduced-motion snaps.
  const morphRef = useRef(reducedMotion ? morphTarget : 0)
  const targetRef = useRef(reducedMotion ? morphTarget : 0)
  const startT = useRef<number | null>(null)
  const startVal = useRef(morphRef.current)
  const camStart = useRef(new Vector3())
  const fovStart = useRef(SPHERE_FOV)
  const [hoverModule, setHoverModule] = useState<string | null>(null) // hovering a module label lights its flows (parity with the constellation)

  // continent shader uniforms: each module center → a unit dir, padded to 16. Stable across theme changes
  // (colors are copied into the uniforms in an effect) so the shell material is never recreated.
  const contUniforms = useMemo(() => {
    const centers = layout.moduleAnchors.map((a) => new Vector3(a.center.x, a.center.y, a.center.z).normalize())
    const uCenters = Array.from({ length: 16 }, (_, i) => centers[i] ?? new Vector3())
    return { uOcean: { value: new Color() }, uLand: { value: new Color() }, uCoast: { value: new Color() }, uCenters: { value: uCenters }, uCount: { value: Math.min(16, centers.length) }, uRadius: { value: GLOBE.ISLAND_RADIUS } }
  }, [layout.moduleAnchors])
  useEffect(() => {
    contUniforms.uOcean.value.copy(colors.bg).lerp(colors.hairline, 0.5)
    contUniforms.uLand.value.copy(colors.bg).lerp(colors.hairline, 0.95).lerp(colors.accentDeep, 0.12)
    contUniforms.uCoast.value.copy(colors.accentDeep)
  }, [colors, contUniforms])

  // project a world point to screen px — for the hover tooltip + module-tier popup anchors
  const project = (p: Vector3) => {
    TMP_P.copy(p).project(camera)
    return { x: (TMP_P.x * 0.5 + 0.5) * size.width, y: (-TMP_P.y * 0.5 + 0.5) * size.height }
  }

  // position the camera for the initial (flat) state on mount — the wrap dollies it in
  useEffect(() => {
    const cam = camera as PerspectiveCamera
    const at1 = morphRef.current >= 0.5
    cam.position.copy(at1 ? SPHERE_CAM : FLAT_CAM)
    cam.fov = at1 ? SPHERE_FOV : FLAT_FOV
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // edges: backbone (dep + core) always shown; the hovered orb/module's edges (incl. its hidden feeds) light up
  const depCoreEdges = useMemo(() => layout.edges.filter((e) => e.kind !== 'feeds'), [layout.edges])
  const activeEdges = useMemo(() => {
    const moduleDone = new Set<string>()
    for (const a of layout.moduleAnchors) if (a.synthKey && nodeStatus(a.synthKey) === 'done') moduleDone.add(a.module)
    return depCoreEdges.filter((e) => (e.kind === 'dep' && moduleDone.has(e.fromModule) && activeModules.has(e.toModule)) || (e.kind === 'core' && moduleDone.has(e.fromModule)))
  }, [depCoreEdges, layout.moduleAnchors, activeModules, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps
  // hover lights the connections — an orb lights its own flows (feeds to its synthesis + any dep/core it
  // touches); a module label lights every edge into/out of that module. Same grammar as the flat view.
  const hoverEdges = useMemo(() => {
    if (!hoverKey && !hoverModule) return [] as GlobeEdge[]
    return layout.edges.filter(
      (e) =>
        (hoverKey && (e.fromKey === hoverKey || e.toKey === hoverKey)) ||
        (hoverModule && (e.fromModule === hoverModule || e.toModule === hoverModule)),
    )
  }, [hoverKey, hoverModule, layout.edges])

  // ---- driver: advance morph, then lerp orb groups / labels / core / camera / controls ----
  useFrame((state) => {
    const cam = camera as PerspectiveCamera
    if (targetRef.current !== morphTarget) {
      targetRef.current = morphTarget
      startT.current = state.clock.elapsedTime
      startVal.current = morphRef.current
      camStart.current.copy(cam.position)
      fovStart.current = cam.fov
    }
    if (reducedMotion) morphRef.current = morphTarget
    else if (morphRef.current !== morphTarget) {
      const p = Math.min(1, (state.clock.elapsedTime - (startT.current ?? state.clock.elapsedTime)) / MORPH_DUR)
      morphRef.current = startVal.current + (morphTarget - startVal.current) * p
      if (p >= 1) morphRef.current = morphTarget
    }
    const m = morphRef.current
    const e = easeInOut(m)

    // orbs: lerp each billboard group flat↔sphere (CSS drives the live pulse/fill, so no scaling here)
    for (let i = 0; i < nodes.length; i++) {
      const g = orbRefs.current[i]
      if (!g) continue
      const n = nodes[i]
      TMP_A.set(n.flatPos.x, n.flatPos.y, n.flatPos.z)
      TMP_B.set(n.pos.x, n.pos.y, n.pos.z)
      g.position.copy(TMP_A.lerp(TMP_B, e))
    }
    // labels lerp flat (above column) ↔ sphere (lifted patch center)
    layout.moduleAnchors.forEach((a, i) => {
      const g = labelRefs.current[i]
      if (!g) return
      g.position.set(lerp(a.flatLabel.x, a.center.x * 1.1, e), lerp(a.flatLabel.y, a.center.y * 1.1, e), lerp(a.flatLabel.z, a.center.z * 1.1, e))
    })
    if (coreRef.current) coreRef.current.position.set(lerp(layout.core.flatPos.x, layout.core.pos.x, e), lerp(layout.core.flatPos.y, layout.core.pos.y, e), lerp(layout.core.flatPos.z, layout.core.pos.z, e))

    // sphere shell fades + scales in as it wraps
    if (bodyRef.current) {
      const shell = Math.max(0, (e - 0.35) / 0.65)
      bodyRef.current.scale.setScalar(0.0001 + shell)
      bodyRef.current.visible = shell > 0.01
    }
    if (atmoMat.current) atmoMat.current.uniforms.uM.value = Math.max(0, (e - 0.5) / 0.5)

    // camera: drive during the morph; hand to OrbitControls at the settled sphere
    const settledSphere = m >= 0.999 && morphTarget === 1
    if (controlsRef.current) controlsRef.current.enabled = settledSphere
    if (!settledSphere) {
      const p = startT.current == null ? 1 : Math.min(1, (state.clock.elapsedTime - startT.current) / MORPH_DUR)
      const targetCam = morphTarget === 1 ? SPHERE_CAM : FLAT_CAM
      const targetFov = morphTarget === 1 ? SPHERE_FOV : FLAT_FOV
      cam.position.lerpVectors(camStart.current, targetCam, reducedMotion ? 1 : easeInOut(p))
      cam.fov = lerp(fovStart.current, targetFov, reducedMotion ? 1 : easeInOut(p))
      cam.lookAt(0, 0, 0)
      cam.updateProjectionMatrix()
    }
  })

  return (
    <>
      <fogExp2 attach="fog" args={[colors.bg.getHex(), 0.016]} />
      <ambientLight intensity={1} />
      <OrbitControls ref={controlsRef} makeDefault enabled={false} enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.6} zoomSpeed={0.6} minDistance={16} maxDistance={44} />

      {/* sphere shell — only present near the globe state (scales/fades in as it wraps) */}
      <group ref={bodyRef}>
        <mesh ref={shellRef}>
          <sphereGeometry args={[GLOBE.R * 0.99, 96, 96]} />
          <shaderMaterial vertexShader={CONT_VERT} fragmentShader={CONT_FRAG} uniforms={contUniforms} />
        </mesh>
        <mesh>
          <sphereGeometry args={[GLOBE.R, 32, 20]} />
          <meshBasicMaterial color={colors.hairline.clone().lerp(colors.accentDeep, 0.6)} wireframe transparent opacity={0.22} />
        </mesh>
        <mesh scale={1.04}>
          <sphereGeometry args={[GLOBE.R, 48, 48]} />
          <shaderMaterial ref={atmoMat} uniforms={useMemo(() => ({ uColor: { value: colors.accent.clone() }, uM: { value: 1 } }), [])} vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} transparent depthWrite={false} blending={AdditiveBlending} side={BackSide} />
        </mesh>
      </group>

      {/* connections — morphing, flowing, dashed 3D arcs: backbone (dep+core), brighter for live data-flow,
          brightest for the hovered orb's own flows (incl. its otherwise-hidden feeds) */}
      {/* speed = dashes/sec: one comet passes a point every 1/speed seconds → ~0.7s baseline, brisk when live.
          width = ribbon thickness in world units (R=10) — live/hover edges are thicker so they stand out. */}
      <MorphEdges edges={depCoreEdges} color={colors.accent} opacity={0.6} speed={1.4} width={0.05} morphRef={morphRef} />
      {activeEdges.length > 0 && <MorphEdges edges={activeEdges} color={colors.accentBright} opacity={0.95} speed={2.8} width={0.085} morphRef={morphRef} />}
      {hoverEdges.length > 0 && <MorphEdges edges={hoverEdges} color={colors.accentBright} opacity={0.95} speed={2.3} width={0.075} morphRef={morphRef} />}

      {/* agent orbs — the SAME DOM AgentNode the constellation uses, billboarded at each 3D position. Occludes
          against the shell so back-of-globe orbs hide; click runs/opens it; hover lights its edges + tooltip. */}
      {nodes.map((n, i) => {
        const st = nodeStatus(n.key)
        const running = st === 'running'
        const placed = { ...n, x: 0, y: 0, r: orbPx(n) } as unknown as PlacedNode
        return (
          <group key={n.key} ref={(el) => { orbRefs.current[i] = el }}>
            <Html occlude={[shellRef]} zIndexRange={[20, 0]}>
              <AgentNode
                node={placed}
                status={st}
                selected={selectedNodeKey === n.key || hoverKey === n.key}
                tStart={running ? nodeRuntime[n.key]?.startedAt : undefined}
                tExpected={running ? expectedFor(orbClass(n), exp) : undefined}
                tNow={running ? now : undefined}
                onEnter={() => { const g = orbRefs.current[i]; const sp = project(g ? g.position : v3(n.pos)); onHover(n, sp.x, sp.y) }}
                onLeave={() => onHover(null, 0, 0)}
                onClick={() => { const g = orbRefs.current[i]; onNodeClick(n, () => { const sp = project(g ? g.position : v3(n.pos)); return { cx: sp.x, top: sp.y - 14 } }) }}
              />
            </Html>
          </group>
        )
      })}

      {/* Memo core — the SAME CoreOrb (ring, "Memo", report chooser) the constellation uses */}
      <group ref={coreRef}>
        <Html occlude={[shellRef]} zIndexRange={[19, 0]}>
          <CoreOrb x={0} y={0} r={36} decision={decision} bloom={coreBloom} armed onClick={openThesis} />
        </Html>
      </group>

      {/* module labels — the SAME .cluster__* controls: name, data-sufficiency, live timer, dep-lock, run module */}
      {layout.moduleAnchors.map((a, i) => {
        const ms = dataStatus?.modules[a.module]?.status
        const live = activeModules.has(a.module)
        const mod = moduleByName.get(a.module)
        const depLocked = mod?.depsComplete === false
        const miss = mod?.missingDeps?.join(', ')
        const mt = live
          ? scopeTiming(
              nodes
                .filter((n) => n.module === a.module)
                .map<ScopeOrb>((n) => ({ startedAt: nodeRuntime[n.key]?.startedAt, endedAt: nodeRuntime[n.key]?.endedAt, status: nodeStatus(n.key), cls: orbClass(n) })),
              exp,
              now,
            )
          : null
        return (
          <group key={a.module} ref={(el) => { labelRefs.current[i] = el }}>
            <Html zIndexRange={[12, 0]}>
              <div
                className={`cluster__label${live ? ' cluster__label--live' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
                onMouseEnter={() => setHoverModule(a.module)}
                onMouseLeave={() => setHoverModule(null)}
                onClick={(ev) => { ev.stopPropagation(); onClusterClick(a.module) }}
              >
                <div className="cluster__name">{a.module.replace(/-/g, ' ')}</div>
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
            </Html>
          </group>
        )
      })}
    </>
  )
}
